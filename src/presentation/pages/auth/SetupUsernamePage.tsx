import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AtSign, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import authService from '@infrastructure/services/authService';
import { useAuth } from '@application/context/AuthContext';
import logoROKE from '@presentation/assets/ROKEIndustriesFusionLogo.png';

// ── Username validation ────────────────────────────────────────────────────────

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

// ── Page ──────────────────────────────────────────────────────────────────────

/**
 * For authenticated users who don't yet have a username (e.g. legacy Google accounts).
 * Protected — user must already be logged in.
 */
export default function SetupUsernamePage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const { user }    = useAuth();

  const [username, setUsername]       = useState('');
  const [usernameStatus, setStatus]   = useState<UsernameStatus>('idle');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError]             = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced availability check
  const checkAvailability = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value) { setStatus('idle'); return; }
    if (!USERNAME_REGEX.test(value)) { setStatus('invalid'); return; }

    setStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await authService.checkUsernameAvailability(value);
        setStatus(res.available ? 'available' : 'taken');
      } catch {
        setStatus('idle');
      }
    }, 500);
  }, []);

  useEffect(() => {
    checkAvailability(username);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username, checkAvailability]);

  const isValid = usernameStatus === 'available';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setError('');
    setSubmitting(true);
    try {
      await authService.setupUsername(username);
      // Refresh user data so needs_username is cleared
      await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
      navigate('/client/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Error al guardar el nombre de usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : '';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, #B366FF 50%, #0052CC 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(59,130,246,0.1) 0%, transparent 50%),' +
            'radial-gradient(circle at 75% 75%, rgba(139,92,246,0.1) 0%, transparent 50%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div
          className="p-8 space-y-7 rounded-2xl border border-white/20"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 35px 60px -12px rgba(0,0,0,0.3)',
          }}
        >
          {/* Logo */}
          <div className="flex justify-center">
            <img src={logoROKE} alt="ROKE Industries" className="h-14 w-auto" />
          </div>

          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-black">Elige tu username</h2>
            {displayName && (
              <p className="text-black/70 text-sm font-medium">Hola, {displayName}</p>
            )}
            <p className="text-black/55 text-sm leading-relaxed">
              Tu cuenta aún no tiene un nombre de usuario. Elige uno para continuar.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-semibold text-black">
                Nombre de usuario
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  autoComplete="username"
                  autoFocus
                  spellCheck={false}
                  placeholder="ej. kmartinez"
                  className={`w-full pl-10 pr-10 py-3 bg-white border rounded-xl text-[#222222] placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    usernameStatus === 'available'
                      ? 'border-emerald-500 focus:ring-emerald-500'
                      : usernameStatus === 'taken' || usernameStatus === 'invalid'
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#222222]'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking'  && <Loader2      className="w-4 h-4 animate-spin text-gray-400" />}
                  {usernameStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              {/* Status messages */}
              <AnimatePresence mode="wait">
                {usernameStatus === 'available' && (
                  <motion.p key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-emerald-600 pl-1">
                    ¡Disponible!
                  </motion.p>
                )}
                {usernameStatus === 'taken' && (
                  <motion.p key="taken" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-600 pl-1">
                    Este nombre de usuario ya está en uso.
                  </motion.p>
                )}
                {usernameStatus === 'invalid' && (
                  <motion.p key="invalid" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-600 pl-1">
                    Solo letras, números, guion (-) y guion bajo (_). Mínimo 3 caracteres.
                  </motion.p>
                )}
                {usernameStatus === 'idle' && !username && (
                  <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-black/50 pl-1">
                    3-30 caracteres · letras, números, - y _
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Global error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={!isValid || isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#222222] text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Guardar y continuar</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </div>

        <div className="mt-6 text-center text-white/50 text-xs">
          © 2025 ROKE Industries. Todos los derechos reservados.
        </div>
      </motion.div>
    </div>
  );
}
