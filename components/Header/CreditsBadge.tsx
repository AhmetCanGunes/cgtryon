import React from 'react';
import { cn } from '../../lib/utils';

interface CreditsBadgeProps {
  credits: number;
  isAdmin: boolean;
  onClick: () => void;
}

const CreditsBadge: React.FC<CreditsBadgeProps> = ({ credits, isAdmin, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all',
        'bg-primary/10 border border-primary/20 hover:bg-primary/20'
      )}
      title={isAdmin ? 'Admin - Sınırsız Kredi' : 'Kredi Satın Al'}
    >
      <span className="material-icons-round text-primary text-base">toll</span>
      <span className={cn(
        'text-xs font-bold',
        isAdmin ? 'text-amber-500' : 'text-primary'
      )}>
        {isAdmin ? '∞' : credits}
      </span>
    </button>
  );
};

export default CreditsBadge;
