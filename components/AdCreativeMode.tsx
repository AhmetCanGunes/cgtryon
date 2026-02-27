

import React, { useState, useRef, useCallback } from 'react';
import { useBlobUrl } from '../hooks/useBlobUrl';
import { Upload, Sparkles, Loader2, Megaphone, LayoutTemplate, RefreshCw, Download, ChevronLeft, ChevronRight, Check, CheckCircle2, Link as LinkIcon, Images, Wand2, Tag, Type, Calendar, CloudSun } from 'lucide-react';
import {
    AdSettings,
    AD_PLATFORMS,
    AD_THEMES,
    MODEL_QUALITY_OPTIONS,
    MODEL_POSE_OPTIONS,
    IMAGE_COUNT_OPTIONS,
    AD_FONT_OPTIONS,
    AdCreativeResult,
    AD_THEME_VARIATIONS,
    SEASON_OPTIONS,
    WEATHER_OPTIONS,
    MENS_FASHION_BACKGROUND_STYLES,
    MENS_FASHION_BACKGROUNDS
} from '../types';
import { generateSimilarAdCreative } from '../services/geminiService';
import Dropdown from './Dropdown';

interface AdCreativeModeProps {
  onGenerate: (image: File, settings: AdSettings) => Promise<AdCreativeResult[]>;
  isGenerating: boolean;
}

const AdCreativeMode: React.FC<AdCreativeModeProps> = ({ onGenerate, isGenerating }) => {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Settings
  const [settings, setSettings] = useState<AdSettings>({
    platform: AD_PLATFORMS[0],
    theme: AD_THEMES[0],
    targetAudience: '', // Deprecated/Hidden
    customText: '', // Deprecated/Hidden
    productUrl: '', // New: Link
    modelQuality: MODEL_QUALITY_OPTIONS[0],
    pose: MODEL_POSE_OPTIONS[0], // Default pose
    numberOfImages: 1, // Default to 1
    fontStyle: AD_FONT_OPTIONS[0], // Default Font
    specificVariationId: 'auto', // Default Auto
    priceTag: '', // Default empty
    productName: '', // Default empty
    season: SEASON_OPTIONS[0], // Default Auto
    weather: WEATHER_OPTIONS[0], // Default Auto
    studioStyle: 'solid', // Default studio style
    studioColor: 'white' // Default studio color (MENS_FASHION_BACKGROUNDS id)
  });

  // Derived state for variations dropdown based on selected theme
  const [variationOptions, setVariationOptions] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
     // Populate variations based on theme
     const variations = AD_THEME_VARIATIONS[settings.theme] || [];
     const opts = [
         { label: 'Otomatik (Rastgele Çeşitlilik)', value: 'auto' },
         ...variations.map(v => ({ label: v.label, value: v.id }))
     ];
     setVariationOptions(opts);
     
     // Reset variation ID if theme changes, unless 'auto'
     setSettings(prev => ({ ...prev, specificVariationId: 'auto' }));
  }, [settings.theme]);

  // Result State (Array of objects now)
  const [resultImages, setResultImages] = useState<AdCreativeResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Similar Generation State
  const [showSimilarCount, setShowSimilarCount] = useState(false);
  const [isGeneratingSimilar, setIsGeneratingSimilar] = useState(false);

  // Blob URL management — guaranteed cleanup via useBlobUrl hook
  const productPreview = useBlobUrl(productImage);

  const inputRef = useRef<HTMLInputElement>(null);

  // Drag & Drop Handlers
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
       const file = e.dataTransfer.files[0];
       if (file.type.startsWith('image/')) setProductImage(file);
    }
  }, []);

  const handleGenerateClick = async () => {
    if (!productImage) return;

    try {
        setResultImages([]); // Reset results
        const results = await onGenerate(productImage, settings);
        setResultImages(results);
        setSelectedIndex(0);
    } catch (error) {
        console.error(error);
        alert("Reklam oluşturulurken hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleGenerateSimilar = async (count: number) => {
      if (!productImage || !resultImages[selectedIndex]) return;
      
      const referenceAd = resultImages[selectedIndex];
      setShowSimilarCount(false);
      setIsGeneratingSimilar(true);

      try {
          // This service call will now respect the aspect ratio of the referenceAd
          const newResults = await generateSimilarAdCreative(productImage, referenceAd.metadata, count);
          
          // Append new results to the existing list
          setResultImages(prev => {
              const updated = [...prev, ...newResults];
              return updated;
          });
          
          // Jump to the first of the newly generated images
          setSelectedIndex(prev => prev + 1); 
      } catch (error) {
          console.error(error);
          alert("Benzer görseller oluşturulamadı.");
      } finally {
          setIsGeneratingSimilar(false);
      }
  };

  const handleDownload = () => {
      if (resultImages.length > 0 && resultImages[selectedIndex]) {
        const link = document.createElement('a');
        link.href = resultImages[selectedIndex].imageUrl;
        link.download = `KAapp_Ad_Creative_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
  };

  return (
    <div className="flex h-full w-full">

      {/* LEFT SIDEBAR */}
      <div className="w-[380px] flex-shrink-0 border-r border-white/10 bg-bg-surface flex flex-col h-full z-20">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">

            {/* Header */}
            <div className="flex items-center gap-2 pb-1.5 border-b border-white/10">
                <Megaphone className="text-primary" size={14} />
                <h2 className="text-[11px] font-bold text-gray-200 tracking-wide">REKLAM KREATİFİ</h2>
            </div>

            {/* Upload Area */}
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Ürün Görseli</span>
                <div
                    className={`relative h-20 rounded-lg border border-dashed transition-all cursor-pointer overflow-hidden group
                    ${isDragging ? 'border-primary bg-primary/10' : productImage ? 'border-white/20 bg-white/5' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    {productImage ? (
                        <>
                            <img src={productPreview!} className="w-full h-full object-contain p-1" alt="Product" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="p-1.5 bg-white/20 rounded text-white"><RefreshCw size={12}/></button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Upload size={16} className="mb-1"/>
                            <span className="text-[9px]">Görsel Yükle</span>
                        </div>
                    )}
                    <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setProductImage(e.target.files[0])}/>
                </div>
            </div>

            {/* Product Info Inputs - Grid Layout */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Ürün Adı</label>
                    <input
                        type="text"
                        value={settings.productName}
                        onChange={(e) => setSettings({...settings, productName: e.target.value})}
                        placeholder="İpek Gömlek"
                        className="w-full bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary placeholder-gray-500"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Fiyat (₺)</label>
                    <input
                        type="text"
                        value={settings.priceTag}
                        onChange={(e) => setSettings({...settings, priceTag: e.target.value})}
                        placeholder="899"
                        className="w-full bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Product Link */}
            <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Link (Opsiyonel)</label>
                <input
                    type="url"
                    value={settings.productUrl}
                    onChange={(e) => setSettings({...settings, productUrl: e.target.value})}
                    placeholder="https://magaza.com/urun..."
                    className="w-full bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary placeholder-gray-500"
                />
            </div>

            {/* Settings */}
            <div className="space-y-2">
                {/* Platform & Theme */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Platform</label>
                        <select
                            value={settings.platform}
                            onChange={(e) => setSettings({...settings, platform: e.target.value})}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {AD_PLATFORMS.map((p) => <option key={p} value={p} className="bg-bg-elevated">{p}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Tema</label>
                        <select
                            value={settings.theme}
                            onChange={(e) => setSettings({...settings, theme: e.target.value})}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {AD_THEMES.map((t) => <option key={t} value={t} className="bg-bg-elevated">{t}</option>)}
                        </select>
                    </div>
                </div>

                {/* Variation / Studio Picker */}
                {settings.theme === 'Stüdyo (Studio)' ? (
                    <div className="flex flex-col gap-2">
                        {/* Arka Plan Stili */}
                        <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                            <h3 className="text-gray-200 text-[10px] font-medium mb-1">Arka Plan Stili</h3>
                            <p className="text-[9px] text-gray-500 mb-2">Duvar tipi seçin – bazı stiller renk seçimi destekler</p>
                            <div className="grid grid-cols-6 gap-1">
                                {MENS_FASHION_BACKGROUND_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setSettings({...settings, studioStyle: style.id})}
                                        title={`${style.name} - ${style.description}`}
                                        className={`p-1.5 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                                            settings.studioStyle === style.id
                                                ? 'bg-primary/20 text-white ring-2 ring-primary/50'
                                                : 'bg-white/5 hover:bg-white/10 text-gray-400'
                                        }`}
                                    >
                                        <span className="text-base">{style.icon}</span>
                                        <span className="text-[8px] font-medium truncate w-full text-center">{style.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-1.5 p-1.5 bg-white/5 rounded-lg">
                                <p className="text-[10px] text-gray-400">
                                    <span className="font-medium text-gray-300">{MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === settings.studioStyle)?.name}:</span>{' '}
                                    {MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === settings.studioStyle)?.description}
                                    {MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === settings.studioStyle)?.supportsColor && (
                                        <span className="text-primary ml-1">• Renk seçebilirsiniz ↓</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Arka Plan Rengi - sadece renk destekleyen stiller için */}
                        {MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === settings.studioStyle)?.supportsColor && (
                            <div className="bg-white/5 rounded-xl p-2 border-2 border-primary/30">
                                <div className="flex items-center justify-between mb-1.5">
                                    <h3 className="text-gray-200 text-[10px] font-medium">Arka Plan Rengi</h3>
                                    <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                        Seçili: {MENS_FASHION_BACKGROUNDS.find(bg => bg.id === settings.studioColor)?.name || 'Beyaz'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-10 gap-1.5">
                                    {MENS_FASHION_BACKGROUNDS.map((bg) => (
                                        <button
                                            key={bg.id}
                                            onClick={() => setSettings({...settings, studioColor: bg.id})}
                                            title={`${bg.name} (${bg.hex}) - ${bg.description}`}
                                            className={`w-full aspect-square rounded-lg border-2 transition-all ${
                                                settings.studioColor === bg.id
                                                    ? 'border-primary scale-110 ring-2 ring-primary/40 z-10'
                                                    : 'border-white/10 hover:border-white/30 hover:scale-105'
                                            }`}
                                            style={{ backgroundColor: bg.hex }}
                                        >
                                            {settings.studioColor === bg.id && (
                                                <Check
                                                    className="w-3 h-3 mx-auto drop-shadow-md"
                                                    style={{ color: ['white', 'light-gray', 'cream', 'beige', 'ozel-bej-3', 'ozel-bej-4'].includes(bg.id) ? '#333' : '#fff' }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[9px] text-gray-500 mt-1.5 text-center">
                                    Her üretimde bu renk sabit kalır: <span className="text-gray-300 font-mono">{MENS_FASHION_BACKGROUNDS.find(bg => bg.id === settings.studioColor)?.hex || '#FFFFFF'}</span>
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Varyasyon</label>
                        <select
                            value={settings.specificVariationId}
                            onChange={(e) => setSettings({...settings, specificVariationId: e.target.value})}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {variationOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-bg-elevated">{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Season & Weather */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Mevsim</label>
                        <select
                            value={settings.season || SEASON_OPTIONS[0]}
                            onChange={(e) => setSettings({...settings, season: e.target.value})}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {SEASON_OPTIONS.map((s) => <option key={s} value={s} className="bg-bg-elevated">{s}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Hava</label>
                        <select
                            value={settings.weather || WEATHER_OPTIONS[0]}
                            onChange={(e) => setSettings({...settings, weather: e.target.value})}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {WEATHER_OPTIONS.map((w) => <option key={w} value={w} className="bg-bg-elevated">{w}</option>)}
                        </select>
                    </div>
                </div>

                {/* Pose & Font */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Poz</label>
                        <select
                            value={settings.pose}
                            onChange={(e) => setSettings({...settings, pose: e.target.value})}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {MODEL_POSE_OPTIONS.map((p) => <option key={p} value={p} className="bg-bg-elevated">{p}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Font</label>
                        <select
                            value={settings.fontStyle}
                            onChange={(e) => setSettings({...settings, fontStyle: e.target.value})}
                            className="w-full appearance-none bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                        >
                            {AD_FONT_OPTIONS.map((f) => <option key={f} value={f} className="bg-bg-elevated">{f}</option>)}
                        </select>
                    </div>
                </div>

            </div>

            {/* Custom Prompt */}
            <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Özel Prompt</label>
                <textarea
                    value={settings.customPrompt || ''}
                    onChange={(e) => setSettings({...settings, customPrompt: e.target.value})}
                    placeholder="Çıktıya eklemek istediğiniz özel detayları yazın..."
                    className="w-full bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 resize-none h-14 focus:border-primary focus:outline-none placeholder-gray-500"
                />
            </div>

            {/* AI Info */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-2">
                 <div className="flex items-center gap-1.5 mb-0.5">
                     <CheckCircle2 size={10} className="text-primary" />
                     <span className="text-[9px] font-bold text-primary">Neuromarketing AI</span>
                 </div>
                 <p className="text-[8px] text-primary/80 leading-relaxed">
                     AI görselinizi analiz ederek satın alma dürtüsünü tetikleyen içerik tasarlar.
                 </p>
            </div>
        </div>

        {/* Action Footer */}
        <div className="p-3 border-t border-white/10 bg-bg-surface z-30">
            <button
                onClick={handleGenerateClick}
                disabled={!productImage || isGenerating || isGeneratingSimilar}
                className={`w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    !productImage || isGenerating || isGeneratingSimilar
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                    : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-md shadow-primary/20'
                }`}
            >
                {isGenerating ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14} />}
                <span>REKLAM OLUŞTUR</span>
            </button>
        </div>
      </div>

      {/* RIGHT PREVIEW AREA */}
      <div className="flex-1 bg-bg-base relative flex flex-col items-center justify-center p-6 overflow-hidden">

        {isGeneratingSimilar && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-40">
            <div className="bg-bg-elevated p-4 rounded-xl border border-white/10 flex flex-col items-center max-w-xs text-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin mb-3" />
                <h3 className="text-gray-200 font-semibold text-sm mb-1">Üretiliyor</h3>
                <p className="text-xs text-gray-500">Varyasyonlar hazırlanıyor...</p>
            </div>
          </div>
        )}

        {resultImages.length > 0 && resultImages[selectedIndex] ? (
            <div className="flex flex-col items-center w-full h-full max-h-full">
                {/* Main Large Image */}
                <div className="relative flex-1 w-full flex items-center justify-center min-h-0 mb-4 group">
                     <img
                        src={resultImages[selectedIndex].imageUrl}
                        alt={`Ad Variant ${selectedIndex + 1}`}
                        className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
                    />

                    {/* Floating Actions on Image */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                         <div className="relative">
                             <button
                                onClick={() => setShowSimilarCount(!showSimilarCount)}
                                className="p-2 bg-black/70 text-primary rounded-lg hover:bg-black/90 border border-white/10 font-bold flex items-center gap-1.5"
                                title="Buna Benzer Üret"
                             >
                                <Wand2 size={14} />
                                <span className="text-[10px]">Benzer</span>
                             </button>

                             {showSimilarCount && (
                                 <div className="absolute top-full right-0 mt-1 bg-bg-elevated rounded-lg border border-white/10 p-1.5 flex gap-1 z-50 min-w-[100px]">
                                     {[1, 3, 5].map(count => (
                                         <button
                                            key={count}
                                            onClick={() => handleGenerateSimilar(count)}
                                            className="flex-1 py-1 px-1.5 text-[9px] font-semibold bg-white/5 hover:bg-primary/20 text-gray-300 hover:text-primary rounded transition-colors"
                                         >
                                             {count}
                                         </button>
                                     ))}
                                 </div>
                             )}
                         </div>

                         <button onClick={handleDownload} className="p-2 bg-primary text-white rounded-lg hover:opacity-90" title="İndir">
                            <Download size={16} />
                         </button>
                    </div>
                </div>

                {/* Thumbnail Navigation */}
                <div className="h-16 w-full max-w-xl bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-2 flex items-center justify-center gap-3">
                    <button
                        onClick={() => setSelectedIndex(prev => Math.max(0, prev - 1))}
                        disabled={selectedIndex === 0}
                        className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-gray-400"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex gap-1.5 overflow-x-auto px-1 scrollbar-hide h-full items-center">
                        {resultImages.map((res, idx) => (
                            <button
                                key={res.id}
                                onClick={() => setSelectedIndex(idx)}
                                className={`relative h-10 w-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                    idx === selectedIndex ? 'border-primary scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                                }`}
                            >
                                <img src={res.imageUrl} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setSelectedIndex(prev => Math.min(resultImages.length - 1, prev + 1))}
                        disabled={selectedIndex === resultImages.length - 1}
                        className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-gray-400"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 select-none pointer-events-none">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <LayoutTemplate className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-base font-medium text-gray-400 mb-1">Reklam Alanı Boş</h3>
                <p className="text-xs text-gray-500 max-w-xs text-center">
                    Görsel yükleyin ve "Reklam Oluştur" butonuna basın.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdCreativeMode;