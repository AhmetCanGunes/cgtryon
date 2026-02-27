import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface UserDropdownProps {
  email: string;
  credits: number;
  isAdmin: boolean;
  onBuyCredits: () => void;
  onOpenGallery: () => void;
  onOpenAdminPanel: () => void;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  email,
  credits,
  isAdmin,
  onBuyCredits,
  onOpenGallery,
  onOpenAdminPanel,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = () => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-card-dark flex items-center justify-center overflow-hidden border border-border-dark hover:border-primary/50 transition-all"
      >
        <span className="text-xs font-bold text-slate-300">{getInitial()}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card-dark rounded-xl shadow-xl border border-border-dark py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-border-dark">
            <p className="text-sm font-medium text-white truncate">{email}</p>
            {isAdmin && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="material-icons-round text-amber-500 text-sm">verified</span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Admin</span>
              </div>
            )}
          </div>

          {/* Credits Section */}
          <div className="px-4 py-3 border-b border-border-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-primary text-base">toll</span>
                <span className="text-xs text-slate-400">Kredi</span>
              </div>
              <span className={cn(
                'text-sm font-bold',
                isAdmin ? 'text-amber-500' : 'text-white'
              )}>
                {isAdmin ? 'Sınırsız' : credits}
              </span>
            </div>
            {!isAdmin && (
              <button
                onClick={() => { onBuyCredits(); setIsOpen(false); }}
                className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-background-dark text-xs font-bold rounded-full hover:opacity-90 transition-opacity"
              >
                <span className="material-icons-round text-base">add</span>
                <span>Kredi Satın Al</span>
              </button>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => { onOpenGallery(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-background-dark/50 transition-colors"
            >
              <span className="material-icons-round text-slate-400 text-base">history</span>
              <span>Görsel Geçmişi</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => { onOpenAdminPanel(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-background-dark/50 transition-colors"
              >
                <span className="material-icons-round text-amber-500 text-base">admin_panel_settings</span>
                <span>Admin Panel</span>
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-border-dark pt-1">
            <button
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <span className="material-icons-round text-base">logout</span>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
