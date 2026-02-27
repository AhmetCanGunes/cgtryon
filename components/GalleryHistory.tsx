import React, { useState, useEffect } from 'react';
import {
  History,
  Heart,
  Trash2,
  Download,
  Filter,
  Grid,
  List,
  X,
  Maximize2,
  Star,
  Clock,
  Sparkles,
  Shirt,
  Megaphone,
  ScanEye,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Sun,
  Cloud,
  Snowflake,
  Leaf,
  Camera,
  Palette,
  User,
  MapPin,
  Gem,
  Settings2
} from 'lucide-react';
import {
  getUserImageHistory,
  getUserFavorites,
  toggleFavorite,
  deleteImageFromHistory,
  clearUserHistory,
  SavedImage
} from '../services/firebase';
import ConfirmModal from './ConfirmModal';

interface GalleryHistoryProps {
  userId: string;
  onClose: () => void;
}

type ViewMode = 'grid' | 'list';
type TabMode = 'history' | 'favorites';
type FilterType = 'all' | 'studio' | 'try-on' | 'ad-creative' | 'upscale';

// "auto", "Seçiniz", "Otomatik" gibi değerleri kontrol et
const isAutoValue = (value?: string): boolean => {
  if (!value) return true;
  const v = value.toLowerCase();
  return v === 'auto' ||
         v.includes('seçiniz') ||
         v.includes('otomatik') ||
         v === 'default' ||
         v === 'none' ||
         v === '';
};

// "Seçiniz (Otomatik)" gibi uzun değerleri kısalt
const formatAutoValue = (value?: string): string => {
  if (!value) return '';
  if (value.toLowerCase().includes('seçiniz') || value.toLowerCase().includes('otomatik')) {
    return 'Otomatik';
  }
  if (value === 'auto') return 'Otomatik';
  return value;
};

// Settings'ten okunabilir etiketler çıkaran yardımcı fonksiyon
interface SettingsMetadata {
  menu?: string;
  mode?: string;
  background?: string;
  sceneVariation?: string;
  pose?: string;
  season?: string;
  weather?: string;
  shootingType?: string;
  category?: string;
  theme?: string;
  aspectRatio?: string;
}

const extractSettingsMetadata = (settings: any, type: string): SettingsMetadata => {
  if (!settings) return {};

  const metadata: SettingsMetadata = {};

  // Menü/Mod bilgisi
  if (type === 'studio') {
    metadata.menu = 'Model Stüdyosu';
    if (settings.productCategory) {
      metadata.category = settings.productCategory;
    }
    if (settings.clothingType) {
      metadata.mode = settings.clothingType;
    }
  } else if (type === 'try-on') {
    metadata.menu = 'Sanal Kabin';
    if (settings.category) {
      metadata.category = settings.category;
    }
  }

  // Arka plan / Varyasyon / Sahne
  if (settings.background) {
    metadata.background = formatAutoValue(settings.background);
  }
  if (settings.sceneBackground) {
    metadata.background = formatAutoValue(settings.sceneBackground);
  }
  if (settings.scene) {
    metadata.background = formatAutoValue(settings.scene);
  }

  // Sahne Varyasyonu
  if (settings.sceneVariation) {
    metadata.sceneVariation = formatAutoValue(settings.sceneVariation);
  }

  // Tema
  if (settings.theme) {
    metadata.theme = formatAutoValue(settings.theme);
  }

  // Poz
  if (settings.modelPose) {
    metadata.pose = formatAutoValue(settings.modelPose);
  }
  if (settings.pose) {
    metadata.pose = formatAutoValue(settings.pose);
  }

  // Mevsim
  if (settings.season) {
    metadata.season = formatAutoValue(settings.season);
  }

  // Hava durumu
  if (settings.weather) {
    metadata.weather = formatAutoValue(settings.weather);
  }

  // Çekim tipi (Jewelry için)
  if (settings.shootingType) {
    metadata.shootingType = formatAutoValue(settings.shootingType);
  }

  // Aspect ratio
  if (settings.aspectRatio) {
    metadata.aspectRatio = settings.aspectRatio;
  }

  return metadata;
};

// Mevsim ikonu
const getSeasonIcon = (season?: string) => {
  if (!season) return null;
  const s = season.toLowerCase();
  if (s.includes('yaz') || s.includes('summer')) return <Sun size={12} className="text-yellow-500" />;
  if (s.includes('kış') || s.includes('winter')) return <Snowflake size={12} className="text-blue-400" />;
  if (s.includes('sonbahar') || s.includes('autumn') || s.includes('fall')) return <Leaf size={12} className="text-orange-500" />;
  if (s.includes('ilkbahar') || s.includes('spring')) return <Leaf size={12} className="text-green-500" />;
  return <Sun size={12} className="text-gray-400" />;
};

// Hava durumu ikonu
const getWeatherIcon = (weather?: string) => {
  if (!weather) return null;
  const w = weather.toLowerCase();
  if (w.includes('güneşli') || w.includes('sunny') || w.includes('açık')) return <Sun size={12} className="text-yellow-500" />;
  if (w.includes('bulutlu') || w.includes('cloudy') || w.includes('kapalı')) return <Cloud size={12} className="text-gray-400" />;
  if (w.includes('yağmur') || w.includes('rain')) return <Cloud size={12} className="text-blue-400" />;
  if (w.includes('kar') || w.includes('snow')) return <Snowflake size={12} className="text-blue-300" />;
  return null;
};

const GalleryHistory: React.FC<GalleryHistoryProps> = ({ userId, onClose }) => {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [tabMode, setTabMode] = useState<TabMode>('history');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Veri yükleme
  const loadImages = async () => {
    setLoading(true);
    try {
      let result: SavedImage[];
      if (tabMode === 'favorites') {
        result = await getUserFavorites(userId);
      } else {
        const filter = filterType === 'all' ? undefined : filterType;
        result = await getUserImageHistory(userId, 100, filter as any);
      }
      setImages(result);
    } catch (error) {
      console.error('Error loading images:', error);
      showNotification('error', 'Görseller yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [userId, tabMode, filterType]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Favori toggle
  const handleToggleFavorite = async (image: SavedImage, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !image.isFavorite;
    const success = await toggleFavorite(image.id, newStatus);
    if (success) {
      setImages(prev => prev.map(img =>
        img.id === image.id ? { ...img, isFavorite: newStatus } : img
      ));
      // Eğer favoriler sekmesindeyiz ve favoriden çıkarıldıysa listeden kaldır
      if (tabMode === 'favorites' && !newStatus) {
        setImages(prev => prev.filter(img => img.id !== image.id));
      }
      showNotification('success', newStatus ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
    }
  };

  // Görsel silme
  const handleDeleteImage = async (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      show: true,
      title: 'Görseli Sil',
      message: 'Bu görseli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      onConfirm: async () => {
        setConfirmModal(null);
        const success = await deleteImageFromHistory(imageId);
        if (success) {
          setImages(prev => prev.filter(img => img.id !== imageId));
          showNotification('success', 'Görsel silindi');
          if (selectedImage?.id === imageId) {
            setSelectedImage(null);
          }
        } else {
          showNotification('error', 'Görsel silinirken hata oluştu');
        }
      }
    });
  };

  // Tüm geçmişi temizle
  const handleClearHistory = () => {
    setConfirmModal({
      show: true,
      title: 'Tüm Geçmişi Temizle',
      message: 'Tüm görsel geçmişinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz!',
      onConfirm: async () => {
        setConfirmModal(null);
        const success = await clearUserHistory(userId);
        if (success) {
          setImages([]);
          showNotification('success', 'Tüm geçmiş temizlendi');
        } else {
          showNotification('error', 'Geçmiş temizlenirken hata oluştu');
        }
      }
    });
  };

  // Görsel indirme
  const handleDownload = (image: SavedImage, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `cgtryon-${image.type}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', 'Görsel indiriliyor...');
  };

  // Tip ikonları
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'studio': return <Sparkles size={14} className="text-primary" />;
      case 'try-on': return <Shirt size={14} className="text-blue-500" />;
      case 'ad-creative': return <Megaphone size={14} className="text-orange-500" />;
      case 'upscale': return <ScanEye size={14} className="text-green-500" />;
      default: return <Sparkles size={14} className="text-gray-500" />;
    }
  };

  // Tip etiketleri
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'studio': return 'Model Stüdyosu';
      case 'try-on': return 'Sanal Kabin';
      case 'ad-creative': return 'Reklam';
      case 'upscale': return 'Upscale';
      default: return type;
    }
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const filterOptions = [
    { value: 'all', label: 'Tümü', icon: <Grid size={14} /> },
    { value: 'studio', label: 'Model Stüdyosu', icon: <Sparkles size={14} /> },
    { value: 'try-on', label: 'Sanal Kabin', icon: <Shirt size={14} /> },
    { value: 'ad-creative', label: 'Reklam', icon: <Megaphone size={14} /> },
    { value: 'upscale', label: 'Upscale', icon: <ScanEye size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-primary/10 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <History size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Görsel Galerisi</h2>
              <p className="text-xs text-gray-500">{images.length} görsel</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/80 text-gray-500 hover:text-gray-700 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs & Filters */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTabMode('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tabMode === 'history'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Clock size={16} />
              Geçmiş
            </button>
            <button
              onClick={() => setTabMode('favorites')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tabMode === 'favorites'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Heart size={16} />
              Favoriler
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            {tabMode === 'history' && (
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-secondary transition-all"
                >
                  <Filter size={14} />
                  {filterOptions.find(f => f.value === filterType)?.label}
                  <ChevronDown size={14} className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 animate-in fade-in slide-in-from-top-2">
                    {filterOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterType(option.value as FilterType);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${
                          filterType === option.value ? 'text-primary bg-primary/10' : 'text-gray-600'
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Clear History Button */}
            {tabMode === 'history' && images.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              {tabMode === 'favorites' ? (
                <>
                  <Heart size={48} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">Henüz favoriniz yok</p>
                  <p className="text-xs mt-1">Beğendiğiniz görselleri kalp ikonuna tıklayarak favorilere ekleyin</p>
                </>
              ) : (
                <>
                  <History size={48} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">Görsel geçmişiniz boş</p>
                  <p className="text-xs mt-1">Oluşturduğunuz görseller burada görünecek</p>
                </>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map(image => {
                const metadata = extractSettingsMetadata(image.settings, image.type);
                return (
                  <div
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100 border border-gray-200 hover:border-secondary hover:shadow-lg transition-all"
                  >
                    <img
                      src={image.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Top Actions */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={(e) => handleToggleFavorite(image, e)}
                          className={`p-1.5 rounded-lg backdrop-blur-sm transition-all ${
                            image.isFavorite
                              ? 'bg-red-500 text-white'
                              : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          <Heart size={14} fill={image.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-2 text-white/90">
                          {getTypeIcon(image.type)}
                          <span className="text-xs font-medium">{getTypeLabel(image.type)}</span>
                        </div>

                        {/* Settings Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {metadata.theme && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-violet-500/30 backdrop-blur-sm rounded text-[9px] text-white/90">
                              <Palette size={9} />
                              {metadata.theme.length > 15 ? metadata.theme.substring(0, 15) + '...' : metadata.theme}
                            </span>
                          )}
                          {metadata.background && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[9px] text-white/90">
                              <MapPin size={9} />
                              {metadata.background.length > 15 ? metadata.background.substring(0, 15) + '...' : metadata.background}
                            </span>
                          )}
                          {metadata.season && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/30 backdrop-blur-sm rounded text-[9px] text-white/90">
                              {getSeasonIcon(metadata.season)}
                              {metadata.season}
                            </span>
                          )}
                          {metadata.weather && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-sky-500/30 backdrop-blur-sm rounded text-[9px] text-white/90">
                              {getWeatherIcon(metadata.weather)}
                              {metadata.weather}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-white/60 mt-1.5">{formatDate(image.createdAt)}</p>
                      </div>
                    </div>

                    {/* Favorite Badge */}
                    {image.isFavorite && (
                      <div className="absolute top-2 left-2">
                        <Star size={16} className="text-yellow-400 drop-shadow-lg" fill="currentColor" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {images.map(image => {
                const metadata = extractSettingsMetadata(image.settings, image.type);
                return (
                  <div
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                    className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl hover:border-secondary hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={image.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(image.type)}
                        <span className="text-sm font-medium text-gray-900">{getTypeLabel(image.type)}</span>
                        {image.isFavorite && <Star size={14} className="text-yellow-400" fill="currentColor" />}
                      </div>

                      {/* Settings Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {metadata.theme && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 rounded-full text-[10px] text-violet-600">
                            <Palette size={10} />
                            {metadata.theme.length > 18 ? metadata.theme.substring(0, 18) + '...' : metadata.theme}
                          </span>
                        )}
                        {metadata.background && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">
                            <MapPin size={10} className="text-gray-400" />
                            {metadata.background.length > 18 ? metadata.background.substring(0, 18) + '...' : metadata.background}
                          </span>
                        )}
                        {metadata.season && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 rounded-full text-[10px] text-orange-600">
                            {getSeasonIcon(metadata.season)}
                            {metadata.season}
                          </span>
                        )}
                        {metadata.weather && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 rounded-full text-[10px] text-sky-600">
                            {getWeatherIcon(metadata.weather)}
                            {metadata.weather}
                          </span>
                        )}
                        {metadata.pose && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-full text-[10px] text-blue-600">
                            <User size={10} />
                            {metadata.pose.length > 15 ? metadata.pose.substring(0, 15) + '...' : metadata.pose}
                          </span>
                        )}
                        {metadata.shootingType && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 rounded-full text-[10px] text-purple-600">
                            <Camera size={10} />
                            {metadata.shootingType}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-1.5">{formatDate(image.createdAt)}</p>
                      {image.aiModel && (
                        <p className="text-[10px] text-gray-400 mt-0.5">AI: {image.aiModel}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleToggleFavorite(image, e)}
                        className={`p-2 rounded-lg transition-colors ${
                          image.isFavorite
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart size={18} fill={image.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => handleDownload(image, e)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteImage(image.id, e)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Image Detail Modal */}
        {selectedImage && (() => {
          const metadata = extractSettingsMetadata(selectedImage.settings, selectedImage.type);
          const settings = selectedImage.settings || {};
          return (
            <div
              className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in"
              onClick={() => setSelectedImage(null)}
            >
              <div
                className="relative max-w-5xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                onClick={e => e.stopPropagation()}
              >
                {/* Image Section */}
                <div className="relative flex-1 bg-gray-900 flex items-center justify-center min-h-[300px]">
                  <img
                    src={selectedImage.imageUrl}
                    alt=""
                    className="max-h-[70vh] max-w-full object-contain"
                  />

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Info Panel */}
                <div className="w-full md:w-80 bg-white flex flex-col max-h-[70vh] md:max-h-full">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(selectedImage.type)}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{getTypeLabel(selectedImage.type)}</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedImage.createdAt)}</p>
                      </div>
                      {selectedImage.isFavorite && <Star size={16} className="text-yellow-400 ml-auto" fill="currentColor" />}
                    </div>
                  </div>

                  {/* Settings Details */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Settings2 size={12} />
                      Kullanılan Ayarlar
                    </h4>

                    {/* Category - en üstte */}
                    {metadata.category && (
                      <div className="flex items-start gap-3 p-2.5 bg-indigo-50 rounded-lg">
                        <Gem size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-indigo-400 uppercase">Kategori</p>
                          <p className="text-sm text-indigo-700">{metadata.category}</p>
                        </div>
                      </div>
                    )}

                    {/* Theme / Tema */}
                    {metadata.theme && (
                      <div className="flex items-start gap-3 p-2.5 bg-violet-50 rounded-lg">
                        <Palette size={16} className="text-violet-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-violet-400 uppercase">Tema</p>
                          <p className="text-sm text-violet-700">{metadata.theme}</p>
                        </div>
                      </div>
                    )}

                    {/* Background / Varyasyon / Sahne */}
                    {metadata.background && (
                      <div className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg">
                        <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">Varyasyon / Sahne</p>
                          <p className="text-sm text-gray-700">{metadata.background}</p>
                        </div>
                      </div>
                    )}

                    {/* Season */}
                    {metadata.season && (
                      <div className="flex items-start gap-3 p-2.5 bg-orange-50 rounded-lg">
                        <div className="mt-0.5 shrink-0">{getSeasonIcon(metadata.season)}</div>
                        <div>
                          <p className="text-[10px] text-orange-400 uppercase">Mevsim</p>
                          <p className="text-sm text-orange-700">{metadata.season}</p>
                        </div>
                      </div>
                    )}

                    {/* Weather */}
                    {metadata.weather && (
                      <div className="flex items-start gap-3 p-2.5 bg-sky-50 rounded-lg">
                        <div className="mt-0.5 shrink-0">{getWeatherIcon(metadata.weather)}</div>
                        <div>
                          <p className="text-[10px] text-sky-400 uppercase">Hava</p>
                          <p className="text-sm text-sky-700">{metadata.weather}</p>
                        </div>
                      </div>
                    )}

                    {/* Pose */}
                    {metadata.pose && (
                      <div className="flex items-start gap-3 p-2.5 bg-blue-50 rounded-lg">
                        <User size={16} className="text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-blue-400 uppercase">Duruş / Poz</p>
                          <p className="text-sm text-blue-700">{metadata.pose}</p>
                        </div>
                      </div>
                    )}

                    {/* Shooting Type (Jewelry) */}
                    {metadata.shootingType && (
                      <div className="flex items-start gap-3 p-2.5 bg-purple-50 rounded-lg">
                        <Camera size={16} className="text-purple-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-purple-400 uppercase">Çekim Tipi</p>
                          <p className="text-sm text-purple-700">{metadata.shootingType}</p>
                        </div>
                      </div>
                    )}

                    {/* No settings available message */}
                    {!metadata.background && !metadata.pose && !metadata.season && !metadata.weather &&
                     !metadata.shootingType && !metadata.category && !metadata.theme && (
                      <p className="text-xs text-gray-400 text-center py-4">Ayar bilgisi bulunamadı</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleFavorite(selectedImage, e)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedImage.isFavorite
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                      }`}
                    >
                      <Heart size={16} fill={selectedImage.isFavorite ? 'currentColor' : 'none'} />
                      {selectedImage.isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}
                    </button>
                    <button
                      onClick={(e) => handleDownload(selectedImage, e)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
                    >
                      <Download size={16} />
                      İndir
                    </button>
                    <button
                      onClick={(e) => {
                        handleDeleteImage(selectedImage.id, e);
                        setSelectedImage(null);
                      }}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Notification */}
        {notification && (
          <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-bottom-4 ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}

        {/* Confirm Modal */}
        {confirmModal && confirmModal.show && (
          <ConfirmModal
            title={confirmModal.title}
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(null)}
            confirmText="Sil"
            cancelText="İptal"
          />
        )}
      </div>
    </div>
  );
};

export default GalleryHistory;
