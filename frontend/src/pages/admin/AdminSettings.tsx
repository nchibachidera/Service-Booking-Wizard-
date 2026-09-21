import React, { useState } from 'react';
import { AdminShell } from '../../components/admin/AdminShell';
import { useAdmin } from '../../contexts/AdminContext';

const fieldClass =
'h-10 w-full rounded-xl bg-canvas px-3 text-[13.5px] text-ink shadow-inset placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring';

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
        checked ? 'bg-accent' : 'bg-line'].
        join(' ')}>
        
        <span
          aria-hidden="true"
          className={[
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-expo',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'].
          join(' ')} />
        
      </button>
    </div>);

}

export function AdminSettings() {
  const { account } = useAdmin();
  const [name, setName] = useState(account?.name ?? '');
  const [studio, setStudio] = useState(account?.studio ?? '');
  const [phone, setPhone] = useState('(415) 555 0100');
  const [leadTime, setLeadTime] = useState('2');
  const [cancelWindow, setCancelWindow] = useState('24');
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [smsReminders, setSmsReminders] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <AdminShell
      title="Settings"
      description="Studio details and the rules that govern new bookings.">
      
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

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="h-10 rounded-xl bg-accent px-4 text-[13.5px] font-semibold text-white shadow-lift transition-colors duration-150 ease-expo hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas">
              
              Save changes
            </button>
            {saved &&
            <p role="status" className="text-[13px] font-medium text-accent">
                Settings saved
              </p>
            }
          </div>
        </div>
      </form>
    </AdminShell>);

}