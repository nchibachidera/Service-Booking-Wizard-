import React from 'react';
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
    removeBlockedDate
  } = useAdmin();

  const openDays = workingDays.filter((day) => day.isOpen).length;

  return (
    <AdminShell
      title="Availability"
      description={`Open ${openDays} ${openDays === 1 ? 'day' : 'days'} a week · ${blockedDates.length} upcoming date${blockedDates.length === 1 ? '' : 's'} blocked`}>
      
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_352px]">
        <WeeklyHours
          days={workingDays}
          onUpdate={updateWorkingDay}
          onApplyToWeekdays={applyToWeekdays} />
        
        <BlockedDates
          dates={blockedDates}
          onAdd={addBlockedDate}
          onRemove={removeBlockedDate} />
        
      </div>
    </AdminShell>);

}