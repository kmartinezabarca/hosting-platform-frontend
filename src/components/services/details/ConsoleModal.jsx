import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

const ConsoleModal = ({ onClose }) => {
  const [lines, setLines] = useState([
    { type: 'output', text: 'Conectado a la consola del servidor. Escribe "help" para ver los comandos.' },
  ]);
  const [input, setInput] = useState('');
  const endOfConsoleRef = useRef(null);

  // Scroll automático al final de la consola
  useEffect(() => {
    endOfConsoleRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newLines = [...lines, { type: 'input', text: input }];
    
    // Simulación de respuesta de la API
    let response = `Comando desconocido: "${input}"`;
    if (input.toLowerCase() === 'help') {
      response = 'Comandos disponibles: status, restart, stop';
    } else if (input.toLowerCase() === 'status') {
      response = 'Server is running. CPU: 44%, Memory: 43%';
    }
    
    setLines([...newLines, { type: 'output', text: response }]);
    setInput('');
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
          className="relative flex flex-col bg-black border border-border rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Consola del Servidor</h3>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido de la Consola */}
          <div className="p-4 flex-1 overflow-y-auto font-mono text-sm">
            {lines.map((line, index) => (
              <div key={index} className={`flex items-start gap-2 ${line.type === 'input' ? 'text-yellow-400' : 'text-gray-300'}`}>
                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="whitespace-pre-wrap break-words">{line.text}</p>
              </div>
            ))}
            <div ref={endOfConsoleRef} />
          </div>

          {/* Input de Comandos */}
          <form onSubmit={handleCommand} className="p-4 border-t border-white/10">
            <div className="relative">
              <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un comando..."
                className="w-full bg-white/5 text-white placeholder-gray-500 pl-10 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConsoleModal;