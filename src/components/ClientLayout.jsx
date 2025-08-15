import React from 'react';
import { Outlet, Routes, Route } from 'react-router-dom';
import ClientDashboardPage from '../pages/client/ClientDashboardPage';
import ClientServicesPage from '../pages/client/ClientServicesPage';
import ClientInvoicesPage from '../pages/client/ClientInvoicesPage';
import ClientTicketsPage from '../pages/client/ClientTicketsPage';

function ClientLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Area</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Replace with actual client navigation */}
          <nav className="mb-4">
            <ul className="flex space-x-4">
              <li><a href="/client/dashboard" className="text-blue-600 hover:text-blue-800">Dashboard</a></li>
              <li><a href="/client/services" className="text-blue-600 hover:text-blue-800">My Services</a></li>
              <li><a href="/client/invoices" className="text-blue-600 hover:text-blue-800">My Invoices</a></li>
              <li><a href="/client/tickets" className="text-blue-600 hover:text-blue-800">My Tickets</a></li>
            </ul>
          </nav>
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="dashboard" element={<ClientDashboardPage />} />
              <Route path="services" element={<ClientServicesPage />} />
              <Route path="invoices" element={<ClientInvoicesPage />} />
              <Route path="tickets" element={<ClientTicketsPage />} />
              <Route path="*" element={<ClientDashboardPage />} /> {/* Default client route */}
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ClientLayout;


