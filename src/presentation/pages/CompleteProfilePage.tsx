import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, AtSign, CheckCircle2, Loader2 } from 'lucide-react';
import authService from '@infrastructure/services/authService';
import { useCompleteProfile } from '@application/hooks/useAuth';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

export default function CompleteProfilePage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const state = (location.state as any) || {};
  const query = new URLSearchParams(location.search);
  const setupToken = state.setup_token || query.get('setup_token') || '';
  const preview = state.user_preview || {};

  const completeProfile = useCompleteProfile();

  useEffect(() => {
    if (!setupToken) navigate('/login', { replace: true });
  }, [setupToken, navigate]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!username) {
      setStatus('idle');
      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      setStatus('invalid');
      return;
    }
    setStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await authService.checkUsernameAvailability(username);
        setStatus(result.available ? 'available' : 'taken');
      } catch {
        setStatus('idle');
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  const canSubmit = useMemo(() => status === 'available' && !completeProfile.isPending, [status, completeProfile.isPending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!USERNAME_REGEX.test(username)) {
      setError('El username debe tener 3-30 caracteres y solo usar letras, números, guion o guion bajo.');
      return;
    }
    if (status !== 'available') {
      setError('El username no está disponible.');
      return;
    }
    setError('');
    try {
      const response: any = await completeProfile.mutateAsync({
        setup_token: setupToken,
        username,
      });
      navigate(response?.redirect_to || '/client/dashboard', { replace: true });
    } catch (err: any) {
      const code = err?.response?.data?.error_code;
      const message = err?.response?.data?.message || err?.message || 'No se pudo completar el registro.';
      if (code === 'SETUP_TOKEN_EXPIRED') {
        navigate('/login', { replace: true, state: { message: 'Tu sesión de Google expiró. Inicia sesión nuevamente.' } });
        return;
      }
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 space-y-6">
        <div className="text-center space-y-2">
          {preview?.avatar_url ? (
            <img src={preview.avatar_url} alt="Avatar" className="mx-auto w-16 h-16 rounded-full border border-border object-cover" />
          ) : null}
          <h1 className="text-2xl font-bold text-foreground">Completa tu registro</h1>
          <p className="text-sm text-muted-foreground">Solo falta elegir tu nombre de usuario.</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
          <p className="font-medium text-foreground">{preview?.first_name} {preview?.last_name}</p>
          <p className="text-muted-foreground">{preview?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-foreground">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background text-foreground"
                placeholder="kmartinez"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {status === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {status === 'available' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {(status === 'taken' || status === 'invalid') && <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">3-30 caracteres · letras, números, - y _</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.5 rounded-xl bg-foreground text-background font-semibold disabled:opacity-50"
          >
            {completeProfile.isPending ? 'Completando...' : 'Completar registro'}
          </button>
        </form>
      </div>
    </div>
  );
}
