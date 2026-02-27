import React from 'react';
import {
  UserPlus,
  LogIn,
  Image,
  Mail,
  CreditCard,
  ArrowUpCircle,
  Clock,
  Activity
} from 'lucide-react';
import { ActivityItem } from '../../../types';
import GlowCard from '../ui/GlowCard';

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
}

const activityIcons: Record<ActivityItem['type'], React.ReactNode> = {
  user_signup: <UserPlus size={14} />,
  user_login: <LogIn size={14} />,
  generation: <Image size={14} />,
  subscription: <Mail size={14} />,
  credit_purchase: <CreditCard size={14} />,
  plan_upgrade: <ArrowUpCircle size={14} />
};

const activityColors: Record<ActivityItem['type'], string> = {
  user_signup: 'bg-emerald-500/20 text-emerald-400',
  user_login: 'bg-blue-500/20 text-blue-400',
  generation: 'bg-primary/20 text-secondary',
  subscription: 'bg-amber-500/20 text-amber-400',
  credit_purchase: 'bg-emerald-500/20 text-emerald-400',
  plan_upgrade: 'bg-primary/20 text-secondary'
};

const activityLabels: Record<ActivityItem['type'], string> = {
  user_signup: 'Yeni Kayıt',
  user_login: 'Giriş Yaptı',
  generation: 'Görsel Üretti',
  subscription: 'Abone Oldu',
  credit_purchase: 'Kredi Satın Aldı',
  plan_upgrade: 'Plan Yükseltti'
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Az önce';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dk önce`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
  return date.toLocaleDateString('tr-TR');
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  maxItems = 6
}) => {
  const displayActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 skeleton-shimmer" />
          <div className="h-5 w-32 rounded bg-[#2d2d3d] skeleton-shimmer" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2d2d3d] skeleton-shimmer" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-[#2d2d3d] rounded skeleton-shimmer mb-2" />
                <div className="h-3 w-1/4 bg-[#2d2d3d] rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </GlowCard>
    );
  }

  return (
    <GlowCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Activity size={16} className="text-secondary" />
          </div>
          <h3 className="text-gray-100 font-semibold">Son Aktiviteler</h3>
        </div>
        <span className="text-xs text-gray-500">
          {activities.length} aktivite
        </span>
      </div>

      <div className="space-y-1">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Henüz aktivite yok</p>
          </div>
        ) : (
          displayActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={`activity-item py-3 animate-fade-in-up opacity-0`}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activityColors[activity.type]}`}
                >
                  {activityIcons[activity.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-100 text-sm font-medium truncate">
                      {activity.user || 'Anonim'}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${activityColors[activity.type]}`}
                    >
                      {activityLabels[activity.type]}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">
                    {activity.details}
                  </p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-gray-500 text-xs flex-shrink-0">
                  <Clock size={10} />
                  <span>{formatTimeAgo(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > maxItems && (
        <button className="w-full mt-4 py-2 text-sm text-secondary hover:text-secondary transition-colors">
          Tümünü Gör ({activities.length - maxItems} daha)
        </button>
      )}
    </GlowCard>
  );
};

export default ActivityFeed;
