"use client";

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
  id: number;
  message: string;
  duration?: number;
  onDismiss: (id: number) => void;
}

export default function Toast({ id, message, duration = 2000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // Trigger fade-in animation
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(id), 300); // Wait for fade-out to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div className={`toast-item ${visible ? 'toast-item-visible' : ''}`}>
      <p className="flex-grow">{message}</p>
      <button onClick={handleDismiss} className="ml-4 p-1">
        <X size={18} />
      </button>
    </div>
  );
}
