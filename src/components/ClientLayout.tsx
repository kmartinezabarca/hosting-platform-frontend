import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import SectionErrorBoundary from './SectionErrorBoundary';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Server, FileText, MessageSquare, User,
  LogOut, Menu, X, Search, Settings, ChevronDown,
  Sun, Moon, Zap, Shield, Plus, ArrowRight, Command,
  ShoppingCart, Sparkles
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import UserAvatar from '../components/UserAvatar';
import { Skeleton } from '../components/ui/skeleton';
import logoROKE from "../assets/logo_v4.png";

/* ── Lazy pages ─────────────────────────────────────────────────────────── */
const NewDashboard          = lazy(() => import('../pages/client/NewDashboard'));
const ClientServicesPage    = lazy(() => import('../pages/client/ClientServicesPage'));
const ClientInvoicesPage    = lazy(() => import('../pages/client/ClientInvoicesPage'));
const ClientTicketsPage     = lazy(() => import('../pages/client/ClientTicketsPage'));
const ClientProfilePage     = lazy(() => import('../pages/client/ClientProfilePage'));
const ContractServicePage   = lazy(() => import('../pages/client/ContractServicePage'));
const CheckoutPage          = lazy(() => import('../pages/client/CheckoutPage'));
const CheckoutSuccessPage   = lazy(() => import('../pages/client/CheckoutSuccessPage'));
const ServiceManagementPage = lazy(() => import('../pages/client/ServiceManagementPage'));
const ServiceDetailPage     = lazy(() => import('../pages/client/ServiceDetailPage'));
const NotFoundPage          = lazy(() => import('../pages/NotFoundPage'));

/* ── Nav + search index ─────────────────────────────────────────────────── */
const navigation = [
  { name: 'Dashboard',     href: '/client/dashboard', icon: LayoutDashboard, keywords: ['dashboard','inicio','home','panel','resumen'] },
  { name: 'Mis Servicios', href: '/client/services',  icon: Server,          keywords: ['servicio','hosting','vps','server','dominio'] },
  { name: 'Mis Facturas',  href: '/client/invoices',  icon: FileText,        keywords: ['factura','pago','invoice','billing','cobro'] },
  { name: 'Soporte',       href: '/client/tickets',   icon: MessageSquare,   keywords: ['ticket','soporte','ayuda','support','problema'] },
  { name: 'Mi Perfil',     href: '/client/profile',   icon: User,            keywords: ['perfil','cuenta','profile','configuración','contraseña'] },
];

const SEARCH_EXTRA = [
  { name: 'Contratar Servicio', href: '/client/contract-service', icon: ShoppingCart, keywords: ['contratar','nuevo','plan','comprar','contratar'] },
];

const iconVariants = {
  enter:  (d) => ({ rotate: d * 90, opacity: 0, scale: 0.9 }),
  center: { rotate: 0, opacity: 1, scale: 1 },
  exit:   (d) => ({ rotate: -d * 90, opacity: 0, scale: 0.9 }),
};

/* ════════════════════════════════════════════════════════════════════════ */
const ClientLayout = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { logout, isLoading }  = useAuth();
  const { data: user, isLoading: meLoading, isFetching: meFetching } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen,     setIsSidebarOpen]     = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [searchFocused,     setSearchFocused]     = useState(false);

  const isDark = theme === 'dark';
  const dir    = isDark ? -1 : 1;

  const profileRef         = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef     = useRef<HTMLInputElement>(null);

  /* Close on route change */
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileMenuOpen(false);
    setSearchFocused(false);
    setSearchQuery('');
  }, [location.pathname]);

  /* Click outside — profile */
  useEffect(() => {
    const h = (e: MouseEvent) => { if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileMenuOpen(false); };
    if (isProfileMenuOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isProfileMenuOpen]);

  /* Click outside — search */
  useEffect(() => {
    const h = (e: MouseEvent) => { if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) setSearchFocused(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ⌘K */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchInputRef.current?.focus(); setSearchFocused(true); }
      if (e.key === 'Escape' && searchFocused) { setSearchFocused(false); setSearchQuery(''); searchInputRef.current?.blur(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [searchFocused]);

  /* Search results */
  const searchResults = useMemo(() => {
    const all = [...navigation, ...SEARCH_EXTRA];
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(i => i.name.toLowerCase().includes(q) || i.keywords.some(k => k.includes(q)));
  }, [searchQuery]);

  const handleSearchSelect = (href: string) => { navigate(href); setSearchQuery(''); setSearchFocused(false); searchInputRef.current?.blur(); };
  const handleLogout = async () => { try { await logout(); navigate('/login'); } catch (e) { console.error(e); } };
  const isActive = (href: string) => location.pathname === href || (href === '/client/dashboard' && location.pathname === '/client');
  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || (user as any)?.name || 'Usuario';

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background">

      {/* ── Skip to content (WCAG 2.1 — 2.4.1) ───────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-foreground focus:text-background focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        {t('a11y.skipToContent')}
      </a>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/95 supports-[backdrop-filter]:backdrop-blur-xl flex items-center">
        <div className="flex items-center justify-between w-full px-4 sm:px-5 gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label={t('a11y.openMenu')} aria-expanded={isSidebarOpen} aria-controls="client-sidebar" className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/client/dashboard" className="flex items-center gap-3">
              <img src={logoROKE} alt="ROKE" className="h-7 w-auto [filter:none] dark:[filter:brightness(0)_invert(1)]" />
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-foreground leading-tight">ROKE Industries</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Hosting Platform</p>
              </div>
            </Link>
          </div>

          {/* Search */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-sm relative mx-4">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults[0]) handleSearchSelect(searchResults[0].href);
                  if (e.key === 'Escape') { setSearchFocused(false); setSearchQuery(''); e.currentTarget.blur(); }
                }}
                placeholder="Buscar servicios, facturas..."
                className="w-full pl-10 pr-10 py-2 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/25 shadow-sm transition"
              />
              {!searchQuery ? (
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground font-mono pointer-events-none">
                  <Command className="w-2.5 h-2.5" />K
                </kbd>
              ) : (
                <button onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {searchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="absolute top-full mt-2 left-0 right-0 z-[80] rounded-2xl border border-border bg-white/95 dark:bg-[#121417]/95 supports-[backdrop-filter]:backdrop-blur-md shadow-xl overflow-hidden"
                >
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">
                      {searchQuery ? 'Resultados' : 'Accesos rápidos'}
                    </p>
                    {searchResults.length > 0 ? searchResults.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button key={item.href} onClick={() => handleSearchSelect(item.href)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/8 dark:hover:bg-white/8 transition-colors text-left group">
                          <div className="w-7 h-7 rounded-lg bg-foreground/8 dark:bg-white/8 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5 text-foreground" />
                          </div>
                          <span className="text-sm font-medium text-foreground flex-1">{item.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                        </button>
                      );
                    }) : (
                      <div className="py-8 text-center">
                        <Search className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sin resultados para "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border px-4 py-2 flex items-center gap-3 bg-muted/30">
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-background text-muted-foreground font-mono">↵</kbd>
                    <span className="text-xs text-muted-foreground">navegar</span>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-background text-muted-foreground font-mono">Esc</kbd>
                    <span className="text-xs text-muted-foreground">cerrar</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <NotificationDropdown isAdmin={false} />

            <button onClick={toggleTheme} aria-label={isDark ? t('a11y.toggleLightMode') : t('a11y.toggleDarkMode')}
              className="relative inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20">
              <span className="relative inline-flex size-5 items-center justify-center">
                <AnimatePresence initial={false} mode="wait" custom={dir}>
                  <motion.span key={isDark ? 'sun' : 'moon'} variants={iconVariants} custom={dir} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }} className="absolute inset-0 grid place-items-center">
                    {isDark ? <Sun className="size-4 text-[#EAEFEA]" /> : <Moon className="size-4 text-[#222]" />}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>

            {/* Profile */}
            <div className="relative ml-1" ref={profileRef}>
              {(isLoading || meLoading || meFetching) ? (
                <div className="flex items-center gap-2 p-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-20 hidden sm:block" /></div>
              ) : (
                <>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    aria-label={isProfileMenuOpen ? t('a11y.closeProfile') : t('a11y.openProfile')}
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-accent transition-colors">
                    <UserAvatar user={user} size={32} />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-foreground leading-tight">{userName}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight">Cliente</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 z-[70] rounded-2xl p-1.5 bg-white/95 dark:bg-[#121417]/95 supports-[backdrop-filter]:backdrop-blur-md border border-black/10 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                      >
                        <span aria-hidden className="absolute -top-2 right-6 w-3.5 h-3.5 rotate-45 bg-white/95 dark:bg-[#121417]/95 border-t border-l border-black/10 dark:border-white/10" />
                        <div className="flex items-center gap-3 px-3 py-3 mb-0.5">
                          <UserAvatar user={user} size={40} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            <span className="inline-flex items-center mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/8 text-foreground uppercase tracking-wider">
                              Cliente
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-black/8 dark:border-white/8 pt-1 space-y-0.5">
                          {[{ label: 'Mi Perfil', href: '/client/profile', icon: User }, { label: 'Configuración', href: '/client/profile', icon: Settings }].map(({ label, href, icon: Icon }) => (
                            <Link key={label} to={href} onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/8 dark:hover:bg-white/8 transition-colors group">
                              <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                              <span className="text-sm font-medium text-foreground">{label}</span>
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-black/8 dark:border-white/8 pt-1 mt-1">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full hover:bg-red-500/10 transition-colors group">
                            <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                            <span className="text-sm font-medium text-foreground group-hover:text-red-500 transition-colors">Cerrar Sesión</span>
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
      </header>

      <div className="flex">

        {/* ── SIDEBAR ────────────────────────────────────────────────── */}
        <aside id="client-sidebar" className={`
          fixed inset-y-0 left-0 z-[60] w-64
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:sticky lg:translate-x-0 lg:top-16 lg:h-[calc(100dvh-4rem)]
          flex flex-col
          bg-[#F7F8FA] dark:bg-[#0B0C0F]
          border-r border-border/60
        `}>

          {/* Mobile top bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 lg:hidden shrink-0">
            <div className="flex items-center gap-2.5">
              <img src={logoROKE} alt="" className="h-6 w-auto [filter:none] dark:[filter:brightness(0)_invert(1)]" />
              <span className="text-sm font-bold text-foreground">ROKE Industries</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-black/8 dark:hover:bg-white/8 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop brand */}
          <div className="hidden lg:flex items-center gap-3 px-5 py-5 shrink-0">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Panel de Cliente</p>
            </div>
          </div>

          {/* ── Nav items ── */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                    ${active
                      ? 'bg-white dark:bg-white/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)] border border-black/[0.06] dark:border-white/[0.08]'
                      : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }
                  `}
                >
                  {/* Icon container */}
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                    ${active
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-black/[0.06] dark:bg-white/[0.07] text-muted-foreground group-hover:bg-black/[0.09] dark:group-hover:bg-white/[0.1] group-hover:text-foreground'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className={`text-sm flex-1 transition-colors ${active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground group-hover:text-foreground'}`}>
                    {item.name}
                  </span>

                  {active && (
                    <motion.div layoutId="navActiveDot" className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── CTA contratar ── */}
          <div className="px-3 pb-3 shrink-0">
            <Link
              to="/client/contract-service"
              onClick={() => setIsSidebarOpen(false)}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-foreground text-background hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            >
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold flex-1">Contratar Servicio</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {/* ── Footer user card ── */}
          <div className="shrink-0 border-t border-border/50 p-3 space-y-1">
            <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.05]">
              <div className="relative shrink-0">
                <UserAvatar user={user} size={34} />
                {/* Online dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#F7F8FA] dark:border-[#0B0C0F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate leading-snug">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate leading-snug">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <p className="text-[11px] text-muted-foreground">Todos los sistemas operativos</p>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
        <main id="main-content" tabIndex={-1} className="flex-1 min-h-[calc(100dvh-4rem)] overflow-y-auto outline-none">
          <div className="container-premium section-padding">
            <SectionErrorBoundary name="client-main" fallbackMsg="Ocurrió un error en esta página. Puedes reintentar o navegar a otra sección.">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-[3px] border-foreground/10 border-t-foreground/60 rounded-full animate-spin" />
              </div>
            }>
              <Routes>
                <Route path="/dashboard"                 element={<NewDashboard />} />
                <Route path="/services"                  element={<ClientServicesPage />} />
                <Route path="services/:serviceId/manage" element={<ServiceManagementPage />} />
                <Route path="services/:serviceId"        element={<ServiceDetailPage />} />
                <Route path="/invoices"                  element={<ClientInvoicesPage />} />
                <Route path="/tickets"                   element={<ClientTicketsPage />} />
                <Route path="/profile"                   element={<ClientProfilePage />} />
                <Route path="/contract-service"          element={<ContractServicePage />} />
                <Route path="/checkout"                  element={<CheckoutPage />} />
                <Route path="/checkout/success"          element={<CheckoutSuccessPage />} />
                <Route path="/"                          element={<NewDashboard />} />
                <Route path="*"                           element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            </SectionErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
