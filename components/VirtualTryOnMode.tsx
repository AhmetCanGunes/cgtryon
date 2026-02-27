

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useBlobUrl } from '../hooks/useBlobUrl';
import { Upload, X, Sparkles, Loader2, Info, ArrowRight, Camera, Move, ImageIcon, Download, Plus, ChevronLeft, ChevronRight, Layers, Shirt, Check, FolderDown, User, Trash2 } from 'lucide-react';
import { 
    TryOnSettings, 
    TRYON_CATEGORIES, 
    GeneratedImage, 
    MODEL_QUALITY_OPTIONS, 
    TRYON_POSES, 
    TRYON_BACKGROUNDS, 
    RESOLUTION_OPTIONS,
    IMAGE_COUNT_OPTIONS,
    ASPECT_RATIO_OPTIONS,
    SEASON_OPTIONS,
    WEATHER_OPTIONS,
    AD_THEMES,
    AD_THEME_VARIATIONS,
    getDefaultPoseForCategory
} from '../types';
import Dropdown from './Dropdown';

interface VirtualTryOnModeProps {
  onGenerate: (model: File, garment: File, garment2: File | null, garment3: File | null, settings: TryOnSettings, additionalGarments?: File[]) => void;
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
}

const VirtualTryOnMode: React.FC<VirtualTryOnModeProps> = ({ onGenerate, isGenerating, generatedImages }) => {
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [garmentImage2, setGarmentImage2] = useState<File | null>(null);
  const [garmentImage3, setGarmentImage3] = useState<File | null>(null);
  const [garmentImage4, setGarmentImage4] = useState<File | null>(null);
  const [garmentImage5, setGarmentImage5] = useState<File | null>(null);
  const [garmentImage6, setGarmentImage6] = useState<File | null>(null);
  const [garmentImage7, setGarmentImage7] = useState<File | null>(null);

  // Drag states
  const [isModelDragging, setIsModelDragging] = useState(false);
  const [isGarmentDragging, setIsGarmentDragging] = useState(false);
  const [isGarment2Dragging, setIsGarment2Dragging] = useState(false);
  const [isGarment3Dragging, setIsGarment3Dragging] = useState(false);
  const [isGarment4Dragging, setIsGarment4Dragging] = useState(false);
  const [isGarment5Dragging, setIsGarment5Dragging] = useState(false);
  const [isGarment6Dragging, setIsGarment6Dragging] = useState(false);
  const [isGarment7Dragging, setIsGarment7Dragging] = useState(false);
  
  // Result Navigation
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [settings, setSettings] = useState<TryOnSettings>({
    category: TRYON_CATEGORIES[0],
    description: '',
    modelQuality: MODEL_QUALITY_OPTIONS[0],
    resolution: RESOLUTION_OPTIONS[0], 
    pose: TRYON_POSES[0], // Defaults to 'Seçiniz (Otomatik)'
    background: TRYON_BACKGROUNDS[0].value, // Defaults to 'auto'
    aspectRatio: ASPECT_RATIO_OPTIONS[0],
    numberOfImages: 1,
    season: SEASON_OPTIONS[0],
    weather: WEATHER_OPTIONS[0],
    theme: AD_THEMES[0],
    sceneVariation: 'auto'
  });

  // Theme Variation State
  const [sceneVariationOptions, setSceneVariationOptions] = useState<{label: string, value: string}[]>([
    { label: 'Otomatik (Rastgele Sahne)', value: 'auto' }
  ]);

  // Update scene variation options when theme changes
  useEffect(() => {
    const currentTheme = settings.theme || AD_THEMES[0];
    const variations = AD_THEME_VARIATIONS[currentTheme] || [];
    const opts = [
      { label: 'Otomatik (Rastgele Sahne)', value: 'auto' },
      ...variations.map(v => ({ label: v.label, value: v.id }))
    ];
    setSceneVariationOptions(opts);
  }, [settings.theme]);

  // Blob URL management — guaranteed cleanup via useBlobUrl hook
  const modelPreview = useBlobUrl(modelImage);
  const garmentPreview = useBlobUrl(garmentImage);
  const garment2Preview = useBlobUrl(garmentImage2);
  const garment3Preview = useBlobUrl(garmentImage3);
  const garment4Preview = useBlobUrl(garmentImage4);
  const garment5Preview = useBlobUrl(garmentImage5);
  const garment6Preview = useBlobUrl(garmentImage6);
  const garment7Preview = useBlobUrl(garmentImage7);

  const modelInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);
  const garment2InputRef = useRef<HTMLInputElement>(null);
  const garment3InputRef = useRef<HTMLInputElement>(null);
  const garment4InputRef = useRef<HTMLInputElement>(null);
  const garment5InputRef = useRef<HTMLInputElement>(null);
  const garment6InputRef = useRef<HTMLInputElement>(null);
  const garment7InputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (generatedImages.length > 0) {
        setCurrentImageIndex(generatedImages.length - 1);
    }
  }, [generatedImages.length]);

  const handleUpload = (file: File, type: 'model' | 'garment' | 'garment2' | 'garment3' | 'garment4' | 'garment5' | 'garment6' | 'garment7') => {
    if (type === 'model') {
        setModelImage(file);
    } else if (type === 'garment') {
        setGarmentImage(file);
    } else if (type === 'garment2') {
        setGarmentImage2(file);
    } else if (type === 'garment3') {
        setGarmentImage3(file);
    } else if (type === 'garment4') {
        setGarmentImage4(file);
    } else if (type === 'garment5') {
        setGarmentImage5(file);
    } else if (type === 'garment6') {
        setGarmentImage6(file);
    } else {
        setGarmentImage7(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setter(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setter(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'model' | 'garment' | 'garment2' | 'garment3' | 'garment4' | 'garment5', setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setter(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleUpload(file, type);
      } else {
        alert("Lütfen geçerli bir resim dosyası yükleyin.");
      }
    }
  }, []);

  // Safe access to current image to prevent "undefined" errors
  const currentImage = generatedImages[currentImageIndex];

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = `KAapp_TryOn_${currentImage.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAll = () => {
    generatedImages.forEach((img, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = img.url;
            link.download = `KAapp_TryOn_${index + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, index * 300); // Stagger downloads slightly
    });
};

  const updateSetting = (key: keyof TryOnSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryChange = (newCategory: string) => {
      // With the new logic, we default to 'Seçiniz' (Auto) when category changes, 
      // instead of pre-selecting a specific pose string.
      const suggestedPose = 'Seçiniz (Otomatik)';
      setSettings(prev => ({ 
          ...prev, 
          category: newCategory,
          pose: suggestedPose 
      }));
  };

  const handleGenerateClick = () => {
    if (!modelImage || !garmentImage) return;

    // Ek kıyafetleri topla (garmentImage4, garmentImage5, garmentImage6, garmentImage7)
    const additionalGarments: File[] = [];
    if (garmentImage4) additionalGarments.push(garmentImage4);
    if (garmentImage5) additionalGarments.push(garmentImage5);
    if (garmentImage6) additionalGarments.push(garmentImage6);
    if (garmentImage7) additionalGarments.push(garmentImage7);

    console.log(`🎯 Sanal Kabin: Model + ${1 + (garmentImage2 ? 1 : 0) + (garmentImage3 ? 1 : 0) + additionalGarments.length} kıyafet gönderiliyor`);

    onGenerate(modelImage, garmentImage, garmentImage2, garmentImage3, settings, additionalGarments.length > 0 ? additionalGarments : undefined);
  };

  // Kompakt görsel yükleme kutusu (Erkek Giyim tarzında)
  const renderCompactUploadBox = (
    image: File | null,
    previewUrl: string | null,
    setImage: (f: File | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
    type: 'model' | 'garment' | 'garment2' | 'garment3',
    icon: React.ReactNode,
    label: string,
    ringColor: string,
    badgeColor: string,
    badgeContent: React.ReactNode
  ) => {
    if (image && previewUrl) {
      return (
        <div className="relative group w-16 h-16 flex-shrink-0">
          <img
            src={previewUrl}
            alt={label}
            className={`w-full h-full object-cover rounded-lg ring-2 ${ringColor}`}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
          >
            <Upload className="w-3 h-3 text-white" />
          </button>
          <span className={`absolute -top-1 -left-1 w-4 h-4 ${badgeColor} rounded-full flex items-center justify-center text-[8px] text-white font-bold`}>
            {badgeContent}
          </span>
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], type)}
          />
        </div>
      );
    }
    return (
      <button
        onClick={() => inputRef.current?.click()}
        className={`w-16 h-16 rounded-lg border-2 border-dashed ${ringColor.replace('ring-', 'border-')}/50 hover:${ringColor.replace('ring-', 'border-')} flex flex-col items-center justify-center transition-all`}
      >
        {icon}
        <span className="text-[8px] mt-0.5 text-gray-400">{label}</span>
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], type)}
        />
      </button>
    );
  };

  return (
    <div className="flex h-full w-full">
        {/* LEFT SIDEBAR: CONFIGURATION */}
        <div className="w-[380px] flex-shrink-0 border-r border-white/10 bg-bg-surface flex flex-col h-full z-20">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">

                {/* Header */}
                <div className="flex items-center gap-2 pb-1.5 border-b border-white/10">
                    <Sparkles className="text-primary" size={14} />
                    <h2 className="text-[11px] font-bold text-gray-200 tracking-wide">SANAL KABİN STÜDYOSU</h2>
                </div>

                {/* INFO ALERT */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 flex gap-2">
                    <Info className="text-blue-400 flex-shrink-0" size={12} />
                    <p className="text-[9px] text-blue-300 leading-relaxed">
                        En iyi sonuç için <strong>net ışıklandırılmış</strong> model ve <strong>düz zeminli</strong> kıyafet fotoğrafı kullanın.
                    </p>
                </div>

                {/* COMPACT UPLOAD SECTION */}
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görseller</h3>

                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Model Fotoğrafı */}
                    {modelImage ? (
                      <div className="relative group w-16 h-16 flex-shrink-0">
                        <img
                          src={modelPreview!}
                          alt="Model"
                          className="w-full h-full object-cover rounded-lg ring-2 ring-primary"
                        />
                        <button
                          onClick={() => modelInputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Upload className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => setModelImage(null)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                        <span className="absolute -top-1 -left-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <User className="w-2.5 h-2.5 text-white" />
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => modelInputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary flex flex-col items-center justify-center text-secondary hover:text-primary transition-all"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-[8px] mt-0.5">Model</span>
                      </button>
                    )}

                    {/* Divider */}
                    <div className="w-px h-12 bg-gray-200 mx-1" />

                    {/* Ana Kıyafet */}
                    {garmentImage ? (
                      <div className="relative group w-16 h-16 flex-shrink-0">
                        <img
                          src={garmentPreview!}
                          alt="Kıyafet"
                          className="w-full h-full object-cover rounded-lg ring-2 ring-mode-accent"
                        />
                        <button
                          onClick={() => garmentInputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Upload className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => setGarmentImage(null)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                        <span className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">1</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => garmentInputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-blue-500/50 hover:border-blue-500 flex flex-col items-center justify-center text-blue-400 hover:text-blue-500 transition-all"
                      >
                        <Shirt className="w-4 h-4" />
                        <span className="text-[8px] mt-0.5">Kıyafet</span>
                      </button>
                    )}

                    {/* İkinci Kıyafet */}
                    {garmentImage2 ? (
                      <div className="relative group w-16 h-16 flex-shrink-0">
                        <img
                          src={garment2Preview!}
                          alt="Kıyafet 2"
                          className="w-full h-full object-cover rounded-lg ring-1 ring-gray-300"
                        />
                        <button
                          onClick={() => garment2InputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Upload className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => setGarmentImage2(null)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                        <span className="absolute -top-1 -left-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">2</span>
                      </div>
                    ) : garmentImage && (
                      <button
                        onClick={() => garment2InputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[8px] mt-0.5">2. Ekle</span>
                      </button>
                    )}

                    {/* Üçüncü Kıyafet */}
                    {garmentImage3 ? (
                      <div className="relative group w-16 h-16 flex-shrink-0">
                        <img
                          src={garment3Preview!}
                          alt="Kıyafet 3"
                          className="w-full h-full object-cover rounded-lg ring-1 ring-gray-300"
                        />
                        <button
                          onClick={() => garment3InputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Upload className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => setGarmentImage3(null)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                        <span className="absolute -top-1 -left-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">3</span>
                      </div>
                    ) : garmentImage2 && (
                      <button
                        onClick={() => garment3InputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[8px] mt-0.5">3. Ekle</span>
                      </button>
                    )}

                    {/* Dördüncü Kıyafet */}
                    {garmentImage4 ? (
                      <div className="relative group w-16 h-16 flex-shrink-0">
                        <img
                          src={garment4Preview!}
                          alt="Kıyafet 4"
                          className="w-full h-full object-cover rounded-lg ring-1 ring-gray-300"
                        />
                        <button
                          onClick={() => garment4InputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Upload className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => setGarmentImage4(null)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                        <span className="absolute -top-1 -left-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">4</span>
                      </div>
                    ) : garmentImage3 && (
                      <button
                        onClick={() => garment4InputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[8px] mt-0.5">4. Ekle</span>
                      </button>
                    )}

                    {/* Beşinci Kıyafet */}
                    {garmentImage5 ? (
                      <div className="relative group w-16 h-16 flex-shrink-0">
                        <img
                          src={garment5Preview!}
                          alt="Kıyafet 5"
                          className="w-full h-full object-cover rounded-lg ring-1 ring-gray-300"
                        />
                        <button
                          onClick={() => garment5InputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Upload className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => setGarmentImage5(null)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                        <span className="absolute -top-1 -left-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">5</span>
                      </div>
                    ) : garmentImage4 && (
                      <button
                        onClick={() => garment5InputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[8px] mt-0.5">5. Ekle</span>
                      </button>
                    )}

                    {/* Altıncı Kıyafet */}
                    {garmentImage6 ? (
                      <div className="relative group w-16 h-16 flex-shrink-0">
                        <img
                          src={garment6Preview!}
                          alt="Kıyafet 6"
                          className="w-full h-full object-cover rounded-lg ring-1 ring-gray-300"
                        />
                        <button
                          onClick={() => garment6InputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Upload className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => setGarmentImage6(null)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                        <span className="absolute -top-1 -left-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">6</span>
                      </div>
                    ) : garmentImage5 && (
                      <button
                        onClick={() => garment6InputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[8px] mt-0.5">6. Ekle</span>
                      </button>
                    )}

                    {/* Yedinci Kıyafet */}
                    {garmentImage7 ? (
                      <div className="relative group w-16 h-16 flex-shrink-0">
                        <img
                          src={garment7Preview!}
                          alt="Kıyafet 7"
                          className="w-full h-full object-cover rounded-lg ring-1 ring-gray-300"
                        />
                        <button
                          onClick={() => garment7InputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Upload className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => setGarmentImage7(null)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                        <span className="absolute -top-1 -left-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">7</span>
                      </div>
                    ) : garmentImage6 && (
                      <button
                        onClick={() => garment7InputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[8px] mt-0.5">7. Ekle</span>
                      </button>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="flex gap-3 mt-2 text-[8px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span>Model</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span>Ana Kıyafet</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      <span>Ek</span>
                    </div>
                  </div>
                </div>

                {/* Hidden file inputs */}
                <input type="file" ref={modelInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'model')} />
                <input type="file" ref={garmentInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'garment')} />
                <input type="file" ref={garment2InputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'garment2')} />
                <input type="file" ref={garment3InputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'garment3')} />
                <input type="file" ref={garment4InputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'garment4')} />
                <input type="file" ref={garment5InputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'garment5')} />
                <input type="file" ref={garment6InputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'garment6')} />
                <input type="file" ref={garment7InputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'garment7')} />

                {/* SETTINGS */}
                <div className="space-y-2">
                    {/* Category & Theme in one row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Kategori</label>
                        <select
                            value={settings.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {TRYON_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat} className="bg-bg-elevated">{cat}</option>
                            ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Tema</label>
                        <select
                            value={settings.theme || AD_THEMES[0]}
                            onChange={(e) => updateSetting('theme', e.target.value)}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {AD_THEMES.map((theme) => (
                                <option key={theme} value={theme} className="bg-bg-elevated">{theme}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Scene Variation */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Varyasyon / Sahne</label>
                        <select
                            value={settings.sceneVariation || 'auto'}
                            onChange={(e) => updateSetting('sceneVariation', e.target.value)}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {sceneVariationOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-bg-elevated">{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Season & Weather */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Mevsim</label>
                        <select
                            value={settings.season || SEASON_OPTIONS[0]}
                            onChange={(e) => updateSetting('season', e.target.value)}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {SEASON_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} className="bg-bg-elevated">{opt}</option>
                            ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Hava</label>
                        <select
                            value={settings.weather || WEATHER_OPTIONS[0]}
                            onChange={(e) => updateSetting('weather', e.target.value)}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {WEATHER_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} className="bg-bg-elevated">{opt}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Quality & Resolution */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Kalite</label>
                        <select
                            value={settings.modelQuality}
                            onChange={(e) => updateSetting('modelQuality', e.target.value)}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {MODEL_QUALITY_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} className="bg-bg-elevated">{opt}</option>
                            ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Çözünürlük</label>
                        <select
                            value={settings.resolution}
                            onChange={(e) => updateSetting('resolution', e.target.value)}
                            disabled={!settings.modelQuality.includes('Pro') && !settings.modelQuality.includes('Nano')}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary disabled:opacity-50"
                        >
                            {RESOLUTION_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} className="bg-bg-elevated">{opt}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Oran</label>
                        <div className="flex gap-1.5">
                            {ASPECT_RATIO_OPTIONS.map((ratio) => {
                                const isSelected = settings.aspectRatio === ratio;
                                const label = ratio.split(' ')[0];
                                return (
                                    <button
                                        key={ratio}
                                        onClick={() => updateSetting('aspectRatio', ratio)}
                                        className={`flex-1 py-1.5 text-[9px] font-medium rounded-lg border transition-all ${
                                            isSelected
                                            ? 'bg-primary/20 border-primary/50 text-primary'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                         <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Ek Açıklama</label>
                        <textarea
                            value={settings.description}
                            onChange={(e) => updateSetting('description', e.target.value)}
                            placeholder="Örn: Kıyafetin omuzları tam otursun..."
                            className="w-full bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 resize-none h-12 focus:border-primary focus:outline-none placeholder-gray-500"
                        />
                    </div>
                </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="p-3 border-t border-white/10 bg-bg-surface z-30">
                <button
                    onClick={handleGenerateClick}
                    disabled={!modelImage || !garmentImage || isGenerating}
                    className={`w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        !modelImage || !garmentImage || isGenerating
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                        : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-md shadow-primary/20'
                    }`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin" size={14} />
                            <span>İşleniyor...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={14} />
                            <span>GİYDİR VE OLUŞTUR</span>
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* RIGHT SIDE: PREVIEW */}
        <div className="flex-1 bg-bg-base relative flex flex-col items-center justify-center p-6 overflow-hidden">
             
             {generatedImages.length > 0 && currentImage ? (
                 <div className="relative w-full h-full flex flex-col items-center">
                    {/* Main Image */}
                    <div className="relative flex-1 w-full flex items-center justify-center min-h-0 mb-4 group">
                        <img 
                            src={currentImage.url} 
                            alt="Generated TryOn" 
                            className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                             <button 
                                onClick={handleDownloadAll}
                                className="p-3 bg-white/90 text-gray-700 rounded-lg hover:bg-white shadow-lg border border-gray-200"
                                title="Hepsini İndir"
                            >
                                <FolderDown size={20} />
                            </button>
                            <button 
                                onClick={handleDownload}
                                className="p-3 bg-primary text-white rounded-lg hover:bg-primary shadow-lg"
                                title="İndir"
                            >
                                <Download size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation Bar if Multiple Images */}
                    {generatedImages.length > 1 && (
                        <div className="h-16 w-full max-w-xl bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-2 flex items-center justify-center gap-3">
                            <button
                                onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentImageIndex === 0}
                                className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-gray-400"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex gap-1.5 overflow-x-auto px-1 scrollbar-hide h-full items-center">
                                {generatedImages.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative h-10 w-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                            idx === currentImageIndex ? 'border-primary scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentImageIndex(prev => Math.min(generatedImages.length - 1, prev + 1))}
                                disabled={currentImageIndex === generatedImages.length - 1}
                                className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-gray-400"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                 </div>
             ) : (
                /* EMPTY STATE */
                <div className="flex flex-col items-center justify-center text-gray-500 select-none pointer-events-none">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-base font-medium text-gray-400 mb-1">Sanal Kabin Boş</h3>
                    <p className="text-xs text-gray-500 max-w-xs text-center">
                        Model ve kıyafet fotoğraflarını yükleyerek "Giydir ve Oluştur" butonuna tıklayın.
                    </p>
                </div>
             )}
        </div>
    </div>
  );
};

export default VirtualTryOnMode;