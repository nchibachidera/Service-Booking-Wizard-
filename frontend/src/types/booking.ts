export type ServiceCategory = 'Cut & Style' | 'Colour' | 'Treatments';

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: ServiceCategory;
  mostBooked?: boolean;
}

export interface DayOption {
  iso: string;
  date: Date;
  weekday: string;
  dayOfMonth: string;
  month: string;
  isToday: boolean;
  isClosed: boolean;
}

export type SlotPeriod = 'morning' | 'afternoon';

export interface TimeSlot {
  time: string;
  available: boolean;
  period: SlotPeriod;
}

export type Step = 'service' | 'time' | 'confirm' | 'success';

export interface FieldErrors {
  name?: string;
  phone?: string;
}