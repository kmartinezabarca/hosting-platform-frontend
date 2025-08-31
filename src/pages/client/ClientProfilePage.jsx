import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// Services
import profileService from "../../services/profile";
import twoFactorService from "../../services/twoFactor";
import sessionsService from "../../services/sessions";

// Componentes del perfil
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileTabs from "../../components/profile/ProfileTabs";
import PersonalInfoSection from "../../components/profile/PersonalInfoSection";
import SecuritySection from "../../components/profile/SecuritySection";
import DevicesSection from "../../components/profile/DevicesSection";

const ClientProfilePageNew = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados del perfil
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "MX",
    postal_code: "",
    avatar_url: "",
    created_at: null,
    services_count: 0,
    email_verified_at: null,
  });

  // Estados de seguridad
  const [security, setSecurity] = useState({
    two_factor_enabled: false,
    password_last_changed: null,
    security_score: 0,
  });

  // Estados de 2FA
  const [qrCode, setQrCode] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [saving2FA, setSaving2FA] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Estados de dispositivos
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProfileData(),
        loadSecurityData(),
        loadDevicesData(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Error al cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  const loadProfileData = async () => {
    try {
      const res = await profileService.get();
      if (res?.success && res.data) {
        setProfile((prev) => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadSecurityData = async () => {
    try {
      const res = await profileService.getSecurity();
      if (res?.success && res.data) {
        setSecurity(res.data);
      }
    } catch (error) {
      console.error("Error loading security data:", error);
    }
  };

  const loadDevicesData = async () => {
    try {
      const res = await sessionsService.list();
      if (res?.success) setDevices(res.data || []);
    } catch (error) {
      console.error("Error loading devices:", error);
    }
  };

  // Actualizar perfil
  const handleProfileUpdate = async (updatedProfile) => {
    setSaving(true);
    try {
      const res = await profileService.update(updatedProfile);
      if (res?.success) {
        setProfile(res.data);
        toast.success("Perfil actualizado exitosamente");
      } else {
        toast.error(res?.message || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  // Cambio de avatar
  const handleAvatarChange = async (file) => {
    try {
      const res = await profileService.uploadAvatar(file);
      if (res?.success) {
        setProfile((prev) => ({ ...prev, avatar_url: res.data.avatar_url }));
        toast.success("Avatar actualizado exitosamente");
      } else {
        toast.error(res?.message || "Error al actualizar el avatar");
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error(error.message || "Error al subir la imagen");
    }
  };

  // Funciones de 2FA
  const handle2FAGenerate = async () => {
    setSaving2FA(true);
    try {
      const res = await twoFactorService.generate();
      if (res?.success) {
        setQrCode(res.data.qr_code);
        setTwoFactorSecret(res.data.secret);
      } else {
        toast.error(res?.message || "Error al generar 2FA");
      }
    } catch (error) {
      console.error("Error generating 2FA:", error);
      toast.error(error.message || "Error de conexión");
    } finally {
      setSaving2FA(false);
    }
  };

  const handle2FAEnable = async (verificationCode) => {
    setSaving2FA(true);
    try {
      const res = await twoFactorService.enable(verificationCode);
      if (res?.success) {
        setSecurity((prev) => ({ ...prev, two_factor_enabled: true }));
        setQrCode("");
        setTwoFactorSecret("");
        toast.success("2FA activado exitosamente");
      } else {
        toast.error(res?.message || "Código de verificación inválido");
      }
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast.error(error.message || "Error de conexión");
    } finally {
      setSaving2FA(false);
    }
  };

  const handle2FADisable = async () => {
    setSaving2FA(true);
    try {
      const res = await twoFactorService.disable();
      if (res?.success) {
        setSecurity((prev) => ({ ...prev, two_factor_enabled: false }));
        toast.success("2FA desactivado");
      } else {
        toast.error(res?.message || "Error al desactivar 2FA");
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast.error(error.message || "Error de conexión");
    } finally {
      setSaving2FA(false);
    }
  };

  // Cerrar sesión en dispositivo
  const handleLogoutDevice = async (deviceIdOrUuid) => {
    try {
      const res = await sessionsService.logoutOne(deviceIdOrUuid);
      if (res?.success) {
        setDevices((prev) => prev.filter((d) => (d.uuid || d.id) !== deviceIdOrUuid));
        toast.success("Sesión cerrada exitosamente");
      } else {
        toast.error(res?.message || "Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error logging out device:", error);
      toast.error(error.message || "Error de conexión");
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <ProfileHeader profile={profile} onAvatarChange={handleAvatarChange} />

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "profile" && (
            <PersonalInfoSection
              profile={profile}
              onUpdate={handleProfileUpdate}
              saving={saving}
            />
          )}

          {activeTab === "security" && (
            <SecuritySection
              security={security}
              onPasswordUpdate={handle2FAEnable ? undefined : undefined} // (si tienes sección de password aquí)
              on2FAGenerate={handle2FAGenerate}
              on2FAEnable={handle2FAEnable}
              on2FADisable={handle2FADisable}
              qrCode={qrCode}
              twoFactorSecret={twoFactorSecret}
              saving2FA={saving2FA}
              savingPassword={false}
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
