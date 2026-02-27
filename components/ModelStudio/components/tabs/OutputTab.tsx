import React from 'react';
import { cn } from '../../../../lib/utils';
import { StudioButton } from '../shared';
import { GenerationSettings } from '../../../../types';

interface OutputTabProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
}

const ASPECT_RATIOS = [
  { label: 'Kare', ratio: '1:1', icon: '⬜', description: 'Instagram Post' },
  { label: 'Dikey', ratio: '3:4', icon: '📱', description: 'Akis Gorseli' },
  { label: 'Hikaye', ratio: '9:16', icon: '📲', description: 'Story/Reels' }
];

const IMAGE_COUNTS = [1, 2, 3, 4];

const OutputTab: React.FC<OutputTabProps> = ({ settings, updateSetting }) => {
  return (
    <div className="p-3 space-y-2 bg-bg-surface">
      {/* Aspect Ratio */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-3">
        <label className="text-[11px] font-semibold text-gray-300 mb-2 block">Format & Boyut</label>

        <div className="grid grid-cols-3 gap-2">
          {ASPECT_RATIOS.map((format) => (
            <button
              key={format.ratio}
              onClick={() => updateSetting('aspectRatio', format.ratio)}
              className={cn(
                'flex flex-col items-center justify-center py-2 rounded-lg transition-all',
                settings.aspectRatio === format.ratio
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-primary/50'
              )}
            >
              <span className="text-base mb-0.5">{format.icon}</span>
              <span className="text-[10px] font-bold">{format.label}</span>
              <span className="text-[9px] opacity-70">({format.ratio})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Image Count */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-3">
        <label className="text-[11px] font-semibold text-gray-300 mb-2 block">Görsel Sayısı</label>

        <div className="grid grid-cols-4 gap-1.5">
          {IMAGE_COUNTS.map((count) => (
            <StudioButton
              key={count}
              variant="secondary"
              active={settings.numberOfImages === count}
              onClick={() => updateSetting('numberOfImages', count)}
              className="text-sm font-bold py-2"
            >
              {count}
            </StudioButton>
          ))}
        </div>
        <p className="text-[9px] text-gray-500 text-center mt-1">
          Her görsel için 1 kredi
        </p>
      </section>

      {/* Custom Prompt */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-3">
        <label className="text-[11px] font-semibold text-gray-300 mb-2 block">Özel Prompt</label>
        <textarea
          value={settings.customPrompt || ''}
          onChange={(e) => updateSetting('customPrompt', e.target.value)}
          placeholder="Çıktıya eklemek istediğiniz özel detayları yazın..."
          className="w-full bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 resize-none h-14 focus:border-primary focus:outline-none placeholder-gray-500"
        />
      </section>

      {/* Output Summary */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-2">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-3">
            <span className="text-gray-500">Format: <span className="text-gray-300">{settings.aspectRatio || '1:1'}</span></span>
            <span className="text-gray-500">Adet: <span className="text-gray-300">{settings.numberOfImages || 1}</span></span>
          </div>
          <span className="text-secondary font-bold">{settings.numberOfImages || 1} kredi</span>
        </div>
      </section>
    </div>
  );
};

export default OutputTab;
