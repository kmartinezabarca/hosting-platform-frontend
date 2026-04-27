import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import { useLogin, useLoginWithGoogle } from "../hooks/useAuth";
import { useAuth } from "../context/AuthContext";
import logoROKE from "../assets/ROKEIndustriesFusionLogo.png";

const LoginPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAuthReady } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0); // seconds remaining after failed attempt
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { mutateAsync: login, isPending: isLoginLoading } = useLogin();
  const { mutateAsync: loginWithGoogle, isPending: isGoogleLoginLoading } = useLoginWithGoogle();
  const isLoading = isLoginLoading || isGoogleLoginLoading;
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Count down the rate-limit cooldown every second
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) { clearInterval(cooldownRef.current ?? undefined); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current ?? undefined);
  }, [cooldown]);
  
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/client/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: null,
      });
    }
    if (error) setError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El formato del correo no es válido.";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return; // rate-limit guard
    const newErrors = validateForm();
    setFormErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setError("");
      try {
        const response = await login({ email: formData.email, password: formData.password });
        await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
        if ((response as any).two_factor_required || response.requires_2fa) {
          navigate("/verify-2fa", { state: { email: formData.email } });
        } else {
          window.location.href = '/client/dashboard';
        }
      } catch (err) {
        setError((err as any)?.message || "Error al iniciar sesión. Verifica tus credenciales.");
        setCooldown(5); // 5-second cooldown after failure to limit brute-force
      }
    }
  };

  function normalizeAuthResponse(resp) {
    return {
      twoFactorRequired: !!resp.two_factor_required,
      email: resp.email || resp.user?.email || null,
    };
  }

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    setError("");
    try {
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
      );
      if (!userInfoResponse.ok) throw new Error("No se pudo obtener la información de Google.");

      const googleUserInfo = await userInfoResponse.json();
      const backendResponse = await loginWithGoogle(googleUserInfo);
      await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
      const { twoFactorRequired, email } = normalizeAuthResponse(backendResponse);

      if (twoFactorRequired) {
        navigate("/verify-2fa", { state: { email } });
      } else {
        window.location.href = '/client/dashboard';
      }
    } catch (err) {
      setError((err as any)?.message || "No se pudo completar el inicio de sesión.");
      setCooldown(5);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => setError("Error al conectar con Google. Inténtalo de nuevo."),
  });

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
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-start">
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
              Bienvenido a <br />
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
              Tu plataforma de hosting tecnológica y moderna. Gestiona tus
              servicios, servidores y dominios desde un solo lugar.
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
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-black">Iniciar Sesión</h2>
              <p className="text-black/70">Accede a tu panel de control</p>
            </div>

            {/* Región de errores con aria-live para lectores de pantalla */}
            <div aria-live="polite" aria-atomic="true" className="sr-only" id="login-status" />

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Campo Email */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black font-semibold"
                >
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/50" aria-hidden="true" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-[#222222] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition-all duration-200 ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="example@example.com"
                  />
                </div>
                {formErrors.email && (
                  <motion.p
                    id="email-error"
                    role="alert"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 pl-1 pt-1"
                  >
                    {formErrors.email}
                  </motion.p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-black font-semibold"
                >
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/50" aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-invalid={!!formErrors.password}
                    aria-describedby={formErrors.password ? "password-error" : undefined}
                    className={`w-full pl-10 pr-12 py-3 bg-white border rounded-xl text-[#222222] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition-all duration-200 ${
                      formErrors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={t('auth.password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t('a11y.hidePassword') : t('a11y.togglePassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/50 hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] rounded"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Eye className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <motion.p
                    id="password-error"
                    role="alert"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 pl-1 pt-1"
                  >
                    {formErrors.password}
                  </motion.p>
                )}
              </div>

              {/* Mensaje de error general */}
              {error && (
                <motion.div
                  role="alert"
                  aria-live="assertive"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-black/70 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#222222] focus:ring-[#222222]"
                  />
                  <span>{t('auth.rememberMe')}</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || cooldown > 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#222222] text-white py-3 px-6 rounded-xl font-semibold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#222222] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : cooldown > 0 ? (
                  <span>{t('auth.cooldown', { seconds: cooldown })}</span>
                ) : (
                  <>
                    <span>{t('auth.login')}</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className="px-2 bg-white text-black/70"
                  style={{ background: "rgba(255, 255, 255, 0.8)" }}
                >
                  o continúa con
                </span>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => googleLogin()}
              disabled={isLoading || cooldown > 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white border border-gray-300 text-[#333] py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span>{t('auth.loginWithGoogle')}</span>
            </motion.button>

            <div className="text-center text-sm text-black/70">
              {t('auth.noAccount')}{" "}
              <Link
                to="/register"
                className="text-black font-semibold hover:underline"
              >
                {t('auth.createAccount')}
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-black/50 text-xs">
            <p>© 2025 ROKE Industries. Todos los derechos reservados.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;