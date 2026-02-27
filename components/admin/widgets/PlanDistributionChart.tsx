import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Users } from 'lucide-react';
import GlowCard from '../ui/GlowCard';

interface PlanDistributionChartProps {
  data: {
    free: number;
    pro: number;
    enterprise: number;
  };
  loading?: boolean;
}

const COLORS = {
  free: '#6b7280',
  pro: '#326789',
  enterprise: '#f59e0b'
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 shadow-xl">
        <p className="text-gray-100 font-semibold">
          {data.name}: {data.value}
        </p>
        <p className="text-gray-400 text-xs">
          {((data.value / data.payload.total) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-400 text-sm">{entry.value}</span>
          </div>
          <span className="text-gray-100 font-semibold text-sm">
            {entry.payload.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const PlanDistributionChart: React.FC<PlanDistributionChartProps> = ({
  data,
  loading = false
}) => {
  const total = data.free + data.pro + data.enterprise;

  const chartData = [
    { name: 'Free', value: data.free, total },
    { name: 'Pro', value: data.pro, total },
    { name: 'Enterprise', value: data.enterprise, total }
  ];

  if (loading) {
    return (
      <GlowCard className="p-5 h-[300px]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 skeleton-shimmer" />
          <div className="h-5 w-32 rounded bg-[#2d2d3d] skeleton-shimmer" />
        </div>
        <div className="flex items-center justify-center h-[220px]">
          <div className="w-36 h-36 rounded-full bg-[#2d2d3d]/50 skeleton-shimmer" />
        </div>
      </GlowCard>
    );
  }

  return (
    <GlowCard color="amber" className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Users size={16} className="text-amber-400" />
        </div>
        <h3 className="text-gray-100 font-semibold">Plan Dağılımı</h3>
      </div>

      <div className="h-[240px] flex items-center">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={Object.values(COLORS)[index]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 pl-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-gray-400 text-sm">Free</span>
              </div>
              <div className="text-right">
                <span className="text-gray-100 font-semibold">{data.free}</span>
                <span className="text-gray-500 text-xs ml-1">
                  ({total > 0 ? ((data.free / total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-gray-400 text-sm">Pro</span>
              </div>
              <div className="text-right">
                <span className="text-gray-100 font-semibold">{data.pro}</span>
                <span className="text-gray-500 text-xs ml-1">
                  ({total > 0 ? ((data.pro / total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-400 text-sm">Enterprise</span>
              </div>
              <div className="text-right">
                <span className="text-gray-100 font-semibold">{data.enterprise}</span>
                <span className="text-gray-500 text-xs ml-1">
                  ({total > 0 ? ((data.enterprise / total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-border-default">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Toplam</span>
                <span className="text-gray-100 font-bold">{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlowCard>
  );
};

export default PlanDistributionChart;
