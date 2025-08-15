import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard';

function NewDashboard() {
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [statsResponse, servicesResponse, activityResponse] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getServices(),
          dashboardService.getActivity()
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (servicesResponse.success) {
          setServices(servicesResponse.data);
        }

        if (activityResponse.success) {
          setActivity(activityResponse.data);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        
        // Fallback to mock data if API fails
        setStats({
          services: { total: 3, active: 3, maintenance: 0, suspended: 0 },
          domains: { total: 5 },
          billing: { monthly_spend: 127.50, currency: 'USD' }
        });
        
        setServices([
          {
            id: 1,
            name: "Web Hosting Pro",
            type: "Shared Hosting",
            status: "active",
            plan: "Pro Plan",
            price: "$29.99/month"
          },
          {
            id: 2,
            name: "Minecraft Server",
            type: "Game Server", 
            status: "active",
            plan: "Standard",
            price: "$19.99/month"
          },
          {
            id: 3,
            name: "VPS Cloud",
            type: "Virtual Server",
            status: "maintenance",
            plan: "VPS-2",
            price: "$79.99/month"
          }
        ]);
        
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'maintenance': return 'text-yellow-500';
      case 'suspended': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">¡Bienvenido a ROKE Industries!</h1>
        <p className="text-xl opacity-90">Tu plataforma de hosting tecnológica y moderna</p>
        {error && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-sm">{error} - Mostrando datos de ejemplo</p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Services */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Servicios Activos</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.services?.active || 3}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Funcionando perfectamente</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5 5L20 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Domains */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dominios</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats?.domains?.total || 5}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Registrados y activos</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Monthly Spend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gasto Mensual</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ${stats?.billing?.monthly_spend || 127.50}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ciclo de facturación actual</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Services */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Servicios Recientes</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gestiona y monitorea tus servicios activos</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {services.slice(0, 3).map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{service.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{service.type} • {service.plan}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{service.price}</p>
                    <p className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                      {service.status === 'active' ? 'Activo' : 
                       service.status === 'maintenance' ? 'Mantenimiento' : 
                       service.status}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    service.status === 'active' ? 'bg-green-500' : 
                    service.status === 'maintenance' ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
          
          {services.length > 3 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
                Ver todos los servicios ({services.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Acciones Rápidas</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tareas comunes y opciones de gestión</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">Contratar VPS</span>
              </div>
            </button>
            <button className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">Registrar Dominio</span>
              </div>
            </button>
            <button className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">Backup Servicios</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewDashboard;

