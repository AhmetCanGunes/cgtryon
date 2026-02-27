

export interface GenerationSettings {
    productCategory: string; // New: Main Category (e.g., "Araçlar")
    clothingType: string; // Specific Item (e.g., "Spor Araba")
    // New simplified system
    framing?: string; // NEW: Görünüm/Kadraj (Tam Boy, Sadece Üst, vb.)
    targetPose?: string; // NEW: Hedef Poz (Önden, Yandan, Arkadan)
    enableBoudoir?: boolean; // NEW: Boudoir mode toggle (separate from lingerie)
    sceneCategory?: string; // NEW: Mekan & Konsept category selection
    professionalStudioStyle?: string; // NEW: Profesyonel Stüdyo sub-style selection
    womenClothingStyle?: string; // NEW: Kadın Giyim sub-style selection
    gender: string;
    ethnicity: string;
    skinTone?: string; // NEW: Ten Rengi (fair, light, medium, dark, etc.)
    age: string;
    bodyType: string;
    hairStyle: string;
    hairColor?: string; // NEW: Saç Rengi
    hairLength?: string; // NEW: Saç Uzunluğu (Kısa, Orta, Uzun)
    lipstickColor?: string; // NEW: Ruj Rengi (Sadece Kadın)
    nailPolishColor?: string; // NEW: Oje Rengi (Sadece Kadın)
    height: string;    
    viewAngle: string; 
    background: string; 
    modelPose: string;
    customPrompt: string;
    aspectRatio: string;
    numberOfImages: number;
    modelQuality: string;
    resolution: string;
    season?: string; // NEW: Mevsim
    weather?: string; // NEW: Hava Durumu
    enableBoudoirMode?: boolean; // DEPRECATED: Use enableBoudoir instead
    boudoirCategory?: string; // NEW: Specific Boudoir Context (Yatak, Duş, etc.)
    boudoirLighting?: string; // NEW: Lighting Tone Preference
    boudoirCameraAngle?: string; // NEW: Camera Angle for Boudoir
    enableWetLook?: boolean; // NEW: Islak/Terli Görünüm Toggle
    theme?: string; // NEW: Tema/Stil (from Ad Creative)
    sceneVariation?: string; // NEW: Varyasyon/Sahne (from Ad Creative)
    // Accessory-specific options
    accessoryBackgroundStyle?: string; // NEW: Aksesuar arka plan stili
    accessoryPose?: string; // NEW: Aksesuar için özel poz
    accessoryLighting?: string; // NEW: Aksesuar ışıklandırma
    // Wallet-specific options
    walletPoseWithModel?: string; // NEW: Cüzdan - mankenli poz
    walletSceneProductOnly?: string; // NEW: Cüzdan - sadece ürün sahne
    walletLighting?: string; // NEW: Cüzdan ışıklandırma
    // Bag-specific options
    bagPoseWithModel?: string; // NEW: Çanta - mankenli poz
    bagSceneProductOnly?: string; // NEW: Çanta - sadece ürün sahne
    bagLighting?: string; // NEW: Çanta ışıklandırma
    // Shoes-specific options
    shoesPoseWithModel?: string; // NEW: Ayakkabı - mankenli poz
    shoesSceneProductOnly?: string; // NEW: Ayakkabı - sadece ürün sahne
    shoesLighting?: string; // NEW: Ayakkabı ışıklandırma
    // Sunglasses-specific options
    sunglassesPoseWithModel?: string; // NEW: Gözlük - mankenli poz
    sunglassesSceneProductOnly?: string; // NEW: Gözlük - sadece ürün sahne
    sunglassesLighting?: string; // NEW: Gözlük ışıklandırma
    // Watch-specific options
    watchPoseWithModel?: string; // NEW: Saat - mankenli poz
    watchSceneProductOnly?: string; // NEW: Saat - sadece ürün sahne
    watchLighting?: string; // NEW: Saat ışıklandırma
    // Earrings-specific options
    earringsPoseWithModel?: string; // NEW: Küpe - mankenli poz
    earringsSceneProductOnly?: string; // NEW: Küpe - sadece ürün sahne
    earringsLighting?: string; // NEW: Küpe ışıklandırma
    // Necklace-specific options
    necklacePoseWithModel?: string; // NEW: Kolye - mankenli poz
    necklaceSceneProductOnly?: string; // NEW: Kolye - sadece ürün sahne
    necklaceLighting?: string; // NEW: Kolye ışıklandırma
    // Bracelet-specific options (jewelry, not bag)
    braceletPoseWithModel?: string; // NEW: Bileklik - mankenli poz
    braceletSceneProductOnly?: string; // NEW: Bileklik - sadece ürün sahne
    braceletLighting?: string; // NEW: Bileklik ışıklandırma
    // Ring-specific options
    ringPoseWithModel?: string; // NEW: Yüzük - mankenli poz
    ringSceneProductOnly?: string; // NEW: Yüzük - sadece ürün sahne
    ringLighting?: string; // NEW: Yüzük ışıklandırma
    // Hat-specific options
    hatPoseWithModel?: string; // NEW: Şapka - mankenli poz
    hatSceneProductOnly?: string; // NEW: Şapka - sadece ürün sahne
    hatLighting?: string; // NEW: Şapka ışıklandırma
    isProductPhotography?: boolean; // NEW: Manken var mı yok mu kontrolü
    
    // BRANDED AI GUIDE - Modular System (Pipeline Order: 1→6)
    // 1. Concept Module
    brandedConcept?: string; // Visual purpose: product_hero, beauty_shot, etc.
    // 2. Subject Module
    brandedStance?: string; // Human: relaxed, confident, dynamic, formal
    brandedPoseEnergy?: string; // static, flowing, in_motion
    brandedClothingStyle?: string; // minimal, editorial, casual, luxury
    brandedHairStyle?: string; // slick, natural, textured
    brandedExpression?: string; // neutral, confident, soft
    brandedProductOrientation?: string; // Product: horizontal, vertical, angled
    brandedProductPlacement?: string; // surface, handheld, floating
    brandedProductContext?: string; // isolated, lifestyle
    brandedProductCondition?: string; // pristine, worn, textured
    // 3. Colors & Materials Module
    brandedColorTemperature?: string; // warm, neutral, cool
    brandedColorHarmony?: string; // monochromatic, complementary, analogous, neutral
    brandedMaterialFinish?: string; // matte, satin, high_gloss, textured
    // 4. Composition Module
    brandedFraming?: string; // centered, rule_of_thirds, off_center
    brandedDepth?: string; // shallow, layered, deep
    brandedNegativeSpace?: string; // generous, balanced, tight
    brandedAspectRatioStyle?: string; // portrait, square, landscape
    // 5. Lighting & Mood Module
    brandedLightingType?: string; // studio_softbox, window_light, golden_hour, overcast, low_key
    brandedShadowQuality?: string; // soft, defined, dramatic, minimal
    // 6. Camera & Lens Module
    brandedCaptureStyle?: string; // modern_digital, analog_film
    brandedLens?: string; // 35mm, 50mm, 85mm, macro
    brandedDepthOfField?: string; // shallow, medium, deep
  }

  export interface TryOnSettings {
    category: string;
    description: string;
    modelQuality: string;
    resolution: string;
    pose: string;
    background: string;
    aspectRatio: string;
    numberOfImages?: number;
    season?: string;
    weather?: string;
    theme?: string;
    sceneVariation?: string;
    customPrompt?: string;
  }

  export interface TryOnV3Settings {
    modelQuality: string;
    background: string;
    pose: string;
    viewAngle: string;
    aspectRatio: string;
    numberOfImages?: number;
    season?: string;
    weather?: string;
    theme?: string;
    sceneVariation?: string;
  }

  export interface BackgroundStudioSettings {
    pose: string;
    background: string;
    season: string; // New: Mevsim
    weather: string; // New: Hava Durumu
    aspectRatio: string;
    upscale: boolean; 
    customPrompt: string; 
    poseRefinement: string; // New: Pose specific adjustments
  }

  export interface UpscaleSettings {
    factor: string;
    creativity: number;
    sharpness: string;
    numberOfImages?: number;
  }

  // TAKI MODU - JEWELRY MODE
  export interface JewelrySettings {
    shootingType: 'velvet-stand' | 'on-model' | 'macro-detail';
    standColor?: string; // Sadece velvet-stand için
    skinTone?: string; // Sadece on-model için
    background: string;
    purpose: 'shopify' | 'catalog' | 'ad';
    modelQuality: string;
    numberOfImages: number;
    customPrompt?: string;
  }

  // HAYVAN EKLEME SEÇENEKLERİ - ANIMAL COMPANION OPTIONS
  export interface AnimalSettings {
    enabled: boolean;
    animalType: string; // 'dog', 'cat', 'bird', etc. or 'custom'
    breed: string; // Hayvanın cinsi
    position: string; // 'left', 'right', 'front', 'behind', 'lap', 'beside'
    pose: string; // 'sitting', 'standing', 'lying', 'walking', 'playing'
    size: string; // 'small', 'medium', 'large'
    lookDirection: string; // 'camera', 'model', 'forward', 'side', 'away'
    customAnimal?: string; // Özel hayvan açıklaması (animalType='custom' olduğunda kullanılır)
  }

  export const ANIMAL_DEFAULTS: AnimalSettings = {
    enabled: false,
    animalType: 'dog',
    breed: 'golden-retriever',
    position: 'right',
    pose: 'sitting',
    size: 'medium',
    lookDirection: 'camera',
    customAnimal: '',
  };

  // Hayvan Türleri
  export const ANIMAL_TYPES = [
    { id: 'dog', name: 'Köpek', icon: '🐕', description: 'Sadık dost' },
    { id: 'cat', name: 'Kedi', icon: '🐈', description: 'Zarif evcil' },
    { id: 'bird', name: 'Kuş', icon: '🦜', description: 'Renkli papağan/muhabbet kuşu' },
    { id: 'rabbit', name: 'Tavşan', icon: '🐰', description: 'Sevimli tavşan' },
    { id: 'horse', name: 'At', icon: '🐴', description: 'Asil at' },
    { id: 'custom', name: 'Özel', icon: '✨', description: 'Kendi hayvanını tanımla' },
  ];

  // Köpek Cinsleri
  export const DOG_BREEDS = [
    { id: 'golden-retriever', name: 'Golden Retriever', description: 'Altın sarısı, arkadaş canlısı' },
    { id: 'labrador', name: 'Labrador', description: 'Siyah/sarı/çikolata labrador' },
    { id: 'german-shepherd', name: 'Alman Kurdu', description: 'Güçlü, asil' },
    { id: 'husky', name: 'Husky', description: 'Mavi gözlü, beyaz-gri' },
    { id: 'poodle', name: 'Kaniş', description: 'Zarif, kıvırcık tüylü' },
    { id: 'french-bulldog', name: 'Fransız Bulldog', description: 'Küçük, sevimli' },
    { id: 'beagle', name: 'Beagle', description: 'Orta boy, enerjik' },
    { id: 'corgi', name: 'Corgi', description: 'Kısa bacaklı, sevimli' },
    { id: 'samoyed', name: 'Samoyed', description: 'Beyaz, kabarık tüylü' },
    { id: 'dalmatian', name: 'Dalmaçyalı', description: 'Beyaz-siyah benekli' },
    { id: 'shiba-inu', name: 'Shiba Inu', description: 'Japon köpeği, turuncu-beyaz' },
    { id: 'border-collie', name: 'Border Collie', description: 'Zeki, siyah-beyaz' },
    { id: 'doberman', name: 'Doberman', description: 'Atletik, siyah-kahve, zarif' },
  ];

  // Kedi Cinsleri
  export const CAT_BREEDS = [
    { id: 'persian', name: 'İran Kedisi', description: 'Uzun tüylü, yassı yüzlü' },
    { id: 'siamese', name: 'Siyam', description: 'Krem-kahve, mavi gözlü' },
    { id: 'maine-coon', name: 'Maine Coon', description: 'Büyük, tüylü' },
    { id: 'british-shorthair', name: 'British Shorthair', description: 'Gri, tombul' },
    { id: 'ragdoll', name: 'Ragdoll', description: 'Mavi gözlü, uzun tüylü' },
    { id: 'bengal', name: 'Bengal', description: 'Leopar desenli' },
    { id: 'scottish-fold', name: 'Scottish Fold', description: 'Katlı kulaklı' },
    { id: 'tabby', name: 'Tekir', description: 'Klasik çizgili desen' },
    { id: 'orange-tabby', name: 'Sarman', description: 'Turuncu tekir' },
    { id: 'black-cat', name: 'Siyah Kedi', description: 'Zarif siyah' },
    { id: 'white-cat', name: 'Beyaz Kedi', description: 'Saf beyaz' },
  ];

  // Kuş Cinsleri
  export const BIRD_BREEDS = [
    { id: 'parrot', name: 'Papağan', description: 'Renkli, konuşkan' },
    { id: 'cockatiel', name: 'Sultan Papağanı', description: 'Sarı tepeli' },
    { id: 'budgie', name: 'Muhabbet Kuşu', description: 'Küçük, renkli' },
    { id: 'macaw', name: 'Macaw', description: 'Büyük, renkli' },
    { id: 'cockatoo', name: 'Kakadu', description: 'Beyaz, tepeli' },
    { id: 'lovebird', name: 'Cennet Papağanı', description: 'Küçük, sevimli' },
  ];

  // Tavşan Cinsleri
  export const RABBIT_BREEDS = [
    { id: 'holland-lop', name: 'Holland Lop', description: 'Sarkık kulaklı, küçük' },
    { id: 'netherland-dwarf', name: 'Netherland Dwarf', description: 'Minik, tombul' },
    { id: 'rex', name: 'Rex', description: 'Kadife tüylü' },
    { id: 'angora', name: 'Angora', description: 'Uzun tüylü' },
    { id: 'flemish-giant', name: 'Flemish Giant', description: 'Dev tavşan' },
    { id: 'white-rabbit', name: 'Beyaz Tavşan', description: 'Klasik beyaz' },
  ];

  // At Cinsleri
  export const HORSE_BREEDS = [
    { id: 'arabian', name: 'Arap Atı', description: 'Zarif, ince yapılı' },
    { id: 'thoroughbred', name: 'Safkan', description: 'Yarış atı' },
    { id: 'friesian', name: 'Friesian', description: 'Siyah, gösterişli' },
    { id: 'white-horse', name: 'Beyaz At', description: 'Saf beyaz' },
    { id: 'palomino', name: 'Palomino', description: 'Altın sarısı' },
    { id: 'appaloosa', name: 'Appaloosa', description: 'Benekli' },
  ];

  // Hayvan Pozisyonları
  export const ANIMAL_POSITIONS = [
    { id: 'right', name: 'Sağ Taraf', icon: '➡️', description: 'Modelin sağında' },
    { id: 'left', name: 'Sol Taraf', icon: '⬅️', description: 'Modelin solunda' },
    { id: 'beside', name: 'Hemen Yanında', icon: '🤝', description: 'Modele çok yakın, yan yana' },
    { id: 'front', name: 'Önde', icon: '⬇️', description: 'Modelin önünde' },
    { id: 'behind', name: 'Arkada', icon: '⬆️', description: 'Modelin arkasında' },
    { id: 'lap', name: 'Kucakta', icon: '🫂', description: 'Modelin kucağında (küçük hayvanlar için)' },
    { id: 'shoulder', name: 'Omuzda', icon: '🦜', description: 'Modelin omzunda (kuşlar için)' },
    { id: 'arms', name: 'Kollarında', icon: '🤱', description: 'Modelin kollarında taşıyor' },
  ];

  // Hayvan Bakış Yönleri
  export const ANIMAL_LOOK_DIRECTIONS = [
    { id: 'camera', name: 'Kameraya', icon: '📷', description: 'Doğrudan kameraya bakıyor' },
    { id: 'model', name: 'Modele', icon: '👤', description: 'Modele bakıyor' },
    { id: 'forward', name: 'İleriye', icon: '⏩', description: 'İleriye doğru bakıyor' },
    { id: 'side', name: 'Yana', icon: '↔️', description: 'Yana doğru bakıyor' },
    { id: 'away', name: 'Uzağa', icon: '🌅', description: 'Uzaklara bakıyor' },
  ];

  // Hayvan Pozları
  export const ANIMAL_POSES = [
    { id: 'sitting', name: 'Oturuyor', icon: '🪑', description: 'Sakin oturma pozu' },
    { id: 'standing', name: 'Ayakta', icon: '🧍', description: 'Dik durma pozu' },
    { id: 'lying', name: 'Yatıyor', icon: '😴', description: 'Rahat yatma pozu' },
    { id: 'walking', name: 'Yürüyor', icon: '🚶', description: 'Hareket halinde' },
    { id: 'playing', name: 'Oynuyor', icon: '🎾', description: 'Oyun oynama pozu' },
    { id: 'looking-up', name: 'Yukarı Bakıyor', icon: '👆', description: 'Modele bakıyor' },
    { id: 'alert', name: 'Dikkatli', icon: '👂', description: 'Kulaklar dik, dikkatli' },
    { id: 'relaxed', name: 'Rahat', icon: '😌', description: 'Gevşek, rahat poz' },
    { id: 'running', name: 'Koşuyor', icon: '🏃', description: 'Koşma pozu (at için ideal)' },
  ];

  // Hayvan Boyutları
  export const ANIMAL_SIZES = [
    { id: 'small', name: 'Küçük', description: 'Küçük görünüm' },
    { id: 'medium', name: 'Orta', description: 'Normal boyut' },
    { id: 'large', name: 'Büyük', description: 'Büyük görünüm' },
  ];

  // ERKEK MODA MODU - MEN'S FASHION MODE
  export interface MensFashionSettings {
    purpose: 'ecommerce' | 'catalog' | 'advertising';
    skinTone: string;
    poseStyle: string;
    background: string;
    backgroundStyle: string;
    floorType?: string; // Zemin tipi - arka plandan bağımsız
    lightingStyle?: string; // Işık stili - soft, dramatic, natural, studio, high-key, low-key
    woodType?: string; // Ahşap tipi - backgroundStyle 'wood' olduğunda
    numberOfImages: number;
    aspectRatio: string;
    cameraFrame?: string; // Backward compat - mapped from shotScale
    cameraAngle?: string; // Kamera açısı - eye-level, slight-low, slight-high, low-angle, high-angle
    shotScale?: string; // Çekim ölçeği - prompt sekmesinden
    lens?: string; // Lens seçimi - prompt sekmesinden
    customPrompt?: string; // Kullanıcının özel talimatları (örn: "bronşu kaldır")
    animal?: AnimalSettings;
    collarType?: string;
    fabricType?: string;
    pleatType?: string;
    trouserFit?: string;
    trouserFabricType?: string;
    trouserWaistRise?: string;
    knitwearType?: string;
    shirtTuck?: string;
    spallaCamicia?: string; // Spalla Camicia (Gömlek Omuz) - full, half, none
    // Ceket özel ayarları
    jacketHemLengthen?: boolean; // Ceket etek boyunu uzat
    removeBrooch?: boolean; // Broşu kaldır
    // Pantolon özel ayarları
    trouserLegLengthen?: boolean; // Pantolon paçası uzat
    // Studio Minimal Gradient için özel ayarlar
    studioMinimalColor?: string;
    studioMinimalVignette?: boolean;
  }

  // Kamera Açısı Seçenekleri (Camera Angle Options) - Erkek Giyim için
  export const CAMERA_ANGLE_OPTIONS = [
    { id: 'eye-level', name: 'Göz Hizası', description: 'Standart, doğal görünüm - en yaygın', icon: '👁️' },
    { id: 'slight-low', name: 'Hafif Alt Açı', description: 'Güçlü, dominant, özgüvenli görünüm', icon: '⬆️' },
    { id: 'slight-high', name: 'Hafif Üst Açı', description: 'Zarif, ince, editorial görünüm', icon: '⬇️' },
    { id: 'low-angle', name: 'Alt Açı', description: 'Dramatik, heybetli, güç vurgusu', icon: '🔼' },
    { id: 'high-angle', name: 'Üst Açı', description: 'Sanatsal, moda editorial', icon: '🔽' },
  ];

  // Kamera Açısı Seçenekleri - Prompt Sekmesi ile Aynı (Dikey Açılar)
  export const PROMPT_CAMERA_ANGLE_OPTIONS = [
    // Aşağıdan Yukarı Bakanlar
    { value: "worms_eye", label: "Solucan Bakışı (yerden, 90° yukarı)" },
    { value: "extreme_low", label: "Çok Alt Açı (60° yukarı)" },
    { value: "low_angle", label: "Alt Açı (30-45° yukarı)" },
    { value: "slight_low", label: "Hafif Alt Açı (15° yukarı)" },
    // Düz Seviye
    { value: "eye_level", label: "Göz Hizası (0° düz)" },
    // Yukarıdan Aşağı Bakanlar
    { value: "slight_high", label: "Hafif Üst Açı (15° aşağı)" },
    { value: "high_angle", label: "Üst Açı (30-45° aşağı)" },
    { value: "extreme_high", label: "Çok Üst Açı (60° aşağı)" },
    { value: "birds_eye", label: "Kuş Bakışı (90° tam yukarıdan)" },
    // Özel Açılar
    { value: "dutch_angle", label: "Dutch Angle (15-30° yana eğik)" },
    { value: "over_shoulder", label: "Omuz Üstünden (arkadan)" },
  ];

  // Çekim Ölçeği Seçenekleri - Standart (Shot Scale - Standard)
  export const STANDARD_SHOT_SCALES = [
    // Çok Yakın Alt Kategoriler
    { value: "extreme_closeup_eye", label: "Çok Yakın - Göz" },
    { value: "extreme_closeup_mouth", label: "Çok Yakın - Ağız" },
    { value: "extreme_closeup_head", label: "Çok Yakın - Kafa" },
    { value: "extreme_closeup_left_profile", label: "Sol Profil (Tam Kafa)" },
    { value: "extreme_closeup_right_profile", label: "Sağ Profil (Tam Kafa)" },
    // Diğer Planlar
    { value: "closeup", label: "Yakın Plan (Baş/Omuz)" },
    { value: "medium_closeup", label: "Göğüs Plan (Sternum)" },
    { value: "medium_shot", label: "Bel Plan (Waist)" },
    { value: "full_shot", label: "Boy Plan (Body)" },
    { value: "wide_shot", label: "Genel Plan" },
    { value: "extreme_wide", label: "Çok Genel Plan" },
    { value: "long_distance", label: "Uzak Mesafe" },
  ];

  // Çekim Ölçeği Seçenekleri - Özel (Shot Scale - Special)
  export const SPECIAL_SHOT_SCALES = [
    // Özel Detay Çekimleri
    { value: "detail_sleeve_cuff", label: "Özel 1 - Kol/Manşet Detay" },
    { value: "detail_collar_chest", label: "Özel 2 - Yaka/Göğüs Detay" },
    { value: "detail_fabric_texture", label: "Özel 3 - Kumaş Dokusu Makro" },
    { value: "detail_button_macro", label: "Özel 4 - Düğme Makro" },
    // Kadir Özel Çekim Ölçekleri
    { value: "kadir5", label: "Kadir 5 - Detay, Yandan, Bel Hizası" },
    { value: "kadir6", label: "Kadir 6 - Tam Boy, 3/4 Açı, Göz Hizası" },
    { value: "kadir7", label: "Kadir 7 - Orta Boy, Arkadan, Göz Hizası" },
    { value: "kadir8", label: "Kadir 8 - Belden Aşağı, Önden, Bel Hizası" },
    { value: "kadir10", label: "Kadir 10 - Belden Aşağı, Arkadan, Bel Hizası" },
  ];

  // Lens Seçenekleri (Lens Options)
  export const LENS_OPTIONS = [
    { value: "8mm_fisheye", label: "8mm Fisheye" },
    { value: "14mm_ultra", label: "14mm Ultra Wide" },
    { value: "24mm_wide", label: "24mm Wide" },
    { value: "35mm_classic", label: "35mm Classic" },
    { value: "50mm_natural", label: "50mm Natural" },
    { value: "85mm_portrait", label: "85mm Portrait" },
    { value: "135mm_tele", label: "135mm Tele" },
    { value: "200mm_tele", label: "200mm Telephoto" },
    { value: "anamorphic", label: "Anamorfik" },
  ];

  // Işık Stili Seçenekleri (Lighting Style Options) - Erkek Giyim için
  export const LIGHTING_STYLE_OPTIONS = [
    { id: 'soft-studio', name: 'Soft Stüdyo', description: 'Yumuşak, gölgesiz, e-ticaret için ideal', icon: '💡' },
    { id: 'dramatic', name: 'Dramatik', description: 'Güçlü gölgeler, kontrastlı, editorial', icon: '🌓' },
    { id: 'natural-window', name: 'Doğal Pencere', description: 'Pencere ışığı efekti, organik hissiyat', icon: '🪟' },
    { id: 'high-key', name: 'High Key', description: 'Çok parlak, gölgesiz, temiz görünüm', icon: '☀️' },
    { id: 'low-key', name: 'Low Key', description: 'Karanlık arka plan, spot ışık, lüks hissiyat', icon: '🌑' },
    { id: 'golden-hour', name: 'Golden Hour', description: 'Sıcak, altın tonlu, romantik atmosfer', icon: '🌅' },
    { id: 'ring-light', name: 'Ring Light', description: 'Eşit dağılımlı, gözlerde yansıma', icon: '⭕' },
    { id: 'split', name: 'Split Light', description: 'Yüzün yarısı aydınlık, dramatik portre', icon: '◐' },
  ];

  // Ahşap Tipi Seçenekleri (Wood Type Options) - Arka plan stili ahşap olduğunda
  export const WOOD_TYPE_OPTIONS = [
    { id: 'oak-light', name: 'Açık Meşe', description: 'Açık tonlu meşe panel, modern ve aydınlık', icon: '🪵' },
    { id: 'walnut-dark', name: 'Koyu Ceviz', description: 'Koyu ceviz ahşap, lüks ve sofistike', icon: '🟤' },
    { id: 'reclaimed', name: 'Eskitilmiş', description: 'Vintage eskitilmiş ahşap, rustik karakter', icon: '🪓' },
    { id: 'barnwood', name: 'Ahır Tahtası', description: 'Weathered barn wood, kırsal şık', icon: '🏚️' },
    { id: 'herringbone', name: 'Balıksırtı', description: 'Balıksırtı desen parke, klasik elegans', icon: '🔶' },
    { id: 'shiplap', name: 'Shiplap', description: 'Yatay çıtalı beyaz/gri ahşap, coastal', icon: '📏' },
    { id: 'cedar', name: 'Sedir', description: 'Kızıl sedir ahşap, sıcak ve doğal', icon: '🌲' },
    { id: 'bamboo', name: 'Bambu', description: 'Açık bambu panel, minimal ve zen', icon: '🎋' },
  ];

  // Zemin Tipi Seçenekleri (Floor Type Options)
  export const FLOOR_TYPE_OPTIONS = [
    { id: 'seamless', name: 'Seamless (Arka Plan ile Aynı)', description: 'Arka plan rengi ile aynı, kesintisiz geçiş', hex: 'auto' },
    { id: 'white', name: 'Beyaz Zemin', description: 'Temiz beyaz stüdyo zemini', hex: '#FFFFFF' },
    { id: 'light-gray', name: 'Açık Gri Zemin', description: 'Nötr gri stüdyo zemini', hex: '#E5E5E5' },
    { id: 'dark-gray', name: 'Koyu Gri Zemin', description: 'Dramatik koyu zemin', hex: '#4A4A4A' },
    { id: 'concrete', name: 'Beton Zemin', description: 'Urban, endüstriyel beton', hex: '#9E9E9E' },
    { id: 'wood-light', name: 'Açık Ahşap', description: 'Meşe, kayın gibi açık ahşap', hex: '#D4B896' },
    { id: 'wood-dark', name: 'Koyu Ahşap', description: 'Ceviz, maun gibi koyu ahşap', hex: '#5D4037' },
    { id: 'marble-white', name: 'Beyaz Mermer', description: 'Lüks beyaz mermer zemin', hex: '#F5F5F5' },
    { id: 'marble-black', name: 'Siyah Mermer', description: 'Dramatik siyah mermer', hex: '#2C2C2C' },
    { id: 'tile-white', name: 'Beyaz Fayans', description: 'Temiz beyaz karo zemin', hex: '#FAFAFA' },
    { id: 'reflective', name: 'Yansıtıcı Zemin', description: 'Parlak, yansımalı yüzey', hex: '#E8E8E8' },
  ];

  // Kamera Çerçevesi Seçenekleri (Camera Frame Options)
  export const CAMERA_FRAME_OPTIONS = [
    { id: 'full-body', name: 'Full Body', description: 'Tam boy görüntü - baştan ayağa' },
    { id: '3/4', name: '3/4', description: '3/4 görüntü - dizlerden yukarısı' },
    { id: 'waist-up', name: 'Waist Up', description: 'Belden yukarı görüntü, üst giyim için ideal' },
    { id: 'waist-down', name: 'Waist Down', description: 'Belden aşağı görüntü, ayakkabı ve alt giyim için ideal' },
    { id: 'head', name: 'Kafa', description: 'Sadece kafa - saç dahil tam yüz görünümü' },
  ];

  // Kadraj/Shot Type Seçenekleri (Sinema + Fotoğraf)
  export const SHOT_TYPE_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'Referans fotoğraftaki kadrajı kullan' },
    { id: 'extreme-long-shot', name: 'Extreme Long Shot (ELS)', description: 'Çok geniş plan - ortam ve kişi birlikte, manzara vurgulu' },
    { id: 'long-shot', name: 'Long Shot (LS)', description: 'Tüm vücut kadrajda - baştan ayağa tam görünüm' },
    { id: 'medium-long-shot', name: 'Medium Long Shot (MLS)', description: 'American Shot - diz hizasından yukarısı' },
    { id: 'medium-shot', name: 'Medium Shot (MS)', description: 'Bel hizasından yukarısı - üst giyim odaklı' },
    { id: 'medium-close-up', name: 'Medium Close-Up (MCU)', description: 'Göğüs-omuz hizası - portre ve üst detay' },
    { id: 'close-up', name: 'Close-Up (CU)', description: 'Yüz veya ana obje - detaylı yakın çekim' },
    { id: 'extreme-close-up', name: 'Extreme Close-Up (ECU)', description: 'Göz, dudak, detay - maksimum yakınlık' },
    { id: 'detail-shot', name: 'Detail Shot (DS)', description: 'Ürün/kumaş/dikiş/aksesuar detayı' },
    { id: 'over-the-shoulder', name: 'Over the Shoulder (OTS)', description: 'Arkadan 3/4 açı - model omzunun üzerinden bakıyor (tek kişi)' },
  ];

  // Görsel Ölçü/Boyut Seçenekleri
  export const IMAGE_ASPECT_RATIO_OPTIONS = [
    { id: '1:1', name: 'Kare (1:1)', description: '1024x1024 - Instagram, sosyal medya' },
    { id: '9:16', name: 'Dikey (9:16)', description: '768x1365 - Hikaye, Reels, TikTok' },
    { id: '16:9', name: 'Yatay (16:9)', description: '1365x768 - Banner, reklam' },
    { id: '4:5', name: 'Portre (4:5)', description: '896x1120 - Instagram post' },
    { id: '3:4', name: 'Klasik Portre (3:4)', description: '864x1152 - Katalog, e-ticaret' },
    { id: '2:3', name: 'Uzun Portre (2:3)', description: '768x1152 - Tam boy manken' },
  ];

  // Yaka Tipi Seçenekleri (Triko/Kazak için)
  export const COLLAR_TYPE_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'AI görüntüden algılar' },
    { id: 'half-turtleneck', name: 'Yarım Balıkçı', description: 'Boynu yarıya kadar kapatan yaka' },
    { id: 'full-turtleneck', name: 'Tam Balıkçı', description: 'Boynu tamamen kapatan yaka' },
    { id: 'v-neck', name: 'V Yaka', description: 'V şeklinde açık yaka' },
    { id: 'crew-neck', name: 'Bisiklet Yaka', description: 'Yuvarlak, kapalı yaka' },
    { id: 'round-neck', name: 'Sıfır Yaka', description: 'Düz yuvarlak yaka' },
  ];

  // Spalla Camicia (Gömlek Omuz) Seçenekleri
  export const SPALLA_CAMICIA_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'AI görüntüden algılar' },
    { id: 'full', name: 'Tam Spalla Camicia', description: 'Omuz dikişi tamamen dışarıda, belirgin kıvrım' },
    { id: 'half', name: 'Yarım Spalla Camicia', description: 'Omuz dikişi hafif dışarıda, subtle kıvrım' },
    { id: 'none', name: 'Yok', description: 'Düz omuz dikişi, spalla camicia yok' },
  ];

  // Pantolon Pile Tipi Seçenekleri
  export const PLEAT_TYPE_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'AI görüntüden algılar' },
    { id: 'double', name: 'Çift Pile', description: 'Her iki tarafta 2 kıvrım' },
    { id: 'single', name: 'Tek Pile', description: 'Her iki tarafta 1 kıvrım' },
    { id: 'flat', name: 'Düz Ön (Pilesiz)', description: 'Pile olmadan düz kesim' },
  ];

  // Pantolon Kesim Tipi Seçenekleri
  export const TROUSER_FIT_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'AI görüntüden algılar' },
    { id: 'wide', name: 'Bol Kesim', description: 'Geniş paça, rahat fit (wide leg)' },
    { id: 'relaxed', name: 'Rahat Kesim', description: 'Orta genişlikte, konforlu (relaxed fit)' },
    { id: 'regular', name: 'Normal Kesim', description: 'Standart fit, ne dar ne bol (regular fit)' },
    { id: 'slim', name: 'Dar Kesim', description: 'Vücuda oturan, slim fit' },
    { id: 'skinny', name: 'Çok Dar Kesim', description: 'Çok dar, skinny fit' },
  ];

  // Ceket Kumaş Tipi Seçenekleri
  export const FABRIC_TYPE_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'AI görüntüden algılar' },
    { id: 'flannel', name: 'Flannel', description: 'Yumuşak, tüylü dokulu kumaş' },
    { id: 'tweed', name: 'Tweed', description: 'Dokulu, kaba örgülü yün kumaş' },
    { id: 'linen', name: 'Keten', description: 'Hafif, nefes alan doğal kumaş' },
    { id: 'wool', name: 'Normal Kumaş (Yün)', description: 'Klasik yün kumaş' },
  ];

  // Pantolon Kumaş Tipi Seçenekleri
  export const TROUSER_FABRIC_TYPE_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'AI görüntüden algılar' },
    { id: 'wool', name: 'Yün', description: 'Klasik kumaş pantolon, resmi görünüm' },
    { id: 'cotton', name: 'Pamuk', description: 'Rahat, günlük kullanım için ideal' },
    { id: 'linen', name: 'Keten', description: 'Hafif, yazlık, nefes alan kumaş' },
    { id: 'denim', name: 'Denim', description: 'Kot kumaş, casual görünüm' },
    { id: 'chino', name: 'Chino', description: 'Pamuklu twill, smart casual' },
    { id: 'corduroy', name: 'Kadife', description: 'Fitilli kadife, sonbahar/kış' },
    { id: 'tweed', name: 'Tweed', description: 'Dokulu yün, vintage görünüm' },
    { id: 'flannel', name: 'Flannel', description: 'Yumuşak yün, kışlık pantolon' },
    { id: 'gabardine', name: 'Gabardin', description: 'Sıkı dokunmuş, resmi pantolon' },
    { id: 'stretch', name: 'Streç', description: 'Esnek kumaş, rahat hareket' },
  ];

  // Pantolon Bel Yüksekliği Seçenekleri
  export const TROUSER_WAIST_RISE_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'AI görüntüden algılar' },
    { id: 'low', name: 'Düşük Bel', description: 'Bel bandı kalça kemiğinin altında' },
    { id: 'mid', name: 'Normal Bel', description: 'Bel bandı doğal bel hizasında' },
    { id: 'high', name: 'Yüksek Bel', description: 'Bel bandı doğal belin üzerinde, göbek hizasında' },
    { id: 'ultra_high', name: 'Çok Yüksek Bel', description: 'Bel bandı göbek seviyesinde veya üstünde' },
  ];

  // Triko/Kazak Tipi Seçenekleri
  export const KNITWEAR_TYPE_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'AI görüntüden algılar' },
    { id: 'polo-knit', name: 'Polo Yaka Triko', description: 'Polo yakalı örme kazak' },
    { id: 'crew-neck', name: 'Bisiklet Yaka', description: 'Yuvarlak yakalı klasik triko' },
    { id: 'v-neck', name: 'V Yaka', description: 'V şeklinde yakalı triko' },
    { id: 'turtleneck', name: 'Balıkçı Yaka', description: 'Yüksek boğazlı triko' },
    { id: 'mock-neck', name: 'Yarım Balıkçı', description: 'Kısa boğazlı triko' },
    { id: 'cardigan', name: 'Hırka', description: 'Önden düğmeli veya fermuarlı' },
    { id: 'zip-knit', name: 'Fermuarlı Triko', description: 'Yarım veya tam fermuarlı' },
  ];

  // Üst Giysi Pantolon İçi/Dışı Seçenekleri
  export const SHIRT_TUCK_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'AI duruma göre karar verir' },
    { id: 'tucked', name: 'İçinde', description: 'Üst giysi pantolonun içine sıkıştırılmış' },
    { id: 'untucked', name: 'Dışında', description: 'Üst giysi pantolonun dışında, serbest' },
    { id: 'half-tucked', name: 'Yarım İçinde', description: 'Önden içinde, arkadan dışarıda (French tuck)' },
  ];

  // =====================================================
  // SORU BAZLI PROMPT BUILDER - QUESTION-BASED PROMPT FLOW
  // =====================================================

  export interface PromptLayers {
    concept: string | null;      // Fotoğraf Türü
    mood: string | null;         // Genel Atmosfer
    background: string | null;   // Arka Plan
    composition: string | null;  // Kadraj
    lighting: string | null;     // Işıklandırma
    colorTone: string | null;    // Renk Tonu & Kontrast
    camera: string | null;       // Kamera Gerçekçiliği
  }

  export const PROMPT_LAYERS_DEFAULTS: PromptLayers = {
    concept: null,
    mood: null,
    background: null,
    composition: null,
    lighting: null,
    colorTone: null,
    camera: null
  };

  // ADIM 1: Fotoğraf Türü (Concept)
  export const PROMPT_CONCEPT_OPTIONS = [
    { id: 'ecommerce', name: 'Ürün Kataloğu', description: 'Clean / e-commerce', prompt: 'clean e-commerce product catalog photography, minimal distraction, product-focused' },
    { id: 'lookbook', name: 'Lookbook / Editorial', description: 'Moda çekimi stili', prompt: 'lookbook editorial fashion photography, stylized aesthetic, fashion magazine quality' },
    { id: 'campaign', name: 'Kampanya / Lifestyle', description: 'Reklam kampanyası', prompt: 'lifestyle campaign photography, aspirational mood, brand storytelling' }
  ];

  // ADIM 2: Genel Atmosfer (Mood)
  export const PROMPT_MOOD_OPTIONS = [
    { id: 'calm-premium', name: 'Sakin & Premium', description: 'Lüks, sofistike', prompt: 'calm premium atmosphere, sophisticated elegance, refined aesthetic' },
    { id: 'strong-masculine', name: 'Güçlü & Maskülen', description: 'Erkeksi, güçlü', prompt: 'strong masculine energy, confident powerful presence' },
    { id: 'modern-minimal', name: 'Modern & Sade', description: 'Çağdaş, minimal', prompt: 'modern minimalist aesthetic, contemporary clean look' },
    { id: 'fashion-editorial', name: 'Moda Odaklı / Editorial', description: 'High fashion', prompt: 'high fashion editorial mood, avant-garde styling, fashion-forward' }
  ];

  // ADIM 3: Arka Plan (Background)
  export const PROMPT_BACKGROUND_OPTIONS = [
    { id: 'clean-solid', name: 'Temiz / Düz Arka Plan', description: 'Sade stüdyo', prompt: 'clean solid background, pure studio backdrop, no distractions' },
    { id: 'soft-gradient', name: 'Hafif Gradient', description: 'Yumuşak geçiş', prompt: 'soft gradient background, subtle tonal transition, elegant backdrop' },
    { id: 'lifestyle', name: 'Lifestyle (Mekan Hissi)', description: 'Ortam, atmosfer', prompt: 'lifestyle environment background, contextual setting, environmental storytelling' },
    { id: 'studio-depth', name: 'Studio Ama Derinlikli', description: 'Derinlik hissi', prompt: 'studio background with depth, dimensional backdrop, layered lighting' }
  ];

  // ADIM 4: Kadraj (Composition)
  export const PROMPT_COMPOSITION_OPTIONS = [
    { id: 'full-body', name: 'Tam Boy', description: 'Baştan ayağa', prompt: 'full body shot, head to toe framing' },
    { id: 'waist-up', name: 'Belden Yukarı', description: 'Üst beden', prompt: 'waist-up shot, upper body focus' },
    { id: 'centered', name: 'Ortalanmış', description: 'Merkez kompozisyon', prompt: 'centered composition, symmetrical framing' },
    { id: 'rule-of-thirds', name: 'Üçte Bir Kuralı', description: 'Klasik kural', prompt: 'rule of thirds composition, dynamic placement' },
    { id: 'negative-space', name: 'Geniş Negatif Alan', description: 'Boşluk vurgusu', prompt: 'wide negative space, breathing room, minimalist framing' },
    { id: 'balanced-classic', name: 'Dengeli / Klasik Kadraj', description: 'Geleneksel', prompt: 'balanced classic composition, traditional framing, harmonious layout' }
  ];

  // ADIM 5: Işıklandırma (Lighting)
  export const PROMPT_LIGHTING_OPTIONS = [
    { id: 'soft-studio', name: 'Soft Stüdyo Işığı', description: 'Yumuşak, düz', prompt: 'soft studio lighting, even illumination, flattering light' },
    { id: 'natural-window', name: 'Doğal Pencere Işığı', description: 'Doğal, sıcak', prompt: 'natural window light, soft daylight, organic illumination' },
    { id: 'contrast-editorial', name: 'Kontrastlı Editorial Işık', description: 'Dramatik', prompt: 'high contrast editorial lighting, dramatic shadows, fashion lighting' },
    { id: 'soft-deep-shadow', name: 'Yumuşak Ama Derin Gölgeli', description: 'Boyutlu', prompt: 'soft lighting with deep shadows, dimensional, sculpted light' }
  ];

  // ADIM 6: Renk Tonu & Kontrast (Color Tone)
  export const PROMPT_COLOR_TONE_OPTIONS = [
    { id: 'warm', name: 'Sıcak Tonlar', description: 'Turuncu, sarı', prompt: 'warm color tones, golden warmth, amber hues' },
    { id: 'cool', name: 'Soğuk Tonlar', description: 'Mavi, gri', prompt: 'cool color tones, blue undertones, crisp cool palette' },
    { id: 'neutral', name: 'Nötr / Gerçek Renkler', description: 'Doğal', prompt: 'neutral true colors, accurate color reproduction, natural palette' },
    { id: 'high-contrast', name: 'Yüksek Kontrast', description: 'Keskin', prompt: 'high contrast color grading, punchy colors, bold tonal range' },
    { id: 'low-contrast', name: 'Düşük Kontrast', description: 'Yumuşak', prompt: 'low contrast muted tones, soft color palette, gentle gradation' }
  ];

  // ADIM 7: Kamera Gerçekçiliği (Camera)
  export const PROMPT_CAMERA_OPTIONS = [
    { id: 'realistic', name: '%100 Gerçek Fotoğraf', description: 'Tam gerçekçi', prompt: 'photorealistic, 35mm lens, no distortion, authentic photography' },
    { id: 'fashion-editorial', name: 'Moda Çekimi (Editorial)', description: 'Stilize', prompt: 'fashion editorial camera style, 50mm lens, magazine quality, slight stylization' },
    { id: 'advertising', name: 'Reklam Çekimi (Clean & Stilize)', description: 'Reklam', prompt: 'advertising photography style, clean polished look, commercial quality, 35mm professional lens' }
  ];

  // Sabit Kısıtlamalar (Global Constraints)
  export const PROMPT_GLOBAL_CONSTRAINTS = 'preserve same person and same pose, no face change, no body distortion, realistic fabric folds, professional fashion photography';

  // Final prompt builder fonksiyonu
  export const buildPromptFromLayers = (layers: PromptLayers): string => {
    const parts: string[] = [];

    if (layers.concept) {
      const opt = PROMPT_CONCEPT_OPTIONS.find(o => o.id === layers.concept);
      if (opt) parts.push(opt.prompt);
    }
    if (layers.mood) {
      const opt = PROMPT_MOOD_OPTIONS.find(o => o.id === layers.mood);
      if (opt) parts.push(opt.prompt);
    }
    if (layers.background) {
      const opt = PROMPT_BACKGROUND_OPTIONS.find(o => o.id === layers.background);
      if (opt) parts.push(opt.prompt);
    }
    if (layers.composition) {
      const opt = PROMPT_COMPOSITION_OPTIONS.find(o => o.id === layers.composition);
      if (opt) parts.push(opt.prompt);
    }
    if (layers.lighting) {
      const opt = PROMPT_LIGHTING_OPTIONS.find(o => o.id === layers.lighting);
      if (opt) parts.push(opt.prompt);
    }
    if (layers.colorTone) {
      const opt = PROMPT_COLOR_TONE_OPTIONS.find(o => o.id === layers.colorTone);
      if (opt) parts.push(opt.prompt);
    }
    if (layers.camera) {
      const opt = PROMPT_CAMERA_OPTIONS.find(o => o.id === layers.camera);
      if (opt) parts.push(opt.prompt);
    }

    // Add global constraints
    if (parts.length > 0) {
      parts.push(PROMPT_GLOBAL_CONSTRAINTS);
    }

    return parts.join(', ');
  };

  // Erkek Moda Arka Plan Stilleri
  export const MENS_FASHION_BACKGROUND_STYLES = [
    { id: 'solid', name: 'Düz Renk', icon: '◼️', description: 'Temiz, sade stüdyo arka planı', supportsColor: true },
    { id: 'gradient', name: 'Gradient', icon: '🌅', description: 'Yumuşak renk geçişi', supportsColor: true },
    { id: 'studio-minimal', name: 'Studio Minimal', icon: '🎬', description: 'Premium editorial gradient backdrop', supportsColor: true, supportsVignette: true },
    { id: 'marble', name: 'Mermer', icon: '🪨', description: 'Lüks mermer doku', supportsColor: true },
    { id: 'concrete', name: 'Beton', icon: '🧱', description: 'Modern beton/sıva doku', supportsColor: true },
    { id: 'wood', name: 'Ahşap', icon: '🪵', description: 'Doğal ahşap panel duvar', supportsColor: false, supportsWoodType: true },
    { id: 'architectural', name: 'Mimari', icon: '🏛️', description: 'Sütunlar, kemerler, duvarlar', supportsColor: false },
    { id: 'studio', name: 'Stüdyo', icon: '📸', description: 'Profesyonel fotoğraf stüdyosu', supportsColor: true },
    { id: 'urban', name: 'Şehir', icon: '🏙️', description: 'Modern şehir ortamı', supportsColor: false },
    { id: 'nature', name: 'Doğa', icon: '🌿', description: 'Doğal yeşil alan', supportsColor: false },
    { id: 'minimal', name: 'Minimal', icon: '⬜', description: 'Ultra minimalist, sade', supportsColor: true },
    { id: 'textured', name: 'Dokulu', icon: '🎨', description: 'Artistik doku ve pattern', supportsColor: false },
  ];

  // Studio Minimal Gradient Renk Seçenekleri
  export const STUDIO_MINIMAL_GRADIENT_COLORS = [
    // === BEYAZ & KREM TONLARI ===
    { id: 'pure-white', name: 'Saf Beyaz', value: 'pure clean white', hex: '#FFFFFF' },
    { id: 'soft-white', name: 'Yumuşak Beyaz', value: 'soft warm white', hex: '#FAFAFA' },
    { id: 'ivory-cream', name: 'Krem (Ivory)', value: 'soft ivory cream', hex: '#F5F0E6' },
    { id: 'pearl', name: 'İnci Beyazı', value: 'pearl white with subtle warmth', hex: '#F0EDE5' },

    // === GRİ TONLARI ===
    { id: 'light-warm-gray', name: 'Açık Gri (Sıcak)', value: 'light warm gray', hex: '#C4BCAC' },
    { id: 'light-cool-gray', name: 'Açık Gri (Soğuk)', value: 'light cool gray', hex: '#B8C0C8' },
    { id: 'neutral-mid-gray', name: 'Orta Gri (Nötr)', value: 'neutral mid gray', hex: '#8C8C8C' },
    { id: 'silver-gray', name: 'Gümüş Gri', value: 'elegant silver gray', hex: '#A8A8A8' },
    { id: 'charcoal-gray', name: 'Koyu Gri (Charcoal)', value: 'charcoal gray', hex: '#4A4A4A' },
    { id: 'graphite', name: 'Antrasit (Graphite)', value: 'dark graphite gray', hex: '#3A3A3A' },
    { id: 'slate', name: 'Arduvaz', value: 'deep slate gray', hex: '#5A5A6E' },

    // === BEJ & TOPRAK TONLARI ===
    { id: 'warm-beige', name: 'Bej (Sıcak)', value: 'warm beige', hex: '#D4C4B0' },
    { id: 'sand', name: 'Kum Beji', value: 'soft sand beige', hex: '#E0D5C5' },
    { id: 'taupe', name: 'Taupe', value: 'elegant taupe', hex: '#8B7D6B' },
    { id: 'greige', name: 'Greige (Gri-Bej)', value: 'soft greige tone', hex: '#A89F91' },
    { id: 'light-stone', name: 'Açık Taş (Stone)', value: 'light stone gray', hex: '#B8B0A8' },
    { id: 'camel', name: 'Deve Tüyü', value: 'warm camel tone', hex: '#C4A77D' },
    { id: 'mocha', name: 'Mokka', value: 'rich mocha brown', hex: '#6B4423' },
    { id: 'espresso', name: 'Espresso', value: 'deep espresso brown', hex: '#3C2415' },
    { id: 'chocolate', name: 'Çikolata', value: 'dark chocolate brown', hex: '#3D2314' },

    // === MAVİ TONLARI ===
    { id: 'powder-blue', name: 'Pudra Mavisi', value: 'soft powder blue', hex: '#B0C4DE' },
    { id: 'sky-blue', name: 'Gök Mavisi', value: 'light sky blue', hex: '#87CEEB' },
    { id: 'steel-blue', name: 'Çelik Mavisi', value: 'steel blue', hex: '#4682B4' },
    { id: 'denim-blue', name: 'Denim Mavisi', value: 'classic denim blue', hex: '#5B7A99' },
    { id: 'ocean-blue', name: 'Okyanus Mavisi', value: 'deep ocean blue', hex: '#1A5276' },
    { id: 'deep-navy', name: 'Gece Mavisi (Navy)', value: 'deep navy blue', hex: '#1E3A5F' },
    { id: 'midnight-blue', name: 'Gece Yarısı', value: 'midnight blue', hex: '#191970' },
    { id: 'royal-blue', name: 'Kraliyet Mavisi', value: 'royal blue', hex: '#4169E1' },

    // === YEŞİL TONLARI ===
    { id: 'sage', name: 'Adaçayı', value: 'soft sage green', hex: '#9CAF88' },
    { id: 'olive', name: 'Zeytin Yeşili', value: 'olive green', hex: '#6B8E23' },
    { id: 'forest-green', name: 'Orman Yeşili', value: 'deep forest green', hex: '#2D5A3D' },
    { id: 'hunter-green', name: 'Avcı Yeşili', value: 'hunter green', hex: '#355E3B' },
    { id: 'emerald', name: 'Zümrüt', value: 'rich emerald green', hex: '#046307' },
    { id: 'teal', name: 'Deniz Mavisi-Yeşili', value: 'teal', hex: '#008080' },
    { id: 'mint', name: 'Nane Yeşili', value: 'soft mint green', hex: '#98D8C8' },

    // === PEMBE & MOR TONLARI ===
    { id: 'blush-pink', name: 'Pudra Pembe', value: 'soft blush pink', hex: '#F4C2C2' },
    { id: 'dusty-rose', name: 'Gül Kurusu', value: 'dusty rose', hex: '#C9A9A6' },
    { id: 'mauve', name: 'Eflatun', value: 'elegant mauve', hex: '#B784A7' },
    { id: 'lavender', name: 'Lavanta', value: 'soft lavender', hex: '#C4B7D7' },
    { id: 'lilac', name: 'Leylak', value: 'light lilac', hex: '#D8BFD8' },
    { id: 'plum', name: 'Erik Moru', value: 'deep plum', hex: '#5D3A5E' },
    { id: 'burgundy', name: 'Bordo', value: 'rich burgundy', hex: '#722F37' },
    { id: 'wine', name: 'Şarap Kırmızısı', value: 'deep wine red', hex: '#722F37' },

    // === TURUNCU & SARI TONLARI ===
    { id: 'peach', name: 'Şeftali', value: 'soft peach', hex: '#FFDAB9' },
    { id: 'apricot', name: 'Kayısı', value: 'warm apricot', hex: '#FBCEB1' },
    { id: 'terracotta', name: 'Terrakotta', value: 'warm terracotta', hex: '#C04000' },
    { id: 'rust', name: 'Pas Rengi', value: 'rustic rust', hex: '#B7410E' },
    { id: 'burnt-orange', name: 'Yanık Turuncu', value: 'burnt orange', hex: '#CC5500' },
    { id: 'mustard', name: 'Hardal', value: 'warm mustard yellow', hex: '#D4A84B' },
    { id: 'gold', name: 'Altın', value: 'elegant gold tone', hex: '#CFB53B' },
    { id: 'champagne', name: 'Şampanya', value: 'soft champagne', hex: '#F7E7CE' },

    // === KIRMIZI TONLARI ===
    { id: 'coral', name: 'Mercan', value: 'soft coral', hex: '#FF7F50' },
    { id: 'brick-red', name: 'Tuğla Kırmızısı', value: 'warm brick red', hex: '#CB4154' },
    { id: 'crimson', name: 'Koyu Kırmızı', value: 'deep crimson', hex: '#990000' },
    { id: 'cherry', name: 'Kiraz Kırmızısı', value: 'cherry red', hex: '#DE3163' },

    // === SİYAH & KOYU TONLAR ===
    { id: 'soft-black', name: 'Yumuşak Siyah', value: 'soft warm black', hex: '#1C1C1C' },
    { id: 'jet-black', name: 'Simsiyah', value: 'deep jet black', hex: '#0A0A0A' },
    { id: 'charcoal-black', name: 'Kömür Siyahı', value: 'rich charcoal black', hex: '#2C2C2C' },
  ];

  // Erkek Moda Arka Plan Renkleri
  export const MENS_FASHION_BACKGROUNDS = [
    { id: 'white', name: 'Beyaz', hex: '#FFFFFF', description: 'Temiz, sade stüdyo' },
    { id: 'light-gray', name: 'Açık Gri', hex: '#E5E5E5', description: 'Nötr, profesyonel' },
    { id: 'warm-gray', name: 'Sıcak Gri', hex: '#B8B0A8', description: 'Elegant, yumuşak' },
    { id: 'beige', name: 'Bej', hex: '#D4C4B0', description: 'Sıcak, premium his' },
    { id: 'cream', name: 'Krem', hex: '#F5F0E6', description: 'Yumuşak, lüks' },
    { id: 'ozel-bej', name: 'ÖZEL BEJ', hex: '#AA9885', description: 'Sıcak bej, stüdyo' },
    { id: 'ozel-bej-2', name: 'ÖZEL BEJ 2', hex: '#C2B5A6', description: 'Açık sıcak bej' },
    { id: 'ozel-bej-3', name: 'ÖZEL BEJ 3', hex: '#D0C6BA', description: 'Yumuşak kum tonu' },
    { id: 'ozel-bej-4', name: 'ÖZEL BEJ 4', hex: '#DED7CF', description: 'Açık gri-bej' },
    { id: 'taupe', name: 'Taupe', hex: '#8B7D6B', description: 'Sofistike, doğal' },
    { id: 'charcoal', name: 'Antrasit', hex: '#4A4A4A', description: 'Dramatik, modern' },
    { id: 'navy', name: 'Lacivert', hex: '#1E3A5F', description: 'Klasik, güvenilir' },
    { id: 'forest', name: 'Orman Yeşili', hex: '#2D4A3E', description: 'Doğal, sofistike' },
    { id: 'burgundy', name: 'Bordo', hex: '#722F37', description: 'Lüks, etkileyici' },
  ];

  export const MENS_FASHION_PURPOSE_OPTIONS = [
    { id: 'ecommerce', name: 'E-Ticaret', description: 'Shopify, Trendyol - temiz, net görünüm', icon: '🛒' },
    { id: 'catalog', name: 'Katalog', description: 'Premium marka kataloğu', icon: '📖' },
    { id: 'advertising', name: 'Reklam', description: 'Sinematik, güçlü etki', icon: '📺' },
  ];

  export const MENS_FASHION_POSE_OPTIONS = [
    { id: 'straight-standing', name: 'Düz Duruş', description: 'Dümdüz duruş - eller yanda, cebe el yok' },
    { id: 'neutral', name: 'Nötr Duruş', description: 'Düz, rahat duruş' },
    { id: 'confident', name: 'Kendinden Emin', description: 'Hafif açılı, güçlü duruş' },
    { id: 'walking', name: 'Yürüyüş', description: 'Doğal yürüme pozu' },
    { id: 'adjusting', name: 'Ceket Düzeltme', description: 'Ceketi düzeltiyor' },
    { id: 'hands-pocket', name: 'Eller Cepte', description: 'Rahat, eller cepte' },
    { id: 'leaning', name: 'Yaslanma', description: 'Hafif yaslanmış poz' },
    { id: 'crossed-arms', name: 'Kollar Kavuşuk', description: 'Güçlü, otoriter duruş' },
    { id: 'side-profile', name: 'Yan Profil', description: 'Yandan görünüm' },
    { id: 'three-quarter', name: '3/4 Açı', description: 'Hafif dönük, dinamik' },
    { id: 'sitting', name: 'Oturma', description: 'Rahat oturma pozu' },
    { id: 'turned-back', name: 'Sırt Görünümü', description: 'Arkadan görünüm' },
    { id: 'looking-away', name: 'Bakış Uzakta', description: 'Yana bakan, düşünceli' },
    { id: 'dynamic', name: 'Dinamik', description: 'Hareket halinde, enerjik' },
    { id: 'casual', name: 'Günlük', description: 'Rahat, doğal duruş' },
  ];

  // KADIN MODA MODU - WOMEN'S FASHION MODE
  export interface WomensFashionSettings {
    purpose: 'ecommerce' | 'catalog' | 'advertising';
    skinTone: string;
    poseStyle: string;
    background: string;
    backgroundStyle: string;
    numberOfImages: number;
    animal?: AnimalSettings;
    // Erkek Giyimden eklenen özellikler
    floorType?: string; // Zemin tipi - arka plandan bağımsız
    lightingStyle?: string; // Işık stili - soft, dramatic, natural, studio, high-key, low-key
    woodType?: string; // Ahşap tipi - backgroundStyle 'wood' olduğunda
    aspectRatio?: string; // Görsel en-boy oranı
    cameraFrame?: string; // Backward compat - mapped from shotScale
    cameraAngle?: string; // Kamera açısı - eye-level, slight-low, slight-high, low-angle, high-angle
    shotScale?: string; // Çekim ölçeği - prompt sekmesinden
    lens?: string; // Lens seçimi - prompt sekmesinden
    customPrompt?: string; // Kullanıcının özel talimatları
    collarType?: string; // Yaka tipi
    fabricType?: string; // Kumaş tipi
    spallaCamicia?: string; // Spalla Camicia (Gömlek Omuz) - full, half, none
    pleatType?: string; // Pile tipi
    trouserFit?: string; // Pantolon kesimi
    // Studio Minimal Gradient için özel ayarlar
    studioMinimalColor?: string;
    studioMinimalVignette?: boolean;
  }

  // REFERANSLI ÜRETİM MODU - POSE TRANSFER + FACE SWAP
  export interface ReferencedProductionSettings {
    preserveClothing: boolean; // Mankenin kıyafetlerini koru
    preserveFace: boolean; // Mankenin yüzünü kullan
    preserveHair: boolean; // Mankenin saç stilini koru
    matchLighting: boolean; // Referans fotoğrafın ışığına uyum
    preserveAngle: boolean; // Referans fotoğrafın açısını/kompozisyonunu koru
    preserveAspectRatio: boolean; // Referans fotoğrafın en-boy oranını koru
    selectedPose: string; // Seçilen poz ID'si
    numberOfImages: number;
    animal?: AnimalSettings; // Hayvan ekleme ayarları
    collarType?: string; // Yaka tipi (triko/kazak için)
    fabricType?: string; // Kumaş tipi (ceket için)
    shotType?: string; // Kadraj tipi (ELS, LS, MS, CU, vb.)
  }

  export const REFERENCED_PRODUCTION_DEFAULTS: ReferencedProductionSettings = {
    preserveClothing: true,
    preserveFace: true,
    preserveHair: true,
    matchLighting: true,
    preserveAngle: true, // Varsayılan: referans açısını koru
    preserveAspectRatio: true, // Varsayılan: referans en-boy oranını koru
    selectedPose: 'reference', // Varsayılan: referans fotoğraftan al
    numberOfImages: 1,
    animal: ANIMAL_DEFAULTS,
    collarType: 'auto',
    fabricType: 'auto',
    shotType: 'auto', // Varsayılan: referanstan al
  };

  // Referanslı üretim için poz seçenekleri - Vogue + Basit Pozlar
  export const REFERENCED_POSE_OPTIONS = [
    // Referans bazlı
    { id: 'reference', label: 'Referanstan Al', description: 'Referans fotoğraftaki pozu kullan', category: 'default' },

    // Basit / Klasik Pozlar
    { id: 'straight-standing', label: 'Düz Duruş', description: 'Klasik düz duruş - eller yanda aşağı sarkık, cebe el yok, kavuşturma yok, sadece düz duruş', category: 'basic' },
    { id: 'relaxed-standing', label: 'Rahat Duruş', description: 'Rahat, doğal ayakta duruş', category: 'basic' },
    { id: 'hands-on-hips', label: 'Eller Belde', description: 'Eller belde, özgüvenli duruş', category: 'basic' },
    { id: 'arms-crossed', label: 'Kollar Kavuşuk', description: 'Kollar göğüste kavuşuk', category: 'basic' },
    { id: 'one-hand-pocket', label: 'Tek El Cepte', description: 'Bir el cepte, rahat duruş', category: 'basic' },

    // Vogue / Editorial Pozlar
    { id: 'vogue-power', label: 'Vogue Power', description: 'Güçlü, dominant editorial duruş', category: 'vogue' },
    { id: 'vogue-elegant', label: 'Vogue Elegant', description: 'Zarif, sofistike poz', category: 'vogue' },
    { id: 'vogue-dynamic', label: 'Vogue Dynamic', description: 'Hareket hissi veren dinamik poz', category: 'vogue' },
    { id: 'vogue-asymmetric', label: 'Vogue Asymmetric', description: 'Asimetrik, ilgi çekici poz', category: 'vogue' },
    { id: 'vogue-contrapposto', label: 'Contrapposto', description: 'Klasik S-eğrisi vücut duruşu', category: 'vogue' },
    { id: 'vogue-editorial-lean', label: 'Editorial Lean', description: 'Hafif eğik, editorial duruş', category: 'vogue' },
    { id: 'vogue-high-fashion', label: 'High Fashion', description: 'Üst düzey moda çekimi pozu', category: 'vogue' },
    { id: 'vogue-runway', label: 'Runway', description: 'Podyum yürüyüşü pozu', category: 'vogue' },
    { id: 'vogue-fierce', label: 'Fierce', description: 'Keskin, güçlü bakış ve duruş', category: 'vogue' },
    { id: 'vogue-relaxed-chic', label: 'Relaxed Chic', description: 'Rahat ama şık editorial poz', category: 'vogue' },
  ];

  // Poz kategorileri
  export const POSE_CATEGORIES = [
    { id: 'default', label: 'Varsayılan', icon: '📷' },
    { id: 'basic', label: 'Basit Pozlar', icon: '🧍' },
    { id: 'vogue', label: 'Vogue / Editorial', icon: '✨' },
  ];

  // SAHNEYE YERLEŞTİRME MODU - SCENE PLACEMENT
  export interface ScenePlacementSettings {
    preserveClothing: boolean;
    preserveFace: boolean;
    preserveHair: boolean;
    poseInstruction: string; // Kullanıcının poz talimatı (boş bırakılırsa AI seçer)
    numberOfImages: number;
    animal?: AnimalSettings; // Hayvan ekleme ayarları
  }

  export const SCENE_PLACEMENT_DEFAULTS: ScenePlacementSettings = {
    preserveClothing: true,
    preserveFace: true,
    preserveHair: true,
    poseInstruction: '',
    numberOfImages: 1,
    animal: ANIMAL_DEFAULTS,
  };

  // ============================================
  // HAZIR SAHNE PRESET SİSTEMİ - BACKGROUND PRESETS
  // ============================================

  export interface BackgroundPresetGenerationSettings {
    aspectRatio: string;
    cfgScale: number;
    steps: number;
    seed: number;
    style: string[];
  }

  export interface BackgroundPreset {
    id: string;
    name: string;
    category: 'luxury' | 'modern' | 'classic' | 'editorial' | 'nature';
    thumbnail?: string;
    prompt: string;
    negativePrompt: string;
    generationSettings: BackgroundPresetGenerationSettings;
    locked: boolean;
  }

  export interface PresetProductionSettings {
    selectedPreset: string | null;
    numberOfImages: number;
    // Model özellikleri (sıfırdan oluşturulacak)
    skinTone: string;
    poseStyle: string;
    // Ek kıyafetler için
    useAdditionalClothes: boolean;
    // Görsel oranı
    aspectRatio: '3:4' | '2:3' | '1:1' | '4:5' | '9:16';
    // Kamera açısı
    cameraAngle: 'eye-level' | 'slight-low' | 'slight-high' | 'low-angle' | 'high-angle';
    // Setli üretim - her açıdan 1 fotoğraf
    useAngleSet: boolean;
    // Model boyutu/kamera uzaklığı
    modelScale: 'close' | 'medium' | 'far' | 'very-far';
  }

  export const PRESET_PRODUCTION_DEFAULTS: PresetProductionSettings = {
    selectedPreset: null,
    numberOfImages: 1,
    skinTone: 'medium',
    poseStyle: 'natural',
    useAdditionalClothes: false,
    aspectRatio: '3:4', // E-ticaret için ideal dikey oran
    cameraAngle: 'eye-level', // Göz hizası - en doğal görünüm
    useAngleSet: false, // Setli üretim kapalı
    modelScale: 'medium', // Orta mesafe - varsayılan
  };

  // Model boyutu/kamera uzaklığı seçenekleri
  export const PRESET_MODEL_SCALES = [
    { id: 'close', label: 'Yakın', desc: 'Detaylı çekim', scaleRange: '40-50%', cameraDistance: '4-5m', icon: '🔍' },
    { id: 'medium', label: 'Orta', desc: 'Standart e-ticaret', scaleRange: '30-40%', cameraDistance: '6-7m', icon: '👤' },
    { id: 'far', label: 'Uzak', desc: 'Tam boy görünüm', scaleRange: '22-30%', cameraDistance: '8-10m', icon: '🚶' },
    { id: 'very-far', label: 'Çok Uzak', desc: 'Geniş sahne', scaleRange: '15-22%', cameraDistance: '12-15m', icon: '🏛️' },
  ] as const;

  // Preset aspect ratio seçenekleri
  export const PRESET_ASPECT_RATIOS = [
    { id: '3:4', label: '3:4', desc: 'E-ticaret' },
    { id: '2:3', label: '2:3', desc: 'Portre' },
    { id: '4:5', label: '4:5', desc: 'Instagram' },
    { id: '1:1', label: '1:1', desc: 'Kare' },
    { id: '9:16', label: '9:16', desc: 'Story' },
  ] as const;

  // Preset kamera açısı seçenekleri
  export const PRESET_CAMERA_ANGLES = [
    { id: 'eye-level', label: 'Göz Hizası', desc: 'Standart, doğal görünüm', icon: '👁️' },
    { id: 'slight-low', label: 'Hafif Alt', desc: 'Güçlü, dominant görünüm', icon: '⬆️' },
    { id: 'slight-high', label: 'Hafif Üst', desc: 'Zarif, ince görünüm', icon: '⬇️' },
    { id: 'low-angle', label: 'Alt Açı', desc: 'Dramatik, heybetli', icon: '🔼' },
    { id: 'high-angle', label: 'Üst Açı', desc: 'Editorial, sanatsal', icon: '🔽' },
  ] as const;

  // Hazır Sahne Preset'leri
  export const BACKGROUND_PRESETS: BackgroundPreset[] = [
    {
      id: 'BACKGROUND_PRESET_CLASSIC_WOOD_01',
      name: 'Classic Wood Interior',
      category: 'luxury',
      prompt: 'An elegant classical interior room with rich dark walnut wood wall paneling, ornate carved wooden moldings, warm ambient lighting from hidden sources, polished marble floor with subtle reflections, vintage brass wall sconces, deep burgundy velvet curtains partially visible, sophisticated luxury editorial photography setting, museum-quality interior, no furniture, empty space for model placement, professional fashion photography backdrop, 8k ultra detailed, photorealistic',
      negativePrompt: 'people, human, portrait, character, modern furniture, sofa, chair, bed, table, cluttered, messy, low quality, blurry, cartoon, anime, illustration, painting, drawing, art, sketch',
      generationSettings: {
        aspectRatio: '2:3',
        cfgScale: 7,
        steps: 35,
        seed: 482913,
        style: ['photorealistic', 'editorial', 'architectural']
      },
      locked: true
    },
    {
      id: 'BACKGROUND_PRESET_MARBLE_HALL_01',
      name: 'White Marble Hall',
      category: 'luxury',
      prompt: 'A grand luxurious hall with pristine white Carrara marble walls and floors, tall Corinthian columns, soft diffused natural light from large arched windows, subtle golden accents on moldings, minimalist empty space, high ceiling with elegant classical details, museum-like atmosphere, clean reflective marble surfaces, professional fashion photography setting, editorial quality, 8k ultra detailed, photorealistic',
      negativePrompt: 'people, human, portrait, character, furniture, statues, sculptures, cluttered, messy, dark, gloomy, low quality, blurry, cartoon, anime',
      generationSettings: {
        aspectRatio: '2:3',
        cfgScale: 7,
        steps: 35,
        seed: 729461,
        style: ['photorealistic', 'editorial', 'architectural', 'minimalist']
      },
      locked: true
    },
    {
      id: 'BACKGROUND_PRESET_MODERN_STUDIO_01',
      name: 'Modern Minimalist Studio',
      category: 'modern',
      prompt: 'A contemporary minimalist photography studio with smooth concrete walls painted in warm off-white, large floor-to-ceiling windows with soft natural daylight, polished concrete floor, subtle gradient lighting, clean geometric lines, Scandinavian design influence, empty professional space, fashion photography setting, soft shadows, neutral tones, 8k ultra detailed, photorealistic',
      negativePrompt: 'people, human, portrait, character, furniture, equipment, cameras, lights, cluttered, colorful, busy, low quality, blurry, cartoon, anime',
      generationSettings: {
        aspectRatio: '2:3',
        cfgScale: 7,
        steps: 35,
        seed: 156832,
        style: ['photorealistic', 'minimalist', 'contemporary']
      },
      locked: true
    },
    {
      id: 'BACKGROUND_PRESET_DARK_EDITORIAL_01',
      name: 'Dark Editorial Space',
      category: 'editorial',
      prompt: 'A dramatic dark editorial photography space with deep charcoal grey walls, moody atmospheric lighting with single dramatic light source from above, subtle smoke or haze effect, matte black floor, film noir aesthetic, high fashion editorial setting, theatrical shadows, mysterious ambiance, professional magazine quality backdrop, empty space for model, 8k ultra detailed, photorealistic',
      negativePrompt: 'people, human, portrait, character, furniture, bright colors, cheerful, cluttered, low quality, blurry, cartoon, anime, illustration',
      generationSettings: {
        aspectRatio: '2:3',
        cfgScale: 7,
        steps: 35,
        seed: 893214,
        style: ['photorealistic', 'editorial', 'dramatic', 'moody']
      },
      locked: true
    },
    {
      id: 'BACKGROUND_PRESET_URBAN_CONCRETE_01',
      name: 'Urban Concrete',
      category: 'modern',
      prompt: 'An industrial urban setting with raw exposed concrete walls showing beautiful texture and patina, large metal-framed factory windows with soft diffused daylight, weathered concrete floor, minimalist brutalist architecture, underground fashion space aesthetic, edgy contemporary backdrop, steel structural elements visible, professional street fashion photography setting, 8k ultra detailed, photorealistic',
      negativePrompt: 'people, human, portrait, character, furniture, graffiti, trash, messy, abandoned look, dangerous, low quality, blurry, cartoon, anime',
      generationSettings: {
        aspectRatio: '2:3',
        cfgScale: 7,
        steps: 35,
        seed: 347621,
        style: ['photorealistic', 'industrial', 'urban', 'brutalist']
      },
      locked: true
    },
    {
      id: 'BACKGROUND_PRESET_GOLDEN_HOUR_01',
      name: 'Golden Hour Terrace',
      category: 'nature',
      prompt: 'A luxurious Mediterranean terrace at golden hour, warm sunset light casting long shadows, elegant stone balustrade with classical details, distant sea view with soft bokeh, terracotta tiles on floor, olive trees in soft focus background, romantic Italian Riviera atmosphere, professional fashion photography setting, cinematic warm color grading, 8k ultra detailed, photorealistic',
      negativePrompt: 'people, human, portrait, character, furniture, chairs, tables, cluttered, cold colors, harsh lighting, low quality, blurry, cartoon, anime',
      generationSettings: {
        aspectRatio: '2:3',
        cfgScale: 7,
        steps: 35,
        seed: 581947,
        style: ['photorealistic', 'cinematic', 'golden hour', 'romantic']
      },
      locked: true
    },
    {
      id: 'BACKGROUND_PRESET_VELVET_LOUNGE_01',
      name: 'Velvet Lounge',
      category: 'luxury',
      prompt: 'An opulent lounge interior with deep emerald green velvet walls, art deco gold geometric patterns, warm amber lighting from crystal chandeliers, polished dark wood flooring, luxurious 1920s aesthetic, Great Gatsby era elegance, professional high fashion editorial setting, empty sophisticated space, museum quality interior, 8k ultra detailed, photorealistic',
      negativePrompt: 'people, human, portrait, character, modern furniture, contemporary items, cluttered, cheap looking, low quality, blurry, cartoon, anime',
      generationSettings: {
        aspectRatio: '2:3',
        cfgScale: 7,
        steps: 35,
        seed: 264815,
        style: ['photorealistic', 'art deco', 'luxury', 'vintage']
      },
      locked: true
    },
    {
      id: 'BACKGROUND_PRESET_JAPANESE_ZEN_01',
      name: 'Japanese Zen Space',
      category: 'classic',
      prompt: 'A serene Japanese minimalist interior with warm natural wood walls, traditional shoji screen panels with soft diffused light, tatami floor texture, clean zen aesthetic, single ikebana arrangement in corner, subtle wabi-sabi elements, peaceful contemplative atmosphere, professional fashion photography setting, muted earth tones, 8k ultra detailed, photorealistic',
      negativePrompt: 'people, human, portrait, character, western furniture, cluttered, busy patterns, bright colors, modern items, low quality, blurry, cartoon, anime',
      generationSettings: {
        aspectRatio: '2:3',
        cfgScale: 7,
        steps: 35,
        seed: 419736,
        style: ['photorealistic', 'minimalist', 'zen', 'japanese']
      },
      locked: true
    }
  ];

  // Preset kategorileri
  export const PRESET_CATEGORIES = [
    { id: 'all', name: 'Tümü', icon: '🎨' },
    { id: 'luxury', name: 'Lüks', icon: '👑' },
    { id: 'modern', name: 'Modern', icon: '🏙️' },
    { id: 'classic', name: 'Klasik', icon: '🏛️' },
    { id: 'editorial', name: 'Editorial', icon: '📸' },
    { id: 'nature', name: 'Doğa', icon: '🌿' }
  ];

  // Hazır poz önerileri
  export const POSE_SUGGESTIONS = [
    { id: 'auto', label: 'Otomatik', description: 'AI en uygun pozu seçsin' },
    { id: 'standing', label: 'Ayakta', description: 'Düz, elegant duruş' },
    { id: 'walking', label: 'Yürüyüş', description: 'Doğal yürüme pozu' },
    { id: 'sitting', label: 'Oturma', description: 'Oturur pozisyon' },
    { id: 'leaning', label: 'Yaslanma', description: 'Bir yere yaslanmış' },
    { id: 'dynamic', label: 'Dinamik', description: 'Hareket halinde' },
  ];

  // Kadın Moda Arka Plan Stilleri
  export const WOMENS_FASHION_BACKGROUND_STYLES = [
    { id: 'solid', name: 'Düz Renk', icon: '◼️', description: 'Temiz, sade stüdyo arka planı', supportsColor: true },
    { id: 'gradient', name: 'Gradient', icon: '🌅', description: 'Yumuşak renk geçişi', supportsColor: true },
    { id: 'marble', name: 'Mermer', icon: '🪨', description: 'Lüks mermer doku', supportsColor: true },
    { id: 'concrete', name: 'Beton', icon: '🧱', description: 'Modern beton/sıva doku', supportsColor: true },
    { id: 'architectural', name: 'Mimari', icon: '🏛️', description: 'Sütunlar, kemerler, duvarlar', supportsColor: false },
    { id: 'studio', name: 'Stüdyo', icon: '📸', description: 'Profesyonel fotoğraf stüdyosu', supportsColor: true },
    { id: 'floral', name: 'Çiçekli', icon: '🌸', description: 'Zarif çiçek desenleri', supportsColor: false },
    { id: 'nature', name: 'Doğa', icon: '🌿', description: 'Doğal yeşil alan', supportsColor: false },
    { id: 'minimal', name: 'Minimal', icon: '⬜', description: 'Ultra minimalist, sade', supportsColor: true },
    { id: 'elegant', name: 'Elegant', icon: '✨', description: 'Lüks, sofistike ortam', supportsColor: false },
  ];

  // Kadın Moda Arka Plan Renkleri
  export const WOMENS_FASHION_BACKGROUNDS = [
    { id: 'white', name: 'Beyaz', hex: '#FFFFFF', description: 'Temiz, sade stüdyo' },
    { id: 'soft-pink', name: 'Pudra Pembe', hex: '#F5E1E9', description: 'Feminen, zarif' },
    { id: 'blush', name: 'Allık', hex: '#E8C4C4', description: 'Romantik, yumuşak' },
    { id: 'cream', name: 'Krem', hex: '#F5F0E6', description: 'Yumuşak, lüks' },
    { id: 'beige', name: 'Bej', hex: '#D4C4B0', description: 'Sıcak, premium his' },
    { id: 'lavender', name: 'Lavanta', hex: '#E6E0F0', description: 'Zarif, modern' },
    { id: 'sage', name: 'Adaçayı', hex: '#B8C4B8', description: 'Doğal, huzurlu' },
    { id: 'dusty-rose', name: 'Gül Kurusu', hex: '#C9A9A6', description: 'Sofistike, şık' },
    { id: 'charcoal', name: 'Antrasit', hex: '#4A4A4A', description: 'Dramatik, modern' },
    { id: 'burgundy', name: 'Bordo', hex: '#722F37', description: 'Lüks, etkileyici' },
  ];

  export const WOMENS_FASHION_PURPOSE_OPTIONS = [
    { id: 'ecommerce', name: 'E-Ticaret', description: 'Shopify, Trendyol - temiz, net görünüm', icon: '🛒' },
    { id: 'catalog', name: 'Katalog', description: 'Premium marka kataloğu', icon: '📖' },
    { id: 'advertising', name: 'Reklam', description: 'Sinematik, güçlü etki', icon: '📺' },
  ];

  export const WOMENS_FASHION_POSE_OPTIONS = [
    { id: 'straight-standing', name: 'Düz Duruş', description: 'Dümdüz duruş - eller yanda, cebe el yok' },
    { id: 'neutral', name: 'Nötr Duruş', description: 'Düz, zarif duruş' },
    { id: 'elegant', name: 'Elegant', description: 'Zarif, sofistike poz' },
    { id: 'walking', name: 'Yürüyüş', description: 'Doğal yürüme pozu' },
    { id: 'hand-on-hip', name: 'El Belde', description: 'Kendinden emin, güçlü' },
    { id: 'relaxed', name: 'Rahat', description: 'Doğal, rahat duruş' },
    { id: 'dynamic', name: 'Dinamik', description: 'Hafif hareket, enerji' },
  ];

  // Çekim Tipleri
  export const JEWELRY_SHOOTING_TYPES = [
    { id: 'velvet-stand', name: 'Kadife Ürün Standı', icon: '🎀', description: 'Lüks kadife stand üzerinde ürün gösterimi' },
    { id: 'on-model', name: 'Model Üzerinde', icon: '👤', description: 'Minimal model çekimi - boyun/bilek görünümü' },
    { id: 'macro-detail', name: 'Makro Detay', icon: '🔍', description: 'Yakın çekim - işçilik ve kalite detayları' },
  ];

  // Ürün Standı Renkleri (Sadece velvet-stand için)
  export const JEWELRY_STAND_COLORS = [
    { id: 'burgundy', name: 'Bordo Kadife', hex: '#722F37' },
    { id: 'wine', name: 'Şarap Kırmızısı', hex: '#8B2252' },
    { id: 'dark-green', name: 'Koyu Yeşil Kadife', hex: '#1B4D3E' },
    { id: 'navy', name: 'Lacivert Kadife', hex: '#1a1a4e' },
    { id: 'black', name: 'Siyah Kadife', hex: '#1a1a1a' },
    { id: 'emerald', name: 'Zümrüt Yeşil', hex: '#046307' },
    { id: 'royal-purple', name: 'Mor Kadife', hex: '#4B0082' },
    { id: 'champagne', name: 'Şampanya', hex: '#D4AF37' },
    { id: 'rose-gold', name: 'Rose Gold', hex: '#B76E79' },
    { id: 'ivory', name: 'Fildişi', hex: '#FFFFF0' },
    { id: 'charcoal', name: 'Antrasit', hex: '#36454F' },
    { id: 'teal', name: 'Petrol Yeşili', hex: '#008080' },
    { id: 'plum', name: 'Erik Moru', hex: '#8E4585' },
    { id: 'chocolate', name: 'Çikolata', hex: '#3D2314' },
    { id: 'cream', name: 'Krem', hex: '#FFFDD0' },
  ];

  // Arka Plan Seçenekleri (Çekim tipine göre değişir)
  export const JEWELRY_BACKGROUNDS = {
    'velvet-stand': [
      { id: 'burgundy-velvet', name: 'Bordo Kadife', description: 'Lüks showroom hissi' },
      { id: 'wine-velvet', name: 'Şarap Kadife', description: 'Sıcak ve elegant' },
      { id: 'gradient-dark', name: 'Koyu Gradyan', description: 'Dramatik ve profesyonel' },
      { id: 'navy-velvet', name: 'Lacivert Kadife', description: 'Klasik ve sofistike' },
      { id: 'emerald-velvet', name: 'Zümrüt Yeşil Kadife', description: 'Doğal lüks his' },
      { id: 'black-velvet', name: 'Siyah Kadife', description: 'Maksimum kontrast' },
      { id: 'champagne-velvet', name: 'Şampanya Kadife', description: 'Zarif ve yumuşak' },
      { id: 'royal-purple', name: 'Mor Kadife', description: 'Asil ve dikkat çekici' },
      { id: 'marble-white', name: 'Beyaz Mermer', description: 'Modern ve şık' },
      { id: 'marble-black', name: 'Siyah Mermer', description: 'Lüks ve dramatik' },
    ],
    'on-model': [
      { id: 'off-white', name: 'Açık Krem', description: 'Temiz ve minimal' },
      { id: 'soft-white', name: 'Soft Beyaz', description: 'Saf ve modern' },
      { id: 'light-gray', name: 'Açık Gri', description: 'Nötr ve profesyonel' },
      { id: 'beige', name: 'Bej', description: 'Sıcak ve doğal' },
      { id: 'blush-pink', name: 'Pudra Pembe', description: 'Feminen ve zarif' },
      { id: 'soft-blue', name: 'Soft Mavi', description: 'Ferah ve modern' },
      { id: 'warm-taupe', name: 'Taupe', description: 'Sofistike nötr' },
      { id: 'ivory', name: 'Fildişi', description: 'Klasik ve temiz' },
    ],
    'macro-detail': [
      { id: 'blur-white', name: 'Beyaz Blur', description: 'Saf beyaz arka plan - e-ticaret için ideal' },
      { id: 'blur-dark', name: 'Koyu Blur', description: 'Odak tamamen üründe' },
      { id: 'blur-velvet', name: 'Kadife Blur', description: 'Yumuşak ve lüks' },
      { id: 'blur-neutral', name: 'Nötr Blur', description: 'Temiz detay çekimi' },
      { id: 'blur-gradient', name: 'Gradyan Blur', description: 'Derinlik hissi' },
      { id: 'blur-gold', name: 'Altın Blur', description: 'Sıcak lüks his' },
      { id: 'blur-silver', name: 'Gümüş Blur', description: 'Soğuk metal uyumu' },
      { id: 'blur-black', name: 'Siyah Blur', description: 'Maksimum odak' },
      { id: 'blur-cream', name: 'Krem Blur', description: 'Yumuşak ve zarif' },
    ],
  };

  // Amaç Seçenekleri
  export const JEWELRY_PURPOSE_OPTIONS = [
    { id: 'shopify', name: 'E-Ticaret', description: 'Shopify, Trendyol, Amazon için optimize' },
    { id: 'catalog', name: 'Katalog', description: 'Basılı veya dijital katalog görseli' },
    { id: 'ad', name: 'Reklam', description: 'Meta, Google Ads, Banner için' },
  ];
  
  export interface GeneratedImage {
    id: string;
    url: string;
    prompt: string;
    timestamp: number;
    mimeType: string;
  }

  export interface ImageFilterSettings {
    brightness: number; 
    contrast: number;   
    saturation: number; 
  }

  // --- NEW AD CREATIVE TYPES ---
  export interface AdSettings {
    platform: string;
    theme: string;
    targetAudience: string; // Kept for interface compatibility but hidden in UI
    customText: string; // Kept for interface compatibility but hidden in UI
    productUrl?: string; // NEW: Link for product research
    modelQuality: string;
    pose: string; // Added Pose to AdSettings
    numberOfImages: number; // NEW: Control variation count
    fontStyle: string; // NEW: Font selection
    specificVariationId?: string; // NEW: v1-v10 selection
    priceTag?: string; // NEW: Price tag with arrow (e.g. "500")
    productName?: string; // NEW: Product Name label (e.g. "Silk Blouse")
    season?: string; // NEW: Mevsim Selection
    weather?: string; // NEW: Hava Durumu Selection
    customPrompt?: string;
    studioStyle?: string; // Studio background style (solid, gradient, concrete, etc.)
    studioColor?: string; // Studio background color hex (e.g. #FFFFFF)
  }

  export interface AdCopy {
    headline: string;
    subHeadline: string;
    cta: string; 
    colorHex: string; 
  }

  // NEW: Metadata to track how an ad was made so we can generate similar ones
  export interface AdCreativeMetadata {
    backgroundPrompt: string;
    copy: AdCopy;
    fontStyle: string;
    poseInstruction: string;
    theme: string;
    priceTag?: string;
    productName?: string;
    aspectRatio: string; // NEW: Persist the aspect ratio
    season?: string; // NEW
    weather?: string; // NEW
  }

  // NEW: Result object for Ad Creative
  export interface AdCreativeResult {
    id: string;
    imageUrl: string;
    metadata: AdCreativeMetadata;
  }

  // --- COLLECTION MODE TYPES ---
  export interface CollectionMetadata {
    customPrompt: string;
    numberOfImages: number;
  }

  export interface CollectionResult {
    id: string;
    imageUrl: string;
    metadata: CollectionMetadata;
  }

  // --- THEME VARIATIONS STRUCTURE ---
  export interface AdThemeVariation {
    id: string;
    label: string;
    prompt: string;
  }

  export const AD_THEMES = [
    'Minimalist Modern (Temiz)',
    'Klasik Mimari / Old Money (Bej & Toprak)', // NEW THEME BASED ON INPUT
    'Lüks / Premium (Koyu & Altın)',
    'Canlı & Enerjik (Renkli)',
    'Yaz / Tatil Vibe',
    'Sokak Stili (Urban)',
    'Kurumsal / Profesyonel',
    'Sinematik / Dramatik',
    'Doğal / Organik',
    'Stüdyo (Studio)'
  ];

  export const AD_THEME_VARIATIONS: Record<string, AdThemeVariation[]> = {
    'Minimalist Modern (Temiz)': [
        { id: 'v1', label: 'v1 - Güneşli Sanat Galerisi (Beyaz Beton)', prompt: "A real sunlit corner of a modern art gallery with white concrete walls and a polished light wood floor. Sharp natural shadows. Photorealistic." },
        { id: 'v2', label: 'v2 - İskandinav Oturma Odası (Bej)', prompt: "A clean Scandinavian living room with real beige linen furniture and large windows overlooking a blurred quiet street. Natural daylight." },
        { id: 'v3', label: 'v3 - Dış Mekan Beton Plaza (Mavi Gökyüzü)', prompt: "A real outdoor concrete plaza with minimalist architecture, bright daylight, and clear blue sky. Realistic texture." },
        { id: 'v4', label: 'v4 - Müze Merdivenleri (Mermer)', prompt: "A white marble staircase in a modern museum, soft daylight filtering from a real skylight. High-end photography." },
        { id: 'v5', label: 'v5 - Taş Veranda (Zeytin Ağacı)', prompt: "A simple wooden table on a stone patio, with a real white stucco wall in the background and an olive tree branch. Sunlight." },
        { id: 'v6', label: 'v6 - Beyaz Yatak Odası (Sabah Işığı)', prompt: "A minimal white bedroom interior with rumpled linen sheets and morning light hitting a textured wall." },
        { id: 'v7', label: 'v7 - Ham Beton Duvar (Ağaç Gölgesi)', prompt: "A raw concrete wall outdoors with the shadow of a tree branch falling across it. High contrast natural light." },
        { id: 'v8', label: 'v8 - Akdeniz Terası (Seramik Zemin)', prompt: "A clean ceramic tile floor on a terrace with a white parapet and blue sky. Mediterranean minimalist vibe." },
        { id: 'v9', label: 'v9 - Pencere Kenarı (Bahçe Manzaralı)', prompt: "A large window seat in a modern home with white cushions, looking out onto a green garden (blurred)." },
        { id: 'v10', label: 'v10 - Beyaz Çalışma Masası (Geometrik)', prompt: "A pristine white desk setup in a sun-drenched room with sharp geometric shadows. Real workspace." },
        // EXTENDED VARIATIONS (Inspired by user's Limestone/Beige images)
        { id: 'v11', label: 'v11 - Kireç Taşı Kemer (Limestone Arch)', prompt: "A grand limestone archway with warm beige tones, soft natural light, and architectural depth. Old money aesthetic. Photorealistic stone texture." },
        { id: 'v12', label: 'v12 - Klasik Duvar Çıtaları (Krem)', prompt: "A cream-colored wall with intricate classical moldings (boiserie), soft warm sunlight hitting the surface. Parisian apartment vibe." },
        { id: 'v13', label: 'v13 - Taş Sütunlar (Müze Dışı)', prompt: "Classical stone columns in a row, warm sandstone texture, soft daylight shadows. Museum or historical building exterior." },
        { id: 'v14', label: 'v14 - Çift Tonlu Duvar (Bej/Kahve)', prompt: "A minimalist wall divided horizontally: light beige plaster on top, dark chocolate brown paint on bottom. Clean geometric look." },
        { id: 'v15', label: 'v15 - Taş Avlu (Zeytin Yeşili)', prompt: "An enclosed stone courtyard with paving stones, warm earth tones, and soft diffuse lighting. High-end architectural background." },
        { id: 'v16', label: 'v16 - Ahşap Kapı & Taş Duvar', prompt: "A warm beige stone wall featuring a rich oak wooden door in the background. Soft, welcoming natural light." },
        { id: 'v17', label: 'v17 - Traverten Duvar (Güneşli)', prompt: "A textured travertine stone wall bathed in warm sunlight, creating soft shadows. Natural and expensive material look." },
        { id: 'v18', label: 'v18 - Klasik Korkuluklar (Balkon)', prompt: "A limestone balcony with classical balustrades, overlooking a blurred soft city background. Elegant atmosphere." },
        { id: 'v19', label: 'v19 - Dokulu Stüdyo (Bej)', prompt: "A studio background with a hand-painted canvas backdrop in mottled beige and sand tones. Fine art portrait style." },
        { id: 'v20', label: 'v20 - Kemerli Koridor (Derinlik)', prompt: "A long corridor with repeated stone arches, warm light filtering from the side. Perspective and depth." },
        { id: 'v21', label: 'v21 - Minimalist Mutfak (Mermer)', prompt: "A clean white kitchen with marble countertops and natural light from a window. Modern minimalism." },
        { id: 'v22', label: 'v22 - Kütüphane Rafları (Beyaz)', prompt: "White minimalist bookshelves with few objects, soft ambient light. Intellectual clean space." },
        { id: 'v23', label: 'v23 - Saf Beyaz Stüdyo (Gölge)', prompt: "A pure white studio with dramatic single shadow from off-frame window. High-key photography." },
        { id: 'v24', label: 'v24 - Cam Teras (Gökyüzü)', prompt: "A modern glass terrace with white railings and expansive blue sky view. Airy and open." },
        { id: 'v25', label: 'v25 - Beton Merdiven (Geometrik)', prompt: "A geometric concrete staircase with clean lines and sharp shadows. Architectural photography." },
        { id: 'v26', label: 'v26 - Boş Galeri (Yüksek Tavan)', prompt: "An empty art gallery space with high white walls and polished concrete floor. Museum quality." },
        { id: 'v27', label: 'v27 - Minimalist Ofis (Cam)', prompt: "A bright office space with glass partitions and white furniture. Corporate minimalism." },
        { id: 'v28', label: 'v28 - Beyaz Banyo (Seramik)', prompt: "A white bathroom with ceramic tiles and natural daylight. Clean spa aesthetic." },
        { id: 'v29', label: 'v29 - Açık Balkon (Sıva)', prompt: "A white-plastered balcony with simple iron railing and Mediterranean light. Pure simplicity." },
        { id: 'v30', label: 'v30 - Minimalist Koridor (Led)', prompt: "A white corridor with hidden LED strip lighting creating soft ambient glow. Modern architecture." }
    ],
    'Klasik Mimari / Old Money (Bej & Toprak)': [
        // NEW THEME - PURELY BASED ON USER INPUT IMAGES
        { id: 'v1', label: 'v1 - Büyük Taş Kemer (Albert Style)', prompt: "A massive limestone archway architecture, warm beige stone texture, soft cinematic lighting. High-end 'Old Money' aesthetic." },
        { id: 'v2', label: 'v2 - Klasik Sütunlu Yol', prompt: "A pathway lined with classical sandstone columns. Warm earth tones, soft shadows, historical luxury vibe." },
        { id: 'v3', label: 'v3 - Ahşap Kapı ve Taş', prompt: "A centered composition with a heavy oak door set into a warm beige stone wall. Symmetry and elegance." },
        { id: 'v4', label: 'v4 - Çift Renk Duvar (Geometrik)', prompt: "A wall painted in two tones: Cream beige on top, deep olive/brown on bottom. Minimalist but warm." },
        { id: 'v5', label: 'v5 - Paris Apartmanı (Pencere)', prompt: "Interior of a classical Parisian apartment with tall windows, cream walls, and herringbone wood floor. Soft daylight." },
        { id: 'v6', label: 'v6 - Müze Avlusu (Güneş)', prompt: "A wide open museum courtyard with pale stone floors and walls, bathed in warm afternoon sun." },
        { id: 'v7', label: 'v7 - Dokulu Kanvas (Portre)', prompt: "A fine-art photography background with a textured, mottled beige and brown canvas. Studio quality." },
        { id: 'v8', label: 'v8 - Merdiven Boşluğu (Mermer)', prompt: "A spiral staircase with warm marble steps and iron railing, soft ambient light from above." },
        { id: 'v9', label: 'v9 - Kütüphane Duvarı (Ahşap)', prompt: "A blurred background of a classical library with warm wood shelving and leather tones. Intellectual luxury." },
        { id: 'v10', label: 'v10 - Taş Zemin & Gökyüzü', prompt: "Low angle shot against a beige stone wall with a glimpse of soft blue sky. Clean and architectural." },
        { id: 'v11', label: 'v11 - Gotik Katedral (İç)', prompt: "Interior of a gothic cathedral with high vaulted ceilings, warm stone, filtered light through stained glass." },
        { id: 'v12', label: 'v12 - Manor Ev (Giriş)', prompt: "Grand entrance hall of an English manor house with marble floors and classical paintings. Old wealth." },
        { id: 'v13', label: 'v13 - Versailles Ayna Salonu', prompt: "A corridor inspired by Palace of Versailles with ornate mirrors and gold details. Royal elegance." },
        { id: 'v14', label: 'v14 - Toskana Villa (Avlu)', prompt: "A Tuscan villa courtyard with terracotta tiles and aged stucco walls. Warm Italian charm." },
        { id: 'v15', label: 'v15 - Taş Şömine (Salon)', prompt: "A living room with a massive stone fireplace and antique furniture. Heritage home." },
        { id: 'v16', label: 'v16 - Viyana Opera (Balkon)', prompt: "Opera house balcony with velvet seats and ornate railings. Cultural aristocracy." },
        { id: 'v17', label: 'v17 - Arnavut Kaldırımı', prompt: "Cobblestone street in an old European town, warm afternoon light on stone buildings." },
        { id: 'v18', label: 'v18 - Antik Roma Ruinleri', prompt: "Ancient Roman ruins with weathered columns and warm golden hour light. Historical grandeur." },
        { id: 'v19', label: 'v19 - İngiliz Bahçe Duvarı', prompt: "An aged brick garden wall with climbing ivy and soft natural light. Countryside estate." },
        { id: 'v20', label: 'v20 - Barok Tavan (Altın)', prompt: "Looking up at a baroque ceiling with gold leaf frescoes. Palace interior." },
        { id: 'v21', label: 'v21 - Sandstone Köprü', prompt: "An old sandstone bridge archway with river view. Classical engineering." },
        { id: 'v22', label: 'v22 - Kastil Salonları', prompt: "Castle great hall with high stone walls and tapestries. Medieval nobility." },
        { id: 'v23', label: 'v23 - Mozaik Zemin (Roma)', prompt: "Ancient Roman mosaic floor tiles in earth tones. Archaeological luxury." },
        { id: 'v24', label: 'v24 - Cambridge Üniversite', prompt: "University quadrangle with old stone buildings and manicured lawn. Academic prestige." },
        { id: 'v25', label: 'v25 - Floransya Palazzo', prompt: "Renaissance palazzo interior with frescoed walls. Italian aristocracy." },
        { id: 'v26', label: 'v26 - Mermer Büst Galeri', prompt: "Gallery filled with classical marble busts on pedestals. Museum elegance." },
        { id: 'v27', label: 'v27 - Antika Halı (Pers)', prompt: "Background with vintage Persian rug and warm tones. Collected wealth." },
        { id: 'v28', label: 'v28 - Bej Damask Duvar', prompt: "Wall covered in beige damask wallpaper with subtle patterns. Classic luxury." },
        { id: 'v29', label: 'v29 - Tarihî Çeşme', prompt: "Stone fountain in a classical plaza with aged patina. European heritage." },
        { id: 'v30', label: 'v30 - Gotik Pencere (Sivri)', prompt: "Gothic pointed arch window with light streaming through. Cathedral aesthetics." }
    ],
    'Lüks / Premium (Koyu & Altın)': [
        { id: 'v1', label: 'v1 - Penthouse Gece Manzarası (Şehir Işıkları)', prompt: "Interior of a high-end penthouse at night, with a blurred view of a glowing city skyline through floor-to-ceiling glass windows. Realistic reflections." },
        { id: 'v2', label: 'v2 - Otel Lobisi (Siyah Mermer & Altın)', prompt: "A real luxury hotel lobby with black marble floors, warm gold chandelier lighting, and dark wood paneling. Cinematic realism." },
        { id: 'v3', label: 'v3 - Lounge Bar (Kristal Kadehler)', prompt: "A velvet armchair in a dimly lit, exclusive lounge bar with crystal glasses in the background. High ISO photography style." },
        { id: 'v4', label: 'v4 - Yat Güvertesi (Gün Batımı)', prompt: "A private yacht deck at sunset, with real high-end teak flooring and the ocean in the background. Golden hour." },
        { id: 'v5', label: 'v5 - Paris Balkonu (Klasik)', prompt: "A classic Haussmann-style Parisian apartment balcony with intricate iron railings and a view of the city architecture. Real daylight." },
        { id: 'v6', label: 'v6 - Opera Binası (Kırmızı Halı)', prompt: "A grand opera house corridor with red carpet, gold trim, and soft ambient lighting. Real location." },
        { id: 'v7', label: 'v7 - Lüks Mağaza Vitrini', prompt: "A luxury boutique entrance with glass doors, marble columns, and warm spot lighting. High street fashion vibe." },
        { id: 'v8', label: 'v8 - Kütüphane (Maun Ahşap)', prompt: "A rich mahogany library with leather furniture and dim, moody lighting. Old money aesthetic." },
        { id: 'v9', label: 'v9 - Kuyumcu Tezgahı (Cam & Işık)', prompt: "A high-end jewelry store counter with glass displays and soft, flattering lighting. Realistic interior." },
        { id: 'v10', label: 'v10 - Sonsuzluk Havuzu (Akşam)', prompt: "A rooftop infinity pool at an exclusive resort at dusk, with purple sky reflections in the water." },
        // EXTENDED VARIATIONS (Darker/Moodier versions of the new inputs)
        { id: 'v11', label: 'v11 - Koyu Ahşap & Deri (Ofis)', prompt: "A dark executive office with walnut wood walls, a leather chair, and low-key lighting. Powerful atmosphere." },
        { id: 'v12', label: 'v12 - Gece Müzesi (Spot Işık)', prompt: "A classical museum hall at night, lit only by dramatic spotlights on the columns. High contrast." },
        { id: 'v13', label: 'v13 - Siyah Mermer Merdiven', prompt: "A grand staircase made of black marble with gold railings, dimly lit. Opulent." },
        { id: 'v14', label: 'v14 - Puro Odası (Dumanlı)', prompt: "A vintage smoking room with dark wood, velvet curtains, and a haze of smoke. Cinematic mood." },
        { id: 'v15', label: 'v15 - Şarap Mahzeni (Taş)', prompt: "An underground wine cellar with stone arches and rows of barrels. Warm, dim ambient light." },
        { id: 'v16', label: 'v16 - Piyano Odası (Yansıma)', prompt: "A black grand piano in a dark room with polished floors reflecting the instrument. Elegant." },
        { id: 'v17', label: 'v17 - Koyu Kadife Perde', prompt: "A backdrop of heavy, dark green or burgundy velvet curtains. Theatrical luxury." },
        { id: 'v18', label: 'v18 - Altın Varaklı Duvar', prompt: "A textured dark wall with subtle gold leaf details, lit by a warm sconce. Premium texture." },
        { id: 'v19', label: 'v19 - Yağmurlu Pencere (Gece)', prompt: "Looking out a rain-streaked window at city lights from a dark interior. Moody luxury." },
        { id: 'v20', label: 'v20 - Antika Ayna & Mumlar', prompt: "A dimly lit room with an antique gold mirror and candlelight reflections. Romantic dark academia." },
        { id: 'v21', label: 'v21 - Kristal Avize (Yakın)', prompt: "Close-up of a luxury crystal chandelier with warm ambient glow. Opulent lighting." },
        { id: 'v22', label: 'v22 - Limuzin İçi (Deri)', prompt: "Interior of a luxury limousine with black leather seats. Executive travel." },
        { id: 'v23', label: 'v23 - Rolex Butik', prompt: "High-end watch boutique interior with glass displays and soft spotlights. Precision luxury." },
        { id: 'v24', label: 'v24 - Özel Jet Kabini', prompt: "Private jet cabin with cream leather seats and mahogany accents. Elite travel." },
        { id: 'v25', label: 'v25 - Altın Çerçeveli Tablo', prompt: "Dark wall with ornate gold-framed painting. Gallery-worthy richness." },
        { id: 'v26', label: 'v26 - Siyah Granit Banyo', prompt: "Luxury bathroom with black granite and gold fixtures. Spa premium." },
        { id: 'v27', label: 'v27 - Michelin Restoran', prompt: "Fine dining restaurant interior with ambient candlelight. Culinary excellence." },
        { id: 'v28', label: 'v28 - Penthouse Terası (Gece)', prompt: "Rooftop terrace of a penthouse at night with city lights below. Urban luxury." },
        { id: 'v29', label: 'v29 - Kadife Duvar (Bordo)', prompt: "Deep burgundy velvet wall with dramatic side lighting. Theatrical opulence." },
        { id: 'v30', label: 'v30 - Monte Carlo Casino', prompt: "Casino interior with golden lights and elegant architecture. High-stakes glamour." }
    ],
    'Canlı & Enerjik (Renkli)': [
        { id: 'v1', label: 'v1 - İtalyan Sokağı (Renkli Evler)', prompt: "A real colorful street in Burano, Italy, with bright painted houses and cobblestone ground in sunlight. Travel photography style." },
        { id: 'v2', label: 'v2 - Basketbol Sahası (Mavi/Kırmızı)', prompt: "A sunny outdoor basketball court with bright blue and red painted surfaces, urban city buildings in the background. Realistic day." },
        { id: 'v3', label: 'v3 - Çiçek Pazarı (Lale/Ayçiçeği)', prompt: "A lively flower market stall overflowing with fresh tulips and sunflowers, natural daylight. Depth of field." },
        { id: 'v4', label: 'v4 - Neon Cafe (Şehir)', prompt: "A trendy cafe exterior with real neon signs and colorful metal chairs, blurred city life in background. Street photography." },
        { id: 'v5', label: 'v5 - Festival Alanı (Bayraklar)', prompt: "A festival atmosphere in a real park with colorful bunting flags and green grass, bright summer day." },
        { id: 'v6', label: 'v6 - Graffiti Duvarı (Urban Art)', prompt: "A vivid graffiti art wall in a trendy city district, with sunlight casting shadows. Urban art context." },
        { id: 'v7', label: 'v7 - Retro Diner (Kırmızı Koltuklar)', prompt: "A retro American diner interior with red leather booths and checkerboard floor. Authentic vintage vibe." },
        { id: 'v8', label: 'v8 - Şeker Dükkanı (Renkli)', prompt: "A candy shop interior with jars of colorful sweets in the background, bright and cheerful lighting." },
        { id: 'v9', label: 'v9 - Tropikal Meyve Tezgahı', prompt: "A tropical fruit stand in a sunny market, vibrant colors of mangoes and dragonfruit in background." },
        { id: 'v10', label: 'v10 - Mozaik Duvar (Güneşli)', prompt: "A colorful mosaic tiled wall in a park or public space, bathed in bright sunlight." },
        { id: 'v11', label: 'v11 - Renkli Şemsiyeler', prompt: "A street decorated with colorful hanging umbrellas overhead. Festive and bright." },
        { id: 'v12', label: 'v12 - Pop Art Galeri', prompt: "Art gallery with vibrant pop art paintings in primary colors. Bold and graphic." },
        { id: 'v13', label: 'v13 - Karnaval (Brezilya)', prompt: "Brazilian carnival setting with feathers and bright decorations. Celebration energy." },
        { id: 'v14', label: 'v14 - Neon Sign Bar', prompt: "Urban bar with multiple neon signs in pink, blue, and green. Night energy." },
        { id: 'v15', label: 'v15 - Surf Shop (Tahtalar)', prompt: "Surf shop interior with colorful surfboards stacked. Beach culture." },
        { id: 'v16', label: 'v16 - Sokak Sanatı (Mural)', prompt: "Large colorful street art mural with geometric patterns. Urban creativity." },
        { id: 'v17', label: 'v17 - Hindistan Pazarı (Baharatlar)', prompt: "Indian spice market with vibrant colored powders and fabrics. Exotic colors." },
        { id: 'v18', label: 'v18 - Roller Disco (Retro)', prompt: "1970s roller disco with disco ball and neon lights. Vintage fun." },
        { id: 'v19', label: 'v19 - Balloon Duvar', prompt: "Wall covered in colorful helium balloons. Party vibes." },
        { id: 'v20', label: 'v20 - Kaykay Rampa (Boyalı)', prompt: "Painted skate ramp with bright spray paint colors. Youth culture." },
        { id: 'v21', label: 'v21 - Meksika Köyü', prompt: "Mexican village street with colorful painted buildings. Latin American charm." },
        { id: 'v22', label: 'v22 - Arcade Salon', prompt: "Retro arcade game room with glowing screens and neon. Gaming nostalgia." },
        { id: 'v23', label: 'v23 - Tropikal Kuş Kafesi', prompt: "Aviary with colorful tropical birds. Exotic nature." },
        { id: 'v24', label: 'v24 - Festival Çadırı', prompt: "Music festival tent with colorful tapestries. Bohemian energy." },
        { id: 'v25', label: 'v25 - Rengarenk Vitray', prompt: "Stained glass window with bright colors creating rainbow light. Artistic colorful." },
        { id: 'v26', label: 'v26 - Tenis Duvarı (Grafiti)', prompt: "Tennis court wall with vibrant graffiti art. Street sports." },
        { id: 'v27', label: 'v27 - Konfeti Duvar', prompt: "White wall with confetti explosion effect. Celebration moment." },
        { id: 'v28', label: 'v28 - Miami Art Deco', prompt: "Miami Beach art deco building in pastel colors. Tropical glamour." },
        { id: 'v29', label: 'v29 - Palyaço Sirki', prompt: "Circus tent interior with colorful decorations. Entertainment energy." },
        { id: 'v30', label: 'v30 - Tokyo Shibuya (Gece)', prompt: "Shibuya crossing at night with bright LED billboards. Urban neon chaos." }
    ],
    'Yaz / Tatil Vibe': [
        { id: 'v1', label: 'v1 - Maldivler Plajı (Beyaz Kum)', prompt: "A real sandy beach in the Maldives with turquoise water and natural palm tree shadows on the white sand. Photorealistic travel shot." },
        { id: 'v2', label: 'v2 - Havuz Kenarı (Ahşap Deck)', prompt: "A wooden poolside deck at a luxury resort, with real clear blue water and white lounge chairs. Bright sunlight." },
        { id: 'v3', label: 'v3 - Santorini Terası (Beyaz/Mavi)', prompt: "A Mediterranean stone terrace in Santorini overlooking the sea, bright white architecture and blue domes. Real location." },
        { id: 'v4', label: 'v4 - Piknik Alanı (Yeşil Çim)', prompt: "A real picnic setup on fresh green grass in a sunny park with dappled light filtering through trees." },
        { id: 'v5', label: 'v5 - Sahil Yolu (Cabrio Araba)', prompt: "A coastal road with a view from a convertible car, ocean on the side, bright blue sky. Lifestyle photography." },
        { id: 'v6', label: 'v6 - Havuz Suyu (Yakın Çekim)', prompt: "A refreshing swimming pool surface with sparkling water ripples and sunlight refraction." },
        { id: 'v7', label: 'v7 - Ayçiçeği Tarlası', prompt: "A sunflower field in full bloom under a bright blue summer sky. Real nature photography." },
        { id: 'v8', label: 'v8 - Hamak & Palmiyeler', prompt: "A hammock strung between two palm trees on a tropical beach, ocean view in background." },
        { id: 'v9', label: 'v9 - Bahçe Partisi (Limonata)', prompt: "A summer garden party setting with a white table, lemonade, and blurred greenery." },
        { id: 'v10', label: 'v10 - Göl İskelesi', prompt: "A dock on a lake with wooden planks and calm water reflecting the summer sun." },
        { id: 'v11', label: 'v11 - Karayipler (Turkuaz)', prompt: "Caribbean beach with crystal clear turquoise water. Tropical paradise." },
        { id: 'v12', label: 'v12 - Yunan Adası (Beyaz)', prompt: "Greek island village with whitewashed buildings. Mediterranean dream." },
        { id: 'v13', label: 'v13 - Surfçü Plajı', prompt: "Surfer beach with boards and waves. Active summer lifestyle." },
        { id: 'v14', label: 'v14 - Yat Güvertesi (Deniz)', prompt: "On a sailing yacht deck with ocean horizon. Nautical luxury." },
        { id: 'v15', label: 'v15 - Tropikal Bar (Tiki)', prompt: "Tiki beach bar with tropical drinks. Island vacation vibe." },
        { id: 'v16', label: 'v16 - Bali Pirinç Tarlası', prompt: "Bali rice terraces with lush green landscape. Exotic travel." },
        { id: 'v17', label: 'v17 - Plaj Kulübesi (Ahşap)', prompt: "Wooden beach hut with thatched roof. Rustic tropical." },
        { id: 'v18', label: 'v18 - Waterpark (Kaydırak)', prompt: "Water park with colorful slides. Summer fun." },
        { id: 'v19', label: 'v19 - Tekne Gezisi', prompt: "On a boat with sea breeze and sunshine. Maritime adventure." },
        { id: 'v20', label: 'v20 - Portakal Bahçesi', prompt: "Orange grove in summer with fruit trees. Fresh citrus atmosphere." },
        { id: 'v21', label: 'v21 - Buz Dondurması Dükkanı', prompt: "Ice cream shop exterior with bright colors. Sweet summer treat." },
        { id: 'v22', label: 'v22 - Çeşme Alaçatı', prompt: "Turkish Aegean town street with colorful doors. Summer destination." },
        { id: 'v23', label: 'v23 - Dalış Platformu', prompt: "Diving platform over clear blue water. Adventure sports." },
        { id: 'v24', label: 'v24 - Kokteyl Bar (Plaj)', prompt: "Beachside cocktail bar at sunset. Tropical drinks." },
        { id: 'v25', label: 'v25 - Deniz Feneri', prompt: "Lighthouse by the sea with blue sky. Coastal charm." },
        { id: 'v26', label: 'v26 - Havana Küba', prompt: "Colorful Havana street with vintage cars. Caribbean culture." },
        { id: 'v27', label: 'v27 - Tropikal Orman (Şelale)', prompt: "Tropical jungle with waterfall. Nature adventure." },
        { id: 'v28', label: 'v28 - Sörf Tahtası Depo', prompt: "Stack of colorful surfboards against wall. Beach sports." },
        { id: 'v29', label: 'v29 - Yaz Festivali (Alan)', prompt: "Outdoor summer music festival field. Concert atmosphere." },
        { id: 'v30', label: 'v30 - Bambu Plaj Barı', prompt: "Bamboo beach bar with tropical setting. Island relaxation." }
    ],
    'Sokak Stili (Urban)': [
        { id: 'v1', label: 'v1 - NYC Caddesi (Sarı Taksiler)', prompt: "A busy New York City street crossing with yellow taxis blurred in the background, daytime. Real urban environment." },
        { id: 'v2', label: 'v2 - Arka Sokak (Tuğla Duvar)', prompt: "A gritty brick alleyway in London with metal fire escapes and puddles on the ground. Realistic street texture." },
        { id: 'v3', label: 'v3 - Metro Girişi (Modern)', prompt: "A modern glass subway station entrance in Tokyo, cool tones, steel structures. Urban photography." },
        { id: 'v4', label: 'v4 - Kaykay Parkı (Beton)', prompt: "A concrete skate park with real urban graffiti art on the walls, realistic daylight." },
        { id: 'v5', label: 'v5 - Teras Bar (Akşam)', prompt: "A rooftop terrace bar with string lights and a view of the city skyline at dusk. Authentic atmosphere." },
        { id: 'v6', label: 'v6 - Yaya Geçidi (Kalabalık)', prompt: "A busy pedestrian crosswalk in a modern city, with blurred crowd movement. Street style capture." },
        { id: 'v7', label: 'v7 - Sanayi Sokağı (Vintage)', prompt: "A vintage brick wall backdrop in a city lane, with fire escape shadows. Industrial chic." },
        { id: 'v8', label: 'v8 - Gökdelen Cephesi (Cam)', prompt: "A shiny modern glass skyscraper facade reflecting the clouds and other buildings. Architectural detail." },
        { id: 'v9', label: 'v9 - Sokak Kahvecisi', prompt: "A street cafe seating area on a cobblestone pavement, casual urban vibe." },
        { id: 'v10', label: 'v10 - Çelik Köprü', prompt: "A metal bridge structure with rivets and steel beams, out of focus city background." },
        { id: 'v11', label: 'v11 - Brooklyn Köprüsü', prompt: "Brooklyn Bridge with Manhattan skyline. Iconic urban landmark." },
        { id: 'v12', label: 'v12 - Londra Telefon Kulübesi', prompt: "Red British phone booth on city street. Classic urban icon." },
        { id: 'v13', label: 'v13 - Bisiklet Yolu (Amsterdam)', prompt: "Amsterdam bike lane with urban cyclists. City mobility." },
        { id: 'v14', label: 'v14 - Underground Tüneli', prompt: "Subway tunnel with tiled walls and fluorescent lights. Urban transit." },
        { id: 'v15', label: 'v15 - Şehir Çatıları', prompt: "Rooftop view of densely packed city buildings. Urban landscape." },
        { id: 'v16', label: 'v16 - Sanayi Bölgesi', prompt: "Industrial district with warehouses and steel structures. Gritty urban." },
        { id: 'v17', label: 'v17 - Neon Sokak (Asya)', prompt: "Asian city alleyway with neon signs in multiple languages. Cyberpunk urban." },
        { id: 'v18', label: 'v18 - Tren İstasyonu', prompt: "Busy train station platform with commuters. Urban hustle." },
        { id: 'v19', label: 'v19 - Parking Garajı', prompt: "Multi-level concrete parking garage. Urban architecture." },
        { id: 'v20', label: 'v20 - Şehir Parkı (Çim)', prompt: "Urban park with grass and city buildings background. Green in concrete." },
        { id: 'v21', label: 'v21 - Şehir Meydanı', prompt: "City square with pavement and urban crowd. Public space." },
        { id: 'v22', label: 'v22 - Berlin Duvarı (Grafiti)', prompt: "Berlin Wall remnant with street art. Historic urban." },
        { id: 'v23', label: 'v23 - Shopping Mall (Dış)', prompt: "Modern shopping mall exterior with glass and steel. Consumer urban." },
        { id: 'v24', label: 'v24 - Şehir Otobüsü', prompt: "Inside or beside a city bus. Public transport." },
        { id: 'v25', label: 'v25 - Yürüyen Merdiven', prompt: "Metro escalator with commuters. Urban movement." },
        { id: 'v26', label: 'v26 - Çin Mahallesi', prompt: "Chinatown street with lanterns and signs. Cultural urban." },
        { id: 'v27', label: 'v27 - Times Square', prompt: "Times Square with billboards and crowds. Urban spectacle." },
        { id: 'v28', label: 'v28 - Bisiklet Kiralama', prompt: "City bike share station. Urban eco-transport." },
        { id: 'v29', label: 'v29 - Food Truck', prompt: "Street food truck with urban background. Casual dining." },
        { id: 'v30', label: 'v30 - Şehir Silüeti (Gün Batımı)', prompt: "City skyline at sunset from street level. Urban golden hour." }
    ],
    'Sinematik / Dramatik': [
        { id: 'v1', label: 'v1 - Yağmurlu Gece (Neon Yansıma)', prompt: "A moody rainy city street at night, with real reflections of red tail lights on the wet asphalt. Cinematic film look." },
        { id: 'v2', label: 'v2 - Sisli Orman (Şafak Vakti)', prompt: "A foggy forest path at dawn, with god rays piercing through tall pine trees. Atmospheric nature photography." },
        { id: 'v3', label: 'v3 - Çöl Alacakaranlığı (Mavi)', prompt: "A dramatic desert landscape at twilight with deep blue sky and silhouette of mountains. Real location." },
        { id: 'v4', label: 'v4 - Araba İçi (Yağmurlu Cam)', prompt: "Inside a classic vintage car at night, with rain on the windows and streetlights passing by. Moody realism." },
        { id: 'v5', label: 'v5 - Karanlık Kütüphane (Lamba)', prompt: "A dark library interior with rows of old books and a single warm desk lamp illumination. Cinematic interior." },
        { id: 'v6', label: 'v6 - İskele (Mavi Saat)', prompt: "A misty pier extending into a dark ocean at blue hour. Mysterious and dramatic." },
        { id: 'v7', label: 'v7 - Jazz Kulübü (Dumanlı)', prompt: "A dimly lit jazz club with smoke in the air and stage lighting. Noir atmosphere." },
        { id: 'v8', label: 'v8 - Fırtınalı Uçurum', prompt: "A dramatic cliff edge overlooking a stormy sea, with grey clouds and crashing waves." },
        { id: 'v9', label: 'v9 - Tünel Işıkları (Sci-Fi)', prompt: "A tunnel with fluorescent overhead lights creating leading lines. Cool sci-fi cinematic tone." },
        { id: 'v10', label: 'v10 - Noir Oda (Jaluzi Gölgesi)', prompt: "A dark room with light streaming through venetian blinds, creating striped shadows. Film noir style." },
        { id: 'v11', label: 'v11 - Gotik Mezarlık (Sis)', prompt: "Gothic cemetery with mist rolling between tombstones. Haunting atmosphere." },
        { id: 'v12', label: 'v12 - Karanlık Sokak (Tek Lamba)', prompt: "Dark alley with single street lamp creating dramatic pool of light. Film noir." },
        { id: 'v13', label: 'v13 - Fırtına Öncesi (Alan)', prompt: "Open field with dark storm clouds approaching. Ominous mood." },
        { id: 'v14', label: 'v14 - Terkedilmiş Tren İstasyonu', prompt: "Abandoned train station with dust particles in light beams. Desolate beauty." },
        { id: 'v15', label: 'v15 - Kuzey Işıkları', prompt: "Northern lights aurora borealis over dark landscape. Natural spectacle." },
        { id: 'v16', label: 'v16 - Ay Işığı (Gece Ormanı)', prompt: "Forest at night illuminated by moonlight. Ethereal darkness." },
        { id: 'v17', label: 'v17 - Savaş Sonrası (Harabeler)', prompt: "War-torn building ruins with dramatic lighting. Post-apocalyptic." },
        { id: 'v18', label: 'v18 - Deniz Feneri (Fırtına)', prompt: "Lighthouse in storm with crashing waves. Maritime drama." },
        { id: 'v19', label: 'v19 - Köprü Altı (Gölge)', prompt: "Under a bridge with dramatic shadows and urban decay. Gritty cinematic." },
        { id: 'v20', label: 'v20 - Volkan Krateri', prompt: "Volcanic crater with dark smoke and orange glow. Primordial power." },
        { id: 'v21', label: 'v21 - Buz Mağarası', prompt: "Ice cave with blue translucent light. Frozen beauty." },
        { id: 'v22', label: 'v22 - Opera Perdesi (Kapalı)', prompt: "Closed red velvet opera curtain with dramatic spotlight. Theatrical." },
        { id: 'v23', label: 'v23 - Gece Yağmuru (Şehir)', prompt: "City street at night in heavy rain with neon reflections. Neo-noir." },
        { id: 'v24', label: 'v24 - Çöl Kum Fırtınası', prompt: "Desert sandstorm with low visibility. Harsh environment." },
        { id: 'v25', label: 'v25 - Karanlık Orman Yolu', prompt: "Dark forest path with minimal light. Mysterious journey." },
        { id: 'v26', label: 'v26 - Elektrik Santrali', prompt: "Power plant with industrial pipes and steam. Dystopian industrial." },
        { id: 'v27', label: 'v27 - Gece Bulutları (Yıldırım)', prompt: "Night sky with lightning striking through clouds. Electric drama." },
        { id: 'v28', label: 'v28 - Tek Spotlight (Sahne)', prompt: "Empty stage with single dramatic spotlight. Performance art." },
        { id: 'v29', label: 'v29 - Derin Okyanus', prompt: "Deep ocean underwater with minimal light. Abyssal mystery." },
        { id: 'v30', label: 'v30 - Gün Tutulması', prompt: "Solar eclipse with corona visible. Celestial phenomenon." }
    ],
    'Doğal / Organik': [
        { id: 'v1', label: 'v1 - Eğrelti Otu Ormanı (Makro)', prompt: "A lush green fern forest floor with mossy rocks and soft diffused sunlight. Macro nature photography." },
        { id: 'v2', label: 'v2 - Dağ Gölü (Yansıma)', prompt: "A calm mountain lake edge with pebbles and reflection of the sky. Real landscape." },
        { id: 'v3', label: 'v3 - Lavanta Tarlası', prompt: "A field of real lavender flowers in Provence, stretching to the horizon under a sunny sky." },
        { id: 'v4', label: 'v4 - Kanyon Kayalıkları', prompt: "A sunlit rock formation in a real desert canyon, red earth tones and blue sky." },
        { id: 'v5', label: 'v5 - Ahşap Masa (Bahçe)', prompt: "A rustic wooden table in an overgrown garden with real sunlight filtering through leaves. Cottagecore realism." },
        { id: 'v6', label: 'v6 - Huş Ağacı Ormanı', prompt: "A birch tree forest in autumn with golden leaves and white tree trunks. Natural soft light." },
        { id: 'v7', label: 'v7 - Şelale (Tropik)', prompt: "A cascading waterfall in a tropical jungle, with wet rocks and green foliage." },
        { id: 'v8', label: 'v8 - Bambu Yolu', prompt: "A bamboo forest path with filtered green light. Zen nature vibe." },
        { id: 'v9', label: 'v9 - Karlı Zirve', prompt: "A snowy mountain peak with pine trees, crisp cold air atmosphere. Realistic winter nature." },
        { id: 'v10', label: 'v10 - Çiy Damlaları (Sabah)', prompt: "A macro shot of morning dew on grass blades, with a soft green bokeh background." },
        { id: 'v11', label: 'v11 - Kiraz Ağacı (Çiçek)', prompt: "Cherry blossom tree in full bloom. Spring natural beauty." },
        { id: 'v12', label: 'v12 - Çayır (Yaban Çiçekleri)', prompt: "Wildflower meadow with diverse colorful blooms. Natural diversity." },
        { id: 'v13', label: 'v13 - Nehir Kenarı (Taşlar)', prompt: "River bank with smooth stones and flowing water. Natural serenity." },
        { id: 'v14', label: 'v14 - Redwood Ormanı', prompt: "Giant redwood forest with towering trees. Ancient nature." },
        { id: 'v15', label: 'v15 - Kaktüs Bahçesi', prompt: "Desert garden with various cacti species. Arid beauty." },
        { id: 'v16', label: 'v16 - Mantar Yığını', prompt: "Forest floor with wild mushrooms growing. Fungi nature." },
        { id: 'v17', label: 'v17 - Deniz Kabukları (Kum)', prompt: "Seashells scattered on beach sand. Coastal natural." },
        { id: 'v18', label: 'v18 - Sonbahar Yaprakları', prompt: "Autumn leaves on ground in warm colors. Seasonal change." },
        { id: 'v19', label: 'v19 - Palmiye Yaprakları', prompt: "Close-up of tropical palm fronds. Exotic greenery." },
        { id: 'v20', label: 'v20 - Çim Üstü (Makro)', prompt: "Macro shot of grass blades with bokeh. Ground-level nature." },
        { id: 'v21', label: 'v21 - Mağara Stalaktitleri', prompt: "Cave with limestone stalactites. Underground natural formation." },
        { id: 'v22', label: 'v22 - Yosun Kaplı Ağaç', prompt: "Tree trunk covered in green moss. Forest texture." },
        { id: 'v23', label: 'v23 - Volkanik Kayalar', prompt: "Black volcanic rock formation. Geological natural." },
        { id: 'v24', label: 'v24 - Narlı Dal', prompt: "Pomegranate tree branch with fruit. Organic agriculture." },
        { id: 'v25', label: 'v25 - Çiçek Tarlası (Gelincik)', prompt: "Poppy field in red bloom. Wild natural beauty." },
        { id: 'v26', label: 'v26 - Buz Sarkıtları', prompt: "Icicles hanging with winter light. Frozen nature." },
        { id: 'v27', label: 'v27 - Yaban Arıları (Petek)', prompt: "Wild honeycomb in nature. Natural production." },
        { id: 'v28', label: 'v28 - Kuru Toprak (Çatlaklar)', prompt: "Cracked dry earth texture. Desert natural." },
        { id: 'v29', label: 'v29 - Su Altı Mercan', prompt: "Underwater coral reef. Marine natural ecosystem." },
        { id: 'v30', label: 'v30 - Bulut Formasyonları', prompt: "Dramatic cloud formations in sky. Atmospheric natural." }
    ],
    'Kurumsal / Profesyonel': [
        { id: 'v1', label: 'v1 - Açık Ofis (Camlı)', prompt: "A modern open-plan office space with glass walls and blurred people working in the background. Corporate photography." },
        { id: 'v2', label: 'v2 - Toplantı Masası (Şehir Manzarası)', prompt: "A sleek boardroom table with a view of a city financial district through the window. Real business setting." },
        { id: 'v3', label: 'v3 - Co-working Lounge', prompt: "A co-working space lounge with modern furniture and indoor plants, soft natural light. Architectural interior." },
        { id: 'v4', label: 'v4 - Resepsiyon (Teknoloji)', prompt: "A clean, well-lit reception area of a modern tech company with white surfaces and wood accents. Real location." },
        { id: 'v5', label: 'v5 - Mimarlık Ofisi', prompt: "A professional architectural studio with blueprints and models in the blurred background. Authentic workspace." },
        { id: 'v6', label: 'v6 - Asansör Lobisi', prompt: "A modern glass elevator lobby in a high-rise building. Professional and clean." },
        { id: 'v7', label: 'v7 - Kahve Köşesi (Startup)', prompt: "A busy coffee shop corner where digital nomads work, with laptops and coffee cups. Startup vibe." },
        { id: 'v8', label: 'v8 - Kütüphane (Sessiz)', prompt: "A university library study area with rows of books and quiet atmosphere." },
        { id: 'v9', label: 'v9 - Sunum Odası', prompt: "A bright conference room with a presentation screen and glass whiteboard." },
        { id: 'v10', label: 'v10 - Yönetici Masası', prompt: "A minimalistic executive desk setup with a city view window." },
        { id: 'v11', label: 'v11 - Hukuk Bürosu', prompt: "Law office with wooden shelves and legal books. Professional authority." },
        { id: 'v12', label: 'v12 - Hastane Koridoru', prompt: "Clean hospital corridor with white walls. Medical professional." },
        { id: 'v13', label: 'v13 - Bankacılık Salonu', prompt: "Banking hall with marble and glass. Financial institution." },
        { id: 'v14', label: 'v14 - Laboratuvar (Beyaz)', prompt: "Scientific laboratory with equipment. Research professional." },
        { id: 'v15', label: 'v15 - Konferans Salonu', prompt: "Large conference hall with rows of seats. Event professional." },
        { id: 'v16', label: 'v16 - Yayın Stüdyosu', prompt: "Broadcasting studio with cameras and lights. Media professional." },
        { id: 'v17', label: 'v17 - İnşaat Ofisi', prompt: "Construction office with blueprints. Engineering professional." },
        { id: 'v18', label: 'v18 - Danışma Masası', prompt: "Reception consultation desk. Customer service professional." },
        { id: 'v19', label: 'v19 - IT Sunucu Odası', prompt: "Server room with racks and cables. Technology professional." },
        { id: 'v20', label: 'v20 - Tasarım Stüdyosu', prompt: "Design studio with Mac computers and mood boards. Creative professional." },
        { id: 'v21', label: 'v21 - Muhasebe Ofisi', prompt: "Accounting office with filing cabinets. Financial services." },
        { id: 'v22', label: 'v22 - İnsan Kaynakları', prompt: "HR department with interview room. Recruitment professional." },
        { id: 'v23', label: 'v23 - Pazarlama Ajansı', prompt: "Marketing agency with creative workspace. Advertising professional." },
        { id: 'v24', label: 'v24 - Danışmanlık Firması', prompt: "Consulting firm with minimalist design. Strategy professional." },
        { id: 'v25', label: 'v25 - Mimarlık Stüdyosu', prompt: "Architecture studio with models and drawings. Design professional." },
        { id: 'v26', label: 'v26 - Call Center', prompt: "Modern call center with cubicles. Customer support professional." },
        { id: 'v27', label: 'v27 - Satış Ofisi', prompt: "Sales office with charts and graphs. Business development." },
        { id: 'v28', label: 'v28 - Lojistik Merkezi', prompt: "Logistics operations center. Supply chain professional." },
        { id: 'v29', label: 'v29 - Yönetim Kurulu Salonu', prompt: "Board of directors room with formal setup. Executive level." },
        { id: 'v30', label: 'v30 - Startup Hub', prompt: "Startup incubator space with open layout. Innovation professional." }
    ],
    'Stüdyo (Studio)': [
        { id: 'v1', label: 'v1 - Düz Beyaz (Solid White)', prompt: "Professional fashion photography studio with a seamless pure white cyclorama background. Clean, even studio lighting with softboxes. No shadows on background. High-end e-commerce product photography setup." },
        { id: 'v2', label: 'v2 - Düz Siyah (Solid Black)', prompt: "Professional studio with seamless pure black background. Dramatic rim lighting and key light setup. High contrast fashion photography. Deep matte black backdrop." },
        { id: 'v3', label: 'v3 - Düz Gri (Solid Gray)', prompt: "Professional studio with seamless neutral gray background. Balanced soft studio lighting. Mid-tone gray cyclorama. Classic portrait photography setup." },
        { id: 'v4', label: 'v4 - Düz Bej (Solid Beige)', prompt: "Professional studio with warm beige seamless paper backdrop. Soft warm-toned lighting. Elegant cream-toned studio. Fashion editorial feel." },
        { id: 'v5', label: 'v5 - Düz Koyu Lacivert (Solid Navy)', prompt: "Professional studio with deep navy blue seamless backdrop. Sophisticated studio lighting with warm accent. Dark elegant background for high-end fashion." },
        { id: 'v6', label: 'v6 - Düz Haki (Solid Khaki)', prompt: "Professional studio with muted khaki/olive green seamless backdrop. Natural-toned studio lighting. Earthy warm military green background." },
        { id: 'v7', label: 'v7 - Gradient Beyaz-Gri', prompt: "Professional studio with smooth white-to-light-gray gradient background. Gradual tonal transition on seamless paper. Soft diffused lighting creating gentle shadow at bottom. Clean modern look." },
        { id: 'v8', label: 'v8 - Gradient Bej-Krem', prompt: "Professional studio with smooth warm beige-to-cream gradient background. Soft warm lighting with golden tones. Gentle warm gradient transition. Luxury fashion feel." },
        { id: 'v9', label: 'v9 - Gradient Gri-Siyah', prompt: "Professional studio with smooth gray-to-black gradient background. Dramatic lighting with vignette effect. Dark moody gradient. High-end editorial fashion photography." },
        { id: 'v10', label: 'v10 - Gradient Pembe-Beyaz', prompt: "Professional studio with soft blush pink-to-white gradient background. Feminine soft lighting. Gentle pastel gradient. Beauty and fashion editorial." },
        { id: 'v11', label: 'v11 - Beton Duvar (Açık)', prompt: "Professional studio with real light gray raw concrete wall background. Exposed concrete texture with natural imperfections. Industrial chic studio. Soft directional lighting." },
        { id: 'v12', label: 'v12 - Beton Duvar (Koyu)', prompt: "Professional studio with dark charcoal concrete wall. Heavy industrial concrete texture. Moody studio atmosphere. Dramatic side lighting casting subtle shadows." },
        { id: 'v13', label: 'v13 - Beton Zemin & Duvar', prompt: "Professional studio with seamless concrete floor and concrete wall meeting at base. Full raw concrete environment. Industrial minimalist studio. Even professional lighting." },
        { id: 'v14', label: 'v14 - Ahşap Panel (Açık Meşe)', prompt: "Professional studio with light oak wood panel wall background. Natural wood grain texture. Warm Scandinavian studio feel. Soft natural-toned lighting." },
        { id: 'v15', label: 'v15 - Ahşap Panel (Koyu Ceviz)', prompt: "Professional studio with dark walnut wood panel wall. Rich deep wood grain. Luxurious warm studio setting. Warm accent lighting." },
        { id: 'v16', label: 'v16 - Ahşap Zemin & Beyaz Duvar', prompt: "Professional studio with polished light hardwood floor and clean white wall. Classic fashion studio setup. Natural wood floor meeting white cyclorama." },
        { id: 'v17', label: 'v17 - Mimari Kemer (Beyaz)', prompt: "Professional studio with white architectural arch frame as backdrop. Clean plaster arch with subtle shadow. Elegant architectural studio element. Soft diffused light." },
        { id: 'v18', label: 'v18 - Mimari Sütunlar', prompt: "Professional studio with classical white column/pillar architectural elements. Symmetrical studio composition. Greek-inspired studio backdrop. Even balanced lighting." },
        { id: 'v19', label: 'v19 - Mimari Niş (Alcove)', prompt: "Professional studio with a recessed alcove/niche in white wall as backdrop. Architectural depth. Shadow play in the niche. Focused studio lighting." },
        { id: 'v20', label: 'v20 - Klasik Fotoğraf Stüdyosu', prompt: "Professional photography studio with visible softbox lights, C-stand, and white seamless paper roll. Behind-the-scenes studio look. Professional equipment visible but blurred." },
        { id: 'v21', label: 'v21 - Stüdyo Perde (Beyaz)', prompt: "Professional studio with flowing white sheer curtain/drape as backdrop. Soft backlit fabric creating ethereal glow. Elegant draped textile studio." },
        { id: 'v22', label: 'v22 - Stüdyo Perde (Koyu)', prompt: "Professional studio with rich dark velvet curtain backdrop. Deep charcoal or black velvet drape. Theatrical dramatic studio. Focused spot lighting." },
        { id: 'v23', label: 'v23 - Şehir Loft Stüdyo', prompt: "Industrial urban loft studio with exposed brick wall, large factory windows with city view. Converted warehouse studio space. Natural window light mixed with studio lights." },
        { id: 'v24', label: 'v24 - Şehir Cam Stüdyo', prompt: "Modern glass-walled studio penthouse with blurred city skyline visible through floor-to-ceiling windows. Urban studio with panoramic view. Natural and artificial mixed lighting." },
        { id: 'v25', label: 'v25 - Doğa Stüdyo (Bitki)', prompt: "Studio setting with large tropical plants and green foliage arranged as natural backdrop. Botanical studio concept. Warm soft lighting with green undertones." },
        { id: 'v26', label: 'v26 - Doğa Stüdyo (Kum)', prompt: "Studio setting with fine sand floor and warm neutral backdrop. Beach/desert-inspired studio. Warm golden studio lighting. Natural earth tones." },
        { id: 'v27', label: 'v27 - Minimal Beyaz Kutu', prompt: "Ultra-minimal pure white box studio room. No visible edges, seamless white floor, walls, ceiling. Shadowless even lighting. Apple-style clean product photography." },
        { id: 'v28', label: 'v28 - Minimal Gri Platform', prompt: "Minimal studio with a raised gray platform/pedestal and light gray background. Simple elevated stage. Clean geometric studio. Even soft lighting." },
        { id: 'v29', label: 'v29 - Dokulu Sıva Duvar', prompt: "Studio with textured Venetian plaster wall in warm ivory/cream tones. Handcrafted wall texture with subtle variations. Artisan studio backdrop. Soft directional warm light." },
        { id: 'v30', label: 'v30 - Dokulu Taş Duvar', prompt: "Studio with natural stone wall texture. Limestone or travertine studio backdrop with organic surface patterns. Raw elegant studio. Warm even professional lighting." }
    ]
  };

  export enum LoadingState {
    IDLE = 'IDLE',
    UPLOADING_PRODUCT = 'UPLOADING_PRODUCT',
    GENERATING_MODEL = 'GENERATING_MODEL',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    GENERATING_TRYON = 'GENERATING_TRYON',
    GENERATING_AD = 'GENERATING_AD',
    UPSCALING = 'UPSCALING',
    GENERATING_BG_STUDIO = 'GENERATING_BG_STUDIO',
    GENERATING_FACTORY = 'GENERATING_FACTORY'
  }

  // ... (Remaining types and constants kept same as before)
  // --- CATEGORIZED PRODUCT OPTIONS ---
  export const PRODUCT_CATEGORIES: Record<string, string[]> = {
    'Giyim (Moda)': [
        'Üst Giyim (Tişört, Bluz, Gömlek)',
        'Alt Giyim (Pantolon, Etek, Şort)',
        'Tam Boy (Elbise, Tulum, Takım)',
        'Dış Giyim (Ceket, Mont, Kaban)',
        'Plaj Giyim (Mayo, Bikini, Pareo)',
        'İç Giyim & Lingerie (Sütyen, Jartiyer, Fantazi)',
        'Spor Giyim (Activewear)',
        'Başörtü / Eşarp'
    ],
    'Aksesuar & Takı': [
        'Çanta (Bag)',
        'Cüzdan (Wallet)',
        'Ayakkabı / Sneaker',
        'Gözlük (Sunglasses)',
        'Saat (Watch)',
        'Küpe (Earrings)',       
        'Kolye (Necklace)',      
        'Bileklik (Bracelet)',   
        'Yüzük (Ring)',          
        'Şapka / Bere'
    ],
    'Bebek & Çocuk': [
        'Emzik (Pacifier)',
        'Biberon',
        'Bebek Arabası (Stroller)',
        'Oyuncak (Peluş, Figür)',
        'Bebek Kıyafeti',
        'Çocuk Odası Mobilyası'
    ],
    'Ev & Yaşam': [
        'Koltuk Takımı (Sofa)',
        'Masa / Sandalye',
        'Yatak / Baza',
        'Aydınlatma (Avize, Lambader)',
        'Halı / Kilim',
        'Dekoratif Obje (Vazo, Biblo)',
        'Mutfak Gereçleri'
    ],
    'Elektronik': [
        'Telefon / Tablet',
        'Televizyon',
        'Kulaklık (Headphones)',
        'Bilgisayar / Laptop',
        'Akıllı Saat',
        'Beyaz Eşya'
    ],
    'Kozmetik & Bakım': [
        'Parfüm Şişesi',
        'Ruj / Makyaj Malzemesi',
        'Cilt Bakım Kremi (Jar/Tube)',
        'Şampuan / Sabun',
        'Oje'
    ]
  };

  // Flattened list for backward compatibility if needed, though we will use the object mostly.
  export const PRODUCT_TYPE_OPTIONS = Object.values(PRODUCT_CATEGORIES).flat();

  // Backward compatibility alias
  export const CLOTHING_TYPE_OPTIONS = PRODUCT_TYPE_OPTIONS;

  export const GENDER_OPTIONS = ['Seçiniz', 'Kadın', 'Erkek', 'Non-binary'];
  
  export const ETHNICITY_OPTIONS = [
    'Seçiniz',
    'Türk (Türkiye)',
    'İskandinav (İsveç/Norveç)',
    'Amerikan (USA)',
    'Rus (Rusya)',
    'İtalyan (İtalya)',
    'Fransız (Fransa)',
    'Brezilyalı (Latin)',
    'Koreli (Güney Kore)',
    'Japon (Japonya)',
    'Afrikalı (Nijerya/Kenya)',
    'İspanyol (İspanya)',
    'Alman (Almanya)'
  ];

  export const SKIN_TONE_OPTIONS = [
    { id: 'auto', name: 'Otomatik', description: 'Etnik kökene göre otomatik', hex: '#D4A574' },
    { id: 'fair', name: 'Açık Ten', description: 'Porselen, çok açık ten', hex: '#FFE5D4' },
    { id: 'light', name: 'Açık-Orta', description: 'Açık ten, hafif pembe alt ton', hex: '#F5D0B5' },
    { id: 'medium-light', name: 'Orta-Açık', description: 'Bej, krem tonları', hex: '#E8C4A8' },
    { id: 'medium', name: 'Orta Ten', description: 'Buğday, bal rengi', hex: '#D4A574' },
    { id: 'medium-dark', name: 'Orta-Koyu', description: 'Bronz, karamel tonları', hex: '#B8865C' },
    { id: 'dark', name: 'Koyu Ten', description: 'Kahve, çikolata tonları', hex: '#8B6544' },
    { id: 'deep', name: 'Çok Koyu', description: 'Derin espresso tonları', hex: '#5C4033' },
  ];
  
  export const AGE_OPTIONS = [
    'Seçiniz',
    'Genç (18-24)', 
    'Genç Yetişkin (25-34)', 
    'Yetişkin (35-44)', 
    'Orta Yaş (45-55)', 
    'Olgun (55+)'
  ];
  
  export const BODY_TYPE_OPTIONS = [
    'Seçiniz',
    'İnce / Slim Fit', 
    'Atletik / Fit', 
    'Ortalama / Normal', 
    'Kıvrımlı / Curvy', 
    'Büyük Beden / Plus Size'
  ];

  export const HEIGHT_OPTIONS = [
    'Seçiniz',
    'Kısa (155-165 cm)',
    'Orta (165-175 cm)',
    'Uzun (175-185 cm)',
    'Model Uzunu (185+ cm)'
  ];
  
  export const HAIR_STYLE_OPTIONS = [
    'Seçiniz',
    'Kısa Saç',
    'Orta Boy Saç',
    'Uzun Saç'
  ];

  export const HAIR_COLOR_OPTIONS = [
    'Seçiniz',
    'Siyah',
    'Kahverengi',
    'Sarı / Sarışın',
    'Kızıl / Bakır',
    'Gri / Beyaz',
    'Platin Sarısı',
    'Kestane',
    'Kumral'
  ];

  export const LIPSTICK_COLOR_OPTIONS = [
    'Seçiniz (Doğal)',
    'Nude / Doğal',
    'Açık Pembe',
    'Koyu Pembe',
    'Kırmızı (Klasik)',
    'Turuncu / Mercan',
    'Mor / Mürdüm',
    'Kahverengi',
    'Bordo',
    'Mat Kırmızı'
  ];

  export const NAIL_POLISH_OPTIONS = [
    'Seçiniz (Doğal)',
    'French Manikür',
    'Nude / Doğal',
    'Açık Pembe',
    'Kırmızı',
    'Bordo',
    'Siyah',
    'Beyaz',
    'Mavi',
    'Mor',
    'Yeşil',
    'Altın / Gold',
    'Gümüş / Silver'
  ];

  // ============================================
  // HAZIR MANKEN SİSTEMİ (PRESET MODELS)
  // ============================================

  export interface PresetModel {
    id: string;
    name: string;
    gender: 'female' | 'male';
    ethnicity?: string;
    skinTone?: string;
    hairColor?: string;
    age?: string;
    images: {
      face: string;      // Yüz close-up
      fullBody: string;  // Tam boy
      profile?: string;  // Profil (yandan)
      back?: string;     // Arkadan
    };
    thumbnail: string;   // Ana önizleme görseli
    description?: string;
  }

  // Kadın Mankenler - Kendi görsellerinizi ekleyin
  export const PRESET_MODELS_FEMALE: PresetModel[] = [
    {
      id: 'female-1',
      name: 'Kadın Model 1',
      gender: 'female',
      ethnicity: 'Türk',
      skinTone: 'medium-light',
      hairColor: 'Sarı / Sarışın',
      age: 'Genç Yetişkin (25-34)',
      images: {
        face: '/models/female/model1-face.jpg',
        fullBody: '/models/female/model1-full.jpg',
        profile: '/models/female/model1-profile.jpg',
        back: '/models/female/model1-back.jpg',
      },
      thumbnail: '/models/female/model1-thumb.jpg',
      description: 'Sarışın, açık tenli kadın model'
    },
    {
      id: 'female-2',
      name: 'Kadın Model 2',
      gender: 'female',
      ethnicity: 'İtalyan',
      skinTone: 'medium',
      hairColor: 'Kahverengi',
      age: 'Genç Yetişkin (25-34)',
      images: {
        face: '/models/female/model2-face.jpg',
        fullBody: '/models/female/model2-full.jpg',
        profile: '/models/female/model2-profile.jpg',
        back: '/models/female/model2-back.jpg',
      },
      thumbnail: '/models/female/model2-thumb.jpg',
      description: 'Kahverengi saçlı, orta tenli kadın model'
    },
    {
      id: 'female-3',
      name: 'Kadın Model 3',
      gender: 'female',
      ethnicity: 'Koreli',
      skinTone: 'light',
      hairColor: 'Siyah',
      age: 'Genç (18-24)',
      images: {
        face: '/models/female/model3-face.jpg',
        fullBody: '/models/female/model3-full.jpg',
        profile: '/models/female/model3-profile.jpg',
        back: '/models/female/model3-back.jpg',
      },
      thumbnail: '/models/female/model3-thumb.jpg',
      description: 'Siyah saçlı, açık tenli Asyalı kadın model'
    },
  ];

  // Erkek Mankenler - Kendi görsellerinizi ekleyin
  export const PRESET_MODELS_MALE: PresetModel[] = [
    {
      id: 'male-1',
      name: 'Erkek Model 1',
      gender: 'male',
      ethnicity: 'Türk',
      skinTone: 'medium',
      hairColor: 'Siyah',
      age: 'Genç Yetişkin (25-34)',
      images: {
        face: '/models/male/model1-face.jpg',
        fullBody: '/models/male/model1-full.jpg',
        profile: '/models/male/model1-profile.jpg',
        back: '/models/male/model1-back.jpg',
      },
      thumbnail: '/models/male/model1-thumb.jpg',
      description: 'Siyah saçlı, buğday tenli erkek model'
    },
    {
      id: 'male-2',
      name: 'Erkek Model 2',
      gender: 'male',
      ethnicity: 'İskandinav',
      skinTone: 'fair',
      hairColor: 'Sarı / Sarışın',
      age: 'Genç Yetişkin (25-34)',
      images: {
        face: '/models/male/model2-face.jpg',
        fullBody: '/models/male/model2-full.jpg',
        profile: '/models/male/model2-profile.jpg',
        back: '/models/male/model2-back.jpg',
      },
      thumbnail: '/models/male/model2-thumb.jpg',
      description: 'Sarışın, açık tenli erkek model'
    },
    {
      id: 'male-3',
      name: 'Erkek Model 3',
      gender: 'male',
      ethnicity: 'Afrikalı',
      skinTone: 'dark',
      hairColor: 'Siyah',
      age: 'Yetişkin (35-44)',
      images: {
        face: '/models/male/model3-face.jpg',
        fullBody: '/models/male/model3-full.jpg',
        profile: '/models/male/model3-profile.jpg',
        back: '/models/male/model3-back.jpg',
      },
      thumbnail: '/models/male/model3-thumb.jpg',
      description: 'Koyu tenli, atletik erkek model'
    },
  ];

  // Tüm mankenleri birleştir
  export const ALL_PRESET_MODELS: PresetModel[] = [
    ...PRESET_MODELS_FEMALE,
    ...PRESET_MODELS_MALE
  ];

  // Cinsiyete göre manken getir
  export const getPresetModelsByGender = (gender: 'female' | 'male'): PresetModel[] => {
    return gender === 'female' ? PRESET_MODELS_FEMALE : PRESET_MODELS_MALE;
  };

  // ID'ye göre manken bul
  export const getPresetModelById = (id: string): PresetModel | undefined => {
    return ALL_PRESET_MODELS.find(model => model.id === id);
  };

  // New: Görünüm / Kadraj Options (Framing)
  export const FRAMING_OPTIONS = [
    'Tam Boy (Ayaktan başa kadar)',
    'Sadece Üst (Belden yukarısı - Portre)',
    'Sadece Alt (Belden aşağısı)',
    'Yakın Çekim (Detay odaklı)'
  ];

  // New: Hedef Poz Options (Target Pose)
  export const TARGET_POSE_OPTIONS = [
    'Önden (Front)',
    'Yandan (Side)',
    'Arkadan (Back)'
  ];

  export const VIEW_ANGLE_OPTIONS = [
    'Seçiniz (Otomatik)',
    'Önden (Front)',
    'Tam Yandan (Side Profile)',
    'Arkadan (Back)',
    'Üstten (Flat Lay / High Angle)',
    'Alttan (Low Angle - Hero)'
  ];

  export const SEASON_OPTIONS = [
    'Seçiniz (Otomatik)',
    'İlkbahar',
    'Yaz',
    'Sonbahar',
    'Kış'
  ];

  export const WEATHER_OPTIONS = [
    'Seçiniz (Otomatik)',
    'Güneşli (Sunny)',
    'Bulutlu (Cloudy)',
    'Yağmurlu (Rainy)',
    'Karlı (Snowy)',
    'Rüzgarlı (Windy)',
    'Gün Batımı (Sunset)',
    'Gece (Night)'
  ];

  // --- VOGUE POSES (HEAD & SHOULDERS / CHEST UP) ---
  export const VOGUE_HEAD_SHOULDERS_POSES = [
    'Göğüsten Yukarı (Chest Up), net portre odaklı',
    'Göğüsten Yukarı, eller yakada/boyunda, takı detayı',
    'Göğüsten Yukarı, baş hafif yana eğik, zarif',
    'Göğüsten Yukarı, omuz üzerinden bakış',
    'Göğüsten Yukarı, bir el küpeye dokunuyor',
    'Göğüsten Yukarı, eşarp/başörtü düzenleme hareketi',
    'Göğüsten Yukarı, dramatik portre ışığı',
    'Göğüsten Yukarı, yan profil portre',
    'Göğüsten Yukarı, saçları geriye atma hareketi',
    'Göğüsten Yukarı, doğrudan delici bakış'
  ];

  // --- VOGUE POSES (FULL BODY) ---
  export const VOGUE_FULL_BODY_POSES = [
    'Tam boy, uzun düz podyum duruşu, bir bacak önde',
    'Tam boy, geniş duruş, maskülen güvenli postür',
    'Tam boy, vücut çapraz açıda, omuzlar açılı',
    'Tam boy, yavaş adım öne, yoğun yüksek moda bakışı',
    'Tam boy, ağırlık tek bacakta, rahat lüks duruş',
    'Tam boy, eller ceplerde, temiz minimalist poz',
    'Tam boy, baş hafifçe yukarı eğik, baskın ifade',
    'Tam boy, hafifçe geriye yaslanma, dinamik silüet',
    'Tam boy, kollar rahat, düz sinematik simetri',
    'Tam boy, el hafifçe çeneye dokunuyor, editoryal zarafet',
    'Tam boy, gövdede yavaş bükülme, moda gerilimi',
    'Tam boy, dizler hafif bükük, podyum enerjisi',
    'Tam boy, eller arkada, uzatılmış postür',
    'Tam boy, gömlek ucunu düzelten model, doğal stil hareketi',
    'Tam boy, omuz düşük, maskülen yumuşaklık',
    'Tam boy, hafif kalça kayması, sanatsal asimetri',
    'Tam boy, hafifçe öne eğilme, gözler kameraya kilitli',
    'Tam boy, yana doğru adım, geçiş anı',
    'Tam boy, eller önde birleşik, editoryal durgunluk',
    'Tam boy, eller başın arkasında çapraz, cesur moda pozu',
    'Tam boy, asimetrik ayak yerleşimi, zarif dengesizlik',
    'Tam boy, sola yavaş dönüş, kontrollü hareket',
    'Tam boy, sağa dönüş, stilize silüet',
    'Tam boy, eller arkada kenetli, heykelsi',
    'Tam boy, kollar hafifçe çapraz, maskülen denge',
    'Tam boy, ceket yakasına dokunan model, sinematik stil',
    'Tam boy, kamera sağına bakış, lüks hissi',
    'Tam boy, aşağı bakış, yumuşak duygusal duruş',
    'Tam boy, açılı kol bükümü, modaya uygun tavır',
    'Tam boy, önden görünüm ama baş hafifçe dönük, ince dram'
  ];

  // --- VOGUE POSES (HALF BODY) ---
  export const VOGUE_HALF_BODY_POSES = [
    'Yarım boy, omuzlar dik, güçlü bakış',
    'Yarım boy, bir el cepte, rahat özgüven',
    'Yarım boy, eller hafifçe gömlek yakasında',
    'Yarım boy, baş sola eğik, zarif asimetri',
    'Yarım boy, eller yanlarda, minimalist lüks',
    'Yarım boy, gövde hafifçe sağa dönük',
    'Yarım boy, gövde hafifçe sola dönük',
    'Yarım boy, bir kol göğüs hizasında, sanatsal gerilim',
    'Yarım boy, parmaklar çeneye dokunuyor, düşünceli editoryal',
    'Yarım boy, eller önde yumuşakça birleşik',
    'Yarım boy, kol manşetini düzeltme, doğal hareket',
    'Yarım boy, hafifçe öne eğilme, yoğunluk',
    'Yarım boy, yumuşakça aşağı bakış, duygusal ton',
    'Yarım boy, hafifçe yukarı bakış, dramatik his',
    'Yarım boy, çene hafifçe önde, delici bakış',
    'Yarım boy, kollar sıkıca bağlı, güçlü maskülen enerji',
    'Yarım boy, bir el ensede, rahat Vogue',
    'Yarım boy, saçı geriye atma, doğal jest',
    'Yarım boy, hafif omuz kaldırma, editoryal hava',
    'Yarım boy, eller hafifçe bilekleri tutuyor',
    'Yarım boy, dirsekler hafifçe yukarıda, açılı şekil',
    'Yarım boy, çene sağa dönük, yumuşak profil',
    'Yarım boy, çene sola dönük, kontrollü gerilim',
    'Yarım boy, hafifçe yana yaslanma',
    'Yarım boy, çene hattına hafifçe dokunan model',
    'Yarım boy, hafif gülümseme varyasyonu (yüksek moda inceliği)',
    'Yarım boy, gözler yarı kapalı, sinematik ruh hali',
    'Yarım boy, kameraya doğrudan soğuk bakış',
    'Yarım boy, eller belde, maskülen yapı',
    'Yarım boy, stil için yaka veya göğüs bölgesini düzeltme'
  ];

  // --- VOGUE POSES (LOWER BODY - BELDEN AŞAĞI) ---
  export const VOGUE_LOWER_BODY_POSES = [
    'Belden aşağı (Waist Down), net duruş, pantolon/etek odaklı',
    'Belden aşağı, bir adım önde, dinamik ayakkabı vurgusu',
    'Belden aşağı, oturarak bacak bacak üstüne, şık',
    'Belden aşağı, yürüyüş anı, kumaş hareketi (Walking Detail)',
    'Belden aşağı, yan profil, vücut hatları',
    'Belden aşağı, düşük açıdan (Low Angle) moda çekimi',
    'Belden aşağı, eller cepte, rahat duruş',
    'Belden aşağı, merdiven veya basamakta, yükseklik farkı',
    'Belden aşağı, geniş açılı (Wide Stance) güçlü duruş',
    'Belden aşağı, arkadan görünüm, kesim detayı'
  ];

  // --- VOGUE POSES (WALKING / MOTION) ---
  export const VOGUE_WALKING_POSES = [
    'İleri doğru yürüyüş, uzun podyum adımı',
    'Yavaş yürüyüş, rahat kollar',
    'Yana doğru yürüyüş, baş kameraya dönük',
    'Hafifçe geri geri yürüyüş, editoryal enerji',
    'Hafifçe öne eğilerek yürüyüş',
    'Yumuşak hareket bulanıklığı estetiği ile yürüyüş',
    'Ceket hafifçe savrulurken yürüyüş',
    'Özgüvenli yürüyüş, omuzlar dik',
    'Çene yukarıda yürüyüş, baskın hava',
    'Adım ortası, bir ayak havada yürüyüş',
    'Kameraya doğru çapraz yürüyüş',
    'Kameradan uzaklaşarak çapraz yürüyüş',
    'Eller ceplerde yürüyüş',
    'Kollar hafifçe çapraz yürüyüş',
    'Bir el boyuna dokunurken yürüyüş',
    'Gövde hafifçe bükülmüş yürüyüş',
    'Baş sola eğik yürüyüş',
    'Gözler kamera dışında, hayalperest modda yürüyüş',
    'Yavaş dramatik adımlarla yürüyüş',
    'Kontrollü postür, sert podyum yürüyüşü',
    'Minimalist zarafetle yürüyüş',
    'Açılı dirsek şekliyle yürüyüş',
    'Kol manşetini düzeltirken yürüyüş',
    'Yakayı düzeltirken yürüyüş',
    'Derin sinematik gölgelerle yürüyüş',
    'Hafif gülümseme, editoryal cazibe ile yürüyüş',
    'Aşağı bakarak yürüyüş',
    'Omuz üzerinden bakarak yürüyüş',
    'Palto açık, hareket akışı ile yürüyüş',
    'Düz yürüyüş ama baş yana dönük'
  ];

  // --- VOGUE POSES (CINEMATIC EDITORIAL) ---
  export const VOGUE_CINEMATIC_POSES = [
    'Sinematik yakın çekim, derin gölgeler, güçlü elmacık kemiği',
    'Sinematik orta plan, dramatik yan ışık',
    'Düşük bakışlı sinematik portre',
    'Yoğun ifadeli sinematik baş eğimi',
    'Sert kontur ışıklı (rim light) sinematik yarım boy',
    'Belirgin çene hattı ile sinematik ön ışık',
    'Sinematik silüet benzeri profil',
    'Sinematik öne eğilme, gözlerde gerilim',
    'Sinematik tepe ışığı, karamsar editoryal',
    'Sinematik sert kontrast, cesur tavır',
    'Sinematik yumuşak parıltı, nazik duygusal çekim',
    'Yüze yakın el ile sinematik dinamik poz',
    'Sinematik alt açıdan dramatik portre',
    'Sinematik film karesi estetiği, buğulu atmosfer'
  ];

  // --- NEW BOUDOIR / LINGERIE POSES (CATEGORIZED) ---
  export const BOUDOIR_POSE_CATEGORIES: Record<string, string[]> = {
    'Yatak': [
        'Yatakta uzanmış, kollar başın üzerinde (Overhead)',
        'Yatakta oturarak, çarşafı tutarken (Sitting)',
        'Yüzüstü uzanmış, ayaklar havada (Prone)',
        'Yan yatarak, el başın altında (Side Lying)',
        'Yatak başlığına yaslanmış, bir diz kırık',
        'Bir eliyle göğsünü kavrayan (Touching breast)', 
        'Sırtüstü, dağınık saçlar, şehvetli bakış',
        'Yüzüstü, kalçalar hafif havada (Arching)', 
        'Dizleri üzerinde dururken (Kneeling on bed)',
        'Üstten tam bakış (Top Down), yatakta dağınık uzanmış',
        'Üstten bakış (High Angle), saçlar yastığa yayılmış',
        'Sırtüstü tam uzanmış, tek bacak kırık (Lying Flat)',
        'Yatakta çapraz uzanmış (Diagonal Lying)'
    ],
    'Duş': [
        'Arkadan görünüm, kalçalar duş camına yaslanmış (Pressed against glass)',
        'Arkası dönük, bir eliyle kalçasını kavrayan (Back view, squeezing glute)',
        'Bir eliyle göğsünü kavrayan (Touching breast)',
        'Duş kabininde, buğulu cam arkasında silüet',
        'Islak saçlar, su damlaları vücutta (Wet Look)',
        'Duş başlığı altında, baş geriye atılmış',
        'Cam duvara elini dayamış, buharlı ortam',
        'Islak vücut, omuz üzerinden bakış',
        'Yerde oturarak, suyun altında (Sitting under shower)',
        'Eller duvara yaslı, baş öne eğik (Sensual)' 
    ],
    'Ayakta': [
        'Duvara yaslanmış, tek bacak kırık',
        'Kapı kirişine tutunarak (Doorway)',
        'Pencere önünde silüet (Backlit)',
        'Ayakta, eller belde, güçlü duruş',
        'Aynaya bakarak (Reflection)',
        'Bir eliyle göğsünü kavrayan (Touching breast)',
        'Eller başının arkasında, gerinerek',
        'Vücut yan dönük, kalça çıkık (Curve emphasis)',
        'Elbisesini/kıyafetini hafifçe yukarı sıyıran' 
    ],
    'Oturarak': [
        'Kadife koltukta geriye yaslanmış',
        'Sandalye ters oturmuş (Straddling Chair)',
        'Makyaj masası önünde (Vanity)',
        'Yerde dizlerinin üzerinde (Kneeling)',
        'Puf üzerinde bacak bacak üstüne',
        'Bir eliyle göğsünü kavrayan (Touching breast)',
        'Bacaklarını karnına çekmiş (Hugging knees)',
        'Yerde bağdaş kurmuş, rahat ve doğal', 
        'Koltuğun kenarına ilişmiş (Perched)' 
    ]
  };

  export const ALL_BOUDOIR_POSES = Object.values(BOUDOIR_POSE_CATEGORIES).flat();

  // Helper for backward compatibility or auto-generation
  // UPDATED: Now supports specific category filter
  export const getVariedBoudoirPoses = (category?: string) => {
    if (category && BOUDOIR_POSE_CATEGORIES[category]) {
        return BOUDOIR_POSE_CATEGORIES[category];
    }
    return ALL_BOUDOIR_POSES;
  };

  export const MODEL_POSE_OPTIONS = [
    'Seçiniz (Otomatik)',
    ...VOGUE_FULL_BODY_POSES,
    ...VOGUE_HALF_BODY_POSES,
    ...VOGUE_HEAD_SHOULDERS_POSES,
    ...VOGUE_LOWER_BODY_POSES,
    ...VOGUE_WALKING_POSES,
    ...VOGUE_CINEMATIC_POSES
    // Removed BOUDOIR poses from the main list to reduce clutter.
    // Users must enable Boudoir Mode to access them.
  ];

  export const BACKGROUND_OPTIONS_FULL = [
    { value: 'auto', label: 'Seçiniz (Otomatik - Yapay Zeka Kararı)' },
    { value: 'Beyaz Stüdyo (Saf Beyaz)', label: 'Beyaz Stüdyo (Saf Beyaz)' },
    { value: 'Gri Stüdyo (Modern Beton)', label: 'Gri Stüdyo (Modern Beton)' },
    { value: 'Bej Stüdyo (Sıcak Tonlar)', label: 'Bej Stüdyo (Sıcak Tonlar)' },
    { value: 'Siyah Stüdyo (Dramatik)', label: 'Siyah Stüdyo (Dramatik)' },
    { value: 'Lüks İç Mekan (Ev/Otel)', label: 'Lüks İç Mekan (Ev/Otel)' },
    { value: 'Modern Ofis / Plaza', label: 'Modern Ofis / Plaza' },
    { value: 'Sokak / Şehir (Urban)', label: 'Sokak / Şehir (Urban)' },
    { value: 'Doğa / Park (Yeşil)', label: 'Doğa / Park (Yeşil)' },
    { value: 'Sahil / Plaj (Vogue Beach)', label: 'Sahil / Plaj (Vogue Beach)' },
    { value: 'Tarihi Mekan / Taş Duvar', label: 'Tarihi Mekan / Taş Duvar' },
    { value: 'Neon / Gece (Cyberpunk)', label: 'Neon / Gece (Cyberpunk)' },
    { value: 'Paris Balkonu (Klasik)', label: 'Paris Balkonu (Klasik)' },
    { value: 'Müze / Sanat Galerisi', label: 'Müze / Sanat Galerisi' },
    { value: 'Endüstriyel Depo (Loft)', label: 'Endüstriyel Depo (Loft)' },
    { value: 'Çöl / Kum Tepeleri', label: 'Çöl / Kum Tepeleri' },
    { value: 'Orman / Sisli Yol', label: 'Orman / Sisli Yol' },
    { value: 'Havuz Kenarı (Luxury Resort)', label: 'Havuz Kenarı (Luxury Resort)' },
    { value: 'Spor Salonu / Gym', label: 'Spor Salonu / Gym' },
    { value: 'Kafe / Restoran (Lifestyle)', label: 'Kafe / Restoran (Lifestyle)' },
    { value: 'Podyum (Defile Işıkları)', label: 'Podyum (Defile Işıkları)' },
    { value: 'Minimalist Mermer Zemin', label: 'Minimalist Mermer Zemin' },
    { value: 'Ahşap Duvar (Rustik)', label: 'Ahşap Duvar (Rustik)' },
    { value: 'Kütüphane (Akademik)', label: 'Kütüphane (Akademik)' },
    { value: 'Gün Batımı (Golden Hour)', label: 'Gün Batımı (Golden Hour)' },
    { value: 'Karlı Dağ Evi (Kış)', label: 'Karlı Dağ Evi (Kış)' }
  ];

  export const RESOLUTION_OPTIONS = [
    'Standart (1K) - 1 Kredi',
    'Yüksek (2K) - 1 Kredi',
    'Ultra (4K) - 2 Kredi'
  ];

  export const ASPECT_RATIO_OPTIONS = [
    '1:1 (Kare)',
    '3:4 (Dikey Portre)',
    '4:5 (Instagram Dikey)',
    '9:16 (Story/Reels)',
    '4:3 (Yatay)',
    '16:9 (Sinematik)'
  ];

  export const NUMBER_OF_IMAGES_OPTIONS = [
    '1 Adet',
    '2 Adet',
    '3 Adet',
    '4 Adet',
    '6 Set (Kapsamlı)' // Generates 6 diverse images
  ];

  export const MODEL_QUALITY_OPTIONS = [
    'Standart (Hızlı)',
    'Pro (Nano Banana - Yüksek Kalite)'
  ];

  export const BOUDOIR_LIGHTING_OPTIONS = [
    'Karanlık & Atmosferik (Varsayılan)',
    'Aydınlık & Ferah (High-Key)',
    'Altın Saat (Golden Hour)',
    'Canlı & Renkli (Vibrant)',
    'Yumuşak Beyaz (Soft Studio)',
    'Gece / Neon (Night)'
  ];

  export const BOUDOIR_CAMERA_ANGLE_OPTIONS = [
    'Otomatik (AI Seçimi)',
    'Göz Hizası (Eye Level)',
    'Üstten Bakış (High Angle / Top Down)',
    'Alçak Açı (Low Angle)',
    'Kuş Bakışı (Bird\'s Eye View)',
    'Yakın Plan (Close-Up)',
    'Yandan (Side Profile)',
    'Arkadan (Back View)',
    '45° Açılı (Dutch Angle)'
  ];

  // Accessory Background Styles
  export const ACCESSORY_BACKGROUND_STYLES = [
    'Otomatik (AI Seçimi)',
    'Açık Mavi (Taze & Modern)',
    'Bej / Krem (Minimal & Sıcak)',
    'Saf Beyaz (Temiz Stüdyo)',
    'Pudra Pembe (Zarif & Feminen)',
    'Açık Gri (Nötr & Profesyonel)',
    'Mint Yeşili (Taze & Doğal)',
    'Lavanta (Soft & Modern)',
    'Somon Pembe (Sıcak & Canlı)',
    'Açık Ten Rengi (Doğal Minimal)',
    'Koyu Mavi (Sofistike & Derin)',
    'Mermer Beyazı (Lüks & Zarif)',
    'Siyah (Kontrast & Dramatik)',
    'Koyu Yeşil (Klasik & Zengin)',
    'Bordo (Lüks & Samimi)'
  ];

  // Accessory Poses
  export const ACCESSORY_POSES = [
    'Otomatik (AI Seçimi)',
    'Zarif El Hareketi (Parmaklar Kıvrık)',
    'Rahat Duruş (Yan Açı)',
    'El Yukarıda (Dikey Duruş)',
    'El Aşağıda (Rahat Asılı)',
    'Bilek Odaklı (Yakın Plan)',
    'İki El Yan Yana',
    'El Üstte (Üstten Görünüm)',
    '45 Derece Açılı',
    'Yan Profil (Yandan Görünüm)',
    'Ön Görünüm (Tam Karşıdan)',
    'Hafif Hareket (Dinamik)',
    'Parmaklar Uzatılmış',
    'Yumruk Pozisyonu'
  ];

  // Accessory Lighting
  export const ACCESSORY_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Yumuşak Doğal Işık (Gündüz)',
    'Parlak Stüdyo Işığı (Aydınlık)',
    'Yan Işık (Hafif Gölge)',
    'Üstten Işık (Soft & Eşit)',
    'Önden Işık (Net & Düz)',
    'Arka Işık (Hafif Halo Efekti)',
    'Çift Yönlü Işık (Dengeli)',
    'Altın Saat Işığı (Sıcak)',
    'Soğuk Işık (Modern & Temiz)',
    'Yüksek Kontrastlı (Dramatik)',
    'Düşük Kontrastlı (Yumuşak)',
    'Bulutlu Gün (Yumuşak Dağınık)'
  ];

  // Wallet-Specific Options (with model)
  export const WALLET_POSES_WITH_MODEL = [
    'Otomatik (AI Seçimi)',
    'Elde Tutuyor (Zarif)',
    'Cebe Koyuyor',
    'Cebinden Çıkarıyor',
    'Açık Gösteriyor (İçi Görünür)',
    'Kapalı Gösteriyor',
    'Kart Çıkarıyor',
    'Para Koyuyor',
    'Tek Elle Tutuyor'
  ];

  // Wallet-Specific Scenes (without model - product only)
  export const WALLET_SCENES_PRODUCT_ONLY = [
    'Otomatik (AI Seçimi)',
    'Ahşap Masa Üzerinde',
    'Mermeri Yüzey Üzerinde',
    'Deri Koltuk Üzerinde',
    'Araba Gösterge Paneli',
    'Araba Koltuk Üzerinde',
    'Kafe Masası (Kahve Yanında)',
    'Ofis Masası (Laptop Yanında)',
    'Restoran Masası',
    'Çanta Yanında',
    'Anahtarlar Yanında',
    'Telefon Yanında',
    'Saat Yanında',
    'Minimalist Beyaz Yüzey',
    'Siyah Lüks Yüzey'
  ];

  // Wallet-Specific Lighting
  export const WALLET_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Doğal Pencere Işığı',
    'Yumuşak Stüdyo Işığı',
    'Dramatik Yan Işık',
    'Üstten Overhead Işık',
    'Sıcak Ortam Işığı',
    'Soğuk Profesyonel Işık',
    'Altın Saat (Güneş)',
    'Gölgeli Yumuşak Işık'
  ];

  // Bag-Specific Options (with model)
  export const BAG_POSES_WITH_MODEL = [
    'Otomatik (AI Seçimi)',
    'Omuzda Taşıyor',
    'Elde Tutuyor',
    'Kolda Asılı',
    'Sırt Çantası (Arkada)',
    'Çapraz Askılı',
    'İçini Gösteriyor (Açık)',
    'Kapalı Gösteriyor',
    'İçinden Bir Şey Çıkarıyor',
    'Yere Koyarken / Alırken',
    'Yan Profil (Çanta Vurgusu)'
  ];

  // Bag-Specific Scenes (without model - product only)
  export const BAG_SCENES_PRODUCT_ONLY = [
    'Otomatik (AI Seçimi)',
    'Ahşap Masa Üzerinde',
    'Mermer Yüzey Üzerinde',
    'Deri Koltuk Üzerinde',
    'Araba Arka Koltuğu',
    'Araba Bagajında',
    'Kafe Sandalyesinde',
    'Ofis Masası (Laptop Yanında)',
    'Gardrop/Dolap Rafında',
    'Ayakkabılık Yanında',
    'Cüzdan & Aksesuar Yanında',
    'Aynalı Konsol Üzerinde',
    'Restoran Sandalyesinde',
    'Otel Odası Yatağında',
    'Havaalanı/Seyahat Bağlamı',
    'Minimalist Beyaz Yüzey',
    'Siyah Lüks Yüzey'
  ];

  // Bag-Specific Lighting
  export const BAG_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Doğal Pencere Işığı',
    'Yumuşak Stüdyo Işığı',
    'Dramatik Yan Işık',
    'Üstten Overhead Işık',
    'Sıcak Ortam Işığı',
    'Soğuk Profesyonel Işık',
    'Altın Saat (Güneş)',
    'Gölgeli Yumuşak Işık',
    'Butik/Mağaza Işığı'
  ];

  // Watch-Specific Options
  export const WATCH_POSES_WITH_MODEL = [
    'Otomatik (AI Seçimi)',
    'Bilekte Takılı (Normal)',
    'Kolu Kaldırmış (Saati Gösterirken)',
    'Kol Masada (Rahat Duruş)',
    'Saat Ayarlama Pozu',
    'Kronograf Kullanırken',
    'Saati Takarken',
    'Saati Çıkarırken',
    'Kollar Çapraz (Saat Vurgulu)',
    'Tek Elle Bilek Tutma',
    'Yan Profil (Bilek & Saat)'
  ];

  export const WATCH_SCENES_PRODUCT_ONLY = [
    'Otomatik (AI Seçimi)',
    'Saat Kutusu Üzerinde',
    'Saat Yastığı/Standında',
    'Ahşap Masa Üzerinde',
    'Mermer Yüzey',
    'Cam Vitrin İçinde',
    'Deri Yüzey Üzerinde',
    'Araba Gösterge Paneli',
    'Ofis Masası (Laptop Yanında)',
    'Saat Koleksiyonu (Diğer Saatlerle)',
    'Çanta & Aksesuar Yanında',
    'Anahtarlık Yanında',
    'Minimalist Beyaz',
    'Siyah Lüks Yüzey'
  ];

  export const WATCH_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Doğal Pencere Işığı',
    'Yumuşak Stüdyo Işığı',
    'Dramatik Yan Işık (Metal Yansıma)',
    'Üstten Işık',
    'Vitrin/Mücevher Işığı',
    'Altın Saat (Warm Glow)',
    'Soğuk Profesyonel',
    'Spot Işık (Dramatic)'
  ];

  // Earrings-Specific Options
  export const EARRINGS_POSES_WITH_MODEL = [
    'Otomatik (AI Seçimi)',
    'Yüz Ön Profil (Küpeler Net)',
    'Yan Profil (Tek Taraf)',
    'İki Yan Profil (Simetrik)',
    'Saçını Kulağının Arkasına Atarken',
    'Küpeyi Takarken',
    'Küpeyi Çıkarırken',
    'Başını Eğmiş (Küpe Sallanıyor)',
    '3/4 Açı (Fashion)',
    'Gülümserken (Yüz & Küpe)',
    'Yan Bakış (Küpe Vurgulu)'
  ];

  export const EARRINGS_SCENES_PRODUCT_ONLY = [
    'Otomatik (AI Seçimi)',
    'Küpe Standı/Displayde',
    'Mücevher Kutusu İçinde',
    'Mermer Yüzey',
    'Ayna Yanında',
    'Cam Yüzey (Yansımalı)',
    'Kadife Yüzey',
    'Mücevher Koleksiyonu (Diğer Takılarla)',
    'Minimalist Beyaz',
    'Siyah Lüks Yüzey',
    'Çiçek Yanında',
    'İnci/Kristal Yanında'
  ];

  export const EARRINGS_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Yumuşak Doğal Işık',
    'Parlak Stüdyo Işığı',
    'Yan Işık (Taş Parıltısı)',
    'Üstten Işık',
    'Mücevher Vitrin Işığı',
    'Dramatik Kontrast',
    'Altın Saat',
    'Spot Işık (Gem Highlight)'
  ];

  // Necklace-Specific Options
  export const NECKLACE_POSES_WITH_MODEL = [
    'Otomatik (AI Seçimi)',
    'Boynunda Takılı (Ön)',
    'Yan Profil (Boyun Hattı)',
    'Kolyeyi Tutuyor (Elle)',
    'Kolyeyi Takarken',
    'Kolyeyi Çıkarırken',
    'Başı Arkaya Eğik (Boyun Vurgulu)',
    'Dekolte Vurgulu',
    '3/4 Profil (Fashion)',
    'Üstten Bakış (Kolye & Dekolte)',
    'Çapraz Omuz (Kolye Asimetrik)'
  ];

  export const NECKLACE_SCENES_PRODUCT_ONLY = [
    'Otomatik (AI Seçimi)',
    'Kolye Standı/Büstünde',
    'Mücevher Kutusu İçinde',
    'Mermer Yüzey (Yayık)',
    'Kadife Yastık Üzerinde',
    'Ayna Önünde',
    'Cam Yüzey (Yansımalı)',
    'Mücevher Koleksiyonu',
    'Gül/Çiçek Yanında',
    'İnci Koleksiyonu',
    'Minimalist Beyaz',
    'Siyah Lüks Yüzey'
  ];

  export const NECKLACE_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Yumuşak Doğal Işık',
    'Parlak Stüdyo Işığı',
    'Yan Işık (Taş & Zincir Parıltısı)',
    'Üstten Işık',
    'Mücevher Vitrin Işığı',
    'Dramatik Kontrast',
    'Altın Saat (Warm)',
    'Spot Işık (Pendant Vurgulu)'
  ];

  // Bracelet-Specific Options (Jewelry)
  export const BRACELET_JEWELRY_POSES_WITH_MODEL = [
    'Otomatik (AI Seçimi)',
    'Bilekte Takılı (Zarif El)',
    'El Yukarıda (Vertikal)',
    'El Aşağıda (Rahat)',
    'Bilek Çapraz',
    'Bilezik Detayına Bakıyor',
    'İki Bilek Yan Yana',
    'Bilezik Takarken',
    'Bilezik Çıkarırken',
    'Kol Masada (Close-up)',
    'Yan Profil (Bilek & Bilezik)'
  ];

  export const BRACELET_JEWELRY_SCENES_PRODUCT_ONLY = [
    'Otomatik (AI Seçimi)',
    'Bilezik Standı/Yastıkta',
    'Mücevher Kutusu İçinde',
    'Mermer Yüzey',
    'Kadife Yüzey',
    'Cam Yüzey (Yansımalı)',
    'Saat Yanında',
    'Mücevher Koleksiyonu',
    'Çiçek/Gül Yanında',
    'İnci Yanında',
    'Minimalist Beyaz',
    'Siyah Lüks Yüzey'
  ];

  export const BRACELET_JEWELRY_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Yumuşak Doğal Işık',
    'Parlak Stüdyo Işığı',
    'Yan Işık (Metal/Taş Parıltısı)',
    'Üstten Işık',
    'Mücevher Vitrin Işığı',
    'Dramatik Kontrast',
    'Altın Saat',
    'Spot Işık (Detail Focus)'
  ];

  // Ring-Specific Options
  export const RING_POSES_WITH_MODEL = [
    'Otomatik (AI Seçimi)',
    'Parmakta Takılı (Ön)',
    'El Yan Profil',
    'Parmaklar Uzatılmış',
    'Yüzüğü Gösterirken',
    'Yüzük Takarken',
    'Yüzük Çıkarırken',
    'İki El Yan Yana (Nişan/Evlilik)',
    'El Yüze Yakın (Yüzük Vurgulu)',
    'Kol Uzatmış (Yüzük Net)',
    'Yan Profil (Ring Detail)'
  ];

  export const RING_SCENES_PRODUCT_ONLY = [
    'Otomatik (AI Seçimi)',
    'Yüzük Kutusu İçinde',
    'Yüzük Standı/Yastıkta',
    'Mermer Yüzey',
    'Kadife Yüzey',
    'Cam Yüzey (Yansımalı)',
    'Çiçek/Gül Yaprağında',
    'Mücevher Koleksiyonu',
    'Diğer Yüzüklerle',
    'İnci Yanında',
    'Minimalist Beyaz',
    'Siyah Lüks Yüzey'
  ];

  export const RING_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Yumuşak Doğal Işık',
    'Parlak Stüdyo Işığı',
    'Yan Işık (Taş Parıltısı)',
    'Üstten Işık',
    'Mücevher Vitrin Işığı',
    'Dramatik Kontrast (Diamond Sparkle)',
    'Altın Saat',
    'Spot Işık (Stone Focus)'
  ];

  // Hat-Specific Options
  export const HAT_POSES_WITH_MODEL = [
    'Otomatik (AI Seçimi)',
    'Başta Takılı (Normal)',
    'Şapka Hafif Eğik (Stylish)',
    'Şapkayı Tutuyor (Elle)',
    'Şapka Takarken',
    'Şapka Çıkarırken',
    'Şapka Göğüste (Selam Pozu)',
    'Şapka Arkada (Başın Arkasında)',
    'Yan Profil (Şapka Silueti)',
    'Şapka ile Oynuyor',
    'Rüzgarda (Şapka Tutma)'
  ];

  export const HAT_SCENES_PRODUCT_ONLY = [
    'Otomatik (AI Seçimi)',
    'Şapka Standı/Mankende',
    'Ahşap Masa Üzerinde',
    'Gardrop Rafında',
    'Askılıkta Asılı',
    'Ayakkabı/Çanta Yanında',
    'Ayna Önünde',
    'Vintage Valiz Üzerinde',
    'Dış Mekan (Doğal)',
    'Kafe Masası',
    'Plaj Havlusu Üzerinde',
    'Minimalist Beyaz',
    'Siyah Lüks Yüzey'
  ];

  export const HAT_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Doğal Gün Işığı',
    'Yumuşak Stüdyo Işığı',
    'Yan Işık (Texture Vurgulu)',
    'Üstten Işık',
    'Altın Saat (Outdoor)',
    'Dramatik Kontrast',
    'Sıcak Ortam Işığı',
    'Soğuk Profesyonel'
  ];

  // Shoes-Specific Options (with model)
  export const SHOES_POSES_WITH_MODEL = [
    'Otomatik (AI Seçimi)',
    'Ayakta Duruş (Statik)',
    'Yürüme Anı (Dinamik)',
    'Koşma Pozu',
    'Oturur Pozisyon (Bacak Bacak Üstüne)',
    'Tek Ayak Öne',
    'Yan Profil Duruş',
    'Merdiven Çıkma',
    'Casual Ayak Pozları',
    'Spor Aktivite Pozu'
  ];

  // Shoes-Specific Scenes (without model - product only)
  export const SHOES_SCENES_PRODUCT_ONLY = [
    'Otomatik (AI Seçimi)',
    'Beyaz Zemin (Minimal)',
    'Ahşap Zemin',
    'Mermer Zemin',
    'Beton Zemin (Urban)',
    'Ayakkabı Kutusu Üzerinde',
    'Ayakkabı Kutusu Yanında',
    'Raf/Vitrin İçinde',
    'Deri Koltu Üzerinde',
    'Sokak Taşı Zemin',
    'Koşu Pisti',
    'Spor Salonu Zemini',
    'Çim/Doğa Zemini',
    'Kum/Plaj Zemini',
    'Şık Mağaza Vitrini'
  ];

  // Shoes-Specific Lighting
  export const SHOES_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Parlak Stüdyo Işığı',
    'Doğal Gün Işığı',
    'Yan Işık (Kontur)',
    'Üstten Işık',
    'Altın Saat (Outdoor)',
    'Spot Işık (Dramatik)',
    'Yumuşak Dağınık Işık',
    'Soğuk Beyaz Işık'
  ];

  // Sunglasses-Specific Options (with model)
  export const SUNGLASSES_POSES_WITH_MODEL = [
    'Otomatik (AI Seçimi)',
    'Gözlüğü Takılı (Normal)',
    'Gözlüğü Takılı (Güneşe Bakış)',
    'Gözlüğü Çıkarıyor',
    'Gözlüğü Takıyor',
    'Gözlük Başta (Saçta)',
    'Gözlük Camına Bakıyor',
    'Tek Elle Gözlük Tutuyor',
    'Gözlük Gömlek Yakasında',
    'Gözlükle Poz (Fashion)'
  ];

  // Sunglasses-Specific Scenes (without model - product only)
  export const SUNGLASSES_SCENES_PRODUCT_ONLY = [
    'Otomatik (AI Seçimi)',
    'Beyaz Minimal Yüzey',
    'Ahşap Masa Üzerinde',
    'Mermer Yüzey',
    'Kitap Üzerinde/Yanında',
    'Laptop Yanında',
    'Kahve Fincanı Yanında',
    'Plaj Havlusu Üzerinde',
    'Kum Üzerinde (Plaj)',
    'Araba Gösterge Paneli',
    'Güneş Işığında (Gölge)',
    'Çanta Yanında',
    'Şapka Yanında',
    'Dergi Üzerinde',
    'Cam Yüzey (Yansıma)'
  ];

  // Sunglasses-Specific Lighting
  export const SUNGLASSES_LIGHTING = [
    'Otomatik (AI Seçimi)',
    'Parlak Güneş Işığı',
    'Yumuşak Stüdyo Işığı',
    'Altın Saat (Güneş)',
    'Yan Işık (Yansıma)',
    'Arka Işık (Siluet)',
    'Doğal Pencere Işığı',
    'Dramatik Kontrast Işık',
    'Yumuşak Gölgeli'
  ];

  // Try On Specific Constants
  export const TRYON_CATEGORIES = [
    'Üst Giyim (Tişört/Gömlek/Bluz)',
    'Alt Giyim (Pantolon/Etek)',
    'Elbise (Tam Boy)',
    'Dış Giyim (Ceket/Mont)',
    'Aksesuar (Çanta/Kolye/Şapka)'
  ];

  export const TRYON_POSES = [
    'Seçiniz (Otomatik)',
    'Orijinal Pozu Koru',
    ...VOGUE_FULL_BODY_POSES,
    ...VOGUE_HALF_BODY_POSES,
    ...VOGUE_HEAD_SHOULDERS_POSES,
    ...VOGUE_LOWER_BODY_POSES,
    ...VOGUE_WALKING_POSES,
    ...VOGUE_CINEMATIC_POSES
  ];

  export const TRYON_BACKGROUNDS = [
    { value: 'auto', label: 'Seçiniz (Otomatik)' },
    { value: 'original', label: 'Orijinal Arka Planı Koru' },
    { value: 'Beyaz Stüdyo', label: 'Beyaz Stüdyo' },
    { value: 'Lüks Mağaza', label: 'Lüks Mağaza' },
    { value: 'Sokak (Street Style)', label: 'Sokak (Street Style)' },
    { value: 'Plaj', label: 'Plaj' }
  ];

  // AD CREATIVE CONSTANTS
  export const AD_PLATFORMS = [
    'Instagram Post (1:1)',
    'Instagram Story (9:16)',
    'Facebook Feed (4:5)',
    'Pinterest Pin (2:3)',
    'Web Banner (16:9)'
  ];

  export const AD_IMAGE_COUNT_OPTIONS = [
    '1 Adet',
    '3 Adet', 
    '5 Adet',
    '10 Set (Tam Kampanya)'
  ];

  export const AD_FONT_OPTIONS = [
    'Seçiniz (Otomatik)',
    'Modern Minimalist (Sans-Serif)',
    'Lüks / Elegant (Serif)',
    'Kalın & Güçlü (Bold Editorial)',
    'El Yazısı (Signature)',
    'Futuristik (Tech)',
    'Vintage / Retro',
    'Sokak Stili (Urban)',
    'Dergi Stili (High-Fashion)'
  ];

  export const UPSCALE_FACTORS = [
    '2x İyileştirme (Keskinleştir)',
    '4x Büyütme (Ultra Detay)'
  ];

  export const UPSCALE_SHARPNESS = [
    'Doğal (Yumuşak)',
    'Yüksek (Keskin)',
    'Maksimum (HDR)'
  ];

  export const IMAGE_COUNT_OPTIONS = [
    { value: 1, label: '1 Görsel' },
    { value: 2, label: '2 Görsel' },
    { value: 3, label: '3 Görsel' },
    { value: 5, label: '5 Görsel' },
    { value: 10, label: '10 Görsel' }
  ];

  // --- HELPER FUNCTIONS ---

  export const getDefaultPoseForCategory = (category: string): string => {
    const cat = category.toLowerCase();
    
    if (cat.includes('çanta') || cat.includes('bag')) {
        return 'Ayakta, çanta ön planda, doğal duruş';
    }
    if (cat.includes('ayakkabı') || cat.includes('sneaker')) {
        return 'Belden aşağı, bir adım önde, dinamik ayakkabı vurgusu';
    }
    if (cat.includes('iç giyim') || cat.includes('lingerie') || cat.includes('bikini')) {
        return 'Tam boy, vücut çapraz açıda, omuzlar açılı';
    }
    if (cat.includes('yüzük') || cat.includes('küpe') || cat.includes('kolye')) {
        return 'Göğüsten Yukarı, bir el küpeye dokunuyor';
    }
    // Default fallback
    return 'Seçiniz (Otomatik)';
  };

  export const getVariedBackgrounds = (category: string, isBoudoir: boolean = false, boudoirCategory?: string, lighting?: string): string[] => {
      // If Boudoir mode is enabled, cycle through bedroom/intimate settings based on CATEGORY
      if (isBoudoir) {
          const isBright = lighting && (lighting.includes('Aydınlık') || lighting.includes('Yumuşak'));
          const isGolden = lighting && lighting.includes('Altın');
          //const isVibrant = lighting && lighting.includes('Canlı'); // Use standard bg but rely on prompt for vibrant color

          if (boudoirCategory === 'Duş') {
             if (isBright) {
                 return [
                     "Bright White Spa Bathroom, Natural Sunlight, Clean Marble.",
                     "Outdoor Tropical Shower, Sunny Day, Green Plants.",
                     "Minimalist Glass Shower, High Key Lighting, White Tiles.",
                     "Luxury White Marble Bathroom, Soft Morning Light.",
                     "Open Air Shower overlooking ocean, Bright sun."
                 ];
             }
             return [
                 "Luxury Bathroom Shower, Wet Glass, Steamy Atmosphere, Marble Walls. Cinematic.",
                 "Modern Rainforest Shower, Dark Slate Tiles, Falling Water, High Contrast.",
                 "Bright White Spa Bathroom, Steam rising, wet floor reflection.",
                 "Elegant Glass Shower Cabin, Golden Fixtures, Moody Lighting.",
                 "Minimalist Concrete Shower, Natural Skylight, Water drops on lens."
             ];
          }
          if (boudoirCategory === 'Yatak') {
             if (isBright) {
                 return [
                     "Bright White Bedroom, Sun-drenched, White Linen Sheets.",
                     "Bohemian Bedroom with macrame, bright airy window light.",
                     "Minimalist Scandinavian Bedroom, Morning Sun, Pale Wood.",
                     "Luxury Hotel Suite, Floor to ceiling windows, Bright Day.",
                     "White Loft Apartment Bed, Soft shadows, High Key."
                 ];
             }
             if (isGolden) {
                 return [
                    "Bedroom during Golden Hour, Warm orange sunlight beams.",
                    "Sunset view bedroom, warm glow on sheets.",
                    "Romantic bedroom with candles and sunset light.",
                    "Cozy bed with warm fairy lights and golden lamp.",
                    "Sun-kissed sheets, afternoon warm light."
                 ];
             }
             return [
                 "Luxury Master Bedroom with white silk sheets, soft pillows, morning light.",
                 "Dimly lit romantic boudoir, velvet headboard, warm lamp light.",
                 "Messy unmade bed in a sun-drenched loft apartment.",
                 "High-end Hotel Suite Bedroom, crisp linens, city view window.",
                 "Cozy intimate bedroom setting, fireplace glow in background."
             ];
          }
          if (boudoirCategory === 'Ayakta' || boudoirCategory === 'Oturarak') {
             if (isBright) {
                 return [
                     "Bright Minimalist Dressing Room, White Walls.",
                     "Sunlit Corner with sheer curtains.",
                     "White Studio Background, High Key.",
                     "Airy Balcony with white railings.",
                     "Modern Bright Living Room."
                 ];
             }
             return [
                 "Elegant Dressing Room with large mirrors and soft vanity lighting.",
                 "Luxury Bedroom Corner with velvet armchair and curtains.",
                 "Bright Morning Window with sheer white curtains, backlit.",
                 "Moody Dark Room with rim lighting, emphasizing silhouette.",
                 "Classic Parisian Apartment Interior, cream walls, wooden floor."
             ];
          }

          // Fallback Generic Mix
          return [
              "Luxury Master Bedroom with white silk sheets",
              "Dimly lit boudoir with velvet curtains",
              "Elegant dressing room with large mirror",
              "Minimalist white bedroom, morning light",
              "Cozy fireplace setting, warm rug"
          ];
      }

      // Standard logic
      const cat = category.toLowerCase();
      
      if (cat.includes('plaj') || cat.includes('bikini') || cat.includes('mayo')) {
          return [
              "Sunny white sand beach, turquoise water",
              "Wooden pool deck at a luxury resort",
              "Tropical palm garden, dappled sunlight",
              "Sunset by the ocean, golden hour",
              "Rocky mediterranean coast"
          ];
      }

      if (cat.includes('ceket') || cat.includes('mont') || cat.includes('kaban')) {
           return [
               "Autumn city street with fallen leaves",
               "Modern architectural concrete wall",
               "Snowy mountain chalet exterior",
               "Cloudy london street atmosphere",
               "Minimalist grey studio"
           ];
      }

      // Default Fashion Mix
      return [
          "White Studio",
          "Parisian Street Corner",
          "Modern Art Gallery Interior",
          "Luxury Hotel Lobby",
          "Sunny Garden"
      ];
  };

  // --- ADMIN PANEL TYPES ---

  // Admin panel sekmeleri
  export type AdminTabType = 'dashboard' | 'users' | 'subscribers' | 'studio';

  // Email abone tipi
  export interface EmailSubscriber {
    id: string;
    email: string;
    timestamp: string;
    source: string;
  }

  // Admin istatistikleri
  export interface AdminStats {
    totalUsers: number;
    totalCreditsUsed: number;
    totalGenerations: number;
    totalSubscribers: number;
    usersByPlan: {
      free: number;
      pro: number;
      enterprise: number;
    };
    recentActivity: {
      date: string;
      users: number;
      generations: number;
      credits: number;
    }[];
    // Trend data (percentage change compared to previous period)
    trends: {
      users: number;
      generations: number;
      credits: number;
      subscribers: number;
    };
    // Daily sparkline data for last 7 days
    dailyGenerations: number[];
    dailyCredits: number[];
    dailyUsers: number[];
  }

  // Admin kullanıcı görünümü (UserProfile'ın genişletilmiş hali)
  export interface AdminUserView {
    uid: string;
    email: string;
    displayName?: string;
    credits: number;
    plan: 'free' | 'pro' | 'enterprise';
    createdAt: string;
    lastLogin: string;
    totalGenerations: number;
    totalCreditsUsed: number;
    totalEstimatedCost?: number; // Total AI API cost
    modelUsage?: { [modelName: string]: number }; // Model usage count
    recentUsageHistory?: UsageRecord[]; // Last 10 usage records
  }
  
  // Usage Record (also defined in firebase.ts)
  export interface UsageRecord {
    id: string;
    type: 'studio' | 'try-on' | 'ad-creative' | 'upscale';
    creditsUsed: number;
    timestamp: string;
    details: string;
    aiModel?: string;
    estimatedCost?: number;
  }

  // AI Model Cost Estimation (Real pricing from Google AI Studio)
  export const AI_MODEL_COSTS = {
    'gemini-2.5-flash-image': {
      name: 'Gemini 2.5 Flash',
      costPerImage: 0.039, // $0.039 USD per image
      inputCostPer1M: 0.0125, // $0.0125 per 1M input tokens
    },
    'gemini-3-pro-image-preview': {
      name: 'Gemini 3.0 Pro (Nano Banana Pro)',
      costPerImage: 0.40, // $0.40 USD per image
      inputCostPer1M: 0.125, // $0.125 per 1M input tokens
    },
    'gemini-2.5-flash-text': {
      name: 'Gemini 2.5 Flash (Text)',
      outputCostPer1M: 0.05, // $0.05 per 1M output tokens
      inputCostPer1M: 0.0125,
    }
  } as const;

  export type AIModelType = keyof typeof AI_MODEL_COSTS;

  // Helper function to get AI model display name
  export const getAIModelDisplayName = (modelKey: string): string => {
    if (modelKey in AI_MODEL_COSTS) {
      return AI_MODEL_COSTS[modelKey as AIModelType].name;
    }
    return modelKey;
  };

  // Helper function to estimate cost
  export const estimateAICost = (modelKey: string, imageCount: number = 1): number => {
    if (modelKey in AI_MODEL_COSTS) {
      const model = AI_MODEL_COSTS[modelKey as AIModelType];
      if ('costPerImage' in model) {
        return model.costPerImage * imageCount;
      }
    }
    return 0;
  };

  // Helper function to get required credits for AI model
  // Fiyatlandırma:
  // - 1K görsel: 1 kredi (maliyet: $0.0015)
  // - 2K görsel: 1 kredi (maliyet: $0.0015)
  // - 4K görsel: 2 kredi (maliyet: $0.0030)
  export const getRequiredCredits = (modelKey: string, imageCount: number = 1, resolution?: string): number => {
    // Çözünürlük bazlı kredi hesaplama
    // 4K = 2 kredi, diğerleri (1K, 2K) = 1 kredi
    const is4K = resolution?.toLowerCase().includes('4k') || resolution?.toLowerCase().includes('ultra');
    const creditsPerImage = is4K ? 2 : 1;
    return creditsPerImage * imageCount;
  };

  // Çözünürlük bazlı kredi bilgisi (UI için)
  export const getCreditsForResolution = (resolution: string): number => {
    const is4K = resolution?.toLowerCase().includes('4k') || resolution?.toLowerCase().includes('ultra');
    return is4K ? 2 : 1;
  };

  // Credit Packages
  export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number; // TRY (Turkish Lira)
    priceUSD?: number; // Optional USD price
    features: string[];
    popular?: boolean;
    color: string; // For UI styling
    estimatedGenerations: string; // Example: "~800 görsel"
  }

  export const CREDIT_PACKAGES: CreditPackage[] = [
    {
      id: 'starter',
      name: 'Başlangıç',
      credits: 100,
      price: 0, // Will be calculated from USD
      priceUSD: 9.99,
      color: 'gray',
      estimatedGenerations: '100 adet 1K veya 50 adet 4K görsel',
      features: [
        '100 Kredi',
        '1 kredi = 1 adet 1K görsel',
        '2 kredi = 1 adet 4K görsel',
        'Email destek',
        '30 gün geçerlilik'
      ]
    },
    {
      id: 'professional',
      name: 'Profesyonel',
      credits: 500,
      price: 0, // Will be calculated from USD
      priceUSD: 39.99,
      color: 'violet',
      popular: true,
      estimatedGenerations: '500 adet 1K veya 250 adet 4K görsel',
      features: [
        '500 Kredi',
        '1 kredi = 1 adet 1K görsel',
        '2 kredi = 1 adet 4K görsel',
        'Öncelikli destek',
        '60 gün geçerlilik',
        '%20 tasarruf'
      ]
    },
    {
      id: 'business',
      name: 'İşletme',
      credits: 1500,
      price: 0, // Will be calculated from USD
      priceUSD: 99.99,
      color: 'indigo',
      estimatedGenerations: '1500 adet 1K veya 750 adet 4K görsel',
      features: [
        '1500 Kredi',
        '1 kredi = 1 adet 1K görsel',
        '2 kredi = 1 adet 4K görsel',
        'Toplu üretim',
        'Öncelikli destek',
        '90 gün geçerlilik',
        '%33 tasarruf'
      ]
    },
    {
      id: 'enterprise',
      name: 'Kurumsal',
      credits: 5000,
      price: 0, // Will be calculated from USD
      priceUSD: 299.99,
      color: 'amber',
      estimatedGenerations: '5000 adet 1K veya 2500 adet 4K görsel',
      features: [
        '5000 Kredi',
        '1 kredi = 1 adet 1K görsel',
        '2 kredi = 1 adet 4K görsel',
        'Toplu işlemler',
        '7/24 destek',
        '120 gün geçerlilik',
        '%40 tasarruf',
        'Özel eğitim'
      ]
    }
  ];

  // Helper function to calculate TRY price from USD
  export const calculateTRYPrice = (usdPrice: number, exchangeRate: number): number => {
    return Math.round(usdPrice * exchangeRate);
  };

  // Helper function to check if a product is an accessory
  export const isAccessoryProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    const accessoryKeywords = [
      'bileklik', 'bracelet',
      'yüzük', 'ring',
      'şapka', 'bere', 'hat',
      'kolye', 'necklace',
      'küpe', 'earring',
      'saat', 'watch',
      'ayakkabı', 'sneaker', 'bot', 'shoe',
      'çanta', 'bag', 'wallet', 'cüzdan',
      'gözlük', 'sunglasses', 'glasses'
    ];
    
    return accessoryKeywords.some(keyword => lowerCategory.includes(keyword));
  };

  export const isWalletProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory.includes('cüzdan') || lowerCategory.includes('wallet');
  };

  export const isBagProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory.includes('çanta') || lowerCategory.includes('bag');
  };

  export const isWatchProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory.includes('saat') || lowerCategory.includes('watch');
  };

  export const isEarringsProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory.includes('küpe') || lowerCategory.includes('earring');
  };

  export const isNecklaceProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory.includes('kolye') || lowerCategory.includes('necklace');
  };

  export const isBraceletJewelryProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory.includes('bileklik') || lowerCategory.includes('bracelet');
  };

  export const isRingProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory.includes('yüzük') || lowerCategory.includes('ring');
  };

  export const isHatProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory.includes('şapka') || lowerCategory.includes('bere') || 
           lowerCategory.includes('hat') || lowerCategory.includes('beanie');
  };

  export const isShoesProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory.includes('ayakkabı') || lowerCategory.includes('sneaker') || 
           lowerCategory.includes('bot') || lowerCategory.includes('shoe');
  };

  export const isSunglassesProduct = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory.includes('gözlük') || lowerCategory.includes('sunglasses') || 
           lowerCategory.includes('glasses');
  };

  // PROFESSIONAL STUDIO STYLES - Background Prompts
  export const PROFESSIONAL_STUDIO_STYLES: Record<string, string> = {
    'Clean White Studio': 'Pure white seamless studio background, high-key lighting, ultra clean look, shadowless setup, professional fashion catalog photography, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Softbox Classic': 'Neutral studio background with large softbox lighting, soft shadows, balanced exposure, classic professional fashion shoot, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'High-End Editorial': 'Luxury studio setup, controlled cinematic lighting, subtle shadows, premium fashion editorial atmosphere, magazine-quality photography, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Dark Studio Contrast': 'Dark studio background, strong contrast lighting, dramatic shadows, sharp highlights, premium fashion photography style, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Natural Daylight Studio': 'Studio setup mimicking natural daylight, soft window light effect, realistic skin tones, clean and modern fashion look, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Grey Seamless': 'Neutral grey seamless studio backdrop, balanced soft lighting, minimal distractions, professional catalog-ready appearance, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Commercial E-Commerce': 'Bright professional studio lighting, clean background, even exposure, sharp details, optimized for e-commerce product presentation, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Beauty Studio': 'High-detail beauty studio lighting, soft skin rendering, controlled highlights, clean backdrop, cosmetic and fashion-focused setup, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Fashion Lookbook': 'Minimal studio background, soft directional lighting, editorial composition, modern fashion lookbook style, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Studio Spotlight': 'Focused spotlight lighting in studio environment, subtle falloff shadows, dramatic yet clean professional fashion mood, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Matte Studio Minimal': 'Matte studio background, low reflection lighting, soft neutral tones, minimal and premium fashion presentation, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Ultra Sharp Catalog': 'Ultra sharp focus, high resolution studio lighting, flat and even illumination, perfect for detailed product and garment shots, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Luxury Brand Studio': 'High-end luxury studio environment, refined lighting balance, elegant shadows, premium brand fashion photography aesthetic, ultra high resolution, crystal clear, no blur, no noise, professional camera quality',
    
    'Modern Studio Pro': 'Contemporary studio setup, clean background, advanced lighting control, crisp details, modern professional fashion shoot, ultra high resolution, crystal clear, no blur, no noise, professional camera quality'
  };

  // ============================================================================
  // BRANDED AI GUIDE - MODULAR SYSTEM CONSTANTS
  // Pipeline Order: Concept → Subject → Colors → Composition → Lighting → Camera
  // ============================================================================

  // MODULE 1: CONCEPT - Defines visual purpose
  export const BRANDED_CONCEPTS = [
    'Otomatik (AI Seçimi)',
    'Ürün Kahramanı',
    'Güzellik Çekimi',
    'Moda Editoryal',
    'Stüdyo Çekim',
    'Yaşam Sahnesi',
    'Kampanya Görseli',
    '3D Render Tarzı'
  ];

  export const BRANDED_CONCEPT_PROMPTS: Record<string, string> = {
    'Ürün Kahramanı': 'Hero product shot with dramatic presentation, premium showcase style, designed to make the product the absolute center of attention',
    'Güzellik Çekimi': 'Close-up beauty photography style, soft focus on details, highlighting texture and premium quality',
    'Moda Editoryal': 'High-fashion editorial style, artistic composition, magazine-quality presentation with strong visual narrative',
    'Stüdyo Çekim': 'Professional studio photography setup, controlled environment, clean and commercial presentation',
    'Yaşam Sahnesi': 'Natural lifestyle context, authentic real-world setting, relatable and aspirational scene',
    'Kampanya Görseli': 'Brand campaign aesthetic, bold statement visual, designed for advertising impact',
    '3D Render Tarzı': 'Hyper-realistic 3D render aesthetic, perfect geometry, impossibly clean presentation'
  };

  // MODULE 2: SUBJECT - Human Attributes
  export const BRANDED_STANCE = [
    'Otomatik (AI Seçimi)',
    'Rahat',
    'Kendinden Emin',
    'Dinamik',
    'Resmi'
  ];

  export const BRANDED_STANCE_PROMPTS: Record<string, string> = {
    'Rahat': 'Relaxed stance, natural body language, comfortable and at ease, approachable posture',
    'Kendinden Emin': 'Confident stance, strong posture, assertive body language, commanding presence',
    'Dinamik': 'Dynamic stance, energetic posture, movement implied, active body language',
    'Resmi': 'Formal stance, precise posture, controlled body language, professional presence'
  };

  export const BRANDED_POSE_ENERGY = [
    'Otomatik (AI Seçimi)',
    'Statik',
    'Akışkan',
    'Hareketli'
  ];

  export const BRANDED_POSE_ENERGY_PROMPTS: Record<string, string> = {
    'Statik': 'Static pose, stillness, frozen moment, stable and grounded',
    'Akışkan': 'Flowing movement, graceful motion, smooth transitions, elegant gesture',
    'Hareketli': 'Active motion, kinetic energy, captured mid-movement, dynamic action'
  };

  export const BRANDED_CLOTHING_STYLE = [
    'Otomatik (AI Seçimi)',
    'Minimal',
    'Editoryal',
    'Günlük',
    'Lüks'
  ];

  export const BRANDED_CLOTHING_STYLE_PROMPTS: Record<string, string> = {
    'Minimal': 'Minimalist clothing style, clean lines, simple silhouettes, understated elegance',
    'Editoryal': 'Editorial fashion styling, high-fashion pieces, statement garments, avant-garde elements',
    'Günlük': 'Casual clothing style, relaxed fit, everyday wear, comfortable and accessible',
    'Lüks': 'Luxury clothing style, premium fabrics, refined tailoring, high-end designer aesthetic'
  };

  export const BRANDED_HAIR_STYLE = [
    'Otomatik (AI Seçimi)',
    'Düzgün',
    'Doğal',
    'Dokulu'
  ];

  export const BRANDED_HAIR_STYLE_PROMPTS: Record<string, string> = {
    'Düzgün': 'Slick hairstyle, polished, well-groomed, glossy finish, controlled styling',
    'Doğal': 'Natural hair styling, effortless look, organic texture, minimal product',
    'Dokulu': 'Textured hair, volume and movement, dimensional styling, modern and edgy'
  };

  export const BRANDED_EXPRESSION = [
    'Otomatik (AI Seçimi)',
    'Nötr',
    'Kendinden Emin',
    'Yumuşak'
  ];

  export const BRANDED_EXPRESSION_PROMPTS: Record<string, string> = {
    'Nötr': 'Neutral expression, calm face, subtle emotion, professional demeanor',
    'Kendinden Emin': 'Confident expression, strong gaze, assured look, powerful presence',
    'Yumuşak': 'Soft expression, gentle features, approachable look, warm and inviting'
  };

  // MODULE 2: SUBJECT - Product Attributes
  export const BRANDED_PRODUCT_ORIENTATION = [
    'Otomatik (AI Seçimi)',
    'Yatay',
    'Dikey',
    'Açılı'
  ];

  export const BRANDED_PRODUCT_ORIENTATION_PROMPTS: Record<string, string> = {
    'Yatay': 'Horizontal product orientation, landscape placement, wide presentation',
    'Dikey': 'Vertical product orientation, portrait placement, tall presentation',
    'Açılı': 'Angled product orientation, three-quarter view, dynamic perspective'
  };

  export const BRANDED_PRODUCT_PLACEMENT = [
    'Otomatik (AI Seçimi)',
    'Yüzey Üzerinde',
    'Elde Tutulan',
    'Havada Asılı'
  ];

  export const BRANDED_PRODUCT_PLACEMENT_PROMPTS: Record<string, string> = {
    'Yüzey Üzerinde': 'Product placed on surface, grounded, stable placement, resting naturally',
    'Elde Tutulan': 'Product held in hands, human interaction, tactile presentation',
    'Havada Asılı': 'Product floating in space, suspended, weightless presentation, hero shot style'
  };

  export const BRANDED_PRODUCT_CONTEXT = [
    'Otomatik (AI Seçimi)',
    'İzole',
    'Yaşam Tarzı'
  ];

  export const BRANDED_PRODUCT_CONTEXT_PROMPTS: Record<string, string> = {
    'İzole': 'Isolated product, no context, pure product focus, clean background',
    'Yaşam Tarzı': 'Lifestyle context, real-world setting, environmental storytelling'
  };

  export const BRANDED_PRODUCT_CONDITION = [
    'Otomatik (AI Seçimi)',
    'Kusursuz',
    'Eskimiş',
    'Dokulu'
  ];

  export const BRANDED_PRODUCT_CONDITION_PROMPTS: Record<string, string> = {
    'Kusursuz': 'Pristine condition, brand new, flawless surface, perfect state',
    'Eskimiş': 'Worn condition, used patina, authentic wear, lived-in character',
    'Dokulu': 'Textured surface, tactile details, material richness, dimensional quality'
  };

  // MODULE 3: COLORS & MATERIALS
  export const BRANDED_COLOR_TEMPERATURE = [
    'Otomatik (AI Seçimi)',
    'Sıcak',
    'Nötr',
    'Soğuk'
  ];

  export const BRANDED_COLOR_TEMPERATURE_PROMPTS: Record<string, string> = {
    'Sıcak': 'Warm color temperature, golden tones, inviting atmosphere, cozy and comfortable feel',
    'Nötr': 'Neutral color temperature, balanced tones, natural appearance, versatile mood',
    'Soğuk': 'Cool color temperature, blue tones, crisp atmosphere, modern and clean feel'
  };

  export const BRANDED_COLOR_HARMONY = [
    'Otomatik (AI Seçimi)',
    'Monokromatik',
    'Tamamlayıcı',
    'Benzer Tonlar',
    'Nötr'
  ];

  export const BRANDED_COLOR_HARMONY_PROMPTS: Record<string, string> = {
    'Monokromatik': 'Monochromatic color harmony, single color family, tonal variations, cohesive and sophisticated',
    'Tamamlayıcı': 'Complementary color harmony, opposite colors, high contrast, vibrant and dynamic',
    'Benzer Tonlar': 'Analogous color harmony, adjacent colors, smooth transitions, harmonious and pleasing',
    'Nötr': 'Neutral color harmony, understated palette, grays and earth tones, timeless and elegant'
  };

  export const BRANDED_MATERIAL_FINISH = [
    'Otomatik (AI Seçimi)',
    'Mat',
    'Saten',
    'Parlak',
    'Dokulu'
  ];

  export const BRANDED_MATERIAL_FINISH_PROMPTS: Record<string, string> = {
    'Mat': 'Matte material finish, no reflection, soft surface, understated and premium',
    'Saten': 'Satin material finish, subtle sheen, soft reflection, elegant and refined',
    'Parlak': 'High gloss material finish, mirror-like reflection, dramatic shine, luxurious and bold',
    'Dokulu': 'Textured material finish, tactile surface, dimensional quality, rich and detailed'
  };

  // MODULE 4: COMPOSITION
  export const BRANDED_FRAMING = [
    'Otomatik (AI Seçimi)',
    'Merkezli',
    'Üçte Bir Kuralı',
    'Merkez Dışı'
  ];

  export const BRANDED_FRAMING_PROMPTS: Record<string, string> = {
    'Merkezli': 'Centered framing, symmetrical composition, subject in middle, balanced and formal',
    'Üçte Bir Kuralı': 'Rule of thirds framing, subject on intersection points, dynamic balance, professional composition',
    'Merkez Dışı': 'Off-center framing, asymmetrical composition, negative space emphasis, artistic and modern'
  };

  export const BRANDED_DEPTH = [
    'Otomatik (AI Seçimi)',
    'Sığ',
    'Katmanlı',
    'Derin'
  ];

  export const BRANDED_DEPTH_PROMPTS: Record<string, string> = {
    'Sığ': 'Shallow depth, minimal layers, flat composition, graphic and bold',
    'Katmanlı': 'Layered depth, multiple planes, foreground and background elements, dimensional composition',
    'Derin': 'Deep depth, extensive layers, strong perspective, immersive spatial quality'
  };

  export const BRANDED_NEGATIVE_SPACE = [
    'Otomatik (AI Seçimi)',
    'Bol Boşluk',
    'Dengeli',
    'Sıkı'
  ];

  export const BRANDED_NEGATIVE_SPACE_PROMPTS: Record<string, string> = {
    'Bol Boşluk': 'Generous negative space, plenty of breathing room, minimalist composition, subject isolation',
    'Dengeli': 'Balanced negative space, harmonious distribution, professional composition, visual equilibrium',
    'Sıkı': 'Tight negative space, close framing, intimate composition, subject fills frame'
  };

  export const BRANDED_ASPECT_RATIO_STYLE = [
    'Otomatik (AI Seçimi)',
    'Portre',
    'Kare',
    'Manzara'
  ];

  export const BRANDED_ASPECT_RATIO_STYLE_PROMPTS: Record<string, string> = {
    'Portre': 'Portrait aspect ratio composition, vertical format, tall framing, ideal for full-body shots',
    'Kare': 'Square aspect ratio composition, 1:1 format, balanced framing, social media optimized',
    'Manzara': 'Landscape aspect ratio composition, horizontal format, wide framing, cinematic feel'
  };

  // MODULE 5: LIGHTING & MOOD
  export const BRANDED_LIGHTING_TYPE = [
    'Otomatik (AI Seçimi)',
    'Stüdyo Softbox',
    'Pencere Işığı',
    'Altın Saat',
    'Bulutlu',
    'Alçak Ton'
  ];

  export const BRANDED_LIGHTING_TYPE_PROMPTS: Record<string, string> = {
    'Stüdyo Softbox': 'Studio softbox lighting, controlled soft light, even illumination, professional studio quality',
    'Pencere Işığı': 'Natural window light, soft directional light, organic quality, authentic and flattering',
    'Altın Saat': 'Golden hour lighting, warm sunset glow, magical quality, romantic and cinematic',
    'Bulutlu': 'Overcast lighting, diffused daylight, soft shadows, even and neutral illumination',
    'Alçak Ton': 'Low key lighting, dramatic shadows, high contrast, moody and mysterious atmosphere'
  };

  export const BRANDED_SHADOW_QUALITY = [
    'Otomatik (AI Seçimi)',
    'Yumuşak',
    'Belirgin',
    'Dramatik',
    'Minimal'
  ];

  export const BRANDED_SHADOW_QUALITY_PROMPTS: Record<string, string> = {
    'Yumuşak': 'Soft shadows, gentle transitions, diffused edges, flattering and natural',
    'Belirgin': 'Defined shadows, clear edges, structured contrast, professional and crisp',
    'Dramatik': 'Dramatic shadows, deep blacks, high contrast, bold and cinematic',
    'Minimal': 'Minimal shadows, nearly shadowless, high key lighting, clean and bright'
  };

  // MODULE 6: CAMERA & LENS
  export const BRANDED_CAPTURE_STYLE = [
    'Otomatik (AI Seçimi)',
    'Modern Dijital',
    'Analog Film'
  ];

  export const BRANDED_CAPTURE_STYLE_PROMPTS: Record<string, string> = {
    'Modern Dijital': 'Modern digital capture, ultra sharp, clean image, perfect clarity, contemporary photography',
    'Analog Film': 'Analog film capture, subtle grain, organic quality, nostalgic warmth, classic photography'
  };

  export const BRANDED_LENS = [
    'Otomatik (AI Seçimi)',
    '35mm Lens',
    '50mm Lens',
    '85mm Lens',
    'Makro Lens'
  ];

  export const BRANDED_LENS_PROMPTS: Record<string, string> = {
    '35mm Lens': '35mm lens perspective, moderate wide angle, environmental context, documentary feel',
    '50mm Lens': '50mm lens perspective, natural field of view, human eye equivalent, versatile standard',
    '85mm Lens': '85mm lens perspective, portrait focal length, flattering compression, professional look',
    'Makro Lens': 'Macro lens perspective, extreme close-up, intricate detail, texture emphasis'
  };

  export const BRANDED_DEPTH_OF_FIELD = [
    'Otomatik (AI Seçimi)',
    'Sığ Alan Derinliği',
    'Orta Alan Derinliği',
    'Derin Alan Derinliği'
  ];

  export const BRANDED_DEPTH_OF_FIELD_PROMPTS: Record<string, string> = {
    'Sığ Alan Derinliği': 'Shallow depth of field, strong background blur, subject isolation, cinematic bokeh',
    'Orta Alan Derinliği': 'Medium depth of field, balanced focus, some background detail, versatile presentation',
    'Derin Alan Derinliği': 'Deep depth of field, everything in focus, sharp throughout, maximum detail capture'
  };

  // WOMEN CLOTHING STYLES - Background Prompts
  export const WOMEN_CLOTHING_STYLES: Record<string, string> = {
    'Urban Glow': 'Modern urban fashion background with soft city lights at dusk, subtle neon reflections, clean architectural silhouettes, warm glow highlights, contemporary metropolitan atmosphere, premium fashion editorial style, smooth gradients, high clarity, minimal clutter, cinematic city mood, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Pastel Bold': 'Soft pastel-colored background with bold contrast accents, smooth color transitions, playful yet modern fashion aesthetic, pastel pinks, blues and creams, clean studio-style environment, vibrant but elegant mood, high-end fashion look, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'City Garage': 'Urban garage or underground parking background, raw concrete walls, industrial lighting, muted tones, modern street fashion atmosphere, cinematic shadows, gritty yet stylish city vibe, editorial fashion photography, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Paris': 'Elegant Parisian fashion background, classic European architecture, soft daylight, neutral stone tones, refined and feminine atmosphere, chic French editorial style, timeless luxury mood, minimal and graceful composition, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Olive Geometr': 'Minimal geometric background with olive green color palette, clean shapes, modern design lines, flat yet premium look, calm and balanced fashion presentation, contemporary editorial aesthetic, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Crimson Scen': 'Deep crimson and burgundy-toned background, dramatic lighting, rich red hues, cinematic fashion atmosphere, bold and confident mood, high contrast highlights, luxury editorial style, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Vintage Motio': 'Vintage-inspired fashion background, retro color grading, subtle film grain, warm tones, sense of movement and rhythm, classic 70s–90s fashion editorial mood, nostalgic yet stylish atmosphere, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Metropolitan': 'Modern metropolitan city backdrop, clean skyscraper silhouettes, cool neutral tones, sophisticated urban fashion mood, premium lifestyle aesthetic, minimal but powerful composition, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'London Echo': 'London-inspired fashion background, muted gray and navy tones, overcast daylight, urban street elegance, modern British fashion editorial style, calm, cool and confident atmosphere, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Concrete Mus': 'Raw concrete background with modern brutalist architecture feel, neutral gray tones, minimalist composition, strong shadows, artistic fashion editorial mood, contemporary luxury aesthetic, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Cinematic Min': 'Minimal cinematic fashion background, soft directional lighting, clean negative space, neutral tones, high-end film still aesthetic, luxury editorial mood, timeless and refined composition, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Urban Sage': 'Urban fashion background blended with natural sage green tones, soft organic elements, calm and modern city-nature fusion, minimal and fresh aesthetic, premium lifestyle fashion mood, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Crimson Motic': 'Dark cinematic background with subtle retro screen glow, deep crimson highlights, moody lighting, dramatic contrast, artistic fashion editorial atmosphere, modern-retro fusion style, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography',
    
    'Marble Grace': 'Elegant marble architectural background, white and cream tones, soft diffused light, classical luxury aesthetic, refined and graceful fashion editorial style, timeless and premium atmosphere, ultra sharp focus on subject, high resolution, realistic textures, professional fashion photography'
  };

  // =====================================================
  // ADMIN DASHBOARD - NEW TYPES
  // =====================================================

  // Dashboard Widget Types
  export interface DashboardWidget {
    id: string;
    type: 'stats' | 'chart' | 'activity' | 'quick-actions' | 'plan-distribution';
    title: string;
    position: number;
    size: 'small' | 'medium' | 'large' | 'full';
    visible: boolean;
  }

  // Activity Feed Item
  export interface ActivityItem {
    id: string;
    type: 'user_signup' | 'user_login' | 'generation' | 'subscription' | 'credit_purchase' | 'plan_upgrade';
    user?: string;
    details: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }

  // Chart Data Point
  export interface ChartDataPoint {
    date: string;
    value: number;
    label?: string;
  }

  // Multi-series Chart Data
  export interface MultiSeriesChartData {
    date: string;
    users?: number;
    generations?: number;
    credits?: number;
    revenue?: number;
  }

  // Dashboard Filters
  export interface DashboardFilters {
    dateRange: '7d' | '30d' | '90d' | 'all';
    planFilter: 'all' | 'free' | 'pro' | 'enterprise';
  }

  // Enhanced Admin Stats for Dashboard
  export interface EnhancedAdminStats extends AdminStats {
    // Trend data for charts
    userGrowth: ChartDataPoint[];
    generationsTrend: ChartDataPoint[];
    creditUsageTrend: ChartDataPoint[];

    // Calculated metrics
    revenueEstimate: number;
    activeUsersToday: number;
    activeUsersWeek: number;
    conversionRate: number;
    avgGenerationsPerUser: number;
    avgCreditsPerUser: number;

    // Trend percentages (compared to previous period)
    userGrowthPercent: number;
    generationsGrowthPercent: number;
    creditsGrowthPercent: number;
    subscribersGrowthPercent: number;
  }

  // Stat Card Props
  export interface StatCardData {
    id: string;
    title: string;
    value: number;
    previousValue?: number;
    format?: 'number' | 'currency' | 'percent';
    icon: string;
    color: 'violet' | 'emerald' | 'amber' | 'blue' | 'red';
    trend?: number;
    sparklineData?: number[];
  }

  // Quick Action
  export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    action: () => void;
    color?: 'violet' | 'emerald' | 'amber' | 'blue' | 'red';
    disabled?: boolean;
  }

  // Dashboard Layout State
  export interface DashboardLayout {
    widgets: DashboardWidget[];
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
  }

  // Real-time Stats Subscription
  export interface RealtimeStatsCallback {
    (stats: EnhancedAdminStats): void;
  }

  // Default Widget Configuration
  export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = [
    { id: 'stats-users', type: 'stats', title: 'Kullanıcılar', position: 0, size: 'small', visible: true },
    { id: 'stats-generations', type: 'stats', title: 'Üretimler', position: 1, size: 'small', visible: true },
    { id: 'stats-credits', type: 'stats', title: 'Krediler', position: 2, size: 'small', visible: true },
    { id: 'stats-subscribers', type: 'stats', title: 'Aboneler', position: 3, size: 'small', visible: true },
    { id: 'chart-growth', type: 'chart', title: 'Büyüme Grafiği', position: 4, size: 'large', visible: true },
    { id: 'chart-plan', type: 'plan-distribution', title: 'Plan Dağılımı', position: 5, size: 'medium', visible: true },
    { id: 'activity-feed', type: 'activity', title: 'Son Aktiviteler', position: 6, size: 'medium', visible: true },
    { id: 'quick-actions', type: 'quick-actions', title: 'Hızlı İşlemler', position: 7, size: 'medium', visible: true },
  ];