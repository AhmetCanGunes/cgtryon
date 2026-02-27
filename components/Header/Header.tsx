import React, { useState } from 'react';
import CreditsBadge from './CreditsBadge';
import UserDropdown from './UserDropdown';
import { cn } from '../../lib/utils';

type ViewState = 'home' | 'studio' | 'try-on' | 'ad-creative' | 'jewelry' | 'mens-fashion' | 'womens-fashion' | 'style-selector' | 'product-annotation' | 'prompt-architect' | 'personas';

interface HeaderProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  userEmail: string;
  userCredits: number;
  isAdmin: boolean;
  onBuyCredits: () => void;
  onOpenGallery: () => void;
  onOpenAdminPanel: () => void;
  onLogout: () => void;
  onNewGeneration?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  userEmail,
  userCredits,
  isAdmin,
  onBuyCredits,
  onOpenGallery,
  onOpenAdminPanel,
  onLogout,
  onNewGeneration
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 min-h-[64px] border-b border-border-dark glass-header flex items-center justify-between px-6 z-40 shrink-0">
        {/* Left: Search */}
        <div className="flex items-center flex-1 max-w-xl">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all mr-4"
          >
            <span className="material-icons-round text-xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>

          <div className="relative w-full hidden sm:block">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              type="text"
              placeholder="Stüdyo varlıklarını ara..."
              className="w-full bg-white/5 border border-border-dark focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 ml-6">
          {/* New Generation Button */}
          <button
            onClick={onNewGeneration}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 hidden sm:flex"
            style={{ boxShadow: '0 0 20px var(--mode-accent-glow)' }}
          >
            <span className="material-icons-round text-base">add</span>
            Yeni Üretim
          </button>

          {/* Divider */}
          <div className="h-6 w-[1px] bg-border-dark hidden sm:block"></div>

          {/* Notifications & User */}
          <div className="flex items-center gap-3">
            <button className="text-slate-500 hover:text-primary transition-colors hidden sm:block">
              <span className="material-icons-round">notifications</span>
            </button>

            {/* Credits */}
            {!isAdmin && (
              <CreditsBadge
                credits={userCredits}
                isAdmin={isAdmin}
                onClick={onBuyCredits}
              />
            )}

            {/* User Avatar */}
            <UserDropdown
              email={userEmail}
              credits={userCredits}
              isAdmin={isAdmin}
              onBuyCredits={onBuyCredits}
              onOpenGallery={onOpenGallery}
              onOpenAdminPanel={onOpenAdminPanel}
              onLogout={onLogout}
            />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background-dark/98 backdrop-blur-md">
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border-dark">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="material-icons-round text-white text-xl">auto_awesome</span>
                </div>
                <span className="font-bold text-xl">CGTRYON</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"
              >
                <span className="material-icons-round text-2xl">close</span>
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Workspace */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Workspace</div>
                  <div className="space-y-1">
                    {[
                      { id: 'studio', icon: 'grid_view', label: 'Studio' },
                      { id: 'try-on', icon: 'checkroom', label: 'Kabin' },
                      { id: 'ad-creative', icon: 'campaign', label: 'Reklam' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { onViewChange(item.id as ViewState); setMobileMenuOpen(false); }}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all',
                          currentView === item.id
                            ? 'bg-primary/20 text-primary'
                            : 'text-slate-400 hover:bg-white/5'
                        )}
                      >
                        <span className="material-icons-round text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collections */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Collections</div>
                  <div className="space-y-1">
                    {[
                      { id: 'jewelry', icon: 'diamond', label: 'Takı' },
                      { id: 'mens-fashion', icon: 'man', label: 'Erkek' },
                      { id: 'womens-fashion', icon: 'woman', label: 'Kadın' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { onViewChange(item.id as ViewState); setMobileMenuOpen(false); }}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all',
                          currentView === item.id
                            ? 'bg-primary/20 text-primary'
                            : 'text-slate-400 hover:bg-white/5'
                        )}
                      >
                        <span className="material-icons-round text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assets */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Assets</div>
                  <div className="space-y-1">
                    {[
                      { id: 'style-selector', icon: 'palette', label: 'Stil' },
                      { id: 'product-annotation', icon: 'label', label: 'Etiket' },
                      { id: 'prompt-architect', icon: 'terminal', label: 'Prompt' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { onViewChange(item.id as ViewState); setMobileMenuOpen(false); }}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all',
                          currentView === item.id
                            ? 'bg-primary/20 text-primary'
                            : 'text-slate-400 hover:bg-white/5'
                        )}
                      >
                        <span className="material-icons-round text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Footer */}
            <div className="p-6 border-t border-border-dark">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-pink-500 border-2 border-slate-800 flex items-center justify-center text-white font-bold">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[150px]">{userEmail}</p>
                    <p className="text-xs text-slate-500">{userCredits} Kredi</p>
                  </div>
                </div>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
                >
                  Çıkış
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
