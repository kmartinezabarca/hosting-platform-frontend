import React, { useState } from "react";
import { toast } from "sonner";

// Componentes del perfil
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";
import PersonalInfoSection from "../components/profile/PersonalInfoSection";
import SecuritySection from "../components/profile/SecuritySection";
import DevicesSection from "../components/profile/DevicesSection";

const ProfileDemo = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // Datos mock para la demostración
  const [profile] = useState({
    first_name: "Juan Carlos",
    last_name: "Martínez",
    email: "juan.martinez@example.com",
    phone: "+52 55 1234 5678",
    address: "Av. Reforma 123, Col. Centro",
    city: "Ciudad de México",
    state: "CDMX",
    country: "MX",
    postal_code: "06000",
    avatar_url: "",
    created_at: "2023-01-15T10:30:00Z",
    services_count: 3
  });

  const [security] = useState({
    two_factor_enabled: false,
    password_last_changed: "2024-07-15T14:20:00Z",
    security_score: 75,
  });

  const [qrCode] = useState("");
  const [twoFactorSecret] = useState("");

  // Funciones mock para la demostración
  const handleProfileUpdate = async (updatedProfile) => {
    console.log('Profile update:', updatedProfile);
    toast.success('Perfil actualizado exitosamente (demo)');
  };

  const handleAvatarChange = async (file) => {
    console.log('Avatar change:', file);
    toast.success('Avatar actualizado exitosamente (demo)');
  };

  const handle2FAGenerate = async () => {
    console.log('2FA generate');
    toast.success('2FA generado exitosamente (demo)');
  };

  const handle2FAEnable = async (verificationCode) => {
    console.log('2FA enable:', verificationCode);
    toast.success('2FA activado exitosamente (demo)');
  };

  const handle2FADisable = async () => {
    console.log('2FA disable');
    toast.success('2FA desactivado (demo)');
  };

  const handlePasswordUpdate = async (passwordData) => {
    console.log('Password update:', passwordData);
    toast.success('Contraseña actualizada correctamente (demo)');
  };

  const handleLogoutDevice = async (deviceId) => {
    console.log('Logout device:', deviceId);
    toast.success('Sesión cerrada exitosamente (demo)');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Banner de demostración */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Demostración - Pantalla de Perfil Mejorada</h1>
          <p className="text-blue-100">
            Esta es una demostración de los componentes mejorados del perfil con diseño moderno y profesional
          </p>
        </div>

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
              saving={false}
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
              saving2FA={false}
              savingPassword={false}
            />
          )}

          {activeTab === "devices" && (
            <DevicesSection
              devices={[]}
              onLogoutDevice={handleLogoutDevice}
            />
          )}
        </ProfileTabs>
      </div>
    </div>
  );
};

export default ProfileDemo;

