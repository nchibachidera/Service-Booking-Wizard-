import { addDays, format, startOfDay } from 'date-fns';
import type { BlockedDate, WorkingDay } from '../types/admin';

export const initialWorkingDays: WorkingDay[] = [
{
  key: 'monday',
  label: 'Monday',
  isOpen: true,
  opensAt: '09:00',
  closesAt: '18:00'
},
{
  key: 'tuesday',
  label: 'Tuesday',
  isOpen: true,
  opensAt: '09:00',
  closesAt: '18:00'
},
{
  key: 'wednesday',
  label: 'Wednesday',
  isOpen: true,
  opensAt: '10:00',
  closesAt: '19:00'
},
{
  key: 'thursday',
  label: 'Thursday',
  isOpen: true,
  opensAt: '10:00',
  closesAt: '19:00'
},
{
  key: 'friday',
  label: 'Friday',
  isOpen: true,
  opensAt: '09:00',
  closesAt: '17:00'
},
{
  key: 'saturday',
  label: 'Saturday',
  isOpen: true,
  opensAt: '09:00',
  closesAt: '15:00'
},
{
  key: 'sunday',
  label: 'Sunday',
  isOpen: false,
  opensAt: '10:00',
  closesAt: '16:00'
}];


function offsetIso(days: number): string {
  return format(addDays(startOfDay(new Date()), days), 'yyyy-MM-dd');
}

export const initialBlockedDates: BlockedDate[] = [
{ id: 'bd-1', dateIso: offsetIso(6), reason: 'Supplier training day' },
{ id: 'bd-2', dateIso: offsetIso(15), reason: 'Annual leave' },
{ id: 'bd-3', dateIso: offsetIso(16), reason: 'Annual leave' }];


export const HOUR_OPTIONS: string[] = Array.from({ length: 29 }, (_, index) => {
  const minutes = 7 * 60 + index * 30;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
});