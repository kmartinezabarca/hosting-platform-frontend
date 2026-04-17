import React, { useEffect, useMemo, useState } from 'react';

/* Genera un color de fondo consistente a partir del nombre */
const PALETTE = [
  ['from-violet-500 to-purple-600',  'text-white'],
  ['from-blue-500 to-indigo-600',    'text-white'],
  ['from-emerald-500 to-teal-600',   'text-white'],
  ['from-orange-400 to-rose-500',    'text-white'],
  ['from-pink-500 to-fuchsia-600',   'text-white'],
  ['from-cyan-500 to-blue-600',      'text-white'],
  ['from-amber-400 to-orange-500',   'text-white'],
  ['from-rose-500 to-pink-600',      'text-white'],
];

function colorFromName(name = '') {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[code % PALETTE.length];
}

/* ─────────────────────────────────────────────────────────────────────── */

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
    .toUpperCase() || 'U';

  const rawUrl = profile.avatar_url || profile.google_avatar || profile.picture || '';

  /* Cache-bust solo cuando la URL cambia */
  const [bust, setBust] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (rawUrl) {
      setBust(String(Date.now()));
      setImgError(false);
    }
  }, [rawUrl]);

  const src = useMemo(() => {
    if (!rawUrl) return null;
    const sep = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${sep}v=${bust}`;
  }, [rawUrl, bust]);

  const [gradientClass, textClass] = colorFromName(displayName);

  /* Tamaño de fuente proporcional */
  const fontSize = size <= 28 ? 10 : size <= 36 ? 12 : size <= 48 ? 14 : 16;

  const showImage = src && !imgError;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          key={src}
          src={src}
          alt={`Avatar de ${displayName}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full rounded-full object-cover border border-black/10 dark:border-white/15 shadow-sm"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`
            w-full h-full rounded-full
            bg-gradient-to-br ${gradientClass}
            flex items-center justify-center select-none
            border border-black/10 dark:border-white/10
            shadow-sm font-bold ${textClass}
          `}
          style={{ fontSize }}
          aria-label={displayName}
        >
          {initials}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
