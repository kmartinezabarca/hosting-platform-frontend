// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
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
  RefreshCw,
  Zap,
  ArrowRight,
  Ticket,
  Receipt,
  Cloud,
  Calendar,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminDashboard';
import { useNavigate } from 'react-router-dom';

const SimpleLineChart = ({ data, color = 'hsl(221.2 83.2% 53.3%)', height = 120 }) => {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');
  
  const areaPoints = `0,100 ${points} 100,100`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#gradient-${color.replace(/[^a-zA-Z0-9]/g, '')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value - min) / range) * 80 - 10;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill={color}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
};

const StatCard = ({ icon: Icon, label, value, subValue, trend, color, iconBg, isLoading }) => {
  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    down: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    neutral: { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted' }
  };
  
  const config = trend > 0 ? trendConfig.up : trend < 0 ? trendConfig.down : trendConfig.neutral;
  const TrendIcon = config.icon;
  
  if (isLoading) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`bg-gradient-to-br ${color} border-border/50`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium opacity-80">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subValue && (
              <p className="text-xs opacity-70">{subValue}</p>
            )}
            {trend !== undefined && trend !== null && (
              <div className={`flex items-center gap-1 mt-1 ${config.color}`}>
                <TrendIcon className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
                <span className="text-xs opacity-70">vs mes</span>
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MiniBarChart = ({ data, color = 'bg-primary' }) => {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data.map(d => d.value));
  
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className={`w-full rounded-t ${color} transition-all`}
            style={{ height: `${(d.value / max) * 100}%` }}
            title={d.label}
          />
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const AdminDashboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { data: stats, isLoading, isFetching, isInitialLoading, error, refetch } = useAdminStats() as any;
  const navigate = useNavigate();

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatNumber = (n) => new Intl.NumberFormat('es-MX').format(n || 0);

  const quickActions = [
    { icon: Users, label: 'Usuarios', path: '/admin/users', color: 'from-indigo-50 to-indigo-50/30' },
    { icon: Cloud, label: 'Servicios', path: '/admin/services', color: 'from-cyan-50 to-cyan-50/30' },
    { icon: Ticket, label: 'Tickets', path: '/admin/tickets', color: 'from-amber-50 to-amber-50/30' },
    { icon: Receipt, label: 'Facturas', path: '/admin/invoices', color: 'from-emerald-50 to-emerald-50/30' },
  ];

  // Generate mock trend data for charts (in production, this would come from the API)
  const revenueChartData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const base = stats?.data?.revenue?.monthly || 100000;
    return months.map((m, i) => ({
      label: m,
      value: base * (0.6 + Math.random() * 0.4 + (i * 0.05))
    }));
  }, [stats]);

  const usersChartData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const base = stats?.data?.users?.total || 100;
    return months.map((m, i) => ({
      label: m,
      value: base * (0.7 + Math.random() * 0.3 + (i * 0.03))
    }));
  }, [stats]);

  const ticketsByStatus = useMemo(() => {
    const open = stats?.data?.tickets?.open || 0;
    const urgent = stats?.data?.tickets?.urgent || 0;
    const resolved = stats?.data?.tickets?.resolved || 0;
    const total = open + urgent + resolved || 1;
    return [
      { label: 'Abiertos', value: open, percent: (open / total) * 100, color: 'bg-blue-500' },
      { label: 'Urgentes', value: urgent, percent: (urgent / total) * 100, color: 'bg-red-500' },
      { label: 'Resueltos', value: resolved, percent: (resolved / total) * 100, color: 'bg-emerald-500' },
    ];
  }, [stats]);

  if (isInitialLoading) {
    return (
      <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="bg-card border-border/50">
              <CardHeader className="pb-2 px-4 pt-4">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Skeleton className="h-[120px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-card border-border/50">
              <CardHeader className="pb-3 px-4 pt-4">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
          <div>
            <h3 className="font-medium">Error al cargar</h3>
            <p className="text-sm text-muted-foreground">No se pudieron obtener las estadísticas</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resumen de la plataforma • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/50 rounded-lg p-1">
            <Button 
              variant={selectedPeriod === 'week' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setSelectedPeriod('week')} 
              className={`h-7 text-xs font-medium ${selectedPeriod === 'week' ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
            >
              7D
            </Button>
            <Button 
              variant={selectedPeriod === 'month' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setSelectedPeriod('month')} 
              className={`h-7 text-xs font-medium ${selectedPeriod === 'month' ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
            >
              30D
            </Button>
            <Button 
              variant={selectedPeriod === 'year' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setSelectedPeriod('year')} 
              className={`h-7 text-xs font-medium ${selectedPeriod === 'year' ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
            >
              1A
            </Button>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => refetch()} variant="outline" size="sm" className="text-foreground">
                <RefreshCw className={`h-4 w-4 text-foreground ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Actualizar datos</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Usuarios Totales"
          value={formatNumber(stats?.data?.users?.total)}
          subValue={`Activos: ${formatNumber(stats?.data?.users?.active || 0)}`}
          trend={stats?.data?.users?.growth_rate}
          color="from-indigo-50/80 to-indigo-50/30 dark:from-indigo-950/40 dark:to-indigo-950/20"
          iconBg="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
          isLoading={isFetching}
        />
        <StatCard
          icon={Server}
          label="Servicios Activos"
          value={formatNumber(stats?.data?.services?.active)}
          subValue={`Total: ${formatNumber(stats?.data?.services?.total)}`}
          trend={stats?.data?.services?.growth_rate}
          color="from-cyan-50/80 to-cyan-50/30 dark:from-cyan-950/40 dark:to-cyan-950/20"
          iconBg="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
          isLoading={isFetching}
        />
        <StatCard
          icon={DollarSign}
          label="Ingresos Mensuales"
          value={formatCurrency(stats?.data?.revenue?.monthly)}
          subValue={`Anual: ${formatCurrency(stats?.data?.revenue?.yearly)}`}
          trend={stats?.data?.revenue?.growth_rate}
          color="from-violet-50/80 to-violet-50/30 dark:from-violet-950/40 dark:to-violet-950/20"
          iconBg="bg-violet-500/15 text-violet-600 dark:text-violet-400"
          isLoading={isFetching}
        />
        <StatCard
          icon={HelpCircle}
          label="Tickets Abiertos"
          value={formatNumber(stats?.data?.tickets?.open)}
          subValue={`${formatNumber(stats?.data?.tickets?.urgent)} urgentes`}
          trend={stats?.data?.tickets?.growth_rate}
          color="from-blue-50/80 to-blue-50/30 dark:from-blue-950/40 dark:to-blue-950/20"
          iconBg="bg-blue-500/15 text-blue-600 dark:text-blue-400"
          isLoading={isFetching}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-violet-600" />
                Ingresos
              </CardTitle>
              <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/20">
                {selectedPeriod === 'week' ? '7 días' : selectedPeriod === 'month' ? '30 días' : '1 año'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isFetching ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-[120px] w-full" />
                <div className="flex justify-between">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-8" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold">{formatCurrency(stats?.data?.revenue?.monthly)}</span>
                  {stats?.data?.revenue?.growth_rate > 0 && (
                    <span className="flex items-center text-xs text-emerald-600">
                      <ArrowUpRight className="h-3 w-3" />
                      +{stats.data.revenue.growth_rate}%
                    </span>
                  )}
                </div>
                <SimpleLineChart data={revenueChartData} color="hsl(262.1 83.3% 57.8%)" height={120} />
                <div className="flex justify-between mt-2">
                  {revenueChartData.map((d, i) => (
                    <span key={i} className="text-xs text-muted-foreground">{d.label}</span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Users Chart */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Usuarios
              </CardTitle>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                {selectedPeriod === 'week' ? '7 días' : selectedPeriod === 'month' ? '30 días' : '1 año'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isFetching ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-[120px] w-full" />
                <div className="flex justify-between">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-8" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold">{formatNumber(stats?.data?.users?.total)}</span>
                  {stats?.data?.users?.growth_rate > 0 && (
                    <span className="flex items-center text-xs text-emerald-600">
                      <ArrowUpRight className="h-3 w-3" />
                      +{stats.data.users.growth_rate}%
                    </span>
                  )}
                </div>
                <SimpleLineChart data={usersChartData} color="hsl(221.2 83.2% 53.3%)" height={120} />
                <div className="flex justify-between mt-2">
                  {usersChartData.map((d, i) => (
                    <span key={i} className="text-xs text-muted-foreground">{d.label}</span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Invoice Stats */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Facturas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            {isFetching ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium">Pagadas</span>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {formatNumber(stats?.data?.invoices?.paid)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">Pendientes</span>
                  </div>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    {formatNumber(stats?.data?.invoices?.pending)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Vencidas</span>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                    {formatNumber(stats?.data?.invoices?.overdue)}
                  </Badge>
                </div>
                
                {/* Invoice Summary */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Total pendiente</span>
                    <span className="font-semibold">{formatCurrency(stats?.data?.invoices?.total_pending)}</span>
                  </div>
                  <Progress 
                    value={stats?.data?.invoices?.paid_percent || 0} 
                    className="h-2 bg-muted [&>div]:bg-emerald-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.data?.invoices?.paid_percent || 0}% pagadas
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tickets Distribution */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-600" />
              Tickets por Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isFetching ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {ticketsByStatus.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                      <Progress value={item.percent} className={`h-2 [&>div]:${item.color}`} />
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t flex justify-between text-sm">
                  <span className="text-muted-foreground">Tiempo avg. respuesta</span>
                  <span className="font-medium">{stats?.data?.tickets?.avg_response_time || '2.5h'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border/50 lg:col-span-1">
          <CardHeader className="pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Actividad Reciente
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 text-muted-foreground"
                onClick={() => navigate('/admin/activity')}
              >
                Ver todo <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isFetching ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.data?.recent_activity?.length ? (
              <div className="space-y-1">
                {stats.data.recent_activity.slice(0, 5).map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="p-1.5 bg-primary/10 rounded-md mt-0.5 shrink-0">
                      {activity.type === 'user_registered' && <Users className="h-3.5 w-3.5 text-indigo-600" />}
                      {activity.type === 'service_created' && <Server className="h-3.5 w-3.5 text-emerald-600" />}
                      {activity.type === 'ticket_created' && <HelpCircle className="h-3.5 w-3.5 text-blue-600" />}
                      {activity.type === 'payment_received' && <DollarSign className="h-3.5 w-3.5 text-violet-600" />}
                      {!['user_registered', 'service_created', 'ticket_created', 'payment_received'].includes(activity.type) && <Activity className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Usuarios */}
            <button
              onClick={() => navigate('/admin/users')}
              className="group relative flex flex-col items-center p-4 rounded-xl border border-border bg-gradient-to-br from-indigo-50/50 to-indigo-50/20 hover:from-indigo-100/80 hover:to-indigo-50/50 hover:border-indigo-200 dark:from-indigo-950/30 dark:to-indigo-950/10 dark:hover:from-indigo-950/50 dark:hover:to-indigo-950/30 dark:border-indigo-800/30 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5"
            >
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/70 transition-colors mb-3">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-foreground">Usuarios</span>
              <span className="text-xs text-muted-foreground mt-0.5">Gestionar</span>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-indigo-400" />
              </div>
            </button>

            {/* Servicios */}
            <button
              onClick={() => navigate('/admin/services')}
              className="group relative flex flex-col items-center p-4 rounded-xl border border-border bg-gradient-to-br from-cyan-50/50 to-cyan-50/20 hover:from-cyan-100/80 hover:to-cyan-50/50 hover:border-cyan-200 dark:from-cyan-950/30 dark:to-cyan-950/10 dark:hover:from-cyan-950/50 dark:hover:to-cyan-950/30 dark:border-cyan-800/30 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5"
            >
              <div className="p-3 rounded-full bg-cyan-100 dark:bg-cyan-900/50 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/70 transition-colors mb-3">
                <Cloud className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-foreground">Servicios</span>
              <span className="text-xs text-muted-foreground mt-0.5">Planes activos</span>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-cyan-400" />
              </div>
            </button>

            {/* Tickets */}
            <button
              onClick={() => navigate('/admin/tickets')}
              className="group relative flex flex-col items-center p-4 rounded-xl border border-border bg-gradient-to-br from-amber-50/50 to-amber-50/20 hover:from-amber-100/80 hover:to-amber-50/50 hover:border-amber-200 dark:from-amber-950/30 dark:to-amber-950/10 dark:hover:from-amber-950/50 dark:hover:to-amber-950/30 dark:border-amber-800/30 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5"
            >
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/70 transition-colors mb-3">
                <Ticket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-medium text-foreground">Tickets</span>
              <span className="text-xs text-muted-foreground mt-0.5">{stats?.data?.tickets?.open || 0} abiertos</span>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </div>
            </button>

            {/* Facturas */}
            <button
              onClick={() => navigate('/admin/invoices')}
              className="group relative flex flex-col items-center p-4 rounded-xl border border-border bg-gradient-to-br from-emerald-50/50 to-emerald-50/20 hover:from-emerald-100/80 hover:to-emerald-50/50 hover:border-emerald-200 dark:from-emerald-950/30 dark:to-emerald-950/10 dark:hover:from-emerald-950/50 dark:hover:to-emerald-950/30 dark:border-emerald-800/30 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5"
            >
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/70 transition-colors mb-3">
                <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-foreground">Facturas</span>
              <span className="text-xs text-muted-foreground mt-0.5">Facturación</span>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </div>
            </button>

            {/* Planes */}
            <button
              onClick={() => navigate('/admin/service-plans')}
              className="group relative flex flex-col items-center p-4 rounded-xl border border-border bg-gradient-to-br from-violet-50/50 to-violet-50/20 hover:from-violet-100/80 hover:to-violet-50/50 hover:border-violet-200 dark:from-violet-950/30 dark:to-violet-950/10 dark:hover:from-violet-950/50 dark:hover:to-violet-950/30 dark:border-violet-800/30 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5"
            >
              <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/50 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/70 transition-colors mb-3">
                <Server className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm font-medium text-foreground">Planes</span>
              <span className="text-xs text-muted-foreground mt-0.5">Configurar</span>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-violet-400" />
              </div>
            </button>

            {/* Nuevo Post */}
            <button
              onClick={() => navigate('/admin/blog/new')}
              className="group relative flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
            >
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-3">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Nuevo Post</span>
              <span className="text-xs text-muted-foreground mt-0.5">Blog</span>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-primary/60" />
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
