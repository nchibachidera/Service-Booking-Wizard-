import React, { useState } from 'react';
import { format } from 'date-fns';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { formatDayLong } from '../../utils/schedule';
import type { BlockedDate } from '../../types/admin';

interface BlockedDatesProps {
  dates: BlockedDate[];
  onAdd: (dateIso: string, reason: string) => void;
  onRemove: (id: string) => void;
}

export function BlockedDates({ dates, onAdd, onRemove }: BlockedDatesProps) {
  const [dateIso, setDateIso] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!dateIso) {
      setError('Choose a date to block.');
      return;
    }
    if (dates.some((entry) => entry.dateIso === dateIso)) {
      setError('That date is already blocked.');
      return;
    }
    onAdd(dateIso, reason);
    setDateIso('');
    setReason('');
    setError('');
  };

  return (
    <section
      aria-labelledby="blocked-heading"
      className="overflow-hidden rounded-2xl bg-surface shadow-soft">
      
      <div className="border-b border-line/70 px-5 py-3.5">
        <h2 id="blocked-heading" className="text-[15px] font-semibold">
          Blocked dates
        </h2>
        <p className="mt-0.5 text-[12px] text-faint">
          Customers can't book on these days
        </p>
      </div>

      <form onSubmit={handleAdd} className="space-y-2.5 px-5 py-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="block-date" className="sr-only">
              Date to block
            </label>
            <input
              id="block-date"
              type="date"
              min={today}
              value={dateIso}
              onChange={(event) => {
                setDateIso(event.target.value);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              className="h-9 w-full rounded-xl bg-canvas px-2.5 text-[13px] tabular-nums text-ink shadow-inset focus:outline-none focus:ring-2 focus:ring-accent-ring" />
            
          </div>
          <button
            type="submit"
            className="flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-[13px] font-semibold text-white transition-colors duration-150 ease-expo hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
            
            <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Block
          </button>
        </div>
        <label htmlFor="block-reason" className="sr-only">
          Reason
        </label>
        <input
          id="block-reason"
          type="text"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="h-9 w-full rounded-xl bg-canvas px-2.5 text-[13px] text-ink shadow-inset placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring" />
        
        {error &&
        <p role="alert" className="text-[13px] text-danger">
            {error}
          </p>
        }
      </form>

      {dates.length === 0 ?
      <p className="border-t border-line/60 px-5 py-6 text-[13px] text-muted">
          Nothing blocked — your weekly hours apply to every upcoming date.
        </p> :

      <ul className="border-t border-line/60">
          {dates.map((entry, index) =>
        <li
          key={entry.id}
          className={[
          'flex items-center gap-3 px-5 py-3',
          index > 0 ? 'border-t border-line/60' : ''].
          join(' ')}>
          
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">
                  {formatDayLong(entry.dateIso)}
                </p>
                <p className="truncate text-[12.5px] text-muted">
                  {entry.reason}
                </p>
              </div>
              <button
            type="button"
            onClick={() => onRemove(entry.id)}
            aria-label={`Unblock ${formatDayLong(entry.dateIso)}`}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-faint transition-colors duration-150 ease-expo hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
            
                <Trash2Icon aria-hidden="true" className="h-4 w-4" />
              </button>
            </li>
        )}
        </ul>
      }
    </section>);

}