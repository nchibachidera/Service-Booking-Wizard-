import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

export function RequireAuth({ children }: {children: React.ReactElement;}) {
  const { account } = useAdmin();
  if (!account) return <Navigate to="/admin/login" replace />;
  return children;
}