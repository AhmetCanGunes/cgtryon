import React from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  color?: 'violet' | 'emerald' | 'amber' | 'blue' | 'red';
  glowOnHover?: boolean;
  className?: string;
  onClick?: () => void;
}

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  color = 'violet',
  glowOnHover = true,
  className = '',
  onClick
}) => {
  const glowClasses = {
    violet: 'hover:glow-primary',
    emerald: 'hover:glow-emerald',
    amber: 'hover:glow-amber',
    blue: 'hover:glow-blue',
    red: 'hover:glow-red'
  };

  const borderClasses = {
    violet: 'hover:border-primary/30',
    emerald: 'hover:border-emerald-500/30',
    amber: 'hover:border-amber-500/30',
    blue: 'hover:border-blue-500/30',
    red: 'hover:border-red-500/30'
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-bg-elevated
        border border-border-default
        rounded-xl
        transition-all duration-300
        ${glowOnHover ? glowClasses[color] : ''}
        ${borderClasses[color]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlowCard;
