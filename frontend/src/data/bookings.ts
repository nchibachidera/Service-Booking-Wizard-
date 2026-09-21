import { addDays, format, startOfDay } from 'date-fns';
import { services } from './services';
import type { Booking, BookingStatus } from '../types/admin';

interface Seed {
  customerName: string;
  phone: string;
  serviceId: string;
  dayOffset: number;
  time: string;
  status: BookingStatus;
  bookedLabel: string;
  note?: string;
}

const seeds: Seed[] = [
{
  customerName: 'Amara Whitfield',
  phone: '(415) 555 0142',
  serviceId: 'cut-finish',
  dayOffset: 0,
  time: '09:30',
  status: 'confirmed',
  bookedLabel: '3 days ago'
},
{
  customerName: 'Jonah Vance',
  phone: '(415) 555 0187',
  serviceId: 'fringe-trim',
  dayOffset: 0,
  time: '11:15',
  status: 'confirmed',
  bookedLabel: 'Yesterday'
},
{
  customerName: 'Priya Raman',
  phone: '(628) 555 0119',
  serviceId: 'balayage',
  dayOffset: 0,
  time: '13:00',
  status: 'pending',
  bookedLabel: '2 hours ago',
  note: 'Asked about going two shades lighter.'
},
{
  customerName: 'Elena Duarte',
  phone: '(415) 555 0163',
  serviceId: 'gloss',
  dayOffset: 0,
  time: '16:45',
  status: 'confirmed',
  bookedLabel: '6 days ago'
},
{
  customerName: 'Marcus Bell',
  phone: '(510) 555 0104',
  serviceId: 'root-touch',
  dayOffset: 1,
  time: '10:00',
  status: 'confirmed',
  bookedLabel: '4 days ago'
},
{
  customerName: 'Sofia Marchetti',
  phone: '(415) 555 0198',
  serviceId: 'blow-dry',
  dayOffset: 1,
  time: '12:30',
  status: 'pending',
  bookedLabel: 'Today, 08:12'
},
{
  customerName: 'Dominic Osei',
  phone: '(628) 555 0177',
  serviceId: 'cut-finish',
  dayOffset: 2,
  time: '09:00',
  status: 'confirmed',
  bookedLabel: '1 week ago'
},
{
  customerName: 'Hana Ito',
  phone: '(415) 555 0121',
  serviceId: 'bond-repair',
  dayOffset: 2,
  time: '15:15',
  status: 'cancelled',
  bookedLabel: '5 days ago',
  note: 'Cancelled — travelling for work.'
},
{
  customerName: 'Théo Laurent',
  phone: '(510) 555 0138',
  serviceId: 'full-colour',
  dayOffset: 3,
  time: '10:30',
  status: 'confirmed',
  bookedLabel: '2 days ago'
},
{
  customerName: 'Ruth Ellery',
  phone: '(415) 555 0152',
  serviceId: 'blow-dry',
  dayOffset: 3,
  time: '14:00',
  status: 'pending',
  bookedLabel: 'Yesterday'
},
{
  customerName: 'Nadia Haddad',
  phone: '(628) 555 0166',
  serviceId: 'cut-finish',
  dayOffset: 4,
  time: '11:45',
  status: 'confirmed',
  bookedLabel: '3 days ago'
},
{
  customerName: 'Owen Fitzgerald',
  phone: '(415) 555 0173',
  serviceId: 'gloss',
  dayOffset: 5,
  time: '09:15',
  status: 'confirmed',
  bookedLabel: '1 day ago'
},
{
  customerName: 'Beatriz Salas',
  phone: '(510) 555 0190',
  serviceId: 'balayage',
  dayOffset: 9,
  time: '10:00',
  status: 'confirmed',
  bookedLabel: '1 week ago'
},
{
  customerName: 'Caleb Nguyen',
  phone: '(415) 555 0115',
  serviceId: 'root-touch',
  dayOffset: 12,
  time: '16:00',
  status: 'pending',
  bookedLabel: '4 hours ago'
},
{
  customerName: 'Ingrid Solberg',
  phone: '(628) 555 0148',
  serviceId: 'bond-repair',
  dayOffset: 18,
  time: '13:30',
  status: 'confirmed',
  bookedLabel: '2 days ago'
}];


function toBooking(seed: Seed, index: number): Booking {
  const service =
  services.find((item) => item.id === seed.serviceId) ?? services[0];
  const date = addDays(startOfDay(new Date()), seed.dayOffset);
  return {
    id: `bk-${String(index + 1).padStart(3, '0')}`,
    customerName: seed.customerName,
    phone: seed.phone,
    serviceId: service.id,
    serviceName: service.name,
    durationMinutes: service.durationMinutes,
    price: service.price,
    dateIso: format(date, 'yyyy-MM-dd'),
    time: seed.time,
    status: seed.status,
    bookedLabel: seed.bookedLabel,
    note: seed.note
  };
}

export const initialBookings: Booking[] = seeds.
map(toBooking).
sort((a, b) =>
`${a.dateIso}${a.time}`.localeCompare(`${b.dateIso}${b.time}`)
);