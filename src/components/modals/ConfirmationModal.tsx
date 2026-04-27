import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

/**
 * Un modal de confirmación reutilizable para acciones destructivas.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onConfirm - Función a ejecutar si el usuario confirma.
 * @param {string} props.title - El título del modal (ej. "Eliminar Método de Pago").
 * @param {React.ReactNode} props.children - El contenido o descripción del modal.
 * @param {string} [props.confirmText="Confirmar"] - El texto para el botón de confirmación.
 * @param {boolean} [props.isConfirming=false] - Si es true, muestra un estado de carga en el botón.
 */
const MODAL_TITLE_ID = 'confirmation-modal-title';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirmar',
  isConfirming = false,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isConfirming) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirming, onClose]);

  // Auto-focus en el botón de cancelar al abrir (práctica segura)
  useEffect(() => {
    if (isOpen) {
      // Pequeño delay para dejar que la animación arranque
      const t = setTimeout(() => cancelRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={MODAL_TITLE_ID}
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 text-center">
            {/* Icono de Alerta */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 mb-4" aria-hidden="true">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>

            {/* Título y Descripción */}
            <h3 id={MODAL_TITLE_ID} className="text-lg font-semibold text-foreground">{title}</h3>
            <div className="mt-2 text-sm text-muted-foreground">
              {children}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 bg-muted/50 px-6 py-4 rounded-b-2xl">
            <button
              ref={cancelRef}
              type="button"
              onClick={onClose}
              disabled={isConfirming}
              className="flex-1 inline-flex justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground bg-card hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isConfirming}
              className="flex-1 inline-flex justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-white bg-destructive hover:bg-destructive/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
            >
              {isConfirming ? 'Procesando...' : confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
