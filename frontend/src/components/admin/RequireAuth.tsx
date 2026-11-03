import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { account, loading } = useAdmin();

  if (loading) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-canvas text-muted">
        <Loader2Icon
          aria-label="Checking your session"
          className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!account) return <Navigate to="/admin/login" replace />;
  return children;
}