import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, User, Chrome, ArrowRight, 
  Shield, Zap, Globe, Check, X, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoROKE from "../assets/ROKEIndustriesFusionLogo.png";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    isValid: false
  });
  
  const { register, loginWithGoogle } = useAuth();
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

   const validateField = (name, value) => {
    let newError = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) newError = 'Este campo es requerido.';
        else if (!/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/.test(value)) newError = 'Solo se permiten letras y espacios.';
        break;
      case 'email':
        if (!value.trim()) newError = 'El correo es requerido.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newError = 'Formato de correo no válido.';
        break;
      case 'password':
        // La validación de fortaleza ya se muestra, no necesitamos un error de texto aquí.
        break;
      case 'confirmPassword':
        if (formData.password && value !== formData.password) newError = 'Las contraseñas no coinciden.';
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: newError }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (error) setError('');
  };

   const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
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
    // Re-validar todos los campos antes de enviar
    if (!validateForm()) return;
    Object.keys(formData).forEach(name => validateField(name, formData[name]));
    
    const hasErrors = Object.values(formErrors).some(error => error);
    const passwordIsValid = checkPasswordStrength(formData.password).score >= 4;

    if (hasErrors || !passwordIsValid || !formData.acceptTerms) {
      setError('Por favor, corrige los errores y acepta los términos.');
      return;
    }
    
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
      setError(err.message || 'Error al crear la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegisterSuccess = async (tokenResponse) => {
    setIsLoading(true);
    setError('');
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` },
      } );
      const googleUserInfo = await userInfoResponse.json();
      
      // Reutilizamos la misma función de loginWithGoogle, ya que el backend se encarga de crear el usuario si no existe.
      const backendResponse = await loginWithGoogle(googleUserInfo);

      if (backendResponse.two_factor_required) {
        navigate("/verify-2fa", { state: { email: backendResponse.email } });
      } else if (backendResponse.access_token) {
        navigate("/client/dashboard");
      } else {
        throw new Error("Respuesta inesperada del servidor.");
      }
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro con Google.');
    } finally {
      setIsLoading(false);
    }
  };

 const googleRegister = useGoogleLogin({
    onSuccess: handleGoogleRegisterSuccess,
    onError: () => setError('El registro con Google falló. Inténtalo de nuevo.'),
  });

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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--color-primary)) 0%, #B366FF 50%, #0052CC 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Panel izquierdo - Información */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block text-black space-y-8"
        >
          <div className="space-y-4">
            <img src={logoROKE} alt="ROKE Industries" className="h-24 w-auto" />
            <h1 className="text-5xl font-bold leading-tight">
              Únete a<br />
              <span
                style={{
                  background: "linear-gradient(135deg, #222222, #555555)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ROKE Industries
              </span>
            </h1>
            <p className="text-xl text-black/80 leading-relaxed">
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
                <p className="text-black/70">
                  Protección 24/7 con autenticación de doble factor
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rendimiento Óptimo</h3>
                <p className="text-black/70">
                  Servidores de alta velocidad y disponibilidad
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Alcance Global</h3>
                <p className="text-black/70">
                  Infraestructura distribuida mundialmente
                </p>
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
          <div
            className="p-8 space-y-6 rounded-2xl border border-white/20"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Header del formulario */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-black">Crear Cuenta</h2>
              <p className="text-black/70">Únete a la plataforma premium</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-black font-semibold"
                  >
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/50" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#222222] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition-all duration-200
                         ${formErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#222222]'}`}
                      placeholder="Tu nombre"
                    />
                  </div>
                  {formErrors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 pl-1 pt-1"
                  >
                    {formErrors.firstName}
                  </motion.p>
                )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-black font-semibold"
                  >
                    Apellido
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/50" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#222222] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition-all duration-200
                        ${formErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#222222]'}`}
                      placeholder="Tu apellido"
                    />
                  </div>
                  {formErrors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 pl-1 pt-1"
                  >
                    {formErrors.lastName}
                  </motion.p>
                )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black font-semibold"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/50" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#222222] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition-all duration-200
                      ${
                        formErrors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#222222]"
                      }`}
                    placeholder="example@example.com"
                  />
                </div>
                {formErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 pl-1 pt-1"
                  >
                    {formErrors.email}
                  </motion.p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-black font-semibold"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/50" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-xl text-[#222222] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition-all duration-200 
                      ${
                        formErrors.password
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#222222]"
                      }`}
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {/* Indicador de fortaleza de contraseña */}
                <AnimatePresence>
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-black/70">Fortaleza:</span>
                        <span
                          className={`font-medium ${
                            passwordStrength.score <= 2
                              ? "text-red-500"
                              : passwordStrength.score <= 3
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                          }}
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        />
                      </div>
                      <div className="space-y-1 text-xs">
                        {passwordStrength.feedback.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-2"
                          >
                            {item.valid ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            ) : (
                              <X className="w-3 h-3 text-red-500" />
                            )}
                            <span
                              className={
                                item.valid ? "text-gray-600" : "text-red-500"
                              }
                            >
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
              <div className="space-y-1">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-black font-semibold"
                >
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/50" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-white border rounded-xl text-[#222222] placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#222222]"
                    }`}
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-red-600 text-sm pt-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Las contraseñas no coinciden</span>
                    </motion.div>
                  )}
              </div>

              {/* Términos y condiciones */}
              <div className="flex items-start space-x-3 pt-2">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#222222] focus:ring-[#222222]"
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm text-black/70 leading-relaxed"
                >
                  Acepto los{" "}
                  <Link
                    to="/terms"
                    className="text-black font-semibold hover:underline"
                  >
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    to="/privacy"
                    className="text-black font-semibold hover:underline"
                  >
                    política de privacidad
                  </Link>
                </label>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-500 text-sm flex items-center space-x-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Botón de registro */}
              <motion.button
                type="submit"
                disabled={
                  isLoading ||
                  !passwordStrength.isValid ||
                  !formData.acceptTerms
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#222222] text-white py-3 px-6 rounded-xl font-semibold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#222222] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Crear Cuenta</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className="px-2 text-gray-500"
                    style={{ background: "rgba(255, 255, 255, 0.85)" }}
                  >
                    o regístrate con
                  </span>
                </div>
              </div>

              {/* Registro con Google */}
              <motion.button
                type="button"
                onClick={() => googleRegister()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white border border-gray-300 text-[#333] py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
                <span>Continuar con Google</span>
              </motion.button>
            </form>

            {/* Link de login */}
            <div className="text-center text-sm text-black/70">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-black font-semibold hover:underline transition-all duration-200"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-black/50 text-xs">
            <p>© 2025 ROKE Industries. Todos los derechos reservados.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;


