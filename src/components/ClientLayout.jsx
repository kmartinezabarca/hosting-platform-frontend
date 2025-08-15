import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Server, FileText, MessageSquare, User, 
  LogOut, Menu, X, Bell, Search, Settings, ChevronDown,
  Sun, Moon, Zap, Shield
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import NewDashboard from '../pages/client/NewDashboard';
import ClientServicesPage from '../pages/client/ClientServicesPage';
import ClientInvoicesPage from '../pages/client/ClientInvoicesPage';
import ClientTicketsPage from '../pages/client/ClientTicketsPage';
import ClientProfilePage from '../pages/client/ClientProfilePage';

const ClientLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/client/dashboard', 
      icon: LayoutDashboard,
      description: 'Panel principal con estadísticas'
    },
    { 
      name: 'Mis Servicios', 
      href: '/client/services', 
      icon: Server,
      description: 'Gestiona tus servicios de hosting'
    },
    { 
      name: 'Mis Facturas', 
      href: '/client/invoices', 
      icon: FileText,
      description: 'Historial de facturación'
    },
    { 
      name: 'Mis Tickets', 
      href: '/client/tickets', 
      icon: MessageSquare,
      description: 'Soporte técnico'
    },
    { 
      name: 'Mi Perfil', 
      href: '/client/profile', 
      icon: User,
      description: 'Configuración de cuenta'
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActiveRoute = (href) => {
    return location.pathname === href || 
           (href === '/client/dashboard' && location.pathname === '/client');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Premium */}
      <header className="sticky top-0 z-50 nav-premium border-b border-border/50">
        <div className="container-premium">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo y Brand */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <Link to="/client/dashboard" className="flex items-center space-x-3 hover-scale">
                <img 
                  src="/ROKEIndustriesFusionLogo.png" 
                  alt="ROKE Industries" 
                  className="h-8 w-auto"
                />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-foreground">ROKE Industries</h1>
                  <p className="text-xs text-muted-foreground">Hosting Platform</p>
                </div>
              </Link>
            </div>

            {/* Barra de búsqueda central */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar servicios, facturas, tickets..."
                  className="input-premium pl-10 pr-4 py-2 text-sm"
                />
              </div>
            </div>

            {/* Acciones del header */}
            <div className="flex items-center space-x-3">
              
              {/* Notificaciones */}
              <button className="relative p-2 rounded-xl hover:bg-accent transition-colors icon-hover">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full text-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </span>
              </button>

              {/* Toggle tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-accent transition-colors icon-hover"
                title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Menú de perfil */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.first_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {user?.first_name || user?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Dropdown del perfil */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 card-premium p-2 shadow-premium-lg"
                    >
                      <div className="px-3 py-2 border-b border-border">
                        <p className="font-medium text-foreground">
                          {user?.first_name && user?.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user?.name || 'Usuario'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/client/profile"
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm">Mi Perfil</span>
                        </Link>
                        
                        <Link
                          to="/client/profile"
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Configuración</span>
                        </Link>
                      </div>
                      
                      <div className="border-t border-border pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Cerrar Sesión</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Premium */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          
          {/* Header del sidebar */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="text-lg font-semibold text-foreground">Navegación</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="hidden lg:block">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Panel de Cliente
              </h2>
            </div>
          </div>

          {/* Navegación */}
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-premium-sm' 
                      : 'hover:bg-accent text-foreground hover-lift'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
                  <div className="flex-1">
                    <p className={`font-medium ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-2 h-2 bg-primary-foreground rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer del sidebar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Cuenta Segura</p>
                  <p className="text-xs text-muted-foreground">2FA Activado</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-xl">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Zap className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Estado del Sistema</p>
                  <p className="text-xs text-success">Todos los servicios operativos</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay para móvil */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main className="flex-1 min-h-screen">
          <div className="container-premium section-padding">
            <Routes>
              <Route path="/dashboard" element={<NewDashboard />} />
              <Route path="/services" element={<ClientServicesPage />} />
              <Route path="/invoices" element={<ClientInvoicesPage />} />
              <Route path="/tickets" element={<ClientTicketsPage />} />
              <Route path="/profile" element={<ClientProfilePage />} />
              <Route path="/" element={<NewDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;

