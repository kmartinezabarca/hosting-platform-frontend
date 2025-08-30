import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import authService from "../../services/auth";

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
    services_count: 0
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

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProfileData(),
        loadSecurityData(),
        loadDevicesData()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadProfileData = async () => {
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/profile", {
        headers: { 
          Authorization: `Bearer ${token}`, 
          Accept: "application/json" 
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadSecurityData = async () => {
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/profile/security", {
        headers: { 
          Authorization: `Bearer ${token}`, 
          Accept: "application/json" 
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setSecurity(data.data);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  };

  const loadDevicesData = async () => {
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/profile/devices", {
        headers: { 
          Authorization: `Bearer ${token}`, 
          Accept: "application/json" 
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setDevices(data.data || []);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  // Actualizar perfil
  const handleProfileUpdate = async (updatedProfile) => {
    setSaving(true);
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      const data = await res.json();
      
      if (res.ok) {
        setProfile(data.data);
        toast.success('Perfil actualizado exitosamente');
      } else {
        toast.error(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  // Cambio de avatar
  const handleAvatarChange = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setProfile(prev => ({ ...prev, avatar_url: data.data.avatar_url }));
        toast.success('Avatar actualizado exitosamente');
      } else {
        toast.error(data.message || 'Error al actualizar el avatar');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Error al subir la imagen');
    }
  };

  // Funciones de 2FA
  const handle2FAGenerate = async () => {
    setSaving2FA(true);
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/2fa/generate", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          Accept: "application/json" 
        },
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setQrCode(data.data.qr_code);
        setTwoFactorSecret(data.data.secret);
      } else {
        toast.error(data.message || 'Error al generar 2FA');
      }
    } catch (error) {
      console.error('Error generating 2FA:', error);
      toast.error('Error de conexión');
    } finally {
      setSaving2FA(false);
    }
  };

  const handle2FAEnable = async (verificationCode) => {
    setSaving2FA(true);
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/2fa/enable", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSecurity(prev => ({ ...prev, two_factor_enabled: true }));
        setQrCode("");
        setTwoFactorSecret("");
        toast.success('2FA activado exitosamente');
      } else {
        toast.error(data.message || 'Código de verificación inválido');
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error('Error de conexión');
    } finally {
      setSaving2FA(false);
    }
  };

  const handle2FADisable = async () => {
    setSaving2FA(true);
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/2fa/disable", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          Accept: "application/json" 
        },
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSecurity(prev => ({ ...prev, two_factor_enabled: false }));
        toast.success('2FA desactivado');
      } else {
        toast.error(data.message || 'Error al desactivar 2FA');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Error de conexión');
    } finally {
      setSaving2FA(false);
    }
  };

  // Cambio de contraseña
  const handlePasswordUpdate = async (passwordData) => {
    setSavingPassword(true);
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/profile/password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(passwordData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Contraseña actualizada correctamente');
        loadSecurityData(); // Recargar datos de seguridad
      } else {
        toast.error(data.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error de conexión');
    } finally {
      setSavingPassword(false);
    }
  };

  // Cerrar sesión en dispositivo
  const handleLogoutDevice = async (deviceId) => {
    try {
      const token = authService.getToken();
      const res = await fetch(`http://localhost:8000/api/profile/devices/${deviceId}/logout`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          Accept: "application/json" 
        },
      });
      
      if (res.ok) {
        setDevices(prev => prev.filter(device => device.id !== deviceId));
        toast.success('Sesión cerrada exitosamente');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error logging out device:', error);
      toast.error('Error de conexión');
    }
  };

  // Loading state
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
        {/* Header del perfil */}
        <ProfileHeader 
          profile={profile} 
          onAvatarChange={handleAvatarChange}
        />

        {/* Tabs y contenido */}
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
              onPasswordUpdate={handlePasswordUpdate}
              on2FAGenerate={handle2FAGenerate}
              on2FAEnable={handle2FAEnable}
              on2FADisable={handle2FADisable}
              qrCode={qrCode}
              twoFactorSecret={twoFactorSecret}
              saving2FA={saving2FA}
              savingPassword={savingPassword}
            />
          )}

          {activeTab === "devices" && (
            <DevicesSection
              devices={devices}
              onLogoutDevice={handleLogoutDevice}
            />
          )}
        </ProfileTabs>
      </div>
    </div>
  );
};

export default ClientProfilePageNew;

