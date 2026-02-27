import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  LayoutDashboard,
  Users,
  Mail,
  Palette,
  RefreshCw,
  Search,
  Plus,
  Minus,
  Trash2,
  Crown,
  ChevronLeft,
  Download,
  TrendingUp,
  CreditCard,
  ImageIcon,
  UserCheck,
  Moon,
  Sun,
  Activity,
  Zap,
  BarChart3,
  Settings
} from 'lucide-react';
import {
  AdminTabType,
  AdminStats,
  AdminUserView,
  EmailSubscriber,
  GenerationSettings,
  GeneratedImage,
  LoadingState,
  ImageFilterSettings,
  TryOnSettings,
  AdSettings,
  UpscaleSettings,
  AdCreativeResult,
  DashboardWidget,
  ActivityItem,
  ChartDataPoint,
  StatCardData,
  DEFAULT_DASHBOARD_WIDGETS,
  GENDER_OPTIONS,
  ETHNICITY_OPTIONS,
  AGE_OPTIONS,
  BODY_TYPE_OPTIONS,
  HAIR_STYLE_OPTIONS,
  HEIGHT_OPTIONS,
  AD_THEMES,
  VIEW_ANGLE_OPTIONS,
  PRODUCT_CATEGORIES,
  BACKGROUND_OPTIONS_FULL,
  ASPECT_RATIO_OPTIONS,
  MODEL_POSE_OPTIONS,
  NUMBER_OF_IMAGES_OPTIONS,
  MODEL_QUALITY_OPTIONS,
  RESOLUTION_OPTIONS,
  SEASON_OPTIONS,
  WEATHER_OPTIONS,
  getVariedBackgrounds,
  getVariedBoudoirPoses
} from '../types';

// Import new dashboard components
import { StatsCard, ActivityFeed, QuickActions, UserGrowthChart, GenerationsChart, PlanDistributionChart, WidgetContainer } from './admin/widgets';
import { GlowCard, AnimatedNumber, TrendIndicator, Sparkline } from './admin/ui';
import {
  getAdminStats,
  getAdminUserList,
  getEmailSubscribers,
  deleteEmailSubscriber,
  adminAddCredits,
  adminSetUserCredits,
  adminUpdateUserPlan,
  adminResetUserUsage,
  isAdmin
} from '../services/firebase';

// Import studio components
import Sidebar from './OldSidebar';
import ImageDisplay from './ImageDisplay';
import VirtualTryOnMode from './VirtualTryOnMode';
import AdCreativeMode from './AdCreativeMode';
import UpscaleMode from './UpscaleMode';

interface AdminPanelProps {
  currentUser: User;
  onBack: () => void;
  // Studio generation handlers
  onStudioGenerate: () => Promise<void>;
  onTryOnGenerate: (model: File, garment: File, garment2: File | null, garment3: File | null, settings: TryOnSettings) => Promise<void>;
  onAdGenerate: (image: File, adSettings: AdSettings) => Promise<AdCreativeResult[]>;
  onUpscaleGenerate: (image: File, upscaleSettings: UpscaleSettings) => Promise<string>;
  // Studio state
  productImage: File | null;
  setProductImage: (file: File | null) => void;
  settings: GenerationSettings;
  setSettings: (settings: GenerationSettings) => void;
  generatedImages: GeneratedImage[];
  tryOnResults: GeneratedImage[];
  isGenerating: boolean;
  currentTask: LoadingState;
}

const DEFAULT_FILTER_SETTINGS: ImageFilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

type StudioViewState = 'studio' | 'try-on' | 'ad-creative';

const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onBack,
  onStudioGenerate,
  onTryOnGenerate,
  onAdGenerate,
  onUpscaleGenerate,
  productImage,
  setProductImage,
  settings,
  setSettings,
  generatedImages,
  tryOnResults,
  isGenerating,
  currentTask
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabType>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Studio state
  const [studioView, setStudioView] = useState<StudioViewState>('studio');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageFilterSettings, setImageFilterSettings] = useState<ImageFilterSettings>(DEFAULT_FILTER_SETTINGS);

  // Credit modal state
  const [creditModalUser, setCreditModalUser] = useState<AdminUserView | null>(null);
  const [creditAmount, setCreditAmount] = useState<string>('100');
  const [creditAction, setCreditAction] = useState<'add' | 'set'>('add');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when returning to dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Admin: Loading data...');
      const [statsData, usersData, subscribersData] = await Promise.all([
        getAdminStats(),
        getAdminUserList(),
        getEmailSubscribers()
      ]);
      console.log('✅ Admin Stats:', statsData);
      console.log('✅ Admin Users loaded:', usersData.length, usersData);
      console.log('✅ Admin Subscribers loaded:', subscribersData.length);
      setStats(statsData);
      setUsers(usersData);
      setSubscribers(subscribersData);
    } catch (err: any) {
      console.error('❌ Error loading admin data:', err);
      setError(err.message || 'Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!window.confirm('Bu aboneyi silmek istediğinizden emin misiniz?')) return;

    const success = await deleteEmailSubscriber(id);
    if (success) {
      setSubscribers(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleCreditAction = async () => {
    if (!creditModalUser) return;

    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Geçerli bir miktar girin');
      return;
    }

    try {
      if (creditAction === 'add') {
        await adminAddCredits(creditModalUser.email, amount);
      } else {
        await adminSetUserCredits(creditModalUser.email, amount);
      }

      // Refresh user list
      const usersData = await getAdminUserList();
      setUsers(usersData);
      setCreditModalUser(null);
    } catch (error: any) {
      alert('Hata: ' + error.message);
    }
  };

  const handlePlanChange = async (userEmail: string, newPlan: 'free' | 'pro' | 'enterprise') => {
    try {
      await adminUpdateUserPlan(userEmail, newPlan);
      const usersData = await getAdminUserList();
      setUsers(usersData);
    } catch (error: any) {
      alert('Hata: ' + error.message);
    }
  };

  const handleResetUsage = async (userEmail: string) => {
    if (!window.confirm(`${userEmail} kullanıcısının tüm üretim geçmişini ve AI model kullanım verilerini sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      await adminResetUserUsage(userEmail);
      await loadData(); // Refresh data
      alert('Kullanım verileri başarıyla sıfırlandı!');
    } catch (error: any) {
      alert('Hata: ' + error.message);
    }
  };

  const exportSubscribersCSV = () => {
    const csv = [
      'Email,Kayıt Tarihi,Kaynak',
      ...subscribers.map(s => `${s.email},${s.timestamp},${s.source}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Studio navigation items
  const studioNavItems = [
    { id: 'studio', label: 'Model Stüdyosu', desc: 'Ürün çekimi oluştur' },
    { id: 'try-on', label: 'Sanal Kabin', desc: 'Kıyafet giydir' },
    { id: 'ad-creative', label: 'Reklam Kreatifi', desc: 'Marketing görselleri' },
  ];

  // Generate chart data from real stats data
  const generateChartData = useCallback((dailyData: number[]): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    for (let i = dailyData.length - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (dailyData.length - 1 - i));
      data.push({
        date: date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
        value: dailyData[i] || 0,
      });
    }
    return data;
  }, []);

  // Generate activities from users
  const generateActivities = useCallback((userList: AdminUserView[]): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const sortedUsers = [...userList]
      .filter(u => u.lastLogin)
      .sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime())
      .slice(0, 8);

    sortedUsers.forEach((user) => {
      activities.push({
        id: `login-${user.uid}`,
        type: 'user_login',
        user: user.email,
        details: 'Sisteme giriş yaptı',
        timestamp: user.lastLogin
      });
      if (user.totalGenerations > 0) {
        const genDate = new Date(user.lastLogin);
        genDate.setMinutes(genDate.getMinutes() - Math.random() * 30);
        activities.push({
          id: `gen-${user.uid}`,
          type: 'generation',
          user: user.email,
          details: `${user.totalGenerations} görsel üretti`,
          timestamp: genDate.toISOString()
        });
      }
      if (user.plan !== 'free') {
        activities.push({
          id: `plan-${user.uid}`,
          type: 'plan_upgrade',
          user: user.email,
          details: `${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} planına yükseldi`,
          timestamp: user.createdAt || user.lastLogin
        });
      }
    });
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);
  }, []);

  // Prepare stats cards data with REAL data
  const getStatsCardsData = useCallback((): StatCardData[] => {
    if (!stats) return [];
    return [
      {
        id: 'users',
        title: 'Toplam Kullanıcı',
        value: stats.totalUsers,
        icon: 'users',
        color: 'violet',
        trend: stats.trends?.users || 0,
        sparklineData: stats.dailyUsers || [0, 0, 0, 0, 0, 0, 0]
      },
      {
        id: 'generations',
        title: 'Toplam Üretim',
        value: stats.totalGenerations,
        icon: 'image',
        color: 'emerald',
        trend: stats.trends?.generations || 0,
        sparklineData: stats.dailyGenerations || [0, 0, 0, 0, 0, 0, 0]
      },
      {
        id: 'credits',
        title: 'Kullanılan Kredi',
        value: stats.totalCreditsUsed,
        icon: 'credit',
        color: 'amber',
        trend: stats.trends?.credits || 0,
        sparklineData: stats.dailyCredits || [0, 0, 0, 0, 0, 0, 0]
      },
      {
        id: 'subscribers',
        title: 'Email Aboneleri',
        value: stats.totalSubscribers,
        icon: 'mail',
        color: 'blue',
        trend: stats.trends?.subscribers || 0,
        sparklineData: [0, 0, 0, 0, 0, 0, stats.totalSubscribers] // Abone geçmişi yok
      }
    ];
  }, [stats]);

  const renderDashboard = () => {
    const statsCards = getStatsCardsData();
    const activities = generateActivities(users);
    const userGrowthData = stats ? generateChartData(stats.dailyUsers || [0, 0, 0, 0, 0, 0, 0]) : [];
    const generationsData = stats ? generateChartData(stats.dailyGenerations || [0, 0, 0, 0, 0, 0, 0]) : [];

    return (
      <div className="p-6 space-y-6 bg-[#0f0f14] min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Dashboard</h2>
            <p className="text-gray-500 text-sm mt-1">Hoş geldiniz, {currentUser.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">Canlı</span>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary transition-all hover:glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Yenile
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-border-default border-t-primary rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Veriler yükleniyor...</p>
            </div>
          </div>
        ) : stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsCards.map((card, index) => (
                <StatsCard
                  key={card.id}
                  data={card}
                  animationDelay={index * 100}
                />
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <UserGrowthChart data={userGrowthData} />
              <GenerationsChart data={generationsData} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Plan Distribution */}
              <PlanDistributionChart data={stats.usersByPlan} />

              {/* Activity Feed */}
              <ActivityFeed activities={activities} maxItems={6} />

              {/* Quick Actions */}
              <QuickActions
                onExportUsers={() => {
                  const csv = ['Email,Plan,Kredi,Üretim,Son Giriş', ...users.map(u =>
                    `${u.email},${u.plan},${u.credits},${u.totalGenerations},${u.lastLogin || '-'}`
                  )].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                onExportSubscribers={exportSubscribersCSV}
                onRefreshData={loadData}
                loading={loading}
              />
            </div>

            {/* Revenue Estimate Card */}
            <GlowCard className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Tahmini Aylık Gelir</p>
                    <p className="text-3xl font-bold text-gray-100">
                      <AnimatedNumber
                        value={stats.usersByPlan.pro * 29 + stats.usersByPlan.enterprise * 99}
                        format="currency"
                        decimals={0}
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-gray-500 text-xs">Pro Kullanıcılar</p>
                      <p className="text-secondary font-semibold">{stats.usersByPlan.pro} x $29</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Enterprise</p>
                      <p className="text-amber-400 font-semibold">{stats.usersByPlan.enterprise} x $99</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
          </>
        )}
      </div>
    );
  };

  const renderUsers = () => (
    <div className="p-6 space-y-4 bg-[#0f0f14] min-h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">Kullanıcı Yönetimi</h2>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-lg bg-bg-elevated hover:bg-[#2a2a3e] border border-border-default transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          <strong>Hata:</strong> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-border-default border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-border-default focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-gray-200 placeholder-gray-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-bg-elevated rounded-xl border border-border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full dark-table">
            <thead className="bg-primary/10 border-b border-border-default">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Plan</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Kredi</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Üretim</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">AI Model</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Maliyet</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Son Giriş</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {/* Admin kullanıcıları önce göster */}
              {filteredUsers.filter(u => isAdmin(u.email)).map((user) => (
                <tr key={user.uid} className="bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center text-white font-semibold text-sm">
                        <Crown size={14} />
                      </div>
                      <div>
                        <span className="text-sm text-gray-100 font-medium">{user.email}</span>
                        <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">ADMIN</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-secondary border border-primary/30">
                      Admin
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary font-bold">Sınırsız</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{user.totalGenerations}</td>
                  <td className="px-4 py-3">
                    {user.modelUsage && Object.keys(user.modelUsage).length > 0 ? (
                      <div className="space-y-0.5">
                        {Object.entries(user.modelUsage).map(([model, count]) => (
                          <div key={model} className="text-[10px] text-gray-400">
                            <span className="font-semibold text-gray-300">{model}:</span> {count}x
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.totalEstimatedCost ? (
                      <span className="text-xs text-emerald-400 font-medium">
                        ${user.totalEstimatedCost.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleResetUsage(user.email)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                      title="Kullanım Verilerini Sıfırla"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Normal kullanıcılar */}
              {filteredUsers.filter(u => !isAdmin(u.email)).map((user) => (
                <tr key={user.uid} className="hover:bg-[#2a2a3e] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-secondary font-semibold text-sm">
                        {user.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-200">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.plan}
                      onChange={(e) => handlePlanChange(user.email, e.target.value as any)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer bg-[#2a2a3e] ${
                        user.plan === 'enterprise' ? 'text-amber-400 border-amber-500/30' :
                        user.plan === 'pro' ? 'text-secondary border-primary/30' :
                        'text-gray-400 border-[#3d3d4d]'
                      }`}
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-100 font-medium">{user.credits}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{user.totalGenerations}</td>
                  <td className="px-4 py-3">
                    {user.modelUsage && Object.keys(user.modelUsage).length > 0 ? (
                      <div className="space-y-0.5">
                        {Object.entries(user.modelUsage).map(([model, count]) => (
                          <div key={model} className="text-[10px] text-gray-400">
                            <span className="font-semibold text-gray-300">{model}:</span> {count}x
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.totalEstimatedCost ? (
                      <span className="text-xs text-emerald-400 font-medium">
                        ${user.totalEstimatedCost.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCreditModalUser(user);
                          setCreditAction('add');
                          setCreditAmount('100');
                        }}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                        title="Kredi Ekle"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setCreditModalUser(user);
                          setCreditAction('set');
                          setCreditAmount(user.credits.toString());
                        }}
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                        title="Kredi Ayarla"
                      >
                        <CreditCard size={16} />
                      </button>
                      <button
                        onClick={() => handleResetUsage(user.email)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                        title="Kullanım Verilerini Sıfırla"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Users size={24} className="text-amber-500" />
            </div>
            <p className="text-gray-400 mb-2">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Kullanıcı bulunamadı'}
            </p>
            <p className="text-gray-500 text-xs">
              {error ? `Hata: ${error}` : 'Tarayıcı konsolunu (F12) kontrol edin'}
            </p>
            <p className="text-gray-600 text-xs mt-2">
              users state: {users.length} | filteredUsers: {filteredUsers.length}
            </p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
            >
              Tekrar Dene
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSubscribers = () => (
    <div className="p-6 space-y-4 bg-[#0f0f14] min-h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">Email Aboneleri</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={exportSubscribersCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white hover:bg-primary hover:glow-primary transition-all text-sm font-medium"
          >
            <Download size={16} />
            CSV İndir
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-bg-elevated hover:bg-[#2a2a3e] border border-border-default transition-colors"
          >
            <RefreshCw size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Email ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-border-default focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-gray-200 placeholder-gray-500"
        />
      </div>

      {/* Subscribers Table */}
      <div className="bg-bg-elevated rounded-xl border border-border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full dark-table">
            <thead className="bg-blue-500/10 border-b border-border-default">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Kayıt Tarihi</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Kaynak</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-[#2a2a3e] transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-200">{subscriber.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {subscriber.timestamp ? new Date(subscriber.timestamp).toLocaleString('tr-TR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                      {subscriber.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteSubscriber(subscriber.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscribers.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            Email abonesi bulunamadı
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Toplam {filteredSubscribers.length} abone
      </p>
    </div>
  );

  const renderStudio = () => (
    <div className="flex flex-col h-full">
      {/* Studio Tab Navigation */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {studioNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setStudioView(item.id as StudioViewState)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                studioView === item.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Studio Content */}
      <div className="flex-1 flex overflow-hidden">
        {studioView === 'studio' ? (
          <>
            <Sidebar
              productImage={productImage}
              settings={settings}
              onProductImageUpload={setProductImage}
              onRemoveProductImage={() => setProductImage(null)}
              onSettingsChange={setSettings}
              onGenerate={onStudioGenerate}
              isGenerating={isGenerating}
              currentTask={currentTask}
              onSaveSettings={() => {}}
              generatedImages={generatedImages}
            />
            <ImageDisplay
              images={generatedImages}
              currentIndex={currentIndex}
              onNext={() => setCurrentIndex(prev => Math.min(prev + 1, generatedImages.length - 1))}
              onPrev={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
              onThumbnailClick={setCurrentIndex}
              onMaximize={() => {}}
              isGenerating={isGenerating}
              currentTask={currentTask}
              filterSettings={imageFilterSettings}
              onFilterChange={setImageFilterSettings}
            />
          </>
        ) : studioView === 'try-on' ? (
          <VirtualTryOnMode
            onGenerate={onTryOnGenerate}
            isGenerating={isGenerating}
            generatedImages={tryOnResults}
          />
        ) : (
          <AdCreativeMode
            onGenerate={onAdGenerate}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Kullanıcılar', icon: <Users size={20} /> },
    { id: 'subscribers', label: 'Aboneler', icon: <Mail size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0f0f14]">
      {/* Sidebar - Dark Mode */}
      <aside className="w-64 admin-sidebar border-r border-border-default flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center px-5 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="CGTRYON"
                className="h-6 w-auto brightness-200"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-100">Admin Panel</h1>
              <p className="text-[10px] text-gray-500">CGTRYON</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-secondary border border-primary/30 glow-primary'
                  : 'text-gray-400 hover:bg-bg-elevated hover:text-gray-200'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* System Status */}
        <div className="px-4 py-3 border-t border-border-default">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Sistem Durumu</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400">Aktif</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-default">
          <div className="bg-bg-elevated rounded-xl p-3 mb-3 border border-border-default">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Crown size={14} className="text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500">Admin</p>
                <p className="text-xs font-medium text-gray-300 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-bg-elevated text-gray-400 hover:bg-[#2a2a3e] hover:text-gray-200 border border-border-default hover:border-primary/30 transition-all text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Ana Sayfaya Dön
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden overflow-y-auto bg-[#0f0f14]">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'subscribers' && renderSubscribers()}
      </main>

      {/* Credit Modal */}
      {creditModalUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {creditAction === 'add' ? 'Kredi Ekle' : 'Kredi Ayarla'}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Kullanıcı: <span className="font-medium text-gray-900">{creditModalUser.email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Mevcut Kredi: <span className="font-medium text-gray-900">{creditModalUser.credits}</span>
            </p>

            {creditAction === 'add' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Paket Seçin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCreditAmount('100')}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      creditAmount === '100'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900">Başlangıç</div>
                    <div className="text-sm text-primary font-medium">100 Kredi</div>
                  </button>
                  <button
                    onClick={() => setCreditAmount('500')}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      creditAmount === '500'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900">Profesyonel</div>
                    <div className="text-sm text-primary font-medium">500 Kredi</div>
                  </button>
                  <button
                    onClick={() => setCreditAmount('1500')}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      creditAmount === '1500'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900">İşletme</div>
                    <div className="text-sm text-primary font-medium">1500 Kredi</div>
                  </button>
                  <button
                    onClick={() => setCreditAmount('5000')}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      creditAmount === '5000'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900">Kurumsal</div>
                    <div className="text-sm text-primary font-medium">5000 Kredi</div>
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {creditAction === 'add' ? 'Eklenecek Miktar' : 'Yeni Kredi Miktarı'}
              </label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                min="0"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCreditModalUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleCreditAction}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white hover:bg-primary transition-colors font-medium"
              >
                {creditAction === 'add' ? 'Ekle' : 'Ayarla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
