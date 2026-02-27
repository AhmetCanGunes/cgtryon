import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { getAvatarById } from '../ProfileEditModal';

type ViewState = 'home' | 'studio' | 'try-on' | 'ad-creative' | 'jewelry' | 'mens-fashion' | 'womens-fashion' | 'style-selector' | 'product-annotation' | 'prompt-architect' | 'personas' | 'ozel' | 'collections';

type ProductionMode = 'standard' | 'referenced' | 'referenced2';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onUpgrade?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  // Alt mod seçimi için
  selectedSubMode?: ProductionMode;
  onSubModeChange?: (mode: ProductionMode) => void;
  // User info for profile dropdown
  userEmail?: string;
  userName?: string;
  userAvatarId?: string;
  userCredits?: number;
  isAdmin?: boolean;
  onBuyCredits?: () => void;
  onOpenGallery?: () => void;
  onOpenAdminPanel?: () => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
}

const WORKSPACE_ITEMS: { id: ViewState; icon: string; label: string }[] = [
  { id: 'studio', icon: 'grid_view', label: 'Studio' },
  { id: 'try-on', icon: 'checkroom', label: 'Kabin' },
  { id: 'ad-creative', icon: 'campaign', label: 'Reklam' },
];

const ASSETS_ITEMS: { id: ViewState; icon: string; label: string }[] = [
  { id: 'style-selector', icon: 'palette', label: 'Stil' },
  { id: 'product-annotation', icon: 'label', label: 'Etiket' },
  { id: 'prompt-architect', icon: 'terminal', label: 'Prompt' },
];

const OZEL_ITEMS: { id: ViewState; icon: string; label: string }[] = [
  { id: 'ozel', icon: 'auto_fix_high', label: 'Özel' },
];

// Alt menü öğeleri
const SUB_MENU_ITEMS: { id: ProductionMode; icon: string; label: string }[] = [
  { id: 'standard', icon: 'hourglass_empty', label: 'Standart' },
  { id: 'referenced', icon: 'compare', label: 'Referanslı' },
  { id: 'referenced2', icon: 'layers', label: 'Referanslı 2' },
];

interface NavItemProps {
  id: ViewState;
  icon: string;
  label: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onUpgrade,
  isCollapsed,
  onToggleCollapse,
  selectedSubMode = 'standard',
  onSubModeChange,
  userEmail = '',
  userName = '',
  userAvatarId = 'blue',
  userCredits = 0,
  isAdmin = false,
  onBuyCredits,
  onOpenGallery,
  onOpenAdminPanel,
  onEditProfile,
  onLogout,
}) => {
  // Dropdown açık/kapalı durumu
  const [openDropdown, setOpenDropdown] = useState<ViewState | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Check if user has credits (admin always has access)
  const hasCredits = isAdmin || userCredits > 0;

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitial = () => {
    if (userName) return userName.charAt(0).toUpperCase();
    return userEmail.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    return userName || userEmail;
  };

  // Handle navigation with credit check
  const handleNavClick = (id: ViewState) => {
    if (id === 'home') {
      // Home is always accessible
      onViewChange(id);
      return;
    }

    if (!hasCredits) {
      // Show credit warning popup
      setShowCreditWarning(true);
      return;
    }

    onViewChange(id);
  };

  const NavItem: React.FC<NavItemProps> = ({ id, icon, label }) => (
    <button
      onClick={() => handleNavClick(id)}
      className={cn(
        'flex items-center gap-3 rounded-lg w-full text-left transition-all',
        isCollapsed ? 'px-3 py-2.5 justify-center' : 'px-4 py-2.5',
        currentView === id
          ? 'bg-mode-accent-dim text-mode-accent font-medium'
          : 'text-slate-500 hover:bg-white/5',
        !hasCredits && id !== 'home' && 'opacity-60'
      )}
      title={isCollapsed ? label : undefined}
    >
      <span className="material-icons-round text-lg">{icon}</span>
      {!isCollapsed && label}
      {!hasCredits && id !== 'home' && !isCollapsed && (
        <span className="material-icons-round text-amber-500 text-sm ml-auto">lock</span>
      )}
    </button>
  );

  // Dropdown'lu nav item (Erkek, Kadın için)
  const NavItemWithDropdown: React.FC<NavItemProps & { hasSubMenu?: boolean }> = ({ id, icon, label, hasSubMenu }) => {
    const isOpen = openDropdown === id;
    const isActive = currentView === id;

    const handleClick = () => {
      // Check credits first
      if (!hasCredits) {
        setShowCreditWarning(true);
        return;
      }

      if (hasSubMenu && !isCollapsed) {
        // Dropdown'u aç/kapat
        if (isOpen) {
          setOpenDropdown(null);
        } else {
          setOpenDropdown(id);
          // İlk kez açılıyorsa veya farklı bir view'dan geliyorsa standard mod ile aç
          onViewChange(id);
          onSubModeChange?.('standard');
        }
      } else {
        onViewChange(id);
      }
    };

    const handleSubItemClick = (subModeId: ProductionMode) => {
      if (!hasCredits) {
        setShowCreditWarning(true);
        return;
      }
      onSubModeChange?.(subModeId);
      // View zaten doğru, sadece mod değiştir
      if (currentView !== id) {
        onViewChange(id);
      }
    };

    return (
      <div>
        <button
          onClick={handleClick}
          className={cn(
            'flex items-center gap-3 rounded-lg w-full text-left transition-all',
            isCollapsed ? 'px-3 py-2.5 justify-center' : 'px-4 py-2.5',
            isActive
              ? 'bg-mode-accent-dim text-mode-accent font-medium'
              : 'text-slate-500 hover:bg-white/5',
            !hasCredits && 'opacity-60'
          )}
          title={isCollapsed ? label : undefined}
        >
          <span className="material-icons-round text-lg">{icon}</span>
          {!isCollapsed && (
            <>
              <span className="flex-1">{label}</span>
              {!hasCredits && (
                <span className="material-icons-round text-amber-500 text-sm">lock</span>
              )}
              {hasCredits && hasSubMenu && (
                <span className={cn(
                  "material-icons-round text-sm transition-transform duration-200",
                  isOpen && "rotate-180"
                )}>
                  expand_more
                </span>
              )}
            </>
          )}
        </button>

        {/* Alt menü - sadece açıkken ve collapsed değilken göster */}
        {hasSubMenu && isOpen && !isCollapsed && hasCredits && (
          <div className="ml-4 mt-1 space-y-0.5 border-l border-border-dark pl-3">
            {SUB_MENU_ITEMS.filter(subItem => id !== 'jewelry' || subItem.id !== 'referenced2').map((subItem) => (
              <button
                key={subItem.id}
                onClick={() => handleSubItemClick(subItem.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg w-full text-left px-3 py-2 transition-all text-sm',
                  selectedSubMode === subItem.id && isActive
                    ? 'bg-mode-accent-dim text-mode-accent font-medium'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                )}
              >
                <span className="material-icons-round text-base">{subItem.icon}</span>
                <span>{subItem.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex border-r border-border-dark flex-col glass-sidebar z-50 shrink-0 h-full transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className={cn(
        "flex items-center border-b border-border-dark",
        isCollapsed ? "p-3 justify-center" : "p-4 justify-between"
      )}>
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="material-icons-round text-white text-xl">auto_awesome</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight">CGTRYON</span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            title="Menüyü daralt"
          >
            <span className="material-icons-round text-lg">chevron_left</span>
          </button>
        )}
      </div>

      {/* User Profile Section - Right below logo */}
      {userEmail && (
        <div className={cn(
          "border-b border-border-dark",
          isCollapsed ? "p-2" : "p-3"
        )} ref={userDropdownRef}>
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg transition-all hover:bg-white/5",
                isCollapsed ? "justify-center p-2" : "p-2"
              )}
            >
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarById(userAvatarId).gradient} flex items-center justify-center shrink-0 border-2 border-white/20 shadow-md`}>
                <span className="text-sm font-bold text-white">{getUserInitial()}</span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">{getDisplayName()}</p>
                    <p className="text-[10px] text-slate-500">
                      {isAdmin ? (
                        <span className="text-amber-500 font-bold">Admin • Sınırsız</span>
                      ) : (
                        <span>{userCredits} Kredi</span>
                      )}
                    </p>
                  </div>
                  <span className={cn(
                    "material-icons-round text-slate-500 text-sm transition-transform",
                    isUserDropdownOpen && "rotate-180"
                  )}>
                    expand_more
                  </span>
                </>
              )}
            </button>

            {/* User Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className={cn(
                "absolute z-50 bg-card-dark rounded-xl shadow-xl border border-border-dark py-2 animate-in fade-in slide-in-from-top-2 duration-200",
                isCollapsed ? "left-full ml-2 top-0 w-56" : "left-0 right-0 top-full mt-1"
              )}>
                {/* Credits Section */}
                {!isAdmin && (
                  <div className="px-3 py-2 border-b border-border-dark">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-icons-round text-primary text-base">toll</span>
                        <span className="text-xs text-slate-400">Kredi</span>
                      </div>
                      <span className="text-sm font-bold text-white">{userCredits}</span>
                    </div>
                    <button
                      onClick={() => { onBuyCredits?.(); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all"
                    >
                      <span className="material-icons-round text-sm">add</span>
                      Kredi Satın Al
                    </button>
                  </div>
                )}

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => { onEditProfile?.(); setIsUserDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                  >
                    <span className="material-icons-round text-slate-400 text-base">person</span>
                    <span>Profili Düzenle</span>
                  </button>

                  <button
                    onClick={() => { onOpenGallery?.(); setIsUserDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                  >
                    <span className="material-icons-round text-slate-400 text-base">history</span>
                    <span>Görsel Geçmişi</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => { onOpenAdminPanel?.(); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      <span className="material-icons-round text-amber-500 text-base">admin_panel_settings</span>
                      <span>Admin Panel</span>
                    </button>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t border-border-dark pt-1">
                  <button
                    onClick={() => { onLogout?.(); setIsUserDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <span className="material-icons-round text-base">logout</span>
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Toggle Button */}
      {isCollapsed && (
        <button
          onClick={onToggleCollapse}
          className="mx-auto mt-3 w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          title="Menüyü genişlet"
        >
          <span className="material-icons-round text-lg">chevron_right</span>
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Home Button */}
        <button
          onClick={() => onViewChange('home')}
          className={cn(
            'flex items-center gap-3 rounded-lg w-full text-left transition-all mb-3',
            isCollapsed ? 'px-3 py-2.5 justify-center' : 'px-4 py-2.5',
            currentView === 'home'
              ? 'bg-gradient-to-r from-mode-accent/20 to-mode-accent/10 text-mode-accent font-medium border border-mode-accent/30'
              : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
          )}
          title={isCollapsed ? 'Ana Sayfa' : undefined}
        >
          <span className="material-icons-round text-lg">home</span>
          {!isCollapsed && <span>Ana Sayfa</span>}
        </button>

        {/* Workspace Section */}
        {!isCollapsed && (
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">
            Workspace
          </div>
        )}
        {WORKSPACE_ITEMS.map((item) => (
          <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} />
        ))}

        {/* Collections Section */}
        {!isCollapsed && (
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">
            Collections
          </div>
        )}
        {isCollapsed && <div className="h-4" />}

        {/* Takı - dropdown'lu */}
        <NavItemWithDropdown id="jewelry" icon="diamond" label="Takı" hasSubMenu />

        {/* Erkek - dropdown'lu */}
        <NavItemWithDropdown id="mens-fashion" icon="man" label="Erkek" hasSubMenu />

        {/* Kadın - dropdown'lu */}
        <NavItemWithDropdown id="womens-fashion" icon="woman" label="Kadın" hasSubMenu />

        {/* Koleksiyon */}
        <NavItem id="collections" icon="photo_library" label="Koleksiyon" />

        {/* Assets Section - Only for Admin */}
        {isAdmin && (
          <>
            {!isCollapsed && (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">
                Assets
              </div>
            )}
            {isCollapsed && <div className="h-4" />}
            {ASSETS_ITEMS.map((item) => (
              <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} />
            ))}
          </>
        )}

        {/* Özel Section - Only for Admin */}
        {isAdmin && (
          <>
            {!isCollapsed && (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">
                Özel
              </div>
            )}
            {isCollapsed && <div className="h-4" />}
            {OZEL_ITEMS.map((item) => (
              <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} />
            ))}
          </>
        )}
      </nav>

      {/* Upgrade Card - Only when expanded */}
      {!isCollapsed && (
        <div className="p-3 border-t border-border-dark">
          <div className="relative bg-gradient-to-br from-primary/20 to-secondary/10 p-3 rounded-xl border border-primary/30 animate-pulse-glow overflow-hidden">
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Pulsing border effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-primary/50 animate-border-pulse" />

            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-icons-round text-primary text-sm animate-bounce-subtle">auto_awesome</span>
                <p className="text-xs font-bold text-primary">Pro'ya Yükselt</p>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">Sınırsız yüksek çözünürlük.</p>
              <button
                onClick={onUpgrade}
                className="w-full py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ boxShadow: '0 0 25px rgba(50, 103, 137, 0.5)' }}
              >
                Yükselt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Upgrade Button */}
      {isCollapsed && (
        <div className="p-2 border-t border-border-dark">
          <button
            onClick={onUpgrade}
            className="w-full aspect-square rounded-lg bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-all animate-pulse-glow"
            title="Pro'ya Yükselt"
          >
            <span className="material-icons-round text-lg animate-bounce-subtle">star</span>
          </button>
        </div>
      )}

      {/* Credit Warning Popup - Rendered via Portal to body */}
      {showCreditWarning && typeof document !== 'undefined' && document.body && createPortal(
        <CreditWarningPopup
          show={showCreditWarning}
          userCredits={userCredits}
          onClose={() => setShowCreditWarning(false)}
          onBuyCredits={() => onBuyCredits?.()}
        />,
        document.body
      )}
    </aside>
  );
};

// Credit Warning Popup Component
const CreditWarningPopup: React.FC<{
  show: boolean;
  userCredits: number;
  onClose: () => void;
  onBuyCredits: () => void;
}> = ({ show, userCredits, onClose, onBuyCredits }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-gradient-to-b from-card-dark to-background-dark border border-border-dark rounded-3xl p-10 max-w-md w-full mx-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Warning Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 flex items-center justify-center border border-amber-500/30">
          <span className="material-icons-round text-amber-500 text-5xl">account_balance_wallet</span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white text-center mb-3">
          Kredi Gerekli
        </h3>

        {/* Message */}
        <p className="text-base text-slate-400 text-center mb-8 leading-relaxed">
          Bu özelliği kullanabilmek için krediniz bulunmuyor.<br />
          Devam etmek için lütfen kredi satın alın.
        </p>

        {/* Current Credits */}
        <div className="flex items-center justify-center gap-3 mb-8 py-4 px-6 bg-white/5 rounded-2xl border border-border-dark">
          <span className="material-icons-round text-primary text-2xl">toll</span>
          <span className="text-base text-slate-400">Mevcut Krediniz:</span>
          <span className="text-2xl font-bold text-white">{userCredits}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-xl text-base font-medium text-slate-400 bg-white/5 hover:bg-white/10 transition-all border border-border-dark"
          >
            Kapat
          </button>
          <button
            onClick={() => {
              onClose();
              onBuyCredits();
            }}
            className="flex-1 py-4 rounded-xl text-base font-bold text-white bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
            style={{ boxShadow: '0 0 30px rgba(50, 103, 137, 0.5)' }}
          >
            <span className="material-icons-round text-xl">shopping_cart</span>
            Kredi Satın Al
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
