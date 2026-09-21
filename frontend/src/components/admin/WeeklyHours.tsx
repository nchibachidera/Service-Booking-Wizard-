import React from 'react';
import { CopyIcon } from 'lucide-react';
import { HOUR_OPTIONS } from '../../data/availability';
import type { WeekdayKey, WorkingDay } from '../../types/admin';

interface WeeklyHoursProps {
  days: WorkingDay[];
  onUpdate: (key: WeekdayKey, patch: Partial<WorkingDay>) => void;
  onApplyToWeekdays: (key: WeekdayKey) => void;
}

function hoursTotal(day: WorkingDay): string {
  const [openH, openM] = day.opensAt.split(':').map(Number);
  const [closeH, closeM] = day.closesAt.split(':').map(Number);
  const minutes = closeH * 60 + closeM - (openH * 60 + openM);
  if (minutes <= 0) return 'Check times';
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hrs`;
}

const selectClass =
'h-9 rounded-xl bg-canvas px-2.5 text-[13px] font-medium tabular-nums text-ink shadow-inset transition-shadow duration-150 ease-expo focus:outline-none focus:ring-2 focus:ring-accent-ring disabled:text-faint';

export function WeeklyHours({
  days,
  onUpdate,
  onApplyToWeekdays
}: WeeklyHoursProps) {
  return (
    <section
      aria-labelledby="hours-heading"
      className="overflow-hidden rounded-2xl bg-surface shadow-soft">
      
      <div className="flex items-baseline justify-between border-b border-line/70 px-5 py-3.5">
        <h2 id="hours-heading" className="text-[15px] font-semibold">
          Weekly working hours
        </h2>
        <p className="text-[12px] text-faint">
          Applies to every week unless a date is blocked
        </p>
      </div>

      <ul>
        {days.map((day, index) =>
        <li
          key={day.key}
          className={[
          'flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3',
          index > 0 ? 'border-t border-line/60' : '',
          day.isOpen ? '' : 'bg-canvas/40'].
          join(' ')}>
          
            <button
            type="button"
            role="switch"
            aria-checked={day.isOpen}
            aria-label={`${day.label} ${day.isOpen ? 'open' : 'closed'}`}
            onClick={() => onUpdate(day.key, { isOpen: !day.isOpen })}
            className={[
            'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ease-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            day.isOpen ? 'bg-accent' : 'bg-line'].
            join(' ')}>
            
              <span
              aria-hidden="true"
              className={[
              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-expo',
              day.isOpen ? 'translate-x-[18px]' : 'translate-x-0.5'].
              join(' ')} />
            
            </button>

            <span className="w-[92px] shrink-0 text-[14px] font-medium">
              {day.label}
            </span>

            {day.isOpen ?
          <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`${day.key}-opens`}>
                  {day.label} opens at
                </label>
                <select
              id={`${day.key}-opens`}
              value={day.opensAt}
              onChange={(event) =>
              onUpdate(day.key, { opensAt: event.target.value })
              }
              className={selectClass}>
              
                  {HOUR_OPTIONS.map((option) =>
              <option key={option} value={option}>
                      {option}
                    </option>
              )}
                </select>
                <span className="text-[13px] text-faint">to</span>
                <label className="sr-only" htmlFor={`${day.key}-closes`}>
                  {day.label} closes at
                </label>
                <select
              id={`${day.key}-closes`}
              value={day.closesAt}
              onChange={(event) =>
              onUpdate(day.key, { closesAt: event.target.value })
              }
              className={selectClass}>
              
                  {HOUR_OPTIONS.map((option) =>
              <option key={option} value={option}>
                      {option}
                    </option>
              )}
                </select>
                <span className="text-[13px] tabular-nums text-muted">
                  {hoursTotal(day)}
                </span>
              </div> :

          <span className="text-[13px] text-faint">Closed all day</span>
          }

            <button
            type="button"
            onClick={() => onApplyToWeekdays(day.key)}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-muted transition-colors duration-150 ease-expo hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
            
              <CopyIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Copy to Mon–Fri
            </button>
          </li>
        )}
      </ul>
    </section>);

}