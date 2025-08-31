import React, { useState } from "react";
import { toast } from "sonner";

// React Query hooks
import { 
  useProfile, 
  useUpdateProfile, 
  useUploadAvatar, 
  useSecurity, 
  useUpdatePassword 
} from "../../hooks/useProfile";
import { 
  useGenerate2FA, 
  useEnable2FA, 
  useDisable2FA 
} from "../../hooks/useTwoFactor";
import { 
  useSessions, 
  useLogoutSession 
} from "../../hooks/useSessions";

// Componentes del perfil
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileTabs from "../../components/profile/ProfileTabs";
import PersonalInfoSection from "../../components/profile/PersonalInfoSection";
import SecuritySection from "../../components/profile/SecuritySection";
import DevicesSection from "../../components/profile/DevicesSection";

const ClientProfilePageNew = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // React Query hooks
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: security, isLoading: securityLoading, error: securityError } = useSecurity();
  const { data: devices = [], isLoading: devicesLoading, error: devicesError } = useSessions();

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const updatePasswordMutation = useUpdatePassword();
  const generate2FAMutation = useGenerate2FA();
  const enable2FAMutation = useEnable2FA();
  const disable2FAMutation = useDisable2FA();
  const logoutSessionMutation = useLogoutSession();

  // Estados de 2FA
  const [qrCode, setQrCode] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");

  const loading = profileLoading || securityLoading || devicesLoading;
  const error = profileError || securityError || devicesError;

  // Actualizar perfil
  const handleProfileUpdate = async (updatedProfile) => {
    try {
      await updateProfileMutation.mutateAsync(updatedProfile);
      toast.success("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Error al actualizar el perfil");
    }
  };

  // Cambio de avatar
  const handleAvatarChange = async (file) => {
    try {
      await uploadAvatarMutation.mutateAsync(file);
      toast.success("Avatar actualizado exitosamente");
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error(error.message || "Error al subir la imagen");
    }
  };

  // Funciones de 2FA
  const handle2FAGenerate = async () => {
    try {
      const res = await generate2FAMutation.mutateAsync();
      setQrCode(res.qr_code);
      setTwoFactorSecret(res.secret);
    } catch (error) {
      console.error("Error generating 2FA:", error);
      toast.error(error.message || "Error al generar 2FA");
    }
  };

  const handle2FAEnable = async (verificationCode) => {
    try {
      await enable2FAMutation.mutateAsync(verificationCode);
      setQrCode("");
      setTwoFactorSecret("");
      toast.success("2FA activado exitosamente");
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast.error(error.message || "Código de verificación inválido");
    }
  };

  const handle2FADisable = async () => {
    try {
      await disable2FAMutation.mutateAsync();
      toast.success("2FA desactivado");
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast.error(error.message || "Error al desactivar 2FA");
    }
  };

  // Actualizar contraseña
  const handlePasswordUpdate = async (passwordData) => {
    try {
      await updatePasswordMutation.mutateAsync(passwordData);
      toast.success("Contraseña actualizada correctamente");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Error al actualizar la contraseña");
    }
  };

  // Cerrar sesión en dispositivo
  const handleLogoutDevice = async (deviceIdOrUuid) => {
    try {
      await logoutSessionMutation.mutateAsync(deviceIdOrUuid);
      toast.success("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error logging out device:", error);
      toast.error(error.message || "Error al cerrar sesión");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <p className="text-red-600">Error al cargar el perfil</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <ProfileHeader profile={profile} onAvatarChange={handleAvatarChange} />

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "profile" && (
            <PersonalInfoSection
              profile={profile}
              onUpdate={handleProfileUpdate}
              saving={updateProfileMutation.isPending}
            />
          )}

          {activeTab === "security" && (
            <SecuritySection
              security={security}
              onPasswordUpdate={handlePasswordUpdate}
              on2FAGenerate={handle2FAGenerate}
              on2FAEnable={handle2FAEnable}
              on2FADisable={handle2FADisable}
              qrCode={qrCode}
              twoFactorSecret={twoFactorSecret}
              saving2FA={generate2FAMutation.isPending || enable2FAMutation.isPending || disable2FAMutation.isPending}
              savingPassword={updatePasswordMutation.isPending}
            />
          )}

          {activeTab === "devices" && (
            <DevicesSection devices={devices} onLogoutDevice={handleLogoutDevice} />
          )}
        </ProfileTabs>
      </div>
    </div>
  );
};

export default ClientProfilePageNew;
