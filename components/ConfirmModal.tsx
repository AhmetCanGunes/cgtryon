import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'info' | 'danger';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  onConfirm,
  onCancel,
  type = 'info'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={48} className="text-amber-500" />;
      case 'danger':
        return <X size={48} className="text-red-500" />;
      default:
        return <Check size={48} className="text-primary" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Icon */}
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all text-white ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-primary hover:bg-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

