import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ModalWrapper({ children, onClose, isOpen = true, zIndex = 'z-[9999]', maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-pop cursor-pointer`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} bg-white rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto cursor-default`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
