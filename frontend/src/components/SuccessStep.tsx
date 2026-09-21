import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';
import {
  endTimeFor,
  formatDayLong,
  formatDuration,
  formatPrice } from
'../utils/schedule';
import type { Service } from '../types/booking';

interface SuccessStepProps {
  service: Service;
  dayIso: string;
  time: string;
  name: string;
  phone: string;
  reference: string;
  onBookAnother: () => void;
}

export function SuccessStep({
  service,
  dayIso,
  time,
  name,
  phone,
  reference,
  onBookAnother
}: SuccessStepProps) {
  const reduceMotion = useReducedMotion();

  const details: {label: string;value: string;}[] = [
  { label: 'Service', value: service.name },
  { label: 'When', value: `${formatDayLong(dayIso)}` },
  {
    label: 'Time',
    value: `${time} – ${endTimeFor(time, service.durationMinutes)} · ${formatDuration(
      service.durationMinutes
    )}`
  },
  { label: 'Name', value: name },
  { label: 'Phone', value: phone },
  { label: 'Reference', value: reference },
  { label: 'Due in studio', value: formatPrice(service.price) }];


  return (
    <section aria-labelledby="success-heading" className="text-center">
      <motion.span
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white">
        
        <CheckIcon aria-hidden="true" className="h-6 w-6" />
      </motion.span>

      <h2
        id="success-heading"
        className="mt-6 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">
        
        You're booked, {name.split(' ')[0]}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-6 text-muted">
        We've sent a confirmation by text. A reminder follows the day before.
      </p>

      <dl className="mt-8 overflow-hidden rounded-3xl bg-surface px-5 text-left shadow-soft sm:px-6">
        {details.map((detail, index) =>
        <div
          key={detail.label}
          className={[
          'flex items-baseline justify-between gap-4 py-3.5',
          index > 0 ? 'border-t border-line/70' : ''].
          join(' ')}>
          
            <dt className="text-[13px] text-muted">{detail.label}</dt>
            <dd className="text-right text-[14px] font-medium text-ink">
              {detail.value}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-7 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onBookAnother}
          className="h-12 w-full rounded-2xl bg-accent px-6 text-[15px] font-semibold text-white shadow-lift transition-colors duration-150 ease-expo hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:w-auto">
          
          Book another appointment
        </button>
        <p className="text-[13px] text-muted">
          Need to change something? Call us on (415) 555 0100.
        </p>
      </div>
    </section>);

}