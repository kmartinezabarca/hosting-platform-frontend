import React, { useState } from 'react';
import { User, Shield, MonitorSmartphone } from 'lucide-react';
import { cn } from '../../lib/utils';

const ProfileTabs = ({ activeTab, onTabChange, children }) => {
  const [hoveredTab, setHoveredTab] = useState(null);

  const tabs = [
    {
      id: 'profile',
      label: 'Información Personal',
      icon: User,
      description: 'Datos personales y contacto'
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: Shield,
      description: 'Contraseña y autenticación'
    },
    {
      id: 'devices',
      label: 'Dispositivos',
      icon: MonitorSmartphone,
      description: 'Sesiones activas'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Navegación de tabs */}
      <div className="relative">
        {/* Background de la barra de tabs */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 rounded-2xl" />
        
        <div className="relative p-2">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isHovered = hoveredTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={cn(
                    'relative flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    isActive ? [
                      'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm',
                      'border border-slate-200 dark:border-slate-700'
                    ] : [
                      'text-slate-600 dark:text-slate-400',
                      'hover:text-slate-900 dark:hover:text-white',
                      'hover:bg-white/50 dark:hover:bg-slate-900/50'
                    ]
                  )}
                >
                  {/* Indicador de tab activa */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl" />
                  )}
                  
                  <div className="relative flex items-center gap-3">
                    <Icon className={cn(
                      'w-5 h-5 transition-all duration-200',
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-current',
                      isHovered && !isActive && 'scale-110'
                    )} />
                    
                    <div className="text-left hidden sm:block">
                      <div className={cn(
                        'font-medium text-sm',
                        isActive && 'text-slate-900 dark:text-white'
                      )}>
                        {tab.label}
                      </div>
                      <div className={cn(
                        'text-xs transition-opacity duration-200',
                        isActive ? 'text-slate-500 dark:text-slate-400 opacity-100' : 'opacity-0'
                      )}>
                        {tab.description}
                      </div>
                    </div>
                    
                    {/* Solo mostrar label en móvil */}
                    <span className="sm:hidden font-medium text-sm">
                      {tab.label}
                    </span>
                  </div>
                  
                  {/* Indicador de borde inferior para tab activa */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Contenido de las tabs */}
      <div className="relative">
        {/* Animación de entrada */}
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfileTabs;

