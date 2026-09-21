import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClockIcon,
  LogOutIcon,
  MenuIcon,
  ScissorsIcon,
  SettingsIcon,
  XIcon } from
'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const NAV = [
{ to: '/admin/bookings', label: 'Bookings', Icon: CalendarDaysIcon },
{ to: '/admin/availability', label: 'Availability', Icon: ClockIcon },
{ to: '/admin/settings', label: 'Settings', Icon: SettingsIcon }];


interface AdminShellProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminShell({
  title,
  description,
  actions,
  children
}: AdminShellProps) {
  const { account, signOut, stats } = useAdmin();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  const navList =
  <nav aria-label="Admin sections" className="space-y-1">
      {NAV.map(({ to, label, Icon }) => {
      const isActive = location.pathname === to;
      return (
        <NavLink
          key={to}
          to={to}
          onClick={() => setNavOpen(false)}
          className={[
          'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium transition-colors duration-150 ease-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring',
          isActive ?
          'bg-accent text-white' :
          'text-muted hover:bg-accent-soft/70 hover:text-ink'].
          join(' ')}>
          
            <Icon aria-hidden="true" className="h-4 w-4" />
            {label}
            {label === 'Bookings' && stats.pending > 0 &&
          <span
            className={[
            'ml-auto rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
            isActive ? 'bg-white/20 text-white' : 'bg-warn-soft text-warn'].
            join(' ')}>
            
                {stats.pending}
              </span>
          }
          </NavLink>);

    })}
    </nav>;


  return (
    <div className="min-h-full w-full bg-canvas font-sans text-ink">
      <div className="mx-auto flex min-h-full w-full max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col justify-between border-r border-line/70 px-5 py-6 md:flex">
          <div>
            <div className="flex items-center gap-2.5 px-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white">
                <ScissorsIcon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.01em]">
                Maison Aster
              </span>
            </div>
            <p className="mb-6 mt-1 px-1 text-[12px] text-faint">
              Provider console
            </p>
            {navList}
          </div>

          <div className="rounded-2xl bg-surface p-3 shadow-soft">
            <p className="truncate text-[13px] font-semibold">
              {account?.name}
            </p>
            <p className="truncate text-[12px] text-muted">{account?.email}</p>
            <button
              type="button"
              onClick={signOut}
              className="mt-2.5 flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-[13px] font-medium text-muted transition-colors duration-150 ease-expo hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
              
              <LogOutIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line/70 bg-canvas/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
                <ScissorsIcon aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <span className="text-[14px] font-semibold">Maison Aster</span>
            </div>
            <button
              type="button"
              onClick={() => setNavOpen((open) => !open)}
              aria-expanded={navOpen}
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-ink shadow-soft transition-colors duration-150 ease-expo hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
              
              {navOpen ?
              <XIcon className="h-4 w-4" /> :

              <MenuIcon className="h-4 w-4" />
              }
            </button>
          </div>

          {navOpen &&
          <div className="border-b border-line/70 bg-surface px-4 py-3 md:hidden">
              {navList}
              <button
              type="button"
              onClick={signOut}
              className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-medium text-muted transition-colors duration-150 ease-expo hover:text-ink">
              
                <LogOutIcon aria-hidden="true" className="h-4 w-4" />
                Sign out
              </button>
            </div>
          }

          <main className="px-4 pb-16 pt-6 sm:px-6 lg:px-9 lg:pt-9">
            <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] lg:text-[28px]">
                  {title}
                </h1>
                <p className="mt-1.5 text-[14px] leading-6 text-muted">
                  {description}
                </p>
              </div>
              {actions}
            </header>
            {children}
          </main>
        </div>
      </div>
    </div>);

}