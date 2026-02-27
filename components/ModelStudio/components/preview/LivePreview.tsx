import React from 'react';
import { Eye, X, ImageOff } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { GenerationSettings } from '../../../../types';
import ModelSilhouette from './ModelSilhouette';
import SettingsSummary from './SettingsSummary';

interface LivePreviewProps {
  productImage: File | null;
  settings: GenerationSettings;
  onClose: () => void;
}

const LivePreview: React.FC<LivePreviewProps> = ({ productImage, settings, onClose }) => {
  const productPreviewUrl = productImage ? URL.createObjectURL(productImage) : null;

  // Determine aspect ratio for preview
  const getAspectRatioClass = () => {
    switch (settings.aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '3:4':
        return 'aspect-[3/4]';
      case '9:16':
        return 'aspect-[9/16]';
      default:
        return 'aspect-[3/4]';
    }
  };

  return (
    <div className="studio-preview h-full flex flex-col animate-slide-in-right-panel">
      {/* Header */}
      <div className="studio-preview-header">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-[var(--studio-text-muted)]" />
          <span className="text-xs font-medium text-[var(--studio-text-secondary)] uppercase tracking-wider">
            Onizleme
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[var(--studio-hover)] transition-colors text-[var(--studio-text-muted)] hover:text-[var(--studio-text-primary)]"
          title="Onizlemeyi Kapat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div
          className={cn(
            'w-full max-w-[200px] bg-[var(--studio-card)] rounded-xl border border-[var(--studio-border)] overflow-hidden relative',
            getAspectRatioClass()
          )}
        >
          {/* Model Silhouette - Base layer */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ModelSilhouette gender={settings.gender} pose={settings.targetPose} />
          </div>

          {/* Product Overlay - On top of silhouette */}
          {productPreviewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={productPreviewUrl}
                alt="Product"
                className="max-w-full max-h-full object-contain opacity-90 drop-shadow-lg"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--studio-text-muted)]">
              <ImageOff size={32} className="mb-2 opacity-30" />
              <p className="text-[10px] text-center px-4">
                Urun gorseli yuklendiginde burada gorunecek
              </p>
            </div>
          )}

          {/* Format Badge */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[9px] text-white font-medium">
            {settings.aspectRatio || '1:1'}
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      <SettingsSummary settings={settings} />
    </div>
  );
};

export default LivePreview;
