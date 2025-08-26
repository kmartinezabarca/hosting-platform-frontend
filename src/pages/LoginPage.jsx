import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "../context/AuthContext";
import logoROKE from "../assets/ROKEIndustriesFusionLogo.png";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [setTempAuthData] = useState(null);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

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

  // Función para validar el formulario antes de enviarlo
  const validateForm = () => {
    const newErrors = {};
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
    const newErrors = validateForm();
    setFormErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setError("");
      try {
        // La función login ahora puede devolver un objeto especial
        const response = await login(formData.email, formData.password);

        if (response.two_factor_required) {
          setTempAuthData(response.temp_data);
          navigate("/verify-2fa", { state: { email: formData.email } });
        } else {
          navigate("/client/dashboard");
        }
      } catch (err) {
        setError(
          err.message || "Error al iniciar sesión. Verifica tus credenciales."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  function normalizeAuthResponse(resp) {
    return {
      token: resp.token || resp.access_token || null,
      tokenType: resp.token_type || "Bearer",
      twoFactorRequired: !!resp.two_factor_required,
      email: resp.email || resp.user?.email || null,
      user: resp.user ?? null,
    };
  }

 const handleGoogleLoginSuccess = async (tokenResponse) => {
    setIsLoading(true);
    setError("");

    try {

      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
       );

      if (!userInfoResponse.ok) {
        throw new Error("No se pudo obtener la información de Google.");
      }

      const googleUserInfo = await userInfoResponse.json();
      const backendResponse = await loginWithGoogle(googleUserInfo);
      console.log("Respuesta del backend:", backendResponse);

      const { token, tokenType, twoFactorRequired, email, user } = normalizeAuthResponse(backendResponse);

      if (twoFactorRequired) {
        console.log("2FA requerido. Redirigiendo a la página de verificación...");
        navigate("/verify-2fa", { state: { email: email } });
      } else if (token) {
        console.log("Login con Google exitoso. Redirigiendo al dashboard...");
        navigate("/client/dashboard");
      } else {
        throw new Error("Respuesta inesperada del servidor.");
      }

    } catch (err) {
      console.error("Error en el flujo de autenticación con Google:", err);
      setError(err.message || "No se pudo completar el inicio de sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => {
      console.error("Login con Google fallido");
      setError("Error al conectar con Google. Inténtalo de nuevo.");
    },
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Email */}
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
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-[#222222] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition-all duration-200 ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
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

              {/* Campo Contraseña */}
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
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-white border rounded-xl text-[#222222] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition-all duration-200 ${
                      formErrors.password ? "border-red-500" : "border-gray-300"
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
                {formErrors.password && (
                  <motion.p
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-black/70">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#222222] focus:ring-[#222222]"
                  />
                  <span>Recordarme</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-black/70 hover:text-black transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#222222] text-white py-3 px-6 rounded-xl font-semibold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#222222] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-5 h-5" />
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

            <div className="text-center text-sm text-black/70">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/register"
                className="text-black font-semibold hover:underline"
              >
                Regístrate aquí
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
