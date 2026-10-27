import { format } from 'date-fns';
import type { Service, ServiceCategory, TimeSlot } from './types/booking';

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