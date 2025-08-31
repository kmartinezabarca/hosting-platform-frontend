import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Server, FileText, MessageSquare, User, 
  LogOut, Menu, X, Bell, Search, Settings, ChevronDown,
  Sun, Moon, Zap, Shield
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import NewDashboard from '../pages/client/NewDashboard';
import ClientServicesPage from '../pages/client/ClientServicesPage';
import ClientInvoicesPage from '../pages/client/ClientInvoicesPage';
import ClientTicketsPage from '../pages/client/ClientTicketsPage';
import ClientProfilePage from '../pages/client/ClientProfilePage';
import ContractServicePage from '../pages/client/ContractServicePage';
import CheckoutPage from '../pages/client/CheckoutPage';
import CheckoutSuccessPage from '../pages/client/CheckoutSuccessPage';
import logoROKE from "../assets/logo_v4.png";

const ClientLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const isDark = theme === "dark";
  const label = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  const dir = isDark ? -1 : 1; 
  const profileRef = useRef(null);
  const iconVariants = {
  enter: (d) => ({ rotate: d * 90, opacity: 0, scale: 0.9 }),
  center: { rotate: 0, opacity: 1, scale: 1 },
  exit:  (d) => ({ rotate: -d * 90, opacity: 0, scale: 0.9 }),
  };

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Cerrar menú de perfil al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

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
      <header className="sticky top-0 z-40 nav-premium border-b border-border/50 bg-background">
        <div className="container-premium">
          <div className="flex items-center justify-between h-16">
            {/* Logo y Brand */}
            <div className="flex items-center space-x-4 px-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link
                to="/client/dashboard"
                className="flex items-center space-x-3 hover-scale"
              >
                <img
                  src={logoROKE}
                  alt="ROKE Industries"
                  className="h-8 w-auto [filter:none] dark:[filter:brightness(0)_invert(1)]"
                />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-foreground">
                    ROKE Industries
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Hosting Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Barra de búsqueda central */}
            <div className="hidden md:flex flex-1 max-w-md mx-20">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar servicios, facturas, tickets..."
                  className="
                    w-full pl-10 pr-3 py-2 text-sm
                    rounded-xl
                    border border-border
                    bg-white dark:bg-card
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50
                    shadow-sm
                  "
                />
              </div>
            </div>

            {/* Acciones del header */}
            <div className="flex items-center space-x-3">
              {/* Notificaciones */}
              <button
                aria-label="Notificaciones"
                title="Notificaciones"
                className="
                   relative p-2 rounded-xl transition-colors
                   text-muted-foreground hover:text-foreground
                   hover:bg-accent
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                   active:bg-accent/70
                  "
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-40" />
                  <span
                    className="
                      relative inline-flex h-3 w-3 rounded-full bg-error
                      ring-2 ring-white dark:ring-card
                     "
                  />
                </span>
              </button>

              {/* Toggle tema */}
              <button
                onClick={toggleTheme}
                aria-label={
                  isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
                }
                aria-pressed={isDark}
                title={
                  isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
                }
                className="
                  relative inline-flex size-11 items-center justify-center rounded-2xl
                  leading-none
                  text-muted-foreground hover:text-foreground
                  hover:bg-accent active:bg-accent/70
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                 "
              >
                <span className="relative inline-flex size-5 items-center justify-center">
                  <AnimatePresence initial={false} mode="wait" custom={dir}>
                    <motion.span
                      key={isDark ? "sun" : "moon"}
                      variants={iconVariants}
                      custom={dir}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.18 }}
                      className="absolute inset-0 grid place-items-center"
                    >
                      {isDark ? (
                        <Sun className="size-5 block text-[#EAEFEA]" />
                      ) : (
                        <Moon className="size-5 block text-[#222222]" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>

              {/* Menú de perfil */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-accent transition-colors"
                >
                  <UserAvatar user={user} size={32} />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {[user?.data?.first_name, user?.data?.last_name]
                        .filter(Boolean)
                        .join(" ") ||
                        user?.data?.name ||
                        "Usuario"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.data?.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Dropdown del perfil */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      role="menu"
                      className="
                         absolute right-0 mt-2 w-72 z-[70]
                         rounded-2xl p-2
                         bg-white/95 dark:bg-[#121417]/95
                         supports-[backdrop-filter]:backdrop-blur-md
                         supports-[backdrop-filter]:bg-white/80
                         supports-[backdrop-filter]:dark:bg-[#121417]/80
                         border border-black/10 dark:border-white/10
                         shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]
                         text-foreground
                        "
                    >
                      {/* Caret */}
                      <span
                        aria-hidden
                        className="
                          absolute -top-2 right-6 w-3.5 h-3.5 rotate-45
                          bg-white/95 dark:bg-[#121417]/95
                          border-t border-l border-black/10 dark:border-white/10
                          shadow-[0_2px_6px_rgba(0,0,0,0.06)]
                         "
                      />

                      {/* Header */}
                      <div className="px-3 py-2 border-b border-black/10 dark:border-white/10">
                        <p className="font-semibold">
                          {[user?.data?.first_name, user?.data?.last_name]
                            .filter(Boolean)
                            .join(" ") ||
                            user?.data?.name ||
                            "Usuario"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user?.data?.email}
                        </p>
                      </div>

                      {/* Items */}
                      <div className="py-2">
                        <Link
                          to="/client/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="group flex items-center gap-3 px-3 py-2 rounded-lg
                            hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                          <span className="text-sm">Mi Perfil</span>
                        </Link>

                        <Link
                          to="/client/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="group flex items-center gap-3 px-3 py-2 rounded-lg
                            hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                          <span className="text-sm">Configuración</span>
                        </Link>
                      </div>

                      <div className="border-t border-black/10 dark:border-white/10 pt-2">
                        <button
                          onClick={handleLogout}
                          className="group flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left
                            hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
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
        <aside
          className={`
            fixed inset-y-0 left-0 z-[60] w-72
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            bg-card border-r border-border
            lg:sticky lg:translate-x-0 lg:top-16  
            lg:h-[calc(100dvh-4rem)] 
            lg:overflow-hidden
            lg:flex lg:flex-col
  `}
        >
          {/* Header del sidebar */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="text-lg font-semibold text-foreground">
                Navegación
              </h2>
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
          <nav className="p-4 space-y-2 lg:flex-none">
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
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-premium-sm"
                        : "hover:bg-accent text-foreground hover-lift"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-primary"
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isActive ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`text-xs ${
                        isActive
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
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
                  <p className="text-sm font-medium text-foreground">
                    Cuenta Segura
                  </p>
                  <p className="text-xs text-muted-foreground">2FA Activado</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-xl">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Zap className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Estado del Sistema
                  </p>
                  <p className="text-xs text-success">
                    Todos los servicios operativos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay para móvil */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main className="flex-1 min-h-[calc(100dvh-4rem)] overflow-y-auto">
          <div className="container-premium section-padding">
            <Routes>
              <Route path="/dashboard" element={<NewDashboard />} />
              <Route path="/services" element={<ClientServicesPage />} />
              <Route path="/invoices" element={<ClientInvoicesPage />} />
              <Route path="/tickets" element={<ClientTicketsPage />} />
              <Route path="/profile" element={<ClientProfilePage />} />
              <Route path="/contract-service" element={<ContractServicePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="/" element={<NewDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;

