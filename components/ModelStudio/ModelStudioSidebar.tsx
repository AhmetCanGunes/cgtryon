import React, { useCallback, useMemo, useState } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GenerationSettings, GeneratedImage, LoadingState, PresetModel } from '../../types';
import { useTabNavigation } from './hooks';
import { TabNavigation, TabId } from './components/shared';
import { ProductTab, ModelTab, StyleTab, OutputTab } from './components/tabs';

interface ModelStudioSidebarProps {
  productImage: File | null;
  settings: GenerationSettings;
  onProductImageUpload: (file: File) => void;
  onRemoveProductImage: () => void;
  onSettingsChange: (newSettings: GenerationSettings) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  currentTask: LoadingState;
  onSaveSettings: () => void;
  generatedImages: GeneratedImage[];
  selectedPresetModel?: PresetModel | null;
  onPresetModelSelect?: (model: PresetModel | null) => void;
}

const ModelStudioSidebar: React.FC<ModelStudioSidebarProps> = ({
  productImage,
  settings,
  onProductImageUpload,
  onRemoveProductImage,
  onSettingsChange,
  onGenerate,
  isGenerating,
  selectedPresetModel,
  onPresetModelSelect
}) => {
  const { activeTab, switchTab } = useTabNavigation('product');

  const updateSetting = useCallback(<K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  }, [settings, onSettingsChange]);

  // Hangi tab'ların tamamlandığını hesapla
  const completedTabs = useMemo(() => {
    const completed: TabId[] = [];

    // Ürün tab'ı - ürün yüklendi mi?
    if (productImage) {
      completed.push('product');
    }

    // Manken tab'ı - hazır manken veya cinsiyet seçildi mi?
    if (selectedPresetModel || settings.gender) {
      completed.push('model');
    }

    // Stil tab'ı - arka plan seçildi mi?
    if (settings.background) {
      completed.push('style');
    }

    // Çıktı tab'ı - en az bir çıktı ayarı yapıldı mı (her zaman varsayılan değerler var)
    if (settings.outputCount && settings.aspectRatio) {
      completed.push('output');
    }

    return completed;
  }, [productImage, settings, selectedPresetModel]);

  // Validasyon - tüm gerekli alanlar dolu mu?
  const canGenerate = useMemo(() => {
    const hasModel = selectedPresetModel || settings.gender;
    return productImage && hasModel && settings.background;
  }, [productImage, settings.gender, settings.background, selectedPresetModel]);

  // Eksik alanları bul
  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!productImage) missing.push('Ürün görseli');
    if (!selectedPresetModel && !settings.gender) missing.push('Manken seçimi');
    if (!settings.background) missing.push('Arka plan');
    return missing;
  }, [productImage, settings.gender, settings.background, selectedPresetModel]);

  const tabContent = {
    product: (
      <ProductTab
        productImage={productImage}
        settings={settings}
        onProductImageUpload={onProductImageUpload}
        onRemoveProductImage={onRemoveProductImage}
        updateSetting={updateSetting}
        onSettingsChange={onSettingsChange}
      />
    ),
    model: (
      <ModelTab
        settings={settings}
        updateSetting={updateSetting}
        selectedPresetModel={selectedPresetModel}
        onPresetModelSelect={onPresetModelSelect}
      />
    ),
    style: (
      <StyleTab
        settings={settings}
        updateSetting={updateSetting}
      />
    ),
    output: (
      <OutputTab
        settings={settings}
        updateSetting={updateSetting}
      />
    )
  };

  return (
    <aside className="flex h-full">
      {/* Settings Panel - Dark Theme */}
      <div className="w-[420px] flex flex-col bg-bg-surface border-r border-white/10">
        {/* Tab Navigation */}
        <div className="flex-shrink-0">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={switchTab}
            completedTabs={completedTabs}
          />
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {tabContent[activeTab]}
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 p-3 border-t border-white/10 bg-bg-surface space-y-2">
          {/* Validation Warning */}
          {!canGenerate && missingFields.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
              <p className="text-[10px] text-amber-400/80">{missingFields.join(', ')}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className={cn(
              'w-full py-3 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all',
              !canGenerate || isGenerating
                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-md shadow-primary/20'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Oluşturuluyor...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Model Oluştur</span>
                <span className="ml-1 text-[10px] opacity-70">({settings.outputCount || 1} kredi)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ModelStudioSidebar;
