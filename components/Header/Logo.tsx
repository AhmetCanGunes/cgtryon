import React from 'react';

interface LogoProps {
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center neon-glow shrink-0">
        <span className="material-icons-round text-background-dark text-lg">auto_awesome</span>
      </div>
      <span className="hidden sm:block text-base font-bold tracking-tight text-white">
        CG<span className="text-primary">TRYON</span>
      </span>
    </button>
  );
};

export default Logo;
