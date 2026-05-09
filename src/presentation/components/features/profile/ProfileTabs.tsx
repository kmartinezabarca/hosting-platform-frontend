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
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* Sidebar Navigation */}
      <aside className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#101820]">
          <div className="mb-4 px-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Configuración</p>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Tu Cuenta</h2>
          </div>
          <div className="space-y-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200',
                    isActive
                      ? 'bg-[#222] text-white shadow-sm dark:bg-white dark:text-[#101214]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-current' : 'text-slate-400')} />
                  <span className="text-sm font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Administra tu información personal, métodos de pago y la seguridad de tu cuenta desde este panel.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {children}
      </main>
    </div>
  );
};

export default ProfileTabs;
