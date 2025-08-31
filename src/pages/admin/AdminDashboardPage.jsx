import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Server, 
  DollarSign, 
  FileText, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import adminDashboardService from '../../services/adminDashboardService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [revenueData, setRevenueData] = useState([]);
  const [serviceStatusData, setServiceStatusData] = useState([]);
  const [ticketPriorityData, setTicketPriorityData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [
        statsResponse,
        revenueChartResponse,
        servicesDistributionResponse,
        ticketsPriorityResponse,
        recentActivityResponse
      ] = await Promise.all([
        adminDashboardService.getStats(selectedPeriod),
        adminDashboardService.getRevenueChart(selectedPeriod),
        adminDashboardService.getServicesDistribution(),
        adminDashboardService.getTicketsPriority(),
        adminDashboardService.getRecentActivity(10)
      ]);
      
      setStats(statsResponse);
      setRevenueData(revenueChartResponse);
      setServiceStatusData(servicesDistributionResponse);
      setTicketPriorityData(ticketsPriorityResponse);
      setRecentActivity(recentActivityResponse);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error to prevent crashes
      setStats({
        users: { total: 0, active: 0, pending: 0, suspended: 0, new_this_month: 0, growth_rate: 0 },
        services: { total: 0, active: 0, suspended: 0, maintenance: 0, cancelled: 0, new_this_month: 0, growth_rate: 0 },
        revenue: { monthly: 0, yearly: 0, currency: 'MXN', growth_rate: 0 },
        invoices: { total: 0, paid: 0, pending: 0, overdue: 0, cancelled: 0, total_amount: 0, pending_amount: 0 },
        tickets: { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, high_priority: 0, urgent: 0, avg_response_time: '0 hours' }
      });
      setRevenueData([]);
      setServiceStatusData([]);
      setTicketPriorityData([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-1">Resumen general de la plataforma</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={selectedPeriod === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedPeriod('week')}
          >
            Semana
          </Button>
          <Button 
            variant={selectedPeriod === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedPeriod('month')}
          >
            Mes
          </Button>
          <Button 
            variant={selectedPeriod === 'year' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedPeriod('year')}
          >
            Año
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users?.total?.toLocaleString() || 0}</div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              {(stats?.users?.growth_rate || 0) > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={(stats?.users?.growth_rate || 0) > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(stats?.users?.growth_rate || 0)}% vs mes anterior
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Activos: {stats?.users?.active || 0}</span>
                <span>Pendientes: {stats?.users?.pending || 0}</span>
              </div>
              <Progress value={stats?.users?.total ? ((stats?.users?.active || 0) / stats?.users?.total) * 100 : 0} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Services Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.services?.active?.toLocaleString() || 0}</div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              {(stats?.services?.growth_rate || 0) > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={(stats?.services?.growth_rate || 0) > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(stats?.services?.growth_rate || 0)}% vs mes anterior
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Total: {stats?.services?.total || 0}</span>
                <span>Suspendidos: {stats?.services?.suspended || 0}</span>
              </div>
              <Progress value={stats?.services?.total ? ((stats?.services?.active || 0) / stats?.services?.total) * 100 : 0} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.revenue?.monthly || 0).toLocaleString()} {stats?.revenue?.currency || 'MXN'}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              {(stats?.revenue?.growth_rate || 0) > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={(stats?.revenue?.growth_rate || 0) > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(stats?.revenue?.growth_rate || 0)}% vs mes anterior
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Anual: ${(stats?.revenue?.yearly || 0).toLocaleString()} {stats?.revenue?.currency || 'MXN'}
            </div>
          </CardContent>
        </Card>

        {/* Tickets Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abiertos</CardTitle>
            <HelpCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tickets?.open || 0}</div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>Tiempo promedio: {stats?.tickets?.avg_response_time || '0 hours'}</span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-red-600">Urgentes: {stats?.tickets?.urgent || 0}</span>
                <span className="text-orange-600">Alta: {stats?.tickets?.high_priority || 0}</span>
              </div>
              <div className="flex space-x-1">
                <div className="flex-1 bg-red-100 h-1 rounded">
                  <div 
                    className="bg-red-500 h-1 rounded" 
                    style={{ width: `${stats?.tickets?.open ? ((stats?.tickets?.urgent || 0) / stats?.tickets?.open) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex-1 bg-orange-100 h-1 rounded">
                  <div 
                    className="bg-orange-500 h-1 rounded" 
                    style={{ width: `${stats?.tickets?.open ? ((stats?.tickets?.high_priority || 0) / stats?.tickets?.open) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos y Crecimiento de Usuarios</CardTitle>
            <CardDescription>Tendencia de los últimos períodos</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
                    name="Ingresos (MXN)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="users" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Usuarios"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Servicios</CardTitle>
            <CardDescription>Estado actual de todos los servicios</CardDescription>
          </CardHeader>
          <CardContent>
            {serviceStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {serviceStatusData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Estado de Facturas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Pagadas</span>
              </div>
              <span className="font-semibold">{stats?.invoices?.paid || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Pendientes</span>
              </div>
              <span className="font-semibold">{stats?.invoices?.pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Vencidas</span>
              </div>
              <span className="font-semibold">{stats?.invoices?.overdue || 0}</span>
            </div>
            <div className="border-t pt-4">
              <div className="text-sm text-gray-600">Monto pendiente</div>
              <div className="text-lg font-bold text-red-600">
                ${(stats?.invoices?.pending_amount || 0).toLocaleString()} MXN
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>Tickets por Prioridad</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticketPriorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ticketPriorityData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="priority" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No hay actividad reciente
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver toda la actividad
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Tareas administrativas comunes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Gestionar Usuarios</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Server className="h-6 w-6" />
              <span className="text-sm">Servicios</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Facturas</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <HelpCircle className="h-6 w-6" />
              <span className="text-sm">Tickets</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;

