
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a dummy showToast if context is not available yet to prevent crashes
    return { showToast: (msg) => console.log('Toast:', msg) };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const confirm = useCallback((message, title = 'Confirm Action') => {
    return new Promise((resolve) => {
      setConfirmConfig({ message, title, resolve });
    });
  }, []);

  const handleConfirm = (value) => {
    if (confirmConfig) {
      confirmConfig.resolve(value);
      setConfirmConfig(null);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, confirm }}>
      {children}
      
      {/* GLOBAL NOTIFICATION AREA */}
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-4 pointer-events-none w-full max-w-[360px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border bg-white dark:bg-[#1A1D1F] animate-in slide-in-from-right-full duration-500
              ${t.type === 'success' ? 'border-green-100 dark:border-green-500/20' : 
                t.type === 'error' ? 'border-red-100 dark:border-red-500/20' : 
                t.type === 'warning' ? 'border-yellow-100 dark:border-yellow-500/20' : 
                'border-blue-100 dark:border-blue-500/20'}`}
          >
            <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
              t.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-500/10' : 
              t.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-500/10' : 
              t.type === 'warning' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10' : 
              'bg-blue-50 text-blue-600 dark:bg-blue-500/10'}`}>
              {t.type === 'success' && <CheckCircle2 size={24} strokeWidth={2.5}/>}
              {t.type === 'error' && <AlertCircle size={24} strokeWidth={2.5}/>}
              {t.type === 'warning' && <AlertTriangle size={24} strokeWidth={2.5}/>}
              {t.type === 'info' && <Info size={24} strokeWidth={2.5}/>}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`text-[11px] font-black uppercase tracking-widest leading-none mb-1 ${
                t.type === 'success' ? 'text-green-600' : 
                t.type === 'error' ? 'text-red-600' : 
                t.type === 'warning' ? 'text-yellow-600' : 
                'text-blue-600'}`}>
                {t.type} Notification
              </h4>
              <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight break-words">{t.message}</p>
            </div>

            <button 
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-2 rounded-xl text-gray-300 hover:text-gray-500 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#272B30] transition-all"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 rounded-3xl flex items-center justify-center text-primary-500 mb-6">
                 <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight leading-none">
                {confirmConfig.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-8 leading-relaxed">
                {confirmConfig.message}
              </p>
              <div className="flex gap-3">
                 <button 
                   onClick={() => handleConfirm(false)}
                   className="flex-1 py-4 bg-gray-100 dark:bg-[#272B30] text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => handleConfirm(true)}
                   className="flex-1 py-4 bg-primary-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all active:scale-[0.98]"
                 >
                   Confirm
                 </button>
              </div>
           </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
