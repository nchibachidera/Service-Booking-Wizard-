import { format } from 'date-fns';
import { initialWorkingDays } from './data/availability';
import type { Service, ServiceCategory, TimeSlot } from './types/booking';
import type {
  BlockedDate,
  Booking,
  BookingStatus,
  WeekdayKey,
  WorkingDay
} from './types/admin';

// Change this when the backend is deployed
const API_URL = 'http://localhost:5000/api';

interface ApiService {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: string; // Postgres NUMERIC arrives as a string
  category: string;
  most_booked: boolean;
}

interface ApiSlot {
  time: string;
  available: boolean;
}

interface ApiAdminBooking {
  id: number;
  customer_name: string;
  customer_phone: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
  service_id: number;
  service_name: string;
  duration_minutes: number;
  price: string;
}

interface ApiWorkingHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface ApiBlockedDate {
  id: number;
  date: string;
  reason: string;
}

export interface ProviderProfile {
  id: number;
  name: string;
  email: string;
}

export interface CreatedBlockedDate {
  blockedDate: BlockedDate;
  bookingsOnDate: number;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError(
      'Could not reach the server. Check your connection and try again.',
      0
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.error ?? 'Something went wrong. Please try again.',
      response.status
    );
  }
  return data as T;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

function toService(row: ApiService): Service {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    durationMinutes: row.duration_minutes,
    price: Number(row.price),
    category: row.category as ServiceCategory,
    mostBooked: row.most_booked
  };
}

// Same rule the mock used: times already past, plus a 30 minute buffer,
// can't be booked today
function isTooSoon(dateIso: string, time: string): boolean {
  const now = new Date();
  if (format(now, 'yyyy-MM-dd') !== dateIso) return false;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes <= now.getHours() * 60 + now.getMinutes() + 30;
}

// "5 min ago", "2 hours ago", "Yesterday", "3 days ago", "1 week ago"
function bookedLabel(createdAt: string): string {
  const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (Number.isNaN(minutes) || minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

function toAdminBooking(row: ApiAdminBooking): Booking {
  return {
    id: String(row.id),
    customerName: row.customer_name,
    phone: row.customer_phone,
    serviceId: String(row.service_id),
    serviceName: row.service_name,
    durationMinutes: row.duration_minutes,
    price: Number(row.price),
    dateIso: row.date.slice(0, 10),
    time: row.start_time.slice(0, 5),
    status: row.status,
    bookedLabel: bookedLabel(row.created_at)
  };
}

// The database stores Sunday as 0 and Saturday as 6
const DAY_INDEX: Record<WeekdayKey, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

// The screen's day list (labels, order, default hours) comes from the template;
// a day without a row in the database is closed
function toWorkingDays(rows: ApiWorkingHour[]): WorkingDay[] {
  return initialWorkingDays.map((template) => {
    const row = rows.find((item) => item.day_of_week === DAY_INDEX[template.key]);
    if (!row) return { ...template, isOpen: false };
    return {
      ...template,
      isOpen: true,
      opensAt: row.start_time.slice(0, 5),
      closesAt: row.end_time.slice(0, 5)
    };
  });
}

function toBlockedDate(row: ApiBlockedDate): BlockedDate {
  return {
    id: String(row.id),
    dateIso: row.date.slice(0, 10),
    reason: row.reason
  };
}

export async function fetchServices(): Promise<Service[]> {
  const rows = await request<ApiService[]>('/services');
  return rows.map(toService);
}

export async function fetchSlots(
  date: string,
  serviceId: string
): Promise<TimeSlot[]> {
  const data = await request<{ slots: ApiSlot[] }>(
    `/availability?date=${encodeURIComponent(date)}&service_id=${encodeURIComponent(serviceId)}`
  );
  return data.slots.map(
    (slot): TimeSlot => ({
      time: slot.time,
      available: slot.available && !isTooSoon(date, slot.time),
      period: Number(slot.time.split(':')[0]) < 12 ? 'morning' : 'afternoon'
    })
  );
}

interface NewBooking {
  serviceId: string;
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
}

export async function createBooking(input: NewBooking): Promise<{ id: number }> {
  return request<{ id: number }>('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: Number(input.serviceId),
      date: input.date,
      start_time: input.startTime,
      customer_name: input.customerName,
      customer_phone: input.customerPhone
    })
  });
}

export async function loginProvider(
  email: string,
  password: string
): Promise<{ token: string; provider: ProviderProfile }> {
  return request<{ token: string; provider: ProviderProfile }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

export async function fetchProfile(token: string): Promise<ProviderProfile> {
  return request<ProviderProfile>('/auth/me', {
    headers: authHeaders(token)
  });
}

export async function fetchAdminBookings(token: string): Promise<Booking[]> {
  const rows = await request<ApiAdminBooking[]>('/admin/bookings', {
    headers: authHeaders(token)
  });
  return rows.map(toAdminBooking);
}

export async function updateBookingStatus(
  token: string,
  id: string,
  status: BookingStatus
): Promise<void> {
  await request<{ id: number; status: BookingStatus }>(
    `/admin/bookings/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({ status })
    }
  );
}

export async function fetchWorkingDays(token: string): Promise<WorkingDay[]> {
  const rows = await request<ApiWorkingHour[]>('/admin/working-hours', {
    headers: authHeaders(token)
  });
  return toWorkingDays(rows);
}

// Sends the whole week; only open days are included
export async function saveWorkingDays(
  token: string,
  days: WorkingDay[]
): Promise<void> {
  await request<{ saved: number }>('/admin/working-hours', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({
      days: days
        .filter((day) => day.isOpen)
        .map((day) => ({
          day_of_week: DAY_INDEX[day.key],
          start_time: day.opensAt,
          end_time: day.closesAt
        }))
    })
  });
}

export async function fetchBlockedDates(token: string): Promise<BlockedDate[]> {
  const rows = await request<ApiBlockedDate[]>('/admin/blocked-dates', {
    headers: authHeaders(token)
  });
  return rows.map(toBlockedDate);
}

export async function createBlockedDate(
  token: string,
  dateIso: string,
  reason: string
): Promise<CreatedBlockedDate> {
  const row = await request<ApiBlockedDate & { bookings_on_date: number }>(
    '/admin/blocked-dates',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({ date: dateIso, reason })
    }
  );
  return { blockedDate: toBlockedDate(row), bookingsOnDate: row.bookings_on_date };
}

export async function deleteBlockedDate(token: string, id: string): Promise<void> {
  await request<{ id: number }>(`/admin/blocked-dates/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(token)
  });
}