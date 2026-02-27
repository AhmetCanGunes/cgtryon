import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X, Wand2, Loader2, Upload, Layout, Check, Sparkles, Image as ImageIcon, Tag, Star, Save, Trash2, Plus, Play, Heart, BedDouble, ListFilter, Droplets, Box, User, Monitor, LayoutTemplate, Lightbulb, Eye, SunMedium, Camera } from 'lucide-react'; 
import {
  GenerationSettings,
  GENDER_OPTIONS,
  ETHNICITY_OPTIONS,
  SKIN_TONE_OPTIONS,
  AGE_OPTIONS,
  BODY_TYPE_OPTIONS,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPE_OPTIONS,
  BACKGROUND_OPTIONS_FULL,
  HAIR_STYLE_OPTIONS,
  HAIR_COLOR_OPTIONS,
  LIPSTICK_COLOR_OPTIONS,
  NAIL_POLISH_OPTIONS,
  HEIGHT_OPTIONS,
  VIEW_ANGLE_OPTIONS,
  MODEL_POSE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  LoadingState,
  GeneratedImage,
  MODEL_QUALITY_OPTIONS,
  RESOLUTION_OPTIONS,
  IMAGE_COUNT_OPTIONS,
  getDefaultPoseForCategory,
  SEASON_OPTIONS,
  WEATHER_OPTIONS,
  BOUDOIR_POSE_CATEGORIES,
  BOUDOIR_LIGHTING_OPTIONS,
  BOUDOIR_CAMERA_ANGLE_OPTIONS,
  AD_THEMES,
  AD_THEME_VARIATIONS,
  ACCESSORY_BACKGROUND_STYLES,
  ACCESSORY_POSES,
  ACCESSORY_LIGHTING,
  isAccessoryProduct,
  WALLET_POSES_WITH_MODEL,
  WALLET_SCENES_PRODUCT_ONLY,
  WALLET_LIGHTING,
  isWalletProduct,
  BAG_POSES_WITH_MODEL,
  BAG_SCENES_PRODUCT_ONLY,
  BAG_LIGHTING,
  isBagProduct,
  SHOES_POSES_WITH_MODEL,
  SHOES_SCENES_PRODUCT_ONLY,
  SHOES_LIGHTING,
  isShoesProduct,
  SUNGLASSES_POSES_WITH_MODEL,
  SUNGLASSES_SCENES_PRODUCT_ONLY,
  SUNGLASSES_LIGHTING,
  isSunglassesProduct,
  WATCH_POSES_WITH_MODEL,
  WATCH_SCENES_PRODUCT_ONLY,
  WATCH_LIGHTING,
  isWatchProduct,
  EARRINGS_POSES_WITH_MODEL,
  EARRINGS_SCENES_PRODUCT_ONLY,
  EARRINGS_LIGHTING,
  isEarringsProduct,
  NECKLACE_POSES_WITH_MODEL,
  NECKLACE_SCENES_PRODUCT_ONLY,
  NECKLACE_LIGHTING,
  isNecklaceProduct,
  BRACELET_JEWELRY_POSES_WITH_MODEL,
  BRACELET_JEWELRY_SCENES_PRODUCT_ONLY,
  BRACELET_JEWELRY_LIGHTING,
  isBraceletJewelryProduct,
  RING_POSES_WITH_MODEL,
  RING_SCENES_PRODUCT_ONLY,
  RING_LIGHTING,
  isRingProduct,
  HAT_POSES_WITH_MODEL,
  HAT_SCENES_PRODUCT_ONLY,
  HAT_LIGHTING,
  isHatProduct,
  FRAMING_OPTIONS,
  TARGET_POSE_OPTIONS,
  BRANDED_CONCEPTS,
  BRANDED_STANCE,
  BRANDED_POSE_ENERGY,
  BRANDED_CLOTHING_STYLE,
  BRANDED_HAIR_STYLE,
  BRANDED_EXPRESSION,
  BRANDED_PRODUCT_ORIENTATION,
  BRANDED_PRODUCT_PLACEMENT,
  BRANDED_PRODUCT_CONTEXT,
  BRANDED_PRODUCT_CONDITION,
  BRANDED_COLOR_TEMPERATURE,
  BRANDED_COLOR_HARMONY,
  BRANDED_MATERIAL_FINISH,
  BRANDED_FRAMING,
  BRANDED_DEPTH,
  BRANDED_NEGATIVE_SPACE,
  BRANDED_ASPECT_RATIO_STYLE
} from '../types';
import Dropdown from './Dropdown';

interface SidebarProps {
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
}

interface Preset {
  id: string;
  name: string;
  settings: Partial<GenerationSettings>;
  isSystem?: boolean;
}

// Default System Presets
const SYSTEM_PRESETS: Preset[] = [
  {
    id: 'sys_1',
    name: 'Stüdyo (Temiz)',
    isSystem: true,
    settings: {
      background: 'Beyaz Stüdyo (Saf Beyaz)',
      modelPose: 'Düz Duruş (Katalog)',
      viewAngle: 'Önden (Front)',
      numberOfImages: 1
    }
  },
  {
    id: 'sys_2',
    name: 'Yaz / Plaj',
    isSystem: true,
    settings: {
      background: 'Sahil / Plaj (Vogue Beach)',
      modelPose: 'Tam boy, hafifçe geriye yaslanma, dinamik silüet'
    }
  },
  {
    id: 'sys_3',
    name: 'Profesyonel Portre',
    isSystem: true,
    settings: {
      background: 'Lüks İç Mekan (Ev/Otel)',
      modelPose: 'Göğüsten Yukarı (Chest Up), net portre odaklı',
      aspectRatio: '4:5 (Instagram Dikey)',
      viewAngle: 'Önden (Front)'
    }
  }
];

const Sidebar: React.FC<SidebarProps> = ({
  productImage,
  settings,
  onProductImageUpload,
  onRemoveProductImage,
  onSettingsChange,
  onGenerate, 
  isGenerating,
  currentTask,
  onSaveSettings,
}) => {
  const productInputRef = useRef<HTMLInputElement>(null);
  const [isProductDragging, setIsProductDragging] = useState(false);
  
  // Preset State
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Local state to manage the specific product dropdown options
  const [currentSubOptions, setCurrentSubOptions] = useState<string[]>([]);
  
  // Boudoir Category State - Default to empty/unselected
  const [selectedBoudoirCategory, setSelectedBoudoirCategory] = useState<string>(settings.boudoirCategory || '');

  // Theme Variation State
  const [sceneVariationOptions, setSceneVariationOptions] = useState<{label: string, value: string}[]>([
    { label: 'Otomatik (Rastgele Sahne)', value: 'auto' }
  ]);

  // Sync local state if settings.boudoirCategory changes externally (e.g. preset load)
  useEffect(() => {
    if (settings.boudoirCategory && settings.boudoirCategory !== selectedBoudoirCategory) {
        setSelectedBoudoirCategory(settings.boudoirCategory);
    }
  }, [settings.boudoirCategory]);

  // Update scene variation options when theme changes
  useEffect(() => {
    const currentTheme = settings.theme || AD_THEMES[0]; // Use first theme as default
    const variations = AD_THEME_VARIATIONS[currentTheme] || [];
    const opts = [
      { label: 'Otomatik (Rastgele Sahne)', value: 'auto' },
      ...variations.map(v => ({ label: v.label, value: v.id }))
    ];
    setSceneVariationOptions(opts);
  }, [settings.theme]);

  // Initialize sub-options based on current category
  useEffect(() => {
     if (settings.productCategory && PRODUCT_CATEGORIES[settings.productCategory]) {
         setCurrentSubOptions(PRODUCT_CATEGORIES[settings.productCategory]);
     } else {
         // Fallback default
         const defaultCat = Object.keys(PRODUCT_CATEGORIES)[0];
         setCurrentSubOptions(PRODUCT_CATEGORIES[defaultCat]);
     }
  }, [settings.productCategory]);

  // Load Presets from LocalStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('modaAI_custom_presets');
    if (savedPresets) {
      try {
        setPresets([...SYSTEM_PRESETS, ...JSON.parse(savedPresets)]);
      } catch (e) {
        setPresets(SYSTEM_PRESETS);
      }
    } else {
      setPresets(SYSTEM_PRESETS);
    }
  }, []);

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;

    // Only save strictly visual settings
    const presetSettings: Partial<GenerationSettings> = {
      background: settings.background,
      modelPose: settings.modelPose,
      viewAngle: settings.viewAngle,
      aspectRatio: settings.aspectRatio,
      gender: settings.gender,
      ethnicity: settings.ethnicity,
      age: settings.age,
      customPrompt: settings.customPrompt
    };

    const newPreset: Preset = {
      id: `custom_${Date.now()}`,
      name: newPresetName,
      settings: presetSettings,
      isSystem: false
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    
    // Save only custom ones to local storage
    const customOnly = updatedPresets.filter(p => !p.isSystem);
    localStorage.setItem('modaAI_custom_presets', JSON.stringify(customOnly));
    
    setNewPresetName('');
    setShowSaveInput(false);
  };

  const handleApplyPreset = (preset: Preset) => {
    onSettingsChange({
      ...settings,
      ...preset.settings
    });
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedPresets = presets.filter(p => p.id !== id);
    setPresets(updatedPresets);
    const customOnly = updatedPresets.filter(p => !p.isSystem);
    localStorage.setItem('modaAI_custom_presets', JSON.stringify(customOnly));
  };

  const updateSetting = (key: keyof GenerationSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleCategoryChange = (newCategory: string) => {
     const subOptions = PRODUCT_CATEGORIES[newCategory] || [];
     const firstItem = subOptions.length > 0 ? subOptions[0] : '';
     const suggestedPose = getDefaultPoseForCategory(firstItem);

     onSettingsChange({
         ...settings,
         productCategory: newCategory,
         clothingType: firstItem,
         modelPose: suggestedPose,
         enableBoudoirMode: false // Reset boudoir mode on category change
     });
  };

  const handleClothingTypeChange = (newType: string) => {
    const suggestedPose = getDefaultPoseForCategory(newType);
    onSettingsChange({
        ...settings,
        clothingType: newType,
        modelPose: suggestedPose
    });
  };

  // Helper to handle Boudoir Category change
  const handleBoudoirCategoryChange = (cat: string) => {
      console.log('🎯 Boudoir Category Changed:', cat);
      
      // If "Lütfen Seçiniz" is selected, reset
      if (cat === 'Lütfen Seçiniz') {
          setSelectedBoudoirCategory('');
          onSettingsChange({
              ...settings,
              modelPose: 'Seçiniz (Otomatik)',
              boudoirCategory: ''
          });
          return;
      }
      
      setSelectedBoudoirCategory(cat);
      // Reset pose to "Lütfen Seçiniz" when category changes
      onSettingsChange({
          ...settings,
          modelPose: 'Lütfen Seçiniz',
          boudoirCategory: cat // Store category in settings
      });
  };

  const handleToggleBoudoir = () => {
      const newValue = !settings.enableBoudoir; // Use enableBoudoir consistently

      if (newValue) {
          // Enable: Reset to defaults - user must select everything
          setSelectedBoudoirCategory(''); // Reset to unselected
          
          console.log('🔥 Boudoir Toggle ON - User must select all options');
          
          onSettingsChange({
            ...settings,
            enableBoudoir: newValue,
            enableBoudoirMode: newValue,
            modelPose: 'Seçiniz (Otomatik)', // Reset pose
            boudoirCategory: '', // Empty - user must select
            boudoirLighting: 'Karanlık & Atmosferik (Varsayılan)', // Default lighting
            boudoirCameraAngle: 'Otomatik (AI Seçimi)' // Default camera
          });
      } else {
          // Disable: Reset to auto
          console.log('🔥 Boudoir Toggle OFF');
          
          onSettingsChange({
            ...settings,
            enableBoudoir: newValue,
            enableBoudoirMode: newValue,
            modelPose: 'Seçiniz (Otomatik)',
            boudoirCategory: undefined,
            boudoirLighting: undefined,
            boudoirCameraAngle: undefined
        });
      }
  };

  const productPreviewUrl = productImage ? URL.createObjectURL(productImage) : null;

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

  const handleDrop = useCallback((e: React.DragEvent, uploader: (file: File) => void, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setter(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        uploader(file);
        e.dataTransfer.clearData();
      } else {
        alert('Lütfen bir görsel dosyası sürükleyiniz.');
      }
    }
  }, []);

  // Determine if Lingerie category is selected to show the toggle
  const isLingerie = settings.clothingType.toLowerCase().match(/(jartiyer|lingerie|iç giyim|underwear|fantazi)/i);
  const isBoudoirActive = isLingerie && settings.enableBoudoirMode;
  const isAccessoryActive = isAccessoryProduct(settings.clothingType);

  return (
    <aside className="w-[380px] flex-shrink-0 border-r border-gray-200 bg-gray-50/50 h-screen flex flex-col z-20 relative">
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
        

        <div className="p-4 flex flex-col gap-4">
          
          {/* CARD 1: PRODUCT UPLOAD */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
              <Box className="text-primary" size={16} />
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">1. Ürün & Kategori</h2>
            </div>
            
            <div 
              className={`relative aspect-[2/1] rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center overflow-hidden group cursor-pointer mb-4
                ${isProductDragging ? 'border-primary bg-primary/10' : 'border-gray-200 bg-gray-50 hover:border-secondary'}`}
              onDragOver={(e) => handleDragOver(e, setIsProductDragging)}
              onDragLeave={(e) => handleDragLeave(e, setIsProductDragging)}
              onDrop={(e) => handleDrop(e, onProductImageUpload, setIsProductDragging)}
              onClick={() => !productImage && productInputRef.current?.click()}
            >
              {productPreviewUrl ? (
                <>
                  <img src={productPreviewUrl} alt="Product" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); productInputRef.current?.click(); }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white backdrop-blur-sm transition-colors"
                    >
                      <Upload size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveProductImage(); }}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg backdrop-blur-sm transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-2 text-primary group-hover:scale-110 transition-transform">
                      <Upload size={18} />
                    </div>
                    <p className="text-xs font-medium text-gray-600">Ürün Görseli Yükle</p>
                </div>
              )}
              <input 
                type="file" 
                ref={productInputRef}
                onChange={(e) => e.target.files?.[0] && onProductImageUpload(e.target.files[0])}
                className="hidden"
                accept="image/*"
              />
            </div>

            {productImage && ( 
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    {/* GÖRÜNÜM / KADRAJ */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold ml-0.5">
                            GÖRÜNÜM / KADRAJ
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {FRAMING_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => updateSetting('framing', option)}
                                    className={`px-3 py-3 text-xs font-medium rounded-lg transition-all text-left ${
                                        settings.framing === option
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <div className="font-bold">{option.split('(')[0].trim()}</div>
                                    <div className="text-[10px] opacity-80 mt-0.5">{option.match(/\((.*)\)/)?.[1] || ''}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* HEDEF POZ */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold ml-0.5">
                            HEDEF POZ
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {TARGET_POSE_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => updateSetting('targetPose', option)}
                                    className={`px-3 py-3 text-xs font-bold rounded-lg transition-all ${
                                        settings.targetPose === option
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {option.split('(')[0].trim()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* BOUDOIR TOGGLE - Now independent! */}
                    <button 
                        onClick={() => updateSetting('enableBoudoir', !settings.enableBoudoir)}
                        className={`w-full p-3 rounded-xl border transition-all flex items-start gap-3 text-left group relative overflow-hidden ${
                            settings.enableBoudoir 
                            ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300 shadow-sm' 
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${settings.enableBoudoir ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-400'}`}>
                            <BedDouble size={16} />
                        </div>
                        <div className="flex-1 z-10">
                            <span className={`text-xs font-bold block mb-0.5 ${settings.enableBoudoir ? 'text-rose-800' : 'text-gray-700'}`}>
                                Boudoir Modu
                            </span>
                            <p className="text-[10px] text-gray-500 leading-tight">
                                Estetik, atmosferik ve özel çekimler için
                            </p>
                        </div>
                        {settings.enableBoudoir && <div className="absolute right-2 top-2 text-rose-400"><Check size={14}/></div>}
                    </button>

                    {/* BOUDOIR SETTINGS PANEL */}
                    {settings.enableBoudoir && (
                         <div className="mt-3 p-3 bg-rose-50/50 rounded-lg border border-rose-100 space-y-3 animate-in fade-in slide-in-from-top-1">
                            <Dropdown 
                                label="ÇEKİM ORTAMI"
                                value={selectedBoudoirCategory || ''}
                                options={['Lütfen Seçiniz', ...Object.keys(BOUDOIR_POSE_CATEGORIES)]}
                                onChange={handleBoudoirCategoryChange}
                            />
                            {selectedBoudoirCategory && selectedBoudoirCategory !== 'Lütfen Seçiniz' && (
                              <Dropdown 
                                  label="ÖZEL POZ"
                                  value={settings.modelPose}
                                  options={['Lütfen Seçiniz', ...(BOUDOIR_POSE_CATEGORIES[selectedBoudoirCategory] || [])]}
                                  onChange={(val) => updateSetting('modelPose', val)}
                              />
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-rose-800/70 font-bold ml-0.5 flex items-center gap-1">
                                    <SunMedium size={10} />
                                    IŞIK VE ATMOSFER
                                </label>
                                <Dropdown 
                                    label=""
                                    value={settings.boudoirLighting || BOUDOIR_LIGHTING_OPTIONS[0]}
                                    options={BOUDOIR_LIGHTING_OPTIONS}
                                    onChange={(val) => updateSetting('boudoirLighting', val)}
                                />
                            </div>

                            {/* WET LOOK TILE */}
                            <button 
                                onClick={() => updateSetting('enableWetLook', !settings.enableWetLook)}
                                className={`w-full p-2.5 rounded-lg border flex items-center gap-3 transition-all text-left ${
                                    settings.enableWetLook 
                                    ? 'bg-blue-50 border-blue-300' 
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${settings.enableWetLook ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Droplets size={14} />
                                </div>
                                <div className="flex-1">
                                    <span className={`text-[11px] font-bold block ${settings.enableWetLook ? 'text-blue-800' : 'text-gray-700'}`}>
                                        Islak / Terli Efekt
                                    </span>
                                </div>
                                {settings.enableWetLook && <Check size={12} className="text-blue-500" />}
                            </button>

                            {/* CAMERA ANGLE */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold ml-0.5 flex items-center gap-1.5">
                                    <Camera size={12} />
                                    Kamera Açısı
                                </label>
                                <Dropdown
                                    label=""
                                    value={settings.boudoirCameraAngle || BOUDOIR_CAMERA_ANGLE_OPTIONS[0]}
                                    options={BOUDOIR_CAMERA_ANGLE_OPTIONS}
                                    onChange={(val) => updateSetting('boudoirCameraAngle', val)}
                                />
                            </div>
                         </div>
                    )}
                </div>
            )}
          </section>

          {/* CARD 2: MODEL SETTINGS */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">Sanal Manken Özellikleri</h2>
            </div>
            
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <Dropdown label="CİNSİYET" value={settings.gender} options={GENDER_OPTIONS} onChange={(val) => updateSetting('gender', val)} />
                    <Dropdown label="YAŞ GRUBU" value={settings.age} options={AGE_OPTIONS} onChange={(val) => updateSetting('age', val)} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <Dropdown label="ÜLKE / KÖKEN" value={settings.ethnicity} options={ETHNICITY_OPTIONS} onChange={(val) => updateSetting('ethnicity', val)} />
                    <Dropdown label="SAÇ RENGİ" value={settings.hairColor || 'Seçiniz'} options={HAIR_COLOR_OPTIONS} onChange={(val) => updateSetting('hairColor', val)} />
                </div>

                {/* TEN RENGİ SEÇİCİ */}
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold ml-0.5">
                        TEN RENGİ
                    </label>
                    <div className="grid grid-cols-8 gap-1.5">
                        {SKIN_TONE_OPTIONS.map((tone) => (
                            <button
                                key={tone.id}
                                onClick={() => updateSetting('skinTone', tone.id)}
                                title={`${tone.name} - ${tone.description}`}
                                className={`relative w-full aspect-square rounded-lg transition-all border-2 ${
                                    (settings.skinTone || 'auto') === tone.id
                                        ? 'border-primary ring-2 ring-primary/30 scale-110 z-10'
                                        : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                                }`}
                                style={{ backgroundColor: tone.hex }}
                            >
                                {(settings.skinTone || 'auto') === tone.id && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Check size={12} className={`${tone.id === 'fair' || tone.id === 'light' ? 'text-gray-700' : 'text-white'} drop-shadow`} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 text-center">
                        {SKIN_TONE_OPTIONS.find(t => t.id === (settings.skinTone || 'auto'))?.name} - {SKIN_TONE_OPTIONS.find(t => t.id === (settings.skinTone || 'auto'))?.description}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Dropdown label="VÜCUT TİPİ" value={settings.bodyType} options={BODY_TYPE_OPTIONS} onChange={(val) => updateSetting('bodyType', val)} />
                    <Dropdown label="BOY UZUNLUĞU" value={settings.height} options={HEIGHT_OPTIONS} onChange={(val) => updateSetting('height', val)} />
                </div>

                {/* SAÇ UZUNLUĞU - 3 button tiles */}
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold ml-0.5">
                        SAÇ UZUNLUĞU
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Kısa', 'Orta', 'Uzun'].map((length) => (
                            <button
                                key={length}
                                onClick={() => updateSetting('hairLength', length)}
                                className={`px-3 py-3 text-xs font-bold rounded-lg transition-all ${
                                    settings.hairLength === length
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {length}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KADIN MAKYAJ SEÇENEKLERİ - Sadece Kadın seçildiğinde görünür */}
                {settings.gender === 'Kadın' && (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Dropdown
                                label="RUJ RENGİ"
                                value={settings.lipstickColor || 'Seçiniz (Doğal)'}
                                options={LIPSTICK_COLOR_OPTIONS}
                                onChange={(val) => updateSetting('lipstickColor', val)}
                            />
                            <Dropdown
                                label="OJE RENGİ"
                                value={settings.nailPolishColor || 'Seçiniz (Doğal)'}
                                options={NAIL_POLISH_OPTIONS}
                                onChange={(val) => updateSetting('nailPolishColor', val)}
                            />
                        </div>
                    </>
                )}

                {/* FORMAT & BOYUT */}
                <div className="flex flex-col gap-2 pt-2">
                    <label className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold ml-0.5">
                        FORMAT & BOYUT
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Kare', ratio: '1:1', icon: '⬜' },
                            { label: 'Akış', ratio: '3:4', icon: '📱' },
                            { label: 'Hikaye', ratio: '9:16', icon: '📲' }
                        ].map((format) => (
                            <button
                                key={format.ratio}
                                onClick={() => updateSetting('aspectRatio', format.ratio)}
                                className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all ${
                                    settings.aspectRatio === format.ratio
                                        ? 'bg-gray-900 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <span className="text-2xl mb-1">{format.icon}</span>
                                <span className="text-xs font-bold">{format.label}</span>
                                <span className="text-[10px] opacity-70">({format.ratio})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* MEVSİM / ATMOSFER (OPSİYONEL) */}
                <div className="flex flex-col gap-3 pt-2">
                    <label className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold ml-0.5">
                        MEVSİM (OPSİYONEL)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Yaz', icon: '☀️' },
                            { label: 'Sonbahar', icon: '🍂' },
                            { label: 'Kış', icon: '❄️' }
                        ].map((season) => (
                            <button
                                key={season.label}
                                onClick={() => updateSetting('season', settings.season === season.label ? 'Tüm Mevsimler' : season.label)}
                                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg transition-all ${
                                    settings.season === season.label
                                        ? 'bg-gradient-to-br from-primary/10 to-primary/10 border-2 border-primary text-primary'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <span className="text-base">{season.icon}</span>
                                <span className="text-xs font-semibold">{season.label}</span>
                            </button>
                        ))}
                    </div>
                    
                    {/* HAVA DURUMU */}
                    <label className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold ml-0.5 mt-1">
                        HAVA DURUMU (OPSİYONEL)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Güneşli', icon: '☀️' },
                            { label: 'Bulutlu', icon: '☁️' },
                            { label: 'Yağmurlu', icon: '🌧️' },
                            { label: 'Karlı', icon: '❄️' }
                        ].map((weather) => (
                            <button
                                key={weather.label}
                                onClick={() => updateSetting('weather', settings.weather === weather.label ? 'Seçiniz (Otomatik)' : weather.label)}
                                className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg transition-all ${
                                    settings.weather === weather.label
                                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-400 text-blue-700'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <span className="text-base">{weather.icon}</span>
                                <span className="text-xs font-semibold">{weather.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </section>

          {/* TEMA / STİL & VARYASYON SİSTEMİ */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mt-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
                <Sparkles className="text-white" size={16} />
              </div>
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">Tema / Stil Seçimi</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Tema Seç</label>
                <select
                  value={settings.theme || ''}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="">Tema Seçiniz</option>
                  {AD_THEMES.map((theme) => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>

              {settings.theme && AD_THEME_VARIATIONS[settings.theme] && AD_THEME_VARIATIONS[settings.theme].length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Varyasyon / Sahne</label>
                  <select
                    value={settings.sceneVariation || 'auto'}
                    onChange={(e) => updateSetting('sceneVariation', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    <option value="auto">🎲 Otomatik (AI Seçer)</option>
                    {AD_THEME_VARIATIONS[settings.theme]?.map((variation) => (
                      <option key={variation.id} value={variation.id}>
                        {variation.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
      
      {/* STICKY FOOTER GENERATE BUTTON */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={onGenerate}
          disabled={!productImage || isGenerating}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 ${
            !productImage || isGenerating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-gradient-to-r from-primary to-indigo-600 text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>İşleniyor...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Model Oluştur</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;