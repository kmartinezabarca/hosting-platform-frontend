// /hooks/useChatInteractions.js
import { useState, useEffect, useCallback } from "react";

export const useChatInteractions = (isOpen, isMinimized, onClose) => {
  const [lightbox, setLightbox] = useState({ open: false, items: [], index: 0 });

  const openLightbox = useCallback((items, index = 0) => {
    setLightbox({ open: true, items, index });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox((p) => ({ ...p, open: false }));
  }, []);

  const navigateLightbox = useCallback((direction) => {
    setLightbox((p) => {
      const newIndex =
        direction === "next"
          ? (p.index + 1) % p.items.length
          : (p.index - 1 + p.items.length) % p.items.length;
      return { ...p, index: newIndex };
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (lightbox.open) {
          closeLightbox();
        } else if (isOpen && !isMinimized) {
          onClose?.();
        }
      }
      if (lightbox.open) {
        if (e.key === "ArrowLeft") navigateLightbox("prev");
        if (e.key === "ArrowRight") navigateLightbox("next");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isMinimized, onClose, lightbox.open, closeLightbox, navigateLightbox]);

  return { lightbox, openLightbox, closeLightbox, navigateLightbox };
};
