import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, ChevronLeft, ChevronRight, ChevronDown, Sun, Moon, LogOut, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@presentation/components/ui/skeleton';
import UserAvatar from '@presentation/components/features/UserAvatar';
import NotificationDropdown from '@presentation/components/features/NotificationDropdown';
import logoROKE from "@presentation/assets/logo_v4.png";
import { AdminSearch } from './AdminSearch';

interface AdminHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isDark: boolean;
  toggleTheme: () => void;
  user: any;
  isLoadingUser: boolean;
  isProfileMenuOpen: boolean;
  setIsProfileMenuOpen: (open: boolean) => void;
  profileRef: React.RefObject<HTMLDivElement>;
  handleLogout: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearching: boolean;
  filteredSearch: any[];
  onSearchSelect: (item: any) => void;
  recentSearches: any[];
  popularQueries: string[];
  onClearRecent: () => void;
  onPopularClick: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isSidebarOpen, setIsSidebarOpen, isSidebarCollapsed, setIsSidebarCollapsed,
  isDark, toggleTheme, user, isLoadingUser, isProfileMenuOpen, setIsProfileMenuOpen,
  profileRef, handleLogout,
  isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, isSearching, filteredSearch, onSearchSelect,
  recentSearches, popularQueries, onClearRecent, onPopularClick,
  searchInputRef,
}) => {
  const dir = isDark ? -1 : 1;
  const iconVariants = {
    enter: (d: number) => ({ rotate: d * 90, opacity: 0, scale: 0.9 }),
    center: { rotate: 0, opacity: 1, scale: 1 },
    exit:  (d: number) => ({ rotate: -d * 90, opacity: 0, scale: 0.9 }),
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container-premium">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 px-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:flex p-2 rounded-xl hover:bg-accent transition-colors" title="Colapsar sidebar (Ctrl+B)">
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
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <button
              onClick={() => { setIsSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-border bg-accent/50 hover:bg-accent transition-colors group"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-left text-sm text-muted-foreground">Buscar en el panel...</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground font-mono">⌘ + K</kbd>
            </button>
            <AdminSearch
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              filteredSearch={filteredSearch}
              onSelect={onSearchSelect}
              searchInputRef={searchInputRef}
              recentSearches={recentSearches}
              popularQueries={popularQueries}
              onClearRecent={onClearRecent}
              onPopularClick={onPopularClick}
            />
          </div>

          <div className="flex items-center gap-2 pr-4">
            <button onClick={toggleTheme} className="relative inline-flex size-11 items-center justify-center rounded-2xl leading-none text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <AnimatePresence initial={false} mode="wait" custom={dir}>
                <motion.span key={isDark ? "sun" : "moon"} variants={iconVariants} custom={dir} initial="enter" animate="center" exit="exit" transition={{ duration: 0.18 }} className="absolute inset-0 grid place-items-center">
                  {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <NotificationDropdown isAdmin />
            <div className="relative" ref={profileRef}>
              {isLoadingUser ? <Skeleton className="h-9 w-9 rounded-full" /> : (
                <>
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-accent transition-colors">
                    <UserAvatar user={user} size={32} />
                    <div className="hidden sm:block text-left"><p className="text-sm font-medium text-foreground">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Admin"}</p><p className="text-xs text-muted-foreground">Administrador</p></div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-2 bg-popover border border-border shadow-2xl">
                        <div className="px-3 py-3 border-b border-border"><p className="font-semibold text-foreground">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Administrador"}</p><p className="text-sm text-muted-foreground">{user?.email}</p></div>
                        <div className="py-2"><Link to="/admin/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors"><Users className="w-4 h-4" /><span className="text-sm">Mi Perfil</span></Link></div>
                        <div className="border-t border-border pt-2"><button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full hover:bg-destructive/10 hover:text-destructive transition-colors"><LogOut className="w-4 h-4" /><span className="text-sm">Cerrar Sesión</span></button></div>
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
  );
};
