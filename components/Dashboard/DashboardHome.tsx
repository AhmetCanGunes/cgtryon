import React from 'react';
import StatsCard from './StatsCard';
import ScheduleTimeline from './ScheduleTimeline';
import SystemPulse from './SystemPulse';
import RecentJobs from './RecentJobs';
import MiniBarChart from './MiniBarChart';
import { UserDashboardStats } from '../../services/firebase';

interface DashboardHomeProps {
  userCredits: number;
  stats: UserDashboardStats | null;
  isLoading?: boolean;
  onViewHistory?: () => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({
  userCredits,
  stats,
  isLoading = false,
  onViewHistory,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-border-dark border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-400">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Haftalık üretim sayısı (bugünkü dahil son 7 gün)
  const thisWeekGenerations = stats?.weeklyGenerations?.reduce((a, b) => a + b, 0) || 0;

  // Accuracy hesaplama (başarılı / toplam)
  const accuracy = stats && stats.totalGenerations > 0
    ? ((stats.successCount / stats.totalGenerations) * 100).toFixed(1)
    : '0';

  return (
    <div className="flex-1 p-6 overflow-auto custom-scrollbar">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="TOPLAM ÜRETİM"
          value={stats?.totalGenerations?.toLocaleString() || '0'}
          icon="layers"
          iconColor="text-primary"
          trend={thisWeekGenerations > 0 ? { value: `+${thisWeekGenerations} bu hafta`, isPositive: true } : undefined}
          chart={<MiniBarChart data={stats?.weeklyGenerations || [0, 0, 0, 0, 0, 0, 0]} color="bg-primary/60" />}
        />
        <StatsCard
          title="KREDİ KULLANIMI"
          value={stats?.totalCreditsUsed?.toLocaleString() || '0'}
          subtitle={`Kalan: ${userCredits} kredi`}
          icon="toll"
          iconColor="text-blue-400"
          chart={<MiniBarChart data={stats?.weeklyGenerations || [0, 0, 0, 0, 0, 0, 0]} color="bg-blue-400/60" />}
        />
        <StatsCard
          title="BAŞARI ORANI"
          value={`${accuracy}%`}
          icon="track_changes"
          iconColor="text-slate-400"
          showProgress
          progressValue={parseFloat(accuracy)}
        />
        <StatsCard
          title="KALAN KREDİ"
          value={userCredits.toLocaleString()}
          icon="account_balance_wallet"
          iconColor="text-primary"
          badge={userCredits < 10 ? { text: 'DÜŞÜK', color: 'red' } : userCredits > 100 ? { text: 'İYİ', color: 'green' } : undefined}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Timeline & Recent Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <ScheduleTimeline
            jobs={stats?.recentJobs?.slice(0, 3).map(job => ({
              id: job.id,
              name: job.type,
              time: job.time,
              status: job.status === 'completed' ? 'success' : job.status === 'processing' ? 'processing' : 'queued',
              imageUrl: job.imageUrl // Üretilen görsel URL'i
            }))}
          />
          <RecentJobs
            jobs={stats?.recentJobs?.map(job => ({
              id: job.id,
              type: job.type,
              persona: job.details || 'user',
              status: job.status,
              time: job.time,
              imageUrl: job.imageUrl // Üretilen görsel URL'i
            }))}
            onViewHistory={onViewHistory}
          />
        </div>

        {/* Right Column - System Pulse */}
        <div className="space-y-6">
          <SystemPulse
            success={stats?.successCount || 0}
            failed={stats?.failedCount || 0}
            pending={stats?.pendingCount || 0}
            generationsByType={stats?.generationsByType}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
