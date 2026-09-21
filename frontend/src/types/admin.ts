export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  price: number;
  dateIso: string;
  time: string;
  status: BookingStatus;
  bookedLabel: string;
  note?: string;
}

export type WeekdayKey =
'monday' |
'tuesday' |
'wednesday' |
'thursday' |
'friday' |
'saturday' |
'sunday';

export interface WorkingDay {
  key: WeekdayKey;
  label: string;
  isOpen: boolean;
  opensAt: string;
  closesAt: string;
}

export interface BlockedDate {
  id: string;
  dateIso: string;
  reason: string;
}

export interface ProviderAccount {
  email: string;
  name: string;
  studio: string;
}