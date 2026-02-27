

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { ImageFilterSettings } from '../types';

interface FullScreenImageViewerProps {
  imageUrl: string;
  onClose: () => void;
  filterSettings: ImageFilterSettings;
  onFilterChange: (settings: ImageFilterSettings) => void;
}

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({
  imageUrl,
  onClose,
  filterSettings,
  onFilterChange,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 5)); // Max zoom 5x
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 1)); // Min zoom 1x
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  // Reset zoom/pan when image changes or modal opens
  useEffect(() => {
    handleResetZoom();
  }, [imageUrl, handleResetZoom]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (e.buttons === 1 && zoomLevel > 1) { // Left mouse button pressed and zoomed
        setTranslateX((prev) => prev + e.movementX / zoomLevel);
        setTranslateY((prev) => prev + e.movementY / zoomLevel);
      }
    },
    [zoomLevel]
  );

  const applyFilters = (imgRef: HTMLImageElement | null, filters: ImageFilterSettings) => {
    if (imgRef) {
      imgRef.style.filter = `
        brightness(${filters.brightness}%) 
        contrast(${filters.contrast}%) 
        saturate(${filters.saturation}%)
      `;
    }
  };

  useEffect(() => {
    applyFilters(imageRef.current, filterSettings);
  }, [filterSettings, imageUrl]);


  // Handle keyboard events (e.g., Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tam Ekran Görüntüleyici"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors z-10 border border-gray-200 shadow-sm"
        aria-label="Kapat"
      >
        <X size={20} />
      </button>

      <div
        ref={containerRef}
        className="relative flex-1 w-full max-w-7xl max-h-[calc(100vh-160px)] flex items-center justify-center overflow-hidden rounded-lg bg-gray-50 border border-gray-200 shadow-xl"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => containerRef.current?.style.removeProperty('cursor')}
        onMouseDown={(e) => {
          if (e.button === 0 && zoomLevel > 1) { // Left mouse button
            containerRef.current!.style.cursor = 'grabbing';
          }
        }}
        onMouseUp={() => containerRef.current!.style.cursor = 'grab'}
        style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Generated Output Fullscreen"
          className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`,
            // Filter applied via useEffect
          }}
          aria-live="polite"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-gray-200">
        {/* Zoom Controls */}
        <button
          onClick={handleZoomOut}
          className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Uzaklaştır"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-sm text-gray-700 font-mono">{Math.round(zoomLevel * 100)}%</span>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Yakınlaştır"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleResetZoom}
          className="ml-4 p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Yakınlaştırmayı sıfırla"
        >
          <RotateCcw size={16} />
        </button>
      </div>    </div>
  );
};

export default FullScreenImageViewer;