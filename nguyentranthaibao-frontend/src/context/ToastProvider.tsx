"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { ToastContainer, toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Types ---
interface ToastContextType {
  success: (msg: string, options?: ToastOptions) => void;
  error: (msg: string, options?: ToastOptions) => void;
  info: (msg: string, options?: ToastOptions) => void;
  warning: (msg: string, options?: ToastOptions) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

// --- Context ---
export const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- Provider ---
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const notify: ToastContextType = {
    success: (msg, options) => toast.success(msg, options),
    error: (msg, options) => toast.error(msg, options),
    info: (msg, options) => toast.info(msg, options),
    warning: (msg, options) => toast.warning(msg, options),
  };

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <ToastContainer position="top-right" autoClose={3000} />
    </ToastContext.Provider>
  );
};

// --- Custom Hook ---
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Default export
export default ToastProvider;
