import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LogOut } from 'lucide-react';

interface AdminProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  handleLogout: () => void;
}

export const AdminProfileDropdown: React.FC<AdminProfileDropdownProps> = ({ isOpen, onClose, user, handleLogout }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-2 bg-popover border border-border shadow-2xl">
        <div className="px-3 py-3 border-b border-border"><p className="font-semibold text-foreground">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Administrador"}</p><p className="text-sm text-muted-foreground">{user?.email}</p></div>
        <div className="py-2"><Link to="/admin/profile" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors"><Users className="w-4 h-4" /><span className="text-sm">Mi Perfil</span></Link></div>
        <div className="border-t border-border pt-2"><button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full hover:bg-destructive/10 hover:text-destructive transition-colors"><LogOut className="w-4 h-4" /><span className="text-sm">Cerrar Sesión</span></button></div>
      </motion.div>
    )}
  </AnimatePresence>
);
