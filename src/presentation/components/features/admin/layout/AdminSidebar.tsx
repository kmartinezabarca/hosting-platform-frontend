import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@shared/utils/utils';
import { Badge } from '@presentation/components/ui/badge';
import { navigationConfig, sectionLabels, NavItem } from './navigation.config';

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  badgeCount: number | null;
  isExpanded: boolean;
  onToggle: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isActive, isCollapsed, badgeCount, isExpanded, onToggle }) => {
  const location = useLocation();
  const Icon = item.icon;
  if (item.expandable && item.children) {
    return (
      <div key={item.name}>
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            isActive ? "bg-primary/10 text-primary" : "hover:bg-accent text-muted-foreground hover:text-foreground",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? item.name : undefined}
        >
          <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "")} />
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left">
                <p className={cn("text-sm font-medium", isActive ? "text-primary" : "")}>{item.name}</p>
              </div>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </>
          )}
        </button>
        <AnimatePresence>
          {!isCollapsed && isExpanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="ml-4 pl-2 mt-1.5 border-l border-border/50 space-y-1 overflow-hidden">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildActive = location.pathname === child.href;
                return (
                  <Link key={child.name} to={child.href} className={cn("flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors", isChildActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                    <ChildIcon className="w-4 h-4" />
                    <span className="text-sm">{child.name}</span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link to={item.href} title={isCollapsed ? item.name : undefined} className={cn(
      "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 relative",
      isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-accent text-muted-foreground hover:text-foreground",
      isCollapsed && "justify-center px-2"
    )}>
      <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-foreground" : "")} />
      {!isCollapsed ? (
        <>
          <div className="flex-1">
            <p className={cn("text-sm font-medium", isActive ? "text-primary-foreground" : "")}>{item.name}</p>
            {item.description && <p className={cn("text-xs", isActive ? "text-primary-foreground/70" : "text-muted-foreground")}>{item.description}</p>}
          </div>
          {badgeCount && badgeCount > 0 && (
            <Badge variant={item.badgeKey === 'tickets_open' ? 'destructive' : 'secondary'} className={cn("h-5 min-w-[20px] px-1.5 text-[10px] font-bold", isActive && "bg-primary-foreground/20 text-primary-foreground")}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Badge>
          )}
        </>
      ) : badgeCount && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </Link>
  );
};

export const AdminSidebar: React.FC<any> = ({ isCollapsed, expandedMenus, toggleMenu, isParentActive, badgeCounts }) => {
  const location = useLocation();

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-3 pb-2 scrollbar-thin">
      {Object.entries(navigationConfig).map(([sectionKey, sectionItems]) => {
        const sectionMeta = sectionLabels[sectionKey];
        return (
          <div key={sectionKey} className="mb-1">
            {!isCollapsed ? (
              <div className="px-3 pt-2 pb-1 flex items-center gap-2">
                <sectionMeta.icon className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{sectionMeta.label}</span>
              </div>
            ) : (
              <div className="py-1 flex justify-center"><div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center"><sectionMeta.icon className="w-4 h-4 text-muted-foreground/60" /></div></div>
            )}
            <div className="space-y-0.5">
              {sectionItems.map((item) => (
                <SidebarItem key={item.name} item={item} isActive={isParentActive(item)} isCollapsed={isCollapsed} badgeCount={item.badgeKey ? badgeCounts[item.badgeKey] : null} isExpanded={expandedMenus[item.href] ?? isParentActive(item)} onToggle={() => toggleMenu(item.href)} />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
};
