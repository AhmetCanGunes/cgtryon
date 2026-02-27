import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  value: number;
  showIcon?: boolean;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  showIcon = true,
  showValue = true,
  size = 'sm',
  className = ''
}) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const getColorClasses = () => {
    if (isPositive) return 'text-emerald-400';
    if (isNegative) return 'text-red-400';
    return 'text-gray-400';
  };

  const getBgClasses = () => {
    if (isPositive) return 'bg-emerald-500/10';
    if (isNegative) return 'bg-red-500/10';
    return 'bg-gray-500/10';
  };

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getBgClasses()} ${getColorClasses()} ${sizeClasses[size]} font-medium ${className}`}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {showValue && (
        <span>
          {isPositive && '+'}
          {value.toFixed(1)}%
        </span>
      )}
    </div>
  );
};

export default TrendIndicator;
