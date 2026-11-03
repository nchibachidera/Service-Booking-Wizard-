import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { initialBookings } from '../data/bookings';
import { initialBlockedDates, initialWorkingDays } from '../data/availability';
import { getBookingStats, type BookingStats } from '../utils/adminStats';
import {
  ApiError,
  fetchProfile,
  loginProvider,
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

interface AdminContextValue {
  account: ProviderAccount | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  bookings: Booking[];
  stats: BookingStats;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  workingDays: WorkingDay[];
  updateWorkingDay: (key: WeekdayKey, patch: Partial<WorkingDay>) => void;
  applyToWeekdays: (key: WeekdayKey) => void;
  blockedDates: BlockedDate[];
  addBlockedDate: (dateIso: string, reason: string) => void;
  removeBlockedDate: (id: string) => void;
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

// The database stores one name per provider (the business name)
function toAccount(profile: ProviderProfile): ProviderAccount {
  return {
    email: profile.email,
    name: profile.name,
    studio: profile.name
  };
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<ProviderAccount | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [workingDays, setWorkingDays] =
    useState<WorkingDay[]>(initialWorkingDays);
  const [blockedDates, setBlockedDates] =
    useState<BlockedDate[]>(initialBlockedDates);

  const signOut = useCallback(() => {
    clearToken();
    setToken(null);
    setAccount(null);
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

  // Throws an Error with a readable message if the login fails
  const signIn = useCallback(async (email: string, password: string) => {
    const result = await loginProvider(email, password);
    saveToken(result.token);
    setToken(result.token);
    setAccount(toAccount(result.provider));
  }, []);

  const setBookingStatus = useCallback(
    (id: string, status: BookingStatus) => {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );
    },
    []
  );

  const updateWorkingDay = useCallback(
    (key: WeekdayKey, patch: Partial<WorkingDay>) => {
      setWorkingDays((current) =>
        current.map((day) => (day.key === key ? { ...day, ...patch } : day))
      );
    },
    []
  );

  const applyToWeekdays = useCallback((key: WeekdayKey) => {
    setWorkingDays((current) => {
      const source = current.find((day) => day.key === key);
      if (!source) return current;
      return current.map((day) =>
        WEEKDAYS.includes(day.key)
          ? {
              ...day,
              isOpen: source.isOpen,
              opensAt: source.opensAt,
              closesAt: source.closesAt
            }
          : day
      );
    });
  }, []);

  const addBlockedDate = useCallback((dateIso: string, reason: string) => {
    setBlockedDates((current) => {
      if (current.some((entry) => entry.dateIso === dateIso)) return current;
      const next: BlockedDate = {
        id: `bd-${Date.now()}`,
        dateIso,
        reason: reason.trim() || 'Unavailable'
      };
      return [...current, next].sort((a, b) =>
        a.dateIso.localeCompare(b.dateIso)
      );
    });
  }, []);

  const removeBlockedDate = useCallback((id: string) => {
    setBlockedDates((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({
      account,
      token,
      loading,
      signIn,
      signOut,
      bookings,
      stats: getBookingStats(bookings),
      setBookingStatus,
      workingDays,
      updateWorkingDay,
      applyToWeekdays,
      blockedDates,
      addBlockedDate,
      removeBlockedDate
    }),
    [
      account,
      token,
      loading,
      signIn,
      signOut,
      bookings,
      setBookingStatus,
      workingDays,
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