import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ImageIcon } from 'lucide-react';
import { ChartDataPoint } from '../../../types';
import GlowCard from '../ui/GlowCard';

interface GenerationsChartProps {
  data: ChartDataPoint[];
  title?: string;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-emerald-400 font-semibold">
          {payload[0].value.toLocaleString('tr-TR')} üretim
        </p>
      </div>
    );
  }
  return null;
};

const GenerationsChart: React.FC<GenerationsChartProps> = ({
  data,
  title = 'Üretim Trendi',
  loading = false
}) => {
  if (loading) {
    return (
      <GlowCard className="p-5 h-[300px]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 skeleton-shimmer" />
          <div className="h-5 w-32 rounded bg-[#2d2d3d] skeleton-shimmer" />
        </div>
        <div className="h-[220px] bg-[#2d2d3d]/50 rounded-lg skeleton-shimmer" />
      </GlowCard>
    );
  }

  return (
    <GlowCard color="emerald" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <ImageIcon size={16} className="text-emerald-400" />
          </div>
          <h3 className="text-gray-100 font-semibold">{title}</h3>
        </div>
        <select className="bg-[#2a2a3e] text-gray-300 text-xs px-2 py-1 rounded-lg border border-[#3d3d4d] focus:outline-none focus:border-emerald-500">
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
          <option value="90d">Son 90 Gün</option>
        </select>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === data.length - 1 ? '#10b981' : '#10b98180'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlowCard>
  );
};

export default GenerationsChart;
