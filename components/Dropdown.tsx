import React from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  tooltip?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, value, options, onChange, disabled, tooltip }) => {
  // Check if current value is "auto" or "default" (contains Seçiniz, Otomatik, or is exactly "Seçiniz")
  const isAutoValue = value === 'Seçiniz' || value.includes('Seçiniz') || value.includes('Otomatik') || value === 'auto';

  return (
    <div className="flex flex-col gap-1.5" title={tooltip}>
      <label className={`text-[11px] uppercase tracking-wider text-slate-500 font-semibold ml-0.5 ${disabled ? 'opacity-50' : ''}`}>
        {label}
      </label>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none bg-white/5 border border-border-default text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-mode-accent focus:ring-1 focus:ring-mode-accent transition-all cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border-strong hover:bg-white/7'
          } ${
            isAutoValue ? 'text-slate-500 italic' : 'text-slate-200'
          }`}
        >
          {options.map((opt) => {
            const isAutoOption = opt === 'Seçiniz' || opt.includes('Seçiniz') || opt.includes('Otomatik') || opt === 'auto';
            return (
              <option
                key={opt}
                value={opt}
                className={`bg-bg-elevated ${isAutoOption ? 'text-slate-500 italic' : 'text-slate-200'}`}
              >
                {opt}
              </option>
            );
          })}
        </select>
        <div className={`absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500 group-hover:text-slate-300 transition-colors ${disabled ? 'opacity-50' : ''}`}>
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
