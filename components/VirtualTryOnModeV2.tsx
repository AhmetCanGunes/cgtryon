
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Sparkles, Loader2, ArrowRight, Download, Image as ImageIcon, Info, RefreshCw, Maximize2 } from 'lucide-react';
import FullScreenImageViewer from './FullScreenImageViewer';
import Dropdown from './Dropdown';
import { ImageFilterSettings, MODEL_QUALITY_OPTIONS, IMAGE_COUNT_OPTIONS } from '../types';

interface VirtualTryOnModeV2Props {
  onGenerate: (targetModel: File, refModel: File, modelQuality: string) => Promise<string>;
  isGenerating: boolean;
}

const VirtualTryOnModeV2: React.FC<VirtualTryOnModeV2Props> = ({ onGenerate, isGenerating }) => {
  const [targetModel, setTargetModel] = useState<File | null>(null);
  const [refModel, setRefModel] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Default to the first option (usually Pro/Nano Banana)
  const [modelQuality, setModelQuality] = useState<string>(MODEL_QUALITY_OPTIONS[0]);

  const [isTargetDragging, setIsTargetDragging] = useState(false);
  const [isRefDragging, setIsRefDragging] = useState(false);

  // States for Full Screen Viewer
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [filterSettings, setFilterSettings] = useState<ImageFilterSettings>({
      brightness: 100,
      contrast: 100,
      saturation: 100,
  });

  const targetInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

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
    if (!targetModel || !refModel) return;
    try {
        const result = await onGenerate(targetModel, refModel, modelQuality);
        setResultImage(result);
    } catch (error) {
        alert("İşlem başarısız oldu.");
    }
  };

  const handleDownload = () => {
    if (resultImage) {
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `KAapp_TryOnV2_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-full w-full bg-white relative">
        
        {/* LEFT PANEL - WIDENED to allow side-by-side */}
        <div className="w-[700px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col p-6 z-20">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md">
                    <RefreshCw size={16} />
                </div>
                <h2 className="text-sm font-bold text-gray-900 tracking-wide">SANAL KABİN V2 (Manken Değiştirme)</h2>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 flex gap-3">
                <Info className="text-blue-500 flex-shrink-0" size={16} />
                <p className="text-[11px] text-blue-700 leading-relaxed">
                    <strong>Nasıl Çalışır?</strong> Birinci görseldeki kişinin yüzünü ve kimliğini alır, İkinci görseldeki kıyafetli mankenin yerine yerleştirir. Kıyafet ve duruş bozulmaz.
                </p>
            </div>

            {/* SIDE-BY-SIDE INPUT CONTAINER */}
            <div className="flex items-center gap-4 flex-1 overflow-y-auto">
                {/* INPUT 1 */}
                <div className="flex-1 flex flex-col">
                    <div className="flex flex-col mb-2">
                         <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">1. SENİN MANKENİN</label>
                         <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 w-fit">Kaynak Kişi (Yüz)</span>
                    </div>
                    <div 
                        className={`relative aspect-[4/5] w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${isTargetDragging ? 'border-pink-500 bg-pink-50' : targetModel ? 'border-gray-200' : 'border-gray-300 hover:border-pink-400'}`}
                        onDragOver={(e) => handleDragOver(e, setIsTargetDragging)}
                        onDragLeave={(e) => handleDragLeave(e, setIsTargetDragging)}
                        onDrop={(e) => handleDrop(e, setTargetModel, setIsTargetDragging)}
                        onClick={() => targetInputRef.current?.click()}
                    >
                         {targetModel ? (
                            <>
                                <img src={URL.createObjectURL(targetModel)} className="w-full h-full object-cover" />
                                <button onClick={(e) => {e.stopPropagation(); setTargetModel(null)}} className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-red-500 text-white rounded-md backdrop-blur-md transition-colors"><X size={14}/></button>
                            </>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                                 <Upload size={24} className="mb-2" />
                                 <span className="text-xs font-medium">Model Yükle</span>
                             </div>
                         )}
                         <input type="file" ref={targetInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setTargetModel(e.target.files[0])} />
                    </div>
                </div>

                {/* ARROW */}
                <div className="flex-shrink-0 text-gray-300 pt-6">
                    <ArrowRight size={32} />
                </div>

                {/* INPUT 2 */}
                <div className="flex-1 flex flex-col">
                    <div className="flex flex-col mb-2">
                         <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">2. HEDEF KOMBİN</label>
                         <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded font-medium w-fit">Kıyafet Korunur</span>
                    </div>
                    <div 
                        className={`relative aspect-[4/5] w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${isRefDragging ? 'border-pink-500 bg-pink-50' : refModel ? 'border-gray-200' : 'border-gray-300 hover:border-pink-400'}`}
                        onDragOver={(e) => handleDragOver(e, setIsRefDragging)}
                        onDragLeave={(e) => handleDragLeave(e, setIsRefDragging)}
                        onDrop={(e) => handleDrop(e, setRefModel, setIsRefDragging)}
                        onClick={() => refInputRef.current?.click()}
                    >
                         {refModel ? (
                            <>
                                <img src={URL.createObjectURL(refModel)} className="w-full h-full object-cover" />
                                <button onClick={(e) => {e.stopPropagation(); setRefModel(null)}} className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-red-500 text-white rounded-md backdrop-blur-md transition-colors"><X size={14}/></button>
                            </>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                                 <Upload size={24} className="mb-2" />
                                 <span className="text-xs font-medium">Kombin Yükle</span>
                             </div>
                         )}
                         <input type="file" ref={refInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setRefModel(e.target.files[0])} />
                    </div>
                </div>
            </div>

            {/* QUALITY SETTINGS */}
            <div className="mt-4 space-y-3">
                 <Dropdown
                    label="MODEL KALİTESİ (NANO BANANA PRO)"
                    value={modelQuality}
                    options={MODEL_QUALITY_OPTIONS}
                    onChange={setModelQuality}
                 />
                 
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={handleGenerateClick}
                    disabled={!targetModel || !refModel || isGenerating}
                    className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                        !targetModel || !refModel || isGenerating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:scale-[1.02] shadow-pink-200'
                    }`}
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} />}
                    <span>MANKENİ DEĞİŞTİR & KOMBİNİ KORU</span>
                </button>
            </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center bg-grid-pattern p-10 overflow-hidden">
            {resultImage ? (
                <div className="relative h-full w-full flex items-center justify-center group">
                    <img src={resultImage} className="max-h-full max-w-full object-contain shadow-2xl rounded-lg" alt="V2 Result" />
                    
                    {/* ACTION BUTTONS (Maximize & Download) */}
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
                            className="p-3 bg-pink-600 text-white rounded-lg hover:bg-pink-500 shadow-lg border border-pink-400 backdrop-blur-md transition-all"
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
                    <p className="text-sm text-center max-w-xs">Sol panelden görselleri yükleyin ve sonucu burada görün.</p>
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

export default VirtualTryOnModeV2;
