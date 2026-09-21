import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2Icon, ScissorsIcon } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const fieldClass =
'h-11 w-full rounded-2xl bg-canvas px-3.5 text-[14px] text-ink shadow-inset placeholder:text-faint transition-shadow duration-150 ease-expo focus:outline-none focus:ring-2 focus:ring-accent-ring';

export function AdminLogin() {
  const { account, signIn } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('rae@maisonaster.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (account) return <Navigate to="/admin/bookings" replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    signIn(email);
    navigate('/admin/bookings', { replace: true });
  };

  return (
    <div className="flex min-h-full w-full items-center justify-center bg-canvas px-4 py-12 font-sans text-ink">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white">
            <ScissorsIcon aria-hidden="true" className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-[24px] font-semibold tracking-[-0.02em]">
            Provider sign in
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            Manage bookings and availability for Maison Aster.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl bg-surface p-6 shadow-soft">
          
          <div className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block text-[13px] font-medium">
                
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(error)}
                className={fieldClass} />
              
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-[13px] font-medium">
                
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'admin-error' : undefined}
                className={fieldClass} />
              
            </div>
          </div>

          {error &&
          <p
            id="admin-error"
            role="alert"
            className="mt-3 text-[13px] text-danger">
            
              {error}
            </p>
          }

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[14.5px] font-semibold text-white shadow-lift transition-colors duration-150 ease-expo hover:bg-accent-hover disabled:bg-line disabled:text-faint disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
            
            {submitting &&
            <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin" />
            }
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="mt-4 text-center text-[12.5px] text-faint">
            Demo console — any password of 4+ characters works.
          </p>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted">
          <Link
            to="/"
            className="rounded underline decoration-line underline-offset-2 transition-colors duration-150 ease-expo hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
            
            Back to the booking page
          </Link>
        </p>
      </div>
    </div>);

}