import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración avanzada de React Query
 */
export const queryConfig = {
  defaultOptions: {
    queries: {
      // Configuraciones globales para queries
      staleTime: 5 * 60 * 1000, // 5 minutos por defecto
      cacheTime: 15 * 60 * 1000, // 15 minutos por defecto
      refetchOnWindowFocus: false, // No refrescar al enfocar ventana por defecto
      refetchOnMount: true, // Refrescar al montar componente
      refetchOnReconnect: true, // Refrescar al reconectar
      retry: (failureCount, error) => {
        // Lógica de retry personalizada
        if (error?.response?.status === 401) {
          // No reintentar en errores de autenticación
          return false;
        }
        if (error?.response?.status >= 500) {
          // Reintentar hasta 3 veces en errores de servidor
          return failureCount < 3;
        }
        // Para otros errores, reintentar hasta 2 veces
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Configuraciones globales para mutations
      retry: (failureCount, error) => {
        // No reintentar mutations por defecto, excepto errores de red
        if (error?.code === 'NETWORK_ERROR') {
          return failureCount < 2;
        }
        return false;
      },
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
};

/**
 * Crear instancia de QueryClient con configuración personalizada
 */
export const createQueryClient = () => {
  return new QueryClient(queryConfig);
};

/**
 * Configuraciones específicas por tipo de dato
 */
export const queryConfigs = {
  // Datos estáticos (categorías, ciclos de facturación)
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutos
    cacheTime: 60 * 60 * 1000, // 1 hora
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Datos dinámicos (dashboard, estadísticas)
  dynamic: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    cacheTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Auto-refetch cada 5 minutos
  },
  
  // Datos sensibles (perfil, seguridad)
  sensitive: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },
  
  // Datos de sesión (dispositivos activos)
  session: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    cacheTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
};

