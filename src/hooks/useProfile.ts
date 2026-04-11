import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import profileService from '@/services/profileService';
import { queryConfigs } from '@/config/queryConfig';
import type { Profile, SecurityInfo } from '@/types/models';

interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const useProfile = (options = {}): UseQueryResult<Profile> => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    select: (data) => data.data,
    ...queryConfigs.sensitive,
    ...options,
  });
};

export const useUpdateProfile = (): UseMutationResult<
  Awaited<ReturnType<typeof profileService.updateProfile>>,
  Error,
  UpdateProfilePayload
> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: profileService.updateProfile,
    onMutate: async (newProfile) => {
      await qc.cancelQueries({ queryKey: ['profile'] });
      const previousProfile = qc.getQueryData(['profile']);
      qc.setQueryData(['profile'], (old: { data: Profile } | undefined) => ({
        ...old,
        data: { ...old?.data, ...newProfile },
      }));
      return { previousProfile };
    },
    onError: (_err, _newProfile, context) => {
      qc.setQueryData(['profile'], context?.previousProfile);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUploadAvatar = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: (data) => {
      const newAvatarUrl = data.data.avatar_url;
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      qc.setQueryData(['profile'], (old: { data: Profile } | undefined) => ({
        ...old,
        data: { ...old?.data, avatar_url: newAvatarUrl },
      }));
      qc.setQueryData(['auth', 'me'], (old: { data: Profile } | undefined) => ({
        ...old,
        data: { ...old?.data, avatar_url: newAvatarUrl },
      }));
    },
  });
};

export const useSecurity = (options = {}): UseQueryResult<SecurityInfo> => {
  return useQuery({
    queryKey: ['security'],
    queryFn: profileService.getSecurity,
    select: (data) => data.data,
    ...queryConfigs.sensitive,
    ...options,
  });
};

export const useUpdatePassword = (): UseMutationResult<
  { message: string },
  Error,
  UpdatePasswordPayload
> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: profileService.updatePassword,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['security'] });
    },
  });
};
