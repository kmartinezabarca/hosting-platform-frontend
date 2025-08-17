import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Chrome, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simular autenticación con Google OAuth
      // En producción, esto se conectaría con Google OAuth API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular datos del usuario de Google
      const googleUser = {
        email: 'usuario@gmail.com',
        first_name: 'Usuario',
        last_name: 'Google',
        avatar: null,
        provider: 'google'
      };
      
      // Simular login exitoso
      await login(googleUser.email, null, googleUser);
      navigate('/client/dashboard');
      
    } catch (err) {
      setError('Error al conectar con Google. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, #B366FF 50%, #0052CC 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Panel izquierdo - Información */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block text-white space-y-8"
        >
          <div className="space-y-4">
            <img 
              src="/ROKEIndustriesFusionLogo.png" 
              alt="ROKE Industries" 
              className="h-16 w-auto filter brightness-0 invert"
            />
            <h1 className="text-5xl font-bold leading-tight">
              Bienvenido a<br />
              <span style={{ background: 'linear-gradient(135deg, hsl(var(--color-primary)), #667eea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ROKE Industries</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Tu plataforma de hosting tecnológica y moderna. Gestiona tus servicios, 
              servidores y dominios desde un solo lugar.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Seguridad Avanzada</h3>
                <p className="text-white/70">Protección 24/7 con autenticación de doble factor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rendimiento Óptimo</h3>
                <p className="text-white/70">Servidores de alta velocidad y disponibilidad</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Alcance Global</h3>
                <p className="text-white/70">Infraestructura distribuida mundialmente</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel derecho - Formulario */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="p-8 space-y-6 rounded-2xl border border-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.3)'
            }}
          >
            
            {/* Header del formulario */}
            <div className="text-center space-y-2">
              <div className="lg:hidden mb-6">
                <img 
                  src="/ROKEIndustriesFusionLogo.png" 
                  alt="ROKE Industries" 
                  className="h-12 w-auto mx-auto"
                />
              </div>
              <h2 className="text-3xl font-bold text-white">Iniciar Sesión</h2>
              <p className="text-white/70">Accede a tu panel de control</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Campo Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white font-semibold drop-shadow-lg">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white font-semibold drop-shadow-lg">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Recordar y Olvidé contraseña */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-white/70">
                  <input 
                    type="checkbox" 
                    className="rounded border-white/20 bg-white/10 text-primary focus:ring-white/50"
                  />
                  <span>Recordarme</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de login */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white text-gray-900 py-3 px-6 rounded-xl font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/70">o continúa con</span>
                </div>
              </div>

              {/* Login con Google */}
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Chrome className="w-5 h-5" />
                <span>Continuar con Google</span>
              </motion.button>
            </form>

            {/* Link de registro */}
            <div className="text-center text-sm text-white/70">
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/register" 
                className="text-white font-semibold hover:underline transition-all duration-200"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-white/50 text-xs">
            <p>© 2025 ROKE Industries. Todos los derechos reservados.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;


