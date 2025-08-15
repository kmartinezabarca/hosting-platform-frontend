import React from 'react';
import { Outlet, Routes, Route } from 'react-router-dom';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminServicesPage from '../pages/admin/AdminServicesPage';
import AdminInvoicesPage from '../pages/admin/AdminInvoicesPage';
import AdminTicketsPage from '../pages/admin/AdminTicketsPage';
import { useTheme } from '../context/ThemeContext';
import { Button } from '@/components/ui/button';

function AdminLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={toggleTheme} variant="outline">
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <nav className="mb-4">
            <ul className="flex space-x-4">
              <li><a href="/admin/dashboard" className="text-primary hover:underline">Dashboard</a></li>
              <li><a href="/admin/users" className="text-primary hover:underline">Users</a></li>
              <li><a href="/admin/services" className="text-primary hover:underline">Services</a></li>
              <li><a href="/admin/invoices" className="text-primary hover:underline">Invoices</a></li>
              <li><a href="/admin/tickets" className="text-primary hover:underline">Tickets</a></li>
            </ul>
          </nav>
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="invoices" element={<AdminInvoicesPage />} />
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route path="*" element={<AdminDashboardPage />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;


