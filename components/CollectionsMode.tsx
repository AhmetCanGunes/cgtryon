

import React, { useState, useRef, useCallback } from 'react';
import { useBlobUrl, useBlobUrls } from '../hooks/useBlobUrl';
import { Upload, Sparkles, Loader2, LayoutTemplate, Download, ChevronLeft, ChevronRight, Images, X, Plus, User, MapPin, FileText } from 'lucide-react';
import { CollectionResult } from '../types';

interface CollectionsModeProps {
  onGenerate: (
    productImages: File[],
    modelImage: File,
    sceneImage: File,
    customPrompt: string,
    numberOfImages: number
  ) => Promise<CollectionResult[]>;
  isGenerating: boolean;
}

const CollectionsMode: React.FC<CollectionsModeProps> = ({ onGenerate, isGenerating }) => {
  // Input State
  const [productImages, setProductImages] = useState<File[]>([]);
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [sceneImage, setSceneImage] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [numberOfImages, setNumberOfImages] = useState(1);

  // Result State
  const [resultImages, setResultImages] = useState<CollectionResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Blob URL management — guaranteed cleanup via useBlobUrl hooks
  const productPreviews = useBlobUrls(productImages);
  const modelPreview = useBlobUrl(modelImage);
  const scenePreview = useBlobUrl(sceneImage);

  // Refs
  const productInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const sceneInputRef = useRef<HTMLInputElement>(null);

  // Product images handlers
  const handleAddProductImages = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    setProductImages(prev => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 5);
    });
  }, []);

  const handleRemoveProductImage = useCallback((index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Generate handler
  const handleGenerateClick = async () => {
    if (!modelImage || productImages.length === 0) return;
    try {
      setResultImages([]);
      const results = await onGenerate(productImages, modelImage, sceneImage!, customPrompt, numberOfImages);
      setResultImages(results);
      setSelectedIndex(0);
    } catch (error) {
      console.error(error);
      alert('Koleksiyon görseli oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDownload = () => {
    if (resultImages.length > 0 && resultImages[selectedIndex]) {
      const link = document.createElement('a');
      link.href = resultImages[selectedIndex].imageUrl;
      link.download = `KAapp_Collection_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const canGenerate = productImages.length > 0 && modelImage && !isGenerating;

  return (
    <div className="flex h-full w-full">

      {/* LEFT SIDEBAR */}
      <div className="w-[380px] flex-shrink-0 border-r border-white/10 bg-bg-surface flex flex-col h-full z-20">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-3">

          {/* Header */}
          <div className="flex items-center gap-2 pb-1.5 border-b border-white/10">
            <Images className="text-primary" size={14} />
            <h2 className="text-[11px] font-bold text-gray-200 tracking-wide">KOLEKSİYON</h2>
          </div>

          {/* Referans Ürünler */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Upload size={10} className="text-primary" />
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Referans Ürünler</span>
              <span className="text-[8px] text-gray-600 ml-auto">{productImages.length}/5</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {productImages.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg border border-white/10 bg-white/5 overflow-hidden group">
                  <img src={productPreviews[idx]} className="w-full h-full object-cover" alt={`Ürün ${idx + 1}`} />
                  <button
                    onClick={() => handleRemoveProductImage(idx)}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              {productImages.length < 5 && (
                <button
                  onClick={() => productInputRef.current?.click()}
                  className="aspect-square rounded-lg border border-dashed border-white/20 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center transition-colors"
                >
                  <Plus size={14} className="text-gray-500" />
                  <span className="text-[8px] text-gray-500 mt-0.5">Ekle</span>
                </button>
              )}
            </div>
            <p className="text-[8px] text-gray-600">Aynı ürünün farklı açılarını yükleyin (max 5)</p>
            <input
              type="file"
              ref={productInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => { handleAddProductImages(e.target.files); e.target.value = ''; }}
            />
          </div>

          {/* Manken */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <User size={10} className="text-primary" />
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Manken</span>
            </div>
            <div
              className={`relative rounded-lg border border-dashed overflow-hidden cursor-pointer group transition-all
                ${modelImage ? 'border-white/20 bg-white/5' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
              style={{ aspectRatio: '3/4', maxHeight: '140px' }}
              onClick={() => modelInputRef.current?.click()}
            >
              {modelImage ? (
                <>
                  <img src={modelPreview!} className="w-full h-full object-cover" alt="Manken" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] text-white bg-black/50 px-2 py-1 rounded">Değiştir</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <User size={16} className="mb-1" />
                  <span className="text-[9px]">Manken Yükle</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={modelInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => { if (e.target.files?.[0]) setModelImage(e.target.files[0]); e.target.value = ''; }}
            />
          </div>

          {/* Mekan */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin size={10} className="text-primary" />
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Mekan</span>
              <span className="text-[8px] text-gray-600 ml-auto">Opsiyonel</span>
            </div>
            <div
              className={`relative rounded-lg border border-dashed overflow-hidden cursor-pointer group transition-all
                ${sceneImage ? 'border-white/20 bg-white/5' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
              style={{ aspectRatio: '16/9', maxHeight: '100px' }}
              onClick={() => sceneInputRef.current?.click()}
            >
              {sceneImage ? (
                <>
                  <img src={scenePreview!} className="w-full h-full object-cover" alt="Mekan" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] text-white bg-black/50 px-2 py-1 rounded">Değiştir</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MapPin size={16} className="mb-1" />
                  <span className="text-[9px]">Mekan Yükle</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={sceneInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => { if (e.target.files?.[0]) setSceneImage(e.target.files[0]); e.target.value = ''; }}
            />
          </div>

          {/* Özel Prompt */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <FileText size={10} className="text-primary" />
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Özel Prompt</span>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ek talimatlarınızı buraya yazın... (ör: Kış koleksiyonu, soğuk tonlar, açık havada)"
              className="w-full bg-white/5 border border-white/10 text-[10px] text-gray-200 rounded-lg px-2 py-1.5 resize-none h-16 focus:border-primary focus:outline-none placeholder-gray-500"
            />
          </div>

          {/* Görsel Adedi */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Görsel Adedi</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setNumberOfImages(n)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                    numberOfImages === n
                      ? 'bg-primary/20 text-primary border-primary/40'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-3 border-t border-white/10 bg-bg-surface z-30">
          <button
            onClick={handleGenerateClick}
            disabled={!canGenerate}
            className={`w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              !canGenerate
                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-md shadow-primary/20'
            }`}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            <span>GÖRSEL OLUŞTUR</span>
          </button>
        </div>
      </div>

      {/* RIGHT PREVIEW AREA */}
      <div className="flex-1 bg-bg-base relative flex flex-col items-center justify-center p-6 overflow-hidden">

        {resultImages.length > 0 && resultImages[selectedIndex] ? (
          <div className="flex flex-col items-center w-full h-full max-h-full">
            {/* Main Large Image */}
            <div className="relative flex-1 w-full flex items-center justify-center min-h-0 mb-4 group">
              <img
                src={resultImages[selectedIndex].imageUrl}
                alt={`Collection ${selectedIndex + 1}`}
                className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
              />

              {/* Download button */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={handleDownload} className="p-2 bg-primary text-white rounded-lg hover:opacity-90" title="İndir">
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {resultImages.length > 1 && (
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
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 select-none pointer-events-none">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <LayoutTemplate className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-base font-medium text-gray-400 mb-1">Koleksiyon Alanı Boş</h3>
            <p className="text-xs text-gray-500 max-w-xs text-center">
              Referans ürünler ve manken görseli yükleyin, ardından "Görsel Oluştur" butonuna basın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsMode;
