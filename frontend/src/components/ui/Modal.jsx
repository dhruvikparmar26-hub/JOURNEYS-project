import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Reusable Modal component.
 *
 * Uses React Portal to render to document.body.
 * Respects JOURNEYS design system:
 * - backdrop-blur
 * - bg-surface card container
 * - hairline borders (border-border)
 * - Level 2 (Floating) shadow
 * - Focus trapping and restoration
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);

      // Focus the modal container
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
      
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modalElement = modalRef.current;
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabTrap = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    modalElement.addEventListener('keydown', handleTabTrap);
    return () => modalElement.removeEventListener('keydown', handleTabTrap);
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop without blur */}
      <div
        className="fixed inset-0 bg-[#0B1226]/25 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${sizeClasses[size]} bg-bg-surface border border-border-subtle rounded shadow-[0_12px_40px_rgba(0,91,175,0.12)] overflow-hidden z-10 transition-all duration-300 transform scale-95 opacity-0 animate-modal-in focus:outline-none`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          {title ? (
            <h3 id="modal-title" className="text-base font-bold text-text-primary tracking-tight">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded hover:bg-bg-elevated transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
