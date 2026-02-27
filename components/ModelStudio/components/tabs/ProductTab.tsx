import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Check, BedDouble, Droplets, Camera, SunMedium } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { StudioDropdown, SectionHeader, StudioButton } from '../shared';
import {
  GenerationSettings,
  FRAMING_OPTIONS,
  TARGET_POSE_OPTIONS,
  BOUDOIR_POSE_CATEGORIES,
  BOUDOIR_LIGHTING_OPTIONS,
  BOUDOIR_CAMERA_ANGLE_OPTIONS
} from '../../../../types';

interface ProductTabProps {
  productImage: File | null;
  settings: GenerationSettings;
  onProductImageUpload: (file: File) => void;
  onRemoveProductImage: () => void;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  onSettingsChange?: (settings: GenerationSettings) => void;
}

const ProductTab: React.FC<ProductTabProps> = ({
  productImage,
  settings,
  onProductImageUpload,
  onRemoveProductImage,
  updateSetting,
  onSettingsChange
}) => {
  const productInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBoudoirCategory, setSelectedBoudoirCategory] = useState<string>(settings.boudoirCategory || '');

  const productPreviewUrl = productImage ? URL.createObjectURL(productImage) : null;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onProductImageUpload(file);
        e.dataTransfer.clearData();
      }
    }
  }, [onProductImageUpload]);

  const handleBoudoirCategoryChange = (cat: string) => {
    if (cat === 'Lutfen Seciniz' || !cat) {
      setSelectedBoudoirCategory('');
      updateSetting('modelPose', 'Seciniz (Otomatik)');
      updateSetting('boudoirCategory', '');
      return;
    }

    setSelectedBoudoirCategory(cat);
    updateSetting('modelPose', 'Lutfen Seciniz');
    updateSetting('boudoirCategory', cat);
  };

  const handleToggleBoudoir = () => {
    console.log('🔥 Boudoir button clicked! Current state:', settings.enableBoudoir);
    const newValue = !settings.enableBoudoir;
    console.log('🔥 New value will be:', newValue);

    setSelectedBoudoirCategory('');

    // Tek seferde tüm ayarları güncelle (React batching sorunu için)
    if (onSettingsChange) {
      const updatedSettings = newValue
        ? {
            ...settings,
            enableBoudoir: true,
            enableBoudoirMode: true,
            modelPose: 'Seciniz (Otomatik)',
            boudoirCategory: '',
            boudoirLighting: 'Karanlik & Atmosferik (Varsayilan)',
            boudoirCameraAngle: 'Otomatik (AI Secimi)'
          }
        : {
            ...settings,
            enableBoudoir: false,
            enableBoudoirMode: false,
            modelPose: 'Seciniz (Otomatik)',
            boudoirCategory: undefined,
            boudoirLighting: undefined,
            boudoirCameraAngle: undefined
          };

      onSettingsChange(updatedSettings);
      console.log('🔥 Boudoir toggle complete via onSettingsChange');
    } else {
      // Fallback - eski yöntem
      updateSetting('enableBoudoir', newValue);
      console.log('🔥 Boudoir toggle complete via updateSetting');
    }
  };

  return (
    <div className="p-3 space-y-2 bg-bg-surface">
      {/* Product Upload Section */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-3">
        <label className="text-[11px] font-semibold text-gray-300 mb-2 block">Ürün Görseli</label>

        <div
          className={cn(
            'studio-upload-zone relative h-20 flex items-center justify-center overflow-hidden group cursor-pointer rounded-lg',
            isDragging && 'dragging'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !productImage && productInputRef.current?.click()}
        >
          {productPreviewUrl ? (
            <>
              <img
                src={productPreviewUrl}
                alt="Product"
                className="h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); productInputRef.current?.click(); }}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white text-xs"
                >
                  <Upload size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveProductImage(); }}
                  className="p-1.5 bg-red-500/30 hover:bg-red-500/50 text-red-200 rounded text-xs"
                >
                  <X size={14} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-300">Görsel Yükle</p>
                <p className="text-[10px] text-gray-500">PNG veya JPG</p>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={productInputRef}
            onChange={(e) => e.target.files?.[0] && onProductImageUpload(e.target.files[0])}
            className="hidden"
            accept="image/*"
          />
        </div>
      </section>

      {/* Framing & Pose - Only shown when product is uploaded */}
      {productImage && (
        <>
          {/* Framing Options */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-3">
            <label className="text-[11px] font-semibold text-gray-300 mb-2 block">Kadraj</label>
            <div className="grid grid-cols-4 gap-1.5">
              {FRAMING_OPTIONS.map((option) => (
                <StudioButton
                  key={option}
                  variant="secondary"
                  active={settings.framing === option}
                  onClick={() => updateSetting('framing', option)}
                  className="py-2 text-[10px]"
                >
                  {option.split('(')[0].trim()}
                </StudioButton>
              ))}
            </div>
          </section>

          {/* Target Pose Options */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-3">
            <label className="text-[11px] font-semibold text-gray-300 mb-2 block">Poz</label>
            <div className="grid grid-cols-3 gap-1.5">
              {TARGET_POSE_OPTIONS.map((option) => (
                <StudioButton
                  key={option}
                  variant="secondary"
                  active={settings.targetPose === option}
                  onClick={() => updateSetting('targetPose', option)}
                  className="text-[10px] py-2"
                >
                  {option.split('(')[0].trim()}
                </StudioButton>
              ))}
            </div>
          </section>

          {/* Boudoir Toggle */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-3 relative z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleBoudoir();
              }}
              className={cn(
                'w-full p-2 rounded-lg border transition-all flex items-center gap-2 text-left cursor-pointer relative z-20',
                settings.enableBoudoir
                  ? 'bg-primary/20 border-primary/50'
                  : 'bg-white/5 border-white/10 hover:border-primary/30'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded flex items-center justify-center flex-shrink-0',
                settings.enableBoudoir
                  ? 'bg-primary text-white'
                  : 'bg-white/10 text-gray-400'
              )}>
                <BedDouble size={14} />
              </div>
              <span className={cn(
                'text-[11px] font-semibold flex-1',
                settings.enableBoudoir ? 'text-primary' : 'text-gray-300'
              )}>
                Boudoir Modu
              </span>
              {settings.enableBoudoir && <Check size={12} className="text-primary" />}
            </button>

            {/* Boudoir Settings Panel */}
            {settings.enableBoudoir && (
              <div className="mt-2 p-2 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <StudioDropdown
                    label="Çekim Ortamı"
                    value={selectedBoudoirCategory || ''}
                    options={['Lütfen Seçiniz', ...Object.keys(BOUDOIR_POSE_CATEGORIES)]}
                    onChange={handleBoudoirCategoryChange}
                  />

                  {selectedBoudoirCategory && selectedBoudoirCategory !== 'Lutfen Seciniz' && (
                    <StudioDropdown
                      label="Özel Poz"
                      value={settings.modelPose}
                      options={['Lütfen Seçiniz', ...(BOUDOIR_POSE_CATEGORIES[selectedBoudoirCategory] || [])]}
                      onChange={(val) => updateSetting('modelPose', val)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <StudioDropdown
                    label="Işık"
                    value={settings.boudoirLighting || BOUDOIR_LIGHTING_OPTIONS[0]}
                    options={BOUDOIR_LIGHTING_OPTIONS}
                    onChange={(val) => updateSetting('boudoirLighting', val)}
                  />
                  <StudioDropdown
                    label="Kamera Açısı"
                    value={settings.boudoirCameraAngle || BOUDOIR_CAMERA_ANGLE_OPTIONS[0]}
                    options={BOUDOIR_CAMERA_ANGLE_OPTIONS}
                    onChange={(val) => updateSetting('boudoirCameraAngle', val)}
                  />
                </div>

                {/* Wet Look Toggle */}
                <button
                  type="button"
                  onClick={() => updateSetting('enableWetLook', !settings.enableWetLook)}
                  className={cn(
                    'w-full p-1.5 rounded-lg border flex items-center gap-2 transition-all text-left cursor-pointer',
                    settings.enableWetLook
                      ? 'bg-primary/20 border-primary/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors',
                    settings.enableWetLook
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-gray-400'
                  )}>
                    <Droplets size={12} />
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold',
                    settings.enableWetLook ? 'text-primary' : 'text-gray-400'
                  )}>
                    Islak / Terli Efekt
                  </span>
                  {settings.enableWetLook && <Check size={10} className="ml-auto text-primary" />}
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default ProductTab;
