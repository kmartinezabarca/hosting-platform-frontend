import React from 'react';

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
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const avatarUrl = profile.avatar_url; // backend ya devuelve URL absoluta

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`Avatar de ${displayName}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full rounded-full object-cover border border-black/10 dark:border-white/20 shadow-sm"
          onError={(e) => {
            // Si falla la imagen, mostramos iniciales
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextSibling;
            if (fallback) fallback.style.display = 'grid';
          }}
        />
      ) : null}

      {/* Fallback de iniciales (oculto si hay img válida) */}
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
