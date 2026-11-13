import React, { useEffect, useState } from 'react';
import { AdminShell } from '../../components/admin/AdminShell';
import { useAdmin } from '../../contexts/AdminContext';
import { ApiError, fetchSettings, saveSettings } from '../../api';

const fieldClass =
  'h-10 w-full rounded-xl bg-canvas px-3 text-[13.5px] text-ink shadow-inset placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring';

const PHONE_PATTERN = /^[0-9+()\-\s]{7,30}$/;

interface ToggleRowProps {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ id, label, hint, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-[13.5px] font-medium">
          {label}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-5 text-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={[
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ease-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          checked ? 'bg-accent' : 'bg-line'
        ].join(' ')}>
        <span
          aria-hidden="true"
          className={[
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-expo',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          ].join(' ')} />
      </button>
    </div>
  );
}

export function AdminSettings() {
  const { account, token, signOut, updateAccount } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [name, setName] = useState('');
  const [studio, setStudio] = useState('');
  const [phone, setPhone] = useState('');
  const [leadTime, setLeadTime] = useState('0');
  const [cancelWindow, setCancelWindow] = useState('24');
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load the saved settings from the server
  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setLoading(true);
    setLoadError('');

    fetchSettings(token)
      .then((settings) => {
        if (cancelled) return;
        setName(settings.name);
        setStudio(settings.studioName);
        setPhone(settings.phone);
        setLeadTime(String(settings.minNoticeHours));
        setCancelWindow(String(settings.cancelWindowHours));
        setAutoConfirm(settings.autoConfirm);
        setSmsReminders(settings.smsReminders);
        setDailyDigest(settings.dailyDigest);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          signOut();
          return;
        }
        setLoadError(
          err instanceof Error ? err.message : 'Could not load your settings.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey, signOut]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    if (name.trim().length < 2) {
      setError('Enter your name.');
      return;
    }
    if (studio.trim().length < 2) {
      setError('Enter a studio name.');
      return;
    }
    const trimmedPhone = phone.trim();
    if (trimmedPhone !== '' && !PHONE_PATTERN.test(trimmedPhone)) {
      setError('Enter a valid phone number.');
      return;
    }

    setError('');
    setSaved(false);
    setSaving(true);
    try {
      const result = await saveSettings(token, {
        name: name.trim(),
        studioName: studio.trim(),
        phone: trimmedPhone,
        minNoticeHours: Number(leadTime),
        cancelWindowHours: Number(cancelWindow),
        autoConfirm,
        smsReminders,
        dailyDigest
      });
      // Show exactly what the server saved
      setName(result.name);
      setStudio(result.studioName);
      setPhone(result.phone);
      updateAccount({ name: result.name, studio: result.studioName });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
        return;
      }
      setError(
        err instanceof Error ? err.message : 'Could not save your settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Settings"
      description="Studio details and the rules that govern new bookings.">
      {loading ? (
        <div className="rounded-2xl bg-surface px-6 py-14 text-center shadow-soft">
          <p className="text-[14px] text-muted">Loading settings…</p>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl bg-surface px-6 py-14 text-center shadow-soft">
          <p role="alert" className="text-[15px] font-semibold">
            Couldn't load your settings
          </p>
          <p className="mt-1 text-[14px] text-muted">{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadKey((count) => count + 1)}
            className="mt-4 rounded-xl bg-accent px-4 py-2 text-[13.5px] font-semibold text-white transition-colors duration-150 ease-expo hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
            Try again
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_352px]">
          <div className="space-y-5">
            <section
              aria-labelledby="studio-heading"
              className="overflow-hidden rounded-2xl bg-surface shadow-soft">
              <h2
                id="studio-heading"
                className="border-b border-line/70 px-5 py-3.5 text-[15px] font-semibold">
                Studio profile
              </h2>
              <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="provider-name"
                    className="mb-1.5 block text-[13px] font-medium">
                    Your name
                  </label>
                  <input
                    id="provider-name"
                    maxLength={100}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={fieldClass} />
                </div>
                <div>
                  <label
                    htmlFor="studio-name"
                    className="mb-1.5 block text-[13px] font-medium">
                    Studio name
                  </label>
                  <input
                    id="studio-name"
                    maxLength={100}
                    value={studio}
                    onChange={(event) => setStudio(event.target.value)}
                    className={fieldClass} />
                </div>
                <div>
                  <label
                    htmlFor="studio-email"
                    className="mb-1.5 block text-[13px] font-medium">
                    Email
                  </label>
                  <input
                    id="studio-email"
                    type="email"
                    value={account?.email ?? ''}
                    readOnly
                    className={`${fieldClass} text-muted`} />
                </div>
                <div>
                  <label
                    htmlFor="studio-phone"
                    className="mb-1.5 block text-[13px] font-medium">
                    Studio phone
                  </label>
                  <input
                    id="studio-phone"
                    type="tel"
                    maxLength={30}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className={`${fieldClass} tabular-nums`} />
                </div>
              </div>
            </section>

            <section
              aria-labelledby="rules-heading"
              className="overflow-hidden rounded-2xl bg-surface shadow-soft">
              <h2
                id="rules-heading"
                className="border-b border-line/70 px-5 py-3.5 text-[15px] font-semibold">
                Booking rules
              </h2>
              <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="lead-time"
                    className="mb-1.5 block text-[13px] font-medium">
                    Minimum notice
                  </label>
                  <select
                    id="lead-time"
                    value={leadTime}
                    onChange={(event) => setLeadTime(event.target.value)}
                    className={fieldClass}>
                    <option value="0">No minimum</option>
                    <option value="2">2 hours</option>
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="cancel-window"
                    className="mb-1.5 block text-[13px] font-medium">
                    Free cancellation up to
                  </label>
                  <select
                    id="cancel-window"
                    value={cancelWindow}
                    onChange={(event) => setCancelWindow(event.target.value)}
                    className={fieldClass}>
                    <option value="12">12 hours before</option>
                    <option value="24">24 hours before</option>
                    <option value="48">48 hours before</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-line/60 px-5 py-1">
                <ToggleRow
                  id="auto-confirm"
                  label="Auto-confirm new bookings"
                  hint="Skip the pending step when the requested slot is free."
                  checked={autoConfirm}
                  onChange={setAutoConfirm} />
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section
              aria-labelledby="notify-heading"
              className="overflow-hidden rounded-2xl bg-surface shadow-soft">
              <h2
                id="notify-heading"
                className="border-b border-line/70 px-5 py-3.5 text-[15px] font-semibold">
                Notifications
              </h2>
              <div className="divide-y divide-line/60 px-5 py-1">
                <ToggleRow
                  id="sms"
                  label="Customer SMS reminders"
                  hint="Sent the day before each appointment."
                  checked={smsReminders}
                  onChange={setSmsReminders} />
                <ToggleRow
                  id="digest"
                  label="Daily schedule digest"
                  hint="Emailed to you at 7:00 every morning."
                  checked={dailyDigest}
                  onChange={setDailyDigest} />
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-xl bg-accent px-4 text-[13.5px] font-semibold text-white shadow-lift transition-colors duration-150 ease-expo hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {saved && (
                <p role="status" className="text-[13px] font-medium text-accent">
                  Settings saved
                </p>
              )}
              {error && (
                <p role="alert" className="text-[13px] text-danger">
                  {error}
                </p>
              )}
            </div>
          </div>
        </form>
      )}
    </AdminShell>
  );
}