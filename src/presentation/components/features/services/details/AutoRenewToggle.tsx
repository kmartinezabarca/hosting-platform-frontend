import React from 'react';
import { useUpdateServiceConfig } from '@presentation/components/features/../../hooks/useServices';
import { Switch } from '@presentation/components/features/../ui/switch'; // Asumo que usas el Switch de ShadCN/UI

const AutoRenewToggle = ({ service }) => {
  const updateConfigMutation = useUpdateServiceConfig();

  const handleToggle = (isChecked) => {
    updateConfigMutation.mutate({
      serviceId: service.uuid,
      config: { auto_renew: isChecked },
    });
  };

  const isAutoRenew = service.configuration?.auto_renew || false;

  return (
    <div className="flex items-center gap-4">
      <Switch
        id="auto-renew"
        checked={isAutoRenew}
        onCheckedChange={handleToggle}
        disabled={updateConfigMutation.isPending}
      />
      <label htmlFor="auto-renew" className="text-sm font-medium text-foreground">
        {updateConfigMutation.isPending ? 'Actualizando...' : (isAutoRenew ? 'Renovación Automática Activada' : 'Renovación Automática Desactivada')}
      </label>
    </div>
  );
};

export default AutoRenewToggle;
