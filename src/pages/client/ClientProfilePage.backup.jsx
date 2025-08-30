// src/pages/client/ClientProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import authService from "../../services/auth";
import {
  User,
  Shield,
  MonitorSmartphone,
  Mail,
  Phone,
  Globe,
  MapPin,
  Pencil,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
} from "lucide-react";

/* ======== estilos reutilizables ======== */
const card =
  "rounded-2xl bg-white dark:bg-[#0f1115] border border-black/10 dark:border-white/10 shadow-sm";
const label = "text-[13px] font-medium text-[#0f172a] dark:text-white/90";
const inputBase =
  "w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151c] text-slate-800 dark:text-white/90 placeholder:text-slate-400 dark:placeholder:text-white/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-white/10 focus:border-slate-300 transition px-4 py-3";
const inputWithIcon = `${inputBase} pl-10`;

const ClientProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "MX",
    postal_code: "",
  });

  const [security, setSecurity] = useState({
    two_factor_enabled: false,
    password_last_changed: null,
    security_score: 0,
  });

  /* --- Estados de Seguridad --- */
  const [qrCode, setQrCode] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [saving2FA, setSaving2FA] = useState(false);

  const [pwd, setPwd] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPwd, setSavingPwd] = useState(false);

  /* ========= carga ========= */
  useEffect(() => {
    (async () => {
      await Promise.all([loadProfileData(), loadSecurityData()]);
      setLoading(false);
    })();
  }, []);

  const loadProfileData = async () => {
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/profile", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((p) => ({ ...p, ...data.data }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSecurityData = async () => {
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/profile/security", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setSecurity(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.data);
        setMessage("Perfil actualizado exitosamente");
      } else {
        setMessage(data.message || "Error al actualizar el perfil");
      }
    } catch {
      setMessage("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  /* ========= Seguridad: acciones 2FA ========= */
  const generate2FA = async () => {
    setSaving2FA(true);
    setMessage("");
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/2fa/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.data.qr_code);
        setTwoFactorSecret(data.data.secret);
      } else {
        setMessage(data.message || "Error al generar 2FA");
      }
    } catch {
      setMessage("Error de conexión");
    } finally {
      setSaving2FA(false);
    }
  };

  const enable2FA = async () => {
    if (verificationCode.length !== 6) return;
    setSaving2FA(true);
    setMessage("");
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/2fa/enable", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setSecurity((prev) => ({ ...prev, two_factor_enabled: true }));
        setQrCode("");
        setTwoFactorSecret("");
        setVerificationCode("");
        setMessage("2FA activado exitosamente");
      } else {
        setMessage(data.message || "No se pudo activar el 2FA");
      }
    } catch {
      setMessage("Error de conexión");
    } finally {
      setSaving2FA(false);
    }
  };

  const disable2FA = async () => {
    setSaving2FA(true);
    setMessage("");
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/2fa/disable", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setSecurity((prev) => ({ ...prev, two_factor_enabled: false }));
        setMessage("2FA desactivado");
      } else {
        setMessage(data.message || "No se pudo desactivar el 2FA");
      }
    } catch {
      setMessage("Error de conexión");
    } finally {
      setSaving2FA(false);
    }
  };

  /* ========= Seguridad: cambio de contraseña ========= */
  const updatePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (pwd.next.length < 8) {
      setMessage("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setMessage("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    setSavingPwd(true);
    try {
      const token = authService.getToken();
      const res = await fetch("http://localhost:8000/api/profile/password", {
        // Ajusta a tu ruta si es distinta
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          current_password: pwd.current,
          password: pwd.next,
          password_confirmation: pwd.confirm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwd({ current: "", next: "", confirm: "" });
        setMessage("Contraseña actualizada correctamente");
        // refresca metadata (fecha último cambio)
        loadSecurityData();
      } else {
        setMessage(data.message || "No se pudo actualizar la contraseña");
      }
    } catch {
      setMessage("Error de conexión");
    } finally {
      setSavingPwd(false);
    }
  };

  const tabs = useMemo(
    () => [
      { id: "profile", label: "Información Personal", icon: User },
      { id: "security", label: "Seguridad", icon: Shield },
      { id: "devices", label: "Dispositivos Activos", icon: MonitorSmartphone },
    ],
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#eef3f8] dark:bg-[#0b0d12]">
        <span className="w-10 h-10 rounded-full border-2 border-slate-400/50 border-t-transparent animate-spin" />
      </div>
    );
  }

  /* Helper de barra de score */
  const scoreColor =
    security.security_score >= 80
      ? "bg-emerald-500"
      : security.security_score >= 60
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className="min-h-screen  py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[28px] sm:text-3xl font-bold text-slate-900 dark:text-white">
              Mi Perfil
            </h1>
            <p className="text-slate-500 dark:text-white/60">
              Actualiza tu foto y detalles personales.
            </p>
          </div>

          {/* Avatar con lápiz */}
          <div className="relative">
            <img
              src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(
                profile.first_name || "user"
              )}`}
              alt="Avatar"
              className="h-14 w-14 rounded-full border-2 border-white shadow-md object-cover"
            />
            <button
              type="button"
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-900 text-white grid place-items-center shadow ring-2 ring-white"
              title="Cambiar foto"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card principal */}
        <div className={`${card}`}>
          {/* Tabs con línea inferior */}
          <div className="px-6 pt-5">
            <div className="flex gap-6 border-b border-slate-200 dark:border-white/10">
              {tabs.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={[
                      "relative -mb-px inline-flex items-center gap-2 pb-3 text-sm",
                      active
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white/80",
                    ].join(" ")}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    <span
                      className={[
                        "absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full",
                        active ? "bg-slate-900 dark:bg-white" : "bg-transparent",
                      ].join(" ")}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {message && (
              <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-4 py-3">
                {message}
              </div>
            )}

            {/* === Información Personal === */}
            {activeTab === "profile" && (
              <form onSubmit={updateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={label}>Nombre</label>
                    <div className="relative mt-2">
                      <input
                        value={profile.first_name}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, first_name: e.target.value }))
                        }
                        className={inputBase}
                        placeholder="Nombre"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={label}>Apellido</label>
                    <div className="relative mt-2">
                      <input
                        value={profile.last_name}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, last_name: e.target.value }))
                        }
                        className={inputBase}
                        placeholder="Apellido"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={label}>Email</label>
                    <div className="relative mt-2">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={profile.email}
                        disabled
                        className={`${inputWithIcon} bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/50 cursor-not-allowed`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Tu dirección de correo electrónico no se puede cambiar.
                    </p>
                  </div>

                  <div>
                    <label className={label}>Teléfono</label>
                    <div className="relative mt-2">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={profile.phone || ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, phone: e.target.value }))
                        }
                        className={inputWithIcon}
                        placeholder="+52 55 1234 5678"
                        type="tel"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={label}>País</label>
                    <div className="relative mt-2">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={profile.country}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, country: e.target.value }))
                        }
                        className={`${inputWithIcon} appearance-none pr-10`}
                      >
                        <option value="MX">México</option>
                        <option value="US">Estados Unidos</option>
                        <option value="CA">Canadá</option>
                        <option value="ES">España</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={label}>Dirección</label>
                    <div className="relative mt-2">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <textarea
                        rows={3}
                        value={profile.address || ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, address: e.target.value }))
                        }
                        className={`${inputWithIcon} pl-10`}
                        placeholder="Av. Siempre Viva 742"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={label}>Ciudad</label>
                    <div className="relative mt-2">
                      <input
                        value={profile.city || ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, city: e.target.value }))
                        }
                        className={inputBase}
                        placeholder="Ciudad"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={label}>Código Postal</label>
                    <div className="relative mt-2">
                      <input
                        value={profile.postal_code || ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, postal_code: e.target.value }))
                        }
                        className={inputBase}
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={loadProfileData}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? "Guardando…" : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            )}

            {/* === Seguridad === */}
            {activeTab === "security" && (
              <div className="space-y-8">
                {/* Score */}
                <div className={`${card} p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Puntuación de Seguridad
                      </h3>
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {security.security_score}%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-3 ${scoreColor} transition-all`}
                      style={{ width: `${security.security_score}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-white/60">
                    Mejora tu score activando 2FA y usando una contraseña robusta.
                  </p>
                </div>

                {/* 2FA */}
                <div className={`${card} p-5`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Autenticación de Dos Factores (2FA)
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-white/60">
                        Protege tu cuenta con un segundo factor (Google Authenticator, Authy, etc).
                      </p>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        security.two_factor_enabled
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {security.two_factor_enabled ? "Activado" : "Desactivado"}
                    </div>
                  </div>

                  {!security.two_factor_enabled && !qrCode && (
                    <div className="mt-4">
                      <button
                        onClick={generate2FA}
                        disabled={saving2FA}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium hover:opacity-90 disabled:opacity-60"
                      >
                        {saving2FA ? "Generando…" : "Configurar 2FA"}
                      </button>
                    </div>
                  )}

                  {/* Mostrar QR para activar */}
                  {!security.two_factor_enabled && qrCode && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4">
                        <img src={qrCode} alt="QR Code 2FA" className="mx-auto" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-white/70 mb-1">
                            Clave manual (por si no puedes escanear):
                          </p>
                          <code className="block text-sm rounded-lg px-3 py-2 bg-slate-50 dark:bg-white/5">
                            {twoFactorSecret}
                          </code>
                        </div>
                        <div>
                          <label className={label}>Código de verificación</label>
                          <div className="relative mt-2">
                            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={6}
                              value={verificationCode}
                              onChange={(e) =>
                                setVerificationCode(e.target.value.replace(/\D/g, ""))
                              }
                              className={inputWithIcon}
                              placeholder="123456"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={enable2FA}
                            disabled={saving2FA || verificationCode.length !== 6}
                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:opacity-90 disabled:opacity-60"
                          >
                            {saving2FA ? "Activando…" : "Activar 2FA"}
                          </button>
                          <button
                            onClick={() => {
                              setQrCode("");
                              setTwoFactorSecret("");
                              setVerificationCode("");
                            }}
                            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botón para desactivar si está activo */}
                  {security.two_factor_enabled && (
                    <div className="mt-4">
                      <button
                        onClick={disable2FA}
                        disabled={saving2FA}
                        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        {saving2FA ? "Procesando…" : "Desactivar 2FA"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Cambio de contraseña */}
                <form onSubmit={updatePassword} className={`${card} p-5 space-y-4`}>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Cambiar Contraseña
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-white/60 -mt-2">
                    Última actualización:{" "}
                    {security.password_last_changed
                      ? new Date(security.password_last_changed).toLocaleDateString()
                      : "Nunca"}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={label}>Contraseña actual</label>
                      <div className="relative mt-2">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPwd.current ? "text" : "password"}
                          value={pwd.current}
                          onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                          className={inputWithIcon}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPwd((s) => ({ ...s, current: !s.current }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        >
                          {showPwd.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={label}>Nueva contraseña</label>
                      <div className="relative mt-2">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPwd.next ? "text" : "password"}
                          value={pwd.next}
                          onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                          className={inputWithIcon}
                          placeholder="Mínimo 8 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((s) => ({ ...s, next: !s.next }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        >
                          {showPwd.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className={label}>Confirmar nueva contraseña</label>
                      <div className="relative mt-2">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPwd.confirm ? "text" : "password"}
                          value={pwd.confirm}
                          onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                          className={inputWithIcon}
                          placeholder="Repite tu nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPwd((s) => ({ ...s, confirm: !s.confirm }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        >
                          {showPwd.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPwd({ current: "", next: "", confirm: "" })}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingPwd}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:opacity-90 disabled:opacity-60"
                    >
                      {savingPwd ? "Guardando…" : "Actualizar Contraseña"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* === Dispositivos Activos (mock) === */}
            {activeTab === "devices" && (
              <div className="space-y-3">
                {[
                  {
                    device: "Chrome en Windows",
                    location: "Ciudad de México, MX",
                    ip: "192.168.1.100",
                    current: true,
                  },
                  {
                    device: "Safari en iPhone",
                    location: "Guadalajara, MX",
                    ip: "192.168.1.101",
                    current: false,
                  },
                ].map((s, i) => (
                  <div key={i} className={`${card} p-4 flex items-center justify-between`}>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{s.device}</div>
                      <div className="text-sm text-slate-500 dark:text-white/60">
                        {s.location} • {s.ip}
                      </div>
                    </div>
                    {s.current ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        Actual
                      </span>
                    ) : (
                      <button className="text-sm text-red-600 dark:text-red-400 hover:opacity-80">
                        Cerrar sesión
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
