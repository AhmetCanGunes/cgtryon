import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface StudioDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const StudioDropdown: React.FC<StudioDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = 'Seçiniz'
}) => {
  const isAutoValue = value.includes('Seciniz') || value.includes('Otomatik') || !value;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[10px] font-semibold text-gray-400">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full appearance-none bg-white/5 border border-white/10 text-[11px] rounded-lg',
            'px-2 py-1.5 pr-7 focus:outline-none focus:border-primary',
            'transition-all cursor-pointer',
            isAutoValue ? 'text-gray-500' : 'text-gray-200',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {!value && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-bg-elevated text-gray-200">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default StudioDropdown;
