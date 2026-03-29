import React, { useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const variantStyles = {
  success: {
    container: 'bg-white border-l-4 border-green-500',
    icon: (
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    container: 'bg-white border-l-4 border-red-500',
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    container: 'bg-white border-l-4 border-yellow-500',
    icon: (
      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.86-1.41L12 3z" />
      </svg>
    ),
  },
  info: {
    container: 'bg-white border-l-4 border-blue-500',
    icon: (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
    ),
  },
};

function ToastItem({ toast, onDismiss }) {
  const variant = variantStyles[toast.type] || variantStyles.info;

  // Auto-dismiss after 5 seconds for accessibility
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  // Handle keyboard dismissal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      onDismiss(toast.id);
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`
        ${variant.container}
        ${toast.dismissing ? 'animate-slide-out-right' : 'animate-slide-in-right'}
        rounded-lg shadow-lg p-4 flex items-start space-x-3 max-w-sm w-full pointer-events-auto border
      `}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-shrink-0 mt-0.5">{variant.icon}</div>
      <p className="flex-1 text-sm font-medium text-gray-900">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] flex flex-col space-y-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
