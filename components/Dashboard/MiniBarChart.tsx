import React from 'react';
import { cn } from '../../lib/utils';

interface MiniBarChartProps {
  data?: number[];
  color?: string;
  height?: number;
}

const MiniBarChart: React.FC<MiniBarChartProps> = ({
  data = [40, 60, 35, 80, 55, 70],
  color = 'bg-primary',
  height = 32,
}) => {
  const maxValue = Math.max(...data);

  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((value, index) => (
        <div
          key={index}
          className={cn('w-1.5 rounded-t-sm transition-all', color)}
          style={{ height: `${(value / maxValue) * 100}%` }}
        />
      ))}
    </div>
  );
};

export default MiniBarChart;
