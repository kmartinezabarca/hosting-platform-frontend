import React, { useEffect, useRef, useState } from 'react';
import { Power, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
// import apiClient from '@/lib/apiClient'; // descomenta para llamadas reales

/** ---------- UI PRIMITIVES: MODALES ---------- */

const BaseModal = ({ open, onClose, title, headerDescription, children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onMouseDown={onBackdropClick} />

      {/* Card */}
      <div
        ref={dialogRef}
        className="
          relative w-full max-w-md
          rounded-2xl border border-border/60 bg-card
          ring-1 ring-black/5 dark:ring-white/5
          shadow-xl overflow-hidden
        "
      >
        <div
          className="
            p-5 border-b border-border/60
            bg-gradient-to-br
            from-[hsl(var(--color-pure-white)/0.05)]
            via-[hsl(var(--color-pure-white)/0.02)]
            to-transparent
            dark:from-[hsl(var(--color-pure-white)/0.07)]
            dark:via-[hsl(var(--color-pure-white)/0.03)]
            dark:to-transparent
          "
        >
          <h4 className="text-base font-semibold text-foreground">{title}</h4>
          {headerDescription && (
            <p className="text-sm text-muted-foreground mt-1">{headerDescription}</p>
          )}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({
  open,
  onClose,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  loading = false,
  variant = 'primary', // 'primary' | 'destructive'
  icon: Icon,
}) => {
  const confirmBtnRef = useRef(null);
  useEffect(() => { if (open) confirmBtnRef.current?.focus(); }, [open]);

  const confirmClasses =
    variant === 'destructive'
      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30'
      : 'bg-primary text-primary-foreground hover:brightness-110 focus-visible:ring-primary/30';

  return (
    <BaseModal open={open} onClose={onClose} title={title}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className={variant === 'destructive' ? 'w-5 h-5 text-destructive' : 'w-5 h-5 text-primary'} />}
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="
            px-3 py-1.5 text-sm rounded-md border border-border bg-muted text-foreground/80
            hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
            cursor-pointer
          "
        >
          {cancelText}
        </button>
        <button
          type="button"
          ref={confirmBtnRef}
          disabled={loading}
          onClick={onConfirm}
          className={`
            px-3 py-1.5 text-sm rounded-md
            focus-visible:outline-none focus-visible:ring-2
            ${confirmClasses}
            disabled:opacity-60 disabled:cursor-not-allowed
            cursor-pointer transition-transform active:translate-y-[1px]
          `}
        >
          {loading ? 'Procesando…' : confirmText}
        </button>
      </div>
    </BaseModal>
  );
};

const InputConfirmDialog = ({
  open,
  onClose,
  title,
  description,
  requiredText,
  onConfirm,
  loading = false,
}) => {
  const [value, setValue] = useState('');
  useEffect(() => { if (open) setValue(''); }, [open]);

  const canConfirm = value === requiredText;

  return (
    <BaseModal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>

      <p className="text-sm text-muted-foreground mt-2">
        Escribe exactamente: <span className="font-mono font-semibold text-foreground">{requiredText}</span>
      </p>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          mt-3 w-full rounded-lg border border-border bg-background
          px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30
        "
        placeholder={requiredText}
      />

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="
            px-3 py-1.5 text-sm rounded-md border border-border bg-muted text-foreground/80
            hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
            cursor-pointer
          "
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!canConfirm || loading}
          onClick={onConfirm}
          className="
            px-3 py-1.5 text-sm rounded-md
            bg-destructive text-destructive-foreground hover:bg-destructive/90
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30
            disabled:opacity-60 disabled:cursor-not-allowed
            cursor-pointer transition-transform active:translate-y-[1px]
          "
        >
          {loading ? 'Eliminando…' : 'Eliminar definitivamente'}
        </button>
      </div>
    </BaseModal>
  );
};

/** ---------- FILA DE ACCIÓN ---------- */

const ActionRow = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onAction,
  isDestructive = false,
  isLoading = false,
}) => (
  <div
    className="
      flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4
      rounded-xl border border-border
      bg-gradient-to-br
        from-[hsl(var(--color-pure-white)/0.03)]
        via-[hsl(var(--color-pure-white)/0.015)]
        to-transparent
      dark:from-[hsl(var(--color-pure-white)/0.05)]
      dark:via-[hsl(var(--color-pure-white)/0.02)]
      dark:to-transparent
    "
  >
    <div className="flex items-center gap-4">
      <span className="inline-flex items-center justify-center rounded-lg p-2.5 bg-secondary">
        <Icon className={isDestructive ? 'w-5 h-5 text-destructive' : 'w-5 h-5 text-primary'} />
      </span>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>

    <button
      onClick={onAction}
      disabled={isLoading}
      className={`
        w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md
        border border-border focus-visible:outline-none focus-visible:ring-2
        transition-colors duration-150 cursor-pointer select-none
        hover:shadow-md active:translate-y-[1px]
        ${isLoading ? 'opacity-60 cursor-not-allowed active:translate-y-0' : ''}
        ${isDestructive
          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30'
          : 'bg-primary text-primary-foreground hover:brightness-110 focus-visible:ring-primary/30'}
      `}
    >
      {isLoading ? 'Procesando…' : buttonText}
    </button>
  </div>
);

/** ---------- PÁGINA: DANGER ZONE (ENVUELTA EN CARD GLOBAL) ---------- */

const DangerZoneTab = ({ service }) => {
  const { toast } = useToast();

  // const { mutate: rebootService, isPending: isRebooting } = useRebootService();
  // const { mutate: reinstallService, isPending: isReinstalling } = useReinstallService();
  // const { mutate: deleteService, isPending: isDeleting } = useDeleteService();

  const [showReboot, setShowReboot] = useState(false);
  const [showReinstall, setShowReinstall] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [isRebooting, setIsRebooting] = useState(false);
  const [isReinstalling, setIsReinstalling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openReboot = () => setShowReboot(true);
  const openReinstall = () => setShowReinstall(true);
  const openDelete = () => setShowDelete(true);

  const handleConfirmReboot = async () => {
    setIsRebooting(true);
    try {
      // await apiClient.post(`/api/services/${service.uuid}/reboot`);
      toast({ title: 'Reinicio en curso', description: 'El servicio se está reiniciando.', variant: 'info' });
      setTimeout(() => {
        toast({ title: 'Servicio reiniciado', description: `“${service?.name}” está activo.`, variant: 'success' });
      }, 1200);
    } catch (e) {
      toast({ title: 'No se pudo reiniciar', description: 'Intenta de nuevo más tarde.', variant: 'destructive' });
    } finally {
      setIsRebooting(false);
      setShowReboot(false);
    }
  };

  const handleConfirmReinstall = async () => {
    setIsReinstalling(true);
    try {
      // await apiClient.post(`/api/services/${service.uuid}/reinstall`);
      toast({ title: 'Reinstalación iniciada', description: 'Estamos reinstalando tu servicio.', variant: 'info' });
      setTimeout(() => {
        toast({ title: 'Reinstalación completada', description: 'Todo listo.', variant: 'success' });
      }, 1500);
    } catch (e) {
      toast({ title: 'Error al reinstalar', description: 'No fue posible completar la reinstalación.', variant: 'destructive' });
    } finally {
      setIsReinstalling(false);
      setShowReinstall(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // await apiClient.delete(`/api/services/${service.uuid}`);
      toast({ title: 'Eliminando servicio…', description: 'Procesando la eliminación.', variant: 'info' });
      setTimeout(() => {
        toast({ title: 'Servicio eliminado', description: 'Se eliminó permanentemente.', variant: 'success' });
      }, 1200);
    } catch (e) {
      toast({ title: 'Error al eliminar', description: 'No fue posible eliminar el servicio.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <>
      {/* Card global con bordes ligeros y efecto flotante */}
      <div
        className="
          group rounded-2xl border border-border/60 bg-card/80
          shadow-sm hover:shadow-lg hover:-translate-y-0.5
          transition-all duration-300 will-change-transform
          ring-1 ring-black/5 dark:ring-white/5
        "
        role="region"
        aria-label="Acciones del Servicio"
      >
        {/* Header del card */}
        <div className="p-6 border-b border-border/60">
          <h3 className="text-xl font-bold text-foreground">Acciones del Servicio</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Operaciones que pueden afectar la disponibilidad de tu servicio.
          </p>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="space-y-4">
            <ActionRow
              icon={Power}
              title="Reiniciar Servicio"
              description="Apaga y enciende el servicio. Puede causar una breve interrupción."
              buttonText="Reiniciar"
              onAction={openReboot}
              isLoading={isRebooting}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-destructive/20">
            <h3 className="text-xl font-bold text-destructive">Zona Peligrosa</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Estas acciones son irreversibles. Procede con extrema precaución.
            </p>
          </div>

          <div className="space-y-4 mt-4">
            <ActionRow
              icon={RotateCcw}
              title="Reinstalar Servicio"
              description="Devuelve el servicio a su estado original. Todos los datos se perderán."
              buttonText="Reinstalar"
              onAction={openReinstall}
              isDestructive
              isLoading={isReinstalling}
            />
            <ActionRow
              icon={Trash2}
              title="Eliminar Servicio"
              description="Cancela la suscripción y elimina permanentemente el servicio y todos sus datos."
              buttonText="Eliminar"
              onAction={openDelete}
              isDestructive
              isLoading={isDeleting}
            />
          </div>
        </div>
      </div>

      {/* Modales */}
      <ConfirmDialog
        open={showReboot}
        onClose={() => setShowReboot(false)}
        title="Reiniciar servicio"
        description={`Esto reiniciará "${service?.name}". Puede tardar unos minutos.`}
        confirmText="Reiniciar ahora"
        onConfirm={handleConfirmReboot}
        loading={isRebooting}
        variant="primary"
        icon={Power}
      />

      <ConfirmDialog
        open={showReinstall}
        onClose={() => setShowReinstall(false)}
        title="Reinstalar servicio"
        description="ADVERTENCIA: Reinstalar borrará todos los datos. Esta acción no se puede deshacer."
        confirmText="Entiendo, reinstalar"
        onConfirm={handleConfirmReinstall}
        loading={isReinstalling}
        variant="destructive"
        icon={AlertTriangle}
      />

      <InputConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Eliminar servicio definitivamente"
        description="Para confirmar la eliminación permanente, escribe el nombre del servicio."
        requiredText={service?.name ?? ''}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
};

export default DangerZoneTab;