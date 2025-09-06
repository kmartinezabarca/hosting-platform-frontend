import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react'; // ¡Importamos el icono de descarga!
import { downloadAsTxt } from '../../../lib/fileUtils'; // ¡Importamos nuestra nueva función helper!

const LogsModal = ({ serviceId, onClose }) => { // Pasamos el serviceId para el nombre del archivo
  // Hook para cerrar el modal con la tecla 'Escape'
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Datos de logs simulados (listos para ser reemplazados por datos de una API)
  const logs = [
    { level: 'INFO', message: 'Servidor iniciado en el puerto 25565.', timestamp: '2025-09-03 18:30:01' },
    { level: 'INFO', message: 'Cargando mundo "world"...', timestamp: '2025-09-03 18:30:05' },
    { level: 'WARN', message: 'El uso de memoria ha superado el 75%.', timestamp: '2025-09-03 18:32:10' },
    { level: 'INFO', message: 'El usuario "testuser" se ha conectado.', timestamp: '2025-09-03 18:33:00' },
    { level: 'ERROR', message: 'No se pudo conectar a la base de datos de usuarios: Conexión rechazada.', timestamp: '2025-09-03 18:35:45' },
  ];

  const getLogLevelClass = (level) => {
    if (level === 'ERROR') return 'text-red-400';
    if (level === 'WARN') return 'text-yellow-400';
    return 'text-gray-400';
  };

  // --- ¡NUEVA FUNCIÓN! Para manejar la descarga ---
  const handleDownload = () => {
    // 1. Formatear el array de objetos de logs a un string de texto plano.
    const logContent = logs
      .map(log => `${log.timestamp} [${log.level.padEnd(5)}] ${log.message}`)
      .join('\n'); // Unimos cada línea con un salto de línea.

    // 2. Generar un nombre de archivo dinámico.
    const date = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const filename = `logs-${serviceId}-${date}.txt`;

    // 3. Llamar a nuestra función helper para iniciar la descarga.
    downloadAsTxt(logContent, filename);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative flex flex-col bg-card border border-border rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del Modal */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold">Logs del Servidor</h3>
            <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido de los Logs */}
          <div className="p-4 bg-black/80 flex-1 overflow-y-auto">
            <pre className="font-mono text-xs whitespace-pre-wrap">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-4">
                  <span className="text-gray-500">{log.timestamp}</span>
                  <span className={`font-bold ${getLogLevelClass(log.level)}`}>[{log.level}]</span>
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))}
            </pre>
          </div>

          {/* --- FOOTER ACTUALIZADO CON BOTÓN DE DESCARGA --- */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-muted text-foreground hover:bg-muted/80 border border-border px-4 py-2 rounded-lg"
            >
              <Download className="w-4 h-4" />
              Descargar .txt
            </button>
            <button onClick={onClose} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold">
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LogsModal;