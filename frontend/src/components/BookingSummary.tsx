import React from 'react';
import { formatDayLong, formatDuration, formatPrice } from '../utils/schedule';
import type { Service } from '../types/booking';

interface BookingSummaryProps {
  service: Service | null;
  dayIso?: string;
  time?: string | null;
  variant?: 'rail' | 'card';
  onEditService?: () => void;
  onEditTime?: () => void;
}

function Row({
  label,
  value,
  onEdit




}: {label: string;value: string;onEdit?: () => void;}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="flex items-baseline gap-3 text-right">
        <span className="text-[14px] font-medium text-ink">{value}</span>
        {onEdit &&
        <button
          type="button"
          onClick={onEdit}
          className="rounded text-[13px] font-medium text-accent underline decoration-accent/30 underline-offset-2 transition-colors duration-150 ease-expo hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
          
            Edit
          </button>
        }
      </dd>
    </div>);

}

export function BookingSummary({
  service,
  dayIso,
  time,
  variant = 'card',
  onEditService,
  onEditTime
}: BookingSummaryProps) {
  const isRail = variant === 'rail';

  if (!service) {
    if (!isRail) return null;
    return (
      <p className="text-[13px] leading-6 text-muted">
        Your selection will appear here as you go.
      </p>);

  }

  return (
    <div
      className={
      isRail ? '' : 'rounded-3xl bg-surface px-5 py-2 shadow-soft sm:px-6'
      }>
      
      <dl className={isRail ? 'divide-y divide-line/70' : 'divide-y divide-line/70'}>
        <Row label="Service" value={service.name} onEdit={onEditService} />
        {dayIso &&
        <Row
          label="Date"
          value={formatDayLong(dayIso)}
          onEdit={time ? onEditTime : undefined} />

        }
        {time &&
        <Row
          label="Time"
          value={`${time} · ${formatDuration(service.durationMinutes)}`} />

        }
        <div className="flex items-baseline justify-between py-3">
          <dt className="text-[13px] font-semibold text-ink">Total</dt>
          <dd className="text-[15px] font-semibold tabular-nums text-ink">
            {formatPrice(service.price)}
          </dd>
        </div>
      </dl>
    </div>);

}