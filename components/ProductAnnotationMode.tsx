import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  Download,
  X,
  Plus,
  Trash2,
  Type,
  ImageIcon,
  MousePointer,
  RotateCcw,
  Edit3,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Minus,
  ArrowDown
} from 'lucide-react';

// Annotation tipleri
type AnnotationType = 'label' | 'area' | 'taper';

interface Annotation {
  id: string;
  type: AnnotationType;
  x: number; // percentage position
  y: number; // percentage position
  text: string;
  side: 'left' | 'right';
  lineLength: number;
  // Area (oval) için
  width?: number;
  height?: number;
  // Taper (daralan) için
  taperHeight?: number;
  taperTopWidth?: number;
  taperBottomWidth?: number;
}

interface ProductAnnotationModeProps {
  onClose?: () => void;
}

const ProductAnnotationMode: React.FC<ProductAnnotationModeProps> = ({ onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [addingType, setAddingType] = useState<AnnotationType | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [tempText, setTempText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedAnnotation, setDraggedAnnotation] = useState<string | null>(null);

  // Drawing state for area and taper
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingAnnotation, setDrawingAnnotation] = useState<string | null>(null);
  const [drawStartPos, setDrawStartPos] = useState<{ x: number; y: number } | null>(null);


  const imageContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setAnnotations([]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mouse down - start drawing or create label
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!addingType || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (addingType === 'label') {
      // Label is instant click
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'label',
        x,
        y,
        text: '',
        side: x > 50 ? 'right' : 'left',
        lineLength: 60,
      };
      setAnnotations([...annotations, newAnnotation]);
      setSelectedAnnotation(newAnnotation.id);
      setAddingType(null);
      setEditingText(newAnnotation.id);
      setTempText('');
    } else {
      // Area and taper - start drawing
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: addingType,
        x,
        y,
        text: '',
        side: x > 50 ? 'right' : 'left',
        lineLength: 60,
        ...(addingType === 'area' && { width: 1, height: 1 }),
        ...(addingType === 'taper' && { taperHeight: 1, taperTopWidth: 1, taperBottomWidth: 0.5 })
      };
      setAnnotations([...annotations, newAnnotation]);
      setDrawingAnnotation(newAnnotation.id);
      setDrawStartPos({ x, y });
      setIsDrawing(true);
    }
  };

  // Mouse move while drawing
  const handleDrawingMove = useCallback((e: MouseEvent) => {
    if (!isDrawing || !drawingAnnotation || !drawStartPos || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const width = Math.abs(currentX - drawStartPos.x);
    const height = Math.abs(currentY - drawStartPos.y);
    const centerX = (drawStartPos.x + currentX) / 2;
    const centerY = (drawStartPos.y + currentY) / 2;

    setAnnotations(prev => prev.map(ann => {
      if (ann.id !== drawingAnnotation) return ann;

      if (ann.type === 'area') {
        return {
          ...ann,
          x: centerX,
          y: centerY,
          width: Math.max(2, width / 2),
          height: Math.max(2, height / 2),
          side: centerX > 50 ? 'right' : 'left'
        };
      } else if (ann.type === 'taper') {
        // For taper: width at top, narrower at bottom
        const taperWidth = Math.max(2, width / 2);
        return {
          ...ann,
          x: centerX,
          y: centerY,
          taperHeight: Math.max(5, height),
          taperTopWidth: taperWidth,
          taperBottomWidth: taperWidth * 0.4,
          side: centerX > 50 ? 'right' : 'left'
        };
      }
      return ann;
    }));
  }, [isDrawing, drawingAnnotation, drawStartPos]);

  // Mouse up - finish drawing
  const handleDrawingEnd = useCallback(() => {
    if (isDrawing && drawingAnnotation) {
      setSelectedAnnotation(drawingAnnotation);
      setEditingText(drawingAnnotation);
      setTempText('');
      setAddingType(null);
    }
    setIsDrawing(false);
    setDrawingAnnotation(null);
    setDrawStartPos(null);
  }, [isDrawing, drawingAnnotation]);

  const handleAnnotationDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editingText || isDrawing) return;
    setIsDragging(true);
    setDraggedAnnotation(id);
    setSelectedAnnotation(id);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedAnnotation || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    setAnnotations(prev => prev.map(ann =>
      ann.id === draggedAnnotation
        ? { ...ann, x, y, side: x > 50 ? 'right' : 'left' }
        : ann
    ));
  }, [isDragging, draggedAnnotation]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedAnnotation(null);
  }, []);

  // Event listeners for dragging existing annotations
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Event listeners for drawing new annotations
  useEffect(() => {
    if (isDrawing) {
      window.addEventListener('mousemove', handleDrawingMove);
      window.addEventListener('mouseup', handleDrawingEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrawingMove);
        window.removeEventListener('mouseup', handleDrawingEnd);
      };
    }
  }, [isDrawing, handleDrawingMove, handleDrawingEnd]);

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(ann =>
      ann.id === id ? { ...ann, ...updates } : ann
    ));
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    if (selectedAnnotation === id) setSelectedAnnotation(null);
  };

  const saveTextEdit = () => {
    if (editingText && tempText.trim()) {
      updateAnnotation(editingText, { text: tempText.trim() });
    }
    setEditingText(null);
    setTempText('');
  };

  const exportImage = async () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Style settings - monochrome, elegant
      const lineColor = '#6B7280'; // gray-500 - more visible
      const textColor = '#000000'; // pure black
      const lineWidth = 1.5;

      annotations.forEach(ann => {
        const pointX = (ann.x / 100) * img.width;
        const pointY = (ann.y / 100) * img.height;
        const isLeft = ann.side === 'left';

        ctx.strokeStyle = lineColor;
        ctx.fillStyle = lineColor;
        ctx.lineWidth = lineWidth;

        if (ann.type === 'label') {
          // Simple label with line
          const lineLen = (ann.lineLength / 100) * img.width * 0.2;
          const lineEndX = isLeft ? pointX - lineLen : pointX + lineLen;

          // Horizontal line
          ctx.beginPath();
          ctx.moveTo(pointX, pointY);
          ctx.lineTo(lineEndX, pointY);
          ctx.stroke();

          // Small vertical tick at start
          ctx.beginPath();
          ctx.moveTo(pointX, pointY - 4);
          ctx.lineTo(pointX, pointY + 4);
          ctx.stroke();

          // Text with small white background
          ctx.font = '300 12px Inter, system-ui, sans-serif';
          const textX = isLeft ? lineEndX - 10 : lineEndX + 10;
          const text = ann.text.replace(/\n/g, ' '); // Single line

          // Measure text for background
          const textMetrics = ctx.measureText(text);
          const textWidth = textMetrics.width;
          const textHeight = 14;
          const padding = 4;

          // Draw white background (more transparent)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          const bgX = isLeft ? textX - textWidth - padding : textX - padding;
          ctx.fillRect(bgX, pointY - textHeight / 2 - padding / 2, textWidth + padding * 2, textHeight + padding);

          // Draw text
          ctx.fillStyle = textColor;
          ctx.textAlign = isLeft ? 'right' : 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, textX, pointY);

        } else if (ann.type === 'area') {
          // Oval/ellipse area indicator
          const w = ((ann.width || 15) / 100) * img.width;
          const h = ((ann.height || 25) / 100) * img.height;

          // Draw ellipse
          ctx.beginPath();
          ctx.ellipse(pointX, pointY, w / 2, h / 2, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Dashed line from ellipse to text
          const lineLen = (ann.lineLength / 100) * img.width * 0.15;
          const edgeX = isLeft ? pointX - w / 2 : pointX + w / 2;
          const lineEndX = isLeft ? edgeX - lineLen : edgeX + lineLen;

          ctx.beginPath();
          ctx.setLineDash([4, 3]); // Dashed line pattern
          ctx.moveTo(edgeX, pointY);
          ctx.lineTo(lineEndX, pointY);
          ctx.stroke();
          ctx.setLineDash([]); // Reset to solid line

          // Text with small white background
          ctx.font = '300 12px Inter, system-ui, sans-serif';
          const textX = isLeft ? lineEndX - 10 : lineEndX + 10;
          const text = ann.text.replace(/\n/g, ' '); // Single line

          // Measure text for background
          const textMetrics = ctx.measureText(text);
          const textWidth = textMetrics.width;
          const textHeight = 14;
          const padding = 4;

          // Draw white background (more transparent)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          const bgX = isLeft ? textX - textWidth - padding : textX - padding;
          ctx.fillRect(bgX, pointY - textHeight / 2 - padding / 2, textWidth + padding * 2, textHeight + padding);

          // Draw text
          ctx.fillStyle = textColor;
          ctx.textAlign = isLeft ? 'right' : 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, textX, pointY);

        } else if (ann.type === 'taper') {
          // Tapering indicator (two converging lines)
          const taperH = ((ann.taperHeight || 30) / 100) * img.height;
          const topW = ((ann.taperTopWidth || 8) / 100) * img.width;
          const bottomW = ((ann.taperBottomWidth || 3) / 100) * img.width;

          const startY = pointY - taperH / 2;
          const endY = pointY + taperH / 2;

          // Left taper line
          ctx.beginPath();
          ctx.moveTo(pointX - topW / 2, startY);
          ctx.lineTo(pointX - bottomW / 2, endY);
          ctx.stroke();

          // Right taper line
          ctx.beginPath();
          ctx.moveTo(pointX + topW / 2, startY);
          ctx.lineTo(pointX + bottomW / 2, endY);
          ctx.stroke();

          // Small arrows at bottom
          const arrowSize = 6;
          // Left arrow
          ctx.beginPath();
          ctx.moveTo(pointX - bottomW / 2 - arrowSize, endY - arrowSize);
          ctx.lineTo(pointX - bottomW / 2, endY);
          ctx.lineTo(pointX - bottomW / 2 + arrowSize, endY - arrowSize);
          ctx.stroke();
          // Right arrow
          ctx.beginPath();
          ctx.moveTo(pointX + bottomW / 2 - arrowSize, endY - arrowSize);
          ctx.lineTo(pointX + bottomW / 2, endY);
          ctx.lineTo(pointX + bottomW / 2 + arrowSize, endY - arrowSize);
          ctx.stroke();

          // Line to text
          const lineLen = (ann.lineLength / 100) * img.width * 0.1;
          const lineStartX = isLeft ? pointX - topW / 2 - 5 : pointX + topW / 2 + 5;
          const lineEndX = isLeft ? lineStartX - lineLen : lineStartX + lineLen;

          ctx.beginPath();
          ctx.moveTo(lineStartX, startY + taperH * 0.3);
          ctx.lineTo(lineEndX, startY + taperH * 0.3);
          ctx.stroke();

          // Text
          ctx.font = '500 14px Inter, system-ui, sans-serif';
          ctx.fillStyle = textColor;
          ctx.textAlign = isLeft ? 'right' : 'left';
          ctx.textBaseline = 'middle';
          const textX = isLeft ? lineEndX - 10 : lineEndX + 10;

          const lines = ann.text.split('\n');
          const lineHeight = 18;
          const textY = startY + taperH * 0.3;
          const startTextY = textY - ((lines.length - 1) * lineHeight) / 2;
          lines.forEach((line, i) => {
            ctx.fillText(line, textX, startTextY + i * lineHeight);
          });
        }
      });

      // Export
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = 'etiketli-urun.png';
      link.href = dataUrl;
      link.click();
    };

    img.src = image;
  };

  const clearAll = () => {
    setAnnotations([]);
    setSelectedAnnotation(null);
  };

  const getTypeLabel = (type: AnnotationType) => {
    switch (type) {
      case 'label': return 'Etiket';
      case 'area': return 'Alan';
      case 'taper': return 'Daralma';
    }
  };

  const getTypeIcon = (type: AnnotationType) => {
    switch (type) {
      case 'label': return <Minus className="w-3.5 h-3.5" />;
      case 'area': return <Circle className="w-3.5 h-3.5" />;
      case 'taper': return <ArrowDown className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-base">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Type className="w-5 h-5 text-gray-300" />
          </div>
          <div>
            <h2 className="text-gray-200 font-semibold text-sm">Ürün Etiketleme</h2>
            <p className="text-gray-500 text-xs">Fotoğrafa bilgilendirme etiketleri ekle</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-[380px] border-r border-white/10 bg-bg-surface flex flex-col overflow-y-auto">
          <div className="p-3 space-y-3">
            {/* Upload Section */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-2 block">
                Görsel Yükle
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium text-[10px] flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              >
                <Upload className="w-3 h-3" />
                {image ? 'Yeni Görsel Yükle' : 'Görsel Seç'}
              </button>
            </div>

            {image && (
              <>
                {/* Annotation Tools */}
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-2 block">
                    Etiket Araçları
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setAddingType(addingType === 'label' ? null : 'label')}
                      className={`w-full py-2 px-3 rounded-lg text-[10px] font-medium flex items-center gap-2 transition-all ${
                        addingType === 'label'
                          ? 'bg-primary text-white'
                          : 'bg-white/5 text-gray-300 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Minus className="w-3 h-3" />
                      <span>Düz Etiket</span>
                    </button>

                    <button
                      onClick={() => setAddingType(addingType === 'area' ? null : 'area')}
                      className={`w-full py-2 px-3 rounded-lg text-[10px] font-medium flex items-center gap-2 transition-all ${
                        addingType === 'area'
                          ? 'bg-primary text-white'
                          : 'bg-white/5 text-gray-300 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Circle className="w-3 h-3" />
                      <span>Alan İşaretçi</span>
                    </button>
                  </div>

                  <button
                    onClick={clearAll}
                    disabled={annotations.length === 0}
                    className="w-full py-1.5 px-3 rounded-lg bg-white/5 text-gray-400 text-[10px] font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Tümünü Temizle
                  </button>
                </div>

                {/* Annotations List */}
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <label className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center justify-between">
                    <span>Etiketler ({annotations.length})</span>
                  </label>

                  {annotations.length === 0 ? (
                    <div className="py-4 text-center">
                      <MousePointer className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-500 text-[10px]">
                        Yukarıdan araç seçip<br />görsele tıklayın
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {annotations.map((ann, index) => (
                        <div
                          key={ann.id}
                          onClick={() => setSelectedAnnotation(ann.id)}
                          className={`p-2 rounded-lg cursor-pointer transition-all border ${
                            selectedAnnotation === ann.id
                              ? 'bg-white/10 border-primary/50'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(ann.type)}
                              <span className="text-[10px] text-gray-400">{getTypeLabel(ann.type)} {index + 1}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAnnotation(ann.id);
                              }}
                              className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {editingText === ann.id ? (
                            <div className="flex gap-1">
                              <textarea
                                value={tempText}
                                onChange={(e) => setTempText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && saveTextEdit()}
                                autoFocus
                                rows={2}
                                placeholder="Shift+Enter ile yeni satır"
                                className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/20 text-gray-200 text-[10px] focus:outline-none focus:border-primary resize-none"
                              />
                              <button
                                onClick={saveTextEdit}
                                className="p-1.5 rounded bg-primary text-white hover:bg-primary/80"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-200 text-[10px] whitespace-pre-wrap">{ann.text}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingText(ann.id);
                                  setTempText(ann.text);
                                }}
                                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {selectedAnnotation === ann.id && (
                            <div className="mt-2 pt-2 border-t border-white/10 space-y-2">
                              {/* Side selection */}
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-500">Yön</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateAnnotation(ann.id, { side: 'left' });
                                    }}
                                    className={`p-1 rounded ${ann.side === 'left' ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'}`}
                                  >
                                    <ChevronLeft className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateAnnotation(ann.id, { side: 'right' });
                                    }}
                                    className={`p-1.5 rounded ${ann.side === 'right' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Line length */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Çizgi Uzunluğu</span>
                                </div>
                                <input
                                  type="range"
                                  min="20"
                                  max="120"
                                  value={ann.lineLength}
                                  onChange={(e) => updateAnnotation(ann.id, { lineLength: parseInt(e.target.value) })}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                />
                              </div>

                              {/* Area specific controls */}
                              {ann.type === 'area' && (
                                <>
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Genişlik</span>
                                    <input
                                      type="range"
                                      min="5"
                                      max="40"
                                      value={ann.width || 15}
                                      onChange={(e) => updateAnnotation(ann.id, { width: parseInt(e.target.value) })}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Yükseklik</span>
                                    <input
                                      type="range"
                                      min="5"
                                      max="50"
                                      value={ann.height || 25}
                                      onChange={(e) => updateAnnotation(ann.id, { height: parseInt(e.target.value) })}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                    />
                                  </div>
                                </>
                              )}

                              {/* Taper specific controls */}
                              {ann.type === 'taper' && (
                                <>
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Yükseklik</span>
                                    <input
                                      type="range"
                                      min="10"
                                      max="60"
                                      value={ann.taperHeight || 30}
                                      onChange={(e) => updateAnnotation(ann.id, { taperHeight: parseInt(e.target.value) })}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Üst Genişlik</span>
                                    <input
                                      type="range"
                                      min="3"
                                      max="20"
                                      value={ann.taperTopWidth || 8}
                                      onChange={(e) => updateAnnotation(ann.id, { taperTopWidth: parseInt(e.target.value) })}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-xs text-gray-500">Alt Genişlik</span>
                                    <input
                                      type="range"
                                      min="1"
                                      max="15"
                                      value={ann.taperBottomWidth || 3}
                                      onChange={(e) => updateAnnotation(ann.id, { taperBottomWidth: parseInt(e.target.value) })}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={exportImage}
                    disabled={annotations.length === 0}
                    className="w-full py-3 px-4 rounded-xl bg-gray-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Görseli İndir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Canvas Area - Output Only */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-bg-base">
          {!image ? (
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Çıktı Alanı</p>
              <p className="text-gray-600 text-xs mt-1">Sol panelden görsel yükleyin</p>
            </div>
          ) : (
            <div
              ref={imageContainerRef}
              onMouseDown={handleMouseDown}
              className={`relative max-w-full max-h-full ${addingType ? 'cursor-crosshair' : 'cursor-default'}`}
            >
              <img
                src={image}
                alt="Product"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                draggable={false}
              />

              {/* Annotations Overlay */}
              {annotations.map((ann) => {
                const isLeft = ann.side === 'left';
                const lineLength = ann.lineLength;

                return (
                  <div
                    key={ann.id}
                    className="absolute"
                    style={{
                      left: `${ann.x}%`,
                      top: `${ann.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: selectedAnnotation === ann.id ? 20 : 10
                    }}
                  >
                    {ann.type === 'label' && (
                      <>
                        {/* Vertical tick */}
                        <div
                          className="absolute w-px h-3 bg-gray-500"
                          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                        />
                        {/* Horizontal line */}
                        <div
                          className="absolute top-1/2 h-[1.5px] bg-gray-500"
                          style={{
                            width: `${lineLength}px`,
                            left: isLeft ? `-${lineLength}px` : '0',
                            transform: 'translateY(-50%)'
                          }}
                        />
                        {/* Drag handle */}
                        <div
                          onMouseDown={(e) => handleAnnotationDragStart(e, ann.id)}
                          className={`absolute w-2 h-2 rounded-full cursor-move transition-all ${
                            selectedAnnotation === ann.id
                              ? 'bg-gray-600 ring-4 ring-gray-300'
                              : 'bg-gray-500 hover:bg-gray-600'
                          }`}
                          style={{ transform: 'translate(-50%, -50%)' }}
                        />
                        {/* Text */}
                        <div
                          className={`absolute top-1/2 transform -translate-y-1/2 whitespace-nowrap ${
                            isLeft ? 'text-right' : 'text-left'
                          }`}
                          style={{
                            [isLeft ? 'right' : 'left']: `${lineLength + 12}px`
                          }}
                        >
                          <span className="bg-white/50 px-1.5 py-0.5 rounded text-black text-xs font-normal tracking-tight">{ann.text}</span>
                        </div>
                      </>
                    )}

                    {ann.type === 'area' && (
                      <>
                        {/* Ellipse */}
                        <div
                          onMouseDown={(e) => handleAnnotationDragStart(e, ann.id)}
                          className={`absolute border-[1.5px] rounded-[50%] cursor-move transition-all ${
                            selectedAnnotation === ann.id
                              ? 'border-gray-600'
                              : 'border-gray-500'
                          }`}
                          style={{
                            width: `${(ann.width || 15) * 2}%`,
                            height: `${(ann.height || 25) * 2}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                        {/* Dashed line from ellipse */}
                        <div
                          className="absolute top-1/2 border-t-[1.5px] border-dashed border-gray-500"
                          style={{
                            width: `${lineLength}px`,
                            left: isLeft ? `-${(ann.width || 15)}% ` : `${(ann.width || 15)}%`,
                            marginLeft: isLeft ? `-${lineLength}px` : '0',
                            transform: 'translateY(-50%)'
                          }}
                        />
                        {/* Text */}
                        <div
                          className={`absolute top-1/2 transform -translate-y-1/2 whitespace-nowrap ${
                            isLeft ? 'text-right' : 'text-left'
                          }`}
                          style={{
                            [isLeft ? 'right' : 'left']: `calc(${(ann.width || 15)}% + ${lineLength + 12}px)`
                          }}
                        >
                          <span className="bg-white/50 px-1.5 py-0.5 rounded text-black text-xs font-normal tracking-tight">{ann.text}</span>
                        </div>
                      </>
                    )}

                    {ann.type === 'taper' && (
                      <>
                        {/* Taper lines container */}
                        <div
                          onMouseDown={(e) => handleAnnotationDragStart(e, ann.id)}
                          className="absolute cursor-move"
                          style={{
                            width: `${(ann.taperTopWidth || 8) * 2}%`,
                            height: `${(ann.taperHeight || 30) * 2}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full"
                            preserveAspectRatio="none"
                          >
                            {/* Left taper line */}
                            <line
                              x1={50 - ((ann.taperTopWidth || 8) / (ann.taperTopWidth || 8)) * 25}
                              y1="0"
                              x2={50 - ((ann.taperBottomWidth || 3) / (ann.taperTopWidth || 8)) * 25}
                              y2="100"
                              stroke={selectedAnnotation === ann.id ? '#4B5563' : '#9CA3AF'}
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                            />
                            {/* Right taper line */}
                            <line
                              x1={50 + ((ann.taperTopWidth || 8) / (ann.taperTopWidth || 8)) * 25}
                              y1="0"
                              x2={50 + ((ann.taperBottomWidth || 3) / (ann.taperTopWidth || 8)) * 25}
                              y2="100"
                              stroke={selectedAnnotation === ann.id ? '#4B5563' : '#9CA3AF'}
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                        </div>
                        {/* Text */}
                        <div
                          className={`absolute transform -translate-y-1/2 whitespace-pre-wrap ${
                            isLeft ? 'text-right' : 'text-left'
                          }`}
                          style={{
                            top: `calc(50% - ${(ann.taperHeight || 30) * 0.3}%)`,
                            [isLeft ? 'right' : 'left']: `calc(${(ann.taperTopWidth || 8)}% + ${lineLength}px)`
                          }}
                        >
                          <span className={`text-gray-600 text-sm font-medium ${
                            selectedAnnotation === ann.id ? 'text-gray-800' : ''
                          }`}>{ann.text}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Adding Mode Indicator */}
              {addingType && !isDrawing && (
                <div className="absolute inset-0 bg-gray-500/10 rounded-lg pointer-events-none flex items-center justify-center">
                  <div className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm shadow-lg border border-gray-200">
                    {addingType === 'label' && 'Etiket eklemek için tıklayın'}
                    {addingType === 'area' && 'Basılı tutup sürükleyerek çizin'}
                    {addingType === 'taper' && 'Basılı tutup sürükleyerek çizin'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden Canvas for Export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ProductAnnotationMode;
