import React, { useState, useEffect, useCallback } from 'react';
import { ModelStudioSidebar, StudioPreview } from './components/ModelStudio';
import { DashboardHome } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import DarkModeWrapper from './components/Layout/DarkModeWrapper';
import ImageDisplay from './components/ImageDisplay';
import FullScreenImageViewer from './components/FullScreenImageViewer';
import VirtualTryOnMode from './components/VirtualTryOnMode';
import AdCreativeMode from './components/AdCreativeMode';
import UpscaleMode from './components/UpscaleMode';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import PricingPage from './components/PricingPage';
import Notification, { NotificationType } from './components/Notification';
import ConfirmModal from './components/ConfirmModal';
import { onAuthChange, logoutUser, isAdmin, getUserProfile, useCredits, trackAdminUsage, addCredits, saveMultipleImagesToHistory, getUserDashboardStats, UserDashboardStats, uploadBase64ToStorage } from './services/firebase';
import ProfileEditModal from './components/ProfileEditModal';
import GalleryHistory from './components/GalleryHistory';
import JewelryMode from './components/JewelryMode';
import MensFashionMode from './components/MensFashionMode';
import WomensFashionMode from './components/WomensFashionMode';
import StyleSelectorMode from './components/StyleSelectorMode';
import AdminPanel from './components/AdminPanel';
import ProductAnnotationMode from './components/ProductAnnotationMode';
import PromptArchitectMode from './components/PromptArchitectMode';
import PersonasMode from './components/PersonasMode';
import OzelMode from './components/OzelMode';
import CollectionsMode from './components/CollectionsMode';
import { User } from 'firebase/auth'; 
import { 
  GenerationSettings, 
  GeneratedImage, 
  GENDER_OPTIONS, 
  ETHNICITY_OPTIONS, 
  AGE_OPTIONS, 
  BODY_TYPE_OPTIONS, 
  HAIR_STYLE_OPTIONS, 
  HEIGHT_OPTIONS,
  AD_THEMES, 
  VIEW_ANGLE_OPTIONS, 
  PRODUCT_CATEGORIES,
  PRODUCT_TYPE_OPTIONS, 
  BACKGROUND_OPTIONS_FULL, 
  ASPECT_RATIO_OPTIONS, 
  MODEL_POSE_OPTIONS, 
  NUMBER_OF_IMAGES_OPTIONS, 
  LoadingState, 
  ImageFilterSettings, 
  MODEL_QUALITY_OPTIONS, 
  RESOLUTION_OPTIONS, 
  TryOnSettings,
  AdSettings,
  AdCopy,
  UpscaleSettings,
  getVariedBackgrounds,
  UPSCALE_SHARPNESS,
  UPSCALE_FACTORS,
  AdCreativeResult,
  CollectionResult,
  SEASON_OPTIONS,
  WEATHER_OPTIONS,
  getVariedBoudoirPoses,
  estimateAICost,
  getAIModelDisplayName,
  getRequiredCredits,
  PresetModel
} from './types';
import { generateModelImage, generateVirtualTryOn, generateAdCreative, generateCollectionImage, upscaleImage } from './services/geminiService';
import { RefreshCw, ScanEye } from 'lucide-react'; 

const DEFAULT_FILTER_SETTINGS: ImageFilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

type ViewState = 'home' | 'studio' | 'try-on' | 'ad-creative' | 'jewelry' | 'mens-fashion' | 'womens-fashion' | 'style-selector' | 'product-annotation' | 'prompt-architect' | 'personas' | 'ozel' | 'collections';

// View → data-mode mapping for CSS variable based accent colors
const VIEW_MODE_MAP: Record<string, string> = {
  'mens-fashion': 'mens',
  'womens-fashion': 'womens',
  'ad-creative': 'ad',
  'prompt-architect': 'prompt',
  'jewelry': 'jewelry',
  'studio': 'studio',
  'try-on': 'studio',
  'style-selector': 'studio',
  'product-annotation': 'studio',
  'ozel': 'studio',
  'personas': 'studio',
  'home': 'studio',
  'collections': 'studio',
};

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [startWithRegister, setStartWithRegister] = useState<boolean>(true);

  // Current view state - localStorage'dan yükle
  const [currentView, setCurrentViewState] = useState<ViewState>(() => {
    const saved = localStorage.getItem('currentView');
    return (saved as ViewState) || 'home';
  });

  // currentView değiştiğinde localStorage'a kaydet
  const setCurrentView = (view: ViewState) => {
    setCurrentViewState(view);
    localStorage.setItem('currentView', view);
  };

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanelState] = useState(false);

  // Admin panel state'ini localStorage ile senkronize et
  const setShowAdminPanel = (value: boolean) => {
    setShowAdminPanelState(value);
    if (value) {
      localStorage.setItem('showAdminPanel', 'true');
    } else {
      localStorage.removeItem('showAdminPanel');
    }
  };

  // Sayfa yüklendiğinde admin panel state'ini kontrol et
  useEffect(() => {
    const savedAdminPanel = localStorage.getItem('showAdminPanel') === 'true';
    if (savedAdminPanel && currentUser && isAdmin(currentUser.email)) {
      setShowAdminPanelState(true);
    } else {
      localStorage.removeItem('showAdminPanel');
    }
  }, [currentUser]);

  // Kullanıcı kredisi ve profil
  const [userCredits, setUserCredits] = useState<number>(0);
  const [userName, setUserName] = useState<string>('');
  const [userAvatarId, setUserAvatarId] = useState<string>('blue');
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Sidebar collapsed state - localStorage'dan yükle
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const setSidebarCollapsed = (value: boolean) => {
    setSidebarCollapsedState(value);
    localStorage.setItem('sidebarCollapsed', value.toString());
  };

  // Sub mode state (Erkek/Kadın kategorileri için) - localStorage'dan yükle
  type ProductionMode = 'standard' | 'referenced' | 'referenced2';
  const [selectedSubMode, setSelectedSubModeState] = useState<ProductionMode>(() => {
    const saved = localStorage.getItem('selectedSubMode');
    return (saved as ProductionMode) || 'standard';
  });

  const setSelectedSubMode = (mode: ProductionMode) => {
    setSelectedSubModeState(mode);
    localStorage.setItem('selectedSubMode', mode);
  };

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState<UserDashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: NotificationType;
    title: string;
    message: string;
  } | null>(null);

  const showNotification = (type: NotificationType, title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [productImage, setProductImage] = useState<File | null>(null);
  const [selectedPresetModel, setSelectedPresetModel] = useState<PresetModel | null>(null);

  // Default Category and SubCategory
  const defaultCategory = Object.keys(PRODUCT_CATEGORIES)[0];
  const defaultSubCategory = PRODUCT_CATEGORIES[defaultCategory][0];

  const defaultSettings: GenerationSettings = {
    productCategory: defaultCategory,
    clothingType: defaultSubCategory,
    framing: 'Tam Boy (Ayaktan başa kadar)',
    targetPose: 'Önden (Front)',
    enableBoudoir: false,
    sceneCategory: undefined,
    professionalStudioStyle: undefined,
    womenClothingStyle: undefined,
    gender: GENDER_OPTIONS[0], 
    ethnicity: ETHNICITY_OPTIONS[0], 
    age: AGE_OPTIONS[0], 
    bodyType: BODY_TYPE_OPTIONS[0], 
    hairStyle: HAIR_STYLE_OPTIONS[0], 
    hairLength: 'Orta',
    height: HEIGHT_OPTIONS[0], 
    viewAngle: VIEW_ANGLE_OPTIONS[0], 
    background: BACKGROUND_OPTIONS_FULL[0].value, 
    modelPose: MODEL_POSE_OPTIONS[0], 
    customPrompt: '',
    aspectRatio: ASPECT_RATIO_OPTIONS[0], 
    numberOfImages: parseInt(NUMBER_OF_IMAGES_OPTIONS[0]), 
    modelQuality: 'Pro (Nano Banana - Yüksek Kalite)', 
    resolution: 'Yüksek (2K) - 1 Kredi',
    season: SEASON_OPTIONS[0],
    weather: WEATHER_OPTIONS[0],
    enableWetLook: false,
    theme: AD_THEMES[0],
    sceneVariation: 'auto',
    accessoryBackgroundStyle: undefined,
    accessoryPose: undefined,
    accessoryLighting: undefined,
    walletPoseWithModel: undefined,
    walletSceneProductOnly: undefined,
    walletLighting: undefined,
    bagPoseWithModel: undefined,
    bagSceneProductOnly: undefined,
    bagLighting: undefined,
    watchPoseWithModel: undefined,
    watchSceneProductOnly: undefined,
    watchLighting: undefined,
    earringsPoseWithModel: undefined,
    earringsSceneProductOnly: undefined,
    earringsLighting: undefined,
    necklacePoseWithModel: undefined,
    necklaceSceneProductOnly: undefined,
    necklaceLighting: undefined,
    braceletPoseWithModel: undefined,
    braceletSceneProductOnly: undefined,
    braceletLighting: undefined,
    ringPoseWithModel: undefined,
    ringSceneProductOnly: undefined,
    ringLighting: undefined,
    hatPoseWithModel: undefined,
    hatSceneProductOnly: undefined,
    hatLighting: undefined,
    shoesPoseWithModel: undefined,
    shoesSceneProductOnly: undefined,
    shoesLighting: undefined,
    sunglassesPoseWithModel: undefined,
    sunglassesSceneProductOnly: undefined,
    sunglassesLighting: undefined,
    isProductPhotography: false
  };
  const [settings, setSettings] = useState<GenerationSettings>(defaultSettings);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [tryOnResults, setTryOnResults] = useState<GeneratedImage[]>([]);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<LoadingState>(LoadingState.IDLE); 
  const [showFullScreenModal, setShowFullScreenModal] = useState<boolean>(false);
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);
  const [imageFilterSettings, setImageFilterSettings] = useState<ImageFilterSettings>(DEFAULT_FILTER_SETTINGS);

  const SETTINGS_STORAGE_KEY = 'modaAIStudioSettings';

  useEffect(() => {
    // Auth state listener
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        console.log('User logged in:', user.email);
        // Kullanıcı giriş yapmışsa landing page'i atla
        setShowLanding(false);

        // Kullanıcı girişinde her zaman Dashboard'a yönlendir
        setCurrentView('home');

        // Kullanıcı profilini çek
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserCredits(profile.credits);
          setUserName(profile.displayName || '');
          setUserAvatarId(profile.avatarId || 'blue');
        }

        // Dashboard istatistiklerini çek
        loadDashboardStats(user.uid);
      } else {
        console.log('No user logged in');
        setUserCredits(0);
        setDashboardStats(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Dashboard istatistiklerini yükle
  const loadDashboardStats = async (uid: string) => {
    setDashboardLoading(true);
    try {
      const stats = await getUserDashboardStats(uid);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Dashboard istatistiklerini yenile (üretim sonrası)
  const refreshDashboardStats = useCallback(() => {
    if (currentUser) {
      loadDashboardStats(currentUser.uid);
    }
  }, [currentUser]);

  useEffect(() => {
    const checkKey = async () => {
        const aistudio = (window as any).aistudio;
        if (aistudio && aistudio.hasSelectedApiKey) {
            const hasKey = await aistudio.hasSelectedApiKey();
            setHasApiKey(hasKey);
        } else {
            setHasApiKey(true);
        }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
        await aistudio.openSelectKey();
        setHasApiKey(true);
        setShowLanding(false);
    } else {
        showNotification('error', 'Hata', 'API Anahtar seçici yüklenemedi. Lütfen sayfayı yenileyin.');
    }
  };

  const handleGetStarted = async () => {
    // Landing'den gelen kullanıcı auth sayfasına yönlendirilir (Kayıt ol)
    setStartWithRegister(true);
    setShowLanding(false);
  };

  const handleLogin = async () => {
    // Landing'den gelen kullanıcı auth sayfasına yönlendirilir (Giriş yap)
    setStartWithRegister(false);
    setShowLanding(false);
  };

  const handleAuthSuccess = async () => {
    // Giriş başarılı, direkt stüdyoya git
    if (!hasApiKey) {
      await handleSelectKey();
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserName('');
    setUserAvatarId('blue');
    setUserCredits(0);
    setShowLanding(true);
  };

  // Centralized credit deduction handler for child components
  // Creates a mode-specific callback that child components call with just (credits)
  const createCreditsHandler = (modeType: string) => async (credits: number) => {
    if (!currentUser) return;
    const isUserAdmin_ = isAdmin(currentUser.email);
    const aiModel = 'gemini-3-pro-image-preview';
    const cost = estimateAICost(aiModel, credits);
    const details = `${modeType}: ${credits} görsel`;

    try {
      if (isUserAdmin_) {
        await trackAdminUsage(currentUser.uid, modeType, details, aiModel, cost);
      } else {
        await useCredits(currentUser.uid, credits, modeType, details, aiModel, cost);
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setUserCredits(profile.credits);
        }
      }
    } catch (error) {
      console.error('Error deducting credits:', error);
      if (!isUserAdmin_) {
        setUserCredits(prev => prev - credits);
      }
    }
  };

  const handleSelectPackage = async (packageId: string) => {
    if (!currentUser) return;

    // Find selected package
    const { CREDIT_PACKAGES } = await import('./types');
    const selectedPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    
    if (!selectedPackage) {
      showNotification('error', 'Hata', 'Paket bulunamadı!');
      return;
    }

    // Show confirm modal
    setConfirmModal({
      show: true,
      title: 'Paketi Satın Al',
      message: `${selectedPackage.name} paketini satın almak istediğinize emin misiniz?\n\nFiyat: ₺${selectedPackage.price}\nKredi: ${selectedPackage.credits}\n\nDemo modda kredi otomatik eklenecektir.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          // Add credits to user account
          await addCredits(currentUser.uid, selectedPackage.credits);
          
          // Refresh user credits
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setUserCredits(profile.credits);
          }

          showNotification('success', 'Başarılı!', `${selectedPackage.credits} kredi hesabınıza eklendi.`);
          setShowPricing(false);
        } catch (error) {
          console.error('Error purchasing package:', error);
          showNotification('error', 'Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }
    });
  };

  const handleApiError = async (error: any) => {
    console.error("API Operation Failed", error);
    
    const isQuotaError = error.message?.includes('429') || 
                         error.message?.includes('Kota') || 
                         error.message?.includes('quota') ||
                         error.message?.includes('RESOURCE_EXHAUSTED');

    if (isQuotaError) {
        setConfirmModal({
          show: true,
          title: '⚠️ API Kota Sınırı Aşıldı',
          message: 'Seçili API anahtarınızın kullanım limiti doldu veya ücretsiz plandasınız.\n\nYeni bir API anahtarı seçmek veya faturalandırma hesabı (Billing) bağlı bir projeye geçmek ister misiniz?',
          onConfirm: async () => {
            setConfirmModal(null);
            await handleSelectKey();
          }
        });
    } else {
        showNotification('error', 'İşlem Hatası', error.message || 'Bilinmeyen bir hata oluştu');
    }
 };


  const saveSettingsToLocalStorage = useCallback(() => {
    try {
      // Don't save any settings to localStorage
      // All settings will reset to defaults on page refresh
      console.log("Settings not saved - will reset on refresh");
    } catch (error) {
      console.error("Failed to save settings to local storage:", error);
    }
  }, [settings]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        saveSettingsToLocalStorage();
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [settings, saveSettingsToLocalStorage]);

  const loadSettingsFromLocalStorage = useCallback(() => {
    try {
      // Don't load any settings from localStorage - always start fresh with defaults
      // This ensures all dropdowns reset to their default values on page refresh
      console.log("Settings reset to defaults on page load");
    } catch (error) {
      console.error("Failed to load settings from local storage:", error);
    }
  }, [defaultCategory]); 

  useEffect(() => {
    loadSettingsFromLocalStorage();
  }, [loadSettingsFromLocalStorage]);

  const handleStudioGenerate = async () => {
    if (!productImage) {
      showNotification('warning', 'Uyarı', 'Lütfen bir ürün görseli yükleyin.');
      return;
    }

    // Skip scene category check if Boudoir mode is enabled (it has its own background/pose system)
    const isBoudoirMode = settings.enableBoudoir || settings.enableBoudoirMode;
    
    // Debug log
    console.log('🔍 Boudoir Check:', {
      enableBoudoir: settings.enableBoudoir,
      enableBoudoirMode: settings.enableBoudoirMode,
      isBoudoirMode,
      boudoirCategory: settings.boudoirCategory,
      modelPose: settings.modelPose,
      boudoirLighting: settings.boudoirLighting,
      boudoirCameraAngle: settings.boudoirCameraAngle
    });
    
    if (isBoudoirMode) {
      // Check if Boudoir settings are properly configured
      if (!settings.boudoirCategory || settings.boudoirCategory === '' || settings.boudoirCategory === 'Lütfen Seçiniz') {
        console.log('❌ Boudoir Category Check Failed:', settings.boudoirCategory);
        showNotification('warning', 'Çekim Ortamı Seçilmedi', 'Boudoir modu aktif. Lütfen "Çekim Ortamı" seçin (Yatak, Duş, Ayakta veya Oturarak).');
        return;
      }
      
      // Check if pose is selected
      if (!settings.modelPose || settings.modelPose === 'Seçiniz (Otomatik)' || settings.modelPose === 'Lütfen Seçiniz') {
        console.log('❌ Boudoir Pose Check Failed:', settings.modelPose);
        showNotification('warning', 'Özel Poz Seçilmedi', 'Lütfen çekim ortamına uygun bir "Özel Poz" seçin.');
        return;
      }
      
      console.log('✅ Boudoir checks passed! Generating with Boudoir settings...');
    }
    
    // Mekan & Konsept system removed - now using Branded AI modular system
    console.log('ℹ️ Using Branded AI modular system or default settings for generation');

    // Admin sınırsız üretim yapabilir
    const isUserAdmin = isAdmin(currentUser?.email);
    
    const loopCount = settings.numberOfImages;
    
    // Determine AI model being used
    const useProModel = settings.modelQuality.includes('Pro') || settings.modelQuality.includes('Nano');
    const aiModelKey = useProModel ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const aiModelName = getAIModelDisplayName(aiModelKey);
    const estimatedCost = estimateAICost(aiModelKey, loopCount);
    
    // Calculate required credits based on resolution
    // 1K/2K = 1 kredi, 4K = 2 kredi
    const requiredCredits = getRequiredCredits(aiModelKey, loopCount, settings.resolution);

    // Kredi kontrolü - yetersiz kredi varsa satın alma sayfasına yönlendir
    if (!isUserAdmin && userCredits < requiredCredits) {
      showNotification('error', 'Yetersiz Kredi', `Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
      setShowPricing(true);
      return;
    }

    setIsGenerating(true);
    setCurrentTask(LoadingState.GENERATING_MODEL);

    const generatedImageUrls: GeneratedImage[] = [];

    const isAutoBackground = settings.background === 'auto' || settings.background.includes('Seçiniz');
    const backgroundVariations = isAutoBackground ? getVariedBackgrounds(settings.clothingType, settings.enableBoudoirMode, settings.boudoirCategory) : [];
    
    const isBoudoirAutoPose = settings.enableBoudoirMode && (settings.modelPose.includes('Seçiniz') || settings.modelPose.includes('Otomatik'));
    const boudoirVariations = isBoudoirAutoPose ? getVariedBoudoirPoses(settings.boudoirCategory) : [];
    
    // Her görsel için kullanılan ayarları saklamak için
    const usedSettingsPerImage: GenerationSettings[] = [];

    try {
        for (let i = 0; i < loopCount; i++) {
            const currentIterationSettings = { ...settings };

            if (isAutoBackground && backgroundVariations.length > 0) {
                currentIterationSettings.background = backgroundVariations[i % backgroundVariations.length];
            }

            if (isBoudoirAutoPose && boudoirVariations.length > 0) {
                 currentIterationSettings.modelPose = boudoirVariations[i % boudoirVariations.length];
            }

            const resultBase64 = await generateModelImage(
                productImage,
                currentIterationSettings
            );

            // Kullanılan ayarları sakla
            usedSettingsPerImage.push({ ...currentIterationSettings });

            generatedImageUrls.push({
                id: `${Date.now()}-${i}`,
                url: resultBase64,
                prompt: `Image ${i+1}/${loopCount}`,
                timestamp: Date.now(),
                mimeType: 'image/jpeg',
            });
        }

        setGeneratedImages(prev => {
          setCurrentIndex(prev.length + generatedImageUrls.length - 1);
          return [...prev, ...generatedImageUrls];
        });
        setImageFilterSettings(DEFAULT_FILTER_SETTINGS);
        
        // Track usage with AI model info
        if (currentUser) {
          try {
            if (isUserAdmin) {
              // Admin için sadece kullanım geçmişi kaydet (kredi düşürme)
              await trackAdminUsage(
                currentUser.uid,
                'studio',
                `Model Stüdyosu: ${settings.clothingType} (${loopCount} görsel)`,
                aiModelName,
                estimatedCost
              );
            } else {
              // Normal kullanıcı için kredi düş ve kaydet
              await useCredits(
                currentUser.uid,
                requiredCredits, // Flash = 1*count, Pro = 10*count
                'studio',
                `Model Stüdyosu: ${settings.clothingType} (${loopCount} görsel)`,
                aiModelName,
                estimatedCost
              );
              // Refresh user credits
              const profile = await getUserProfile(currentUser.uid);
              if (profile) {
                setUserCredits(profile.credits);
              }
            }

            // Görselleri önce Storage'a yükle, sonra URL'leri kaydet
            // Her görsel için gerçekte kullanılan ayarları kaydet (auto değil, seçilen değer)
            const uploadedImages = await Promise.all(
              generatedImageUrls.map(async (img, index) => {
                try {
                  const storageUrl = await uploadBase64ToStorage(img.url, currentUser.uid, 'studio');
                  const actualSettings = usedSettingsPerImage[index] || settings;
                  return {
                    imageUrl: storageUrl,
                    type: 'studio' as const,
                    settings: actualSettings,
                    prompt: `Model Stüdyosu: ${actualSettings.clothingType}`,
                    aiModel: aiModelName
                  };
                } catch (uploadError) {
                  console.error('Storage upload failed, skipping save:', uploadError);
                  return null;
                }
              })
            );

            // Başarılı yüklemeleri filtrele ve kaydet
            const successfulUploads = uploadedImages.filter(img => img !== null);
            if (successfulUploads.length > 0) {
              await saveMultipleImagesToHistory(currentUser.uid, successfulUploads);
            }
          } catch (error) {
            console.error('Error tracking usage:', error);
          }
        }

    } catch (error: any) {
        await handleApiError(error);
    } finally {
        setIsGenerating(false);
        setCurrentTask(LoadingState.IDLE);
        // Dashboard istatistiklerini yenile
        refreshDashboardStats();
    }
  };

  const handleTryOnGenerate = async (model: File, garment: File, garment2: File | null, garment3: File | null, settings: TryOnSettings, additionalGarments?: File[]) => {
    const isUserAdmin = isAdmin(currentUser?.email);
    
    const loopCount = settings.numberOfImages || 1;
    
    const useProModel = settings.modelQuality.includes('Pro') || settings.modelQuality.includes('Nano');
    const aiModelKey = useProModel ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const aiModelName = useProModel ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const estimatedCost = estimateAICost(aiModelName, loopCount);
    
    // Calculate required credits based on resolution
    const requiredCredits = getRequiredCredits(aiModelKey, loopCount, settings.resolution);

    // Kredi kontrolü - yetersiz kredi varsa satın alma sayfasına yönlendir
    if (!isUserAdmin && userCredits < requiredCredits) {
      showNotification('error', 'Yetersiz Kredi', `Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
      setShowPricing(true);
      return;
    }

    setIsGenerating(true);
    setCurrentTask(LoadingState.GENERATING_TRYON);

    setTryOnResults([]);

    const isAutoBackground = settings.background === 'auto' || settings.background.includes('Seçiniz');
    const backgroundVariations = isAutoBackground ? getVariedBackgrounds(settings.category) : [];

    // Her görsel için kullanılan ayarları sakla
    const generatedTryOnImages: GeneratedImage[] = [];
    const usedTryOnSettings: TryOnSettings[] = [];

    try {
        for (let i = 0; i < loopCount; i++) {
             const currentSettings = { ...settings };

             if (isAutoBackground && backgroundVariations.length > 0) {
                currentSettings.background = backgroundVariations[i % backgroundVariations.length];
             }

             const resultBase64 = await generateVirtualTryOn(model, garment, garment2, garment3, currentSettings, additionalGarments);

             const newImage: GeneratedImage = {
                id: `tryon-${Date.now()}-${i}`,
                url: resultBase64,
                prompt: `TryOn: ${currentSettings.category} (Image ${i+1})`,
                timestamp: Date.now(),
                mimeType: 'image/png'
             };

             generatedTryOnImages.push(newImage);
             usedTryOnSettings.push({ ...currentSettings });
             setTryOnResults(prev => [...prev, newImage]);
        }

        // Track usage
        if (currentUser) {
          try {
            if (isUserAdmin) {
              await trackAdminUsage(
                currentUser.uid,
                'try-on',
                `Sanal Kabin: ${settings.category} (${loopCount} görsel)`,
                aiModelName,
                estimatedCost
              );
            } else {
              await useCredits(
                currentUser.uid,
                requiredCredits,
                'try-on',
                `Sanal Kabin: ${settings.category} (${loopCount} görsel)`,
                aiModelName,
                estimatedCost
              );
              const profile = await getUserProfile(currentUser.uid);
              if (profile) {
                setUserCredits(profile.credits);
              }
            }

            // Görsel geçmişine kaydet - her görsel için gerçekte kullanılan ayarları kaydet
            if (generatedTryOnImages.length > 0) {
              await saveMultipleImagesToHistory(
                currentUser.uid,
                generatedTryOnImages.map((img, index) => ({
                  imageUrl: img.url,
                  type: 'try-on' as const,
                  settings: usedTryOnSettings[index] || settings,
                  prompt: `Sanal Kabin: ${usedTryOnSettings[index]?.category || settings.category}`,
                  aiModel: aiModelName
                }))
              );
            }
          } catch (error) {
            console.error('Error tracking usage:', error);
            showNotification('error', 'Kullanım Takip Hatası', 'Kullanım geçmişi kaydedilemedi.');
          }
        }

    } catch (error: any) {
        await handleApiError(error);
    } finally {
        setIsGenerating(false);
        setCurrentTask(LoadingState.IDLE);
        refreshDashboardStats();
    }
  };

  const handleAdGenerate = async (image: File, adSettings: AdSettings): Promise<AdCreativeResult[]> => {
     const isUserAdmin = isAdmin(currentUser?.email);
     
     const loopCount = adSettings.numberOfImages || 1;
     const useProModel = adSettings.modelQuality.includes('Pro') || adSettings.modelQuality.includes('Nano');
     const aiModelKey = useProModel ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
     const aiModelName = useProModel ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
     const estimatedCost = estimateAICost(aiModelName, loopCount);
     
     // Calculate required credits (Ad Creative varsayılan 1K = 1 kredi)
     const requiredCredits = getRequiredCredits(aiModelKey, loopCount, '1K');

     // Kredi kontrolü - yetersiz kredi varsa satın alma sayfasına yönlendir
     if (!isUserAdmin && userCredits < requiredCredits) {
       showNotification('error', 'Yetersiz Kredi', `Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
       setShowPricing(true);
       throw new Error("Yetersiz kredi");
     }

     setIsGenerating(true);
     setCurrentTask(LoadingState.GENERATING_AD);

     try {
        const results = await generateAdCreative(image, adSettings);
        
        // Track usage
        if (currentUser) {
          try {
            if (isUserAdmin) {
              await trackAdminUsage(
                currentUser.uid,
                'ad-creative',
                `Reklam Kreatifi: ${adSettings.platform} (${loopCount} görsel)`,
                aiModelName,
                estimatedCost
              );
            } else {
              await useCredits(
                currentUser.uid,
                requiredCredits,
                'ad-creative',
                `Reklam Kreatifi: ${adSettings.platform} (${loopCount} görsel)`,
                aiModelName,
                estimatedCost
              );
              const profile = await getUserProfile(currentUser.uid);
              if (profile) {
                setUserCredits(profile.credits);
              }
            }

            // Görsel geçmişine kaydet (ad-creative sonuçlarını kaydet)
            if (results && results.length > 0) {
              await saveMultipleImagesToHistory(
                currentUser.uid,
                results.map(res => ({
                  imageUrl: res.imageUrl,
                  type: 'ad-creative' as const,
                  settings: adSettings,
                  prompt: `Reklam Kreatifi: ${adSettings.platform}`,
                  aiModel: aiModelName
                }))
              );
            }
          } catch (error) {
            console.error('Error tracking usage:', error);
          }
        }

        return results;
     } catch (error: any) {
        await handleApiError(error);
        throw error;
     } finally {
         setIsGenerating(false);
         setCurrentTask(LoadingState.IDLE);
         refreshDashboardStats();
     }
  };

  const handleCollectionGenerate = async (
    productImages: File[],
    modelImage: File,
    sceneImage: File,
    customPrompt: string,
    numberOfImages: number
  ): Promise<CollectionResult[]> => {
     const isUserAdmin = isAdmin(currentUser?.email);

     const loopCount = numberOfImages || 1;
     const aiModelName = 'gemini-3-pro-image-preview';
     const estimatedCost = estimateAICost(aiModelName, loopCount);
     const requiredCredits = getRequiredCredits(aiModelName, loopCount, '1K');

     if (!isUserAdmin && userCredits < requiredCredits) {
       showNotification('error', 'Yetersiz Kredi', `Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
       setShowPricing(true);
       throw new Error("Yetersiz kredi");
     }

     setIsGenerating(true);
     setCurrentTask(LoadingState.GENERATING_AD);

     try {
        const results = await generateCollectionImage(productImages, modelImage, sceneImage, customPrompt, numberOfImages);

        if (currentUser) {
          try {
            if (isUserAdmin) {
              await trackAdminUsage(
                currentUser.uid,
                'collection',
                `Koleksiyon: ${loopCount} görsel`,
                aiModelName,
                estimatedCost
              );
            } else {
              await useCredits(
                currentUser.uid,
                requiredCredits,
                'collection',
                `Koleksiyon: ${loopCount} görsel`,
                aiModelName,
                estimatedCost
              );
              const profile = await getUserProfile(currentUser.uid);
              if (profile) {
                setUserCredits(profile.credits);
              }
            }

            if (results && results.length > 0) {
              await saveMultipleImagesToHistory(
                currentUser.uid,
                results.map(res => ({
                  imageUrl: res.imageUrl,
                  type: 'ad-creative' as const,
                  settings: { customPrompt, numberOfImages },
                  prompt: `Koleksiyon: ${loopCount} görsel`,
                  aiModel: aiModelName
                }))
              );
            }
          } catch (error) {
            console.error('Error tracking usage:', error);
          }
        }

        return results;
     } catch (error: any) {
        await handleApiError(error);
        throw error;
     } finally {
         setIsGenerating(false);
         setCurrentTask(LoadingState.IDLE);
         refreshDashboardStats();
     }
  };

  const handleUpscaleGenerate = async (image: File, upscaleSettings: UpscaleSettings): Promise<string> => {
     const isUserAdmin = isAdmin(currentUser?.email);
     
     const loopCount = upscaleSettings.numberOfImages || 1;
     const aiModelKey = 'gemini-2.5-flash-image'; // Upscale always uses Flash
     const aiModelName = 'gemini-2.5-flash-image';
     const estimatedCost = estimateAICost(aiModelName, loopCount);
     
     // Upscale: 4x = 4K (2 kredi), diğerleri = 2K (1 kredi)
     const upscaleResolution = upscaleSettings.factor === '4x' ? '4K' : '2K';
     const requiredCredits = getRequiredCredits(aiModelKey, loopCount, upscaleResolution);

     // Kredi kontrolü - yetersiz kredi varsa satın alma sayfasına yönlendir
     if (!isUserAdmin && userCredits < requiredCredits) {
       showNotification('error', 'Yetersiz Kredi', `Bu işlem için ${requiredCredits} kredi gerekiyor. Kredi satın alın.`);
       setShowPricing(true);
       throw new Error("Yetersiz kredi");
     }

     setIsGenerating(true);
     setCurrentTask(LoadingState.UPSCALING);

     try {
         const result = await upscaleImage(image, upscaleSettings);
         
         // Track usage
         if (currentUser) {
           try {
             if (isUserAdmin) {
               await trackAdminUsage(
                 currentUser.uid,
                 'upscale',
                 `Upscale: ${upscaleSettings.factor} (${loopCount} görsel)`,
                 aiModelName,
                 estimatedCost
               );
             } else {
               await useCredits(
                 currentUser.uid,
                 requiredCredits,
                 'upscale',
                 `Upscale: ${upscaleSettings.factor} (${loopCount} görsel)`,
                 aiModelName,
                 estimatedCost
               );
               const profile = await getUserProfile(currentUser.uid);
               if (profile) {
                 setUserCredits(profile.credits);
               }
             }

             // Görsel geçmişine kaydet (upscale sonucunu kaydet)
             if (result) {
               await saveMultipleImagesToHistory(
                 currentUser.uid,
                 [{
                   imageUrl: result,
                   type: 'upscale' as const,
                   settings: upscaleSettings,
                   prompt: `Upscale: ${upscaleSettings.factor}`,
                   aiModel: aiModelName
                 }]
               );
             }
           } catch (error) {
             console.error('Error tracking usage:', error);
           }
         }

         return result;
     } catch (error: any) {
         await handleApiError(error);
         throw error;
     } finally {
         setIsGenerating(false);
         setCurrentTask(LoadingState.IDLE);
         refreshDashboardStats();
     }
  };


  const handleNext = () => {
    if (currentIndex < generatedImages.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setImageFilterSettings(DEFAULT_FILTER_SETTINGS); 
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setImageFilterSettings(DEFAULT_FILTER_SETTINGS); 
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setImageFilterSettings(DEFAULT_FILTER_SETTINGS); 
  };

  const handleMaximizeImage = (imageUrl: string) => {
    setFullScreenImageUrl(imageUrl);
    setShowFullScreenModal(true);
  };

  const handleCloseFullScreenModal = () => {
    setShowFullScreenModal(false);
    setFullScreenImageUrl(null);
  };

  const handleFilterChange = (newSettings: ImageFilterSettings) => {
    setImageFilterSettings(newSettings);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border-dark border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />;
  }

  // Kullanıcı giriş yapmamışsa auth sayfasını göster
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} startWithRegister={startWithRegister} />;
  }

  if (!hasApiKey) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-slate-200 dark:border-border-dark p-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center neon-glow mb-6">
                    <span className="material-icons-round text-background-dark text-3xl">auto_awesome</span>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">CGTRYON Studio</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-sm">
                    Gelişmiş AI modellerini (Gemini 2.5 Flash & 3.0 Pro) kullanmak için lütfen faturalandırma hesabı bağlı bir API anahtarı seçin.
                </p>

                <button
                    onClick={handleSelectKey}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-primary text-background-dark hover:opacity-90 hover:scale-[1.02] transition-all duration-300 mb-6"
                >
                    <span className="material-icons-round text-lg">key</span>
                    <span>API Anahtarı Seç / Bağla</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors">
                    <span className="material-icons-round text-sm">open_in_new</span>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                        Faturalandırma (Billing) Hakkında Bilgi
                    </a>
                </div>
            </div>
        </div>
    );
  }

  // Admin Panel
  if (showAdminPanel && currentUser && isAdmin(currentUser.email)) {
    return (
      <AdminPanel
        currentUser={currentUser}
        onBack={() => setShowAdminPanel(false)}
        onStudioGenerate={handleStudioGenerate}
        onTryOnGenerate={handleTryOnGenerate}
        onAdGenerate={handleAdGenerate}
        onUpscaleGenerate={handleUpscaleGenerate}
        productImage={productImage}
        setProductImage={setProductImage}
        settings={settings}
        setSettings={setSettings}
        generatedImages={generatedImages}
        tryOnResults={tryOnResults}
        isGenerating={isGenerating}
        currentTask={currentTask}
      />
    );
  }

  return (
    <div data-mode={VIEW_MODE_MAP[currentView] || 'studio'} className="flex h-screen w-screen max-w-full bg-background-dark text-slate-100 overflow-hidden animate-in fade-in duration-500 font-sans">

      {/* LEFT SIDEBAR - Desktop Only */}
      {currentUser && (
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onUpgrade={() => setShowPricing(true)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedSubMode={selectedSubMode}
          onSubModeChange={setSelectedSubMode}
          userEmail={currentUser.email || ''}
          userName={userName}
          userAvatarId={userAvatarId}
          userCredits={userCredits}
          isAdmin={isAdmin(currentUser.email)}
          onBuyCredits={() => setShowPricing(true)}
          onOpenGallery={() => setShowGallery(true)}
          onOpenAdminPanel={() => setShowAdminPanel(true)}
          onEditProfile={() => setShowProfileModal(true)}
          onLogout={async () => {
            await logoutUser();
            handleLogout();
          }}
        />
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex overflow-hidden relative bg-background-dark grid-bg">
          {currentView === 'home' ? (
              <DashboardHome
                userCredits={userCredits}
                stats={dashboardStats}
                isLoading={dashboardLoading}
                onViewHistory={() => setShowGallery(true)}
              />
          ) : currentView === 'studio' ? (
              <DarkModeWrapper>
                <ModelStudioSidebar
                  productImage={productImage}
                  settings={settings}
                  onProductImageUpload={setProductImage}
                  onRemoveProductImage={() => setProductImage(null)}
                  onSettingsChange={setSettings}
                  onGenerate={handleStudioGenerate}
                  isGenerating={isGenerating}
                  currentTask={currentTask}
                  onSaveSettings={saveSettingsToLocalStorage}
                  generatedImages={generatedImages}
                  selectedPresetModel={selectedPresetModel}
                  onPresetModelSelect={setSelectedPresetModel}
                />
                <StudioPreview
                  productImage={productImage}
                  generatedImages={generatedImages}
                  currentIndex={currentIndex}
                  isGenerating={isGenerating}
                  onProductImageUpload={setProductImage}
                  onImageClick={handleThumbnailClick}
                />
              </DarkModeWrapper>
          ) : currentView === 'try-on' ? (
              <DarkModeWrapper>
                <VirtualTryOnMode
                  onGenerate={handleTryOnGenerate}
                  isGenerating={isGenerating}
                  generatedImages={tryOnResults}
                />
              </DarkModeWrapper>
          ) : currentView === 'jewelry' ? (
              <DarkModeWrapper>
                <JewelryMode
                  userCredits={userCredits}
                  isUserAdmin={isAdmin(currentUser?.email)}
                  onShowPricing={() => setShowPricing(true)}
                  onCreditsUsed={createCreditsHandler('jewelry')}
                  initialMode={selectedSubMode}
                  onModeChange={setSelectedSubMode}
                />
              </DarkModeWrapper>
          ) : currentView === 'mens-fashion' ? (
              <DarkModeWrapper>
                <MensFashionMode
                  userCredits={userCredits}
                  isUserAdmin={isAdmin(currentUser?.email)}
                  onShowPricing={() => setShowPricing(true)}
                  onCreditsUsed={createCreditsHandler('mens-fashion')}
                  initialMode={selectedSubMode}
                  onModeChange={setSelectedSubMode}
                />
              </DarkModeWrapper>
          ) : currentView === 'womens-fashion' ? (
              <DarkModeWrapper>
                <WomensFashionMode
                  userCredits={userCredits}
                  isUserAdmin={isAdmin(currentUser?.email)}
                  onShowPricing={() => setShowPricing(true)}
                  onCreditsUsed={createCreditsHandler('womens-fashion')}
                  initialMode={selectedSubMode}
                  onModeChange={setSelectedSubMode}
                />
              </DarkModeWrapper>
          ) : currentView === 'style-selector' ? (
              <DarkModeWrapper>
                <StyleSelectorMode
                  userCredits={userCredits}
                  isUserAdmin={isAdmin(currentUser?.email)}
                  onShowPricing={() => setShowPricing(true)}
                  onCreditsUsed={createCreditsHandler('style-selector')}
                />
              </DarkModeWrapper>
          ) : currentView === 'product-annotation' ? (
              <DarkModeWrapper>
                <ProductAnnotationMode
                  onClose={() => setCurrentView('home')}
                />
              </DarkModeWrapper>
          ) : currentView === 'prompt-architect' ? (
              <DarkModeWrapper>
                <PromptArchitectMode />
              </DarkModeWrapper>
          ) : currentView === 'personas' ? (
              <PersonasMode />
          ) : currentView === 'ozel' ? (
              <OzelMode
                userCredits={userCredits}
                isUserAdmin={isAdmin(currentUser?.email)}
                onShowPricing={() => setShowPricing(true)}
                onCreditsUsed={createCreditsHandler('ozel')}
              />
          ) : currentView === 'collections' ? (
              <DarkModeWrapper>
                <CollectionsMode
                  onGenerate={handleCollectionGenerate}
                  isGenerating={isGenerating}
                />
              </DarkModeWrapper>
          ) : (
              <DarkModeWrapper>
                <AdCreativeMode
                  onGenerate={handleAdGenerate}
                  isGenerating={isGenerating}
                />
              </DarkModeWrapper>
          )}
        </div>
      </div>

      {showFullScreenModal && fullScreenImageUrl && (
        <FullScreenImageViewer
          imageUrl={fullScreenImageUrl}
          onClose={handleCloseFullScreenModal}
          filterSettings={imageFilterSettings}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Gallery History Modal */}
      {showGallery && currentUser && (
        <GalleryHistory
          userId={currentUser.uid}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* Pricing Modal */}
      {showPricing && currentUser && (
        <PricingPage
          onClose={() => setShowPricing(false)}
          onSelectPackage={handleSelectPackage}
          currentCredits={userCredits}
        />
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && currentUser && (
        <ProfileEditModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={currentUser.uid}
          currentName={userName}
          currentAvatarId={userAvatarId}
          onProfileUpdate={(name, avatarId) => {
            setUserName(name);
            setUserAvatarId(avatarId);
          }}
        />
      )}

      {/* Notification */}
      {notification && notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={5000}
        />
      )}

      {/* Confirm Modal */}
      {confirmModal && confirmModal.show && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
          confirmText="Onayla"
          cancelText="İptal"
        />
      )}
    </div>
  );
};

export default App;