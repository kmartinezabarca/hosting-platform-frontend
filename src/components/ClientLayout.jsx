import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import NewDashboard from '../pages/client/NewDashboard';
import ClientServicesPage from '../pages/client/ClientServicesPage';
import ClientInvoicesPage from '../pages/client/ClientInvoicesPage';
import ClientTicketsPage from '../pages/client/ClientTicketsPage';
import ClientProfilePage from '../pages/client/ClientProfilePage';

const ClientLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/client/dashboard', icon: '📊' },
    { name: 'My Services', href: '/client/services', icon: '🖥️' },
    { name: 'My Invoices', href: '/client/invoices', icon: '📄' },
    { name: 'My Tickets', href: '/client/tickets', icon: '🎫' },
    { name: 'Profile', href: '/client/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/src/assets/ROKEIndustriesFusionLogo.png" 
                alt="ROKE Industries" 
                className="h-8 w-auto"
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'} Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`inline-flex items-center px-1 pt-1 pb-4 border-b-2 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/dashboard" element={<NewDashboard />} />
          <Route path="/services" element={<ClientServicesPage />} />
          <Route path="/invoices" element={<ClientInvoicesPage />} />
          <Route path="/tickets" element={<ClientTicketsPage />} />
          <Route path="/profile" element={<ClientProfilePage />} />
          <Route path="/" element={<NewDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default ClientLayout;

