import React from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import { BookingSummary } from './BookingSummary';
import type { FieldErrors, Service } from '../types/booking';

interface ConfirmStepProps {
  service: Service;
  dayIso: string;
  time: string;
  name: string;
  phone: string;
  errors: FieldErrors;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEditService: () => void;
  onEditTime: () => void;
  onSubmit: () => void;
}

const fieldClass =
'h-12 w-full rounded-2xl bg-surface px-4 text-[15px] text-ink shadow-soft placeholder:text-faint transition-shadow duration-150 ease-expo focus:outline-none focus:ring-2 focus:ring-accent-ring';

export function ConfirmStep({
  service,
  dayIso,
  time,
  name,
  phone,
  errors,
  onNameChange,
  onPhoneChange,
  onEditService,
  onEditTime,
  onSubmit
}: ConfirmStepProps) {
  return (
    <section aria-labelledby="confirm-heading">
      <header className="mb-7">
        <h2
          id="confirm-heading"
          className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
          
          Almost done
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-muted">
          Check your appointment and tell us how to reach you.
        </p>
      </header>

      <BookingSummary
        service={service}
        dayIso={dayIso}
        time={time}
        onEditService={onEditService}
        onEditTime={onEditTime} />
      

      <form
        className="mt-7 space-y-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}>
        
        <div>
          <label
            htmlFor="customer-name"
            className="mb-2 block text-[13px] font-medium text-ink">
            
            Full name
          </label>
          <input
            id="customer-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Amara Whitfield"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'customer-name-error' : undefined}
            className={fieldClass} />
          
          {errors.name &&
          <p
            id="customer-name-error"
            role="alert"
            className="mt-2 text-[13px] text-red-700">
            
              {errors.name}
            </p>
          }
        </div>

        <div>
          <label
            htmlFor="customer-phone"
            className="mb-2 block text-[13px] font-medium text-ink">
            
            Phone number
          </label>
          <input
            id="customer-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(415) 555 0142"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
            errors.phone ? 'customer-phone-error' : 'phone-hint'
            }
            className={fieldClass} />
          
          {errors.phone ?
          <p
            id="customer-phone-error"
            role="alert"
            className="mt-2 text-[13px] text-red-700">
            
              {errors.phone}
            </p> :

          <p id="phone-hint" className="mt-2 text-[13px] text-muted">
              We only use this to send your reminder.
            </p>
          }
        </div>

        <p className="flex items-start gap-2.5 text-[13px] leading-6 text-muted">
          <ShieldCheckIcon
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          
          Nothing is charged now — you pay in studio. Free to reschedule up to
          24 hours before.
        </p>
      </form>
    </section>);

}