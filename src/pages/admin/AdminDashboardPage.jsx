import React, { useState, useEffect } from 'react';
import authService from '../../services/auth';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const token = authService.getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      // Mock data for admin dashboard
      setStats({
        total_users: 1247,
        active_services: 892,
        monthly_revenue: 45678.90,
        pending_tickets: 23,
        server_uptime: 99.9,
        total_domains: 456,
        new_signups_today: 12,
        revenue_growth: 15.3
      });

      setRecentActivity([
        {
          id: 1,
          type: 'user_registration',
          description: 'Nuevo usuario registrado: john.doe@example.com',
          timestamp: '2025-08-15 14:30:00',
          severity: 'info'
        },
        {
          id: 2,
          type: 'service_created',
          description: 'Nuevo servicio VPS creado para usuario ID: 1234',
          timestamp: '2025-08-15 14:15:00',
          severity: 'success'
        },
        {
          id: 3,
          type: 'payment_received',
          description: 'Pago recibido: $299.99 MXN - Factura INV-2025-001',
          timestamp: '2025-08-15 13:45:00',
          severity: 'success'
        },
        {
          id: 4,
          type: 'ticket_created',
          description: 'Nuevo ticket de soporte: "Problema con DNS"',
          timestamp: '2025-08-15 13:20:00',
          severity: 'warning'
        },
        {
          id: 5,
          type: 'server_alert',
          description: 'Alerta de uso de CPU en servidor NODE-03: 85%',
          timestamp: '2025-08-15 12:55:00',
          severity: 'error'
        }
      ]);

      setSystemHealth({
        cpu_usage: 45,
        memory_usage: 67,
        disk_usage: 34,
        network_status: 'healthy',
        database_status: 'healthy',
        backup_status: 'completed',
        last_backup: '2025-08-15 02:00:00'
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getHealthColor = (percentage) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestión completa de la plataforma ROKE Industries
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_users?.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  +{stats.new_signups_today} hoy
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <span className="text-2xl">🖥️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Servicios Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.active_services?.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {stats.total_domains} dominios
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.monthly_revenue?.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  +{stats.revenue_growth}% vs mes anterior
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <span className="text-2xl">🎫</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tickets Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pending_tickets}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {stats.server_uptime}% uptime
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Health */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Estado del Sistema
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">CPU</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {systemHealth.cpu_usage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getHealthColor(systemHealth.cpu_usage)}`}
                    style={{ width: `${systemHealth.cpu_usage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Memoria</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {systemHealth.memory_usage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getHealthColor(systemHealth.memory_usage)}`}
                    style={{ width: `${systemHealth.memory_usage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Disco</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {systemHealth.disk_usage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getHealthColor(systemHealth.disk_usage)}`}
                    style={{ width: `${systemHealth.disk_usage}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Base de Datos</span>
                  </div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    {systemHealth.database_status}
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Red</span>
                  </div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    {systemHealth.network_status}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Último Backup</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(systemHealth.last_backup).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Actividad Reciente
            </h3>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    activity.severity === 'success' ? 'bg-green-500' :
                    activity.severity === 'warning' ? 'bg-yellow-500' :
                    activity.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className={`flex-shrink-0 px-2 py-1 text-xs rounded-full ${getSeverityColor(activity.severity)}`}>
                    {activity.severity === 'success' ? 'Éxito' :
                     activity.severity === 'warning' ? 'Alerta' :
                     activity.severity === 'error' ? 'Error' : 'Info'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Ver toda la actividad →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Acciones Rápidas
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-2xl mb-2">👤</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Crear Usuario</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-2xl mb-2">🖥️</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Nuevo Servicio</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-2xl mb-2">📄</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Generar Factura</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-2xl mb-2">🌐</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Registrar Dominio</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-2xl mb-2">📊</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Ver Reportes</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-2xl mb-2">⚙️</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Configuración</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

