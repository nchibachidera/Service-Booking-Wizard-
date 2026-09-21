import React from 'react';
import { CalendarOffIcon } from 'lucide-react';
import { formatDuration } from '../utils/schedule';
import type { DayOption, Service, SlotPeriod, TimeSlot } from '../types/booking';

interface TimeStepProps {
  service: Service;
  days: DayOption[];
  selectedDay: DayOption;
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectDay: (iso: string) => void;
  onSelectTime: (time: string) => void;
}

const PERIODS: {id: SlotPeriod;label: string;}[] = [
{ id: 'morning', label: 'Morning' },
{ id: 'afternoon', label: 'Afternoon' }];


export function TimeStep({
  service,
  days,
  selectedDay,
  slots,
  selectedTime,
  onSelectDay,
  onSelectTime
}: TimeStepProps) {
  const hasOpenSlots = slots.some((slot) => slot.available);

  return (
    <section aria-labelledby="time-heading">
      <header className="mb-7">
        <h2
          id="time-heading"
          className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
          
          Pick a time
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-muted">
          {service.name} · {formatDuration(service.durationMinutes)}
        </p>
      </header>

      <div className="-mx-1 mb-8 overflow-x-auto px-1 pb-1 no-scrollbar">
        <div
          role="radiogroup"
          aria-label="Select a date"
          className="flex gap-2.5">
          
          {days.map((day) => {
            const isSelected = day.iso === selectedDay.iso;
            return (
              <button
                key={day.iso}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={day.isClosed}
                onClick={() => onSelectDay(day.iso)}
                className={[
                'flex h-[76px] w-[64px] shrink-0 flex-col items-center justify-center rounded-2xl transition-[background-color,color,box-shadow,transform] duration-150 ease-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                isSelected ?
                'bg-accent text-white shadow-lift' :
                day.isClosed ?
                'cursor-not-allowed bg-surface/60 text-faint/70 shadow-inset' :
                'bg-surface text-ink shadow-soft hover:-translate-y-0.5'].
                join(' ')}>
                
                <span
                  className={[
                  'text-[11px] font-medium uppercase',
                  isSelected ?
                  'text-white/70' :
                  day.isClosed ?
                  'text-faint/70' :
                  'text-muted'].
                  join(' ')}>
                  
                  {day.isToday ? 'Today' : day.weekday}
                </span>
                <span className="mt-0.5 text-lg font-semibold tabular-nums">
                  {day.dayOfMonth}
                </span>
                <span
                  className={[
                  'text-[11px]',
                  isSelected ? 'text-white/70' : 'text-faint'].
                  join(' ')}>
                  
                  {day.month}
                </span>
              </button>);

          })}
        </div>
      </div>

      {!hasOpenSlots ?
      <div className="flex flex-col items-center rounded-3xl bg-surface px-6 py-14 text-center shadow-soft">
          <CalendarOffIcon aria-hidden="true" className="h-6 w-6 text-faint" />
          <p className="mt-4 text-[15px] font-semibold text-ink">
            {selectedDay.isClosed ?
          'The studio is closed on Sundays' :
          'No openings left on this day'}
          </p>
          <p className="mt-1 max-w-xs text-sm leading-6 text-muted">
            Try another date above — most weekdays have late-afternoon
            availability.
          </p>
        </div> :

      <div className="space-y-7">
          {PERIODS.map((period) => {
          const periodSlots = slots.filter((slot) => slot.period === period.id);
          if (periodSlots.length === 0) return null;
          return (
            <div key={period.id}>
                <div className="mb-3 flex items-baseline justify-between px-1">
                  <h3 className="text-sm font-semibold text-ink">
                    {period.label}
                  </h3>
                  <span className="text-xs tabular-nums text-faint">
                    {periodSlots.filter((slot) => slot.available).length} open
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                  {periodSlots.map((slot) => {
                  const isSelected = slot.time === selectedTime;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      aria-pressed={isSelected}
                      aria-label={
                      slot.available ?
                      `${slot.time}` :
                      `${slot.time}, unavailable`
                      }
                      onClick={() => onSelectTime(slot.time)}
                      className={[
                      'h-11 rounded-xl text-sm font-medium tabular-nums transition-[background-color,color,box-shadow] duration-150 ease-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                      isSelected ?
                      'bg-accent text-white shadow-lift' :
                      slot.available ?
                      'bg-surface text-ink shadow-soft hover:bg-accent-soft' :
                      'cursor-not-allowed bg-transparent text-faint/60 shadow-inset'].
                      join(' ')}>
                      
                        {slot.time}
                      </button>);

                })}
                </div>
              </div>);

        })}

          <p className="flex items-center gap-2 px-1 text-xs text-faint">
            <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rounded-[5px] shadow-inset" />
          
            Greyed-out times are already booked.
          </p>
        </div>
      }
    </section>);

}