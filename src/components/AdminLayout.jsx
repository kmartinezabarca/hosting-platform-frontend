import React from 'react';
import { Outlet, Routes, Route } from 'react-router-dom';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminServicesPage from '../pages/admin/AdminServicesPage';
import AdminInvoicesPage from '../pages/admin/AdminInvoicesPage';
import AdminTicketsPage from '../pages/admin/AdminTicketsPage';

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Replace with actual admin navigation */}
          <nav className="mb-4">
            <ul className="flex space-x-4">
              <li><a href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">Dashboard</a></li>
              <li><a href="/admin/users" className="text-blue-600 hover:text-blue-800">Users</a></li>
              <li><a href="/admin/services" className="text-blue-600 hover:text-blue-800">Services</a></li>
              <li><a href="/admin/invoices" className="text-blue-600 hover:text-blue-800">Invoices</a></li>
              <li><a href="/admin/tickets" className="text-blue-600 hover:text-blue-800">Tickets</a></li>
            </ul>
          </nav>
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="invoices" element={<AdminInvoicesPage />} />
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route path="*" element={<AdminDashboardPage />} /> {/* Default admin route */}
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;


