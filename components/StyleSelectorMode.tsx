import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Download,
  X,
  AlertCircle,
  Loader2,
  Sparkles,
  Shirt,
  User,
  Trash2,
  ChevronDown
} from 'lucide-react';
import {
  MensFashionSettings,
  // Görsel Stil Seçici
  PromptLayers,
  PROMPT_LAYERS_DEFAULTS,
  PROMPT_CONCEPT_OPTIONS,
  PROMPT_MOOD_OPTIONS,
  PROMPT_BACKGROUND_OPTIONS,
  PROMPT_COMPOSITION_OPTIONS,
  PROMPT_LIGHTING_OPTIONS,
  PROMPT_COLOR_TONE_OPTIONS,
  PROMPT_CAMERA_OPTIONS,
  buildPromptFromLayers,
  // Detaylı Kıyafet Ayarları
  COLLAR_TYPE_OPTIONS,
  FABRIC_TYPE_OPTIONS,
  PLEAT_TYPE_OPTIONS,
  TROUSER_FIT_OPTIONS
} from '../types';
import { generateMensFashionImage } from '../services/geminiService';

interface StyleSelectorGenerationResult {
  imageData: string;
  aiModel: string;
  purpose: string;
}

interface StyleSelectorModeProps {
  onClose?: () => void;
  userCredits?: number;
  isUserAdmin?: boolean;
  onShowPricing?: () => void;
  onCreditsUsed?: (credits: number) => void;
}

const StyleSelectorMode: React.FC<StyleSelectorModeProps> = ({
  onClose,
  userCredits = 0,
  isUserAdmin = false,
  onShowPricing,
  onCreditsUsed
}) => {
  // Source image states
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);

  // Additional clothes
  const [additionalClothes, setAdditionalClothes] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  // Reference model states
  const [referenceModel, setReferenceModel] = useState<File | null>(null);
  const [referenceModelPreview, setReferenceModelPreview] = useState<string | null>(null);
  const [useReferenceModel, setUseReferenceModel] = useState<boolean>(false);

  // Results and processing states
  const [results, setResults] = useState<StyleSelectorGenerationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  // Görsel Stil Seçici state'leri
  const [promptLayers, setPromptLayers] = useState<PromptLayers>(PROMPT_LAYERS_DEFAULTS);
  const [userCustomPrompt, setUserCustomPrompt] = useState<string>('');

  // Detaylı Kıyafet Ayarları state'leri
  const [showDetailedClothingSettings, setShowDetailedClothingSettings] = useState<boolean>(false);
  const [collarType, setCollarType] = useState<string>('auto');
  const [fabricType, setFabricType] = useState<string>('auto');
  const [pleatType, setPleatType] = useState<string>('auto');
  const [trouserFit, setTrouserFit] = useState<string>('auto');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);
  const referenceModelInputRef = useRef<HTMLInputElement>(null);

  // Prompt layer güncelleme
  const updatePromptLayer = (key: keyof PromptLayers, value: string | null) => {
    setPromptLayers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Tüm seçimleri sıfırla
  const resetPromptLayers = () => {
    setPromptLayers(PROMPT_LAYERS_DEFAULTS);
  };

  // Kaç adım seçilmiş
  const getSelectedStepsCount = (): number => {
    return Object.values(promptLayers).filter(v => v !== null).length;
  };

  // Image upload handler
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

  // Additional clothes upload
  const handleAdditionalUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
  }, []);

  const removeAdditionalCloth = (index: number) => {
    setAdditionalClothes(prev => prev.filter((_, i) => i !== index));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Reference model upload
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

  // Generate with style selector
  const handleGenerate = async () => {
    if (!sourceImage) {
      setError('Lütfen bir ürün görseli yükleyin.');
      return;
    }

    if (getSelectedStepsCount() === 0) {
      setError('Lütfen en az bir stil seçeneği seçin.');
      return;
    }

    // Kredi kontrolü
    if (!isUserAdmin && userCredits < 1) {
      setError('Bu işlem için 1 kredi gerekiyor. Kredi satın alın.');
      onShowPricing?.();
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults([]);
    setProgress('Stil Seçici ile hazırlanıyor...');

    try {
      // Referans model - her zaman gönder (useReferenceModel true ise)
      const refModel = useReferenceModel && referenceModel ? referenceModel : null;

      // Görsel Stil Seçici prompt'unu oluştur
      const layersPrompt = buildPromptFromLayers(promptLayers);

      // Detaylı kıyafet ayarları prompt'a ekle
      let clothingDetails = '';
      if (collarType !== 'auto') {
        const collar = COLLAR_TYPE_OPTIONS.find(c => c.id === collarType);
        if (collar) clothingDetails += ` ${collar.name} collar style`;
      }
      if (fabricType !== 'auto') {
        const fabric = FABRIC_TYPE_OPTIONS.find(f => f.id === fabricType);
        if (fabric) clothingDetails += ` ${fabric.name} fabric material`;
      }
      if (pleatType !== 'auto') {
        const pleat = PLEAT_TYPE_OPTIONS.find(p => p.id === pleatType);
        if (pleat) clothingDetails += ` ${pleat.name} trousers`;
      }
      if (trouserFit !== 'auto') {
        const fit = TROUSER_FIT_OPTIONS.find(f => f.id === trouserFit);
        if (fit) clothingDetails += ` ${fit.name} fit`;
      }

      // Settings - detaylı kıyafet ayarlarıyla birlikte
      const styleSettings: MensFashionSettings = {
        purpose: 'ecommerce',
        skinTone: 'natural',
        poseStyle: 'neutral',
        background: 'white',
        backgroundStyle: 'studio-clean',
        numberOfImages: 1,
        aspectRatio: '3:4',
        cameraFrame: 'full-body',
        collarType: collarType,
        fabricType: fabricType,
        pleatType: pleatType,
        trouserFit: trouserFit,
        customPrompt: `[GÖRSEL STİL SEÇİCİ MODU] ${layersPrompt}${clothingDetails}${userCustomPrompt ? ` [KULLANICI TALİMATI] ${userCustomPrompt}` : ''}`
      };

      console.log('🎯 Stil Seçici ile Üretim:', {
        promptLayers,
        generatedPrompt: layersPrompt,
        clothingDetails,
        styleSettings,
        hasReferenceModel: !!refModel
      });

      const result = await generateMensFashionImage(sourceImage, styleSettings, (msg) => setProgress(msg), refModel, additionalClothes);
      setResults([result]);

      // Başarılı üretim sonrası kredi düş
      if (!isUserAdmin) onCreditsUsed?.(1);

      setProgress('');
    } catch (err: any) {
      setError(err.message || 'Görsel oluşturulurken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `style-selector-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full w-full flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-[380px] flex-shrink-0 bg-bg-surface border-r border-white/10 flex flex-col h-full">
        {/* Scrollable Content - Settings */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Compact Image Uploads - All in one card */}
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <h3 className="text-gray-300 text-[10px] font-medium mb-2">Görseller</h3>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <input type="file" ref={additionalInputRef} onChange={handleAdditionalUpload} accept="image/*" className="hidden" />
            <input type="file" ref={referenceModelInputRef} onChange={handleReferenceModelUpload} accept="image/*" className="hidden" />

            <div className="flex gap-2 flex-wrap">
              {/* Main Product */}
              {sourcePreview ? (
                <div className="relative group w-16 h-16 flex-shrink-0">
                  <img src={sourcePreview} alt="Ana" className="w-full h-full object-cover rounded-lg ring-2 ring-primary" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                  >
                    <Upload className="w-3 h-3 text-white" />
                  </button>
                  <span className="absolute -top-1 -left-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[8px] text-white font-bold">1</span>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary flex flex-col items-center justify-center text-primary/90 hover:text-primary transition-all"
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
                  <span className="absolute -top-1 -left-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold">{index + 2}</span>
                </div>
              ))}

              {/* Add More Button */}
              {sourcePreview && (
                <button
                  onClick={() => additionalInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
                >
                  <span className="text-lg">+</span>
                  <span className="text-[8px]">Ekle</span>
                </button>
              )}

              {/* Divider */}
              {sourcePreview && <div className="w-px h-16 bg-gray-200 mx-1" />}

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
                    <User className="w-2.5 h-2.5 text-white" />
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => referenceModelInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-green-500/30 hover:border-green-500/60 flex flex-col items-center justify-center text-green-600 hover:text-green-700 transition-all"
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
                  <span className={useReferenceModel ? 'text-green-600' : 'text-gray-500'}>
                    Referans model {useReferenceModel ? '✓ aktif' : '(pasif)'}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* GÖRSEL STİL SEÇİCİ - 7 ADIM */}
          <div className="bg-gradient-to-br from-primary/10 to-pink-500/10 rounded-xl p-3 border border-primary/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 text-xs font-medium flex items-center gap-2">
                <span className="text-lg">🎯</span>
                Stil Seçenekleri
              </h3>
              {getSelectedStepsCount() > 0 && (
                <button
                  onClick={resetPromptLayers}
                  className="text-[9px] text-red-600 hover:text-red-700 transition-colors"
                >
                  Sıfırla
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* 1. Fotoğraf Türü (Concept) */}
              <div>
                <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">1. Fotoğraf Türü</h4>
                <div className="grid grid-cols-3 gap-1">
                  {PROMPT_CONCEPT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updatePromptLayer('concept', promptLayers.concept === opt.id ? null : opt.id)}
                      className={`p-1.5 rounded-lg text-center transition-all ${
                        promptLayers.concept === opt.id
                          ? 'bg-mode-accent/30 border-mode-accent border'
                          : 'bg-white/5 border-border-default border hover:bg-white/10'
                      }`}
                    >
                      <span className="text-gray-900 text-[9px] font-medium block">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Genel Atmosfer (Mood) */}
              <div>
                <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">2. Genel Atmosfer</h4>
                <div className="grid grid-cols-2 gap-1">
                  {PROMPT_MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updatePromptLayer('mood', promptLayers.mood === opt.id ? null : opt.id)}
                      className={`p-1.5 rounded-lg text-center transition-all ${
                        promptLayers.mood === opt.id
                          ? 'bg-primary/30 border-primary border'
                          : 'bg-white/5 border-border-default border hover:bg-white/10'
                      }`}
                    >
                      <span className="text-gray-900 text-[9px] font-medium block">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Arka Plan Stili */}
              <div>
                <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">3. Arka Plan Stili</h4>
                <div className="grid grid-cols-2 gap-1">
                  {PROMPT_BACKGROUND_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updatePromptLayer('background', promptLayers.background === opt.id ? null : opt.id)}
                      className={`p-1.5 rounded-lg text-center transition-all ${
                        promptLayers.background === opt.id
                          ? 'bg-green-500/30 border-green-500 border'
                          : 'bg-white/5 border-border-default border hover:bg-white/10'
                      }`}
                    >
                      <span className="text-gray-900 text-[9px] font-medium block">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Kadraj (Composition) */}
              <div>
                <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">4. Kadraj</h4>
                <div className="grid grid-cols-3 gap-1">
                  {PROMPT_COMPOSITION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updatePromptLayer('composition', promptLayers.composition === opt.id ? null : opt.id)}
                      className={`p-1.5 rounded-lg text-center transition-all ${
                        promptLayers.composition === opt.id
                          ? 'bg-yellow-500/30 border-yellow-500 border'
                          : 'bg-white/5 border-border-default border hover:bg-white/10'
                      }`}
                    >
                      <span className="text-gray-900 text-[8px] font-medium block">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Işıklandırma (Lighting) */}
              <div>
                <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">5. Işıklandırma</h4>
                <div className="grid grid-cols-2 gap-1">
                  {PROMPT_LIGHTING_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updatePromptLayer('lighting', promptLayers.lighting === opt.id ? null : opt.id)}
                      className={`p-1.5 rounded-lg text-center transition-all ${
                        promptLayers.lighting === opt.id
                          ? 'bg-orange-500/30 border-orange-500 border'
                          : 'bg-white/5 border-border-default border hover:bg-white/10'
                      }`}
                    >
                      <span className="text-gray-900 text-[9px] font-medium block">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Renk Tonu & Kontrast */}
              <div>
                <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">6. Renk Tonu</h4>
                <div className="grid grid-cols-3 gap-1">
                  {PROMPT_COLOR_TONE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updatePromptLayer('colorTone', promptLayers.colorTone === opt.id ? null : opt.id)}
                      className={`p-1.5 rounded-lg text-center transition-all ${
                        promptLayers.colorTone === opt.id
                          ? 'bg-mode-accent/30 border-mode-accent border'
                          : 'bg-white/5 border-border-default border hover:bg-white/10'
                      }`}
                    >
                      <span className="text-gray-900 text-[8px] font-medium block">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Kamera Gerçekçiliği */}
              <div>
                <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">7. Fotoğraf Hissi</h4>
                <div className="grid grid-cols-3 gap-1">
                  {PROMPT_CAMERA_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updatePromptLayer('camera', promptLayers.camera === opt.id ? null : opt.id)}
                      className={`p-1.5 rounded-lg text-center transition-all ${
                        promptLayers.camera === opt.id
                          ? 'bg-cyan-500/30 border-cyan-500 border'
                          : 'bg-white/5 border-border-default border hover:bg-white/10'
                      }`}
                    >
                      <span className="text-gray-900 text-[8px] font-medium block">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Detaylı Kıyafet Ayarları - Collapsible Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowDetailedClothingSettings(!showDetailedClothingSettings)}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-900 text-xs font-medium">Detaylı Kıyafet Ayarları</span>
                <span className="text-[9px] text-gray-500">(Yaka, Kumaş, Kesim)</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showDetailedClothingSettings ? 'rotate-180' : ''}`} />
            </button>

            {showDetailedClothingSettings && (
              <div className="p-3 pt-3 space-y-3 border-t border-gray-200">
                {/* Yaka Tipi */}
                <div>
                  <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">Yaka Tipi (Triko/Kazak)</h4>
                  <div className="relative">
                    <select
                      value={collarType}
                      onChange={(e) => setCollarType(e.target.value)}
                      className="w-full py-1.5 px-2.5 pr-7 rounded-lg bg-white border border-gray-200 text-gray-900 text-[10px] appearance-none cursor-pointer hover:bg-gray-100 focus:outline-none focus:border-primary"
                    >
                      {COLLAR_TYPE_OPTIONS.map((collar) => (
                        <option key={collar.id} value={collar.id} className="bg-white text-gray-900">
                          {collar.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                  </div>
                </div>

                {/* Ceket Kumaş Tipi */}
                <div>
                  <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">Ceket Kumaş Tipi</h4>
                  <div className="relative">
                    <select
                      value={fabricType}
                      onChange={(e) => setFabricType(e.target.value)}
                      className="w-full py-1.5 px-2.5 pr-7 rounded-lg bg-white border border-gray-200 text-gray-900 text-[10px] appearance-none cursor-pointer hover:bg-gray-100 focus:outline-none focus:border-primary"
                    >
                      {FABRIC_TYPE_OPTIONS.map((fabric) => (
                        <option key={fabric.id} value={fabric.id} className="bg-white text-gray-900">
                          {fabric.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                  </div>
                </div>

                {/* Pantolon Pile Tipi */}
                <div>
                  <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">Pantolon Pile Tipi</h4>
                  <div className="relative">
                    <select
                      value={pleatType}
                      onChange={(e) => setPleatType(e.target.value)}
                      className="w-full py-1.5 px-2.5 pr-7 rounded-lg bg-white border border-gray-200 text-gray-900 text-[10px] appearance-none cursor-pointer hover:bg-gray-100 focus:outline-none focus:border-primary"
                    >
                      {PLEAT_TYPE_OPTIONS.map((pleat) => (
                        <option key={pleat.id} value={pleat.id} className="bg-white text-gray-900">
                          {pleat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                  </div>
                </div>

                {/* Pantolon Kesim */}
                <div>
                  <h4 className="text-gray-900 text-[10px] font-medium mb-1.5">Pantolon Kesim</h4>
                  <div className="relative">
                    <select
                      value={trouserFit}
                      onChange={(e) => setTrouserFit(e.target.value)}
                      className="w-full py-1.5 px-2.5 pr-7 rounded-lg bg-white border border-gray-200 text-gray-900 text-[10px] appearance-none cursor-pointer hover:bg-gray-100 focus:outline-none focus:border-primary"
                    >
                      {TROUSER_FIT_OPTIONS.map((fit) => (
                        <option key={fit.id} value={fit.id} className="bg-white text-gray-900">
                          {fit.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="bg-white/5 rounded-lg p-2 border border-white/10 mt-2">
          <h3 className="text-gray-300 text-[10px] font-medium mb-2">Özel Prompt</h3>
          <textarea
            value={userCustomPrompt}
            onChange={(e) => setUserCustomPrompt(e.target.value)}
            placeholder="Çıktıya eklemek istediğiniz özel detayları yazın..."
            className="w-full bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 resize-none h-14 focus:border-primary focus:outline-none placeholder-gray-500"
          />
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white space-y-3">
          {/* Progress */}
          {isProcessing && progress && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-2">
              <div className="flex items-center gap-2 text-primary text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{progress}</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!sourceImage || isProcessing || getSelectedStepsCount() === 0}
            className={`w-full py-3 rounded-xl font-medium text-white text-sm flex items-center justify-center gap-2 ${
              !sourceImage || isProcessing || getSelectedStepsCount() === 0
                ? 'bg-gray-400 cursor-not-allowed'
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
                <span>Görsel Oluştur ({getSelectedStepsCount()}/7)</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
        {/* Results panel */}
        {results.length > 0 ? (
          <div className="space-y-4">
            {/* Ana Görsel */}
            <div className="relative aspect-[3/4] max-w-lg mx-auto bg-gray-900 rounded-xl overflow-hidden">
              <img
                src={results[selectedResult]?.imageData}
                alt="Generated"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => handleDownload(results[selectedResult]?.imageData, selectedResult)}
                className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 rounded text-white text-xs">
                {results[selectedResult]?.aiModel}
              </div>
            </div>

            {/* Küçük Önizlemeler */}
            {results.length > 1 && (
              <div className="flex gap-2 justify-center">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedResult(index)}
                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedResult === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={result.imageData} alt={`Result ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-gray-900 text-lg font-medium mb-2">Görsel Stil Seçici</h3>
              <p className="text-gray-600 text-sm max-w-md">
                7 adımda fotoğrafınızın stilini belirleyin. Her adımdan bir seçenek seçin ve
                profesyonel kalitede görseller oluşturun.
              </p>
              <div className="mt-4 grid grid-cols-7 gap-1 max-w-xs mx-auto">
                <div className={`h-1 rounded ${promptLayers.concept ? 'bg-blue-500' : 'bg-mode-accent/30'}`} title="Fotoğraf Türü"></div>
                <div className={`h-1 rounded ${promptLayers.mood ? 'bg-primary' : 'bg-primary/30'}`} title="Atmosfer"></div>
                <div className={`h-1 rounded ${promptLayers.background ? 'bg-green-500' : 'bg-green-500/30'}`} title="Arka Plan"></div>
                <div className={`h-1 rounded ${promptLayers.composition ? 'bg-yellow-500' : 'bg-yellow-500/30'}`} title="Kadraj"></div>
                <div className={`h-1 rounded ${promptLayers.lighting ? 'bg-orange-500' : 'bg-orange-500/30'}`} title="Işık"></div>
                <div className={`h-1 rounded ${promptLayers.colorTone ? 'bg-pink-500' : 'bg-mode-accent/30'}`} title="Renk"></div>
                <div className={`h-1 rounded ${promptLayers.camera ? 'bg-cyan-500' : 'bg-cyan-500/30'}`} title="Kamera"></div>
              </div>
              <p className="text-gray-500 text-[10px] mt-2">
                Seçtiğiniz adımlar yukarıda renkli olarak görünür
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StyleSelectorMode;
