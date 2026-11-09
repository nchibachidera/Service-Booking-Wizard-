import React, { useState } from 'react';
import { AdminShell } from '../../components/admin/AdminShell';
import { WeeklyHours } from '../../components/admin/WeeklyHours';
import { BlockedDates } from '../../components/admin/BlockedDates';
import { useAdmin } from '../../contexts/AdminContext';

export function AdminAvailability() {
  const {
    workingDays,
    updateWorkingDay,
    applyToWeekdays,
    blockedDates,
    addBlockedDate,
    removeBlockedDate,
    availabilityLoading,
    availabilityError,
    reloadAvailability,
    hoursStatus,
    hoursError
  } = useAdmin();
  const [notice, setNotice] = useState('');

  const openDays = workingDays.filter((day) => day.isOpen).length;

  const handleAdd = async (dateIso: string, reason: string) => {
    const existing = await addBlockedDate(dateIso, reason);
    setNotice(
      existing > 0
        ? `${existing} ${existing === 1 ? 'booking already exists' : 'bookings already exist'} on that date. They have not been cancelled, so contact those customers or cancel them on the Bookings page.`
        : ''
    );
  };

  const handleRemove = async (id: string) => {
    setNotice('');
    await removeBlockedDate(id);
  };

  const statusLine =
    hoursStatus === 'pending' || hoursStatus === 'saving'
      ? 'Saving…'
      : hoursStatus === 'saved'
        ? 'All changes saved'
        : hoursStatus === 'invalid'
          ? 'A day closes before it opens. Fix the times to save.'
          : '';

  return (
    <AdminShell
      title="Availability"
      description={`Open ${openDays} ${openDays === 1 ? 'day' : 'days'} a week · ${blockedDates.length} upcoming date${blockedDates.length === 1 ? '' : 's'} blocked`}>
      {availabilityLoading ? (
        <div className="rounded-2xl bg-surface px-6 py-14 text-center shadow-soft">
          <p className="text-[14px] text-muted">Loading availability…</p>
        </div>
      ) : availabilityError ? (
        <div className="rounded-2xl bg-surface px-6 py-14 text-center shadow-soft">
          <p role="alert" className="text-[15px] font-semibold">
            Couldn't load your availability
          </p>
          <p className="mt-1 text-[14px] text-muted">{availabilityError}</p>
          <button
            type="button"
            onClick={reloadAvailability}
            className="mt-4 rounded-xl bg-accent px-4 py-2 text-[13.5px] font-semibold text-white transition-colors duration-150 ease-expo hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
            Try again
          </button>
        </div>
      ) : (
        <>
          {notice && (
            <p
              role="status"
              className="mb-4 rounded-2xl bg-accent-soft px-4 py-3 text-[13px] leading-5 text-ink">
              {notice}
            </p>
          )}

          <div className="mb-3 min-h-[18px] text-[12.5px]" aria-live="polite">
            {hoursStatus === 'error' ? (
              <span role="alert" className="text-danger">
                Couldn't save your hours: {hoursError}
              </span>
            ) : (
              <span className="text-faint">{statusLine}</span>
            )}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_352px]">
            <WeeklyHours
              days={workingDays}
              onUpdate={updateWorkingDay}
              onApplyToWeekdays={applyToWeekdays} />

            <BlockedDates
              dates={blockedDates}
              onAdd={handleAdd}
              onRemove={handleRemove} />
          </div>
        </>
      )}
    </AdminShell>
  );
}