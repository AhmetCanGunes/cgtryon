import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ChartDataPoint } from '../../../types';
import GlowCard from '../ui/GlowCard';

interface UserGrowthChartProps {
  data: ChartDataPoint[];
  title?: string;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold">
          {payload[0].value.toLocaleString('tr-TR')} kullanıcı
        </p>
      </div>
    );
  }
  return null;
};

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({
  data,
  title = 'Kullanıcı Büyümesi',
  loading = false
}) => {
  if (loading) {
    return (
      <GlowCard className="p-5 h-[300px]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 skeleton-shimmer" />
          <div className="h-5 w-32 rounded bg-[#2d2d3d] skeleton-shimmer" />
        </div>
        <div className="h-[220px] bg-[#2d2d3d]/50 rounded-lg skeleton-shimmer" />
      </GlowCard>
    );
  }

  return (
    <GlowCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp size={16} className="text-secondary" />
          </div>
          <h3 className="text-gray-100 font-semibold">{title}</h3>
        </div>
        <select className="bg-[#2a2a3e] text-gray-300 text-xs px-2 py-1 rounded-lg border border-[#3d3d4d] focus:outline-none focus:border-primary">
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
          <option value="90d">Son 90 Gün</option>
        </select>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#326789" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#326789" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={{ stroke: '#2d2d3d' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#326789"
              strokeWidth={2}
              fill="url(#userGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: '#326789',
                stroke: '#1f1f2e',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlowCard>
  );
};

export default UserGrowthChart;
