import React, { useState, useRef, useCallback } from 'react';
import {
  Shirt,
  Upload,
  Download,
  X,
  Check,
  AlertCircle,
  Loader2,
  ImageIcon,
  Sparkles,
  ChevronDown,
  User,
  Trash2,
  Camera,
  MapPin,
  Layers
} from 'lucide-react';
import {
  MensFashionSettings,
  MENS_FASHION_PURPOSE_OPTIONS,
  MENS_FASHION_POSE_OPTIONS,
  MENS_FASHION_BACKGROUNDS,
  MENS_FASHION_BACKGROUND_STYLES,
  SKIN_TONE_OPTIONS,
  ReferencedProductionSettings,
  REFERENCED_PRODUCTION_DEFAULTS,
  ScenePlacementSettings,
  SCENE_PLACEMENT_DEFAULTS,
  POSE_SUGGESTIONS,
  REFERENCED_POSE_OPTIONS,
  POSE_CATEGORIES,
  AnimalSettings,
  ANIMAL_DEFAULTS,
  ANIMAL_TYPES,
  DOG_BREEDS,
  CAT_BREEDS,
  BIRD_BREEDS,
  RABBIT_BREEDS,
  HORSE_BREEDS,
  ANIMAL_POSITIONS,
  ANIMAL_POSES,
  ANIMAL_SIZES,
  ANIMAL_LOOK_DIRECTIONS,
  COLLAR_TYPE_OPTIONS,
  FABRIC_TYPE_OPTIONS,
  SPALLA_CAMICIA_OPTIONS,
  PLEAT_TYPE_OPTIONS,
  TROUSER_FIT_OPTIONS,
  TROUSER_FABRIC_TYPE_OPTIONS,
  TROUSER_WAIST_RISE_OPTIONS,
  KNITWEAR_TYPE_OPTIONS,
  SHIRT_TUCK_OPTIONS,
  IMAGE_ASPECT_RATIO_OPTIONS,
  CAMERA_FRAME_OPTIONS,
  CAMERA_ANGLE_OPTIONS,
  PROMPT_CAMERA_ANGLE_OPTIONS,
  STANDARD_SHOT_SCALES,
  SPECIAL_SHOT_SCALES,
  LENS_OPTIONS,
  LIGHTING_STYLE_OPTIONS,
  WOOD_TYPE_OPTIONS,
  FLOOR_TYPE_OPTIONS,
  STUDIO_MINIMAL_GRADIENT_COLORS,
  SHOT_TYPE_OPTIONS,
  // Preset sistemi
  PresetProductionSettings,
  PRESET_PRODUCTION_DEFAULTS,
  BACKGROUND_PRESETS,
  PRESET_CATEGORIES,
  PRESET_ASPECT_RATIOS,
  PRESET_CAMERA_ANGLES,
  PRESET_MODEL_SCALES
} from '../types';
import {
  generateMensFashionImage,
  generateMultipleMensFashionImages,
  generateReferencedProduction,
  generateMultipleReferencedProductions,
  ReferencedProductionResult,
  generateReferenced2Production,
  generateMultipleReferenced2Productions,
  generateScenePlacement,
  generateMultipleScenePlacements,
  ScenePlacementResult,
  buildMensFashionPromptPreview,
  buildReferencedProductionPromptPreview,
  buildScenePlacementPromptPreview,
  // Preset sistemi
  generatePresetProduction,
  generateMultiplePresetProductions,
  PresetProductionResult,
  buildPresetProductionPromptPreview
} from '../services/geminiService';
import { processImageWithAntiGlow, ANTIGLOW_PRESETS } from '../lib/antiGlow';

interface MensFashionGenerationResult {
  imageData: string;
  aiModel: string;
  purpose: string;
}

// Mod tipleri
type ProductionMode = 'standard' | 'referenced' | 'referenced2';

interface MensFashionModeProps {
  onClose?: () => void;
  userCredits?: number;
  isUserAdmin?: boolean;
  onShowPricing?: () => void;
  onCreditsUsed?: (credits: number) => void;
  initialMode?: ProductionMode;
  onModeChange?: (mode: ProductionMode) => void;
}

// Preset ikonu
const PresetIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
    <circle cx="6" cy="6" r="1" />
    <path d="M14 15l2 2 4-4" />
  </svg>
);

// Sahne ikonu
const SceneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 10h20" />
    <circle cx="8" cy="7" r="1" />
    <path d="M6 20l4-6 3 3 5-7 4 10" />
  </svg>
);

// Referans ikonu
const ReferenceIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <path d="M10 6h4" />
    <path d="M12 14v7" />
    <path d="M9 18l3 3 3-3" />
  </svg>
);

const MensFashionMode: React.FC<MensFashionModeProps> = ({
  onClose,
  userCredits = 0,
  isUserAdmin = false,
  onShowPricing,
  onCreditsUsed,
  initialMode = 'standard',
  onModeChange
}) => {
  // Mod seçimi - initialMode prop'u ile başlatılır
  const [productionMode, setProductionMode] = useState<ProductionMode>(initialMode);

  // Mod değişikliğinde state'leri temizle
  const handleModeChange = useCallback((newMode: ProductionMode) => {
    // Hata ve progress'i temizle
    setError(null);
    setProgress('');
    setProgressCount(null);
    setIsProcessing(false);
    setShowPromptPreview(false);

    // Modu değiştir
    setProductionMode(newMode);

    // Parent component'e bildir
    onModeChange?.(newMode);

    console.log(`🔄 Mode changed to ${newMode}`);
  }, [onModeChange]);

  // initialMode prop'u değiştiğinde state'i güncelle
  React.useEffect(() => {
    if (initialMode !== productionMode) {
      handleModeChange(initialMode);
    }
  }, [initialMode, handleModeChange]);

  // Standard mod state'leri
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [additionalClothes, setAdditionalClothes] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [referenceModel, setReferenceModel] = useState<File | null>(null);
  const [referenceModelPreview, setReferenceModelPreview] = useState<string | null>(null);
  const [useReferenceModel, setUseReferenceModel] = useState<boolean>(false);
  const [results, setResults] = useState<MensFashionGenerationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [progressCount, setProgressCount] = useState<{ current: number; total: number } | null>(null);

  // Referanslı üretim state'leri
  const [refSourceModel, setRefSourceModel] = useState<File | null>(null);
  const [refSourceModelPreview, setRefSourceModelPreview] = useState<string | null>(null);
  const [refPoseImage, setRefPoseImage] = useState<File | null>(null);
  const [refPosePreview, setRefPosePreview] = useState<string | null>(null);
  const [refResults, setRefResults] = useState<ReferencedProductionResult[]>([]);
  const [refSelectedResult, setRefSelectedResult] = useState<number>(0);
  const [refSettings, setRefSettings] = useState<ReferencedProductionSettings>(REFERENCED_PRODUCTION_DEFAULTS);
  
  // Sahneye yerleştirme state'leri
  const [sceneSourceModel, setSceneSourceModel] = useState<File | null>(null);
  const [sceneSourceModelPreview, setSceneSourceModelPreview] = useState<string | null>(null);
  const [sceneImage, setSceneImage] = useState<File | null>(null);
  const [scenePreview, setScenePreview] = useState<string | null>(null);
  const [sceneResults, setSceneResults] = useState<ScenePlacementResult[]>([]);
  const [sceneSelectedResult, setSceneSelectedResult] = useState<number>(0);
  const [sceneSettings, setSceneSettings] = useState<ScenePlacementSettings>(SCENE_PLACEMENT_DEFAULTS);

  // Hazır Sahne (Preset) state'leri - KIYAFET + MANKEN TABANLI
  const [presetClothes, setPresetClothes] = useState<File[]>([]); // Birden fazla kıyafet
  const [presetClothesPreviews, setPresetClothesPreviews] = useState<string[]>([]);
  const [presetModel, setPresetModel] = useState<File | null>(null); // Opsiyonel manken
  const [presetModelPreview, setPresetModelPreview] = useState<string | null>(null);
  const [presetUseCustomModel, setPresetUseCustomModel] = useState<boolean>(false); // Manken kullan/kullanma
  const [presetResults, setPresetResults] = useState<PresetProductionResult[]>([]);
  const [presetSelectedResult, setPresetSelectedResult] = useState<number>(0);
  const [presetSettings, setPresetSettings] = useState<PresetProductionSettings>(PRESET_PRODUCTION_DEFAULTS);
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('all');
  // Özel arka plan
  const [customBackground, setCustomBackground] = useState<File | null>(null);
  const [customBackgroundPreview, setCustomBackgroundPreview] = useState<string | null>(null);

  // Referanslı 2 state'leri
  const [ref2ModelImage, setRef2ModelImage] = useState<File | null>(null);
  const [ref2ModelPreview, setRef2ModelPreview] = useState<string | null>(null);
  const [ref2GarmentImages, setRef2GarmentImages] = useState<File[]>([]);
  const [ref2GarmentPreviews, setRef2GarmentPreviews] = useState<string[]>([]);
  const [ref2SceneImage, setRef2SceneImage] = useState<File | null>(null);
  const [ref2ScenePreview, setRef2ScenePreview] = useState<string | null>(null);
  const [ref2Prompt, setRef2Prompt] = useState<string>('');
  const [ref2Results, setRef2Results] = useState<ReferencedProductionResult[]>([]);
  const [ref2SelectedResult, setRef2SelectedResult] = useState<number>(0);
  const [ref2NumberOfImages, setRef2NumberOfImages] = useState<number>(1);

  // Prompt önizleme state'leri
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false);
  const [currentPromptPreview, setCurrentPromptPreview] = useState<string>('');
  const [useSpecialShotScale, setUseSpecialShotScale] = useState(false);

  const [settings, setSettings] = useState<MensFashionSettings>({
    purpose: 'ecommerce',
    skinTone: 'medium',
    poseStyle: 'neutral',
    background: 'white',
    backgroundStyle: 'solid',
    floorType: 'seamless',
    numberOfImages: 1,
    aspectRatio: '3:4',
    cameraFrame: 'full-body',
    cameraAngle: 'eye_level',
    shotScale: 'full_shot',
    lens: '85mm_portrait',
    lightingStyle: 'soft-studio',
    woodType: 'oak-light',
    customPrompt: '',
    animal: ANIMAL_DEFAULTS,
    collarType: 'auto',
    fabricType: 'auto',
    pleatType: 'auto',
    trouserFit: 'auto',
    trouserFabricType: 'auto',
    trouserWaistRise: 'auto',
    knitwearType: 'auto',
    shirtTuck: 'auto',
    spallaCamicia: 'auto',
    jacketHemLengthen: false,
    removeBrooch: false,
    trouserLegLengthen: false,
    studioMinimalColor: 'pure-white',
    studioMinimalVignette: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);
  const referenceModelInputRef = useRef<HTMLInputElement>(null);
  const refSourceInputRef = useRef<HTMLInputElement>(null);
  const refPoseInputRef = useRef<HTMLInputElement>(null);
  const sceneSourceInputRef = useRef<HTMLInputElement>(null);
  const sceneImageInputRef = useRef<HTMLInputElement>(null);
  const presetClothesInputRef = useRef<HTMLInputElement>(null);
  const presetModelInputRef = useRef<HTMLInputElement>(null);
  const customBackgroundInputRef = useRef<HTMLInputElement>(null);
  const ref2ModelInputRef = useRef<HTMLInputElement>(null);
  const ref2GarmentInputRef = useRef<HTMLInputElement>(null);
  const ref2SceneInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = <K extends keyof MensFashionSettings>(key: K, value: MensFashionSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Hayvan ayarlarını güncelleme fonksiyonu
  const updateAnimalSetting = <K extends keyof AnimalSettings>(key: K, value: AnimalSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      animal: {
        ...(prev.animal || ANIMAL_DEFAULTS),
        [key]: value
      }
    }));
  };

  // Hayvan türüne göre cins listesini getir
  const getBreedOptions = (animalType: string) => {
    switch (animalType) {
      case 'dog': return DOG_BREEDS;
      case 'cat': return CAT_BREEDS;
      case 'bird': return BIRD_BREEDS;
      case 'rabbit': return RABBIT_BREEDS;
      case 'horse': return HORSE_BREEDS;
      default: return DOG_BREEDS;
    }
  };

  // Referanslı mod hayvan ayarlarını güncelleme fonksiyonu
  const updateRefAnimalSetting = <K extends keyof AnimalSettings>(key: K, value: AnimalSettings[K]) => {
    setRefSettings(prev => ({
      ...prev,
      animal: {
        ...(prev.animal || ANIMAL_DEFAULTS),
        [key]: value
      }
    }));
  };

  // Sahne modu hayvan ayarlarını güncelleme fonksiyonu
  const updateSceneAnimalSetting = <K extends keyof AnimalSettings>(key: K, value: AnimalSettings[K]) => {
    setSceneSettings(prev => ({
      ...prev,
      animal: {
        ...(prev.animal || ANIMAL_DEFAULTS),
        [key]: value
      }
    }));
  };

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

  const handleAdditionalUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && additionalClothes.length < 6) { // Max 6 ek kıyafet (toplam 7 ile ana)
      setAdditionalClothes(prev => [...prev, file]);
      setResults([]);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAdditionalPreviews(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
      if (additionalInputRef.current) additionalInputRef.current.value = '';
    }
  }, [additionalClothes.length]);

  const removeAdditionalCloth = (index: number) => {
    setAdditionalClothes(prev => prev.filter((_, i) => i !== index));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleReferenceModelUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceModel(file);
      setUseReferenceModel(true);
      setResults([]);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => setReferenceModelPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const removeReferenceModel = () => {
    setReferenceModel(null);
    setReferenceModelPreview(null);
    setUseReferenceModel(false);
    if (referenceModelInputRef.current) {
      referenceModelInputRef.current.value = '';
    }
  };

  // Prompt önizleme fonksiyonu - Standart mod
  const handleShowPromptPreview = () => {
    const prompt = buildMensFashionPromptPreview(
      settings,
      useReferenceModel && !!referenceModel,
      additionalClothes.length
    );
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
    // Debug: Oluştura basıldığında settings'i logla
    console.log('🚀 handleGenerate çağrıldı - Current Settings:', {
      purpose: settings.purpose,
      poseStyle: settings.poseStyle,
      skinTone: settings.skinTone,
      background: settings.background,
      backgroundStyle: settings.backgroundStyle,
      numberOfImages: settings.numberOfImages
    });

    if (!sourceImage) {
      setError('Lutfen bir urun gorseli yukleyin.');
      return;
    }

    // Kredi kontrolü
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
    setProgress('Hazirlaniyor...');

    try {
      // Pass referenceModel if enabled
      const refModel = useReferenceModel ? referenceModel : null;

      // Debug: Referans model durumu
      console.log('🔍 Reference Model Debug:', {
        useReferenceModel,
        hasReferenceModel: !!referenceModel,
        refModelWillBeSent: !!refModel,
        referenceModelName: referenceModel?.name
      });

      if (settings.numberOfImages === 1) {
        const result = await generateMensFashionImage(sourceImage, settings, (msg) => setProgress(msg), refModel, additionalClothes);
        setResults([result]);
        // Başarılı üretim sonrası kredi düş
        if (!isUserAdmin) onCreditsUsed?.(1);
      } else {
        const results = await generateMultipleMensFashionImages(sourceImage, settings, (msg, current, total) => {
          setProgress(msg);
          setProgressCount({ current, total });
        }, refModel, additionalClothes);
        setResults(results);
        // Başarılı üretim sonrası kredi düş
        if (!isUserAdmin) onCreditsUsed?.(results.length);
      }
      setProgress('');
      setProgressCount(null);
    } catch (err: any) {
      setError(err.message || 'Gorsel olusturulurken bir hata olustu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `mens-fashion-${settings.purpose}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // === REFERANSLI ÜRETİM FONKSİYONLARI ===
  const handleRefSourceUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefSourceModel(file);
      setRefResults([]);
      setError(null);
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
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => setRefPosePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const removeRefSourceModel = () => {
    setRefSourceModel(null);
    setRefSourceModelPreview(null);
    if (refSourceInputRef.current) refSourceInputRef.current.value = '';
  };

  const removeRefPoseImage = () => {
    setRefPoseImage(null);
    setRefPosePreview(null);
    if (refPoseInputRef.current) refPoseInputRef.current.value = '';
  };

  const handleRefGenerate = async () => {
    if (!refSourceModel) {
      setError('Lütfen manken fotoğrafı yükleyin.');
      return;
    }
    if (!refPoseImage) {
      setError('Lütfen referans poz fotoğrafı yükleyin.');
      return;
    }

    // Kredi kontrolü
    const requiredCredits = refSettings.numberOfImages || 1;
    if (!isUserAdmin && userCredits < requiredCredits) {
      setError(`Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
      onShowPricing?.();
      return;
    }

    setShowPromptPreview(false); // Modal'ı kapat
    setIsProcessing(true);
    setError(null);
    setRefResults([]);
    setProgress('Hazırlanıyor...');

    // Debug: Hayvan ayarlarını kontrol et
    console.log('🐾 Referenced Production - Animal Settings:', {
      animalEnabled: refSettings.animal?.enabled,
      animalType: refSettings.animal?.animalType,
      breed: refSettings.animal?.breed,
      fullAnimalSettings: refSettings.animal
    });

    try {
      if (refSettings.numberOfImages === 1) {
        const result = await generateReferencedProduction(
          refSourceModel,
          refPoseImage,
          refSettings,
          (msg) => setProgress(msg)
        );
        setRefResults([result]);
        // Başarılı üretim sonrası kredi düş
        if (!isUserAdmin) onCreditsUsed?.(1);
      } else {
        const results = await generateMultipleReferencedProductions(
          refSourceModel,
          refPoseImage,
          refSettings,
          (msg, current, total) => {
            setProgress(msg);
            setProgressCount({ current, total });
          }
        );
        setRefResults(results);
        // Başarılı üretim sonrası kredi düş
        if (!isUserAdmin) onCreditsUsed?.(results.length);
      }
      setProgress('');
      setProgressCount(null);
    } catch (err: any) {
      setError(err.message || 'Referanslı üretim sırasında bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `mens-referenced-production-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateRefSetting = <K extends keyof ReferencedProductionSettings>(key: K, value: ReferencedProductionSettings[K]) => {
    setRefSettings(prev => ({ ...prev, [key]: value }));
  };

  // === REFERANSLI 2 FONKSİYONLARI ===
  const handleRef2ModelUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRef2ModelImage(file);
      setRef2Results([]);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => setRef2ModelPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRef2GarmentUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ref2GarmentImages.length < 5) {
      setRef2GarmentImages(prev => [...prev, file]);
      setRef2Results([]);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setRef2GarmentPreviews(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
      if (ref2GarmentInputRef.current) ref2GarmentInputRef.current.value = '';
    }
  }, [ref2GarmentImages.length]);

  const removeRef2Garment = (index: number) => {
    setRef2GarmentImages(prev => prev.filter((_, i) => i !== index));
    setRef2GarmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRef2SceneUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRef2SceneImage(file);
      setRef2Results([]);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => setRef2ScenePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const removeRef2Model = () => {
    setRef2ModelImage(null);
    setRef2ModelPreview(null);
    if (ref2ModelInputRef.current) ref2ModelInputRef.current.value = '';
  };

  const removeRef2Scene = () => {
    setRef2SceneImage(null);
    setRef2ScenePreview(null);
    if (ref2SceneInputRef.current) ref2SceneInputRef.current.value = '';
  };

  const handleRef2Generate = async () => {
    if (!ref2ModelImage) {
      setError('Lütfen manken fotoğrafı yükleyin.');
      return;
    }
    if (ref2GarmentImages.length === 0) {
      setError('Lütfen en az 1 kıyafet fotoğrafı yükleyin.');
      return;
    }
    if (!ref2SceneImage) {
      setError('Lütfen mekan fotoğrafı yükleyin.');
      return;
    }

    const requiredCredits = ref2NumberOfImages;
    if (!isUserAdmin && userCredits < requiredCredits) {
      setError(`Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
      onShowPricing?.();
      return;
    }

    setIsProcessing(true);
    setError(null);
    setRef2Results([]);
    setProgress('Hazırlanıyor...');

    try {
      if (ref2NumberOfImages === 1) {
        const result = await generateReferenced2Production(
          ref2ModelImage,
          ref2GarmentImages,
          ref2SceneImage,
          ref2Prompt,
          (msg) => setProgress(msg)
        );
        setRef2Results([result]);
        if (!isUserAdmin) onCreditsUsed?.(1);
      } else {
        const results = await generateMultipleReferenced2Productions(
          ref2ModelImage,
          ref2GarmentImages,
          ref2SceneImage,
          ref2Prompt,
          ref2NumberOfImages,
          (msg, current, total) => {
            setProgress(msg);
            setProgressCount({ current, total });
          }
        );
        setRef2Results(results);
        if (!isUserAdmin) onCreditsUsed?.(results.length);
      }
      setProgress('');
      setProgressCount(null);
    } catch (err: any) {
      setError(err.message || 'Referanslı 2 üretim sırasında bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRef2Download = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `mens-referenced2-production-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // === SAHNEYE YERLEŞTİRME FONKSİYONLARI ===
  const handleSceneSourceUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSceneSourceModel(file);
      setSceneResults([]);
      setError(null);
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
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => setScenePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const removeSceneSourceModel = () => {
    setSceneSourceModel(null);
    setSceneSourceModelPreview(null);
    if (sceneSourceInputRef.current) sceneSourceInputRef.current.value = '';
  };

  const removeSceneImage = () => {
    setSceneImage(null);
    setScenePreview(null);
    if (sceneImageInputRef.current) sceneImageInputRef.current.value = '';
  };

  const handleSceneGenerate = async () => {
    if (!sceneSourceModel) {
      setError('Lütfen manken fotoğrafı yükleyin.');
      return;
    }
    if (!sceneImage) {
      setError('Lütfen sahne fotoğrafı yükleyin.');
      return;
    }

    // Kredi kontrolü
    const requiredCredits = sceneSettings.numberOfImages || 1;
    if (!isUserAdmin && userCredits < requiredCredits) {
      setError(`Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
      onShowPricing?.();
      return;
    }

    setShowPromptPreview(false); // Modal'ı kapat
    setIsProcessing(true);
    setError(null);
    setSceneResults([]);
    setProgress('Hazırlanıyor...');

    try {
      if (sceneSettings.numberOfImages === 1) {
        const result = await generateScenePlacement(
          sceneSourceModel,
          sceneImage,
          sceneSettings,
          (msg) => setProgress(msg)
        );
        setSceneResults([result]);
        // Başarılı üretim sonrası kredi düş
        if (!isUserAdmin) onCreditsUsed?.(1);
      } else {
        const results = await generateMultipleScenePlacements(
          sceneSourceModel,
          sceneImage,
          sceneSettings,
          (msg, current, total) => {
            setProgress(msg);
            setProgressCount({ current, total });
          }
        );
        setSceneResults(results);
        // Başarılı üretim sonrası kredi düş
        if (!isUserAdmin) onCreditsUsed?.(results.length);
      }
      setProgress('');
      setProgressCount(null);
    } catch (err: any) {
      setError(err.message || 'Sahneye yerleştirme sırasında bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSceneDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `mens-scene-placement-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateSceneSetting = <K extends keyof ScenePlacementSettings>(key: K, value: ScenePlacementSettings[K]) => {
    setSceneSettings(prev => ({ ...prev, [key]: value }));
  };

  // === HAZIR SAHNE (PRESET) FONKSİYONLARI - KIYAFET + MANKEN TABANLI ===
  const handlePresetClothesUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && presetClothes.length < 7) { // Max 7 kıyafet
      setPresetClothes(prev => [...prev, file]);
      setPresetResults([]);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPresetClothesPreviews(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    }
    if (presetClothesInputRef.current) presetClothesInputRef.current.value = '';
  }, [presetClothes.length]);

  const handlePresetModelUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPresetModel(file);
      setPresetResults([]);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => setPresetModelPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
    if (presetModelInputRef.current) presetModelInputRef.current.value = '';
  }, []);

  const removePresetCloth = (index: number) => {
    setPresetClothes(prev => prev.filter((_, i) => i !== index));
    setPresetClothesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removePresetModel = () => {
    setPresetModel(null);
    setPresetModelPreview(null);
  };

  // Özel arka plan yükleme
  const handleCustomBackgroundUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomBackground(file);
      setPresetResults([]);
      setError(null);
      // Özel arka plan seçildiğinde preset seçimini "custom" yap
      updatePresetSetting('selectedPreset', 'custom');
      const reader = new FileReader();
      reader.onload = (event) => setCustomBackgroundPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
    if (customBackgroundInputRef.current) customBackgroundInputRef.current.value = '';
  }, []);

  const removeCustomBackground = () => {
    setCustomBackground(null);
    setCustomBackgroundPreview(null);
    // Özel arka plan kaldırılınca preset seçimini temizle
    if (presetSettings.selectedPreset === 'custom') {
      updatePresetSetting('selectedPreset', null);
    }
  };

  const updatePresetSetting = <K extends keyof PresetProductionSettings>(key: K, value: PresetProductionSettings[K]) => {
    setPresetSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePresetGenerate = async () => {
    if (presetClothes.length === 0) {
      setError('Lütfen en az bir kıyafet fotoğrafı yükleyin.');
      return;
    }
    // Arka plan zorunlu
    if (!customBackground) {
      setError('Lütfen bir arka plan görseli yükleyin.');
      return;
    }
    // Eğer kendi manken kullan seçiliyse manken zorunlu
    if (presetUseCustomModel && !presetModel) {
      setError('Lütfen manken fotoğrafı yükleyin veya "Kendi Mankenim" seçeneğini kapatın.');
      return;
    }

    // Kredi kontrolü - Setli üretim 5 kredi, normal numberOfImages kadar
    const requiredCredits = presetSettings.useAngleSet ? 5 : (presetSettings.numberOfImages || 1);
    if (!isUserAdmin && userCredits < requiredCredits) {
      setError(`Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
      onShowPricing?.();
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPresetResults([]);

    try {
      // Setli üretim modu - her zaman 5 farklı açıdan üret
      if (presetSettings.useAngleSet) {
        const results = await generateMultiplePresetProductions(
          presetClothes,
          'custom', // Artık sadece özel arka plan var
          presetSettings,
          (msg, current, total) => {
            setProgress(msg);
            setProgressCount({ current, total });
          },
          presetUseCustomModel ? presetModel : undefined,
          customBackground
        );
        setPresetResults(results);
        if (!isUserAdmin) onCreditsUsed?.(results.length);
      } else if (presetSettings.numberOfImages === 1) {
        // Tekli üretim
        const result = await generatePresetProduction(
          presetClothes,
          'custom', // Artık sadece özel arka plan var
          presetSettings,
          (msg) => setProgress(msg),
          presetUseCustomModel ? presetModel : undefined,
          customBackground
        );
        setPresetResults([result]);
        if (!isUserAdmin) onCreditsUsed?.(1);
      } else {
        // Çoklu normal üretim
        const results = await generateMultiplePresetProductions(
          presetClothes,
          'custom', // Artık sadece özel arka plan var
          presetSettings,
          (msg, current, total) => {
            setProgress(msg);
            setProgressCount({ current, total });
          },
          presetUseCustomModel ? presetModel : undefined,
          customBackground
        );
        setPresetResults(results);
        if (!isUserAdmin) onCreditsUsed?.(results.length);
      }
      setProgress('');
      setProgressCount(null);
    } catch (err: any) {
      setError(err.message || 'Hazır sahne üretimi sırasında bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    const preset = BACKGROUND_PRESETS.find(p => p.id === presetSettings.selectedPreset);
    link.download = `mens-preset-${preset?.name?.replace(/\s+/g, '-').toLowerCase() || 'scene'}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShowPresetPromptPreview = () => {
    if (!customBackground) {
      setError('Lütfen bir arka plan görseli yükleyin.');
      return;
    }
    const promptPreview = buildPresetProductionPromptPreview(
      presetSettings.selectedPreset,
      presetSettings,
      presetClothes.length,
      presetUseCustomModel
    );
    setCurrentPromptPreview(promptPreview);
    setShowPromptPreview(true);
  };

  // Filtrelenmiş preset'ler
  const filteredPresets = presetCategoryFilter === 'all'
    ? BACKGROUND_PRESETS
    : BACKGROUND_PRESETS.filter(p => p.category === presetCategoryFilter);

  return (
    <div className="h-full w-full flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-[380px] flex-shrink-0 bg-bg-surface border-r border-white/10 flex flex-col h-full">
        {/* Hidden file inputs */}
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <input type="file" ref={additionalInputRef} onChange={handleAdditionalUpload} accept="image/*" className="hidden" />
        <input type="file" ref={referenceModelInputRef} onChange={handleReferenceModelUpload} accept="image/*" className="hidden" />
        <input type="file" ref={refSourceInputRef} onChange={handleRefSourceUpload} accept="image/*" className="hidden" />
        <input type="file" ref={refPoseInputRef} onChange={handleRefPoseUpload} accept="image/*" className="hidden" />
        <input type="file" ref={sceneSourceInputRef} onChange={handleSceneSourceUpload} accept="image/*" className="hidden" />
        <input type="file" ref={sceneImageInputRef} onChange={handleSceneImageUpload} accept="image/*" className="hidden" />
        <input type="file" ref={presetClothesInputRef} onChange={handlePresetClothesUpload} accept="image/*" className="hidden" />
        <input type="file" ref={presetModelInputRef} onChange={handlePresetModelUpload} accept="image/*" className="hidden" />
        <input type="file" ref={customBackgroundInputRef} onChange={handleCustomBackgroundUpload} accept="image/*" className="hidden" />
        <input type="file" ref={ref2ModelInputRef} onChange={handleRef2ModelUpload} accept="image/*" className="hidden" />
        <input type="file" ref={ref2GarmentInputRef} onChange={handleRef2GarmentUpload} accept="image/*" className="hidden" />
        <input type="file" ref={ref2SceneInputRef} onChange={handleRef2SceneUpload} accept="image/*" className="hidden" />

        {/* Scrollable Content - Settings Only */}
        <div className="flex-1 overflow-y-auto">
        {productionMode === 'standard' ? (
          <div className="p-3 space-y-2">
            {/* Compact Image Uploads - All in one card */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görseller</h3>

              <div className="flex gap-2 flex-wrap">
                {/* Main Product */}
                {sourcePreview ? (
                  <div className="relative group w-16 h-16 flex-shrink-0">
                    <img src={sourcePreview} alt="Ana" className="w-full h-full object-cover rounded-lg ring-2 ring-mode-accent" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    >
                      <Upload className="w-3 h-3 text-gray-900" />
                    </button>
                    <span className="absolute -top-1 -left-1 w-4 h-4 bg-mode-accent rounded-full flex items-center justify-center text-[8px] text-gray-900 font-bold">1</span>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-mode-accent/50 hover:border-mode-accent flex flex-col items-center justify-center text-mode-accent hover:text-mode-accent transition-all"
                  >
                    <Shirt className="w-4 h-4" />
                    <span className="text-[8px] mt-0.5">Ana</span>
                  </button>
                )}

                {/* Additional Clothes */}
                {additionalPreviews.map((preview, index) => (
                  <div key={index} className="relative group w-16 h-16 flex-shrink-0">
                    <img src={preview} alt={`Ek ${index + 1}`} className="w-full h-full object-cover rounded-lg ring-1 ring-gray-200" />
                    <button
                      onClick={() => removeAdditionalCloth(index)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    >
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                    <span className="absolute -top-1 -left-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-[8px] text-gray-900 font-bold">{index + 2}</span>
                  </div>
                ))}

                {/* Add More Button */}
                {sourcePreview && additionalClothes.length < 6 && (
                  <button
                    onClick={() => additionalInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-white/40 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
                  >
                    <span className="text-lg">+</span>
                    <span className="text-[8px]">Ekle</span>
                  </button>
                )}

                {/* Divider */}
                {sourcePreview && <div className="w-px h-16 bg-gray-100 mx-1" />}

                {/* Reference Model */}
                {referenceModelPreview ? (
                  <div className="relative group w-16 h-16 flex-shrink-0">
                    <img src={referenceModelPreview} alt="Model" className="w-full h-full object-cover rounded-lg ring-2 ring-green-500" />
                    <button
                      onClick={removeReferenceModel}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                    <span className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="w-2.5 h-2.5 text-gray-900" />
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => referenceModelInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-green-500/30 hover:border-green-500/60 flex flex-col items-center justify-center text-green-600 hover:text-green-400 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-[8px] mt-0.5">Model</span>
                  </button>
                )}

              </div>

              {(additionalClothes.length > 0 || referenceModelPreview) && (
                <p className="text-[9px] text-gray-500 mt-2">
                  {additionalClothes.length > 0 && `${additionalClothes.length + 1} kıyafet`}
                  {additionalClothes.length > 0 && referenceModelPreview && ' • '}
                  {referenceModelPreview && (
                    <span className={useReferenceModel ? 'text-green-400' : 'text-gray-500'}>
                      Referans model {useReferenceModel ? '✓ aktif' : '(pasif)'}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Çekim Ölçeği (Shot Scale) */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-300 text-[10px] font-medium">Çekim Ölçeği</h3>
                <button
                  onClick={() => {
                    setUseSpecialShotScale(!useSpecialShotScale);
                    if (!useSpecialShotScale) {
                      updateSetting('shotScale', SPECIAL_SHOT_SCALES[0].value);
                    } else {
                      updateSetting('shotScale', STANDARD_SHOT_SCALES[0].value);
                    }
                  }}
                  className={`px-2 py-0.5 text-[8px] font-semibold rounded-md transition-all ${
                    useSpecialShotScale
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  ÖZEL
                </button>
              </div>
              <div className="relative">
                <select
                  value={settings.shotScale || 'full_shot'}
                  onChange={(e) => updateSetting('shotScale', e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-border-default rounded-lg px-3 py-2 pr-8 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-mode-accent focus:border-transparent cursor-pointer hover:border-border-strong"
                >
                  {(useSpecialShotScale ? SPECIAL_SHOT_SCALES : STANDARD_SHOT_SCALES).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Kamera Açısı */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Kamera Açısı</h3>
              <div className="relative">
                <select
                  value={settings.cameraAngle || 'eye_level'}
                  onChange={(e) => updateSetting('cameraAngle', e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-border-default rounded-lg px-3 py-2 pr-8 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-mode-accent focus:border-transparent cursor-pointer hover:border-border-strong"
                >
                  {PROMPT_CAMERA_ANGLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Lens */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Lens</h3>
              <div className="relative">
                <select
                  value={settings.lens || '85mm_portrait'}
                  onChange={(e) => updateSetting('lens', e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-border-default rounded-lg px-3 py-2 pr-8 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-mode-accent focus:border-transparent cursor-pointer hover:border-border-strong"
                >
                  {LENS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Işık Stili / Lighting Style */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Işık Stili</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {LIGHTING_STYLE_OPTIONS.map((light) => (
                  <button
                    key={light.id}
                    onClick={() => updateSetting('lightingStyle', light.id)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      settings.lightingStyle === light.id
                        ? 'bg-yellow-500/30 border-yellow-500 border'
                        : 'bg-white border-gray-200 border hover:bg-gray-100'
                    }`}
                    title={light.description}
                  >
                    <span className="text-lg block mb-0.5">{light.icon}</span>
                    <span className="text-gray-900 text-[8px] font-medium block truncate">{light.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-[9px] mt-1.5">
                {LIGHTING_STYLE_OPTIONS.find(l => l.id === settings.lightingStyle)?.description}
              </p>
            </div>

            {/* Özel Prompt Girişi */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">✏️ Özel Talimat (Opsiyonel)</h3>
              <textarea
                value={settings.customPrompt || ''}
                onChange={(e) => updateSetting('customPrompt', e.target.value)}
                placeholder="Örn: Ceketten bronşu kaldır, Kravat ekleme, Gömlek düğmelerini kapat..."
                className="w-full bg-white/5 border border-border-default rounded-lg p-2 text-slate-200 text-xs placeholder-slate-500 resize-none focus:outline-none focus:border-mode-accent/50"
                rows={2}
              />
              <p className="text-gray-500 text-[9px] mt-1">
                Ürün üzerinde yapmak istediğiniz değişiklikleri yazın
              </p>
            </div>

            {/* Purpose Selection */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Amaç</h3>
              <div className="space-y-1.5">
                {MENS_FASHION_PURPOSE_OPTIONS.map((purpose) => (
                  <button
                    key={purpose.id}
                    onClick={() => updateSetting('purpose', purpose.id as MensFashionSettings['purpose'])}
                    className={`w-full p-2.5 rounded-lg text-left transition-all ${
                      settings.purpose === purpose.id
                        ? 'bg-mode-accent/30 border-mode-accent border'
                        : 'bg-white border-gray-200 border hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{purpose.icon}</span>
                      <div>
                        <span className="text-gray-300 text-[10px] font-medium block">{purpose.name}</span>
                        <span className="text-gray-600 text-[10px]">{purpose.description}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Tone - Hidden when reference model is used */}
            {!referenceModelPreview && (
              <div className="bg-white rounded-xl p-2 border border-gray-200">
                <h3 className="text-gray-900 text-[10px] font-medium mb-1.5">Ten Rengi</h3>
                <div className="grid grid-cols-8 gap-1">
                  {SKIN_TONE_OPTIONS.filter(t => t.id !== 'auto').map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => updateSetting('skinTone', tone.id)}
                      title={`${tone.name} - ${tone.description}`}
                      className={`w-full aspect-square rounded border-2 transition-all ${
                        settings.skinTone === tone.id ? 'border-white scale-110 ring-1 ring-mode-accent' : 'border-transparent hover:border-white/50'
                      }`}
                      style={{ backgroundColor: tone.hex }}
                    >
                      {settings.skinTone === tone.id && <Check className="w-2 h-2 text-gray-900 mx-auto" style={{ filter: tone.id === 'fair' || tone.id === 'light' ? 'invert(1)' : 'none' }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pose Style */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Poz Stili</h3>
              <div className="relative">
                <select
                  value={settings.poseStyle}
                  onChange={(e) => updateSetting('poseStyle', e.target.value)}
                  className="w-full py-2 px-3 pr-8 rounded-lg bg-white/5 border border-border-default text-slate-200 text-xs appearance-none cursor-pointer hover:bg-gray-100 focus:outline-none focus:border-mode-accent"
                >
                  {MENS_FASHION_POSE_OPTIONS.map((pose) => (
                    <option key={pose.id} value={pose.id} className="bg-white text-gray-900">
                      {pose.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {MENS_FASHION_POSE_OPTIONS.find(p => p.id === settings.poseStyle)?.description}
              </p>
            </div>

            {/* Background Style */}
            <div className="bg-white rounded-xl p-2 border border-gray-200">
              <h3 className="text-gray-900 text-[10px] font-medium mb-1">Arka Plan Stili</h3>
              <p className="text-[9px] text-gray-500 mb-2">Duvar tipi seçin - bazı stiller renk seçimi destekler</p>
              <div className="grid grid-cols-6 gap-1">
                {MENS_FASHION_BACKGROUND_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateSetting('backgroundStyle', style.id)}
                    title={`${style.name} - ${style.description}`}
                    className={`p-1.5 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                      settings.backgroundStyle === style.id
                        ? 'bg-mode-accent text-white ring-2 ring-mode-accent/50'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-base">{style.icon}</span>
                    <span className="text-[8px] font-medium truncate w-full text-center">{style.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-1.5 p-1.5 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-700">
                  <span className="font-medium">{MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === settings.backgroundStyle)?.name}:</span>{' '}
                  {MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === settings.backgroundStyle)?.description}
                  {MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === settings.backgroundStyle)?.supportsColor && settings.backgroundStyle !== 'studio-minimal' && (
                    <span className="text-mode-accent ml-1">• Renk seçebilirsiniz ↓</span>
                  )}
                  {settings.backgroundStyle === 'studio-minimal' && (
                    <span className="text-cyan-600 ml-1">• Gradient renk seçin ↓</span>
                  )}
                  {settings.backgroundStyle === 'wood' && (
                    <span className="text-amber-600 ml-1">• Ahşap tipi seçin ↓</span>
                  )}
                </p>
              </div>
            </div>

            {/* Background Color - Only show when style supports color (but NOT studio-minimal) */}
            {MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === settings.backgroundStyle)?.supportsColor && settings.backgroundStyle !== 'studio-minimal' && (
              <div className="bg-white rounded-xl p-2 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-gray-900 text-[10px] font-medium">Arka Plan Rengi</h3>
                  <span className="text-[9px] text-mode-accent bg-blue-50 px-1.5 py-0.5 rounded">
                    Seçili: {MENS_FASHION_BACKGROUNDS.find(bg => bg.id === settings.background)?.name}
                  </span>
                </div>
                <div className="grid grid-cols-10 gap-1.5">
                  {MENS_FASHION_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => updateSetting('background', bg.id)}
                      title={`${bg.name} (${bg.hex}) - ${bg.description}`}
                      className={`w-full aspect-square rounded-lg border-2 transition-all shadow-sm ${
                        settings.background === bg.id
                          ? 'border-mode-accent scale-110 ring-2 ring-mode-accent/50 z-10'
                          : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                      }`}
                      style={{ backgroundColor: bg.hex }}
                    >
                      {settings.background === bg.id && (
                        <Check
                          className="w-3 h-3 mx-auto drop-shadow-md"
                          style={{ color: ['white', 'light-gray', 'cream', 'beige'].includes(bg.id) ? '#333' : '#fff' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-500 mt-1.5 text-center">
                  Her üretimde bu renk sabit kalır: <span className="font-mono text-gray-700">{MENS_FASHION_BACKGROUNDS.find(bg => bg.id === settings.background)?.hex}</span>
                </p>
              </div>
            )}

            {/* Zemin Tipi Seçici */}
            <div className="bg-white rounded-xl p-2 border border-gray-200">
              <h3 className="text-gray-900 text-[10px] font-medium mb-1.5">Zemin Tipi</h3>
              <div className="grid grid-cols-4 gap-1">
                {FLOOR_TYPE_OPTIONS.map((floor) => (
                  <button
                    key={floor.id}
                    onClick={() => updateSetting('floorType', floor.id)}
                    title={floor.description}
                    className={`p-1.5 rounded-lg text-center transition-all ${
                      settings.floorType === floor.id
                        ? 'bg-amber-500/30 border-amber-500 border'
                        : 'bg-white border-gray-200 border hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className="w-full h-3 rounded mb-0.5"
                      style={{ backgroundColor: floor.hex === 'auto' ? 'linear-gradient(to right, #ccc, #999)' : floor.hex }}
                    />
                    <span className="text-gray-900 text-[8px] font-medium block truncate">{floor.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-gray-500 mt-1">
                {FLOOR_TYPE_OPTIONS.find(f => f.id === settings.floorType)?.description}
              </p>
            </div>

            {/* Studio Minimal Gradient - Özel Renk ve Vinyet Seçenekleri */}
            {settings.backgroundStyle === 'studio-minimal' && (
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <h3 className="text-gray-300 text-[10px] font-medium mb-2">Studio Minimal - Renk Tonu ({STUDIO_MINIMAL_GRADIENT_COLORS.length} renk)</h3>
                <div className="max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  <div className="grid grid-cols-8 gap-1">
                    {STUDIO_MINIMAL_GRADIENT_COLORS.map((color) => {
                      // Açık renkler için koyu check, koyu renkler için açık check
                      const isLightColor = ['pure-white', 'soft-white', 'ivory-cream', 'pearl', 'light-warm-gray', 'light-cool-gray', 'silver-gray', 'sand', 'warm-beige', 'greige', 'light-stone', 'powder-blue', 'sky-blue', 'mint', 'blush-pink', 'lavender', 'lilac', 'peach', 'apricot', 'champagne', 'coral'].includes(color.id);
                      return (
                        <button
                          key={color.id}
                          onClick={() => updateSetting('studioMinimalColor', color.id)}
                          title={color.name}
                          className={`w-full aspect-square rounded border-2 transition-all ${
                            settings.studioMinimalColor === color.id ? 'border-white scale-110 ring-1 ring-cyan-500 z-10' : 'border-transparent hover:border-white/50 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {settings.studioMinimalColor === color.id && (
                            <Check
                              className="w-2.5 h-2.5 mx-auto"
                              style={{ color: isLightColor ? '#333' : '#fff' }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5">
                  Seçili: <span className="text-cyan-400">{STUDIO_MINIMAL_GRADIENT_COLORS.find(c => c.id === settings.studioMinimalColor)?.name}</span>
                </p>

                {/* Vinyet Toggle */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <div>
                    <span className="text-gray-900 text-xs">Kenar Vinyet</span>
                    <p className="text-[9px] text-gray-500">Kenarlarda hafif karartma efekti</p>
                  </div>
                  <button
                    onClick={() => updateSetting('studioMinimalVignette', !settings.studioMinimalVignette)}
                    className={`w-10 h-5 rounded-full transition-all relative ${
                      settings.studioMinimalVignette ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                      settings.studioMinimalVignette ? 'left-5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* Ahşap Tipi Seçici - Arka Plan Stili Ahşap Olduğunda */}
            {settings.backgroundStyle === 'wood' && (
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <h3 className="text-gray-300 text-[10px] font-medium mb-2">Ahşap Tipi</h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {WOOD_TYPE_OPTIONS.map((wood) => (
                    <button
                      key={wood.id}
                      onClick={() => updateSetting('woodType', wood.id)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        settings.woodType === wood.id
                          ? 'bg-amber-600/30 border-amber-500 border'
                          : 'bg-white border-gray-200 border hover:bg-gray-100'
                      }`}
                      title={wood.description}
                    >
                      <span className="text-lg block mb-0.5">{wood.icon}</span>
                      <span className="text-gray-900 text-[8px] font-medium block truncate">{wood.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-gray-500 text-[9px] mt-1.5">
                  {WOOD_TYPE_OPTIONS.find(w => w.id === settings.woodType)?.description}
                </p>
              </div>
            )}

            {/* Number of Images */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Gorsel Adedi</h3>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateSetting('numberOfImages', num)}
                    className={`py-1.5 rounded-md text-xs transition-all ${
                      settings.numberOfImages === num
                        ? 'bg-mode-accent/30 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Görsel Ölçüsü / Aspect Ratio */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görsel Ölçüsü</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {IMAGE_ASPECT_RATIO_OPTIONS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => updateSetting('aspectRatio', ratio.id)}
                    className={`p-2 rounded-lg text-left transition-all ${
                      settings.aspectRatio === ratio.id
                        ? 'bg-mode-accent/30 border-mode-accent border'
                        : 'bg-white border-gray-200 border hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-gray-900 text-[10px] font-medium block">{ratio.name}</span>
                    <span className="text-gray-500 text-[8px] block">{ratio.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hayvan Ekleme Bölümü */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐾</span>
                  <span className="text-gray-300 text-[10px] font-medium">Hayvan Ekle</span>
                </div>
                <button
                  onClick={() => updateAnimalSetting('enabled', !settings.animal?.enabled)}
                  className={`w-10 h-5 rounded-full transition-all ${
                    settings.animal?.enabled ? 'bg-mode-accent' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                    settings.animal?.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {settings.animal?.enabled && (
                <div className="space-y-3">
                  {/* Hayvan Türü */}
                  <div>
                    <label className="text-gray-600 text-[10px] block mb-1">Hayvan Türü</label>
                    <div className="grid grid-cols-5 gap-1">
                      {ANIMAL_TYPES.map((animal) => (
                        <button
                          key={animal.id}
                          onClick={() => {
                            updateAnimalSetting('animalType', animal.id);
                            // Tür değişince ilk cinsi seç
                            const breeds = getBreedOptions(animal.id);
                            if (breeds.length > 0) {
                              updateAnimalSetting('breed', breeds[0].id);
                            }
                          }}
                          className={`py-2 rounded-lg text-center transition-all ${
                            settings.animal?.animalType === animal.id
                              ? 'bg-mode-accent/30 text-gray-900'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                          title={animal.name}
                        >
                          <span className="text-lg">{animal.icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Özel Hayvan Girişi veya Cins Seçimi */}
                  {settings.animal?.animalType === 'custom' ? (
                    <div>
                      <label className="text-gray-600 text-[10px] block mb-1">
                        Hayvanı Tanımla
                      </label>
                      <textarea
                        value={settings.animal?.customAnimal || ''}
                        onChange={(e) => updateAnimalSetting('customAnimal', e.target.value)}
                        placeholder="Örn: Beyaz bir unicorn, parlak gümüş yelesi ile. Veya: Küçük bir panda yavrusu, bambu tutarken..."
                        className="w-full bg-white/5 text-slate-200 text-xs rounded-lg px-3 py-2 border border-border-default focus:outline-none focus:border-mode-accent resize-none h-20"
                      />
                      <p className="text-gray-500 text-[9px] mt-1">
                        İstediğiniz herhangi bir hayvanı detaylı şekilde tanımlayın
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-gray-600 text-[10px] block mb-1">
                        {ANIMAL_TYPES.find(a => a.id === settings.animal?.animalType)?.name || 'Köpek'} Cinsi
                      </label>
                      <select
                        value={settings.animal?.breed || 'golden-retriever'}
                        onChange={(e) => updateAnimalSetting('breed', e.target.value)}
                        className="w-full bg-white/5 text-slate-200 text-xs rounded-lg px-3 py-2 border border-border-default focus:outline-none focus:border-mode-accent"
                      >
                        {getBreedOptions(settings.animal?.animalType || 'dog').map((breed) => (
                          <option key={breed.id} value={breed.id} className="bg-white">
                            {breed.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Pozisyon ve Poz */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-600 text-[10px] block mb-1">Pozisyon</label>
                      <select
                        value={settings.animal?.position || 'right'}
                        onChange={(e) => updateAnimalSetting('position', e.target.value)}
                        className="w-full bg-white/5 text-slate-200 text-xs rounded-lg px-2 py-2 border border-border-default focus:outline-none focus:border-mode-accent"
                      >
                        {ANIMAL_POSITIONS.map((pos) => (
                          <option key={pos.id} value={pos.id} className="bg-white">
                            {pos.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] block mb-1">Poz</label>
                      <select
                        value={settings.animal?.pose || 'sitting'}
                        onChange={(e) => updateAnimalSetting('pose', e.target.value)}
                        className="w-full bg-white/5 text-slate-200 text-xs rounded-lg px-2 py-2 border border-border-default focus:outline-none focus:border-mode-accent"
                      >
                        {ANIMAL_POSES.map((pose) => (
                          <option key={pose.id} value={pose.id} className="bg-white">
                            {pose.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Boyut */}
                  <div>
                    <label className="text-gray-600 text-[10px] block mb-1">Boyut</label>
                    <div className="grid grid-cols-3 gap-1">
                      {ANIMAL_SIZES.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => updateAnimalSetting('size', size.id)}
                          className={`py-1.5 rounded-md text-xs transition-all ${
                            settings.animal?.size === size.id
                              ? 'bg-mode-accent/30 text-gray-900'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bakış Yönü */}
                  <div>
                    <label className="text-gray-600 text-[10px] block mb-1">Bakış Yönü</label>
                    <div className="grid grid-cols-5 gap-1">
                      {ANIMAL_LOOK_DIRECTIONS.map((dir) => (
                        <button
                          key={dir.id}
                          onClick={() => updateAnimalSetting('lookDirection', dir.id)}
                          className={`p-1.5 rounded-md text-center transition-all ${
                            settings.animal?.lookDirection === dir.id
                              ? 'bg-mode-accent/30 border border-mode-accent/50'
                              : 'bg-white border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-sm">{dir.icon}</span>
                          <p className={`text-[8px] ${settings.animal?.lookDirection === dir.id ? 'text-mode-accent' : 'text-gray-600'}`}>
                            {dir.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : productionMode === 'referenced' ? (
          <div className="p-4 space-y-3">
            {/* Açıklama Kartı */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl p-3 border border-emerald-500/30">
              <div className="flex items-start gap-2">
                <ReferenceIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-gray-300 text-[10px] font-medium">Referanslı Üretim</h3>
                  <p className="text-gray-600 text-[10px] mt-1">
                    Mankeninizi referans fotoğraftaki poza yerleştirin. Yüz, kıyafet ve saç korunur.
                  </p>
                </div>
              </div>
            </div>

            {/* Görsel Yükleme Alanları */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-3">Görseller</h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Manken Fotoğrafı */}
                <div>
                  <label className="text-[10px] text-gray-600 mb-1.5 block">Manken (Kaynak)</label>
                  {refSourceModelPreview ? (
                    <div className="relative group aspect-[3/4] rounded-lg overflow-hidden">
                      <img src={refSourceModelPreview} alt="Manken" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={removeRefSourceModel}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-gray-900"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-500 text-gray-900 text-[8px] font-medium">
                        KAYNAK
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => refSourceInputRef.current?.click()}
                      className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-emerald-500/50 hover:border-emerald-500 flex flex-col items-center justify-center text-emerald-400 hover:text-emerald-300 transition-all bg-emerald-500/5 hover:bg-emerald-500/10"
                    >
                      <User className="w-6 h-6 mb-1" />
                      <span className="text-[9px]">Manken Yükle</span>
                      <span className="text-[8px] text-gray-500 mt-0.5">Kıyafetli</span>
                    </button>
                  )}
                </div>

                {/* Referans Poz Fotoğrafı */}
                <div>
                  <label className="text-[10px] text-gray-600 mb-1.5 block">Referans Poz</label>
                  {refPosePreview ? (
                    <div className="relative group aspect-[3/4] rounded-lg overflow-hidden">
                      <img src={refPosePreview} alt="Referans" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={removeRefPoseImage}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-gray-900"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-teal-500 text-gray-900 text-[8px] font-medium">
                        HEDEF POZ
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => refPoseInputRef.current?.click()}
                      className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-teal-500/50 hover:border-teal-500 flex flex-col items-center justify-center text-teal-400 hover:text-teal-300 transition-all bg-teal-500/5 hover:bg-teal-500/10"
                    >
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[9px]">Referans Yükle</span>
                      <span className="text-[8px] text-gray-500 mt-0.5">Hedef poz/sahne</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Ok işareti */}
              {refSourceModelPreview && refPosePreview && (
                <div className="flex items-center justify-center mt-3 text-gray-500">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-emerald-400">Manken</span>
                    <span>+</span>
                    <span className="text-teal-400">Poz</span>
                    <span>=</span>
                    <span className="text-green-400">Sonuç</span>
                  </div>
                </div>
              )}
            </div>

            {/* Koruma Seçenekleri */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Koruma Seçenekleri</h3>
              <div className="space-y-2">
                {[
                  { key: 'preserveClothing' as const, label: 'Kıyafetleri Koru', icon: '👔', desc: 'Mankenin kıyafetleri aynen kullanılır' },
                  { key: 'preserveFace' as const, label: 'Yüzü Koru', icon: '👤', desc: 'Mankenin yüz özellikleri korunur' },
                  { key: 'preserveHair' as const, label: 'Saçı Koru', icon: '💇', desc: 'Saç stili ve rengi korunur' },
                  { key: 'matchLighting' as const, label: 'Işığı Eşleştir', icon: '💡', desc: 'Referans fotoğrafın ışığına uyum sağlanır' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => updateRefSetting(option.key, !refSettings[option.key])}
                    className={`w-full p-2 rounded-lg flex items-center gap-2 transition-all ${
                      refSettings[option.key]
                        ? 'bg-emerald-500/20 border border-emerald-500/50'
                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm">{option.icon}</span>
                    <div className="flex-1 text-left">
                      <span className={`text-xs font-medium ${refSettings[option.key] ? 'text-emerald-300' : 'text-gray-600'}`}>
                        {option.label}
                      </span>
                      <p className="text-[9px] text-gray-500">{option.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      refSettings[option.key] ? 'bg-emerald-500' : 'bg-gray-100'
                    }`}>
                      {refSettings[option.key] && <Check className="w-2.5 h-2.5 text-gray-900" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pozlar */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Pozlar</h3>

              {/* Kategori Sekmeleri */}
              <div className="flex gap-1 mb-2">
                {POSE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      // İlk olarak o kategoriden bir poz seç
                      const firstPoseInCategory = REFERENCED_POSE_OPTIONS.find(p => p.category === category.id);
                      if (firstPoseInCategory) {
                        updateRefSetting('selectedPose', firstPoseInCategory.id);
                      }
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-medium transition-all flex items-center justify-center gap-1 ${
                      REFERENCED_POSE_OPTIONS.find(p => p.id === refSettings.selectedPose)?.category === category.id
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>

              {/* Seçili Kategorideki Pozlar */}
              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                {REFERENCED_POSE_OPTIONS
                  .filter(pose => pose.category === (REFERENCED_POSE_OPTIONS.find(p => p.id === refSettings.selectedPose)?.category || 'default'))
                  .map((pose) => (
                    <button
                      key={pose.id}
                      onClick={() => updateRefSetting('selectedPose', pose.id)}
                      className={`w-full p-2 rounded-lg flex items-center gap-2 transition-all text-left ${
                        refSettings.selectedPose === pose.id
                          ? 'bg-emerald-500/20 border border-emerald-500/50'
                          : 'bg-white border border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        refSettings.selectedPose === pose.id ? 'bg-emerald-500' : 'bg-white/20'
                      }`}>
                        {refSettings.selectedPose === pose.id && <Check className="w-3 h-3 text-gray-900" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-medium block ${refSettings.selectedPose === pose.id ? 'text-emerald-300' : 'text-gray-700'}`}>
                          {pose.label}
                        </span>
                        <span className="text-[9px] text-gray-500 block truncate">{pose.description}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Kadraj Seçimi */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2 flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-mode-accent" />
                Kadraj (Shot Type)
              </h3>
              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                {SHOT_TYPE_OPTIONS.map((shot) => (
                  <button
                    key={shot.id}
                    onClick={() => updateRefSetting('shotType', shot.id)}
                    className={`w-full p-2 rounded-lg flex items-center gap-2 transition-all text-left ${
                      (refSettings.shotType || 'auto') === shot.id
                        ? 'bg-mode-accent/20 border border-mode-accent/50'
                        : 'bg-white border border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      (refSettings.shotType || 'auto') === shot.id ? 'bg-mode-accent' : 'bg-gray-200'
                    }`}>
                      {(refSettings.shotType || 'auto') === shot.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-medium block ${(refSettings.shotType || 'auto') === shot.id ? 'text-mode-accent' : 'text-gray-700'}`}>
                        {shot.name}
                      </span>
                      <span className="text-[9px] text-gray-500 block truncate">{shot.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Görsel Adedi */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görsel Adedi</h3>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateRefSetting('numberOfImages', num)}
                    className={`py-1.5 rounded-md text-xs transition-all ${
                      refSettings.numberOfImages === num
                        ? 'bg-emerald-500/30 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Hayvan Ekleme Bölümü - Referanslı Mod */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐾</span>
                  <span className="text-gray-300 text-[10px] font-medium">Hayvan Ekle</span>
                </div>
                <button
                  onClick={() => updateRefAnimalSetting('enabled', !refSettings.animal?.enabled)}
                  className={`w-10 h-5 rounded-full transition-all ${
                    refSettings.animal?.enabled ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                    refSettings.animal?.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {refSettings.animal?.enabled && (
                <div className="space-y-3">
                  {/* Hayvan Türü */}
                  <div>
                    <label className="text-gray-600 text-[10px] block mb-1">Hayvan Türü</label>
                    <div className="grid grid-cols-6 gap-1">
                      {ANIMAL_TYPES.map((animal) => (
                        <button
                          key={animal.id}
                          onClick={() => {
                            updateRefAnimalSetting('animalType', animal.id);
                            if (animal.id !== 'custom') {
                              const breeds = getBreedOptions(animal.id);
                              if (breeds.length > 0) {
                                updateRefAnimalSetting('breed', breeds[0].id);
                              }
                            }
                          }}
                          className={`py-2 rounded-lg text-center transition-all ${
                            refSettings.animal?.animalType === animal.id
                              ? 'bg-emerald-500/30 text-gray-900'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                          title={animal.name}
                        >
                          <span className="text-sm">{animal.icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Özel Hayvan veya Cins Seçimi */}
                  {refSettings.animal?.animalType === 'custom' ? (
                    <div>
                      <label className="text-gray-600 text-[10px] block mb-1">Hayvanı Tanımla</label>
                      <textarea
                        value={refSettings.animal?.customAnimal || ''}
                        onChange={(e) => updateRefAnimalSetting('customAnimal', e.target.value)}
                        placeholder="Örn: Beyaz bir unicorn..."
                        className="w-full bg-white/5 text-slate-200 text-xs rounded-lg px-3 py-2 border border-border-default focus:outline-none focus:border-emerald-500 resize-none h-16"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-gray-600 text-[10px] block mb-1">Cins</label>
                      <select
                        value={refSettings.animal?.breed || 'golden-retriever'}
                        onChange={(e) => updateRefAnimalSetting('breed', e.target.value)}
                        className="w-full bg-white/5 text-slate-200 text-xs rounded-lg px-3 py-2 border border-border-default focus:outline-none focus:border-emerald-500"
                      >
                        {getBreedOptions(refSettings.animal?.animalType || 'dog').map((breed) => (
                          <option key={breed.id} value={breed.id} className="bg-white">{breed.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Pozisyon, Poz, Boyut */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-gray-600 text-[10px] block mb-1">Pozisyon</label>
                      <select
                        value={refSettings.animal?.position || 'right'}
                        onChange={(e) => updateRefAnimalSetting('position', e.target.value)}
                        className="w-full bg-white/5 text-slate-200 text-[10px] rounded-lg px-2 py-1.5 border border-border-default focus:outline-none focus:border-emerald-500"
                      >
                        {ANIMAL_POSITIONS.map((pos) => (
                          <option key={pos.id} value={pos.id} className="bg-white">{pos.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] block mb-1">Poz</label>
                      <select
                        value={refSettings.animal?.pose || 'sitting'}
                        onChange={(e) => updateRefAnimalSetting('pose', e.target.value)}
                        className="w-full bg-white/5 text-slate-200 text-[10px] rounded-lg px-2 py-1.5 border border-border-default focus:outline-none focus:border-emerald-500"
                      >
                        {ANIMAL_POSES.map((pose) => (
                          <option key={pose.id} value={pose.id} className="bg-white">{pose.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] block mb-1">Boyut</label>
                      <select
                        value={refSettings.animal?.size || 'medium'}
                        onChange={(e) => updateRefAnimalSetting('size', e.target.value)}
                        className="w-full bg-white/5 text-slate-200 text-[10px] rounded-lg px-2 py-1.5 border border-border-default focus:outline-none focus:border-emerald-500"
                      >
                        {ANIMAL_SIZES.map((size) => (
                          <option key={size.id} value={size.id} className="bg-white">{size.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-600 text-[10px] block mb-1">Bakış</label>
                      <select
                        value={refSettings.animal?.lookDirection || 'camera'}
                        onChange={(e) => updateRefAnimalSetting('lookDirection', e.target.value)}
                        className="w-full bg-white/5 text-slate-200 text-[10px] rounded-lg px-2 py-1.5 border border-border-default focus:outline-none focus:border-emerald-500"
                      >
                        {ANIMAL_LOOK_DIRECTIONS.map((dir) => (
                          <option key={dir.id} value={dir.id} className="bg-white">{dir.icon} {dir.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : productionMode === 'referenced2' ? (
          <div className="p-4 space-y-3">
            {/* Açıklama Kartı */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl p-3 border border-indigo-500/30">
              <div className="flex items-start gap-2">
                <Layers className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-gray-300 text-[10px] font-medium">Referanslı 2 Üretim</h3>
                  <p className="text-gray-600 text-[10px] mt-1">
                    Mankeni kıyafetlerle giydirip mekana yerleştirin. Kıyafet, yüz ve mekan korunur.
                  </p>
                </div>
              </div>
            </div>

            {/* Manken Yükleme */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Manken</h3>
              {ref2ModelPreview ? (
                <div className="relative group aspect-[3/4] rounded-lg overflow-hidden">
                  <img src={ref2ModelPreview} alt="Manken" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={removeRef2Model}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-gray-900"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[8px] font-medium">
                    MANKEN
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => ref2ModelInputRef.current?.click()}
                  className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-indigo-500/50 hover:border-indigo-500 flex flex-col items-center justify-center text-indigo-400 hover:text-indigo-300 transition-all bg-indigo-500/5 hover:bg-indigo-500/10"
                >
                  <User className="w-6 h-6 mb-1" />
                  <span className="text-[9px]">Manken Yükle</span>
                  <span className="text-[8px] text-gray-500 mt-0.5">Yüz + vücut kaynağı</span>
                </button>
              )}
            </div>

            {/* Kıyafet Yükleme (Çoklu) */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-300 text-[10px] font-medium">Kıyafetler</h3>
                <span className="text-[9px] text-gray-500">{ref2GarmentImages.length}/5</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ref2GarmentPreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden">
                    <img src={preview} alt={`Kıyafet ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeRef2Garment(index)}
                        className="absolute bottom-1 right-1 p-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-gray-900"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-purple-500 text-white text-[7px] font-medium">
                      {index + 1}
                    </div>
                  </div>
                ))}
                {ref2GarmentImages.length < 5 && (
                  <button
                    onClick={() => ref2GarmentInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-purple-500/50 hover:border-purple-500 flex flex-col items-center justify-center text-purple-400 hover:text-purple-300 transition-all bg-purple-500/5 hover:bg-purple-500/10"
                  >
                    <Shirt className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px]">Ekle</span>
                  </button>
                )}
              </div>
              <p className="text-[8px] text-gray-500 mt-1.5">Farklı açılardan kıyafet fotoğrafları</p>
            </div>

            {/* Mekan Yükleme */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Mekan</h3>
              {ref2ScenePreview ? (
                <div className="relative group aspect-video rounded-lg overflow-hidden">
                  <img src={ref2ScenePreview} alt="Mekan" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={removeRef2Scene}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-gray-900"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-violet-500 text-white text-[8px] font-medium">
                    MEKAN
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => ref2SceneInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-violet-500/50 hover:border-violet-500 flex flex-col items-center justify-center text-violet-400 hover:text-violet-300 transition-all bg-violet-500/5 hover:bg-violet-500/10"
                >
                  <MapPin className="w-6 h-6 mb-1" />
                  <span className="text-[9px]">Mekan Yükle</span>
                  <span className="text-[8px] text-gray-500 mt-0.5">Sahne referansı</span>
                </button>
              )}
            </div>

            {/* Özel Prompt */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Özel Talimat</h3>
              <textarea
                value={ref2Prompt}
                onChange={(e) => setRef2Prompt(e.target.value)}
                placeholder="Örn: Manken şık bir şekilde sokakta yürüsün, güneşli hava, doğal gülümseme..."
                className="w-full h-20 bg-black/20 border border-white/10 rounded-lg p-2 text-gray-300 text-[10px] placeholder:text-gray-600 resize-none focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Görsel Adedi */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görsel Adedi</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRef2NumberOfImages(num)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      ref2NumberOfImages === num
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : productionMode === 'scene' ? (
          <div className="p-4 space-y-3">
            {/* Açıklama Kartı */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-3 border border-amber-500/30">
              <div className="flex items-start gap-2">
                <SceneIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-gray-300 text-[10px] font-medium">Sahneye Yerleştir</h3>
                  <p className="text-gray-600 text-[10px] mt-1">
                    Mankeninizi istediğiniz sahneye yerleştirin. Poz talimatı verebilir veya AI'ın seçmesini sağlayabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Görsel Yükleme Alanları */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-3">Görseller</h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Manken Fotoğrafı */}
                <div>
                  <label className="text-[10px] text-gray-600 mb-1.5 block">Manken</label>
                  {sceneSourceModelPreview ? (
                    <div className="relative group aspect-[3/4] rounded-lg overflow-hidden">
                      <img src={sceneSourceModelPreview} alt="Manken" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={removeSceneSourceModel}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-gray-900"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500 text-gray-900 text-[8px] font-medium">
                        MANKEN
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => sceneSourceInputRef.current?.click()}
                      className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-amber-500/50 hover:border-amber-500 flex flex-col items-center justify-center text-amber-400 hover:text-amber-300 transition-all bg-amber-500/5 hover:bg-amber-500/10"
                    >
                      <User className="w-6 h-6 mb-1" />
                      <span className="text-[9px]">Manken Yükle</span>
                      <span className="text-[8px] text-gray-500 mt-0.5">Kıyafetli</span>
                    </button>
                  )}
                </div>

                {/* Sahne Fotoğrafı */}
                <div>
                  <label className="text-[10px] text-gray-600 mb-1.5 block">Sahne / Arka Plan</label>
                  {scenePreview ? (
                    <div className="relative group aspect-[3/4] rounded-lg overflow-hidden">
                      <img src={scenePreview} alt="Sahne" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={removeSceneImage}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-gray-900"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-orange-500 text-gray-900 text-[8px] font-medium">
                        SAHNE
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => sceneImageInputRef.current?.click()}
                      className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-orange-500/50 hover:border-orange-500 flex flex-col items-center justify-center text-orange-400 hover:text-orange-300 transition-all bg-orange-500/5 hover:bg-orange-500/10"
                    >
                      <MapPin className="w-6 h-6 mb-1" />
                      <span className="text-[9px]">Sahne Yükle</span>
                      <span className="text-[8px] text-gray-500 mt-0.5">Hedef mekan</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Poz Talimatı */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Poz Talimatı</h3>
              <p className="text-[10px] text-gray-500 mb-2">Mankenin nasıl durmasını istediğinizi yazın veya boş bırakın (AI seçsin)</p>

              {/* Hazır öneriler */}
              <div className="flex flex-wrap gap-1 mb-2">
                {POSE_SUGGESTIONS.map((pose) => (
                  <button
                    key={pose.id}
                    onClick={() => updateSceneSetting('poseInstruction', pose.id === 'auto' ? '' : pose.description)}
                    className={`px-2 py-1 rounded-md text-[9px] transition-all ${
                      (pose.id === 'auto' && !sceneSettings.poseInstruction) || sceneSettings.poseInstruction === pose.description
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {pose.label}
                  </button>
                ))}
              </div>

              {/* Özel talimat alanı */}
              <textarea
                value={sceneSettings.poseInstruction}
                onChange={(e) => updateSceneSetting('poseInstruction', e.target.value)}
                placeholder="Örn: Ellerini cebine koymuş, kendinden emin bir duruşla..."
                className="w-full h-16 px-2.5 py-2 rounded-lg bg-white/5 border border-border-default text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>

            {/* Koruma Seçenekleri */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Koruma Seçenekleri</h3>
              <div className="space-y-2">
                {[
                  { key: 'preserveClothing' as const, label: 'Kıyafetleri Koru', icon: '👔', desc: 'Mankenin kıyafetleri aynen kullanılır' },
                  { key: 'preserveFace' as const, label: 'Yüzü Koru', icon: '👤', desc: 'Mankenin yüz özellikleri korunur' },
                  { key: 'preserveHair' as const, label: 'Saçı Koru', icon: '💇', desc: 'Saç stili ve rengi korunur' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => updateSceneSetting(option.key, !sceneSettings[option.key])}
                    className={`w-full p-2 rounded-lg flex items-center gap-2 transition-all ${
                      sceneSettings[option.key]
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm">{option.icon}</span>
                    <div className="flex-1 text-left">
                      <span className={`text-xs font-medium ${sceneSettings[option.key] ? 'text-amber-300' : 'text-gray-600'}`}>
                        {option.label}
                      </span>
                      <p className="text-[9px] text-gray-500">{option.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      sceneSettings[option.key] ? 'bg-amber-500' : 'bg-gray-100'
                    }`}>
                      {sceneSettings[option.key] && <Check className="w-2.5 h-2.5 text-gray-900" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hayvan Ekleme - Sahneye Yerleştir */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🐾</span>
                  <h3 className="text-gray-300 text-[10px] font-medium">Hayvan Ekle</h3>
                </div>
                <button
                  onClick={() => updateSceneAnimalSetting('enabled', !sceneSettings.animal?.enabled)}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    sceneSettings.animal?.enabled ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    sceneSettings.animal?.enabled ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {sceneSettings.animal?.enabled && (
                <div className="space-y-2 mt-2">
                  {/* Hayvan Türü */}
                  <div>
                    <p className="text-[10px] text-gray-600 mb-1">Hayvan Türü</p>
                    <div className="grid grid-cols-3 gap-1">
                      {ANIMAL_TYPES.map((animal) => (
                        <button
                          key={animal.id}
                          onClick={() => {
                            updateSceneAnimalSetting('animalType', animal.id);
                            if (animal.id !== 'custom') {
                              const breeds = getBreedOptions(animal.id);
                              if (breeds.length > 0) {
                                updateSceneAnimalSetting('breed', breeds[0].id);
                              }
                            }
                          }}
                          className={`p-1.5 rounded-lg text-center transition-all ${
                            sceneSettings.animal?.animalType === animal.id
                              ? 'bg-amber-500/30 border border-amber-500/50'
                              : 'bg-white border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-lg">{animal.icon}</span>
                          <p className={`text-[9px] ${sceneSettings.animal?.animalType === animal.id ? 'text-amber-300' : 'text-gray-600'}`}>
                            {animal.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Özel Hayvan Tanımı */}
                  {sceneSettings.animal?.animalType === 'custom' && (
                    <div>
                      <p className="text-[10px] text-gray-600 mb-1">Hayvan Tanımı</p>
                      <textarea
                        value={sceneSettings.animal?.customAnimal || ''}
                        onChange={(e) => updateSceneAnimalSetting('customAnimal', e.target.value)}
                        placeholder="Örn: Siyah beyaz benekli dalmaçyalı köpek, mavi gözlü beyaz kedi, renkli papağan..."
                        className="w-full h-16 px-2.5 py-2 rounded-lg bg-white/5 border border-border-default text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
                      />
                    </div>
                  )}

                  {/* Cins Seçimi - Sadece custom değilse göster */}
                  {sceneSettings.animal?.animalType !== 'custom' && getBreedOptions(sceneSettings.animal?.animalType || 'dog').length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-600 mb-1">Cins</p>
                      <select
                        value={sceneSettings.animal?.breed || ''}
                        onChange={(e) => updateSceneAnimalSetting('breed', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-border-default text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                      >
                        {getBreedOptions(sceneSettings.animal?.animalType || 'dog').map((breed) => (
                          <option key={breed.id} value={breed.id} className="bg-gray-50">
                            {breed.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Pozisyon */}
                  <div>
                    <p className="text-[10px] text-gray-600 mb-1">Pozisyon</p>
                    <div className="grid grid-cols-4 gap-1">
                      {ANIMAL_POSITIONS.slice(0, 4).map((pos) => (
                        <button
                          key={pos.id}
                          onClick={() => updateSceneAnimalSetting('position', pos.id)}
                          className={`p-1 rounded-md text-center transition-all ${
                            sceneSettings.animal?.position === pos.id
                              ? 'bg-amber-500/30 border border-amber-500/50'
                              : 'bg-white border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-xs">{pos.icon}</span>
                          <p className={`text-[8px] ${sceneSettings.animal?.position === pos.id ? 'text-amber-300' : 'text-gray-600'}`}>
                            {pos.name}
                          </p>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {ANIMAL_POSITIONS.slice(4).map((pos) => (
                        <button
                          key={pos.id}
                          onClick={() => updateSceneAnimalSetting('position', pos.id)}
                          className={`p-1 rounded-md text-center transition-all ${
                            sceneSettings.animal?.position === pos.id
                              ? 'bg-amber-500/30 border border-amber-500/50'
                              : 'bg-white border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-xs">{pos.icon}</span>
                          <p className={`text-[8px] ${sceneSettings.animal?.position === pos.id ? 'text-amber-300' : 'text-gray-600'}`}>
                            {pos.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Poz ve Boyut */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-600 mb-1">Duruş</p>
                      <select
                        value={sceneSettings.animal?.pose || 'sitting'}
                        onChange={(e) => updateSceneAnimalSetting('pose', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-border-default text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                      >
                        {ANIMAL_POSES.map((pose) => (
                          <option key={pose.id} value={pose.id} className="bg-gray-50">
                            {pose.icon} {pose.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 mb-1">Boyut</p>
                      <select
                        value={sceneSettings.animal?.size || 'medium'}
                        onChange={(e) => updateSceneAnimalSetting('size', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-border-default text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                      >
                        {ANIMAL_SIZES.map((size) => (
                          <option key={size.id} value={size.id} className="bg-gray-50">
                            {size.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bakış Yönü */}
                  <div>
                    <p className="text-[10px] text-gray-600 mb-1">Bakış Yönü</p>
                    <div className="grid grid-cols-5 gap-1">
                      {ANIMAL_LOOK_DIRECTIONS.map((dir) => (
                        <button
                          key={dir.id}
                          onClick={() => updateSceneAnimalSetting('lookDirection', dir.id)}
                          className={`p-1 rounded-md text-center transition-all ${
                            sceneSettings.animal?.lookDirection === dir.id
                              ? 'bg-amber-500/30 border border-amber-500/50'
                              : 'bg-white border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-xs">{dir.icon}</span>
                          <p className={`text-[7px] ${sceneSettings.animal?.lookDirection === dir.id ? 'text-amber-300' : 'text-gray-600'}`}>
                            {dir.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Görsel Adedi */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görsel Adedi</h3>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateSceneSetting('numberOfImages', num)}
                    className={`py-1.5 rounded-md text-xs transition-all ${
                      sceneSettings.numberOfImages === num
                        ? 'bg-amber-500/30 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : productionMode === 'preset' ? (
          <div className="p-4 space-y-3">
            {/* Aciklama Karti */}
            <div className="bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-xl p-3 border border-primary/30">
              <div className="flex items-start gap-2">
                <PresetIcon className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-gray-300 text-[10px] font-medium">Hazir Sahneler</h3>
                  <p className="text-gray-600 text-[10px] mt-1">
                    Kiyafet yukleyin, model sifirdan olusturulacak ve hazir sahneye yerlestirilecek. Dogal ve profesyonel sonuc.
                  </p>
                </div>
              </div>
            </div>

            {/* Kiyafet Yukleme */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2 flex items-center gap-2">
                <Shirt className="w-3.5 h-3.5 text-secondary" />
                Kiyafetler
              </h3>
              <div className="flex gap-2 flex-wrap">
                {/* Yuklenen Kiyafetler */}
                {presetClothesPreviews.map((preview, index) => (
                  <div key={index} className="relative group w-16 h-16 flex-shrink-0">
                    <img src={preview} alt={`Kiyafet ${index + 1}`} className="w-full h-full object-cover rounded-lg ring-1 ring-primary/50" />
                    <button
                      onClick={() => removePresetCloth(index)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    >
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                    <span className="absolute -top-1 -left-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[7px] text-gray-900 font-bold">{index + 1}</span>
                  </div>
                ))}

                {/* Kiyafet Ekleme Butonu */}
                {presetClothes.length < 7 && (
                  <button
                    onClick={() => presetClothesInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary flex flex-col items-center justify-center text-secondary hover:text-secondary transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-[7px] mt-0.5">Ekle</span>
                  </button>
                )}
              </div>
              <p className="text-gray-500 text-[9px] mt-2">Max 7 kiyafet (gomlek, pantolon, ayakkabi vb.)</p>
            </div>

            {/* Manken Secenegi */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-300 text-[10px] font-medium flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Kendi Mankenim
                </h3>
                <button
                  onClick={() => setPresetUseCustomModel(!presetUseCustomModel)}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    presetUseCustomModel ? 'bg-cyan-500' : 'bg-gray-600'
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
                      <img src={presetModelPreview} alt="Manken" className="w-full h-full object-cover rounded-lg ring-2 ring-cyan-500" />
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
                      className="w-20 h-24 rounded-lg border-2 border-dashed border-cyan-500/50 hover:border-cyan-500 flex flex-col items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all"
                    >
                      <User className="w-5 h-5" />
                      <span className="text-[8px] mt-1">Manken</span>
                      <span className="text-[8px]">Yukle</span>
                    </button>
                  )}
                  <div className="flex-1">
                    <p className="text-gray-600 text-[9px]">Kendi manken fotografinizi yukleyin. Model aynen kopyalanip kiyafetler uzerine giydirilecek.</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-[9px]">Kapatildiginda AI otomatik model olusturur. Actiginizda kendi mankeninizi kullanabilirsiniz.</p>
              )}
            </div>

            {/* Poz Seçimi - Her zaman görünür */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-orange-400" />
                Poz Seçimi
              </h3>
              <select
                value={presetSettings.poseStyle}
                onChange={(e) => updatePresetSetting('poseStyle', e.target.value)}
                className="w-full bg-white/5 border border-border-default rounded-lg px-2 py-1.5 text-slate-200 text-xs"
              >
                <option value="natural">Doğal</option>
                <option value="confident">Kendinden Emin</option>
                <option value="casual">Rahat</option>
                <option value="editorial">Editorial</option>
                <option value="walking">Yürüyüş</option>
                <option value="sitting">Oturan</option>
                <option value="leaning">Yaslanan</option>
              </select>
            </div>

            {/* Özel Arka Plan */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-secondary" />
                Arka Plan
              </h3>
              {customBackgroundPreview ? (
                <div className="flex gap-2">
                  <div className="relative group w-24 h-20 flex-shrink-0">
                    <img
                      src={customBackgroundPreview}
                      alt="Arka Plan"
                      className="w-full h-full object-cover rounded-lg ring-2 ring-primary"
                    />
                    <button
                      onClick={removeCustomBackground}
                      className="absolute top-1 right-1 p-0.5 bg-red-500/80 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-gray-900" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded">
                      <Check className="w-3 h-3 text-secondary inline" />
                      <span className="text-[8px] text-gray-900 ml-0.5">Secili</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-[9px]">Arka plan gorseliniz yuklendi. Model bu sahneye yerlestirilecek.</p>
                    <button
                      onClick={() => customBackgroundInputRef.current?.click()}
                      className="mt-1.5 text-secondary text-[9px] hover:text-secondary"
                    >
                      Degistir
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => customBackgroundInputRef.current?.click()}
                  className="w-full py-4 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary bg-primary/5 hover:bg-primary/10 flex flex-col items-center justify-center text-secondary hover:text-secondary transition-all"
                >
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Arka Plan Yukle</span>
                  <span className="text-[9px] text-secondary/70 mt-0.5">Kendi sahnenizi ekleyin</span>
                </button>
              )}
            </div>

            {/* Model Boyutu / Kamera Uzaklığı */}
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
                    onClick={() => updatePresetSetting('modelScale', scale.id as any)}
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

            {/* Model Ayarlari - Sadece kendi manken kullanilmiyorsa goster */}
            {!presetUseCustomModel && (
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Model Ozellikleri</h3>

              {/* Cilt Tonu */}
              <div className="mb-3">
                <label className="text-gray-600 text-[10px] mb-1.5 block">Cilt Tonu</label>
                <div className="flex gap-1">
                  {[
                    { id: 'very-light', color: '#FFE4D0' },
                    { id: 'light', color: '#F5D0B5' },
                    { id: 'medium-light', color: '#D4A574' },
                    { id: 'medium', color: '#B8865C' },
                    { id: 'medium-dark', color: '#8B5A3C' },
                    { id: 'dark', color: '#5C3A21' },
                    { id: 'very-dark', color: '#3D2516' }
                  ].map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => updatePresetSetting('skinTone', tone.id)}
                      className={`w-6 h-6 rounded-full transition-all ${
                        presetSettings.skinTone === tone.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#1a1a1a]' : ''
                      }`}
                      style={{ backgroundColor: tone.color }}
                      title={tone.id}
                    />
                  ))}
                </div>
              </div>

            </div>
            )}

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
                          ? 'bg-primary text-gray-900'
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
                  {/* Setli Üretim Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600">Setli Üretim</span>
                    <button
                      onClick={() => updatePresetSetting('useAngleSet', !presetSettings.useAngleSet)}
                      className={`w-9 h-5 rounded-full transition-all relative ${
                        presetSettings.useAngleSet ? 'bg-primary' : 'bg-gray-600'
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
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-2">
                    <p className="text-secondary text-[10px] text-center">
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
                            ? 'bg-primary text-gray-900'
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

            {/* Gorsel Sayisi */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görsel Sayısı</h3>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => updatePresetSetting('numberOfImages', num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      presetSettings.numberOfImages === num
                        ? 'bg-primary text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        </div>

        {/* Sticky Footer - Generate Button */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          {productionMode === 'standard' && (
            <>
              <button
                onClick={isUserAdmin ? handleShowPromptPreview : handleGenerate}
                disabled={!sourceImage || isProcessing}
                className={`w-full py-3 rounded-xl font-medium text-gray-900 text-sm flex items-center justify-center gap-2 ${
                  !sourceImage || isProcessing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-mode-accent to-primary hover:from-mode-accent/90 hover:to-primary/90'
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
                <div className="bg-mode-accent/10 border border-mode-accent/30 rounded-lg p-2 mt-3">
                  <div className="flex items-center gap-2 text-mode-accent text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{progress}</span>
                  </div>
                  {progressCount && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-mode-accent" style={{ width: `${(progressCount.current / progressCount.total) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-3 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}
            </>
          )}

          {productionMode === 'referenced' && (
            <>
              <button
                onClick={handleShowRefPromptPreview}
                disabled={!refSourceModel || !refPoseImage || isProcessing}
                className={`w-full py-3 rounded-xl font-medium text-gray-900 text-sm flex items-center justify-center gap-2 ${
                  !refSourceModel || !refPoseImage || isProcessing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
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
                    <span>Prompt'u Göster ve Üret</span>
                  </>
                )}
              </button>

              {/* Progress */}
              {isProcessing && progress && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 mt-3">
                  <div className="flex items-center gap-2 text-emerald-600 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{progress}</span>
                  </div>
                  {progressCount && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(progressCount.current / progressCount.total) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-3 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}
            </>
          )}

          {productionMode === 'referenced2' && (
            <>
              <button
                onClick={() => handleRef2Generate()}
                disabled={!ref2ModelImage || ref2GarmentImages.length === 0 || !ref2SceneImage || isProcessing}
                className={`w-full py-3 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-2 ${
                  !ref2ModelImage || ref2GarmentImages.length === 0 || !ref2SceneImage || isProcessing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
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
                    <span>Referanslı 2 Üret</span>
                  </>
                )}
              </button>

              {/* Progress */}
              {isProcessing && progress && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-2 mt-3">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{progress}</span>
                  </div>
                  {progressCount && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(progressCount.current / progressCount.total) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-3 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}
            </>
          )}

          {productionMode === 'scene' && (
            <>
              <button
                onClick={handleShowScenePromptPreview}
                disabled={!sceneSourceModel || !sceneImage || isProcessing}
                className={`w-full py-3 rounded-xl font-medium text-gray-900 text-sm flex items-center justify-center gap-2 ${
                  !sceneSourceModel || !sceneImage || isProcessing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-mode-accent to-primary hover:from-mode-accent/90 hover:to-primary/90'
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
                    <span>Prompt'u Göster ve Yerleştir</span>
                  </>
                )}
              </button>

              {/* Progress */}
              {isProcessing && progress && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 mt-3">
                  <div className="flex items-center gap-2 text-amber-600 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{progress}</span>
                  </div>
                  {progressCount && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${(progressCount.current / progressCount.total) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-3 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}
            </>
          )}

          {productionMode === 'preset' && (
            <>
              <button
                onClick={handleShowPresetPromptPreview}
                disabled={presetClothes.length === 0 || !customBackground || isProcessing || (presetUseCustomModel && !presetModel)}
                className={`w-full py-3 rounded-xl font-medium text-gray-900 text-sm flex items-center justify-center gap-2 ${
                  presetClothes.length === 0 || !customBackground || isProcessing || (presetUseCustomModel && !presetModel)
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
                    <span>
                      {presetSettings.useAngleSet
                        ? 'Setli Üret (5 Açı)'
                        : `Oluştur (${presetSettings.numberOfImages} Görsel)`}
                    </span>
                  </>
                )}
              </button>

              {/* Progress & Error */}
              {progress && (
                <div className="bg-primary/10 rounded-lg p-2 border border-primary/20 mt-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-primary/90" />
                    <span className="text-primary/90 text-xs">{progress}</span>
                  </div>
                  {progressCount && (
                    <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-pink-500 transition-all duration-300"
                        style={{ width: `${(progressCount.current / progressCount.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              {error && (
                <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/20 flex items-start gap-2 mt-3">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-red-600 text-xs">{error}</span>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT - Results Area */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {productionMode === 'standard' && (
          <div className="bg-white p-6 flex-1 flex flex-col min-h-0">
            {results.length > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="relative group">
                  <img
                    src={results[selectedResult]?.imageData}
                    alt="Sonuc"
                    className="max-h-[70vh] max-w-full object-contain rounded-lg bg-gray-100"
                  />
                  <button
                    onClick={() => handleDownload(results[selectedResult]?.imageData, selectedResult)}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-[10px]">
                    {MENS_FASHION_PURPOSE_OPTIONS.find(p => p.id === results[selectedResult]?.purpose)?.name || 'Erkek Giyim'}
                  </div>
                </div>

                {results.length > 1 && (
                  <div className="flex gap-2">
                    {results.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedResult(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedResult === index ? 'border-mode-accent' : 'border-gray-200 hover:border-border-strong'
                        }`}
                      >
                        <img src={result.imageData} alt={`${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Shirt className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Ürün yükleyip ayarları seçin</p>
              </div>
            )}
          </div>
        )}

        {productionMode === 'referenced' && (
          <div className="bg-white p-6 flex-1 flex flex-col min-h-0">
            {refResults.length > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="relative group">
                  <img
                    src={refResults[refSelectedResult]?.imageData}
                    alt="Sonuç"
                    className="max-h-[70vh] max-w-full object-contain rounded-lg bg-gray-100"
                  />
                  <button
                    onClick={() => handleRefDownload(refResults[refSelectedResult]?.imageData, refSelectedResult)}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-[10px]">
                    Referanslı Üretim
                  </div>
                </div>

                {refResults.length > 1 && (
                  <div className="flex gap-2">
                    {refResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => setRefSelectedResult(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          refSelectedResult === index ? 'border-emerald-500' : 'border-gray-200 hover:border-border-strong'
                        }`}
                      >
                        <img src={result.imageData} alt={`${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <ReferenceIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Manken ve referans fotoğrafı yükleyin</p>
              </div>
            )}
          </div>
        )}

        {productionMode === 'referenced2' && (
          <div className="bg-white p-6 flex-1 flex flex-col min-h-0">
            {ref2Results.length > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="relative group">
                  <img
                    src={ref2Results[ref2SelectedResult]?.imageData}
                    alt="Sonuç"
                    className="max-h-[70vh] max-w-full object-contain rounded-lg bg-gray-100"
                  />
                  <button
                    onClick={() => handleRef2Download(ref2Results[ref2SelectedResult]?.imageData, ref2SelectedResult)}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-[10px]">
                    Referanslı 2 Üretim
                  </div>
                </div>

                {ref2Results.length > 1 && (
                  <div className="flex gap-2">
                    {ref2Results.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => setRef2SelectedResult(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          ref2SelectedResult === index ? 'border-indigo-500' : 'border-gray-200 hover:border-border-strong'
                        }`}
                      >
                        <img src={result.imageData} alt={`${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Layers className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Manken, kıyafet ve mekan fotoğrafı yükleyin</p>
              </div>
            )}
          </div>
        )}

        {productionMode === 'scene' && (
          <div className="bg-white p-6 flex-1 flex flex-col min-h-0">
            {sceneResults.length > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="relative group">
                  <img
                    src={sceneResults[sceneSelectedResult]?.imageData}
                    alt="Sonuç"
                    className="max-h-[70vh] max-w-full object-contain rounded-lg bg-gray-100"
                  />
                  <button
                    onClick={() => handleSceneDownload(sceneResults[sceneSelectedResult]?.imageData, sceneSelectedResult)}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-[10px]">
                    Sahneye Yerleştirme
                  </div>
                </div>

                {sceneResults.length > 1 && (
                  <div className="flex gap-2">
                    {sceneResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => setSceneSelectedResult(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          sceneSelectedResult === index ? 'border-amber-500' : 'border-gray-200 hover:border-border-strong'
                        }`}
                      >
                        <img src={result.imageData} alt={`${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <SceneIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Manken ve sahne fotoğrafı yükleyin</p>
              </div>
            )}
          </div>
        )}

        {productionMode === 'preset' && (
          <div className="bg-white p-6 flex-1 flex flex-col min-h-0">
            {presetResults.length > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="relative group">
                  <img
                    src={presetResults[presetSelectedResult]?.imageData}
                    alt="Result"
                    className="max-h-[70vh] max-w-full object-contain rounded-lg bg-gray-100"
                  />
                  <button
                    onClick={() => handlePresetDownload(presetResults[presetSelectedResult]?.imageData, presetSelectedResult)}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-[10px]">
                    {presetResults[presetSelectedResult]?.presetName || 'Hazır Sahne'}
                  </div>
                </div>

                {presetResults.length > 1 && (
                  <div className="flex gap-2">
                    {presetResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => setPresetSelectedResult(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          presetSelectedResult === index ? 'border-primary' : 'border-gray-200 hover:border-border-strong'
                        }`}
                      >
                        <img src={result.imageData} alt={`${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <PresetIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Kıyafetler yükleyin ve hazır sahne seçin</p>
              </div>
            )}
          </div>
        )}
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
                      ? 'bg-gradient-to-br from-mode-accent to-primary'
                      : productionMode === 'referenced'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                        : productionMode === 'referenced2'
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                          : productionMode === 'preset'
                            ? 'bg-gradient-to-br from-primary to-pink-500'
                            : 'bg-gradient-to-br from-mode-accent to-primary'
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
                    setShowPromptPreview(false);
                    if (productionMode === 'standard') {
                      handleGenerate();
                    } else if (productionMode === 'referenced') {
                      handleRefGenerate();
                    } else if (productionMode === 'referenced2') {
                      handleRef2Generate();
                    } else if (productionMode === 'preset') {
                      handlePresetGenerate();
                    } else {
                      handleSceneGenerate();
                    }
                  }}
                  className={`px-6 py-2.5 rounded-lg font-medium text-gray-900 text-sm flex items-center gap-2 ${
                    productionMode === 'standard'
                      ? 'bg-gradient-to-r from-mode-accent to-primary hover:from-mode-accent/90 hover:to-primary/90'
                      : productionMode === 'referenced'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                        : productionMode === 'referenced2'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                          : productionMode === 'preset'
                            ? 'bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-600'
                            : 'bg-gradient-to-r from-mode-accent to-primary hover:from-mode-accent/90 hover:to-primary/90'
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

export default MensFashionMode;
