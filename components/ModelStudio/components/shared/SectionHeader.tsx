import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-white/10">
      {Icon && (
        <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
          <Icon className="text-primary" size={10} />
        </div>
      )}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-200">{title}</h3>
        {subtitle && (
          <p className="text-[9px] text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
