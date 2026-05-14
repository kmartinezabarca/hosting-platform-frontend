import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import globalSearchService, { recentSearchStorage, SearchResultItem } from '@infrastructure/services/globalSearchService';

export const useGlobalSearch = () => {
  const [query, setQuery]                 = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<SearchResultItem[]>(() => recentSearchStorage.get());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn:  () => globalSearchService.search(debouncedQuery),
    enabled:  debouncedQuery.trim().length >= 2,
    staleTime: 30 * 1000,
    gcTime:    60 * 1000,
  });

  const { data: popularData } = useQuery({
    queryKey: ['search-popular'],
    queryFn:  () => globalSearchService.getPopular(),
    staleTime: 5 * 60 * 1000,
    gcTime:   10 * 60 * 1000,
  });

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(newQuery), 400);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const addRecentSearch = useCallback((item: SearchResultItem) => {
    recentSearchStorage.add(item);
    setRecentSearches(recentSearchStorage.get());
  }, []);

  const clearRecentSearches = useCallback(() => {
    recentSearchStorage.clear();
    setRecentSearches([]);
  }, []);

  return {
    query,
    results:            ((data as any)?.data  ?? []) as SearchResultItem[],
    isLoading:          isLoading || isFetching,
    search,
    clearSearch,
    hasResults:         ((data as any)?.data?.length ?? 0) > 0,
    popularQueries:     ((popularData as any)?.data  ?? []) as string[],
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
};
