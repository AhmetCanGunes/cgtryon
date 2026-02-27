import React from 'react';
import { cn } from '../../lib/utils';

interface SystemPulseProps {
  success?: number;
  failed?: number;
  pending?: number;
  generationsByType?: {
    studio: number;
    tryOn: number;
    adCreative: number;
    upscale: number;
  };
}

const SystemPulse: React.FC<SystemPulseProps> = ({
  success = 0,
  failed = 0,
  pending = 0,
  generationsByType,
}) => {
  // Tür bazında bar chart data oluştur
  const total = (generationsByType?.studio || 0) +
                (generationsByType?.tryOn || 0) +
                (generationsByType?.adCreative || 0) +
                (generationsByType?.upscale || 0);

  const maxValue = Math.max(
    generationsByType?.studio || 0,
    generationsByType?.tryOn || 0,
    generationsByType?.adCreative || 0,
    generationsByType?.upscale || 0,
    1 // Minimum 1 to avoid division by zero
  );

  const chartData = [
    { value: generationsByType?.studio || 0, label: 'Studio', color: 'bg-slate-600' },
    { value: generationsByType?.tryOn || 0, label: 'Try-on', color: 'bg-slate-500' },
    { value: generationsByType?.adCreative || 0, label: 'Reklam', color: 'bg-primary/60' },
    { value: generationsByType?.upscale || 0, label: 'Upscale', color: 'bg-primary' },
  ];

  // Başarı oranı
  const totalJobs = success + failed + pending;
  const successRate = totalJobs > 0 ? Math.round((success / totalJobs) * 100) : 0;

  return (
    <div className="bg-card-dark rounded-xl border border-border-dark p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Üretim Özeti</h3>
        <span className="material-icons-round text-primary text-lg">monitoring</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Başarılı</p>
          <p className="text-2xl font-bold text-primary">{success}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Başarısız</p>
          <p className="text-2xl font-bold text-red-400">{failed}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Bekleyen</p>
          <p className="text-2xl font-bold text-white">{pending}</p>
        </div>
      </div>

      {/* Bar Chart - Generation Types */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Türe Göre Dağılım</p>
        <div className="flex items-end gap-3 h-24">
          {chartData.map((bar, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={cn('w-full rounded-t transition-all', bar.color)}
                style={{ height: `${maxValue > 0 ? (bar.value / maxValue) * 100 : 0}%`, minHeight: bar.value > 0 ? '8px' : '0' }}
              />
              <span className="text-[9px] text-slate-500 mt-2">{bar.label}</span>
              <span className="text-[10px] font-bold text-slate-400">{bar.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 pt-4 border-t border-border-dark">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Başarı Oranı</span>
          <span className="text-xs font-bold text-primary">{successRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Toplam Üretim</span>
          <span className="text-xs font-bold text-white">{total}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">En Çok Kullanılan</span>
          <span className="text-xs font-medium text-slate-300">
            {chartData.reduce((max, item) => item.value > max.value ? item : max, chartData[0]).label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemPulse;
