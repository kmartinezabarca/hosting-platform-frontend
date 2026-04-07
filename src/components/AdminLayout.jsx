import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Server, FileText, HelpCircle, 
  Settings, Package, LogOut, Menu, X, Search, 
  ChevronDown, Sun, Moon, Shield, Zap, Tag
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import UserAvatar from '../components/UserAvatar';
import { Skeleton } from '../components/ui/skeleton';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminServicesPage from '../pages/admin/AdminServicesPage';
import AdminInvoicesPage from '../pages/admin/AdminInvoicesPage';
import AdminTicketsPage from '../pages/admin/AdminTicketsPage';
import AdminServicePlansPage from '../pages/admin/AdminServicePlansPage';
import AdminAddOnsPage from '../pages/admin/AdminAddOnsPage';
import AdminBlogPage from '../pages/admin/AdminBlogPage';
import AdminBlogEditorPage from '../pages/admin/AdminBlogEditorPage';
import AdminBlogCategoriesPage from '../pages/admin/AdminBlogCategoriesPage';
import logoROKE from "../assets/logo_v4.png";

const AdminLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout, isLoading } = useAuth();
  const { data: user, isLoading: meLoading, isFetching: meFetching } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const isDark = theme === "dark";
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
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, description: 'Visión general del sistema' },
    { name: 'Usuarios', href: '/admin/users', icon: Users, description: 'Gestionar todos los usuarios' },
    { name: 'Servicios', href: '/admin/services', icon: Server, description: 'Administrar servicios de clientes' },
    { name: 'Planes', href: '/admin/service-plans', icon: Package, description: 'Configurar planes de servicio' },
    { name: 'Add-ons', href: '/admin/add-ons', icon: Settings, description: 'Gestionar complementos' },
    { name: 'Facturas', href: '/admin/invoices', icon: FileText, description: 'Control de facturación' },
    { name: 'Tickets', href: '/admin/tickets', icon: HelpCircle, description: 'Soporte y asistencia' },
    {
      name: 'Blog', icon: FileText, description: 'Gestionar contenido del blog', children: [
        { name: 'Artículos', href: '/admin/blog', icon: FileText, description: 'Listar y editar artículos' },
        { name: 'Categorías', href: '/admin/blog/categories', icon: Tag, description: 'Administrar categorías de blog' },
      ]
    }
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
    return location.pathname === href || (href !== '/admin/dashboard' && location.pathname.startsWith(href));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 nav-premium border-b border-border/50 bg-background">
        <div className="container-premium">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 px-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-3 hover-scale"
              >
                <img
                  src={logoROKE}
                  alt="ROKE Industries"
                  className="h-8 w-auto [filter:none] dark:[filter:brightness(0)_invert(1)]"
                />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-foreground">
                    ROKE Admin
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Management Platform
                  </p>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 max-w-md mx-20">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar usuarios, servicios, tickets..."
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-border bg-white dark:bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <NotificationDropdown isAdmin={true} />

              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                aria-pressed={isDark}
                title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                className="relative inline-flex size-11 items-center justify-center rounded-2xl leading-none text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
                      {isDark ? <Sun className="size-5 block text-[#EAEFEA]" /> : <Moon className="size-5 block text-[#222222]" />}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>

              <div className="relative" ref={profileRef}>
                {(isLoading || meLoading || meFetching) ? (
                  <div className="flex items-center space-x-3 p-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="hidden sm:block space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-accent transition-colors"
                    >
                      <UserAvatar user={user} size={32} />
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-foreground">
                          {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.name || "Admin"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email || ' '}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.18 }}
                          role="menu"
                          className="absolute right-0 mt-2 w-72 z-[70] rounded-2xl p-2 bg-white/95 dark:bg-[#121417]/95 supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-[#121417]/80 border border-black/10 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] text-foreground"
                        >
                          <span aria-hidden className="absolute -top-2 right-6 w-3.5 h-3.5 rotate-45 bg-white/95 dark:bg-[#121417]/95 border-t border-l border-black/10 dark:border-white/10 shadow-[0_2px_6px_rgba(0,0,0,0.06)]" />
                          <div className="px-3 py-2 border-b border-black/10 dark:border-white/10">
                            <p className="font-semibold">
                              {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.name || "Administrador"}
                            </p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                          </div>
                          <div className="py-2">
                            <Link
                              to="/client/profile"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <Users className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                              <span className="text-sm">Mi Perfil</span>
                            </Link>
                          </div>
                          <div className="border-t border-black/10 dark:border-white/10 pt-2">
                            <button
                              onClick={handleLogout}
                              className="group flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            >
                              <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
                              <span className="text-sm">Cerrar Sesión</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`fixed top-0 left-0 h-full z-30 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] w-72 bg-card border-r border-border/50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="p-4 space-y-4">
            {navigation.map((item) => {
              const isActive = item.href ? isActiveRoute(item.href) : item.children?.some(child => isActiveRoute(child.href));
              const isCurrentlyBlogOpen = item.name === 'Blog' && (isActive || location.pathname.startsWith('/admin/blog'));

              if (item.children) {
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => setIsBlogOpen(!isBlogOpen)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isBlogOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {(isBlogOpen || isCurrentlyBlogOpen) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pl-6 border-l border-border/50 ml-4 space-y-1"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              to={child.href}
                              onClick={() => setIsSidebarOpen(false)}
                              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                isActiveRoute(child.href)
                                  ? 'bg-accent text-accent-foreground'
                                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                              }`}
                            >
                              <child.icon className="mr-3 h-5 w-5" />
                              {child.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          <Routes>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="service-plans" element={<AdminServicePlansPage />} />
            <Route path="add-ons" element={<AdminAddOnsPage />} />
            <Route path="invoices" element={<AdminInvoicesPage />} />
            <Route path="tickets" element={<AdminTicketsPage />} />
            <Route path="blog" element={<AdminBlogPage />} />
            <Route path="blog/new" element={<AdminBlogEditorPage />} />
            <Route path="blog/edit/:uuid" element={<AdminBlogEditorPage />} />
            <Route path="blog/categories" element={<AdminBlogCategoriesPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
