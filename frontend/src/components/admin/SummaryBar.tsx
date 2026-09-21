import React from 'react';
import { format } from 'date-fns';
import { formatPrice } from '../../utils/schedule';
import type { BookingStats } from '../../utils/adminStats';

interface SummaryBarProps {
  stats: BookingStats;
}

export function SummaryBar({ stats }: SummaryBarProps) {
  const secondary = [
  { label: 'This week', value: stats.week, hint: 'Mon – Sun' },
  { label: 'This month', value: stats.month, hint: format(new Date(), 'MMMM') },
  {
    label: 'Awaiting approval',
    value: stats.pending,
    hint: stats.pending > 0 ? 'Needs a decision' : 'All clear'
  }];


  return (
    <section
      aria-label="Booking summary"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
      
      <div className="rounded-2xl bg-accent px-5 py-4 text-white shadow-lift">
        <p className="text-[12px] font-medium text-white/70">
          Today · {format(new Date(), 'EEE d MMM')}
        </p>
        <p className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[34px] font-semibold leading-none tabular-nums">
            {stats.today}
          </span>
          <span className="text-[14px] text-white/80">
            {stats.today === 1 ? 'appointment' : 'appointments'}
          </span>
        </p>
        <p className="mt-2 text-[13px] text-white/70">
          {formatPrice(stats.todayRevenue)} expected in studio
        </p>
      </div>

      {secondary.map((item) =>
      <div
        key={item.label}
        className="rounded-2xl bg-surface px-5 py-4 shadow-soft">
        
          <p className="text-[12px] font-medium text-muted">{item.label}</p>
          <p className="mt-1.5 text-[26px] font-semibold leading-none tabular-nums">
            {item.value}
          </p>
          <p className="mt-2 text-[13px] text-faint">{item.hint}</p>
        </div>
      )}
    </section>);

}