import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import authService from '@infrastructure/services/authService';

interface SessionConfig {
  inactivityTimeout: number;
  warningLeadTime: number;
  sessionCheckInterval: number;
}

const DEFAULT_CONFIG: SessionConfig = {
  inactivityTimeout: 15 * 60 * 1000,
  warningLeadTime: 2 * 60 * 1000,
  sessionCheckInterval: 5 * 60 * 1000,
};

interface UseSessionManagerReturn {
  showWarning: boolean;
  remainingSeconds: number;
  extendSession: () => void;
  forceLogout: () => void;
}

export function useSessionManager(
  isAuthenticated: boolean,
  logout: () => Promise<void> | void,
  config: Partial<SessionConfig> = {},
): UseSessionManagerReturn {
  const { inactivityTimeout, warningLeadTime, sessionCheckInterval } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current !== null) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startInactivityTimers = useCallback(() => {
    clearTimers();

    warningTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = inactivityTimeout - elapsed;

      if (remaining <= 0) {
        clearTimers();
        setShowWarning(false);
        logout();
        return;
      }

      if (remaining <= warningLeadTime) {
        setShowWarning(true);
        setRemainingSeconds(Math.ceil(remaining / 1000));
      } else {
        setShowWarning(false);
      }
    }, 1000);
  }, [inactivityTimeout, warningLeadTime, clearTimers, logout]);

  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setRemainingSeconds(0);
    clearTimers();
    startInactivityTimers();
  }, [clearTimers, startInactivityTimers]);

  const forceLogout = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    logout();
  }, [clearTimers, logout]);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning((prev) => {
      if (prev) {
        extendSession();
      }
      return prev;
    });
  }, [extendSession]);

  // ── Configurar event listeners + timers ─────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      setShowWarning(false);
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;
    const cleanups: (() => void)[] = [];

    events.forEach((event) => {
      const handler = () => handleActivity();
      window.addEventListener(event, handler, { passive: true });
      cleanups.push(() => window.removeEventListener(event, handler));
    });

    startInactivityTimers();

    return () => {
      clearTimers();
      cleanups.forEach((fn) => fn());
    };
  }, [isAuthenticated]);

  // ── Countdown en tiempo real ────────────────────────────────────
  useEffect(() => {
    if (!showWarning) {
      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((inactivityTimeout - (Date.now() - lastActivityRef.current)) / 1000));
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearTimers();
        setShowWarning(false);
        logout();
      }
    }, 500);

    return () => {
      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [showWarning, inactivityTimeout, clearTimers, logout]);

  // ── Verificación periódica de sesión contra backend ─────────────
  const { isError: sessionError } = useQuery({
    queryKey: ['session-health', 'ping'],
    queryFn: ({ signal }) => authService.getCurrentUser(signal),
    enabled: isAuthenticated,
    refetchInterval: sessionCheckInterval,
    retry: false,
  });

  useEffect(() => {
    if (sessionError && isAuthenticated) {
      clearTimers();
      setShowWarning(false);
      logout();
    }
  }, [sessionError, isAuthenticated, clearTimers, logout]);

  return { showWarning, remainingSeconds, extendSession, forceLogout };
}
