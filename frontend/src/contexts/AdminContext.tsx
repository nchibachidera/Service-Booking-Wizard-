import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { format } from 'date-fns';
import { initialWorkingDays } from '../data/availability';
import { getBookingStats, type BookingStats } from '../utils/adminStats';
import {
  ApiError,
  createBlockedDate,
  deleteBlockedDate,
  fetchAdminBookings,
  fetchBlockedDates,
  fetchProfile,
  fetchWorkingDays,
  loginProvider,
  saveWorkingDays,
  updateBookingStatus,
  type CreatedBlockedDate,
  type ProviderProfile
} from '../api';
import type {
  BlockedDate,
  Booking,
  BookingStatus,
  ProviderAccount,
  WeekdayKey,
  WorkingDay
} from '../types/admin';

export type HoursStatus =
  | 'idle'
  | 'pending'
  | 'saving'
  | 'saved'
  | 'invalid'
  | 'error';

interface AdminContextValue {
  account: ProviderAccount | null;
  updateAccount: (patch: Partial<ProviderAccount>) => void;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  bookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string;
  reloadBookings: () => void;
  stats: BookingStats;
  setBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  availabilityLoading: boolean;
  availabilityError: string;
  reloadAvailability: () => void;
  workingDays: WorkingDay[];
  hoursStatus: HoursStatus;
  hoursError: string;
  updateWorkingDay: (key: WeekdayKey, patch: Partial<WorkingDay>) => void;
  applyToWeekdays: (key: WeekdayKey) => void;
  blockedDates: BlockedDate[];
  addBlockedDate: (dateIso: string, reason: string) => Promise<number>;
  removeBlockedDate: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const WEEKDAYS: WeekdayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday'
];

const TOKEN_KEY = 'sbw_admin_token';
const SAVE_DELAY_MS = 600;

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable: the login simply won't survive a refresh
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // nothing to clear
  }
}

// Reads the expiry time (in milliseconds) out of a JWT, or null if unreadable
function tokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function toAccount(profile: ProviderProfile): ProviderAccount {
  return {
    email: profile.email,
    name: profile.name,
    studio: profile.studio_name
  };
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<ProviderAccount | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [bookingsReload, setBookingsReload] = useState(0);

  const [workingDays, setWorkingDays] =
    useState<WorkingDay[]>(initialWorkingDays);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilityReload, setAvailabilityReload] = useState(0);
  const [hoursStatus, setHoursStatus] = useState<HoursStatus>('idle');
  const [hoursError, setHoursError] = useState('');

  // The newest working hours, readable inside timers without going stale
  const workingRef = useRef<WorkingDay[]>(initialWorkingDays);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const signOut = useCallback(() => {
    clearToken();
    setToken(null);
    setAccount(null);
  }, []);

  // Lets the Settings page update the name shown in the admin after a save
  const updateAccount = useCallback((patch: Partial<ProviderAccount>) => {
    setAccount((current) => (current ? { ...current, ...patch } : current));
  }, []);

  // On first load, check whether a saved login is still valid
  useEffect(() => {
    const saved = readToken();
    if (!saved) {
      setLoading(false);
      return;
    }

    const expiresAt = tokenExpiryMs(saved);
    if (expiresAt !== null && expiresAt <= Date.now()) {
      clearToken();
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetchProfile(saved)
      .then((profile) => {
        if (cancelled) return;
        setToken(saved);
        setAccount(toAccount(profile));
      })
      .catch((err) => {
        if (cancelled) return;
        // Only throw the token away if the server says it is invalid.
        // If the server was just unreachable, keep it for next time.
        if (err instanceof ApiError && err.status === 401) clearToken();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sign out automatically when the token expires
  useEffect(() => {
    if (!token) return;
    const expiresAt = tokenExpiryMs(token);
    if (expiresAt === null) return;

    const delay = expiresAt - Date.now();
    if (delay <= 0) {
      signOut();
      return;
    }
    const timer = setTimeout(signOut, delay);
    return () => clearTimeout(timer);
  }, [token, signOut]);

  // Load the provider's bookings once signed in (upcoming only, like the mock)
  useEffect(() => {
    if (!token) {
      setBookings([]);
      setBookingsError('');
      setBookingsLoading(true);
      return;
    }

    let cancelled = false;
    setBookingsLoading(true);
    setBookingsError('');

    fetchAdminBookings(token)
      .then((list) => {
        if (cancelled) return;
        const today = format(new Date(), 'yyyy-MM-dd');
        setBookings(list.filter((booking) => booking.dateIso >= today));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          signOut();
          return;
        }
        setBookingsError(
          err instanceof Error ? err.message : 'Could not load bookings.'
        );
      })
      .finally(() => {
        if (!cancelled) setBookingsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, bookingsReload, signOut]);

  // Load working hours and blocked dates once signed in
  useEffect(() => {
    if (!token) {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      workingRef.current = initialWorkingDays;
      setWorkingDays(initialWorkingDays);
      setBlockedDates([]);
      setAvailabilityError('');
      setAvailabilityLoading(true);
      setHoursStatus('idle');
      return;
    }

    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError('');

    Promise.all([fetchWorkingDays(token), fetchBlockedDates(token)])
      .then(([days, blocked]) => {
        if (cancelled) return;
        const today = format(new Date(), 'yyyy-MM-dd');
        workingRef.current = days;
        setWorkingDays(days);
        setBlockedDates(blocked.filter((entry) => entry.dateIso >= today));
        setHoursStatus('idle');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          signOut();
          return;
        }
        setAvailabilityError(
          err instanceof Error ? err.message : 'Could not load your availability.'
        );
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, availabilityReload, signOut]);

  // Don't leave a pending save timer behind if the provider is removed
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const reloadBookings = useCallback(() => {
    setBookingsReload((count) => count + 1);
  }, []);

  const reloadAvailability = useCallback(() => {
    setAvailabilityReload((count) => count + 1);
  }, []);

  // Throws an Error with a readable message if the login fails
  const signIn = useCallback(async (email: string, password: string) => {
    const result = await loginProvider(email, password);
    saveToken(result.token);
    setToken(result.token);
    setAccount(toAccount(result.provider));
  }, []);

  // Saves to the server first, then updates the screen. Throws if the server refuses.
  const setBookingStatus = useCallback(
    async (id: string, status: BookingStatus) => {
      if (!token) throw new Error('Please sign in again.');
      try {
        await updateBookingStatus(token, id, status);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) signOut();
        throw err;
      }
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );
    },
    [token, signOut]
  );

  // Saves the current working hours to the server
  const persistWorkingDays = useCallback(async () => {
    saveTimer.current = null;
    if (!token) return;

    const current = workingRef.current;
    const invalid = current.some(
      (day) => day.isOpen && day.closesAt <= day.opensAt
    );
    if (invalid) {
      setHoursStatus('invalid');
      return;
    }

    setHoursStatus('saving');
    try {
      await saveWorkingDays(token, current);
      // If the provider kept editing meanwhile, a newer save is already queued
      if (saveTimer.current === null) setHoursStatus('saved');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
        return;
      }
      setHoursError(
        err instanceof Error ? err.message : 'Could not save your hours.'
      );
      setHoursStatus('error');
      // Show what is really saved, unless a newer edit is waiting
      if (saveTimer.current === null) {
        try {
          const fresh = await fetchWorkingDays(token);
          workingRef.current = fresh;
          setWorkingDays(fresh);
        } catch {
          // keep what is on screen; the error message is already showing
        }
      }
    }
  }, [token, signOut]);

  // Updates the screen straight away and saves a moment after the last change
  const commitWorkingDays = useCallback(
    (next: WorkingDay[]) => {
      workingRef.current = next;
      setWorkingDays(next);
      setHoursStatus('pending');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void persistWorkingDays();
      }, SAVE_DELAY_MS);
    },
    [persistWorkingDays]
  );

  const updateWorkingDay = useCallback(
    (key: WeekdayKey, patch: Partial<WorkingDay>) => {
      commitWorkingDays(
        workingRef.current.map((day) =>
          day.key === key ? { ...day, ...patch } : day
        )
      );
    },
    [commitWorkingDays]
  );

  const applyToWeekdays = useCallback(
    (key: WeekdayKey) => {
      const source = workingRef.current.find((day) => day.key === key);
      if (!source) return;
      commitWorkingDays(
        workingRef.current.map((day) =>
          WEEKDAYS.includes(day.key)
            ? {
                ...day,
                isOpen: source.isOpen,
                opensAt: source.opensAt,
                closesAt: source.closesAt
              }
            : day
        )
      );
    },
    [commitWorkingDays]
  );

  // Returns how many bookings already exist on that date. Throws if the server refuses.
  const addBlockedDate = useCallback(
    async (dateIso: string, reason: string): Promise<number> => {
      if (!token) throw new Error('Please sign in again.');
      let created: CreatedBlockedDate;
      try {
        created = await createBlockedDate(token, dateIso, reason);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) signOut();
        throw err;
      }
      setBlockedDates((current) => {
        if (current.some((entry) => entry.dateIso === created.blockedDate.dateIso)) {
          return current;
        }
        return [...current, created.blockedDate].sort((a, b) =>
          a.dateIso.localeCompare(b.dateIso)
        );
      });
      return created.bookingsOnDate;
    },
    [token, signOut]
  );

  const removeBlockedDate = useCallback(
    async (id: string): Promise<void> => {
      if (!token) throw new Error('Please sign in again.');
      try {
        await deleteBlockedDate(token, id);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) signOut();
        throw err;
      }
      setBlockedDates((current) => current.filter((entry) => entry.id !== id));
    },
    [token, signOut]
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      account,
      updateAccount,
      token,
      loading,
      signIn,
      signOut,
      bookings,
      bookingsLoading,
      bookingsError,
      reloadBookings,
      stats: getBookingStats(bookings),
      setBookingStatus,
      availabilityLoading,
      availabilityError,
      reloadAvailability,
      workingDays,
      hoursStatus,
      hoursError,
      updateWorkingDay,
      applyToWeekdays,
      blockedDates,
      addBlockedDate,
      removeBlockedDate
    }),
    [
      account,
      updateAccount,
      token,
      loading,
      signIn,
      signOut,
      bookings,
      bookingsLoading,
      bookingsError,
      reloadBookings,
      setBookingStatus,
      availabilityLoading,
      availabilityError,
      reloadAvailability,
      workingDays,
      hoursStatus,
      hoursError,
      updateWorkingDay,
      applyToWeekdays,
      blockedDates,
      addBlockedDate,
      removeBlockedDate
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used inside an AdminProvider');
  }
  return context;
}