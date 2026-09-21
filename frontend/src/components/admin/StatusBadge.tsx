import React from 'react';
import type { BookingStatus } from '../../types/admin';

const STYLES: Record<BookingStatus, {label: string;className: string;}> = {
  confirmed: {
    label: 'Confirmed',
    className: 'bg-accent-soft text-accent'
  },
  pending: {
    label: 'Pending',
    className: 'bg-warn-soft text-warn'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-danger-soft text-danger'
  }
};

export function StatusBadge({ status }: {status: BookingStatus;}) {
  const style = STYLES[status];
  return (
    <span
      className={[
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold',
      style.className].
      join(' ')}>
      
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      
      {style.label}
    </span>);

}