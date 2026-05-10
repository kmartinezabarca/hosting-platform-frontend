import React, { useState } from 'react';
import { Camera, CheckCircle, AlertTriangle, Shield, Zap, Calendar } from 'lucide-react';
import ReactCountryFlag from "react-country-flag";
import { countryName } from '@shared/utils/geo';
import { cn } from '@shared/utils/utils';
import AvatarUploader from '@presentation/components/features/profile/AvatarUploader';

const StatBox = ({ value, label, icon: Icon = null }) => (
  <div className="flex flex-col items-center sm:items-start">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
  </div>
);

const VerificationBadge = ({ isVerified }) => {
  const config = isVerified
    ? { 
        text: 'Cuenta verificada', 
        iconColor: 'text-emerald-600', 
        bgColor: 'bg-emerald-50 border border-emerald-100' 
      }
    : { 
        text: 'Verifica tu correo', 
        iconColor: 'text-amber-600', 
        bgColor: 'bg-amber-50 border border-amber-100' 
      };
  
  const Icon = isVerified ? CheckCircle : AlertTriangle;

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-tight", config.bgColor, config.iconColor)}>
      <Icon className="w-3.5 h-3.5" />
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

  return (
    <>
      <div className="bg-white dark:bg-[#101820] border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          {/* Avatar section */}
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-center shadow-sm">
                <span className="text-3xl sm:text-4xl font-bold text-slate-400">{initials}</span>
              </div>
            )}
            <button
              onClick={() => setShowUploader(true)}
              className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-[#222] dark:bg-white text-white dark:text-[#101214] shadow-md transition-transform hover:scale-105"
              title="Cambiar avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info section */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {displayName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">{profile?.email}</p>
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
              <VerificationBadge isVerified={Boolean(profile?.email_verified_at)} />
              {profile?.two_factor_enabled && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-tight text-slate-600 dark:text-slate-300">
                  <Shield className="w-3.5 h-3.5" />
                  <span>2FA Activo</span>
                </div>
              )}
              {profile?.country && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-tight text-slate-600 dark:text-slate-300">
                  <ReactCountryFlag countryCode={profile.country} svg style={{ width: "1rem", height: "1rem", borderRadius: "2px" }} />
                  <span>{profile.city || countryName(profile.country)}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-8 sm:gap-12 pt-4 border-t border-slate-100 dark:border-white/5">
              <StatBox 
                value={profile?.years_with_us || 0} 
                label="Años"
                icon={Calendar}
              />
              <StatBox 
                value={profile?.active_services || 0} 
                label="Servicios"
                icon={Zap}
              />
              <StatBox 
                value={profile?.security_score || 0} 
                label="Seguridad"
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
