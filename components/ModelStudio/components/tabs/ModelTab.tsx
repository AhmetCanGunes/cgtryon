import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { StudioDropdown, SectionHeader, StudioButton, PresetModelSelector } from '../shared';
import {
  GenerationSettings,
  GENDER_OPTIONS,
  AGE_OPTIONS,
  ETHNICITY_OPTIONS,
  HAIR_COLOR_OPTIONS,
  SKIN_TONE_OPTIONS,
  BODY_TYPE_OPTIONS,
  HEIGHT_OPTIONS,
  LIPSTICK_COLOR_OPTIONS,
  NAIL_POLISH_OPTIONS,
  PresetModel
} from '../../../../types';

interface ModelTabProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  selectedPresetModel?: PresetModel | null;
  onPresetModelSelect?: (model: PresetModel | null) => void;
}

const ModelTab: React.FC<ModelTabProps> = ({
  settings,
  updateSetting,
  selectedPresetModel,
  onPresetModelSelect
}) => {
  const [modelMode, setModelMode] = useState<'preset' | 'custom'>('preset');
  const [presetGender, setPresetGender] = useState<'female' | 'male'>('female');

  return (
    <div className="p-3 space-y-2 bg-bg-surface">
      {/* Model Mode Toggle */}
      <section className="bg-gradient-to-r from-primary/10 to-pink-500/10 border border-primary/30 rounded-lg p-3">
        <label className="text-[11px] font-semibold text-gray-300 mb-2 block flex items-center gap-2">
          <Sparkles size={12} className="text-primary" />
          Model Seçim Modu
        </label>
        <div className="grid grid-cols-2 gap-2">
          <StudioButton
            variant="secondary"
            active={modelMode === 'preset'}
            onClick={() => setModelMode('preset')}
            className="text-[10px] py-2"
          >
            Hazır Mankenler
          </StudioButton>
          <StudioButton
            variant="secondary"
            active={modelMode === 'custom'}
            onClick={() => {
              setModelMode('custom');
              onPresetModelSelect?.(null);
            }}
            className="text-[10px] py-2"
          >
            Özel Ayarlar
          </StudioButton>
        </div>
      </section>

      {/* Preset Model Selector */}
      {modelMode === 'preset' && onPresetModelSelect && (
        <section className="bg-white/5 border border-white/10 rounded-lg p-3">
          <PresetModelSelector
            selectedModelId={selectedPresetModel?.id || null}
            onSelectModel={onPresetModelSelect}
            gender={presetGender}
            onGenderChange={setPresetGender}
          />
        </section>
      )}

      {/* Custom Settings - Only show when in custom mode */}
      {modelMode === 'custom' && (
        <>
          {/* Basic Settings */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-3">
            <label className="text-[11px] font-semibold text-gray-300 mb-2 block">Temel Özellikler</label>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <StudioDropdown
                  label="Cinsiyet"
                  value={settings.gender}
                  options={GENDER_OPTIONS}
                  onChange={(val) => updateSetting('gender', val)}
                />
                <StudioDropdown
                  label="Yas Grubu"
                  value={settings.age}
                  options={AGE_OPTIONS}
                  onChange={(val) => updateSetting('age', val)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StudioDropdown
                  label="Ulke / Koken"
                  value={settings.ethnicity}
                  options={ETHNICITY_OPTIONS}
                  onChange={(val) => updateSetting('ethnicity', val)}
                />
                <StudioDropdown
                  label="Sac Rengi"
                  value={settings.hairColor || 'Seciniz'}
                  options={HAIR_COLOR_OPTIONS}
                  onChange={(val) => updateSetting('hairColor', val)}
                />
              </div>
            </div>
          </section>

          {/* Skin Tone Selector */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-3">
            <label className="text-[10px] font-semibold text-gray-300 mb-1.5 block">Ten Rengi</label>
            <div className="grid grid-cols-8 gap-1">
              {SKIN_TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => updateSetting('skinTone', tone.id)}
                  title={`${tone.name} - ${tone.description}`}
                  className={cn(
                    'relative w-full aspect-square rounded transition-all border',
                    (settings.skinTone || 'auto') === tone.id
                      ? 'border-primary ring-1 ring-primary/30 scale-105 z-10'
                      : 'border-white/20 hover:border-primary/50'
                  )}
                  style={{ backgroundColor: tone.hex }}
                >
                  {(settings.skinTone || 'auto') === tone.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check
                        size={10}
                        className={cn(
                          'drop-shadow',
                          tone.id === 'fair' || tone.id === 'light' ? 'text-gray-700' : 'text-white'
                        )}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Body Type & Height */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-3">
            <label className="text-[11px] font-semibold text-gray-300 mb-2 block">Vücut Özellikleri</label>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <StudioDropdown
                  label="Vucut Tipi"
                  value={settings.bodyType}
                  options={BODY_TYPE_OPTIONS}
                  onChange={(val) => updateSetting('bodyType', val)}
                />
                <StudioDropdown
                  label="Boy Uzunlugu"
                  value={settings.height}
                  options={HEIGHT_OPTIONS}
                  onChange={(val) => updateSetting('height', val)}
                />
              </div>

              {/* Hair Length */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-400">Saç Uzunluğu</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Kisa', 'Orta', 'Uzun'].map((length) => (
                    <StudioButton
                      key={length}
                      variant="secondary"
                      active={settings.hairLength === length}
                      onClick={() => updateSetting('hairLength', length)}
                      className="text-[10px] py-1.5"
                    >
                      {length}
                    </StudioButton>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Female-only Makeup Options */}
          {settings.gender === 'Kadin' && (
            <section className="bg-white/5 border border-white/10 rounded-lg p-3">
              <label className="text-[11px] font-semibold text-gray-300 mb-2 block">Makyaj</label>

              <div className="grid grid-cols-2 gap-2">
                <StudioDropdown
                  label="Ruj Rengi"
                  value={settings.lipstickColor || 'Seciniz (Dogal)'}
                  options={LIPSTICK_COLOR_OPTIONS}
                  onChange={(val) => updateSetting('lipstickColor', val)}
                />
                <StudioDropdown
                  label="Oje Rengi"
                  value={settings.nailPolishColor || 'Seciniz (Dogal)'}
                  options={NAIL_POLISH_OPTIONS}
                  onChange={(val) => updateSetting('nailPolishColor', val)}
                />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default ModelTab;
