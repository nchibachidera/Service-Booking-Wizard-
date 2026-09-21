import React, { useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { AdminShell } from '../../components/admin/AdminShell';
import { SummaryBar } from '../../components/admin/SummaryBar';
import { BookingsTable } from '../../components/admin/BookingsTable';
import { useAdmin } from '../../contexts/AdminContext';
import type { BookingStatus } from '../../types/admin';

type Filter = 'all' | BookingStatus;

const FILTERS: {id: Filter;label: string;}[] = [
{ id: 'all', label: 'All' },
{ id: 'pending', label: 'Pending' },
{ id: 'confirmed', label: 'Confirmed' },
{ id: 'cancelled', label: 'Cancelled' }];


export function AdminBookings() {
  const { bookings, stats, setBookingStatus } = useAdmin();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesFilter = filter === 'all' || booking.status === filter;
      const matchesQuery =
      term.length === 0 ||
      booking.customerName.toLowerCase().includes(term) ||
      booking.phone.includes(term) ||
      booking.serviceName.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [bookings, filter, query]);

  return (
    <AdminShell
      title="Bookings"
      description="Every upcoming appointment, newest date first.">
      
      <SummaryBar stats={stats} />

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filter by status"
          className="flex items-center gap-1 rounded-xl bg-surface p-1 shadow-soft">
          
          {FILTERS.map((item) => {
            const isActive = filter === item.id;
            const count =
            item.id === 'all' ?
            bookings.length :
            bookings.filter((booking) => booking.status === item.id).length;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(item.id)}
                className={[
                'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring',
                isActive ?
                'bg-accent text-white' :
                'text-muted hover:bg-accent-soft hover:text-ink'].
                join(' ')}>
                
                {item.label}
                <span
                  className={[
                  'ml-1.5 tabular-nums',
                  isActive ? 'text-white/70' : 'text-faint'].
                  join(' ')}>
                  
                  {count}
                </span>
              </button>);

          })}
        </div>

        <div className="relative w-full sm:w-[260px]">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          
          <label htmlFor="booking-search" className="sr-only">
            Search bookings
          </label>
          <input
            id="booking-search"
            type="search"
            placeholder="Search name, phone, service"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-xl bg-surface pl-9 pr-3 text-[13.5px] text-ink shadow-soft placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring" />
          
        </div>
      </div>

      <div className="mt-4">
        <BookingsTable bookings={visible} onStatusChange={setBookingStatus} />
      </div>
    </AdminShell>);

}