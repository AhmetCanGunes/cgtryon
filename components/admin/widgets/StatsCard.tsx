import React from 'react';
import {
  Users,
  ImageIcon,
  CreditCard,
  Mail,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity
} from 'lucide-react';
import { StatCardData } from '../../../types';
import GlowCard from '../ui/GlowCard';
import AnimatedNumber from '../ui/AnimatedNumber';
import TrendIndicator from '../ui/TrendIndicator';
import Sparkline from '../ui/Sparkline';

interface StatsCardProps {
  data: StatCardData;
  loading?: boolean;
  animationDelay?: number;
}

const iconMap: Record<string, React.ReactNode> = {
  users: <Users size={20} />,
  image: <ImageIcon size={20} />,
  credit: <CreditCard size={20} />,
  mail: <Mail size={20} />,
  dollar: <DollarSign size={20} />,
  activity: <Activity size={20} />
};

const colorClasses = {
  violet: {
    bg: 'bg-primary/20',
    text: 'text-secondary',
    glow: 'glow-primary'
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'glow-emerald'
  },
  amber: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    glow: 'glow-amber'
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    glow: 'glow-blue'
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    glow: 'glow-red'
  }
};

const sparklineColors = {
  violet: '#326789',
  emerald: '#10b981',
  amber: '#f59e0b',
  blue: '#3b82f6',
  red: '#ef4444'
};

const StatsCard: React.FC<StatsCardProps> = ({
  data,
  loading = false,
  animationDelay = 0
}) => {
  // Fallback to violet if color is not defined
  const colorKey = data.color && colorClasses[data.color] ? data.color : 'violet';
  const colors = colorClasses[colorKey];
  const sparklineColor = sparklineColors[colorKey];

  if (loading) {
    return (
      <GlowCard className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-4 w-24 bg-border-default rounded skeleton-shimmer mb-2" />
            <div className="h-8 w-16 bg-border-default rounded skeleton-shimmer" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-border-default skeleton-shimmer" />
        </div>
        <div className="mt-4 h-6 w-full bg-border-default rounded skeleton-shimmer" />
      </GlowCard>
    );
  }

  return (
    <GlowCard
      color={data.color}
      className={`p-5 animate-fade-in-up opacity-0`}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' } as React.CSSProperties}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{data.title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-100">
              <AnimatedNumber
                value={data.value}
                format={data.format}
                decimals={data.format === 'currency' ? 2 : 0}
              />
            </span>
            {data.trend !== undefined && (
              <TrendIndicator value={data.trend} size="sm" />
            )}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
          {iconMap[data.icon] || <Activity size={20} />}
        </div>
      </div>

      {data.sparklineData && data.sparklineData.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-default">
          <Sparkline
            data={data.sparklineData}
            color={sparklineColor}
            width={200}
            height={32}
            className="w-full"
          />
        </div>
      )}
    </GlowCard>
  );
};

export default StatsCard;
