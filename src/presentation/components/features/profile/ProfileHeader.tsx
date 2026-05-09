import React, { useState } from 'react';
import { Camera, CheckCircle, AlertTriangle, Shield, Zap } from 'lucide-react';
import ReactCountryFlag from "react-country-flag";
import { countryName } from '@shared/utils/geo';
import { cn } from '@shared/utils/utils';
import AvatarUploader from '@presentation/components/features/profile/AvatarUploader';

const PALETTE = [
  ['from-emerald-500 to-teal-600', 'text-white'],
  ['from-blue-500 to-cyan-600', 'text-white'],
  ['from-purple-500 to-pink-600', 'text-white'],
  ['from-orange-500 to-red-600', 'text-white'],
  ['from-indigo-500 to-purple-600', 'text-white'],
  ['from-cyan-500 to-blue-600', 'text-white'],
  ['from-rose-500 to-pink-600', 'text-white'],
  ['from-amber-500 to-orange-600', 'text-white'],
];

const colorFromName = (name = '') => {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[code % PALETTE.length];
};

const StatBox = ({ value, label, icon: Icon }) => (
  <div className="flex flex-col items-center sm:items-start gap-2">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
  </div>
);

const VerificationBadge = ({ isVerified }) => {
  const config = isVerified
    ? { 
        text: 'Cuenta verificada', 
        iconColor: 'text-emerald-600 dark:text-emerald-400', 
        bgColor: 'bg-emerald-500/10 border border-emerald-500/20' 
      }
    : { 
        text: 'Verifica tu correo', 
        iconColor: 'text-amber-600 dark:text-amber-400', 
        bgColor: 'bg-amber-500/10 border border-amber-500/20' 
      };
  
  const Icon = isVerified ? CheckCircle : AlertTriangle;

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", config.bgColor, config.iconColor)}>
      <Icon className="w-4 h-4" />
      <span className="text-foreground">{config.text}</span>
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (onAvatarChange) {
        onAvatarChange(file);
      }
      setShowUploader(false);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUrl = profile?.avatar_url || profile?.google_avatar || profile?.picture || '';
  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile?.first_name || 'Usuario';
  
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'U';

  const [gradientClass, textClass] = colorFromName(displayName);

  return (
    <>
      <div className="bg-gradient-to-br from-card to-card/95 border border-border/60 rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          {/* Avatar section */}
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className={cn(
                "w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-background shadow-lg",
                "bg-gradient-to-br flex items-center justify-center",
                gradientClass
              )}>
                <span className={cn("text-4xl sm:text-5xl font-bold", textClass)}>{initials}</span>
              </div>
            )}
            <button
              onClick={() => setShowUploader(true)}
              className="absolute -bottom-2 -right-2 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
              title="Cambiar avatar"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {/* Info section */}
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                {displayName}
              </h1>
              <p className="text-muted-foreground mt-2 text-base">{profile?.email}</p>
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <VerificationBadge isVerified={Boolean(profile?.email_verified_at)} />
              {profile?.two_factor_enabled && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm font-medium text-blue-600 dark:text-blue-400">
                  <Shield className="w-4 h-4" />
                  <span>2FA Activado</span>
                </div>
              )}
              {profile?.country && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border/40 text-sm font-medium text-muted-foreground">
                  <ReactCountryFlag countryCode={profile.country} svg style={{ width: "1.25rem", height: "1.25rem", borderRadius: "2px" }} />
                  <span>{profile.city || countryName(profile.country)}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 sm:gap-8">
              <StatBox 
                value={profile?.years_with_us || 0} 
                label="Años con nosotros"
              />
              <StatBox 
                value={profile?.active_services || 0} 
                label="Servicios activos"
                icon={Zap}
              />
              <StatBox 
                value={profile?.security_score || 0} 
                label="Puntuación seguridad"
                icon={Shield}
              />
            </div>
          </div>
        </div>
      </div>

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
