import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Trash2,
  Loader2,
  Download,
  ImageIcon,
  Wand2
} from 'lucide-react';
import { generateOzelFitImage, OzelFitConfig } from '../services/geminiService';

// Bacak tipi konfigürasyonları - Yeni JSON yapısı
const LEG_TYPE_CONFIGS = {
  ince: {
    id: "ince",
    label: "İnce Bacak",
    icon: "🦵",
    config: {
      id: "1_ince_bacak_duz",
      pose_lock: "fixed_pose_reference",
      fit_profile: {
        silhouette: "slim_straight",
        waist_position: "belde_veya_hemen_altinda",
        rise_visual: "orta",
        ease: {
          waist: "low",
          hip: "low",
          thigh: "low_to_medium",
          knee: "low",
          calf: "low"
        },
        bagginess_score_0_10: 2
      },
      leg_behavior: {
        thigh_to_knee: "hafif_dar_düz",
        knee_to_hem: "düz",
        hem_width: "dar_standart"
      },
      fabric_drape: {
        flow: "kontrollü",
        wrinkle_level: "minimum",
        crease: "çok_hafif"
      },
      hem: {
        break: "yok_veya_çok_hafif",
        stacking: "yok"
      }
    }
  },
  duz: {
    id: "duz",
    label: "Düz Bacak",
    icon: "📏",
    config: {
      id: "2_duz_bacak",
      pose_lock: "fixed_pose_reference",
      fit_profile: {
        silhouette: "regular_straight",
        waist_position: "belde_veya_hemen_altinda",
        rise_visual: "orta",
        ease: {
          waist: "medium_low",
          hip: "medium",
          thigh: "medium",
          knee: "medium",
          calf: "medium"
        },
        bagginess_score_0_10: 4
      },
      leg_behavior: {
        thigh_to_knee: "düz",
        knee_to_hem: "düz",
        hem_width: "standart"
      },
      fabric_drape: {
        flow: "doğal_dikey",
        wrinkle_level: "düşük",
        crease: "net_orta_kırık"
      },
      hem: {
        break: "hafif",
        stacking: "çok_az"
      }
    }
  },
  genis: {
    id: "genis",
    label: "Geniş Bacak",
    icon: "👖",
    config: {
      id: "3_genis_bacak_duz",
      pose_lock: "fixed_pose_reference",
      fit_profile: {
        silhouette: "wide_straight",
        waist_position: "belde_veya_belin_ustunde",
        rise_visual: "orta_yuksek",
        ease: {
          waist: "medium",
          hip: "medium_high",
          thigh: "high",
          knee: "high",
          calf: "high"
        },
        bagginess_score_0_10: 7
      },
      leg_behavior: {
        thigh_to_knee: "genis_düz",
        knee_to_hem: "genis_düz",
        hem_width: "genis"
      },
      fabric_drape: {
        flow: "akışkan",
        wrinkle_level: "yumuşak_doğal",
        crease: "yumuşak_opsiyonel"
      },
      hem: {
        break: "hafif_orta",
        stacking: "yok"
      }
    }
  }
};

type LegType = 'ince' | 'duz' | 'genis';

interface OzelModeProps {
  onClose?: () => void;
  userCredits?: number;
  isUserAdmin?: boolean;
  onShowPricing?: () => void;
  onCreditsUsed?: (credits: number) => void;
}

const OzelMode: React.FC<OzelModeProps> = ({
  onClose,
  userCredits = 0,
  isUserAdmin = false,
  onShowPricing,
  onCreditsUsed
}) => {
  // State
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [shoeImage, setShoeImage] = useState<File | null>(null);
  const [shoePreview, setShoePreview] = useState<string | null>(null);
  const [selectedLegType, setSelectedLegType] = useState<LegType>('duz');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shoeInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(file);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => setSourcePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleShoeUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShoeImage(file);
      setResult(null);
      const reader = new FileReader();
      reader.onload = (event) => setShoePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const clearImage = () => {
    setSourceImage(null);
    setSourcePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearShoeImage = () => {
    setShoeImage(null);
    setShoePreview(null);
    if (shoeInputRef.current) shoeInputRef.current.value = '';
  };

  // Progress state for API calls
  const [progressMessage, setProgressMessage] = useState<string>('');

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError('Lütfen bir ürün görseli yükleyin.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProgressMessage('');

    try {
      const legTypeConfig = LEG_TYPE_CONFIGS[selectedLegType];

      // Call the Gemini API
      const generationResult = await generateOzelFitImage(
        sourceImage,
        selectedLegType,
        legTypeConfig.config as OzelFitConfig,
        (message) => setProgressMessage(message),
        shoeImage || undefined
      );

      // Set the result image
      setResult(generationResult.imageData);
      setProgressMessage('');

      console.log(`✅ Özel Fit generated: ${generationResult.legType} using ${generationResult.aiModel}`);

    } catch (err: any) {
      setError(err.message || 'İşlem sırasında bir hata oluştu.');
      setProgressMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `ozel-${selectedLegType}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex h-full w-full bg-bg-base">
      {/* LEFT PANEL - Controls */}
      <div className="w-[380px] h-full flex-shrink-0 bg-bg-surface border-r border-white/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Wand2 className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-[11px] font-semibold text-gray-200">Özel Fit</h1>
              <p className="text-[9px] text-gray-500">Pantolon kalıbı</p>
            </div>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={shoeInputRef}
          onChange={handleShoeUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Açıklama Kartı */}
          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg p-2 border border-violet-500/20">
            <p className="text-gray-500 text-[9px]">
              Ürün yükle, bacak tipi seç, AI kalıbı dönüştürsün.
            </p>
          </div>

          {/* Image Uploads - Compact Row */}
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="flex gap-3">
              {/* Ürün Görseli */}
              <div className="flex-1">
                <label className="flex items-center gap-1 text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <ImageIcon className="w-3 h-3" />
                  Pantolon
                </label>

                {sourcePreview ? (
                  <div className="relative group w-16 h-20 rounded-lg overflow-hidden bg-gray-900">
                    <img
                      src={sourcePreview}
                      alt="Pantolon"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-1 right-1 p-0.5 rounded bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-20 rounded-lg border-2 border-dashed border-violet-500/50 hover:border-violet-500 flex flex-col items-center justify-center text-violet-400 hover:text-violet-300 transition-all bg-violet-500/5 hover:bg-violet-500/10"
                  >
                    <Upload className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px]">Yükle</span>
                  </button>
                )}
              </div>

              {/* Ayakkabı Görseli */}
              <div className="flex-1">
                <label className="flex items-center gap-1 text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  👟 Ayakkabı
                  <span className="text-[8px] text-gray-600 font-normal">(opsiyonel)</span>
                </label>

                {shoePreview ? (
                  <div className="relative group w-16 h-20 rounded-lg overflow-hidden bg-gray-900">
                    <img
                      src={shoePreview}
                      alt="Ayakkabı"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={clearShoeImage}
                      className="absolute top-1 right-1 p-0.5 rounded bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => shoeInputRef.current?.click()}
                    className="w-16 h-20 rounded-lg border-2 border-dashed border-amber-500/50 hover:border-amber-500 flex flex-col items-center justify-center text-amber-400 hover:text-amber-300 transition-all bg-amber-500/5 hover:bg-amber-500/10"
                  >
                    <span className="text-base mb-0.5">👟</span>
                    <span className="text-[8px]">Ekle</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Leg Type Selection - Horizontal Compact */}
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <label className="flex items-center gap-2 text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Bacak Tipi
            </label>

            <div className="grid grid-cols-3 gap-1.5">
              {Object.values(LEG_TYPE_CONFIGS).map((legType) => (
                <button
                  key={legType.id}
                  onClick={() => setSelectedLegType(legType.id as LegType)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    selectedLegType === legType.id
                      ? 'bg-violet-500/30 border border-violet-500'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg block">{legType.icon}</span>
                  <span className={`text-[10px] font-medium block mt-0.5 ${
                    selectedLegType === legType.id ? 'text-violet-300' : 'text-gray-400'
                  }`}>
                    {legType.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Config Preview - Compact */}
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Konfigürasyon
            </label>
            <div className="text-[9px] text-gray-400 grid grid-cols-2 gap-x-2 gap-y-0.5">
              <p><span className="text-gray-600">Siluet:</span> {LEG_TYPE_CONFIGS[selectedLegType].config.fit_profile.silhouette.replace(/_/g, ' ')}</p>
              <p><span className="text-gray-600">Bolluk:</span> {LEG_TYPE_CONFIGS[selectedLegType].config.fit_profile.bagginess_score_0_10}/10</p>
              <p><span className="text-gray-600">Paça:</span> {LEG_TYPE_CONFIGS[selectedLegType].config.leg_behavior.hem_width.replace(/_/g, ' ')}</p>
              <p><span className="text-gray-600">Break:</span> {LEG_TYPE_CONFIGS[selectedLegType].config.hem.break.replace(/_/g, ' ')}</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-[11px] text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-2 border-t border-white/10 bg-bg-surface">
          <button
            onClick={handleGenerate}
            disabled={isProcessing || !sourceImage}
            className={`w-full py-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 transition-all ${
              isProcessing || !sourceImage
                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{progressMessage || 'İşleniyor...'}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>DÖNÜŞTÜR</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - Output */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-bg-base">
        {result ? (
          <div className="relative group">
            <img
              src={result}
              alt="Sonuç"
              className="max-h-[80vh] max-w-full object-contain rounded-lg bg-gray-100"
            />
            <button
              onClick={handleDownload}
              className="absolute top-4 right-4 p-3 rounded-lg bg-white/90 hover:bg-white text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👖</span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Çıktı Alanı</p>
            <p className="text-gray-600 text-xs mt-1">
              Sol panelden görsel yükleyin ve bacak tipini seçin
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OzelMode;
