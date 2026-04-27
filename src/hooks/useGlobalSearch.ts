import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import globalSearchService from '@/services/globalSearchService';

export const useGlobalSearch = () => {
  const [query, setQuery] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['global-search', query],
    queryFn: () => globalSearchService.search(query),
    enabled: query.trim().length >= 2,
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
  });

  const search = useCallback((newQuery: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    results: (data as any)?.data || [],
    isLoading: isLoading || isFetching,
    search,
    clearSearch,
    hasResults: ((data as any)?.data?.length || 0) > 0,
  };
};
