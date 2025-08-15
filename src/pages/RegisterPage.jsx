import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, User, Chrome, ArrowRight, 
  Shield, Zap, Globe, Check, X, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    isValid: false
  });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validación de fortaleza de contraseña
  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
      feedback.push({ text: 'Al menos 8 caracteres', valid: true });
    } else {
      feedback.push({ text: 'Al menos 8 caracteres', valid: false });
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push({ text: 'Una letra mayúscula', valid: true });
    } else {
      feedback.push({ text: 'Una letra mayúscula', valid: false });
    }

    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push({ text: 'Una letra minúscula', valid: true });
    } else {
      feedback.push({ text: 'Una letra minúscula', valid: false });
    }

    if (/\d/.test(password)) {
      score += 1;
      feedback.push({ text: 'Un número', valid: true });
    } else {
      feedback.push({ text: 'Un número', valid: false });
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
      feedback.push({ text: 'Un carácter especial', valid: true });
    } else {
      feedback.push({ text: 'Un carácter especial (!@#$%^&*)', valid: false });
    }

    return {
      score,
      feedback,
      isValid: score >= 4
    };
  };

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength({ score: 0, feedback: [], isValid: false });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('El apellido es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('El formato del correo electrónico no es válido');
      return false;
    }
    if (!passwordStrength.isValid) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword
      });
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    // TODO: Implementar registro con Google
    setError('Registro con Google próximamente disponible');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return 'bg-red-500';
    if (passwordStrength.score <= 2) return 'bg-orange-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    if (passwordStrength.score <= 4) return 'bg-green-400';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 1) return 'Muy débil';
    if (passwordStrength.score <= 2) return 'Débil';
    if (passwordStrength.score <= 3) return 'Regular';
    if (passwordStrength.score <= 4) return 'Fuerte';
    return 'Muy fuerte';
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 particles-bg">
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
              Únete a<br />
              <span className="text-gradient">ROKE Industries</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Crea tu cuenta y accede a la plataforma de hosting más avanzada. 
              Gestiona tus servicios con tecnología de vanguardia.
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
          <div className="card-glass p-8 space-y-6">
            
            {/* Header del formulario */}
            <div className="text-center space-y-2">
              <div className="lg:hidden mb-6">
                <img 
                  src="/ROKEIndustriesFusionLogo.png" 
                  alt="ROKE Industries" 
                  className="h-12 w-auto mx-auto"
                />
              </div>
              <h2 className="text-3xl font-bold text-white">Crear Cuenta</h2>
              <p className="text-white/70">Únete a la plataforma premium</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nombres */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-white">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-white">
                    Apellido
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white">
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
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white">
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
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
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

                {/* Indicador de fortaleza de contraseña */}
                <AnimatePresence>
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Fortaleza de contraseña:</span>
                        <span className={`font-medium ${
                          passwordStrength.score <= 2 ? 'text-red-300' : 
                          passwordStrength.score <= 3 ? 'text-yellow-300' : 'text-green-300'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        />
                      </div>
                      <div className="space-y-1">
                        {passwordStrength.feedback.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-2 text-xs"
                          >
                            {item.valid ? (
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                            ) : (
                              <X className="w-3 h-3 text-red-400" />
                            )}
                            <span className={item.valid ? 'text-green-300' : 'text-red-300'}>
                              {item.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500/50 focus:ring-red-500/50'
                        : 'border-white/20 focus:ring-white/50'
                    }`}
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-red-300 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Las contraseñas no coinciden</span>
                  </motion.div>
                )}
              </div>

              {/* Términos y condiciones */}
              <div className="flex items-start space-x-3">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 rounded border-white/20 bg-white/10 text-primary focus:ring-white/50"
                />
                <label htmlFor="acceptTerms" className="text-sm text-white/70 leading-relaxed">
                  Acepto los{' '}
                  <Link to="/terms" className="text-white hover:underline">
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacy" className="text-white hover:underline">
                    política de privacidad
                  </Link>
                </label>
              </div>

              {/* Error */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center space-x-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Botón de registro */}
              <motion.button
                type="submit"
                disabled={isLoading || !passwordStrength.isValid || !formData.acceptTerms}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white text-gray-900 py-3 px-6 rounded-xl font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Crear Cuenta</span>
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
                  <span className="px-2 bg-transparent text-white/70">o regístrate con</span>
                </div>
              </div>

              {/* Registro con Google */}
              <motion.button
                type="button"
                onClick={handleGoogleRegister}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Chrome className="w-5 h-5" />
                <span>Continuar con Google</span>
              </motion.button>
            </form>

            {/* Link de login */}
            <div className="text-center text-sm text-white/70">
              ¿Ya tienes una cuenta?{' '}
              <Link 
                to="/login" 
                className="text-white font-semibold hover:underline transition-all duration-200"
              >
                Inicia sesión aquí
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

export default RegisterPage;


