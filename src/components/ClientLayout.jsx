import React from 'react';
import { Outlet, Routes, Route } from 'react-router-dom';
import ClientDashboardPage from '../pages/client/ClientDashboardPage';
import ClientServicesPage from '../pages/client/ClientServicesPage';
import ClientInvoicesPage from '../pages/client/ClientInvoicesPage';
import ClientTicketsPage from '../pages/client/ClientTicketsPage';
import { useTheme } from '../context/ThemeContext';
import { Button } from '@/components/ui/button';

function ClientLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Client Area</h1>
          <Button onClick={toggleTheme} variant="outline">
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <nav className="mb-4">
            <ul className="flex space-x-4">
              <li><a href="/client/dashboard" className="text-primary hover:underline">Dashboard</a></li>
              <li><a href="/client/services" className="text-primary hover:underline">My Services</a></li>
              <li><a href="/client/invoices" className="text-primary hover:underline">My Invoices</a></li>
              <li><a href="/client/tickets" className="text-primary hover:underline">My Tickets</a></li>
            </ul>
          </nav>
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="dashboard" element={<ClientDashboardPage />} />
              <Route path="services" element={<ClientServicesPage />} />
              <Route path="invoices" element={<ClientInvoicesPage />} />
              <Route path="tickets" element={<ClientTicketsPage />} />
              <Route path="*" element={<ClientDashboardPage />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ClientLayout;
</main>
    </div>
  );
}

export default ClientLayout;


