import {
  endOfMonth,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek } from
'date-fns';
import type { Booking } from '../types/admin';

export interface BookingStats {
  today: number;
  week: number;
  month: number;
  pending: number;
  todayRevenue: number;
}

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function getBookingStats(bookings: Booking[]): BookingStats {
  const now = new Date();
  const active = bookings.filter((booking) => booking.status !== 'cancelled');
  const weekInterval = {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 })
  };
  const monthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
  const todays = active.filter((booking) =>
  isSameDay(toDate(booking.dateIso), startOfDay(now))
  );

  return {
    today: todays.length,
    week: active.filter((booking) =>
    isWithinInterval(toDate(booking.dateIso), weekInterval)
    ).length,
    month: active.filter((booking) =>
    isWithinInterval(toDate(booking.dateIso), monthInterval)
    ).length,
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    todayRevenue: todays.reduce((total, booking) => total + booking.price, 0)
  };
}