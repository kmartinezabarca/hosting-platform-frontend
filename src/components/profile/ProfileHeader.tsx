import React, { useState } from 'react';
import { Camera, CheckCircle, AlertTriangle } from 'lucide-react';
import ReactCountryFlag from "react-country-flag";
import { countryName } from "../../lib/geo";
import { cn } from '../../lib/utils';
import AvatarUploader from './AvatarUploader';

const PALETTE = [
  ['from-slate-500 to-slate-600', 'text-white'],
  ['from-zinc-500 to-zinc-600', 'text-white'],
  ['from-gray-500 to-gray-600', 'text-white'],
  ['from-neutral-500 to-neutral-600', 'text-white'],
  ['from-stone-500 to-stone-600', 'text-white'],
  ['from-slate-400 to-slate-500', 'text-white'],
  ['from-zinc-400 to-zinc-500', 'text-white'],
  ['from-gray-400 to-gray-500', 'text-white'],
];

const colorFromName = (name = '') => {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[code % PALETTE.length];
};

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
      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-background shadow-md"
              />
            ) : (
              <div className={cn(
                "w-24 h-24 rounded-2xl border-4 border-background shadow-md",
                "bg-gradient-to-br flex items-center justify-center",
                gradientClass
              )}>
                <span className={cn("text-3xl font-bold", textClass)}>{initials}</span>
              </div>
            )}
            <button
              onClick={() => setShowUploader(true)}
              className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
              title="Cambiar avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-foreground">
              {displayName}
            </h1>
            <p className="text-muted-foreground mt-1">{profile?.email}</p>
            
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

          <div className="flex gap-8 sm:border-l sm:border-border sm:pl-8">
            <StatBox value={profile?.years_with_us || 0} label="Años con nosotros" />
            <StatBox value={profile?.active_services || 0} label="Servicios activos" />
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