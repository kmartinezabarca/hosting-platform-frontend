import React, { useState } from 'react';
import { Camera, CheckCircle, AlertTriangle, MapPin, Star } from 'lucide-react';
import ReactCountryFlag from "react-country-flag";
import { countryName } from "../../lib/geo";
import { cn } from '../../lib/utils';
import AvatarUploader from './AvatarUploader';

/* ── Sub-components ─────────────────────────────────────────────────────── */

const StatCard = ({ value, label, suffix = '' }) => (
  <div className="flex flex-col items-center gap-0.5 px-5 py-3 rounded-2xl bg-white/10 dark:bg-white/[0.08] backdrop-blur-sm border border-white/20 dark:border-white/10 min-w-[80px]">
    <p className="text-2xl font-bold text-white leading-none">
      {value}<span className="text-base font-semibold opacity-70">{suffix}</span>
    </p>
    <p className="text-[11px] text-white/60 text-center leading-tight">{label}</p>
  </div>
);

const VerificationBadge = ({ isVerified }) => {
  const Icon = isVerified ? CheckCircle : AlertTriangle;
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
      isVerified
        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
    )}>
      <Icon className="w-3.5 h-3.5" />
      {isVerified ? "Cuenta verificada" : "Verifica tu correo"}
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────────────── */

const ProfileHeader = ({ profile, onAvatarChange }) => {
  const [showUploader, setShowUploader] = useState(false);
  const [isUploading,  setIsUploading]  = useState(false);

  const handleAvatarUpload = async (file) => {
    if (!file || !onAvatarChange) return;
    setIsUploading(true);
    try { await onAvatarChange(file); setShowUploader(false); }
    catch (e) { console.error(e); }
    finally { setIsUploading(false); }
  };

  const avatarUrl =
    profile.avatar_url ||
    profile.google_avatar ||
    profile.picture ||
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(profile.first_name || 'user')}`;

  const fullName = (profile.first_name && profile.last_name)
    ? `${profile.first_name} ${profile.last_name}`
    : profile.first_name || 'Mi Perfil';

  return (
    <>
      <div className="rounded-2xl overflow-hidden border border-border shadow-sm">

        {/* ── Banner ──────────────────────────────────────────────────── */}
        <div className="relative h-36 sm:h-44 overflow-hidden">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 dark:from-[#0f1117] dark:via-[#161a24] dark:to-[#0a0d14]" />

          {/* Decorative blobs */}
          <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-8 right-10 w-48 h-48 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="absolute top-4 right-1/3 w-32 h-32 rounded-full bg-cyan-400/10 blur-2xl" />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Stats inside banner (top-right) */}
          <div className="absolute top-4 right-5 sm:top-5 sm:right-6 flex gap-2">
            <StatCard value={profile.years_with_us ?? 0} label="Años con nosotros" />
            <StatCard value={profile.active_services ?? 0} label="Servicios activos" />
          </div>
        </div>

        {/* ── Content area (below banner) ─────────────────────────── */}
        <div className="bg-card px-6 sm:px-8 pb-6 pt-0">

          {/* Avatar row — overlaps banner */}
          <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-card shadow-xl">
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setShowUploader(true)}
                title="Cambiar foto"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl bg-foreground text-background shadow-lg hover:opacity-90 hover:scale-105 transition-all"
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Name + email + badges */}
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {fullName}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">{profile.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <VerificationBadge isVerified={Boolean(profile?.email_verified_at)} />

              {profile?.country && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border/50 text-xs font-medium text-muted-foreground">
                  <ReactCountryFlag
                    countryCode={profile.country}
                    svg
                    style={{ width: '1rem', height: '1rem', borderRadius: '2px' }}
                  />
                  {profile.city
                    ? `${profile.city}${profile.country ? `, ${profile.country}` : ''}`
                    : countryName(profile.country)
                  }
                </div>
              )}

              {/* Member since */}
              {profile.created_at && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border/50 text-xs font-medium text-muted-foreground">
                  <Star className="w-3 h-3" />
                  Desde {new Date(profile.created_at).getFullYear()}
                </div>
              )}
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
