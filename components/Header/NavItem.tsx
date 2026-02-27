import React from 'react';
import { cn } from '../../lib/utils';

interface NavItemProps {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  label,
  icon,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 whitespace-nowrap',
        isActive
          ? 'bg-primary text-background-dark shadow-sm'
          : 'text-slate-400 hover:text-white'
      )}
    >
      <span className="material-icons-round text-xs">{icon}</span>
      {label}
    </button>
  );
};

export default NavItem;
