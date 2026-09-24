import React, { useEffect } from 'react';
import './Toast.css';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`lims-toast lims-toast-${type}`}>
      <div className="lims-toast-icon">
        {type === 'success' && <CheckCircle size={18} />}
        {type === 'error' && <AlertCircle size={18} />}
        {type === 'info' && <Info size={18} />}
      </div>
      <div className="lims-toast-message">{message}</div>
      <button className="lims-toast-close" onClick={onClose} aria-label="Close notification">
        <X size={14} />
      </button>
    </div>
  );
}
