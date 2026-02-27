import React, { useState, useRef, useCallback } from 'react';
import {
  Gem,
  Upload,
  Download,
  X,
  Check,
  AlertCircle,
  Loader2,
  ImageIcon,
  Sparkles,
  Eye,
  ChevronDown,
  User,
  Camera
} from 'lucide-react';
import {
  JewelrySettings,
  JEWELRY_SHOOTING_TYPES,
  JEWELRY_STAND_COLORS,
  JEWELRY_BACKGROUNDS,
  JEWELRY_PURPOSE_OPTIONS,
  SKIN_TONE_OPTIONS,
  ReferencedProductionSettings,
  REFERENCED_PRODUCTION_DEFAULTS,
  ScenePlacementSettings,
  SCENE_PLACEMENT_DEFAULTS,
  POSE_SUGGESTIONS,
  PresetProductionSettings,
  PRESET_PRODUCTION_DEFAULTS,
  PRESET_ASPECT_RATIOS,
  PRESET_CAMERA_ANGLES
} from '../types';
import {
  generateJewelryImage,
  generateMultipleJewelryImages,
  JewelryGenerationResult,
  generateReferencedProduction,
  generateMultipleReferencedProductions,
  ReferencedProductionResult,
  generateScenePlacement,
  generateMultipleScenePlacements,
  ScenePlacementResult,
  buildJewelryPromptPreview,
  buildReferencedProductionPromptPreview,
  buildScenePlacementPromptPreview,
  generatePresetProduction,
  generateMultiplePresetProductions,
  PresetProductionResult,
  buildPresetProductionPromptPreview
} from '../services/geminiService';

type ProductionMode = 'standard' | 'referenced';

interface JewelryModeProps {
  onClose?: () => void;
  userCredits?: number;
  isUserAdmin?: boolean;
  onShowPricing?: () => void;
  onCreditsUsed?: (credits: number) => void;
  initialMode?: ProductionMode;
  onModeChange?: (mode: ProductionMode) => void;
}

// Reference Icon Component
const ReferenceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h7v7h-7z" strokeDasharray="2 2" />
    <path d="M10 6.5h4M6.5 10v4" />
  </svg>
);

// Scene Icon Component
const SceneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <circle cx="8" cy="10" r="2" />
    <path d="M22 15l-5-5-3 3-4-4-8 8" />
    <path d="M12 4v-2M12 22v2M2 12h-2M24 12h-2" strokeDasharray="1 2" />
  </svg>
);

// Preset Icon Component
const PresetIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
    <circle cx="6" cy="6" r="1" />
    <path d="M14 15l2 2 4-4" />
  </svg>
);

const JewelryMode: React.FC<JewelryModeProps> = ({
  onClose,
  userCredits = 0,
  isUserAdmin = false,
  onShowPricing,
  onCreditsUsed,
  initialMode = 'standard',
  onModeChange
}) => {
  // Production Mode - initialMode prop'u ile başlatılır
  const [productionMode, setProductionMode] = useState<ProductionMode>(initialMode);

  // initialMode değiştiğinde productionMode'u güncelle
  React.useEffect(() => {
    setProductionMode(initialMode);
  }, [initialMode]);

  // Mode değişikliklerini parent'a bildir
  const handleModeChange = React.useCallback((mode: ProductionMode) => {
    setProductionMode(mode);
    onModeChange?.(mode);
  }, [onModeChange]);

  // Standard Mode States
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [results, setResults] = useState<JewelryGenerationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [progressCount, setProgressCount] = useState<{ current: number; total: number } | null>(null);

  const [settings, setSettings] = useState<JewelrySettings>({
    shootingType: 'velvet-stand',
    standColor: 'burgundy',
    skinTone: 'medium',
    background: 'burgundy-velvet',
    purpose: 'shopify',
    modelQuality: 'high',
    numberOfImages: 1
  });

  // Referenced Production States
  const [refSourceModel, setRefSourceModel] = useState<File | null>(null);
  const [refSourceModelPreview, setRefSourceModelPreview] = useState<string | null>(null);
  const [refPoseImage, setRefPoseImage] = useState<File | null>(null);
  const [refPosePreview, setRefPosePreview] = useState<string | null>(null);
  const [refResults, setRefResults] = useState<ReferencedProductionResult[]>([]);
  const [refSelectedResult, setRefSelectedResult] = useState<number>(0);
  const [refIsProcessing, setRefIsProcessing] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [refProgress, setRefProgress] = useState<string>('');
  const [refProgressCount, setRefProgressCount] = useState<{ current: number; total: number } | null>(null);
  const [refSettings, setRefSettings] = useState<ReferencedProductionSettings>(REFERENCED_PRODUCTION_DEFAULTS);

  // Scene Placement States
  const [sceneSourceModel, setSceneSourceModel] = useState<File | null>(null);
  const [sceneSourceModelPreview, setSceneSourceModelPreview] = useState<string | null>(null);
  const [sceneImage, setSceneImage] = useState<File | null>(null);
  const [sceneImagePreview, setSceneImagePreview] = useState<string | null>(null);
  const [sceneResults, setSceneResults] = useState<ScenePlacementResult[]>([]);
  const [sceneSelectedResult, setSceneSelectedResult] = useState<number>(0);
  const [sceneIsProcessing, setSceneIsProcessing] = useState(false);
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [sceneProgress, setSceneProgress] = useState<string>('');
  const [sceneProgressCount, setSceneProgressCount] = useState<{ current: number; total: number } | null>(null);
  const [sceneSettings, setSceneSettings] = useState<ScenePlacementSettings>(SCENE_PLACEMENT_DEFAULTS);
  const [selectedPoseSuggestion, setSelectedPoseSuggestion] = useState<string>('auto');

  // Preset (Hazır Sahne) States
  const [presetJewelry, setPresetJewelry] = useState<File[]>([]);
  const [presetJewelryPreviews, setPresetJewelryPreviews] = useState<string[]>([]);
  const [presetModel, setPresetModel] = useState<File | null>(null);
  const [presetModelPreview, setPresetModelPreview] = useState<string | null>(null);
  const [presetUseCustomModel, setPresetUseCustomModel] = useState<boolean>(false);
  const [presetResults, setPresetResults] = useState<PresetProductionResult[]>([]);
  const [presetSelectedResult, setPresetSelectedResult] = useState<number>(0);
  const [presetSettings, setPresetSettings] = useState<PresetProductionSettings>(PRESET_PRODUCTION_DEFAULTS);
  const [customBackground, setCustomBackground] = useState<File | null>(null);
  const [customBackgroundPreview, setCustomBackgroundPreview] = useState<string | null>(null);
  const [presetIsProcessing, setPresetIsProcessing] = useState(false);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [presetProgress, setPresetProgress] = useState<string>('');
  const [presetProgressCount, setPresetProgressCount] = useState<{ current: number; total: number } | null>(null);

  // Prompt önizleme state'leri
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false);
  const [currentPromptPreview, setCurrentPromptPreview] = useState<string>('');

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refSourceInputRef = useRef<HTMLInputElement>(null);
  const refPoseInputRef = useRef<HTMLInputElement>(null);
  const sceneSourceInputRef = useRef<HTMLInputElement>(null);
  const sceneImageInputRef = useRef<HTMLInputElement>(null);
  const presetJewelryInputRef = useRef<HTMLInputElement>(null);
  const presetModelInputRef = useRef<HTMLInputElement>(null);
  const customBackgroundInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = <K extends keyof JewelrySettings>(key: K, value: JewelrySettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      if (key === 'shootingType') {
        const backgrounds = JEWELRY_BACKGROUNDS[value as keyof typeof JEWELRY_BACKGROUNDS];
        if (backgrounds && backgrounds.length > 0) {
          newSettings.background = backgrounds[0].id;
        }
      }
      return newSettings;
    });
  };

  // Standard Mode Handlers
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(file);
      setResults([]);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => setSourcePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  // Prompt önizleme fonksiyonu - Standart mod
  const handleShowPromptPreview = () => {
    const prompt = buildJewelryPromptPreview(settings);
    setCurrentPromptPreview(prompt);
    setShowPromptPreview(true);
  };

  // Prompt önizleme fonksiyonu - Referanslı mod
  const handleShowRefPromptPreview = () => {
    const prompt = buildReferencedProductionPromptPreview(refSettings);
    setCurrentPromptPreview(prompt);
    setShowPromptPreview(true);
  };

  // Prompt önizleme fonksiyonu - Sahne modu
  const handleShowScenePromptPreview = () => {
    const prompt = buildScenePlacementPromptPreview(sceneSettings);
    setCurrentPromptPreview(prompt);
    setShowPromptPreview(true);
  };

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError('Lütfen bir takı görseli yükleyin.');
      return;
    }

    // Kredi kontrolü - her görsel 1 kredi
    const requiredCredits = settings.numberOfImages || 1;
    if (!isUserAdmin && userCredits < requiredCredits) {
      setError(`Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
      onShowPricing?.();
      return;
    }

    setShowPromptPreview(false); // Modal'ı kapat
    setIsProcessing(true);
    setError(null);
    setResults([]);
    setProgress('Hazırlanıyor...');

    try {
      if (settings.numberOfImages === 1) {
        const result = await generateJewelryImage(sourceImage, settings, (msg) => setProgress(msg));
        setResults([result]);
        // Kredi düş
        if (!isUserAdmin) onCreditsUsed?.(1);
      } else {
        const results = await generateMultipleJewelryImages(sourceImage, settings, (msg, current, total) => {
          setProgress(msg);
          setProgressCount({ current, total });
        });
        setResults(results);
        // Kredi düş
        if (!isUserAdmin) onCreditsUsed?.(results.length);
      }
      setProgress('');
      setProgressCount(null);
    } catch (err: any) {
      setError(err.message || 'Görsel oluşturulurken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `jewelry-${settings.shootingType}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Referenced Production Handlers
  const handleRefSourceUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefSourceModel(file);
      setRefResults([]);
      setRefError(null);
      const reader = new FileReader();
      reader.onload = (event) => setRefSourceModelPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRefPoseUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefPoseImage(file);
      setRefResults([]);
      setRefError(null);
      const reader = new FileReader();
      reader.onload = (event) => setRefPosePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRefGenerate = async () => {
    if (!refSourceModel || !refPoseImage) {
      setRefError('Lütfen hem kaynak takı/model hem de referans poz görselini yükleyin.');
      return;
    }

    // Kredi kontrolü
    const requiredCredits = refSettings.numberOfImages || 1;
    if (!isUserAdmin && userCredits < requiredCredits) {
      setRefError(`Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
      onShowPricing?.();
      return;
    }

    setShowPromptPreview(false); // Modal'ı kapat
    setRefIsProcessing(true);
    setRefError(null);
    setRefResults([]);
    setRefProgress('Hazırlanıyor...');

    try {
      if (refSettings.numberOfImages === 1) {
        const result = await generateReferencedProduction(
          refSourceModel,
          refPoseImage,
          refSettings,
          (msg) => setRefProgress(msg)
        );
        setRefResults([result]);
        if (!isUserAdmin) onCreditsUsed?.(1);
      } else {
        const results = await generateMultipleReferencedProductions(
          refSourceModel,
          refPoseImage,
          refSettings,
          (msg, current, total) => {
            setRefProgress(msg);
            setRefProgressCount({ current, total });
          }
        );
        setRefResults(results);
        if (!isUserAdmin) onCreditsUsed?.(results.length);
      }
      setRefProgress('');
      setRefProgressCount(null);
    } catch (err: any) {
      setRefError(err.message || 'Görsel oluşturulurken bir hata oluştu.');
    } finally {
      setRefIsProcessing(false);
    }
  };

  const handleRefDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `jewelry-referenced-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scene Placement Handlers
  const handleSceneSourceUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSceneSourceModel(file);
      setSceneResults([]);
      setSceneError(null);
      const reader = new FileReader();
      reader.onload = (event) => setSceneSourceModelPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSceneImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSceneImage(file);
      setSceneResults([]);
      setSceneError(null);
      const reader = new FileReader();
      reader.onload = (event) => setSceneImagePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSceneGenerate = async () => {
    if (!sceneSourceModel || !sceneImage) {
      setSceneError('Lütfen hem kaynak takı/model hem de sahne görselini yükleyin.');
      return;
    }

    // Kredi kontrolü
    const requiredCredits = sceneSettings.numberOfImages || 1;
    if (!isUserAdmin && userCredits < requiredCredits) {
      setSceneError(`Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
      onShowPricing?.();
      return;
    }

    setShowPromptPreview(false); // Modal'ı kapat
    setSceneIsProcessing(true);
    setSceneError(null);
    setSceneResults([]);
    setSceneProgress('Hazırlanıyor...');

    // Poz talimatını ayarla
    let poseInstruction = sceneSettings.poseInstruction;
    if (selectedPoseSuggestion !== 'custom') {
      const suggestion = POSE_SUGGESTIONS.find(p => p.id === selectedPoseSuggestion);
      if (suggestion && suggestion.id !== 'auto') {
        poseInstruction = suggestion.description;
      } else if (suggestion?.id === 'auto') {
        poseInstruction = '';
      }
    }

    const finalSettings = { ...sceneSettings, poseInstruction };

    try {
      if (sceneSettings.numberOfImages === 1) {
        const result = await generateScenePlacement(
          sceneSourceModel,
          sceneImage,
          finalSettings,
          (msg) => setSceneProgress(msg)
        );
        setSceneResults([result]);
        // Başarılı üretim sonrası kredi düş
        if (!isUserAdmin) onCreditsUsed?.(1);
      } else {
        const results = await generateMultipleScenePlacements(
          sceneSourceModel,
          sceneImage,
          finalSettings,
          (msg, current, total) => {
            setSceneProgress(msg);
            setSceneProgressCount({ current, total });
          }
        );
        setSceneResults(results);
        // Başarılı üretim sonrası kredi düş
        if (!isUserAdmin) onCreditsUsed?.(results.length);
      }
      setSceneProgress('');
      setSceneProgressCount(null);
    } catch (err: any) {
      setSceneError(err.message || 'Görsel oluşturulurken bir hata oluştu.');
    } finally {
      setSceneIsProcessing(false);
    }
  };

  const handleSceneDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `jewelry-scene-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preset Functions
  const updatePresetSetting = <K extends keyof PresetProductionSettings>(key: K, value: PresetProductionSettings[K]) => {
    setPresetSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePresetJewelryUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).slice(0, 7 - presetJewelry.length) as File[];
      setPresetJewelry(prev => [...prev, ...newFiles]);
      newFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPresetJewelryPreviews(prev => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  }, [presetJewelry.length]);

  const removePresetJewelry = (index: number) => {
    setPresetJewelry(prev => prev.filter((_, i) => i !== index));
    setPresetJewelryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handlePresetModelUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPresetModel(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPresetModelPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removePresetModel = () => {
    setPresetModel(null);
    setPresetModelPreview(null);
  };

  const handleCustomBackgroundUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomBackground(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBackgroundPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removeCustomBackground = () => {
    setCustomBackground(null);
    setCustomBackgroundPreview(null);
  };

  const handleShowPresetPromptPreview = () => {
    const prompt = buildPresetProductionPromptPreview('custom', presetSettings, presetJewelry.length, presetUseCustomModel);
    setCurrentPromptPreview(prompt);
    setShowPromptPreview(true);
  };

  const handlePresetGenerate = async () => {
    if (presetJewelry.length === 0 || !customBackground) return;
    if (presetUseCustomModel && !presetModel) return;

    setPresetIsProcessing(true);
    setPresetError(null);
    setPresetProgress('Hazırlanıyor...');
    setPresetResults([]);

    try {
      const numberOfImages = presetSettings.useAngleSet ? 5 : presetSettings.numberOfImages;

      if (numberOfImages === 1 && !presetSettings.useAngleSet) {
        setPresetProgress('Görsel oluşturuluyor...');
        const result = await generatePresetProduction(
          presetJewelry,
          'custom',
          presetSettings,
          (msg: string) => setPresetProgress(msg),
          presetUseCustomModel ? presetModel : null,
          customBackground
        );
        setPresetResults([result]);
      } else {
        const results = await generateMultiplePresetProductions(
          presetJewelry,
          'custom',
          { ...presetSettings, numberOfImages },
          (msg: string, current: number, total: number) => {
            setPresetProgress(`Görsel ${current}/${total} oluşturuluyor... ${msg}`);
            setPresetProgressCount({ current, total });
          },
          presetUseCustomModel ? presetModel : null,
          customBackground
        );
        setPresetResults(results);
      }

      if (onCreditsUsed) {
        onCreditsUsed(numberOfImages);
      }
    } catch (err) {
      setPresetError(err instanceof Error ? err.message : 'Görsel oluşturulurken bir hata oluştu');
    } finally {
      setPresetIsProcessing(false);
      setPresetProgress('');
      setPresetProgressCount(null);
    }
  };

  const handlePresetDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `jewelry-preset-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentBackgrounds = JEWELRY_BACKGROUNDS[settings.shootingType] || [];

  return (
    <div className="h-full w-full flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-[380px] flex-shrink-0 bg-bg-surface border-r border-white/10 flex flex-col h-full">
        {/* Hidden file inputs */}
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <input type="file" ref={refSourceInputRef} onChange={handleRefSourceUpload} accept="image/*" className="hidden" />
        <input type="file" ref={refPoseInputRef} onChange={handleRefPoseUpload} accept="image/*" className="hidden" />
        <input type="file" ref={sceneSourceInputRef} onChange={handleSceneSourceUpload} accept="image/*" className="hidden" />
        <input type="file" ref={sceneImageInputRef} onChange={handleSceneImageUpload} accept="image/*" className="hidden" />
        <input type="file" ref={presetJewelryInputRef} onChange={handlePresetJewelryUpload} accept="image/*" multiple className="hidden" />
        <input type="file" ref={presetModelInputRef} onChange={handlePresetModelUpload} accept="image/*" className="hidden" />
        <input type="file" ref={customBackgroundInputRef} onChange={handleCustomBackgroundUpload} accept="image/*" className="hidden" />

        {/* Scrollable Content - Settings Only */}
        <div className="flex-1 overflow-y-auto p-3">
          {productionMode === 'standard' ? (
          <>
            {/* ========== STANDART MOD - SETTINGS ========== */}
            <div className="space-y-2">
            {/* Image Upload */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              {sourcePreview ? (
                <div className="relative group">
                  <img src={sourcePreview} alt="Kaynak" className="w-full aspect-square object-contain rounded-lg bg-gray-100" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-gray-500/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                  >
                    <span className="text-gray-900 text-xs">Değiştir</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xs">Takı Yükle</span>
                </button>
              )}
            </div>

            {/* Shooting Type - Compact */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Çekim Tipi</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {JEWELRY_SHOOTING_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => updateSetting('shootingType', type.id as JewelrySettings['shootingType'])}
                    className={`p-2 rounded-lg text-center transition-all ${
                      settings.shootingType === type.id
                        ? 'bg-primary/30 border-primary border'
                        : 'bg-white/5 border-white/10 border hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg block">{type.icon}</span>
                    <span className="text-[9px] text-gray-300 block mt-0.5">{type.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stand Color - Only for velvet-stand */}
            {settings.shootingType === 'velvet-stand' && (
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <h3 className="text-gray-300 text-[10px] font-medium mb-2">Stand Rengi</h3>
                <div className="grid grid-cols-5 gap-1.5">
                  {JEWELRY_STAND_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => updateSetting('standColor', color.id)}
                      title={color.name}
                      className={`w-full aspect-square rounded-md border-2 transition-all ${
                        settings.standColor === color.id ? 'border-white scale-105 ring-1 ring-primary' : 'border-transparent hover:border-white/50'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {settings.standColor === color.id && <Check className="w-3 h-3 text-gray-900 mx-auto" style={{ filter: color.hex === '#FFFFF0' || color.hex === '#FFFDD0' ? 'invert(1)' : 'none' }} />}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-500 mt-1.5">
                  {JEWELRY_STAND_COLORS.find(c => c.id === settings.standColor)?.name}
                </p>
              </div>
            )}

            {/* Skin Tone - Only for on-model */}
            {settings.shootingType === 'on-model' && (
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <h3 className="text-gray-300 text-[10px] font-medium mb-2">Ten Rengi</h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {SKIN_TONE_OPTIONS.filter(t => t.id !== 'auto').map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => updateSetting('skinTone', tone.id)}
                      title={`${tone.name} - ${tone.description}`}
                      className={`w-full aspect-square rounded-md border-2 transition-all ${
                        settings.skinTone === tone.id ? 'border-white scale-105 ring-1 ring-primary' : 'border-transparent hover:border-white/50'
                      }`}
                      style={{ backgroundColor: tone.hex }}
                    >
                      {settings.skinTone === tone.id && <Check className="w-3 h-3 text-gray-900 mx-auto" style={{ filter: tone.id === 'fair' || tone.id === 'light' ? 'invert(1)' : 'none' }} />}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-500 mt-1.5">
                  {SKIN_TONE_OPTIONS.find(t => t.id === settings.skinTone)?.name}
                </p>
              </div>
            )}

            {/* Background - Dropdown */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Arka Plan</h3>
              <div className="relative">
                <select
                  value={settings.background}
                  onChange={(e) => updateSetting('background', e.target.value)}
                  className="w-full py-2 px-3 pr-8 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs appearance-none cursor-pointer hover:bg-gray-100 focus:outline-none focus:border-primary"
                >
                  {currentBackgrounds.map((bg) => (
                    <option key={bg.id} value={bg.id} className="bg-white text-gray-900">
                      {bg.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
              <p className="text-[9px] text-gray-500 mt-1">
                {currentBackgrounds.find(bg => bg.id === settings.background)?.description}
              </p>
            </div>

            {/* Purpose & Count - Combined */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h3 className="text-gray-300 text-[10px] font-medium mb-2">Amaç</h3>
                  <div className="space-y-1">
                    {JEWELRY_PURPOSE_OPTIONS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => updateSetting('purpose', p.id as JewelrySettings['purpose'])}
                        className={`w-full py-1.5 px-2 rounded-md text-[10px] transition-all ${
                          settings.purpose === p.id
                            ? 'bg-primary/30 text-gray-900'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-300 text-[10px] font-medium mb-2">Adet</h3>
                  <div className="grid grid-cols-2 gap-1">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => updateSetting('numberOfImages', num)}
                        className={`py-1.5 rounded-md text-xs transition-all ${
                          settings.numberOfImages === num
                            ? 'bg-primary/30 text-gray-900'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </>
        ) : productionMode === 'referenced' ? (
        <>
          {/* ========== REFERANSLI ÜRETİM MODU - SETTINGS ========== */}
          <div className="space-y-3">
            {/* Açıklama Kartı */}
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-3 border border-primary/30">
              <div className="flex items-start gap-2">
                <ReferenceIcon className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-gray-300 text-[10px] font-medium">Referanslı Üretim</h3>
                  <p className="text-gray-600 text-[10px] mt-1">
                    Takınızı referans pozuna yerleştirin. Kaynak takının özellikleri korunarak referans pozuna transfer edilir.
                  </p>
                </div>
              </div>
            </div>

            {/* İki Görsel Yükleme Alanı */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görseller</h3>
              <div className="grid grid-cols-2 gap-2">
                {/* Kaynak Takı */}
                <div>
                  <p className="text-[10px] text-gray-600 mb-1.5">Kaynak Takı</p>
                  {refSourceModelPreview ? (
                    <div className="relative group">
                      <img src={refSourceModelPreview} alt="Kaynak" className="w-full aspect-square object-contain rounded-lg bg-gray-100" />
                      <button
                        onClick={() => refSourceInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-gray-500/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      >
                        <span className="text-gray-900 text-[10px]">Değiştir</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => refSourceInputRef.current?.click()}
                      className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gray-900"
                    >
                      <Gem className="w-5 h-5" />
                      <span className="text-[10px]">Takı Yükle</span>
                    </button>
                  )}
                </div>

                {/* Referans Poz */}
                <div>
                  <p className="text-[10px] text-gray-600 mb-1.5">Referans Poz</p>
                  {refPosePreview ? (
                    <div className="relative group">
                      <img src={refPosePreview} alt="Referans" className="w-full aspect-square object-contain rounded-lg bg-gray-100" />
                      <button
                        onClick={() => refPoseInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-gray-500/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      >
                        <span className="text-gray-900 text-[10px]">Değiştir</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => refPoseInputRef.current?.click()}
                      className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-accent/50 flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gray-900"
                    >
                      <Eye className="w-5 h-5" />
                      <span className="text-[10px]">Poz Yükle</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Ayarlar */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Koruma Ayarları</h3>
              <div className="space-y-2">
                {[
                  { key: 'preserveClothing', label: 'Takı Detayları', desc: 'Orijinal takı özellikleri korunsun' },
                  { key: 'preserveAngle', label: 'Açıyı Koru', desc: 'Referans fotoğrafın açısı/kompozisyonu korunsun' },
                  { key: 'preserveAspectRatio', label: 'En-Boy Oranı', desc: 'Referans fotoğrafın boyutları korunsun' },
                  { key: 'matchLighting', label: 'Işık Uyumu', desc: 'Referans ışığına uyum sağla' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-2 rounded-lg bg-white cursor-pointer hover:bg-gray-100">
                    <div>
                      <span className="text-gray-900 text-xs">{item.label}</span>
                      <p className="text-[9px] text-gray-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={refSettings[item.key as keyof ReferencedProductionSettings] as boolean}
                      onChange={(e) => setRefSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="w-4 h-4 rounded bg-gray-100 border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Adet Seçimi */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görsel Adedi</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRefSettings(prev => ({ ...prev, numberOfImages: num }))}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      refSettings.numberOfImages === num
                        ? 'bg-primary/30 text-gray-900 border border-primary'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </>
        ) : productionMode === 'scene' ? (
        <>
          {/* ========== SAHNEYE YERLEŞTİRME MODU - SETTINGS ========== */}
          <div className="space-y-3">
            {/* Açıklama Kartı */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-3 border border-amber-500/30">
              <div className="flex items-start gap-2">
                <SceneIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-gray-300 text-[10px] font-medium">Sahneye Yerleştir</h3>
                  <p className="text-gray-600 text-[10px] mt-1">
                    Takınızı istediğiniz sahneye yerleştirin. Poz talimatı verebilir veya AI'ın seçmesini sağlayabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* İki Görsel Yükleme Alanı */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görseller</h3>
              <div className="grid grid-cols-2 gap-2">
                {/* Kaynak Takı */}
                <div>
                  <p className="text-[10px] text-gray-600 mb-1.5">Kaynak Takı</p>
                  {sceneSourceModelPreview ? (
                    <div className="relative group">
                      <img src={sceneSourceModelPreview} alt="Kaynak" className="w-full aspect-square object-contain rounded-lg bg-gray-100" />
                      <button
                        onClick={() => sceneSourceInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-gray-500/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      >
                        <span className="text-gray-900 text-[10px]">Değiştir</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => sceneSourceInputRef.current?.click()}
                      className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-amber-500/50 flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gray-900"
                    >
                      <Gem className="w-5 h-5" />
                      <span className="text-[10px]">Takı Yükle</span>
                    </button>
                  )}
                </div>

                {/* Sahne */}
                <div>
                  <p className="text-[10px] text-gray-600 mb-1.5">Sahne / Arka Plan</p>
                  {sceneImagePreview ? (
                    <div className="relative group">
                      <img src={sceneImagePreview} alt="Sahne" className="w-full aspect-square object-contain rounded-lg bg-gray-100" />
                      <button
                        onClick={() => sceneImageInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-gray-500/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      >
                        <span className="text-gray-900 text-[10px]">Değiştir</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => sceneImageInputRef.current?.click()}
                      className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500/50 flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gray-900"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-[10px]">Sahne Yükle</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Poz Önerileri */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Poz Seçimi</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {POSE_SUGGESTIONS.map((pose) => (
                  <button
                    key={pose.id}
                    onClick={() => {
                      setSelectedPoseSuggestion(pose.id);
                      if (pose.id !== 'auto') {
                        setSceneSettings(prev => ({ ...prev, poseInstruction: pose.description }));
                      } else {
                        setSceneSettings(prev => ({ ...prev, poseInstruction: '' }));
                      }
                    }}
                    className={`p-2 rounded-lg text-center transition-all ${
                      selectedPoseSuggestion === pose.id
                        ? 'bg-amber-500/30 border-amber-500 border'
                        : 'bg-white/5 border-white/10 border hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[9px] text-gray-300 block">{pose.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedPoseSuggestion('custom')}
                  className={`p-2 rounded-lg text-center transition-all ${
                    selectedPoseSuggestion === 'custom'
                      ? 'bg-amber-500/30 border-amber-500 border'
                      : 'bg-white/5 border-white/10 border hover:bg-white/10'
                  }`}
                >
                  <span className="text-[9px] text-gray-300 block">Özel</span>
                </button>
              </div>

              {/* Özel Poz Talimatı */}
              {selectedPoseSuggestion === 'custom' && (
                <div className="mt-2">
                  <textarea
                    value={sceneSettings.poseInstruction}
                    onChange={(e) => setSceneSettings(prev => ({ ...prev, poseInstruction: e.target.value }))}
                    placeholder="Takının nasıl yerleştirilmesini istediğinizi yazın..."
                    className="w-full h-20 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Adet Seçimi */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görsel Adedi</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSceneSettings(prev => ({ ...prev, numberOfImages: num }))}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      sceneSettings.numberOfImages === num
                        ? 'bg-amber-500/30 text-gray-900 border border-amber-500'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </>
        ) : productionMode === 'preset' ? (
        <>
          {/* ========== HAZIR SAHNELER MODU - SETTINGS ========== */}
          <div className="space-y-3">
            {/* Açıklama Kartı */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-3 border border-cyan-500/30">
              <div className="flex items-start gap-2">
                <PresetIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-gray-300 text-[10px] font-medium">Hazır Sahneler</h3>
                  <p className="text-gray-600 text-[10px] mt-1">
                    Takı yükleyin, model sıfırdan oluşturulacak ve hazır sahneye yerleştirilecek. Doğal ve profesyonel sonuç.
                  </p>
                </div>
              </div>
            </div>

            {/* Takı Yükleme */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2 flex items-center gap-2">
                <Gem className="w-3.5 h-3.5 text-cyan-400" />
                Takılar
              </h3>
              <div className="flex gap-2 flex-wrap">
                {presetJewelryPreviews.map((preview, index) => (
                  <div key={index} className="relative group w-16 h-16 flex-shrink-0">
                    <img src={preview} alt={`Takı ${index + 1}`} className="w-full h-full object-cover rounded-lg ring-1 ring-cyan-500/50" />
                    <button
                      onClick={() => removePresetJewelry(index)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    >
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                    <span className="absolute -top-1 -left-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center text-[7px] text-gray-900 font-bold">{index + 1}</span>
                  </div>
                ))}

                {presetJewelry.length < 7 && (
                  <button
                    onClick={() => presetJewelryInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-cyan-500/50 hover:border-cyan-500 flex flex-col items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-[7px] mt-0.5">Ekle</span>
                  </button>
                )}
              </div>
              <p className="text-gray-500 text-[9px] mt-2">Max 7 takı (yüzük, kolye, bilezik vb.)</p>
            </div>

            {/* Model Seçeneği */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-300 text-[10px] font-medium flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-pink-400" />
                  Kendi Modelim
                </h3>
                <button
                  onClick={() => setPresetUseCustomModel(!presetUseCustomModel)}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    presetUseCustomModel ? 'bg-pink-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                    presetUseCustomModel ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {presetUseCustomModel ? (
                <div className="flex gap-2">
                  {presetModelPreview ? (
                    <div className="relative group w-20 h-24 flex-shrink-0">
                      <img src={presetModelPreview} alt="Model" className="w-full h-full object-cover rounded-lg ring-2 ring-mode-accent" />
                      <button
                        onClick={removePresetModel}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => presetModelInputRef.current?.click()}
                      className="w-20 h-24 rounded-lg border-2 border-dashed border-pink-500/50 hover:border-pink-500 flex flex-col items-center justify-center text-pink-400 hover:text-pink-300 transition-all"
                    >
                      <User className="w-5 h-5" />
                      <span className="text-[8px] mt-1">Model</span>
                      <span className="text-[8px]">Yükle</span>
                    </button>
                  )}
                  <div className="flex-1">
                    <p className="text-gray-600 text-[9px]">Kendi model fotoğrafınızı yükleyin. Model aynen kopyalanıp takılar üzerine takılacak.</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-[9px]">Kapatıldığında AI otomatik model oluşturur. Açtığınızda kendi modelinizi kullanabilirsiniz.</p>
              )}
            </div>

            {/* Arka Plan */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                Arka Plan
              </h3>
              {customBackgroundPreview ? (
                <div className="flex gap-2">
                  <div className="relative group w-24 h-20 flex-shrink-0">
                    <img
                      src={customBackgroundPreview}
                      alt="Arka Plan"
                      className="w-full h-full object-cover rounded-lg ring-2 ring-mode-accent"
                    />
                    <button
                      onClick={removeCustomBackground}
                      className="absolute top-1 right-1 p-0.5 bg-red-500/80 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-gray-900" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded">
                      <Check className="w-3 h-3 text-blue-400 inline" />
                      <span className="text-[8px] text-gray-900 ml-0.5">Seçili</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-[9px]">Arka plan görseliniz yüklendi. Model bu sahneye yerleştirilecek.</p>
                    <button
                      onClick={() => customBackgroundInputRef.current?.click()}
                      className="mt-1.5 text-blue-400 text-[9px] hover:text-blue-300"
                    >
                      Değiştir
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => customBackgroundInputRef.current?.click()}
                  className="w-full py-4 rounded-lg border-2 border-dashed border-blue-500/50 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 flex flex-col items-center justify-center text-blue-400 hover:text-blue-300 transition-all"
                >
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Arka Plan Yükle</span>
                  <span className="text-[9px] text-blue-400/70 mt-0.5">Kendi sahnenizi ekleyin</span>
                </button>
              )}
            </div>

            {/* Model Boyutu */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2 flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-yellow-400" />
                Model Boyutu
              </h3>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'close', label: 'Yakın', desc: '40-50%' },
                  { id: 'medium', label: 'Orta', desc: '30-40%' },
                  { id: 'far', label: 'Uzak', desc: '22-30%' },
                  { id: 'very-far', label: 'Çok Uzak', desc: '15-22%' }
                ].map((scale) => (
                  <button
                    key={scale.id}
                    onClick={() => updatePresetSetting('modelScale', scale.id as 'close' | 'medium' | 'far' | 'very-far')}
                    className={`p-2 rounded-lg text-center transition-all ${
                      presetSettings.modelScale === scale.id
                        ? 'bg-yellow-500/20 border border-yellow-500/50'
                        : 'bg-white border border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <span className={`text-[10px] font-medium block ${presetSettings.modelScale === scale.id ? 'text-yellow-300' : 'text-gray-700'}`}>
                      {scale.label}
                    </span>
                    <span className="text-[8px] text-gray-500 block mt-0.5">{scale.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Görsel Oranı & Kamera Açısı */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10 space-y-3">
              {/* Görsel Oranı */}
              <div>
                <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görsel Oranı</h3>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => updatePresetSetting('aspectRatio', ratio.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        presetSettings.aspectRatio === ratio.id
                          ? 'bg-cyan-500 text-gray-900'
                          : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="font-bold">{ratio.label}</span>
                      <span className="text-[8px] ml-1 opacity-70">{ratio.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kamera Açısı */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-300 text-[10px] font-medium">Kamera Açısı</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600">Setli Üretim</span>
                    <button
                      onClick={() => updatePresetSetting('useAngleSet', !presetSettings.useAngleSet)}
                      className={`w-9 h-5 rounded-full transition-all relative ${
                        presetSettings.useAngleSet ? 'bg-cyan-500' : 'bg-gray-600'
                      }`}
                      title="Açık olduğunda her açıdan 1 fotoğraf üretilir (5 fotoğraf)"
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                        presetSettings.useAngleSet ? 'left-4' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                {presetSettings.useAngleSet ? (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2">
                    <p className="text-cyan-300 text-[10px] text-center">
                      📸 5 farklı açıdan fotoğraf üretilecek
                    </p>
                    <div className="flex justify-center gap-1 mt-1.5">
                      {PRESET_CAMERA_ANGLES.map((angle) => (
                        <span key={angle.id} className="text-xs" title={angle.label}>{angle.icon}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CAMERA_ANGLES.map((angle) => (
                      <button
                        key={angle.id}
                        onClick={() => updatePresetSetting('cameraAngle', angle.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1 ${
                          presetSettings.cameraAngle === angle.id
                            ? 'bg-cyan-500 text-gray-900'
                            : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title={angle.desc}
                      >
                        <span>{angle.icon}</span>
                        <span>{angle.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Görsel Sayısı */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görsel Sayısı</h3>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => updatePresetSetting('numberOfImages', num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      presetSettings.numberOfImages === num
                        ? 'bg-cyan-500 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </>
          ) : null}

          {/* Custom Prompt - Global for all modes */}
          <div className="bg-white/5 rounded-lg p-2 border border-white/10 mt-2">
            <h3 className="text-gray-300 text-[10px] font-medium mb-2">Özel Prompt</h3>
            <textarea
              value={settings.customPrompt || ''}
              onChange={(e) => setSettings({...settings, customPrompt: e.target.value})}
              placeholder="Çıktıya eklemek istediğiniz özel detayları yazın..."
              className="w-full bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 resize-none h-14 focus:border-primary focus:outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Sticky Footer - Generate Button */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          {productionMode === 'standard' ? (
            <>
              <button
                onClick={isUserAdmin ? handleShowPromptPreview : handleGenerate}
                disabled={!sourceImage || isProcessing}
                className={`w-full py-3 rounded-xl font-medium text-gray-900 text-sm flex items-center justify-center gap-2 ${
                  !sourceImage || isProcessing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-600'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isUserAdmin ? "Prompt'u Göster ve Oluştur" : "Görsel Oluştur"}</span>
                  </>
                )}
              </button>

              {/* Progress */}
              {isProcessing && progress && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 mt-2">
                  <div className="flex items-center gap-2 text-secondary text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{progress}</span>
                  </div>
                  {progressCount && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(progressCount.current / progressCount.total) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-center gap-2 mt-2">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}
            </>
          ) : productionMode === 'referenced' ? (
            <>
              <button
                onClick={handleShowRefPromptPreview}
                disabled={!refSourceModel || !refPoseImage || refIsProcessing}
                className={`w-full py-3 rounded-xl font-medium text-gray-900 text-sm flex items-center justify-center gap-2 ${
                  !refSourceModel || !refPoseImage || refIsProcessing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent'
                }`}
              >
                {refIsProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Prompt'u Göster ve Üret</span>
                  </>
                )}
              </button>

              {/* Progress */}
              {refIsProcessing && refProgress && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 mt-2">
                  <div className="flex items-center gap-2 text-secondary text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{refProgress}</span>
                  </div>
                  {refProgressCount && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(refProgressCount.current / refProgressCount.total) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {refError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-center gap-2 mt-2">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <p className="text-red-300 text-xs">{refError}</p>
                </div>
              )}
            </>
          ) : productionMode === 'scene' ? (
            <>
              <button
                onClick={handleShowScenePromptPreview}
                disabled={!sceneSourceModel || !sceneImage || sceneIsProcessing}
                className={`w-full py-3 rounded-xl font-medium text-gray-900 text-sm flex items-center justify-center gap-2 ${
                  !sceneSourceModel || !sceneImage || sceneIsProcessing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-mode-accent to-primary hover:from-mode-accent/90 hover:to-primary/90'
                }`}
              >
                {sceneIsProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Yerleştiriliyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Prompt'u Göster ve Yerleştir</span>
                  </>
                )}
              </button>

              {/* Progress */}
              {sceneIsProcessing && sceneProgress && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 mt-2">
                  <div className="flex items-center gap-2 text-amber-300 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{sceneProgress}</span>
                  </div>
                  {sceneProgressCount && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${(sceneProgressCount.current / sceneProgressCount.total) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {sceneError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-center gap-2 mt-2">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <p className="text-red-300 text-xs">{sceneError}</p>
                </div>
              )}
            </>
          ) : productionMode === 'preset' ? (
            <>
              <button
                onClick={handleShowPresetPromptPreview}
                disabled={presetJewelry.length === 0 || !customBackground || presetIsProcessing || (presetUseCustomModel && !presetModel)}
                className={`w-full py-3 rounded-xl font-medium text-gray-900 text-sm flex items-center justify-center gap-2 ${
                  presetJewelry.length === 0 || !customBackground || presetIsProcessing || (presetUseCustomModel && !presetModel)
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                }`}
              >
                {presetIsProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {presetSettings.useAngleSet
                        ? 'Setli Üret (5 Açı)'
                        : `Oluştur (${presetSettings.numberOfImages} Görsel)`}
                    </span>
                  </>
                )}
              </button>

              {/* Progress */}
              {presetIsProcessing && presetProgress && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 mt-2">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{presetProgress}</span>
                  </div>
                  {presetProgressCount && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${(presetProgressCount.current / presetProgressCount.total) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {presetError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-center gap-2 mt-2">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <p className="text-red-300 text-xs">{presetError}</p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </aside>

      {/* MAIN CONTENT - Results */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {productionMode === 'standard' ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-white p-6 flex-1 flex flex-col min-h-0">
              {results.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative group">
                    <img
                      src={results[selectedResult]?.imageData}
                      alt="Sonuç"
                      className="w-full aspect-square object-contain rounded-lg bg-gray-100"
                    />
                    <button
                      onClick={() => handleDownload(results[selectedResult]?.imageData, selectedResult)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-gray-500/50 hover:bg-black/70 text-gray-900 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-gray-500/50 text-gray-900 text-[10px]">
                      {JEWELRY_SHOOTING_TYPES.find(t => t.id === results[selectedResult]?.shootingType)?.name}
                    </div>
                  </div>

                  {results.length > 1 && (
                    <div className="flex gap-2">
                      {results.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedResult(index)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            selectedResult === index ? 'border-primary' : 'border-transparent hover:border-white/50'
                          }`}
                        >
                          <img src={result.imageData} alt={`${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <Gem className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-xs text-center">Takı yükleyip ayarları seçin</p>
                </div>
              )}
            </div>
          </div>
        ) : productionMode === 'referenced' ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-white p-6 flex-1 flex flex-col min-h-0">
              {refResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative group">
                    <img
                      src={refResults[refSelectedResult]?.imageData}
                      alt="Sonuç"
                      className="w-full aspect-square object-contain rounded-lg bg-gray-100"
                    />
                    <button
                      onClick={() => handleRefDownload(refResults[refSelectedResult]?.imageData, refSelectedResult)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-gray-500/50 hover:bg-black/70 text-gray-900 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-primary/80 text-gray-900 text-[10px]">
                      Referanslı Üretim
                    </div>
                  </div>

                  {refResults.length > 1 && (
                    <div className="flex gap-2">
                      {refResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => setRefSelectedResult(index)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            refSelectedResult === index ? 'border-primary' : 'border-transparent hover:border-white/50'
                          }`}
                        >
                          <img src={result.imageData} alt={`${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <ReferenceIcon className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-xs text-center">Kaynak takı ve referans pozunu yükleyin</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-primary/50" />
                      <span>Kaynak Takı</span>
                    </div>
                    <span>+</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-accent/50" />
                      <span>Referans Poz</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : productionMode === 'scene' ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-white p-6 flex-1 flex flex-col min-h-0">
              {sceneResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative group">
                    <img
                      src={sceneResults[sceneSelectedResult]?.imageData}
                      alt="Sonuç"
                      className="w-full aspect-square object-contain rounded-lg bg-gray-100"
                    />
                    <button
                      onClick={() => handleSceneDownload(sceneResults[sceneSelectedResult]?.imageData, sceneSelectedResult)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-gray-500/50 hover:bg-black/70 text-gray-900 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-amber-500/80 text-gray-900 text-[10px]">
                      Sahneye Yerleştirme
                    </div>
                  </div>

                  {sceneResults.length > 1 && (
                    <div className="flex gap-2">
                      {sceneResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => setSceneSelectedResult(index)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            sceneSelectedResult === index ? 'border-amber-500' : 'border-transparent hover:border-white/50'
                          }`}
                        >
                          <img src={result.imageData} alt={`${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <SceneIcon className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-xs text-center">Takı ve sahne görselini yükleyin</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-amber-500/50" />
                      <span>Kaynak Takı</span>
                    </div>
                    <span>+</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-orange-500/50" />
                      <span>Sahne</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : productionMode === 'preset' ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-white p-6 flex-1 flex flex-col min-h-0">
              {presetResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative group aspect-[2/3] max-h-[500px] rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={presetResults[presetSelectedResult]?.imageData}
                      alt="Sonuç"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => handlePresetDownload(presetResults[presetSelectedResult]?.imageData, presetSelectedResult)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-gray-500/50 hover:bg-black/70 text-gray-900 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-cyan-500/80 text-gray-900 text-[10px]">
                      Hazır Sahne
                    </div>
                  </div>

                  {presetResults.length > 1 && (
                    <div className="flex gap-2">
                      {presetResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => setPresetSelectedResult(index)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            presetSelectedResult === index ? 'border-cyan-500' : 'border-transparent hover:border-white/50'
                          }`}
                        >
                          <img src={result.imageData} alt={`${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <PresetIcon className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-xs text-center">Takılar yükleyin ve hazır sahne seçin</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-cyan-500/50" />
                      <span>Takılar</span>
                    </div>
                    <span>+</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-pink-500/50" />
                      <span>Model (Opsiyonel)</span>
                    </div>
                    <span>+</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-blue-500/50" />
                      <span>Sahne</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      {/* Prompt Önizleme Modal */}
      {showPromptPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  productionMode === 'standard'
                    ? 'bg-gradient-to-br from-primary to-pink-500'
                    : productionMode === 'referenced'
                      ? 'bg-gradient-to-br from-primary to-accent'
                      : productionMode === 'scene'
                        ? 'bg-gradient-to-br from-mode-accent to-primary'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                }`}>
                  <Sparkles className="w-4 h-4 text-gray-900" />
                </div>
                <div>
                  <h2 className="text-gray-900 text-sm font-semibold">Prompt Önizleme</h2>
                  <p className="text-gray-500 text-[10px]">Bu prompt ile görsel üretilecek</p>
                </div>
              </div>
              <button
                onClick={() => setShowPromptPreview(false)}
                className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <pre className="text-gray-700 text-xs whitespace-pre-wrap font-mono leading-relaxed">
                  {currentPromptPreview}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 gap-3">
              <button
                onClick={() => setShowPromptPreview(false)}
                className="px-4 py-2.5 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  if (productionMode === 'standard') {
                    handleGenerate();
                  } else if (productionMode === 'referenced') {
                    handleRefGenerate();
                  } else if (productionMode === 'scene') {
                    handleSceneGenerate();
                  } else if (productionMode === 'preset') {
                    handlePresetGenerate();
                  }
                }}
                className={`px-6 py-2.5 rounded-lg font-medium text-gray-900 text-sm flex items-center gap-2 ${
                  productionMode === 'standard'
                    ? 'bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-600'
                    : productionMode === 'referenced'
                      ? 'bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent'
                      : productionMode === 'scene'
                        ? 'bg-gradient-to-r from-mode-accent to-primary hover:from-mode-accent/90 hover:to-primary/90'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Bu Prompt ile Oluştur</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JewelryMode;
