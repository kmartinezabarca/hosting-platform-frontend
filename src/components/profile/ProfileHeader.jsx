import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const ProfileHeader = ({ profile, onAvatarChange }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Aquí iría la lógica de upload real
      // Por ahora simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onAvatarChange) {
        onAvatarChange(file);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUrl = profile.avatar_url || 
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(
      profile.first_name || 'user'
    )}`;

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl" />
      
      <div className="relative p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar con upload */}
          <div className="relative">
            <div 
              className={cn(
                'relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg transition-all duration-200',
                isHovering && 'scale-105 shadow-xl'
              )}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay de upload */}
              <div className={cn(
                'absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200',
                isHovering ? 'opacity-100' : 'opacity-0'
              )}>
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            
            {/* Input de archivo oculto */}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            
            {/* Botón de upload visible */}
            <button
              type="button"
              className={cn(
                'absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200',
                'hover:bg-blue-700 hover:scale-110',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                isUploading && 'opacity-50 cursor-not-allowed'
              )}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mx-auto" />
            </button>
          </div>
          
          {/* Información del usuario */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : 'Mi Perfil'
                }
              </h1>
              
              <p className="text-slate-600 dark:text-slate-300">
                {profile.email}
              </p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                {/* Badge de verificación */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Cuenta verificada
                </div>
                
                {/* Badge de ubicación si existe */}
                {profile.country && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm">
                    <span className="text-lg">
                      {profile.country === 'MX' ? '🇲🇽' : 
                       profile.country === 'US' ? '🇺🇸' : 
                       profile.country === 'CA' ? '🇨🇦' : 
                       profile.country === 'ES' ? '🇪🇸' : '🌍'}
                    </span>
                    {profile.city || 'Ubicación'}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="flex sm:flex-col gap-4 sm:gap-2 text-center">
            <div className="px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {new Date().getFullYear() - new Date(profile.created_at || '2024-01-01').getFullYear() || 0}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Años con nosotros
              </div>
            </div>
            
            <div className="px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {profile.services_count || 0}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Servicios activos
              </div>
            </div>
          </div>
        </div>
        
        {/* Descripción adicional */}
        <div className="mt-6 pt-6 border-t border-white/20 dark:border-slate-700/50">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Gestiona tu información personal, configuración de seguridad y dispositivos conectados desde este panel de control.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

