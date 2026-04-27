import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import fiscalService from '@/services/fiscalService';

type PersonType = 'fisica' | 'moral';

interface HookOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/* ── Query keys ─────────────────────────────────────────── */
export const fiscalKeys = {
  regimes:  (type?: string) => ['fiscal', 'regimes', type ?? 'all'],
  cfdiUses: (type?: string) => ['fiscal', 'cfdi-uses', type ?? 'all'],
  profiles: ['fiscal', 'profiles'],
  profile:  (uuid: any) => ['fiscal', 'profiles', uuid],
};

/* ── Catálogos SAT ──────────────────────────────────────── */

export function useFiscalRegimes(type?: string) {
  return useQuery({
    queryKey: fiscalKeys.regimes(type),
    queryFn: () => fiscalService.getRegimes(type as PersonType | undefined),
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
}

export function useCfdiUses(type?: string) {
  return useQuery({
    queryKey: fiscalKeys.cfdiUses(type),
    queryFn: () => fiscalService.getCfdiUses(type as PersonType | undefined),
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
}

/* ── Perfiles fiscales del usuario ──────────────────────── */

export function useFiscalProfiles() {
  return useQuery({
    queryKey: fiscalKeys.profiles,
    queryFn: fiscalService.getProfiles,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useFiscalProfile(uuid: any) {
  return useQuery({
    queryKey: fiscalKeys.profile(uuid),
    queryFn: () => fiscalService.getProfile(uuid),
    enabled: Boolean(uuid),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateFiscalProfile(options: HookOptions = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fiscalService.createProfile,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: fiscalKeys.profiles });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
}

export function useUpdateFiscalProfile(options: HookOptions = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, ...payload }: { uuid: string; [key: string]: any }) =>
      fiscalService.updateProfile(uuid, payload),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: fiscalKeys.profiles });
      qc.invalidateQueries({ queryKey: fiscalKeys.profile(vars.uuid) });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
}

export function useDeleteFiscalProfile(options: HookOptions = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fiscalService.deleteProfile,
    onSuccess: (data, uuid) => {
      qc.invalidateQueries({ queryKey: fiscalKeys.profiles });
      qc.removeQueries({ queryKey: fiscalKeys.profile(uuid) });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
}

export function useSetDefaultFiscalProfile(options: HookOptions = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fiscalService.setDefault,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: fiscalKeys.profiles });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
}
