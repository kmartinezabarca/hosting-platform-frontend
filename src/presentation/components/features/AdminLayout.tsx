import React, { useState, useEffect, useRef, useMemo, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@shared/utils/utils';
import { useTheme } from '@application/context/ThemeContext';
import { useAuth } from '@application/context/AuthContext';
import { useCurrentUser } from '@application/hooks/useCurrentUser';
import { useAdminInvoicesStats } from '@application/hooks/useAdminInvoices';
import { useAdminTicketsStats } from '@application/hooks/useAdminTickets';
import { useGlobalSearch } from '@application/hooks/useGlobalSearch';
import { useSessionManager } from '@application/hooks/useSessionManager';
import { AdminHeader } from '@presentation/components/features/admin/layout/AdminHeader';
import { AdminSidebar } from '@presentation/components/features/admin/layout/AdminSidebar';
import { AdminProfileDropdown } from '@presentation/components/features/admin/layout/AdminProfileDropdown';
import { SessionTimeoutModal } from '@presentation/components/features/SessionTimeoutModal';
import { navigationConfig, searchItems, sectionLabels } from '@presentation/components/features/admin/layout/navigation.config';
import SectionErrorBoundary from '@presentation/components/features/SectionErrorBoundary';
import { useTranslation } from 'react-i18next';

const AdminDashboardPage       = lazy(() => import('@presentation/pages/admin/AdminDashboardPage'));
const AdminUsersPage           = lazy(() => import('@presentation/pages/admin/AdminUsersPage'));
const AdminServicesPage        = lazy(() => import('@presentation/pages/admin/AdminServicesPage'));
const AdminServiceDetailPage   = lazy(() => import('@presentation/pages/admin/AdminServiceDetailPage'));
const AdminInvoicesPage        = lazy(() => import('@presentation/pages/admin/AdminInvoicesPage'));
const AdminTicketsPage         = lazy(() => import('@presentation/pages/admin/AdminTicketsPage'));
const AdminServicePlansPage    = lazy(() => import('@presentation/pages/admin/AdminServicePlansPage'));
const AdminAddOnsPage          = lazy(() => import('@presentation/pages/admin/AdminAddOnsPage'));
const AdminCategoriesPage      = lazy(() => import('@presentation/pages/admin/AdminCategoriesPage'));
const AdminBlogPage           = lazy(() => import('@presentation/pages/admin/AdminBlogPage'));
const AdminBlogEditorPage     = lazy(() => import('@presentation/pages/admin/AdminBlogEditorPage'));
const AdminBlogCategoriesPage  = lazy(() => import('@presentation/pages/admin/AdminBlogCategoriesPage'));
const AdminDocumentationPage  = lazy(() => import('@presentation/pages/admin/AdminDocumentationPage'));
const AdminApiDocumentationPage = lazy(() => import('@presentation/pages/admin/AdminApiDocumentationPage'));
const AdminSystemStatusPage   = lazy(() => import('@presentation/pages/admin/AdminSystemStatusPage'));
const AdminCfdiPage           = lazy(() => import('@presentation/pages/admin/AdminCfdiPage'));
const AdminQuotationsPage     = lazy(() => import('@presentation/pages/admin/AdminQuotationsPage'));
const AdminQuotationDetailPage  = lazy(() => import('@presentation/pages/admin/AdminQuotationDetailPage'));
const AdminNotificationsPage    = lazy(() => import('@presentation/pages/admin/AdminNotificationsPage'));
const AdminProfilePage          = lazy(() => import('@presentation/pages/admin/AdminProfilePage'));
const NotFoundPage              = lazy(() => import('@presentation/pages/NotFoundPage'));
import logoROKE from "@presentation/assets/logo_v4.png";

const AdminLayout = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { logout, isAuthenticated } = useAuth();
  const { data: user, isLoading: meLoading, isFetching: meFetching } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ '/admin/blog': true, '/admin/documentation': true });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: ticketsStats } = useAdminTicketsStats();
  const { data: invoicesStats } = useAdminInvoicesStats();
  const {
    results: searchResults, isLoading: isSearching, search, clearSearch,
    popularQueries, recentSearches, addRecentSearch, clearRecentSearches,
  } = useGlobalSearch();

  const profileRef = useRef<HTMLDivElement>(null!);
  const searchInputRef = useRef<HTMLInputElement>(null!);
  const isDark = theme === "dark";

  const badgeCounts = useMemo(() => {
    const tStats = (ticketsStats as any)?.data;
    const iStats = (invoicesStats as any)?.data;
    return {
      tickets_open: tStats?.open || tStats?.data?.open || 0,
      invoices_pending: iStats?.pending || iStats?.data?.pending || 0,
    };
  }, [ticketsStats, invoicesStats]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileMenuOpen(false);
    setIsSearchOpen(false);
    setExpandedMenus(prev => {
      const next: Record<string, boolean> = {};
      for (const key of Object.keys(prev)) {
        if (location.pathname.startsWith(key)) next[key] = true;
      }
      return next;
    });
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileMenuOpen(false);
    }
    if (isProfileMenuOpen) { document.addEventListener('mousedown', handleClickOutside); }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }
      if (e.key === 'Escape') { setIsSearchOpen(false); setIsSidebarOpen(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); setIsSidebarCollapsed(prev => !prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredSearch = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchResults.length > 0
      ? searchResults.slice(0, 8)
      : (searchItems as any[]).filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8);
  }, [searchQuery, searchResults]);

  const isParentActive = useCallback((item: any) => item.expandable && item.children ? item.children.some((child: any) => location.pathname.startsWith(child.href)) : location.pathname.startsWith(item.href), [location.pathname]);

  const toggleMenu = useCallback((key: string) => {
    setExpandedMenus(prev => {
      // Si ya está abierto, lo cerramos
      if (prev[key]) return { ...prev, [key]: false };
      // Si está cerrado, cerramos todos los demás y abrimos solo este
      return { [key]: true };
    });
  }, []);

  const handleSearchQueryChange = useCallback((q: string) => { setSearchQuery(q); search(q); }, [search]);

  const handleSearchSelect = useCallback((item: any) => {
    navigate(item.href);
    setIsSearchOpen(false);
    setSearchQuery('');
    clearSearch();
    if (item.type) addRecentSearch(item);
  }, [navigate, clearSearch, addRecentSearch]);

  const handlePopularClick = useCallback((q: string) => {
    setSearchQuery(q);
    search(q);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [search]);

  const handleLogout = useCallback(async () => { try { await logout(); navigate('/login'); } catch {}; }, [logout, navigate]);

  const { showWarning: sessionWarning, remainingSeconds: sessionRemaining, extendSession, forceLogout } = useSessionManager(isAuthenticated, handleLogout);

  return (
    <div className="min-h-screen bg-background">
      <a href="#admin-main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-foreground focus:text-background focus:text-sm focus:font-semibold focus:shadow-lg">{t('a11y.skipToContent')}</a>

      <SessionTimeoutModal
        open={sessionWarning}
        remainingSeconds={sessionRemaining}
        onExtend={extendSession}
        onLogout={forceLogout}
      />

      {isSearchOpen && (
        <div className="fixed inset-0 z-[49]" onClick={() => setIsSearchOpen(false)} />
      )}

      <AdminHeader
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed}
        isDark={isDark} toggleTheme={toggleTheme} user={user} isLoadingUser={meLoading || meFetching}
        isProfileMenuOpen={isProfileMenuOpen} setIsProfileMenuOpen={setIsProfileMenuOpen}
        profileRef={profileRef} handleLogout={handleLogout}
        isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery} setSearchQuery={handleSearchQueryChange}
        isSearching={isSearching} filteredSearch={filteredSearch}
        onSearchSelect={handleSearchSelect}
        recentSearches={recentSearches} popularQueries={popularQueries}
        onClearRecent={clearRecentSearches} onPopularClick={handlePopularClick}
        searchInputRef={searchInputRef}
      />

      <AdminProfileDropdown isOpen={isProfileMenuOpen} onClose={() => setIsProfileMenuOpen(false)} user={user} handleLogout={handleLogout} />

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className={cn("fixed left-0 top-16 bottom-0 z-40 bg-card border-r border-border transition-[width] duration-150 ease-in-out hidden lg:flex lg:flex-col", isSidebarCollapsed ? "w-[72px]" : "w-[280px]")}>
          <AdminSidebar isCollapsed={isSidebarCollapsed} expandedMenus={expandedMenus} toggleMenu={toggleMenu} isParentActive={isParentActive} badgeCounts={badgeCounts} />
          {!isSidebarCollapsed && (
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Sistema Operativo</span>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
          )}
        </AnimatePresence>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed left-0 top-16 bottom-0 z-50 w-[280px] bg-card border-r border-border lg:hidden flex flex-col">
              <nav className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(navigationConfig).map(([sectionKey, sectionItems]) => {
                  const sectionMeta = sectionLabels[sectionKey];
                  if (!sectionMeta) return null;
                  return (
                    <div key={sectionKey}>
                      <div className="flex items-center gap-2 mb-3">
                        <sectionMeta.icon className="w-4 h-4 text-muted-foreground/60" />
                        <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">{sectionMeta.label}</span>
                      </div>
                      <div className="space-y-1">
                        {sectionItems.map((item: any) => {
                          const Icon = item.icon;
                          const isActive = isParentActive(item);
                          const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : null;
                          if (item.expandable && item.children) {
                            const isExpanded = expandedMenus[item.href];
                            return (
                              <div key={item.name}>
                                <button onClick={() => toggleMenu(item.href)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors", isActive ? "bg-primary/10 text-primary" : "hover:bg-accent")}>
                                  <Icon className="w-5 h-5" />
                                  <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                                </button>
                                {isExpanded && (
                                  <div className="ml-6 mt-1 space-y-1">
                                    {item.children.map((child: any) => {
                                      const ChildIcon = child.icon;
                                      const isChildActive = location.pathname === child.href;
                                      return (
                                        <Link key={child.name} to={child.href} onClick={() => setIsSidebarOpen(false)} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isChildActive ? "text-primary font-medium" : "text-muted-foreground hover:bg-accent")}>
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
                            <Link key={item.name} to={item.href} onClick={() => setIsSidebarOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors", isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
                              <Icon className="w-5 h-5" />
                              <span className="text-sm font-medium">{item.name}</span>
                              {badgeCount > 0 && <span className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] font-bold rounded-full bg-red-500 text-white flex items-center justify-center">{badgeCount > 99 ? '99+' : badgeCount}</span>}
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

        {/* Main content */}
        <main id="admin-main-content" tabIndex={-1} className={cn("flex-1 min-h-[calc(100vh-4rem)] overflow-y-auto outline-none", isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]")}>
          <div className="container-premium section-padding">
            <SectionErrorBoundary name="admin-main" fallbackMsg="Ocurrió un error en esta sección. Puedes reintentar sin perder el menú de navegación.">
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[52vh] gap-8 select-none">
                  <div className="relative">
                    <div className="absolute -inset-6 rounded-3xl bg-primary/5 blur-2xl" />
                    <img src={logoROKE} alt="ROKE Industries" className="relative h-12 w-auto object-contain drop-shadow-sm opacity-80" />
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="block h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: `${i * 180}ms`, animationDuration: '900ms' }} />
                    ))}
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="services" element={<AdminServicesPage />} />
                  <Route path="services/:uuid" element={<AdminServiceDetailPage />} />
                  <Route path="service-plans" element={<AdminServicePlansPage />} />
                  <Route path="add-ons" element={<AdminAddOnsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="invoices" element={<AdminInvoicesPage />} />
                  <Route path="tickets" element={<AdminTicketsPage />} />
                  <Route path="blog" element={<AdminBlogPage />} />
                  <Route path="blog/new" element={<AdminBlogEditorPage />} />
                  <Route path="blog/edit/:uuid" element={<AdminBlogEditorPage />} />
                  <Route path="blog/categories" element={<AdminBlogCategoriesPage />} />
                  <Route path="documentation" element={<AdminDocumentationPage />} />
                  <Route path="api-docs" element={<AdminApiDocumentationPage />} />
                  <Route path="system-status" element={<AdminSystemStatusPage />} />
                  <Route path="game-servers" element={<Navigate to="/admin/services" replace />} />
                  <Route path="cfdi" element={<AdminCfdiPage />} />
                  <Route path="quotations" element={<AdminQuotationsPage />} />
                  <Route path="quotations/:uuid" element={<AdminQuotationDetailPage />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                  <Route path="profile" element={<AdminProfilePage />} />
                  <Route path="*" element={<NotFoundPage />} />
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
