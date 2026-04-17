import React from 'react';
import { User, Shield, MonitorSmartphone } from 'lucide-react';
import { cn } from '../../lib/utils';

const tabs = [
  { id: 'profile',  label: 'Información',  icon: User              },
  { id: 'security', label: 'Seguridad',    icon: Shield            },
  { id: 'devices',  label: 'Dispositivos', icon: MonitorSmartphone },
];

const ProfileTabs = ({ activeTab, onTabChange, children }) => (
  <div className="space-y-6">

    {/* Tab bar */}
    <div className="bg-[#F7F8FA] dark:bg-[#0B0C0F] border border-border/60 rounded-2xl p-1.5">
      <div className="flex items-center gap-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20',
                active
                  ? 'bg-white dark:bg-white/[0.07] text-foreground shadow-[0_1px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)] border border-black/[0.06] dark:border-white/[0.08]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-foreground' : 'text-muted-foreground')} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>

    {/* Content */}
    <div>{children}</div>
  </div>
);

export default ProfileTabs;
