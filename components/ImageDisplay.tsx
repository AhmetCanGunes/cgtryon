

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Maximize2, Loader2, Image as ImageIcon, FolderDown } from 'lucide-react';
import { GeneratedImage, ImageFilterSettings, LoadingState } from '../types';

interface ImageDisplayProps {
  images: GeneratedImage[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onThumbnailClick: (index: number) => void;
  onMaximize: (imageUrl: string) => void;
  isGenerating: boolean;
  currentTask: LoadingState;
  filterSettings: ImageFilterSettings;
  onFilterChange: (settings: ImageFilterSettings) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  images, 
  currentIndex, 
  onNext, 
  onPrev,
  onThumbnailClick,
  onMaximize,
  isGenerating,
  currentTask,
  filterSettings,
  onFilterChange,
}) => {
  // SAFE GUARD: Check if images exist and index is valid
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentIndex] : undefined;

  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);

  // Scroll current thumbnail into view
  useEffect(() => {
    if (thumbnailScrollRef.current) {
      const activeThumbnail = thumbnailScrollRef.current.children[currentIndex] as HTMLElement;
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  }, [currentIndex]);

  // Apply filters to the main image
  useEffect(() => {
    if (mainImageRef.current) {
      mainImageRef.current.style.filter = `
        brightness(${filterSettings.brightness}%) 
        contrast(${filterSettings.contrast}%) 
        saturate(${filterSettings.saturation}%)
      `;
    }
  }, [filterSettings, currentImage]);

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = `ModaAI_Studio_Image_${currentImage.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAll = () => {
      images.forEach((img, index) => {
          setTimeout(() => {
              const link = document.createElement('a');
              link.href = img.url;
              link.download = `ModaAI_Image_${index + 1}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          }, index * 300); // Stagger downloads slightly
      });
  };

  return (
    <main className="flex-1 bg-gray-50 relative flex flex-col h-full overflow-hidden">
      
      {/* Canvas Area with Dot Grid Pattern */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative bg-grid-pattern">
        
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xl flex flex-col items-center max-w-sm text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-1">Yapay Zeka Çalışıyor</h3>
                <p className="text-sm text-gray-500 mb-2">{currentTask === 'GENERATING_MODEL' ? 'Model ve ortam oluşturuluyor...' : 'İşleniyor...'}</p>
                <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-primary w-1/2 animate-[shimmer_1s_infinite_linear]"></div>
                </div>
            </div>
          </div>
        )}

        {hasImages && currentImage ? (
          <div className="relative h-full w-full flex items-center justify-center animate-in fade-in duration-500 group"> 
            <img 
              ref={mainImageRef}
              src={currentImage.url} 
              alt="Generated Output" 
              className="max-h-full max-w-full object-contain shadow-2xl rounded-sm"
              style={{
                // Filters applied via useEffect
              }}
            />
            
            {/* Top Right Floating Actions */}
            <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <button 
                onClick={() => onMaximize(currentImage.url)}
                className="p-2.5 bg-white/90 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-lg backdrop-blur-md transition-all shadow-lg"
                title="Tam Ekran"
              >
                <Maximize2 size={18} />
              </button>
              <button 
                onClick={handleDownload}
                className="p-2.5 bg-primary/90 border border-primary/50 text-white rounded-lg backdrop-blur-md hover:bg-primary transition-all shadow-lg shadow-primary/20"
                title="İndir"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 select-none pointer-events-none">
            <div className="w-32 h-32 rounded-full bg-white border border-dashed border-gray-200 flex items-center justify-center mb-6 shadow-sm">
              <ImageIcon className="w-12 h-12 opacity-20 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-500 mb-2">Çalışma Alanı Boş</h3>
            <p className="text-sm text-gray-400 max-w-md text-center">
              Sol panelden ürününüzü yükleyin ve ayarlarınızı yaparak "Model Oluştur" butonuna tıklayın.
            </p>
          </div>
        )}
      </div>

    </main>
  );
};

export default ImageDisplay;