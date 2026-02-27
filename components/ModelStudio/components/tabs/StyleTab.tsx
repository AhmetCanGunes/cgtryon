import React, { useEffect, useState } from 'react';
import { cn } from '../../../../lib/utils';
import { StudioDropdown, SectionHeader, StudioButton } from '../shared';
import {
  GenerationSettings,
  AD_THEMES,
  AD_THEME_VARIATIONS
} from '../../../../types';

interface StyleTabProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
}

const SEASONS = [
  { label: 'Yaz', icon: '☀️' },
  { label: 'Sonbahar', icon: '🍂' },
  { label: 'Kis', icon: '❄️' }
];

const WEATHER_OPTIONS = [
  { label: 'Gunesli', icon: '☀️' },
  { label: 'Bulutlu', icon: '☁️' },
  { label: 'Yagmurlu', icon: '🌧️' },
  { label: 'Karli', icon: '❄️' }
];

const StyleTab: React.FC<StyleTabProps> = ({ settings, updateSetting }) => {
  const [sceneVariationOptions, setSceneVariationOptions] = useState<{ label: string; value: string }[]>([
    { label: 'Otomatik (Rastgele Sahne)', value: 'auto' }
  ]);

  // Update scene variation options when theme changes
  useEffect(() => {
    const currentTheme = settings.theme || AD_THEMES[0];
    const variations = AD_THEME_VARIATIONS[currentTheme] || [];
    const opts = [
      { label: 'Otomatik (AI Secer)', value: 'auto' },
      ...variations.map(v => ({ label: v.label, value: v.id }))
    ];
    setSceneVariationOptions(opts);
  }, [settings.theme]);

  return (
    <div className="p-3 space-y-2 bg-bg-surface">
      {/* Theme Selection */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-3">
        <label className="text-[11px] font-semibold text-gray-300 mb-2 block">Tema / Stil</label>

        <div className="space-y-2">
          <StudioDropdown
            label="Tema Seç"
            value={settings.theme || ''}
            options={['Tema Seçiniz', ...AD_THEMES]}
            onChange={(val) => updateSetting('theme', val === 'Tema Seçiniz' ? '' : val)}
            placeholder="Tema Seçiniz"
          />

          {settings.theme && AD_THEME_VARIATIONS[settings.theme] && AD_THEME_VARIATIONS[settings.theme].length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Varyasyon / Sahne</label>
              <select
                value={settings.sceneVariation || 'auto'}
                onChange={(e) => updateSetting('sceneVariation', e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 text-[11px] rounded-lg px-2 py-1.5 pr-7 focus:outline-none focus:border-primary text-gray-200"
              >
                {sceneVariationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-bg-elevated">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Season Selection */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-3">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 block">Mevsim (Opsiyonel)</label>
        <div className="grid grid-cols-3 gap-1.5">
          {SEASONS.map((season) => (
            <StudioButton
              key={season.label}
              variant="secondary"
              active={settings.season === season.label}
              onClick={() => updateSetting('season', settings.season === season.label ? 'Tum Mevsimler' : season.label)}
              className="flex items-center justify-center gap-1 py-1.5"
            >
              <span className="text-sm">{season.icon}</span>
              <span className="text-[10px] font-semibold">{season.label}</span>
            </StudioButton>
          ))}
        </div>
      </section>

      {/* Weather Selection */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-3">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 block">Hava Durumu (Opsiyonel)</label>
        <div className="grid grid-cols-4 gap-1.5">
          {WEATHER_OPTIONS.map((weather) => (
            <StudioButton
              key={weather.label}
              variant="secondary"
              active={settings.weather === weather.label}
              onClick={() => updateSetting('weather', settings.weather === weather.label ? 'Seciniz (Otomatik)' : weather.label)}
              className="flex flex-col items-center justify-center gap-0.5 py-1.5"
            >
              <span className="text-sm">{weather.icon}</span>
              <span className="text-[9px] font-semibold">{weather.label}</span>
            </StudioButton>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StyleTab;
