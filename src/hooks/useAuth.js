import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import authService from '../services/authService';

/**
 * Hook para iniciar sesión
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      // Al hacer login, invalidamos la query del usuario para que se refresque.
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      console.error("Error al iniciar sesión", error);
    },
  });
};

/**
 * Hook para iniciar sesión con Google
 */
export const useLoginWithGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.loginWithGoogle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      console.error("Error al iniciar sesión con Google", error);
    },
  });
};

/**
 * Hook para registrar usuario
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      // Al registrarse, invalidamos la query del usuario para que se refresque.
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      console.error("Error al registrar usuario", error);
    },
  });
};

/**
 * Hook para verificar 2FA
 */
export const useVerify2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.verify2FA,
    onSuccess: () => {
      // Al verificar 2FA, invalidamos la query del usuario para que se refresque.
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      console.error("Error al verificar 2FA", error);
    },
  });
};

/**
 * Hook para cerrar sesión
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Al hacer logout, removemos la query del usuario de la caché.
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      // Opcional: setear los datos a null para una actualización instantánea en la UI
      queryClient.setQueryData(['auth', 'me'], null);
    },
    onError: (error) => {
      console.error("Error al cerrar sesión", error);
    },
  });
};



/**
 * Hook para obtener el usuario actual con React Query
 */
export const useCurrentUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async ({ signal }) => {
      const localUserData = localStorage.getItem("user_data");
      if (localUserData && !options.forceRefetch) {
        return JSON.parse(localUserData);
      }
      const apiData = await authService.fetchCurrentUser(signal);
      localStorage.setItem("user_data", JSON.stringify(apiData));
      return apiData;
    },
    select: (data) => data.data || data, // Asegura que siempre se extraiga el objeto de usuario
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutos
    cacheTime: options.cacheTime ?? 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchOnMount: options.refetchOnMount ?? false,
    enabled: options.enabled ?? authService.isAuthenticated(), // Solo habilitar si hay token
    onError: (error) => {
      console.error("Error al obtener el usuario actual:", error);
      // Si hay un error (ej. token inválido), limpiar el token y los datos del usuario
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        queryClient.setQueryData(["auth", "me"], null);
      }
    },

  });
};


