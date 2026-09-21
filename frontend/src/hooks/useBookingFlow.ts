import { useCallback, useMemo, useState } from 'react';
import { services } from '../data/services';
import {
  createReference,
  getSlotsForDay,
  getUpcomingDays } from
'../utils/schedule';
import { useScreenInit } from '../useScreenInit.js';
import type { FieldErrors, Service, Step } from '../types/booking';

type Status = 'idle' | 'submitting';

interface ScreenInit {
  step?: Step;
  serviceId?: string;
  time?: string;
  name?: string;
  phone?: string;
}

export function useBookingFlow() {
  const init = useScreenInit() as ScreenInit;
  const days = useMemo(() => getUpcomingDays(7), []);
  const firstOpenDay = days.find((day) => !day.isClosed) ?? days[0];

  const [step, setStep] = useState<Step>(init.step ?? 'service');
  const [service, setService] = useState<Service | null>(
    () => services.find((item) => item.id === init.serviceId) ?? null
  );
  const [dayIso, setDayIso] = useState<string>(firstOpenDay.iso);
  const [time, setTime] = useState<string | null>(init.time ?? null);
  const [name, setName] = useState(init.name ?? '');
  const [phone, setPhone] = useState(init.phone ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [reference, setReference] = useState(() =>
  init.step === 'success' ? createReference() : ''
  );

  const slots = useMemo(
    () => service ? getSlotsForDay(dayIso, service.durationMinutes) : [],
    [dayIso, service]
  );

  const selectedDay = days.find((day) => day.iso === dayIso) ?? firstOpenDay;

  const selectService = useCallback((next: Service) => {
    setService(next);
    setTime(null);
    setStep('time');
  }, []);

  const selectDay = useCallback((iso: string) => {
    setDayIso(iso);
    setTime(null);
  }, []);

  const submit = useCallback(async () => {
    const nextErrors: FieldErrors = {};
    if (name.trim().length < 2) nextErrors.name = 'Please enter your full name.';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) nextErrors.phone = 'Enter a valid phone number.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('submitting');
    await new Promise((resolve) => setTimeout(resolve, 900));
    setReference(createReference());
    setStatus('idle');
    setStep('success');
  }, [name, phone]);

  const reset = useCallback(() => {
    setService(null);
    setDayIso(firstOpenDay.iso);
    setTime(null);
    setName('');
    setPhone('');
    setErrors({});
    setReference('');
    setStep('service');
  }, [firstOpenDay.iso]);

  return {
    services,
    days,
    slots,
    step,
    service,
    selectedDay,
    time,
    name,
    phone,
    errors,
    status,
    reference,
    setStep,
    setTime,
    setName,
    setPhone,
    selectService,
    selectDay,
    submit,
    reset
  };
}