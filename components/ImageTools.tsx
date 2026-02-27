import React, { useState, useRef, useCallback } from 'react';
import {
  Eraser,
  Palette,
  Sparkles,
  Upload,
  Download,
  X,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  ImageIcon,
  Copy,
  Layers
} from 'lucide-react';
import {
  removeBackground,
  generateColorVariation,
  generateBatchColorVariations,
  enhanceImage
} from '../services/geminiService';

interface ImageToolsProps {
  onClose?: () => void;
}

type ToolMode = 'background' | 'color' | 'enhance' | 'batch';
type BackgroundOption = 'transparent' | 'white' | 'custom';

// Hazır renk paletleri
const COLOR_PRESETS = [
  { name: 'Siyah', value: 'Black', hex: '#000000' },
  { name: 'Beyaz', value: 'White', hex: '#FFFFFF' },
  { name: 'Lacivert', value: 'Navy Blue', hex: '#1a1a4e' },
  { name: 'Bordo', value: 'Burgundy', hex: '#722F37' },
  { name: 'Bej', value: 'Beige', hex: '#C8AD7F' },
  { name: 'Gri', value: 'Gray', hex: '#808080' },
  { name: 'Kahve', value: 'Brown', hex: '#5C4033' },
  { name: 'Kırmızı', value: 'Red', hex: '#C41E3A' },
  { name: 'Mavi', value: 'Blue', hex: '#0066CC' },
  { name: 'Yeşil', value: 'Green', hex: '#228B22' },
  { name: 'Pembe', value: 'Pink', hex: '#FFC0CB' },
  { name: 'Mor', value: 'Purple', hex: '#663399' },
  { name: 'Turuncu', value: 'Orange', hex: '#FF6600' },
  { name: 'Sarı', value: 'Yellow', hex: '#FFD700' },
  { name: 'Haki', value: 'Khaki', hex: '#8B7355' },
  { name: 'Krem', value: 'Cream', hex: '#FFFDD0' },
];

const ImageTools: React.FC<ImageToolsProps> = ({ onClose }) => {
  const [toolMode, setToolMode] = useState<ToolMode>('background');
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  // Background Remover State
  const [bgOption, setBgOption] = useState<BackgroundOption>('white');
  const [customBgColor, setCustomBgColor] = useState('#FFFFFF');

  // Color Variation State
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [customColorName, setCustomColorName] = useState('');
  const [preserveTexture, setPreserveTexture] = useState(true);

  // Batch Color State
  const [batchColors, setBatchColors] = useState<string[]>(['Black', 'White', 'Navy Blue']);
  const [batchResults, setBatchResults] = useState<{ color: string; imageUrl: string }[]>([]);

  // Enhancement State
  const [enhanceType, setEnhanceType] = useState<'sharpen' | 'denoise' | 'colorCorrect' | 'all'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Görsel yükleme
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(file);
      setResultImage(null);
      setBatchResults([]);
      setError(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        setSourcePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Arka plan kaldırma
  const handleRemoveBackground = async () => {
    if (!sourceImage) return;

    setIsProcessing(true);
    setError(null);
    setProgress('Arka plan kaldırılıyor...');

    try {
      const result = await removeBackground(sourceImage, bgOption, customBgColor);
      setResultImage(result);
      setProgress('');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Renk değiştirme
  const handleColorChange = async () => {
    if (!sourceImage) return;

    const targetColor = customColorName || selectedColor;
    if (!targetColor) return;

    setIsProcessing(true);
    setError(null);
    setProgress(`${targetColor} rengine dönüştürülüyor...`);

    try {
      const result = await generateColorVariation(sourceImage, targetColor, preserveTexture);
      setResultImage(result);
      setProgress('');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toplu renk değiştirme
  const handleBatchColorChange = async () => {
    if (!sourceImage || batchColors.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setBatchResults([]);

    try {
      const results = await generateBatchColorVariations(
        sourceImage,
        batchColors,
        preserveTexture,
        (completed, total, color) => {
          setProgress(`${color} işleniyor... (${completed + 1}/${total})`);
        }
      );
      setBatchResults(results);
      setProgress('');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Görsel iyileştirme
  const handleEnhance = async () => {
    if (!sourceImage) return;

    setIsProcessing(true);
    setError(null);
    setProgress('Görsel iyileştiriliyor...');

    try {
      const result = await enhanceImage(sourceImage, enhanceType);
      setResultImage(result);
      setProgress('');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Görsel indirme
  const handleDownload = (imageUrl: string, suffix: string = '') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `cgtryon-${toolMode}${suffix}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Batch renk ekleme/çıkarma
  const addBatchColor = (color: string) => {
    if (!batchColors.includes(color)) {
      setBatchColors([...batchColors, color]);
    }
  };

  const removeBatchColor = (color: string) => {
    setBatchColors(batchColors.filter(c => c !== color));
  };

  const tools = [
    { id: 'background', label: 'Arka Plan Sil', icon: <Eraser size={18} />, desc: 'Arka planı kaldır' },
    { id: 'color', label: 'Renk Değiştir', icon: <Palette size={18} />, desc: 'Ürün rengini değiştir' },
    { id: 'batch', label: 'Toplu Renk', icon: <Layers size={18} />, desc: 'Birden fazla renk' },
    { id: 'enhance', label: 'İyileştir', icon: <Sparkles size={18} />, desc: 'Kaliteyi artır' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <ImageIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Görsel Araçları</h1>
            <p className="text-xs text-gray-500">AI destekli görsel düzenleme</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-y-auto custom-scrollbar">
          {/* Tool Selection */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Araç Seçin</p>
            <div className="grid grid-cols-2 gap-2">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setToolMode(tool.id as ToolMode);
                    setResultImage(null);
                    setBatchResults([]);
                  }}
                  className={`p-3 rounded-xl text-left transition-all ${
                    toolMode === tool.id
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="mb-1">{tool.icon}</div>
                  <p className="text-xs font-semibold">{tool.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Kaynak Görsel</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {sourcePreview ? (
              <div className="relative group">
                <img
                  src={sourcePreview}
                  alt="Source"
                  className="w-full aspect-square object-cover rounded-xl border border-gray-200"
                />
                <button
                  onClick={() => {
                    setSourceImage(null);
                    setSourcePreview(null);
                    setResultImage(null);
                    setBatchResults([]);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
              >
                <Upload size={24} className="text-gray-400" />
                <span className="text-xs text-gray-500">Görsel Yükle</span>
              </button>
            )}
          </div>

          {/* Tool-specific Options */}
          <div className="p-4 flex-1">
            {/* Background Remover Options */}
            {toolMode === 'background' && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Arka Plan Seçenekleri</p>

                <div className="space-y-2">
                  {[
                    { id: 'white', label: 'Beyaz Arka Plan' },
                    { id: 'transparent', label: 'Şeffaf (PNG)' },
                    { id: 'custom', label: 'Özel Renk' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setBgOption(opt.id as BackgroundOption)}
                      className={`w-full p-3 rounded-xl text-left text-sm transition-all flex items-center gap-2 ${
                        bgOption === opt.id
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        bgOption === opt.id ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                      }`}>
                        {bgOption === opt.id && <Check size={10} className="text-white m-0.5" />}
                      </div>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {bgOption === 'custom' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    />
                  </div>
                )}

                <button
                  onClick={handleRemoveBackground}
                  disabled={!sourceImage || isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Eraser size={16} />}
                  {isProcessing ? 'İşleniyor...' : 'Arka Planı Kaldır'}
                </button>
              </div>
            )}

            {/* Color Variation Options */}
            {toolMode === 'color' && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hedef Renk</p>

                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.slice(0, 12).map(color => (
                    <button
                      key={color.value}
                      onClick={() => {
                        setSelectedColor(color.value);
                        setCustomColorName('');
                      }}
                      title={color.name}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${
                        selectedColor === color.value && !customColorName
                          ? 'border-emerald-500 scale-110 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Veya özel renk yazın:</label>
                  <input
                    type="text"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    placeholder="örn: Pastel Mavi, Koyu Bordo..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={preserveTexture}
                    onChange={(e) => setPreserveTexture(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  Doku ve desenleri koru
                </label>

                <button
                  onClick={handleColorChange}
                  disabled={!sourceImage || isProcessing || (!selectedColor && !customColorName)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Palette size={16} />}
                  {isProcessing ? 'İşleniyor...' : 'Rengi Değiştir'}
                </button>
              </div>
            )}

            {/* Batch Color Options */}
            {toolMode === 'batch' && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seçili Renkler ({batchColors.length})</p>

                <div className="flex flex-wrap gap-2">
                  {batchColors.map(color => {
                    const preset = COLOR_PRESETS.find(p => p.value === color);
                    return (
                      <div
                        key={color}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: preset?.hex || '#ccc' }}
                        />
                        <span className="text-xs text-gray-700">{preset?.name || color}</span>
                        <button
                          onClick={() => removeBatchColor(color)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500">Renk ekle:</p>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => addBatchColor(color.value)}
                      disabled={batchColors.includes(color.value)}
                      title={color.name}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${
                        batchColors.includes(color.value)
                          ? 'border-emerald-500 opacity-50'
                          : 'border-gray-200 hover:border-emerald-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleBatchColorChange}
                  disabled={!sourceImage || isProcessing || batchColors.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />}
                  {isProcessing ? progress || 'İşleniyor...' : `${batchColors.length} Renk Oluştur`}
                </button>
              </div>
            )}

            {/* Enhancement Options */}
            {toolMode === 'enhance' && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">İyileştirme Tipi</p>

                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'Tam İyileştirme', desc: 'Tüm optimizasyonlar' },
                    { id: 'sharpen', label: 'Keskinleştir', desc: 'Detayları belirginleştir' },
                    { id: 'denoise', label: 'Gürültü Azalt', desc: 'Grenli görüntüyü düzelt' },
                    { id: 'colorCorrect', label: 'Renk Düzelt', desc: 'Beyaz dengesi ve pozlama' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setEnhanceType(opt.id as any)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        enhanceType === opt.id
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs opacity-70">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleEnhance}
                  disabled={!sourceImage || isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isProcessing ? 'İşleniyor...' : 'Görseli İyileştir'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Results */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Progress Display */}
          {isProcessing && progress && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">{progress}</span>
            </div>
          )}

          {/* Single Result */}
          {resultImage && toolMode !== 'batch' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Sonuç</h3>
                <button
                  onClick={() => handleDownload(resultImage)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  <Download size={16} />
                  İndir
                </button>
              </div>
              <div className="p-4">
                <img
                  src={resultImage}
                  alt="Result"
                  className="max-w-full max-h-[600px] mx-auto rounded-xl shadow-lg"
                  style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 20px 20px' }}
                />
              </div>
            </div>
          )}

          {/* Batch Results */}
          {batchResults.length > 0 && toolMode === 'batch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{batchResults.length} Renk Varyasyonu</h3>
                <button
                  onClick={() => {
                    batchResults.forEach((result, i) => {
                      setTimeout(() => handleDownload(result.imageUrl, `-${result.color}`), i * 500);
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  <Download size={16} />
                  Tümünü İndir
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {batchResults.map((result, index) => {
                  const preset = COLOR_PRESETS.find(p => p.value === result.color);
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={result.imageUrl}
                          alt={result.color}
                          className="w-full h-full object-cover"
                          style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 20px 20px' }}
                        />
                        <button
                          onClick={() => handleDownload(result.imageUrl, `-${result.color}`)}
                          className="absolute bottom-2 right-2 p-2 bg-white/90 text-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                      <div className="p-2 flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: preset?.hex || '#ccc' }}
                        />
                        <span className="text-sm font-medium text-gray-700">{preset?.name || result.color}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!resultImage && batchResults.length === 0 && !isProcessing && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={64} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">Sonuçlar burada görünecek</p>
              <p className="text-sm mt-1">Bir görsel yükleyin ve aracı kullanın</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageTools;
