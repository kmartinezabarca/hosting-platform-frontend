import React, { useState } from 'react';
import { Shield, Lock, KeyRound, AlertTriangle, CheckCircle2, QrCode, Smartphone } from 'lucide-react';
import FormField from './FormField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { cn } from '../../lib/utils';

const SecuritySection = ({ 
  security, 
  onPasswordUpdate, 
  on2FAGenerate, 
  on2FAEnable, 
  on2FADisable,
  qrCode,
  twoFactorSecret,
  saving2FA,
  savingPassword 
}) => {
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});

  const validatePassword = (field, value) => {
    const errors = { ...passwordErrors };

    switch (field) {
      case 'current':
        if (!value.trim()) {
          errors.current = 'La contraseña actual es requerida';
        } else {
          delete errors.current;
        }
        break;

      case 'new':
        if (!value) {
          errors.new = 'La nueva contraseña es requerida';
        } else if (value.length < 8) {
          errors.new = 'La contraseña debe tener al menos 8 caracteres';
        } else if (!/(?=.*[a-z])/.test(value)) {
          errors.new = 'Debe contener al menos una letra minúscula';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          errors.new = 'Debe contener al menos una letra mayúscula';
        } else if (!/(?=.*\d)/.test(value)) {
          errors.new = 'Debe contener al menos un número';
        } else if (value === passwordData.current) {
          errors.new = 'La nueva contraseña debe ser diferente a la actual';
        } else {
          delete errors.new;
        }
        break;

      case 'confirm':
        if (!value) {
          errors.confirm = 'Confirma tu nueva contraseña';
        } else if (value !== passwordData.new) {
          errors.confirm = 'Las contraseñas no coinciden';
        } else {
          delete errors.confirm;
        }
        break;

      default:
        break;
    }

    setPasswordErrors(errors);
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    validatePassword(field, value);
    
    // Re-validar confirmación si cambia la nueva contraseña
    if (field === 'new' && passwordData.confirm) {
      validatePassword('confirm', passwordData.confirm);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    Object.keys(passwordData).forEach(key => {
      validatePassword(key, passwordData[key]);
    });

    if (Object.keys(passwordErrors).length === 0) {
      onPasswordUpdate({
        current_password: passwordData.current,
        password: passwordData.new,
        password_confirmation: passwordData.confirm
      });
    }
  };

  const handle2FAEnable = () => {
    if (verificationCode.length === 6) {
      on2FAEnable(verificationCode);
    }
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSecurityScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      {/* Score de seguridad */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Puntuación de Seguridad
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Evalúa la fortaleza de tu cuenta
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {security.security_score}%
            </span>
            <span className={cn('text-sm font-medium', getSecurityScoreColor(security.security_score))}>
              {security.security_score >= 80 ? 'Excelente' :
               security.security_score >= 60 ? 'Buena' : 'Necesita mejoras'}
            </span>
          </div>

          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={cn('h-full transition-all duration-500', getSecurityScoreBg(security.security_score))}
              style={{ width: `${security.security_score}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className={cn(
                'w-2 h-2 rounded-full',
                security.two_factor_enabled ? 'bg-green-500' : 'bg-red-500'
              )} />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Autenticación 2FA
              </span>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full ml-auto',
                security.two_factor_enabled 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              )}>
                {security.two_factor_enabled ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Contraseña fuerte
              </span>
              <span className="text-xs px-2 py-1 rounded-full ml-auto bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                Activo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Autenticación de dos factores */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Autenticación de Dos Factores (2FA)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Añade una capa extra de seguridad a tu cuenta
            </p>
          </div>
          <div className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium',
            security.two_factor_enabled
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          )}>
            {security.two_factor_enabled ? 'Activado' : 'Desactivado'}
          </div>
        </div>

        {!security.two_factor_enabled && !qrCode && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Mejora tu seguridad
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    La autenticación de dos factores protege tu cuenta incluso si alguien conoce tu contraseña.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={on2FAGenerate}
              disabled={saving2FA}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-blue-600 hover:bg-blue-700 text-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {saving2FA ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Configurar 2FA
                </>
              )}
            </button>
          </div>
        )}

        {!security.two_factor_enabled && qrCode && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  1. Escanea el código QR
                </h4>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <img src={qrCode} alt="QR Code 2FA" className="mx-auto max-w-full h-auto" />
                </div>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Clave manual (alternativa):
                  </h5>
                  <code className="block text-sm p-3 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono break-all">
                    {twoFactorSecret}
                  </code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  2. Ingresa el código de verificación
                </h4>
                
                <FormField
                  label="Código de 6 dígitos"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  icon={KeyRound}
                  maxLength={6}
                />

                <div className="flex gap-3">
                  <button
                    onClick={handle2FAEnable}
                    disabled={saving2FA || verificationCode.length !== 6}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                      'bg-green-600 hover:bg-green-700 text-white',
                      'focus:outline-none focus:ring-2 focus:ring-green-500/20',
                      'transition-all duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {saving2FA ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Activando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Activar 2FA
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setVerificationCode('');
                      // Aquí llamarías a una función para cancelar el proceso
                    }}
                    className={cn(
                      'px-4 py-2 rounded-lg',
                      'border border-slate-300 dark:border-slate-600',
                      'text-slate-700 dark:text-slate-300',
                      'hover:bg-slate-100 dark:hover:bg-slate-700',
                      'focus:outline-none focus:ring-2 focus:ring-slate-500/20',
                      'transition-all duration-200'
                    )}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {security.two_factor_enabled && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    2FA Activado
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Tu cuenta está protegida con autenticación de dos factores.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={on2FADisable}
              disabled={saving2FA}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                'border border-red-300 dark:border-red-700',
                'text-red-700 dark:text-red-300',
                'hover:bg-red-50 dark:hover:bg-red-900/20',
                'focus:outline-none focus:ring-2 focus:ring-red-500/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {saving2FA ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  Desactivando...
                </>
              ) : (
                'Desactivar 2FA'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Cambio de contraseña */}
      <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Cambiar Contraseña
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Última actualización: {security.password_last_changed 
                ? new Date(security.password_last_changed).toLocaleDateString('es-ES')
                : 'Nunca'
              }
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <FormField
            label="Contraseña actual"
            type="password"
            value={passwordData.current}
            onChange={(e) => handlePasswordChange('current', e.target.value)}
            placeholder="Tu contraseña actual"
            icon={Lock}
            error={passwordErrors.current}
            showPasswordToggle
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                label="Nueva contraseña"
                type="password"
                value={passwordData.new}
                onChange={(e) => handlePasswordChange('new', e.target.value)}
                placeholder="Tu nueva contraseña"
                icon={Lock}
                error={passwordErrors.new}
                showPasswordToggle
                required
              />
              
              {passwordData.new && (
                <PasswordStrengthIndicator password={passwordData.new} />
              )}
            </div>

            <FormField
              label="Confirmar nueva contraseña"
              type="password"
              value={passwordData.confirm}
              onChange={(e) => handlePasswordChange('confirm', e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              icon={Lock}
              error={passwordErrors.confirm}
              showPasswordToggle
              required
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setPasswordData({ current: '', new: '', confirm: '' });
                setPasswordErrors({});
              }}
              className={cn(
                'px-4 py-2 rounded-lg',
                'border border-slate-300 dark:border-slate-600',
                'text-slate-700 dark:text-slate-300',
                'hover:bg-slate-100 dark:hover:bg-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-slate-500/20',
                'transition-all duration-200'
              )}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={savingPassword || Object.keys(passwordErrors).length > 0 || !passwordData.current || !passwordData.new || !passwordData.confirm}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-2 rounded-lg',
                'bg-blue-600 hover:bg-blue-700 text-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {savingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Actualizar contraseña
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SecuritySection;

