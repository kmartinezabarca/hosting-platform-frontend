import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@presentation/components/ui/button';

interface SessionTimeoutModalProps {
  open: boolean;
  remainingSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  open,
  remainingSeconds,
  onExtend,
  onLogout,
}) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Sesión por expirar</h2>
                <p className="text-sm text-muted-foreground">
                  Tu sesión cerrará automáticamente por inactividad
                </p>
              </div>
            </div>

            <div className="mb-6 text-center">
              <p className="text-4xl font-bold tabular-nums text-foreground">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">tiempo restante</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onLogout}
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
              <Button
                variant="default"
                onClick={onExtend}
                className="flex-1"
                autoFocus
              >
                Seguir navegando
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
