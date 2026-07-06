import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Portal/Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastStyles = {
  success: {
    bg: 'bg-success-bg border-success/30 text-success',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-danger-bg border-danger/30 text-danger',
    icon: AlertCircle,
  },
  warning: {
    bg: 'bg-warning-bg border-warning/30 text-warning',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-info-bg border-info/30 text-info',
    icon: Info,
  },
};

const ToastItem = ({ toast, onClose }) => {
  const { bg, icon: Icon } = toastStyles[toast.type] || toastStyles.info;

  return (
    <div
      role="alert"
      className={`
        pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-md
        animate-slide-in transition-all duration-300 ${bg}
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
      <button
        onClick={onClose}
        className="text-current opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded-lg hover:bg-black/5"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
