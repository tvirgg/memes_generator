"use client";

import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

export function useToasts() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
}
