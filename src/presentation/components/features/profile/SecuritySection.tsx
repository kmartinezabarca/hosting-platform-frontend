import React, { useState } from 'react';
import { Shield, Lock, KeyRound, CheckCircle2, QrCode, Smartphone, Chrome, AlertTriangle } from 'lucide-react';
import FormField from '@presentation/components/features/profile/FormField';
import PasswordStrengthIndicator from '@presentation/components/features/profile/PasswordStrengthIndicator';
import { cn } from '@shared/utils/utils';
import { toast } from "@presentation/components/features/ToastProvider";

/* ── Section card wrapper ───────────────────────────────────────────────── */
const SectionCard = ({ icon: Icon, title, description, badge = null, children }: { icon: any; title: any; description?: any; badge?: any; children: any }) => (
  <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
    <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-foreground/[0.07] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-foreground/70" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground leading-snug">{description}</p>}
      </div>
      {badge}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/* ── Security score helpers ─────────────────────────────────────────────── */
const scoreLabel = (s) => s >= 80 ? 'Excelente' : s >= 60 ? 'Buena' : 'Necesita mejoras';
const scoreColor = (s) => s >= 80 ? 'text-emerald-600 dark:text-emerald-400' : s >= 60 ? 'text-amber-500' : 'text-red-500';
const scoreBar   = (s) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500';

/* ── Status chip ────────────────────────────────────────────────────────── */
const StatusChip = ({ active, labelOn, labelOff }) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
    active
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
      : 'bg-red-500/10 text-red-500 border border-red-500/20'
  )}>
    <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-red-500')} />
    {active ? labelOn : labelOff}
  </span>
);

/* ── Score item row ─────────────────────────────────────────────────────── */
const ScoreItem = ({ active, label }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/40">
    <span className={cn('w-2 h-2 rounded-full shrink-0', active ? 'bg-emerald-500' : 'bg-red-500')} />
    <span className="text-sm text-foreground flex-1">{label}</span>
    <StatusChip active={active} labelOn="Activo" labelOff="Inactivo" />
  </div>
);

/* ── Main component ─────────────────────────────────────────────────────── */
const SecuritySection = ({
  security,
  onPasswordUpdate,
  on2FAGenerate,
  on2FAEnable,
  on2FADisable,
  qrCode,
  twoFactorSecret,
  saving2FA,
  savingPassword,
  isGoogleUser = false,
}) => {
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [passwordErrors,   setPasswordErrors]   = useState<Record<string, string>>({});

  /* ── Password validation ─────────────────────────────────────────────── */
  const validatePassword = (field, value) => {
    const errs = { ...passwordErrors };
    switch (field) {
      case 'current':
        if (!value?.trim()) errs.current = 'La contraseña actual es requerida';
        else                delete errs.current;
        break;
      case 'new':
        if (!value)                          errs.new = 'La nueva contraseña es requerida';
        else if (value.length < 8)           errs.new = 'Mínimo 8 caracteres';
        else if (!/(?=.*[a-z])/.test(value)) errs.new = 'Debe contener una letra minúscula';
        else if (!/(?=.*[A-Z])/.test(value)) errs.new = 'Debe contener una letra mayúscula';
        else if (!/(?=.*\d)/.test(value))    errs.new = 'Debe contener un número';
        else if (value === passwordData.current) errs.new = 'Debe ser diferente a la actual';
        else                                 delete errs.new;
        break;
      case 'confirm':
        if (!value)                       errs.confirm = 'Confirma tu nueva contraseña';
        else if (value !== passwordData.new) errs.confirm = 'Las contraseñas no coinciden';
        else                              delete errs.confirm;
        break;
      default: break;
    }
    setPasswordErrors(errs);
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    validatePassword(field, value);
    if (field === 'new' && passwordData.confirm) validatePassword('confirm', passwordData.confirm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    Object.keys(passwordData).forEach(k => validatePassword(k, passwordData[k]));
    if (Object.keys(passwordErrors).length === 0) {
      onPasswordUpdate({
        current_password:      passwordData.current,
        password:              passwordData.new,
        password_confirmation: passwordData.confirm,
      });
      // Reset form on success (this should ideally be handled by the parent or via useEffect on savingPassword change)
      // For now, we assume the parent handles the toast.
    } else {
      toast.warning("Por favor, corrige los errores en el formulario de contraseña");
    }
  };

  const handle2FAEnable = () => {
    if (verificationCode.length === 6) {
      on2FAEnable(verificationCode);
    } else {
      toast.warning("Ingresa el código de 6 dígitos");
    }
  };

  /* ── Shared button styles ────────────────────────────────────────────── */
  const btnPrimary = cn(
    'inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium',
    'bg-foreground text-background hover:opacity-90 active:opacity-80',
    'transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
  );
  const btnSecondary = cn(
    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
    'border border-border text-muted-foreground',
    'hover:text-foreground hover:bg-foreground/[0.04]',
    'transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
  );
  const btnDestructive = cn(
    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
    'border border-red-500/30 text-red-500',
    'hover:bg-red-500/[0.06]',
    'transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
  );

  return (
    <div className="space-y-5">

      {/* ── Puntuación de seguridad ────────────────────────────────────── */}
      <SectionCard icon={Shield} title="Puntuación de Seguridad" description="Evalúa la fortaleza de tu cuenta">
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-bold text-foreground tracking-tight leading-none">
                {security.security_score}
                <span className="text-base font-semibold text-muted-foreground">%</span>
              </p>
              <p className={cn('text-sm font-medium mt-1', scoreColor(security.security_score))}>
                {scoreLabel(security.security_score)}
              </p>
            </div>
            {/* Circular-ish score ring (simple) */}
            <div className="text-right text-xs text-muted-foreground">
              Actualizado automáticamente
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', scoreBar(security.security_score))}
              style={{ width: `${security.security_score}%` }}
            />
          </div>

          {/* Score items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <ScoreItem active={security.two_factor_enabled} label="Autenticación 2FA" />
            <ScoreItem active label={isGoogleUser ? 'Vinculado con Google' : 'Contraseña configurada'} />
          </div>
        </div>
      </SectionCard>

      {/* ── 2FA ───────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Smartphone}
        title="Autenticación de Dos Factores"
        description="Añade una capa extra de seguridad a tu cuenta"
        badge={<StatusChip active={security.two_factor_enabled} labelOn="Activado" labelOff="Desactivado" />}
      >
        {/* State: not enabled, no QR yet */}
        {!security.two_factor_enabled && !qrCode && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-foreground/[0.03] border border-border/50">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Mejora tu seguridad</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  La autenticación 2FA protege tu cuenta incluso si alguien conoce tu contraseña.
                </p>
              </div>
            </div>
            <button onClick={on2FAGenerate} disabled={saving2FA} className={btnPrimary}>
              {saving2FA
                ? <><div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />Generando...</>
                : <><QrCode className="w-3.5 h-3.5" />Configurar 2FA</>
              }
            </button>
          </div>
        )}

        {/* State: QR visible */}
        {!security.two_factor_enabled && qrCode && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR side */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                1. Escanea el código QR
              </p>
              <div className="p-4 rounded-xl bg-white border border-border/60 inline-block">
                <img src={qrCode} alt="QR Code 2FA" className="max-w-full h-auto" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Clave manual (alternativa)
                </p>
                <code className="block text-xs p-3 bg-muted/50 border border-border/50 rounded-xl font-mono break-all text-foreground/80">
                  {twoFactorSecret}
                </code>
              </div>
            </div>
            {/* Verify side */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                2. Ingresa el código de verificación
              </p>
              <FormField
                label="Código de 6 dígitos"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                icon={KeyRound}
                maxLength={6}
              />
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handle2FAEnable}
                  disabled={saving2FA || verificationCode.length !== 6}
                  className={cn(btnPrimary, 'flex-1 justify-center')}
                >
                  {saving2FA
                    ? <><div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />Activando...</>
                    : <><CheckCircle2 className="w-3.5 h-3.5" />Activar 2FA</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State: already enabled */}
        {security.two_factor_enabled && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Tu cuenta está protegida</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  La autenticación de dos factores está activa. Se te solicitará un código cada vez que inicies sesión.
                </p>
              </div>
            </div>
            <button onClick={on2FADisable} disabled={saving2FA} className={btnDestructive}>
              {saving2FA
                ? <><div className="w-3.5 h-3.5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />Desactivando...</>
                : 'Desactivar 2FA'
              }
            </button>
          </div>
        )}
      </SectionCard>

      {/* ── Password ──────────────────────────────────────────────────── */}
      {!isGoogleUser && (
        <SectionCard
          icon={Lock}
          title="Cambiar Contraseña"
          description="Actualiza tu contraseña periódicamente para mayor seguridad"
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
            <FormField
              label="Contraseña Actual"
              type="password"
              value={passwordData.current}
              onChange={(e) => handlePasswordChange('current', e.target.value)}
              placeholder="••••••••"
              icon={KeyRound}
              error={passwordErrors.current}
            />
            <div className="space-y-2">
              <FormField
                label="Nueva Contraseña"
                type="password"
                value={passwordData.new}
                onChange={(e) => handlePasswordChange('new', e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                error={passwordErrors.new}
              />
              <PasswordStrengthIndicator password={passwordData.new} />
            </div>
            <FormField
              label="Confirmar Nueva Contraseña"
              type="password"
              value={passwordData.confirm}
              onChange={(e) => handlePasswordChange('confirm', e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              error={passwordErrors.confirm}
            />
            <div className="pt-2">
              <button type="submit" disabled={savingPassword || Object.keys(passwordErrors).length > 0} className={btnPrimary}>
                {savingPassword
                  ? <><div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />Actualizando...</>
                  : 'Actualizar Contraseña'
                }
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* ── Google Account ────────────────────────────────────────────── */}
      {isGoogleUser && (
        <SectionCard
          icon={Chrome}
          title="Cuenta de Google"
          description="Tu cuenta está vinculada con Google"
        >
          <div className="flex items-center gap-4 p-4 rounded-xl bg-foreground/[0.03] border border-border/50">
            <div className="w-10 h-10 rounded-full bg-white border border-border/60 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Iniciando sesión con Google</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                La gestión de tu contraseña se realiza directamente a través de tu cuenta de Google.
              </p>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default SecuritySection;
