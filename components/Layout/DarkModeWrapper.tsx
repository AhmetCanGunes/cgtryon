import React from 'react';

interface DarkModeWrapperProps {
  children: React.ReactNode;
}

// Bu wrapper, eski light-theme bileşenlerini dark tema ile uyumlu hale getirir
// Yeni token sistemi ile sadeleştirilmiş versiyon
const DarkModeWrapper: React.FC<DarkModeWrapperProps> = ({ children }) => {
  return (
    <div className="dark-mode-wrapper w-full h-full flex">
      <style>{`
        .dark-mode-wrapper {
          color-scheme: dark;
        }

        .dark-mode-wrapper,
        .dark-mode-wrapper * {
          color-scheme: dark;
        }

        /* Override white/light backgrounds */
        .dark-mode-wrapper .bg-white,
        .dark-mode-wrapper .bg-gray-50,
        .dark-mode-wrapper .bg-gray-100,
        .dark-mode-wrapper .bg-slate-50,
        .dark-mode-wrapper .bg-slate-100 {
          background-color: var(--glass-bg) !important;
        }

        .dark-mode-wrapper .bg-gray-200,
        .dark-mode-wrapper .bg-slate-200 {
          background-color: var(--bg-base) !important;
        }

        /* Border colors */
        .dark-mode-wrapper .border-gray-100,
        .dark-mode-wrapper .border-gray-200,
        .dark-mode-wrapper .border-gray-300,
        .dark-mode-wrapper .border-slate-100,
        .dark-mode-wrapper .border-slate-200,
        .dark-mode-wrapper .border-slate-300 {
          border-color: var(--border-subtle) !important;
        }

        /* Text colors */
        .dark-mode-wrapper .text-gray-900,
        .dark-mode-wrapper .text-gray-800,
        .dark-mode-wrapper .text-slate-900,
        .dark-mode-wrapper .text-slate-800 {
          color: var(--text-primary) !important;
        }

        .dark-mode-wrapper .text-gray-700,
        .dark-mode-wrapper .text-gray-600,
        .dark-mode-wrapper .text-slate-700,
        .dark-mode-wrapper .text-slate-600 {
          color: var(--text-secondary) !important;
        }

        .dark-mode-wrapper .text-gray-500,
        .dark-mode-wrapper .text-gray-400,
        .dark-mode-wrapper .text-slate-500,
        .dark-mode-wrapper .text-slate-400 {
          color: var(--text-muted) !important;
        }

        /* Input backgrounds */
        .dark-mode-wrapper input,
        .dark-mode-wrapper select,
        .dark-mode-wrapper textarea {
          background-color: var(--bg-base) !important;
          border-color: var(--border-default) !important;
          color: var(--text-primary) !important;
        }

        .dark-mode-wrapper input::placeholder,
        .dark-mode-wrapper textarea::placeholder {
          color: var(--text-muted) !important;
        }

        /* Ring colors */
        .dark-mode-wrapper .ring-gray-200,
        .dark-mode-wrapper .ring-gray-300,
        .dark-mode-wrapper .ring-slate-200,
        .dark-mode-wrapper .ring-slate-300 {
          --tw-ring-color: var(--border-subtle) !important;
        }

        /* Hover states */
        .dark-mode-wrapper .hover\\:bg-gray-50:hover,
        .dark-mode-wrapper .hover\\:bg-gray-100:hover,
        .dark-mode-wrapper .hover\\:bg-slate-50:hover,
        .dark-mode-wrapper .hover\\:bg-slate-100:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }

        /* Alert backgrounds */
        .dark-mode-wrapper .bg-blue-50 {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
        .dark-mode-wrapper .border-blue-100 {
          border-color: rgba(59, 130, 246, 0.2) !important;
        }
        .dark-mode-wrapper .bg-green-50 {
          background-color: rgba(52, 211, 153, 0.1) !important;
        }
        .dark-mode-wrapper .bg-red-50 {
          background-color: rgba(248, 113, 113, 0.1) !important;
        }
        .dark-mode-wrapper .bg-purple-50 {
          background-color: var(--mode-accent-dim) !important;
        }

        /* Primary/Accent buttons */
        .dark-mode-wrapper .bg-primary,
        .dark-mode-wrapper .bg-indigo-600,
        .dark-mode-wrapper .bg-indigo-500 {
          background-color: var(--primary) !important;
          color: white !important;
        }

        .dark-mode-wrapper .from-primary,
        .dark-mode-wrapper .from-indigo-600 {
          --tw-gradient-from: var(--primary) !important;
        }

        .dark-mode-wrapper .to-indigo-600,
        .dark-mode-wrapper .to-primary {
          --tw-gradient-to: var(--secondary) !important;
        }

        /* Disabled states */
        .dark-mode-wrapper button:disabled {
          opacity: 0.5;
        }

        /* Focus rings */
        .dark-mode-wrapper .focus\\:ring-primary:focus,
        .dark-mode-wrapper .focus\\:ring-indigo-500:focus {
          --tw-ring-color: var(--mode-accent) !important;
        }

        /* Divide colors */
        .dark-mode-wrapper .divide-gray-100 > :not([hidden]) ~ :not([hidden]),
        .dark-mode-wrapper .divide-gray-200 > :not([hidden]) ~ :not([hidden]) {
          border-color: var(--border-subtle) !important;
        }

        /* Shadow adjustments */
        .dark-mode-wrapper .shadow-sm,
        .dark-mode-wrapper .shadow,
        .dark-mode-wrapper .shadow-md,
        .dark-mode-wrapper .shadow-lg,
        .dark-mode-wrapper .shadow-xl {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3) !important;
        }

        /* Scrollbar */
        .dark-mode-wrapper ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .dark-mode-wrapper ::-webkit-scrollbar-track {
          background: transparent;
        }
        .dark-mode-wrapper ::-webkit-scrollbar-thumb {
          background: var(--border-default);
          border-radius: 3px;
        }
        .dark-mode-wrapper ::-webkit-scrollbar-thumb:hover {
          background: var(--border-strong);
        }

        /* Dropdown selects */
        .dark-mode-wrapper select option {
          background-color: var(--bg-elevated);
          color: var(--text-primary);
        }
      `}</style>
      {children}
    </div>
  );
};

export default DarkModeWrapper;
