import React from 'react';
import { cn } from '../../../../lib/utils';

interface StudioButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  active?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const StudioButton: React.FC<StudioButtonProps> = ({
  children,
  variant = 'secondary',
  active = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button'
}) => {
  const baseStyles = 'px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5';

  const variantStyles = {
    primary: cn(
      'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20',
      disabled && 'opacity-50 cursor-not-allowed'
    ),
    secondary: cn(
      'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20',
      active && 'bg-primary/20 text-primary border-primary/40 hover:bg-primary/25'
    ),
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </button>
  );
};

export default StudioButton;
