import { useCallback, useEffect, useMemo, useState } from 'react';
import { createReference, getUpcomingDays } from '../utils/schedule';
import { useScreenInit } from '../useScreenInit.js';
import {
  ApiError,
  createBooking,
  fetchServices,
  fetchSlots,
  fetchStudio,
  type PublicStudio
} from '../api';
import type { FieldErrors, Service, Step, TimeSlot } from '../types/booking';

type Status = 'idle' | 'submitting';

interface ScreenInit {
  step?: Step;
  serviceId?: string;
  time?: string;
  name?: string;
  phone?: string;
}

interface SlotsState {
  key: string;
  slots: TimeSlot[];
  error: string;
}

export function useBookingFlow() {
  const init = useScreenInit() as ScreenInit;

  // The studio's real name, open weekdays and blocked dates (null until loaded)
  const [studio, setStudio] = useState<PublicStudio | null>(null);

  const days = useMemo(
    () =>
      getUpcomingDays(
        7,
        studio
          ? { openWeekdays: studio.openDays, blockedDates: studio.blockedDates }
          : undefined
      ),
    [studio]
  );
  const firstOpenDay = days.find((day) => !day.isClosed) ?? days[0];

  const [step, setStep] = useState<Step>(init.step ?? 'service');

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');

  const [service, setService] = useState<Service | null>(null);
  const [chosenDay, setChosenDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(init.time ?? null);

  // The day in use: the one the customer picked, unless it has become closed
  const dayIso = useMemo(() => {
    const chosen = days.find((day) => day.iso === chosenDay);
    return chosen && !chosen.isClosed ? chosen.iso : firstOpenDay.iso;
  }, [days, chosenDay, firstOpenDay.iso]);

  const [slotsState, setSlotsState] = useState<SlotsState>({
    key: '',
    slots: [],
    error: ''
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const [name, setName] = useState(init.name ?? '');
  const [phone, setPhone] = useState(init.phone ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [notice, setNotice] = useState('');
  const [reference, setReference] = useState(() =>
    init.step === 'success' ? createReference() : ''
  );

  // Load the studio details once
  useEffect(() => {
    let cancelled = false;
    fetchStudio()
      .then((result) => {
        if (!cancelled) setStudio(result);
      })
      .catch(() => {
        // Keep the defaults (closed on Sundays) if the details can't load
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load services from the API once
  useEffect(() => {
    let cancelled = false;
    fetchServices()
      .then((list) => {
        if (cancelled) return;
        setServices(list);
        if (init.serviceId) {
          setService(
            (current) =>
              current ?? list.find((item) => item.id === init.serviceId) ?? null
          );
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setServicesError(err.message);
      })
      .finally(() => {
        if (!cancelled) setServicesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [init.serviceId]);

  // Load time slots whenever the service, day or refresh counter changes.
  // The result is stored with a key, so slots are only shown once they
  // belong to the current selection (no flash of stale or empty data).
  const slotsKey = service ? `${service.id}|${dayIso}|${refreshKey}` : '';

  useEffect(() => {
    if (!service) return;
    let cancelled = false;
    fetchSlots(dayIso, service.id)
      .then((result) => {
        if (!cancelled) {
          setSlotsState({ key: slotsKey, slots: result, error: '' });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setSlotsState({ key: slotsKey, slots: [], error: err.message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dayIso, service, slotsKey]);

  const slotsReady = slotsState.key === slotsKey;
  const slotsLoading = Boolean(service) && !slotsReady;
  const slots = slotsReady ? slotsState.slots : [];
  const slotsError = slotsReady ? slotsState.error : '';

  const selectedDay = days.find((day) => day.iso === dayIso) ?? firstOpenDay;

  const selectService = useCallback((next: Service) => {
    setService(next);
    setTime(null);
    setNotice('');
    setStep('time');
  }, []);

  const selectDay = useCallback((iso: string) => {
    setChosenDay(iso);
    setTime(null);
    setNotice('');
  }, []);

  const chooseTime = useCallback((next: string | null) => {
    setTime(next);
    setNotice('');
  }, []);

  const submit = useCallback(async () => {
    const nextErrors: FieldErrors = {};
    if (name.trim().length < 2) nextErrors.name = 'Please enter your full name.';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) nextErrors.phone = 'Enter a valid phone number.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!service || !time) return;

    setStatus('submitting');
    setNotice('');
    try {
      const booking = await createBooking({
        serviceId: service.id,
        date: dayIso,
        startTime: time,
        customerName: name.trim(),
        customerPhone: phone.trim()
      });
      setReference(`BK-${String(booking.id).padStart(4, '0')}`);
      setStep('success');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Someone else took the slot: refresh the list and go back
        setNotice('Sorry, that time was just taken. Please choose another.');
        setTime(null);
        setRefreshKey((key) => key + 1);
        setStep('time');
      } else {
        setNotice(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.'
        );
      }
    } finally {
      setStatus('idle');
    }
  }, [name, phone, service, time, dayIso]);

  const reset = useCallback(() => {
    setService(null);
    setChosenDay(null);
    setTime(null);
    setName('');
    setPhone('');
    setErrors({});
    setNotice('');
    setReference('');
    setStep('service');
  }, []);

  return {
    studioName: studio?.studioName ?? '',
    services,
    servicesLoading,
    servicesError,
    days,
    slots,
    slotsLoading,
    slotsError,
    step,
    service,
    selectedDay,
    time,
    name,
    phone,
    errors,
    status,
    reference,
    notice,
    setStep,
    setTime: chooseTime,
    setName,
    setPhone,
    selectService,
    selectDay,
    submit,
    reset
  };
}