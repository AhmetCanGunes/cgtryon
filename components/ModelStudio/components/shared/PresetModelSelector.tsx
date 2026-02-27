import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check, User, Users } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import {
  PresetModel,
  PRESET_MODELS_FEMALE,
  PRESET_MODELS_MALE,
} from '../../../../types';

interface PresetModelSelectorProps {
  selectedModelId: string | null;
  onSelectModel: (model: PresetModel | null) => void;
  gender: 'female' | 'male';
  onGenderChange: (gender: 'female' | 'male') => void;
}

const PresetModelSelector: React.FC<PresetModelSelectorProps> = ({
  selectedModelId,
  onSelectModel,
  gender,
  onGenderChange,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const models = gender === 'female' ? PRESET_MODELS_FEMALE : PRESET_MODELS_MALE;
  const modelsPerPage = 2;
  const totalPages = Math.ceil(models.length / modelsPerPage);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const visibleModels = models.slice(
    currentPage * modelsPerPage,
    (currentPage + 1) * modelsPerPage
  );

  const handleModelSelect = (model: PresetModel) => {
    if (selectedModelId === model.id) {
      onSelectModel(null); // Deselect if already selected
    } else {
      onSelectModel(model);
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400">
          3
        </div>
        <span className="text-sm font-semibold text-white">MODEL SEÇ</span>
      </div>

      {/* Gender Toggle */}
      <div className="space-y-2">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          Model Cinsiyeti
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onGenderChange('female');
              setCurrentPage(0);
              onSelectModel(null);
            }}
            className={cn(
              'py-2.5 px-4 rounded-lg text-sm font-medium transition-all border',
              gender === 'female'
                ? 'bg-white text-gray-900 border-white'
                : 'bg-transparent text-gray-400 border-white/20 hover:border-white/40'
            )}
          >
            Kadın Model
          </button>
          <button
            onClick={() => {
              onGenderChange('male');
              setCurrentPage(0);
              onSelectModel(null);
            }}
            className={cn(
              'py-2.5 px-4 rounded-lg text-sm font-medium transition-all border',
              gender === 'male'
                ? 'bg-white text-gray-900 border-white'
                : 'bg-transparent text-gray-400 border-white/20 hover:border-white/40'
            )}
          >
            Erkek Model
          </button>
        </div>
      </div>

      {/* Model Selection Label */}
      <div className="flex items-center gap-2 mt-4">
        <Users size={14} className="text-gray-400" />
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          Model Seç
        </span>
      </div>

      {/* Model Carousel */}
      <div className="relative">
        {/* Navigation Arrows */}
        {totalPages > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all',
                currentPage === 0
                  ? 'bg-black/20 text-gray-600 cursor-not-allowed'
                  : 'bg-black/60 text-white hover:bg-black/80'
              )}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all',
                currentPage === totalPages - 1
                  ? 'bg-black/20 text-gray-600 cursor-not-allowed'
                  : 'bg-black/60 text-white hover:bg-black/80'
              )}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Models Grid */}
        <div
          ref={scrollContainerRef}
          className="grid grid-cols-2 gap-3 px-2"
        >
          {visibleModels.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model)}
              className={cn(
                'relative rounded-xl overflow-hidden transition-all border-2',
                selectedModelId === model.id
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-white/30'
              )}
            >
              {/* Model Images Grid - 2x2 */}
              <div className="grid grid-cols-2 gap-0.5 aspect-square bg-gray-800">
                {/* Face */}
                <div className="relative overflow-hidden">
                  <img
                    src={model.images.face}
                    alt={`${model.name} - Yüz`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=Face';
                    }}
                  />
                </div>
                {/* Full Body */}
                <div className="relative overflow-hidden">
                  <img
                    src={model.images.fullBody}
                    alt={`${model.name} - Tam Boy`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=Full';
                    }}
                  />
                </div>
                {/* Profile */}
                <div className="relative overflow-hidden">
                  <img
                    src={model.images.profile || model.images.face}
                    alt={`${model.name} - Profil`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=Profile';
                    }}
                  />
                </div>
                {/* Back */}
                <div className="relative overflow-hidden">
                  <img
                    src={model.images.back || model.images.fullBody}
                    alt={`${model.name} - Arka`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=Back';
                    }}
                  />
                </div>
              </div>

              {/* Model Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <span className="text-white text-xs font-medium">{model.name}</span>
              </div>

              {/* Selection Indicator */}
              {selectedModelId === model.id && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  currentPage === index
                    ? 'bg-white w-4'
                    : 'bg-white/30 hover:bg-white/50'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Model Info */}
      {selectedModelId && (
        <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <User size={14} className="text-primary" />
            <span className="text-xs text-gray-300">
              Seçili: <span className="text-white font-medium">
                {models.find(m => m.id === selectedModelId)?.name}
              </span>
            </span>
          </div>
          {models.find(m => m.id === selectedModelId)?.description && (
            <p className="text-[10px] text-gray-500 mt-1">
              {models.find(m => m.id === selectedModelId)?.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PresetModelSelector;
