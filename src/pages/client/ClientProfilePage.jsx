import React, { useState, useEffect } from 'react';
import authService from '../../services/auth';

const ClientProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'MX',
    postal_code: ''
  });
  const [security, setSecurity] = useState({
    two_factor_enabled: false,
    password_last_changed: null,
    security_score: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    loadProfileData();
    loadSecurityData();
  }, []);

  const loadProfileData = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityData = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:8000/api/profile/security', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSecurity(data.data);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Perfil actualizado exitosamente');
        setProfile(data.data);
      } else {
        setMessage(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      setMessage('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const generate2FA = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:8000/api/2fa/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setQrCode(data.data.qr_code);
        setTwoFactorSecret(data.data.secret);
      } else {
        setMessage(data.message || 'Error al generar 2FA');
      }
    } catch (error) {
      setMessage('Error de conexión');
    }
  };

  const enable2FA = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:8000/api/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code: verificationCode })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('2FA activado exitosamente');
        setSecurity(prev => ({ ...prev, two_factor_enabled: true }));
        setQrCode('');
        setVerificationCode('');
      } else {
        setMessage(data.message || 'Error al activar 2FA');
      }
    } catch (error) {
      setMessage('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona tu información personal y configuración de seguridad
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('exitosamente') 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', name: 'Información Personal', icon: '👤' },
                { id: 'security', name: 'Seguridad', icon: '🔒' },
                { id: 'sessions', name: 'Sesiones', icon: '📱' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={updateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={profile.first_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={profile.last_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                      disabled
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Para cambiar tu email, contacta al soporte
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      País
                    </label>
                    <select
                      value={profile.country}
                      onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="MX">México</option>
                      <option value="US">Estados Unidos</option>
                      <option value="CA">Canadá</option>
                      <option value="ES">España</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dirección
                    </label>
                    <textarea
                      value={profile.address || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={profile.city || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={profile.postal_code || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, postal_code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* Security Score */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Puntuación de Seguridad
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            security.security_score >= 80 ? 'bg-green-500' :
                            security.security_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${security.security_score}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {security.security_score}%
                    </span>
                  </div>
                </div>

                {/* 2FA Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Autenticación de Dos Factores (2FA)
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Agrega una capa extra de seguridad a tu cuenta
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      security.two_factor_enabled 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {security.two_factor_enabled ? 'Activado' : 'Desactivado'}
                    </div>
                  </div>

                  {!security.two_factor_enabled && !qrCode && (
                    <button
                      onClick={generate2FA}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Configurar 2FA
                    </button>
                  )}

                  {qrCode && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Escanea este código QR con tu aplicación de autenticación
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Clave manual:</p>
                          <code className="text-sm font-mono">{twoFactorSecret}</code>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          placeholder="Código de verificación"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          maxLength={6}
                        />
                        <button
                          onClick={enable2FA}
                          disabled={verificationCode.length !== 6}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Activar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contraseña
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Última actualización: {security.password_last_changed ? 
                      new Date(security.password_last_changed).toLocaleDateString() : 'Nunca'}
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sesiones Activas
                </h3>
                
                <div className="space-y-4">
                  {[
                    {
                      device: 'Chrome en Windows',
                      location: 'Ciudad de México, México',
                      ip: '192.168.1.100',
                      lastActive: '5 minutos',
                      current: true
                    },
                    {
                      device: 'Safari en iPhone',
                      location: 'Guadalajara, México',
                      ip: '192.168.1.101',
                      lastActive: '2 horas',
                      current: false
                    }
                  ].map((session, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {session.device}
                            </h4>
                            {session.current && (
                              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                                Actual
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {session.location} • {session.ip}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Última actividad: hace {session.lastActive}
                          </p>
                        </div>
                        {!session.current && (
                          <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                            Cerrar Sesión
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;

