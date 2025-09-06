import React, { useState } from 'react';
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
  ArrowDownRight,
  Zap,
  Shield,
  Globe,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAdminStats } from '../../hooks/useAdminDashboard';

const AdminDashboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { data: stats, isLoading, error, refetch } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Error al cargar el dashboard</h3>
            <p className="text-sm text-muted-foreground">No se pudieron obtener las estadísticas</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-MX').format(number || 0);
  };

  const getGrowthColor = (rate) => {
    if (rate > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (rate < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const getGrowthIcon = (rate) => {
    if (rate > 0) return <TrendingUp className="h-3 w-3" />;
    if (rate < 0) return <TrendingDown className="h-3 w-3" />;
    return <Activity className="h-3 w-3" />;
  };

  return (
    <div className="space-y-8 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground text-lg">
            Panel de control y métricas de la plataforma
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
            <Button 
              variant={selectedPeriod === 'week' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSelectedPeriod('week')}
              className="text-xs"
            >
              7D
            </Button>
            <Button 
              variant={selectedPeriod === 'month' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSelectedPeriod('month')}
              className="text-xs"
            >
              30D
            </Button>
            <Button 
              variant={selectedPeriod === 'year' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSelectedPeriod('year')}
              className="text-xs"
            >
              1A
            </Button>
          </div>
          
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Users Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Usuarios Totales
            </CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {formatNumber(stats?.data?.users?.total)}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 ${getGrowthColor(stats?.data?.users?.growth_rate)}`}>
                {getGrowthIcon(stats?.data?.users?.growth_rate)}
                <span className="text-sm font-medium">
                  {Math.abs(stats?.data?.users?.growth_rate || 0)}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground">vs mes anterior</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
                <span>Activos: {formatNumber(stats?.data?.users?.active)}</span>
                <span>Pendientes: {formatNumber(stats?.data?.users?.pending)}</span>
              </div>
              <Progress 
                value={stats?.data?.users?.total ? ((stats?.data?.users?.active || 0) / stats?.data?.users?.total) * 100 : 0} 
                className="h-2 bg-blue-200 dark:bg-blue-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Services Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              Servicios Activos
            </CardTitle>
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Server className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatNumber(stats?.data?.services?.active)}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 ${getGrowthColor(stats?.data?.services?.growth_rate)}`}>
                {getGrowthIcon(stats?.data?.services?.growth_rate)}
                <span className="text-sm font-medium">
                  {Math.abs(stats?.data?.services?.growth_rate || 0)}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground">vs mes anterior</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-300">
                <span>Total: {formatNumber(stats?.data?.services?.total)}</span>
                <span>Suspendidos: {formatNumber(stats?.data?.services?.suspended)}</span>
              </div>
              <Progress 
                value={stats?.data?.services?.total ? ((stats?.data?.services?.active || 0) / stats?.data?.services?.total) * 100 : 0} 
                className="h-2 bg-emerald-200 dark:bg-emerald-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Ingresos Mensuales
            </CardTitle>
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              {formatCurrency(stats?.data?.revenue?.monthly)}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 ${getGrowthColor(stats?.data?.revenue?.growth_rate)}`}>
                {getGrowthIcon(stats?.data?.revenue?.growth_rate)}
                <span className="text-sm font-medium">
                  {Math.abs(stats?.data?.revenue?.growth_rate || 0)}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground">vs mes anterior</span>
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300">
              Anual: {formatCurrency(stats?.data?.revenue?.yearly)}
            </div>
          </CardContent>
        </Card>

        {/* Tickets Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Tickets Abiertos
            </CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {formatNumber(stats?.data?.tickets?.open)}
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-purple-700 dark:text-purple-300">
                Respuesta: {stats?.data?.tickets?.avg_response_time || '0 hours'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-purple-700 dark:text-purple-300">
                <span className="text-red-600 dark:text-red-400">Urgentes: {formatNumber(stats?.data?.tickets?.urgent)}</span>
                <span className="text-orange-600 dark:text-orange-400">Alta: {formatNumber(stats?.data?.tickets?.high_priority)}</span>
              </div>
              <div className="flex space-x-1">
                <div className="flex-1 bg-red-200 dark:bg-red-800 h-2 rounded">
                  <div 
                    className="bg-red-500 h-2 rounded transition-all duration-300" 
                    style={{ width: `${stats?.data?.tickets?.open ? ((stats?.data?.tickets?.urgent || 0) / stats?.data?.tickets?.open) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex-1 bg-orange-200 dark:bg-orange-800 h-2 rounded">
                  <div 
                    className="bg-orange-500 h-2 rounded transition-all duration-300" 
                    style={{ width: `${stats?.data?.tickets?.open ? ((stats?.data?.tickets?.high_priority || 0) / stats?.data?.tickets?.open) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Stats */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span>Estado de Facturas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Pagadas</span>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  {formatNumber(stats?.data?.invoices?.paid)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Pendientes</span>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  {formatNumber(stats?.data?.invoices?.pending)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Vencidas</span>
                </div>
                <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {formatNumber(stats?.data?.invoices?.overdue)}
                </Badge>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="text-sm text-muted-foreground">Monto pendiente de cobro</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats?.data?.invoices?.pending_amount)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span>Actividad Reciente</span>
            </CardTitle>
            <CardDescription>
              Últimas acciones en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.data?.recent_activity?.slice(0, 6).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-1.5 bg-primary/10 rounded-full mt-0.5">
                    {activity.type === 'user_registered' && <Users className="h-3 w-3 text-blue-600" />}
                    {activity.type === 'service_created' && <Server className="h-3 w-3 text-emerald-600" />}
                    {activity.type === 'ticket_created' && <HelpCircle className="h-3 w-3 text-purple-600" />}
                    {!['user_registered', 'service_created', 'ticket_created'].includes(activity.type) && 
                      <Activity className="h-3 w-3 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span>Acciones Rápidas</span>
          </CardTitle>
          <CardDescription>
            Accesos directos a funciones administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2 hover:bg-primary/5">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Gestionar Usuarios</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2 hover:bg-primary/5">
              <Server className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Ver Servicios</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2 hover:bg-primary/5">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Facturas</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2 hover:bg-primary/5">
              <HelpCircle className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Tickets</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;

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

