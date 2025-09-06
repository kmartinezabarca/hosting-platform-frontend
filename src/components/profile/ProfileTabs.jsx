import React from 'react';
import { User, Shield, MonitorSmartphone } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Un componente de pestañas de perfil con un diseño de "tarjetas" o "píldoras",
 * utilizando la paleta de colores del portal para una apariencia consistente.
 *
 * @param {object} props
 * @param {'profile' | 'security' | 'devices'} props.activeTab - El ID de la pestaña activa.
 * @param {function} props.onTabChange - Callback que se ejecuta al cambiar de pestaña.
 * @param {React.ReactNode} props.children - El contenido de la pestaña activa que se renderizará.
 */
const ProfileTabs = ({ activeTab, onTabChange, children }) => {
  const tabs = [
    { id: 'profile', label: 'Información Personal', icon: User },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'devices', label: 'Dispositivos', icon: MonitorSmartphone },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-muted/50 p-1.5 rounded-2xl">
        <div className="flex items-center gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex-1 flex items-center justify-center gap-2.5 px-3 py-3 text-sm font-medium rounded-xl transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-muted/50 focus-visible:ring-primary/80',
                  isActive
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-primary' : ''
                  )}
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {children}
      </div>
    </div>
  );
};

export default ProfileTabs;
