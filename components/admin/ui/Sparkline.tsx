import React, { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  showDot?: boolean;
  className?: string;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 80,
  height = 24,
  color = '#326789',
  fillColor,
  strokeWidth = 1.5,
  showDot = true,
  className = ''
}) => {
  const { path, fillPath, points } = useMemo(() => {
    if (!data || data.length === 0) {
      return { path: '', fillPath: '', points: [] };
    }

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const pointsArray = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
      return { x, y };
    });

    const linePath = pointsArray
      .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
      .join(' ');

    const areaPath = `${linePath} L ${pointsArray[pointsArray.length - 1].x} ${height} L ${pointsArray[0].x} ${height} Z`;

    return { path: linePath, fillPath: areaPath, points: pointsArray };
  }, [data, width, height]);

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-xs">-</span>
      </div>
    );
  }

  const lastPoint = points[points.length - 1];
  const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fillColor || color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fillColor || color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path
        d={fillPath}
        fill={`url(#${gradientId})`}
      />

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      {showDot && lastPoint && (
        <>
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={3}
            fill={color}
          />
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={5}
            fill={color}
            opacity={0.3}
          />
        </>
      )}
    </svg>
  );
};

export default Sparkline;
