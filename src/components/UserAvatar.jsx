// src/components/UserAvatar.jsx
import React, { useEffect, useMemo, useState } from 'react';

const UserAvatar = ({ user, size = 32, className = '' }) => {
  const profile = user?.data ?? user ?? {};

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    profile.name ||
    'Usuario';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const rawUrl = profile.avatar_url || ''; // tu API devuelve absoluta

  // cache-bust sólo cuando cambia la URL (no en cada render)
  const [bust, setBust] = useState('');
  useEffect(() => {
    if (rawUrl) setBust(String(Date.now()));
  }, [rawUrl]);

  const src = useMemo(() => {
    if (!rawUrl) return null;
    const sep = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${sep}v=${bust}`;
  }, [rawUrl, bust]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <img
          key={src} // 🔑 fuerza remontaje cuando cambia la URL
          src={src}
          alt={`Avatar de ${displayName}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full rounded-full object-cover border border-black/10 dark:border-white/20 shadow-sm"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextSibling;
            if (fallback) fallback.style.display = 'grid';
          }}
        />
      ) : null}

      {/* Fallback de iniciales */}
      <div
        className="
          hidden w-full h-full rounded-full
          bg-gradient-to-br from-primary/20 to-primary/40
          grid place-items-center select-none
          text-xs font-semibold uppercase
          text-[#222222] dark:text-white
          border border-black/10 dark:border-white/20
          shadow-sm
        "
      >
        {initials || 'U'}
      </div>
    </div>
  );
};

export default UserAvatar;