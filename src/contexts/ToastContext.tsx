"use client";

import { createContext, useState, useCallback, ReactNode } from 'react';
import Toast from '../components/Toast';

type ToastMessage = {
  id: number;
  message: string;
  duration?: number;
};

interface ToastContextType {
  addToast: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, duration?: number) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, duration }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            duration={toast.duration}
            onDismiss={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
