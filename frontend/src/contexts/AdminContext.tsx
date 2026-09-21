import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState } from
'react';
import { initialBookings } from '../data/bookings';
import { initialBlockedDates, initialWorkingDays } from '../data/availability';
import { getBookingStats, type BookingStats } from '../utils/adminStats';
import { useScreenInit } from '../useScreenInit.js';
import type {
  BlockedDate,
  Booking,
  BookingStatus,
  ProviderAccount,
  WeekdayKey,
  WorkingDay } from
'../types/admin';

interface AdminContextValue {
  account: ProviderAccount | null;
  signIn: (email: string) => void;
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
'friday'];


const DEMO_ACCOUNT: ProviderAccount = {
  email: 'rae@maisonaster.com',
  name: 'Rae Lindqvist',
  studio: 'Maison Aster'
};

export function AdminProvider({ children }: {children: React.ReactNode;}) {
  const screenInit = useScreenInit() as {signedIn?: boolean;};
  const [account, setAccount] = useState<ProviderAccount | null>(
    screenInit.signedIn ? DEMO_ACCOUNT : null
  );
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [workingDays, setWorkingDays] =
  useState<WorkingDay[]>(initialWorkingDays);
  const [blockedDates, setBlockedDates] =
  useState<BlockedDate[]>(initialBlockedDates);

  const signIn = useCallback((email: string) => {
    setAccount({ ...DEMO_ACCOUNT, email });
  }, []);

  const signOut = useCallback(() => setAccount(null), []);

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
      current.map((day) => day.key === key ? { ...day, ...patch } : day)
      );
    },
    []
  );

  const applyToWeekdays = useCallback((key: WeekdayKey) => {
    setWorkingDays((current) => {
      const source = current.find((day) => day.key === key);
      if (!source) return current;
      return current.map((day) =>
      WEEKDAYS.includes(day.key) ?
      {
        ...day,
        isOpen: source.isOpen,
        opensAt: source.opensAt,
        closesAt: source.closesAt
      } :
      day
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
    signIn,
    signOut,
    bookings,
    setBookingStatus,
    workingDays,
    updateWorkingDay,
    applyToWeekdays,
    blockedDates,
    addBlockedDate,
    removeBlockedDate]

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