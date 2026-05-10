import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, AtSign,
  X, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import { useRegister, useLoginWithGoogle } from '@application/hooks/useAuth';
import authService from '@infrastructure/services/authService';
import { toast } from "@presentation/components/features/ToastProvider";
import logoROKE from "../assets/ROKEIndustriesFusionLogo.png";

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{score: number; feedback: {text: string; valid: boolean}[]; isValid: boolean}>({
    score: 0,
    feedback: [],
    isValid: false,
  });

  // Username availability state
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { mutateAsync: register, isPending: isRegisterLoading } = useRegister();
  const { mutateAsync: loginWithGoogle, isPending: isGoogleRegisterLoading } = useLoginWithGoogle();
  const isLoading = isRegisterLoading || isGoogleRegisterLoading;
  const navigate = useNavigate();

  // Validación de fortaleza de contraseña
  const checkPasswordStrength = (password: string) => {
    const feedback: { text: string; valid: boolean }[] = [];
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

  // Debounced username availability check
  const checkUsername = useCallback((value: string) => {
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);
    if (!value) { setUsernameStatus('idle'); return; }
    if (!USERNAME_REGEX.test(value)) { setUsernameStatus('invalid'); return; }

    setUsernameStatus('checking');
    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const result = await authService.checkUsernameAvailability(value);
        setUsernameStatus(result.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);
  }, []);

  useEffect(() => {
    checkUsername(formData.username);
    return () => { if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current); };
  }, [formData.username, checkUsername]);

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
      case 'username':
        if (!value.trim()) newError = 'El nombre de usuario es requerido.';
        else if (!USERNAME_REGEX.test(value)) newError = '3-30 caracteres, solo letras, números, guiones y guion bajo.';
        else if (usernameStatus === 'taken') newError = 'Este nombre de usuario ya está en uso.';
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
    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return false;
    }
    if (!USERNAME_REGEX.test(formData.username)) {
      setError('El nombre de usuario debe tener 3-30 caracteres y solo letras, números, - o _.');
      return false;
    }
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      setError('El nombre de usuario no está disponible.');
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
    if (!validateForm()) {
      toast.warning("Por favor, completa correctamente todos los campos");
      return;
    }
    Object.keys(formData).forEach(name => validateField(name, formData[name]));
    
    const hasErrors = Object.values(formErrors).some(error => error);
    const passwordIsValid = checkPasswordStrength(formData.password).score >= 4;

    if (hasErrors || !passwordIsValid || !formData.acceptTerms) {
      setError('Por favor, corrige los errores y acepta los términos.');
      toast.error("Hay errores en el formulario");
      return;
    }
    
    setError('');

    try {
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword
      });
      toast.success("¡Cuenta creada con éxito!", "Bienvenido a ROKE Industries");
      navigate('/client/dashboard');
    } catch (err) {
      const msg = (err as any)?.message || 'Error al crear la cuenta.';
      setError(msg);
      toast.error("Error al registrarse", msg);
    }
  };

  const handleGoogleRegisterSuccess = async (tokenResponse: any) => {
    setError('');
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` },
      });
      const googleUserInfo = await userInfoResponse.json();

      const backendResponse = await loginWithGoogle(googleUserInfo) as any;
      
      toast.success("¡Registro con Google exitoso!");

      if (backendResponse?.two_factor_required) {
        navigate("/verify-2fa", { state: { email: backendResponse.email } });
      } else if (backendResponse?.username_required && backendResponse?.setup_token) {
        navigate(`/auth/complete-profile?setup_token=${encodeURIComponent(backendResponse.setup_token)}`, {
          state: {
            setup_token: backendResponse.setup_token,
            user_preview: backendResponse.user_preview,
            expires_in_minutes: backendResponse.expires_in_minutes,
          },
        });
      } else if (backendResponse?.needs_username) {
        navigate('/auth/setup-username');
      } else if (backendResponse?.access_token || backendResponse?.user) {
        navigate(backendResponse?.redirect_to || "/client/dashboard");
      } else {
        navigate(backendResponse?.redirect_to || "/client/dashboard");
      }
    } catch (err) {
      const msg = (err as any)?.message || 'No se pudo completar el registro con Google.';
      setError(msg);
      toast.error("Error con Google", msg);
    }
  };

 const googleRegister = useGoogleLogin({
    onSuccess: handleGoogleRegisterSuccess,
    onError: () => {
      const msg = 'El registro con Google falló. Inténtalo de nuevo.';
      setError(msg);
      toast.error(msg);
    },
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
    if (passwordStrength.score <= 3) return 'Media';
    if (passwordStrength.score <= 4) return 'Fuerte';
    return 'Excelente';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, hsl(var(--color-primary)) 0%, #B366FF 50%, #0052CC 100%)",
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
          backgroundImage: "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
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
              Únete a la <br />
              <span style={{
                background: "linear-gradient(135deg, #222222, #555555)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Nueva Era del Hosting
              </span>
            </h1>
            <p className="text-xl text-black/80 leading-relaxed">
              Crea tu cuenta en segundos y comienza a desplegar tus proyectos con la mejor infraestructura.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Seguridad de Nivel Empresarial</h3>
                <p className="text-black/70">Protección Anti-DDoS y aislamiento de contenedores en cada servicio.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rendimiento sin Compromisos</h3>
                <p className="text-black/70">Hardware de última generación con almacenamiento NVMe de alta velocidad.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel derecho - Formulario */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-xl mx-auto"
        >
          <div
            className="p-8 space-y-6 rounded-2xl border border-white/20"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-black">Crear Cuenta</h2>
              <p className="text-black/70">Completa tus datos para comenzar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-black/70 ml-1">Nombre</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-black transition-colors" />
                    <input
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-4 py-3 bg-white/50 border ${formErrors.firstName ? 'border-red-500' : 'border-black/10'} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all`}
                      placeholder="Juan"
                    />
                  </div>
                  {formErrors.firstName && <p className="text-xs text-red-600 ml-1">{formErrors.firstName}</p>}
                </div>

                {/* Apellido */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-black/70 ml-1">Apellido</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-black transition-colors" />
                    <input
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-4 py-3 bg-white/50 border ${formErrors.lastName ? 'border-red-500' : 'border-black/10'} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all`}
                      placeholder="Pérez"
                    />
                  </div>
                  {formErrors.lastName && <p className="text-xs text-red-600 ml-1">{formErrors.lastName}</p>}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-black/70 ml-1">Nombre de Usuario</label>
                <div className="relative group">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-black transition-colors" />
                  <input
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-11 pr-12 py-3 bg-white/50 border ${formErrors.username ? 'border-red-500' : 'border-black/10'} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all`}
                    placeholder="juan_perez"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && <Loader2 className="w-5 h-5 text-black/40 animate-spin" />}
                    {usernameStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {usernameStatus === 'taken' && <X className="w-5 h-5 text-red-500" />}
                  </div>
                </div>
                {formErrors.username && <p className="text-xs text-red-600 ml-1">{formErrors.username}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-black/70 ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-black transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-11 pr-4 py-3 bg-white/50 border ${formErrors.email ? 'border-red-500' : 'border-black/10'} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all`}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                {formErrors.email && <p className="text-xs text-red-600 ml-1">{formErrors.email}</p>}
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-black/70 ml-1">Contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-black transition-colors" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-10 py-3 bg-white/50 border ${formErrors.password ? 'border-red-500' : 'border-black/10'} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-black/40 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-black/70 ml-1">Confirmar</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-black transition-colors" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-10 py-3 bg-white/50 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-black/10'} rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-black/40 hover:text-black transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {formErrors.confirmPassword && <p className="text-xs text-red-600 ml-1">{formErrors.confirmPassword}</p>}

              {/* Password Strength Meter */}
              <AnimatePresence>
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-semibold text-black/60">Fortaleza: {getPasswordStrengthText()}</span>
                      <span className="text-xs font-bold text-black/40">{passwordStrength.score}/5</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-500`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-1">
                      {passwordStrength.feedback.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          {f.valid ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-black/10" />}
                          <span className={`text-[10px] ${f.valid ? 'text-green-600 font-medium' : 'text-black/40'}`}>{f.text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Términos y Condiciones */}
              <div className="flex items-start gap-3 px-1 py-2">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-black/10 text-black focus:ring-black/5"
                />
                <label htmlFor="acceptTerms" className="text-xs text-black/60 leading-relaxed">
                  Acepto los <Link to="/terms" className="font-bold text-black hover:underline">Términos de Servicio</Link> y la <Link to="/privacy" className="font-bold text-black hover:underline">Política de Privacidad</Link>.
                </label>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/90 transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Crear Cuenta
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/50 backdrop-blur-sm text-black/50 font-medium">O regístrate con</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => googleRegister()}
              disabled={isLoading}
              className="w-full py-3 bg-white border border-black/10 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-black/5 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <p className="text-center text-sm text-black/60">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="font-bold text-black hover:underline">Inicia Sesión</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
