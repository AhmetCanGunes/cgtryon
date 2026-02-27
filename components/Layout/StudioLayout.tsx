import React from 'react';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { cn } from '../../lib/utils';

interface StudioLayoutProps {
  // Left Panel - Settings/Controls
  leftPanel: React.ReactNode;
  leftPanelTitle?: string;
  leftPanelIcon?: string;

  // Center Panel - Output/Preview
  centerPanel: React.ReactNode;

  // Right Panel - Assets (Models, Garments, etc.)
  rightPanel?: React.ReactNode;
  rightPanelTitle?: string;
  rightPanelIcon?: string;

  // Optional: Hide right panel
  hideRightPanel?: boolean;
}

const StudioLayout: React.FC<StudioLayoutProps> = ({
  leftPanel,
  leftPanelTitle = 'Ayarlar',
  leftPanelIcon = 'tune',
  centerPanel,
  rightPanel,
  rightPanelTitle = 'Görseller',
  rightPanelIcon = 'collections',
  hideRightPanel = false,
}) => {
  return (
    <div className="flex h-full w-full bg-background-dark overflow-hidden">
      {/* LEFT PANEL - Settings */}
      <div className="w-72 xl:w-80 flex-shrink-0 border-r border-border-dark bg-card-dark flex flex-col h-full">
        {/* Header */}
        <div className="h-12 px-4 flex items-center gap-2 border-b border-border-dark shrink-0">
          <span className="material-icons-round text-primary text-lg">{leftPanelIcon}</span>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">{leftPanelTitle}</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {leftPanel}
        </div>
      </div>

      {/* CENTER PANEL - Output/Preview */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-background-dark">
        {centerPanel}
      </div>

      {/* RIGHT PANEL - Assets */}
      {!hideRightPanel && rightPanel && (
        <div className="w-72 xl:w-80 flex-shrink-0 border-l border-border-dark bg-card-dark flex flex-col h-full">
          {/* Header */}
          <div className="h-12 px-4 flex items-center gap-2 border-b border-border-dark shrink-0">
            <span className="material-icons-round text-primary text-lg">{rightPanelIcon}</span>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">{rightPanelTitle}</h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {rightPanel}
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Section Component
export const StudioSection: React.FC<{
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}> = ({ title, icon, children, className, collapsible = false, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn('border-b border-border-dark', className)}>
      <button
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-3 flex items-center justify-between',
          collapsible && 'hover:bg-white/5 transition-colors cursor-pointer'
        )}
        disabled={!collapsible}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="material-icons-round text-slate-400 text-sm">{icon}</span>}
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">{title}</span>
        </div>
        {collapsible && (
          <span className={cn('material-icons-round text-slate-500 text-sm transition-transform', !isOpen && '-rotate-90')}>
            expand_more
          </span>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Reusable Upload Box Component
export const UploadBox: React.FC<{
  image: File | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  icon?: string;
  label: string;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  badge?: string | number;
}> = ({ image, onUpload, onRemove, icon = 'add_photo_alternate', label, accentColor = 'primary', size = 'md', badge }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const colorClasses: Record<string, { ring: string; border: string; bg: string; text: string }> = {
    primary: { ring: 'ring-primary', border: 'border-primary/50 hover:border-primary', bg: 'bg-primary', text: 'text-primary' },
    blue: { ring: 'ring-mode-accent', border: 'border-mode-accent/50 hover:border-mode-accent', bg: 'bg-mode-accent', text: 'text-mode-accent' },
    violet: { ring: 'ring-mode-accent', border: 'border-mode-accent/50 hover:border-mode-accent', bg: 'bg-mode-accent', text: 'text-mode-accent' },
    amber: { ring: 'ring-mode-accent', border: 'border-mode-accent/50 hover:border-mode-accent', bg: 'bg-mode-accent', text: 'text-mode-accent' },
    green: { ring: 'ring-green-500', border: 'border-green-500/50 hover:border-green-500', bg: 'bg-green-500', text: 'text-green-400' },
    slate: { ring: 'ring-slate-500', border: 'border-slate-500/50 hover:border-slate-500', bg: 'bg-slate-500', text: 'text-slate-400' },
  };

  const colors = colorClasses[accentColor] || colorClasses.primary;

  const imagePreview = useBlobUrl(image);

  if (image && imagePreview) {
    return (
      <div className={cn('relative group flex-shrink-0', sizeClasses[size])}>
        <img
          src={imagePreview}
          alt={label}
          className={cn('w-full h-full object-cover rounded-xl ring-2', colors.ring)}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
        >
          <span className="material-icons-round text-white text-lg">upload</span>
        </button>
        <button
          onClick={onRemove}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <span className="material-icons-round text-white text-xs">close</span>
        </button>
        {badge !== undefined && (
          <span className={cn('absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold shadow-lg', colors.bg)}>
            {badge}
          </span>
        )}
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => inputRef.current?.click()}
      className={cn(
        'rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all',
        colors.border,
        colors.text,
        sizeClasses[size]
      )}
    >
      <span className="material-icons-round text-xl">{icon}</span>
      <span className="text-[9px] mt-1 font-medium">{label}</span>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
      />
    </button>
  );
};

// Reusable Select/Dropdown Component
export const StudioSelect: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  icon?: string;
}> = ({ label, value, onChange, options, icon }) => {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon && <span className="material-icons-round text-xs">{icon}</span>}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-xs text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

// Generate Button Component
export const GenerateButton: React.FC<{
  onClick: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  label?: string;
  credits?: number;
}> = ({ onClick, isGenerating, disabled = false, label = 'Oluştur', credits }) => {
  return (
    <div className="p-4 border-t border-border-dark">
      <button
        onClick={onClick}
        disabled={disabled || isGenerating}
        className={cn(
          'w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
          disabled || isGenerating
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-primary text-background-dark hover:opacity-90 hover:scale-[1.02]'
        )}
      >
        {isGenerating ? (
          <>
            <span className="material-icons-round animate-spin text-lg">refresh</span>
            <span>Oluşturuluyor...</span>
          </>
        ) : (
          <>
            <span className="material-icons-round text-lg">auto_awesome</span>
            <span>{label}</span>
            {credits !== undefined && (
              <span className="ml-1 px-2 py-0.5 bg-black/20 rounded-full text-[10px]">
                {credits} Kredi
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

// Preview/Output Component
export const OutputPreview: React.FC<{
  images: { id: string; url: string }[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onDownload?: () => void;
  onDownloadAll?: () => void;
  isGenerating?: boolean;
  emptyIcon?: string;
  emptyText?: string;
}> = ({
  images,
  currentIndex,
  onIndexChange,
  onDownload,
  onDownloadAll,
  isGenerating = false,
  emptyIcon = 'image',
  emptyText = 'Önizleme burada görünecek'
}) => {
  const currentImage = images[currentIndex];

  return (
    <div className="flex-1 flex flex-col h-full p-4">
      {/* Main Preview */}
      <div className="flex-1 flex items-center justify-center bg-card-dark rounded-xl border border-border-dark overflow-hidden relative">
        {isGenerating ? (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-border-dark border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">Görsel oluşturuluyor...</p>
          </div>
        ) : currentImage ? (
          <img
            src={currentImage.url}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-center text-slate-500">
            <span className="material-icons-round text-4xl mb-2">{emptyIcon}</span>
            <p className="text-xs">{emptyText}</p>
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-all"
            >
              <span className="material-icons-round text-lg">chevron_left</span>
            </button>
            <button
              onClick={() => onIndexChange(Math.min(images.length - 1, currentIndex + 1))}
              disabled={currentIndex === images.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-all"
            >
              <span className="material-icons-round text-lg">chevron_right</span>
            </button>
          </>
        )}
      </div>

      {/* Toolbar */}
      {images.length > 0 && (
        <div className="mt-3 flex items-center justify-between">
          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {images.slice(0, 8).map((img, idx) => (
              <button
                key={img.id}
                onClick={() => onIndexChange(idx)}
                className={cn(
                  'w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all',
                  currentIndex === idx ? 'ring-2 ring-primary' : 'ring-1 ring-border-dark hover:ring-slate-500'
                )}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-3 shrink-0">
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-3 py-1.5 bg-card-dark border border-border-dark rounded-lg text-xs text-slate-300 hover:text-white hover:border-slate-500 transition-all flex items-center gap-1.5"
              >
                <span className="material-icons-round text-sm">download</span>
                İndir
              </button>
            )}
            {onDownloadAll && images.length > 1 && (
              <button
                onClick={onDownloadAll}
                className="px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-xs text-primary hover:bg-primary/20 transition-all flex items-center gap-1.5"
              >
                <span className="material-icons-round text-sm">folder_zip</span>
                Tümünü İndir
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioLayout;
