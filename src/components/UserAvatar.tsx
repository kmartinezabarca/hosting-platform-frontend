import React, { useEffect, useMemo, useState } from 'react';
import { User } from '../types/models';

/* Genera un color de fondo consistente a partir del nombre */
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

function colorFromName(name = '') {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[code % PALETTE.length];
}

/* ─────────────────────────────────────────────────────────────────────── */

interface UserAvatarProps {
  user: User | { data?: User } | null | undefined;
  size?: number;
  className?: string;
}

const UserAvatar = ({ user, size = 32, className = '' }: UserAvatarProps): React.ReactElement => {
  const profile = (user as any)?.data ?? user ?? {};

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
