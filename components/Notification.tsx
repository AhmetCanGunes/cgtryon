import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
  duration?: number; // Auto close after duration (ms), 0 = no auto close
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-emerald-400" />;
      case 'error':
        return <XCircle size={24} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={24} className="text-amber-400" />;
      case 'info':
        return <Info size={24} className="text-blue-400" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-emerald-300';
      case 'error':
        return 'text-red-300';
      case 'warning':
        return 'text-amber-300';
      case 'info':
        return 'text-blue-300';
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case 'success':
        return 'text-emerald-400/80';
      case 'error':
        return 'text-red-400/80';
      case 'warning':
        return 'text-amber-400/80';
      case 'info':
        return 'text-blue-400/80';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`max-w-md w-full ${getColorClasses()} border-2 rounded-xl shadow-xl p-4 backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${getTitleColor()} mb-1`}>
              {title}
            </h3>
            <p className={`text-sm ${getMessageColor()}`}>
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
