import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Loader2Icon, ScissorsIcon } from 'lucide-react';
import { StatusBadge } from '../components/admin/StatusBadge';
import { cancelBooking, lookupBooking, type ManagedBooking } from '../api';
import { formatDayLong, formatDuration } from '../utils/schedule';

const fieldClass =
  'h-11 w-full rounded-2xl bg-canvas px-3.5 text-[14px] text-ink shadow-inset placeholder:text-faint transition-shadow duration-150 ease-expo focus:outline-none focus:ring-2 focus:ring-accent-ring';

const primaryButton =
  'flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[14.5px] font-semibold text-white shadow-lift transition-colors duration-150 ease-expo hover:bg-accent-hover disabled:bg-line disabled:text-faint disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const quietButton =
  'flex h-11 w-full items-center justify-center rounded-2xl text-[14px] font-medium text-muted transition-colors duration-150 ease-expo hover:bg-accent-soft hover:text-ink disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring';

export function ManageBooking() {
  const location = useLocation();
  const startReference =
    (location.state as { reference?: string } | null)?.reference ?? '';

  const [reference, setReference] = useState(startReference);
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState<ManagedBooking | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [justCancelled, setJustCancelled] = useState(false);

  const handleLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (reference.trim() === '' || phone.replace(/\D/g, '').length < 7) {
      setError(
        'Enter your booking reference and the phone number you booked with.'
      );
      return;
    }
    setError('');
    setBusy(true);
    try {
      setBooking(await lookupBooking(reference.trim(), phone.trim()));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not look up that booking.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setError('');
    setBusy(true);
    try {
      const updated = await cancelBooking(reference.trim(), phone.trim());
      setBooking(updated);
      setJustCancelled(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not cancel that booking.'
      );
    } finally {
      setConfirming(false);
      setBusy(false);
    }
  };

  const reset = () => {
    setBooking(null);
    setConfirming(false);
    setJustCancelled(false);
    setError('');
  };

  const contact = booking
    ? booking.studioPhone
      ? `call ${booking.studioName} on ${booking.studioPhone}`
      : `contact ${booking.studioName}`
    : '';

  return (
    <div className="flex min-h-full w-full items-center justify-center bg-canvas px-4 py-12 font-sans text-ink">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white">
            <ScissorsIcon aria-hidden="true" className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-[24px] font-semibold tracking-[-0.02em]">
            Manage your booking
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            {booking
              ? 'Here are the details of your booking.'
              : 'Enter the reference from your confirmation and the phone number you booked with.'}
          </p>
        </div>

        {booking ? (
          <div className="rounded-3xl bg-surface p-6 shadow-soft">
            {justCancelled && (
              <p
                role="status"
                className="mb-4 rounded-2xl bg-accent-soft px-4 py-3 text-[13px] leading-5 text-ink">
                Your booking has been cancelled. The time is free for someone
                else.
              </p>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12.5px] tabular-nums text-faint">
                  {booking.reference}
                </p>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em]">
                  {booking.serviceName}
                </h2>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <dl className="mt-4 space-y-2 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Date</dt>
                <dd className="text-right font-medium">
                  {formatDayLong(booking.dateIso)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Time</dt>
                <dd className="text-right font-medium tabular-nums">
                  {booking.time} to {booking.endTime}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Duration</dt>
                <dd className="text-right font-medium">
                  {formatDuration(booking.durationMinutes)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Name</dt>
                <dd className="text-right font-medium">{booking.customerName}</dd>
              </div>
            </dl>

            {error && (
              <p role="alert" className="mt-4 text-[13px] leading-5 text-danger">
                {error}
              </p>
            )}

            <div className="mt-6 space-y-2">
              {booking.cancelState === 'allowed' && !confirming && (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className={primaryButton}>
                    Cancel booking
                  </button>
                  <p className="text-center text-[12.5px] leading-5 text-faint">
                    Free cancellation until {booking.cancelWindowHours} hours
                    before your appointment.
                  </p>
                </>
              )}

              {booking.cancelState === 'allowed' && confirming && (
                <>
                  <p className="text-center text-[14px] font-medium">
                    Cancel this booking? This can't be undone.
                  </p>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={busy}
                    className={primaryButton}>
                    {busy && (
                      <Loader2Icon
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin"
                      />
                    )}
                    {busy ? 'Cancelling…' : 'Yes, cancel booking'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={busy}
                    className={quietButton}>
                    Keep my booking
                  </button>
                </>
              )}

              {booking.cancelState === 'window' && (
                <p className="text-[13.5px] leading-6 text-muted">
                  Online cancellation closed {booking.cancelWindowHours} hours
                  before the appointment. To change this booking, {contact}.
                </p>
              )}

              {booking.cancelState === 'past' && (
                <p className="text-[13.5px] leading-6 text-muted">
                  This appointment has already passed.
                </p>
              )}

              {booking.cancelState === 'cancelled' && !justCancelled && (
                <p className="text-[13.5px] leading-6 text-muted">
                  This booking was cancelled.
                </p>
              )}

              <button
                type="button"
                onClick={reset}
                disabled={busy}
                className={quietButton}>
                Look up a different booking
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleLookup}
            noValidate
            className="rounded-3xl bg-surface p-6 shadow-soft">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="booking-reference"
                  className="mb-1.5 block text-[13px] font-medium">
                  Booking reference
                </label>
                <input
                  id="booking-reference"
                  autoComplete="off"
                  autoCapitalize="characters"
                  placeholder="BK-0012"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  aria-invalid={Boolean(error)}
                  className={fieldClass} />
              </div>
              <div>
                <label
                  htmlFor="booking-phone"
                  className="mb-1.5 block text-[13px] font-medium">
                  Phone number
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="The number you booked with"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'manage-error' : undefined}
                  className={fieldClass} />
              </div>
            </div>

            {error && (
              <p
                id="manage-error"
                role="alert"
                className="mt-3 text-[13px] leading-5 text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className={`mt-6 ${primaryButton}`}>
              {busy && (
                <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin" />
              )}
              {busy ? 'Looking…' : 'Find booking'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[13px] text-muted">
          <Link
            to="/"
            className="rounded underline decoration-line underline-offset-2 transition-colors duration-150 ease-expo hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
            Back to the booking page
          </Link>
        </p>
      </div>
    </div>
  );
}