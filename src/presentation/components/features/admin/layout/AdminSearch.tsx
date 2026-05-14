import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ExternalLink, ChevronRight, Clock, TrendingUp, X } from 'lucide-react';
import { IconMap } from './navigation.config';
import { SearchResultItem } from '@infrastructure/services/globalSearchService';

interface AdminSearchProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearching: boolean;
  filteredSearch: SearchResultItem[];
  onSelect: (item: SearchResultItem) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  recentSearches: SearchResultItem[];
  popularQueries: string[];
  onClearRecent: () => void;
  onPopularClick: (q: string) => void;
}

export const AdminSearch: React.FC<AdminSearchProps> = ({
  isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery,
  isSearching, filteredSearch, onSelect, searchInputRef,
  recentSearches, popularQueries, onClearRecent, onPopularClick,
}) => {
  const hasQuery   = searchQuery.trim().length >= 2;
  const shortQuery = searchQuery.trim().length === 1;
  const isEmpty    = !searchQuery.trim();

  const showEmpty   = isEmpty && (recentSearches.length > 0 || popularQueries.length > 0);
  const showResults = hasQuery;

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full mt-2 w-full rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden z-[60]"
          role="dialog"
          aria-modal="true"
        >
          {/* Input */}
          <div className="p-2 border-b border-border">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar usuarios, servicios, facturas, tickets..."
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Estado: cargando */}
            {showResults && isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
              </div>
            )}

            {/* Estado: 1 solo carácter */}
            {shortQuery && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Escribe al menos 2 caracteres
              </div>
            )}

            {/* Estado: sin resultados */}
            {showResults && !isSearching && filteredSearch.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No se encontraron resultados para <span className="font-medium text-foreground">"{searchQuery}"</span>
              </div>
            )}

            {/* Estado: resultados de búsqueda */}
            {showResults && !isSearching && filteredSearch.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resultados</p>
                {filteredSearch.map((item) => (
                  <ResultRow key={item.href} item={item} onSelect={onSelect} />
                ))}
              </div>
            )}

            {/* Estado: vacío con recientes y populares */}
            {isEmpty && (
              <div className="p-2 space-y-1">
                {recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recientes</span>
                      </div>
                      <button
                        onClick={onClearRecent}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Limpiar
                      </button>
                    </div>
                    {recentSearches.map((item) => (
                      <ResultRow key={`recent-${item.href}`} item={item} onSelect={onSelect} />
                    ))}
                  </>
                )}

                {popularQueries.length > 0 && (
                  <>
                    <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5">
                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Búsquedas populares</span>
                    </div>
                    <div className="px-3 pb-2 flex flex-wrap gap-2">
                      {popularQueries.map((q) => (
                        <button
                          key={q}
                          onClick={() => onPopularClick(q)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-muted hover:bg-accent border border-border transition-colors"
                        >
                          <Search className="w-3 h-3 text-muted-foreground" />
                          {q}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {recentSearches.length === 0 && popularQueries.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Escribe al menos 2 caracteres para buscar
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ResultRow: React.FC<{ item: SearchResultItem; onSelect: (item: SearchResultItem) => void }> = ({ item, onSelect }) => {
  const Icon = typeof item.icon === 'string' ? (IconMap[item.icon] || Search) : Search;
  const isNavItem = !item.type;

  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors group"
    >
      <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground truncate">{item.category}{item.description ? ` · ${item.description}` : ''}</p>
      </div>
      {isNavItem
        ? <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        : <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      }
    </button>
  );
};
