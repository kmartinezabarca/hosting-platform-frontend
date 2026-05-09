import React from 'react';
import { User, Shield, MonitorSmartphone, Receipt } from 'lucide-react';
import { cn } from '@shared/utils/utils';

const ProfileTabs = ({ activeTab, onTabChange, children }) => {
  const tabs = [
    { id: 'profile',  label: 'Información Personal', icon: User },
    { id: 'fiscal',   label: 'Facturación',           icon: Receipt },
    { id: 'security', label: 'Seguridad',              icon: Shield },
    { id: 'devices',  label: 'Dispositivos',           icon: MonitorSmartphone },
  ];

  return (
    <div className="space-y-8">
      {/* Tab navigation */}
      <div className="bg-card border border-border/60 rounded-2xl p-1.5 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex-shrink-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:ring-primary/80',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-foreground border border-emerald-500/20 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-in fade-in duration-200">
        {children}
      </div>
    </div>
  );
};

export default ProfileTabs;
