import React, { useState, useEffect, useRef, useMemo, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Server, FileText, HelpCircle,
  Settings, Package, LogOut, Menu, X, Search,
  ChevronDown, Sun, Moon, Shield, Zap, Tag, Book, Code,
  AlertCircle, Plus, Ticket, CreditCard, Sparkles,
  Layers, Database, Gamepad2, Globe, Bug, Clock,
  ChevronLeft, ChevronRight, LayoutGrid, Bell,
  Loader2, ExternalLink, Receipt
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import UserAvatar from '../components/UserAvatar';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { cn } from '@/lib/utils';
import { useAdminInvoicesStats } from '@/hooks/useAdminInvoices';
import { useAdminTicketsStats } from '@/hooks/useAdminTickets';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import SectionErrorBoundary from './SectionErrorBoundary';
import { useTranslation } from 'react-i18next';

const AdminDashboardPage       = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage           = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminServicesPage        = lazy(() => import('../pages/admin/AdminServicesPage'));
const AdminInvoicesPage        = lazy(() => import('../pages/admin/AdminInvoicesPage'));
const AdminTicketsPage         = lazy(() => import('../pages/admin/AdminTicketsPage'));
const AdminServicePlansPage    = lazy(() => import('../pages/admin/AdminServicePlansPage'));
const AdminAddOnsPage          = lazy(() => import('../pages/admin/AdminAddOnsPage'));
const AdminBlogPage           = lazy(() => import('../pages/admin/AdminBlogPage'));
const AdminBlogEditorPage     = lazy(() => import('../pages/admin/AdminBlogEditorPage'));
const AdminBlogCategoriesPage  = lazy(() => import('../pages/admin/AdminBlogCategoriesPage'));
const AdminDocumentationPage  = lazy(() => import('../pages/admin/AdminDocumentationPage'));
const AdminApiDocumentationPage = lazy(() => import('../pages/admin/AdminApiDocumentationPage'));
const AdminSystemStatusPage   = lazy(() => import('../pages/admin/AdminSystemStatusPage'));
const AdminGameServersPage    = lazy(() => import('../pages/admin/AdminGameServersPage'));
const AdminCfdiPage           = lazy(() => import('../pages/admin/AdminCfdiPage'));
const AdminQuotationsPage     = lazy(() => import('../pages/admin/AdminQuotationsPage'));
const NotFoundPage           = lazy(() => import('../pages/NotFoundPage'));
import logoROKE from "../assets/logo_v4.png";

const SIDEBAR_WIDTH = "280px";
const SIDEBAR_WIDTH_COLLAPSED = "72px";

const navigationConfig = {
  overview: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, description: 'Resumen y métricas' },
  ],
  management: [
    { name: 'Usuarios', href: '/admin/users', icon: Users, description: 'Gestión de usuarios', badgeKey: null },
    { name: 'Servicios', href: '/admin/services', icon: Server, description: 'Servicios activos', badgeKey: null },
    { name: 'Game Servers', href: '/admin/game-servers', icon: Gamepad2, description: 'Pterodactyl servers', badgeKey: null },
    { name: 'Tickets', href: '/admin/tickets', icon: Ticket, description: 'Soporte y helpdesk', badgeKey: 'tickets_open' },
    { name: 'Facturas', href: '/admin/invoices', icon: CreditCard, description: 'Facturación', badgeKey: 'invoices_pending' },
    { name: 'Cotizaciones', href: '/admin/quotations', icon: Receipt, description: 'Propuestas comerciales', badgeKey: null },
    { name: 'CFDI', href: '/admin/cfdi', icon: FileText, description: 'Facturas electrónicas SAT', badgeKey: null },
  ],
  catalog: [
    { name: 'Planes', href: '/admin/service-plans', icon: Package, description: 'Planes de servicio', badgeKey: null },
    { name: 'Add-ons', href: '/admin/add-ons', icon: Sparkles, description: 'Complementos', badgeKey: null },
  ],
  content: [
    { name: 'Blog', href: '/admin/blog', icon: FileText, description: 'Artículos', badgeKey: null, expandable: true, children: [
      { name: 'Artículos', href: '/admin/blog', icon: FileText },
      { name: 'Categorías', href: '/admin/blog/categories', icon: Tag },
    ]},
  ],
  docs: [
    { name: 'Documentación', href: '/admin/documentation', icon: Book, description: 'Docs generales', expandable: true, children: [
      { name: 'Documentación', href: '/admin/documentation', icon: Book },
      { name: 'API Docs', href: '/admin/api-docs', icon: Code },
      { name: 'Estado del Sistema', href: '/admin/system-status', icon: AlertCircle },
    ]},
  ],
};

const searchItems = [
  { name: 'Dashboard', href: '/admin/dashboard', category: 'Overview', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/admin/users', category: 'Gestión', icon: Users },
  { name: 'Servicios', href: '/admin/services', category: 'Gestión', icon: Server },
  { name: 'Tickets', href: '/admin/tickets', category: 'Gestión', icon: Ticket },
  { name: 'Facturas', href: '/admin/invoices', category: 'Gestión', icon: CreditCard },
  { name: 'Cotizaciones', href: '/admin/quotations', category: 'Gestión', icon: Receipt },
  { name: 'Planes de Servicio', href: '/admin/service-plans', category: 'Catálogo', icon: Package },
  { name: 'Add-ons', href: '/admin/add-ons', category: 'Catálogo', icon: Sparkles },
  { name: 'Blog', href: '/admin/blog', category: 'Contenido', icon: FileText },
  { name: 'Categorías del Blog', href: '/admin/blog/categories', category: 'Contenido', icon: Tag },
  { name: 'Documentación', href: '/admin/documentation', category: 'Docs', icon: Book },
  { name: 'API Docs', href: '/admin/api-docs', category: 'Docs', icon: Code },
  { name: 'Estado del Sistema', href: '/admin/system-status', category: 'Docs', icon: AlertCircle },
];

const AdminLayout = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { logout, isLoading } = useAuth();
  const { data: user, isLoading: meLoading, isFetching: meFetching } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({ blog: true, docs: true });
  
  const { data: ticketsStats } = useAdminTicketsStats();
  const { data: invoicesStats } = useAdminInvoicesStats();
  const { query: searchQuery, results: searchResults, isLoading: isSearching, search, clearSearch } = useGlobalSearch();
  
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === "dark";
  const dir = isDark ? -1 : 1;
  
  const badgeCounts = useMemo(() => {
    const tStats = (ticketsStats as any)?.data;
    const iStats = (invoicesStats as any)?.data;
    return {
      tickets_open: tStats?.open || tStats?.data?.open || 0,
      invoices_pending: iStats?.pending || iStats?.data?.pending || 0,
    };
  }, [ticketsStats, invoicesStats]);

  const iconVariants = {
    enter: (d: number) => ({ rotate: d * 90, opacity: 0, scale: 0.9 }),
    center: { rotate: 0, opacity: 1, scale: 1 },
    exit:  (d: number) => ({ rotate: -d * 90, opacity: 0, scale: 0.9 }),
  };

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    if (isProfileMenuOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredSearch = useMemo(() => {
    if (!searchQuery.trim()) return searchItems.slice(0, 8);
    const query = searchQuery.toLowerCase();
    if (query.length >= 2 && searchResults.length > 0) {
      return searchResults.map(item => ({
        name: item.name,
        href: item.href,
        category: item.category,
        icon: item.icon,
        type: item.type
      })).slice(0, 8);
    }
    return searchItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [searchQuery, searchResults]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActiveRoute = (href) => location.pathname.startsWith(href);
  
  const isParentActive = (item) => {
    if (item.expandable && item.children) {
      return item.children.some(child => location.pathname.startsWith(child.href));
    }
    return location.pathname.startsWith(item.href);
  };

  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSearchSelect = (href) => {
    navigate(href);
    setIsSearchOpen(false);
    clearSearch();
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    search(e.target.value);
  };

  const sectionLabels = {
    overview: { label: 'Overview', icon: LayoutGrid },
    management: { label: 'Gestión', icon: Layers },
    catalog: { label: 'Catálogo', icon: Package },
    content: { label: 'Contenido', icon: FileText },
    docs: { label: 'Sistema', icon: Settings },
  };

  const iconMap = {
    LayoutDashboard, Users, Server, FileText, HelpCircle, Package,
    Ticket, CreditCard, Sparkles, Tag, Book, Code, AlertCircle
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Skip to content (WCAG 2.1 — 2.4.1) ───────────────────────── */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-foreground focus:text-background focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        {t('a11y.skipToContent')}
      </a>

      {/* Header Premium */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container-premium">
          <div className="flex items-center justify-between h-16">
            {/* Logo y Brand */}
            <div className="flex items-center gap-4 px-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-xl hover:bg-accent transition-colors"
                title="Colapsar sidebar (Ctrl+B)"
              >
                {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>

              <Link to="/admin/dashboard" className="flex items-center gap-3">
                <img src={logoROKE} alt="ROKE" className="h-8 w-auto" />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-foreground">Admin</h1>
                  <p className="text-xs text-muted-foreground">Panel de Control</p>
                </div>
              </Link>
            </div>

            {/* Barra de búsqueda central */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div 
                ref={searchRef}
                className="relative w-full"
              >
                <button
                  onClick={() => { setIsSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-border bg-accent/50 hover:bg-accent transition-colors group"
                >
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-left text-sm text-muted-foreground">
                    Buscar en el panel...
                  </span>
                  <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground font-mono">
                    <span className="text-[10px]">⌘</span>K
                  </kbd>
                </button>

                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 w-full rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden z-[60]"
                    >
                      <div className="p-2 border-b border-border">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchInputChange}
                          placeholder="Buscar usuarios, servicios, facturas, tickets..."
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/40"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-80 overflow-y-auto p-2">
                        {isSearching ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
                          </div>
                        ) : filteredSearch.length === 0 ? (
                          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            {searchQuery.length >= 2 ? 'No se encontraron resultados' : 'Escribe al menos 2 caracteres para buscar'}
                          </div>
                        ) : (
                          <>
                            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {searchQuery.length >= 2 ? 'Resultados' : 'Páginas'}
                            </div>
                            {filteredSearch.map((item) => {
                              const SearchIcon = typeof item.icon === 'string' ? (iconMap[item.icon] || Search) : item.icon;
                              return (
                                <button
                                  key={item.href}
                                  onClick={() => handleSearchSelect(item.href)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors group"
                                >
                                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                    <SearchIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.category}{item.type && ` • ${item.type}`}</p>
                                  </div>
                                  {item.type ? (
                                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </button>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Acciones del header */}
            <div className="flex items-center gap-2 pr-4">
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                className="relative inline-flex size-11 items-center justify-center rounded-2xl leading-none text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
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
                    {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>

              <NotificationDropdown isAdmin={true} />

              <div className="relative" ref={profileRef}>
                {(isLoading || meLoading || meFetching) ? (
                  <div className="flex items-center gap-3 p-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-accent transition-colors"
                    >
                      <UserAvatar user={user} size={32} />
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-foreground">
                          {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Admin"}
                        </p>
                        <p className="text-xs text-muted-foreground">Administrador</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-2 bg-popover border border-border shadow-2xl"
                        >
                          <div className="px-3 py-3 border-b border-border">
                            <p className="font-semibold text-foreground">
                              {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Administrador"}
                            </p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                          </div>
                          <div className="py-2">
                            <Link
                              to="/client/profile"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors"
                            >
                              <Users className="w-4 h-4" />
                              <span className="text-sm">Mi Perfil</span>
                            </Link>
                          </div>
                          <div className="border-t border-border pt-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
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
        {/* Sidebar Premium */}
        <aside
          className={cn(
            "fixed left-0 top-16 bottom-0 z-40 bg-card border-r border-border transition-all duration-300 ease-out overflow-hidden",
            "hidden lg:flex lg:flex-col",
            isSidebarCollapsed ? "w-[72px]" : "w-[280px]"
          )}
        >
          <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-2 px-1 scrollbar-thin">
            {Object.entries(navigationConfig).map(([sectionKey, sectionItems], sectionIndex) => {
              const sectionMeta = sectionLabels[sectionKey];
              return (
                <div key={sectionKey} className="mb-3">
                  {!isSidebarCollapsed ? (
                    <div className="px-4 mb-2 flex items-center gap-2">
                      <sectionMeta.icon className="w-4 h-4 text-muted-foreground/60" />
                      <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                        {sectionMeta.label}
                      </span>
                    </div>
                  ) : (
                    <div className="px-2 mb-2">
                      <div className="w-8 h-8 mx-auto rounded-xl bg-muted/50 flex items-center justify-center">
                        <sectionMeta.icon className="w-4 h-4 text-muted-foreground/60" />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-0.5 px-2">
                    {sectionItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isParentActive(item);
                      const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : null;
                      
                      if (item.expandable && item.children) {
                        const isExpanded = expandedMenus[item.href] !== undefined 
                          ? expandedMenus[item.href] 
                          : isActive;
                        
                        return (
                          <div key={item.name}>
                            <button
                              onClick={() => !isSidebarCollapsed && toggleMenu(item.href)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                isActive 
                                  ? "bg-primary/10 text-primary" 
                                  : "hover:bg-accent text-muted-foreground hover:text-foreground",
                                isSidebarCollapsed && "justify-center px-2"
                              )}
                              title={isSidebarCollapsed ? item.name : undefined}
                            >
                              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "")} />
                              {!isSidebarCollapsed && (
                                <>
                                  <div className="flex-1 text-left">
                                    <p className={cn("text-sm font-medium", isActive ? "text-primary" : "")}>
                                      {item.name}
                                    </p>
                                  </div>
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </motion.div>
                                </>
                              )}
                            </button>
                            
                            <AnimatePresence>
                              {!isSidebarCollapsed && isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-4 pl-2 border-l border-border/50 space-y-0.5 overflow-hidden"
                                >
                                  {item.children.map((child) => {
                                    const ChildIcon = child.icon;
                                    const isChildActive = location.pathname === child.href;
                                    return (
                                      <Link
                                        key={child.name}
                                        to={child.href}
                                        className={cn(
                                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                          isChildActive 
                                            ? "bg-primary/10 text-primary font-medium" 
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                        )}
                                      >
                                        <ChildIcon className="w-4 h-4" />
                                        <span className="text-sm">{child.name}</span>
                                      </Link>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                              : "hover:bg-accent text-muted-foreground hover:text-foreground",
                            isSidebarCollapsed && "justify-center px-2"
                          )}
                          title={isSidebarCollapsed ? item.name : undefined}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeNav"
                              className="absolute inset-0 rounded-xl bg-primary -z-10"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                          <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-foreground" : "")} />
                          {!isSidebarCollapsed ? (
                            <>
                              <div className="flex-1">
                                <p className={cn("text-sm font-medium", isActive ? "text-primary-foreground" : "")}>
                                  {item.name}
                                </p>
                                {item.description && (
                                  <p className={cn("text-xs", isActive ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {badgeCount > 0 && (
                                <Badge 
                                  variant={item.badgeKey === 'tickets_open' ? 'destructive' : 'secondary'}
                                  className={cn(
                                    "h-5 min-w-[20px] px-1.5 text-[10px] font-bold",
                                    isActive && "bg-primary-foreground/20 text-primary-foreground"
                                  )}
                                >
                                  {badgeCount > 99 ? '99+' : badgeCount}
                                </Badge>
                              )}
                            </>
                          ) : badgeCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                              {badgeCount > 9 ? '9+' : badgeCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer del Sidebar */}
          {!isSidebarCollapsed && (
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Sistema Operativo
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* Overlay para móvil */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar móvil */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-16 bottom-0 z-50 w-[280px] bg-card border-r border-border lg:hidden flex flex-col"
            >
              <nav className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(navigationConfig).map(([sectionKey, sectionItems]) => {
                  const sectionMeta = sectionLabels[sectionKey];
                  return (
                    <div key={sectionKey}>
                      <div className="flex items-center gap-2 mb-3">
                        <sectionMeta.icon className="w-4 h-4 text-muted-foreground/60" />
                        <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                          {sectionMeta.label}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {sectionItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = isParentActive(item);
                          const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : null;
                           
                          if (item.expandable && item.children) {
                            const isExpanded = expandedMenus[item.href];
                            return (
                              <div key={item.name}>
                                <button
                                  onClick={() => toggleMenu(item.href)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                                    isActive ? "bg-primary/10 text-primary" : "hover:bg-accent"
                                  )}
                                >
                                  <Icon className="w-5 h-5" />
                                  <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                                  <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                                </button>
                                {isExpanded && (
                                  <div className="ml-6 mt-1 space-y-1">
                                    {item.children.map((child) => {
                                      const ChildIcon = child.icon;
                                      const isChildActive = location.pathname === child.href;
                                      return (
                                        <Link
                                          key={child.name}
                                          to={child.href}
                                          onClick={() => setIsSidebarOpen(false)}
                                          className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                            isChildActive ? "text-primary font-medium" : "text-muted-foreground hover:bg-accent"
                                          )}
                                        >
                                          <ChildIcon className="w-4 h-4" />
                                          {child.name}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                                isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                              )}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="text-sm font-medium">{item.name}</span>
                              {badgeCount > 0 && (
                                <Badge 
                                  variant={item.badgeKey === 'tickets_open' ? 'destructive' : 'secondary'}
                                  className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] font-bold"
                                >
                                  {badgeCount > 99 ? '99+' : badgeCount}
                                </Badge>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <main
          id="admin-main-content"
          tabIndex={-1}
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 pt-16 outline-none",
            isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]"
          )}
        >
          <div className="container-premium section-padding">
            <SectionErrorBoundary name="admin-main" fallbackMsg="Ocurrió un error en esta sección del panel. Puedes reintentar sin perder el menú de navegación.">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            }>
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
                <Route path="documentation" element={<AdminDocumentationPage />} />
                <Route path="api-docs" element={<AdminApiDocumentationPage />} />
                <Route path="system-status"  element={<AdminSystemStatusPage />} />
                <Route path="game-servers"  element={<AdminGameServersPage />} />
                <Route path="cfdi"          element={<AdminCfdiPage />} />
                <Route path="quotations"    element={<AdminQuotationsPage />} />
                <Route path="*"             element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            </SectionErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
