import React from 'react';
import { GenerationSettings } from '../../../../types';

interface SettingsSummaryProps {
  settings: GenerationSettings;
}

const SettingsSummary: React.FC<SettingsSummaryProps> = ({ settings }) => {
  const summaryItems = [
    { label: 'Cinsiyet', value: settings.gender },
    { label: 'Yas', value: settings.age },
    { label: 'Kadraj', value: settings.framing?.split('(')[0].trim() },
    { label: 'Poz', value: settings.targetPose?.split('(')[0].trim() },
    { label: 'Format', value: settings.aspectRatio },
    { label: 'Tema', value: settings.theme },
    { label: 'Mevsim', value: settings.season !== 'Tum Mevsimler' ? settings.season : null }
  ].filter(
    (item) =>
      item.value &&
      !item.value.includes('Seciniz') &&
      !item.value.includes('Otomatik') &&
      item.value !== 'Tum Mevsimler'
  );

  if (summaryItems.length === 0) {
    return (
      <div className="px-4 py-3 border-t border-[var(--studio-border)]">
        <p className="text-[10px] text-[var(--studio-text-muted)] text-center">
          Ayarlariniz burada gorunecek
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-[var(--studio-border)]">
      <p className="text-[10px] text-[var(--studio-text-muted)] mb-2 uppercase tracking-wider">
        Secili Ayarlar
      </p>
      <div className="flex flex-wrap gap-1.5">
        {summaryItems.map((item, i) => (
          <span
            key={i}
            className="text-[10px] px-2 py-1 rounded bg-[var(--studio-card)] text-[var(--studio-text-secondary)] border border-[var(--studio-border)]"
          >
            {item.value}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SettingsSummary;
