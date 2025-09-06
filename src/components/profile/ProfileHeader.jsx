import React, { useState } from 'react';
import { Camera, CheckCircle, AlertTriangle } from 'lucide-react';
import ReactCountryFlag from "react-country-flag";
import { countryName } from "../../lib/geo";
import { cn } from '../../lib/utils';
import AvatarUploader from './AvatarUploader'; // ¡Importamos nuestro nuevo componente!

// --- Componentes de UI Internos y Rediseñados ---

const StatBox = ({ value, label }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const VerificationBadge = ({ isVerified }) => {
  const config = isVerified
    ? { text: 'Cuenta verificada', iconColor: 'text-green-500', bgColor: 'bg-green-500/15' }
    : { text: 'Verifica tu correo', iconColor: 'text-yellow-500', bgColor: 'bg-yellow-500/15' };
  
  const Icon = isVerified ? CheckCircle : AlertTriangle;

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", config.bgColor, config.iconColor)}>
      <Icon className="w-4 h-4" />
      <span>{config.text}</span>
    </div>
  );
};


const ProfileHeader = ({ profile, onAvatarChange }) => {
  const [showUploader, setShowUploader] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      // Aquí iría la lógica de upload real a tu backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación
      if (onAvatarChange) {
        onAvatarChange(file); // Pasamos el archivo recortado al padre
      }
      setShowUploader(false); // Cerramos el modal al éxito
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Aquí podrías usar un toast de error
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUrl = profile.avatar_url || `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(profile.first_name || 'user' )}`;

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          
          {/* --- Avatar Simplificado --- */}
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-2xl object-cover border-4 border-background shadow-md"
            />
            <button
              onClick={() => setShowUploader(true)}
              className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
              title="Cambiar avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* --- Información del Usuario --- */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-foreground">
              {profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : "Mi Perfil"}
            </h1>
            <p className="text-muted-foreground mt-1">{profile.email}</p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              <VerificationBadge isVerified={Boolean(profile?.email_verified_at)} />
              {profile?.country && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm dark:text-muted-foreground">
                  <ReactCountryFlag countryCode={profile.country} svg style={{ width: "1.25rem", height: "1.25rem", borderRadius: "2px" }} />
                  <span>{profile.city || countryName(profile.country)}</span>
                </div>
              )}
            </div>
          </div>

          {/* --- Estadísticas Rápidas --- */}
          <div className="flex gap-8 sm:border-l sm:border-border sm:pl-8">
            <StatBox value={profile.years_with_us || 0} label="Años con nosotros" />
            <StatBox value={profile.active_services || 0} label="Servicios activos" />
          </div>
        </div>
      </div>

      {/* --- El Modal de Subida y Recorte --- */}
      {showUploader && (
        <AvatarUploader
          onAvatarChange={handleAvatarUpload}
          onClose={() => setShowUploader(false)}
          isUploading={isUploading}
        />
      )}
    </>
  );
};

export default ProfileHeader;
