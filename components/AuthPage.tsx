import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { registerUser, loginUser } from '../services/firebase';

interface AuthPageProps {
  onAuthSuccess: () => void;
  startWithRegister?: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, startWithRegister = false }) => {
  const [isLogin, setIsLogin] = useState(!startWithRegister);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password);
      }
      onAuthSuccess();
    } catch (error: any) {
      let errorMessage = 'Bir hata oluştu';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanılıyor';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Kullanıcı bulunamadı';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Hatalı şifre';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  // Login Page
  if (isLogin) {
    return (
      <div className="min-h-screen bg-bg-base text-slate-100 flex items-center justify-center overflow-hidden font-sans p-4">
        {/* Background Glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full"></div>
        </div>

        <main className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-bg-base/50 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
          {/* Left Side - Image */}
          <div className="hidden lg:block relative h-80 lg:h-auto overflow-hidden">
            <img
              alt="Fashion Model"
              className="absolute inset-0 w-full h-full object-cover opacity-70"
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=800&fit=crop"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-bg-base/30"></div>
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="text-primary w-4 h-4" />
                <span className="font-semibold text-sm text-white">
                  CG<span className="text-primary">TRYON</span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Modanın geleceği ellerinizde.</h2>
              <p className="text-slate-400 text-xs">AI ile hiper-gerçekçi sanal deneme.</p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex items-center justify-center p-6 sm:p-8 bg-bg-base/80">
            <div className="w-full max-w-sm">
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-6">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="text-primary w-5 h-5" />
                  <span className="font-bold text-base text-white">
                    CG<span className="text-primary">TRYON</span>
                  </span>
                </div>
              </div>

              <div className="mb-6 text-center lg:text-left">
                <h1 className="text-xl font-bold text-white mb-1">Hoş Geldiniz</h1>
                <p className="text-slate-500 text-xs">Stüdyonuza erişmek için giriş yapın.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">E-posta</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-lg">mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="isim@sirket.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Şifre</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-lg">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border border-white/20 bg-white/5 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                    />
                    <span className="text-slate-500 group-hover:text-slate-400">Beni hatırla</span>
                  </label>
                  <a className="text-primary hover:text-secondary font-medium cursor-pointer">Şifremi Unuttum</a>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Giriş Yapılıyor...</span>
                    </div>
                  ) : 'Giriş Yap'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-bg-base text-slate-600 text-xs">veya</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2 rounded-lg hover:bg-white/10 transition-all group">
                  <svg className="w-4 h-4 fill-slate-400 group-hover:fill-white" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                  </svg>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-white">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2 rounded-lg hover:bg-white/10 transition-all group">
                  <svg className="w-4 h-4 fill-slate-400 group-hover:fill-white" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.82-.78.897-1.454 2.337-1.273 3.714 1.338.104 2.715-.688 3.559-1.704z"></path>
                  </svg>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-white">Apple</span>
                </button>
              </div>

              {/* Switch */}
              <div className="mt-6 text-center">
                <p className="text-slate-600 text-xs">
                  Hesabınız yok mu?
                  <button onClick={switchMode} className="text-white hover:text-primary font-semibold ml-1">
                    Kayıt ol
                  </button>
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="fixed bottom-4 w-full text-center text-slate-700 text-[10px] tracking-wider uppercase">
          © 2025 CGTRYON AI Studio
        </div>
      </div>
    );
  }

  // Register Page
  return (
    <div className="min-h-screen bg-bg-base text-slate-100 flex flex-col font-sans">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[40%] h-[40%] bg-accent/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Nav */}
      <nav className="relative z-50 w-full">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="text-primary w-5 h-5" />
            <span className="font-bold text-base text-white">
              CG<span className="text-primary">TRYON</span>
            </span>
          </div>
          <a className="text-xs text-slate-500 hover:text-white cursor-pointer">Yardım</a>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-8 relative z-10">
        <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-10 items-center">
          {/* Form Side */}
          <div className="w-full max-w-sm mx-auto lg:mx-0">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white mb-1">Stüdyonuzu oluşturun.</h1>
              <p className="text-slate-500 text-xs">Hesabınızı oluşturarak başlayın.</p>
            </div>

            {/* Form Card */}
            <div className="bg-white/[0.03] backdrop-blur border border-primary/20 p-5 rounded-xl">
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Ad Soyad</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ahmet Yılmaz"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">E-posta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmet@sirket.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Şifre</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Şifre Tekrar</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Hesap Oluştur</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-slate-600 text-xs">
                  Zaten hesabınız var mı?
                  <button onClick={switchMode} className="text-primary font-semibold ml-1 hover:text-secondary">
                    Giriş yapın
                  </button>
                </p>
              </div>
            </div>

            <p className="mt-4 text-[10px] text-slate-600 text-center lg:text-left">
              Kaydolarak Kullanım Şartları ve Gizlilik Politikası'nı kabul edersiniz.
            </p>
          </div>

          {/* Right Side - Features */}
          <div className="hidden lg:flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                "Modanın geleceği{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">algoritmada.</span>"
              </h2>
              <p className="text-sm text-slate-500">— AI Fashion Vanguard, 2025</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] border border-primary/20 p-4 rounded-xl">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-primary text-base">model_training</span>
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">Neural Fitting</h4>
                <p className="text-xs text-slate-500">Yüksek kaliteli kumaş simülasyonu.</p>
              </div>
              <div className="bg-white/[0.03] border border-primary/20 p-4 rounded-xl">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-primary text-base">shutter_speed</span>
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">Anında Sonuç</h4>
                <p className="text-xs text-slate-500">500ms altında işlem.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-bg-base bg-slate-800 overflow-hidden">
                  <img alt="User" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop" />
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-bg-base bg-slate-800 overflow-hidden">
                  <img alt="User" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" />
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-bg-base bg-slate-800 overflow-hidden">
                  <img alt="User" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop" />
                </div>
              </div>
              <p className="text-xs">12,000+ tasarımcı katıldı</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-slate-600 text-[10px]">
          <p>© 2025 CGTRYON</p>
          <div className="flex gap-4">
            <a className="hover:text-primary cursor-pointer">Gizlilik</a>
            <a className="hover:text-primary cursor-pointer">Güvenlik</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
