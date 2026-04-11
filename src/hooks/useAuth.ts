import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import authService from '@/services/authService';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface Verify2FAPayload {
  code: string;
}

interface GoogleUserData {
  given_name: string;
  family_name?: string;
  email: string;
  sub: string;
  picture?: string | null;
}

type AuthMutation<TVariables> = UseMutationResult<
  Awaited<ReturnType<typeof authService.login>>,
  Error,
  TVariables
>;

export const useLogin = (): AuthMutation<LoginCredentials> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useLoginWithGoogle = (): AuthMutation<GoogleUserData> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.loginWithGoogle,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useRegister = (): AuthMutation<RegisterPayload> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      if (data?.user) {
        qc.setQueryData(['auth', 'me'], { data: data.user });
      } else {
        qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      }
    },
  });
};

export const useVerify2FA = (): AuthMutation<Verify2FAPayload> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.verify2FA,
    onSuccess: (data) => {
      if (data?.user) {
        qc.setQueryData(['auth', 'me'], { data: data.user });
      } else {
        qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      }
    },
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      qc.setQueryData(['auth', 'me'], null);
      qc.removeQueries({ queryKey: ['auth', 'me'] });
    },
  });
};
