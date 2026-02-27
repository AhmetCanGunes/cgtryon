import React from 'react';
import { Sparkles, Loader2, ImageIcon, Wand2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { GeneratedImage } from '../../../../types';

interface StudioPreviewProps {
  productImage: File | null;
  generatedImages: GeneratedImage[];
  currentIndex: number;
  isGenerating: boolean;
  onProductImageUpload: (file: File) => void;
  onImageClick?: (index: number) => void;
}

const StudioPreview: React.FC<StudioPreviewProps> = ({
  productImage,
  generatedImages,
  currentIndex,
  isGenerating,
  onImageClick
}) => {
  // Gösterilecek görseli belirle - sadece üretilen görseller
  const displayImage = generatedImages.length > 0
    ? generatedImages[currentIndex]?.imageUrl
    : null;

  return (
    <div className="flex-1 flex flex-col bg-bg-base relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(50, 103, 137, 0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        {!displayImage ? (
          /* Waiting State - No Results Yet */
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            {isGenerating ? (
              /* Generating State */
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Model Oluşturuluyor
                </h3>
                <p className="text-gray-400 text-sm">
                  Yapay zeka görselinizi hazırlıyor, lütfen bekleyin...
                </p>
                <div className="mt-6 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary animate-[shimmer_2s_ease-in-out_infinite]"
                       style={{ width: '60%' }} />
                </div>
              </div>
            ) : (
              /* Empty State - Waiting for Generation */
              <>
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <Wand2 className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Sonuç Bekleniyor
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Sol panelden ürün görselini yükleyin ve ayarlarınızı yaparak model oluşturun.
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>1. Ürün Yükle</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    <span>2. Ayarla</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span>3. Oluştur</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Generated Image Preview */
          <div className="relative max-w-2xl w-full">
            {/* Image Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {/* Main Image */}
              <img
                src={displayImage}
                alt="Generated Result"
                className="w-full h-auto max-h-[70vh] object-contain bg-black/50"
              />

              {/* Success Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm border border-green-500/30">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300 font-medium">
                    {generatedImages.length} görsel oluşturuldu
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnails - Sadece birden fazla sonuç varsa */}
            {generatedImages.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {generatedImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => onImageClick?.(index)}
                    className={cn(
                      'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                      currentIndex === index
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-white/10 hover:border-white/30'
                    )}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Result ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex-shrink-0 px-6 py-3 border-t border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isGenerating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              )} />
              <span className="text-xs text-gray-500">
                {isGenerating ? 'Model oluşturuluyor...' : generatedImages.length > 0 ? `${generatedImages.length} sonuç mevcut` : 'Hazır'}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            {generatedImages.length > 0 && `Görüntülenen: ${currentIndex + 1}/${generatedImages.length}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioPreview;
