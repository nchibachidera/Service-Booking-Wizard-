import React from 'react';
import { CheckIcon } from 'lucide-react';
import type { Step } from '../types/booking';

const STEPS: {id: Exclude<Step, 'success'>;label: string;hint: string;}[] = [
{ id: 'service', label: 'Service', hint: 'Choose your treatment' },
{ id: 'time', label: 'Time', hint: 'Pick a date and slot' },
{ id: 'confirm', label: 'Confirm', hint: 'Your details' }];


interface StepIndicatorProps {
  current: Step;
  orientation?: 'horizontal' | 'vertical';
  onNavigate?: (step: Exclude<Step, 'success'>) => void;
  canNavigateTo?: (step: Exclude<Step, 'success'>) => boolean;
}

function activeIndex(current: Step): number {
  if (current === 'success') return STEPS.length;
  return STEPS.findIndex((step) => step.id === current);
}

export function StepIndicator({
  current,
  orientation = 'horizontal',
  onNavigate,
  canNavigateTo
}: StepIndicatorProps) {
  const index = activeIndex(current);

  if (orientation === 'vertical') {
    return (
      <ol className="space-y-1">
        {STEPS.map((step, i) => {
          const done = i < index;
          const isCurrent = i === index;
          const clickable = Boolean(
            onNavigate && (canNavigateTo ? canNavigateTo(step.id) : done)
          );
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onNavigate?.(step.id)}
                aria-current={isCurrent ? 'step' : undefined}
                className="group flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors duration-150 ease-expo enabled:hover:bg-accent-soft/60 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
                
                <span
                  className={[
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-150 ease-expo',
                  done ?
                  'bg-accent text-white' :
                  isCurrent ?
                  'bg-accent text-white' :
                  'bg-line/70 text-faint'].
                  join(' ')}>
                  
                  {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={[
                    'block text-sm font-semibold leading-5',
                    isCurrent || done ? 'text-ink' : 'text-faint'].
                    join(' ')}>
                    
                    {step.label}
                  </span>
                  <span className="block truncate text-xs leading-5 text-muted">
                    {step.hint}
                  </span>
                </span>
              </button>
            </li>);

        })}
      </ol>);

  }

  return (
    <ol className="flex items-center gap-2" aria-label="Booking progress">
      {STEPS.map((step, i) => {
        const done = i < index;
        const isCurrent = i === index;
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <span
              aria-current={isCurrent ? 'step' : undefined}
              className="flex min-w-0 items-center gap-2">
              
              <span
                className={[
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors duration-150 ease-expo',
                done || isCurrent ?
                'bg-accent text-white' :
                'bg-line/80 text-faint'].
                join(' ')}>
                
                {done ? <CheckIcon className="h-3 w-3" /> : i + 1}
              </span>
              <span
                className={[
                'whitespace-nowrap text-[13px] font-medium',
                isCurrent ? 'text-ink' : done ? 'text-muted' : 'text-faint'].
                join(' ')}>
                
                {step.label}
              </span>
            </span>
            {i < STEPS.length - 1 &&
            <span
              aria-hidden="true"
              className={[
              'h-px flex-1 transition-colors duration-200 ease-expo',
              done ? 'bg-accent/40' : 'bg-line'].
              join(' ')} />

            }
          </li>);

      })}
    </ol>);

}