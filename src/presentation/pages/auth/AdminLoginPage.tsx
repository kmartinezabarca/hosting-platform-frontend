import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useLogin, useLoginWithGoogle } from "@application/hooks/useAuth";
import { useAuth } from "@application/context/AuthContext";
import logoROKE from "@presentation/assets/ROKEIndustriesFusionLogo.png";

/* ─────────────────────────────────────────────
   Design tokens (inline so the file is self-contained)
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  .admin-login-root {
    --bg:        #0C0C0F;
    --surface:   #111116;
    --border:    rgba(255,255,255,0.07);
    --border-hi: rgba(255,255,255,0.14);
    --text:      #F0F0F2;
    --muted:     rgba(240,240,242,0.42);
    --accent:    #7B61FF;
    --accent-lo: rgba(123,97,255,0.12);
    --danger:    #FF5B5B;
    --danger-lo: rgba(255,91,91,0.10);
    --radius:    10px;
    font-family: 'Sora', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* ---- grid noise background ---- */
  .admin-login-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  .admin-login-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse 70% 60% at 50% -10%, rgba(123,97,255,0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .admin-card {
    position: relative;
    z-index: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.04) inset,
      0 40px 80px rgba(0,0,0,0.6),
      0 0 120px rgba(123,97,255,0.06);
  }

  .admin-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    padding: 11px 16px;
    outline: none;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
  }
  .admin-input::placeholder { color: var(--muted); }
  .admin-input:focus {
    border-color: var(--accent);
    background: rgba(123,97,255,0.06);
    box-shadow: 0 0 0 3px rgba(123,97,255,0.14);
  }
  .admin-input.error {
    border-color: var(--danger);
    box-shadow: 0 0 0 3px var(--danger-lo);
  }
  .admin-input.has-icon-l  { padding-left:  42px; }
  .admin-input.has-icon-r  { padding-right: 42px; }

  .admin-btn-primary {
    width: 100%;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 12px 20px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: opacity 0.15s, transform 0.12s, box-shadow 0.18s;
    box-shadow: 0 4px 24px rgba(123,97,255,0.30);
  }
  .admin-btn-primary:hover:not(:disabled) {
    opacity: 0.88;
    box-shadow: 0 6px 32px rgba(123,97,255,0.42);
  }
  .admin-btn-primary:active:not(:disabled) { transform: scale(0.985); }
  .admin-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  .admin-btn-google {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: 'Sora', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    padding: 11px 20px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: background 0.15s, border-color 0.15s;
  }
  .admin-btn-google:hover:not(:disabled) {
    background: rgba(255,255,255,0.07);
    border-color: var(--border-hi);
  }
  .admin-btn-google:disabled { opacity: 0.4; cursor: not-allowed; }

  .admin-label {
    display: block;
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }

  .admin-divider {
    display: flex; align-items: center; gap: 12px;
    color: var(--muted);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .admin-divider::before, .admin-divider::after {
    content: ''; flex: 1;
    height: 1px; background: var(--border);
  }

  .admin-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.04em;
    color: var(--accent);
    background: var(--accent-lo);
    border: 1px solid rgba(123,97,255,0.20);
    border-radius: 4px;
    padding: 2px 8px;
  }

  .admin-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* subtle scanline on the card top edge */
  .admin-card-header-line {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%);
    opacity: 0.5;
    border-radius: 1px;
    margin-bottom: 32px;
  }
`;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const AdminLoginPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAuthReady, user } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutateAsync: login, isPending: isLoginLoading } = useLogin();
  const { mutateAsync: loginWithGoogle, isPending: isGoogleLoginLoading } = useLoginWithGoogle();
  const isLoading = isLoginLoading || isGoogleLoginLoading;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleLoginSuccess(tokenResponse),
    onError: () => setError("Error al conectar con Google. Inténtalo de nuevo."),
  });

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
      <div className="admin-login-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0C0C0F" }}>
        <style>{styles}</style>
        <div className="admin-spinner" style={{ width: 24, height: 24 }} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.needs_username ? "/auth/setup-username" : "/admin/dashboard"} replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: null });
    if (error) setError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "El correo es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Formato de correo no válido.";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;
    const newErrors = validateForm();
    setFormErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setError("");
      try {
        const response = await login({ email: formData.email, password: formData.password });
        await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
        if ((response as any).two_factor_required || response.requires_2fa) {
          navigate("/verify-2fa", { state: { email: formData.email } });
        } else if ((response as any).needs_username) {
          navigate("/auth/setup-username");
        } else {
          window.location.href = (response as any).redirect_to || "/admin/dashboard";
        }
      } catch (err) {
        setError((err as any)?.message || "Credenciales incorrectas. Verifica e intenta de nuevo.");
        setCooldown(5);
      }
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
      redirectTo: resp.redirect_to || "/admin/dashboard",
    };
  }

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    setError("");
    try {
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      if (!userInfoResponse.ok) throw new Error("No se pudo obtener la información de Google.");
      const googleUserInfo = await userInfoResponse.json();
      const backendResponse = await loginWithGoogle(googleUserInfo);
      await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
      const { twoFactorRequired, email, usernameRequired, setupToken, userPreview, needsUsername, redirectTo } =
        normalizeAuthResponse(backendResponse);
      if (twoFactorRequired) {
        navigate("/verify-2fa", { state: { email } });
      } else if (usernameRequired && setupToken) {
        navigate(`/auth/complete-profile?setup_token=${encodeURIComponent(setupToken)}`, {
          state: { setup_token: setupToken, user_preview: userPreview },
        });
      } else if (needsUsername) {
        navigate("/auth/setup-username");
      } else {
        window.location.href = redirectTo;
      }
    } catch (err) {
      setError((err as any)?.message || "No se pudo completar el inicio de sesión.");
      setCooldown(5);
    }
  };

  /* ── Render ── */
  return (
    <div
      className="admin-login-root"
      style={{
        minHeight: "100vh",
        background: "#0C0C0F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      <style>{styles}</style>

      {/* ── Card ── */}
      <motion.div
        className="admin-card"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 400, padding: "40px 40px 36px" }}
      >
        {/* Top accent line */}
        <div className="admin-card-header-line" />

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <img src={logoROKE} alt="ROKE Industries" style={{ height: 100, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
            <span className="admin-tag">ADMIN PANEL</span>
          </div>

          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#F0F0F2", lineHeight: 1.2 }}>
            Acceso administrativo
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(240,240,242,0.45)", lineHeight: 1.5 }}>
            Acceso restringido a personal autorizado
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Email */}
          <div>
            <label htmlFor="email" className="admin-label">Correo electrónico</label>
            <div style={{ position: "relative" }}>
              <svg
                aria-hidden="true"
                style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", opacity: 0.35 }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F0F0F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={!!formErrors.email}
                aria-describedby={formErrors.email ? "email-error" : undefined}
                className={`admin-input has-icon-l${formErrors.email ? " error" : ""}`}
                placeholder="admin@rokeindustries.com"
              />
            </div>
            <AnimatePresence>
              {formErrors.email && (
                <motion.p
                  id="email-error" role="alert"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ margin: "5px 0 0", fontSize: 11.5, color: "var(--danger)", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <AlertCircle size={11} /> {formErrors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label htmlFor="password" className="admin-label" style={{ margin: 0 }}>Contraseña</label>
              <Link
                to="/forgot-password"
                style={{ fontSize: 11.5, color: "rgba(240,240,242,0.4)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(240,240,242,0.75)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,240,242,0.4)")}
              >
                ¿Olvidaste la contraseña?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <svg
                aria-hidden="true"
                style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", opacity: 0.35 }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F0F0F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={!!formErrors.password}
                aria-describedby={formErrors.password ? "password-error" : undefined}
                className={`admin-input has-icon-l has-icon-r${formErrors.password ? " error" : ""}`}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(240,240,242,0.35)", padding: 2, display: "flex",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(240,240,242,0.7)")}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(240,240,242,0.35)")}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <AnimatePresence>
              {formErrors.password && (
                <motion.p
                  id="password-error" role="alert"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ margin: "5px 0 0", fontSize: 11.5, color: "var(--danger)", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <AlertCircle size={11} /> {formErrors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Error global */}
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert" aria-live="assertive"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  background: "var(--danger-lo)",
                  border: "1px solid rgba(255,91,91,0.22)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 12.5,
                  color: "#FF8A8A",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading || cooldown > 0}
            whileHover={{ scale: isLoading || cooldown > 0 ? 1 : 1.015 }}
            whileTap={{ scale: isLoading || cooldown > 0 ? 1 : 0.985 }}
            className="admin-btn-primary"
            style={{ marginTop: 4 }}
          >
            {isLoading ? (
              <div className="admin-spinner" />
            ) : cooldown > 0 ? (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                Espera {cooldown}s
              </span>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider + Google */}
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="admin-divider">o continúa con</div>

          <motion.button
            type="button"
            onClick={() => googleLogin()}
            disabled={isLoading || cooldown > 0}
            whileHover={{ scale: isLoading || cooldown > 0 ? 1 : 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="admin-btn-google"
          >
            <svg viewBox="0 0 48 48" width="16" height="16">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            <span>Continuar con Google</span>
          </motion.button>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, color: "rgba(240, 240, 242, 0.81)", fontFamily: "'JetBrains Mono', monospace" }}>
            © {new Date().getFullYear()} ROKE Industries
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 6px #34D399" }} />
            <span style={{ fontSize: 10.5, color: "rgba(240,240,242,0.81)", letterSpacing: "0.04em" }}>
              Sistemas operativos
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;