import React from 'react';
import { isToday, isTomorrow } from 'date-fns';
import { PhoneIcon } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import {
  endTimeFor,
  formatDayLong,
  formatDuration,
  formatPrice } from
'../../utils/schedule';
import type { Booking, BookingStatus } from '../../types/admin';

interface BookingsTableProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: BookingStatus) => void;
}

interface DateGroup {
  dateIso: string;
  label: string;
  items: Booking[];
}

function groupByDate(bookings: Booking[]): DateGroup[] {
  const map = new Map<string, Booking[]>();
  bookings.forEach((booking) => {
    const list = map.get(booking.dateIso) ?? [];
    list.push(booking);
    map.set(booking.dateIso, list);
  });
  return Array.from(map.entries()).map(([dateIso, items]) => {
    const date = new Date(`${dateIso}T00:00:00`);
    const prefix = isToday(date) ?
    'Today · ' :
    isTomorrow(date) ?
    'Tomorrow · ' :
    '';
    return { dateIso, label: `${prefix}${formatDayLong(dateIso)}`, items };
  });
}

function RowActions({
  booking,
  onStatusChange,
  compact = false




}: {booking: Booking;onStatusChange: (id: string, status: BookingStatus) => void;compact?: boolean;}) {
  const base =
  'rounded-lg px-2 py-1 text-[13px] font-medium transition-colors duration-150 ease-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring';
  return (
    <div
      className={[
      'flex items-center gap-1',
      compact ? '' : 'justify-end'].
      join(' ')}>
      
      {booking.status === 'pending' &&
      <button
        type="button"
        onClick={() => onStatusChange(booking.id, 'confirmed')}
        className={`${base} text-accent hover:bg-accent-soft`}>
        
          Confirm
        </button>
      }
      {booking.status !== 'cancelled' ?
      <button
        type="button"
        onClick={() => onStatusChange(booking.id, 'cancelled')}
        className={`${base} text-muted hover:bg-danger-soft hover:text-danger`}>
        
          Cancel
        </button> :

      <button
        type="button"
        onClick={() => onStatusChange(booking.id, 'confirmed')}
        className={`${base} text-muted hover:bg-accent-soft hover:text-accent`}>
        
          Reinstate
        </button>
      }
    </div>);

}

export function BookingsTable({
  bookings,
  onStatusChange
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl bg-surface px-6 py-14 text-center shadow-soft">
        <p className="text-[15px] font-semibold">No bookings match</p>
        <p className="mt-1 text-[14px] text-muted">
          Try a different status filter or clear your search.
        </p>
      </div>);

  }

  const groups = groupByDate(bookings);

  return (
    <>
      {/* Table — tablet and desktop */}
      <div className="hidden overflow-hidden rounded-2xl bg-surface shadow-soft md:block">
        <table className="w-full text-left">
          <caption className="sr-only">Upcoming bookings</caption>
          <thead>
            <tr className="border-b border-line/70 text-[12px] font-semibold text-muted">
              <th scope="col" className="px-5 py-2.5 font-semibold">
                Customer
              </th>
              <th scope="col" className="px-5 py-2.5 font-semibold">
                Service
              </th>
              <th scope="col" className="px-5 py-2.5 font-semibold">
                Time
              </th>
              <th scope="col" className="px-5 py-2.5 font-semibold">
                Status
              </th>
              <th scope="col" className="px-5 py-2.5 text-right font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          {groups.map((group) =>
          <tbody key={group.dateIso}>
              <tr className="bg-canvas/60">
                <th
                scope="colgroup"
                colSpan={5}
                className="px-5 py-1.5 text-[12px] font-semibold text-muted">
                
                  {group.label}
                  <span className="ml-2 font-normal text-faint">
                    {group.items.length}
                  </span>
                </th>
              </tr>
              {group.items.map((booking) =>
            <tr
              key={booking.id}
              className={[
              'border-t border-line/60 align-middle transition-colors duration-150 ease-expo hover:bg-accent-soft/30',
              booking.status === 'cancelled' ? 'opacity-60' : ''].
              join(' ')}>
              
                  <td className="px-5 py-3">
                    <span className="block text-[14px] font-medium">
                      {booking.customerName}
                    </span>
                    <span className="block text-[13px] tabular-nums text-muted">
                      {booking.phone}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="block text-[14px]">
                      {booking.serviceName}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {formatDuration(booking.durationMinutes)} ·{' '}
                      {formatPrice(booking.price)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className="block text-[14px] font-medium tabular-nums">
                      {booking.time}
                    </span>
                    <span className="block text-[13px] tabular-nums text-muted">
                      to {endTimeFor(booking.time, booking.durationMinutes)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-3">
                    <RowActions
                  booking={booking}
                  onStatusChange={onStatusChange} />
                
                  </td>
                </tr>
            )}
            </tbody>
          )}
        </table>
      </div>

      {/* Stacked cards — phone */}
      <div className="space-y-5 md:hidden">
        {groups.map((group) =>
        <section key={group.dateIso}>
            <h2 className="mb-2 px-1 text-[12px] font-semibold text-muted">
              {group.label}
            </h2>
            <ul className="overflow-hidden rounded-2xl bg-surface shadow-soft">
              {group.items.map((booking, index) =>
            <li
              key={booking.id}
              className={[
              'px-4 py-3.5',
              index > 0 ? 'border-t border-line/60' : '',
              booking.status === 'cancelled' ? 'opacity-60' : ''].
              join(' ')}>
              
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold">
                        {booking.customerName}
                      </p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {booking.serviceName} ·{' '}
                        {formatDuration(booking.durationMinutes)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[14px] font-semibold tabular-nums">
                        {booking.time}
                      </p>
                      <p className="text-[13px] tabular-nums text-muted">
                        {formatPrice(booking.price)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={booking.status} />
                      <a
                    href={`tel:${booking.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-1 text-[13px] tabular-nums text-muted transition-colors duration-150 ease-expo hover:text-ink">
                    
                        <PhoneIcon aria-hidden="true" className="h-3.5 w-3.5" />
                        {booking.phone}
                      </a>
                    </div>
                    <RowActions
                  booking={booking}
                  onStatusChange={onStatusChange}
                  compact />
                
                  </div>
                </li>
            )}
            </ul>
          </section>
        )}
      </div>
    </>);

}