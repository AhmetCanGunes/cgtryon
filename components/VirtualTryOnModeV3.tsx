import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Sparkles, Loader2, ArrowRight, Download, Image as ImageIcon, Info, RefreshCw, Maximize2, ShoppingBag, Footprints } from 'lucide-react';
import FullScreenImageViewer from './FullScreenImageViewer';
import Dropdown from './Dropdown';
import { ImageFilterSettings, MODEL_QUALITY_OPTIONS, TRYON_POSES, TRYON_BACKGROUNDS, VIEW_ANGLE_OPTIONS, TryOnV3Settings, SEASON_OPTIONS, WEATHER_OPTIONS, AD_THEMES, AD_THEME_VARIATIONS, IMAGE_COUNT_OPTIONS } from '../types';

interface VirtualTryOnModeV3Props {
  onGenerate: (originalPhoto: File, productPhoto: File, shoePhoto: File | null, settings: TryOnV3Settings) => Promise<string>;
  isGenerating: boolean;
}

const VirtualTryOnModeV3: React.FC<VirtualTryOnModeV3Props> = ({ onGenerate, isGenerating }) => {
  const [originalPhoto, setOriginalPhoto] = useState<File | null>(null);
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [shoePhoto, setShoePhoto] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Settings
  const [settings, setSettings] = useState<TryOnV3Settings>({
      modelQuality: MODEL_QUALITY_OPTIONS[0],
      background: 'original',
      pose: 'original',
      viewAngle: 'original',
      aspectRatio: '1:1',
      numberOfImages: 1,
      season: SEASON_OPTIONS[0],
      weather: WEATHER_OPTIONS[0],
      theme: AD_THEMES[0],
      sceneVariation: 'auto'
  });

  const [isOriginalDragging, setIsOriginalDragging] = useState(false);
  const [isProductDragging, setIsProductDragging] = useState(false);
  const [isShoeDragging, setIsShoeDragging] = useState(false);

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

  // States for Full Screen Viewer
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [filterSettings, setFilterSettings] = useState<ImageFilterSettings>({
      brightness: 100,
      contrast: 100,
      saturation: 100,
  });

  const originalInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const shoeInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault(); e.stopPropagation(); setter(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault(); e.stopPropagation(); setter(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, setter: (f: File) => void, dragSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault(); e.stopPropagation(); dragSetter(false);
    if (e.dataTransfer.files?.[0] && e.dataTransfer.files[0].type.startsWith('image/')) {
      setter(e.dataTransfer.files[0]);
    }
  }, []);

  const handleGenerateClick = async () => {
    if (!originalPhoto || !productPhoto) return;

    try {
        const result = await onGenerate(originalPhoto, productPhoto, shoePhoto, settings);
        setResultImage(result);
    } catch (error) {
        alert("V3 işlemi başarısız oldu.");
    }
  };

  const handleDownload = () => {
    if (resultImage) {
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `KAapp_TryOnV3_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-full w-full bg-white relative">
        
        {/* LEFT PANEL */}
        <div className="w-[500px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col p-6 z-20">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <div className="bg-gradient-to-br from-primary to-accent w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md">
                    <ShoppingBag size={16} />
                </div>
                <h2 className="text-sm font-bold text-gray-900 tracking-wide">AI STİL DANIŞMANI (V3)</h2>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 flex gap-3">
                <Info className="text-primary flex-shrink-0" size={16} />
                <p className="text-[10px] text-primary leading-relaxed">
                    Mankeni, kıyafeti ve ayakkabıyı birleştirin. İsterseniz arka planı ve duruşu değiştirin veya orijinalini koruyun.
                </p>
            </div>

            {/* INPUTS CONTAINER */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* 1. MODEL */}
                <div className="flex flex-col mb-4">
                     <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">1. MANKEN (Kişi)</label>
                     <div 
                        className={`relative aspect-[3/4] w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group 
                        ${isOriginalDragging ? 'border-primary bg-primary/10' : originalPhoto ? 'border-gray-200' : 'border-gray-300 hover:border-secondary'}`}
                        onDragOver={(e) => handleDragOver(e, setIsOriginalDragging)}
                        onDragLeave={(e) => handleDragLeave(e, setIsOriginalDragging)}
                        onDrop={(e) => handleDrop(e, setOriginalPhoto, setIsOriginalDragging)}
                        onClick={() => originalInputRef.current?.click()}
                    >
                         {originalPhoto ? (
                            <>
                                <img src={URL.createObjectURL(originalPhoto)} className="w-full h-full object-cover" />
                                <button onClick={(e) => {e.stopPropagation(); setOriginalPhoto(null)}} className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-red-500 text-white rounded-md backdrop-blur-md transition-colors"><X size={14}/></button>
                            </>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                                 <Upload size={24} className="mb-2" />
                                 <span className="text-xs font-medium">Mankeni Yükle</span>
                             </div>
                         )}
                         <input type="file" ref={originalInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setOriginalPhoto(e.target.files[0])} />
                    </div>
                </div>

                {/* 2. PRODUCT & SHOES ROW */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* PRODUCT */}
                    <div className="flex flex-col">
                         <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">2. KIYAFET</label>
                         <div 
                            className={`relative aspect-[4/5] w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group 
                            ${isProductDragging ? 'border-accent bg-fuchsia-50' : productPhoto ? 'border-gray-200' : 'border-gray-300 hover:border-accent'}`}
                            onDragOver={(e) => handleDragOver(e, setIsProductDragging)}
                            onDragLeave={(e) => handleDragLeave(e, setIsProductDragging)}
                            onDrop={(e) => handleDrop(e, setProductPhoto, setIsProductDragging)}
                            onClick={() => productInputRef.current?.click()}
                        >
                             {productPhoto ? (
                                <>
                                    <img src={URL.createObjectURL(productPhoto)} className="w-full h-full object-cover" />
                                    <button onClick={(e) => {e.stopPropagation(); setProductPhoto(null)}} className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-red-500 text-white rounded-md backdrop-blur-md transition-colors"><X size={14}/></button>
                                </>
                             ) : (
                                 <div className="flex flex-col items-center justify-center h-full text-gray-400 p-2 text-center">
                                     <Upload size={20} className="mb-1" />
                                     <span className="text-[10px] font-medium">Ürün</span>
                                 </div>
                             )}
                             <input type="file" ref={productInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setProductPhoto(e.target.files[0])} />
                        </div>
                    </div>

                    {/* SHOES (OPTIONAL) */}
                    <div className="flex flex-col">
                         <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                             <Footprints size={12} />
                             3. AYAKKABI
                         </label>
                         <div 
                            className={`relative aspect-[4/5] w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group 
                            ${isShoeDragging ? 'border-indigo-500 bg-indigo-50' : shoePhoto ? 'border-gray-200' : 'border-gray-300 hover:border-indigo-400'}`}
                            onDragOver={(e) => handleDragOver(e, setIsShoeDragging)}
                            onDragLeave={(e) => handleDragLeave(e, setIsShoeDragging)}
                            onDrop={(e) => handleDrop(e, setShoePhoto, setIsShoeDragging)}
                            onClick={() => shoeInputRef.current?.click()}
                        >
                             {shoePhoto ? (
                                <>
                                    <img src={URL.createObjectURL(shoePhoto)} className="w-full h-full object-cover" />
                                    <button onClick={(e) => {e.stopPropagation(); setShoePhoto(null)}} className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-red-500 text-white rounded-md backdrop-blur-md transition-colors"><X size={14}/></button>
                                </>
                             ) : (
                                 <div className="flex flex-col items-center justify-center h-full text-gray-400 p-2 text-center">
                                     <Upload size={20} className="mb-1" />
                                     <span className="text-[10px] font-medium">Ayakkabı (Ops.)</span>
                                 </div>
                             )}
                             <input type="file" ref={shoeInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setShoePhoto(e.target.files[0])} />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 w-full mb-4" />

                {/* CONTROLS */}
                <div className="space-y-4">
                     {/* POSE & ANGLE */}
                     {/* THEME & VARIATION */}
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold ml-0.5">TEMA / STİL</label>
                        <select
                            value={settings.theme || AD_THEMES[0]}
                            onChange={(e) => setSettings({...settings, theme: e.target.value})}
                            className="w-full bg-white border border-gray-200 text-xs text-gray-900 rounded-lg p-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            {AD_THEMES.map((theme) => (
                                <option key={theme} value={theme}>{theme}</option>
                            ))}
                        </select>
                     </div>

                     <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold ml-0.5">VARYASYON / SAHNE</label>
                        <select
                            value={settings.sceneVariation || 'auto'}
                            onChange={(e) => setSettings({...settings, sceneVariation: e.target.value})}
                            className="w-full bg-white border border-gray-200 text-xs text-gray-900 rounded-lg p-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            {sceneVariationOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                     </div>

                     {/* SEASON & WEATHER */}
                     <div className="grid grid-cols-2 gap-3">
                         <Dropdown
                            label="MEVSİM"
                            value={settings.season || SEASON_OPTIONS[0]}
                            options={SEASON_OPTIONS}
                            onChange={(v) => setSettings({...settings, season: v})}
                         />
                         <Dropdown
                            label="HAVA DURUMU"
                            value={settings.weather || WEATHER_OPTIONS[0]}
                            options={WEATHER_OPTIONS}
                            onChange={(v) => setSettings({...settings, weather: v})}
                         />
                     </div>


                     <Dropdown
                        label="KALİTE"
                        value={settings.modelQuality}
                        options={MODEL_QUALITY_OPTIONS}
                        onChange={(v) => setSettings({...settings, modelQuality: v})}
                     />
                </div>

            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={handleGenerateClick}
                    disabled={!originalPhoto || !productPhoto || isGenerating}
                    className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                        !originalPhoto || !productPhoto || isGenerating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-accent text-white hover:scale-[1.02] shadow-primary/30'
                    }`}
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} />}
                    <span>STİL OLUŞTUR</span>
                </button>
            </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center bg-grid-pattern p-10 overflow-hidden">
            {resultImage ? (
                <div className="relative h-full w-full flex items-center justify-center group animate-in fade-in zoom-in duration-300">
                    <img src={resultImage} className="max-h-full max-w-full object-contain shadow-2xl rounded-lg" alt="V3 Result" />
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                         <button 
                            onClick={() => setShowFullScreen(true)}
                            className="p-3 bg-white/90 text-gray-700 rounded-lg hover:bg-white shadow-lg border border-gray-200 backdrop-blur-md transition-all"
                            title="Tam Ekran & Büyüt"
                         >
                            <Maximize2 size={20} />
                         </button>
                         <button 
                            onClick={handleDownload}
                            className="p-3 bg-accent text-white rounded-lg hover:bg-accent shadow-lg border border-accent backdrop-blur-md transition-all"
                            title="İndir"
                         >
                            <Download size={20} />
                         </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 opacity-50 select-none pointer-events-none">
                     <div className="w-32 h-32 rounded-full bg-white border border-dashed border-gray-200 flex items-center justify-center mb-6">
                        <ImageIcon className="w-12 h-12 opacity-20 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-500 mb-2">Sonuç Alanı</h3>
                    <p className="text-sm text-center max-w-xs">Görselleri yükleyin, ayarlarınızı yapın ve sonucu burada görün.</p>
                </div>
            )}
        </div>

        {/* FULL SCREEN MODAL */}
        {showFullScreen && resultImage && (
            <FullScreenImageViewer
                imageUrl={resultImage}
                onClose={() => setShowFullScreen(false)}
                filterSettings={filterSettings}
                onFilterChange={setFilterSettings}
            />
        )}

    </div>
  );
};

export default VirtualTryOnModeV3;