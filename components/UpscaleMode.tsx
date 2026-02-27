
import React, { useState, useRef, useCallback } from 'react';
import { useBlobUrl } from '../hooks/useBlobUrl';
import { Upload, X, ScanEye, Loader2, Download, Maximize2, Image as ImageIcon, Zap } from 'lucide-react';
import FullScreenImageViewer from './FullScreenImageViewer';
import Dropdown from './Dropdown';
import { UpscaleSettings, UPSCALE_FACTORS, UPSCALE_SHARPNESS, ImageFilterSettings, IMAGE_COUNT_OPTIONS } from '../types';

interface UpscaleModeProps {
  onGenerate: (image: File, settings: UpscaleSettings) => Promise<string>;
  isGenerating: boolean;
}

const UpscaleMode: React.FC<UpscaleModeProps> = ({ onGenerate, isGenerating }) => {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Settings
  const [settings, setSettings] = useState<UpscaleSettings>({
      factor: UPSCALE_FACTORS[0],
      creativity: 20, // Low default for fidelity
      sharpness: UPSCALE_SHARPNESS[1], // High
      numberOfImages: 1
  });

  // Full Screen Viewer
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [filterSettings, setFilterSettings] = useState<ImageFilterSettings>({
        brightness: 100,
        contrast: 100,
        saturation: 100,
  });

  // Blob URL management — guaranteed cleanup via useBlobUrl hook
  const sourcePreview = useBlobUrl(sourceImage);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0] && e.dataTransfer.files[0].type.startsWith('image/')) {
       setSourceImage(e.dataTransfer.files[0]);
    }
  }, []);

  const handleGenerateClick = async () => {
    if (!sourceImage) return;
    try {
        const result = await onGenerate(sourceImage, settings);
        setResultImage(result);
    } catch (error) {
        alert("Upscale işlemi başarısız oldu.");
    }
  };

  const handleDownload = () => {
    if (resultImage) {
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `KAapp_Upscale_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-full w-full bg-white relative">
        
        {/* LEFT PANEL */}
        <div className="w-[400px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col p-6 z-20">
             <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md">
                    <ScanEye size={18} />
                </div>
                <h2 className="text-sm font-bold text-gray-900 tracking-wide">UPSCALE (Görüntü İyileştirme)</h2>
            </div>

            {/* UPLOAD AREA */}
            <div className="flex-1 overflow-y-auto">
                 <div className="flex flex-col mb-4">
                     <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">İşlenecek Görsel</label>
                     <div 
                        className={`relative aspect-[4/5] w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group 
                        ${isDragging ? 'border-cyan-500 bg-cyan-50' : sourceImage ? 'border-gray-200' : 'border-gray-300 hover:border-cyan-400'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                         {sourceImage ? (
                            <>
                                <img src={sourcePreview!} className="w-full h-full object-contain p-2" />
                                <button onClick={(e) => {e.stopPropagation(); setSourceImage(null)}} className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-red-500 text-white rounded-md backdrop-blur-md transition-colors"><X size={14}/></button>
                            </>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                                 <Upload size={24} className="mb-2" />
                                 <span className="text-xs font-medium">Görsel Yükle</span>
                             </div>
                         )}
                         <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setSourceImage(e.target.files[0])} />
                    </div>
                 </div>

                 {/* CONTROLS */}
                 <div className="space-y-5 pt-2">
                     <Dropdown 
                        label="İYİLEŞTİRME SEVİYESİ"
                        value={settings.factor}
                        options={UPSCALE_FACTORS}
                        onChange={(v) => setSettings({...settings, factor: v})}
                     />

                     <div className="space-y-2">
                         <div className="flex justify-between">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Yaratıcılık / Detay Ekleme</label>
                            <span className="text-[10px] text-cyan-600 font-bold">%{settings.creativity}</span>
                         </div>
                         <input 
                            type="range" 
                            min="0" 
                            max="50" 
                            step="5"
                            value={settings.creativity} 
                            onChange={(e) => setSettings({...settings, creativity: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                         />
                         <p className="text-[10px] text-gray-400">
                             Düşük: Orijinale sadık kalır. Yüksek: Daha fazla detay üretir.
                         </p>
                     </div>

                     <Dropdown 
                        label="KESKİNLİK (SHARPNESS)"
                        value={settings.sharpness}
                        options={UPSCALE_SHARPNESS}
                        onChange={(v) => setSettings({...settings, sharpness: v})}
                     />

                 </div>
            </div>

            {/* ACTION */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={handleGenerateClick}
                    disabled={!sourceImage || isGenerating}
                    className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                        !sourceImage || isGenerating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-[1.02] shadow-cyan-200'
                    }`}
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} fill="currentColor" />}
                    <span>GÖRÜNTÜYÜ İYİLEŞTİR (4K)</span>
                </button>
            </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center bg-grid-pattern p-10 overflow-hidden">
             {resultImage ? (
                <div className="relative h-full w-full flex items-center justify-center group animate-in fade-in zoom-in duration-300">
                    <img src={resultImage} className="max-h-full max-w-full object-contain shadow-2xl rounded-lg border-4 border-white" alt="Upscale Result" />
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                         <button 
                            onClick={() => setShowFullScreen(true)}
                            className="p-3 bg-white/90 text-gray-700 rounded-lg hover:bg-white shadow-lg border border-gray-200 backdrop-blur-md transition-all"
                         >
                            <Maximize2 size={20} />
                         </button>
                         <button 
                            onClick={handleDownload}
                            className="p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 shadow-lg border border-cyan-400 backdrop-blur-md transition-all"
                         >
                            <Download size={20} />
                         </button>
                    </div>

                    <div className="absolute bottom-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium">
                        Tamamlandı: 2048x2048 (Yüksek Kalite)
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 opacity-50 select-none pointer-events-none">
                     <div className="w-32 h-32 rounded-full bg-white border border-dashed border-gray-200 flex items-center justify-center mb-6">
                        <ImageIcon className="w-12 h-12 opacity-20 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-500 mb-2">Önizleme Alanı</h3>
                    <p className="text-sm text-center max-w-xs">Görsel yükleyin ve sonucu burada görün.</p>
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

export default UpscaleMode;
