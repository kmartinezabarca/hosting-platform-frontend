import { useQuery, useQueryClient } from '@tanstack/react-query';
import softwareVersionService, { type SoftwareIdentifier } from '@infrastructure/services/softwareVersionService';

// ── Query keys ────────────────────────────────────────────────────────────────

export const softwareVersionKeys = {
  all:      ['software-versions'] as const,
  versions: (id: string) => ['software-versions', id] as const,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Fetches the available versions for a given software identifier.
 *
 * - React Query caches results for 1 h (backend Redis cache lasts 24 h).
 * - Returns raw list from API — no 'latest' prepended here; component handles it.
 * - Falls back to ["latest"] on error — never throws.
 *
 * @param identifier  e.g. 'paper' | 'purpur' | 'fabric' | 'vanilla' | 'bedrock' | 'velocity' | 'folia'
 * @param enabled     set to false to skip the query (e.g. when no egg is selected)
 */
export const useSoftwareVersions = (
  identifier: SoftwareIdentifier | null | undefined,
  enabled = true,
) => {
  return useQuery({
    queryKey:  softwareVersionKeys.versions(identifier ?? ''),
    queryFn:   () => softwareVersionService.getVersions(identifier as SoftwareIdentifier),
    enabled:   !!identifier && enabled,
    staleTime: 60 * 60 * 1000,  // 1 h — backend caches 24 h, so this is safe
    gcTime:    2 * 60 * 60 * 1000, // keep in memory 2 h
    retry:     1,
  });
};

/**
 * Returns a function to force-invalidate the versions cache for an identifier.
 * Useful if versions are stale from a previous broken backend state.
 */
export const useInvalidateSoftwareVersions = () => {
  const qc = useQueryClient();
  return (identifier?: SoftwareIdentifier) => {
    if (identifier) {
      qc.invalidateQueries({ queryKey: softwareVersionKeys.versions(identifier) });
    } else {
      qc.invalidateQueries({ queryKey: softwareVersionKeys.all });
    }
  };
};
