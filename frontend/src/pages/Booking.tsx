import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftIcon, Loader2Icon, ScissorsIcon } from 'lucide-react';
import { StepIndicator } from '../components/StepIndicator';
import { ServiceStep } from '../components/ServiceStep';
import { TimeStep } from '../components/TimeStep';
import { ConfirmStep } from '../components/ConfirmStep';
import { SuccessStep } from '../components/SuccessStep';
import { BookingSummary } from '../components/BookingSummary';
import { useBookingFlow } from '../hooks/useBookingFlow';
import type { Step } from '../types/booking';

const BACK_STEP: Partial<Record<Step, Step>> = {
  time: 'service',
  confirm: 'time'
};

export function Booking() {
  const flow = useBookingFlow();
  const reduceMotion = useReducedMotion();
  const {
    step,
    service,
    selectedDay,
    time,
    days,
    slots,
    name,
    phone,
    errors,
    status,
    reference
  } = flow;

  const canNavigateTo = (target: Exclude<Step, 'success'>) => {
    if (step === 'success') return false;
    if (target === 'service') return true;
    if (target === 'time') return Boolean(service);
    return Boolean(service && time);
  };

  const transition = { duration: 0.22, ease: [0.23, 1, 0.32, 1] as const };
  const motionProps = reduceMotion ?
  {} :
  {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition
  };

  const showFooter =
  step === 'time' && Boolean(service) ||
  step === 'confirm' && Boolean(service && time);

  return (
    <div className="min-h-full w-full bg-canvas font-sans text-ink">
      <div className="mx-auto flex min-h-full w-full max-w-shell flex-col px-4 pb-32 pt-6 sm:px-6 lg:flex-row lg:gap-12 lg:px-8 lg:pb-12 lg:pt-12">
        {/* Rail: brand, progress, live summary */}
        <aside className="lg:sticky lg:top-12 lg:h-fit lg:w-[288px] lg:shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white">
              <ScissorsIcon aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em]">
              Maison Aster
            </span>
          </div>

          <p className="mt-5 hidden text-[22px] font-semibold leading-snug tracking-[-0.02em] lg:block">
            Book your visit
          </p>
          <p className="mt-1.5 hidden text-[13px] leading-6 text-muted lg:block">
            Three quick steps. Takes about a minute.
          </p>

          <div className="mt-6 hidden lg:block">
            <StepIndicator
              current={step}
              orientation="vertical"
              onNavigate={flow.setStep}
              canNavigateTo={canNavigateTo} />
            
          </div>

          {step !== 'success' &&
          <div className="mt-7 hidden rounded-3xl bg-surface px-5 py-2 shadow-soft lg:block">
              {service ?
            <BookingSummary
              service={service}
              dayIso={step === 'service' ? undefined : selectedDay.iso}
              time={time}
              variant="rail" /> :


            <p className="py-3 text-[13px] leading-6 text-muted">
                  Your selection will appear here as you go.
                </p>
            }
            </div>
          }

          {step !== 'success' &&
          <div className="mt-5 lg:hidden">
              <StepIndicator current={step} />
            </div>
          }

          <Link
            to="/admin/login"
            className="mt-8 hidden rounded text-[12.5px] text-faint underline decoration-line underline-offset-2 transition-colors duration-150 ease-expo hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring lg:inline-block">
            
            Provider sign in
          </Link>
        </aside>

        {/* Step content */}
        <main className="mt-8 min-w-0 flex-1 lg:mt-0">
          {step !== 'service' && step !== 'success' &&
          <button
            type="button"
            onClick={() => flow.setStep(BACK_STEP[step] ?? 'service')}
            className="mb-5 -ml-1 inline-flex items-center gap-1.5 rounded-xl px-1 py-1 text-[13px] font-medium text-muted transition-colors duration-150 ease-expo hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
            
              <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
              Back
            </button>
          }

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} {...motionProps}>
              {step === 'service' &&
              <ServiceStep
                services={flow.services}
                selectedId={service?.id}
                onSelect={flow.selectService} />

              }

              {step === 'time' && service &&
              <TimeStep
                service={service}
                days={days}
                selectedDay={selectedDay}
                slots={slots}
                selectedTime={time}
                onSelectDay={flow.selectDay}
                onSelectTime={flow.setTime} />

              }

              {step === 'confirm' && service && time &&
              <ConfirmStep
                service={service}
                dayIso={selectedDay.iso}
                time={time}
                name={name}
                phone={phone}
                errors={errors}
                onNameChange={flow.setName}
                onPhoneChange={flow.setPhone}
                onEditService={() => flow.setStep('service')}
                onEditTime={() => flow.setStep('time')}
                onSubmit={flow.submit} />

              }

              {step === 'success' && service && time &&
              <SuccessStep
                service={service}
                dayIso={selectedDay.iso}
                time={time}
                name={name}
                phone={phone}
                reference={reference}
                onBookAnother={flow.reset} />

              }
            </motion.div>
          </AnimatePresence>

          {/* Desktop action, inline under content */}
          {showFooter &&
          <div className="mt-8 hidden lg:block">
              <PrimaryAction
              step={step}
              disabled={step === 'time' && !time}
              submitting={status === 'submitting'}
              onClick={() =>
              step === 'time' ? flow.setStep('confirm') : flow.submit()
              } />
            
            </div>
          }
        </main>
      </div>

      {/* Mobile sticky action bar */}
      {showFooter &&
      <div className="fixed inset-x-0 bottom-0 border-t border-line/70 bg-canvas/95 px-4 pb-5 pt-4 backdrop-blur lg:hidden">
          <div className="mx-auto max-w-shell">
            <PrimaryAction
            step={step}
            disabled={step === 'time' && !time}
            submitting={status === 'submitting'}
            onClick={() =>
            step === 'time' ? flow.setStep('confirm') : flow.submit()
            } />
          
          </div>
        </div>
      }
    </div>);

}

interface PrimaryActionProps {
  step: Step;
  disabled: boolean;
  submitting: boolean;
  onClick: () => void;
}

function PrimaryAction({
  step,
  disabled,
  submitting,
  onClick
}: PrimaryActionProps) {
  const label = step === 'time' ? 'Continue' : 'Confirm booking';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || submitting}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 text-[15px] font-semibold text-white shadow-lift transition-colors duration-150 ease-expo hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-faint disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas lg:w-auto lg:min-w-[220px]">
      
      {submitting &&
      <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin" />
      }
      {submitting ? 'Confirming…' : disabled ? 'Select a time' : label}
    </button>);

}