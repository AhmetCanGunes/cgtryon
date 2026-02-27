

import { GoogleGenAI, Type } from "@google/genai";
import { GenerationSettings, TryOnSettings, AdSettings, AdCopy, UpscaleSettings, TryOnV3Settings, AdCreativeResult, AdCreativeMetadata, AD_THEME_VARIATIONS, getVariedBackgrounds, isAccessoryProduct, isWalletProduct, isBagProduct, isShoesProduct, isSunglassesProduct, BRANDED_CONCEPT_PROMPTS, BRANDED_STANCE_PROMPTS, BRANDED_POSE_ENERGY_PROMPTS, BRANDED_CLOTHING_STYLE_PROMPTS, BRANDED_HAIR_STYLE_PROMPTS, BRANDED_EXPRESSION_PROMPTS, BRANDED_PRODUCT_ORIENTATION_PROMPTS, BRANDED_PRODUCT_PLACEMENT_PROMPTS, BRANDED_PRODUCT_CONTEXT_PROMPTS, BRANDED_PRODUCT_CONDITION_PROMPTS, BRANDED_COLOR_TEMPERATURE_PROMPTS, BRANDED_COLOR_HARMONY_PROMPTS, BRANDED_MATERIAL_FINISH_PROMPTS, BRANDED_FRAMING_PROMPTS, BRANDED_DEPTH_PROMPTS, BRANDED_NEGATIVE_SPACE_PROMPTS, BRANDED_ASPECT_RATIO_STYLE_PROMPTS, BRANDED_LIGHTING_TYPE_PROMPTS, BRANDED_SHADOW_QUALITY_PROMPTS, BRANDED_CAPTURE_STYLE_PROMPTS, BRANDED_LENS_PROMPTS, BRANDED_DEPTH_OF_FIELD_PROMPTS, JewelrySettings, JEWELRY_STAND_COLORS, JEWELRY_BACKGROUNDS, MensFashionSettings, MENS_FASHION_POSE_OPTIONS, MENS_FASHION_BACKGROUNDS, MENS_FASHION_BACKGROUND_STYLES, STUDIO_MINIMAL_GRADIENT_COLORS, WomensFashionSettings, WOMENS_FASHION_POSE_OPTIONS, WOMENS_FASHION_BACKGROUNDS, WOMENS_FASHION_BACKGROUND_STYLES, ReferencedProductionSettings, ScenePlacementSettings, REFERENCED_POSE_OPTIONS, SHOT_TYPE_OPTIONS, AnimalSettings, ANIMAL_TYPES, DOG_BREEDS, CAT_BREEDS, BIRD_BREEDS, RABBIT_BREEDS, HORSE_BREEDS, ANIMAL_POSITIONS, ANIMAL_POSES, ANIMAL_SIZES, ANIMAL_LOOK_DIRECTIONS, CollectionResult } from "../types";

// Generation result with AI model info
export interface GenerationResult {
  imageData: string;
  aiModel: string;
  estimatedCost: number;
}

const processImageForGemini = async (
    file: File, 
    maxDimension: number = 2048, // Increased from 1024 for better input quality
    quality: number = 0.95 // Increased from 0.70 for maximum quality preservation
): Promise<{ base64: string; mimeType: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { 
            alpha: false,
            desynchronized: false,
            willReadFrequently: false
        });

        if (!ctx) {
            const rawBase64 = (event.target?.result as string).split(',')[1];
            resolve({ base64: rawBase64, mimeType: file.type, width: img.width, height: img.height });
            return;
        }

        // Enable high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1];
        
        resolve({ base64, mimeType: 'image/jpeg', width, height });
      };
      img.onerror = (e) => reject(new Error("Failed to load image for processing"));
      img.src = event.target?.result as string;
    };
    reader.onerror = (e) => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
};

// SIMPLIFIED BRANDED AI - Basic validation for Lighting & Camera only
const validateBrandedAISelections = (settings: GenerationSettings): { valid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  // Check for low-key lighting + minimal shadow conflict
  if (settings.brandedLightingType === 'Alçak Ton' && settings.brandedShadowQuality === 'Minimal') {
    warnings.push('⚠️ Alçak ton ışık genellikle dramatik gölgeler gerektirir. Gölge kalitesini değiştirmeyi düşünün.');
  }
  
  // Log warnings if any
  if (warnings.length > 0) {
    console.warn('🔍 LIGHTING & CAMERA VALIDATION WARNINGS:');
    warnings.forEach(w => console.warn(w));
  }
  
  return { valid: warnings.length === 0, warnings };
};

// SIMPLIFIED BRANDED AI - Only Lighting & Camera (removed Concept, Subject, Colors, Composition)
const assembleBrandedAIPrompt = (settings: GenerationSettings): string => {
  const modules: string[] = [];
  
  // MODULE 1: LIGHTING & MOOD
  const lightingAttributes: string[] = [];
  if (settings.brandedLightingType && settings.brandedLightingType !== 'Otomatik (AI Seçimi)') {
    const lightingPrompt = BRANDED_LIGHTING_TYPE_PROMPTS[settings.brandedLightingType];
    if (lightingPrompt) lightingAttributes.push(lightingPrompt);
  }
  if (settings.brandedShadowQuality && settings.brandedShadowQuality !== 'Otomatik (AI Seçimi)') {
    const shadowPrompt = BRANDED_SHADOW_QUALITY_PROMPTS[settings.brandedShadowQuality];
    if (shadowPrompt) lightingAttributes.push(shadowPrompt);
  }
  if (lightingAttributes.length > 0) {
    modules.push(`LIGHTING & MOOD: ${lightingAttributes.join(', ')}`);
    console.log('💡 Module 5 - Lighting & Mood:', lightingAttributes.length, 'attributes');
  }
  
  // MODULE 6: CAMERA & LENS
  const cameraAttributes: string[] = [];
  if (settings.brandedCaptureStyle && settings.brandedCaptureStyle !== 'Otomatik (AI Seçimi)') {
    const capturePrompt = BRANDED_CAPTURE_STYLE_PROMPTS[settings.brandedCaptureStyle];
    if (capturePrompt) cameraAttributes.push(capturePrompt);
  }
  if (settings.brandedLens && settings.brandedLens !== 'Otomatik (AI Seçimi)') {
    const lensPrompt = BRANDED_LENS_PROMPTS[settings.brandedLens];
    if (lensPrompt) cameraAttributes.push(lensPrompt);
  }
  if (settings.brandedDepthOfField && settings.brandedDepthOfField !== 'Otomatik (AI Seçimi)') {
    const dofPrompt = BRANDED_DEPTH_OF_FIELD_PROMPTS[settings.brandedDepthOfField];
    if (dofPrompt) cameraAttributes.push(dofPrompt);
  }
  if (cameraAttributes.length > 0) {
    modules.push(`CAMERA & LENS: ${cameraAttributes.join(', ')}`);
    console.log('📷 Module 6 - Camera & Lens:', cameraAttributes.length, 'attributes');
  }
  
  // Assemble final prompt
  if (modules.length > 0) {
    const assembledPrompt = modules.join('. ');
    console.log('✨ BRANDED AI SYSTEM ACTIVATED - Total Modules:', modules.length);
    console.log('📋 Assembled Prompt Preview:', assembledPrompt.substring(0, 200) + '...');
    return assembledPrompt;
  }
  
  return '';
};

const getAspectRatio = (aspectRatio: string): string => {
  if (aspectRatio.includes('16:9')) return '16:9';
  if (aspectRatio.includes('9:16')) return '9:16';
  if (aspectRatio.includes('3:4')) return '3:4';
  if (aspectRatio.includes('4:3')) return '4:3';
  if (aspectRatio.includes('4:5')) return '3:4'; 
  return '1:1'; 
};

const getClosestAspectRatio = (width: number, height: number): string => {
    const ratio = width / height;
    
    if (Math.abs(ratio - 1) < 0.15) return '1:1';
    
    if (width > height) {
        const diff16_9 = Math.abs(ratio - (16/9));
        const diff4_3 = Math.abs(ratio - (4/3));
        return diff16_9 < diff4_3 ? '16:9' : '4:3';
    } else {
        const diff9_16 = Math.abs(ratio - (9/16));
        const diff3_4 = Math.abs(ratio - (3/4));
        return diff9_16 < diff3_4 ? '9:16' : '3:4';
    }
};

// --- SAFETY SETTINGS ---
const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
];

const ANATOMY_PROMPT = `
CRITICAL ANATOMY & QUALITY ASSURANCE:
- HUMAN ANATOMY MUST BE PERFECT.
- The model must have EXACTLY TWO (2) arms and TWO (2) hands.
- Each hand must have EXACTLY FIVE (5) fingers.
- NO extra limbs, NO distorted fingers, NO third arms.
- If hands are visible, they must be anatomically correct and graceful.
- Skin texture must be realistic, not waxy or plastic.
`;

const CLEAN_BACKGROUND_PROMPT = `
CRITICAL BACKGROUND RULES:
- THE BACKGROUND MUST BE A REAL PHYSICAL LOCATION (unless studio selected).
- NO ABSTRACT COLORS, NO FAKE STUDIO GRADIENTS, NO DIGITAL ART BACKGROUNDS.
- USE MODERATE DEPTH OF FIELD: Background should be slightly soft but still recognizable and detailed. NOT heavily blurred.
- Background elements must be clear enough to understand the environment and context.
- LIGHTING MUST MATCH THE ENVIRONMENT NATURALLY.
- Maintain photorealistic quality in both foreground and background.
`;

// ⚠️ PRODUCT FIDELITY - Ürün Orijinalliğini Koruma Kuralları
const PRODUCT_FIDELITY_PROMPT = `
🚨 KIYAFET KORUMA KURALLARI 🚨

INPUT GÖRSELİ = TEK KAYNAK. Kıyafeti BİREBİR koru.

👔 CEKET KURALI - ÇOK ÖNEMLİ:
- Görsellerde CEKET/BLAZER/TAKIM ÜST varsa → MUTLAKA GİYDİR!
- Ceket gömleğin ÜSTÜNDE olmalı
- Ceketi ATLAMA, ceketi YOKSAYMA!
- Ceketin rengi, deseni, düğmeleri → BİREBİR KORU

KORUMASI GEREKENLER:
✓ RENK - Input'taki rengi AYNEN kullan (ışık değişse bile)
✓ YAKA TİPİ - V-yaka, bisiklet yaka, balıkçı yaka → DEĞİŞTİRME
✓ KOL UZUNLUĞU - Uzun/kısa/3-4 → DEĞİŞTİRME
✓ DESEN - Çizgili, düz, desenli → DEĞİŞTİRME
✓ DÜĞME/FERMUAR - Yerlerini ve stillerini koru
✓ CEP - Varsa koru, yoksa EKLEME
✓ KUMAŞ DOKUSU - Deri, ipek, örgü → DEĞİŞTİRME
✓ PANTOLON PİLESİ - Çift pile, tek pile, düz → SAYISINI KORU
✓ AYAKKABI - Model, renk, bağcık, taban → BİREBİR KORU
✓ CEKET/BLAZER - Varsa GİYDİR, detayları koru

YASAKLAR:
❌ CEKETİ ATLAMA (varsa MUTLAKA giydir!)
❌ Yaka tipini değiştirme (V-yaka → balıkçı YASAK)
❌ Rengi değiştirme
❌ Desen ekleme/çıkarma
❌ Cep ekleme/çıkarma
❌ Yaka ekleme/çıkarma
❌ Ayakkabıyı bozma/değiştirme
❌ Kıyafeti deforme etme

ÇIKTI KONTROLÜ:
- CEKET GİYİLİ Mİ? (varsa)
- Yaka tipi AYNI mı?
- Renk AYNI mı?
- Ayakkabı AYNI mı?
- Desen AYNI mı?
`;

const getAutoBackground = (clothingType: string): string => {
    const cat = clothingType.toLowerCase();

    if (cat.includes('iç giyim') || cat.includes('lingerie') || cat.includes('jartiyer') || cat.includes('fantazi')) {
        return "Luxury High-End Fashion Studio, Elegant Dressing Room with soft marble, or a clean Minimalist Podium. Professional commercial lighting. Neutral and expensive atmosphere.";
    }

    return "AUTO-ANALYZE: The AI must analyze the product image and determine the most professional, high-end context for it. (e.g., if a car -> road; if a sofa -> living room; if streetwear -> urban; if business wear -> office or studio).";
};

// Auto Season and Weather based on theme and product
const getAutoSeasonAndWeather = (
    theme?: string,
    sceneVariation?: string,
    clothingType?: string
): { season: string; weather: string } => {
    const product = (clothingType || '').toLowerCase();
    const themeKey = theme || '';
    const variation = sceneVariation || '';

    // Product-based logic (highest priority)
    if (product.includes('mayo') || product.includes('bikini') || product.includes('deniz') || product.includes('plaj')) {
        return { season: 'Yaz', weather: 'Güneşli' };
    }
    if (product.includes('mont') || product.includes('kaban') || product.includes('palto') || product.includes('kazak')) {
        return { season: 'Kış', weather: 'Bulutlu' };
    }
    if (product.includes('yağmurluk') || product.includes('trençkot')) {
        return { season: 'Sonbahar', weather: 'Yağmurlu' };
    }

    // Theme-based logic
    if (themeKey.includes('Yaz') || themeKey.includes('Tatil')) {
        return { season: 'Yaz', weather: 'Güneşli' };
    }
    if (themeKey.includes('Doğal') || themeKey.includes('Organik')) {
        return { season: 'İlkbahar', weather: 'Güneşli' };
    }
    if (themeKey.includes('Sinematik') || themeKey.includes('Dramatik')) {
        return { season: 'Sonbahar', weather: 'Bulutlu' };
    }
    if (themeKey.includes('Sokak')) {
        return { season: 'Sonbahar', weather: 'Açık' };
    }
    if (themeKey.includes('Lüks') || themeKey.includes('Premium')) {
        return { season: 'İlkbahar', weather: 'Güneşli' };
    }
    if (themeKey.includes('Klasik') || themeKey.includes('Old Money')) {
        return { season: 'Sonbahar', weather: 'Güneşli' };
    }
    if (themeKey.includes('Canlı') || themeKey.includes('Enerjik')) {
        return { season: 'Yaz', weather: 'Güneşli' };
    }
    if (themeKey.includes('Kurumsal') || themeKey.includes('Profesyonel')) {
        return { season: 'İlkbahar', weather: 'Açık' };
    }
    if (themeKey.includes('Stüdyo') || themeKey.includes('Studio')) {
        return { season: 'İlkbahar', weather: 'Güneşli' };
    }

    // Variation-based hints
    if (variation.includes('beach') || variation.includes('plaj') || variation.includes('deniz')) {
        return { season: 'Yaz', weather: 'Güneşli' };
    }
    if (variation.includes('snow') || variation.includes('kar') || variation.includes('winter')) {
        return { season: 'Kış', weather: 'Karlı' };
    }
    if (variation.includes('rain') || variation.includes('yağmur')) {
        return { season: 'Sonbahar', weather: 'Yağmurlu' };
    }
    if (variation.includes('spring') || variation.includes('ilkbahar') || variation.includes('flower') || variation.includes('çiçek')) {
        return { season: 'İlkbahar', weather: 'Güneşli' };
    }

    // Default fallback
    return { season: 'İlkbahar', weather: 'Güneşli' };
};

// Helper function for accessory-specific framing
const getAccessoryFraming = (category: string): string | null => {
  const lowerCategory = category.toLowerCase();
  
  // Bileklik (Bracelet)
  if (lowerCategory.includes('bileklik') || lowerCategory.includes('bracelet')) {
    return `ACCESSORY FRAMING INSTRUCTIONS FOR BRACELET:
    - SUBJECT: Female wrist and arm ONLY (mid-forearm to fingertips)
    - FRAMING: TIGHT CLOSE-UP shot focusing EXCLUSIVELY on the wrist wearing the bracelet
    - COMPOSITION: Show from mid-forearm to hand ONLY. NO parts above the elbow.
    - ANGLE: 3/4 view or side angle to showcase the bracelet design
    - BACKGROUND: Soft, completely blurred, or solid color to avoid distractions
    - CRITICAL: DO NOT SHOW face, head, shoulders, upper body, or any body parts above the elbow
    - CRITICAL: Frame MUST be cropped tightly. If pose suggests hand near face/hair, keep face OUT OF FRAME entirely.
    - FOCUS: Product detail (bracelet), skin texture, feminine hand gesture
    - RESULT: The final image should show ONLY arm/wrist/hand. Face and upper body must be 100% invisible.`;
  }
  
  // Yüzük (Ring)
  if (lowerCategory.includes('yüzük') || lowerCategory.includes('ring')) {
    return `ACCESSORY FRAMING INSTRUCTIONS:
    - SUBJECT: Hand ONLY
    - FRAMING: Extreme close-up of the hand wearing the ring
    - COMPOSITION: Focus on fingers, elegant hand pose (touching face, holding chin, or graceful gesture)
    - ANGLE: Macro shot showcasing ring detail
    - BACKGROUND: Soft bokeh or solid color
    - DO NOT SHOW: Arms, body, or face (unless very blurred in background)
    - FOCUS: Ring detail, hand elegance, delicate skin texture`;
  }
  
  // Şapka (Hat)
  if (lowerCategory.includes('şapka') || lowerCategory.includes('bere') || lowerCategory.includes('hat')) {
    return `ACCESSORY FRAMING INSTRUCTIONS:
    - SUBJECT: Head wearing hat ONLY
    - FRAMING: Close-up portrait focusing on the head and hat
    - COMPOSITION: From shoulders up, centered on the hat
    - ANGLE: Front view or 3/4 angle to show hat style and fit
    - BACKGROUND: Clean, minimal, studio-style
    - DO NOT SHOW: Full body or lower than shoulders
    - FOCUS: Hat design, how it sits on the head, facial features frame the hat`;
  }
  
  // Kolye (Necklace)
  if (lowerCategory.includes('kolye') || lowerCategory.includes('necklace')) {
    return `ACCESSORY FRAMING INSTRUCTIONS:
    - SUBJECT: Neck and collarbone detail ONLY
    - FRAMING: Close-up focusing on the décolletage area
    - COMPOSITION: From chin to upper chest, showcasing the necklace placement
    - ANGLE: Straight-on or slight downward angle
    - BACKGROUND: Soft, minimal, clean
    - DO NOT SHOW: Full face (can show lower chin/lips), arms, or full torso
    - FOCUS: Necklace detail, elegant neck positioning, skin texture`;
  }
  
  // Küpe (Earrings)
  if (lowerCategory.includes('küpe') || lowerCategory.includes('earring')) {
    return `ACCESSORY FRAMING INSTRUCTIONS:
    - SUBJECT: Head and neck from shoulders up ONLY
    - FRAMING: Close-up portrait, alternating between front profile and side profile
    - COMPOSITION: Neck to top of head, emphasizing the ear area
    - ANGLE: Generate TWO variations - 
      1. FRONT/3-4 PROFILE: Shows earring from front with visible face
      2. SIDE PROFILE: Pure 90-degree side view showing earring in full detail
    - BACKGROUND: Soft gradient or solid color
    - DO NOT SHOW: Body below shoulders
    - FOCUS: Earring design, how it frames the face, ear detail
    - HAIR: Hair should be styled back or tucked to fully reveal the earring`;
  }
  
  // Saat (Watch)
  if (lowerCategory.includes('saat') || lowerCategory.includes('watch')) {
    return `ACCESSORY FRAMING INSTRUCTIONS:
    - SUBJECT: Wrist and forearm ONLY
    - FRAMING: Close-up shot of the wrist wearing the watch
    - COMPOSITION: From mid-forearm to hand, showing watch face clearly
    - ANGLE: Angled to display watch face and strap simultaneously
    - BACKGROUND: Minimal, professional, can include subtle lifestyle elements (desk, steering wheel)
    - DO NOT SHOW: Full arm, body, or face
    - FOCUS: Watch detail, craftsmanship, how it sits on the wrist
    - HAND POSITION: Natural gesture (checking time, resting on surface, steering wheel)`;
  }
  
  // Ayakkabı / Sneaker (Shoes)
  if (lowerCategory.includes('ayakkabı') || lowerCategory.includes('sneaker') || lowerCategory.includes('bot') || lowerCategory.includes('shoe')) {
    return `ACCESSORY FRAMING INSTRUCTIONS:
    - SUBJECT: Feet and lower legs ONLY
    - FRAMING: Close-up showing from knees down to feet
    - COMPOSITION: Focus on the shoes and how they look when worn
    - ANGLE: Ground level or slightly elevated, showing shoe design from best angle
    - BACKGROUND: Lifestyle setting (urban street, studio floor, fashion runway)
    - DO NOT SHOW: Upper body, torso, or face
    - FOCUS: Shoe detail, fit on foot, styling with pants/socks
    - POSE: Walking, standing, crossed legs, or dynamic stepping motion`;
  }
  
  // Çanta (Bag)
  if (lowerCategory.includes('çanta') || lowerCategory.includes('bag') || lowerCategory.includes('wallet') || lowerCategory.includes('cüzdan')) {
    return `ACCESSORY FRAMING INSTRUCTIONS:
    - SUBJECT: Bag/wallet being held or worn
    - FRAMING: Focus on the accessory with minimal body showing
    - COMPOSITION: Show how it's naturally carried (hand-held, over shoulder, crossbody)
    - ANGLE: 3/4 view to showcase bag structure and details
    - BACKGROUND: Clean studio or lifestyle setting
    - BODY PARTS SHOWN: Only necessary parts (hand, arm, shoulder) to show how bag is carried
    - DO NOT SHOW: Full body or face (unless very blurred)
    - FOCUS: Bag design, texture, hardware, practical use`;
  }
  
  // Gözlük (Sunglasses)
  if (lowerCategory.includes('gözlük') || lowerCategory.includes('sunglasses') || lowerCategory.includes('glasses')) {
    return `ACCESSORY FRAMING INSTRUCTIONS:
    - SUBJECT: Face wearing sunglasses
    - FRAMING: Close-up portrait from shoulders up
    - COMPOSITION: Centered on the face, sunglasses as focal point
    - ANGLE: Front view or 3/4 angle to show frame shape
    - BACKGROUND: Lifestyle or studio, can include fashion context
    - DO NOT SHOW: Full body (from shoulders up only)
    - FOCUS: Sunglasses design, how they fit the face, style and attitude
    - EXPRESSION: Confident, fashionable, cool demeanor`;
  }
  
  return null; // Not an accessory, use default framing
};

const getSmartPoseDescription = (clothingType: string, background: string): string => {
    const cloth = clothingType.toLowerCase();

    if (cloth.includes('iç giyim') || cloth.includes('lingerie') || cloth.includes('jartiyer') || cloth.includes('fantazi')) {
        return "Professional Fashion Model Pose. Standing or leaning elegantly. Confident and tasteful. High-end catalog style. Highlighting the fit of the garment.";
    }

    if (cloth.includes('çanta') || cloth.includes('bag') || cloth.includes('clutch')) {
        return "Natural & Balanced Stance. The model should hold the bag naturally (e.g., holding handle by side with straight arm, wearing on shoulder, or holding clutch comfortably). Do NOT force a bent arm if not natural. Do NOT lean awkwardly. Stand upright and elegant.";
    }
    
    if (cloth.includes('plaj') || cloth.includes('bikini') || cloth.includes('mayo') || cloth.includes('swimwear')) {
        return "Elegant beach pose, standing near water or relaxing on a lounge chair. Relaxed and high-end summer vibe. Front or 3/4 angle.";
    }

    return "AUTO-ANALYZE: The AI must analyze the product type and generate the most flattering, natural, and professional fashion pose (or product placement) for this specific item. Ensure it looks high-end. Default to Front or 3/4 angle unless specified otherwise.";
};

const extractImageFromResponse = (response: any): string | null => {
    if (!response || !response.candidates || !Array.isArray(response.candidates) || response.candidates.length === 0) {
        console.warn("Response invalid or no candidates:", response);
        return null;
    }

    const candidate = response.candidates[0];

    if (candidate.finishReason === 'SAFETY') {
        throw new Error("Görsel oluşturulamadı: Güvenlik politikası (Safety Block). Lütfen tekrar deneyin.");
    }
    
    if (candidate.finishReason === 'RECITATION' || candidate.finishReason === 'OTHER') {
        console.warn("Generation stopped:", candidate.finishReason);
    }

    if (!candidate.content) {
        return null;
    }

    if (!candidate.content.parts || !Array.isArray(candidate.content.parts)) {
        console.warn("Candidate content parts missing or not array:", candidate.content);
        return null;
    }

    for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    
    const textPart = candidate.content.parts.find((p: any) => p.text);
    if (textPart) {
        console.warn("Model refused and returned text:", textPart.text);
    }

    return null;
};

const safeGetText = (response: any): string => {
    try {
        const parts = response.candidates?.[0]?.content?.parts;
        if (Array.isArray(parts)) {
            return parts.map((p: any) => p.text || '').join('');
        }
        return "";
    } catch (e) {
        return "";
    }
};

export const generateModelImage = async (
  productImage: File,
  settings: GenerationSettings
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const useProModel = settings.modelQuality.includes('Pro') || settings.modelQuality.includes('Nano');
    const modelName = useProModel 
        ? 'gemini-3-pro-image-preview' 
        : 'gemini-2.5-flash-image';

    console.log(`Generating with model: ${modelName}, Aspect: ${settings.aspectRatio}`);

    const { base64, mimeType } = await processImageForGemini(productImage);
    
    const parts: any[] = [];

    parts.push({
        inlineData: {
            data: base64,
            mimeType: mimeType
        }
    });

    let viewAnglePrompt = settings.viewAngle;
    
    if (settings.viewAngle.toLowerCase().includes('yandan') || settings.viewAngle.toLowerCase().includes('side')) {
        viewAnglePrompt = "STRICT 90-degree Side Profile View. The model must be facing directly to the left or right.";
    } else if (settings.viewAngle.toLowerCase().includes('arkadan') || settings.viewAngle.toLowerCase().includes('back')) {
        viewAnglePrompt = "STRICT Back View. The model must be facing away from the camera, showing the back of the outfit.";
    } else if (settings.viewAngle.includes('Seçiniz')) {
         viewAnglePrompt = "Front View or 3/4 Angle. Best angle to showcase the product structure clearly. Do NOT show back view unless requested.";
    }

    const isAutoPose = settings.modelPose.includes('Seçiniz') || settings.modelPose.includes('Otomatik') || settings.modelPose.includes('Lütfen Seçiniz');
    const isAutoBackground = settings.background === 'auto' || settings.background.includes('Seçiniz');
    
    // Check if product-only mode is explicitly set (for wallet, shoes, sunglasses)
    // OR if no gender is selected (original logic for other products)
    const isProductPhotography = settings.isProductPhotography === true || settings.gender.includes('Seçiniz');
    
    console.log('🔍 Product Photography Check:', {
        'isProductPhotography setting': settings.isProductPhotography,
        'gender': settings.gender,
        'Final isProductPhotography': isProductPhotography,
        'clothingType': settings.clothingType
    });

    // Auto-determine season and weather if not selected
    let finalSeason = settings.season;
    let finalWeather = settings.weather;

    if (!settings.season || settings.season.includes('Seçiniz')) {
        const auto = getAutoSeasonAndWeather(settings.theme, settings.sceneVariation, settings.clothingType);
        finalSeason = auto.season;
        console.log('🌤️ AUTO SEASON:', finalSeason);
    }

    if (!settings.weather || settings.weather.includes('Seçiniz')) {
        const auto = getAutoSeasonAndWeather(settings.theme, settings.sceneVariation, settings.clothingType);
        finalWeather = auto.weather;
        console.log('🌤️ AUTO WEATHER:', finalWeather);
    }

    let environmentDetails = "";
    if (finalSeason) {
        environmentDetails += `, Season: ${finalSeason}`;
    }
    if (finalWeather) {
        environmentDetails += `, Weather Condition: ${finalWeather}`;
    }

    console.log('🌤️ Environment Details Created:', {
        originalSeason: settings.season,
        originalWeather: settings.weather,
        finalSeason: finalSeason,
        finalWeather: finalWeather,
        environmentDetails: environmentDetails
    });

    let finalBackground = "";
    let baseScenePrompt = "";

    // STEP 1: Determine base scene/background
    // PRIORITY: Theme and variation system
    if (settings.theme && settings.sceneVariation && settings.sceneVariation !== 'auto') {
        const themeVariations = AD_THEME_VARIATIONS[settings.theme] || [];
        const selectedVariation = themeVariations.find(v => v.id === settings.sceneVariation);
        if (selectedVariation) {
            baseScenePrompt = selectedVariation.prompt;
            console.log('🎨 TEMA SEÇİLDİ:', settings.theme, '- VARYASYON:', settings.sceneVariation);
        } else {
            baseScenePrompt = isAutoBackground ? getAutoBackground(settings.clothingType) : settings.background;
        }
    } else if (settings.theme && settings.sceneVariation === 'auto') {
        const themeVariations = AD_THEME_VARIATIONS[settings.theme] || [];
        if (themeVariations.length > 0) {
            const randomVariation = themeVariations[Math.floor(Math.random() * themeVariations.length)];
            baseScenePrompt = randomVariation.prompt;
            console.log('🎨 TEMA SEÇİLDİ (AUTO):', settings.theme, '- RASTGELE VARYASYON:', randomVariation.id);
        } else {
            baseScenePrompt = isAutoBackground ? getAutoBackground(settings.clothingType) : settings.background;
        }
    } else {
        baseScenePrompt = isAutoBackground ? getAutoBackground(settings.clothingType) : settings.background;
    }

    // STEP 2: Add Branded AI enhancements (lighting & camera) on top of base scene
    const brandedAIPrompt = assembleBrandedAIPrompt(settings);
    if (brandedAIPrompt) {
        finalBackground = baseScenePrompt + '. ' + brandedAIPrompt + ' ' + environmentDetails;
        console.log('🎯 BRANDED AI LIGHTING & CAMERA EKLENDI');
    } else {
        finalBackground = baseScenePrompt + ' ' + environmentDetails;
    }

    // Check both enableBoudoir and enableBoudoirMode for backward compatibility
    const isBoudoirActive = settings.enableBoudoir || settings.enableBoudoirMode;
    
    if (isBoudoirActive) {
        console.log('🔥 Boudoir Active - Setting background based on category:', settings.boudoirCategory);
        
        const lowerPose = settings.modelPose.toLowerCase();
        const isShowerContext = (settings.boudoirCategory === 'Duş') || lowerPose.match(/(duş|shower|ıslak|wet|banyo|bath|su|water|buhar|steam|glass|cam)/i);
        const isBedContext = (settings.boudoirCategory === 'Yatak');
        
        const lighting = settings.boudoirLighting || "";
        const isBright = lighting.includes('Aydınlık') || lighting.includes('High-Key');
        const isGolden = lighting.includes('Altın') || lighting.includes('Golden');
        const isNeon = lighting.includes('Neon') || lighting.includes('Night');
        const isVibrant = lighting.includes('Canlı') || lighting.includes('Vibrant');
        const isSoftStudio = lighting.includes('Yumuşak') || lighting.includes('Soft');

        // ALWAYS override background when Boudoir is active - ignore isAutoBackground
        // Boudoir backgrounds do NOT include environmentDetails (season/weather)
        if (isShowerContext) {
            if (isBright) finalBackground = "Bright Minimalist Bathroom, White Marble, Natural Sunlight through window. Airy spa atmosphere. High-Key photography.";
            else if (isNeon) finalBackground = "Modern Shower with Dark Slate Tiles and Pink/Blue Neon LED strips. Cyberpunk aesthetic. Wet surfaces reflection.";
            else if (isGolden) finalBackground = "Luxury Bathroom with large window, Golden Hour sunlight streaming in. Warm romantic atmosphere.";
            else if (isVibrant) finalBackground = "Colorful Mosaic Bathroom, Pop-art style lighting, vibrant energy and saturated colors.";
            else finalBackground = "Luxury Bathroom Shower, Wet Glass, Steamy Atmosphere, Marble Walls, Rain Shower Head. Cinematic Moody Lighting.";
            console.log('🚿 Shower background applied:', finalBackground.substring(0, 50) + '...');
        } else if (isBedContext) {
            if (isBright) finalBackground = "Bright Modern Bedroom, Sun-drenched, White Linen Sheets, Airy and Fresh. Scandi style.";
            else if (isNeon) finalBackground = "Dark Bedroom with Neon Signs on wall, moody purple/blue ambient light. Night vibe.";
            else if (isGolden) finalBackground = "Bohemian Bedroom during Sunset, warm golden light beams hitting the bed. Lens flare.";
            else if (isVibrant) finalBackground = "Eclectic Bedroom with colorful textiles and strong fashion lighting. High contrast.";
            else if (isSoftStudio) finalBackground = "Minimalist Bedroom setup, Soft White Studio Lighting, Clean look. Pale tones.";
            else finalBackground = "Luxury Master Bedroom with white silk sheets, soft pillows, intimate warm lamp lighting. High-end boudoir style.";
            console.log('🛏️ Bedroom background applied:', finalBackground.substring(0, 50) + '...');
        } else {
            // Ayakta or Oturarak - general luxury interior
            if (isBright) finalBackground = "White Luxury Interior, Flooded with Daylight. High-key fashion shot. Minimalist.";
            else if (isNeon) finalBackground = "Night Club VIP Lounge or Dark Studio with Neon accents. Cyberpunk fashion.";
            else if (isGolden) finalBackground = "Luxury Hotel Balcony at Sunset, Golden Light. Warm tones.";
            else if (isSoftStudio) finalBackground = "Clean White Cyclorama Studio, Soft Diffused Light. Professional catalog look.";
            else if (isVibrant) finalBackground = "Abstract Color Studio background. Saturated colors. Pop Art.";
            else finalBackground = "Luxury High-End Interior, Dim atmospheric lighting, Elegant. Velvet textures.";
            console.log('🏠 General interior background applied:', finalBackground.substring(0, 50) + '...');
        }
    } else {
        // Normal mode - environmentDetails already added to finalBackground above
        console.log('🌤️ Normal Mode - Environment Details included:', environmentDetails);
    }

    let prompt = "";

    // Check if this is an accessory that needs special framing
    const accessoryFraming = getAccessoryFraming(settings.clothingType);
    
    if (isProductPhotography) {
        prompt = `Generate a high-end commercial PRODUCT PHOTOGRAPHY image.
        Task: Create a professional photo of the item provided in the input image.
        Subject: The product (${settings.clothingType}).
        Environment: ${finalBackground}.
        Style: Commercial Studio or Lifestyle Product Photography. 
        IMPORTANT: NO HUMAN MODEL. Focus entirely on the product placement and lighting.`;
    } else {
        let modelDescription = `Gender: ${settings.gender}, Age: ${settings.age}, Origin: ${settings.ethnicity}`;
        if (!settings.age.includes('Seçiniz')) modelDescription += `, Age Group: ${settings.age}`;
        
        // FRAMING & TARGET POSE
        let framingInstruction = "";
        if (settings.framing) {
            if (settings.framing.includes('Tam Boy')) {
                framingInstruction = "CRITICAL FULL BODY SHOT: Show the COMPLETE model from HEAD to TOE including FEET. The entire body must be visible. Frame must include: head, torso, arms, legs, and FEET/SHOES. Leave appropriate space above head and below feet. NEVER crop the feet or shoes out of frame.";
            } else if (settings.framing.includes('Sadece Üst')) {
                framingInstruction = "Upper body portrait shot. Frame from waist up to head. Focus on torso, arms, and face. Do NOT show legs or lower body.";
            } else if (settings.framing.includes('Sadece Alt')) {
                framingInstruction = "Lower body shot. Frame from waist down to feet. Focus on legs, lower garment, and footwear. Do NOT show upper body or face.";
            } else if (settings.framing.includes('Yakın Çekim')) {
                framingInstruction = "Close-up detail shot. Tight framing focused on specific product details, fabric textures, or key design elements.";
            }
        }
        
        let poseInstruction = "";
        if (settings.targetPose) {
            if (settings.targetPose.includes('Önden')) {
                poseInstruction = "Model facing camera directly. Front view. Straight-on angle.";
            } else if (settings.targetPose.includes('Yandan')) {
                poseInstruction = "Model in side profile view. Show the side angle of the outfit and model. 90-degree side view.";
            } else if (settings.targetPose.includes('Arkadan')) {
                poseInstruction = "Model facing away from camera. Back view. Show rear view of the outfit and model.";
            }
        }
        
        // Build detailed model description with hair and makeup
        let detailedModelDescription = `${modelDescription}, Height: ${settings.height}, Body: ${settings.bodyType}, Hair: ${settings.hairStyle}`;

        // Add skin tone if specified
        if (settings.skinTone && settings.skinTone !== 'auto') {
            const skinToneDescriptions: { [key: string]: string } = {
                'fair': 'very fair porcelain skin with light pink undertones',
                'light': 'light skin with slight pink undertones',
                'medium-light': 'light-medium skin with warm beige undertones',
                'medium': 'medium warm skin with golden/honey undertones',
                'medium-dark': 'medium-dark skin with bronze/caramel undertones',
                'dark': 'dark skin with rich brown/coffee undertones',
                'deep': 'deep dark skin with espresso/ebony undertones'
            };
            detailedModelDescription += `, Skin Tone: ${skinToneDescriptions[settings.skinTone] || 'natural skin tone'}`;
        }

        // Add hair color if specified
        if (settings.hairColor && !settings.hairColor.includes('Seçiniz')) {
            detailedModelDescription += `, Hair Color: ${settings.hairColor}`;
        }

        // Add hair length if specified
        if (settings.hairLength) {
            detailedModelDescription += `, Hair Length: ${settings.hairLength}`;
        }

        // Add makeup details for female models
        if (settings.gender === 'Kadın') {
            if (settings.lipstickColor && !settings.lipstickColor.includes('Seçiniz')) {
                detailedModelDescription += `, Lipstick: ${settings.lipstickColor}`;
            }
            if (settings.nailPolishColor && !settings.nailPolishColor.includes('Seçiniz')) {
                detailedModelDescription += `, Nail Polish: ${settings.nailPolishColor}`;
            }
        }

        prompt = `Generate a professional high-quality fashion photography image.
        Task: Realistic photo of a model wearing/using the item (${settings.clothingType}).
        Model Details: ${detailedModelDescription}.
        ${framingInstruction ? `FRAMING: ${framingInstruction}` : ''}
        ${poseInstruction ? `POSE/ANGLE: ${poseInstruction}` : ''}
        Composition: Camera: ${viewAnglePrompt}, Background: ${finalBackground}.
        Target Resolution: ${settings.aspectRatio}.`;
        
        // WALLET/BAG-SPECIFIC HANDLING (takes precedence over other accessory logic)
        const isWallet = isWalletProduct(settings.clothingType);
        const isBag = isBagProduct(settings.clothingType);
        
        if (isWallet) {
            prompt += `\n\nWALLET PRODUCT PHOTOGRAPHY INSTRUCTIONS:`;
            
            // Check if this is product-only or with model
            if (settings.isProductPhotography) {
                // PRODUCT ONLY - No model, wallet in scene
                prompt += `\n- SUBJECT: Wallet ONLY (no model, no hands)`;
                prompt += `\n- PHOTOGRAPHY TYPE: Product-only lifestyle photography`;
                
                // Add scene if selected
                if (settings.walletSceneProductOnly && !settings.walletSceneProductOnly.includes('Otomatik')) {
                    const scene = settings.walletSceneProductOnly;
                    let sceneDetail = "";
                    
                    if (scene.includes('Ahşap Masa')) {
                        sceneDetail = "SCENE: Wallet placed on a wooden table surface. Natural wood grain texture visible. Professional product placement.";
                    } else if (scene.includes('Mermer')) {
                        sceneDetail = "SCENE: Wallet placed on elegant marble surface. White/gray marble with subtle veining. Luxury aesthetic.";
                    } else if (scene.includes('Deri Koltuk')) {
                        sceneDetail = "SCENE: Wallet placed on leather couch/seat. Rich leather texture visible. Sophisticated setting.";
                    } else if (scene.includes('Araba Gösterge')) {
                        sceneDetail = `SCENE: Wallet placed on car dashboard (instrument panel area).
                        - SPECIFIC SETTING: Modern luxury car interior dashboard
                        - DASHBOARD DETAILS: Dark leather or soft-touch dashboard surface (black, gray, or tan color)
                        - VISIBLE ELEMENTS: Steering wheel partially visible in background (blurred), instrument cluster/gauges visible but soft-focused
                        - CAR BRAND AESTHETIC: Premium/luxury car interior (think Mercedes, BMW, Audi style)
                        - WALLET PLACEMENT: Wallet sitting naturally on the flat dashboard surface near windshield or center console
                        - DEPTH OF FIELD: Dashboard and wallet SHARP, windshield/outside view BLURRED
                        - WINDSHIELD VIEW: Through windshield, slightly blurred outdoor scene (city street, parking lot, or road)
                        - INTERIOR LIGHTING: Natural daylight coming through windshield + subtle car interior ambient lighting
                        - MATERIALS: Rich leather dashboard texture, premium car interior materials
                        - NO CONFUSION: This is clearly the INSIDE of a luxury car, NOT a generic surface
                        - AUTOMOTIVE LIFESTYLE: Conveys premium driving lifestyle context`;
                    } else if (scene.includes('Araba Koltuk')) {
                        sceneDetail = `SCENE: Wallet placed on luxury car seat.
                        - SPECIFIC SETTING: Premium car seat (driver or passenger side)
                        - SEAT MATERIAL: High-quality perforated leather (black, tan, or beige), visible stitching details
                        - WALLET PLACEMENT: Wallet sitting naturally on the seat surface
                        - SEAT DETAILS: Leather grain texture, elegant stitching, premium automotive upholstery
                        - BACKGROUND: Blurred car interior (door panel, center console, or seatbelt visible but soft)
                        - LIGHTING: Natural light from car windows + soft interior lighting
                        - CAR INTERIOR: Luxury vehicle interior aesthetic
                        - NO CONFUSION: This is clearly a premium car seat, not generic furniture
                        - AUTOMOTIVE LIFESTYLE: Travel, driving, luxury car ownership context`;
                    } else if (scene.includes('Kafe Masası')) {
                        sceneDetail = "SCENE: Wallet on cafe table next to coffee cup. Lifestyle setting. Warm, inviting atmosphere.";
                    } else if (scene.includes('Ofis Masası')) {
                        sceneDetail = "SCENE: Wallet on office desk next to laptop/keyboard. Professional business setting. Clean, organized.";
                    } else if (scene.includes('Restoran')) {
                        sceneDetail = "SCENE: Wallet on restaurant table. Fine dining setting. Elegant tablecloth or wooden surface.";
                    } else if (scene.includes('Çanta Yanında')) {
                        sceneDetail = "SCENE: Wallet placed next to a luxury bag/purse. Fashion lifestyle context. Coordinated styling.";
                    } else if (scene.includes('Anahtarlar')) {
                        sceneDetail = "SCENE: Wallet next to car keys or house keys. Everyday lifestyle context. Practical setting.";
                    } else if (scene.includes('Telefon')) {
                        sceneDetail = "SCENE: Wallet next to smartphone. Modern tech lifestyle. Clean composition.";
                    } else if (scene.includes('Saat Yanında')) {
                        sceneDetail = "SCENE: Wallet next to luxury watch. Premium lifestyle context. High-end accessories together.";
                    } else if (scene.includes('Minimalist Beyaz')) {
                        sceneDetail = "SCENE: Wallet on pure white minimalist surface. Clean, modern, studio aesthetic. NO distractions.";
                    } else if (scene.includes('Siyah Lüks')) {
                        sceneDetail = "SCENE: Wallet on black luxury surface. Dramatic, high-end aesthetic. Strong contrast.";
                    }
                    
                    if (sceneDetail) {
                        prompt += `\n\n${sceneDetail}`;
                        prompt += `\n\n🎯 CRITICAL SCENE ACCURACY RULES:
                        - FOLLOW THE SCENE DESCRIPTION EXACTLY: Every detail mentioned above MUST be visible in the output
                        - NO RANDOM BACKGROUNDS: Do not generate generic or unrelated backgrounds
                        - NO SUBSTITUTIONS: If scene says "car dashboard", it must be a car dashboard - NOT a table, floor, or random surface
                        - RECOGNIZABLE CONTEXT: The viewer should IMMEDIATELY recognize the scene (e.g., "This is clearly inside a car")
                        - RELEVANT DETAILS: Include the specific elements mentioned (e.g., steering wheel, windshield, car seats)
                        - NO CONFUSION: The scene should be clear, specific, and match the description 100%`;
                        prompt += `\n- COMPOSITION: Wallet is the main subject. Scene elements are supporting context only.`;
                        prompt += `\n- ANGLE: 45-degree angle or top-down view to best showcase wallet and scene.`;
                    }
                }
            } else {
                // WITH MODEL - Model holding/using wallet
                prompt += `\n- SUBJECT: Model holding/using the wallet`;
                prompt += `\n- PHOTOGRAPHY TYPE: Fashion lifestyle with model and wallet`;
                
                // Add realistic background based on pose
                prompt += `\n\nBACKGROUND FOR WALLET WITH MODEL:`;
                
                if (settings.walletPoseWithModel && !settings.walletPoseWithModel.includes('Otomatik')) {
                    const pose = settings.walletPoseWithModel;
                    let poseDetail = "";
                    let backgroundContext = "";
                    
                    if (pose.includes('Elde Tutuyor')) {
                        poseDetail = "POSE: Model holding wallet elegantly in hand. Graceful hand gesture showcasing wallet. Front or 3/4 view.";
                        backgroundContext = "BACKGROUND: Upscale restaurant or luxury hotel lobby. Blurred background with warm ambient lighting. Professional business/lifestyle setting.";
                    } else if (pose.includes('Cebe Koyuyor')) {
                        poseDetail = "POSE: Model putting wallet into pocket (jacket/pants). Mid-action shot. Dynamic lifestyle moment.";
                        backgroundContext = "BACKGROUND: Urban street or modern office entrance. Slightly blurred city/business environment. Natural daytime setting.";
                    } else if (pose.includes('Cebinden Çıkarıyor')) {
                        poseDetail = "POSE: Model pulling wallet out of pocket. Mid-action shot. Capturing the movement.";
                        backgroundContext = "BACKGROUND: Cafe interior or shopping area. Soft bokeh background. Casual lifestyle environment.";
                    } else if (pose.includes('Açık Gösteriyor')) {
                        poseDetail = "POSE: Model holding open wallet showing interior/cards. Demonstrating functionality. Clear view of wallet contents.";
                        backgroundContext = "BACKGROUND: Clean modern interior - could be home office, living room, or upscale store. Minimal, uncluttered background that doesn't distract.";
                    } else if (pose.includes('Kapalı Gösteriyor')) {
                        poseDetail = "POSE: Model holding closed wallet, showing exterior design. Focus on wallet's outer appearance and branding.";
                        backgroundContext = "BACKGROUND: Luxury retail store or boutique interior. Soft blurred background with premium aesthetic. Fashion context.";
                    } else if (pose.includes('Kart Çıkarıyor')) {
                        poseDetail = "POSE: Model pulling out card from wallet. Mid-action shot. Showing practical use.";
                        backgroundContext = "BACKGROUND: Store checkout counter or restaurant table. Slightly visible payment/transaction context. Real-world usage setting.";
                    } else if (pose.includes('Para Koyuyor')) {
                        poseDetail = "POSE: Model placing money/bills into wallet. Mid-action shot. Demonstrating use case.";
                        backgroundContext = "BACKGROUND: Bank, ATM area, or upscale shop interior. Professional financial context. Clean, modern environment.";
                    } else if (pose.includes('Tek Elle Tutuyor')) {
                        poseDetail = "POSE: Model holding wallet with one hand. Simple, clean presentation. Focus on product.";
                        backgroundContext = "BACKGROUND: Neutral elegant background - soft gray, beige, or blurred luxury interior. Minimal distraction, product-focused.";
                    }
                    
                    if (poseDetail) {
                        prompt += `\n\n${poseDetail}`;
                        if (backgroundContext) {
                            prompt += `\n${backgroundContext}`;
                            prompt += `\n- BACKGROUND RULES: Background should be naturally blurred (shallow depth of field). It provides context but doesn't compete with the wallet. Keep it realistic and relevant to the pose/action.`;
                        }
                        prompt += `\n- FOCUS: Both model and wallet are important. Wallet must be clearly visible and in focus.`;
                    }
                }
                
                // CRITICAL SIZE RULES
                prompt += `\n\nCRITICAL WALLET SIZE RULES:
                - REALISTIC PROPORTIONS: The wallet must maintain its natural, real-world size in relation to the model's hand
                - WALLET DIMENSIONS: A typical wallet is approximately 10-12cm wide and 8-10cm tall when closed
                - HAND SCALE REFERENCE: The wallet should fit comfortably in one hand - NOT too large (like a book) or too small (like a coin)
                - SIZE CONSISTENCY: The wallet should look like a normal wallet that could actually fit in a pocket
                - DO NOT EXAGGERATE: Do not make the wallet larger or smaller than it would be in real life
                - NATURAL GRIP: The model's hand should hold the wallet naturally, showing realistic size relationship
                - VISUAL PROPORTION: If the wallet appears to be the size of a tablet or smaller than a credit card, it's WRONG - fix the scale`;
            }
            
            // Add lighting for wallet
            if (settings.walletLighting && !settings.walletLighting.includes('Otomatik')) {
                const lighting = settings.walletLighting;
                let lightingDetail = "";
                
                if (lighting.includes('Doğal Pencere')) {
                    lightingDetail = "LIGHTING: Natural window light. Soft, diffused daylight. Realistic and warm.";
                } else if (lighting.includes('Yumuşak Stüdyo')) {
                    lightingDetail = "LIGHTING: Soft studio lighting. Even illumination. Professional product photography standard.";
                } else if (lighting.includes('Dramatik Yan')) {
                    lightingDetail = "LIGHTING: Dramatic side lighting. Strong shadows. High contrast for depth and texture.";
                } else if (lighting.includes('Üstten Overhead')) {
                    lightingDetail = "LIGHTING: Overhead top-down lighting. Even, flat illumination. Clean product shot style.";
                } else if (lighting.includes('Sıcak Ortam')) {
                    lightingDetail = "LIGHTING: Warm ambient lighting. Cozy, tungsten-toned. Interior setting atmosphere.";
                } else if (lighting.includes('Soğuk Profesyonel')) {
                    lightingDetail = "LIGHTING: Cool professional lighting. Clean, modern. Slightly blue-toned.";
                } else if (lighting.includes('Altın Saat')) {
                    lightingDetail = "LIGHTING: Golden hour sunlight. Warm orange-golden glow. Romantic and premium feel.";
                } else if (lighting.includes('Gölgeli Yumuşak')) {
                    lightingDetail = "LIGHTING: Soft diffused light with gentle shadows. Low contrast. Natural and subtle.";
                }
                
                if (lightingDetail) {
                    prompt += `\n\n${lightingDetail}`;
                }
            }
            
            prompt += `\n\nWALLET QUALITY FOCUS:
            - WALLET SHARPNESS: The wallet must be perfectly sharp and in focus
            - LEATHER/MATERIAL TEXTURE: Show clear grain, stitching, and material quality
            - BRAND/LOGO: If visible, ensure clarity and detail
            - COLOR ACCURACY: Accurate wallet color representation
            - PROFESSIONAL: High-end product photography standards`;
            
            // CRITICAL: Add size control for ALL wallet modes (both with/without model)
            prompt += `\n\n🚨 ABSOLUTE CRITICAL WALLET SIZE CONTROL - NON-NEGOTIABLE:
            
            ❗ PRIMARY RULE - INPUT IMAGE IS THE SIZE REFERENCE:
            - The INPUT product image shows the wallet at its ACTUAL SIZE
            - YOU MUST preserve the EXACT proportions and dimensions from the input image
            - DO NOT scale up or down - maintain the ORIGINAL size relationship
            - Think of the input image as a template - COPY ITS SIZE EXACTLY
            
            📏 REALISTIC WALLET DIMENSIONS (Cross-check):
            - Standard wallet: 10-12cm wide × 8-10cm tall when closed
            - Roughly the size of 2-3 credit cards stacked (9cm × 5.5cm each)
            - Should fit comfortably in a standard pocket
            
            ⚠️ SIZE ERROR CHECKS (These indicate FAILURE):
            - ❌ WRONG: Wallet looks like a book, tablet, or iPad (TOO LARGE)
            - ❌ WRONG: Wallet looks like a business card or coin purse (TOO SMALL)
            - ❌ WRONG: Wallet is bigger than a smartphone (unless it's actually a large clutch)
            - ❌ WRONG: Wallet is smaller than a credit card (physically impossible)
            
            ✅ CORRECT OUTPUT CHECK:
            - The wallet in the OUTPUT should be IDENTICAL in size/scale to the INPUT
            - If you placed them side by side, they should match perfectly
            - The only difference should be the scene/background/model - NOT the wallet size`;
            
            if (!settings.isProductPhotography) {
                // Additional rules for with-model mode
                prompt += `\n\n📏 CRITICAL SIZE RULES FOR WALLET WITH MODEL:
                
                🖐️ HAND-TO-WALLET PROPORTION (Use this to verify size):
                - Adult human hand: approximately 18-20cm from wrist to fingertip
                - Wallet should be roughly HALF (50-60%) of the hand length
                - Wallet width should be LESS than the palm width
                - One hand should be able to hold/grip the wallet COMFORTABLY
                
                👤 BODY-TO-WALLET SCALE CHECK:
                - If model's full body is visible: wallet should look TINY compared to torso
                - Wallet should be MUCH smaller than the model's head
                - Wallet should be similar size to a smartphone in the same scene
                
                ✋ NATURAL GRIP TEST:
                - Model can hold wallet with ease - fingers wrap around naturally
                - NOT struggling or using two hands (= wallet too big ❌)
                - NOT pinching with fingertips like a coin (= wallet too small ❌)
                - Looks comfortable and natural ✅
                
                👖 POCKET FIT VISUAL CHECK:
                - The wallet should CLEARLY look like it fits in a jacket inner pocket
                - Should look like it fits in pants back pocket (though snug)
                - If it looks like it wouldn't fit in ANY pocket = TOO BIG ❌
                
                📱 SIZE COMPARISON REFERENCE:
                - Wallet ≈ iPhone size or slightly smaller
                - Wallet should NOT be larger than an iPad Mini (too big ❌)
                - Wallet should NOT be smaller than a credit card (too small ❌)`;
            }
        
        } else if (isBag) {
            // BAG-SPECIFIC HANDLING
            prompt += `\n\nBAG PRODUCT PHOTOGRAPHY INSTRUCTIONS:`;
            
            if (settings.isProductPhotography) {
                // PRODUCT ONLY - No model
                prompt += `\n- SUBJECT: Bag ONLY (no model, no hands)`;
                prompt += `\n- PHOTOGRAPHY TYPE: Product-only lifestyle photography`;
                
                if (settings.bagSceneProductOnly && !settings.bagSceneProductOnly.includes('Otomatik')) {
                    const scene = settings.bagSceneProductOnly;
                    let sceneDetail = "";
                    
                    if (scene.includes('Ahşap Masa')) {
                        sceneDetail = "SCENE: Bag placed on wooden table. Natural wood grain. Product-focused composition.";
                    } else if (scene.includes('Mermer')) {
                        sceneDetail = "SCENE: Bag on marble surface. Luxury aesthetic. Elegant setting.";
                    } else if (scene.includes('Deri Koltuk')) {
                        sceneDetail = "SCENE: Bag on leather couch. Rich texture. Sophisticated lifestyle.";
                    } else if (scene.includes('Arka Koltuk')) {
                        sceneDetail = "SCENE: Bag on car back seat. Travel/commute context. Modern car interior.";
                    } else if (scene.includes('Bagaj')) {
                        sceneDetail = "SCENE: Bag in car trunk/boot. Travel preparation. Practical lifestyle moment.";
                    } else if (scene.includes('Kafe Sandalye')) {
                        sceneDetail = "SCENE: Bag hanging on cafe chair or placed on seat. Social lifestyle. Casual elegant setting.";
                    } else if (scene.includes('Ofis Masası')) {
                        sceneDetail = "SCENE: Bag on office desk next to laptop. Professional workspace. Modern business setting.";
                    } else if (scene.includes('Gardrop')) {
                        sceneDetail = "SCENE: Bag on closet shelf or hanging. Fashion collection display. Organized wardrobe aesthetic.";
                    } else if (scene.includes('Ayakkabılık')) {
                        sceneDetail = "SCENE: Bag next to shoe rack or shoes. Coordinated accessories. Home entryway setting.";
                    } else if (scene.includes('Cüzdan & Aksesuar')) {
                        sceneDetail = "SCENE: Bag alongside wallet and other accessories. Complete look display. Fashion flat lay style.";
                    } else if (scene.includes('Aynalı Konsol')) {
                        sceneDetail = "SCENE: Bag on mirrored console table. Luxury home decor. Elegant interior setting.";
                    } else if (scene.includes('Restoran Sandalye')) {
                        sceneDetail = "SCENE: Bag on restaurant chair or floor. Dining out lifestyle. Upscale setting.";
                    } else if (scene.includes('Otel Odası')) {
                        sceneDetail = "SCENE: Bag on hotel bed or luggage rack. Travel luxury. Premium hospitality context.";
                    } else if (scene.includes('Havaalanı')) {
                        sceneDetail = "SCENE: Bag in airport/travel context. Journey lifestyle. Modern traveler aesthetic.";
                    } else if (scene.includes('Minimalist Beyaz')) {
                        sceneDetail = "SCENE: Bag on pure white surface. Clean studio aesthetic. Product-focused minimal.";
                    } else if (scene.includes('Siyah Lüks')) {
                        sceneDetail = "SCENE: Bag on black luxury surface. Dramatic high-end aesthetic. Premium contrast.";
                    }
                    
                    if (sceneDetail) {
                        prompt += `\n\n${sceneDetail}`;
                        prompt += `\n\n🎯 CRITICAL SCENE ACCURACY RULES:
                        - FOLLOW THE SCENE DESCRIPTION EXACTLY: Every detail mentioned above MUST be visible in the output
                        - NO RANDOM BACKGROUNDS: Do not generate generic or unrelated backgrounds
                        - NO SUBSTITUTIONS: The scene must match the description precisely
                        - RECOGNIZABLE CONTEXT: The viewer should IMMEDIATELY recognize the scene
                        - RELEVANT DETAILS: Include all specific elements mentioned
                        - NO CONFUSION: The scene should be clear and match description 100%`;
                        prompt += `\n- COMPOSITION: Bag is the hero product. Scene adds lifestyle context.`;
                        prompt += `\n- ANGLE: 45-degree, 3/4 view, or straight-on to showcase bag design and details.`;
                    }
                }
            } else {
                // WITH MODEL - Model holding/carrying bag
                prompt += `\n- SUBJECT: Model holding/carrying the bag`;
                prompt += `\n- PHOTOGRAPHY TYPE: Fashion lifestyle with model and bag`;
                
                if (settings.bagPoseWithModel && !settings.bagPoseWithModel.includes('Otomatik')) {
                    const pose = settings.bagPoseWithModel;
                    let poseDetail = "";
                    let backgroundContext = "";
                    
                    if (pose.includes('Omuzda Taşıyor')) {
                        poseDetail = "POSE: Model carrying bag on shoulder. Natural shoulder bag position. Casual confident stance.";
                        backgroundContext = "BACKGROUND: Urban street, shopping district, or modern city setting. Soft blur.";
                    } else if (pose.includes('Elde Tutuyor')) {
                        poseDetail = "POSE: Model holding bag by handles in hand. Elegant hand grip. Showcasing bag structure.";
                        backgroundContext = "BACKGROUND: Luxury boutique, upscale mall, or elegant street. Premium aesthetic.";
                    } else if (pose.includes('Kolda Asılı')) {
                        poseDetail = "POSE: Bag hanging from model's arm/forearm. Relaxed carry style. Fashion-forward posture.";
                        backgroundContext = "BACKGROUND: Fashion district, gallery, or modern interior. Sophisticated setting.";
                    } else if (pose.includes('Sırt Çantası')) {
                        poseDetail = "POSE: Model wearing backpack on back. Both straps on shoulders. Active lifestyle stance.";
                        backgroundContext = "BACKGROUND: Campus, park, urban outdoor, or travel setting. Dynamic environment.";
                    } else if (pose.includes('Çapraz Askılı')) {
                        poseDetail = "POSE: Bag worn crossbody style. Strap diagonal across torso. Practical chic look.";
                        backgroundContext = "BACKGROUND: City street, cafe exterior, or shopping area. Casual urban lifestyle.";
                    } else if (pose.includes('İçini Gösteriyor')) {
                        poseDetail = "POSE: Model holding open bag showing interior. Demonstrating functionality and compartments.";
                        backgroundContext = "BACKGROUND: Clean neutral or lifestyle setting. Focus on bag details.";
                    } else if (pose.includes('Kapalı Gösteriyor')) {
                        poseDetail = "POSE: Model holding closed bag. Showcasing exterior design, hardware, logo.";
                        backgroundContext = "BACKGROUND: Fashion-forward setting. Premium retail or elegant outdoor.";
                    } else if (pose.includes('İçinden Bir Şey Çıkarıyor')) {
                        poseDetail = "POSE: Model reaching into bag, pulling something out. Mid-action lifestyle moment.";
                        backgroundContext = "BACKGROUND: Everyday setting - cafe, office entrance, or street. Natural context.";
                    } else if (pose.includes('Yere Koyarken')) {
                        poseDetail = "POSE: Model placing bag down or picking it up. Dynamic movement. Showing bag's base and structure.";
                        backgroundContext = "BACKGROUND: Home entryway, restaurant, or workspace. Relatable lifestyle moment.";
                    } else if (pose.includes('Yan Profil')) {
                        poseDetail = "POSE: Model in side profile with bag prominently displayed. Emphasizing bag silhouette and design.";
                        backgroundContext = "BACKGROUND: Minimalist or fashion editorial setting. Artistic composition.";
                    }
                    
                    if (poseDetail) {
                        prompt += `\n\n${poseDetail}`;
                        if (backgroundContext) {
                            prompt += `\n${backgroundContext}`;
                            prompt += `\n- BACKGROUND RULES: Background naturally blurred (shallow depth of field). Provides lifestyle context without competing with bag.`;
                        }
                    }
                }
            }
            
            if (settings.bagLighting && !settings.bagLighting.includes('Otomatik')) {
                const lighting = settings.bagLighting;
                let lightingDetail = "";
                
                if (lighting.includes('Doğal Pencere')) {
                    lightingDetail = "LIGHTING: Natural window light. Soft, realistic illumination. Gentle shadows.";
                } else if (lighting.includes('Yumuşak Stüdyo')) {
                    lightingDetail = "LIGHTING: Soft studio lighting. Professional, even. High-key aesthetic.";
                } else if (lighting.includes('Dramatik Yan')) {
                    lightingDetail = "LIGHTING: Dramatic side lighting. Creates depth and dimension. Bold shadows.";
                } else if (lighting.includes('Üstten')) {
                    lightingDetail = "LIGHTING: Overhead lighting. Even top-down illumination. Clean product shot.";
                } else if (lighting.includes('Sıcak Ortam')) {
                    lightingDetail = "LIGHTING: Warm ambient lighting. Cozy, inviting atmosphere. Interior lifestyle feel.";
                } else if (lighting.includes('Soğuk Profesyonel')) {
                    lightingDetail = "LIGHTING: Cool professional lighting. Modern, sleek. Business aesthetic.";
                } else if (lighting.includes('Altın Saat')) {
                    lightingDetail = "LIGHTING: Golden hour sunlight. Warm outdoor glow. Premium lifestyle feel.";
                } else if (lighting.includes('Gölgeli Yumuşak')) {
                    lightingDetail = "LIGHTING: Soft shadowed lighting. Gentle contrast. Elegant and refined.";
                } else if (lighting.includes('Butik')) {
                    lightingDetail = "LIGHTING: Boutique retail lighting. Premium store aesthetic. Luxury display lighting.";
                }
                
                if (lightingDetail) {
                    prompt += `\n\n${lightingDetail}`;
                }
            }
            
            prompt += `\n\nBAG QUALITY FOCUS:
            - BAG SHARPNESS: Perfect focus on bag materials, stitching, hardware
            - MATERIAL TEXTURE: Show leather/fabric grain, quality details
            - HARDWARE: Zippers, clasps, buckles clearly visible and sharp
            - BRAND/LOGO: If present, ensure clarity and detail
            - COLOR ACCURACY: True bag color representation
            - STRAP/HANDLE: Clear detail on handles, straps, attachments
            - PROFESSIONAL: High-end fashion/product photography standards`;
            
            // CRITICAL: Add size control for bags
            prompt += `\n\n⚠️ CRITICAL BAG SIZE CONTROL:
            - INPUT IMAGE REFERENCE: Use the bag size from INPUT product image as reference
            - MAINTAIN ORIGINAL SIZE: Output bag must match the size in the input image
            - REALISTIC PROPORTIONS: Bag should be proportional to human scale if with model
            - DO NOT EXAGGERATE: Bag should not look oversized or undersized`;
            
            if (!settings.isProductPhotography) {
                prompt += `\n\n📏 BAG WITH MODEL SIZE RULES:
                - BODY PROPORTION: Bag size should match model's frame naturally
                - HANDLE/STRAP FIT: Straps and handles should fit model's body realistically
                - NATURAL CARRY: Model should carry bag comfortably - not struggling or awkward
                - REALISTIC SCALE: Bag size appropriate for the carrying style (shoulder/hand/crossbody)`;
            }
        
        } else if (isShoesProduct(settings.clothingType)) {
            // SHOES-SPECIFIC HANDLING
            prompt += `\n\nSHOES PRODUCT PHOTOGRAPHY INSTRUCTIONS:`;
            
            if (settings.isProductPhotography) {
                // PRODUCT ONLY - No model
                prompt += `\n- SUBJECT: Shoes/Sneakers ONLY (no model, no feet)`;
                prompt += `\n- PHOTOGRAPHY TYPE: Product-only photography`;
                
                if (settings.shoesSceneProductOnly && !settings.shoesSceneProductOnly.includes('Otomatik')) {
                    const scene = settings.shoesSceneProductOnly;
                    let sceneDetail = "";
                    
                    if (scene.includes('Beyaz Zemin')) {
                        sceneDetail = "SCENE: Shoes on pure white minimal floor. Clean studio shot. NO other elements.";
                    } else if (scene.includes('Ahşap Zemin')) {
                        sceneDetail = "SCENE: Shoes on wooden floor. Natural wood grain texture. Warm aesthetic.";
                    } else if (scene.includes('Mermer Zemin')) {
                        sceneDetail = "SCENE: Shoes on marble floor. White/gray marble with veining. Luxury setting.";
                    } else if (scene.includes('Beton Zemin')) {
                        sceneDetail = "SCENE: Shoes on concrete floor. Urban, industrial aesthetic. Modern street style.";
                    } else if (scene.includes('Kutusu Üzerinde')) {
                        sceneDetail = "SCENE: Shoes placed on top of shoe box. Brand box visible. Product presentation style.";
                    } else if (scene.includes('Kutusu Yanında')) {
                        sceneDetail = "SCENE: Shoes next to shoe box. Box partially visible. Unboxing context.";
                    } else if (scene.includes('Raf/Vitrin')) {
                        sceneDetail = "SCENE: Shoes displayed on shelf/in showcase. Store display setting. Premium retail.";
                    } else if (scene.includes('Deri Koltuk')) {
                        sceneDetail = "SCENE: Shoes on leather couch/seat. Luxury lifestyle context. Rich texture.";
                    } else if (scene.includes('Sokak Taşı')) {
                        sceneDetail = "SCENE: Shoes on cobblestone/street pavement. Urban outdoor setting. Street style.";
                    } else if (scene.includes('Koşu Pisti')) {
                        sceneDetail = "SCENE: Shoes on running track. Athletic context. Sport performance setting.";
                    } else if (scene.includes('Spor Salonu')) {
                        sceneDetail = "SCENE: Shoes on gym floor. Fitness/workout context. Athletic environment.";
                    } else if (scene.includes('Çim/Doğa')) {
                        sceneDetail = "SCENE: Shoes on grass/natural ground. Outdoor nature setting. Hiking/adventure context.";
                    } else if (scene.includes('Kum/Plaj')) {
                        sceneDetail = "SCENE: Shoes on sand/beach. Summer lifestyle. Casual beach setting.";
                    } else if (scene.includes('Mağaza Vitrini')) {
                        sceneDetail = "SCENE: Shoes in elegant store window display. High-end retail presentation. Fashion boutique.";
                    }
                    
                    if (sceneDetail) {
                        prompt += `\n\n${sceneDetail}`;
                        prompt += `\n- COMPOSITION: Shoes are main subject. Scene provides context.`;
                        prompt += `\n- ANGLE: 45-degree angle or side view to showcase shoe design.`;
                    }
                }
            } else {
                // WITH MODEL - Model wearing shoes
                prompt += `\n- SUBJECT: Model wearing the shoes`;
                prompt += `\n- PHOTOGRAPHY TYPE: Fashion/lifestyle with model wearing shoes`;
                prompt += `\n- FRAMING: From knees down to feet (or full body depending on pose)`;
                
                if (settings.shoesPoseWithModel && !settings.shoesPoseWithModel.includes('Otomatik')) {
                    const pose = settings.shoesPoseWithModel;
                    let poseDetail = "";
                    
                    if (pose.includes('Ayakta Duruş')) {
                        poseDetail = "POSE: Model standing still. Static pose. Full or 3/4 view of shoes. Professional stance.";
                    } else if (pose.includes('Yürüme Anı')) {
                        poseDetail = "POSE: Model walking. Mid-stride dynamic shot. Motion captured. One foot forward.";
                    } else if (pose.includes('Koşma Pozu')) {
                        poseDetail = "POSE: Model running or jogging. Athletic dynamic pose. Action shot. Sport context.";
                    } else if (pose.includes('Oturur Pozisyon')) {
                        poseDetail = "POSE: Model sitting with legs crossed. Casual relaxed pose. Shoes visible from side/front.";
                    } else if (pose.includes('Tek Ayak Öne')) {
                        poseDetail = "POSE: Model with one foot forward, showcasing shoe. Fashion pose. Front or side view.";
                    } else if (pose.includes('Yan Profil')) {
                        poseDetail = "POSE: Model in side profile stance. Full side view of shoes. Profile composition.";
                    } else if (pose.includes('Merdiven Çıkma')) {
                        poseDetail = "POSE: Model climbing stairs. Dynamic upward movement. Shoes on steps. Active lifestyle.";
                    } else if (pose.includes('Casual Ayak')) {
                        poseDetail = "POSE: Model in casual foot positions. Relaxed, natural stance. Lifestyle context.";
                    } else if (pose.includes('Spor Aktivite')) {
                        poseDetail = "POSE: Model in athletic/sport activity pose. Jumping, stretching, or sport-specific movement.";
                    }
                    
                    if (poseDetail) {
                        prompt += `\n\n${poseDetail}`;
                        prompt += `\n- FOCUS: Shoes must be clearly visible and in focus.`;
                    }
                }
            }
            
            if (settings.shoesLighting && !settings.shoesLighting.includes('Otomatik')) {
                const lighting = settings.shoesLighting;
                let lightingDetail = "";
                
                if (lighting.includes('Parlak Stüdyo')) {
                    lightingDetail = "LIGHTING: Bright studio lighting. High-key, clean. Professional product photography.";
                } else if (lighting.includes('Doğal Gün')) {
                    lightingDetail = "LIGHTING: Natural daylight. Outdoor or window light. Realistic and fresh.";
                } else if (lighting.includes('Yan Işık (Kontur)')) {
                    lightingDetail = "LIGHTING: Side lighting for contour. Shows shoe shape and texture. 3D depth.";
                } else if (lighting.includes('Üstten Işık')) {
                    lightingDetail = "LIGHTING: Overhead top lighting. Even illumination. Clean product shot.";
                } else if (lighting.includes('Altın Saat (Outdoor)')) {
                    lightingDetail = "LIGHTING: Golden hour outdoor sunlight. Warm glow. Premium lifestyle feel.";
                } else if (lighting.includes('Spot Işık')) {
                    lightingDetail = "LIGHTING: Focused spotlight. Dramatic emphasis on shoes. Dark background contrast.";
                } else if (lighting.includes('Yumuşak Dağınık')) {
                    lightingDetail = "LIGHTING: Soft diffused lighting. Gentle shadows. Natural and elegant.";
                } else if (lighting.includes('Soğuk Beyaz')) {
                    lightingDetail = "LIGHTING: Cool white lighting. Modern, tech aesthetic. Crisp and clean.";
                }
                
                if (lightingDetail) {
                    prompt += `\n\n${lightingDetail}`;
                }
            }
            
            prompt += `\n\nSHOES QUALITY FOCUS:
            - SHOE SHARPNESS: Perfect focus on shoes, every detail visible
            - MATERIAL TEXTURE: Clear leather/fabric/mesh texture and quality
            - SOLE DETAIL: If visible, show sole pattern and construction
            - LACES/STITCHING: Sharp detail on all shoe elements
            - BRAND/LOGO: Clear visibility if present
            - COLOR ACCURACY: True-to-life shoe colors
            - PROFESSIONAL: High-end footwear photography standards`;
            
            // CRITICAL: Add size control for shoes
            prompt += `\n\n⚠️ CRITICAL SHOE SIZE CONTROL:
            - INPUT IMAGE REFERENCE: Use the shoe size from the INPUT product image as reference
            - MAINTAIN ORIGINAL SIZE: Output shoe must match the size in the input image
            - REALISTIC DIMENSIONS: Adult shoe is approximately 25-30cm long, 8-10cm wide
            - SCALE REFERENCE: If with model - shoe should fit the model's foot naturally
            - DO NOT EXAGGERATE: Shoes should not look like cartoon-sized or doll-sized`;
            
            if (!settings.isProductPhotography) {
                prompt += `\n\n📏 SHOE WITH MODEL SIZE RULES:
                - FOOT PROPORTION: Adult foot is roughly 15% of body height
                - NATURAL FIT: Shoe should fit the model's foot perfectly - not oversized or undersized
                - REALISTIC SCALE: Shoe size should match the model's body proportions`;
            }
            
        } else if (isSunglassesProduct(settings.clothingType)) {
            // SUNGLASSES-SPECIFIC HANDLING
            prompt += `\n\nSUNGLASSES PRODUCT PHOTOGRAPHY INSTRUCTIONS:`;
            
            if (settings.isProductPhotography) {
                // PRODUCT ONLY - No model
                prompt += `\n- SUBJECT: Sunglasses ONLY (no model, no face)`;
                prompt += `\n- PHOTOGRAPHY TYPE: Product-only photography`;
                
                if (settings.sunglassesSceneProductOnly && !settings.sunglassesSceneProductOnly.includes('Otomatik')) {
                    const scene = settings.sunglassesSceneProductOnly;
                    let sceneDetail = "";
                    
                    if (scene.includes('Beyaz Minimal')) {
                        sceneDetail = "SCENE: Sunglasses on pure white surface. Minimalist studio shot. Clean and modern.";
                    } else if (scene.includes('Ahşap Masa')) {
                        sceneDetail = "SCENE: Sunglasses on wooden table. Natural wood texture. Warm lifestyle context.";
                    } else if (scene.includes('Mermer Yüzey')) {
                        sceneDetail = "SCENE: Sunglasses on marble surface. Luxury setting. Elegant aesthetic.";
                    } else if (scene.includes('Kitap')) {
                        sceneDetail = "SCENE: Sunglasses on/next to books. Intellectual lifestyle. Reading context.";
                    } else if (scene.includes('Laptop')) {
                        sceneDetail = "SCENE: Sunglasses next to laptop. Work/tech lifestyle. Modern professional.";
                    } else if (scene.includes('Kahve Fincanı')) {
                        sceneDetail = "SCENE: Sunglasses next to coffee cup. Cafe lifestyle. Casual relaxation.";
                    } else if (scene.includes('Plaj Havlusu')) {
                        sceneDetail = "SCENE: Sunglasses on beach towel. Summer vacation. Colorful beachwear context.";
                    } else if (scene.includes('Kum Üzerinde')) {
                        sceneDetail = "SCENE: Sunglasses on sand. Beach setting. Summer outdoor lifestyle.";
                    } else if (scene.includes('Araba Gösterge')) {
                        sceneDetail = `SCENE: Sunglasses placed on car dashboard (instrument panel area).
                        - SPECIFIC SETTING: Modern luxury car interior dashboard
                        - DASHBOARD DETAILS: Dark leather or soft-touch dashboard surface (black, gray, or tan color)
                        - VISIBLE ELEMENTS: Steering wheel partially visible in background (blurred), instrument cluster visible but soft-focused
                        - CAR BRAND AESTHETIC: Premium/luxury car interior (think Mercedes, BMW, Audi style)
                        - SUNGLASSES PLACEMENT: Sunglasses sitting naturally on the flat dashboard surface
                        - DEPTH OF FIELD: Dashboard and sunglasses SHARP, windshield/outside BLURRED
                        - WINDSHIELD VIEW: Through windshield, blurred bright outdoor scene (sunny day, road, parking)
                        - INTERIOR LIGHTING: Natural daylight + car interior ambient lighting
                        - MATERIALS: Rich leather dashboard, premium car interior materials
                        - NO CONFUSION: This is clearly the INSIDE of a luxury car
                        - AUTOMOTIVE LIFESTYLE: Driving/road trip lifestyle context`;
                    } else if (scene.includes('Güneş Işığında')) {
                        sceneDetail = "SCENE: Sunglasses in bright sunlight with shadows. Natural outdoor light. Strong shadow play.";
                    } else if (scene.includes('Çanta Yanında')) {
                        sceneDetail = "SCENE: Sunglasses next to luxury bag. Fashion accessories together. Coordinated style.";
                    } else if (scene.includes('Şapka Yanında')) {
                        sceneDetail = "SCENE: Sunglasses next to hat. Summer accessories combo. Vacation styling.";
                    } else if (scene.includes('Dergi Üzerinde')) {
                        sceneDetail = "SCENE: Sunglasses on fashion magazine. Editorial context. Stylish presentation.";
                    } else if (scene.includes('Cam Yüzey')) {
                        sceneDetail = "SCENE: Sunglasses on glass surface with reflections. Modern, sleek. Reflective beauty.";
                    }
                    
                    if (sceneDetail) {
                        prompt += `\n\n${sceneDetail}`;
                        prompt += `\n- COMPOSITION: Sunglasses are hero product. Scene adds lifestyle context.`;
                        prompt += `\n- ANGLE: 45-degree or top-down to show frame design.`;
                    }
                }
            } else {
                // WITH MODEL - Model wearing sunglasses
                prompt += `\n- SUBJECT: Model wearing sunglasses`;
                prompt += `\n- PHOTOGRAPHY TYPE: Fashion/lifestyle portrait with sunglasses`;
                prompt += `\n- FRAMING: Face and upper body (shoulders up or bust)`;
                
                if (settings.sunglassesPoseWithModel && !settings.sunglassesPoseWithModel.includes('Otomatik')) {
                    const pose = settings.sunglassesPoseWithModel;
                    let poseDetail = "";
                    
                    if (pose.includes('Takılı (Normal)')) {
                        poseDetail = "POSE: Model wearing sunglasses normally. Front or 3/4 face view. Natural portrait.";
                    } else if (pose.includes('Güneşe Bakış')) {
                        poseDetail = "POSE: Model wearing sunglasses, looking toward sunlight. Slight tilt up. Outdoor lifestyle.";
                    } else if (pose.includes('Çıkarıyor')) {
                        poseDetail = "POSE: Model taking off sunglasses. Mid-action shot. Dynamic moment captured.";
                    } else if (pose.includes('Takıyor')) {
                        poseDetail = "POSE: Model putting on sunglasses. Mid-action. Hand near face with glasses.";
                    } else if (pose.includes('Başta (Saçta)')) {
                        poseDetail = "POSE: Sunglasses pushed up on top of head/in hair. Casual style. Face fully visible.";
                    } else if (pose.includes('Camına Bakıyor')) {
                        poseDetail = "POSE: Model looking at/checking sunglasses lenses. Inspecting or cleaning gesture.";
                    } else if (pose.includes('Tek Elle Tutuyor')) {
                        poseDetail = "POSE: Model holding sunglasses with one hand. Product presentation. Clear view of frames.";
                    } else if (pose.includes('Gömlek Yakasında')) {
                        poseDetail = "POSE: Sunglasses hanging from shirt collar. Casual style. Not being worn.";
                    } else if (pose.includes('Fashion')) {
                        poseDetail = "POSE: Model in fashionable pose with sunglasses. Editorial style. Confident attitude.";
                    }
                    
                    if (poseDetail) {
                        prompt += `\n\n${poseDetail}`;
                        prompt += `\n- FOCUS: Sunglasses clearly visible and styled.`;
                    }
                }
            }
            
            if (settings.sunglassesLighting && !settings.sunglassesLighting.includes('Otomatik')) {
                const lighting = settings.sunglassesLighting;
                let lightingDetail = "";
                
                if (lighting.includes('Parlak Güneş')) {
                    lightingDetail = "LIGHTING: Bright sunlight. Outdoor natural light. Strong, vibrant illumination.";
                } else if (lighting.includes('Yumuşak Stüdyo')) {
                    lightingDetail = "LIGHTING: Soft studio lighting. Even, professional. No harsh shadows.";
                } else if (lighting.includes('Altın Saat')) {
                    lightingDetail = "LIGHTING: Golden hour sunset light. Warm orange-golden glow. Romantic atmosphere.";
                } else if (lighting.includes('Yan Işık (Yansıma)')) {
                    lightingDetail = "LIGHTING: Side lighting creating reflections on lenses. Glare and shine on glass.";
                } else if (lighting.includes('Arka Işık (Siluet)')) {
                    lightingDetail = "LIGHTING: Backlight creating silhouette. Dramatic rim light. Contour emphasis.";
                } else if (lighting.includes('Doğal Pencere')) {
                    lightingDetail = "LIGHTING: Natural window light. Soft indoor daylight. Gentle and realistic.";
                } else if (lighting.includes('Dramatik Kontrast')) {
                    lightingDetail = "LIGHTING: High contrast dramatic lighting. Strong shadows and highlights. Bold look.";
                } else if (lighting.includes('Yumuşak Gölgeli')) {
                    lightingDetail = "LIGHTING: Soft shadowed lighting. Gentle diffusion. Low contrast, elegant.";
                }
                
                if (lightingDetail) {
                    prompt += `\n\n${lightingDetail}`;
                }
            }
            
            prompt += `\n\nSUNGLASSES QUALITY FOCUS:
            - FRAME SHARPNESS: Perfect focus on frame design and details
            - LENS CLARITY: Show lens quality, reflections, and tint
            - HINGES/DETAILS: Clear visibility of all hardware elements
            - BRAND/LOGO: If present on frames or lenses, ensure clarity
            - REFLECTIONS: Capture natural reflections on lenses artistically
            - COLOR ACCURACY: True frame and lens colors
            - PROFESSIONAL: High-end eyewear photography standards`;
            
            // CRITICAL: Add size control for sunglasses
            prompt += `\n\n⚠️ CRITICAL SUNGLASSES SIZE CONTROL:
            - INPUT IMAGE REFERENCE: Use the sunglasses size from the INPUT product image as reference
            - MAINTAIN ORIGINAL SIZE: Output sunglasses must match the size in the input image
            - REALISTIC DIMENSIONS: Adult sunglasses frames are approximately 14-15cm wide, 4-5cm tall
            - SCALE REFERENCE: If with model - glasses should fit the model's face naturally
            - DO NOT EXAGGERATE: Sunglasses should not look oversized (like ski goggles) or undersized (like reading glasses)`;
            
            if (!settings.isProductPhotography) {
                prompt += `\n\n📏 SUNGLASSES WITH MODEL SIZE RULES:
                - FACE PROPORTION: Sunglasses should cover roughly 1/3 of the face width
                - NATURAL FIT: Frames should sit naturally on nose and ears - not too large or small
                - REALISTIC SCALE: Sunglasses size should match the model's face proportions`;
            }
            
        } else if (accessoryFraming) {
            // NON-WALLET ACCESSORY HANDLING (original logic)
            // Add accessory-specific framing if applicable
            prompt += `\n\n${accessoryFraming}`;
            
            // Add critical sharpness instruction for accessories
            prompt += `\n\nCRITICAL ACCESSORY SHARPNESS:
            - The accessory (jewelry, watch, bracelet, etc.) must be TACK-SHARP and in PERFECT FOCUS
            - Use macro photography techniques - capture every detail, reflection, and texture
            - Metal surfaces should show clear reflections and highlights
            - Gemstones should sparkle with crisp, defined facets
            - Fabric/leather should show clear texture and grain
            - NO motion blur, NO soft focus, NO haze
            - Professional product photography sharpness standards`;
            
            // Add accessory-specific background style if selected
            if (settings.accessoryBackgroundStyle && !settings.accessoryBackgroundStyle.includes('Otomatik')) {
                const isBracelet = settings.clothingType.toLowerCase().includes('bileklik') || settings.clothingType.toLowerCase().includes('bracelet');
                
                // Convert Turkish background style to detailed prompt
                const bgStyle = settings.accessoryBackgroundStyle;
                let backgroundDetail = "";
                
                if (bgStyle.includes('Açık Mavi') || bgStyle.includes('Light Blue')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID LIGHT BLUE color (#87CEEB to #B0E0E6). Clean, fresh, modern aesthetic. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Bej') || bgStyle.includes('Krem') || bgStyle.includes('Beige')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID BEIGE/CREAM color (#F5F5DC to #E8D7C1). Warm, minimal, elegant aesthetic. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Saf Beyaz') || bgStyle.includes('Pure White')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID WHITE (#FFFFFF). Clean, professional, high-key lighting. CRITICAL: NO gradients, NO patterns - perfectly uniform white. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Pudra Pembe') || bgStyle.includes('Powder Pink')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID POWDER PINK color (#FFD1DC to #FFC0CB). Elegant, feminine, sophisticated aesthetic. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Açık Gri') || bgStyle.includes('Light Gray')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID LIGHT GRAY color (#D3D3D3 to #E5E5E5). Neutral, professional, modern aesthetic. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Mint Yeşili') || bgStyle.includes('Mint Green')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID MINT GREEN color (#98FF98 to #AAF0D1). Fresh, natural, modern aesthetic. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Lavanta') || bgStyle.includes('Lavender')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID LAVENDER color (#E6E6FA to #D8BFD8). Soft purple-pink tone. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color across entire background. Think professional cyclorama backdrop in lavender.";
                } else if (bgStyle.includes('Somon Pembe') || bgStyle.includes('Salmon Pink')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID SALMON PINK color (#FFA07A to #FFB6A3). Warm, vibrant, modern aesthetic. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Açık Ten Rengi') || bgStyle.includes('Light Skin Tone')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID LIGHT SKIN TONE color (#FFE4C4 to #F5DEB3). Natural, minimal, warm aesthetic. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Koyu Mavi') || bgStyle.includes('Dark Blue')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID DARK BLUE color (#00008B to #191970). Sophisticated, deep, elegant aesthetic. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Mermer Beyazı') || bgStyle.includes('Marble White')) {
                    backgroundDetail = "BACKGROUND: White marble surface with subtle gray veining. Luxury, elegant, high-end aesthetic. Natural stone texture with realistic marble pattern.";
                } else if (bgStyle.includes('Siyah') || bgStyle.includes('Black')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID BLACK color (#000000 to #1A1A1A). Dramatic, high contrast, luxury aesthetic. CRITICAL: NO gradients, NO patterns - absolutely uniform black. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Koyu Yeşil') || bgStyle.includes('Dark Green')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID DARK GREEN color (#006400 to #2F4F4F). Classic, rich, elegant aesthetic. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color. Professional cyclorama backdrop.";
                } else if (bgStyle.includes('Bordo') || bgStyle.includes('Burgundy')) {
                    backgroundDetail = "BACKGROUND: PURE SOLID BURGUNDY color (#800020 to #8B0000). Luxury, intimate, warm aesthetic. CRITICAL: NO gradients, NO patterns, NO textures - absolutely uniform solid color. Professional cyclorama backdrop.";
                }
                
                if (isBracelet) {
                    // For bracelets, add strict framing reminder with background style
                    prompt += `\n\n${backgroundDetail}
                    - CRITICAL REMINDER: This is a BRACELET shot. Frame must be TIGHT on wrist/hand/forearm ONLY.
                    - The background should surround the wrist/hand area ONLY. DO NOT include upper body or face in the frame.
                    - Keep the background SOLID COLOR, clean and minimal to maintain focus on the bracelet.
                    - Frame composition: Mid-forearm to fingertips, NO parts above the elbow visible.`;
                } else {
                    prompt += `\n\n${backgroundDetail}`;
                }
            }
            
            // Add accessory-specific pose if selected
            if (settings.accessoryPose && !settings.accessoryPose.includes('Otomatik')) {
                // Special handling for bracelet poses - ensure ONLY arm/wrist is shown, NO FACE
                const isBracelet = settings.clothingType.toLowerCase().includes('bileklik') || settings.clothingType.toLowerCase().includes('bracelet');
                
                if (isBracelet) {
                    let braceletPoseDetail = "";
                    const pose = settings.accessoryPose;
                    
                    if (pose.includes('Zarif El Hareketi') || pose.includes('Parmaklar Kıvrık') || pose.includes('Elegant')) {
                        braceletPoseDetail = `BRACELET POSE - ELEGANT HAND GESTURE (CURVED FINGERS):
                        - Show ONLY the wrist, hand, and forearm (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or any part above the elbow
                        - POSE: Hand raised elegantly with fingers gently curved inward, creating a graceful shape
                        - ANGLE: 3/4 view or side angle to showcase the bracelet from the best angle
                        - FOCUS: Bracelet detail is the hero, elegant curved finger gesture is supporting
                        - BACKGROUND: Solid color or completely blurred - CLEAN and MINIMAL
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else if (pose.includes('Rahat Duruş') || pose.includes('Yan Açı') || pose.includes('Relaxed')) {
                        braceletPoseDetail = `BRACELET POSE - RELAXED SIDE ANGLE:
                        - Show ONLY the wrist, hand, and forearm (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or any part above the elbow
                        - POSE: Arm relaxed and naturally positioned from a side angle, hand resting or gently hanging
                        - ANGLE: Side view (45-90 degrees) to create depth and dimension
                        - FOCUS: Natural, effortless positioning that highlights the bracelet
                        - BACKGROUND: Solid color, soft and minimal, CLEAN aesthetic
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else if (pose.includes('El Yukarıda') || pose.includes('Dikey Duruş') || pose.includes('Hand Up')) {
                        braceletPoseDetail = `BRACELET POSE - HAND RAISED VERTICALLY:
                        - Show ONLY the wrist, hand, and forearm (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or any part above the elbow
                        - POSE: Arm raised vertically with hand pointing upward in a vertical position
                        - ANGLE: Vertical composition showcasing the bracelet on raised wrist
                        - FOCUS: Bracelet on vertical wrist, elegant vertical gesture
                        - BACKGROUND: Solid color, CLEAN and MINIMAL
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else if (pose.includes('El Aşağıda') || pose.includes('Rahat Asılı') || pose.includes('Hand Down')) {
                        braceletPoseDetail = `BRACELET POSE - HAND HANGING DOWN RELAXED:
                        - Show ONLY the wrist, hand, and forearm (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or any part above the elbow
                        - POSE: Arm hanging down naturally in a relaxed position
                        - ANGLE: Straight or slightly angled to show bracelet naturally hanging
                        - FOCUS: Bracelet in its natural resting position on relaxed wrist
                        - BACKGROUND: Solid color, soft and minimal
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else if (pose.includes('Bilek Odaklı') || pose.includes('Yakın Plan') || pose.includes('Wrist Focus')) {
                        braceletPoseDetail = `BRACELET POSE - EXTREME WRIST CLOSE-UP:
                        - Show ONLY the wrist wearing the bracelet in extreme close-up
                        - DO NOT SHOW: Face, shoulders, body, or even full hand if not necessary
                        - POSE: Minimal movement, focus exclusively on bracelet and wrist
                        - ANGLE: Macro-style close-up on bracelet and skin texture
                        - FOCUS: Maximum detail on bracelet craftsmanship and how it sits on wrist
                        - BACKGROUND: Heavily blurred or solid color - ULTRA CLEAN
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame ULTRA-TIGHT on bracelet/wrist only.`;
                    } else if (pose.includes('İki El Yan Yana') || pose.includes('Both Hands')) {
                        braceletPoseDetail = `BRACELET POSE - TWO HANDS SIDE BY SIDE:
                        - Show ONLY both wrists, hands, and forearms (mid-forearms to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or upper arms
                        - POSE: Both hands positioned side by side, parallel or slightly overlapping
                        - ANGLE: Front view or top-down focusing on both wrists together
                        - FOCUS: Showcasing bracelet on one or both wrists in a symmetrical composition
                        - BACKGROUND: Solid color, CLEAN and MINIMAL
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on both wrists/hands only.`;
                    } else if (pose.includes('El Üstte') || pose.includes('Üstten Görünüm') || pose.includes('Top View')) {
                        braceletPoseDetail = `BRACELET POSE - TOP-DOWN VIEW:
                        - Show ONLY the wrist, hand, and forearm from above (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or upper arm
                        - POSE: Hand positioned flat or naturally resting, viewed from directly above
                        - ANGLE: Top-down (bird's eye view) to showcase bracelet from above
                        - FOCUS: Bracelet's top design and how it encircles the wrist
                        - BACKGROUND: Solid color surface or clean table, MINIMAL
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else if (pose.includes('45 Derece Açılı') || pose.includes('45 Degree')) {
                        braceletPoseDetail = `BRACELET POSE - 45 DEGREE ANGLE:
                        - Show ONLY the wrist, hand, and forearm at 45-degree angle (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or upper arm
                        - POSE: Arm positioned at exactly 45-degree angle to show dimension and depth
                        - ANGLE: 45-degree diagonal composition for dynamic visual interest
                        - FOCUS: Showcasing bracelet design from optimal diagonal angle
                        - BACKGROUND: Solid color, soft and MINIMAL
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else if (pose.includes('Yan Profil') || pose.includes('Yandan Görünüm') || pose.includes('Side View')) {
                        braceletPoseDetail = `BRACELET POSE - PURE SIDE PROFILE:
                        - Show ONLY the wrist, hand, and forearm from pure side angle (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or upper arm
                        - POSE: Arm positioned completely sideways (90-degree side view)
                        - ANGLE: Pure side profile to showcase bracelet's side profile and thickness
                        - FOCUS: Bracelet's side view and how it wraps around the wrist
                        - BACKGROUND: Solid color, soft and MINIMAL
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else if (pose.includes('Ön Görünüm') || pose.includes('Tam Karşıdan') || pose.includes('Front View')) {
                        braceletPoseDetail = `BRACELET POSE - STRAIGHT FRONT VIEW:
                        - Show ONLY the wrist, hand, and forearm from straight front (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or upper arm
                        - POSE: Arm extended straight toward camera, frontal composition
                        - ANGLE: Straight-on frontal view to show bracelet face-forward
                        - FOCUS: Bracelet's front design elements and central details
                        - BACKGROUND: Solid color, CLEAN studio aesthetic
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else if (pose.includes('Hafif Hareket') || pose.includes('Dinamik') || pose.includes('Movement')) {
                        braceletPoseDetail = `BRACELET POSE - GENTLE DYNAMIC MOVEMENT:
                        - Show ONLY the wrist, hand, and forearm (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or upper arm
                        - POSE: Hand in gentle mid-motion, slight movement blur to show dynamism
                        - ANGLE: Dynamic angle capturing the natural gesture in motion
                        - FOCUS: Bracelet remains sharp while subtle motion blur adds life to composition
                        - BACKGROUND: Solid color, soft and MINIMAL
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else if (pose.includes('Parmaklar Uzatılmış') || pose.includes('Fingers Extended')) {
                        braceletPoseDetail = `BRACELET POSE - FINGERS FULLY EXTENDED:
                        - Show ONLY the wrist, hand, and forearm (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or any part above the elbow
                        - POSE: Hand with all fingers fully extended and spread apart elegantly
                        - ANGLE: Angle that best shows extended fingers and bracelet together
                        - FOCUS: Bracelet on wrist with elegant extended finger gesture
                        - BACKGROUND: Solid color, CLEAN and MINIMAL
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else if (pose.includes('Yumruk Pozisyonu') || pose.includes('Fist Position')) {
                        braceletPoseDetail = `BRACELET POSE - CLOSED FIST POSITION:
                        - Show ONLY the wrist, hand (in fist), and forearm (mid-forearm to knuckles)
                        - DO NOT SHOW: Face, shoulders, body, or any part above the elbow
                        - POSE: Hand closed in a gentle fist position, showing bracelet on closed wrist
                        - ANGLE: Angle that showcases how bracelet sits on closed fist wrist
                        - FOCUS: Bracelet on contracted wrist, showing fit and design
                        - BACKGROUND: Solid color, soft and MINIMAL
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    } else {
                        // Default bracelet pose with strict framing
                        braceletPoseDetail = `BRACELET POSE - DEFAULT FRAMING:
                        - Show ONLY the wrist, hand, and forearm (mid-forearm to fingertips)
                        - DO NOT SHOW: Face, shoulders, body, or any part above the elbow
                        - POSE: ${pose}
                        - FOCUS: Bracelet detail, elegant hand gesture
                        - BACKGROUND: Soft, minimal
                        - CRITICAL: Ensure ZERO visibility of face or upper body. Frame TIGHTLY on wrist/hand only.`;
                    }
                    
                    prompt += `\n\n${braceletPoseDetail}`;
                } else {
                    // For other accessories, use the original pose instruction
                    prompt += `\n\nACCESSORY POSE INSTRUCTION: ${settings.accessoryPose}. Model should adopt this specific gesture or movement.`;
                }
            }
            
            // Add accessory-specific lighting if selected
            if (settings.accessoryLighting && !settings.accessoryLighting.includes('Otomatik')) {
                let lightingDetail = "";
                const lighting = settings.accessoryLighting;
                
                if (lighting.includes('Yumuşak Doğal') || lighting.includes('Gündüz') || lighting.includes('Natural')) {
                    lightingDetail = "LIGHTING: Soft natural daylight. Gentle, diffused illumination from window or outdoors. Realistic skin tones. Even exposure.";
                } else if (lighting.includes('Parlak Stüdyo') || lighting.includes('Aydınlık') || lighting.includes('Bright Studio')) {
                    lightingDetail = "LIGHTING: Bright studio lighting. High-key, clean, professional. Minimal shadows. Crisp and clear aesthetic.";
                } else if (lighting.includes('Yan Işık') || lighting.includes('Hafif Gölge') || lighting.includes('Side Light')) {
                    lightingDetail = "LIGHTING: Side lighting with subtle shadows. Light coming from 45-90 degrees to the side. Adds dimension and depth. Soft shadows.";
                } else if (lighting.includes('Üstten Işık') || lighting.includes('Soft & Eşit') || lighting.includes('Top Light')) {
                    lightingDetail = "LIGHTING: Top-down soft lighting. Even illumination from above. No harsh shadows. Balanced and professional.";
                } else if (lighting.includes('Önden Işık') || lighting.includes('Net & Düz') || lighting.includes('Front Light')) {
                    lightingDetail = "LIGHTING: Direct frontal lighting. Flat, even illumination. Minimal shadows. Clean and straightforward product photography style.";
                } else if (lighting.includes('Arka Işık') || lighting.includes('Halo Efekti') || lighting.includes('Back Light')) {
                    lightingDetail = "LIGHTING: Backlighting / rim lighting. Light coming from behind creating a subtle halo or edge glow. Adds separation from background.";
                } else if (lighting.includes('Çift Yönlü') || lighting.includes('Dengeli') || lighting.includes('Two-way')) {
                    lightingDetail = "LIGHTING: Dual-direction balanced lighting. Two light sources from different angles creating even, professional illumination. No harsh shadows.";
                } else if (lighting.includes('Altın Saat') || lighting.includes('Sıcak') || lighting.includes('Golden Hour')) {
                    lightingDetail = "LIGHTING: Golden hour warm glow. Sunset-like warm orange-golden light. Romantic and warm atmosphere. Soft shadows.";
                } else if (lighting.includes('Soğuk Işık') || lighting.includes('Modern & Temiz') || lighting.includes('Cool Light')) {
                    lightingDetail = "LIGHTING: Cool white light. Modern, clean, slightly blue-toned. Tech aesthetic. Crisp and sharp.";
                } else if (lighting.includes('Yüksek Kontrastlı') || lighting.includes('Dramatik') || lighting.includes('High Contrast')) {
                    lightingDetail = "LIGHTING: High contrast dramatic lighting. Strong shadows and bright highlights. Bold and striking aesthetic.";
                } else if (lighting.includes('Düşük Kontrastlı') || lighting.includes('Yumuşak') || lighting.includes('Low Contrast')) {
                    lightingDetail = "LIGHTING: Low contrast soft lighting. Gentle shadows, soft highlights. Dreamy and delicate aesthetic.";
                } else if (lighting.includes('Bulutlu Gün') || lighting.includes('Yumuşak Dağınık') || lighting.includes('Cloudy')) {
                    lightingDetail = "LIGHTING: Overcast cloudy day lighting. Extremely soft, diffused natural light. Very gentle shadows. Even and natural.";
                }
                
                if (lightingDetail) {
                    prompt += `\n\n${lightingDetail}`;
                }
            }
        }
    }

    if (settings.aspectRatio.includes('4:5')) prompt += `\n- Composition: Frame for 4:5 vertical portrait.`;
    if (settings.customPrompt) prompt += `\n\nAdditional Instructions: ${settings.customPrompt}`;

    prompt += `\n\nCRITICAL QUALITY REQUIREMENTS:
    - RESOLUTION: Ultra-high resolution, 8K quality, maximum detail preservation
    - SHARPNESS: Perfectly sharp focus, especially on the product/accessory. NO blur, NO soft focus
    - CLARITY: Crystal clear image with high definition. Every texture must be visible
    - DETAIL: Capture every fine detail - fabric texture, metal reflections, skin pores, hair strands
    - PROFESSIONAL: Commercial photography quality. Studio-grade sharpness
    - NOISE: Zero noise, clean image, professional post-processing quality
    - FOCUS: Tack-sharp focus on the main subject (product/accessory). Use shallow depth of field for background if needed
    - LIGHTING: Well-lit with proper exposure. No underexposed or overexposed areas
    - POST-PROCESSING: Apply subtle sharpening and clarity enhancement as if professionally edited`;

    // ⚠️ PRODUCT FIDELITY - En önemli kural: Ürün orijinalliğini koru
    prompt += PRODUCT_FIDELITY_PROMPT;

    if (!isProductPhotography) prompt += ANATOMY_PROMPT;
    
    // For accessories with custom background styles, use solid color rules instead of CLEAN_BACKGROUND_PROMPT
    const isAccessory = isAccessoryProduct(settings.clothingType);
    const hasCustomAccessoryBg = isAccessory && settings.accessoryBackgroundStyle && !settings.accessoryBackgroundStyle.includes('Otomatik');
    
    if (hasCustomAccessoryBg) {
        // For accessories with solid color backgrounds, enforce strict solid color rules
        prompt += `\n\nCRITICAL BACKGROUND RULES FOR SOLID COLOR:
        - The background MUST be a PURE SOLID COLOR with NO gradients, NO patterns, NO textures
        - The color must be CONSISTENT and UNIFORM across the entire background
        - NO environmental elements, NO objects, NO surfaces visible in background
        - Think of it as a professional photography backdrop/cyclorama
        - The ONLY thing visible should be the solid color you specified
        - Use professional color grading to ensure the exact color match`;
    } else {
        // For non-accessory products or auto background, use the standard background rules
        prompt += CLEAN_BACKGROUND_PROMPT;
        
        // Add specific season/weather instructions if provided
        if (!isBoudoirActive && environmentDetails) {
            prompt += `\n\nCRITICAL SEASONAL/WEATHER REQUIREMENTS:`;
            if (settings.season && !settings.season.includes('Seçiniz')) {
                const season = settings.season.toLowerCase();
                if (season.includes('kış') || season.includes('winter')) {
                    prompt += `\n- SEASON: WINTER. The scene MUST show clear winter elements:
                    * Cold atmosphere with visible breath vapor or frost
                    * Winter clothing appropriate (coats, scarves if visible)
                    * Bare trees, snow, ice, or winter landscape if outdoor
                    * Cool color temperature (blue/gray tones)
                    * Overcast sky or winter sunlight (low angle, pale)`;
                } else if (season.includes('yaz') || season.includes('summer')) {
                    prompt += `\n- SEASON: SUMMER. The scene MUST show clear summer elements:
                    * Warm, bright atmosphere
                    * Lush green vegetation, blooming flowers
                    * Bright sunlight, clear blue sky
                    * Warm color temperature (golden/warm tones)`;
                } else if (season.includes('sonbahar') || season.includes('autumn') || season.includes('fall')) {
                    prompt += `\n- SEASON: AUTUMN/FALL. The scene MUST show clear autumn elements:
                    * Orange, red, yellow fallen leaves
                    * Trees with autumn foliage
                    * Cooler atmosphere, softer light
                    * Warm earth tones`;
                } else if (season.includes('ilkbahar') || season.includes('spring')) {
                    prompt += `\n- SEASON: SPRING. The scene MUST show clear spring elements:
                    * Fresh green leaves, blooming flowers
                    * Bright, fresh atmosphere
                    * Soft natural light`;
                }
            }
            if (settings.weather && !settings.weather.includes('Seçiniz')) {
                const weather = settings.weather.toLowerCase();
                if (weather.includes('güneşli') || weather.includes('sunny')) {
                    prompt += `\n- WEATHER: SUNNY. Bright sunlight, clear shadows, blue sky visible.`;
                } else if (weather.includes('bulutlu') || weather.includes('cloudy')) {
                    prompt += `\n- WEATHER: CLOUDY. Overcast sky, soft diffused light, no harsh shadows.`;
                } else if (weather.includes('yağmur') || weather.includes('rain')) {
                    prompt += `\n- WEATHER: RAINY. Wet surfaces, rain drops, umbrellas if appropriate, gray sky.`;
                } else if (weather.includes('kar') || weather.includes('snow')) {
                    prompt += `\n- WEATHER: SNOWY. Falling snow or snow on ground, winter atmosphere.`;
                }
            }
        }
    }

    if (settings.clothingType.toLowerCase().match(/(jartiyer|lingerie|iç giyim|underwear|bikini|swimwear|fantazi)/i)) {
         
         if (isBoudoirActive) {
            
            let lightingInstruction = "";
            const lighting = settings.boudoirLighting || 'Karanlık & Atmosferik (Varsayılan)';

            if (lighting.includes('Aydınlık') || lighting.includes('High-Key')) {
                lightingInstruction = "CRITICAL LIGHTING: HIGH-KEY PHOTOGRAPHY. The image must be BRIGHT, WHITE, and AIRY. Use soft shadows. Exposure +1. Avoid darkness. Pure white tones.";
            } else if (lighting.includes('Altın') || lighting.includes('Golden')) {
                lightingInstruction = "CRITICAL LIGHTING: GOLDEN HOUR. Strong WARM ORANGE sunlight coming from the side. Backlit hair. Romantic warm glow. Lens flare.";
            } else if (lighting.includes('Canlı') || lighting.includes('Vibrant')) {
                lightingInstruction = "CRITICAL LIGHTING: VIBRANT COLOR GEL LIGHTING. High contrast. Saturated colors. Fashion editorial style. Energetic.";
            } else if (lighting.includes('Yumuşak') || lighting.includes('Soft')) {
                lightingInstruction = "CRITICAL LIGHTING: SOFT STUDIO LIGHTING. Large softbox lighting. Even illumination. Minimal contrast. Clean and pure.";
            } else if (lighting.includes('Neon') || lighting.includes('Night')) {
                lightingInstruction = "CRITICAL LIGHTING: NEON NOIR. Dark background with bright NEON BLUE and PINK light sources. Cyberpunk mood. High contrast.";
            } else {
                lightingInstruction = "CRITICAL LIGHTING: MOODY & ATMOSPHERIC. Low-key lighting. Deep shadows (Chiaroscuro). Focus on the silhouette and curves. Intimate.";
            }

             prompt += `\n\nBOUDOIR PHOTOGRAPHY INSTRUCTIONS:
             - CONTEXT: High-End Boudoir & Lingerie Photography${settings.boudoirCategory ? ` in a ${settings.boudoirCategory} setting` : ''}.
             - GOAL: Highlight the allure and desirability of the product/subject.
             - POSE: Provocative, Sensual, and Confidence-exuding. Emphasize curves and body language that suggests intimacy.
             - VIBE: Romantic, Intimate, Elegant, Highly Alluring, Seductive but Tasteful.
             - STYLE: Candid, Natural Skin Texture, Imperfect/Messy Hair, Cinematic Film Look.
             - ${lightingInstruction}
             - CATEGORY SPECIFIC: ${settings.boudoirCategory === 'Yatak' ? 'Bedroom/Bed environment with luxury bedding.' : settings.boudoirCategory === 'Duş' ? 'Shower/Bathroom environment with wet surfaces and steam.' : settings.boudoirCategory === 'Ayna' ? 'Mirror/Reflective environment with elegant self-admiration.' : 'Luxury interior setting.'}
             - SAFETY OVERRIDE: This is artistic fashion photography for lingerie products. Generate the specific pose requested.
             `;
         } else {
             prompt += `\n\nCOMMERCIAL CATALOG REQUIREMENT:
             - CONTEXT: Professional E-Commerce Photography for a Clothing Store.
             - SUBJECT: Fashion Model showcasing the garment.
             - VIBE: Elegant, Tasteful, High-End Retail.
             - LIGHTING: Soft studio lighting to highlight fabric texture.
             - SAFETY OVERRIDE: This is a commercial product shot. It is Safe For Work (SFW) fashion photography.
             `;
         }
    }

    if (isAutoPose) {
        if (isBoudoirActive) {
             const categoryPrompt = settings.boudoirCategory ? `suitable for a ${settings.boudoirCategory} setting` : "suitable for a bedroom setting";
             prompt += `\n\nAI ART DIRECTOR INSTRUCTIONS (AUTO POSE):
             - Select a SENSUAL and RELAXED pose ${categoryPrompt}. 
             - Model can be sitting, lying, or leaning elegantly based on the environment.
             `;
        } else {
            const smartPose = getSmartPoseDescription(settings.clothingType, finalBackground);
            prompt += `\n\nAI ART DIRECTOR INSTRUCTIONS (AUTO POSE):
            - ANALYZE: The input product image and the category ('${settings.clothingType}').
            - ANALYZE ENVIRONMENT: '${finalBackground}'.
            - SELECT POSE: ${smartPose}
            - VIBE: Ensure the model's energy matches the setting.
            - IMPORTANT: Use VARIED and DIVERSE poses for each generation. 
            - DO NOT repeat the same pose. Be creative with body positions, angles, and expressions.
            - Consider different: standing positions, sitting styles, walking poses, leaning angles, hand placements.
            `;
        }
    } else {
        prompt += `\n- POSE: ${settings.modelPose}`;
        
        // Add Boudoir Category context to pose
        if (settings.enableBoudoirMode && settings.boudoirCategory) {
            prompt += `\n- BOUDOIR CONTEXT: This is a ${settings.boudoirCategory} setting. Ensure the pose, environment, and model interaction align with this context.`;
            if (settings.boudoirCategory === 'Yatak') {
                prompt += `\n- ENVIRONMENT INTERACTION: Model should be positioned on/in a luxury bed with silk sheets. Consider lying, sitting, or leaning poses that naturally fit a bedroom setting.`;
            } else if (settings.boudoirCategory === 'Duş') {
                prompt += `\n- ENVIRONMENT INTERACTION: Model should be in a luxury shower environment. Glass walls, water droplets, steam atmosphere. Wet skin and hair are essential.`;
            } else if (settings.boudoirCategory === 'Ayna') {
                prompt += `\n- ENVIRONMENT INTERACTION: Model should be positioned near/against a large mirror. Consider reflection, self-admiration poses.`;
            }
        }
        
        // Add Boudoir Camera Angle
        if (settings.enableBoudoirMode && settings.boudoirCameraAngle && !settings.boudoirCameraAngle.includes('Otomatik')) {
            let cameraAngleInstruction = "";
            const angle = settings.boudoirCameraAngle;
            
            if (angle.includes('Göz Hizası') || angle.includes('Eye Level')) {
                cameraAngleInstruction = "CAMERA ANGLE: Eye level. Direct, intimate connection with the viewer. Natural perspective.";
            } else if (angle.includes('Üstten') || angle.includes('High Angle') || angle.includes('Top Down')) {
                cameraAngleInstruction = "CAMERA ANGLE: High angle / Top down view. Looking down at the subject. Creates vulnerability and intimacy.";
            } else if (angle.includes('Alçak') || angle.includes('Low Angle')) {
                cameraAngleInstruction = "CAMERA ANGLE: Low angle. Camera positioned below eye level looking up. Creates power and dominance.";
            } else if (angle.includes('Kuş Bakışı') || angle.includes('Bird\'s Eye')) {
                cameraAngleInstruction = "CAMERA ANGLE: Bird's eye view. Directly above the subject. Artistic, editorial style.";
            } else if (angle.includes('Yakın Plan') || angle.includes('Close-Up')) {
                cameraAngleInstruction = "CAMERA ANGLE: Extreme close-up. Fill the frame with the subject. Focus on details, textures, and intimate features.";
            } else if (angle.includes('Yandan') || angle.includes('Side Profile')) {
                cameraAngleInstruction = "CAMERA ANGLE: Side profile. 90-degree angle showing the silhouette. Emphasizes curves and body shape.";
            } else if (angle.includes('Arkadan') || angle.includes('Back View')) {
                cameraAngleInstruction = "CAMERA ANGLE: Rear view. Model facing away from camera. Focus on back, shoulders, and curves from behind.";
            } else if (angle.includes('45°') || angle.includes('Dutch Angle')) {
                cameraAngleInstruction = "CAMERA ANGLE: Dutch angle / Tilted. Camera rotated 45 degrees. Creates dynamic, artistic, slightly disorienting effect.";
            }
            
            if (cameraAngleInstruction) {
                prompt += `\n- ${cameraAngleInstruction}`;
            }
        }
        
        const isCloseUp = settings.modelPose.includes('Yakın Çekim') || settings.modelPose.includes('Close-Up') || settings.modelPose.includes('Detay') || settings.modelPose.includes('Odaklı');
        const isHipFocused = settings.modelPose.includes('Kalça') || settings.modelPose.includes('Hips') || settings.modelPose.includes('Hip');
        const isWetOrSweaty = settings.enableWetLook || settings.modelPose.match(/(Islak|Wet|Terli|Sweaty|Duş|Shower|Buhar|Steam|Pressed against glass)/i);
        
        if (isHipFocused) {
             prompt += `\n- CRITICAL COMPOSITION: The HIPS (Glutes/Bottom) must be the MAIN FOCAL POINT and CENTERED in the frame.`;
             prompt += `\n- FRAMING: Close-up or Medium-Close-up. Do not show the full head if it distracts from the hips. Focus on the curves.`;
             prompt += `\n- ANGLE: Use a flattering angle (often slightly low angle or eye level) to emphasize the shape.`;
             prompt += `\n- VIBE: Sensual, alluring, emphasizing the fit of the lingerie/garment on the hips.`;
        } else if (isCloseUp) {
            prompt += `\n- FRAMING: CLOSE-UP SHOT. Focus intensely on the details specified in the pose (e.g. face, shoulder, waist, or legs). Narrow field of view. Do not show full body if the pose asks for detail.`;
        }
        
        if (isWetOrSweaty) {
            prompt += `\n- TEXTURE MODIFIER (WET/SWEATY LOOK):
            1. SKIN: Generate realistic WET or SWEATY skin texture with visible water droplets and glistening highlights (high specular reflection).
            2. HAIR: Model's hair MUST look damp, wet, or messy as if sweaty/showered.
            3. ATMOSPHERE: If shower is mentioned, add subtle steam/fog. If outdoors/bed, ensure the skin looks intensely hydrated or sweaty.
            4. VIBE: Cinematic, Intense, Sensual.
            ${(settings.boudoirCategory === 'Duş' || settings.modelPose.includes('Duş')) ? '- ENVIRONMENT CONTEXT: Inside a luxury shower stall with glass walls or tiling. Water flowing.' : ''}
            `;
        }

        if (settings.modelPose.includes('cama yaslanmış') || settings.modelPose.includes('Pressed against glass') || settings.modelPose.includes('Arkası dönük') || settings.modelPose.includes('Back view')) {
            prompt += `\n- CRITICAL POSE INSTRUCTION: STRICT REAR VIEW. The model must be facing COMPLETELY AWAY from the camera.
            - FORBIDDEN: Do NOT show the face, chest, or front of the body.
            - ACTION: ${settings.modelPose}
            - DYNAMICS: Use a "sensual" and "dynamic" pose (e.g., arching back, weight on one leg).
            - CAMERA ANGLE: From behind.`;
            
            if (settings.modelPose.includes('cama yaslanmış') || settings.modelPose.includes('Pressed against glass')) {
                 prompt += ` Shot THROUGH the wet glass.`;
            }
        }
    }

    // Final bracelet framing reminder
    const isBraceletProduct = settings.clothingType.toLowerCase().includes('bileklik') || settings.clothingType.toLowerCase().includes('bracelet');
    if (isBraceletProduct && accessoryFraming) {
        prompt += `\n\n⚠️ FINAL CRITICAL REMINDER FOR BRACELET PHOTOGRAPHY:
        - FRAME COMPOSITION: Show ONLY wrist, hand, and forearm (mid-forearm to fingertips).
        - ABSOLUTELY FORBIDDEN: Face, head, shoulders, chest, upper body, or any part above the elbow MUST NOT be visible in the frame.
        - TIGHT CROP: Crop the image tightly around the wrist/hand area. Do not leave space for upper body to appear.
        - BACKGROUND: Keep background soft and blurred to avoid any distracting elements that might include body parts.
        - FINAL CHECK: Before finalizing the image, ensure that NO facial features, NO shoulders, NO upper body parts are visible.
        - This is a PRODUCT SHOT for a bracelet - only the relevant body parts (arm/wrist/hand) should be in frame.`;
    }

    prompt += `\n\nSTYLE GUIDE:
    - Professional Fashion Catalog Photography.
    - Elegant, Artistic, and High-Class aesthetic.
    - Suitable for mainstream fashion advertising.
    `;

    parts.push({ text: prompt });

    const config: any = {
        imageConfig: {
            aspectRatio: getAspectRatio(settings.aspectRatio),
        },
        safetySettings: SAFETY_SETTINGS,
        generationConfig: {
            temperature: 0.4, // Lower temperature for more consistent, detailed results
        }
    };

    // Always use highest quality for Pro model
    if (modelName === 'gemini-3-pro-image-preview') {
         config.imageConfig.imageSize = '2K'; // Always 2K for maximum sharpness
    }

    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: config
    });

    const imageData = extractImageFromResponse(response);
    if (imageData) return imageData;

    throw new Error("No image generated by Gemini. Please try again.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    if (error.status === 429 || error.code === 429 || error.message?.includes('429')) {
        throw new Error("Kota aşıldı (429). Lütfen API anahtarınızı kontrol edin.");
    }
    if (error.message?.includes('Safety')) {
        throw new Error("Güvenlik filtresi tetiklendi (Safety Block). Lütfen farklı bir açı veya poz deneyin.");
    }
    if (error.message?.includes('500')) {
        throw new Error("Sunucu hatası (500). Görsel çok karmaşık olabilir veya servis yoğun.");
    }
    throw error;
  }
};

export const generateVirtualTryOn = async (
    modelImage: File,
    garmentImage: File,
    garmentImage2: File | null,
    garmentImage3: File | null,
    settings: TryOnSettings,
    additionalGarments?: File[] // Yeni: 4+ kıyafet için
  ): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const useProModel = settings.modelQuality.includes('Pro') || settings.modelQuality.includes('Nano');
        const modelName = useProModel
            ? 'gemini-3-pro-image-preview'
            : 'gemini-2.5-flash-image';

      console.log(`Generating Virtual Try-On with model: ${modelName}`);

      // Tüm kıyafetleri topla
      const allGarments: File[] = [garmentImage];
      if (garmentImage2) allGarments.push(garmentImage2);
      if (garmentImage3) allGarments.push(garmentImage3);
      if (additionalGarments && additionalGarments.length > 0) {
          allGarments.push(...additionalGarments);
      }

      console.log(`📦 Toplam kıyafet sayısı: ${allGarments.length}`);

      // Tüm görselleri işle
      const imagePromises = [
          processImageForGemini(modelImage),
          ...allGarments.map(g => processImageForGemini(g))
      ];

      const results = await Promise.all(imagePromises);
      const processedModel = results[0];
      const processedGarments = results.slice(1);

      const parts: any[] = [];

      // Model görseli (Image 1)
      parts.push({
          inlineData: {
              data: processedModel.base64,
              mimeType: processedModel.mimeType
          }
      });

      // Tüm kıyafet görselleri (Image 2, 3, 4, 5, ...)
      for (const garment of processedGarments) {
          parts.push({
              inlineData: {
                  data: garment.base64,
                  mimeType: garment.mimeType
              }
          });
      }

      console.log(`🖼️ Parts array: 1 model + ${processedGarments.length} kıyafet = ${parts.length} görsel`);

      let prompt = "";
      
      const isOriginalPose = settings.pose.includes('Orijinal');
      const isAutoPose = settings.pose.includes('Seçiniz') || settings.pose.includes('Otomatik');
      const isOriginalBG = settings.background === 'original';
      const isAutoBG = settings.background === 'auto' || settings.background.includes('Seçiniz');

      let finalTryOnBG = "";
      if (settings.theme && settings.sceneVariation && settings.sceneVariation !== 'auto') {
          const themeVariations = AD_THEME_VARIATIONS[settings.theme] || [];
          const selectedVariation = themeVariations.find(v => v.id === settings.sceneVariation);
          if (selectedVariation) {
              finalTryOnBG = selectedVariation.prompt;
          } else {
              finalTryOnBG = isAutoBG ? getAutoBackground(settings.category) : settings.background;
          }
      } else if (settings.theme && settings.sceneVariation === 'auto') {
          const themeVariations = AD_THEME_VARIATIONS[settings.theme] || [];
          if (themeVariations.length > 0) {
              const randomVariation = themeVariations[Math.floor(Math.random() * themeVariations.length)];
              finalTryOnBG = randomVariation.prompt;
          } else {
              finalTryOnBG = isAutoBG ? getAutoBackground(settings.category) : settings.background;
          }
      } else {
          finalTryOnBG = isAutoBG ? getAutoBackground(settings.category) : settings.background;
      }
      
      const shouldUseOriginalBG = isOriginalBG && !isAutoBG;

      const qualityPrompts = `
        Quality Requirements:
        - Output Resolution: 8K, Ultra HD, Photorealistic.
        - Output Aspect Ratio: ${settings.aspectRatio}.

        ${PRODUCT_FIDELITY_PROMPT}
      `;

      // Artık processedGarments array'ini kullan
      const garmentCount = processedGarments.length;
      console.log(`👔 Kıyafet sayısı: ${garmentCount}`);

      // Görsel haritası oluştur
      let imageMapDescription = 'IMAGE 1 = MODEL (reference person)\n';
      for (let i = 0; i < garmentCount; i++) {
          imageMapDescription += `IMAGE ${i + 2} = GARMENT ${i + 1}\n`;
      }

      const productFidelityInstructions = `
          ⚠️ CRITICAL PRODUCT PRESERVATION RULES (ABSOLUTE HIGHEST PRIORITY) ⚠️:

          📋 IMAGE MAP - ${garmentCount} GARMENTS TO DRESS:
          ${imageMapDescription}

          1. ${garmentCount === 1 ? 'GARMENT TRANSFER' : 'MULTIPLE GARMENTS'}: You have EXACTLY ${garmentCount} garment(s) to apply:
${Array.from({length: garmentCount}, (_, i) => `             - Image ${i + 2}: Garment ${i + 1}`).join('\n')}
             ALL ${garmentCount} garments MUST be worn by the model simultaneously with PERFECT ACCURACY.

          👔👔👔 CRITICAL JACKET RULE - HIGHEST PRIORITY 👔👔👔
          If ANY of the garment images contains a JACKET, BLAZER, COAT, or SUIT JACKET:
          - The model MUST WEAR the jacket!
          - The jacket MUST be worn OVER the shirt!
          - DO NOT SKIP the jacket!
          - DO NOT IGNORE the jacket!
          - The jacket can be open or closed, but it MUST BE VISIBLE AND WORN!
          - Analyze each image: if it looks like outerwear → PUT IT ON THE MODEL!
          👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔👔

          ⚠️ STRICT CLOTHING LIMITATION ⚠️:
          - The model should wear ALL ${garmentCount} garment(s) provided in the images.
          - Do NOT skip ANY garment - especially JACKETS!
          - Do NOT add any additional clothing items not in the images.
          - Do NOT invent or generate new clothing items.
          - If a body part is not covered by the provided garments, leave it as is.

          2. EXACT REPLICATION FOR EACH GARMENT:
             - SAME COLOR (exact shade, no variations)
             - SAME PATTERN (if any patterns/prints exist, replicate them precisely)
             - SAME TEXTURE (fabric type must be identical)
             - SAME STYLE DETAILS (buttons, zippers, pockets, collars, cuffs - everything must match)
          3. STRUCTURAL INTEGRITY FOR EACH GARMENT:
             - Sleeve length MUST match exactly (long sleeves stay long, short sleeves stay short)
             - Neckline MUST match exactly (V-neck stays V-neck, crew neck stays crew neck, etc.)
             - Hemline/Length MUST match exactly (cropped stays cropped, long stays long)
             - Fit/Silhouette MUST match (oversized stays oversized, fitted stays fitted)
          4. VISIBILITY: ALL garments MUST be FULLY VISIBLE on the model. Do NOT hide or obscure any part.
          5. NO MODIFICATIONS: Do NOT add, remove, or alter ANY design elements from ANY garment.
          6. LAYERING: Layer naturally - JACKET OVER SHIRT, pants on bottom, shoes on feet.
          7. TREAT ALL GARMENT IMAGES AS ABSOLUTE TRUTH: Replicate them EXACTLY.

          ❌ FORBIDDEN:
          - SKIPPING THE JACKET (if provided)!
          - Changing colors, patterns, lengths, styles of ANY garment.
          - Adding extra clothing items not provided in the images.

          ✅ REQUIRED:
          - Perfect 1:1 replication of ALL ${garmentCount} provided garment(s) onto the model.
          - If JACKET is in the images → JACKET MUST BE WORN!
          - NO garment should be skipped or ignored.
      `;

      let atmospherePrompt = "";
      if (settings.season && !settings.season.includes('Seçiniz') && !settings.season.includes('Otomatik')) {
          atmospherePrompt += `\n- SEASON: ${settings.season}. Adjust lighting, colors, and atmosphere to match this season.`;
      }
      if (settings.weather && !settings.weather.includes('Seçiniz') && !settings.weather.includes('Otomatik')) {
          atmospherePrompt += `\n- WEATHER: ${settings.weather}. Ensure lighting and environmental conditions reflect this weather.`;
      }

      if (isOriginalPose && shouldUseOriginalBG) {
         const isOuterwear = settings.category.toLowerCase().includes('ceket') || 
                            settings.category.toLowerCase().includes('mont') || 
                            settings.category.toLowerCase().includes('kaban') ||
                            settings.category.toLowerCase().includes('jacket') ||
                            settings.category.toLowerCase().includes('coat') ||
                            settings.category.toLowerCase().includes('blazer') ||
                            settings.category.toLowerCase().includes('üst giyim');
         
         prompt = `Virtual Try-On Task.
          Goal: Digitally dress the person from Image 1 with ONLY the ${garmentCount} clothing item(s) from ${garmentCount > 1 ? `Images 2-${garmentCount + 1}` : 'Image 2'}.

          🔒 TUTARLILIK KURALLARI - MUTLAKA UYGULA 🔒

          1. KİMLİK KORUMA (Image 1'deki kişi):
             - AYNI kişiyi kullan - yüz, ten rengi, saç rengi/stili, vücut tipi
             - Farklı bir kişi/manken üretme
             - Yüz hatlarını, göz rengini, cilt tonunu değiştirme

          2. POZ VE VÜCUT KORUMA:
             - Pozu DEĞİŞTİRME - orijinal pozisyon korunacak
             - Vücut oranlarını, boyunu, yapısını koru
             - Kol, bacak, el, ayak pozisyonlarını değiştirme
             - Baş açısını, yüz ifadesini koru
             - Hiçbir vücut parçasını uzatma/kısaltma/bozma

          3. ARKA PLAN KORUMA: Orijinal arka planı AYNEN koru.

          4. KIYAFETKısıtlama: SADECE verilen ${garmentCount} ürünü giydirmeli. Başka kıyafet ekleme.
          
          ${productFidelityInstructions}
          ${isOuterwear ? `
          ⚠️ OUTERWEAR VISIBILITY RULE ⚠️:
          - The garment from Image 2 is a JACKET/COAT/OUTERWEAR.
          - It MUST be FULLY VISIBLE on the model as the OUTERMOST layer.
          - Do NOT hide it under other clothing or crop it out of frame.
          - Ensure the ENTIRE garment is shown from collar/neckline to hem.
          ` : ''}
          ${atmospherePrompt}
          ${qualityPrompts}`;
      } 
      else {
          let poseInstruction = "";
          if (isAutoPose) {
             poseInstruction = `AUTO-POSE: ${getSmartPoseDescription(settings.category, finalTryOnBG)}
             
             ⚠️ POSE STABILITY RULES ⚠️:
             - Use a natural, balanced, and STABLE pose.
             - Do NOT use extreme angles or awkward positions.
             - Body proportions must remain NATURAL and REALISTIC.
             - All ${garmentCount} garment(s) must be clearly visible in the chosen pose.`;
          } else if (isOriginalPose) {
             poseInstruction = `Keep original pose EXACTLY. Do NOT modify body position, limb placement, or stance AT ALL.`;
          } else {
             poseInstruction = `CHANGE the pose to: ${settings.pose}.
             
             ⚠️ POSE STABILITY RULES ⚠️:
             - Execute the requested pose naturally and realistically.
             - Do NOT distort body proportions or create awkward positions.
             - All ${garmentCount} garment(s) must be clearly visible in this pose.
             - Maintain natural body mechanics and balance.`;
          }

          prompt = `High-Fashion Virtual Photo Shoot Task.
          Goal: Create a fashion image with the person from Image 1 wearing ONLY the ${garmentCount} garment(s) from ${garmentCount > 1 ? `Images 2-${garmentCount + 1}` : 'Image 2'}.

          🔒 TUTARLILIK KURALLARI - MUTLAKA UYGULA 🔒

          1. KİMLİK KORUMA (Image 1'deki kişi):
             - Image 1'deki AYNI kişiyi kullan
             - Yüz, ten rengi, saç rengi/stili, vücut tipi AYNI kalmalı
             - Farklı bir kişi/manken üretme
             - Yüz hatlarını, göz rengini, cilt tonunu değiştirme

          2. KIYAFETKısıtlama:
             - SADECE verilen ${garmentCount} ürünü giydirmeli
             - Ek kıyafet ekleme (gömlek, pantolon vb.)
             - Mevcut olmayan kıyafet icat etme

          3. SEÇİLEN AYARLARI UYGULA:
             - Seçilen pozu kullan
             - Seçilen arka planı kullan
             - Bunların dışına çıkma

          ${productFidelityInstructions}
          TRANSFORMATION INSTRUCTIONS:
          1. POSE: ${poseInstruction}
          2. BACKGROUND: ${shouldUseOriginalBG ? 'Keep original background.' : `CHANGE the background to: ${finalTryOnBG}.`}
          3. IDENTITY: Image 1'deki kişiyi AYNEN kullan - yüz, ten, saç, vücut.
          4. BODY INTEGRITY: Vücut oranlarını bozma, uzatma, kısaltma yapma.
          5. CLOTHING RESTRICTION: Use ONLY the provided ${garmentCount} garment(s). NO additional items.
          ${atmospherePrompt}
          ${qualityPrompts}`;

          const isNecklace = settings.category.toLowerCase().includes('kolye');
          const isBag = settings.category.toLowerCase().includes('çanta');
          const isOuterwear = settings.category.toLowerCase().includes('ceket') || 
                             settings.category.toLowerCase().includes('mont') || 
                             settings.category.toLowerCase().includes('kaban') ||
                             settings.category.toLowerCase().includes('jacket') ||
                             settings.category.toLowerCase().includes('coat') ||
                             settings.category.toLowerCase().includes('blazer') ||
                             settings.category.toLowerCase().includes('üst giyim');
          
          if (isNecklace) prompt += `\nCRITICAL FRAMING: Upper Body Portrait (Chest Up).`;
          else if (isBag) prompt += `\nCRITICAL FRAMING: Ensure bag is held/worn clearly.`;
          else if (isOuterwear) {
              prompt += `\n
              ⚠️ CRITICAL OUTERWEAR VISIBILITY RULES ⚠️:
              - This is a JACKET/COAT/OUTERWEAR garment from Image 2.
              - The ENTIRE garment MUST be visible on the model.
              - Use a camera angle that shows the FULL BODY or at least from HEAD TO WAIST.
              - NEVER use extreme low angles or close-ups that hide the jacket.
              - The jacket/coat MUST be WORN and FULLY VISIBLE - do NOT hide it under other layers.
              - If the garment is a jacket, it should be the OUTERMOST layer and clearly visible.
              - Framing: Full body shot or 3/4 body shot to ensure complete garment visibility.
              `;
          }
      }
  
      if (settings.description) prompt += `\nAdditional Instructions: ${settings.description}`;
      if (settings.aspectRatio.includes('4:5')) prompt += `\nOutput Composition: 4:5 vertical portrait.`;

      prompt += ANATOMY_PROMPT;
      prompt += CLEAN_BACKGROUND_PROMPT;
      prompt += `\n\nIdentity-Lock`;

      // Final jacket reminder (sandwich technique)
      if (garmentCount > 1) {
          prompt += `

🚨🚨🚨 FINAL REMINDER - CHECK ALL GARMENTS 🚨🚨🚨
You have ${garmentCount} garments to dress the model with.
BEFORE GENERATING, VERIFY:
✅ Is the model wearing ALL ${garmentCount} garments?
✅ If there's a JACKET/BLAZER → Is it WORN over the shirt?
✅ Is EVERY garment from the input images visible?

⛔ DO NOT generate if ANY garment is missing!
⛔ If JACKET provided → JACKET MUST BE WORN!

OUTPUT = Model wearing ALL ${garmentCount} garments (including jacket if provided!)
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
`;
      }

      parts.push({ text: prompt });
  
      const config: any = {
        imageConfig: {
            aspectRatio: getAspectRatio(settings.aspectRatio), 
        },
        safetySettings: SAFETY_SETTINGS
      };

      if (modelName === 'gemini-3-pro-image-preview') {
            config.imageConfig.imageSize = settings.resolution.includes('2K') ? '2K' : '1K';
      }
  
      const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: config
      });

      // Debug: Log response structure
      console.log('🔍 Try-On Response:', {
          hasCandidates: !!response?.candidates,
          candidateCount: response?.candidates?.length,
          finishReason: response?.candidates?.[0]?.finishReason,
          hasContent: !!response?.candidates?.[0]?.content,
          partsCount: response?.candidates?.[0]?.content?.parts?.length
      });

      const imageData = extractImageFromResponse(response);
      if (imageData) return imageData;

      // More detailed error
      const finishReason = response?.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
          throw new Error("Güvenlik filtresi tetiklendi. Farklı görseller deneyin.");
      }
      if (finishReason === 'MAX_TOKENS') {
          throw new Error("Prompt çok uzun. Daha az görsel deneyin.");
      }

      throw new Error(`No image generated by Gemini for Try-On. Reason: ${finishReason || 'unknown'}`);
  
    } catch (error: any) {
      console.error("Gemini Try-On Error:", error);
      if (error.status === 429 || error.code === 429 || error.message?.includes('429')) {
        throw new Error("Kota aşıldı (429). Lütfen API anahtarınızı kontrol edin.");
      }
      if (error.message?.includes('Safety')) throw error;
      throw new Error("Sanal kabin hatası. Lütfen görselleri kontrol edip tekrar deneyin.");
    }
  };

const generateSmartAdCopy = async (
    base64: string, 
    mimeType: string, 
    productUrl: string, 
    theme: string
): Promise<AdCopy[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const model = 'gemini-2.5-flash';

    console.log("Generating Smart Ad Copy (Multiple Variations) with Gemini 2.5 Flash...");
    
    const contextPrompt = `
    ROLE: Expert Neuromarketing Copywriter.
    TASK: Analyze the product image${productUrl ? ` and the provided product link context: "${productUrl}"` : ""}.
    GOAL: Write 5 DISTINCT, VARIETY-FILLED ad copy sets in TURKISH.
    THEME: ${theme}
    
    NEUROMARKETING RULES:
    1. FORBIDDEN PHRASES: Do NOT use "Sınırlı Stok", "Acele Et", "Tükeniyor", "Hemen Al", "Kaçırma". These are cheap and banned.
    2. USE PSYCHOLOGICAL TRIGGERS:
       - Status/Prestige ("You deserve the best", "Elite choice")
       - Emotional Payoff ("Feel the difference", "Love yourself", "Confidence booster")
       - Curiosity ("The secret to...", "Discover why...")
       - Social Belonging ("Join the trend")
       - Future Self ("The new you starts here")
    
    INSTRUCTIONS:
    1. VARIETY IS KEY: Each of the 5 sets must use a DIFFERENT psychological trigger from the list above.
    2. TEXT MUST CHANGE: Do not repeat the same headlines.
    3. KEEP IT MINIMAL: Use short, punchy, elegant words. Avoid long sentences.
    4. OUTPUT: Return a JSON Array of 5 objects.
    `;

    const adCopySchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING, description: "Catchy headline (max 5 words) in Turkish. High impact." },
                subHeadline: { type: Type.STRING, description: "Persuasive sub-headline (max 8 words) in Turkish. Emotional." },
                cta: { type: Type.STRING, description: "Button text (max 3 words) in Turkish. E.g. 'Keşfet', 'İncele', 'Tarzını Seç'." },
                designStyle: { type: Type.STRING, description: "Brief design note." }
            },
            required: ["headline", "subHeadline", "cta", "designStyle"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { data: base64, mimeType: mimeType } },
                    { text: contextPrompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: adCopySchema,
                temperature: 0.9,
                safetySettings: SAFETY_SETTINGS
            }
        });
        
        const jsonText = safeGetText(response) || "[]";
        let parsed = JSON.parse(jsonText);
        
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return [{
                 headline: "YENİ SEN",
                 subHeadline: "TARZINI YANSIT",
                 cta: "KEŞFET",
                 colorHex: "Modern"
            }];
        }
        
        return parsed.map(p => ({
            headline: p.headline,
            subHeadline: p.subHeadline,
            cta: p.cta,
            colorHex: p.designStyle || "Modern"
        }));

    } catch (e) {
        console.error("Smart Copy Failed, using fallback.", e);
        return [{
            headline: "FIRSATI YAKALA",
            subHeadline: "YENİ SEZON ÜRÜNLERİ",
            cta: "ALIŞVERİŞ YAP",
            colorHex: "Classic Style"
        }];
    }
};

export const generateAdCreative = async (
    productImage: File,
    settings: AdSettings
): Promise<AdCreativeResult[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let { base64, mimeType } = await processImageForGemini(productImage);

    const preferredModel = 'gemini-3-pro-image-preview';
    
    let ratio = '1:1';
    if (settings.platform.includes('9:16')) ratio = '9:16';
    if (settings.platform.includes('4:5')) ratio = '3:4'; 
    if (settings.platform.includes('16:9')) ratio = '16:9';

    let promptsToUse: string[] = [];

    // Handle Stüdyo (Studio) theme with background style + color picker
    if (settings.theme === 'Stüdyo (Studio)' && settings.studioStyle) {
        const bgStyleDesc = BACKGROUND_STYLE_DESCRIPTIONS[settings.studioStyle] || BACKGROUND_STYLE_DESCRIPTIONS['solid'];
        const bgInfo = MENS_FASHION_BACKGROUNDS.find(bg => bg.id === settings.studioColor);
        const bgHex = bgInfo?.hex || '#FFFFFF';
        const bgName = bgInfo?.name || 'Beyaz';

        const selectedStyleObj = MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === settings.studioStyle);
        let studioPrompt = '';

        if (selectedStyleObj?.supportsColor) {
            studioPrompt = `Professional fashion photography studio. Background: ${bgStyleDesc}. Background color: ${bgName} (${bgHex}). High-end advertising photography setup. Ultrarealistic, 8K resolution.`;
        } else {
            studioPrompt = `Professional fashion photography studio. Background: ${bgStyleDesc}. High-end advertising photography setup. Ultrarealistic, 8K resolution.`;
        }

        promptsToUse = Array(settings.numberOfImages).fill(studioPrompt);
        console.log('📸 STÜDYO STİLİ SEÇİLDİ:', settings.studioStyle, '- Renk:', bgName, bgHex);
    }

    if (promptsToUse.length === 0 && settings.specificVariationId && settings.specificVariationId !== 'auto') {
        const themeVariations = AD_THEME_VARIATIONS[settings.theme];
        const selected = themeVariations?.find(v => v.id === settings.specificVariationId);

        if (selected) {
            promptsToUse = Array(settings.numberOfImages).fill(selected.prompt);
        }
    }

    if (promptsToUse.length === 0) {
        const themeVariations = AD_THEME_VARIATIONS[settings.theme] || AD_THEME_VARIATIONS['Minimalist Modern (Temiz)'];
        promptsToUse = themeVariations.slice(0, settings.numberOfImages).map(v => v.prompt);
        while (promptsToUse.length < settings.numberOfImages) {
            promptsToUse = promptsToUse.concat(promptsToUse);
        }
        promptsToUse = promptsToUse.slice(0, settings.numberOfImages);
    }
    
    const copyList = await generateSmartAdCopy(base64, mimeType, settings.productUrl || "", settings.theme);

    const fontStyles = [
        "Modern Minimalist Sans-Serif (Clean, Thin lines)",
        "Bold Editorial Sans-Serif (Heavy, Impactful, Vogue style)",
        "Elegant Luxury Serif (High Contrast, Classic)",
        "Handwritten / Signature Script (Personal, Organic, Stylish)",
        "Futuristic / Tech (Wide, Geometric, Sans-Serif)",
        "Vintage / Retro Serif (Classic 70s vibe, Bold)",
        "Art Deco (Decorative, Luxury Gold)",
        "Urban / Street (Graffiti or Stencil inspired)",
        "High-End Magazine (Didot or Bodoni style)",
        "Clean Geometric (Futura style, perfectly round Os)"
    ];

    const getFontPrompt = (selected: string, index: number): string => {
        if (!selected || selected.includes('Seçiniz') || selected.includes('Otomatik')) {
            return fontStyles[index % fontStyles.length];
        }
        if (selected.includes('Modern')) return "Modern Minimalist Sans-Serif (Clean, Thin lines)";
        if (selected.includes('Lüks')) return "Elegant Luxury Serif (High Contrast, Classic)";
        if (selected.includes('Kalın')) return "Bold Editorial Sans-Serif (Heavy, Impactful)";
        if (selected.includes('El Yazısı')) return "Handwritten / Signature Script (Personal, Organic, Stylish)";
        if (selected.includes('Futuristik')) return "Futuristic / Tech (Wide, Geometric, Sans-Serif)";
        if (selected.includes('Vintage')) return "Vintage / Retro Serif (Classic 70s vibe, Bold)";
        if (selected.includes('Sokak')) return "Urban / Street (Graffiti or Stencil inspired)";
        if (selected.includes('Dergi')) return "High-End Magazine (Didot or Bodoni style)";
        return fontStyles[index % fontStyles.length];
    };

    const generateSingleImage = async (backgroundConcept: string, index: number): Promise<AdCreativeResult> => {
        const copy = copyList[index % copyList.length];
        const fontStyle = getFontPrompt(settings.fontStyle, index);

        let poseInstruction = "";
        if (settings.pose && !settings.pose.includes('Seçiniz')) {
            poseInstruction = `POSE INSTRUCTION: Reshape the subject/model into this pose: "${settings.pose}". Ensure the pose interacts naturally with the environment.`;
        } else {
            poseInstruction = "POSE: Select a confident, high-fashion pose that fits the advertising theme.";
        }

        let environmentExtras = "";
        if (settings.season && !settings.season.includes('Seçiniz')) {
            let seasonConcept = "";
            if (settings.season === 'İlkbahar') seasonConcept = "Spring season, blooming nature, fresh green atmosphere, floral touches";
            else if (settings.season === 'Yaz') seasonConcept = "Summer season, bright high-contrast sunlight, vibrant colors, warm atmosphere";
            else if (settings.season === 'Sonbahar') seasonConcept = "Autumn season aesthetic. Colors: Warm browns, deep oranges, beige. Lighting: Cozy, warm temperature. RULE: If INDOORS, NO falling leaves; use warm lighting and autumn decor only. If OUTDOORS, fallen leaves are allowed.";
            else if (settings.season === 'Kış') seasonConcept = "Winter season, cold blue tones, frost, snow details, cozy atmosphere";
            
            if (seasonConcept) {
                 environmentExtras += `\nENVIRONMENTAL MODIFIER: Apply ${seasonConcept}.`;
            }
        }
        
        if (settings.weather && !settings.weather.includes('Seçiniz')) {
            environmentExtras += `\nWEATHER CONDITION: ${settings.weather} (Adjust lighting and atmosphere accordingly).`;
        }
        
        const fullSceneDescription = backgroundConcept + environmentExtras;

        let productLabelInstruction = "";
        const hasPrice = settings.priceTag && settings.priceTag.trim().length > 0;
        const hasName = settings.productName && settings.productName.trim().length > 0;

        if (hasPrice || hasName) {
            let displayPrice = settings.priceTag?.trim() || "";
            if (displayPrice && /^\d+([.,]\d+)?$/.test(displayPrice)) {
                displayPrice = `₺${displayPrice}`;
            }

            productLabelInstruction = `
            PRODUCT CALLOUT INSTRUCTION (INTEGRATED LABEL):
            - FREQUENCY: SINGLE INSTANCE ONLY. Write this label EXACTLY ONCE on the image. Do NOT repeat it.
            - ACTION: Draw a SINGLE FINE, MINIMALIST HAIRLINE (Leader Line) connecting the specific product item to the text label.
            - CRITICAL: **NO ARROWHEAD**. The line must be a simple, straight or angled stroke without any arrow tip.
            - CONTENT:
              ${hasName ? `Line 1: "${settings.productName}" (Bold, Uppercase)` : ''}
              ${hasPrice ? `Line 2: "${displayPrice}" (Light/Regular weight)` : ''}
            
            - STYLE: High-end fashion editorial style. Clean, sharp typography.
            - BACKGROUND: No solid box. Transparent background for text.
            - LINE STYLE: Thin, elegant, contrasting with background.
            - PLACEMENT: Ensure it does not overlap with the Headline or Sub-headline.
            `;
        }

        const imagePrompt = `
            ADVERTISING CAMPAIGN GENERATION TASK (Gemini 3 Pro).
            INPUT: Image of a product or model.
            GOAL: Create a HIGH-END PHOTOREALISTIC ADVERTISEMENT with INTEGRATED TEXT.

            🔒 TUTARLILIK KURALLARI - MUTLAKA UYGULA 🔒

            1. ÜRÜN/MODEL KORUMA (Yüklenen görsel):
               - Ürünü/modeli AYNEN koru - renk, doku, tasarım, detaylar
               - Kıyafetleri değiştirme, ekleme veya çıkarma
               - Ürün markası, logoları, desenleri AYNI kalmalı
               - Eğer model varsa: yüz, ten rengi, saç AYNI kalmalı

            2. SEÇİLEN AYARLARI UYGULA:
${settings.pose && !settings.pose.includes('Seçiniz') ? `               - Poz: "${settings.pose}" - BUNU KULLAN` : '               - Poz: Otomatik'}
${settings.season && !settings.season.includes('Seçiniz') ? `               - Sezon: "${settings.season}" - BUNU UYGULA` : ''}
${settings.weather && !settings.weather.includes('Seçiniz') ? `               - Hava: "${settings.weather}" - BUNU UYGULA` : ''}
               - Tema: "${settings.theme}" - BUNU UYGULA

            3. YASAK İŞLEMLER:
               - Ürün/model üzerinde değişiklik yapma
               - Seçilen ayarların dışına çıkma
               - Alakasız elementler ekleme

            SCENE DESCRIPTION (REAL WORLD LOCATION):
            ${fullSceneDescription}

            INSTRUCTIONS:
            1. PLACEMENT: Integrate the input subject seamlessly into the REALISTIC scene described above.
            2. ${poseInstruction}
            3. LIGHTING: Re-light the subject to match the scene's NATURAL lighting.

            MANDATORY TEXT OVERLAYS (VARIATION #${index + 1}):
            Write EXACTLY these texts on the image. Do NOT write the labels "HEADLINE", "SUB-HEADLINE", or "CTA" — only write the actual text content shown in quotes below.
            - Main title text: "${copy.headline}"
            - Secondary text: "${copy.subHeadline}"
            - Button text: "${copy.cta}" (Inside a stylish, small, minimal button).

            ⚠️ CRITICAL ANTI-DUPLICATION RULE:
            - Each text element above must appear EXACTLY ONCE on the entire image. Do NOT repeat any text.
            - "${copy.headline}" → write ONCE only.
            - "${copy.subHeadline}" → write ONCE only.
            - "${copy.cta}" → write ONCE only.
            - Do NOT write category labels like "HEADLINE", "SUB-HEADLINE", "CTA" on the image. Only write the actual quoted text content.

            ${productLabelInstruction}

            TYPOGRAPHY & DESIGN INSTRUCTION (CRITICAL - MINIMALIST):
            - Use Font Style: "${fontStyle}".
            - DESIGN STYLE: STRICTLY MINIMALIST & SOPHISTICATED.
            - TEXT SIZE: SMALL to MEDIUM. Do NOT use massive, shouting text. Keep headlines sophisticated and restrained.
            - COMPOSITION: Text should be elegant and unobtrusive. Use ample negative space (whitespace).
            - The text must look like high-end luxury fashion advertising (e.g., Zara, Vogue, Chanel ads).
            - Ensure high contrast against the background but maintain a clean, thin, and modern look.
            - DUPLICATION CHECK: Ensure ALL text elements (headline, sub-headline, CTA, Product Name, Price) appear ONLY ONCE in the entire image. ZERO repetition allowed.

            STRICT QUALITY RULES:
            - Ultrarealistic, 8K resolution render (for the background/subject).
            - The human model/mannequin must look ultrarealistic with natural skin texture, real fabric physics, and photographic detail.
            - Professional Graphic Design (for the text/button).
            - Text must be SPELLED CORRECTLY (Turkish).
            - MODERATE DEPTH OF FIELD: Background should be slightly soft but still clear and detailed, not heavily blurred.
            - NO FAKE/3D RENDER LOOK for the environment.
            - Perfect Anatomy (if model).
            ${ANATOMY_PROMPT}
            ${CLEAN_BACKGROUND_PROMPT}
        `;

         const imageConfig: any = {
            imageConfig: {
                aspectRatio: getAspectRatio(ratio),
                imageSize: '2K' 
            },
            safetySettings: SAFETY_SETTINGS
        };

        try {
             const imageResponse = await ai.models.generateContent({
                model: preferredModel,
                contents: {
                    parts: [
                        { inlineData: { data: base64, mimeType: mimeType } },
                        { text: imagePrompt }
                    ]
                },
                config: imageConfig
            });
            
            const imageUrl = extractImageFromResponse(imageResponse);
            if (!imageUrl) throw new Error("No image data");

            return {
                id: `ad_${Date.now()}_${index}`,
                imageUrl: imageUrl,
                metadata: {
                    backgroundPrompt: backgroundConcept,
                    copy: copy,
                    fontStyle: fontStyle,
                    poseInstruction: poseInstruction,
                    theme: settings.theme,
                    priceTag: settings.priceTag,
                    productName: settings.productName,
                    aspectRatio: ratio,
                    season: settings.season,
                    weather: settings.weather
                }
            };
        } catch (error: any) {
             console.error("Ad Gen Error", error);
             throw error;
        }
    };

    try {
        const promises = promptsToUse.map((p, idx) => generateSingleImage(p, idx));
        const results = await Promise.all(promises);
        return results;
    } catch (error: any) {
        if (error.status === 429) throw new Error("Kota aşıldı (429). Çok fazla varyasyon aynı anda istendi.");
        if (error.message?.includes('Safety')) throw new Error("Güvenlik filtresine takıldı. Lütfen promptu kontrol edin.");
        throw error;
    }
};

export const generateSimilarAdCreative = async (
    productImage: File,
    referenceMetadata: AdCreativeMetadata,
    count: number
): Promise<AdCreativeResult[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const { base64, mimeType } = await processImageForGemini(productImage);
    const preferredModel = 'gemini-3-pro-image-preview';
    
    const { backgroundPrompt, copy, fontStyle, poseInstruction, theme, priceTag, productName, aspectRatio, season, weather } = referenceMetadata;

    let productLabelInstruction = "";
    const hasPrice = priceTag && priceTag.trim().length > 0;
    const hasName = productName && productName.trim().length > 0;

    if (hasPrice || hasName) {
        let displayPrice = priceTag?.trim() || "";
        if (displayPrice && /^\d+([.,]\d+)?$/.test(displayPrice)) {
            displayPrice = `₺${displayPrice}`;
        }
        
        productLabelInstruction = `
        PRODUCT CALLOUT INSTRUCTION (INTEGRATED LABEL):
        - FREQUENCY: SINGLE INSTANCE ONLY. Write this label EXACTLY ONCE on the image. Do NOT repeat it.
        - ACTION: Draw a SINGLE FINE, MINIMALIST HAIRLINE (Leader Line) connecting the specific product item to the text label.
        - CRITICAL: **NO ARROWHEAD**. The line must be a simple, straight or angled stroke without any arrow tip.
        - CONTENT:
            ${hasName ? `Line 1: "${productName}" (Bold, Uppercase)` : ''}
            ${hasPrice ? `Line 2: "${displayPrice}" (Light/Regular weight)` : ''}
        
        - STYLE: High-end fashion editorial style. Clean, sharp typography.
        - BACKGROUND: No solid box. Transparent background for text.
        - LINE STYLE: Thin, elegant, contrasting with background.
        - PLACEMENT: Ensure it does not overlap with the Headline or Sub-headline.
        `;
    }

    let environmentExtras = "";
    if (season && !season.includes('Seçiniz')) {
        let seasonConcept = "";
        if (season === 'İlkbahar') seasonConcept = "Spring season, blooming nature, fresh green atmosphere, floral touches";
        else if (season === 'Yaz') seasonConcept = "Summer season, bright high-contrast sunlight, vibrant colors, warm atmosphere";
        else if (season === 'Sonbahar') seasonConcept = "Autumn season aesthetic. Colors: Warm browns, deep oranges, beige. Lighting: Cozy, warm temperature. RULE: If INDOORS, NO falling leaves; use warm lighting and autumn decor only. If OUTDOORS, fallen leaves are allowed.";
        else if (season === 'Kış') seasonConcept = "Winter season, cold blue tones, frost, snow details, cozy atmosphere";
        
        if (seasonConcept) {
             environmentExtras += `\nENVIRONMENTAL MODIFIER: Apply ${seasonConcept}.`;
        }
    }
    
    if (weather && !weather.includes('Seçiniz')) {
        environmentExtras += `\nWEATHER CONDITION: ${weather} (Adjust lighting and atmosphere accordingly).`;
    }

    const fullSceneDescription = backgroundPrompt + environmentExtras;

    const generateIteration = async (idx: number): Promise<AdCreativeResult> => {
        const imagePrompt = `
            ADVERTISING CREATIVE ITERATION TASK.
            INPUT: Product Image.
            GOAL: Create a VARIATION of a successful ad concept.
            
            REFERENCE CONCEPT (Keep this style/location/weather):
            "${fullSceneDescription}"

            INSTRUCTION:
            - Create a NEW variation of this scene. 
            - Change the camera angle slightly, or adjust the lighting (e.g. from morning to golden hour), or shift the model's position slightly.
            - The vibe must remain strictly "${theme}".
            
            TEXT OVERLAY (Keep Identical):
            Write EXACTLY these texts on the image. Do NOT write the labels "HEADLINE", "SUB-HEADLINE", or "CTA" — only write the actual text content shown in quotes below.
            - Main title text: "${copy.headline}"
            - Secondary text: "${copy.subHeadline}"
            - Button text: "${copy.cta}" (Inside a stylish, small, minimal button).
            - FONT STYLE: "${fontStyle}"

            ⚠️ CRITICAL ANTI-DUPLICATION RULE:
            - Each text element above must appear EXACTLY ONCE on the entire image. Do NOT repeat any text.
            - "${copy.headline}" → write ONCE only.
            - "${copy.subHeadline}" → write ONCE only.
            - "${copy.cta}" → write ONCE only.
            - Do NOT write category labels like "HEADLINE", "SUB-HEADLINE", "CTA" on the image. Only write the actual quoted text content.

            ${productLabelInstruction}

            DESIGN RULE: STRICTLY MINIMALIST & SOPHISTICATED. Small text.
            - DUPLICATION CHECK: Ensure ALL text elements (headline, sub-headline, CTA, Product Name, Price) appear ONLY ONCE in the entire image. ZERO repetition allowed.
            ${poseInstruction}

            STRICT QUALITY: Ultrarealistic, 8K resolution.
            - The human model/mannequin must look ultrarealistic with natural skin texture, real fabric physics, and photographic detail.
            ${ANATOMY_PROMPT}
            ${CLEAN_BACKGROUND_PROMPT}
        `;

        const imageConfig: any = {
            imageConfig: {
                aspectRatio: getAspectRatio(aspectRatio || '1:1'), 
                imageSize: '2K' 
            },
            safetySettings: SAFETY_SETTINGS
        };

        const imageResponse = await ai.models.generateContent({
            model: preferredModel,
            contents: {
                parts: [
                    { inlineData: { data: base64, mimeType: mimeType } },
                    { text: imagePrompt }
                ]
            },
            config: imageConfig
        });
        
        const imageUrl = extractImageFromResponse(imageResponse);
        if (!imageUrl) throw new Error("No image generated");

        return {
            id: `ad_sim_${Date.now()}_${idx}`,
            imageUrl: imageUrl,
            metadata: referenceMetadata 
        };
    };

    try {
        const promises = Array.from({ length: count }).map((_, idx) => generateIteration(idx));
        return await Promise.all(promises);
    } catch (error: any) {
        console.error("Generate Similar Error", error);
        throw error;
    }
};

// --- COLLECTION MODE (No text overlays) ---
export const generateCollectionImage = async (
    productImages: File[],
    modelImage: File,
    sceneImage: File | null,
    customPrompt: string,
    numberOfImages: number
): Promise<CollectionResult[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const preferredModel = 'gemini-3-pro-image-preview';

    // Process all images in parallel
    const [processedModel, ...processedProducts] = await Promise.all([
        processImageForGemini(modelImage),
        ...productImages.map(f => processImageForGemini(f))
    ]);

    let processedScene: { base64: string; mimeType: string; width: number; height: number } | null = null;
    if (sceneImage) {
        processedScene = await processImageForGemini(sceneImage);
    }

    const generateSingleImage = async (index: number): Promise<CollectionResult> => {
        // Build image parts
        const imageParts: any[] = [];

        // IMAGE 1: Model/Manken
        imageParts.push({ inlineData: { data: processedModel.base64, mimeType: processedModel.mimeType } });

        // IMAGE 2-N: Product references
        processedProducts.forEach(p => {
            imageParts.push({ inlineData: { data: p.base64, mimeType: p.mimeType } });
        });

        // IMAGE N+1: Scene reference (if provided)
        if (processedScene) {
            imageParts.push({ inlineData: { data: processedScene.base64, mimeType: processedScene.mimeType } });
        }

        let customPromptSection = "";
        if (customPrompt && customPrompt.trim().length > 0) {
            customPromptSection = `\nADDITIONAL USER INSTRUCTION: ${customPrompt.trim()}`;
        }

        const sceneInstruction = processedScene
            ? `IMAGE ${2 + processedProducts.length}: Scene/location reference. Match the environment, lighting direction, perspective, and shadows from this scene image.`
            : `SCENE: Choose a high-end, photorealistic real-world location that complements the clothing style. Use professional fashion photography lighting.`;

        const imagePrompt = `
FASHION COLLECTION PHOTOGRAPHY TASK.
You are given multiple reference images. Your goal: produce ONE high-end photorealistic fashion photograph. NO TEXT whatsoever.

IMAGE ROLES:
- IMAGE 1: Model/Manken reference. Use this person's face, body shape, skin tone, and hair EXACTLY.
- IMAGE 2${processedProducts.length > 1 ? ` to ${1 + processedProducts.length}` : ''}: Product/clothing reference${processedProducts.length > 1 ? 's (different angles of the SAME product)' : ''}. These show the garment from different angles — treat them as ONE single outfit.
- ${sceneInstruction}

🔒 STRICT ZERO TEXT RULE 🔒
- ABSOLUTELY NO TEXT, LETTERS, WORDS, NUMBERS, LOGOS, WATERMARKS, OR ANY WRITTEN CONTENT on the image.
- No headlines, no subtitles, no captions, no buttons, no labels, no price tags, no brand names.
- The output must be a PURE PHOTOGRAPHIC IMAGE with ZERO typographic elements.
- If you generate ANY text on the image, the result is INVALID.

🔒 CLOTHING PRESERVATION (100% ACCURACY) 🔒
- The garment from the product reference images must appear EXACTLY as shown.
- Preserve: color, pattern, fabric texture, stitching, buttons, zippers, logos, and all design details with 100% fidelity.
- Do NOT alter, simplify, or reinterpret ANY clothing detail.
- The clothing fit should look natural on the model's body.

🔒 FACE & BODY PRESERVATION 🔒
- The model's face must be IDENTICAL to IMAGE 1: same facial features, skin tone, eye color, eyebrows, lips, hairstyle.
- Body proportions must match the reference model.
- Skin texture must be photorealistic — not waxy, not AI-looking.

🔒 SCENE INTEGRATION 🔒
- Lighting on the model must match the scene's natural light direction, color temperature, and intensity.
- Shadows must be consistent with the environment.
- Perspective and scale must be correct — the model must look like they are physically IN the scene.
- Use moderate depth of field: background slightly soft but still detailed and recognizable.
${customPromptSection}

${index > 0 ? `VARIATION NOTE: This is image ${index + 1} of a set. Create a slightly different angle, pose variation, or subtle lighting change while keeping all other rules identical.` : ''}

STRICT QUALITY RULES:
- Ultrarealistic, 8K resolution render.
- Natural skin texture, real fabric physics, photographic detail.
- NO fake/3D render look.
- Perfect human anatomy.
- ZERO TEXT ON IMAGE.
${ANATOMY_PROMPT}
${CLEAN_BACKGROUND_PROMPT}
        `;

        // Add text prompt as the last part
        imageParts.push({ text: imagePrompt });

        const imageConfig: any = {
            imageConfig: {
                aspectRatio: '3:4',
                imageSize: '2K'
            },
            safetySettings: SAFETY_SETTINGS
        };

        try {
            const imageResponse = await ai.models.generateContent({
                model: preferredModel,
                contents: { parts: imageParts },
                config: imageConfig
            });

            const imageUrl = extractImageFromResponse(imageResponse);
            if (!imageUrl) throw new Error("No image data");

            return {
                id: `col_${Date.now()}_${index}`,
                imageUrl: imageUrl,
                metadata: {
                    customPrompt: customPrompt,
                    numberOfImages: numberOfImages
                }
            };
        } catch (error: any) {
            console.error("Collection Gen Error", error);
            throw error;
        }
    };

    try {
        // Sequential generation with 2s delay to avoid rate limiting
        const results: CollectionResult[] = [];
        for (let i = 0; i < numberOfImages; i++) {
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            const result = await generateSingleImage(i);
            results.push(result);
        }
        return results;
    } catch (error: any) {
        if (error.status === 429) throw new Error("Kota aşıldı (429). Çok fazla istek gönderildi, lütfen bekleyin.");
        if (error.message?.includes('Safety')) throw new Error("Güvenlik filtresine takıldı. Lütfen promptu kontrol edin.");
        throw error;
    }
};

export const generateVirtualTryOnV2 = async (
    targetModel: File,
    referenceOutfitModel: File,
    modelQuality: string
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const modelName = modelQuality.includes('Pro') || modelQuality.includes('Nano')
            ? 'gemini-3-pro-image-preview' 
            : 'gemini-2.5-flash-image';
        
        console.log(`Generating Virtual Try-On V2 (Identity Swap) with model: ${modelName}`);

        const [processedTarget, processedRef] = await Promise.all([
            processImageForGemini(targetModel, 2048, 0.90),
            processImageForGemini(referenceOutfitModel, 2048, 0.95)
        ]);

        const targetAspectRatio = getClosestAspectRatio(processedRef.width, processedRef.height);

        const parts: any[] = [
            { inlineData: { data: processedTarget.base64, mimeType: processedTarget.mimeType } },
            { inlineData: { data: processedRef.base64, mimeType: processedRef.mimeType } }
        ];

        const prompt = `
            ADVANCED IDENTITY SWAP & FACE REPLACEMENT TASK (V2 - REALISM FOCUS).
            INPUTS: 
            - IMAGE 1: Source Identity (Face/Head).
            - IMAGE 2: Target Body & Environment (Outfit/Pose).
            
            GOAL: Seamlessly integrate the face from Image 1 onto the body in Image 2.

            CRITICAL REALISM INSTRUCTIONS (PRIORITY #1):
            1. SKIN TEXTURE: The face MUST have high-frequency skin texture (pores, wrinkles, peach fuzz, imperfections). DO NOT GENERATE SMOOTH, PLASTIC, OR WAXY SKIN.
            2. LIGHTING MATCH: Analyze the lighting in Image 2 (direction, hardness, color temperature). The new face must be lit EXACTLY the same way. Shadows on the face must match the neck and environment.
            3. GRAIN & NOISE: Match the ISO/film grain of Image 2. If Image 2 is grainy, the face must be grainy. If Image 2 is sharp, the face must be sharp.
            4. COLOR GRADING: The skin tone of the face must match the skin tone of the neck/hands in Image 2. Do not leave a color cast difference at the neck seam.
            5. REFLECTIONS: If there are mirrors, update reflections.

            IDENTITY PRESERVATION:
            - Transfer the facial structure (eye shape, nose shape, jawline) of Image 1.
            - Adapt the head angle/tilt to match the pose in Image 2 perfectly.

            EXECUTION STEPS:
            - Keep Image 2 pixel-perfect (Background, Outfit, Hair if possible, Body).
            - Only replace the facial region.
            - Ensure subsurface scattering (light penetrating skin) for a lifelike look.
            
            OUTPUT:
            - Photorealistic, Cinematic Lighting.
            - NO AI ARTIFACTS (No blurring, no smudging).
            ${ANATOMY_PROMPT}
        `;

        parts.push({ text: prompt });

        const config: any = {
            imageConfig: {
                aspectRatio: targetAspectRatio, 
                imageSize: modelName.includes('pro') ? '2K' : '1K'
            },
            safetySettings: SAFETY_SETTINGS
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: config
        });

        const imageData = extractImageFromResponse(response);
        if (imageData) return imageData;

        throw new Error("No image generated by Gemini for Try-On V2.");

    } catch (error: any) {
        console.error("Gemini Try-On V2 Error:", error);
        if (error.status === 429) throw new Error("Kota aşıldı (429).");
        if (error.message?.includes('Safety')) throw error;
        throw new Error("V2 işlemi başarısız oldu.");
    }
};

export const generateVirtualTryOnV3 = async (
    originalPhoto: File,
    productImage: File,
    shoePhoto: File | null,
    settings: TryOnV3Settings
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const modelName = 'gemini-3-pro-image-preview';
        
        console.log(`Generating Virtual Try-On V3 (Product Swap) with model: ${modelName}`);

        const imageProcessingPromises = [
            processImageForGemini(originalPhoto, 2048, 0.95),
            processImageForGemini(productImage, 2048, 0.95)
        ];

        if (shoePhoto) {
            imageProcessingPromises.push(processImageForGemini(shoePhoto, 2048, 0.95));
        }

        const results = await Promise.all(imageProcessingPromises);
        const processedOriginal = results[0];
        const processedProduct = results[1];
        const processedShoe = results.length > 2 ? results[2] : null;

        const targetAspectRatio = getClosestAspectRatio(processedOriginal.width, processedOriginal.height);

        const parts: any[] = [
            { inlineData: { data: processedOriginal.base64, mimeType: processedOriginal.mimeType } },
            { inlineData: { data: processedProduct.base64, mimeType: processedProduct.mimeType } }
        ];

        if (processedShoe) {
            parts.push({ inlineData: { data: processedShoe.base64, mimeType: processedShoe.mimeType } });
        }

        const preservePose = settings.pose === 'original';
        const preserveBackground = settings.background === 'original';
        const preserveAngle = settings.viewAngle === 'original';

        let transformationPrompt = "";
        let preservationPrompt = "";

        if (preservePose) {
            preservationPrompt += "\n- POSE: MUST REMAIN EXACTLY THE SAME as Image 1.";
        } else {
            transformationPrompt += `\n- POSE CHANGE: Transform the model into this pose: "${settings.pose}". Ensure the clothing adapts naturally.`;
        }

        if (preserveBackground) {
            preservationPrompt += "\n- BACKGROUND: MUST REMAIN EXACTLY THE SAME as Image 1.";
        } else {
            let backgroundDescription = settings.background;
            if (settings.theme && settings.sceneVariation && settings.sceneVariation !== 'auto') {
                const themeVariations = AD_THEME_VARIATIONS[settings.theme] || [];
                const selectedVariation = themeVariations.find(v => v.id === settings.sceneVariation);
                if (selectedVariation) {
                    backgroundDescription = selectedVariation.prompt;
                }
            } else if (settings.theme && settings.sceneVariation === 'auto') {
                const themeVariations = AD_THEME_VARIATIONS[settings.theme] || [];
                if (themeVariations.length > 0) {
                    const randomVariation = themeVariations[Math.floor(Math.random() * themeVariations.length)];
                    backgroundDescription = randomVariation.prompt;
                }
            }
            transformationPrompt += `\n- BACKGROUND CHANGE: Transport the model to: "${backgroundDescription}". Ensure lighting matches this new environment.`;
        }

        if (!preserveAngle) {
            transformationPrompt += `\n- VIEW ANGLE: Change camera angle to: "${settings.viewAngle}".`;
        }

        let shoeInstruction = "";
        if (processedShoe) {
            shoeInstruction = "\n- SHOE SWAP: Replace the model's shoes with the shoes from Image 3.";
        } else {
            shoeInstruction = "\n- SHOES: Keep original shoes if they match, or ensure full outfit coherence.";
        }

        let atmospherePrompt = "";
        if (settings.season && !settings.season.includes('Seçiniz') && !settings.season.includes('Otomatik')) {
            atmospherePrompt += `\n- SEASON: ${settings.season}. Adjust lighting, colors, and atmosphere to match this season.`;
        }
        if (settings.weather && !settings.weather.includes('Seçiniz') && !settings.weather.includes('Otomatik')) {
            atmospherePrompt += `\n- WEATHER: ${settings.weather}. Ensure lighting and environmental conditions reflect this weather.`;
        }

        const prompt = `
            VIRTUAL TRY-ON V3: AI STYLING STUDIO.
            INPUTS:
            - IMAGE 1: Base Photo (Model).
            - IMAGE 2: New Garment (Product).
            ${processedShoe ? '- IMAGE 3: New Shoes (Product).' : ''}

            GOAL: Create a photorealistic fashion image.

            🔒 TUTARLILIK KURALLARI - MUTLAKA UYGULA 🔒

            1. KİMLİK KORUMA (Image 1'deki kişi):
               - Image 1'deki AYNI kişiyi kullan
               - Yüz, ten rengi, saç rengi/stili, vücut tipi AYNI kalmalı
               - Farklı bir kişi/manken üretme
               - Yüz hatlarını, göz rengini, cilt tonunu değiştirme

            2. ÜRÜN TUTARLILIĞI:
               - SADECE Image 2'deki ürünü kullan (ve varsa Image 3'teki ayakkabı)
               - Ürünün rengini, desenini, dokusunu değiştirme
               - Ek kıyafet ekleme

            3. SEÇİLEN AYARLARI UYGULA:
               - Seçilen poz: ${preservePose ? 'Orijinal pozu koru' : settings.pose}
               - Seçilen arka plan: ${preserveBackground ? 'Orijinal arka planı koru' : settings.background}
               - Bunların dışına çıkma

            ⚠️ CRITICAL PRODUCT FIDELITY RULES (ABSOLUTE HIGHEST PRIORITY) ⚠️:

            GARMENT FROM IMAGE 2 MUST BE REPLICATED WITH PERFECT ACCURACY:
            1. EXACT COLOR: Use the EXACT color/shade from Image 2. NO color variations or adjustments.
            2. EXACT PATTERN: If the garment has patterns, prints, or graphics, replicate them PRECISELY.
            3. EXACT TEXTURE: Maintain the fabric type and texture exactly as shown in Image 2.
            4. EXACT STYLE DETAILS: All design elements MUST match Image 2:
               - Buttons, zippers, pockets, collars, cuffs, seams
               - Any logos, text, or graphics on the garment
               - Stitching patterns and decorative elements
            5. EXACT STRUCTURE:
               - Sleeve length MUST match (long sleeves stay long, short sleeves stay short)
               - Neckline MUST match (V-neck, crew neck, turtleneck, etc.)
               - Hemline/Length MUST match (cropped, regular, long)
               - Fit/Silhouette MUST match (oversized, fitted, loose, etc.)
            6. FULL VISIBILITY: The garment MUST be COMPLETELY VISIBLE on the model. Do NOT hide or crop any part.
            7. NO MODIFICATIONS: Do NOT add, remove, or change ANY design elements.
            8. TREAT IMAGE 2 AS ABSOLUTE REFERENCE: Perfect 1:1 replication required.

            ${processedShoe ? `
            SHOES FROM IMAGE 3 MUST BE REPLICATED WITH PERFECT ACCURACY:
            - EXACT color, style, and design from Image 3
            - FULL VISIBILITY of the shoes
            - NO modifications to the shoe design
            ` : ''}

            CORE INSTRUCTIONS:
            1. IDENTITY: Preserve facial features and body shape of Model in Image 1.
            2. CLOTHING: Dress the model in the Garment from Image 2 with PERFECT FIDELITY (see rules above).
            ${shoeInstruction}

            SCENE & POSE LOGIC:
            ${preservePose && preserveBackground ? 'This is a strict IN-PLACE EDIT.' : 'This is a CREATIVE RE-IMAGINING.'}
            ${preservationPrompt}
            ${transformationPrompt}
            ${atmospherePrompt}

            ⚠️ CAMERA ANGLE & FRAMING RULES ⚠️:
            - Use a camera angle that ensures the ENTIRE garment is visible.
            - For jackets/coats/outerwear: Use full body or 3/4 body shot (head to knees minimum).
            - AVOID extreme low angles or close-ups that hide parts of the garment.
            - The garment should be the OUTERMOST layer and clearly visible.
            - Frame the shot to show the complete outfit from top to bottom.

            OUTPUT QUALITY:
            - Photorealistic, 4K, undetectable edit.
            - Lighting must be consistent across model, clothes, and background.
            - The garment MUST look exactly like Image 2 - this is NON-NEGOTIABLE.
            ${ANATOMY_PROMPT}
            ${CLEAN_BACKGROUND_PROMPT}
            ${PRODUCT_FIDELITY_PROMPT}
        `;

        parts.push({ text: prompt });

        const config: any = {
            imageConfig: {
                aspectRatio: targetAspectRatio, 
                imageSize: '2K'
            },
            safetySettings: SAFETY_SETTINGS
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: config
        });

        const imageData = extractImageFromResponse(response);
        if (imageData) return imageData;

        throw new Error("No image generated by Gemini for Try-On V3.");

    } catch (error: any) {
        console.error("Gemini Try-On V3 Error:", error);
        if (error.status === 429) throw new Error("Kota aşıldı (429).");
        if (error.message?.includes('Safety')) throw error;
        throw new Error("V3 işlemi başarısız oldu.");
    }
};

export const upscaleImage = async (
    image: File,
    settings: UpscaleSettings
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = 'gemini-3-pro-image-preview'; 

        const { base64, mimeType, width, height } = await processImageForGemini(image, 2048, 0.95);
        const aspectRatio = getClosestAspectRatio(width, height);

        const prompt = `
            AI IMAGE ENHANCEMENT & UPSCALING TASK.
            INPUT: Low/Medium resolution image.
            GOAL: Regenerate this image in HIGH RESOLUTION (4K/8K equivalent detail).
            INSTRUCTIONS:
            1. CONTENT PRESERVATION: Preserve exact composition, subject, pose, and colors.
            2. ENHANCEMENT: ${settings.factor === '4x' ? 'EXTREME' : 'HIGH'} SHARPNESS. Remove artifacts. Add high-frequency textures.
            3. CREATIVITY LEVEL: ${settings.creativity}%.
            STYLE: Photorealistic, 8K, Masterpiece, Sharp Focus.
            ${CLEAN_BACKGROUND_PROMPT}
        `;

        const config: any = {
             imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: '2K' 
            },
            safetySettings: SAFETY_SETTINGS
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    { inlineData: { data: base64, mimeType } },
                    { text: prompt }
                ]
            },
            config: config
        });

        const imageData = extractImageFromResponse(response);
        if (imageData) return imageData;

        throw new Error("No image generated.");

    } catch (error: any) {
        if (error.status === 429) throw new Error("Kota aşıldı (429).");
        if (error.message?.includes('Safety')) throw error;
        throw error;
    }
};

// ==========================================
// GÖRSEL ARAÇLARI - IMAGE TOOLS
// ==========================================

// Background Remover - Arka Plan Silme
export const removeBackground = async (
    imageFile: File,
    outputFormat: 'transparent' | 'white' | 'custom' = 'transparent',
    customBgColor?: string
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const modelName = "gemini-2.0-flash-exp";

        const { base64, mimeType } = await processImageForGemini(imageFile, 2048, 0.95);

        let backgroundInstruction = "";
        switch (outputFormat) {
            case 'transparent':
                backgroundInstruction = "Make the background completely TRANSPARENT (alpha channel = 0). Output as PNG with transparency.";
                break;
            case 'white':
                backgroundInstruction = "Replace the background with PURE WHITE (#FFFFFF).";
                break;
            case 'custom':
                backgroundInstruction = `Replace the background with the color: ${customBgColor || '#FFFFFF'}.`;
                break;
        }

        const prompt = `
            BACKGROUND REMOVAL TASK - PROFESSIONAL E-COMMERCE QUALITY

            OBJECTIVE: Remove the background from this image while preserving the subject with pixel-perfect precision.

            CRITICAL INSTRUCTIONS:
            1. SUBJECT ISOLATION: Identify and isolate the main subject (product, person, or object) with extreme precision.
            2. EDGE QUALITY: Preserve fine details like hair, fur, fabric threads, and transparent materials (glass, lace, etc.).
            3. NO ARTIFACTS: Ensure clean edges with no halos, fringing, or color bleeding.
            4. SHADOW HANDLING: Remove background shadows but preserve natural product shadows if they add depth.
            5. ${backgroundInstruction}

            QUALITY REQUIREMENTS:
            - Maintain original image resolution and quality
            - Preserve all colors and textures of the subject
            - Clean, professional cutout suitable for e-commerce
            - No visible edge artifacts or rough transitions

            OUTPUT: High-quality image with background removed as specified.
        `;

        const parts: any[] = [
            { inlineData: { data: base64, mimeType: mimeType } },
            { text: prompt }
        ];

        const config: any = {
            responseModalities: ["image", "text"],
            imageConfig: {
                imageSize: '2K'
            },
            safetySettings: SAFETY_SETTINGS
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: config
        });

        const imageData = extractImageFromResponse(response);
        if (imageData) {
            console.log("✅ Background removed successfully");
            return imageData;
        }

        throw new Error("Background removal failed - no image generated.");

    } catch (error: any) {
        console.error("Background Removal Error:", error);
        if (error.status === 429) throw new Error("Kota aşıldı (429).");
        throw error;
    }
};

// Color Variation Generator - Renk Varyasyonu Oluşturucu
export const generateColorVariation = async (
    imageFile: File,
    targetColor: string,
    preserveTexture: boolean = true
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const modelName = "gemini-2.0-flash-exp";

        const { base64, mimeType } = await processImageForGemini(imageFile, 2048, 0.95);

        const textureInstruction = preserveTexture
            ? "CRITICAL: Preserve ALL textures, patterns, stitching, and material details. Only change the base color while maintaining fabric weave, leather grain, knit patterns, etc."
            : "Apply the color change uniformly.";

        const prompt = `
            COLOR VARIATION TASK - PRODUCT RECOLORING

            OBJECTIVE: Change the color of the main product/garment in this image to: ${targetColor}

            CRITICAL INSTRUCTIONS:
            1. COLOR CHANGE: Transform the main product's color to ${targetColor}.
            2. ${textureInstruction}
            3. REALISM: The color change must look natural and realistic, as if the product was manufactured in this color.
            4. LIGHTING PRESERVATION: Maintain all highlights, shadows, and lighting effects - just shift the hue.
            5. MATERIAL FIDELITY: Different materials should reflect the new color appropriately (matte vs shiny, cotton vs silk, etc.).

            PRESERVE EXACTLY:
            - Background (keep unchanged)
            - Model/mannequin appearance (if present)
            - Accessories and hardware (zippers, buttons, logos) - keep original colors unless specified
            - Image composition and framing
            - All product details, stitching, and structural elements

            COLOR APPLICATION:
            - Target Color: ${targetColor}
            - Apply color naturally considering the material type
            - Maintain color depth and richness
            - Keep realistic color variation (slight natural gradients, not flat)

            OUTPUT: High-quality image with the product recolored to ${targetColor}.
        `;

        const parts: any[] = [
            { inlineData: { data: base64, mimeType: mimeType } },
            { text: prompt }
        ];

        const config: any = {
            responseModalities: ["image", "text"],
            imageConfig: {
                imageSize: '2K'
            },
            safetySettings: SAFETY_SETTINGS
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: config
        });

        const imageData = extractImageFromResponse(response);
        if (imageData) {
            console.log(`✅ Color variation generated: ${targetColor}`);
            return imageData;
        }

        throw new Error("Color variation failed - no image generated.");

    } catch (error: any) {
        console.error("Color Variation Error:", error);
        if (error.status === 429) throw new Error("Kota aşıldı (429).");
        throw error;
    }
};

// Batch Color Variations - Toplu Renk Varyasyonları
export const generateBatchColorVariations = async (
    imageFile: File,
    colors: string[],
    preserveTexture: boolean = true,
    onProgress?: (completed: number, total: number, color: string) => void
): Promise<{ color: string; imageUrl: string }[]> => {
    const results: { color: string; imageUrl: string }[] = [];
    const total = colors.length;

    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        try {
            if (onProgress) {
                onProgress(i, total, color);
            }
            const imageUrl = await generateColorVariation(imageFile, color, preserveTexture);
            results.push({ color, imageUrl });
        } catch (error) {
            console.error(`Failed to generate ${color} variation:`, error);
            // Continue with other colors even if one fails
        }
    }

    return results;
};

// Image Enhancement - Görsel İyileştirme
export const enhanceImage = async (
    imageFile: File,
    enhancementType: 'sharpen' | 'denoise' | 'colorCorrect' | 'all' = 'all'
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const modelName = "gemini-2.0-flash-exp";

        const { base64, mimeType } = await processImageForGemini(imageFile, 2048, 0.95);

        let enhancementPrompt = "";
        switch (enhancementType) {
            case 'sharpen':
                enhancementPrompt = "Enhance sharpness and clarity while avoiding over-sharpening artifacts.";
                break;
            case 'denoise':
                enhancementPrompt = "Remove noise and grain while preserving fine details and textures.";
                break;
            case 'colorCorrect':
                enhancementPrompt = "Correct white balance, enhance color accuracy, and optimize exposure.";
                break;
            case 'all':
                enhancementPrompt = "Apply comprehensive enhancement: sharpen details, reduce noise, correct colors, and optimize exposure for e-commerce quality.";
                break;
        }

        const prompt = `
            IMAGE ENHANCEMENT TASK - E-COMMERCE QUALITY OPTIMIZATION

            OBJECTIVE: Enhance this product image for professional e-commerce use.

            ENHANCEMENT INSTRUCTIONS:
            ${enhancementPrompt}

            QUALITY REQUIREMENTS:
            1. SHARPNESS: Crisp, clear product details
            2. COLOR: Accurate, vibrant but natural colors
            3. EXPOSURE: Well-balanced lighting, no blown highlights or crushed shadows
            4. NOISE: Clean, noise-free image
            5. PROFESSIONAL: E-commerce ready, catalog quality

            PRESERVE:
            - Original composition and framing
            - Product authenticity and true colors
            - All important details and textures

            OUTPUT: Enhanced high-quality image ready for e-commerce use.
        `;

        const parts: any[] = [
            { inlineData: { data: base64, mimeType: mimeType } },
            { text: prompt }
        ];

        const config: any = {
            responseModalities: ["image", "text"],
            imageConfig: {
                imageSize: '2K'
            },
            safetySettings: SAFETY_SETTINGS
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: config
        });

        const imageData = extractImageFromResponse(response);
        if (imageData) {
            console.log("✅ Image enhanced successfully");
            return imageData;
        }

        throw new Error("Image enhancement failed - no image generated.");

    } catch (error: any) {
        console.error("Image Enhancement Error:", error);
        if (error.status === 429) throw new Error("Kota aşıldı (429).");
        throw error;
    }
};

// ============================================================
// TAKI MODU - JEWELRY MODE GENERATION
// ============================================================

export interface JewelryGenerationResult {
    imageData: string;
    aiModel: string;
    shootingType: string;
}

// JSON-based compact prompt for Jewelry
const buildCompactJSONPromptJewelry = (settings: JewelrySettings): string => {
    const settingsJSON: Record<string, any> = {
        task: "jewelry_photography",
        shootingType: settings.shootingType,
        purpose: settings.purpose
    };

    if (settings.background) settingsJSON.background = settings.background;
    if (settings.skinTone && settings.skinTone !== 'auto') settingsJSON.skinTone = settings.skinTone;
    if (settings.standColor) settingsJSON.standColor = settings.standColor;
    if (settings.aspectRatio) settingsJSON.aspectRatio = settings.aspectRatio;
    if (settings.numberOfImages) settingsJSON.count = settings.numberOfImages;

    // Shooting type specific instructions
    let shootingInstructions = '';
    switch (settings.shootingType) {
        case 'velvet-stand':
            shootingInstructions = `Place jewelry on elegant velvet display stand. Luxurious showroom atmosphere.`;
            break;
        case 'on-model':
            shootingInstructions = `Show jewelry worn on model (only relevant body part visible - no face). Minimal fashion editorial style.`;
            break;
        case 'macro-detail':
            shootingInstructions = `Extreme close-up macro shot. Focus on craftsmanship details, gemstones, metal finish.`;
            break;
    }

    return `JEWELRY PHOTOGRAPHY TASK - Follow these settings exactly:

${JSON.stringify(settingsJSON, null, 2)}

SHOOTING STYLE: ${shootingInstructions}

🔒 TUTARLILIK KURALLARI - MUTLAKA UYGULA 🔒

1. ÜRÜN KORUMA (Yüklenen takı görseli):
   - Takıyı AYNEN koru - tasarım, şekil, taşlar, metal rengi
   - Hiçbir değişiklik yapma - ekleme, çıkarma, değiştirme YOK
   - Zincir kalınlığı, taş boyutları, metal parlaklığı AYNI kalmalı

2. SEÇİLEN AYARLARI UYGULA:
${settings.background ? `   - Arka Plan: "${settings.background}" - BUNU KULLAN, başka arka plan kullanma` : '   - Arka Plan: Otomatik'}
${settings.skinTone && settings.skinTone !== 'auto' ? `   - Ten Rengi: "${settings.skinTone}" - BUNU KULLAN, farklı ten rengi kullanma` : ''}
${settings.standColor ? `   - Stand Rengi: "${settings.standColor}" - BUNU KULLAN, farklı stand kullanma` : ''}
   - Çekim Tipi: "${settings.shootingType}" - BUNU UYGULA

3. YASAK İŞLEMLER:
   - Seçilen arka plandan farklı arka plan KULLANMA
   - Seçilen ten renginden farklı ten KULLANMA
   - Takıya ek aksesuar/ürün EKLEME
   - Takının tasarımını değiştirme

CORE RULES:
1. The jewelry from input image is the MAIN SUBJECT - preserve it EXACTLY
2. Professional jewelry photography lighting (soft highlights on metal, gemstone sparkle)
3. Use the specified background color/style
4. Ultra-high detail, jewelry-grade clarity
5. True-to-life metal rendering (gold/silver/platinum)
6. Accurate gemstone colors and sparkle

CRITICAL:
- Do NOT modify the jewelry design in any way
- Do NOT add watermarks, logos, or text
- If "on-model" style: show ONLY relevant body part, NO face
- Output professional e-commerce ready photograph`;
};

// Kadife Stand prompt şablonu
const getVelvetStandPrompt = (standColor: string, background: string): string => {
    const standColorInfo = JEWELRY_STAND_COLORS.find(c => c.id === standColor);
    const standColorName = standColorInfo?.name || 'Bordo Kadife';

    const bgInfo = JEWELRY_BACKGROUNDS['velvet-stand'].find(b => b.id === background);
    const bgName = bgInfo?.name || 'Bordo Kadife';
    const bgDescription = bgInfo?.description || 'Lüks showroom hissi';

    return `
JEWELRY PRODUCT PHOTOGRAPHY - VELVET STAND STYLE

MAIN SUBJECT: The jewelry piece from the uploaded image
PLACEMENT: Elegant ${standColorName} velvet jewelry stand/display pedestal

ENVIRONMENT:
- Background: ${bgName} background - ${bgDescription}, gradient, studio-style
- Surface: Luxurious velvet texture with soft fabric folds
- Ambient: High-end jewelry showroom atmosphere

LIGHTING SETUP:
- Primary: Soft diffused spotlight from above-front (45°)
- Fill: Gentle side lights to eliminate harsh shadows
- Accent: Precise highlights on metal surfaces and gemstones
- Reflection control: Minimal distracting reflections

CAMERA & COMPOSITION:
- Angle: Slightly elevated front view (15-25°)
- Focus: Razor-sharp on the jewelry piece
- Depth of field: Shallow, velvet stand slightly soft
- Framing: Product centered with elegant negative space

QUALITY REQUIREMENTS:
- Resolution: Ultra-high detail, jewelry-grade clarity
- Metal rendering: True-to-life gold/silver/platinum finish
- Gemstone rendering: Accurate sparkle and color saturation
- Texture: Visible craftsmanship details

STRICT RULES:
- NO watermarks, logos, or text
- NO humans or body parts visible
- Product must remain EXACTLY as uploaded (no modifications)
- Professional e-commerce ready output
`;
};

// Ten rengi açıklamaları
const SKIN_TONE_DESCRIPTIONS: { [key: string]: string } = {
    'fair': 'very fair porcelain skin with light pink undertones',
    'light': 'light skin with slight pink undertones, Caucasian',
    'medium-light': 'light olive or beige skin tone',
    'medium': 'warm honey or wheat-colored skin, Mediterranean',
    'medium-dark': 'bronze or caramel skin tone, warm undertones',
    'dark': 'rich brown or coffee-colored skin',
    'deep': 'deep espresso or dark chocolate skin tone'
};

// Poz varyasyonları
const POSE_VARIATIONS = [
    'hand gently touching the collarbone, fingers slightly spread',
    'hand resting elegantly on the shoulder',
    'profile view with chin slightly raised',
    'three-quarter view, looking down gracefully',
    'hand near the neck, fingers delicately curved',
    'relaxed pose with arm slightly extended',
    'subtle head tilt with exposed neck',
    'hands crossed at wrist level'
];

// Model Üzerinde (Minimal) prompt şablonu
const getOnModelPrompt = (background: string, skinTone?: string): string => {
    const bgInfo = JEWELRY_BACKGROUNDS['on-model'].find(b => b.id === background);
    const bgName = bgInfo?.name || 'Açık Krem';
    const bgDescription = bgInfo?.description || 'Temiz ve minimal';

    // Ten rengi
    const skinDescription = skinTone && SKIN_TONE_DESCRIPTIONS[skinTone]
        ? SKIN_TONE_DESCRIPTIONS[skinTone]
        : 'natural, healthy skin tone';

    // Rastgele poz seç
    const randomPose = POSE_VARIATIONS[Math.floor(Math.random() * POSE_VARIATIONS.length)];

    return `
JEWELRY PHOTOGRAPHY - MINIMAL MODEL STYLE

MAIN SUBJECT: The jewelry piece from the uploaded image worn naturally
MODEL REQUIREMENTS:
- Show ONLY the relevant body part (neck for necklaces, wrist for bracelets, ear for earrings, hand for rings)
- SKIN TONE: ${skinDescription}
- Skin: Flawless, natural-looking with subtle highlights
- NO face visible (crop strategically)
- POSE: ${randomPose}

ENVIRONMENT:
- Background: Clean, ${bgName} (${bgDescription}) backdrop
- Style: Minimalist fashion editorial aesthetic
- Atmosphere: Fresh, modern, approachable

LIGHTING SETUP:
- Primary: Soft beauty lighting, diffused and even
- Fill: Gentle wrap-around light for smooth skin tones
- Accent: Delicate highlights on jewelry to make it pop
- Overall: Bright, airy, Instagram-worthy

CAMERA & COMPOSITION:
- Framing: Tight crop on jewelry and immediate body area
- Focus: Sharp on jewelry, skin slightly softer
- Style: Contemporary fashion photography
- Aspect ratio consideration: Social media friendly

QUALITY REQUIREMENTS:
- Jewelry must be the clear focal point
- Natural skin texture matching ${skinDescription}
- True-to-life metal and gemstone colors
- High-fashion editorial quality

STRICT RULES:
- NO face or identifiable features
- NO distracting elements or accessories
- Product must remain EXACTLY as uploaded
- Clean, professional output suitable for e-commerce
`;
};

// Makro Detay prompt şablonu
const getMacroDetailPrompt = (background: string): string => {
    const bgInfo = JEWELRY_BACKGROUNDS['macro-detail'].find(b => b.id === background);
    const bgName = bgInfo?.name || 'Koyu Blur';
    const bgDescription = bgInfo?.description || 'Odak tamamen üründe';

    // Beyaz arka plan için özel vurgu
    const whiteBackgroundEmphasis = background === 'blur-white' ? `
CRITICAL: PURE WHITE BACKGROUND REQUIRED
- Background MUST be PURE WHITE (#FFFFFF) - RGB(255,255,255)
- NOT cream, NOT off-white, NOT ivory, NOT beige, NOT gray
- Like Amazon/Shopify product photography - clean pure white
- The background should be so white it almost glows
- Perfect for e-commerce listings and product catalogs
- This is a HARD REQUIREMENT - no exceptions
=== END WHITE BACKGROUND NOTICE ===
` : '';

    return `
JEWELRY DETAIL PHOTOGRAPHY - CLOSE-UP PRODUCT SHOT
${whiteBackgroundEmphasis}
BACKGROUND REQUIREMENT: ${bgName} background effect - ${bgDescription}

⚠️ CRITICAL - PRODUCT INTEGRITY:
- DO NOT modify, change, or alter the jewelry design in ANY way
- DO NOT add, remove, or change any gemstones, metals, or decorative elements
- DO NOT change the shape, structure, or form of the jewelry
- The jewelry must be 100% IDENTICAL to the uploaded image
- Only change: lighting, angle, background blur - NOTHING ELSE

FRAMING & COMPOSITION:
- Show the ENTIRE jewelry piece in frame - DO NOT crop parts of the product
- Close-up but NOT extreme macro - the full product shape must be recognizable
- The viewer should clearly understand what type of jewelry it is (ring, necklace, bracelet, etc.)
- Fill about 70-80% of the frame with the product, leaving some breathing room
- Slight angle to show depth and dimension

MAIN SUBJECT: The COMPLETE jewelry piece from uploaded image with enhanced detail visibility
FOCUS AREA: Show craftsmanship details while keeping the full product visible

TECHNICAL APPROACH:
- Shot with 100mm MACRO LENS - professional macro photography
- Close-up product photography (NOT microscopic macro)
- Sharp focus across the entire jewelry piece
- Background: Soft ${bgName} bokeh effect - ${bgDescription}
- 100mm focal length provides optimal working distance and beautiful bokeh

DETAIL EMPHASIS (CAPTURE WHAT EXISTS - DO NOT ADD):
- Metal finish: Show existing polish, texture, and reflection
- Gemstones: Capture existing facet cuts, brilliance
- Craftsmanship: Show prong settings, chain links visible at normal close-up distance
- Surface: Reveal design elements that are visible to the naked eye

LIGHTING SETUP:
- Primary: Soft diffused lighting for even illumination
- Fill: Controlled to prevent harsh shadows
- Accent: Gentle highlights on reflective surfaces
- Professional studio lighting simulation

CAMERA SETTINGS SIMULATION:
- Lens: 100mm Macro lens (1:1 magnification capable)
- Aperture: f/5.6-f/8 equivalent (product fully in focus)
- Focus: Sharp across the entire jewelry piece
- Background: Smooth, non-distracting blur with beautiful 100mm bokeh
- Distance: Close enough to see details, far enough to see the complete product

QUALITY REQUIREMENTS:
- High detail clarity while showing the full product
- True color reproduction for metals and gems
- Professional product photography standards
- The product type must be immediately recognizable

ABSOLUTE STRICT RULES:
- NO hands, skin, or human elements
- Pure product isolation
- ⛔ NEVER modify the jewelry design, shape, stones, or structure
- ⛔ Product must remain 100% IDENTICAL to uploaded image
- ⛔ The ENTIRE product must be visible in frame - no cropping
- Only lighting and background may change
`;
};

// Ana takı görseli oluşturma fonksiyonu
export const generateJewelryImage = async (
    jewelryImage: File,
    settings: JewelrySettings,
    onProgress?: (message: string) => void
): Promise<JewelryGenerationResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Nano Banana Pro model for highest quality jewelry images
        const modelName = "gemini-3-pro-image-preview";

        onProgress?.("🎀 Takı görseli hazırlanıyor...");

        // Process the jewelry image
        const { base64, mimeType } = await processImageForGemini(jewelryImage, 2048, 0.95);

        onProgress?.("💎 Çekim tipi belirleniyor...");

        // JSON-based compact prompt sistemi kullan
        const prompt = buildCompactJSONPromptJewelry(settings);
        const shootingTypeLabel = settings.shootingType === 'velvet-stand' ? 'Kadife Ürün Standı'
            : settings.shootingType === 'on-model' ? 'Model Üzerinde'
            : 'Makro Detay';

        console.log('📋 Compact JSON prompt (Jewelry) kullanılıyor');

        onProgress?.(`📸 ${shootingTypeLabel} çekimi oluşturuluyor...`);

        console.log("🎀 Jewelry Generation - Shooting Type:", settings.shootingType);
        console.log("📸 Using prompt length:", prompt.length);

        const parts: any[] = [
            { inlineData: { data: base64, mimeType: mimeType } },
            { text: prompt }
        ];

        const config: any = {
            imageConfig: {
                imageSize: '2K' // Maximum supported resolution
            },
            safetySettings: SAFETY_SETTINGS,
            generationConfig: {
                temperature: 0.4 // Lower temperature for consistent results
            }
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: config
        });

        const imageData = extractImageFromResponse(response);

        if (imageData) {
            onProgress?.("✅ Takı görseli başarıyla oluşturuldu!");
            console.log("✅ Jewelry image generated successfully");

            return {
                imageData,
                aiModel: modelName,
                shootingType: settings.shootingType
            };
        }

        throw new Error("Takı görseli oluşturulamadı - görsel üretilemedi.");

    } catch (error: any) {
        console.error("Jewelry Generation Error:", error);
        if (error.status === 429) {
            throw new Error("API kota limiti aşıldı (429). Lütfen daha sonra tekrar deneyin.");
        }
        if (error.status === 503 || error.message?.includes('503') || error.message?.includes('overloaded')) {
            throw new Error("Model şu anda meşgul (503). Lütfen birkaç dakika bekleyip tekrar deneyin.");
        }
        throw error;
    }
};

// Çoklu takı görseli oluşturma (batch)
export const generateMultipleJewelryImages = async (
    jewelryImage: File,
    settings: JewelrySettings,
    onProgress?: (message: string, current: number, total: number) => void
): Promise<JewelryGenerationResult[]> => {
    const results: JewelryGenerationResult[] = [];
    const total = settings.numberOfImages;

    for (let i = 0; i < total; i++) {
        onProgress?.(`Görsel ${i + 1}/${total} oluşturuluyor...`, i + 1, total);

        try {
            const result = await generateJewelryImage(
                jewelryImage,
                settings,
                (msg) => onProgress?.(msg, i + 1, total)
            );
            results.push(result);

            // Rate limiting - wait between generations
            if (i < total - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`Görsel ${i + 1} oluşturulurken hata:`, error);
            // Continue with remaining images
        }
    }

    if (results.length === 0) {
        throw new Error("Hiçbir takı görseli oluşturulamadı.");
    }

    return results;
};

// Takı modu prompt önizleme fonksiyonu - UI'da göstermek için
export const buildJewelryPromptPreview = (settings: JewelrySettings): string => {
    // JSON-based compact prompt sistemi kullan
    return buildCompactJSONPromptJewelry(settings);
};

// ==========================================
// ERKEK MODA MODU - MEN'S FASHION MODE
// ==========================================

interface MensFashionGenerationResult {
    imageData: string;
    aiModel: string;
    purpose: string;
}

// Ten rengi açıklamaları (erkek model için)
const MENS_SKIN_TONE_DESCRIPTIONS: { [key: string]: string } = {
    'fair': 'very fair skin with light undertones, Northern European',
    'light': 'light skin, Caucasian with natural healthy complexion',
    'medium-light': 'light olive or beige skin tone, Southern European',
    'medium': 'warm honey or wheat-colored skin, Mediterranean or Latino',
    'medium-dark': 'bronze or caramel skin tone, Middle Eastern or South Asian',
    'dark': 'rich brown or coffee-colored skin, African or Caribbean',
    'deep': 'deep espresso or dark chocolate skin tone, West African'
};

// Arka plan stili açıklamaları
const BACKGROUND_STYLE_DESCRIPTIONS: { [key: string]: string } = {
    'solid': 'clean solid color seamless MATTE backdrop with subtle natural texture variations - NOT perfectly uniform, slight tonal variations like real painted wall, professional studio setting, NON-REFLECTIVE NON-GLOSSY flat paint finish with micro-texture for authenticity',
    'gradient': 'smooth gradient transition from light to darker tones with organic natural feel, elegant depth, MATTE NON-REFLECTIVE finish, subtle imperfections like real studio backdrop',
    'studio-minimal': 'STUDIO_MINIMAL_GRADIENT_PLACEHOLDER', // Bu özel olarak işlenecek
    'marble': 'luxurious marble texture background with realistic natural veining patterns - each vein unique and organic, visible mineral deposits and subtle color variations, HONED MATTE finish NOT polished, authentic stone character',
    'concrete': 'modern concrete or plaster textured wall with realistic imperfections - visible aggregate, subtle cracks, natural color variations, patches and repairs visible, industrial chic aesthetic, raw MATTE NON-REFLECTIVE surface that looks genuinely aged',
    'wood': 'WOOD_TYPE_PLACEHOLDER', // Bu özel olarak işlenecek - woodType parametresine göre
    'architectural': 'classical architectural elements - columns with natural wear, arches with subtle weathering, stone walls with authentic aging, elegant building interior with realistic patina, MATTE surfaces showing history',
    'studio': 'professional photography studio with subtle wear marks on backdrop, slight creases or seams visible like real studio, clean but authentic MATTE backdrop, NON-REFLECTIVE surfaces with real-world character',
    'urban': 'modern city environment with authentic urban details, blurred urban backdrop with realistic street elements, genuine street fashion context with natural city imperfections',
    'nature': 'natural outdoor setting with organic imperfections, soft foliage with varied leaf shapes and colors, greenery with natural light and shadow variations, authentic organic backdrop',
    'minimal': 'ultra-minimalist MATTE backdrop with subtle natural texture - NOT computer-perfect, slight paper or fabric texture visible, maximum focus on subject, NON-REFLECTIVE NON-GLOSSY surface with micro-variations',
    'textured': 'artistic textured background with authentic handmade feel, subtle patterns with natural irregularities, creative visual interest with organic imperfections, MATTE NON-REFLECTIVE finish',
    'floral': 'elegant floral arrangements with realistic botanical details - varying petal shapes, natural wilting edges, organic color variations, romantic atmosphere with authentic flower character',
    'elegant': 'luxurious sophisticated interior with lived-in authenticity, high-end boutique with subtle wear, mansion setting with natural aging patina, MATTE painted walls with real-world character'
};

// Studio Minimal Gradient Backdrop prompt oluşturma fonksiyonu
const buildStudioMinimalGradientPrompt = (colorId: string, vignette: boolean): string => {
    // Renk değerini bul
    const colorOption = STUDIO_MINIMAL_GRADIENT_COLORS.find(c => c.id === colorId);
    const colorValue = colorOption?.value || 'light warm gray';

    // Core prompt (sabit stil)
    const corePrompt = 'Minimal high-end fashion studio background, seamless smooth surface, soft gradient lighting, evenly diffused light, no texture, no pattern, no visible horizon line, clean editorial look, premium menswear photography style, subtle depth separation from subject, realistic studio lighting, neutral contrast balance.';

    // Renk prompt'u
    const colorPrompt = `Background color tone: ${colorValue}.`;

    // Opsiyonel vinyet
    const vignettePrompt = vignette ? 'with a very subtle edge vignette, edges slightly darker than center, smooth falloff.' : '';

    // Negative prompt (constraints)
    const negativeConstraints = `
NEGATIVE FOR BACKGROUND - ABSOLUTELY AVOID:
- no texture, no pattern, no wallpaper, no fabric backdrop
- no wrinkles, no seams, no visible horizon line
- no hard shadows, no harsh spotlight
- no banding, no noise/grain, no color blotches
- no gradients with stripes, no background objects, no props
- no studio equipment visible, no text, no logos, no watermark
- DO NOT use HEX or RGB values - use tone descriptions only
- DO NOT create a flat solid color - maintain soft gradient depth`;

    return `${corePrompt} ${colorPrompt} ${vignettePrompt}

${negativeConstraints}`;
};

// Hayvan ekleme prompt fonksiyonu
const buildAnimalPromptAddition = (animal: AnimalSettings): string => {
    if (!animal || !animal.enabled) return '';

    // Özel hayvan kontrolü
    if (animal.animalType === 'custom' && animal.customAnimal) {
        // Pozisyonu bul
        const position = ANIMAL_POSITIONS.find(p => p.id === animal.position);
        const positionDesc = position?.description || 'Modelin yanında';

        // Pozu bul
        const pose = ANIMAL_POSES.find(p => p.id === animal.pose);
        const poseDesc = pose?.description || 'Sakin oturma pozu';

        // Boyutu bul
        const size = ANIMAL_SIZES.find(s => s.id === animal.size);
        const sizeDesc = size?.description || 'Normal boyut';

        // Bakış yönü
        const lookDir = ANIMAL_LOOK_DIRECTIONS.find(l => l.id === animal.lookDirection);
        const lookDesc = lookDir?.description || 'Doğrudan kameraya bakıyor';

        return `

=== MANDATORY: ADD ANIMAL TO THE IMAGE ===

YOU MUST INCLUDE AN ANIMAL IN THIS IMAGE.
This is NOT optional. The user specifically requested an animal companion.
If the output does not contain an animal = FAILURE.
DO NOT skip this instruction. DO NOT forget the animal.

---

🐾 CUSTOM ANIMAL COMPANION ADDITION 🐾

Include a CUSTOM animal companion in this photo as specified by the user.

CUSTOM ANIMAL DESCRIPTION (USER SPECIFIED):
"${animal.customAnimal}"

⚠️ CRITICAL: Generate EXACTLY the animal described above. Follow the user's description precisely.

ANIMAL PLACEMENT:
- Position: ${positionDesc}
- Pose: ${poseDesc}
- Size: ${sizeDesc}
- Look Direction: ${lookDesc}

QUALITY REQUIREMENTS:
- Photorealistic animal rendering
- Proper texture and detail based on the animal type
- Natural eye reflections and expression
- Correct animal anatomy and proportions
- The animal should look natural and fit the scene
- Proper lighting that matches the scene

=== END CUSTOM ANIMAL ===
`;
    }

    // Hayvan türünü bul
    const animalType = ANIMAL_TYPES.find(a => a.id === animal.animalType);
    const animalName = animalType?.name || 'Köpek';

    // Cinsi bul
    let breedName = '';
    let breedDescription = '';
    switch (animal.animalType) {
        case 'dog':
            const dogBreed = DOG_BREEDS.find(b => b.id === animal.breed);
            breedName = dogBreed?.name || 'Golden Retriever';
            breedDescription = dogBreed?.description || '';
            break;
        case 'cat':
            const catBreed = CAT_BREEDS.find(b => b.id === animal.breed);
            breedName = catBreed?.name || 'İran Kedisi';
            breedDescription = catBreed?.description || '';
            break;
        case 'bird':
            const birdBreed = BIRD_BREEDS.find(b => b.id === animal.breed);
            breedName = birdBreed?.name || 'Papağan';
            breedDescription = birdBreed?.description || '';
            break;
        case 'rabbit':
            const rabbitBreed = RABBIT_BREEDS.find(b => b.id === animal.breed);
            breedName = rabbitBreed?.name || 'Holland Lop';
            breedDescription = rabbitBreed?.description || '';
            break;
        case 'horse':
            const horseBreed = HORSE_BREEDS.find(b => b.id === animal.breed);
            breedName = horseBreed?.name || 'Arap Atı';
            breedDescription = horseBreed?.description || '';
            break;
    }

    // Pozisyonu bul
    const position = ANIMAL_POSITIONS.find(p => p.id === animal.position);
    const positionDesc = position?.description || 'Modelin yanında';

    // Pozu bul
    const pose = ANIMAL_POSES.find(p => p.id === animal.pose);
    const poseDesc = pose?.description || 'Sakin oturma pozu';

    // Boyutu bul
    const size = ANIMAL_SIZES.find(s => s.id === animal.size);
    const sizeDesc = size?.description || 'Normal boyut';

    // Bakış yönü
    const lookDir = ANIMAL_LOOK_DIRECTIONS.find(l => l.id === animal.lookDirection);
    const lookDesc = lookDir?.description || 'Doğrudan kameraya bakıyor';

    return `

=== MANDATORY: ADD ANIMAL TO THE IMAGE ===

YOU MUST INCLUDE AN ANIMAL IN THIS IMAGE.
This is NOT optional. The user specifically requested an animal companion.
If the output does not contain an animal = FAILURE.
DO NOT skip this instruction. DO NOT forget the animal.

---

🐾 ANIMAL COMPANION ADDITION 🐾

ANIMAL SPECIFICATIONS:
- Animal Type: ${animalName}
- Breed: ${breedName} (${breedDescription})
- Position: ${positionDesc}
- Pose: ${poseDesc}
- Size: ${sizeDesc}
- Look Direction: ${lookDesc}

ANIMAL GUIDELINES:
1. The animal should look REALISTIC and HIGH-QUALITY
2. Natural, healthy-looking animal with proper proportions
3. The animal should complement the fashion/model, not distract from it
4. Proper lighting on the animal that matches the scene
5. Natural interaction between model and animal (if appropriate)
6. The animal should be in focus and well-rendered

POSITIONING RULES:
- ${animal.position === 'right' ? 'Place the animal on the RIGHT side of the model' : ''}
- ${animal.position === 'left' ? 'Place the animal on the LEFT side of the model' : ''}
- ${animal.position === 'beside' ? 'Place the animal RIGHT BESIDE the model, very close, side by side - intimate and close proximity' : ''}
- ${animal.position === 'front' ? 'Place the animal in FRONT of the model, slightly lower' : ''}
- ${animal.position === 'behind' ? 'Place the animal BEHIND the model, visible but not blocking' : ''}
- ${animal.position === 'lap' ? 'The model is HOLDING the animal in their lap/arms (for smaller animals)' : ''}
- ${animal.position === 'shoulder' ? 'The animal is perched on the models SHOULDER (for birds)' : ''}
- ${animal.position === 'arms' ? 'The model is CARRYING the animal in their arms' : ''}

ANIMAL POSE:
- ${animal.pose === 'sitting' ? 'The animal is sitting calmly, looking at camera or at the model' : ''}
- ${animal.pose === 'standing' ? 'The animal is standing on all fours, alert and attentive' : ''}
- ${animal.pose === 'lying' ? 'The animal is lying down in a relaxed pose' : ''}
- ${animal.pose === 'walking' ? 'The animal appears to be walking, mid-stride' : ''}
- ${animal.pose === 'playing' ? 'The animal is in a playful pose, energetic' : ''}
- ${animal.pose === 'looking-up' ? 'The animal is looking UP at the model adoringly' : ''}
- ${animal.pose === 'alert' ? 'The animal is alert, ears up, attentive' : ''}
- ${animal.pose === 'relaxed' ? 'The animal is in a relaxed, casual pose' : ''}
- ${animal.pose === 'running' ? 'The animal is running or in dynamic motion' : ''}

LOOK DIRECTION:
- ${animal.lookDirection === 'camera' ? 'The animal is looking DIRECTLY at the CAMERA, making eye contact with the viewer' : ''}
- ${animal.lookDirection === 'model' ? 'The animal is looking at the MODEL adoringly, creating a connection' : ''}
- ${animal.lookDirection === 'forward' ? 'The animal is looking FORWARD, ahead into the distance' : ''}
- ${animal.lookDirection === 'side' ? 'The animal is looking to the SIDE, profile view of the face' : ''}
- ${animal.lookDirection === 'away' ? 'The animal is looking AWAY, gazing into the distance thoughtfully' : ''}

QUALITY REQUIREMENTS:
- Photorealistic animal rendering
- Proper fur/feather texture and detail
- Natural eye reflections and expression
- Correct animal anatomy and proportions
- The animal adds warmth and lifestyle appeal to the photo

=== END ANIMAL ===
`;
};

// Poz açıklamaları (erkek model için)
const MENS_POSE_DESCRIPTIONS: { [key: string]: string } = {
    'straight-standing': 'standing perfectly straight with feet together or slightly apart, BOTH ARMS hanging straight down at sides - NO hands in pockets, NO crossed arms, NO hands on hips - just simple straight standing with arms naturally down, looking directly at camera, classic catalog pose with excellent posture',
    'neutral': 'standing straight with relaxed posture, arms naturally by sides, confident but casual stance',
    'confident': 'standing with slightly widened stance, chin slightly raised, shoulders back, projecting confidence',
    'walking': 'captured mid-stride in natural walking motion, one foot slightly forward, arms in motion',
    'adjusting': 'adjusting jacket lapel or cuffs, hands engaged with clothing in natural styling moment',
    'hands-pocket': 'hands casually in pockets, relaxed hip stance, effortlessly cool demeanor',
    'leaning': 'leaning slightly against invisible surface or shifted weight to one leg, casual sophisticated pose',
    'crossed-arms': 'arms crossed over chest, powerful authoritative stance, confident and strong presence',
    'side-profile': 'turned to show side profile, highlighting jawline and silhouette, dramatic side view',
    'three-quarter': 'body turned at 3/4 angle to camera, dynamic and engaging perspective, shows depth',
    'sitting': 'seated pose on stool or chair, relaxed confident posture, legs positioned naturally',
    'turned-back': 'back facing camera showing rear view of clothing, head slightly turned, mysterious appeal',
    'looking-away': 'gaze directed away from camera, thoughtful contemplative expression, editorial feel',
    'dynamic': 'captured in motion, energetic movement, clothing in natural flow, action shot',
    'casual': 'relaxed everyday stance, natural body language, approachable and authentic feel'
};

// Yaka tipi açıklamaları
const COLLAR_TYPE_DESCRIPTIONS: Record<string, string> = {
    'auto': '',
    'half-turtleneck': 'HALF TURTLENECK / MOCK NECK - The collar covers ONLY HALF of the neck (about 5-7cm high), NOT reaching the chin. It folds over once. This is NOT a full turtleneck.',
    'full-turtleneck': 'FULL TURTLENECK - The collar covers the ENTIRE neck up to the chin (about 10-15cm high). It folds over and reaches high.',
    'v-neck': 'V-NECK - V-shaped opening at the chest, NO collar, the neckline forms a clear V shape.',
    'crew-neck': 'CREW NECK / ROUND NECK - Simple round neckline at the base of the neck, no height, no collar.',
    'round-neck': 'ROUND NECK - Simple circular neckline, flat against the base of the neck.'
};

// Kumaş tipi açıklamaları
const FABRIC_TYPE_DESCRIPTIONS: Record<string, string> = {
    'auto': '',
    'flannel': 'FLANNEL FABRIC - Soft, brushed wool or cotton fabric with a slightly fuzzy, napped texture. Has a warm, cozy appearance with visible soft fibers on the surface. The fabric should look soft and plush.',
    'tweed': 'TWEED FABRIC - Traditional rough, textured woven wool fabric with visible multicolored flecks and a coarse, nubbly surface. Has a rustic, heritage British countryside appearance with distinctive speckled pattern. The fabric should look rugged yet sophisticated, like Harris Tweed or Donegal Tweed.',
    'linen': 'LINEN FABRIC - Natural, lightweight fabric with visible texture and slight wrinkles. Has a crisp, breathable appearance with characteristic natural fiber irregularities. The fabric should look fresh and airy.',
    'wool': 'WOOL FABRIC - Classic woven wool fabric with a smooth, refined finish. Has a structured, professional appearance with subtle texture. The fabric should look premium and tailored.'
};

// Pantolon pile tipi açıklamaları
const PLEAT_TYPE_DESCRIPTIONS: Record<string, string> = {
    'auto': '',
    'double': 'DOUBLE PLEAT (ÇİFT PİLE) - TWO pleats/folds on EACH side of the trouser front. Total of 4 pleats visible from the front (2 on left, 2 on right). The pleats create two distinct fold lines on each side of the zipper. This gives more room and a fuller, more classic look.',
    'single': 'SINGLE PLEAT (TEK PİLE) - ONE pleat/fold on EACH side of the trouser front. Total of 2 pleats visible from the front (1 on left, 1 on right). A single crease/fold line on each side of the zipper. More streamlined than double pleat.',
    'flat': 'FLAT FRONT (DÜZ ÖN / PİLESİZ) - NO pleats at all. The trouser front is completely smooth and flat with no folds or creases at the waistband. Modern, slim, clean look without any pleating.'
};

// Pantolon kesim tipi açıklamaları
const TROUSER_FIT_DESCRIPTIONS: Record<string, string> = {
    'auto': '',
    'wide': `WIDE LEG / BOL KESİM PANTOLON - CLASSIC TAILORING STYLE:

🎯 CRITICAL FIT REQUIREMENTS:
- VERY WIDE leg opening from hip to ankle - minimum 24-26cm leg opening
- The fabric DRAPES LOOSELY and flows freely - NO clinging to legs
- SIGNIFICANT AIR SPACE between fabric and leg throughout
- The trouser leg should billow slightly when walking
- Think: 1940s-1950s classic Hollywood tailoring, Italian sprezzatura style

📐 SILHOUETTE SPECIFICATIONS:
- Full, generous cut through thigh, knee, and ankle
- NO TAPERING - the width stays consistent or even widens slightly toward hem
- The fabric should create SOFT VERTICAL FOLDS when standing
- When model stands with feet together, there should be visible fabric pooling/draping
- The trouser break (where fabric meets shoe) should have multiple soft folds

⚠️ WHAT TO AVOID:
- ⛔ NO skinny or slim appearance
- ⛔ NO fabric clinging to thighs or calves
- ⛔ NO visible leg shape through the fabric
- ⛔ NO modern tapered/carrot fit
- ⛔ NO tight ankle opening

✅ VISUAL CHECK:
- Can you see significant space between leg and fabric? YES = correct
- Does the fabric drape in soft folds? YES = correct
- Could the model fit another leg inside the trouser leg? Almost YES = correct`,

    'relaxed': 'RELAXED FIT (RAHAT KESİM) - Comfortable, moderately loose fit. More room than regular but not as wide as wide-leg. Easy, comfortable drape without being baggy. The fabric has some space from the body but follows general leg shape.',
    'regular': 'REGULAR FIT (NORMAL KESİM) - Standard, classic fit. Not tight, not loose. Follows the natural leg shape with comfortable room. The most common traditional trouser fit. Balanced proportions.',
    'slim': 'SLIM FIT (DAR KESİM) - Narrower cut that follows the leg more closely. Tapered from thigh to ankle but not skin-tight. Modern, streamlined silhouette. Some room but fitted appearance.',
    'skinny': 'SKINNY FIT (ÇOK DAR KESİM) - Very narrow, fitted cut that hugs the leg closely from hip to ankle. Minimal excess fabric. Contemporary, fitted look. The fabric follows every contour of the leg.'
};

// Pantolon kumaş tipi açıklamaları
const TROUSER_FABRIC_DESCRIPTIONS: Record<string, string> = {
    'auto': '',
    'wool': 'WOOL FABRIC (YÜN KUMAŞ) - Classic wool dress fabric with subtle texture and natural drape. Formal and refined appearance. Shows gentle folds and creases typical of quality wool trousers.',
    'cotton': 'COTTON FABRIC (PAMUK KUMAŞ) - Smooth, breathable cotton with matte finish. Casual and comfortable appearance. Light, natural drape with soft texture.',
    'linen': 'LINEN FABRIC (KETEN KUMAŞ) - Natural linen with characteristic texture and slight wrinkles. Breathable summer fabric with relaxed, effortless look. Show natural linen creasing.',
    'denim': 'DENIM FABRIC (DENİM/KOT) - Classic denim with visible weave texture. Sturdy, structured appearance with natural indigo variations. Show authentic denim character.',
    'chino': 'CHINO FABRIC (CHINO KUMAŞ) - Smooth cotton twill with diagonal weave pattern. Smart casual appearance, between formal and casual. Clean, crisp look.',
    'corduroy': 'CORDUROY FABRIC (KADİFE KUMAŞ) - Distinctive vertical ridges (wales) visible on the fabric surface. Soft, textured appearance with depth. Show the characteristic corduroy ribbing.',
    'tweed': 'TWEED FABRIC (TWEED KUMAŞ) - Woven wool with visible texture and color variations. Heritage, vintage appearance. Show the characteristic rough, textured surface.',
    'flannel': 'FLANNEL FABRIC (FLANNEL KUMAŞ) - Soft brushed wool with slight fuzzy texture. Warm, cozy appearance suitable for autumn/winter. Gentle drape with matte finish.',
    'gabardine': 'GABARDINE FABRIC (GABARDİN KUMAŞ) - Tightly woven, smooth fabric with diagonal twill weave. Formal, structured appearance. Clean lines and sharp creases.',
    'stretch': 'STRETCH FABRIC (STREÇ KUMAŞ) - Modern fabric with visible flexibility and body-conforming fit. Sleek, contemporary appearance. Shows smooth contours following body shape.'
};

// =====================================================
// TROUSER WAIST RISE - DETERMINISTIC MAPPER SYSTEM
// =====================================================

interface WaistRisePromptInjection {
    positive_injection: string;
    negative_constraints: string[];
}

// Rule-based mapping using anatomical anchors and tailoring terms
const TROUSER_WAIST_RISE_MAPPING: Record<string, WaistRisePromptInjection> = {
    'low': {
        positive_injection: 'Low-rise trousers. Waistband sits below the hip bones, resting on the hips. The shirt/top hangs OVER the waistband, NOT tucked in.',
        negative_constraints: ['high-waisted', 'mid-rise', 'waistband above natural waist', 'near navel', 'tucked in shirt']
    },
    'mid': {
        positive_injection: 'Mid-rise trousers. Waistband sits at the natural waist/upper-hip transition, approximately at belly button level or slightly below.',
        negative_constraints: ['low-rise', 'high-waisted', 'waistband near navel', 'waistband at hip bones']
    },
    'high': {
        positive_injection: `🚨🚨🚨🚨🚨 HIGH-RISE WAISTBAND - #1 PRIORITY INSTRUCTION 🚨🚨🚨🚨🚨

⛔⛔⛔ STOP! READ THIS FIRST! ⛔⛔⛔
"HIGH-RISE" = WAISTBAND SITS HIGH ON THE BODY (at NAVEL/belly button level)
"HIGH-RISE" ≠ longer trouser legs at ankles!

THE WAISTBAND/BELT MUST BE POSITIONED AT THE NAVEL (GÖBEK) LEVEL!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📏 BODY PROPORTION RULE - MANDATORY:
┌─────────────────────────────────────────┐
│  HEAD                                   │
│  SHOULDERS                              │
│  CHEST          ← 25% of body height    │
│  ══════════════ ← WAISTBAND HERE (NAVEL)│
│  LEGS           ← 75% of body height    │
│  FEET                                   │
└─────────────────────────────────────────┘

The distance from SHOULDER to WAISTBAND should be SHORT (only 25%)
The distance from WAISTBAND to FEET should be LONG (75% of body)

🎯 EXACT WAISTBAND POSITION:
- MUST be at BELLY BUTTON (göbek deliği) level
- MUST be 5-8 cm ABOVE the hip bones
- The belt buckle should be at NAVEL height
- NO belly skin visible between shirt and waistband

📐 VISUAL MEASUREMENT:
If the model is 180cm tall:
- Shoulder to waistband = ~45cm (short torso)
- Waistband to floor = ~135cm (long legs)

👔 SHIRT STYLING - CRITICAL:
- Shirt MUST be TUCKED IN completely
- Waistband and belt MUST be clearly VISIBLE
- NO loose shirt covering the waistband

🎬 REFERENCE STYLE: Classic 1940s tailoring, vintage menswear, Fred Astaire proportions

❌ REJECT IF: Belt/waistband is at hip level (kalça hizası)
❌ REJECT IF: More torso visible than legs
❌ REJECT IF: Modern low-rise jean fit`,
        negative_constraints: ['waistband at hips', 'waistband below navel', 'low waistband', 'hip-level belt', 'long torso visible', 'belly visible', 'untucked shirt', 'modern jean fit', 'waistband at hip bones', 'normal modern fit', 'belt at hip level', 'kalça hizası bel']
    },
    'ultra_high': {
        positive_injection: `🚨🚨🚨🚨🚨 ULTRA HIGH-RISE - ÇOK YÜKSEK BEL 🚨🚨🚨🚨🚨

⛔⛔⛔ CRITICAL - ULTRA HIGH RISE TROUSER FIT DEFINITION ⛔⛔⛔

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 WAIST RISE POSITION:
- Level: ULTRA HIGH RISE (Çok Yüksek Bel)
- Position: WELL ABOVE NAVEL (göbek üstünde)
- Anatomical Anchor: Waistband aligns close to LOWER RIB CAGE (alt kaburga hizası)
- Visual: Waistline must sit VISIBLY HIGHER than standard high-waist trousers

📐 RISE STRUCTURE:
- Front Rise: EXTENDED (uzatılmış)
- Back Rise: EXTENDED (uzatılmış)
- Crotch Depth: DEEP (derin)
- Effect: Elongated leg line with shortened torso perception

📏 BODY PROPORTION:
┌─────────────────────────────────────────┐
│  HEAD                                   │
│  SHOULDERS      ← 15% of body height    │
│  ══════════════ ← WAISTBAND (rib cage)  │
│  LEGS           ← 85% of body height    │
│  FEET                                   │
└─────────────────────────────────────────┘

🦵 HIP AND THIGH FIT:
- Hip: CLEAN FITTED (temiz oturmuş)
- Upper Thigh: RELAXED (rahat)
- Volume Distribution: Fabric volume begins from the HIP, not the knee

👖 LEG SILHOUETTE:
- Type: STRAIGHT WIDE (düz geniş)
- Knee Behavior: NO TAPERING (daralma yok)
- Hem Width: MODERATELY WIDE (orta geniş paça)
- Fall: VERTICAL and FLUID from hip to hem

🧵 CREASE AND DRAPE:
- Front Crease: SOFT CENTER CREASE (yumuşak orta ütü çizgisi)
- Fabric Behavior: GRAVITY-LED DRAPE (yerçekimi ile düşüş)
- Wrinkling: MINIMAL, CONTROLLED (minimal kırışıklık)

👔 SHIRT STYLING - MANDATORY:
- Shirt DEEPLY TUCKED into ultra high waistband
- Waistband is the DOMINANT visual feature
- Almost no torso visible

🎬 REFERENCE: 1930s-40s high-waisted tailoring, vintage menswear

⛔ FIT RESTRICTIONS - DO NOT DO THESE:
- ❌ Mid-rise fit
- ❌ Standard high-rise (normal yüksek bel)
- ❌ Low crotch drop
- ❌ Tapered leg (daralan paça)
- ❌ Skinny or slim interpretations

❌ REJECT IF: Waistband at belly button level or below
❌ REJECT IF: Normal torso proportions visible
❌ REJECT IF: Modern slim/tapered leg appearance`,
        negative_constraints: ['waistband at navel', 'waistband at hips', 'waistband below ribcage', 'normal waist position', 'hip-level belt', 'mid-rise', 'standard high-rise', 'low crotch drop', 'tapered leg', 'skinny fit', 'slim fit', 'untucked shirt', 'modern fit', 'normal leg proportions', 'göbek hizası bel', 'kalça hizası bel']
    }
};

// Modular mapper function - returns structured injection data
const getWaistRiseInjection = (waistRise: string): WaistRisePromptInjection | null => {
    if (!waistRise || waistRise === 'auto') return null;
    return TROUSER_WAIST_RISE_MAPPING[waistRise] || null;
};

// Compose waist rise prompt block from injection data
const composeWaistRisePrompt = (injection: WaistRisePromptInjection): string => {
    const negativeList = injection.negative_constraints.map(c => `- ⛔ ${c}`).join('\n');
    return `
╔════════════════════════════════════════════════════════════════════╗
║  🚨 WAISTBAND POSITION INSTRUCTION - READ BEFORE GENERATING 🚨    ║
╚════════════════════════════════════════════════════════════════════╝

${injection.positive_injection}

❌ DO NOT DO THESE:
${negativeList}

⚠️ BODY REFERENCE (top to bottom):
┌─────────────────┐
│   SHOULDERS     │
│   CHEST         │
│   RIBCAGE       │ ← Ultra-high waistband here
│   NAVEL         │ ← High waistband here
│   HIPS          │ ← Normal/low waistband here
│   LEGS          │
│   FEET          │
└─────────────────┘
`;
};

// =====================================================
// KNITWEAR (TRİKO) TYPE DESCRIPTIONS
// =====================================================
const KNITWEAR_TYPE_DESCRIPTIONS: Record<string, string> = {
    'auto': '',
    'polo-knit': `POLO COLLAR KNITWEAR (POLO YAKA TRİKO):
- Knitted sweater/top with a classic polo collar (folded collar with 2-3 buttons)
- Ribbed collar that can be worn up or folded down
- The collar should be clearly visible and well-defined
- Typical of refined, smart-casual knitwear style`,
    'crew-neck': `CREW NECK KNITWEAR (BİSİKLET YAKA TRİKO):
- Round neckline that sits at the base of the neck
- No collar, just a ribbed round opening
- Classic, timeless knitwear silhouette
- The neckline should be neat and well-fitted, not stretched`,
    'v-neck': `V-NECK KNITWEAR (V YAKA TRİKO):
- V-shaped neckline that creates a flattering line
- The V should be moderate depth (not too deep, not too shallow)
- Often worn over a shirt for layered look
- Elongates the neck and face`,
    'turtleneck': `TURTLENECK KNITWEAR (BALIKÇI YAKA TRİKO):
- High, close-fitting collar that covers the entire neck
- The collar typically folds over once or twice
- Also known as roll-neck or polo-neck
- Creates a sophisticated, refined appearance`,
    'mock-neck': `MOCK NECK KNITWEAR (YARIM BALIKÇI TRİKO):
- Shorter version of turtleneck - covers only part of the neck
- Does not fold over, stands up on its own
- Height typically 2-3 inches
- Modern, clean aesthetic`,
    'cardigan': `CARDIGAN KNITWEAR (HIRKA):
- Open-front knitted garment with buttons or no closure
- Can be V-neck or round neck at front opening
- Worn open or buttoned
- Layering piece, casual or smart-casual`,
    'zip-knit': `ZIP-FRONT KNITWEAR (FERMUARLI TRİKO):
- Knitwear with front zipper (half-zip or full-zip)
- Half-zip typically has zipper from chest to collar
- Full-zip opens completely like a jacket
- Sporty-casual to smart-casual aesthetic`
};

// =====================================================
// SHIRT TUCK DESCRIPTIONS (İÇİNDE/DIŞINDA)
// =====================================================
const SHIRT_TUCK_DESCRIPTIONS: Record<string, string> = {
    'auto': '',
    'tucked': `FULLY TUCKED IN (TAMAMEN İÇİNDE):
🎯 CRITICAL STYLING REQUIREMENT:
- The shirt/sweater/top MUST be completely tucked into the trousers
- The waistband of the trousers MUST be clearly visible
- The belt (if present) MUST be fully visible
- NO fabric hanging over or covering the waistband
- Creates clean, tailored, formal appearance
- Essential for high-waisted trouser styling
- Think: Classic menswear, Italian tailoring, 1940s-1950s style

⚠️ VISUAL CHECK:
- Can you see the entire trouser waistband? YES = correct
- Is any shirt fabric hanging over the belt? NO = correct
- Is the belt fully visible? YES = correct`,

    'untucked': `UNTUCKED / WORN OUT (DIŞARIDA):
- The shirt/sweater/top hangs freely OVER the trousers
- The waistband is partially or fully covered by the top
- More casual, relaxed appearance
- The hem of the top should fall naturally
- Creates a more contemporary, casual silhouette

⚠️ VISUAL CHECK:
- Does the shirt/sweater cover the waistband? YES = correct
- Is the hem hanging freely? YES = correct`,

    'half-tucked': `HALF TUCKED / FRENCH TUCK (YARIM İÇİNDE):
- Only the FRONT of the shirt is tucked in
- The BACK and SIDES remain untucked
- Creates an effortlessly stylish, modern look
- Shows the belt/waistband at the front only
- Popular contemporary styling technique

⚠️ VISUAL CHECK:
- Is the front tucked showing the belt? YES = correct
- Is the back hanging loose? YES = correct`
};

// =====================================================
// SPALLA CAMICIA DESCRIPTIONS (OMUZ DİKİŞİ)
// =====================================================
const SPALLA_CAMICIA_DESCRIPTIONS: Record<string, string> = {
    'auto': '',
    'full': `🎯 FULL SPALLA CAMICIA (TAM GÖMLEK OMUZ):
CRITICAL SHOULDER CONSTRUCTION REQUIREMENT:
- The jacket shoulder seam MUST extend BEYOND the natural shoulder line
- Sleeve head MUST have pronounced gathering/ruffling (like a shirt)
- Creates a visible "puckered" or "shirred" effect at shoulder seam
- The sleevehead should look SOFT and ROLLED, not sharp/structured
- NO shoulder padding or minimal padding only
- Italian Neapolitan tailoring signature look
- Shoulder seam sits 1-2cm past the shoulder point

⚠️ VISUAL CHECK:
- Can you see gathered/ruffled fabric at shoulder seam? YES = correct
- Does the shoulder look soft and unstructured? YES = correct
- Is there a visible "shirt-like" sleeve attachment? YES = correct`,

    'half': `🎯 HALF SPALLA CAMICIA (YARIM GÖMLEK OMUZ):
SUBTLE SHOULDER CONSTRUCTION:
- The jacket shoulder has a SUBTLE gathered effect
- Sleeve head has minimal, refined gathering (not dramatic)
- Shoulder seam sits at or slightly past natural shoulder line
- Soft shoulder but less pronounced than full spalla camicia
- A balance between structured and Neapolitan style
- Light, natural shoulder line with gentle roll

⚠️ VISUAL CHECK:
- Is there a subtle gathering at the shoulder? YES = correct
- Does it look softer than a regular structured shoulder? YES = correct
- Is the effect refined rather than dramatic? YES = correct`,

    'none': `STANDARD SHOULDER (NORMAL OMUZ):
- Regular structured shoulder construction
- NO gathering or ruffling at sleeve head
- Clean, sharp shoulder seam
- May have shoulder padding for structure
- Traditional British or American tailoring style
- Defined, angular shoulder line`
};

// Kamera çerçevesi açıklamaları - ZORUNLU UYULMASI GEREKEN KURALLAR
const CAMERA_FRAME_DESCRIPTIONS: Record<string, string> = {
    'full-body': `🚨🚨🚨 ABSOLUTE REQUIREMENT: FULL BODY SHOT 🚨🚨🚨
⛔ IF FEET ARE NOT VISIBLE = OUTPUT IS REJECTED ⛔
⛔ IF IMAGE IS CROPPED AT KNEES = OUTPUT IS REJECTED ⛔

MANDATORY REQUIREMENTS:
✅ Show ENTIRE model from TOP OF HEAD to BOTTOM OF FEET
✅ BOTH FEET must be FULLY VISIBLE in the frame
✅ Feet must be shown TOUCHING THE GROUND/FLOOR
✅ Leave small margin below feet (5-10% of image height)
✅ Leave small margin above head (5-10% of image height)

❌ FORBIDDEN:
- Do NOT crop at knees (this is 3/4 shot, NOT full body)
- Do NOT crop at waist (this is waist-up, NOT full body)
- Do NOT crop at ankles (feet MUST be visible)
- Do NOT cut off any part of the model's body

📏 COMPOSITION CHECK:
- Can you see the model's head? ✓
- Can you see the model's torso? ✓
- Can you see the model's legs? ✓
- Can you see the model's FEET on the ground? ✓ ← THIS IS CRITICAL
- If any answer is NO = WRONG FRAMING`,
    '3/4': `🚨 MANDATORY: 3/4 SHOT 🚨
- Show model from HEAD to KNEE level
- Cut off BELOW the knees but ABOVE the feet
- Do NOT show feet, do NOT cut at waist
- Frame approximately three-quarters of the body`,
    'waist-up': `🚨 MANDATORY: WAIST UP SHOT 🚨
- Show model from WAIST/BELT level to TOP OF HEAD
- Cut off at the waist/hip area
- Do NOT show legs or feet
- Perfect for upper body garments`,
    'waist-down': `🚨 MANDATORY: WAIST DOWN SHOT 🚨
- Show model from WAIST/BELT level DOWN TO FEET
- Include feet touching the ground
- Cut off at the waist
- Perfect for lower body garments and shoes`,
    'head': `🚨 MANDATORY: HEAD SHOT - FULL HEAD WITH HAIR 🚨
⚠️ THE COMPLETE HEAD INCLUDING ALL HAIR MUST BE VISIBLE ⚠️

MANDATORY REQUIREMENTS:
✅ Show the ENTIRE HEAD from TOP OF HAIR to CHIN/NECK
✅ ALL HAIR must be visible - do NOT crop the top of the head
✅ The full hairstyle shape must be shown
✅ Face clearly visible with all features
✅ Small margin above the hair (5-10% of image height)
✅ Can include neck and top of shoulders

❌ FORBIDDEN:
- Do NOT crop or cut off the top of the head
- Do NOT cut off any part of the hair
- Do NOT show only the face without the full head shape
- Do NOT frame so tight that hair is cropped

📏 COMPOSITION CHECK:
- Can you see the TOP of the model's hair? ✓ ← CRITICAL
- Can you see the model's full hairstyle shape? ✓
- Can you see the forehead, eyes, nose, mouth, chin? ✓
- Is there margin above the hair? ✓

This framing applies to ALL camera angles - whether front, side, or back view,
the COMPLETE HEAD with FULL HAIR must always be visible.`
};

// Zemin tipi açıklamaları
const FLOOR_TYPE_DESCRIPTIONS: Record<string, string> = {
    'seamless': 'FLAT MATTE seamless studio floor at ground level, wall meets floor directly with NO platform or raised surface, NON-REFLECTIVE NON-GLOSSY surface',
    'white': 'FLAT MATTE white studio floor at ground level, NO platform, NO raised surface, wall meets floor directly, NON-REFLECTIVE NON-GLOSSY matte finish',
    'light-gray': 'FLAT MATTE light gray studio floor at ground level, NO platform or pedestal, NON-REFLECTIVE NON-GLOSSY surface',
    'dark-gray': 'FLAT MATTE dark charcoal gray floor at ground level, NO platform or raised area, NON-REFLECTIVE NON-GLOSSY surface',
    'concrete': 'FLAT MATTE concrete floor at ground level, NO platform or step, rough texture NON-REFLECTIVE NON-GLOSSY surface',
    'wood-light': 'FLAT MATTE light oak hardwood floor at ground level, NO platform or raised surface, natural wood grain NON-GLOSSY satin finish',
    'wood-dark': 'FLAT MATTE dark walnut hardwood floor at ground level, NO platform or pedestal, natural wood grain NON-GLOSSY satin finish',
    'marble-white': 'FLAT MATTE white Carrara marble floor at ground level, NO platform or raised area, honed NON-GLOSSY finish NOT polished',
    'marble-black': 'FLAT MATTE black marble floor at ground level, NO platform or step, honed NON-GLOSSY finish NOT polished',
    'tile-white': 'FLAT MATTE white ceramic tile floor at ground level, NO platform or raised surface, NON-REFLECTIVE NON-GLOSSY matte tiles',
    'reflective': 'FLAT polished reflective floor at ground level with mirror-like reflection, NO platform or pedestal'
};

// Işık Stili Açıklamaları (Lighting Style Descriptions)
const LIGHTING_STYLE_DESCRIPTIONS: Record<string, string> = {
    'soft-studio': `
SOFT STUDIO LIGHTING:
- Even, wrap-around soft illumination across the subject
- Very soft shadows, almost shadowless
- Clean, professional e-commerce look
- Color temperature: Neutral daylight (5500K)
- NO harsh highlights, NO deep shadows
- ⚠️ CRITICAL: Do NOT show any light sources, softboxes, light stands, or lighting equipment in the image
- ⚠️ NO visible light spots, lens flares, or light reflections on the background
- ⚠️ The lighting effect should be INVISIBLE - only the RESULT of the lighting matters
- Background must remain clean and uninterrupted - NO light circles or spots
- Only the model and the specified background should be visible`,
    'dramatic': `
DRAMATIC LIGHTING:
- Strong key light from 45 degrees
- Minimal fill for deep, defined shadows
- High contrast between light and shadow areas
- Creates mood and dimension
- Emphasizes texture and form
- Editorial/advertising aesthetic`,
    'natural-window': `
NATURAL WINDOW LIGHTING:
- Soft, directional daylight effect from one side
- Simulates the QUALITY of window light - NOT an actual visible window
- DO NOT show any window, frame, glass, or window reflection in the image
- NO window visible in background or reflection - ONLY the lighting effect
- Soft, gradual light fall-off across the subject
- Natural, organic feeling with gentle shadows on opposite side
- Warm undertones, like natural daylight
- The background remains as specified - NO window elements added`,
    'high-key': `
HIGH KEY LIGHTING:
- Very bright, overexposed background
- Multiple light sources for even coverage
- Minimal to no shadows
- Clean, airy, fresh aesthetic
- Background brighter than subject
- Fashion catalog/beauty commercial style`,
    'low-key': `
LOW KEY LIGHTING:
- Dark, moody atmosphere
- Single focused light source
- Deep shadows, dramatic contrast
- Subject emerges from darkness
- Luxury, premium, mysterious feel
- High-end fashion editorial style`,
    'golden-hour': `
GOLDEN HOUR LIGHTING:
- Warm, golden color temperature (3000-4000K)
- Soft, directional side light
- Long, soft shadows
- Romantic, dreamy atmosphere
- Skin-flattering warm tones
- Natural outdoor sunset simulation`,
    'ring-light': `
RING LIGHT LIGHTING:
- Even, frontal illumination
- Characteristic ring reflection in eyes
- Minimal shadows (shadow falls directly behind subject)
- Flattering for portraits
- Clean, modern social media aesthetic
- Smooth, even skin rendering`,
    'split': `
SPLIT LIGHTING:
- Light hits exactly half of face/body
- Other half in shadow
- Very dramatic, artistic effect
- Strong contrast between lit and shadow side
- Moody, editorial photography style
- Creates strong visual interest`
};

// Ahşap Tipi Açıklamaları (Wood Type Descriptions)
// IMPORTANT: All wood types use VERTICAL orientation for consistency
const WOOD_TYPE_DESCRIPTIONS: Record<string, string> = {
    'oak-light': 'Light oak wood panel wall with VERTICAL planks running top to bottom, natural grain patterns, blonde to honey tones, modern Scandinavian aesthetic, visible wood knots and grain variations for authenticity, planks arranged VERTICALLY',
    'walnut-dark': 'Rich dark walnut wood paneling with VERTICAL planks running top to bottom, deep brown tones with elegant grain, luxurious and sophisticated feel, natural color variations and wood character, planks arranged VERTICALLY',
    'reclaimed': 'Vintage reclaimed wood wall with VERTICAL planks running top to bottom, weathered patina, mixed tones from grey to brown, visible nail holes and imperfections, authentic aged character with history, planks arranged VERTICALLY',
    'barnwood': 'Weathered barn wood with VERTICAL planks running top to bottom, rustic grey-brown tones with authentic wear marks, gaps between boards, farmhouse chic aesthetic with genuine aged texture, planks arranged VERTICALLY',
    'herringbone': 'Classic herringbone pattern wood wall with diagonal interlocking planks in V-shape pattern, timeless elegance, medium brown tones with sophisticated geometric pattern, CONSISTENT diagonal pattern throughout',
    'shiplap': 'HORIZONTAL shiplap wood planks running left to right, white-washed or light grey finish, coastal farmhouse style, visible gaps between boards, clean but textured, ALL planks running HORIZONTALLY',
    'cedar': 'Natural cedar wood wall with VERTICAL planks running top to bottom, warm reddish-brown tones, distinctive cedar grain and aroma aesthetic, rustic warmth with natural knots, planks arranged VERTICALLY',
    'bamboo': 'Light bamboo panel wall with VERTICAL bamboo stalks/strips running top to bottom, pale yellow-tan tones, minimal zen aesthetic, natural grain pattern, clean and organic, bamboo arranged VERTICALLY'
};

// Baseboard/Süpürgelik/Platform yasağı - tüm promptlarda kullanılacak
const NO_BASEBOARD_RULE = `
⚠️⚠️⚠️ CRITICAL - FLAT FLOOR ONLY - NO RAISED ELEMENTS ⚠️⚠️⚠️

❌ FORBIDDEN - DO NOT ADD ANY OF THESE:
- NO baseboard, molding, skirting board, or trim
- NO raised platform, stage, or pedestal
- NO step, ledge, or elevated surface
- NO curved cove or cyclorama transition
- NO shadow gap or recessed line at wall-floor junction
- NO any architectural detail between wall and floor

✅ REQUIRED - SIMPLE FLAT SETUP:
- Wall goes STRAIGHT DOWN to floor level
- Floor is COMPLETELY FLAT at ground level
- Wall and floor meet at a simple 90-degree angle
- Like standing in an empty room - wall ends, flat floor begins
- The model stands on a FLAT, LEVEL floor surface
- NO elevation change between background and floor

🎯 VISUALIZATION:
Imagine a simple empty room: vertical wall meets horizontal floor.
That's it. No platforms, no curves, no steps, no nothing.
Just wall → floor. Simple. Flat. Clean.
`;

// Kamera açısı açıklamaları
const CAMERA_ANGLE_DESCRIPTIONS: Record<string, string> = {
    'eye-level': 'EYE LEVEL ANGLE - Camera at model eye height, straight-on view, natural and professional perspective',
    'slight-low': 'SLIGHT LOW ANGLE - Camera slightly below eye level, looking up at model, creates powerful and confident appearance',
    'slight-high': 'SLIGHT HIGH ANGLE - Camera slightly above eye level, looking down at model, creates elegant and slender appearance',
    'low-angle': 'LOW ANGLE - Camera significantly below model, dramatic upward view, creates powerful and dominant presence',
    'high-angle': 'HIGH ANGLE - Camera above model, editorial downward view, artistic fashion photography style'
};

// =====================================================
// SHOT SCALE / CAMERA ANGLE / LENS DESCRIPTIONS (Prompt Tab Style)
// =====================================================

const SHOT_SCALE_DESCRIPTIONS: Record<string, string> = {
    "extreme_closeup_eye": "EXTREME CLOSE-UP (EYE) - Frame ONLY the eye area. Macro detail.",
    "extreme_closeup_mouth": "EXTREME CLOSE-UP (MOUTH) - Frame ONLY the mouth/lips area.",
    "extreme_closeup_head": "EXTREME CLOSE-UP (HEAD) - Face fills the entire frame, forehead to chin.",
    "extreme_closeup_left_profile": "LEFT PROFILE - Full head from left side, 90° profile view.",
    "extreme_closeup_right_profile": "RIGHT PROFILE - Full head from right side, 90° profile view.",
    "closeup": "CLOSE-UP (HEAD/SHOULDER) - From top of head to shoulders.",
    "medium_closeup": "MEDIUM CLOSE-UP (CHEST) - Cut at sternum level. Head, neck, shoulders, upper chest.",
    "medium_shot": "MEDIUM SHOT (WAIST) - Cut at waist level. Upper body from waist up.",
    "full_shot": "FULL BODY SHOT - Complete body from head to toe. FEET MUST BE VISIBLE.",
    "wide_shot": "WIDE SHOT - Subject occupies 50-60% of frame. Environment context visible.",
    "extreme_wide": "EXTREME WIDE SHOT - Subject occupies 20-30% of frame. More background visible.",
    "long_distance": "LONG DISTANCE - Subject occupies 10-15% of frame. Very far camera position.",
    "detail_sleeve_cuff": "DETAIL SHOT - Sleeve/cuff area macro. Buttons, stitching, fabric texture.",
    "detail_collar_chest": "DETAIL SHOT - Collar/chest area close-up. Lapels, collar structure.",
    "detail_fabric_texture": "DETAIL SHOT - Fabric texture macro. Weave pattern, material quality.",
    "detail_button_macro": "DETAIL SHOT - Button macro. Button material, stitching, buttonhole.",
    "kadir5": "KADIR 5 - Detail shot, side view, waist level. Focus on clothing details.",
    "kadir6": "KADIR 6 - Full body, 3/4 angle, eye level. Dynamic fashion editorial.",
    "kadir7": "KADIR 7 - Medium shot, back view, eye level. Back of clothing details.",
    "kadir8": "KADIR 8 - Waist down, front view, waist level. Pants/shoes focus.",
    "kadir10": "KADIR 10 - Waist down, back view, waist level. Back of pants/shoes."
};

const PROMPT_CAMERA_ANGLE_DESCRIPTIONS: Record<string, string> = {
    "worms_eye": "WORM'S EYE VIEW - Camera on ground, 90° straight up. Extreme dramatic effect.",
    "extreme_low": "EXTREME LOW ANGLE - Camera at ankle height, 60° up. Powerful, dominant.",
    "low_angle": "LOW ANGLE - Camera at waist height, 30-45° up. Heroic, confident.",
    "slight_low": "SLIGHT LOW ANGLE - Camera slightly below eye level, 15° up. Flattering.",
    "eye_level": "EYE LEVEL - Camera at exact eye level, 0° tilt. Neutral, natural.",
    "slight_high": "SLIGHT HIGH ANGLE - Camera slightly above eye level, 15° down. Approachable.",
    "high_angle": "HIGH ANGLE - Camera above head, 30-45° down. Editorial, artistic.",
    "extreme_high": "EXTREME HIGH ANGLE - Camera well above subject, 60° down.",
    "birds_eye": "BIRD'S EYE VIEW - Camera directly above, 90° straight down.",
    "dutch_angle": "DUTCH ANGLE - Camera tilted 15-30° to the side. Dynamic, tension.",
    "over_shoulder": "OVER SHOULDER - Camera behind subject at shoulder level, showing back."
};

const LENS_DESCRIPTIONS: Record<string, string> = {
    "8mm_fisheye": "8mm Fisheye - Extreme barrel distortion, 180° field of view.",
    "14mm_ultra": "14mm Ultra Wide - Wide perspective, slight distortion at edges.",
    "24mm_wide": "24mm Wide - Natural wide angle, minimal distortion.",
    "35mm_classic": "35mm Classic - Classic documentary/street photography look.",
    "50mm_natural": "50mm Natural - Closest to human eye perspective. No distortion.",
    "85mm_portrait": "85mm Portrait - Classic portrait lens. Gentle compression, beautiful bokeh.",
    "135mm_tele": "135mm Telephoto - Strong compression, subject isolation, creamy bokeh.",
    "200mm_tele": "200mm Telephoto - Maximum compression, extremely shallow depth of field.",
    "anamorphic": "Anamorphic - Cinematic look with horizontal lens flares and oval bokeh."
};

// =====================================================
// JSON-BASED COMPACT PROMPT SYSTEM
// =====================================================

// Builds a compact JSON-based prompt with only selected settings
const buildCompactJSONPrompt = (settings: MensFashionSettings, gender: 'male' | 'female' = 'male'): string => {
    // Arka plan hex kodunu al
    const bgInfo = MENS_FASHION_BACKGROUNDS.find(b => b.id === settings.background);
    const bgHex = bgInfo?.hex || '#FFFFFF';
    const bgName = bgInfo?.name || 'Beyaz';

    // JSON sadece seçilen değerlerle oluşturulur
    const config: Record<string, any> = {
        task: "dress_model_with_input_clothing",
        gender: gender
    };

    // Sadece seçilen ayarları ekle
    if (settings.skinTone && settings.skinTone !== 'auto') config.skinTone = settings.skinTone;
    if (settings.poseStyle && settings.poseStyle !== 'auto') config.pose = settings.poseStyle;
    if (settings.background) config.background = { color: bgName, hex: bgHex };
    if (settings.shotScale && settings.shotScale !== 'auto') config.shotScale = settings.shotScale;
    if (settings.cameraAngle && settings.cameraAngle !== 'auto') config.cameraAngle = settings.cameraAngle;
    if (settings.lens && settings.lens !== 'auto') config.lens = settings.lens;
    if (settings.lightingStyle && settings.lightingStyle !== 'auto') config.lighting = settings.lightingStyle;
    if (settings.aspectRatio) config.aspectRatio = settings.aspectRatio;

    // Kıyafet modifikasyonları - sadece aktifse
    if (settings.jacketHemLengthen) config.jacketHemLengthen = true;
    if (settings.removeBrooch) config.removeBrooch = true;
    if (settings.trouserLegLengthen) config.trouserLegLengthen = true;
    if (settings.shirtTuck && settings.shirtTuck !== 'auto') config.shirtTuck = settings.shirtTuck;

    // Özel talimat varsa
    if (settings.customPrompt) config.customInstruction = settings.customPrompt;

    return `GÖREV: Verilen TÜM kıyafetleri ${gender === 'male' ? 'erkek' : 'kadın'} mankene giydir.

🔒 TUTARLILIK KURALLARI - MUTLAKA UYGULA 🔒

1. MODEL AYARLARI (Seçilen değerleri AYNEN kullan):
${config.skinTone ? `   - Ten Rengi: ${config.skinTone} (BUNU KULLAN, değiştirme)` : '   - Ten Rengi: Otomatik'}
${config.pose ? `   - Poz: ${config.pose} (BUNU KULLAN, değiştirme)` : '   - Poz: Otomatik'}
${config.background ? `   - Arka Plan: ${config.background.color} ${config.background.hex} (BUNU KULLAN)` : ''}
${config.lighting ? `   - Işıklandırma: ${config.lighting} (BUNU KULLAN)` : ''}
${config.shotScale ? `   - Çekim Ölçeği: ${SHOT_SCALE_DESCRIPTIONS[config.shotScale] || config.shotScale} (BUNU KULLAN)` : ''}
${config.cameraAngle ? `   - Kamera Açısı: ${PROMPT_CAMERA_ANGLE_DESCRIPTIONS[config.cameraAngle] || config.cameraAngle} (BUNU KULLAN)` : ''}
${config.lens ? `   - Lens: ${LENS_DESCRIPTIONS[config.lens] || config.lens} (BUNU KULLAN)` : ''}

2. SEÇİLEN AYARLARIN DIŞINA ÇIKMA:
   - Farklı ten rengi kullanma
   - Farklı poz yapma
   - Farklı arka plan koyma
   - Ayarlarda olmayan şey ekleme

AYARLAR:
${JSON.stringify(config, null, 2)}

🔍 OTOMATİK KIYAFET TESPİTİ:
Her input görselini analiz et ve ne olduğunu belirle:
- Ceket/Blazer/Mont → Gömleğin ÜSTÜNE giydir
- Gömlek/Tişört → İç katman olarak giydir
- Pantolon/Şort → Alt giyim olarak giydir
- Ayakkabı → Ayağa giydir
- Kravat/Papyon → Boyuna tak
- Kemer → Bele tak
- Diğer aksesuarlar → Uygun yere yerleştir

⚠️ KATEGORİ ÖNEMSİZ - HER GÖRSELİ KULLAN!
Hangi kategori seçili olursa olsun, verilen TÜM görselleri giydir.
Görseldeki ürünü otomatik olarak tanı ve modele giydir.

MUTLAK KURALLAR:
1. TÜM INPUT GÖRSELLERİ = Kıyafet kaynağı. HEPSİNİ giydir!
2. KIYAFET KORUMA: Renk, desen, doku, düğme, dikiş - HEPSİ AYNI kalmalı.
3. AYAKKABI: Input'taki ayakkabıyı AYNEN koru - model, renk, bağcık, taban.
4. CEKET VARSA: Mutlaka giydir, gömleğin üstünde olsun!
5. ARKA PLAN: Sadece ${bgName} (${bgHex}) kullan. Input'un arka planını YOKSAY.
6. MANKEN: Doğal insan oranları (kafa = vücut boyunun 1/7-1/8'i).

YASAKLAR - BUNLARI YAPMA:
❌ Input'taki herhangi bir kıyafeti ATLAMA
❌ Kıyafetin rengini/desenini DEĞİŞTİRME
❌ Ayakkabıyı bozma/değiştirme
❌ Ceketi atlama (varsa MUTLAKA giydir)
❌ Kendi hayal gücünü kullanma
❌ Input'un arka planını kopyalama

ÇIKTI: Profesyonel moda fotoğrafı, tek manken, TÜM kıyafetler giyili, ${bgHex} arka plan.`;
};

// Compact prompt for women's fashion
const buildCompactJSONPromptWomen = (settings: WomensFashionSettings): string => {
    const settingsJSON: Record<string, any> = {
        task: "virtual_try_on",
        gender: "female",
        purpose: settings.purpose
    };

    if (settings.skinTone && settings.skinTone !== 'auto') settingsJSON.skinTone = settings.skinTone;
    if (settings.poseStyle && settings.poseStyle !== 'auto') settingsJSON.pose = settings.poseStyle;
    if (settings.background) settingsJSON.backgroundColor = settings.background;
    if (settings.backgroundStyle) settingsJSON.backgroundStyle = settings.backgroundStyle;
    if (settings.floorType && settings.floorType !== 'auto') settingsJSON.floorType = settings.floorType;
    if (settings.lightingStyle && settings.lightingStyle !== 'auto') settingsJSON.lighting = settings.lightingStyle;
    if (settings.shotScale && settings.shotScale !== 'auto') settingsJSON.shotScale = settings.shotScale;
    if (settings.cameraAngle && settings.cameraAngle !== 'auto') settingsJSON.cameraAngle = settings.cameraAngle;
    if (settings.lens && settings.lens !== 'auto') settingsJSON.lens = settings.lens;
    if (settings.aspectRatio) settingsJSON.aspectRatio = settings.aspectRatio;

    if (settings.collarType && settings.collarType !== 'auto') settingsJSON.collarType = settings.collarType;
    if (settings.fabricType && settings.fabricType !== 'auto') settingsJSON.fabricType = settings.fabricType;
    if (settings.spallaCamicia && settings.spallaCamicia !== 'auto') settingsJSON.spallaCamicia = settings.spallaCamicia;
    if (settings.pleatType && settings.pleatType !== 'auto') settingsJSON.pleatType = settings.pleatType;
    if (settings.trouserFit && settings.trouserFit !== 'auto') settingsJSON.fit = settings.trouserFit;

    if (settings.backgroundStyle === 'studio-minimal' && settings.studioMinimalColor) {
        settingsJSON.gradientColor = settings.studioMinimalColor;
        settingsJSON.vignette = settings.studioMinimalVignette || false;
    }
    if (settings.backgroundStyle === 'wood' && settings.woodType) {
        settingsJSON.woodType = settings.woodType;
    }
    if (settings.customPrompt) settingsJSON.customInstructions = settings.customPrompt;

    return `VIRTUAL TRY-ON TASK - Dress model with ALL provided clothing images:

🔒 TUTARLILIK KURALLARI - MUTLAKA UYGULA 🔒

1. MODEL AYARLARI (Seçilen değerleri AYNEN kullan):
${settingsJSON.skinTone ? `   - Ten Rengi: ${settingsJSON.skinTone} (BUNU KULLAN, değiştirme)` : '   - Ten Rengi: Otomatik'}
${settingsJSON.pose ? `   - Poz: ${settingsJSON.pose} (BUNU KULLAN, değiştirme)` : '   - Poz: Otomatik'}
${settingsJSON.backgroundColor ? `   - Arka Plan: ${settingsJSON.backgroundColor} (BUNU KULLAN)` : ''}
${settingsJSON.lighting ? `   - Işıklandırma: ${settingsJSON.lighting} (BUNU KULLAN)` : ''}
${settingsJSON.shotScale ? `   - Çekim Ölçeği: ${SHOT_SCALE_DESCRIPTIONS[settingsJSON.shotScale] || settingsJSON.shotScale} (BUNU KULLAN)` : ''}
${settingsJSON.cameraAngle ? `   - Kamera Açısı: ${PROMPT_CAMERA_ANGLE_DESCRIPTIONS[settingsJSON.cameraAngle] || settingsJSON.cameraAngle} (BUNU KULLAN)` : ''}
${settingsJSON.lens ? `   - Lens: ${LENS_DESCRIPTIONS[settingsJSON.lens] || settingsJSON.lens} (BUNU KULLAN)` : ''}

2. SEÇİLEN AYARLARIN DIŞINA ÇIKMA:
   - Farklı ten rengi kullanma
   - Farklı poz yapma
   - Farklı arka plan koyma
   - Ayarlarda olmayan şey ekleme

${JSON.stringify(settingsJSON, null, 2)}

🔍 OTOMATİK KIYAFET TESPİTİ (AUTO CLOTHING DETECTION):
Analyze each input image and determine what it is:
- Jacket/Blazer/Coat → Wear OVER the shirt
- Shirt/Blouse/Top → Wear as inner layer
- Pants/Skirt/Shorts → Wear as bottom
- Shoes → Put on feet
- Accessories → Place appropriately

⚠️ CATEGORY DOESN'T MATTER - USE EVERY IMAGE!
Regardless of what category is selected, dress model with ALL provided images.
Auto-detect what each image contains and dress accordingly.

CORE RULES:
1. Put ALL clothing from ALL input images onto a female model
2. PRESERVE all clothing details exactly (color, pattern, texture, buttons, stitching)
3. Use the background color/style specified in settings
4. Model must have natural human proportions (head = 1/7 to 1/8 of body height)
5. Professional fashion photography quality
6. Single model, single pose, single image output
7. If JACKET is provided → MUST be worn over the shirt!

🎨🎨🎨 BACKGROUND COLOR CONSISTENCY - ABSOLUTE REQUIREMENT 🎨🎨🎨
The background MUST be EXACTLY as specified - with PERFECT CONSISTENCY across all generations:
- Use the EXACT hex color code specified in backgroundColor setting
- The background color must be UNIFORM - same shade everywhere, no variations
- Lighting on background must be EVEN - no hotspots, no shadows, no gradients unless specified
- EVERY image generated with the same background setting MUST look IDENTICAL in background
- Think: If you generate 10 images with "white" background, ALL 10 must have the EXACT SAME white (#FFFFFF)
- NO color temperature variations - if white is selected, it's pure white, not warm white or cool white
- NO lighting variations on background - consistent, flat, even illumination

CRITICAL:
- Do NOT skip any clothing item from input images
- Do NOT invent or add any clothing details not in the input image
- Do NOT copy background from input image - use the specified background
- If JACKET is provided, it MUST be worn (not skipped!)
- If a setting is specified (not "auto"), you MUST apply it exactly
- Output a photorealistic fashion photograph
- Background color = FIXED, CONSISTENT, REPRODUCIBLE across all generations`;
};

// E-TİCARET prompt'u
const getMensFashionEcommercePrompt = (skinTone: string, poseStyle: string, background: string, backgroundStyle: string, collarType?: string, fabricType?: string, pleatType?: string, trouserFit?: string, studioMinimalColor?: string, studioMinimalVignette?: boolean, cameraFrame?: string, customPrompt?: string, floorType?: string, cameraAngle?: string, lightingStyle?: string, woodType?: string, trouserFabricType?: string, trouserWaistRise?: string, knitwearType?: string, shirtTuck?: string, spallaCamicia?: string): string => {
    const skinDescription = skinTone && MENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        ? MENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        : 'natural, healthy skin tone';

    const poseDescription = poseStyle && MENS_POSE_DESCRIPTIONS[poseStyle]
        ? MENS_POSE_DESCRIPTIONS[poseStyle]
        : MENS_POSE_DESCRIPTIONS['neutral'];

    const bgStyleInfo = MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === backgroundStyle);
    const supportsColor = bgStyleInfo?.supportsColor ?? true;

    const bgInfo = MENS_FASHION_BACKGROUNDS.find(b => b.id === background);
    const bgName = bgInfo?.name || 'Beyaz';
    const bgHex = bgInfo?.hex || '#FFFFFF';
    const bgDescription = bgInfo?.description || 'Temiz, sade stüdyo';

    // Ahşap için özel açıklama - woodType parametresine göre
    const getWoodDescription = () => {
        const woodDesc = woodType && WOOD_TYPE_DESCRIPTIONS[woodType]
            ? WOOD_TYPE_DESCRIPTIONS[woodType]
            : WOOD_TYPE_DESCRIPTIONS['oak-light'];
        return `${woodDesc}, MATTE NON-GLOSSY natural wood finish, authentic imperfections like real wood - knots, grain variations, subtle color differences`;
    };

    // Studio Minimal Gradient veya Wood için özel prompt
    const bgStyleDescription = backgroundStyle === 'studio-minimal'
        ? buildStudioMinimalGradientPrompt(studioMinimalColor || 'pure-white', studioMinimalVignette || false)
        : backgroundStyle === 'wood'
            ? getWoodDescription()
            : (BACKGROUND_STYLE_DESCRIPTIONS[backgroundStyle] || BACKGROUND_STYLE_DESCRIPTIONS['solid']);

    // Arka plan değiştirme vurgusu - GÜÇLENDİRİLMİŞ
    const backgroundChangeEmphasis = `
🚨🚨🚨 ABSOLUTE BACKGROUND RULE - HIGHEST PRIORITY 🚨🚨🚨
THE ONLY BACKGROUND YOU MUST USE: ${bgName} (${bgHex})

⛔ COMPLETELY IGNORE THE INPUT IMAGE'S BACKGROUND:
- The input image may show ANY background - IGNORE IT COMPLETELY
- That background is 100% IRRELEVANT - pretend it doesn't exist
- DO NOT analyze, copy, or be influenced by the input image's background
- Even if input shows a perfect studio, IGNORE IT and use ${bgHex}
- Even if input shows the same color, still REGENERATE it fresh as ${bgHex}

✅ WHAT YOU MUST DO:
- Generate a COMPLETELY NEW background: ${bgName} (${bgHex})
- Background color MUST be exactly ${bgHex} - no variations allowed
- Lighting on background: FLAT and EVEN - same brightness everywhere
- No shadows, hotspots, or color shifts on the background

🎯 VERIFICATION: Background color when measured = ${bgHex}. Any deviation = WRONG.`;

    // Beyaz için özel vurgu
    const whiteEmphasis = background === 'white'
        ? `

MANDATORY: PURE WHITE BACKGROUND
- Exact color: #FFFFFF - RGB(255, 255, 255) - PURE WHITE
- NO cream, NO ivory, NO beige, NO off-white, NO warm tones
- NO yellow tint, NO gray tint - ZERO color cast
- Like Amazon/Shopify product photo - blindingly white
- If ANY color in background = WRONG OUTPUT`
        : '';

    // Zemin tipi açıklaması
    const floorDescription = floorType && FLOOR_TYPE_DESCRIPTIONS[floorType]
        ? FLOOR_TYPE_DESCRIPTIONS[floorType]
        : FLOOR_TYPE_DESCRIPTIONS['seamless'];

    const floorSection = `
🏠 FLOOR SETUP - CRITICAL:
- Floor Type: ${floorDescription}
- The model stands DIRECTLY on the floor - feet touching ground
- Add realistic shadow of the model on the floor

${NO_BASEBOARD_RULE}

🖼️ BACKGROUND + FLOOR COMPOSITION:
- Background wall is VERTICAL (goes up-down)
- Floor is HORIZONTAL (goes left-right)
- They meet at a simple corner - NO transition elements
- Model stands on the FLAT floor, background wall behind them`;

    // Arka plan tutarlılığı kuralı
    const backgroundConsistencyRule = `
🎯🎯🎯 BACKGROUND COLOR CONSISTENCY - ABSOLUTE REQUIREMENT 🎯🎯🎯
The background MUST be EXACTLY as specified with PERFECT CONSISTENCY:
- Use the EXACT color: ${bgName} (${bgHex}) - NO variations allowed
- Background color must be UNIFORM across the entire image - same shade everywhere
- Lighting on background must be EVEN and FLAT - no hotspots, no shadows, no gradients
- This EXACT same background must be reproducible across ALL generations
- NO color temperature shifts - if ${bgHex} is specified, output MUST be ${bgHex}
- NO lighting-induced color changes - background stays EXACTLY ${bgHex}
- Think: A colorimeter measuring the background should read ${bgHex} everywhere`;

    // Build background section based on whether style supports color
    // Studio Minimal için özel işleme - kendi renk sistemini kullanır
    const backgroundSection = backgroundStyle === 'studio-minimal'
        ? `${backgroundChangeEmphasis}\n\n🎨 STUDIO MINIMAL GRADIENT BACKDROP:\n${bgStyleDescription}\n${floorSection}\n${backgroundConsistencyRule}`
        : supportsColor
            ? `${backgroundChangeEmphasis}\n- Background Wall Color: ${bgName} (${bgHex}) - ${bgDescription}\n- Background Style: ${bgStyleDescription}${whiteEmphasis}\n${floorSection}\n${backgroundConsistencyRule}`
            : `${backgroundChangeEmphasis}\n- Background Style: ${bgStyleDescription}\n${floorSection}`;

    // Kullanıcı yaka tipi seçtiyse özel talimat oluştur
    const userCollarInstruction = collarType && collarType !== 'auto' && COLLAR_TYPE_DESCRIPTIONS[collarType]
        ? `
🎯🎯🎯 USER SPECIFIED COLLAR TYPE - MUST FOLLOW 🎯🎯🎯
THE USER HAS EXPLICITLY SPECIFIED THE COLLAR TYPE. YOU MUST USE THIS:
⚡ COLLAR TYPE: ${COLLAR_TYPE_DESCRIPTIONS[collarType]}
⚡ DO NOT analyze the input image for collar type - USE THE SPECIFIED TYPE ABOVE
⚡ This overrides any collar detection from the input image
`
        : `
ABSOLUTE #1 RULE - NECKLINE PRESERVATION:
BEFORE GENERATING, CAREFULLY ANALYZE THE INPUT IMAGE:
- What is the EXACT neckline type? (V-neck, crew neck, round neck, etc.)
- Is it a TURTLENECK? Only if the input clearly shows a turtleneck.
- If the input shows a V-NECK sweater → The output MUST show V-NECK sweater
- If the input shows a CREW NECK → The output MUST show CREW NECK
- If the input shows a ROUND NECK → The output MUST show ROUND NECK
- DO NOT ASSUME TURTLENECK unless the input image CLEARLY shows one
- TURTLENECK = neck is FULLY COVERED up to chin
- V-NECK = V-shaped opening at chest
- CREW NECK = Round opening at base of neck
- CHANGING THE NECKLINE = WRONG PRODUCT = FAILURE`;

    // Kullanıcı kumaş tipi seçtiyse özel talimat oluştur
    const userFabricInstruction = fabricType && fabricType !== 'auto' && FABRIC_TYPE_DESCRIPTIONS[fabricType]
        ? `
🧥🧥🧥 USER SPECIFIED FABRIC TYPE - MUST FOLLOW 🧥🧥🧥
THE USER HAS EXPLICITLY SPECIFIED THE FABRIC TYPE FOR THE JACKET. YOU MUST USE THIS:
⚡ FABRIC TYPE: ${FABRIC_TYPE_DESCRIPTIONS[fabricType]}
⚡ The jacket/coat fabric texture MUST match the specified type above
⚡ This overrides any fabric detection from the input image
`
        : '';

    // Kullanıcı pile tipi seçtiyse özel talimat oluştur
    const userPleatInstruction = pleatType && pleatType !== 'auto' && PLEAT_TYPE_DESCRIPTIONS[pleatType]
        ? `
👖👖👖 USER SPECIFIED PLEAT TYPE - MUST FOLLOW 👖👖👖
THE USER HAS EXPLICITLY SPECIFIED THE PLEAT TYPE FOR THE TROUSERS. YOU MUST USE THIS:
⚡ PLEAT TYPE: ${PLEAT_TYPE_DESCRIPTIONS[pleatType]}
⚡ The trousers MUST show EXACTLY this pleat configuration
⚡ COUNT THE PLEATS: ${pleatType === 'double' ? '2 pleats on each side (4 total)' : pleatType === 'single' ? '1 pleat on each side (2 total)' : 'NO pleats - flat front'}
⚡ This overrides any pleat detection from the input image
⚡ DO NOT simplify double pleats to single, or add pleats to flat front
`
        : '';

    // Kullanıcı pantolon kesim tipi seçtiyse özel talimat oluştur
    const userTrouserFitInstruction = trouserFit && trouserFit !== 'auto' && TROUSER_FIT_DESCRIPTIONS[trouserFit]
        ? `
👖✂️👖 USER SPECIFIED TROUSER FIT/CUT - MUST FOLLOW 👖✂️👖
THE USER HAS EXPLICITLY SPECIFIED THE TROUSER FIT. YOU MUST PRESERVE THIS:
⚡ TROUSER FIT: ${TROUSER_FIT_DESCRIPTIONS[trouserFit]}
⚡ DO NOT change wide-leg to slim or slim to wide
⚡ The trouser silhouette MUST match the specified fit type
⚡ If user says WIDE LEG → trousers must be LOOSE and WIDE, NOT tapered
⚡ If user says SLIM → trousers must be NARROW and FITTED
⚡ This overrides any fit detection from the input image
⚡ PRESERVE THE EXACT WIDTH AND DRAPE OF THE ORIGINAL TROUSERS
`
        : '';

    // Kullanıcı pantolon kumaş tipi seçtiyse özel talimat oluştur
    const userTrouserFabricInstruction = trouserFabricType && trouserFabricType !== 'auto' && TROUSER_FABRIC_DESCRIPTIONS[trouserFabricType]
        ? `
👖🧵👖 USER SPECIFIED TROUSER FABRIC TYPE - MUST FOLLOW 👖🧵👖
THE USER HAS EXPLICITLY SPECIFIED THE TROUSER FABRIC. YOU MUST RENDER THIS:
⚡ TROUSER FABRIC: ${TROUSER_FABRIC_DESCRIPTIONS[trouserFabricType]}
⚡ The trouser texture and appearance MUST match the specified fabric type
⚡ Show characteristic texture, drape, and surface quality of this fabric
⚡ This overrides any fabric detection from the input image
`
        : '';

    // Pantolon bel yüksekliği - Deterministic mapper system
    const waistRiseInjection = getWaistRiseInjection(trouserWaistRise || '');
    const userWaistRiseInstruction = waistRiseInjection ? composeWaistRisePrompt(waistRiseInjection) : '';

    // Final waist rise verification - only for high/ultra_high
    const waistRiseFinalCheck = (trouserWaistRise === 'high' || trouserWaistRise === 'ultra_high')
        ? `
🔴🔴🔴🔴🔴 FINAL MANDATORY CHECK - WAISTBAND POSITION 🔴🔴🔴🔴🔴

⛔⛔⛔ BEFORE OUTPUTTING, VERIFY THIS: ⛔⛔⛔

${trouserWaistRise === 'ultra_high'
? `📏 PROPORTION CHECK (ULTRA HIGH-RISE):
┌────────────────────────────────────┐
│ Shoulder to Waistband = 15% MAX    │
│ Waistband to Feet = 85% MIN        │
└────────────────────────────────────┘

✅ PASS CRITERIA:
- Belt/waistband at RIBCAGE level (kaburga hizası)
- Waistband ABOVE belly button
- Torso above belt = MINIMAL (just chest/shoulders)
- Shirt deeply tucked, waistband DOMINANT feature

❌ FAIL CRITERIA (REJECT & REGENERATE):
- Belt at belly button level = FAIL
- Belt at hip level = FAIL
- More than 20% torso visible = FAIL
- Shirt not tucked = FAIL`
: `📏 PROPORTION CHECK (HIGH-RISE):
┌────────────────────────────────────┐
│ Shoulder to Waistband = 25% MAX    │
│ Waistband to Feet = 75% MIN        │
└────────────────────────────────────┘

✅ PASS CRITERIA:
- Belt/waistband at NAVEL level (göbek hizası)
- Waistband 5-8cm ABOVE hip bones
- Torso above belt = SHORT (only 25%)
- Shirt tucked, waistband clearly visible

❌ FAIL CRITERIA (REJECT & REGENERATE):
- Belt at hip bone level = FAIL
- Belt below belly button = FAIL
- More than 30% torso visible = FAIL
- Shirt covering waistband = FAIL`}

🚫🚫🚫 IF WAISTBAND IS AT KALÇA/HIP LEVEL = WRONG! REGENERATE! 🚫🚫🚫
`
        : '';

    // Triko tipi talimatı
    const userKnitwearInstruction = knitwearType && knitwearType !== 'auto' && KNITWEAR_TYPE_DESCRIPTIONS[knitwearType]
        ? `
🧶🧶🧶 USER SPECIFIED KNITWEAR TYPE - MUST FOLLOW 🧶🧶🧶
THE USER HAS EXPLICITLY SPECIFIED THE KNITWEAR/SWEATER TYPE:
${KNITWEAR_TYPE_DESCRIPTIONS[knitwearType]}
⚡ The top garment MUST match this knitwear style exactly
⚡ Pay attention to collar/neckline type specified above
`
        : '';

    // Üst giysi içinde/dışında talimatı
    const userShirtTuckInstruction = shirtTuck && shirtTuck !== 'auto' && SHIRT_TUCK_DESCRIPTIONS[shirtTuck]
        ? `
👔📍👔 USER SPECIFIED SHIRT TUCK STYLE - CRITICAL STYLING 👔📍👔
${SHIRT_TUCK_DESCRIPTIONS[shirtTuck]}
⚡ This styling choice is MANDATORY - do not ignore
⚡ The shirt/top position relative to trousers MUST match exactly
`
        : '';

    // Spalla Camicia (Omuz Dikişi) talimatı
    const userSpallaCamiciaInstruction = spallaCamicia && spallaCamicia !== 'auto' && SPALLA_CAMICIA_DESCRIPTIONS[spallaCamicia]
        ? `
🎯👔 SPALLA CAMICIA - SHOULDER CONSTRUCTION REQUIREMENT 👔🎯
${SPALLA_CAMICIA_DESCRIPTIONS[spallaCamicia]}
⚡ The jacket/blazer shoulder MUST follow this construction style
⚡ This is a critical tailoring detail - pay close attention to the shoulder seam
`
        : '';

    // Kamera çerçevesi talimatı
    const cameraFrameInstruction = cameraFrame && CAMERA_FRAME_DESCRIPTIONS[cameraFrame]
        ? `
📷📷📷 CAMERA FRAME / FRAMING - CRITICAL 📷📷📷
${CAMERA_FRAME_DESCRIPTIONS[cameraFrame]}
⚡ The image MUST be framed according to this specification
⚡ DO NOT show more or less of the model than specified
`
        : '';

    // Kamera açısı talimatı
    const cameraAngleInstruction = cameraAngle && CAMERA_ANGLE_DESCRIPTIONS[cameraAngle]
        ? `
📐📐📐 CAMERA ANGLE - IMPORTANT 📐📐📐
${CAMERA_ANGLE_DESCRIPTIONS[cameraAngle]}
⚡ Position the camera at this specific angle relative to the model
⚡ This is ONLY a camera position change - do NOT add extra people or figures
⚡ There should be exactly ONE model in the frame
⚡ BACKGROUND MUST STAY THE SAME - only camera viewpoint changes, not the background
⚡ The specified background color/style applies regardless of camera angle

🚨 CRITICAL - PRESERVE BODY PROPORTIONS 🚨
When changing camera angle, the model's BODY PROPORTIONS must remain ANATOMICALLY CORRECT:
- Do NOT distort, compress, or stretch the body
- Do NOT make the head too large or too small relative to body
- Do NOT shorten or elongate the torso unnaturally
- Do NOT compress the limbs (arms, legs)
- The model must look like a REAL HUMAN with correct proportions
- Head-to-body ratio must be realistic (head is about 1/7 to 1/8 of total height)
- Torso, arms, and legs must have natural lengths and proportions
- If the input shows a tall/slim model, output must show same tall/slim proportions
- WRONG: Squashed body, oversized head, stubby limbs
- CORRECT: Natural human anatomy preserved from any camera angle
`
        : '';

    // Kamera çerçevesi için kısa Distance açıklaması
    const cameraFrameShort: Record<string, string> = {
        'full-body': 'Full body shot - head to toe',
        '3/4': '3/4 shot - head to knees',
        'waist-up': 'Waist-up shot - waist to head only',
        'waist-down': 'Waist-down shot - waist to feet only'
    };
    const distanceDescription = cameraFrame && cameraFrameShort[cameraFrame]
        ? cameraFrameShort[cameraFrame]
        : 'Full body shot to show complete garment';

    // Kamera açısı için kısa açıklama
    const cameraAngleShort = cameraAngle && CAMERA_ANGLE_DESCRIPTIONS[cameraAngle]
        ? CAMERA_ANGLE_DESCRIPTIONS[cameraAngle].split(' - ')[0]
        : 'Eye level';

    // Işık stili talimatı
    const lightingInstruction = lightingStyle && LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]
        ? `
💡💡💡 USER SPECIFIED LIGHTING STYLE - MUST FOLLOW 💡💡💡
${LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]}
⚡ Apply this exact lighting setup to the scene
`
        : '';

    // Varsayılan veya seçilen ışık açıklaması
    const lightingDescription = lightingStyle && LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]
        ? LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]
        : `SOFT STUDIO LIGHTING:
- BRIGHT, HIGH-KEY studio lighting - well-lit environment
- Soft, evenly diffused lighting with MINIMAL to NO shadows
- Front-facing key light to eliminate dark areas on face and clothing
- Fill lights to ensure NO underexposed areas
- NO dramatic or moody lighting - keep it BRIGHT and CLEAN
- Result: Maximum clarity, WELL-EXPOSED, professional e-commerce look`;

    return `
MEN'S FASHION E-COMMERCE PHOTOGRAPHY

${userWaistRiseInstruction}

${userCollarInstruction}
${userFabricInstruction}
${userPleatInstruction}
${userTrouserFitInstruction}
${userTrouserFabricInstruction}
${userKnitwearInstruction}
${userShirtTuckInstruction}
${userSpallaCamiciaInstruction}
${cameraFrameInstruction}
${cameraAngleInstruction}
${lightingInstruction}

CRITICAL PRODUCT INTEGRITY:
Use the uploaded product image as the EXACT visual reference for the garment.
The clothing design, fabric, color, texture, stitching, fit and proportions must remain IDENTICAL to the reference image.
Do not change the product in any way. The model is only a carrier; the garment is the hero.
⚠️ ESPECIALLY THE NECKLINE - COPY IT EXACTLY FROM INPUT IMAGE ⚠️

🧍 CRITICAL - HUMAN BODY PROPORTIONS 🧍
The model must have CORRECT, NATURAL human anatomy:
- Head size: approximately 1/7 to 1/8 of total body height
- Do NOT create oversized heads or shrunken bodies
- Do NOT compress or squash the torso
- Arms and legs must have natural, realistic lengths
- The body must NOT look distorted, stretched, or compressed
- If input shows a model with certain proportions, OUTPUT must match those proportions
- Think: "Would this person look normal standing next to real people?"

ZERO IMAGINATION / ZERO HALLUCINATION POLICY:
ABSOLUTELY NO PRODUCT HALLUCINATION - CRITICAL
DO NOT USE YOUR IMAGINATION. DO NOT ADD ANYTHING NOT IN THE INPUT.

STRICT RULES:
- ONLY use what is VISIBLE in the input image(s)
- ONLY apply the settings the user has selected
- The INPUT IMAGES define what products exist - NOTHING ELSE
- If user gives 1 jacket → output shows ONLY that 1 jacket
- If user gives pants + shirt → output shows ONLY those 2 items
- DO NOT add extra clothing items (scarves, hats, belts, ties, pocket squares, etc.)
- DO NOT add accessories (watches, jewelry, sunglasses, bags, etc.)
- DO NOT add props or objects not in the input
- DO NOT change or "improve" the garment design
- DO NOT add patterns, textures, or details not in the input
- DO NOT add background elements not specified
- DO NOT add other people or animals (unless user selected)
- DO NOT be creative with the product - COPY IT EXACTLY
- DO NOT invent/hallucinate any product that wasn't provided
- If something is NOT in the input and NOT in user settings = DO NOT ADD IT
- Your job is to REPLICATE EXACTLY, not to CREATE or IMAGINE

🏷️ LOGO/BROOCH/EMBLEM RULE - CRITICAL:
- If the input has a collar pin, brooch, logo, or emblem on the lapel/collar:
  - If you can render it CLEARLY and ACCURATELY → show it
  - If you CANNOT render it clearly (blurry, distorted, unreadable) → DO NOT SHOW IT AT ALL
  - Better NO logo than a BAD/UNCLEAR logo
  - Do NOT invent or guess what the logo looks like
  - Do NOT show a generic/placeholder logo
---

CATEGORY: Men's fashion (jacket, coat, suit, pants, shirt – based on the uploaded product).

MODEL SPECIFICATIONS:
- SKIN TONE: ${skinDescription}
- Age appearance: 25-35 years old
- Physique: Fit, well-proportioned male body
- Facial expression: Neutral, trustworthy, approachable
- Grooming: Clean, professional appearance
- POSE: ${poseDescription} - neutral, upright stance, relaxed arms, no movement

CAMERA ANGLE & LENS:
- Camera angle: ${cameraAngleShort}
- Lens: Natural perspective, 50mm lens look, no distortion
- Distance/Framing: ${distanceDescription}
- Composition: Centered with intentional negative space

LIGHTING SETUP:
${lightingDescription}

BACKGROUND:
${backgroundSection}
- No distracting elements that compete with the product

GENERAL COMPOSITION RULES:
- No wide-angle distortion
- Garment must be fully readable and correctly proportioned
- Clean framing with intentional negative space
- Natural body anatomy and realistic posture
- Foreground, subject, and background must be visually separated with depth

COLOR & GRADING:
- BRIGHT, WELL-EXPOSED image - NOT dark, NOT underexposed
- Neutral to slightly warm color palette
- NORMAL saturation, BALANCED contrast - not too dark
- Proper exposure - face and clothing clearly visible
- Natural skin tones, realistic fabric rendering
- Look like professional HIGH-END E-COMMERCE photography

QUALITY REQUIREMENTS:
- Photorealistic men's fashion photography
- Clean, premium, brand-consistent output
- WELL-LIT and BRIGHT - absolutely NOT dark or moody
- No artifacts, no warped clothing, no incorrect textures
- No logos or text unless present in the reference image
- Goal: Maximum clarity of fit, fabric and construction

NEGATIVE (AVOID):
- Changing garment design or fit
- Wrong fabric or color
- Oversharpening
- Plastic skin
- Harsh shadows
- DARK or UNDEREXPOSED images
- Moody or dramatic lighting
- Busy or distracting background
- Fashion elements competing with the product

CRITICAL: DO NOT ADD EXTRA PRODUCTS
- ONLY use the clothing items provided in the input images
- DO NOT add any additional accessories (watches, belts, hats, bags, sunglasses, jewelry, etc.)
- DO NOT add any extra clothing items not shown in the input
- If only a shirt is provided, model should wear ONLY that shirt (with appropriate basic pants)
- If only a jacket is provided, model should wear ONLY that jacket (with appropriate basic inner/pants)
- The model should wear ONLY what is explicitly provided in the input images
- Any accessory or clothing NOT in the input = FORBIDDEN

📷📷📷 OUTPUT FORMAT - SINGLE IMAGE ONLY 📷📷📷
- Generate exactly ONE single photograph
- DO NOT create a collage, grid, or multiple views
- DO NOT split the image into 2, 3, or 4 panels
- DO NOT show the model from multiple angles in one image
- ONE model, ONE pose, ONE single photograph
- ⛔ DO NOT add extra people, observers, or silhouettes - ONLY the main model
- The output must be a single cohesive image, not a composite
- Camera angle changes = camera moves around ONE model, NOT adding more people
- 🎨 BACKGROUND STAYS CONSTANT: The specified background color/style must be used regardless of camera angle. Do not invent new backgrounds or add random elements when camera angle changes.
${customPrompt ? `

✏️✏️✏️ USER'S CUSTOM INSTRUCTIONS - MUST FOLLOW ✏️✏️✏️
The user has provided specific instructions that MUST be followed:
>>> ${customPrompt} <<<
⚡ Apply these instructions to the output
⚡ These are direct orders from the user - prioritize them
` : ''}

🚨🚨🚨 FINAL REMINDER - CAMERA FRAME IS ABSOLUTE 🚨🚨🚨
${cameraFrame === 'full-body' ? `
⛔⛔⛔ FULL BODY = FEET MUST BE VISIBLE ⛔⛔⛔

BEFORE YOU GENERATE, ASK YOURSELF:
1. Will the model's FEET be visible in my output? → If NO, you are WRONG
2. Will I crop at the knees? → If YES, you are generating 3/4 shot, NOT full body
3. Will I crop at the waist? → If YES, you are generating waist-up, NOT full body

THE USER SELECTED "FULL BODY" - THIS MEANS:
✅ Head visible
✅ Torso visible
✅ Legs visible
✅ FEET VISIBLE AND TOUCHING THE FLOOR ← DO NOT FORGET THIS

🦶 FEET CHECK: The model's shoes/feet MUST appear in the final image standing on the floor.
If you cannot see the model's feet in your output = YOU FAILED THE TASK.
` : ''}
${cameraFrame === 'waist-up' ? `YOU MUST SHOW WAIST-UP ONLY - WAIST TO HEAD
- Do NOT show legs or feet
- Cut off at waist/hip level` : ''}
${cameraFrame === '3/4' ? `YOU MUST SHOW 3/4 SHOT - HEAD TO KNEES
- Cut off below knees, above feet
- Do NOT show full body, do NOT cut at waist` : ''}
${cameraFrame === 'waist-down' ? `YOU MUST SHOW WAIST-DOWN - WAIST TO FEET
- Show legs and feet, cut off at waist
- Feet must be visible and touching ground` : ''}

${waistRiseFinalCheck}
`;
};

// KATALOG prompt'u
const getMensFashionCatalogPrompt = (skinTone: string, poseStyle: string, background: string, backgroundStyle: string, collarType?: string, fabricType?: string, pleatType?: string, trouserFit?: string, studioMinimalColor?: string, studioMinimalVignette?: boolean, cameraFrame?: string, customPrompt?: string, floorType?: string, cameraAngle?: string, lightingStyle?: string, woodType?: string, trouserFabricType?: string, trouserWaistRise?: string, knitwearType?: string, shirtTuck?: string, spallaCamicia?: string): string => {
    const skinDescription = skinTone && MENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        ? MENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        : 'natural, healthy skin tone';

    const poseDescription = poseStyle && MENS_POSE_DESCRIPTIONS[poseStyle]
        ? MENS_POSE_DESCRIPTIONS[poseStyle]
        : MENS_POSE_DESCRIPTIONS['confident'];

    const bgStyleInfo = MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === backgroundStyle);
    const supportsColor = bgStyleInfo?.supportsColor ?? true;

    const bgInfo = MENS_FASHION_BACKGROUNDS.find(b => b.id === background);
    const bgName = bgInfo?.name || 'Bej';
    const bgHex = bgInfo?.hex || '#D4C4B0';
    const bgDescription = bgInfo?.description || 'Sıcak, premium his';

    // Ahşap için özel açıklama - woodType parametresine göre
    const getWoodDescriptionCatalog = () => {
        const woodDesc = woodType && WOOD_TYPE_DESCRIPTIONS[woodType]
            ? WOOD_TYPE_DESCRIPTIONS[woodType]
            : WOOD_TYPE_DESCRIPTIONS['oak-light'];
        return `${woodDesc}, MATTE NON-GLOSSY natural wood finish, authentic imperfections like real wood - knots, grain variations, subtle color differences`;
    };

    // Studio Minimal Gradient veya Wood için özel prompt
    const bgStyleDescription = backgroundStyle === 'studio-minimal'
        ? buildStudioMinimalGradientPrompt(studioMinimalColor || 'pure-white', studioMinimalVignette || false)
        : backgroundStyle === 'wood'
            ? getWoodDescriptionCatalog()
            : (BACKGROUND_STYLE_DESCRIPTIONS[backgroundStyle] || BACKGROUND_STYLE_DESCRIPTIONS['solid']);

    // Arka plan değiştirme vurgusu
    const backgroundChangeEmphasis = `
CRITICAL BACKGROUND RULE:
- DO NOT copy or use the background from the input/source image
- COMPLETELY REPLACE the background with the specified color below
- The input image background is IRRELEVANT - ignore it completely
- CREATE A NEW BACKGROUND as specified`;

    // Beyaz için özel vurgu
    const whiteEmphasis = background === 'white'
        ? `
⚠️ PURE WHITE BACKGROUND REQUIRED:
- Background MUST be PURE WHITE (#FFFFFF) - RGB(255,255,255)
- NOT cream, NOT off-white, NOT ivory, NOT beige, NOT gray
- Like Amazon/Shopify product photography - clean pure white`
        : '';

    // Studio Minimal için özel işleme - kendi renk sistemini kullanır (REKLAM)
    const backgroundSection = backgroundStyle === 'studio-minimal'
        ? `${backgroundChangeEmphasis}\n\n🎨 STUDIO MINIMAL GRADIENT BACKDROP:\n${bgStyleDescription}`
        : supportsColor
            ? `${backgroundChangeEmphasis}\n- Background Color: ${bgName} (${bgHex}) - ${bgDescription}\n- Background Style: ${bgStyleDescription}${whiteEmphasis}`
            : `${backgroundChangeEmphasis}\n- Background Style: ${bgStyleDescription}`;

    // Kullanıcı yaka tipi seçtiyse özel talimat oluştur
    const userCollarInstruction = collarType && collarType !== 'auto' && COLLAR_TYPE_DESCRIPTIONS[collarType]
        ? `
🎯🎯🎯 USER SPECIFIED COLLAR TYPE - MUST FOLLOW 🎯🎯🎯
THE USER HAS EXPLICITLY SPECIFIED THE COLLAR TYPE. YOU MUST USE THIS:
⚡ COLLAR TYPE: ${COLLAR_TYPE_DESCRIPTIONS[collarType]}
⚡ DO NOT analyze the input image for collar type - USE THE SPECIFIED TYPE ABOVE
⚡ This overrides any collar detection from the input image
`
        : `
ABSOLUTE #1 RULE - NECKLINE PRESERVATION:
BEFORE GENERATING, CAREFULLY ANALYZE THE INPUT IMAGE:
- What is the EXACT neckline type? (V-neck, crew neck, round neck, etc.)
- Is it a TURTLENECK? Only if the input clearly shows a turtleneck.
- If the input shows a V-NECK sweater → The output MUST show V-NECK sweater
- If the input shows a CREW NECK → The output MUST show CREW NECK
- If the input shows a ROUND NECK → The output MUST show ROUND NECK
- DO NOT ASSUME TURTLENECK unless the input image CLEARLY shows one
- TURTLENECK = neck is FULLY COVERED up to chin
- V-NECK = V-shaped opening at chest
- CREW NECK = Round opening at base of neck
- CHANGING THE NECKLINE = WRONG PRODUCT = FAILURE`;

    // Kullanıcı kumaş tipi seçtiyse özel talimat oluştur
    const userFabricInstruction = fabricType && fabricType !== 'auto' && FABRIC_TYPE_DESCRIPTIONS[fabricType]
        ? `
🧥🧥🧥 USER SPECIFIED FABRIC TYPE - MUST FOLLOW 🧥🧥🧥
THE USER HAS EXPLICITLY SPECIFIED THE FABRIC TYPE FOR THE JACKET. YOU MUST USE THIS:
⚡ FABRIC TYPE: ${FABRIC_TYPE_DESCRIPTIONS[fabricType]}
⚡ The jacket/coat fabric texture MUST match the specified type above
⚡ This overrides any fabric detection from the input image
`
        : '';

    // Kullanıcı pile tipi seçtiyse özel talimat oluştur
    const userPleatInstruction = pleatType && pleatType !== 'auto' && PLEAT_TYPE_DESCRIPTIONS[pleatType]
        ? `
👖👖👖 USER SPECIFIED PLEAT TYPE - MUST FOLLOW 👖👖👖
THE USER HAS EXPLICITLY SPECIFIED THE PLEAT TYPE FOR THE TROUSERS. YOU MUST USE THIS:
⚡ PLEAT TYPE: ${PLEAT_TYPE_DESCRIPTIONS[pleatType]}
⚡ The trousers MUST show EXACTLY this pleat configuration
⚡ COUNT THE PLEATS: ${pleatType === 'double' ? '2 pleats on each side (4 total)' : pleatType === 'single' ? '1 pleat on each side (2 total)' : 'NO pleats - flat front'}
⚡ This overrides any pleat detection from the input image
⚡ DO NOT simplify double pleats to single, or add pleats to flat front
`
        : '';

    // Kullanıcı pantolon kesim tipi seçtiyse özel talimat oluştur
    const userTrouserFitInstruction = trouserFit && trouserFit !== 'auto' && TROUSER_FIT_DESCRIPTIONS[trouserFit]
        ? `
👖✂️👖 USER SPECIFIED TROUSER FIT/CUT - MUST FOLLOW 👖✂️👖
THE USER HAS EXPLICITLY SPECIFIED THE TROUSER FIT. YOU MUST PRESERVE THIS:
⚡ TROUSER FIT: ${TROUSER_FIT_DESCRIPTIONS[trouserFit]}
⚡ DO NOT change wide-leg to slim or slim to wide
⚡ The trouser silhouette MUST match the specified fit type
⚡ If user says WIDE LEG → trousers must be LOOSE and WIDE, NOT tapered
⚡ If user says SLIM → trousers must be NARROW and FITTED
⚡ This overrides any fit detection from the input image
⚡ PRESERVE THE EXACT WIDTH AND DRAPE OF THE ORIGINAL TROUSERS
`
        : '';

    // Kullanıcı pantolon kumaş tipi seçtiyse özel talimat oluştur
    const userTrouserFabricInstruction = trouserFabricType && trouserFabricType !== 'auto' && TROUSER_FABRIC_DESCRIPTIONS[trouserFabricType]
        ? `
👖🧵👖 USER SPECIFIED TROUSER FABRIC TYPE - MUST FOLLOW 👖🧵👖
THE USER HAS EXPLICITLY SPECIFIED THE TROUSER FABRIC. YOU MUST RENDER THIS:
⚡ TROUSER FABRIC: ${TROUSER_FABRIC_DESCRIPTIONS[trouserFabricType]}
⚡ The trouser texture and appearance MUST match the specified fabric type
⚡ Show characteristic texture, drape, and surface quality of this fabric
⚡ This overrides any fabric detection from the input image
`
        : '';

    // Pantolon bel yüksekliği - Deterministic mapper system
    const waistRiseInjection = getWaistRiseInjection(trouserWaistRise || '');
    const userWaistRiseInstruction = waistRiseInjection ? composeWaistRisePrompt(waistRiseInjection) : '';

    // Final waist rise verification - only for high/ultra_high
    const waistRiseFinalCheck = (trouserWaistRise === 'high' || trouserWaistRise === 'ultra_high')
        ? `
🔴🔴🔴🔴🔴 FINAL MANDATORY CHECK - WAISTBAND POSITION 🔴🔴🔴🔴🔴

⛔⛔⛔ BEFORE OUTPUTTING, VERIFY THIS: ⛔⛔⛔

${trouserWaistRise === 'ultra_high'
? `📏 PROPORTION CHECK (ULTRA HIGH-RISE):
┌────────────────────────────────────┐
│ Shoulder to Waistband = 15% MAX    │
│ Waistband to Feet = 85% MIN        │
└────────────────────────────────────┘

✅ PASS CRITERIA:
- Belt/waistband at RIBCAGE level (kaburga hizası)
- Waistband ABOVE belly button
- Torso above belt = MINIMAL (just chest/shoulders)
- Shirt deeply tucked, waistband DOMINANT feature

❌ FAIL CRITERIA (REJECT & REGENERATE):
- Belt at belly button level = FAIL
- Belt at hip level = FAIL
- More than 20% torso visible = FAIL
- Shirt not tucked = FAIL`
: `📏 PROPORTION CHECK (HIGH-RISE):
┌────────────────────────────────────┐
│ Shoulder to Waistband = 25% MAX    │
│ Waistband to Feet = 75% MIN        │
└────────────────────────────────────┘

✅ PASS CRITERIA:
- Belt/waistband at NAVEL level (göbek hizası)
- Waistband 5-8cm ABOVE hip bones
- Torso above belt = SHORT (only 25%)
- Shirt tucked, waistband clearly visible

❌ FAIL CRITERIA (REJECT & REGENERATE):
- Belt at hip bone level = FAIL
- Belt below belly button = FAIL
- More than 30% torso visible = FAIL
- Shirt covering waistband = FAIL`}

🚫🚫🚫 IF WAISTBAND IS AT KALÇA/HIP LEVEL = WRONG! REGENERATE! 🚫🚫🚫
`
        : '';

    // Kullanıcı triko tipi seçtiyse özel talimat oluştur
    const userKnitwearInstruction = knitwearType && knitwearType !== 'auto' && KNITWEAR_TYPE_DESCRIPTIONS[knitwearType]
        ? `
🧶🧶🧶 USER SPECIFIED KNITWEAR TYPE - MUST FOLLOW 🧶🧶🧶
THE USER HAS EXPLICITLY SPECIFIED THE KNITWEAR/TOP TYPE. YOU MUST USE THIS:
⚡ KNITWEAR TYPE: ${KNITWEAR_TYPE_DESCRIPTIONS[knitwearType]}
⚡ The top garment MUST match this exact style and construction
⚡ This overrides any knitwear detection from the input image
`
        : '';

    // Kullanıcı gömlek içinde/dışında seçtiyse özel talimat oluştur
    const userShirtTuckInstruction = shirtTuck && shirtTuck !== 'auto' && SHIRT_TUCK_DESCRIPTIONS[shirtTuck]
        ? `
👔📍👔 USER SPECIFIED SHIRT TUCK STYLE - MUST FOLLOW 👔📍👔
THE USER HAS EXPLICITLY SPECIFIED HOW THE TOP SHOULD BE WORN:
⚡ TUCK STYLE: ${SHIRT_TUCK_DESCRIPTIONS[shirtTuck]}
⚡ The shirt/top MUST be styled exactly as specified above
⚡ This is CRITICAL for the overall look and silhouette
`
        : '';

    // Spalla Camicia (Omuz Dikişi) talimatı
    const userSpallaCamiciaInstruction = spallaCamicia && spallaCamicia !== 'auto' && SPALLA_CAMICIA_DESCRIPTIONS[spallaCamicia]
        ? `
🎯👔 SPALLA CAMICIA - SHOULDER CONSTRUCTION REQUIREMENT 👔🎯
${SPALLA_CAMICIA_DESCRIPTIONS[spallaCamicia]}
⚡ The jacket/blazer shoulder MUST follow this construction style
⚡ This is a critical tailoring detail - pay close attention to the shoulder seam
`
        : '';

    // Kamera çerçevesi talimatı
    const cameraFrameInstruction = cameraFrame && CAMERA_FRAME_DESCRIPTIONS[cameraFrame]
        ? `
📷📷📷 CAMERA FRAME / FRAMING - CRITICAL 📷📷📷
${CAMERA_FRAME_DESCRIPTIONS[cameraFrame]}
⚡ The image MUST be framed according to this specification
⚡ DO NOT show more or less of the model than specified
`
        : '';

    // Kamera çerçevesi için kısa Distance açıklaması
    const cameraFrameShort: Record<string, string> = {
        'full-body': 'Full body shot - head to toe',
        '3/4': '3/4 shot - head to knees',
        'waist-up': 'Waist-up shot - waist to head only',
        'waist-down': 'Waist-down shot - waist to feet only'
    };
    const distanceDescription = cameraFrame && cameraFrameShort[cameraFrame]
        ? cameraFrameShort[cameraFrame]
        : 'Full body shot to show complete garment';

    // Kamera açısı talimatı
    const cameraAngleInstruction = cameraAngle && CAMERA_ANGLE_DESCRIPTIONS[cameraAngle]
        ? `
📐📐📐 CAMERA ANGLE - IMPORTANT 📐📐📐
${CAMERA_ANGLE_DESCRIPTIONS[cameraAngle]}
⚡ Position the camera at this specific angle relative to the model
⚡ This is ONLY a camera position change - do NOT add extra people or figures
⚡ There should be exactly ONE model in the frame
⚡ BACKGROUND MUST STAY THE SAME - only camera viewpoint changes, not the background
⚡ The specified background color/style applies regardless of camera angle

🚨 CRITICAL - PRESERVE BODY PROPORTIONS 🚨
When changing camera angle, the model's BODY PROPORTIONS must remain ANATOMICALLY CORRECT:
- Do NOT distort, compress, or stretch the body
- Do NOT make the head too large or too small relative to body
- Do NOT shorten or elongate the torso unnaturally
- Do NOT compress the limbs (arms, legs)
- The model must look like a REAL HUMAN with correct proportions
- Head-to-body ratio must be realistic (head is about 1/7 to 1/8 of total height)
- Torso, arms, and legs must have natural lengths and proportions
- If the input shows a tall/slim model, output must show same tall/slim proportions
- WRONG: Squashed body, oversized head, stubby limbs
- CORRECT: Natural human anatomy preserved from any camera angle
`
        : '';

    // Kamera açısı için kısa açıklama
    const cameraAngleShort = cameraAngle && CAMERA_ANGLE_DESCRIPTIONS[cameraAngle]
        ? CAMERA_ANGLE_DESCRIPTIONS[cameraAngle].split(' - ')[0]
        : 'Eye level';

    // Işık stili talimatı
    const lightingInstruction = lightingStyle && LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]
        ? `
💡💡💡 USER SPECIFIED LIGHTING STYLE - MUST FOLLOW 💡💡💡
${LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]}
⚡ Apply this exact lighting setup to the scene
`
        : '';

    // Varsayılan veya seçilen ışık açıklaması
    const lightingDescription = lightingStyle && LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]
        ? LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]
        : `CATALOG STUDIO LIGHTING:
- BRIGHT, WELL-LIT studio environment
- Soft directional lighting with MINIMAL shadows - keep face and clothing BRIGHT
- Fill lights to eliminate dark areas
- Slightly warmer color temperature for premium feel
- Result: WELL-EXPOSED, bright catalog photography with gentle dimension`;

    return `
MEN'S FASHION CATALOG PHOTOGRAPHY

${userWaistRiseInstruction}

${userCollarInstruction}
${userFabricInstruction}
${userPleatInstruction}
${userTrouserFitInstruction}
${userTrouserFabricInstruction}
${userKnitwearInstruction}
${userShirtTuckInstruction}
${userSpallaCamiciaInstruction}
${cameraFrameInstruction}
${cameraAngleInstruction}
${lightingInstruction}

CRITICAL PRODUCT INTEGRITY:
Use the uploaded product image as the EXACT visual reference for the garment.
The clothing design, fabric, color, texture, stitching, fit and proportions must remain IDENTICAL to the reference image.
Do not change the product in any way. The model is only a carrier; the garment is the hero.
⚠️ ESPECIALLY THE NECKLINE - COPY IT EXACTLY FROM INPUT IMAGE ⚠️

🧍 CRITICAL - HUMAN BODY PROPORTIONS 🧍
The model must have CORRECT, NATURAL human anatomy:
- Head size: approximately 1/7 to 1/8 of total body height
- Do NOT create oversized heads or shrunken bodies
- Do NOT compress or squash the torso
- Arms and legs must have natural, realistic lengths
- The body must NOT look distorted, stretched, or compressed
- If input shows a model with certain proportions, OUTPUT must match those proportions
- Think: "Would this person look normal standing next to real people?"

ZERO IMAGINATION / ZERO HALLUCINATION POLICY:
ABSOLUTELY NO PRODUCT HALLUCINATION - CRITICAL
DO NOT USE YOUR IMAGINATION. DO NOT ADD ANYTHING NOT IN THE INPUT.

STRICT RULES:
- ONLY use what is VISIBLE in the input image(s)
- ONLY apply the settings the user has selected
- The INPUT IMAGES define what products exist - NOTHING ELSE
- If user gives 1 jacket → output shows ONLY that 1 jacket
- If user gives pants + shirt → output shows ONLY those 2 items
- DO NOT add extra clothing items (scarves, hats, belts, ties, pocket squares, etc.)
- DO NOT add accessories (watches, jewelry, sunglasses, bags, etc.)
- DO NOT add props or objects not in the input
- DO NOT change or "improve" the garment design
- DO NOT add patterns, textures, or details not in the input
- DO NOT add background elements not specified
- DO NOT add other people or animals (unless user selected)
- DO NOT be creative with the product - COPY IT EXACTLY
- DO NOT invent/hallucinate any product that wasn't provided
- If something is NOT in the input and NOT in user settings = DO NOT ADD IT
- Your job is to REPLICATE EXACTLY, not to CREATE or IMAGINE

🏷️ LOGO/BROOCH/EMBLEM RULE - CRITICAL:
- If the input has a collar pin, brooch, logo, or emblem on the lapel/collar:
  - If you can render it CLEARLY and ACCURATELY → show it
  - If you CANNOT render it clearly (blurry, distorted, unreadable) → DO NOT SHOW IT AT ALL
  - Better NO logo than a BAD/UNCLEAR logo
  - Do NOT invent or guess what the logo looks like
  - Do NOT show a generic/placeholder logo
---

CATEGORY: Men's fashion (jacket, coat, suit, pants, shirt – based on the uploaded product).

MODEL SPECIFICATIONS:
- SKIN TONE: ${skinDescription}
- Age appearance: 28-40 years old
- Physique: Athletic, well-proportioned male body
- Facial expression: Sophisticated, refined, minimal expression
- Grooming: Impeccable, premium appearance
- POSE: ${poseDescription} - relaxed and confident, slight weight shift, natural posture

CAMERA ANGLE & LENS:
- Camera angle: ${cameraAngleShort} with a controlled 3/4 angle to show body form
- Lens: 50-85mm lens look with gentle depth
- Distance/Framing: ${distanceDescription}
- Composition: Asymmetric composition allowing space for text overlays

LIGHTING SETUP:
${lightingDescription}

BACKGROUND:
${backgroundSection}
- Elegant negative space for editorial layout

MOOD & STYLE:
- Editorial, premium, minimal
- BRIGHT and professional - NOT dark or moody
- Goal: Brand consistency with refined fashion presentation

GENERAL COMPOSITION RULES:
- No wide-angle distortion
- Garment must be fully readable and correctly proportioned
- Clean framing with intentional negative space
- Natural body anatomy and realistic posture
- Foreground, subject, and background must be visually separated with depth

COLOR & GRADING:
- BRIGHT, WELL-EXPOSED image - NOT dark or underexposed
- Neutral to warm editorial color palette
- NORMAL saturation, BALANCED contrast
- Proper exposure throughout the image
- Natural skin tones, realistic fabric rendering
- Professional catalog photography look - BRIGHT and CLEAN

QUALITY REQUIREMENTS:
- Photorealistic men's fashion photography
- Clean, premium, brand-consistent output
- WELL-LIT and BRIGHT - NOT dark
- No artifacts, no warped clothing, no incorrect textures
- No logos or text unless present in the reference image

NEGATIVE (AVOID):
- Changing garment design or fit
- Wrong fabric or color
- Oversharpening
- Plastic skin
- Harsh shadows
- DARK or UNDEREXPOSED images
- Moody lighting
- Busy or distracting background
- Fashion elements competing with the product

CRITICAL: DO NOT ADD EXTRA PRODUCTS
- ONLY use the clothing items provided in the input images
- DO NOT add any additional accessories (watches, belts, hats, bags, sunglasses, jewelry, etc.)
- DO NOT add any extra clothing items not shown in the input
- If only a shirt is provided, model should wear ONLY that shirt (with appropriate basic pants)
- If only a jacket is provided, model should wear ONLY that jacket (with appropriate basic inner/pants)
- The model should wear ONLY what is explicitly provided in the input images
- Any accessory or clothing NOT in the input = FORBIDDEN

📷📷📷 OUTPUT FORMAT - SINGLE IMAGE ONLY 📷📷📷
- Generate exactly ONE single photograph
- DO NOT create a collage, grid, or multiple views
- DO NOT split the image into 2, 3, or 4 panels
- DO NOT show the model from multiple angles in one image
- ONE model, ONE pose, ONE single photograph
- ⛔ DO NOT add extra people, observers, or silhouettes - ONLY the main model
- The output must be a single cohesive image, not a composite
- Camera angle changes = camera moves around ONE model, NOT adding more people
- 🎨 BACKGROUND STAYS CONSTANT: The specified background color/style must be used regardless of camera angle. Do not invent new backgrounds or add random elements when camera angle changes.
${customPrompt ? `

✏️✏️✏️ USER'S CUSTOM INSTRUCTIONS - MUST FOLLOW ✏️✏️✏️
The user has provided specific instructions that MUST be followed:
>>> ${customPrompt} <<<
⚡ Apply these instructions to the output
⚡ These are direct orders from the user - prioritize them
` : ''}

${waistRiseFinalCheck}
`;
};

// REKLAM prompt'u
const getMensFashionAdvertisingPrompt = (skinTone: string, poseStyle: string, background: string, backgroundStyle: string, collarType?: string, fabricType?: string, pleatType?: string, trouserFit?: string, studioMinimalColor?: string, studioMinimalVignette?: boolean, cameraFrame?: string, customPrompt?: string, floorType?: string, cameraAngle?: string, lightingStyle?: string, woodType?: string, trouserFabricType?: string, trouserWaistRise?: string, knitwearType?: string, shirtTuck?: string, spallaCamicia?: string): string => {
    const skinDescription = skinTone && MENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        ? MENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        : 'natural, healthy skin tone';

    const poseDescription = poseStyle && MENS_POSE_DESCRIPTIONS[poseStyle]
        ? MENS_POSE_DESCRIPTIONS[poseStyle]
        : MENS_POSE_DESCRIPTIONS['confident'];

    const bgStyleInfo = MENS_FASHION_BACKGROUND_STYLES.find(s => s.id === backgroundStyle);
    const supportsColor = bgStyleInfo?.supportsColor ?? true;

    const bgInfo = MENS_FASHION_BACKGROUNDS.find(b => b.id === background);
    const bgName = bgInfo?.name || 'Antrasit';
    const bgHex = bgInfo?.hex || '#4A4A4A';
    const bgDescription = bgInfo?.description || 'Dramatik, modern';

    // Ahşap için özel açıklama - woodType parametresine göre
    const getWoodDescriptionAd = () => {
        const woodDesc = woodType && WOOD_TYPE_DESCRIPTIONS[woodType]
            ? WOOD_TYPE_DESCRIPTIONS[woodType]
            : WOOD_TYPE_DESCRIPTIONS['oak-light'];
        return `${woodDesc}, MATTE NON-GLOSSY natural wood finish, authentic imperfections like real wood - knots, grain variations, subtle color differences`;
    };

    // Studio Minimal Gradient veya Wood için özel prompt
    const bgStyleDescription = backgroundStyle === 'studio-minimal'
        ? buildStudioMinimalGradientPrompt(studioMinimalColor || 'pure-white', studioMinimalVignette || false)
        : backgroundStyle === 'wood'
            ? getWoodDescriptionAd()
            : (BACKGROUND_STYLE_DESCRIPTIONS[backgroundStyle] || BACKGROUND_STYLE_DESCRIPTIONS['solid']);

    // Arka plan değiştirme vurgusu
    const backgroundChangeEmphasis = `
CRITICAL BACKGROUND RULE:
- DO NOT copy or use the background from the input/source image
- COMPLETELY REPLACE the background with the specified color below
- The input image background is IRRELEVANT - ignore it completely
- CREATE A NEW BACKGROUND as specified`;

    // Beyaz için özel vurgu
    const whiteEmphasis = background === 'white'
        ? `
⚠️ PURE WHITE BACKGROUND REQUIRED:
- Background MUST be PURE WHITE (#FFFFFF) - RGB(255,255,255)
- NOT cream, NOT off-white, NOT ivory, NOT beige, NOT gray
- Like Amazon/Shopify product photography - clean pure white`
        : '';

    // Studio Minimal için özel işleme - kendi renk sistemini kullanır (REKLAM)
    const backgroundSection = backgroundStyle === 'studio-minimal'
        ? `${backgroundChangeEmphasis}\n\n🎨 STUDIO MINIMAL GRADIENT BACKDROP:\n${bgStyleDescription}`
        : supportsColor
            ? `${backgroundChangeEmphasis}\n- Background Color: ${bgName} (${bgHex}) - ${bgDescription}\n- Background Style: ${bgStyleDescription}${whiteEmphasis}`
            : `${backgroundChangeEmphasis}\n- Background Style: ${bgStyleDescription}`;

    // Kullanıcı yaka tipi seçtiyse özel talimat oluştur
    const userCollarInstruction = collarType && collarType !== 'auto' && COLLAR_TYPE_DESCRIPTIONS[collarType]
        ? `
🎯🎯🎯 USER SPECIFIED COLLAR TYPE - MUST FOLLOW 🎯🎯🎯
THE USER HAS EXPLICITLY SPECIFIED THE COLLAR TYPE. YOU MUST USE THIS:
⚡ COLLAR TYPE: ${COLLAR_TYPE_DESCRIPTIONS[collarType]}
⚡ DO NOT analyze the input image for collar type - USE THE SPECIFIED TYPE ABOVE
⚡ This overrides any collar detection from the input image
`
        : `
ABSOLUTE #1 RULE - NECKLINE PRESERVATION:
BEFORE GENERATING, CAREFULLY ANALYZE THE INPUT IMAGE:
- What is the EXACT neckline type? (V-neck, crew neck, round neck, etc.)
- Is it a TURTLENECK? Only if the input clearly shows a turtleneck.
- If the input shows a V-NECK sweater → The output MUST show V-NECK sweater
- If the input shows a CREW NECK → The output MUST show CREW NECK
- If the input shows a ROUND NECK → The output MUST show ROUND NECK
- DO NOT ASSUME TURTLENECK unless the input image CLEARLY shows one
- TURTLENECK = neck is FULLY COVERED up to chin
- V-NECK = V-shaped opening at chest
- CREW NECK = Round opening at base of neck
- CHANGING THE NECKLINE = WRONG PRODUCT = FAILURE`;

    // Kullanıcı kumaş tipi seçtiyse özel talimat oluştur
    const userFabricInstruction = fabricType && fabricType !== 'auto' && FABRIC_TYPE_DESCRIPTIONS[fabricType]
        ? `
🧥🧥🧥 USER SPECIFIED FABRIC TYPE - MUST FOLLOW 🧥🧥🧥
THE USER HAS EXPLICITLY SPECIFIED THE FABRIC TYPE FOR THE JACKET. YOU MUST USE THIS:
⚡ FABRIC TYPE: ${FABRIC_TYPE_DESCRIPTIONS[fabricType]}
⚡ The jacket/coat fabric texture MUST match the specified type above
⚡ This overrides any fabric detection from the input image
`
        : '';

    // Kullanıcı pile tipi seçtiyse özel talimat oluştur
    const userPleatInstruction = pleatType && pleatType !== 'auto' && PLEAT_TYPE_DESCRIPTIONS[pleatType]
        ? `
👖👖👖 USER SPECIFIED PLEAT TYPE - MUST FOLLOW 👖👖👖
THE USER HAS EXPLICITLY SPECIFIED THE PLEAT TYPE FOR THE TROUSERS. YOU MUST USE THIS:
⚡ PLEAT TYPE: ${PLEAT_TYPE_DESCRIPTIONS[pleatType]}
⚡ The trousers MUST show EXACTLY this pleat configuration
⚡ COUNT THE PLEATS: ${pleatType === 'double' ? '2 pleats on each side (4 total)' : pleatType === 'single' ? '1 pleat on each side (2 total)' : 'NO pleats - flat front'}
⚡ This overrides any pleat detection from the input image
⚡ DO NOT simplify double pleats to single, or add pleats to flat front
`
        : '';

    // Kullanıcı pantolon kesim tipi seçtiyse özel talimat oluştur
    const userTrouserFitInstruction = trouserFit && trouserFit !== 'auto' && TROUSER_FIT_DESCRIPTIONS[trouserFit]
        ? `
👖✂️👖 USER SPECIFIED TROUSER FIT/CUT - MUST FOLLOW 👖✂️👖
THE USER HAS EXPLICITLY SPECIFIED THE TROUSER FIT. YOU MUST PRESERVE THIS:
⚡ TROUSER FIT: ${TROUSER_FIT_DESCRIPTIONS[trouserFit]}
⚡ DO NOT change wide-leg to slim or slim to wide
⚡ The trouser silhouette MUST match the specified fit type
⚡ If user says WIDE LEG → trousers must be LOOSE and WIDE, NOT tapered
⚡ If user says SLIM → trousers must be NARROW and FITTED
⚡ This overrides any fit detection from the input image
⚡ PRESERVE THE EXACT WIDTH AND DRAPE OF THE ORIGINAL TROUSERS
`
        : '';

    // Kullanıcı pantolon kumaş tipi seçtiyse özel talimat oluştur
    const userTrouserFabricInstruction = trouserFabricType && trouserFabricType !== 'auto' && TROUSER_FABRIC_DESCRIPTIONS[trouserFabricType]
        ? `
👖🧵👖 USER SPECIFIED TROUSER FABRIC TYPE - MUST FOLLOW 👖🧵👖
THE USER HAS EXPLICITLY SPECIFIED THE TROUSER FABRIC. YOU MUST RENDER THIS:
⚡ TROUSER FABRIC: ${TROUSER_FABRIC_DESCRIPTIONS[trouserFabricType]}
⚡ The trouser texture and appearance MUST match the specified fabric type
⚡ Show characteristic texture, drape, and surface quality of this fabric
⚡ This overrides any fabric detection from the input image
`
        : '';

    // Pantolon bel yüksekliği - Deterministic mapper system
    const waistRiseInjection = getWaistRiseInjection(trouserWaistRise || '');
    const userWaistRiseInstruction = waistRiseInjection ? composeWaistRisePrompt(waistRiseInjection) : '';

    // Final waist rise verification - only for high/ultra_high
    const waistRiseFinalCheck = (trouserWaistRise === 'high' || trouserWaistRise === 'ultra_high')
        ? `
🔴🔴🔴🔴🔴 FINAL MANDATORY CHECK - WAISTBAND POSITION 🔴🔴🔴🔴🔴

⛔⛔⛔ BEFORE OUTPUTTING, VERIFY THIS: ⛔⛔⛔

${trouserWaistRise === 'ultra_high'
? `📏 PROPORTION CHECK (ULTRA HIGH-RISE):
┌────────────────────────────────────┐
│ Shoulder to Waistband = 15% MAX    │
│ Waistband to Feet = 85% MIN        │
└────────────────────────────────────┘

✅ PASS CRITERIA:
- Belt/waistband at RIBCAGE level (kaburga hizası)
- Waistband ABOVE belly button
- Torso above belt = MINIMAL (just chest/shoulders)
- Shirt deeply tucked, waistband DOMINANT feature

❌ FAIL CRITERIA (REJECT & REGENERATE):
- Belt at belly button level = FAIL
- Belt at hip level = FAIL
- More than 20% torso visible = FAIL
- Shirt not tucked = FAIL`
: `📏 PROPORTION CHECK (HIGH-RISE):
┌────────────────────────────────────┐
│ Shoulder to Waistband = 25% MAX    │
│ Waistband to Feet = 75% MIN        │
└────────────────────────────────────┘

✅ PASS CRITERIA:
- Belt/waistband at NAVEL level (göbek hizası)
- Waistband 5-8cm ABOVE hip bones
- Torso above belt = SHORT (only 25%)
- Shirt tucked, waistband clearly visible

❌ FAIL CRITERIA (REJECT & REGENERATE):
- Belt at hip bone level = FAIL
- Belt below belly button = FAIL
- More than 30% torso visible = FAIL
- Shirt covering waistband = FAIL`}

🚫🚫🚫 IF WAISTBAND IS AT KALÇA/HIP LEVEL = WRONG! REGENERATE! 🚫🚫🚫
`
        : '';

    // Kullanıcı triko tipi seçtiyse özel talimat oluştur
    const userKnitwearInstruction = knitwearType && knitwearType !== 'auto' && KNITWEAR_TYPE_DESCRIPTIONS[knitwearType]
        ? `
🧶🧶🧶 USER SPECIFIED KNITWEAR TYPE - MUST FOLLOW 🧶🧶🧶
THE USER HAS EXPLICITLY SPECIFIED THE KNITWEAR/TOP TYPE. YOU MUST USE THIS:
⚡ KNITWEAR TYPE: ${KNITWEAR_TYPE_DESCRIPTIONS[knitwearType]}
⚡ The top garment MUST match this exact style and construction
⚡ This overrides any knitwear detection from the input image
`
        : '';

    // Kullanıcı gömlek içinde/dışında seçtiyse özel talimat oluştur
    const userShirtTuckInstruction = shirtTuck && shirtTuck !== 'auto' && SHIRT_TUCK_DESCRIPTIONS[shirtTuck]
        ? `
👔📍👔 USER SPECIFIED SHIRT TUCK STYLE - MUST FOLLOW 👔📍👔
THE USER HAS EXPLICITLY SPECIFIED HOW THE TOP SHOULD BE WORN:
⚡ TUCK STYLE: ${SHIRT_TUCK_DESCRIPTIONS[shirtTuck]}
⚡ The shirt/top MUST be styled exactly as specified above
⚡ This is CRITICAL for the overall look and silhouette
`
        : '';

    // Spalla Camicia (Omuz Dikişi) talimatı
    const userSpallaCamiciaInstruction = spallaCamicia && spallaCamicia !== 'auto' && SPALLA_CAMICIA_DESCRIPTIONS[spallaCamicia]
        ? `
🎯👔 SPALLA CAMICIA - SHOULDER CONSTRUCTION REQUIREMENT 👔🎯
${SPALLA_CAMICIA_DESCRIPTIONS[spallaCamicia]}
⚡ The jacket/blazer shoulder MUST follow this construction style
⚡ This is a critical tailoring detail - pay close attention to the shoulder seam
`
        : '';

    // Kamera çerçevesi talimatı
    const cameraFrameInstruction = cameraFrame && CAMERA_FRAME_DESCRIPTIONS[cameraFrame]
        ? `
📷📷📷 CAMERA FRAME / FRAMING - CRITICAL 📷📷📷
${CAMERA_FRAME_DESCRIPTIONS[cameraFrame]}
⚡ The image MUST be framed according to this specification
⚡ DO NOT show more or less of the model than specified
`
        : '';

    // Kamera çerçevesi için kısa Distance açıklaması
    const cameraFrameShort: Record<string, string> = {
        'full-body': 'Full body shot - head to toe',
        '3/4': '3/4 shot - head to knees',
        'waist-up': 'Waist-up shot - waist to head only',
        'waist-down': 'Waist-down shot - waist to feet only'
    };
    const distanceDescription = cameraFrame && cameraFrameShort[cameraFrame]
        ? cameraFrameShort[cameraFrame]
        : 'Full body shot to show complete garment';

    // Kamera açısı talimatı
    const cameraAngleInstruction = cameraAngle && CAMERA_ANGLE_DESCRIPTIONS[cameraAngle]
        ? `
📐📐📐 CAMERA ANGLE - IMPORTANT 📐📐📐
${CAMERA_ANGLE_DESCRIPTIONS[cameraAngle]}
⚡ Position the camera at this specific angle relative to the model
⚡ This is ONLY a camera position change - do NOT add extra people or figures
⚡ There should be exactly ONE model in the frame
⚡ BACKGROUND MUST STAY THE SAME - only camera viewpoint changes, not the background
⚡ The specified background color/style applies regardless of camera angle

🚨 CRITICAL - PRESERVE BODY PROPORTIONS 🚨
When changing camera angle, the model's BODY PROPORTIONS must remain ANATOMICALLY CORRECT:
- Do NOT distort, compress, or stretch the body
- Do NOT make the head too large or too small relative to body
- Do NOT shorten or elongate the torso unnaturally
- Do NOT compress the limbs (arms, legs)
- The model must look like a REAL HUMAN with correct proportions
- Head-to-body ratio must be realistic (head is about 1/7 to 1/8 of total height)
- Torso, arms, and legs must have natural lengths and proportions
- If the input shows a tall/slim model, output must show same tall/slim proportions
- WRONG: Squashed body, oversized head, stubby limbs
- CORRECT: Natural human anatomy preserved from any camera angle
`
        : '';

    // Kamera açısı için kısa açıklama
    const cameraAngleShort = cameraAngle && CAMERA_ANGLE_DESCRIPTIONS[cameraAngle]
        ? CAMERA_ANGLE_DESCRIPTIONS[cameraAngle].split(' - ')[0]
        : 'Slightly low-angle or dynamic 3/4 angle';

    // Işık stili talimatı
    const lightingInstruction = lightingStyle && LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]
        ? `
💡💡💡 USER SPECIFIED LIGHTING STYLE - MUST FOLLOW 💡💡💡
${LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]}
⚡ Apply this exact lighting setup to the scene
`
        : '';

    // Varsayılan veya seçilen ışık açıklaması
    const lightingDescription = lightingStyle && LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]
        ? LIGHTING_STYLE_DESCRIPTIONS[lightingStyle]
        : `ADVERTISING STUDIO LIGHTING:
- BRIGHT, professional advertising studio lighting
- Well-lit environment - face and clothing must be CLEARLY VISIBLE
- Soft directional key light with strong fill to avoid dark areas
- Even exposure across the model - NO underexposed shadows
- Result: BRIGHT, powerful, premium advertising look`;

    return `
MEN'S FASHION ADVERTISING PHOTOGRAPHY

${userWaistRiseInstruction}

${userCollarInstruction}
${userFabricInstruction}
${userPleatInstruction}
${userTrouserFitInstruction}
${userTrouserFabricInstruction}
${userKnitwearInstruction}
${userShirtTuckInstruction}
${userSpallaCamiciaInstruction}
${cameraFrameInstruction}
${cameraAngleInstruction}
${lightingInstruction}

CRITICAL PRODUCT INTEGRITY:
Use the uploaded product image as the EXACT visual reference for the garment.
The clothing design, fabric, color, texture, stitching, fit and proportions must remain IDENTICAL to the reference image.
Do not change the product in any way. The model is only a carrier; the garment is the hero.
⚠️ ESPECIALLY THE NECKLINE - COPY IT EXACTLY FROM INPUT IMAGE ⚠️

🧍 CRITICAL - HUMAN BODY PROPORTIONS 🧍
The model must have CORRECT, NATURAL human anatomy:
- Head size: approximately 1/7 to 1/8 of total body height
- Do NOT create oversized heads or shrunken bodies
- Do NOT compress or squash the torso
- Arms and legs must have natural, realistic lengths
- The body must NOT look distorted, stretched, or compressed
- If input shows a model with certain proportions, OUTPUT must match those proportions
- Think: "Would this person look normal standing next to real people?"

ZERO IMAGINATION / ZERO HALLUCINATION POLICY:
ABSOLUTELY NO PRODUCT HALLUCINATION - CRITICAL
DO NOT USE YOUR IMAGINATION. DO NOT ADD ANYTHING NOT IN THE INPUT.

STRICT RULES:
- ONLY use what is VISIBLE in the input image(s)
- ONLY apply the settings the user has selected
- The INPUT IMAGES define what products exist - NOTHING ELSE
- If user gives 1 jacket → output shows ONLY that 1 jacket
- If user gives pants + shirt → output shows ONLY those 2 items
- DO NOT add extra clothing items (scarves, hats, belts, ties, pocket squares, etc.)
- DO NOT add accessories (watches, jewelry, sunglasses, bags, etc.)
- DO NOT add props or objects not in the input
- DO NOT change or "improve" the garment design
- DO NOT add patterns, textures, or details not in the input
- DO NOT add background elements not specified
- DO NOT add other people or animals (unless user selected)
- DO NOT be creative with the product - COPY IT EXACTLY
- DO NOT invent/hallucinate any product that wasn't provided
- If something is NOT in the input and NOT in user settings = DO NOT ADD IT
- Your job is to REPLICATE EXACTLY, not to CREATE or IMAGINE

🏷️ LOGO/BROOCH/EMBLEM RULE - CRITICAL:
- If the input has a collar pin, brooch, logo, or emblem on the lapel/collar:
  - If you can render it CLEARLY and ACCURATELY → show it
  - If you CANNOT render it clearly (blurry, distorted, unreadable) → DO NOT SHOW IT AT ALL
  - Better NO logo than a BAD/UNCLEAR logo
  - Do NOT invent or guess what the logo looks like
  - Do NOT show a generic/placeholder logo
---

CATEGORY: Men's fashion (jacket, coat, suit, pants, shirt – based on the uploaded product).

MODEL SPECIFICATIONS:
- SKIN TONE: ${skinDescription}
- Age appearance: 25-38 years old
- Physique: Fit, charismatic presence with strong masculine energy
- Facial expression: Intense, confident, captivating
- Grooming: Styled, editorial-ready appearance
- POSE: ${poseDescription} - confident and dynamic (walking, adjusting jacket, subtle movement)

CAMERA ANGLE & LENS:
- Camera angle: ${cameraAngleShort} for a strong masculine presence
- Lens: 35-50mm cinematic lens look, natural perspective
- Distance/Framing: ${distanceDescription}
- Composition: Bold, asymmetric, rule-breaking composition

LIGHTING SETUP:
${lightingDescription}

BACKGROUND/ENVIRONMENT:
${backgroundSection}
- Clean, professional backdrop
- Can be slightly blurred for focus on model/clothing

MOOD & STYLE:
- Powerful, premium, aspirational
- BRIGHT and professional - NOT dark or moody
- Goal: Scroll-stopping impact for digital advertising (Meta, Google Ads)

GENERAL COMPOSITION RULES:
- No wide-angle distortion
- Garment must be fully readable and correctly proportioned
- Clean framing with intentional negative space
- Natural body anatomy and realistic posture
- Foreground, subject, and background must be visually separated with depth

COLOR & GRADING:
- BRIGHT, WELL-EXPOSED image - NOT dark or underexposed
- Neutral to warm editorial color palette
- NORMAL saturation, BALANCED contrast
- Proper exposure - face and clothing clearly lit
- Natural skin tones, realistic fabric rendering
- Professional advertising photography - BRIGHT and IMPACTFUL

QUALITY REQUIREMENTS:
- Photorealistic men's fashion photography
- Clean, premium, brand-consistent output
- WELL-LIT and BRIGHT - NOT dark or moody
- No artifacts, no warped clothing, no incorrect textures
- No logos or text unless present in the reference image
- Scroll-stopping visual impact for digital advertising (Meta, Google Ads)

NEGATIVE (AVOID):
- Changing garment design or fit
- Wrong fabric or color
- Oversharpening
- Plastic skin
- Harsh shadows
- DARK or UNDEREXPOSED images
- Moody or dramatic dark lighting
- Busy or distracting background
- Fashion elements competing with the product

CRITICAL: DO NOT ADD EXTRA PRODUCTS
- ONLY use the clothing items provided in the input images
- DO NOT add any additional accessories (watches, belts, hats, bags, sunglasses, jewelry, etc.)
- DO NOT add any extra clothing items not shown in the input
- If only a shirt is provided, model should wear ONLY that shirt (with appropriate basic pants)
- If only a jacket is provided, model should wear ONLY that jacket (with appropriate basic inner/pants)
- The model should wear ONLY what is explicitly provided in the input images
- Any accessory or clothing NOT in the input = FORBIDDEN

📷📷📷 OUTPUT FORMAT - SINGLE IMAGE ONLY 📷📷📷
- Generate exactly ONE single photograph
- DO NOT create a collage, grid, or multiple views
- DO NOT split the image into 2, 3, or 4 panels
- DO NOT show the model from multiple angles in one image
- ONE model, ONE pose, ONE single photograph
- ⛔ DO NOT add extra people, observers, or silhouettes - ONLY the main model
- The output must be a single cohesive image, not a composite
- Camera angle changes = camera moves around ONE model, NOT adding more people
- 🎨 BACKGROUND STAYS CONSTANT: The specified background color/style must be used regardless of camera angle. Do not invent new backgrounds or add random elements when camera angle changes.
${customPrompt ? `

✏️✏️✏️ USER'S CUSTOM INSTRUCTIONS - MUST FOLLOW ✏️✏️✏️
The user has provided specific instructions that MUST be followed:
>>> ${customPrompt} <<<
⚡ Apply these instructions to the output
⚡ These are direct orders from the user - prioritize them
` : ''}

${waistRiseFinalCheck}
`;
};

// Referans manken prompt eki - KISALTILMIŞ VE NET
const getReferenceModelPromptAddition = (): string => {
    return `

🚨 REFERANS MANKEN KURALLARI 🚨

IMAGE 1 = Referans kişi (manken)
IMAGE 2+ = Giydirılecek kıyafetler

GÖREV: IMAGE 1'deki KİŞİYİ, IMAGE 2'deki KIYAFETLERİ giymiş şekilde göster.

MANKEN KORUMA (IMAGE 1'den):
✓ AYNI yüz (gözler, burun, ağız, çene)
✓ AYNI vücut tipi ve oranlar
✓ AYNI cilt rengi
✓ AYNI saç (stil, renk, uzunluk)

YASAKLAR:
❌ Rastgele/farklı manken üretme
❌ Yüz özelliklerini değiştirme
❌ Vücut tipini değiştirme
❌ IMAGE 1'in arka planını kullanma

ÇIKTI = IMAGE 1'deki AYNI KİŞİ + IMAGE 2'deki KIYAFETLER
`;
};

// Çoklu kıyafet prompt eklentisi
const getMultipleClothingPromptAddition = (totalClothingCount: number): string => {
    // Her kıyafet için açık görsel haritası oluştur
    let imageMapping = '';
    for (let i = 0; i < totalClothingCount; i++) {
        const imgNum = i + 1;
        const label = i === 0 ? 'ANA KIYAFET' : `EK KIYAFET ${i}`;
        imageMapping += `   • IMAGE ${imgNum} = ${label}\n`;
    }

    return `

🚨🚨🚨 ÇOKLU KIYAFET MODU - ${totalClothingCount} PARÇA 🚨🚨🚨

GÖRSEL HARİTASI:
${imageMapping}
GÖREV: Tüm bu kıyafetleri BİRLİKTE tek bir manken üzerinde göster.

⚠️⚠️⚠️ KRİTİK - CEKET KURALI ⚠️⚠️⚠️
Eğer görseller arasında CEKET/BLAZER/TAKIM ELBİSE ÜST varsa:
- Manken CEKETİ GİYMİŞ olmalı!
- Ceket GÖMLEĞİN ÜSTÜNDE olmalı!
- Ceket AÇIK veya KAPALI olabilir ama GÖRÜNMELİ!
- Ceketi ATLAMA! Ceketi YOKSAYMA!

MUTLAK KURALLAR:
1. HER KIYAFET GÖRSELİ = AYRI BİR GİYSİ PARÇASI
2. TÜM PARÇALARI BİRLEŞTİR - Manken HEPSİNİ aynı anda giymiş olmalı
3. HER PARÇAYI BİREBİR KORU:
   - Renk: AYNI kalmalı
   - Desen: AYNI kalmalı
   - Kumaş dokusu: AYNI kalmalı
   - Detaylar (düğme, feruar, cep): AYNI kalmalı

KATMANLAMA (İçten dışa - SIRASI ÖNEMLİ):
1. İç giyim / Alt giyim (pantolon, etek) - EN ALTTA
2. Gömlek / Bluz / Tişört - GÖMLEĞİN ÜSTÜNDE
3. Kazak / Yelek / Hırka - ORTA KAT
4. 👔 CEKET / BLAZER / MONT / PALTO - EN ÜSTTE, MUTLAKA GİYİLİ!
5. Aksesuar (kravat, atkı, kemer) - GÖRÜNÜR

⛔⛔⛔ YASAKLAR ⛔⛔⛔
- ${totalClothingCount} parça verildi = ${totalClothingCount} parça GÖSTERİLMELİ
- ❌ CEKETİ ATLAMA - Ceket varsa GİYDİR!
- ❌ Hiçbir kıyafeti ATLAMA
- ❌ Hiçbir kıyafeti DEĞİŞTİRME
- ❌ Ekstra kıyafet EKLEME

ÇIKTI: Tek manken, üzerinde TÜM ${totalClothingCount} parça (CEKET DAHİL!), profesyonel moda fotoğrafı.
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
`;
};

// Çoklu kıyafet prompt eklentisi (offset destekli - referans model varsa)
const getMultipleClothingPromptAdditionWithOffset = (totalClothingCount: number, startIndex: number): string => {
    const endIndex = startIndex + totalClothingCount - 1;

    // Her kıyafet için açık görsel haritası oluştur
    let imageMapping = '';
    for (let i = 0; i < totalClothingCount; i++) {
        const imgNum = startIndex + i;
        const label = i === 0 ? 'ANA KIYAFET' : `EK KIYAFET ${i}`;
        imageMapping += `   • IMAGE ${imgNum} = ${label}\n`;
    }

    return `

🚨🚨🚨 ÇOKLU KIYAFET MODU - ${totalClothingCount} PARÇA 🚨🚨🚨

GÖRSEL HARİTASI:
${imageMapping}
GÖREV: Tüm bu kıyafetleri BİRLİKTE tek bir manken üzerinde göster.

⚠️⚠️⚠️ KRİTİK - CEKET KURALI ⚠️⚠️⚠️
Eğer görseller arasında CEKET/BLAZER/TAKIM ELBİSE ÜST varsa:
- Manken CEKETİ GİYMİŞ olmalı!
- Ceket GÖMLEĞİN ÜSTÜNDE olmalı!
- Ceket AÇIK veya KAPALI olabilir ama GÖRÜNMELİ!
- Ceketi ATLAMA! Ceketi YOKSAYMA!

MUTLAK KURALLAR:
1. HER KIYAFET GÖRSELİ = AYRI BİR GİYSİ PARÇASI
2. TÜM PARÇALARI BİRLEŞTİR - Manken HEPSİNİ aynı anda giymiş olmalı
3. HER PARÇAYI BİREBİR KORU:
   - Renk: AYNI kalmalı
   - Desen: AYNI kalmalı
   - Kumaş dokusu: AYNI kalmalı
   - Detaylar (düğme, feruar, cep): AYNI kalmalı

KATMANLAMA (İçten dışa - SIRASI ÖNEMLİ):
1. İç giyim / Alt giyim (pantolon, etek) - EN ALTTA
2. Gömlek / Bluz / Tişört - GÖMLEĞİN ÜSTÜNDE
3. Kazak / Yelek / Hırka - ORTA KAT
4. 👔 CEKET / BLAZER / MONT / PALTO - EN ÜSTTE, MUTLAKA GİYİLİ!
5. Aksesuar (kravat, atkı, kemer) - GÖRÜNÜR

⛔⛔⛔ YASAKLAR ⛔⛔⛔
- ${totalClothingCount} parça verildi = ${totalClothingCount} parça GÖSTERİLMELİ
- ❌ CEKETİ ATLAMA - Ceket varsa GİYDİR!
- ❌ Hiçbir kıyafeti ATLAMA
- ❌ Hiçbir kıyafeti DEĞİŞTİRME
- ❌ Ekstra kıyafet EKLEME

ÇIKTI: Tek manken, üzerinde TÜM ${totalClothingCount} parça (CEKET DAHİL!), profesyonel moda fotoğrafı.
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
`;
};

// Ana erkek moda görseli oluşturma fonksiyonu
export const generateMensFashionImage = async (
    clothingImage: File,
    settings: MensFashionSettings,
    onProgress?: (message: string) => void,
    referenceModel?: File | null,
    additionalClothes?: File[],
    logoImage?: File | null
): Promise<MensFashionGenerationResult> => {
    try {
        // Debug: Fonksiyona gelen settings'i logla
        console.log('📥 generateMensFashionImage çağrıldı - Settings:', {
            purpose: settings.purpose,
            poseStyle: settings.poseStyle,
            skinTone: settings.skinTone,
            background: settings.background,
            backgroundStyle: settings.backgroundStyle,
            numberOfImages: settings.numberOfImages
        });

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = "gemini-3-pro-image-preview";

        onProgress?.("👔 Erkek moda görseli hazırlanıyor...");

        // Process the main clothing image
        const { base64, mimeType } = await processImageForGemini(clothingImage, 2048, 0.95);

        // Process additional clothes if provided
        const additionalImagesData: Array<{ base64: string; mimeType: string }> = [];
        if (additionalClothes && additionalClothes.length > 0) {
            onProgress?.(`👕 ${additionalClothes.length} ek kıyafet işleniyor...`);
            for (const cloth of additionalClothes) {
                const data = await processImageForGemini(cloth, 2048, 0.95);
                additionalImagesData.push(data);
            }
        }

        // Process reference model if provided
        let refModelBase64: string | null = null;
        let refModelMimeType: string | null = null;
        if (referenceModel) {
            onProgress?.("👤 Referans manken işleniyor...");
            const refData = await processImageForGemini(referenceModel, 2048, 0.95);
            refModelBase64 = refData.base64;
            refModelMimeType = refData.mimeType;
        }

        // Process logo image if provided
        let logoBase64: string | null = null;
        let logoMimeType: string | null = null;
        if (logoImage) {
            onProgress?.("🏷️ Yaka logosu işleniyor...");
            const logoData = await processImageForGemini(logoImage, 1024, 0.95);
            logoBase64 = logoData.base64;
            logoMimeType = logoData.mimeType;
        }

        onProgress?.("📸 Çekim tipi belirleniyor...");

        // Select prompt based on purpose
        let prompt: string;
        let purposeLabel: string;

        // GÖRSEL STİL SEÇİCİ MODU - Özel prompt kullan, diğer ayarları bypass et
        if (settings.customPrompt?.includes('[GÖRSEL STİL SEÇİCİ MODU]')) {
            // Görsel Stil Seçici'den gelen prompt'u çıkar
            const stylePrompt = settings.customPrompt.replace('[GÖRSEL STİL SEÇİCİ MODU]', '').trim();

            prompt = `
=== GÖRSEL STİL SEÇİCİ - KULLANICI TARAFINDAN BELİRLENEN STİL ===

Bu bir VIRTUAL TRY-ON / CLOTHING TRANSFER görevidir.

GÖREV: Verilen kıyafet görselini profesyonel bir erkek model üzerinde göster.

🎯 KULLANICININ SEÇTİĞİ STİL AYARLARI (BU AYARLARA KESİNLİKLE UY):
${stylePrompt}

📋 TEMEL KURALLAR:
- Kıyafetin TÜM detaylarını koru (renk, desen, logo, dikiş, düğme, fermuarlar)
- Profesyonel erkek model kullan
- Gerçekçi kumaş kıvrımları ve gölgeler
- Yüksek kaliteli moda fotoğrafçılığı
- Tek model, tek poz, tek fotoğraf

⚠️ ÖNEMLİ:
- Yukarıdaki stil ayarlarına MUTLAKA uy
- Arka plan, ışık, atmosfer ve kadraj için SADECE kullanıcının seçimlerini kullan
- Bu ayarları görmezden gelme veya değiştirme

🖼️ ÇIKTI:
- Profesyonel moda fotoğrafı
- Kullanıcının seçtiği stilde
- Kıyafet detayları korunmuş
`;
            purposeLabel = 'Stil Seçici';

            console.log('🎯 Görsel Stil Seçici Modu Aktif - Özel prompt kullanılıyor');
        } else {
            // JSON-based compact prompt sistemi kullan
            prompt = buildCompactJSONPrompt(settings, 'male');
            purposeLabel = settings.purpose === 'ecommerce' ? 'E-Ticaret' : settings.purpose === 'catalog' ? 'Katalog' : 'Reklam';
            console.log('📋 Compact JSON prompt kullanılıyor');
        }

        // Add reference model instructions if provided - PREPEND to make it highest priority
        if (referenceModel && refModelBase64) {
            // Total images: 1 ref model + 1 main clothing + additional clothes
            const clothingCount = 1 + additionalImagesData.length; // main clothing + additional
            const totalImages = 1 + clothingCount; // ref model + all clothing

            // Her görsel için açık harita oluştur
            let imageList = '• IMAGE 1 = 👤 MANKEN (bu kişiyi kullan)\n';
            imageList += '• IMAGE 2 = 👔 ANA KIYAFET\n';
            for (let i = 0; i < additionalImagesData.length; i++) {
                imageList += `• IMAGE ${3 + i} = 👕 EK KIYAFET ${i + 1}\n`;
            }

            const refModelPrefix = `
🚨🚨🚨 REFERANS MANKEN + ${clothingCount > 1 ? 'ÇOKLU KIYAFET' : 'KIYAFET'} MODU 🚨🚨🚨

📋 GÖRSEL HARİTASI (${totalImages} görsel):
${imageList}
🎯 GÖREV: IMAGE 1'deki KİŞİYE, IMAGE 2${clothingCount > 1 ? `-${totalImages}` : ''}'deki KIYAFET${clothingCount > 1 ? 'LERİ' : 'İ'} giydir.

🔒 TUTARLILIK KURALLARI - MUTLAKA UYGULA 🔒

1. KİMLİK KORUMA (IMAGE 1'deki kişi):
   - AYNI kişiyi kullan - yüz hatları, göz rengi, ten rengi, saç rengi/stili
   - Vücut tipi, boy, yapı AYNI kalmalı
   - Farklı bir kişi/manken ÜRETME
   - Yüzü değiştirme, yaşlandırma/gençleştirme yapma

2. ÜRÜN KORUMA (IMAGE 2${clothingCount > 1 ? `-${totalImages}` : ''}):
   - Kıyafetlerin rengini, desenini, dokusunu değiştirme
   - Düğme, fermuar, logo gibi detayları koru
   - Ürün görselindeki HER ŞEYİ birebir aktar

3. SEÇİLEN AYARLARI UYGULA:
   - Sadece ayarlardaki arka planı kullan (IMAGE 1'in arka planını YOKSAY)
   - Sadece ayarlardaki pozu kullan

✅ YAPILACAKLAR:
1. IMAGE 1'deki kişinin YÜZÜNÜ kullan (başka yüz üretme)
2. IMAGE 1'deki kişinin VÜCUDUNU kullan (başka vücut üretme)
3. IMAGE 1'in ARKA PLANINI YOKSAY - ayarlardaki arka planı kullan
4. IMAGE 2${clothingCount > 1 ? `-${totalImages}` : ''}'deki kıyafet${clothingCount > 1 ? 'lerin HEPSİNİ' : 'i'} BİREBİR koru
${clothingCount > 1 ? `5. TÜM ${clothingCount} KIYAFET PARÇASINI BİRLİKTE GİYDİR
6. CEKET/BLAZER varsa MUTLAKA GİYDİR - gömleğin üstünde!\n` : ''}
❌ YASAKLAR:
- Rastgele/farklı manken üretme
- Kıyafetlerin rengini/desenini değiştirme
- Verilen kıyafetleri atlama veya değiştirme
${clothingCount > 1 ? '- Kıyafetlerden birini unutma (özellikle CEKETİ!)\n' : ''}- IMAGE 1'in arka planını kullanma

---

`;
            prompt = refModelPrefix + prompt;
            prompt += getReferenceModelPromptAddition();
        }

        // Add multiple clothing instructions if provided
        if (additionalImagesData.length > 0) {
            const clothingStartIndex = referenceModel ? 2 : 1;
            prompt += getMultipleClothingPromptAdditionWithOffset(additionalImagesData.length + 1, clothingStartIndex);
        }

        // ⚠️ PRODUCT FIDELITY - En önemli kural: Ürün orijinalliğini koru
        prompt += PRODUCT_FIDELITY_PROMPT;

        // 🏷️ Logo ekleme - Yaka logosu
        if (logoImage && logoBase64) {
            onProgress?.("🏷️ Yaka logosu ekleniyor...");
            prompt += `

🏷️🏷️🏷️ COLLAR LOGO / YAKA LOGOSU - CRITICAL 🏷️🏷️🏷️

A LOGO IMAGE is provided showing a close-up of a collar/neck area with "KA" branding.

YOUR TASK - ADD THIS LOGO TO THE GARMENT:
1. Look at the LOGO IMAGE - it shows the exact logo design and placement
2. Add this EXACT logo to the collar/neck area of the main garment
3. The logo should be placed on the inside of the collar or neck label area
4. Make sure the logo is clearly visible but natural looking
5. The logo text/design must match EXACTLY what is shown in the logo image

LOGO PLACEMENT RULES:
- Place on the collar's inside back area (where brand labels typically go)
- If it's a crew neck / round neck: place on the back neck ribbing area
- If it's a polo / button collar: place on the inside collar
- If it's a turtleneck: place on the inside of the neck roll
- The logo should be small but legible
- Match the logo colors and style exactly as shown

DO NOT:
- Place the logo too prominently on the front
- Change the logo design or colors
- Make the logo too large or distracting
- Forget to include the logo

🏷️🏷️🏷️ END LOGO INSTRUCTIONS 🏷️🏷️🏷️
`;
        }

        // 🐾 Hayvan ekleme
        if (settings.animal && settings.animal.enabled) {
            onProgress?.("🐾 Hayvan arkadaş ekleniyor...");
            prompt += buildAnimalPromptAddition(settings.animal);
        }

        onProgress?.(`🎬 ${purposeLabel} görseli oluşturuluyor...`);

        console.log(`Generating Men's Fashion image: ${purposeLabel}${referenceModel ? ' (with reference model)' : ''}${additionalImagesData.length > 0 ? ` (with ${additionalImagesData.length} additional clothes)` : ''}${settings.animal?.enabled ? ' (with animal companion)' : ''}${logoImage ? ' (with collar logo)' : ''}`);

        // Debug: Studio Minimal ayarları
        if (settings.backgroundStyle === 'studio-minimal') {
            console.log(`🎨 Studio Minimal Settings: color=${settings.studioMinimalColor}, vignette=${settings.studioMinimalVignette}`);
        }

        // Build parts array
        const parts: any[] = [];

        // CRITICAL: If reference model is provided, add it FIRST so AI prioritizes it
        if (refModelBase64 && refModelMimeType) {
            parts.push({ inlineData: { data: refModelBase64, mimeType: refModelMimeType } });
        }

        // Add main clothing image
        parts.push({ inlineData: { data: base64, mimeType } });

        // Add additional clothing images
        for (const addImg of additionalImagesData) {
            parts.push({ inlineData: { data: addImg.base64, mimeType: addImg.mimeType } });
        }

        // Add logo image if provided
        if (logoBase64 && logoMimeType) {
            parts.push({ inlineData: { data: logoBase64, mimeType: logoMimeType } });
        }

        // Add prompt text
        parts.push({ text: prompt });

        // Debug: Log image order
        console.log('🖼️ IMAGE ORDER IN PARTS ARRAY:');
        let imgIndex = 1;
        for (const part of parts) {
            if (part.inlineData) {
                if (refModelBase64 && imgIndex === 1) {
                    console.log(`  IMAGE ${imgIndex}: REFERENCE MODEL (manken)`);
                } else {
                    console.log(`  IMAGE ${imgIndex}: CLOTHING/OTHER`);
                }
                imgIndex++;
            }
        }

        // Calculate aspect ratio for prompt instruction
        const getAspectRatioInstruction = (ratio: string): string => {
            switch (ratio) {
                case '1:1': return 'SQUARE format (1:1 aspect ratio) - equal width and height';
                case '9:16': return 'VERTICAL/PORTRAIT format (9:16 aspect ratio) - tall and narrow, like a phone screen in portrait mode';
                case '16:9': return 'HORIZONTAL/LANDSCAPE format (16:9 aspect ratio) - wide and short, like a TV screen';
                case '4:5': return 'PORTRAIT format (4:5 aspect ratio) - slightly taller than wide, Instagram portrait style';
                case '3:4': return 'PORTRAIT format (3:4 aspect ratio) - classic portrait, taller than wide, ideal for full-body fashion shots';
                case '2:3': return 'TALL PORTRAIT format (2:3 aspect ratio) - significantly taller than wide, perfect for full-length model shots';
                default: return 'PORTRAIT format (3:4 aspect ratio) - classic portrait, taller than wide';
            }
        };

        // Add aspect ratio instruction to prompt
        const aspectInstruction = `

📐 FORMAT: ${getAspectRatioInstruction(settings.aspectRatio || '3:4')}
`;

        // Referans manken varsa, EN SONA çok güçlü hatırlatma ekle
        const referenceModelReminder = refModelBase64 ? `

🚨🚨🚨 SON HATIRLATMA - REFERANS MANKEN 🚨🚨🚨
IMAGE 1'DEKİ KİŞİYİ KULLAN!
- AYNI yüz (gözler, burun, ağız, çene yapısı)
- AYNI vücut
- AYNI cilt rengi
- AYNI saç

⛔ BAŞKA MANKEN ÜRETME!
⛔ BENZERİNİ ÜRETME!
⛔ IMAGE 1'İ YOKSAYMA!

ÇIKTI = IMAGE 1'deki KİŞİ + IMAGE 2'deki KIYAFET
Farklı kişi = BAŞARISIZ
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
` : '';

        // Çoklu kıyafet varsa, EN SONA hatırlatma ekle
        const totalClothes = 1 + additionalImagesData.length;
        const multipleClothingReminder = additionalImagesData.length > 0 ? `

🚨🚨🚨 SON HATIRLATMA - ÇOKLU KIYAFET 🚨🚨🚨
${totalClothes} ADET KIYAFET VERİLDİ = ${totalClothes} ADET KIYAFET GÖSTERİLMELİ!

${refModelBase64 ? `• IMAGE 2-${1 + totalClothes} = KIYAFETLER` : `• IMAGE 1-${totalClothes} = KIYAFETLER`}

👔👔👔 CEKET KONTROLÜ 👔👔👔
Görsellerde CEKET/BLAZER varsa:
- Manken CEKETİ GİYMİŞ OLMALI!
- Ceket gömleğin ÜSTÜNDE!
- Ceketi ASLA ATLAMA!

✅ TÜM KIYAFETLER TEK MANKEN ÜZERİNDE
✅ HER PARÇANIN RENGİ/DESENİ KORUNMUŞ
✅ HİÇBİR PARÇA ATLANMAMIŞ
✅ CEKET VARSA GİYİLİ!

⛔ CEKETİ ATLAMA!
⛔ KIYAFET ATLAMA!
⛔ KIYAFET DEĞİŞTİRME!
⛔ EKSTRA KIYAFET EKLEME!

ÇIKTI = ${totalClothes} parça kıyafet giymiş tek manken (CEKET DAHİL!)
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
` : '';

        parts[parts.length - 1] = { text: prompt + aspectInstruction + referenceModelReminder + multipleClothingReminder };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
                responseModalities: ["image", "text"],
                safetySettings: SAFETY_SETTINGS as any,
            }
        });

        const imageData = extractImageFromResponse(response);

        if (imageData) {
            onProgress?.("✅ Erkek moda görseli başarıyla oluşturuldu!");
            console.log("✅ Men's Fashion image generated successfully");

            return {
                imageData,
                aiModel: modelName,
                purpose: settings.purpose
            };
        }

        throw new Error("Erkek moda görseli oluşturulamadı - görsel üretilemedi.");

    } catch (error: any) {
        console.error("Men's Fashion Generation Error:", error);
        if (error.status === 429) {
            throw new Error("API kota limiti aşıldı (429). Lütfen daha sonra tekrar deneyin.");
        }
        if (error.status === 503 || error.message?.includes('503') || error.message?.includes('overloaded')) {
            throw new Error("Model şu anda meşgul (503). Lütfen birkaç dakika bekleyip tekrar deneyin.");
        }
        throw error;
    }
};

// Çoklu erkek moda görseli oluşturma (batch)
export const generateMultipleMensFashionImages = async (
    clothingImage: File,
    settings: MensFashionSettings,
    onProgress?: (message: string, current: number, total: number) => void,
    referenceModel?: File | null,
    additionalClothes?: File[],
    logoImage?: File | null
): Promise<MensFashionGenerationResult[]> => {
    const results: MensFashionGenerationResult[] = [];
    const total = settings.numberOfImages;

    for (let i = 0; i < total; i++) {
        onProgress?.(`Görsel ${i + 1}/${total} oluşturuluyor...`, i + 1, total);

        try {
            const result = await generateMensFashionImage(
                clothingImage,
                settings,
                (msg) => onProgress?.(msg, i + 1, total),
                referenceModel,
                additionalClothes,
                logoImage
            );
            results.push(result);

            // Rate limiting - wait between generations
            if (i < total - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`Görsel ${i + 1} oluşturulurken hata:`, error);
            // Continue with remaining images
        }
    }

    if (results.length === 0) {
        throw new Error("Hiçbir erkek moda görseli oluşturulamadı.");
    }

    return results;
};

// Erkek moda prompt önizleme fonksiyonu - UI'da göstermek için
export const buildMensFashionPromptPreview = (
    settings: MensFashionSettings,
    hasReferenceModel: boolean = false,
    additionalClothesCount: number = 0
): string => {
    // JSON-based compact prompt sistemi kullan
    let prompt = buildCompactJSONPrompt(settings, 'male');

    // Add reference model note if provided
    if (hasReferenceModel) {
        const clothingCount = 1 + additionalClothesCount;
        prompt = `[REFERANS MODEL MODU - ${clothingCount} kıyafet]\n\n` + prompt;
    }

    // Add multiple clothing note if provided
    if (additionalClothesCount > 0) {
        prompt += `\n\n[+${additionalClothesCount} ek kıyafet eklendi]`;
    }

    // 🐾 Hayvan ekleme notu
    if (settings.animal && settings.animal.enabled) {
        prompt += `\n\n[HAYVAN: ${settings.animal.type} - ${settings.animal.position}]`;
    }

    return prompt;
};

// ==========================================
// KADIN MODA MODU - WOMEN'S FASHION MODE
// ==========================================

interface WomensFashionGenerationResult {
    imageData: string;
    aiModel: string;
    purpose: string;
}

// Ten rengi açıklamaları (kadın model için)
const WOMENS_SKIN_TONE_DESCRIPTIONS: { [key: string]: string } = {
    'fair': 'very fair porcelain skin with light pink undertones, delicate complexion',
    'light': 'light skin with soft pink undertones, natural glow',
    'medium-light': 'light olive or beige skin tone, warm undertones',
    'medium': 'warm honey or wheat-colored skin, Mediterranean beauty',
    'medium-dark': 'bronze or caramel skin tone, warm golden undertones',
    'dark': 'rich brown or coffee-colored skin, radiant complexion',
    'deep': 'deep espresso or dark chocolate skin tone, beautiful contrast'
};

// Poz açıklamaları (kadın model için)
const WOMENS_POSE_DESCRIPTIONS: { [key: string]: string } = {
    'straight-standing': 'standing perfectly straight with feet together or slightly apart, BOTH ARMS hanging straight down at sides - NO hands in pockets, NO crossed arms, NO hands on hips - just simple straight standing with arms naturally down, looking directly at camera, classic catalog pose with excellent posture and grace',
    'neutral': 'standing straight with relaxed shoulders, arms naturally at sides, elegant and poised',
    'elegant': 'graceful pose with slight S-curve, one hand gently touching hip, refined posture',
    'walking': 'natural walking stride, movement captured mid-step, flowing and dynamic',
    'hand-on-hip': 'confident stance with one or both hands on hips, strong and empowered',
    'relaxed': 'casual, comfortable pose with natural body language, approachable feel',
    'dynamic': 'slight movement or turn, hair or fabric in motion, energetic and lively'
};

// E-TİCARET prompt'u (Kadın)
const getWomensFashionEcommercePrompt = (skinTone: string, poseStyle: string, background: string, backgroundStyle: string): string => {
    const skinDescription = skinTone && WOMENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        ? WOMENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        : 'natural, healthy skin tone with a subtle glow';

    const poseDescription = poseStyle && WOMENS_POSE_DESCRIPTIONS[poseStyle]
        ? WOMENS_POSE_DESCRIPTIONS[poseStyle]
        : WOMENS_POSE_DESCRIPTIONS['neutral'];

    const bgStyleInfo = WOMENS_FASHION_BACKGROUND_STYLES.find(s => s.id === backgroundStyle);
    const supportsColor = bgStyleInfo?.supportsColor ?? true;

    const bgInfo = WOMENS_FASHION_BACKGROUNDS.find(b => b.id === background);
    const bgName = bgInfo?.name || 'Beyaz';
    const bgHex = bgInfo?.hex || '#FFFFFF';
    const bgDescription = bgInfo?.description || 'Temiz, sade stüdyo';

    const bgStyleDescription = BACKGROUND_STYLE_DESCRIPTIONS[backgroundStyle] || BACKGROUND_STYLE_DESCRIPTIONS['solid'];

    // Arka plan değiştirme vurgusu - GÜÇLENDİRİLMİŞ
    const backgroundChangeEmphasis = `
🚨🚨🚨 ABSOLUTE BACKGROUND RULE - HIGHEST PRIORITY 🚨🚨🚨
THE ONLY BACKGROUND YOU MUST USE: ${bgName} (${bgHex})

⛔ COMPLETELY IGNORE THE INPUT IMAGE'S BACKGROUND:
- The input image may show ANY background - IGNORE IT COMPLETELY
- That background is 100% IRRELEVANT - pretend it doesn't exist
- DO NOT analyze, copy, or be influenced by the input image's background
- Even if input shows a perfect studio, IGNORE IT and use ${bgHex}
- Even if input shows the same color, still REGENERATE it fresh as ${bgHex}

✅ WHAT YOU MUST DO:
- Generate a COMPLETELY NEW background: ${bgName} (${bgHex})
- Background color MUST be exactly ${bgHex} - no variations allowed
- Lighting on background: FLAT and EVEN - same brightness everywhere
- No shadows, hotspots, or color shifts on the background

🎯 VERIFICATION: Background color when measured = ${bgHex}. Any deviation = WRONG.`;

    // Beyaz için özel vurgu
    const whiteEmphasis = background === 'white'
        ? `

MANDATORY: PURE WHITE BACKGROUND
- Exact color: #FFFFFF - RGB(255, 255, 255) - PURE WHITE
- NO cream, NO ivory, NO beige, NO off-white, NO warm tones
- NO yellow tint, NO gray tint - ZERO color cast
- Like Amazon/Shopify product photo - blindingly white
- If ANY color in background = WRONG OUTPUT`
        : '';

    // Arka plan tutarlılığı kuralı
    const backgroundConsistencyRule = `
🎯🎯🎯 BACKGROUND COLOR CONSISTENCY - ABSOLUTE REQUIREMENT 🎯🎯🎯
The background MUST be EXACTLY as specified with PERFECT CONSISTENCY:
- Use the EXACT color: ${bgName} (${bgHex}) - NO variations allowed
- Background color must be UNIFORM across the entire image - same shade everywhere
- Lighting on background must be EVEN and FLAT - no hotspots, no shadows, no gradients
- This EXACT same background must be reproducible across ALL generations
- NO color temperature shifts - if ${bgHex} is specified, output MUST be ${bgHex}
- NO lighting-induced color changes - background stays EXACTLY ${bgHex}
- Think: A colorimeter measuring the background should read ${bgHex} everywhere`;

    const backgroundSection = supportsColor
        ? `${backgroundChangeEmphasis}\n- Background Color: ${bgName} (${bgHex}) - ${bgDescription}\n- Background Style: ${bgStyleDescription}${whiteEmphasis}\n${backgroundConsistencyRule}`
        : `${backgroundChangeEmphasis}\n- Background Style: ${bgStyleDescription}`;

    return `
WOMEN'S FASHION E-COMMERCE PHOTOGRAPHY

ABSOLUTE #1 RULE - NECKLINE PRESERVATION:
BEFORE GENERATING, CAREFULLY ANALYZE THE INPUT IMAGE:
- What is the EXACT neckline type? (V-neck, crew neck, round neck, sweetheart, etc.)
- Is it a TURTLENECK? Only if the input clearly shows a turtleneck.
- If the input shows a V-NECK → The output MUST show V-NECK
- If the input shows a CREW NECK → The output MUST show CREW NECK
- If the input shows a ROUND NECK → The output MUST show ROUND NECK
- If the input shows a SWEETHEART NECK → The output MUST show SWEETHEART NECK
- DO NOT ASSUME TURTLENECK unless the input image CLEARLY shows one
- TURTLENECK = neck is FULLY COVERED up to chin
- V-NECK = V-shaped opening at chest
- CREW NECK = Round opening at base of neck
- CHANGING THE NECKLINE = WRONG PRODUCT = FAILURE

CRITICAL PRODUCT INTEGRITY:
Use the uploaded product image as the EXACT visual reference for the garment.
The clothing design, fabric, color, texture, stitching, fit and proportions must remain IDENTICAL to the reference image.
Do not change the product in any way. The model is only a carrier; the garment is the hero.
⚠️ ESPECIALLY THE NECKLINE - COPY IT EXACTLY FROM INPUT IMAGE ⚠️

🧍 CRITICAL - HUMAN BODY PROPORTIONS 🧍
The model must have CORRECT, NATURAL human anatomy:
- Head size: approximately 1/7 to 1/8 of total body height
- Do NOT create oversized heads or shrunken bodies
- Do NOT compress or squash the torso
- Arms and legs must have natural, realistic lengths
- The body must NOT look distorted, stretched, or compressed
- If input shows a model with certain proportions, OUTPUT must match those proportions
- Think: "Would this person look normal standing next to real people?"

ZERO IMAGINATION / ZERO HALLUCINATION POLICY:
ABSOLUTELY NO PRODUCT HALLUCINATION - CRITICAL
DO NOT USE YOUR IMAGINATION. DO NOT ADD ANYTHING NOT IN THE INPUT.

STRICT RULES:
- ONLY use what is VISIBLE in the input image(s)
- ONLY apply the settings the user has selected
- The INPUT IMAGES define what products exist - NOTHING ELSE
- If user gives 1 jacket → output shows ONLY that 1 jacket
- If user gives pants + shirt → output shows ONLY those 2 items
- DO NOT add extra clothing items (scarves, hats, belts, ties, pocket squares, etc.)
- DO NOT add accessories (watches, jewelry, sunglasses, bags, etc.)
- DO NOT add props or objects not in the input
- DO NOT change or "improve" the garment design
- DO NOT add patterns, textures, or details not in the input
- DO NOT add background elements not specified
- DO NOT add other people or animals (unless user selected)
- DO NOT be creative with the product - COPY IT EXACTLY
- DO NOT invent/hallucinate any product that wasn't provided
- If something is NOT in the input and NOT in user settings = DO NOT ADD IT
- Your job is to REPLICATE EXACTLY, not to CREATE or IMAGINE

🏷️ LOGO/BROOCH/EMBLEM RULE - CRITICAL:
- If the input has a collar pin, brooch, logo, or emblem on the lapel/collar:
  - If you can render it CLEARLY and ACCURATELY → show it
  - If you CANNOT render it clearly (blurry, distorted, unreadable) → DO NOT SHOW IT AT ALL
  - Better NO logo than a BAD/UNCLEAR logo
  - Do NOT invent or guess what the logo looks like
  - Do NOT show a generic/placeholder logo
---

CATEGORY: Women's fashion (dress, blouse, skirt, pants, jacket – based on the uploaded product).

MODEL SPECIFICATIONS:
- SKIN TONE: ${skinDescription}
- Age appearance: 22-32 years old
- Physique: Fit, feminine, well-proportioned female body
- Facial expression: Neutral, approachable, confident
- Grooming: Clean, natural makeup, styled hair
- POSE: ${poseDescription}

CAMERA ANGLE & LENS:
- Camera angle: Eye-level, straight-on or very subtle 3/4 angle
- Lens: Natural perspective, 50mm lens look, no distortion
- Distance: Full body shot to show complete garment
- Framing: Centered with intentional negative space

LIGHTING SETUP:
- BRIGHT, HIGH-KEY studio lighting - well-lit environment
- Soft, evenly diffused lighting with MINIMAL to NO shadows
- Beauty lighting to enhance skin and fabric - keep BRIGHT
- Fill lights to ensure NO underexposed areas
- Result: Maximum clarity, WELL-EXPOSED, professional e-commerce look

BACKGROUND:
${backgroundSection}
- No distracting elements that compete with the product

GENERAL COMPOSITION RULES:
- No wide-angle distortion
- Garment must be fully readable and correctly proportioned
- Clean framing with intentional negative space
- Natural body anatomy and realistic posture
- Foreground, subject, and background must be visually separated with depth

COLOR & GRADING:
- BRIGHT, WELL-EXPOSED image - NOT dark, NOT underexposed
- Neutral to warm editorial color palette
- NORMAL saturation, BALANCED contrast
- Proper exposure - face and clothing clearly visible
- Natural skin tones, realistic fabric rendering
- Professional HIGH-END E-COMMERCE photography look

QUALITY REQUIREMENTS:
- Photorealistic women's fashion photography
- Clean, premium, brand-consistent output
- WELL-LIT and BRIGHT - NOT dark or moody
- No artifacts, no warped clothing, no incorrect textures
- No logos or text unless present in the reference image
- Goal: Maximum clarity of fit, fabric and construction

NEGATIVE (AVOID):
- Changing garment design or fit
- Wrong fabric or color
- Oversharpening
- Plastic skin or unnatural appearance
- Harsh shadows
- DARK or UNDEREXPOSED images
- Moody or dramatic lighting
- Busy or distracting background
- Fashion elements competing with the product
`;
};

// KATALOG prompt'u (Kadın)
const getWomensFashionCatalogPrompt = (skinTone: string, poseStyle: string, background: string, backgroundStyle: string): string => {
    const skinDescription = skinTone && WOMENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        ? WOMENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        : 'natural, healthy skin tone with a subtle glow';

    const poseDescription = poseStyle && WOMENS_POSE_DESCRIPTIONS[poseStyle]
        ? WOMENS_POSE_DESCRIPTIONS[poseStyle]
        : WOMENS_POSE_DESCRIPTIONS['elegant'];

    const bgStyleInfo = WOMENS_FASHION_BACKGROUND_STYLES.find(s => s.id === backgroundStyle);
    const supportsColor = bgStyleInfo?.supportsColor ?? true;

    const bgInfo = WOMENS_FASHION_BACKGROUNDS.find(b => b.id === background);
    const bgName = bgInfo?.name || 'Krem';
    const bgHex = bgInfo?.hex || '#F5F0E6';
    const bgDescription = bgInfo?.description || 'Yumuşak, lüks';

    const bgStyleDescription = BACKGROUND_STYLE_DESCRIPTIONS[backgroundStyle] || BACKGROUND_STYLE_DESCRIPTIONS['solid'];

    // Arka plan değiştirme vurgusu - GÜÇLENDİRİLMİŞ
    const backgroundChangeEmphasis = `
🚨🚨🚨 ABSOLUTE BACKGROUND RULE - HIGHEST PRIORITY 🚨🚨🚨
THE ONLY BACKGROUND YOU MUST USE: ${bgName} (${bgHex})

⛔ COMPLETELY IGNORE THE INPUT IMAGE'S BACKGROUND:
- The input image may show ANY background - IGNORE IT COMPLETELY
- That background is 100% IRRELEVANT - pretend it doesn't exist
- DO NOT analyze, copy, or be influenced by the input image's background
- Even if input shows a perfect studio, IGNORE IT and use ${bgHex}
- Even if input shows the same color, still REGENERATE it fresh as ${bgHex}

✅ WHAT YOU MUST DO:
- Generate a COMPLETELY NEW background: ${bgName} (${bgHex})
- Background color MUST be exactly ${bgHex} - no variations allowed
- Lighting on background: FLAT and EVEN - same brightness everywhere
- No shadows, hotspots, or color shifts on the background

🎯 VERIFICATION: Background color when measured = ${bgHex}. Any deviation = WRONG.`;

    // Beyaz için özel vurgu
    const whiteEmphasis = background === 'white'
        ? `

MANDATORY: PURE WHITE BACKGROUND
- Exact color: #FFFFFF - RGB(255, 255, 255) - PURE WHITE
- NO cream, NO ivory, NO beige, NO off-white, NO warm tones
- NO yellow tint, NO gray tint - ZERO color cast
- Like Amazon/Shopify product photo - blindingly white
- If ANY color in background = WRONG OUTPUT`
        : '';

    const backgroundSection = supportsColor
        ? `${backgroundChangeEmphasis}\n- Background Color: ${bgName} (${bgHex}) - ${bgDescription}\n- Background Style: ${bgStyleDescription}${whiteEmphasis}`
        : `${backgroundChangeEmphasis}\n- Background Style: ${bgStyleDescription}`;

    return `
WOMEN'S FASHION CATALOG PHOTOGRAPHY

ABSOLUTE #1 RULE - NECKLINE PRESERVATION:
BEFORE GENERATING, CAREFULLY ANALYZE THE INPUT IMAGE:
- What is the EXACT neckline type? (V-neck, crew neck, round neck, sweetheart, etc.)
- Is it a TURTLENECK? Only if the input clearly shows a turtleneck.
- If the input shows a V-NECK → The output MUST show V-NECK
- If the input shows a CREW NECK → The output MUST show CREW NECK
- If the input shows a ROUND NECK → The output MUST show ROUND NECK
- If the input shows a SWEETHEART NECK → The output MUST show SWEETHEART NECK
- DO NOT ASSUME TURTLENECK unless the input image CLEARLY shows one
- TURTLENECK = neck is FULLY COVERED up to chin
- V-NECK = V-shaped opening at chest
- CREW NECK = Round opening at base of neck
- CHANGING THE NECKLINE = WRONG PRODUCT = FAILURE

CRITICAL PRODUCT INTEGRITY:
Use the uploaded product image as the EXACT visual reference for the garment.
The clothing design, fabric, color, texture, stitching, fit and proportions must remain IDENTICAL to the reference image.
Do not change the product in any way. The model is only a carrier; the garment is the hero.
⚠️ ESPECIALLY THE NECKLINE - COPY IT EXACTLY FROM INPUT IMAGE ⚠️

🧍 CRITICAL - HUMAN BODY PROPORTIONS 🧍
The model must have CORRECT, NATURAL human anatomy:
- Head size: approximately 1/7 to 1/8 of total body height
- Do NOT create oversized heads or shrunken bodies
- Do NOT compress or squash the torso
- Arms and legs must have natural, realistic lengths
- The body must NOT look distorted, stretched, or compressed
- If input shows a model with certain proportions, OUTPUT must match those proportions
- Think: "Would this person look normal standing next to real people?"

ZERO IMAGINATION / ZERO HALLUCINATION POLICY:
ABSOLUTELY NO PRODUCT HALLUCINATION - CRITICAL
DO NOT USE YOUR IMAGINATION. DO NOT ADD ANYTHING NOT IN THE INPUT.

STRICT RULES:
- ONLY use what is VISIBLE in the input image(s)
- ONLY apply the settings the user has selected
- The INPUT IMAGES define what products exist - NOTHING ELSE
- If user gives 1 jacket → output shows ONLY that 1 jacket
- If user gives pants + shirt → output shows ONLY those 2 items
- DO NOT add extra clothing items (scarves, hats, belts, ties, pocket squares, etc.)
- DO NOT add accessories (watches, jewelry, sunglasses, bags, etc.)
- DO NOT add props or objects not in the input
- DO NOT change or "improve" the garment design
- DO NOT add patterns, textures, or details not in the input
- DO NOT add background elements not specified
- DO NOT add other people or animals (unless user selected)
- DO NOT be creative with the product - COPY IT EXACTLY
- DO NOT invent/hallucinate any product that wasn't provided
- If something is NOT in the input and NOT in user settings = DO NOT ADD IT
- Your job is to REPLICATE EXACTLY, not to CREATE or IMAGINE

🏷️ LOGO/BROOCH/EMBLEM RULE - CRITICAL:
- If the input has a collar pin, brooch, logo, or emblem on the lapel/collar:
  - If you can render it CLEARLY and ACCURATELY → show it
  - If you CANNOT render it clearly (blurry, distorted, unreadable) → DO NOT SHOW IT AT ALL
  - Better NO logo than a BAD/UNCLEAR logo
  - Do NOT invent or guess what the logo looks like
  - Do NOT show a generic/placeholder logo
---

CATEGORY: Women's fashion (dress, blouse, skirt, pants, jacket – based on the uploaded product).

MODEL SPECIFICATIONS:
- SKIN TONE: ${skinDescription}
- Age appearance: 25-35 years old
- Physique: Elegant, feminine, well-proportioned female body
- Facial expression: Sophisticated, refined, subtle confidence
- Grooming: Impeccable, editorial-ready makeup and hair
- POSE: ${poseDescription}

CAMERA ANGLE & LENS:
- Camera angle: Eye-level with a controlled 3/4 angle to show body form
- Lens: 50-85mm lens look with gentle depth
- Distance: Full body or 3/4 body shot with room for layout elements
- Framing: Asymmetric composition allowing space for text overlays

LIGHTING SETUP:
- Soft directional studio lighting creating subtle shadows that reveal fabric drape and structure
- Slightly warmer color temperature for premium feel
- Beauty lighting for flawless skin appearance
- Result: Three-dimensional look with soft, controlled shadows

BACKGROUND:
${backgroundSection}
- Elegant negative space for editorial layout
- Studio or minimalist interior setting feel

MOOD & STYLE:
- Editorial, premium, feminine elegance
- Goal: Brand consistency with refined fashion presentation

GENERAL COMPOSITION RULES:
- No wide-angle distortion
- Garment must be fully readable and correctly proportioned
- Clean framing with intentional negative space
- Natural body anatomy and realistic posture
- Foreground, subject, and background must be visually separated with depth

COLOR & GRADING:
- Soft, warm editorial color palette
- Flattering skin tones, luxurious fabric rendering
- No HDR look, no harsh highlights
- Natural and refined appearance

QUALITY REQUIREMENTS:
- Photorealistic women's fashion photography
- Clean, premium, brand-consistent output
- No artifacts, no warped clothing, no incorrect textures
- No logos or text unless present in the reference image

NEGATIVE (AVOID):
- Changing garment design or fit
- Wrong fabric or color
- Oversharpening
- Plastic skin or unnatural appearance
- Harsh shadows
- Busy or distracting background
- Fashion elements competing with the product
`;
};

// REKLAM prompt'u (Kadın)
const getWomensFashionAdvertisingPrompt = (skinTone: string, poseStyle: string, background: string, backgroundStyle: string): string => {
    const skinDescription = skinTone && WOMENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        ? WOMENS_SKIN_TONE_DESCRIPTIONS[skinTone]
        : 'natural, healthy skin tone with a subtle glow';

    const poseDescription = poseStyle && WOMENS_POSE_DESCRIPTIONS[poseStyle]
        ? WOMENS_POSE_DESCRIPTIONS[poseStyle]
        : WOMENS_POSE_DESCRIPTIONS['dynamic'];

    const bgStyleInfo = WOMENS_FASHION_BACKGROUND_STYLES.find(s => s.id === backgroundStyle);
    const supportsColor = bgStyleInfo?.supportsColor ?? true;

    const bgInfo = WOMENS_FASHION_BACKGROUNDS.find(b => b.id === background);
    const bgName = bgInfo?.name || 'Gül Kurusu';
    const bgHex = bgInfo?.hex || '#C48B9F';
    const bgDescription = bgInfo?.description || 'Sofistike, şık';

    const bgStyleDescription = BACKGROUND_STYLE_DESCRIPTIONS[backgroundStyle] || BACKGROUND_STYLE_DESCRIPTIONS['solid'];

    // Arka plan değiştirme vurgusu - GÜÇLENDİRİLMİŞ
    const backgroundChangeEmphasis = `
🚨🚨🚨 ABSOLUTE BACKGROUND RULE - HIGHEST PRIORITY 🚨🚨🚨
THE ONLY BACKGROUND YOU MUST USE: ${bgName} (${bgHex})

⛔ COMPLETELY IGNORE THE INPUT IMAGE'S BACKGROUND:
- The input image may show ANY background - IGNORE IT COMPLETELY
- That background is 100% IRRELEVANT - pretend it doesn't exist
- DO NOT analyze, copy, or be influenced by the input image's background
- Even if input shows a perfect studio, IGNORE IT and use ${bgHex}
- Even if input shows the same color, still REGENERATE it fresh as ${bgHex}

✅ WHAT YOU MUST DO:
- Generate a COMPLETELY NEW background: ${bgName} (${bgHex})
- Background color MUST be exactly ${bgHex} - no variations allowed
- Lighting on background: FLAT and EVEN - same brightness everywhere
- No shadows, hotspots, or color shifts on the background

🎯 VERIFICATION: Background color when measured = ${bgHex}. Any deviation = WRONG.`;

    // Beyaz için özel vurgu
    const whiteEmphasis = background === 'white'
        ? `

MANDATORY: PURE WHITE BACKGROUND
- Exact color: #FFFFFF - RGB(255, 255, 255) - PURE WHITE
- NO cream, NO ivory, NO beige, NO off-white, NO warm tones
- NO yellow tint, NO gray tint - ZERO color cast
- Like Amazon/Shopify product photo - blindingly white
- If ANY color in background = WRONG OUTPUT`
        : '';

    const backgroundSection = supportsColor
        ? `${backgroundChangeEmphasis}\n- Background Color: ${bgName} (${bgHex}) - ${bgDescription}\n- Background Style: ${bgStyleDescription}${whiteEmphasis}`
        : `${backgroundChangeEmphasis}\n- Background Style: ${bgStyleDescription}`;

    return `
WOMEN'S FASHION ADVERTISING PHOTOGRAPHY

ABSOLUTE #1 RULE - NECKLINE PRESERVATION:
BEFORE GENERATING, CAREFULLY ANALYZE THE INPUT IMAGE:
- What is the EXACT neckline type? (V-neck, crew neck, round neck, sweetheart, etc.)
- Is it a TURTLENECK? Only if the input clearly shows a turtleneck.
- If the input shows a V-NECK → The output MUST show V-NECK
- If the input shows a CREW NECK → The output MUST show CREW NECK
- If the input shows a ROUND NECK → The output MUST show ROUND NECK
- If the input shows a SWEETHEART NECK → The output MUST show SWEETHEART NECK
- DO NOT ASSUME TURTLENECK unless the input image CLEARLY shows one
- TURTLENECK = neck is FULLY COVERED up to chin
- V-NECK = V-shaped opening at chest
- CREW NECK = Round opening at base of neck
- CHANGING THE NECKLINE = WRONG PRODUCT = FAILURE

CRITICAL PRODUCT INTEGRITY:
Use the uploaded product image as the EXACT visual reference for the garment.
The clothing design, fabric, color, texture, stitching, fit and proportions must remain IDENTICAL to the reference image.
Do not change the product in any way. The model is only a carrier; the garment is the hero.
⚠️ ESPECIALLY THE NECKLINE - COPY IT EXACTLY FROM INPUT IMAGE ⚠️

🧍 CRITICAL - HUMAN BODY PROPORTIONS 🧍
The model must have CORRECT, NATURAL human anatomy:
- Head size: approximately 1/7 to 1/8 of total body height
- Do NOT create oversized heads or shrunken bodies
- Do NOT compress or squash the torso
- Arms and legs must have natural, realistic lengths
- The body must NOT look distorted, stretched, or compressed
- If input shows a model with certain proportions, OUTPUT must match those proportions
- Think: "Would this person look normal standing next to real people?"

ZERO IMAGINATION / ZERO HALLUCINATION POLICY:
ABSOLUTELY NO PRODUCT HALLUCINATION - CRITICAL
DO NOT USE YOUR IMAGINATION. DO NOT ADD ANYTHING NOT IN THE INPUT.

STRICT RULES:
- ONLY use what is VISIBLE in the input image(s)
- ONLY apply the settings the user has selected
- The INPUT IMAGES define what products exist - NOTHING ELSE
- If user gives 1 jacket → output shows ONLY that 1 jacket
- If user gives pants + shirt → output shows ONLY those 2 items
- DO NOT add extra clothing items (scarves, hats, belts, ties, pocket squares, etc.)
- DO NOT add accessories (watches, jewelry, sunglasses, bags, etc.)
- DO NOT add props or objects not in the input
- DO NOT change or "improve" the garment design
- DO NOT add patterns, textures, or details not in the input
- DO NOT add background elements not specified
- DO NOT add other people or animals (unless user selected)
- DO NOT be creative with the product - COPY IT EXACTLY
- DO NOT invent/hallucinate any product that wasn't provided
- If something is NOT in the input and NOT in user settings = DO NOT ADD IT
- Your job is to REPLICATE EXACTLY, not to CREATE or IMAGINE

🏷️ LOGO/BROOCH/EMBLEM RULE - CRITICAL:
- If the input has a collar pin, brooch, logo, or emblem on the lapel/collar:
  - If you can render it CLEARLY and ACCURATELY → show it
  - If you CANNOT render it clearly (blurry, distorted, unreadable) → DO NOT SHOW IT AT ALL
  - Better NO logo than a BAD/UNCLEAR logo
  - Do NOT invent or guess what the logo looks like
  - Do NOT show a generic/placeholder logo
---

CATEGORY: Women's fashion (dress, blouse, skirt, pants, jacket – based on the uploaded product).

MODEL SPECIFICATIONS:
- SKIN TONE: ${skinDescription}
- Age appearance: 22-35 years old
- Physique: Charismatic, feminine presence with confident energy
- Facial expression: Captivating, confident, aspirational
- Grooming: Styled, editorial-ready, glamorous appearance
- POSE: ${poseDescription}

CAMERA ANGLE & LENS:
- Camera angle: Dynamic angle for visual impact, can be slightly elevated or low
- Lens: 35-50mm cinematic lens look, natural perspective
- Distance: Dramatic framing, can crop for impact
- Framing: Bold, asymmetric, attention-grabbing composition

LIGHTING SETUP:
- Directional cinematic lighting with sculpted shadows and controlled contrast
- Dramatic, mood-driven lighting with strong visual impact
- Beauty lighting to enhance model's features
- Result: Powerful, cinematic, aspirational

BACKGROUND/ENVIRONMENT:
${backgroundSection}
- Minimal atmospheric environment, non-distracting
- May include dramatic elements: shadows, light rays, architectural depth
- Cinematic color grading and mood
- Can be slightly blurred for focus on model/clothing

MOOD & STYLE:
- Powerful, cinematic, aspirational, feminine strength
- Goal: Emotional impact and strong brand perception

GENERAL COMPOSITION RULES:
- No wide-angle distortion
- Garment must be fully readable and correctly proportioned
- Dynamic framing with intentional composition
- Natural body anatomy and realistic posture
- Foreground, subject, and background must be visually separated with depth

COLOR & GRADING:
- Rich, cinematic color palette
- Flattering skin tones, dramatic fabric rendering
- Controlled contrast for impact
- Natural yet elevated appearance

QUALITY REQUIREMENTS:
- Photorealistic women's fashion photography
- Clean, premium, brand-consistent output
- No artifacts, no warped clothing, no incorrect textures
- No logos or text unless present in the reference image
- Scroll-stopping visual impact for digital advertising (Meta, Google Ads)

NEGATIVE (AVOID):
- Changing garment design or fit
- Wrong fabric or color
- Oversharpening
- Plastic skin or unnatural appearance
- Harsh unflattering shadows
- Busy or distracting background
- Fashion elements competing with the product
`;
};

// Ana kadın moda görseli oluşturma fonksiyonu
export const generateWomensFashionImage = async (
    clothingImage: File,
    settings: WomensFashionSettings,
    onProgress?: (message: string) => void,
    referenceModel?: File | null,
    additionalClothes?: File[]
): Promise<WomensFashionGenerationResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = "gemini-3-pro-image-preview";

        onProgress?.("👗 Kadın moda görseli hazırlanıyor...");

        // Process the main clothing image
        const { base64, mimeType } = await processImageForGemini(clothingImage, 2048, 0.95);

        // Process additional clothes if provided
        const additionalImagesData: Array<{ base64: string; mimeType: string }> = [];
        if (additionalClothes && additionalClothes.length > 0) {
            onProgress?.(`👚 ${additionalClothes.length} ek kıyafet işleniyor...`);
            for (const cloth of additionalClothes) {
                const data = await processImageForGemini(cloth, 2048, 0.95);
                additionalImagesData.push(data);
            }
        }

        // Process reference model if provided
        let refModelBase64: string | null = null;
        let refModelMimeType: string | null = null;
        if (referenceModel) {
            onProgress?.("👩 Referans manken işleniyor...");
            const refData = await processImageForGemini(referenceModel, 2048, 0.95);
            refModelBase64 = refData.base64;
            refModelMimeType = refData.mimeType;
        }

        onProgress?.("📸 Çekim tipi belirleniyor...");

        // Select prompt based on purpose
        let prompt: string;
        let purposeLabel: string;

        // JSON-based compact prompt sistemi kullan
        prompt = buildCompactJSONPromptWomen(settings);
        purposeLabel = settings.purpose === 'ecommerce' ? 'E-Ticaret' : settings.purpose === 'catalog' ? 'Katalog' : 'Reklam';
        console.log('📋 Compact JSON prompt (Women) kullanılıyor');

        // Add reference model instructions if provided - PREPEND to make it highest priority
        if (referenceModel && refModelBase64) {
            // Total images: 1 ref model + 1 main clothing + additional clothes
            const clothingCount = 1 + additionalImagesData.length; // main clothing + additional
            const totalImages = 1 + clothingCount; // ref model + all clothing

            // Her görsel için açık harita oluştur
            let imageList = '• IMAGE 1 = 👤 MANKEN (bu kişiyi kullan)\n';
            imageList += '• IMAGE 2 = 👔 ANA KIYAFET\n';
            for (let i = 0; i < additionalImagesData.length; i++) {
                imageList += `• IMAGE ${3 + i} = 👕 EK KIYAFET ${i + 1}\n`;
            }

            const refModelPrefix = `
🚨🚨🚨 REFERANS MANKEN + ${clothingCount > 1 ? 'ÇOKLU KIYAFET' : 'KIYAFET'} MODU 🚨🚨🚨

📋 GÖRSEL HARİTASI (${totalImages} görsel):
${imageList}
🎯 GÖREV: IMAGE 1'deki KİŞİYE, IMAGE 2${clothingCount > 1 ? `-${totalImages}` : ''}'deki KIYAFET${clothingCount > 1 ? 'LERİ' : 'İ'} giydir.

🔒 TUTARLILIK KURALLARI - MUTLAKA UYGULA 🔒

1. KİMLİK KORUMA (IMAGE 1'deki kişi):
   - AYNI kişiyi kullan - yüz hatları, göz rengi, ten rengi, saç rengi/stili
   - Vücut tipi, boy, yapı AYNI kalmalı
   - Farklı bir kişi/manken ÜRETME
   - Yüzü değiştirme, yaşlandırma/gençleştirme yapma

2. ÜRÜN KORUMA (IMAGE 2${clothingCount > 1 ? `-${totalImages}` : ''}):
   - Kıyafetlerin rengini, desenini, dokusunu değiştirme
   - Düğme, fermuar, logo gibi detayları koru
   - Ürün görselindeki HER ŞEYİ birebir aktar

3. SEÇİLEN AYARLARI UYGULA:
   - Sadece ayarlardaki arka planı kullan (IMAGE 1'in arka planını YOKSAY)
   - Sadece ayarlardaki pozu kullan

✅ YAPILACAKLAR:
1. IMAGE 1'deki kişinin YÜZÜNÜ kullan (başka yüz üretme)
2. IMAGE 1'deki kişinin VÜCUDUNU kullan (başka vücut üretme)
3. IMAGE 1'in ARKA PLANINI YOKSAY - ayarlardaki arka planı kullan
4. IMAGE 2${clothingCount > 1 ? `-${totalImages}` : ''}'deki kıyafet${clothingCount > 1 ? 'lerin HEPSİNİ' : 'i'} BİREBİR koru
${clothingCount > 1 ? `5. TÜM ${clothingCount} KIYAFET PARÇASINI BİRLİKTE GİYDİR
6. CEKET/BLAZER varsa MUTLAKA GİYDİR - gömleğin üstünde!\n` : ''}
❌ YASAKLAR:
- Rastgele/farklı manken üretme
- Kıyafetlerin rengini/desenini değiştirme
- Verilen kıyafetleri atlama veya değiştirme
${clothingCount > 1 ? '- Kıyafetlerden birini unutma (özellikle CEKETİ!)\n' : ''}- IMAGE 1'in arka planını kullanma

---

`;
            prompt = refModelPrefix + prompt;
            prompt += getReferenceModelPromptAddition();
        }

        // Add multiple clothing instructions if provided
        if (additionalImagesData.length > 0) {
            const clothingStartIndex = referenceModel ? 2 : 1;
            prompt += getMultipleClothingPromptAdditionWithOffset(additionalImagesData.length + 1, clothingStartIndex);
        }

        // ⚠️ PRODUCT FIDELITY - En önemli kural: Ürün orijinalliğini koru
        prompt += PRODUCT_FIDELITY_PROMPT;

        // 🐾 Hayvan ekleme
        if (settings.animal && settings.animal.enabled) {
            onProgress?.("🐾 Hayvan arkadaş ekleniyor...");
            prompt += buildAnimalPromptAddition(settings.animal);
        }

        onProgress?.(`🎬 ${purposeLabel} görseli oluşturuluyor...`);

        console.log(`Generating Women's Fashion image: ${purposeLabel}${referenceModel ? ' (with reference model)' : ''}${additionalImagesData.length > 0 ? ` (with ${additionalImagesData.length} additional clothes)` : ''}${settings.animal?.enabled ? ' (with animal companion)' : ''}`);

        // Build parts array
        const parts: any[] = [];

        // CRITICAL: If reference model is provided, add it FIRST so AI prioritizes it
        if (refModelBase64 && refModelMimeType) {
            parts.push({ inlineData: { data: refModelBase64, mimeType: refModelMimeType } });
        }

        // Add main clothing image
        parts.push({ inlineData: { data: base64, mimeType } });

        // Add additional clothing images
        for (const addImg of additionalImagesData) {
            parts.push({ inlineData: { data: addImg.base64, mimeType: addImg.mimeType } });
        }

        // Calculate aspect ratio for prompt instruction
        const getAspectRatioInstruction = (ratio: string): string => {
            switch (ratio) {
                case '1:1': return 'SQUARE format (1:1 aspect ratio) - equal width and height';
                case '9:16': return 'VERTICAL/PORTRAIT format (9:16 aspect ratio) - tall and narrow, like a phone screen in portrait mode';
                case '16:9': return 'HORIZONTAL/LANDSCAPE format (16:9 aspect ratio) - wide and short, like a TV screen';
                case '4:5': return 'PORTRAIT format (4:5 aspect ratio) - slightly taller than wide, Instagram portrait style';
                case '3:4': return 'PORTRAIT format (3:4 aspect ratio) - classic portrait, taller than wide, ideal for full-body fashion shots';
                case '2:3': return 'TALL PORTRAIT format (2:3 aspect ratio) - significantly taller than wide, perfect for full-length model shots';
                default: return 'PORTRAIT format (3:4 aspect ratio) - classic portrait, taller than wide';
            }
        };

        // Add aspect ratio instruction to prompt
        const aspectInstruction = `

📐 FORMAT: ${getAspectRatioInstruction(settings.aspectRatio || '3:4')}
`;

        // Referans manken varsa, EN SONA çok güçlü hatırlatma ekle
        const referenceModelReminder = refModelBase64 ? `

🚨🚨🚨 SON HATIRLATMA - REFERANS MANKEN 🚨🚨🚨
IMAGE 1'DEKİ KİŞİYİ KULLAN!
- AYNI yüz (gözler, burun, ağız, çene yapısı)
- AYNI vücut
- AYNI cilt rengi
- AYNI saç

⛔ BAŞKA MANKEN ÜRETME!
⛔ BENZERİNİ ÜRETME!
⛔ IMAGE 1'İ YOKSAYMA!

ÇIKTI = IMAGE 1'deki KİŞİ + IMAGE 2'deki KIYAFET
Farklı kişi = BAŞARISIZ
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
` : '';

        // Çoklu kıyafet varsa, EN SONA hatırlatma ekle
        const totalClothes = 1 + additionalImagesData.length;
        const multipleClothingReminder = additionalImagesData.length > 0 ? `

🚨🚨🚨 SON HATIRLATMA - ÇOKLU KIYAFET 🚨🚨🚨
${totalClothes} ADET KIYAFET VERİLDİ = ${totalClothes} ADET KIYAFET GÖSTERİLMELİ!

${refModelBase64 ? `• IMAGE 2-${1 + totalClothes} = KIYAFETLER` : `• IMAGE 1-${totalClothes} = KIYAFETLER`}

👔👔👔 CEKET KONTROLÜ 👔👔👔
Görsellerde CEKET/BLAZER varsa:
- Manken CEKETİ GİYMİŞ OLMALI!
- Ceket gömleğin ÜSTÜNDE!
- Ceketi ASLA ATLAMA!

✅ TÜM KIYAFETLER TEK MANKEN ÜZERİNDE
✅ HER PARÇANIN RENGİ/DESENİ KORUNMUŞ
✅ HİÇBİR PARÇA ATLANMAMIŞ
✅ CEKET VARSA GİYİLİ!

⛔ CEKETİ ATLAMA!
⛔ KIYAFET ATLAMA!
⛔ KIYAFET DEĞİŞTİRME!
⛔ EKSTRA KIYAFET EKLEME!

ÇIKTI = ${totalClothes} parça kıyafet giymiş tek manken (CEKET DAHİL!)
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
` : '';

        // Add prompt text with all reminders
        parts.push({ text: prompt + aspectInstruction + referenceModelReminder + multipleClothingReminder });

        // Debug: Log image order
        console.log('🖼️ WOMEN FASHION - IMAGE ORDER IN PARTS ARRAY:');
        let imgIndex = 1;
        for (const part of parts) {
            if (part.inlineData) {
                if (refModelBase64 && imgIndex === 1) {
                    console.log(`  IMAGE ${imgIndex}: REFERENCE MODEL (manken)`);
                } else {
                    console.log(`  IMAGE ${imgIndex}: CLOTHING/OTHER`);
                }
                imgIndex++;
            }
        }

        const config = {
            generationConfig: {
                temperature: 0.4
            }
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: config
        });

        const imageData = extractImageFromResponse(response);

        if (imageData) {
            onProgress?.("✅ Kadın moda görseli başarıyla oluşturuldu!");
            console.log("✅ Women's Fashion image generated successfully");

            return {
                imageData,
                aiModel: modelName,
                purpose: settings.purpose
            };
        }

        throw new Error("Kadın moda görseli oluşturulamadı - görsel üretilemedi.");

    } catch (error: any) {
        console.error("Women's Fashion Generation Error:", error);
        if (error.status === 429) {
            throw new Error("API kota limiti aşıldı (429). Lütfen daha sonra tekrar deneyin.");
        }
        if (error.status === 503 || error.message?.includes('503') || error.message?.includes('overloaded')) {
            throw new Error("Model şu anda meşgul (503). Lütfen birkaç dakika bekleyip tekrar deneyin.");
        }
        throw error;
    }
};

// Çoklu kadın moda görseli oluşturma (batch)
export const generateMultipleWomensFashionImages = async (
    clothingImage: File,
    settings: WomensFashionSettings,
    onProgress?: (message: string, current: number, total: number) => void,
    referenceModel?: File | null,
    additionalClothes?: File[]
): Promise<WomensFashionGenerationResult[]> => {
    const results: WomensFashionGenerationResult[] = [];
    const total = settings.numberOfImages;

    for (let i = 0; i < total; i++) {
        onProgress?.(`Görsel ${i + 1}/${total} oluşturuluyor...`, i + 1, total);

        try {
            const result = await generateWomensFashionImage(
                clothingImage,
                settings,
                (msg) => onProgress?.(msg, i + 1, total),
                referenceModel,
                additionalClothes
            );
            results.push(result);

            // Rate limiting - wait between generations
            if (i < total - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`Görsel ${i + 1} oluşturulurken hata:`, error);
            // Continue with remaining images
        }
    }

    if (results.length === 0) {
        throw new Error("Hiçbir kadın moda görseli oluşturulamadı.");
    }

    return results;
};

// Kadın moda prompt önizleme fonksiyonu - UI'da göstermek için
export const buildWomensFashionPromptPreview = (
    settings: WomensFashionSettings,
    hasReferenceModel: boolean = false,
    additionalClothesCount: number = 0
): string => {
    // JSON-based compact prompt sistemi kullan
    let prompt = buildCompactJSONPromptWomen(settings);

    // Add reference model note if provided
    if (hasReferenceModel) {
        const clothingCount = 1 + additionalClothesCount;
        prompt = `[REFERANS MODEL MODU - ${clothingCount} kıyafet]\n\n` + prompt;
    }

    // Add multiple clothing note if provided
    if (additionalClothesCount > 0) {
        prompt += `\n\n[+${additionalClothesCount} ek kıyafet eklendi]`;
    }

    // 🐾 Hayvan ekleme notu
    if (settings.animal && settings.animal.enabled) {
        prompt += `\n\n[HAYVAN: ${settings.animal.type} - ${settings.animal.position}]`;
    }

    return prompt;
};

// ============================================
// REFERANSLI ÜRETİM - POSE TRANSFER + FACE SWAP
// ============================================

export interface ReferencedProductionResult {
    imageData: string;
    aiModel: string;
}

const getReferencedProductionPrompt = (settings: ReferencedProductionSettings): string => {
    const preserveItems: string[] = [];

    if (settings.preserveClothing) {
        preserveItems.push('CLOTHING (exact garments, colors, textures, patterns)');
    }
    if (settings.preserveFace) {
        preserveItems.push('FACE (exact facial features, expression, makeup if any)');
    }
    if (settings.preserveHair) {
        preserveItems.push('HAIR (exact hairstyle, color, texture)');
    }

    // Seçilen poz bilgisini al
    const selectedPose = REFERENCED_POSE_OPTIONS.find(p => p.id === settings.selectedPose);
    const isCustomPose = settings.selectedPose !== 'reference' && selectedPose;

    // Poz talimatı oluştur
    let poseInstruction = '';
    if (isCustomPose && selectedPose) {
        poseInstruction = `
🎭 SELECTED POSE: ${selectedPose.label}
- ${selectedPose.description}
- Apply this specific pose style to the model
- The pose should look natural and professional
${selectedPose.category === 'vogue' ? `- This is a VOGUE/EDITORIAL style pose - make it high-fashion, dramatic, and magazine-worthy
- Emphasize elegance, confidence, and editorial aesthetics
- The pose should be striking and visually captivating` : ''}
${selectedPose.category === 'basic' ? `- This is a CLASSIC/BASIC pose - keep it clean, simple, and commercial
- Focus on natural body language and approachable feel
- The pose should be suitable for e-commerce and catalog` : ''}
`;
    }

    return `
🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
⚡⚡⚡ POSE TRANSFER TASK - MANDATORY INSTRUCTIONS ⚡⚡⚡

🎯 ABSOLUTE REQUIREMENT - THE MODEL MUST CHANGE POSE:
The person from IMAGE 1 MUST adopt a COMPLETELY DIFFERENT POSE.
Their pose MUST match the pose shown in IMAGE 2.
DO NOT keep the original pose from IMAGE 1.

📸 TWO IMAGES PROVIDED:
- IMAGE 1 = SOURCE MODEL (the person, face, clothes, hair to use)
- IMAGE 2 = TARGET POSE REFERENCE (the POSE to copy - arms, legs, body position, stance)

🔄 POSE TRANSFORMATION RULES (CRITICAL):
1. ANALYZE the body position in IMAGE 2:
   - How are the ARMS positioned? (raised, crossed, on hips, relaxed)
   - How are the LEGS positioned? (standing straight, crossed, one leg bent)
   - How is the TORSO angled? (facing camera, turned, twisted)
   - How is the HEAD tilted? (straight, tilted left/right, looking up/down)
   - What is the overall STANCE? (confident, relaxed, dynamic, editorial)

2. APPLY this exact pose to the IMAGE 1 person:
   - Move their arms to match IMAGE 2
   - Move their legs to match IMAGE 2
   - Rotate their body to match IMAGE 2
   - Tilt their head to match IMAGE 2
   - Copy the exact body language and stance

3. KEEP from IMAGE 1:
   ✅ The person's FACE (identity, features)
   ✅ The person's CLOTHES (exact garments)
   ✅ The person's HAIR (style, color)
   ✅ The person's BODY (physique, skin tone)
   ❌ DO NOT keep the BACKGROUND from IMAGE 1

4. DO NOT KEEP from IMAGE 1:
   ❌ The original pose/position
   ❌ The arm positions
   ❌ The leg positions
   ❌ The body angle
   ❌ The head tilt
   ❌ The BACKGROUND / ENVIRONMENT / SCENE from IMAGE 1

⚠️ COMMON MISTAKE TO AVOID:
DO NOT just add the IMAGE 1 person with their ORIGINAL POSE.
The person MUST be repositioned to match IMAGE 2 pose EXACTLY.

🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

🎯 POSE TRANSFER TASK

📷 IMAGE 1 - THIS IS MY MODEL (USE THIS PERSON):
- This person's FACE must appear in the output
- This person's BODY must appear in the output
- This person's CLOTHES must appear in the output
- This person's HAIR must appear in the output
- EVERYTHING about this person goes to the output

📷 IMAGE 2 - POSE REFERENCE ONLY (DO NOT USE THIS PERSON):
${isCustomPose
    ? `Only use this for scene/background reference.
The pose will be: ${selectedPose?.label} - ${selectedPose?.description}`
    : `Copy ONLY the body position/pose from this image.
DO NOT copy the person, clothes, or accessories.`}
${poseInstruction}

🎨 YOUR TASK:
1. Look at the PERSON in Image 1 - this is who will be in the output
2. Look at the POSE in Image 2 - this is how they should stand/sit
3. Generate: Image 1 person doing the Image 2 pose
4. Use the BACKGROUND/SCENE from Image 2 - COMPLETELY IGNORE Image 1 background

The output person must be RECOGNIZABLE as Image 1 person.
The SOURCE MODEL should:
${isCustomPose
    ? `- Apply the SELECTED POSE STYLE described above (${selectedPose?.label})`
    : `- Take the EXACT SAME POSE as the person in Image 2`}
- Be in the EXACT SAME LOCATION/SCENE as Image 2
- Have the EXACT SAME CAMERA ANGLE as Image 2
- Have the EXACT SAME LIGHTING STYLE as Image 2

🚨🚨🚨 BACKGROUND RULE - EXTREMELY IMPORTANT 🚨🚨🚨
- The BACKGROUND must come ONLY from IMAGE 2 (Reference Pose)
- COMPLETELY REMOVE and IGNORE the background from IMAGE 1 (Source Model)
- Extract ONLY the person from IMAGE 1, discard their entire background/environment
- The person from IMAGE 1 must be placed into the SCENE/BACKGROUND of IMAGE 2
- If IMAGE 1 shows a stadium, street, studio, room, etc. → DO NOT use that background
- The final image background = IMAGE 2 background ONLY
- Think of it as: CUT OUT the person from Image 1 → PASTE into Image 2 scene with Image 2 pose

🔒 MUST PRESERVE FROM SOURCE MODEL (IMAGE 1):
${preserveItems.map(item => `• ${item}`).join('\n')}

🚨🚨🚨 CRITICAL RULE - NO ADDITIONS FROM REFERENCE 🚨🚨🚨
- ONLY use items that exist in the SOURCE MODEL (Image 1)
- If the Reference person has a BAG but Source Model does NOT → DO NOT add a bag
- If the Reference person has a HAT but Source Model does NOT → DO NOT add a hat
- If the Reference person has JEWELRY but Source Model does NOT → DO NOT add jewelry
- If the Reference person has SUNGLASSES but Source Model does NOT → DO NOT add sunglasses
- If the Reference person has a SCARF but Source Model does NOT → DO NOT add a scarf
- If the Reference person has a WATCH but Source Model does NOT → DO NOT add a watch
- NEVER transfer ANY accessory, prop, or item from Reference to Source Model
- The Source Model should appear EXACTLY as they are in Image 1, just in a new pose/scene

${settings.preserveClothing ? `
👗 CLOTHING & ACCESSORIES PRESERVATION RULES (CRITICAL):

🚨🚨🚨 COLOR PRESERVATION IS MANDATORY 🚨🚨🚨
- ANALYZE the EXACT colors of ALL clothing items in Image 1:
  * What color is the SHIRT/TOP? (exact shade)
  * What color are the PANTS/TROUSERS? (exact shade)
  * What color is the JACKET/COAT if any? (exact shade)
  * What color are the SHOES? (exact shade)
- These EXACT colors MUST appear in the output
- DO NOT change ANY clothing color
- DO NOT use colors from the Reference image (Image 2)
- If pants are BEIGE in Image 1 → pants MUST be BEIGE in output
- If pants are BLACK in Image 1 → pants MUST be BLACK in output
- If pants are GRAY in Image 1 → pants MUST be GRAY in output
- If shirt is WHITE in Image 1 → shirt MUST be WHITE in output
- WRONG COLOR = FAILED OUTPUT

📋 FULL CLOTHING PRESERVATION:
- The SOURCE MODEL's clothing MUST appear EXACTLY as in Image 1
- Preserve ALL clothing details: color, pattern, texture, fit, style
- The clothes should naturally adapt to the new pose
- Do NOT use any clothing from the Reference image
- If it's a dress, keep it a dress. If it's a blouse + skirt, keep that combination.
- ONLY include accessories that are VISIBLE in Image 1 (Source Model)
- If Source Model has a bag → keep the bag
- If Source Model has NO bag → NO bag in output (even if Reference has one)
- Same rule applies for ALL accessories: watches, jewelry, hats, scarves, belts, etc.
` : ''}

${settings.collarType && settings.collarType !== 'auto' && COLLAR_TYPE_DESCRIPTIONS[settings.collarType] ? `
🧶 COLLAR TYPE SPECIFICATION (TRIKO/SWEATER):
⚡ THE USER HAS SPECIFIED THE COLLAR TYPE: ${COLLAR_TYPE_DESCRIPTIONS[settings.collarType]}
- If the garment is a sweater/knit, the collar MUST match this specification
- DO NOT change or assume a different collar type
- This overrides any collar detection from the source image
` : ''}

${settings.fabricType && settings.fabricType !== 'auto' && FABRIC_TYPE_DESCRIPTIONS[settings.fabricType] ? `
🧥 FABRIC TYPE SPECIFICATION (JACKET):
⚡ THE USER HAS SPECIFIED THE FABRIC TYPE: ${FABRIC_TYPE_DESCRIPTIONS[settings.fabricType]}
- If the garment is a jacket/coat, the fabric texture MUST match this specification
- The jacket fabric should clearly show the specified texture characteristics
- This overrides any fabric detection from the source image
` : ''}

${settings.preserveFace ? `
👤 FACE SWAP RULES (CRITICAL):
- The face MUST be from the SOURCE MODEL (Image 1)
- Preserve exact facial features: eyes, nose, lips, face shape
- Preserve skin tone from Source Model
- Adapt facial expression naturally to the new pose context
- Face angle should match the Reference pose direction
` : ''}

${settings.preserveHair ? `
💇 HAIR PRESERVATION RULES:
- Keep the SOURCE MODEL's hairstyle
- Hair color MUST match Image 1 exactly
- Hair can flow naturally according to the new pose
- If the reference shows hair movement (wind, etc.), apply similar movement to Source Model's hair
` : ''}

${settings.matchLighting ? `
💡 LIGHTING ADAPTATION (CRITICAL FOR REALISM):
- ANALYZE the lighting in Image 2 (Reference/Scene):
  * Where is the light source? (left, right, top, behind, front)
  * What type of light? (sunlight, studio, ambient, dramatic, soft)
  * What color temperature? (warm golden, cool blue, neutral)
  * How intense are the shadows?

- APPLY the same lighting to Image 1 person:
  * Shadows on face/body must match the scene's light direction
  * Highlights must appear where the scene's light would hit
  * Skin tone should reflect the scene's color temperature
  * If scene has warm sunset light → model should have warm tones
  * If scene has cool shadow → model should have cool tones
  * If scene has harsh sunlight → model should have strong shadows
  * If scene has soft diffused light → model should have soft shadows

- INTEGRATION RULES:
  * The model must look like they are ACTUALLY IN the scene
  * No "pasted on" appearance - lighting must be seamless
  * Rim lighting, fill lighting, key lighting must all match
  * Reflections on skin/clothes should match environment

- 🚫 NO ARTIFICIAL GLOW / PARLAMA YASAK:
  * DO NOT add any artificial shine or glow to the model
  * NO glossy/shiny skin - skin must be MATTE and natural
  * NO HDR-style over-brightening on the model
  * NO "studio flash" look when scene has ambient lighting
  * The model should NOT be brighter than the scene allows
  * If scene is dimly lit → model should also be dimly lit
  * NO spotlight effect on the model
  * Skin should look like real human skin, not plastic or oily
  * AVOID over-exposed highlights on face and clothes
  * Match the scene's exposure level exactly
` : ''}

🎬 COMPOSITION REQUIREMENTS:
- Frame the shot EXACTLY like the Reference image
- Use same camera distance (close-up, medium, full body)
- Use same aspect ratio as Reference
- Use same depth of field characteristics

${settings.preserveAngle ? `
📐📐📐 ANGLE PRESERVATION - CRITICAL 📐📐📐
⚡ THE OUTPUT MUST MATCH THE EXACT CAMERA ANGLE FROM IMAGE 2 (REFERENCE)
- Copy the EXACT camera position (angle, height, distance)
- If Image 2 has a specific tilt, rotation, or perspective → use the SAME
- The composition (what's in frame, cropping style) must match Image 2
- If Image 2 shows multiple items → show the same number of items in output
- If Image 2 has 2 products/items visible → output MUST also show 2 products/items
- Match the EXACT framing: close-up, medium shot, full shot, etc.
- Match the camera's viewing angle: eye level, low angle, high angle, etc.
- The PRODUCT/ITEM from Image 1 should be placed in the EXACT SAME POSITION as Image 2
` : ''}

${settings.preserveAspectRatio ? `
📏📏📏 ASPECT RATIO PRESERVATION - CRITICAL 📏📏📏
⚡ THE OUTPUT MUST MATCH THE EXACT ASPECT RATIO OF IMAGE 2 (REFERENCE)
- Analyze Image 2 dimensions (width:height ratio)
- Generate output with the SAME aspect ratio
- DO NOT add white space, padding, or margins
- DO NOT crop differently than Image 2
- The output should fill the frame exactly like Image 2
- If Image 2 is square (1:1) → output must be square
- If Image 2 is portrait (3:4, 2:3, etc.) → output must be same portrait ratio
- If Image 2 is landscape (4:3, 16:9, etc.) → output must be same landscape ratio
- NO EMPTY WHITE AREAS - the entire canvas must be filled with the image
` : ''}

${settings.shotType && settings.shotType !== 'auto' && SHOT_TYPE_OPTIONS ? `
📐 FRAMING PREFERENCE: ${(() => {
    const shotInfo = SHOT_TYPE_OPTIONS.find(s => s.id === settings.shotType);
    return shotInfo ? shotInfo.name : settings.shotType;
})()}
- ${settings.shotType === 'extreme-long-shot' ? 'Show full body with model appearing small, lots of environment visible' : ''}${settings.shotType === 'long-shot' ? 'Show complete full body from head to feet' : ''}${settings.shotType === 'medium-long-shot' ? 'Frame from head to knee level (American shot)' : ''}${settings.shotType === 'medium-shot' ? 'Frame from head to waist level' : ''}${settings.shotType === 'medium-close-up' ? 'Frame from TOP OF HEAD (including all hair) to mid-chest. The COMPLETE head with ALL HAIR must be visible - do NOT crop the top of the head.' : ''}${settings.shotType === 'close-up' ? 'HEAD SHOT - Frame the COMPLETE HEAD including ALL HAIR. Show from top of hair to chin/neck. The ENTIRE head shape with full hairstyle must be visible. Do NOT crop the top of the head or cut off any hair. Face and hair fully visible from any camera angle.' : ''}${settings.shotType === 'extreme-close-up' ? 'Very tight frame on a single detail' : ''}${settings.shotType === 'detail-shot' ? 'Focus on product/fabric detail' : ''}${settings.shotType === 'over-the-shoulder' ? 'CAMERA POSITION: Camera placed slightly behind and to the side of the model, at shoulder height, angled to show the model from a 3/4 rear view. The model is looking slightly over their shoulder toward the camera. ⚠️ DO NOT ADD A SECOND PERSON - this is ONLY a camera angle/position, NOT a scene with multiple people. There should be ONLY ONE model in the frame. ⚠️ KEEP THE SAME BACKGROUND - do not change or add elements to the background just because the camera angle changed.' : ''}
- This is just a framing preference - ALL other rules above still apply
- The SOURCE MODEL (Image 1) person, face, clothes MUST still be used
- The REFERENCE (Image 2) background/scene MUST still be used
- ⛔ DO NOT add any additional people, figures, or silhouettes - only the main model should appear
- 🧍 PRESERVE BODY PROPORTIONS: Do NOT distort, compress, or stretch the model's body. Head-to-body ratio must remain natural (head = 1/7 to 1/8 of height). No squashed torsos or oversized heads.
` : ''}

📏📏📏 SCALE & PROPORTION - CRITICAL 📏📏📏
- The model MUST fit naturally into the scene's scale
- DO NOT make the model too tall or too short for the environment
- If there are reference objects (doors, furniture, cars, buildings):
  * Use them to determine correct human scale
  * A human should be proportional to these objects
- The model should look like they BELONG in the scene, not pasted on top
- Match the perspective of the scene:
  * If camera is looking up → model should appear from below angle
  * If camera is looking down → model should appear from above angle
  * If camera is eye-level → model should be at eye level
- The model's feet should be grounded properly on the scene's floor/ground
- NO floating models - they must be anchored to the environment
- Head-to-body ratio must be realistic (not elongated or compressed)

🌟🌟🌟 MANDATORY LIGHTING & SKIN RULES (ALWAYS APPLY) 🌟🌟🌟
⚠️ THE MODEL MUST LOOK NATURAL IN THE SCENE - NOT "PASTED ON":

1. LIGHTING MUST MATCH THE SCENE:
   - Analyze the light direction in Image 2 and apply to the model
   - If scene has shadows on the left → model must have shadows on the left
   - If scene is backlit → model must be backlit
   - If scene is dimly lit → model must be dimly lit (NOT bright)

2. 🚫 ABSOLUTELY NO ARTIFICIAL GLOW / PARLAMA YASAK 🚫:
   - The model must NOT be shinier than other objects in the scene
   - NO glossy skin - skin must look MATTE and natural like real human skin
   - NO HDR-style over-brightness on the model
   - NO "studio flash" effect when the scene has natural/ambient light
   - NO spotlight effect making the model unnaturally bright
   - If the scene is dark/shadowy → the model must also be dark/shadowy
   - The model should NOT "glow" or look like they have their own light source
   - Skin should look like REAL SKIN, not plastic, waxy, or oily

3. COLOR TEMPERATURE MATCHING:
   - If scene has warm/golden light → model must have warm tones
   - If scene has cool/blue light → model must have cool tones
   - If scene has neutral light → model must have neutral tones

4. SHADOW CONSISTENCY:
   - Model's shadow direction must match the scene
   - Shadow intensity must match the scene's overall shadow level
   - If scene has soft shadows → model has soft shadows
   - If scene has harsh shadows → model has harsh shadows

5. EXPOSURE LEVEL:
   - Model's brightness level must match the scene's exposure
   - DO NOT over-expose the model in a normally-lit scene
   - The model should blend seamlessly, not stand out due to lighting

⚠️ CRITICAL QUALITY RULES:
- Output must be photorealistic, professional quality
- NO anatomical errors (correct number of fingers, limbs)
- Natural skin texture, not plastic or waxy
- Seamless integration of Source Model into Reference scene
- Clothing should drape naturally on the body
- NO artifacts, distortions, or unnatural elements

❌ ABSOLUTE PROHIBITIONS:
- DO NOT add ANY item from Reference image to Source Model
- DO NOT change the Source Model's clothing
- DO NOT use the Reference person's face or body
- DO NOT alter the Source Model's identity
- DO NOT create unnatural poses or expressions
- DO NOT add bags, hats, jewelry, or ANY accessory not in Source Model
- DO NOT remove items that ARE in Source Model
- DO NOT use the BACKGROUND from IMAGE 1 (Source Model) - background must ALWAYS come from IMAGE 2

✅ OUTPUT:
A photo of the IMAGE 1 PERSON in the IMAGE 2 POSE and IMAGE 2 SCENE.
- Person = from Image 1 (face, body, hair, clothes)
- Pose = from Image 2 (body position only)
- Background/Scene = from Image 2 (NOT from Image 1)
- ❌ NEVER use Image 1 background in the output

🔴🔴🔴 FINAL CHECK BEFORE OUTPUT 🔴🔴🔴
Ask yourself: "Does the output show the Image 1 person?"
- If the face matches Image 1 → CORRECT
- If the face matches Image 2 → WRONG, redo with Image 1 person
- If it's a new/different face → WRONG, redo with Image 1 person

The user gave you THEIR model in Image 1.
They want to see THEIR model in the output.
NOT the person from Image 2.
NOT a new generated person.
THEIR model from Image 1.
🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴
`;
};

export const generateReferencedProduction = async (
    sourceModelImage: File,
    referencePoseImage: File,
    settings: ReferencedProductionSettings,
    onProgress?: (message: string) => void
): Promise<ReferencedProductionResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = "gemini-3-pro-image-preview";

        onProgress?.("🎭 Referanslı üretim hazırlanıyor...");

        // Process the source model image (manken)
        onProgress?.("👗 Kaynak manken işleniyor...");
        const sourceData = await processImageForGemini(sourceModelImage, 2048, 0.95);

        // Process the reference pose image
        onProgress?.("📸 Referans poz işleniyor...");
        const referenceData = await processImageForGemini(referencePoseImage, 2048, 0.95);

        onProgress?.("🎨 Poz transferi ve yüz değişimi yapılıyor...");

        // Build the prompt
        let prompt = getReferencedProductionPrompt(settings);

        // 🐾 Hayvan ekleme
        if (settings.animal && settings.animal.enabled) {
            onProgress?.("🐾 Hayvan arkadaş ekleniyor...");
            prompt += buildAnimalPromptAddition(settings.animal);
        }

        console.log(`Generating Referenced Production - Pose Transfer + Face Swap${settings.animal?.enabled ? ' (with animal companion)' : ''}`);

        // Build parts array - Source Model FIRST, then Reference
        const parts: any[] = [
            {
                inlineData: {
                    mimeType: sourceData.mimeType,
                    data: sourceData.base64
                }
            },
            {
                inlineData: {
                    mimeType: referenceData.mimeType,
                    data: referenceData.base64
                }
            },
            { text: prompt }
        ];

        const config: any = {
            imageConfig: {
                imageSize: '2K'
            },
            safetySettings: SAFETY_SETTINGS,
            generationConfig: {
                temperature: 0.4
            }
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: config
        });

        onProgress?.("✨ Görsel oluşturuldu, işleniyor...");

        const imageData = extractImageFromResponse(response);

        if (imageData) {
            onProgress?.("✅ Referanslı üretim başarıyla tamamlandı!");
            console.log("✅ Referenced Production completed successfully");
            return {
                imageData,
                aiModel: modelName
            };
        }

        throw new Error("Görsel oluşturulamadı - API yanıt vermedi.");
    } catch (error: any) {
        console.error("Referenced Production error:", error);
        if (error.status === 429) {
            throw new Error("API kota limiti aşıldı (429). Lütfen daha sonra tekrar deneyin.");
        }
        if (error.message?.includes('Safety')) {
            throw new Error("Güvenlik filtresi tetiklendi. Lütfen farklı görseller deneyin.");
        }
        throw new Error(error.message || "Referanslı üretim sırasında bir hata oluştu.");
    }
};

export const generateMultipleReferencedProductions = async (
    sourceModelImage: File,
    referencePoseImage: File,
    settings: ReferencedProductionSettings,
    onProgress?: (message: string, current: number, total: number) => void
): Promise<ReferencedProductionResult[]> => {
    const total = settings.numberOfImages;
    const results: ReferencedProductionResult[] = [];

    for (let i = 0; i < total; i++) {
        onProgress?.(`Görsel ${i + 1}/${total} oluşturuluyor...`, i + 1, total);

        try {
            const result = await generateReferencedProduction(
                sourceModelImage,
                referencePoseImage,
                settings,
                (msg) => onProgress?.(msg, i + 1, total)
            );
            results.push(result);

            // Rate limiting
            if (i < total - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`Görsel ${i + 1} oluşturulurken hata:`, error);
        }
    }

    if (results.length === 0) {
        throw new Error("Hiçbir referanslı üretim görseli oluşturulamadı.");
    }

    return results;
};

// Referanslı üretim prompt önizleme fonksiyonu
export const buildReferencedProductionPromptPreview = (
    settings: ReferencedProductionSettings
): string => {
    let prompt = getReferencedProductionPrompt(settings);

    // 🐾 Hayvan ekleme
    if (settings.animal && settings.animal.enabled) {
        prompt += buildAnimalPromptAddition(settings.animal);
    }

    return prompt;
};

// ============================================
// REFERANSLI 2 - REFERENCED2 PRODUCTION
// Manken + Kıyafetler (çoklu) + Mekan + Özel Prompt
// ============================================

export const generateReferenced2Production = async (
    modelImage: File,
    garmentImages: File[],
    sceneImage: File,
    customPrompt: string,
    onProgress?: (message: string) => void
): Promise<ReferencedProductionResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = "gemini-3-pro-image-preview";

        onProgress?.("🎭 Referanslı 2 üretim hazırlanıyor...");

        // Process the model image (manken)
        onProgress?.("👤 Manken görseli işleniyor...");
        const modelData = await processImageForGemini(modelImage, 2048, 0.95);

        // Process all garment images
        const garmentDataArray: { base64: string; mimeType: string }[] = [];
        for (let i = 0; i < garmentImages.length; i++) {
            onProgress?.(`👗 Kıyafet ${i + 1}/${garmentImages.length} işleniyor...`);
            const garmentData = await processImageForGemini(garmentImages[i], 2048, 0.95);
            garmentDataArray.push(garmentData);
        }

        // Process scene image
        onProgress?.("🏙️ Mekan görseli işleniyor...");
        const sceneData = await processImageForGemini(sceneImage, 2048, 0.95);

        onProgress?.("🎨 AI görsel oluşturuluyor...");

        // Build the prompt
        const garmentCount = garmentImages.length;
        const prompt = `You are a professional fashion photographer and image compositor.

=== IMAGE REFERENCE GUIDE ===
IMAGE 1: MODEL/MANNEQUIN - This is the person whose FACE, BODY SHAPE, SKIN TONE, and HAIR must be preserved exactly.
IMAGES 2-${1 + garmentCount}: GARMENTS - These are the clothing items photographed from different angles. The model MUST wear EXACTLY these garments.
IMAGE ${2 + garmentCount}: SCENE/LOCATION - This is the background environment where the final photo should take place.

=== USER'S CUSTOM INSTRUCTIONS ===
${customPrompt || 'Create a professional fashion photo combining all elements naturally.'}

=== GARMENT PRESERVATION RULES (CRITICAL) ===
🔴 The garments from the reference images MUST be reproduced with 100% accuracy:
- EXACT colors (no color shifting, no tone changes)
- EXACT patterns (stripes, checks, prints must match perfectly)
- EXACT textures (silk, cotton, leather, denim etc.)
- EXACT design details (buttons, zippers, collars, cuffs, stitching)
- EXACT fit and drape on the model's body
- EXACT brand logos or emblems if visible
- ALL garment pieces must be included - do NOT omit any item

=== FACE & BODY PRESERVATION RULES (CRITICAL) ===
🔴 The model from IMAGE 1 must be preserved with 100% accuracy:
- EXACT facial features (eyes, nose, mouth, jawline, cheekbones)
- EXACT skin tone and complexion
- EXACT hair color, style, and length
- EXACT body proportions and build
- Natural facial expression appropriate for fashion photography

=== SCENE INTEGRATION RULES (CRITICAL) ===
🔴 The scene from the last image must be integrated naturally:
- Match the lighting direction and color temperature of the scene
- Correct perspective and scale relative to the environment
- Natural shadows that match the scene's light source
- Appropriate depth of field for the scene
- The model should look like they are ACTUALLY IN the scene, not composited

=== OUTPUT REQUIREMENTS ===
- Generate ONE high-quality fashion photograph
- Professional fashion photography quality
- Natural and realistic - no artificial or CGI look
- Sharp focus on the model and garments
- ABSOLUTELY ZERO text, watermarks, logos, or overlays on the image
- No split images, no collages, no side-by-side comparisons
- Single cohesive photograph only`;

        // Build parts array - Model FIRST, then Garments, then Scene, then Prompt
        const parts: any[] = [
            {
                inlineData: {
                    mimeType: modelData.mimeType,
                    data: modelData.base64
                }
            }
        ];

        // Add all garment images
        for (const garmentData of garmentDataArray) {
            parts.push({
                inlineData: {
                    mimeType: garmentData.mimeType,
                    data: garmentData.base64
                }
            });
        }

        // Add scene image
        parts.push({
            inlineData: {
                mimeType: sceneData.mimeType,
                data: sceneData.base64
            }
        });

        // Add prompt text
        parts.push({ text: prompt });

        const config: any = {
            imageConfig: {
                imageSize: '2K'
            },
            safetySettings: SAFETY_SETTINGS,
            generationConfig: {
                temperature: 0.4
            }
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: config
        });

        onProgress?.("✨ Görsel oluşturuldu, işleniyor...");

        const imageData = extractImageFromResponse(response);

        if (imageData) {
            onProgress?.("✅ Referanslı 2 üretim başarıyla tamamlandı!");
            console.log("✅ Referenced2 Production completed successfully");
            return {
                imageData,
                aiModel: modelName
            };
        }

        throw new Error("Görsel oluşturulamadı - API yanıt vermedi.");
    } catch (error: any) {
        console.error("Referenced2 Production error:", error);
        if (error.status === 429) {
            throw new Error("API kota limiti aşıldı (429). Lütfen daha sonra tekrar deneyin.");
        }
        if (error.message?.includes('Safety')) {
            throw new Error("Güvenlik filtresi tetiklendi. Lütfen farklı görseller deneyin.");
        }
        throw new Error(error.message || "Referanslı 2 üretim sırasında bir hata oluştu.");
    }
};

export const generateMultipleReferenced2Productions = async (
    modelImage: File,
    garmentImages: File[],
    sceneImage: File,
    customPrompt: string,
    numberOfImages: number,
    onProgress?: (message: string, current: number, total: number) => void
): Promise<ReferencedProductionResult[]> => {
    const total = numberOfImages;
    const results: ReferencedProductionResult[] = [];

    for (let i = 0; i < total; i++) {
        onProgress?.(`Görsel ${i + 1}/${total} oluşturuluyor...`, i + 1, total);

        try {
            const result = await generateReferenced2Production(
                modelImage,
                garmentImages,
                sceneImage,
                customPrompt,
                (msg) => onProgress?.(msg, i + 1, total)
            );
            results.push(result);

            // Rate limiting
            if (i < total - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`Görsel ${i + 1} oluşturulurken hata:`, error);
        }
    }

    if (results.length === 0) {
        throw new Error("Hiçbir Referanslı 2 görseli oluşturulamadı.");
    }

    return results;
};

// ============================================
// SAHNEYE YERLEŞTİRME - SCENE PLACEMENT
// ============================================

export interface ScenePlacementResult {
    imageData: string;
    aiModel: string;
}

// Sahne görselini analiz edip detaylı açıklama çıkaran fonksiyon
const analyzeSceneImage = async (
    sceneBase64: string,
    sceneMimeType: string
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const analysisPrompt = `Analyze this scene image in detail for a fashion photoshoot placement. Provide a comprehensive description in the following format:

🏞️ SCENE ANALYSIS:

1. ENVIRONMENT TYPE:
- Location type (indoor/outdoor, specific place like café, street, garden, studio, etc.)
- Architecture style if applicable
- Season/time of day atmosphere

2. LIGHTING CONDITIONS (CRITICAL):
- Main light source direction (left, right, above, behind, front)
- Light type (natural sunlight, golden hour, overcast, artificial, mixed)
- Light intensity (bright, moderate, dim, dramatic)
- Color temperature (warm/orange tones, cool/blue tones, neutral)
- Shadow characteristics (harsh/defined, soft/diffused, minimal)
- Any specific light effects (rim light, backlight, spotlight areas)

3. COLOR PALETTE:
- Dominant colors in the scene
- Overall mood (warm, cool, neutral, vibrant, muted)
- Any color casts affecting the entire image

4. PERSPECTIVE & COMPOSITION:
- Camera angle (eye level, low angle, high angle)
- Depth of scene (shallow, deep, layered)
- Available space for placing a person
- Best position for a model (left, center, right, foreground, midground)

5. ATMOSPHERE & MOOD:
- Overall feeling (elegant, casual, urban, nature, romantic, modern, vintage)
- Energy level (calm, dynamic, sophisticated)

6. TECHNICAL NOTES FOR INTEGRATION:
- Exposure level of the scene
- Contrast level
- Any lens effects (bokeh, vignette)
- Ground/floor characteristics for feet placement

Respond ONLY with the analysis, no additional commentary. Be very specific about lighting direction and color temperature as these are crucial for realistic integration.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{
                role: "user",
                parts: [
                    {
                        inlineData: {
                            mimeType: sceneMimeType,
                            data: sceneBase64
                        }
                    },
                    { text: analysisPrompt }
                ]
            }],
            config: {
                safetySettings: SAFETY_SETTINGS as any,
            }
        });

        const analysisText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
        return analysisText || "";
    } catch (error) {
        console.error("Scene analysis error:", error);
        return "";
    }
};

const getScenePlacementPrompt = (settings: ScenePlacementSettings, sceneAnalysis?: string): string => {
    const preserveItems: string[] = [];

    if (settings.preserveClothing) {
        preserveItems.push('CLOTHING & ACCESSORIES (exact garments, colors, textures, patterns, all accessories)');
    }
    if (settings.preserveFace) {
        preserveItems.push('FACE (exact facial features, expression, makeup if any)');
    }
    if (settings.preserveHair) {
        preserveItems.push('HAIR (exact hairstyle, color, texture)');
    }

    const hasPoseInstruction = settings.poseInstruction && settings.poseInstruction.trim().length > 0;

    // Sahne analizi varsa, bunu prompt'a ekle
    const sceneAnalysisSection = sceneAnalysis ? `
📊📊📊 PRE-ANALYZED SCENE DETAILS (USE THIS FOR PERFECT INTEGRATION) 📊📊📊

The following is a detailed analysis of Image 2 (the target scene).
YOU MUST use this information to perfectly integrate the model:

${sceneAnalysis}

⚠️ CRITICAL: Apply ALL the lighting conditions, color temperatures, shadow directions,
and atmosphere details from this analysis to the model. The model must look like
they were ACTUALLY photographed in this exact scene with these exact conditions.
📊📊📊 END OF SCENE ANALYSIS 📊📊📊

` : '';

    return `
🎯 SCENE PLACEMENT - PLACE MODEL INTO SCENE
${sceneAnalysisSection}
You are given TWO images:

📷 IMAGE 1 - SOURCE MODEL (MANKEN):
This is the person you must place into the scene. Preserve their identity, clothing, and accessories exactly.
IMPORTANT: Only items visible in THIS image should appear in the output.

📷 IMAGE 2 - TARGET SCENE (SAHNE):
This is the background/environment where you must place the Source Model.
IMPORTANT: Use ONLY the scene/background from this image. Do NOT copy any people, clothing, or accessories.

🎨 YOUR TASK:
Place the SOURCE MODEL from Image 1 INTO the SCENE from Image 2.
${hasPoseInstruction ? `
📌 USER'S POSE INSTRUCTION:
"${settings.poseInstruction}"
Follow this instruction for how the model should be positioned/posed in the scene.
` : `
📌 AUTOMATIC POSE SELECTION:
Since no specific pose was requested, analyze the scene and choose the MOST NATURAL and APPROPRIATE pose.
Consider:
- The environment (indoor/outdoor, formal/casual)
- Available space and furniture
- What would look natural in this setting
- Professional fashion photography standards
`}

🔒 MUST PRESERVE FROM SOURCE MODEL (IMAGE 1):
${preserveItems.map(item => `• ${item}`).join('\n')}

🚨🚨🚨 CRITICAL RULES 🚨🚨🚨
- ONLY use the Source Model's clothing and accessories
- Do NOT add ANY item that is not in Image 1
- Do NOT copy any person, clothing, or object from the scene image
- The scene image provides ONLY the background/environment
- If there are people in the scene image, IGNORE them completely
- Place the Source Model naturally into the empty scene

${settings.preserveClothing ? `
👗 CLOTHING & ACCESSORIES RULES (CRITICAL):
- The SOURCE MODEL's clothing MUST appear EXACTLY as in Image 1
- Preserve ALL clothing details: color, pattern, texture, fit, style
- Adapt clothes naturally to the new pose
- ONLY include accessories that are VISIBLE in Image 1
- Do NOT add any new accessories, bags, hats, jewelry, etc.
- What you see in Image 1 is what appears in output - nothing more, nothing less
` : ''}

${settings.preserveFace ? `
👤 FACE PRESERVATION RULES:
- The face MUST be from the SOURCE MODEL (Image 1)
- Preserve exact facial features: eyes, nose, lips, face shape
- Preserve skin tone from Source Model
- Expression should be natural for the scene context
` : ''}

${settings.preserveHair ? `
💇 HAIR PRESERVATION RULES:
- Keep the SOURCE MODEL's hairstyle exactly
- Hair color MUST match Image 1
- Hair can move naturally based on pose/environment
` : ''}

🎬 SCENE INTEGRATION REQUIREMENTS:
- Correct perspective and scale for the environment
- The model should look like they belong in the scene
- Professional fashion photography quality

🚨 REALISM PRIORITY #1: LIGHTING MATCH 🚨
Before anything else, analyze the scene's lighting:
- Is the scene DARK/DIM? → Model must be EQUALLY dark
- Is the scene warm-toned? → Model must have warm color cast
- Where are shadows in the scene? → Model shadows must match
THE MODEL MUST NOT BE BRIGHTER THAN THE SCENE - THIS IS THE MOST COMMON ERROR!

💡💡💡 LIGHTING ADAPTATION (MOST IMPORTANT FOR REALISM) 💡💡💡
The model MUST match the scene's lighting perfectly:

1. ANALYZE THE SCENE LIGHTING:
   - Light source direction (sun position, windows, lamps)
   - Light type (harsh sunlight, soft cloudy, indoor ambient, studio)
   - Color temperature (warm sunset=orange, cool shade=blue, neutral=white)
   - Shadow intensity (strong shadows vs soft shadows)

2. APPLY TO THE MODEL:
   - Shadows on face/body MUST come from the same direction as scene
   - If sun is on the left → model's right side has shadows
   - If light is from above → shadows under chin, nose, eyebrows
   - Highlights must appear where scene light would naturally hit

3. COLOR TEMPERATURE MATCHING:
   - Golden hour scene → model has warm golden skin tones
   - Blue hour/shade → model has cooler tones
   - Indoor warm lights → model has warm ambient color
   - Overcast day → neutral, soft lighting on model

4. SHADOW MATCHING:
   - Harsh midday sun → strong, defined shadows on model
   - Soft diffused light → gentle, soft shadows on model
   - Model's shadow on ground must match scene's shadow direction

5. NO "PASTED ON" LOOK:
   - Model must appear to be ACTUALLY photographed in that location
   - Lighting must be seamless - no mismatched shadows or highlights
   - Skin reflections should match environmental lighting

6. ABSOLUTELY NO ARTIFICIAL GLOW - CRITICAL ERROR TO AVOID

   ⚠️ THE #1 PROBLEM: Model looks "PASTED" because it's TOO BRIGHT for the scene!

   MANDATORY RULES:
   - The model's BRIGHTNESS/EXPOSURE must EXACTLY match the scene
   - If the scene is DARK/DIM → the model must ALSO be DARK/DIM
   - If scene has warm wooden interior with soft lighting → model is NOT brightly lit
   - NEVER make the model brighter than the brightest part of the scene
   - The model should be DARKER than you think - err on the side of too dark

   SPECIFIC PROHIBITIONS:
   - ❌ NO studio flash look - this is ambient light photography
   - ❌ NO over-exposed skin highlights
   - ❌ NO glossy/shiny skin - skin must be MATTE
   - ❌ NO HDR-style brightening
   - ❌ NO spotlight effect on model
   - ❌ NO "glowing" clothes or face
   - ❌ NO visible "cutout edge" or halo around model

   HOW TO CHECK:
   - Compare model brightness to nearby objects (walls, furniture)
   - Model should have SAME exposure as those objects
   - If wall is dark → model face should be similarly dark
   - If room is dimly lit → model clothes should be dimly lit

   CORRECT APPROACH:
   - REDUCE model brightness to match scene ambient light
   - ADD shadows to model that match scene shadows
   - DESATURATE model slightly if scene is muted
   - MATCH the scene's contrast level (low contrast scene = low contrast model)
   - ADD environmental color cast to model (warm room = warm skin tones)

   🔴 IF THE MODEL "POPS OUT" OR LOOKS "PASTED" = YOU FAILED
   🟢 IF THE MODEL BLENDS SEAMLESSLY WITH SCENE LIGHTING = SUCCESS

🚨🚨🚨 SCALE & PROPORTION - #1 PRIORITY - READ CAREFULLY 🚨🚨🚨
THE MODEL SIZE MUST BE DETERMINED BY THE SCENE - NOT BY THE SOURCE IMAGE!

⚠️ COMMON MISTAKE: Making the model TOO TALL / TOO BIG for the scene
⚠️ YOU MUST RESIZE THE MODEL TO FIT THE SCENE REALISTICALLY

STEP 1 - ANALYZE THE SCENE (Image 2) FOR SCALE:
Before placing the model, MEASURE the scene using these references:
- DOORS: A human is about 80-85% the height of a standard door (not taller!)
- CHAIRS: A human's hip is at chair seat height when standing
- CARS: A human is roughly the height of a car (not taller than the roof)
- WINDOWS: Standard windows are at human eye level
- STAIRS: Each step is about 18cm - use this to calculate human height
- OTHER PEOPLE in scene: Match their size exactly

STEP 2 - RESIZE THE MODEL TO FIT:
- The model from Image 1 must be SCALED DOWN or UP to match scene proportions
- Do NOT use the model's original size from Image 1
- CALCULATE the correct size based on scene references
- A 175cm person next to a 200cm door = person is 87.5% of door height

STEP 3 - COMMON SCALE RATIOS:
- Human height ≈ 3.5 × door width
- Human height ≈ 4 × chair seat height from ground
- Human height ≈ 7.5 × human head height
- Human eye level ≈ 90% of total height

STEP 4 - PERSPECTIVE MATCHING:
- Match the camera angle of the scene EXACTLY
- If scene is shot from below → model appears from below angle
- If scene is shot from above → model appears from above angle
- Vanishing points and horizon line must align with the scene
- The model's feet must be ON the ground plane of the scene

STEP 5 - FINAL CHECK:
❌ If model looks like a GIANT → WRONG, make smaller
❌ If model's head is above door frames → WRONG, make smaller
❌ If model towers over furniture → WRONG, make smaller
❌ If model looks "pasted on" → WRONG, adjust scale and perspective
✅ Model should look like they were PHOTOGRAPHED in that exact location

🔴🔴🔴 CRITICAL - MODEL MUST BELONG TO THE SCENE 🔴🔴🔴
THE #1 PROBLEM TO AVOID: Model looking "pasted on" or TOO BIG

MANDATORY CHECKS BEFORE OUTPUT:
✓ Is the model the CORRECT SIZE compared to doors/furniture/objects in scene?
✓ Does the model's lighting match the scene? (same direction, same intensity)
✓ Is the model's skin tone affected by the scene's color temperature?
✓ Does the model have appropriate shadows for this scene?
✓ Are the model's feet properly grounded on the floor?
✓ Does the model look like they were ACTUALLY photographed here?

IF THE MODEL LOOKS TOO BIG = REGENERATE WITH SMALLER MODEL SIZE

IF THE MODEL LOOKS:
- Too bright → WRONG, reduce brightness to match scene
- Too shiny/glossy → WRONG, make skin matte and natural
- Like they have a spotlight → WRONG, match ambient lighting
- Out of place → WRONG, adjust lighting and scale
- "Patlıyor" / Standing out → WRONG, blend with scene exposure
- Like a studio photo → WRONG, match ambient/natural lighting

🔴 BRIGHTNESS TEST:
Look at a dark area of the scene (wall, floor, shadow).
Now look at the model - is the model brighter than that dark area SHOULD allow?
If YES → THE MODEL IS TOO BRIGHT → REDUCE EXPOSURE ON MODEL

THE MODEL MUST LOOK NATURAL, NOT ARTIFICIALLY ADDED.
THE MODEL MUST BE DIMLY LIT IF THE SCENE IS DIMLY LIT.

⚠️ QUALITY RULES:
- Output must be photorealistic, professional quality
- NO anatomical errors (correct number of fingers, limbs)
- Natural skin texture, not plastic or waxy
- Seamless integration into the scene
- Clothing should drape naturally
- NO artifacts or distortions

❌ ABSOLUTE PROHIBITIONS:
- DO NOT add ANY item not in Source Model image
- DO NOT use people/clothing from the scene image
- DO NOT change Source Model's clothing or accessories
- DO NOT add bags, hats, jewelry not in Source Model
- DO NOT alter Source Model's identity

✅ OUTPUT:
A single, high-quality photograph showing the SOURCE MODEL from Image 1,
naturally placed in the SCENE from Image 2, wearing ONLY their original
clothes and accessories, in ${hasPoseInstruction ? 'the requested pose' : 'a naturally chosen pose'}.
`;
};

export const generateScenePlacement = async (
    sourceModelImage: File,
    sceneImage: File,
    settings: ScenePlacementSettings,
    onProgress?: (message: string) => void
): Promise<ScenePlacementResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = "gemini-3-pro-image-preview";

        onProgress?.("🎬 Sahneye yerleştirme hazırlanıyor...");

        // Process the source model image
        onProgress?.("👗 Kaynak manken işleniyor...");
        const sourceData = await processImageForGemini(sourceModelImage, 2048, 0.95);

        // Process the scene image
        onProgress?.("🏞️ Sahne işleniyor...");
        const sceneData = await processImageForGemini(sceneImage, 2048, 0.95);

        // 📊 SAHNE ANALİZİ - Sahneyi detaylı analiz et
        onProgress?.("🔍 Sahne analiz ediliyor (ışık, renk, perspektif)...");
        const sceneAnalysis = await analyzeSceneImage(sceneData.base64, sceneData.mimeType);
        console.log("Scene Analysis Result:", sceneAnalysis ? "✅ Received" : "⚠️ Empty");

        onProgress?.("🎨 Manken sahneye yerleştiriliyor...");

        // Build the prompt with scene analysis
        let prompt = getScenePlacementPrompt(settings, sceneAnalysis);

        // 🐾 Hayvan ekleme
        if (settings.animal && settings.animal.enabled) {
            onProgress?.("🐾 Hayvan arkadaş ekleniyor...");
            prompt += buildAnimalPromptAddition(settings.animal);
        }

        console.log(`Generating Scene Placement${settings.animal?.enabled ? ' (with animal companion)' : ''}`);

        // Build parts array - Source Model FIRST, then Scene
        const parts: any[] = [
            {
                inlineData: {
                    mimeType: sourceData.mimeType,
                    data: sourceData.base64
                }
            },
            {
                inlineData: {
                    mimeType: sceneData.mimeType,
                    data: sceneData.base64
                }
            },
            { text: prompt }
        ];

        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts }],
            config: {
                responseModalities: ["image", "text"],
                safetySettings: SAFETY_SETTINGS as any,
            }
        });

        onProgress?.("✨ Görsel oluşturuldu, işleniyor...");

        // Extract the image from response
        const candidates = response?.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData) {
                        const imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        return {
                            imageData,
                            aiModel: modelName
                        };
                    }
                }
            }
        }

        throw new Error("Görsel oluşturulamadı.");
    } catch (error: any) {
        console.error("Scene Placement error:", error);
        throw new Error(error.message || "Sahneye yerleştirme sırasında bir hata oluştu.");
    }
};

export const generateMultipleScenePlacements = async (
    sourceModelImage: File,
    sceneImage: File,
    settings: ScenePlacementSettings,
    onProgress?: (message: string, current: number, total: number) => void
): Promise<ScenePlacementResult[]> => {
    const total = settings.numberOfImages;
    const results: ScenePlacementResult[] = [];

    for (let i = 0; i < total; i++) {
        onProgress?.(`Görsel ${i + 1}/${total} oluşturuluyor...`, i + 1, total);

        try {
            const result = await generateScenePlacement(
                sourceModelImage,
                sceneImage,
                settings,
                (msg) => onProgress?.(msg, i + 1, total)
            );
            results.push(result);

            // Rate limiting
            if (i < total - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`Görsel ${i + 1} oluşturulurken hata:`, error);
        }
    }

    if (results.length === 0) {
        throw new Error("Hiçbir sahneye yerleştirme görseli oluşturulamadı.");
    }

    return results;
};

// Sahneye yerleştirme prompt önizleme fonksiyonu
export const buildScenePlacementPromptPreview = (
    settings: ScenePlacementSettings
): string => {
    let prompt = getScenePlacementPrompt(settings);

    // 🐾 Hayvan ekleme
    if (settings.animal && settings.animal.enabled) {
        prompt += buildAnimalPromptAddition(settings.animal);
    }

    return prompt;
};

// =============================================================================
// PRESET PRODUCTION - HAZIR SAHNE ÜRETİMİ
// =============================================================================

export interface PresetProductionResult {
    imageData: string;
    aiModel: string;
    presetId: string;
    presetName: string;
}

import { BackgroundPreset, BACKGROUND_PRESETS, PresetProductionSettings } from '../types';

// Cilt tonu açıklamaları - Preset için
const PRESET_SKIN_TONE_DESCRIPTIONS: Record<string, string> = {
    'very-light': 'very fair/pale Caucasian skin with pink undertones',
    'light': 'light Caucasian skin with natural undertones',
    'medium-light': 'light olive or Mediterranean skin tone',
    'medium': 'medium olive or tan skin tone',
    'medium-dark': 'medium-dark brown skin tone',
    'dark': 'dark brown skin tone',
    'very-dark': 'deep dark brown/ebony skin tone'
};

// Poz açıklamaları - Detaylı talimatlar
const PRESET_POSE_DESCRIPTIONS: Record<string, string> = {
    'natural': `NATURAL STANDING POSE:
- Body position: Standing upright with feet shoulder-width apart
- Weight distribution: Slightly more weight on one leg for natural asymmetry
- Arms: One hand relaxed at side, other hand lightly in pocket or touching belt
- Shoulders: Relaxed, not tensed, slightly back for good posture
- Head: Chin slightly up, looking toward camera or slightly off-camera
- Expression: Calm, confident, slight natural smile or neutral
- Hands: Fingers naturally relaxed, not stiff or spread
- Overall: Approachable, professional, like a catalog model`,

    'confident': `CONFIDENT POWER STANCE:
- Body position: Standing tall and straight, chest out, feet firmly planted
- Weight distribution: Evenly distributed, grounded stance
- Arms: Both hands visible - one in pocket, other at side or adjusting jacket/cuff
- Shoulders: Pulled back, open chest posture showing confidence
- Head: Chin level, direct eye contact with camera
- Expression: Strong, determined, slight intensity in eyes
- Hands: Strong but relaxed grip if holding something, otherwise naturally positioned
- Overall: CEO/executive presence, authoritative and commanding`,

    'casual': `CASUAL RELAXED POSE:
- Body position: Slightly relaxed stance, one leg bent, hip shifted
- Weight distribution: 70% weight on one leg, creating S-curve in body
- Arms: Relaxed, possibly both hands in pockets or one hand touching hair/neck
- Shoulders: Natural, slightly asymmetric, relaxed drop
- Head: Slight tilt, looking at camera with friendly expression
- Expression: Warm, approachable, genuine slight smile
- Hands: Casual placement, thumbs may hook in pockets
- Overall: Like chatting with a friend, effortlessly cool`,

    'editorial': `HIGH FASHION EDITORIAL POSE:
- Body position: Dramatic angular stance, strong silhouette
- Weight distribution: Exaggerated weight shift creating dynamic lines
- Arms: Artistic placement - could be crossed, on hips, or creating interesting shapes
- Shoulders: One higher than other, creating visual tension
- Head: Strong angle, profile or 3/4 view, chin defined
- Expression: Intense, mysterious, "model stare" - not smiling
- Hands: Deliberate artistic positioning, may frame face or create geometric shapes
- Overall: Magazine cover worthy, artistic, avant-garde`,

    'walking': `WALKING/MOVEMENT POSE:
- Body position: Mid-stride, one foot forward, capturing motion
- Weight distribution: Transitioning between feet, dynamic balance
- Arms: Natural swing, opposite arm forward from leading leg
- Shoulders: Slight rotation following the walking motion
- Head: Looking forward in direction of walk or toward camera
- Expression: Purposeful, determined, natural walking expression
- Hands: Natural walking position, fingers slightly curved
- Overall: Dynamic energy, like walking down a runway or street`,

    'sitting': `ELEGANT SEATED POSE:
- Body position: Seated on invisible chair/surface, back straight, legs positioned elegantly
- Weight distribution: Balanced on seat, feet flat or one leg crossed
- Arms: Hands resting on thighs, one arm on armrest, or hands clasped
- Shoulders: Open, good posture even while seated
- Head: Upright, engaging with camera
- Expression: Refined, sophisticated, relaxed confidence
- Hands: Gracefully placed, not gripping or tense
- Overall: Executive in a meeting, elegant and polished`,

    'leaning': `CASUAL LEANING POSE:
- Body position: Body angled, leaning against invisible wall/surface
- Weight distribution: Most weight on the surface being leaned against
- Arms: One or both arms relaxed, possibly crossed or one hand in pocket
- Shoulders: Relaxed, following the lean angle
- Head: Tilted slightly, casual regard toward camera
- Expression: Cool, nonchalant, effortlessly stylish
- Hands: Relaxed, may be in pockets or arms crossed over chest
- Overall: James Dean vibes, relaxed cool attitude`
};

// Kıyafet + Manken tabanlı preset prompt fonksiyonu
const getPresetProductionPrompt = (
    preset: BackgroundPreset,
    settings: PresetProductionSettings,
    clothingCount: number = 1,
    useCustomModel: boolean = false
): string => {
    const skinToneDesc = PRESET_SKIN_TONE_DESCRIPTIONS[settings.skinTone] || PRESET_SKIN_TONE_DESCRIPTIONS['medium'];
    const poseDesc = PRESET_POSE_DESCRIPTIONS[settings.poseStyle] || PRESET_POSE_DESCRIPTIONS['natural'];

    const clothingInstructions = clothingCount > 1
        ? `You are given ${clothingCount} CLOTHING/PRODUCT images. The model must wear ALL of these items together as a complete outfit.
   - Combine all clothing items into one cohesive, stylish outfit
   - Each image shows a different piece of the outfit`
        : `You are given ONE clothing/product image. The model must wear this exact item.`;

    const modelInstructions = useCustomModel
        ? `👤 MODEL (USE PROVIDED MODEL IMAGE):
The FIRST image is the model/manken reference. COPY THIS PERSON EXACTLY:
- Copy the EXACT face, facial features, hair, and body type
- Preserve the model's identity perfectly
- Only change the clothing - the model wears the provided clothing items
- Keep the same person but in the selected scene`
        : `👤 MODEL CREATION (GENERATE FROM SCRATCH):
Create a NEW male model with these characteristics:
- Skin tone: ${skinToneDesc}
- Age: Late 20s to early 30s, mature and refined
- Body type: Athletic, well-proportioned, fashion model physique
- Facial features: Handsome, symmetrical, photogenic
- Expression: Confident but approachable, slight natural smile or neutral
- Hair: Well-groomed, stylish men's haircut appropriate for fashion
- Pose: ${poseDesc}`;

    const imageOrderNote = useCustomModel
        ? `📸 IMAGE ORDER:
- FIRST IMAGE: Model/Manken reference (copy this person exactly)
- FOLLOWING ${clothingCount} IMAGE(S): Clothing items to wear`
        : `📸 IMAGE ORDER:
- ALL ${clothingCount} IMAGE(S): Clothing items for the model to wear`;

    // Aspect ratio açıklaması
    const aspectRatioDesc = {
        '3:4': 'vertical portrait format (3:4 ratio) - taller than wide, ideal for e-commerce',
        '2:3': 'vertical portrait format (2:3 ratio) - classic portrait orientation',
        '4:5': 'vertical format (4:5 ratio) - Instagram portrait',
        '1:1': 'square format (1:1 ratio) - equal width and height',
        '9:16': 'vertical story format (9:16 ratio) - very tall, phone screen ratio'
    }[settings.aspectRatio] || 'vertical portrait format (3:4 ratio)';

    // Kamera açısı açıklaması
    const cameraAngleDesc = {
        'eye-level': 'EYE LEVEL camera angle - camera positioned at model\'s eye height, straight-on perspective. Most natural and flattering angle for fashion photography.',
        'slight-low': 'SLIGHTLY LOW camera angle - camera positioned slightly below eye level, looking up about 10-15 degrees. Makes model appear confident and powerful.',
        'slight-high': 'SLIGHTLY HIGH camera angle - camera positioned slightly above eye level, looking down about 10-15 degrees. Creates elegant, slimming effect.',
        'low-angle': 'LOW ANGLE camera - camera positioned near ground level, looking up at model. Dramatic, makes model appear tall and dominant.',
        'high-angle': 'HIGH ANGLE camera - camera positioned above model, looking down. Editorial, artistic perspective.'
    }[settings.cameraAngle] || 'EYE LEVEL camera angle - camera positioned at model\'s eye height';

    return `
🎯 HAZIR SAHNE ÜRETİMİ - ${useCustomModel ? 'KENDI MANKEN + KIYAFET' : 'KIYAFETTEN MODEL OLUŞTURMA'}

📐 IMAGE FORMAT: Generate image in ${aspectRatioDesc}. This is CRITICAL - the output MUST be in ${settings.aspectRatio} aspect ratio.

📷 CAMERA ANGLE (CRITICAL): ${cameraAngleDesc}

${imageOrderNote}

📷 CLOTHING:
${clothingInstructions}

${modelInstructions}

🎨 BACKGROUND SCENE (GENERATE THIS EXACT SETTING):
${preset.prompt}

❌ AVOID IN BACKGROUND:
${preset.negativePrompt}

🔒 CRITICAL CLOTHING RULES:
• The model MUST wear the EXACT clothing from the provided image(s)
• Preserve EVERY detail: color, texture, pattern, buttons, zippers, logos
• Clothing fit should be perfect - tailored to the model's body
• Show the clothing clearly - this is a fashion photograph
• If multiple items provided, combine them naturally as an outfit
• Add appropriate footwear that complements the outfit if not provided

🎬 GENERATION REQUIREMENTS:

1. UNIFIED CREATION:
   - Generate model AND background as ONE cohesive image
   - Model should look NATIVE to this environment
   - No "pasted on" appearance - everything generated together
   - Style: ${preset.generationSettings.style.join(', ')}
   ${useCustomModel ? '- PRESERVE THE MODEL\'S IDENTITY FROM REFERENCE IMAGE' : ''}

2. LIGHTING CONSISTENCY:
   - Single unified lighting across model and background
   - Model's shadows must match the scene's light direction
   - Color temperature consistent throughout
   - Natural ambient occlusion and contact shadows
   - ADD CONTACT SHADOW under feet (strength: 55%, blur: 18px, opacity: 55%)

3. NATURAL INTEGRATION:
   - Model positioned naturally within the space
   - Proper scale relative to environment
   - Feet properly grounded with soft contact shadow
   - Perspective matches the scene

4. SKIN & TEXTURE QUALITY:
   - MATTE natural skin - NO waxy or glossy appearance
   - Realistic skin texture with natural pores
   - NO artificial glow or HDR look
   - Subdued, realistic skin tones
   - Reduce specular/glossy shine (specular suppress: 35%, highlights rolloff: 25%)

5. FASHION PHOTOGRAPHY QUALITY:
   - Professional editorial fashion photograph
   - Sharp focus on the clothing and model
   - Slight background blur (f/2.8 depth of field)
   - Magazine cover quality

📐 COMPOSITION RULES (ABSOLUTELY CRITICAL):

⚠️⚠️⚠️ SCALE WARNING - MODEL MUST BE SMALL ⚠️⚠️⚠️
DO NOT make the model fill the frame! The model must appear SMALL!
Target: Model = 35-45% of frame height (MAXIMUM 45%)
Think "room with a person" NOT "person with room behind"

🎯 SUBJECT POSITIONING:
- Subject anchor: FEET ON FLOOR - feet must appear firmly planted on the ground
- Horizontal position: Subject centered (x: ~50% of frame)
- Vertical position: Feet at about 85% of frame height (NOT at the very bottom)
- Subject should be in MIDGROUND layer - standing IN the room, not in front of it

📏 SUBJECT SCALE (THIS IS THE MOST IMPORTANT RULE):
- Target height: Model should occupy ONLY 35-45% of canvas height
- MAXIMUM allowed: 45% of canvas height - NEVER exceed this!
- The model must appear SMALL relative to the room/environment
- Camera appears to be positioned 7-8 meters away from subject
- There must be SIGNIFICANT empty space:
  * At least 15-20% headroom (space above the head)
  * At least 10% footroom (space below the feet)
  * Visible room/environment on both sides
- If you think the model looks correct, MAKE IT 20% SMALLER

6. FRAMING & CAMERA DISTANCE (CRITICAL):
   - WIDE SHOT - not medium shot, not close-up
   - FULL BODY shot - model must be visible from head to toe completely
   - Model should occupy ONLY 35-45% of frame height
   - Leave LOTS of HEADROOM (15-20% above head) and FOOTROOM (10% below feet)
   - Show the ENVIRONMENT/BACKGROUND clearly around the model
   - Camera distance: FAR from subject (7-8 meters)
   - The room should be the dominant element, person is secondary
   - Visible floor/ground and ceiling/sky areas

✅ POSITIVE REQUIREMENTS:
- Model height = 35-45% of frame height ONLY
- LOTS of visible background/room around the model
- At least 15% headroom above the head
- Camera appears to be far away (7-8 meters)
- Model looks naturally sized for a real room
- The scene looks like an interior design photo with a person, not a portrait
- Feet are fully visible and firmly placed on the floor surface

❌ NEGATIVE - ABSOLUTELY FORBIDDEN:
- MODEL FILLING MORE THAN 45% OF FRAME HEIGHT (this is the #1 error!)
- Model's head near the top edge of the frame
- Model's feet at the very bottom edge
- Oversized person / giant body / model too large
- Close-up framing / medium shot
- Model too close to camera
- Portrait-style framing where person dominates
- Fisheye distortion on subject
- Floating feet / no ground contact
- Glossy plastic shine on skin or clothes
- Overexposed highlights
- Incorrect shadows or mismatched lighting
- Model appearing pasted or cut-out

🚨 QUALITY REQUIREMENTS:
- Photorealistic, 8K ultra detailed
- Professional fashion photography
- NO anatomical errors (correct hands, proportions)
- Clothing details must be EXACT match to source
${useCustomModel ? '- Model identity MUST match the provided reference exactly' : ''}
- Natural, believable result

✅ OUTPUT:
A WIDE SHOT fashion photograph of ${useCustomModel ? 'the provided model' : 'a newly generated male model'} wearing the exact provided clothing, naturally positioned in the ${preset.name} setting.

CRITICAL SCALE CHECK:
- Model height = 35-45% of frame (SMALL, not filling the frame)
- Visible headroom above (15-20% of frame)
- Visible footroom below (10% of frame)
- Room/background clearly visible and dominant
- Camera appears to be 7-8 meters away

The result must look like an interior/architectural photo with a person in it - NOT a portrait or close-up fashion shot.
`;
};

// Özel arka plan prompt oluşturma fonksiyonu - PNG Composite Pipeline v1
const getCustomBackgroundPrompt = (
    settings: PresetProductionSettings,
    clothingCount: number = 1,
    useCustomModel: boolean = false
): string => {
    const skinToneDesc = PRESET_SKIN_TONE_DESCRIPTIONS[settings.skinTone] || PRESET_SKIN_TONE_DESCRIPTIONS['medium'];
    const poseDesc = PRESET_POSE_DESCRIPTIONS[settings.poseStyle] || PRESET_POSE_DESCRIPTIONS['natural'];

    // Model boyutu/kamera uzaklığı ayarları - DAHA KÜÇÜK DEĞERLER
    const modelScaleConfig = {
        'close': { scaleRange: '40-50%', maxScale: '50%', cameraDistance: '4-5', headroom: '15-20%', footroom: '8%', smallnessNote: 'medium-close shot' },
        'medium': { scaleRange: '30-40%', maxScale: '40%', cameraDistance: '6-7', headroom: '20-25%', footroom: '10%', smallnessNote: 'standard full-body' },
        'far': { scaleRange: '22-30%', maxScale: '30%', cameraDistance: '8-10', headroom: '25-30%', footroom: '12%', smallnessNote: 'SMALL in the scene' },
        'very-far': { scaleRange: '15-22%', maxScale: '22%', cameraDistance: '12-15', headroom: '30-35%', footroom: '15%', smallnessNote: 'VERY SMALL, environmental shot' }
    }[settings.modelScale] || { scaleRange: '30-40%', maxScale: '40%', cameraDistance: '6-7', headroom: '20-25%', footroom: '10%', smallnessNote: 'standard full-body' };

    const aspectRatioDesc = {
        '3:4': 'portrait orientation (3:4 aspect ratio, 1024x1536) - ideal for e-commerce product display',
        '2:3': 'portrait orientation (2:3 aspect ratio) - tall, elegant proportions',
        '1:1': 'square format (1:1 aspect ratio) - perfect for social media',
        '4:5': 'portrait orientation (4:5 aspect ratio) - Instagram-style format',
        '9:16': 'vertical/mobile format (9:16 aspect ratio) - full-length display'
    }[settings.aspectRatio] || 'portrait orientation (3:4 aspect ratio)';

    const cameraAngleDesc = {
        'eye-level': 'EYE LEVEL camera angle - camera positioned at model\'s eye height, natural perspective',
        'slight-low': 'SLIGHTLY LOW camera angle (15-20 degrees below eye level) - powerful, dominant presence',
        'slight-high': 'SLIGHTLY HIGH camera angle (15-20 degrees above eye level) - elegant, refined appearance',
        'low-angle': 'LOW ANGLE camera (30-45 degrees from ground) - dramatic, heroic perspective',
        'high-angle': 'HIGH ANGLE camera (30-45 degrees from above) - editorial, artistic perspective'
    }[settings.cameraAngle] || 'EYE LEVEL camera angle';

    const clothingInstruction = clothingCount > 1
        ? `CLOTHING ITEMS (${clothingCount} pieces provided):
The model should wear ALL ${clothingCount} provided clothing items together as a coordinated outfit.
- Combine all pieces naturally (e.g., if shirt + pants provided, model wears both)
- Each clothing item should be clearly visible
- The outfit should look cohesive and intentionally styled`
        : `CLOTHING ITEM:
The model should wear the provided clothing item exactly as shown.
- Preserve exact pattern, texture, color, and design details
- The garment should fit naturally on the model's body`;

    const modelInstruction = useCustomModel
        ? `🚨🚨🚨 CRITICAL - USE THE PROVIDED MANNEQUIN/MODEL IMAGE 🚨🚨🚨

⚠️ A REFERENCE MODEL/MANNEQUIN IMAGE HAS BEEN PROVIDED AS THE SECOND IMAGE ⚠️

DO NOT generate a random/AI-generated model. The user has uploaded a SPECIFIC PERSON's photo.

MANDATORY REQUIREMENTS FOR THE PROVIDED MANNEQUIN:
1. FACE: Use the EXACT face from the mannequin image - same eyes, nose, mouth, jawline, expression
2. BODY: Use the EXACT body type, height, and proportions from the mannequin
3. SKIN: Use the EXACT skin tone from the mannequin (DO NOT change skin color)
4. HAIR: Use the EXACT hair style, color, length, and texture from the mannequin
5. IDENTITY: The person in the output MUST be 100% RECOGNIZABLE as the same person from the mannequin image
6. POSE: Position the mannequin naturally in the scene, but preserve their identity

⛔ ABSOLUTELY PROHIBITED:
- DO NOT create a new/different person
- DO NOT use a generic AI-generated model
- DO NOT change the person's face, skin tone, or body type
- DO NOT ignore the mannequin image

✅ WHAT TO DO:
- Take the EXACT person from the SECOND image (mannequin)
- Dress them in the clothing from the remaining images
- Place them naturally in the background from the FIRST image
- Apply edge feathering (1.5px) for smooth integration
- Reduce glossy/plastic shine on the model (specular suppress: 35%, highlights rolloff: 25%)`
        : `MODEL:
Generate a professional male model with the following characteristics:
- Skin tone: ${skinToneDesc}
- Age: 25-35 years old, fit physique
- Attractive, professional appearance suitable for high-end fashion
- Matte skin finish, no glossy/plastic appearance`;

    const imageOrderNote = useCustomModel
        ? `📸📸📸 IMAGE ORDER (ABSOLUTELY CRITICAL - READ CAREFULLY) 📸📸📸

⚠️ YOU HAVE RECEIVED ${2 + clothingCount} IMAGES IN THIS EXACT ORDER:

1️⃣ FIRST IMAGE = BACKGROUND (locked scene - DO NOT MODIFY, use as-is)
2️⃣ SECOND IMAGE = MANNEQUIN/MODEL REFERENCE (USE THIS PERSON EXACTLY - DO NOT IGNORE!)
3️⃣ REMAINING ${clothingCount} IMAGE(S) = CLOTHING ITEMS (dress the mannequin in these)

🚨 THE SECOND IMAGE IS THE MANNEQUIN - YOU MUST USE THIS EXACT PERSON! 🚨`
        : `IMAGE ORDER (CRITICAL):
1. FIRST image = Custom Background (your locked scene - DO NOT MODIFY)
2. REMAINING images = Clothing items for the AI-generated model to wear`;

    return `🎨 BACKGROUND-LOCKED MANNEQUIN COMPOSITE PIPELINE v1

⚠️⚠️⚠️ SCALE CONFIGURATION ⚠️⚠️⚠️
Target: Model occupies ${modelScaleConfig.scaleRange} of image height (MAXIMUM ${modelScaleConfig.maxScale})
The model should look like they are standing ${modelScaleConfig.cameraDistance} meters away from the camera.
The model should appear ${modelScaleConfig.smallnessNote} in the frame.
Leave ${modelScaleConfig.headroom} headroom above and ${modelScaleConfig.footroom} footroom below.

${imageOrderNote}

📋 COMPOSITE TASK:
Create a professional e-commerce fashion photograph by compositing the model/mannequin into the provided background scene:
1. BACKGROUND is LOCKED - use the provided background image EXACTLY as-is, do not modify it
2. ${useCustomModel ? 'COMPOSITE the provided mannequin/model into the scene' : 'GENERATE and composite a new professional male model into the scene'}
3. Dress the model in the provided clothing item(s)
4. MAKE THE MODEL SMALL - they should NOT fill the frame!

🖼️ BACKGROUND (LOCKED - DO NOT MODIFY):
- The background image is FIXED and must remain EXACTLY as provided
- Preserve ALL background details: lighting, atmosphere, perspective, colors
- The background defines the scene's lighting conditions and perspective
- The background should be VERY VISIBLE around the model

${modelInstruction}

${clothingInstruction}

📐 COMPOSITION RULES (CRITICAL):

🏠 SPATIAL REALISM - MODEL MUST FIT THE ROOM:
- ANALYZE the background image first: estimate room size, ceiling height, furniture scale
- The model must look like a REAL PERSON standing in that REAL ROOM
- Use furniture, doors, windows as SIZE REFERENCE - a person is roughly 3x door handle height
- If there's a sofa, the model should be about 2.5-3x sofa height
- If there's a door visible, the model should be slightly shorter than the door
- The model should look PROPORTIONALLY CORRECT to the environment
- Think: "If I took a photo of a real person in this room, how big would they appear?"

📏 SUBJECT SCALE:
- Target height: Model should occupy ${modelScaleConfig.scaleRange} of canvas height
- MAXIMUM allowed: ${modelScaleConfig.maxScale} of canvas height - do not exceed this!
- Imagine the camera is placed ${modelScaleConfig.cameraDistance} meters away from the person
- Headroom (space above head): ${modelScaleConfig.headroom}
- Footroom (space below feet): ${modelScaleConfig.footroom}
- Visible room/environment on both sides
- ⚠️ IMPORTANT: If the model looks too big compared to the room, MAKE IT SMALLER!

🎯 SUBJECT POSITIONING:
- Subject anchor: FEET ON FLOOR - feet must appear firmly planted on the ground surface
- Horizontal position: Subject centered (x: ~50% of frame width)
- Vertical position: Feet touching the floor plane naturally
- Subject should be in MIDGROUND layer - standing IN the room, not in front of it
- The model should appear to be INSIDE the room, at the correct depth

📸 CAMERA & FRAMING:
- ${cameraAngleDesc}
- FULL BODY shot - model must be visible from HEAD to FEET completely
- Camera distance: ${modelScaleConfig.cameraDistance} meters from subject
- The environment/room should be clearly visible

💡 LIGHTING MATCH (CRITICAL):
- Match background color temperature EXACTLY on the model
- The model's lighting must match the ambient lighting of the background scene
- ADD CONTACT SHADOW under the feet:
  * Shadow strength: 55%
  * Shadow blur: 18px
  * Y-offset: 6px
  * Shadow opacity: 55%
- Reduce subject shine/specular highlights to avoid glossy/plastic appearance

🔗 BLEND & INTEGRATION:
- Blend mode: Normal, subject opacity: 100%
- Apply edge smoothing (35%) for seamless integration
- Reduce color bleed at edges (25%)
- No visible seams, halos, or compositing artifacts

🎭 POSE & STYLING:
${poseDesc}

✅ POSITIVE REQUIREMENTS (MUST FOLLOW):
- Model height = ${modelScaleConfig.scaleRange} of frame height
- Visible background/room around the model
- Headroom above the head: ${modelScaleConfig.headroom}
- Camera distance: ${modelScaleConfig.cameraDistance} meters
- Feet are fully visible and firmly placed on the floor surface
- Correct floor contact and perspective alignment
- Natural, realistic integration that looks like an actual photograph

❌ NEGATIVE - FORBIDDEN:
- Model exceeding ${modelScaleConfig.maxScale} of frame height
- Oversized person / model too large for the selected scale
- Floating feet / no ground contact
- Glossy plastic shine on skin or clothes
- Incorrect shadows or mismatched lighting
- Model appearing pasted or cut-out
- Any background modification
- Cropping any part of the model (head or feet)

📐 OUTPUT FORMAT:
- ${aspectRatioDesc}
- High quality PNG output
- Background must remain 100% consistent with input
- Model size: ${modelScaleConfig.scaleRange} of frame height

✅ FINAL OUTPUT:
A fashion photograph showing ${useCustomModel ? 'THE EXACT PERSON FROM THE SECOND IMAGE (mannequin) - with their exact face, body, and features preserved' : 'a newly generated male model'} wearing the exact provided clothing, realistically composited into the locked background scene.

${useCustomModel ? `🚨 FINAL REMINDER: The person in the output MUST be the SAME PERSON from the SECOND image. If you generate a different person, the task has FAILED. 🚨` : ''}

SCALE CHECK:
- Model height = ${modelScaleConfig.scaleRange} of frame
- Headroom: ${modelScaleConfig.headroom}
- Footroom: ${modelScaleConfig.footroom}
- Camera distance: ${modelScaleConfig.cameraDistance} meters
`;
};

// Ana preset üretim fonksiyonu - KIYAFET + MANKEN TABANLI
export const generatePresetProduction = async (
    clothingImages: File[], // Birden fazla kıyafet
    presetId: string,
    settings: PresetProductionSettings,
    onProgress?: (message: string) => void,
    customModel?: File | null, // Opsiyonel manken
    customBackground?: File | null // Özel arka plan
): Promise<PresetProductionResult> => {
    try {
        const isCustomBackground = presetId === 'custom' && customBackground;

        // Preset'i bul (özel arka plan değilse)
        const preset = isCustomBackground ? null : BACKGROUND_PRESETS.find(p => p.id === presetId);
        if (!isCustomBackground && !preset) {
            throw new Error("Seçilen preset bulunamadı.");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = "gemini-3-pro-image-preview";

        const useCustomModel = customModel !== undefined && customModel !== null;
        const sceneName = isCustomBackground ? 'Özel Arka Plan' : preset!.name;
        onProgress?.(`🎨 ${sceneName} sahnesinde ${useCustomModel ? 'mankeniniz' : 'model'} oluşturuluyor...`);

        const parts: any[] = [];

        // Eğer özel arka plan varsa, önce arka plan görselini ekle
        if (isCustomBackground && customBackground) {
            onProgress?.("🖼️ Özel arka plan işleniyor...");
            const bgData = await processImageForGemini(customBackground, 2048, 0.95);
            parts.push({
                inlineData: {
                    mimeType: bgData.mimeType,
                    data: bgData.base64
                }
            });
        }

        // Eğer kendi manken kullanılacaksa, manken görselini ekle
        if (useCustomModel && customModel) {
            onProgress?.("👤 Manken görseli işleniyor...");
            const modelData = await processImageForGemini(customModel, 2048, 0.95);
            parts.push({
                inlineData: {
                    mimeType: modelData.mimeType,
                    data: modelData.base64
                }
            });
        }

        // Kıyafet görsellerini işle
        onProgress?.(`👔 ${clothingImages.length} kıyafet işleniyor...`);
        for (const clothingFile of clothingImages) {
            const clothingData = await processImageForGemini(clothingFile, 2048, 0.95);
            parts.push({
                inlineData: {
                    mimeType: clothingData.mimeType,
                    data: clothingData.base64
                }
            });
        }

        onProgress?.(`🧑 ${useCustomModel ? 'Manken' : 'Model'} ve ${sceneName} sahnesi oluşturuluyor...`);

        // Build the prompt
        const prompt = isCustomBackground
            ? getCustomBackgroundPrompt(settings, clothingImages.length, useCustomModel)
            : getPresetProductionPrompt(preset!, settings, clothingImages.length, useCustomModel);
        parts.push({ text: prompt });

        console.log(`Generating Preset Production: ${sceneName} with ${clothingImages.length} clothing items${useCustomModel ? ' + custom model' : ''}${isCustomBackground ? ' + custom background' : ''}`);

        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts }],
            config: {
                responseModalities: ["image", "text"],
                safetySettings: SAFETY_SETTINGS as any,
            }
        });

        onProgress?.("✨ Görsel oluşturuldu, işleniyor...");

        // Extract the image from response
        const candidates = response?.candidates;
        if (candidates && candidates.length > 0) {
            const responseParts = candidates[0].content?.parts;
            if (responseParts) {
                for (const part of responseParts) {
                    if (part.inlineData) {
                        const imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        return {
                            imageData,
                            aiModel: modelName,
                            presetId: isCustomBackground ? 'custom' : preset!.id,
                            presetName: sceneName
                        };
                    }
                }
            }
        }

        throw new Error("Görsel oluşturulamadı.");
    } catch (error: any) {
        console.error("Preset Production error:", error);
        throw new Error(error.message || "Hazır sahne üretimi sırasında bir hata oluştu.");
    }
};

// Çoklu preset üretimi - KIYAFET + MANKEN TABANLI
export const generateMultiplePresetProductions = async (
    clothingImages: File[], // Birden fazla kıyafet
    presetId: string,
    settings: PresetProductionSettings,
    onProgress?: (message: string, current: number, total: number) => void,
    customModel?: File | null, // Opsiyonel manken
    customBackground?: File | null // Özel arka plan
): Promise<PresetProductionResult[]> => {
    const results: PresetProductionResult[] = [];

    // Setli üretim modu - her açıdan 1 fotoğraf
    if (settings.useAngleSet) {
        const cameraAngles: Array<'eye-level' | 'slight-low' | 'slight-high' | 'low-angle' | 'high-angle'> = [
            'eye-level', 'slight-low', 'slight-high', 'low-angle', 'high-angle'
        ];
        const angleLabels: Record<string, string> = {
            'eye-level': 'Göz Hizası',
            'slight-low': 'Hafif Alt Açı',
            'slight-high': 'Hafif Üst Açı',
            'low-angle': 'Alt Açı',
            'high-angle': 'Üst Açı'
        };
        const total = cameraAngles.length;

        for (let i = 0; i < total; i++) {
            const currentAngle = cameraAngles[i];
            const angleLabel = angleLabels[currentAngle];
            onProgress?.(`${angleLabel} açısından görsel oluşturuluyor (${i + 1}/${total})...`, i + 1, total);

            try {
                // Settings'i bu açı için güncelle
                const angleSettings: PresetProductionSettings = {
                    ...settings,
                    cameraAngle: currentAngle
                };

                const result = await generatePresetProduction(
                    clothingImages,
                    presetId,
                    angleSettings,
                    (msg) => onProgress?.(`${angleLabel}: ${msg}`, i + 1, total),
                    customModel,
                    customBackground
                );
                results.push(result);

                // Rate limiting
                if (i < total - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`Preset production angle ${currentAngle} failed:`, error);
            }
        }
    } else {
        // Normal çoklu üretim modu
        const total = settings.numberOfImages;

        for (let i = 0; i < total; i++) {
            onProgress?.(`Görsel ${i + 1}/${total} oluşturuluyor...`, i + 1, total);

            try {
                const result = await generatePresetProduction(
                    clothingImages,
                    presetId,
                    settings,
                    (msg) => onProgress?.(msg, i + 1, total),
                    customModel,
                    customBackground
                );
                results.push(result);

                // Rate limiting
                if (i < total - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`Preset production ${i + 1} failed:`, error);
            }
        }
    }

    if (results.length === 0) {
        throw new Error("Hiçbir hazır sahne görseli oluşturulamadı.");
    }

    return results;
};

// Preset prompt önizleme fonksiyonu
export const buildPresetProductionPromptPreview = (
    presetId: string,
    settings: PresetProductionSettings,
    clothingCount: number = 1,
    useCustomModel: boolean = false
): string => {
    // Özel arka plan kullanılıyorsa custom prompt'u göster
    if (presetId === 'custom') {
        return getCustomBackgroundPrompt(settings, clothingCount, useCustomModel);
    }

    const preset = BACKGROUND_PRESETS.find(p => p.id === presetId);
    if (!preset) return "Preset bulunamadı.";

    return getPresetProductionPrompt(preset, settings, clothingCount, useCustomModel);
};

// =============================================================================
// ANNOTATION POSE GENERATION - For Product Annotation Mode
// =============================================================================

interface AnnotationPoseSettings {
    pose: 'front' | 'side';
    gender: 'male' | 'female';
    productType: 'top' | 'bottom' | 'fullbody' | 'outerwear';
    useWhiteBackground: boolean;
}

const getAnnotationPosePrompt = (settings: AnnotationPoseSettings): string => {
    const genderText = settings.gender === 'male' ? 'male model/man' : 'female model/woman';
    const genderTr = settings.gender === 'male' ? 'erkek' : 'kadın';

    const poseText = settings.pose === 'front'
        ? 'standing straight facing the camera directly (front view), neutral pose with arms naturally at sides'
        : 'standing in a 3/4 side angle view (side profile), body turned approximately 45-60 degrees to the side';

    const poseTr = settings.pose === 'front' ? 'düz duruş, önden görünüm' : 'yan duruş, 3/4 açı';

    let productInstruction = '';
    let bodyFrame = 'full body from head to feet';

    switch (settings.productType) {
        case 'top':
            productInstruction = `
- The model is wearing THIS EXACT garment (shirt/t-shirt/sweater/blouse) as shown in the product image
- Show from head to waist/hip level to highlight the top garment
- Pair with simple neutral pants/jeans that don't distract from the main product`;
            bodyFrame = 'from head to hip/upper thigh level';
            break;
        case 'bottom':
            productInstruction = `
- The model is wearing THIS EXACT garment (pants/trousers/skirt) as shown in the product image
- Show from waist to feet to highlight the bottom garment
- Pair with a simple neutral top that doesn't distract from the main product`;
            bodyFrame = 'from waist to feet, can include some torso';
            break;
        case 'outerwear':
            productInstruction = `
- The model is wearing THIS EXACT outerwear (jacket/coat/blazer) as shown in the product image
- Show full body or 3/4 length to display the outerwear properly
- The jacket/coat should be open or styled naturally
- Pair with simple neutral clothes underneath`;
            bodyFrame = 'full body or 3/4 length';
            break;
        case 'fullbody':
            productInstruction = `
- The model is wearing THIS EXACT outfit/garment as shown in the product image
- Show complete full body from head to feet
- Display the entire garment naturally on the model`;
            bodyFrame = 'complete full body from head to feet';
            break;
    }

    const backgroundText = settings.useWhiteBackground
        ? 'Pure white studio background (#FFFFFF), clean and professional like e-commerce product photography'
        : 'Light gray studio background, clean and professional';

    return `
🎯 PRODUCT ANNOTATION MODE - PUT GARMENT ON MODEL

You are given a PRODUCT IMAGE showing a clothing item (flat lay or on hanger).
Your task is to create a professional e-commerce photo of a ${genderText} WEARING this exact garment.

📷 INPUT: Product/garment image (the clothing item to be worn)

🎨 OUTPUT REQUIREMENTS:

👤 MODEL SPECIFICATIONS:
- Gender: ${genderText} (${genderTr})
- Age: Young adult (25-35 years old)
- Build: Athletic/fit, professional model physique
- Expression: Neutral, confident, professional
- Ethnicity: Can vary, but professional model appearance

🧍 POSE (CRITICAL):
- ${poseText}
- ${poseTr}
- Professional fashion photography pose
- Body language should be confident and natural
- NO dramatic poses, keep it commercial/catalog style

👗 GARMENT PLACEMENT:
${productInstruction}
- The garment MUST look EXACTLY like the input product image
- Preserve ALL details: color, texture, pattern, fit, design elements
- The garment should fit naturally on the model's body
- Show how the garment drapes and fits on a real person

📐 FRAMING:
- ${bodyFrame}
- Centered composition
- Professional fashion/e-commerce photography style
- Clean, undistracted view of the garment

🎨 BACKGROUND:
- ${backgroundText}
- No props, no furniture, no distractions
- Studio lighting setup

💡 LIGHTING:
- Soft, even studio lighting
- Professional fashion photography lighting
- Subtle shadows for depth
- No harsh shadows or highlights
- The garment colors should appear true to the product image

🚨 CRITICAL RULES:
1. The garment MUST be the EXACT same as the input product image
2. Do NOT change the garment's color, pattern, or design
3. Do NOT add any accessories unless they are part of the product
4. Keep the model pose natural and commercial (not editorial/artistic)
5. The focus should be on showcasing the garment, not the model
6. Output should look like professional e-commerce product photography

Generate a high-quality, photorealistic image suitable for e-commerce use.
`;
};

export const generateAnnotationPoseImage = async (
    productImage: File,
    settings: AnnotationPoseSettings
): Promise<GenerationResult> => {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const modelId = "imagen-3.0-generate-002";
    const estimatedCost = 0.04;

    // Process the product image
    const processedImage = await processImageForGemini(productImage, 1536, 0.92);

    const prompt = getAnnotationPosePrompt(settings);

    console.log('🎨 Annotation Pose Generation - Settings:', settings);
    console.log('📝 Prompt:', prompt);

    try {
        // Use Gemini to understand the product first, then generate with Imagen
        const geminiModel = ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: [{
                role: "user",
                parts: [
                    {
                        inlineData: {
                            mimeType: processedImage.mimeType,
                            data: processedImage.base64
                        }
                    },
                    {
                        text: `Analyze this clothing product image and describe it in detail for image generation. Include:
1. Type of garment (shirt, pants, jacket, dress, etc.)
2. Color(s) - be very specific
3. Pattern (solid, striped, checkered, floral, etc.)
4. Material appearance (cotton, denim, leather, knit, etc.)
5. Style details (collar type, buttons, pockets, fit style, etc.)
6. Any logos or text visible

Respond in a concise format that can be used for image generation prompts.`
                    }
                ]
            }]
        });

        const analysisResponse = await geminiModel;
        const productDescription = analysisResponse.text || 'clothing garment';

        console.log('📦 Product Analysis:', productDescription);

        // Now generate with Imagen using the product description
        const fullPrompt = `${prompt}

📦 PRODUCT DESCRIPTION (from analysis):
${productDescription}

Remember: Generate the model wearing THIS EXACT garment as described above.`;

        const response = await ai.models.generateImages({
            model: modelId,
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "3:4", // Portrait for fashion
                personGeneration: "ALLOW_ADULT"
            }
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Görsel oluşturulamadı");
        }

        const generatedImage = response.generatedImages[0];

        if (!generatedImage.image?.imageBytes) {
            throw new Error("Görsel verisi alınamadı");
        }

        return {
            imageData: generatedImage.image.imageBytes,
            aiModel: modelId,
            estimatedCost
        };

    } catch (error) {
        console.error('Annotation pose generation error:', error);

        // Fallback: Try direct generation without analysis
        try {
            console.log('🔄 Trying fallback generation...');

            const fallbackPrompt = `Professional e-commerce fashion photography:
A ${settings.gender === 'male' ? 'male' : 'female'} model wearing clothing,
${settings.pose === 'front' ? 'standing straight facing camera (front view)' : 'standing in 3/4 side angle view'},
${settings.useWhiteBackground ? 'pure white studio background' : 'light gray studio background'},
professional studio lighting, high-quality commercial photography,
clean composition, model has neutral confident expression,
${settings.productType === 'top' ? 'focus on upper body garment' :
  settings.productType === 'bottom' ? 'focus on lower body garment' :
  settings.productType === 'outerwear' ? 'wearing jacket or coat' : 'full body outfit'},
e-commerce ready, catalog style photography`;

            const fallbackResponse = await ai.models.generateImages({
                model: modelId,
                prompt: fallbackPrompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: "3:4",
                    personGeneration: "ALLOW_ADULT"
                }
            });

            if (!fallbackResponse.generatedImages || fallbackResponse.generatedImages.length === 0) {
                throw new Error("Görsel oluşturulamadı");
            }

            const fallbackImage = fallbackResponse.generatedImages[0];

            if (!fallbackImage.image?.imageBytes) {
                throw new Error("Görsel verisi alınamadı");
            }

            return {
                imageData: fallbackImage.image.imageBytes,
                aiModel: modelId,
                estimatedCost
            };

        } catch (fallbackError) {
            console.error('Fallback generation also failed:', fallbackError);
            throw new Error('Görsel oluşturulamadı. Lütfen tekrar deneyin.');
        }
    }
};

// ============================================================
// CINEMATIC PROMPT ARCHITECT - Technical AI Director
// ============================================================

export interface CinematicPromptSettings {
    cameraAngle: string;
    shotScale: string;
    lens: string;
    aspectRatio: string;
    manualDirective?: string;
}

export interface CinematicPromptResult {
    camera_override_protocol: string;
    volumetric_reconstruction: string;
    consistency_anchors: string;
    framing_boundaries: string;
    optical_physics: string;
    final_technical_prompt: string;
}

export const generateCinematicPrompt = async (
    imageFile: File,
    settings: CinematicPromptSettings
): Promise<CinematicPromptResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = "gemini-2.5-flash";

        const { base64, mimeType } = await processImageForGemini(imageFile, 1024, 0.85);

        const systemPrompt = `You are a Technical AI Director for OzWorks.ai.
GOAL: RE-RENDER the subject from a completely NEW camera position and angle.

ABSOLUTE RULES - NEVER VIOLATE:
1. CAMERA POSITION IS PHYSICAL: The camera MUST physically move to the specified angle.
   - "worms_eye" = Camera is ON THE GROUND, pointing 90° STRAIGHT UP
   - "birds_eye" = Camera is DIRECTLY ABOVE, pointing 90° STRAIGHT DOWN
   - "low_angle" = Camera is at WAIST HEIGHT, tilted UP at subject
   - "high_angle" = Camera is ABOVE HEAD, tilted DOWN at subject
   - "over_shoulder" = Camera BEHIND subject at SHOULDER-LEVEL, offset 25-35° to LEFT or RIGHT (NOT centered, NOT elevated)

2. REFERENCE IMAGE USAGE: Use for identity (face) AND EXACT CLOTHING.
   - IDENTIFY what the subject is wearing: sweater? knit? vest? jacket? t-shirt?
   - PRESERVE that EXACT clothing in output - same type, same color, same style!
   - If subject wears CREAM V-NECK SWEATER → output MUST have CREAM V-NECK SWEATER
   - If subject wears KNIT VEST → output MUST have KNIT VEST
   - ❌ NEVER replace sweater/knit with a dress shirt!
   - ❌ NEVER add striped shirt if reference has no striped shirt!
   COMPLETELY DISCARD its camera angle/framing.

3. 3D VOLUMETRIC THINKING: The subject is a 3D object in space.
   - From below: You see underside of chin, nostrils, jaw
   - From above: You see top of head, shoulders, foreshortened body
   - From side: You see profile, ear, one side of face
   - From over_shoulder (behind): You see BACK of clothing/jacket filling frame, shoulder line dominant in foreground, partial side profile (neck, ear, jawline visible), face NOT front-facing

4. DESCRIBE WHAT THE NEW CAMERA SEES:
   - What body parts are prominent from this angle?
   - What is foreshortened or hidden?
   - What is the visual hierarchy from this viewpoint?

5. LENS PHYSICS: Apply appropriate distortion/compression.

You MUST respond with ONLY a valid JSON object. No markdown, no code blocks, no explanation.

JSON SCHEMA: {
  "camera_override_protocol": "Explicit command to ABANDON the original framing and adopt the new [Angle/Scale].",
  "volumetric_reconstruction": "Description of the subject's 3D pose seen from the NEW angle (e.g. 'From below, the chin and nostrils are prominent, body tapers up').",
  "consistency_anchors": "CRITICAL: Describe the EXACT clothing (e.g. 'cream V-neck sweater over white shirt with navy tie, checked blazer, navy trousers'). Identify if it's a SWEATER, KNIT, VEST, T-SHIRT - NOT generic 'shirt'. Include face identity details. These MUST be preserved exactly!",
  "framing_boundaries": "Precise cut-off points for the new shot (e.g. 'Frame strictly cuts at knees').",
  "optical_physics": "Lens character description.",
  "final_technical_prompt": "A master directive focusing on the NEW camera position looking at the SAME subject. MUST include: 'Preserve EXACT clothing: [specific garments from reference]'."
}`;

        // Camera angle definitions for precise positioning
        const cameraAngleDefinitions: Record<string, string> = {
            // Asagidan Yukari
            "worms_eye": "SOLUCAN BAKISI: Camera on the GROUND pointing 90° STRAIGHT UP. Subject towers above. Chin, nostrils, underside of jaw prominent. Extreme dramatic effect.",
            "extreme_low": "COK ALT ACI: Camera at ankle height, tilted 60° UPWARD. Subject looks powerful and dominant. Strong foreshortening of legs.",
            "low_angle": "ALT ACI: Camera at waist/hip height, tilted 30-45° UPWARD. Subject appears heroic, confident. Chin slightly elevated in frame.",
            "slight_low": "HAFIF ALT ACI: Camera slightly below eye level, tilted 15° UPWARD. Subtle power shift. Flattering for portraits.",
            // Duz
            "eye_level": "GOZ HIZASI: Camera at EXACT eye level of subject. 0° tilt. Neutral, natural perspective. Direct eye contact possible.",
            // Yukaridan Asagi
            "slight_high": "HAFIF UST ACI: Camera slightly above eye level, tilted 15° DOWNWARD. Subject appears approachable, slightly vulnerable.",
            "high_angle": "UST ACI: Camera at head height or above, tilted 30-45° DOWNWARD. Subject appears smaller, submissive, or vulnerable.",
            "extreme_high": "COK UST ACI: Camera well above subject, tilted 60° DOWNWARD. Subject appears small, weak, or insignificant.",
            "birds_eye": "KUS BAKISI: Camera DIRECTLY ABOVE subject, pointing 90° STRAIGHT DOWN. Top of head visible. Unique graphic perspective.",
            // Ozel
            "dutch_angle": "DUTCH ANGLE: Camera tilted 15-30° to the SIDE (roll axis). Creates tension, unease, or dynamic energy. Horizon is diagonal.",
            "over_shoulder": `OMUZ USTUNDEN (ARKADAN) - OZEL PROTOKOL:
CAMERA OVERRIDE: Reject standard rear or over-the-shoulder interpretations. Camera must NOT be elevated and must NOT be centered directly behind the subject.

CAMERA POSITIONING:
- Orientation: REAR (behind the subject)
- Horizontal offset: 25-35 degrees to subject's LEFT or RIGHT (not centered)
- Vertical alignment: SHOULDER-LEVEL height (not elevated)
- Distance: Medium close

VOLUMETRIC RECONSTRUCTION:
- Camera captures the subject from BEHIND at shoulder height
- Angled slightly to reveal the SIDE PROFILE of the face
- The SHOULDER LINE is dominant in the foreground
- The BACK of the jacket/clothing occupies the majority of the frame
- The NECK, EAR, and JAWLINE are partially visible
- The FACE is NOT front-facing (only partial side profile)

FRAMING BOUNDARIES:
- Top crop: Slightly above head
- Bottom crop: Mid-back to upper torso
- Composition focus: Back texture and shoulder structure
- Face visibility: PARTIAL side profile only

OPTICAL PHYSICS:
- Lens: 50mm equivalent (natural human eye level perspective)
- Distortion: None
- Depth of field: Moderate
- Perspective rule: Natural human eye level

NEGATIVE CONSTRAINTS (MUST AVOID):
- NO bird-eye view
- NO full back symmetry (camera is offset, not centered)
- NO centered rear shot
- NO full face visibility (only partial side profile allowed)
- NO over-elevated camera position`,

            // Detay Cekimleri (E-ticaret Ozel)
            "detail_sleeve_cuff": `OZEL 1 - KOL/MANSET DETAY CEKIMI:
CAMERA POSITIONING:
- Orientation: SIDE VIEW (yandan)
- Height: Sleeve/cuff level (kol hizasi)
- Angle: Slight high angle (hafif yukaridan, 15-20°)
- Distance: Medium close-up

FRAMING & COMPOSITION:
- PRIMARY FOCUS: Jacket/blazer sleeve lower section (ceket kolu alt kismi)
- MUST SHOW: Sleeve buttons (kol dugmeleri - 3-4 adet), cuff detail, button stitching
- SECONDARY: Sweater/shirt cuff peeking out (kazak/gomlek manseti gorunur)
- TERTIARY: Hand and wrist partially visible (el ve bilek kismen gorunur)
- BACKGROUND: Trouser fabric visible in soft focus (pantolon kumasi bulanik arka planda)

WHAT TO EXCLUDE:
- NO face visibility
- NO upper body/torso
- NO full arm length
- Frame cuts at mid-forearm to elbow area

LIGHTING:
- Soft studio lighting
- Even illumination on fabric texture
- Subtle shadows to show button depth

FOCUS PRIORITY:
1. Sleeve buttons and buttonholes
2. Fabric texture/pattern of jacket
3. Layering detail (jacket over sweater)
4. Hand/wrist as context only`,

            "detail_collar_chest": `OZEL 2 - YAKA/GOGUS DETAY CEKIMI:
CAMERA POSITIONING:
- Orientation: FRONT VIEW (ondan)
- Height: Chest/collar level (gogus/yaka hizasi)
- Angle: Straight-on or slight high (duz veya hafif yukaridan, 10-15°)
- Distance: Close-up

FRAMING & COMPOSITION:
- PRIMARY FOCUS: Jacket lapels and collar (ceket yakasi)
- MUST SHOW: Lapel shape, collar roll, V-opening
- SECONDARY: Inner layer visible (ic katman - kazak/gomlek yakasi)
- TERTIARY: Neck and collarbone area (boyun ve koprucu kemigi)
- CHIN: Lower chin may be visible but face is NOT shown

FRAME BOUNDARIES:
- Top: Cuts at lower chin/jaw (cene altindan keser)
- Bottom: Cuts at mid-chest/sternum (gogus ortasindan keser)
- Sides: Shoulder edges may be partially visible

WHAT TO EXCLUDE:
- NO eyes, nose, or full face
- NO waist or lower body
- NO full shoulder width

LIGHTING:
- Soft, diffused front lighting
- Highlights on collar structure
- Shadow definition in V-opening

FOCUS PRIORITY:
1. Lapel construction and shape
2. Inner garment neckline detail
3. Fabric texture contrast between layers
4. Skin tone as neutral backdrop`,

            "detail_fabric_texture": `OZEL 3 - KUMAS DOKUSU MAKRO CEKIMI:
CAMERA POSITIONING:
- Orientation: PERPENDICULAR to fabric surface (kumasa dik)
- Height: N/A (fabric fills entire frame)
- Angle: 0° or slight angle to show texture depth (5-15°)
- Distance: MACRO / Extreme close-up

FRAMING & COMPOSITION:
- PRIMARY FOCUS: Fabric weave pattern only (kumas dokuma deseni)
- MUST SHOW: Thread detail, weave structure, pattern repeat
- SECONDARY: Natural fabric fold/crease for depth (dogal kivrım/kat)
- NO human body parts visible

FRAME BOUNDARIES:
- Entire frame filled with fabric texture
- Pattern should be clearly identifiable
- Include slight fold/drape for 3D feel

WHAT TO EXCLUDE:
- NO skin, hands, or body parts
- NO buttons, zippers, or hardware
- NO background - only fabric

LIGHTING:
- Soft, even lighting
- Side lighting to emphasize texture depth
- No harsh shadows or hotspots

TECHNICAL:
- Sharp focus on fabric weave
- Shallow depth of field on fold areas
- Color accuracy is critical

FOCUS PRIORITY:
1. Weave pattern clarity (e.g., houndstooth, herringbone)
2. Thread texture and quality
3. Color accuracy of fabric
4. Dimensional fold for depth perception`,

            "detail_button_macro": `OZEL 4 - DUGME MAKRO CEKIMI:
CAMERA POSITIONING:
- Orientation: STRAIGHT-ON to button face (dugmeye dik)
- Height: Button level
- Angle: 0° perpendicular or slight angle (5-10°)
- Distance: EXTREME MACRO

FRAMING & COMPOSITION:
- PRIMARY FOCUS: Single button filling 60-70% of frame
- MUST SHOW: Button holes, stitching, button material/texture
- SECONDARY: Surrounding fabric texture visible
- TERTIARY: Lapel edge or buttonhole detail if applicable

FRAME BOUNDARIES:
- Button centered or rule-of-thirds positioned
- Fabric texture surrounds button
- May include partial view of lapel edge

WHAT TO EXCLUDE:
- NO face or skin
- NO full garment view
- NO other buttons (single button focus)

LIGHTING:
- Soft lighting with subtle highlight on button surface
- Enough shadow to show button depth/dimension
- Reflection control on shiny buttons

TECHNICAL:
- Extreme shallow depth of field
- Button in razor-sharp focus
- Background fabric slightly soft

FOCUS PRIORITY:
1. Button surface detail and material
2. Buttonhole and thread stitching
3. Fabric texture immediately around button
4. Lapel construction if visible`
        };

        // Shot scale definitions for precise framing
        const shotScaleDefinitions: Record<string, string> = {
            // Cok Yakin Alt Kategoriler
            "extreme_closeup_eye": "COK YAKIN - GOZ: Frame ONLY the eye(s). Extreme macro detail. Iris texture, eyelashes, skin around eye visible. The eye fills 80% of the frame.",
            "extreme_closeup_mouth": "COK YAKIN - AGIZ: Frame ONLY the mouth and lips. Lip texture, teeth if visible, skin around mouth. The mouth fills 80% of the frame.",
            "extreme_closeup_head": "COK YAKIN - KAFA: Frame the entire head/face filling the frame. Forehead to chin, ear to ear. Face occupies 90% of frame. No neck visible.",
            "extreme_closeup_left_profile": "SOL PROFIL (TAM KAFA): Show the COMPLETE head from the LEFT side in profile view. Camera at 90° to subject's right side. MUST INCLUDE: Full hair/top of head visible, left ear, left eye profile, nose silhouette, lips profile, chin, jawline. Frame the ENTIRE head shape with hair. DO NOT crop the top of head. MAINTAIN exact facial features and identity. Natural, undistorted profile portrait.",
            "extreme_closeup_right_profile": "SAG PROFIL (TAM KAFA): Show the COMPLETE head from the RIGHT side in profile view. Camera at 90° to subject's left side. MUST INCLUDE: Full hair/top of head visible, right ear, right eye profile, nose silhouette, lips profile, chin, jawline. Frame the ENTIRE head shape with hair. DO NOT crop the top of head. MAINTAIN exact facial features and identity. Natural, undistorted profile portrait.",
            // Diger Planlar
            "closeup": "YAKIN PLAN (Bas/Omuz): Frame from top of head to shoulders. Head fills upper 60% of frame. Shoulders provide base context. Neck fully visible. Cut just below shoulder line.",
            "medium_closeup": "GOGUS PLAN (Sternum): Cut at chest/sternum level. Head, neck, shoulders, upper chest visible. Emotional connection with subject.",
            "medium_shot": "BEL PLAN (Waist): Cut at waist level. Upper body from waist up. Arms and hand gestures visible. Classic interview framing.",
            "full_shot": "BOY PLAN (Body): Full body from head to toe. Subject fills vertical frame. Small margin above head and below feet.",
            "wide_shot": "GENEL PLAN: Subject occupies 50-60% of frame height. Environment context visible around subject.",
            "extreme_wide": `COK GENEL PLAN (Extreme Wide Shot):
- Subject occupies 20-30% of frame height
- More environment/background visible around subject
- BACKGROUND RULE: Use the SAME background specified by user - just show MORE of it
- DO NOT invent new environments or add random scenery
- Simply pull camera back to reveal more of the existing background
- Subject still clearly visible and identifiable
- Maintain consistent lighting and atmosphere`,
            "long_distance": `UZAK MESAFE (Long Distance Shot):
- Subject occupies only 10-15% of the frame height
- Camera is positioned FAR from subject
- Subject is small but still clearly visible and identifiable
- BACKGROUND RULE: Use the SAME background/environment specified by user - just show MORE of it
- DO NOT invent new landscapes or environments
- DO NOT add mountains, oceans, or epic scenery unless specified
- Simply zoom out to show more of the existing background
- The subject remains the focal point despite being small
- Maintain the same lighting and atmosphere as closer shots
- This is about DISTANCE, not changing the scene`,
            // Kadir Ozel Cekim Olcekleri
            // CRITICAL: All Kadir shots MUST keep the EXACT SAME background - DO NOT change environment
            "kadir5": `KADIR5 - DETAY CEKIM (Detail Shot, Side View, Waist Level):
- DETAIL/MACRO shot focusing on specific area (sleeve, cuff, fabric detail)
- Camera positioned at SIDE of subject (90° from front)
- Camera at WAIST LEVEL height
- Close focus on clothing details, textures, buttons, stitching
- Product detail photography style
- CRITICAL: Keep the EXACT SAME background/environment from reference image - DO NOT change or invent new background`,
            "kadir6": `KADIR6 - TAM BOY CEKIM (Full Body Shot, 3/4 Angle, Eye Level):
- Frame the ENTIRE body from head to toe
- Camera at 3/4 ANGLE (subject turned slightly, about 30-45° from front)
- Camera at exact EYE LEVEL (0° tilt)
- Dynamic pose with slight body angle
- Shows full outfit with dimensional depth
- Fashion editorial full length style
- CRITICAL: Keep the EXACT SAME background/environment from reference image - DO NOT change or invent new background`,
            "kadir7": `KADIR7 - ORTA BOY CEKIM ARKADAN (Medium Shot, Back View, Eye Level):
- Frame from waist up, showing upper BACK of body
- Camera positioned directly BEHIND subject
- Camera at exact EYE LEVEL (0° tilt)
- Subject's back facing camera
- Shows back details of clothing (back panel, collar from behind, shoulder seams)
- E-commerce back view shot
- CRITICAL: Keep the EXACT SAME background/environment from reference image - DO NOT change or invent new background`,
            "kadir8": `KADIR8 - BELDEN ASAGI CEKIM (Waist Down Shot, Front, Waist Level):
- Frame from WAIST DOWN to feet only
- Camera positioned directly in FRONT of subject
- Camera at WAIST/HIP LEVEL height (not eye level)
- Shows pants/trousers, belt area, legs, shoes
- Upper body NOT visible in frame
- HANDS POSITION: Arms hanging straight DOWN at sides - hands visible at hip level, relaxed and natural
- CLOTHING: NO JACKET - model wearing ONLY SHIRT (dress shirt tucked in) with trousers. Remove any jacket/blazer.
- Trouser/pants focused e-commerce shot
- CRITICAL: Keep the EXACT SAME background/environment from reference image - DO NOT change or invent new background`,
            "kadir9": `KADIR9 - DETAY CEKIM (Detail Shot, Side View, Waist Level):
- DETAIL shot focusing on waist/hip area details
- Camera positioned at SIDE of subject (90° from front)
- Camera at WAIST LEVEL height
- Close focus on belt, pocket details, fabric texture at hip
- Side profile detail photography
- CRITICAL: Keep the EXACT SAME background/environment from reference image - DO NOT change or invent new background`,
            "kadir10": `KADIR10 - BELDEN ASAGI CEKIM ARKADAN (Waist Down Shot, Back View, Waist Level):
- Frame from WAIST DOWN to feet, BACK VIEW only
- Camera positioned directly BEHIND subject
- Camera at WAIST/HIP LEVEL height
- Shows back of pants, back pockets, back of legs, heels of shoes
- Upper body NOT visible in frame
- HANDS POSITION: Arms hanging straight DOWN at sides - hands visible at hip level from behind, relaxed and natural
- CLOTHING: NO JACKET - model wearing ONLY SHIRT (dress shirt tucked in) with trousers. Remove any jacket/blazer.
- Trouser back view e-commerce shot
- CRITICAL: Keep the EXACT SAME background/environment from reference image - DO NOT change or invent new background`
        };

        const selectedCameraAngle = cameraAngleDefinitions[settings.cameraAngle] || settings.cameraAngle;
        const selectedShotScale = shotScaleDefinitions[settings.shotScale] || settings.shotScale;

        const userPrompt = `Analyze this reference image and generate a cinematic prompt with these settings:

CAMERA ANGLE: ${selectedCameraAngle}
SHOT SCALE: ${selectedShotScale}
LENS: ${settings.lens}
ASPECT RATIO: ${settings.aspectRatio}
${settings.manualDirective ? `ADDITIONAL DIRECTIVE: ${settings.manualDirective}` : ''}

CAMERA ANGLE RULES (CRITICAL - MUST FOLLOW):
- worms_eye: Camera ON GROUND, 90° UP. Show underside of chin, nostrils, jaw.
- extreme_low: Camera at ankle, 60° UP. Legs foreshortened, subject dominates.
- low_angle: Camera at waist, 30-45° UP. Heroic, powerful look.
- slight_low: Camera just below eyes, 15° UP. Subtle confidence boost.
- eye_level: Camera at EXACT eye height, 0° tilt. Neutral, direct.
- slight_high: Camera just above eyes, 15° DOWN. Approachable subject.
- high_angle: Camera above head, 30-45° DOWN. Subject smaller, vulnerable.
- extreme_high: Camera well above, 60° DOWN. Subject appears weak.
- birds_eye: Camera DIRECTLY ABOVE, 90° DOWN. Top of head only.
- dutch_angle: Camera TILTED 15-30° sideways. Diagonal horizon line.
- over_shoulder: Camera BEHIND subject at SHOULDER-LEVEL, offset 25-35° to LEFT or RIGHT. Show BACK of clothing, partial side profile of face. NOT elevated, NOT centered. Shoulder dominant in foreground, back texture fills frame, neck/ear/jawline partially visible.
- detail_sleeve_cuff: E-COMMERCE DETAIL - Sleeve/cuff area. Show sleeve buttons, cuff detail, hand/wrist. NO face. Side view at sleeve level.
- detail_collar_chest: E-COMMERCE DETAIL - Collar/chest area. Show lapels, V-opening, inner layer neckline. Chin may be visible but NO face. Front view at chest level.
- detail_fabric_texture: E-COMMERCE DETAIL - MACRO fabric texture only. NO body parts. Fill frame with weave pattern and natural fold.
- detail_button_macro: E-COMMERCE DETAIL - EXTREME MACRO single button. Show button, stitching, surrounding fabric. NO face or full garment.

SHOT SCALE FRAMING RULES:
- extreme_closeup_eye: ONLY eye(s) visible, extreme macro, iris detail
- extreme_closeup_mouth: ONLY mouth/lips visible, extreme macro
- extreme_closeup_head: Full face/head only, forehead to chin, no neck
- extreme_closeup_left_profile: FULL HEAD from LEFT side, include ALL hair, ear, profile. NO distortion. Natural portrait.
- extreme_closeup_right_profile: FULL HEAD from RIGHT side, include ALL hair, ear, profile. NO distortion. Natural portrait.
- closeup: Top of head to shoulders, head 60% of frame, shoulders as base
- medium_closeup: Cut at sternum/chest level
- medium_shot: Cut at waist, upper body visible
- full_shot: Head to toe, full body in frame
- wide_shot: Full body + environment context (subject 50-60% of height)
- extreme_wide: Subject small (20-30%), show MORE of SAME background - do NOT invent new scenes
- long_distance: Subject tiny (10-15%) but KEEP SAME BACKGROUND - just zoom out, do NOT invent new scenes

CRITICAL INSTRUCTIONS:
- The reference image is ONLY for identity (face, clothes, pose skeleton)
- COMPLETELY IGNORE the camera angle in the reference - RE-IMAGINE from the NEW angle
- The camera MUST physically move to the new position described above
- If low angle: describe what you see looking UP at the subject
- If high angle: describe what you see looking DOWN at the subject
- If birds_eye: describe the TOP of the subject's head, shoulders from above
- If worms_eye: describe the UNDERSIDE of chin, nostrils, jaw from below
- For PROFILE shots: Show the COMPLETE head with FULL HAIR visible. DO NOT distort facial features. PRESERVE exact identity. Frame entire head shape naturally.
- For OVER_SHOULDER: Camera at shoulder-level BEHIND subject, offset 25-35° to side. Frame shows: back of clothing filling majority of frame, shoulder line dominant, partial side profile (neck, ear, jawline). MUST AVOID: bird-eye view, centered rear shot, full face visibility, elevated camera.
- For DETAIL_SLEEVE_CUFF: Focus on sleeve buttons/cuff area. Show hand/wrist as context. NO face visible. E-commerce product detail shot.
- For DETAIL_COLLAR_CHEST: Focus on lapels and collar structure. Show inner layer neckline. Chin OK but NO eyes/nose/face. E-commerce product detail shot.
- For DETAIL_FABRIC_TEXTURE: ONLY fabric fills frame. NO body parts. Show weave pattern, texture, natural fold. Pure material shot.
- For DETAIL_BUTTON_MACRO: Single button extreme close-up. Show stitching and surrounding fabric. NO face or full garment view.
- Apply proper lens physics for ${settings.lens}
- Consider the 3D volumetric nature of the subject from the new viewpoint
- STRICTLY follow both camera angle AND shot scale framing rules above

Respond with ONLY the JSON object, no other text.`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{
                role: "user",
                parts: [
                    { text: systemPrompt },
                    { inlineData: { data: base64, mimeType } },
                    { text: userPrompt }
                ]
            }],
            config: {
                generationConfig: {
                    temperature: 0.3,
                    topP: 0.85,
                    topK: 40
                }
            }
        });

        const responseText = response.text?.trim() || "";

        // Clean up response - remove markdown code blocks if present
        let cleanedResponse = responseText;
        if (cleanedResponse.startsWith("```json")) {
            cleanedResponse = cleanedResponse.slice(7);
        } else if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.slice(3);
        }
        if (cleanedResponse.endsWith("```")) {
            cleanedResponse = cleanedResponse.slice(0, -3);
        }
        cleanedResponse = cleanedResponse.trim();

        // Parse JSON
        const parsed = JSON.parse(cleanedResponse) as CinematicPromptResult;

        console.log("🎬 Cinematic Prompt Result:", parsed);
        return parsed;

    } catch (error) {
        console.error("Cinematic prompt generation failed:", error);
        throw new Error("Prompt oluşturulamadı. Lütfen tekrar deneyin.");
    }
};

// Generate image from cinematic prompt
export const generateImageFromCinematicPrompt = async (
    referenceImage: File,
    promptResult: CinematicPromptResult,
    aspectRatio: string
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = "gemini-3-pro-image-preview";

        const { base64, mimeType } = await processImageForGemini(referenceImage, 1536, 0.90);

        // Build the master prompt from the JSON result
        const masterPrompt = `
⚠️⚠️⚠️ STEP 1 - ANALYZE REFERENCE IMAGE FIRST ⚠️⚠️⚠️
BEFORE ANYTHING ELSE, LOOK AT THE REFERENCE IMAGE:
- What TOP is the person wearing? (sweater? knit? vest? t-shirt? jacket?)
- What COLOR is that top?
- What PANTS is the person wearing?
- MEMORIZE these items - you MUST preserve them EXACTLY!

🔴🔴🔴 ABSOLUTE CLOTHING PRESERVATION RULE 🔴🔴🔴
- The TOP you identified MUST appear in output with the SAME color!
- The PANTS you identified MUST appear in output!
- If reference has CREAM V-NECK SWEATER → output MUST have CREAM V-NECK SWEATER
- If reference has KNIT VEST → output MUST have KNIT VEST
- If reference has JACKET over sweater → output MUST have JACKET over sweater

🚫🚫🚫 ABSOLUTELY FORBIDDEN 🚫🚫🚫
- ❌ DO NOT generate a DRESS SHIRT if reference has no dress shirt!
- ❌ DO NOT generate a STRIPED SHIRT if reference has no striped shirt!
- ❌ DO NOT generate a WHITE SHIRT if reference has no white shirt!
- ❌ DO NOT change the clothing at all!

${promptResult.camera_override_protocol}

${promptResult.volumetric_reconstruction}

${promptResult.consistency_anchors}

${promptResult.framing_boundaries}

${promptResult.optical_physics}

MASTER DIRECTIVE: ${promptResult.final_technical_prompt}

CRITICAL: Generate a NEW photograph of the SAME subject from this NEW camera angle. The reference image is ONLY for identity AND clothing - you MUST keep the EXACT same outfit while repositioning the virtual camera.

🚨 FINAL CHECK: Does output have the SAME clothing as reference? If sweater in reference → sweater in output! NO dress shirts unless reference has dress shirt!`;

        const parts = [
            { inlineData: { data: base64, mimeType } },
            { text: masterPrompt }
        ];

        const config = {
            responseModalities: ["image", "text"],
            speechConfig: null,
            safetySettings: SAFETY_SETTINGS
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: config
        });

        // Extract image from response
        const candidate = response.candidates?.[0];
        if (!candidate?.content?.parts) {
            throw new Error("No image generated");
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData?.data) {
                const imageData = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType || 'image/png';
                return `data:${imageMimeType};base64,${imageData}`;
            }
        }

        throw new Error("No image data in response");

    } catch (error) {
        console.error("Image generation from cinematic prompt failed:", error);
        throw new Error("Görsel oluşturulamadı. Lütfen tekrar deneyin.");
    }
};

// ============================================================
// ÖZEL FIT MODU - PANTOLON KALIBI DÖNÜŞÜMÜ
// ============================================================

export interface OzelFitConfig {
    id: string;
    pose_lock: string;
    fit_profile: {
        silhouette: string;
        waist_position: string;
        rise_visual: string;
        ease: {
            waist: string;
            hip: string;
            thigh: string;
            knee: string;
            calf: string;
        };
        bagginess_score_0_10: number;
    };
    leg_behavior: {
        thigh_to_knee: string;
        knee_to_hem: string;
        hem_width: string;
    };
    fabric_drape: {
        flow: string;
        wrinkle_level: string;
        crease: string;
    };
    hem: {
        break: string;
        stacking: string;
    };
}

export interface OzelFitGenerationResult {
    imageData: string;
    aiModel: string;
    legType: string;
}

export const generateOzelFitImage = async (
    productImage: File,
    legType: string,
    config: OzelFitConfig,
    onProgress?: (message: string) => void,
    shoeImage?: File
): Promise<OzelFitGenerationResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = "gemini-3-pro-image-preview";

        onProgress?.("👖 Pantolon görseli işleniyor...");

        // Process the product image
        const { base64, mimeType } = await processImageForGemini(productImage, 2048, 0.95);

        // Process shoe image if provided
        let shoeBase64: string | null = null;
        let shoeMimeType: string | null = null;
        if (shoeImage) {
            onProgress?.("👟 Ayakkabı görseli işleniyor...");
            const shoeData = await processImageForGemini(shoeImage, 1024, 0.9);
            shoeBase64 = shoeData.base64;
            shoeMimeType = shoeData.mimeType;
        }

        onProgress?.("📐 Fit dönüşümü hazırlanıyor...");

        const { fit_profile, leg_behavior, fabric_drape, hem } = config;

        // Build shoe instruction based on whether shoe image is provided
        const shoeInstruction = shoeImage ? `
👟👟👟 AYAKLAR VE AYAKKABI - KRİTİK 👟👟👟
- AYAKLAR MUTLAKA GÖRÜNMELİ - kesilmemeli!
- Model AYAKKABI giymiş olmalı
- ⭐ REFERANS AYAKKABI (IMAGE 2): Verilen ayakkabı görselini KULLAN!
- Model, IMAGE 2'deki ayakkabıyı giymiş olmalı
- Ayakkabının modelini, rengini ve tarzını AYNEN koru
- Paça ve ayakkabı ilişkisi net görünmeli
- Ayaklar zeminde, tam görünür` : `
👟👟👟 AYAKLAR VE AYAKKABI - KRİTİK 👟👟👟
- AYAKLAR MUTLAKA GÖRÜNMELİ - kesilmemeli!
- Model AYAKKABI giymiş olmalı
- Klasik erkek ayakkabısı (oxford, loafer veya minimal sneaker)
- Ayakkabı rengi: siyah veya koyu kahve (pantolonla uyumlu)
- Paça ve ayakkabı ilişkisi net görünmeli
- Ayaklar zeminde, tam görünür`;

        // Build the transformation prompt
        const prompt = `
🎯 PANTOLON FIT DÖNÜŞÜMÜ - E-TİCARET GÖRSEL ÜRETİMİ

Bu bir PANTOLON FIT DEĞİŞTİRME görevidir. Verilen pantolon görselinin KALIBINI/FIT'ini değiştirmeniz gerekmektedir.

📸📸📸 KADRAJ VE GÖRÜNÜM - ÇOK ÖNEMLİ 📸📸📸
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SADECE BEL VE AŞAĞISI GÖRÜNECEK!
- Görsel BELTEN başlayacak (göğüs, yüz, omuzlar GÖRÜNMEYECEK)
- Kemer/bel hattından AYAKLARA kadar TAMAMI görünmeli
- Üstte gömleğin bele giren kısmı hafif görünsün
- Model HAFİF YAN DURSUN (3/4 açı - slight angle)
- BEYAZ ARKA PLAN - saf beyaz (#FFFFFF)
- BEYAZ ZEMİN - temiz beyaz studio floor

👔👔👔 GÖMLEK - SABİT BEYAZ 👔👔👔
- Gömlek HER ZAMAN SAF BEYAZ (#FFFFFF) olmalı
- Gömlek rengi ASLA DEĞİŞMEMELİ - her zaman beyaz!
- Düz beyaz gömlek, desen yok
- Gömlek bele girmiş şekilde görünsün
${shoeInstruction}

📐 KAMERA AÇISI:
- Model hafif yana dönük (3/4 view, slight turn)
- Tam yanından değil, hafif açılı
- Bacakların fit'i net görünsün
- AYAKLAR DAHİL tüm bacak görünmeli

📌 KAYNAK GÖRSEL (IMAGE 1) - PANTOLON:
- Bu pantolon üzerinde bir model var
- ⭐⭐⭐ PANTOLON RENGİ BİREBİR AYNI KALMALI! ⭐⭐⭐
- Kaynak pantolonun EXACT rengini kullan - değiştirme!
- Pantolonun TÜM detaylarını koru: renk, desen, kumaş dokusu, cep detayları, dikiş çizgileri
- PANTOLON BOYU AYNI KALMALI - uzunluk değişmemeli!
- SADECE FIT/KALIP DEĞİŞECEK (dar/düz/geniş)
- Renk tonu, parlaklık, doygunluk = KAYNAK GÖRSELDEKİ GİBİ

📐 HEDEF SİLUET: ${fit_profile.silhouette.replace(/_/g, ' ').toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 BEL POZİSYONU: ${fit_profile.waist_position.replace(/_/g, ' ')}
📍 RISE GÖRÜNÜMÜ: ${fit_profile.rise_visual.replace(/_/g, ' ')}
📍 BOLLUK SKORU: ${fit_profile.bagginess_score_0_10}/10

📏 EASE (RAHATLAMA) DEĞERLERİ:
├── Bel: ${fit_profile.ease.waist.replace(/_/g, ' ')}
├── Kalça: ${fit_profile.ease.hip.replace(/_/g, ' ')}
├── Uyluk: ${fit_profile.ease.thigh.replace(/_/g, ' ')}
├── Diz: ${fit_profile.ease.knee.replace(/_/g, ' ')}
└── Baldır: ${fit_profile.ease.calf.replace(/_/g, ' ')}

🦵 BACAK DAVRANIŞI:
├── Uyluktan Dize: ${leg_behavior.thigh_to_knee.replace(/_/g, ' ')}
├── Dizden Paçaya: ${leg_behavior.knee_to_hem.replace(/_/g, ' ')}
└── Paça Genişliği: ${leg_behavior.hem_width.replace(/_/g, ' ')}

🧵 KUMAŞ DÜŞÜŞÜ:
├── Akış: ${fabric_drape.flow.replace(/_/g, ' ')}
├── Kırışıklık Seviyesi: ${fabric_drape.wrinkle_level.replace(/_/g, ' ')}
└── Ütü İzi/Crease: ${fabric_drape.crease.replace(/_/g, ' ')}

👟 PAÇA:
├── Break: ${hem.break.replace(/_/g, ' ')}
└── Yığılma (Stacking): ${hem.stacking.replace(/_/g, ' ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ KRİTİK KURALLAR:
1. ✅ SADECE BEL VE AŞAĞISI görünsün - yüz/göğüs YOK
2. ✅ Kaynak pantolon AYNI pantolon olmalı (renk, desen, kumaş AYNI)
3. ✅ PANTOLON BOYU DEĞİŞMEMELİ - sadece fit değişsin
4. ✅ SADECE FIT/KALIP değişmeli - pantolon kimliği korunmalı
5. ✅ Model HAFİF YAN DURMALI (3/4 açı)
6. ✅ BEYAZ arka plan ve zemin
7. ✅ GÖMLEK HER ZAMAN SAF BEYAZ (#FFFFFF) - asla farklı renk değil!
8. ✅ Pantolon rengi KAYNAK GÖRSELDEKİ GİBİ - birebir aynı!
9. ❌ Pantolon rengini DEĞİŞTİRME - ASLA!
10. ❌ Pantolon desenini DEĞİŞTİRME
11. ❌ Pantolon boyunu DEĞİŞTİRME (uzunluk AYNI)
12. ❌ Cep sayısını/şeklini DEĞİŞTİRME
13. ❌ Yeni bir pantolon OLUŞTURMA - sadece fit'i dönüştür
14. ❌ Gömlek rengini DEĞİŞTİRME - HER ZAMAN BEYAZ!

📸 ÇIKTI:
- Profesyonel e-ticaret fotoğrafı kalitesinde
- CROP: Belden AYAKLARA kadar (waist-to-feet)
- Dikey/Portrait format
- BEYAZ arka plan (#FFFFFF)
- Pantolonun yeni fit'i net görünmeli
- SAF BEYAZ GÖMLEK (#FFFFFF) belde pantolonun içine girmiş görünsün
- Pantolon rengi = KAYNAK görsel ile BİREBİR AYNI
- AYAKLAR ve AYAKKABI görünür olmalı!

⛔⛔⛔ AYAK KONTROLÜ - ZORUNLU ⛔⛔⛔
Çıktı görselinde kontrol et:
✅ Ayaklar görünüyor mu? EVET olmalı!
✅ Ayakkabı var mı? EVET olmalı!
✅ Ayaklar kesilmiş mi? HAYIR olmalı!
❌ Ayaklar görünmüyorsa = YANLIŞ GÖRSEL

CRITICAL ANATOMY & QUALITY ASSURANCE:
- HUMAN ANATOMY MUST BE PERFECT.
- Legs must be naturally proportioned
- FEET MUST BE FULLY VISIBLE - not cropped!
- Model must wear SHOES (oxford, loafer, or minimal sneaker)
- Skin texture must be realistic, not waxy or plastic.
- Professional studio lighting - bright, clean, no harsh shadows
`;

        onProgress?.("🔄 Fit dönüşümü yapılıyor...");

        console.log(`Generating Özel Fit image: ${legType} (bagginess: ${fit_profile.bagginess_score_0_10}/10)${shoeImage ? ' + custom shoe' : ''}`);

        // Build parts array - include shoe image if provided
        const parts: any[] = [
            { inlineData: { data: base64, mimeType } },
        ];

        // Add shoe image as IMAGE 2 if provided
        if (shoeBase64 && shoeMimeType) {
            parts.push({ inlineData: { data: shoeBase64, mimeType: shoeMimeType } });
        }

        // Add prompt at the end
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
                responseModalities: ["image", "text"],
                safetySettings: SAFETY_SETTINGS as any,
            }
        });

        const imageData = extractImageFromResponse(response);

        if (imageData) {
            onProgress?.("✅ Pantolon fit dönüşümü başarıyla tamamlandı!");
            console.log("✅ Özel Fit image generated successfully");

            return {
                imageData,
                aiModel: modelName,
                legType
            };
        }

        throw new Error("Pantolon görseli oluşturulamadı - görsel üretilemedi.");

    } catch (error: any) {
        console.error("Özel Fit Generation Error:", error);
        if (error.status === 429) {
            throw new Error("API kota limiti aşıldı (429). Lütfen daha sonra tekrar deneyin.");
        }
        if (error.status === 503 || error.message?.includes('503') || error.message?.includes('overloaded')) {
            throw new Error("Model şu anda meşgul (503). Lütfen birkaç dakika bekleyip tekrar deneyin.");
        }
        if (error.message?.includes('Safety')) {
            throw new Error("Güvenlik filtresi tetiklendi. Lütfen farklı bir görsel deneyin.");
        }
        throw new Error(error.message || "Fit dönüşümü sırasında bir hata oluştu.");
    }
};
