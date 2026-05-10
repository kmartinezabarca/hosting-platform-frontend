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
import { useLogin, useLoginWithGoogle } from '@application/hooks/useAuth';
import { useAuth } from '@application/context/AuthContext';
import { toast } from "@presentation/components/features/ToastProvider";
import logoROKE from "@presentation/assets/ROKEIndustriesFusionLogo.png";

const LoginPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAuthReady, user } = useAuth();
  
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

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleLoginSuccess(tokenResponse),
    onError: () => {
      const msg = t('auth.errors.googleError');
      setError(msg);
      toast.error(msg);
    },
  });

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
    return <Navigate to={user?.needs_username ? '/auth/setup-username' : '/client/dashboard'} replace />;
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
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }
    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
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
        toast.success("¡Bienvenido de nuevo!", "Iniciando sesión...");
        
        if ((response as any).two_factor_required || response.requires_2fa) {
          navigate("/verify-2fa", { state: { email: formData.email } });
        } else if ((response as any).needs_username) {
          navigate('/auth/setup-username');
        } else {
          window.location.href = (response as any).redirect_to || '/client/dashboard';
        }
      } catch (err) {
        const msg = (err as any)?.message || t('auth.errors.invalidCredentials');
        setError(msg);
        toast.error("Error al iniciar sesión", msg);
        setCooldown(5); // 5-second cooldown after failure to limit brute-force
      }
    } else {
      toast.warning("Por favor, completa los campos requeridos");
    }
  };

  function normalizeAuthResponse(resp) {
    return {
      twoFactorRequired: !!resp.two_factor_required,
      email: resp.email || resp.user?.email || null,
      usernameRequired: !!resp.username_required,
      needsUsername: !!resp.needs_username,
      setupToken: resp.setup_token || null,
      userPreview: resp.user_preview || null,
      redirectTo: resp.redirect_to || '/client/dashboard',
    };
  }

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    setError("");
    try {
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
      );
      if (!userInfoResponse.ok) throw new Error(t('auth.errors.googleProfileError'));

      const googleUserInfo = await userInfoResponse.json();
      const backendResponse = await loginWithGoogle(googleUserInfo);
     
      await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
      
      toast.success("¡Acceso con Google exitoso!");
      
      const { twoFactorRequired, email, usernameRequired, setupToken, userPreview, needsUsername, redirectTo } = normalizeAuthResponse(backendResponse);

      if (twoFactorRequired) {
        navigate("/verify-2fa", { state: { email } });
      } else if (usernameRequired && setupToken) {
        navigate(`/auth/complete-profile?setup_token=${encodeURIComponent(setupToken)}`, {
          state: { setup_token: setupToken, user_preview: userPreview },
        });
      } else if (needsUsername) {
        navigate('/auth/setup-username');
      } else {
        // window.location.href = redirectTo;
        window.location.href ='/client/dashboard';
      }
    } catch (err) {
      const msg = (err as any)?.message || t('auth.errors.loginIncomplete');
      setError(msg);
      toast.error("Error con Google", msg);
      setCooldown(5);
    }
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
              {t('auth.hero.welcome')} <br />
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
              {t('auth.hero.description')}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('features.security.title')}</h3>
                <p className="text-black/70">
                  {t('features.security.desc')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('features.performance.title')}</h3>
                <p className="text-black/70">
                  {t('features.performance.desc')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('features.global.title')}</h3>
                <p className="text-black/70">
                  {t('features.global.desc')}
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
              <h2 className="text-3xl font-bold text-black">{t('auth.loginTitle')}</h2>
              <p className="text-black/70">{t('auth.loginSubtitle')}</p>
            </div>

            {/* Región de errores con aria-live para lectores de pantalla */}
            <div aria-live="polite" aria-atomic="true" className="sr-only" id="login-status" />

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Campo Email */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black/70 ml-1"
                >
                  {t('auth.email')}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-black transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-white/50 border ${
                      formErrors.email ? "border-red-500" : "border-black/10"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all`}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-600 ml-1">{formErrors.email}</p>
                )}
              </div>

              {/* Campo Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-black/70"
                  >
                    {t('auth.password')}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-black hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-black transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-12 py-3 bg-white/50 border ${
                      formErrors.password ? "border-red-500" : "border-black/10"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-black/40 hover:text-black transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-xs text-red-600 ml-1">{formErrors.password}</p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading || cooldown > 0}
                className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/90 transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : cooldown > 0 ? (
                  `${t('auth.wait')} (${cooldown}s)`
                ) : (
                  <>
                    {t('auth.login')}
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
                <span className="px-4 bg-white/50 backdrop-blur-sm text-black/50 font-medium">
                  {t('common.or')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={isLoading}
              className="w-full py-3 bg-white border border-black/10 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-black/5 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            <p className="text-center text-sm text-black/60">
              {t('auth.noAccount')}{" "}
              <Link
                to="/register"
                className="font-bold text-black hover:underline"
              >
                {t('auth.register')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
