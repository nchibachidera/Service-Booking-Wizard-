import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminProvider } from './contexts/AdminContext';
import { RequireAuth } from './components/admin/RequireAuth';
import { Booking } from './pages/Booking';
import { AdminLogin } from './pages/admin/Login';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminAvailability } from './pages/admin/AdminAvailability';
import { AdminSettings } from './pages/admin/AdminSettings';

export function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <Routes>
          <Route path="/" element={<Booking />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/bookings"
            element={
            <RequireAuth>
                <AdminBookings />
              </RequireAuth>
            } />
          
          <Route
            path="/admin/availability"
            element={
            <RequireAuth>
                <AdminAvailability />
              </RequireAuth>
            } />
          
          <Route
            path="/admin/settings"
            element={
            <RequireAuth>
                <AdminSettings />
              </RequireAuth>
            } />
          
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminProvider>
    </BrowserRouter>);

}