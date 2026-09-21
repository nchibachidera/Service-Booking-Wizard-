import { addDays, format, startOfDay } from 'date-fns';
import type { DayOption, TimeSlot } from '../types/booking';

const OPEN_MINUTES = 9 * 60;
const CLOSE_MINUTES = 18 * 60;
const SLOT_STEP = 15;

/** Stable 32-bit hash so slot availability never changes between renders. */
function hash(input: string): number {
  let value = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
}

function toTimeLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function getUpcomingDays(count = 7): DayOption[] {
  const today = startOfDay(new Date());
  return Array.from({ length: count }, (_, index) => {
    const date = addDays(today, index);
    return {
      iso: format(date, 'yyyy-MM-dd'),
      date,
      weekday: format(date, 'EEE'),
      dayOfMonth: format(date, 'd'),
      month: format(date, 'MMM'),
      isToday: index === 0,
      isClosed: date.getDay() === 0
    };
  });
}

export function getSlotsForDay(
iso: string,
durationMinutes: number)
: TimeSlot[] {
  const day = new Date(`${iso}T00:00:00`);
  if (day.getDay() === 0) return [];

  const now = new Date();
  const isToday = format(now, 'yyyy-MM-dd') === iso;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slots: TimeSlot[] = [];

  for (
  let minutes = OPEN_MINUTES;
  minutes + durationMinutes <= CLOSE_MINUTES;
  minutes += SLOT_STEP)
  {
    const time = toTimeLabel(minutes);
    const inPast = isToday && minutes <= nowMinutes + 30;
    const booked = hash(`${iso}-${time}`) % 10 < 4;
    slots.push({
      time,
      available: !inPast && !booked,
      period: minutes < 12 * 60 ? 'morning' : 'afternoon'
    });
  }

  return slots;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

export function formatPrice(amount: number): string {
  return `$${amount}`;
}

export function formatDayLong(iso: string): string {
  return format(new Date(`${iso}T00:00:00`), 'EEEE, d MMMM');
}

export function endTimeFor(time: string, durationMinutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  return toTimeLabel(hours * 60 + mins + durationMinutes);
}

export function createReference(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const pick = () => letters[Math.floor(Math.random() * letters.length)];
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${pick()}${pick()}-${digits}`;
}