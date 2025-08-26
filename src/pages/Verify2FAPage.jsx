import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoROKE from '../assets/ROKEIndustriesFusionLogo.png';

const Verify2FAPage = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyTwoFactor } = useAuth();

  const email = location.state?.email;

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length < 6) {
      setError('El código debe tener 6 dígitos.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await verifyTwoFactor(email, code);
      navigate('/client/dashboard');
    } catch (err) {
      setError('El código de verificación es incorrecto. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Variantes de animación para los elementos del formulario
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md mx-auto"
      >
        <div
          className="p-8 space-y-6 rounded-2xl border border-white/20"
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.3)",
          }}
        >
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Header con Logo */}
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <img src={logoROKE} alt="ROKE Industries" className="h-30 w-auto mx-auto" />
              <h2 className="text-3xl font-bold text-black">Verificación Requerida</h2>
              <p className="text-black/70 max-w-xs mx-auto">
                Por tu seguridad, introduce el código de 6 dígitos de tu app de autenticación.
              </p>
            </motion.div>

            {/* Formulario */}
            <motion.form onSubmit={handleSubmit} variants={itemVariants} className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="2fa-code" className="sr-only">Código de Verificación</label>
                <input
                  id="2fa-code"
                  name="2fa-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`w-full py-3 px-4 bg-white border rounded-xl text-[#222222] placeholder-gray-400 text-center text-2xl tracking-[0.5em] font-semibold focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition-all duration-200 ${error ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                  placeholder="------"
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm font-medium text-red-600">
                  {error}
                </motion.p>
              )}

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
                    <span>Verificar y Continuar</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Footer del formulario */}
            <motion.div variants={itemVariants} className="text-center text-sm text-black/70">
              <Link to="/login" className="hover:text-black transition-colors font-medium">
                Volver a Iniciar Sesión
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Verify2FAPage;
