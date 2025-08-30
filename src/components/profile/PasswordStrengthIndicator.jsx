import React from 'react';
import { cn } from '../../lib/utils';

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /\d/.test(pwd),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      longLength: pwd.length >= 12
    };
    
    // Calcular puntuación
    if (checks.length) score += 20;
    if (checks.lowercase) score += 15;
    if (checks.uppercase) score += 15;
    if (checks.numbers) score += 15;
    if (checks.symbols) score += 20;
    if (checks.longLength) score += 15;
    
    // Determinar etiqueta y color
    let label, color, bgColor;
    if (score < 30) {
      label = 'Muy débil';
      color = 'text-red-600 dark:text-red-400';
      bgColor = 'bg-red-500';
    } else if (score < 50) {
      label = 'Débil';
      color = 'text-orange-600 dark:text-orange-400';
      bgColor = 'bg-orange-500';
    } else if (score < 70) {
      label = 'Regular';
      color = 'text-yellow-600 dark:text-yellow-400';
      bgColor = 'bg-yellow-500';
    } else if (score < 90) {
      label = 'Fuerte';
      color = 'text-blue-600 dark:text-blue-400';
      bgColor = 'bg-blue-500';
    } else {
      label = 'Muy fuerte';
      color = 'text-green-600 dark:text-green-400';
      bgColor = 'bg-green-500';
    }
    
    return { score, label, color, bgColor, checks };
  };

  const strength = calculateStrength(password);
  
  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Fortaleza de contraseña
          </span>
          <span className={cn('text-sm font-medium', strength.color)}>
            {strength.label}
          </span>
        </div>
        
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={cn('h-full transition-all duration-300', strength.bgColor)}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>
      
      {/* Lista de requisitos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className={cn(
          'flex items-center gap-2',
          strength.checks.length ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'
        )}>
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            strength.checks.length ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
          )} />
          Al menos 8 caracteres
        </div>
        
        <div className={cn(
          'flex items-center gap-2',
          strength.checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'
        )}>
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            strength.checks.lowercase ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
          )} />
          Minúsculas (a-z)
        </div>
        
        <div className={cn(
          'flex items-center gap-2',
          strength.checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'
        )}>
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            strength.checks.uppercase ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
          )} />
          Mayúsculas (A-Z)
        </div>
        
        <div className={cn(
          'flex items-center gap-2',
          strength.checks.numbers ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'
        )}>
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            strength.checks.numbers ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
          )} />
          Números (0-9)
        </div>
        
        <div className={cn(
          'flex items-center gap-2',
          strength.checks.symbols ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'
        )}>
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            strength.checks.symbols ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
          )} />
          Símbolos (!@#$...)
        </div>
        
        <div className={cn(
          'flex items-center gap-2',
          strength.checks.longLength ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'
        )}>
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            strength.checks.longLength ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
          )} />
          12+ caracteres
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;

