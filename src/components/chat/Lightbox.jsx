// /components/chat/Lightbox.jsx
import React from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export const Lightbox = ({ isOpen, items, startIndex, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleNavigation = (e, direction) => {
    e.stopPropagation();
    onNavigate(direction);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/90 grid place-items-center"
      onClick={handleClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        onClick={handleClose}
        aria-label="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>

      {items.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            onClick={(e) => handleNavigation(e, "prev")}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            onClick={(e) => handleNavigation(e, "next")}
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <img
        src={items[startIndex]}
        alt={`Imagen ${startIndex + 1} de ${items.length}`}
        className="max-h-[90vh] max-w-[90vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
};
