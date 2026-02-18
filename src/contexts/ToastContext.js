import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Toast from '../components/Toast/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    // Only keep the last 2 toasts plus the new one to prevent too many overlapping
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type, duration }];
      if (newToasts.length > 3) {
        return newToasts.slice(newToasts.length - 3);
      }
      return newToasts;
    });
    return id;
  }, []);

  const success = useCallback((message, duration) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message, duration) => showToast(message, 'error', duration), [showToast]);
  const warning = useCallback((message, duration) => showToast(message, 'warning', duration), [showToast]);
  const info = useCallback((message, duration) => showToast(message, 'info', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}
      <View style={styles.toastContainer} pointerEvents="box-none">
        {toasts.map((toast, index) => {
          // Calculate reverse index (0 is newest)
          const reverseIndex = toasts.length - 1 - index;
          return (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => removeToast(toast.id)}
              index={reverseIndex}
            />
          );
        })}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50, // Adjust for status bar
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
});
