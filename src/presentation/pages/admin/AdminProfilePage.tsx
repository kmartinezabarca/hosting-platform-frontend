import React, { useState } from 'react';
import { User, Shield, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { toast } from '@presentation/components/features/ToastProvider';

import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useSecurity,
  useUpdatePassword,
} from '@application/hooks/useProfile';
import { useGenerate2FA, useEnable2FA, useDisable2FA } from '@application/hooks/useTwoFactor';

import ProfileHeader   from '@presentation/components/features/profile/ProfileHeader';
import ProfileTabs     from '@presentation/components/features/profile/ProfileTabs';
import PersonalInfoSection from '@presentation/components/features/profile/PersonalInfoSection';
import SecuritySection from '@presentation/components/features/profile/SecuritySection';
import DevicesSection  from '@presentation/components/features/profile/DevicesSection';

const ADMIN_TABS = [
  { id: 'profile',  label: 'Información Personal', icon: User },
  { id: 'security', label: 'Seguridad',              icon: Shield },
  { id: 'devices',  label: 'Dispositivos',           icon: MonitorSmartphone },
];

const AdminProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [qrCode, setQrCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');

  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: security, isLoading: securityLoading }                    = useSecurity();

  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation  = useUploadAvatar();
  const updatePasswordMutation = useUpdatePassword();
  const generate2FAMutation   = useGenerate2FA();
  const enable2FAMutation     = useEnable2FA();
  const disable2FAMutation    = useDisable2FA();

  const handleProfileUpdate = async (data: any) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      toast.success('Perfil actualizado exitosamente');
    } catch (err) {
      toast.error((err as any)?.message || 'Error al actualizar el perfil');
    }
  };

  const handleAvatarChange = async (file: any) => {
    try {
      await uploadAvatarMutation.mutateAsync(file);
      toast.success('Avatar actualizado');
    } catch (err) {
      toast.error((err as any)?.message || 'Error al subir la imagen');
    }
  };

  const handle2FAGenerate = async () => {
    try {
      const res: any = await generate2FAMutation.mutateAsync(undefined as any);
      setQrCode(res?.data?.qr_code ?? res?.data?.data?.qr_code);
      setTwoFactorSecret(res?.data?.secret ?? res?.data?.data?.secret);
      toast.info('Código QR generado', 'Escanea el código con tu app de autenticación');
    } catch (err) {
      toast.error((err as any)?.message || 'Error al generar 2FA');
    }
  };

  const handle2FAEnable = async (code: any) => {
    try {
      await enable2FAMutation.mutateAsync(code);
      setQrCode('');
      setTwoFactorSecret('');
      toast.success('2FA activado exitosamente');
    } catch (err) {
      toast.error((err as any)?.message || 'Código de verificación inválido');
    }
  };

  const handle2FADisable = async () => {
    try {
      await disable2FAMutation.mutateAsync(undefined as any);
      toast.success('2FA desactivado');
    } catch (err) {
      toast.error((err as any)?.message || 'Error al desactivar 2FA');
    }
  };

  const handlePasswordUpdate = async (data: any) => {
    try {
      await updatePasswordMutation.mutateAsync(data);
      toast.success('Contraseña actualizada correctamente');
    } catch (err) {
      toast.error((err as any)?.message || 'Error al actualizar la contraseña');
    }
  };

  if (profileLoading || securityLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-medium">Error al cargar el perfil</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin badge */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-500" />
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          Cuenta de Administrador
        </span>
      </div>

      <ProfileHeader profile={profile} onAvatarChange={handleAvatarChange} />

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={ADMIN_TABS}>
        {activeTab === 'profile' && (
          <PersonalInfoSection
            profile={profile}
            onUpdate={handleProfileUpdate}
            saving={updateProfileMutation.isPending}
          />
        )}

        {activeTab === 'security' && (
          <SecuritySection
            security={security}
            onPasswordUpdate={handlePasswordUpdate}
            on2FAGenerate={handle2FAGenerate}
            on2FAEnable={handle2FAEnable}
            on2FADisable={handle2FADisable}
            qrCode={qrCode}
            twoFactorSecret={twoFactorSecret}
            saving2FA={
              generate2FAMutation.isPending ||
              enable2FAMutation.isPending ||
              disable2FAMutation.isPending
            }
            savingPassword={updatePasswordMutation.isPending}
            isGoogleUser={!!profile?.is_google_account || !!security?.is_google_account}
          />
        )}

        {activeTab === 'devices' && <DevicesSection />}
      </ProfileTabs>
    </div>
  );
};

export default AdminProfilePage;
