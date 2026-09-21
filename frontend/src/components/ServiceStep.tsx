import React from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { serviceCategories } from '../data/services';
import { formatDuration, formatPrice } from '../utils/schedule';
import type { Service } from '../types/booking';

interface ServiceStepProps {
  services: Service[];
  selectedId?: string;
  onSelect: (service: Service) => void;
}

export function ServiceStep({
  services,
  selectedId,
  onSelect
}: ServiceStepProps) {
  return (
    <section aria-labelledby="service-heading">
      <header className="mb-7">
        <h2
          id="service-heading"
          className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
          
          What are you booking?
        </h2>
        <p className="mt-2 max-w-md text-[15px] leading-6 text-muted">
          Choose a service to see the next available appointments.
        </p>
      </header>

      <div className="space-y-8">
        {serviceCategories.map((category) => {
          const items = services.filter(
            (service) => service.category === category
          );
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h3 className="mb-3 px-1 text-sm font-semibold text-ink">
                {category}
              </h3>
              <ul className="overflow-hidden rounded-3xl bg-surface shadow-soft">
                {items.map((service, index) => {
                  const isSelected = service.id === selectedId;
                  return (
                    <li
                      key={service.id}
                      className={index > 0 ? 'border-t border-line/70' : ''}>
                      
                      <button
                        type="button"
                        onClick={() => onSelect(service)}
                        aria-pressed={isSelected}
                        className={[
                        'group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-150 ease-expo hover:bg-accent-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-ring sm:px-6 sm:py-5',
                        isSelected ? 'bg-accent-soft/70' : ''].
                        join(' ')}>
                        
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-[15px] font-semibold text-ink sm:text-base">
                              {service.name}
                            </span>
                            {service.mostBooked &&
                            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                                Most booked
                              </span>
                            }
                          </span>
                          <span className="mt-1 block text-[13px] leading-5 text-muted sm:text-sm">
                            {service.description}
                          </span>
                        </span>

                        <span className="shrink-0 text-right">
                          <span className="block text-[15px] font-semibold tabular-nums text-ink sm:text-base">
                            {formatPrice(service.price)}
                          </span>
                          <span className="mt-0.5 block text-[13px] tabular-nums text-muted">
                            {formatDuration(service.durationMinutes)}
                          </span>
                        </span>

                        <ChevronRightIcon
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-faint transition-transform duration-150 ease-expo group-hover:translate-x-0.5 group-hover:text-accent" />
                        
                      </button>
                    </li>);

                })}
              </ul>
            </div>);

        })}
      </div>
    </section>);

}