import React, { useState } from 'react';
import { Sparkles, Zap, Globe, AtSign } from 'lucide-react';
import { saveEmailToFirebase, saveToLocalStorage } from '../services/firebase';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=300&h=400&fit=crop',
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-bg-base text-slate-100 font-sans selection:bg-primary/30 overflow-x-hidden">
      {/* Navigation - Daha kompakt */}
      <nav className="fixed top-0 w-full z-50 bg-bg-base/80 backdrop-blur-xl border-b border-primary/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-primary w-5 h-5" />
              <span className="font-bold text-base tracking-tight text-white">
                CG<span className="text-primary">TRYON</span>
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a className="text-xs font-medium text-slate-400 hover:text-primary transition-colors" href="#features">Özellikler</a>
              <a className="text-xs font-medium text-slate-400 hover:text-primary transition-colors" href="#pricing">Fiyatlandırma</a>
              <div className="h-3 w-[1px] bg-slate-800"></div>
              <a className="text-xs font-medium text-slate-400 hover:text-primary transition-colors cursor-pointer" onClick={onLogin}>Giriş</a>
              <button
                onClick={onGetStarted}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-full font-semibold text-xs transition-all"
              >
                Başla
              </button>
            </div>
            <button
              onClick={onGetStarted}
              className="md:hidden bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-full font-semibold text-xs transition-all"
            >
              Başla
            </button>
          </div>
        </div>
      </nav>

      <main className="relative overflow-hidden">
        {/* Background glow - Daha subtle */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        </div>

        {/* Hero Section - Daha kompakt */}
        <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-16 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-primary/15 text-secondary border border-primary/25 mb-4">
                Yeni Nesil AI Teknolojisi
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white mb-4">
                Kumaşa Dokunmadan{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Giyinin.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-xl mx-auto leading-relaxed">
                Moda markanızı hiper-gerçekçi AI sanal deneme teknolojisi ile yükseltin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onGetStarted}
                  className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                >
                  Hemen Dene <Zap className="w-4 h-4" />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-all"
                >
                  Daha Fazla
                </button>
              </div>
            </div>

            {/* Scrolling Gallery - Daha küçük */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-2xl blur opacity-20"></div>
              <div className="relative overflow-hidden rounded-2xl bg-slate-900/30 border border-white/10">
                <div className="flex animate-scroll whitespace-nowrap py-6">
                  <div className="flex gap-4 px-3">
                    {GALLERY_IMAGES.map((img, idx) => (
                      <div key={idx} className="w-40 sm:w-48 h-56 sm:h-64 rounded-xl overflow-hidden border border-white/10 shadow-xl shrink-0 group/card">
                        <img
                          alt={`Model ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                          src={img}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 px-3">
                    {GALLERY_IMAGES.map((img, idx) => (
                      <div key={`dup-${idx}`} className="w-40 sm:w-48 h-56 sm:h-64 rounded-xl overflow-hidden border border-white/10 shadow-xl shrink-0 group/card">
                        <img
                          alt={`Model ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                          src={img}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-bg-base to-transparent z-20"></div>
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-bg-base to-transparent z-20"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Daha kompakt */}
        <section id="features" className="py-16 relative z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 text-white">Neden Bizi Tercih Etmelisiniz?</h2>
              <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4"></div>
              <p className="text-slate-400 max-w-lg mx-auto text-sm">
                Milyonlarca vücut tipi ve kumaş davranışı üzerinde eğitilmiş özel AI modelimiz.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              <FeatureCard
                icon="touch_app"
                title="Sıfır Gecikme"
                description="Fotoğraf yükleyin, AI gerisini halleder."
              />
              <FeatureCard
                icon="neurology"
                title="Neural Hassasiyet"
                description="İade oranlarını %45'e kadar azaltır."
              />
              <FeatureCard
                icon="inventory_2"
                title="Sınırsız Gardırop"
                description="Binlerce ürüne anında erişin."
              />
            </div>
          </div>
        </section>

        {/* Stats Section - Daha kompakt */}
        <section className="py-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-4 gap-4 text-center">
              <StatBox value="99.8%" label="Doğruluk" />
              <StatBox value="500+" label="Marka" />
              <StatBox value="1.2M" label="Kullanıcı" />
              <StatBox value="0.5s" label="Hız" />
            </div>
          </div>
        </section>

        {/* CTA Section - Daha kompakt */}
        <section id="pricing" className="py-16">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-gradient-to-br from-primary/80 via-[#1e4a63] to-bg-base rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden border border-white/10">
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3">
                  Deneyiminizi dönüştürmeye hazır mısınız?
                </h2>
                <p className="text-secondary text-sm mb-6 max-w-md mx-auto">
                  500+ markaya katılın. Ücretsiz denemenizi başlatın.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={onGetStarted}
                    className="bg-white text-primary px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-all"
                  >
                    Ücretsiz Başla
                  </button>
                  <button
                    onClick={onGetStarted}
                    className="bg-transparent border border-white/30 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-all"
                  >
                    Demo İzle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Daha kompakt */}
      <footer className="bg-bg-base py-10 border-t border-white/5 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-1.5 mb-4">
                <Sparkles className="text-primary w-5 h-5" />
                <span className="font-bold text-sm text-white">
                  CG<span className="text-primary">TRYON</span>
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                AI ile moda ticaretinin geleceğini şekillendiriyoruz.
              </p>
              <div className="flex gap-2">
                <a className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all border border-white/10" href="#">
                  <Globe className="w-3.5 h-3.5" />
                </a>
                <a className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all border border-white/10" href="#">
                  <AtSign className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Ürün</h4>
              <ul className="space-y-2 text-slate-500 text-xs">
                <li><a className="hover:text-primary transition-colors" href="#">Özellikler</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">API</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Entegrasyonlar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Şirket</h4>
              <ul className="space-y-2 text-slate-500 text-xs">
                <li><a className="hover:text-primary transition-colors" href="#">Hakkımızda</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Kariyer</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">İletişim</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Yasal</h4>
              <ul className="space-y-2 text-slate-500 text-xs">
                <li><a className="hover:text-primary transition-colors" href="#">Gizlilik</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Kullanım Şartları</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 text-center text-slate-600 text-xs">
            © 2025 CGTRYON AI Studio
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Feature Card - Daha kompakt
const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all hover:translate-y-[-4px] duration-300">
    <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <h3 className="text-sm font-semibold mb-1.5 text-white">{title}</h3>
    <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
  </div>
);

// Stat Box - Daha kompakt
const StatBox: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div>
    <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">{value}</div>
    <div className="text-[10px] font-medium text-secondary uppercase tracking-wider">{label}</div>
  </div>
);

export default LandingPage;
