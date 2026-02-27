import React, { useState, useRef, useCallback } from 'react';
import {
  generateCinematicPrompt,
  generateImageFromCinematicPrompt,
  type CinematicPromptSettings,
  type CinematicPromptResult
} from '../services/geminiService';
import {
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Maximize,
  Move,
  Aperture,
  X,
  ChevronDown,
  Upload,
  ImageIcon,
  Loader2,
  Clapperboard,
  Wand2,
  Image,
  Download
} from 'lucide-react';

// Camera Angle Options - Dikey Açılar (Vertical)
const CAMERA_ANGLE_OPTIONS = [
  // Asagidan Yukari Bakanlar
  { value: "worms_eye", label: "Solucan Bakisi (yerden, 90° yukari)" },
  { value: "extreme_low", label: "Cok Alt Aci (60° yukari)" },
  { value: "low_angle", label: "Alt Aci (30-45° yukari)" },
  { value: "slight_low", label: "Hafif Alt Aci (15° yukari)" },
  // Duz Seviye
  { value: "eye_level", label: "Goz Hizasi (0° duz)" },
  // Yukaridan Asagi Bakanlar
  { value: "slight_high", label: "Hafif Ust Aci (15° asagi)" },
  { value: "high_angle", label: "Ust Aci (30-45° asagi)" },
  { value: "extreme_high", label: "Cok Ust Aci (60° asagi)" },
  { value: "birds_eye", label: "Kus Bakisi (90° tam yukaridan)" },
  // Ozel Acilar
  { value: "dutch_angle", label: "Dutch Angle (15-30° yana egik)" },
  { value: "over_shoulder", label: "Omuz Ustunden (arkadan)" },
];

// Standard Shot Scale Options
const STANDARD_SHOT_SCALES = [
  // Cok Yakin Alt Kategoriler
  { value: "extreme_closeup_eye", label: "Cok Yakin - Goz" },
  { value: "extreme_closeup_mouth", label: "Cok Yakin - Agiz" },
  { value: "extreme_closeup_head", label: "Cok Yakin - Kafa" },
  { value: "extreme_closeup_left_profile", label: "Sol Profil (Tam Kafa)" },
  { value: "extreme_closeup_right_profile", label: "Sag Profil (Tam Kafa)" },
  // Diger Planlar
  { value: "closeup", label: "Yakin Plan (Bas/Omuz)" },
  { value: "medium_closeup", label: "Gogus Plan (Sternum)" },
  { value: "medium_shot", label: "Bel Plan (Waist)" },
  { value: "full_shot", label: "Boy Plan (Body)" },
  { value: "wide_shot", label: "Genel Plan" },
  { value: "extreme_wide", label: "Cok Genel Plan" },
  { value: "long_distance", label: "Uzak Mesafe" },
];

// Special Shot Scale Options (Özel Çekim Ölçeği)
const SPECIAL_SHOT_SCALES = [
  // Ozel Detay Cekimleri
  { value: "detail_sleeve_cuff", label: "Özel 1 - Kol/Manşet Detay" },
  { value: "detail_collar_chest", label: "Özel 2 - Yaka/Göğüs Detay" },
  { value: "detail_fabric_texture", label: "Özel 3 - Kumaş Dokusu Makro" },
  { value: "detail_button_macro", label: "Özel 4 - Düğme Makro" },
  // Kadir Ozel Cekim Olcekleri
  { value: "kadir5", label: "Kadir 5 - Detay, Yandan, Bel Hizası" },
  { value: "kadir6", label: "Kadir 6 - Tam Boy, 3/4 Açı, Göz Hizası" },
  { value: "kadir7", label: "Kadir 7 - Orta Boy, Arkadan, Göz Hizası" },
  { value: "kadir8", label: "Kadir 8 - Belden Aşağı, Önden, Bel Hizası" },
  { value: "kadir10", label: "Kadir 10 - Belden Aşağı, Arkadan, Bel Hizası" },
];

// Lens Options
const LENS_OPTIONS = [
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

// Aspect Ratio Options
const ASPECT_RATIO_OPTIONS = [
  { value: "original", label: "Orijinal" },
  { value: "1:1", label: "1:1 Kare" },
  { value: "4:3", label: "4:3" },
  { value: "16:9", label: "16:9 Genis" },
  { value: "3:4", label: "3:4 Dikey" },
  { value: "9:16", label: "9:16 Story" },
];

const PromptArchitectMode: React.FC = () => {
  // Image states
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings
  const [settings, setSettings] = useState<CinematicPromptSettings>({
    cameraAngle: "eye_level",
    shotScale: "medium_shot",
    lens: "50mm_natural",
    aspectRatio: "3:4",
    manualDirective: ""
  });

  // Result states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [result, setResult] = useState<CinematicPromptResult | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Kadir toplu uretim states
  const [isGeneratingAllKadir, setIsGeneratingAllKadir] = useState(false);
  const [kadirProgress, setKadirProgress] = useState(0);
  const [kadirImages, setKadirImages] = useState<{id: string, url: string}[]>([]);

  // Special shot scale toggle
  const [useSpecialShotScale, setUseSpecialShotScale] = useState(false);

  // Özel JSON prompt oluşturma states
  const [isGeneratingSpecialJsons, setIsGeneratingSpecialJsons] = useState(false);
  const [specialJsonPrompts, setSpecialJsonPrompts] = useState<{id: string, label: string, json: string, expanded: boolean}[]>([]);
  const [showSpecialJsonPanel, setShowSpecialJsonPanel] = useState(false);

  // Image upload handler
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(file);
      setResult(null);
      setGeneratedImage(null);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => setSourcePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const clearImage = () => {
    setSourceImage(null);
    setSourcePreview(null);
    setResult(null);
    setGeneratedImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateSetting = <K extends keyof CinematicPromptSettings>(
    key: K,
    value: CinematicPromptSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError('Lutfen bir referans gorsel yukleyin.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setGeneratedImage(null);

    try {
      const promptResult = await generateCinematicPrompt(sourceImage, settings);
      setResult(promptResult);
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Prompt olusturulamadi. Lutfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!sourceImage || !result) return;

    setIsGeneratingImage(true);
    setError(null);

    try {
      const imageUrl = await generateImageFromCinematicPrompt(
        sourceImage,
        result,
        settings.aspectRatio
      );
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error('Image generation failed:', err);
      setError('Gorsel olusturulamadi. Lutfen tekrar deneyin.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Tum Kadir acilarini toplu olustur
  const handleGenerateAllKadir = async () => {
    if (!sourceImage) {
      setError('Lutfen bir referans gorsel yukleyin.');
      return;
    }

    const kadirScales = ['kadir5', 'kadir6', 'kadir7', 'kadir8', 'kadir9', 'kadir10'];

    setIsGeneratingAllKadir(true);
    setKadirProgress(0);
    setKadirImages([]);
    setError(null);

    const generatedImages: {id: string, url: string}[] = [];

    for (let i = 0; i < kadirScales.length; i++) {
      const kadirId = kadirScales[i];
      setKadirProgress(i + 1);

      try {
        // Her Kadir icin ayarlari guncelle
        const kadirSettings: CinematicPromptSettings = {
          ...settings,
          shotScale: kadirId
        };

        // Prompt olustur
        const promptResult = await generateCinematicPrompt(sourceImage, kadirSettings);

        // Gorsel olustur
        const imageUrl = await generateImageFromCinematicPrompt(
          sourceImage,
          promptResult,
          settings.aspectRatio
        );

        generatedImages.push({ id: kadirId, url: imageUrl });
        setKadirImages([...generatedImages]);
      } catch (err) {
        console.error(`${kadirId} olusturulamadi:`, err);
        // Hata olsa bile devam et
      }
    }

    setIsGeneratingAllKadir(false);
  };

  // Tüm Özel çekim ölçekleri için JSON prompt oluştur
  const handleGenerateAllSpecialJsons = async () => {
    if (!sourceImage) {
      setError('Lütfen bir referans görsel yükleyin.');
      return;
    }

    setIsGeneratingSpecialJsons(true);
    setSpecialJsonPrompts([]);
    setShowSpecialJsonPanel(true);
    setError(null);

    const generatedJsons: {id: string, label: string, json: string, expanded: boolean}[] = [];

    for (let i = 0; i < SPECIAL_SHOT_SCALES.length; i++) {
      const scale = SPECIAL_SHOT_SCALES[i];

      try {
        // Her özel çekim için ayarları güncelle
        const specialSettings: CinematicPromptSettings = {
          ...settings,
          shotScale: scale.value
        };

        // Prompt oluştur
        const promptResult = await generateCinematicPrompt(sourceImage, specialSettings);

        generatedJsons.push({
          id: scale.value,
          label: scale.label,
          json: JSON.stringify(promptResult, null, 2),
          expanded: false
        });

        setSpecialJsonPrompts([...generatedJsons]);
      } catch (err) {
        console.error(`${scale.label} JSON oluşturulamadı:`, err);
        generatedJsons.push({
          id: scale.value,
          label: scale.label,
          json: JSON.stringify({ error: 'Oluşturulamadı' }, null, 2),
          expanded: false
        });
        setSpecialJsonPrompts([...generatedJsons]);
      }
    }

    setIsGeneratingSpecialJsons(false);
  };

  // Özel JSON panel toggle
  const toggleSpecialJsonExpand = (index: number) => {
    setSpecialJsonPrompts(prev => prev.map((item, i) =>
      i === index ? { ...item, expanded: !item.expanded } : item
    ));
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `cinematic-${Date.now()}.png`;
    link.click();
  };

  const handleReset = () => {
    setSettings({
      cameraAngle: "eye_level",
      shotScale: "medium_shot",
      lens: "50mm_natural",
      aspectRatio: "3:4",
      manualDirective: ""
    });
    setResult(null);
    setGeneratedImage(null);
    setError(null);
    setCopied(false);
    clearImage();
  };

  // Dropdown component
  const Dropdown = ({
    label,
    icon: Icon,
    value,
    options,
    onChange
  }: {
    label: string;
    icon: React.ElementType;
    value: string;
    options: { value: string; label: string }[];
    onChange: (val: string) => void;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <Icon className="w-4 h-4" />
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white/5 border border-border-default rounded-xl px-4 py-3 pr-10 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-mode-accent focus:border-transparent transition-all cursor-pointer hover:border-border-strong"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full bg-bg-base">
      {/* LEFT PANEL - Controls */}
      <div className="w-[380px] flex-shrink-0 bg-bg-surface border-r border-white/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mode-accent to-primary flex items-center justify-center">
              <Clapperboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-200">Cinematic Prompt</h1>
              <p className="text-[10px] text-gray-500">Teknik AI Yonetmen</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Image Upload */}
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <label className="flex items-center gap-2 text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <ImageIcon className="w-3 h-3" />
              Referans Gorsel
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
            {sourcePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-white/10 group">
                <img src={sourcePreview} alt="Referans" className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 bg-white rounded-lg text-[10px] font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Degistir
                  </button>
                  <button
                    onClick={clearImage}
                    className="p-1 bg-red-500 rounded-lg text-white hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-mode-accent hover:bg-mode-accent-dim transition-all cursor-pointer"
              >
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="text-[10px] text-gray-400">Gorsel Yukle</span>
                <span className="text-[9px] text-gray-500">PNG, JPG, WEBP</span>
              </button>
            )}
          </div>

          {/* Camera Angle */}
          <Dropdown
            label="Kamera Acisi"
            icon={Camera}
            value={settings.cameraAngle}
            options={CAMERA_ANGLE_OPTIONS}
            onChange={(val) => updateSetting('cameraAngle', val)}
          />

          {/* Shot Scale with Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Move className="w-4 h-4" />
                Çekim Ölçeği
              </label>
              <button
                onClick={() => {
                  setUseSpecialShotScale(!useSpecialShotScale);
                  // Reset to first option of new list
                  if (!useSpecialShotScale) {
                    updateSetting('shotScale', SPECIAL_SHOT_SCALES[0].value);
                  } else {
                    updateSetting('shotScale', STANDARD_SHOT_SCALES[0].value);
                  }
                }}
                className={`px-2 py-1 text-[9px] font-semibold rounded-md transition-all ${
                  useSpecialShotScale
                    ? 'bg-mode-accent text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                ÖZEL
              </button>
            </div>
            <div className="relative">
              <select
                value={settings.shotScale}
                onChange={(e) => updateSetting('shotScale', e.target.value)}
                className="w-full appearance-none bg-white/5 border border-border-default rounded-xl px-4 py-3 pr-10 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-mode-accent focus:border-transparent transition-all cursor-pointer hover:border-border-strong"
              >
                {(useSpecialShotScale ? SPECIAL_SHOT_SCALES : STANDARD_SHOT_SCALES).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Lens */}
          <Dropdown
            label="Lens"
            icon={Aperture}
            value={settings.lens}
            options={LENS_OPTIONS}
            onChange={(val) => updateSetting('lens', val)}
          />

          {/* Aspect Ratio */}
          <Dropdown
            label="En-Boy Orani"
            icon={Maximize}
            value={settings.aspectRatio}
            options={ASPECT_RATIO_OPTIONS}
            onChange={(val) => updateSetting('aspectRatio', val)}
          />

          {/* Manual Directive */}
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <label className="block text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Ek Direktif (Opsiyonel)
            </label>
            <textarea
              value={settings.manualDirective || ""}
              onChange={(e) => updateSetting('manualDirective', e.target.value)}
              placeholder="Orn: Modelin bakislari kameraya, dramatik aydinlatma..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-gray-200 focus:outline-none focus:border-mode-accent transition-all resize-none h-14 placeholder-gray-500"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
              <p className="text-[10px] text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-t border-white/10 bg-bg-surface space-y-2">
          {/* Generate Prompt Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || isGeneratingImage || !sourcePreview}
            className={`w-full py-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 transition-all ${
              isGenerating || isGeneratingImage || !sourcePreview
                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-mode-accent to-primary text-white hover:opacity-90 shadow-md shadow-mode-accent/20'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Prompt Olusturuluyor...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>PROMPT OLUSTUR</span>
              </>
            )}
          </button>

          {/* Generate Image Button - Only show when result exists */}
          {result && (
            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || isGenerating}
              className={`w-full py-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 transition-all ${
                isGeneratingImage || isGenerating
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 shadow-md shadow-emerald-500/20'
              }`}
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gorsel Uretiliyor...</span>
                </>
              ) : (
                <>
                  <Image className="w-4 h-4" />
                  <span>GORSEL OLUSTUR</span>
                </>
              )}
            </button>
          )}

          {/* Copy Button - Only show when result exists */}
          {result && (
            <button
              onClick={handleCopy}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-100 text-mode-accent hover:bg-amber-200'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kopyalandi!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>JSON KOPYALA</span>
                </>
              )}
            </button>
          )}

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>SIFIRLA</span>
          </button>

          {/* Özeller için JSON Prompt Oluştur - Sadece ÖZEL mod aktifken */}
          {useSpecialShotScale && (
            <button
              onClick={handleGenerateAllSpecialJsons}
              disabled={!sourceImage || isGeneratingSpecialJsons || isGenerating || isGeneratingImage}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                !sourceImage || isGeneratingSpecialJsons || isGenerating || isGeneratingImage
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-mode-accent to-primary text-white hover:from-mode-accent/90 hover:to-primary/90 shadow-md hover:shadow-lg'
              }`}
            >
              {isGeneratingSpecialJsons ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{specialJsonPrompts.length}/{SPECIAL_SHOT_SCALES.length} JSON Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>TÜM ÖZELLERİN JSON'LARINI OLUŞTUR</span>
                </>
              )}
            </button>
          )}

          {/* Tum Kadir Acilarini Olustur Button */}
          <button
            onClick={handleGenerateAllKadir}
            disabled={!sourceImage || isGeneratingAllKadir || isGenerating || isGeneratingImage}
            className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              !sourceImage || isGeneratingAllKadir || isGenerating || isGeneratingImage
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-indigo-500 text-white hover:from-primary/90 hover:to-indigo-600 shadow-md hover:shadow-lg'
            }`}
          >
            {isGeneratingAllKadir ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{kadirProgress}/6 Olusturuluyor...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>TUM KADIR ACILARINI OLUSTUR</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - Output */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Output Header */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Cikti</h2>
          {generatedImage && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Indir
            </button>
          )}
        </div>

        {/* Output Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Özel JSON Prompt Sonuçları Paneli */}
          {(showSpecialJsonPanel || specialJsonPrompts.length > 0) && (
            <div className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-mode-accent to-primary flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Özel Çekim JSON Promptları ({specialJsonPrompts.length}/{SPECIAL_SHOT_SCALES.length})
                </h3>
                <button
                  onClick={() => {
                    setShowSpecialJsonPanel(false);
                    setSpecialJsonPrompts([]);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isGeneratingSpecialJsons && specialJsonPrompts.length < SPECIAL_SHOT_SCALES.length && (
                <div className="p-4 flex items-center justify-center gap-3 bg-white/50">
                  <Loader2 className="w-5 h-5 text-mode-accent animate-spin" />
                  <span className="text-sm text-mode-accent">
                    {specialJsonPrompts.length + 1}. JSON oluşturuluyor...
                  </span>
                </div>
              )}

              <div className="max-h-[400px] overflow-y-auto">
                {specialJsonPrompts.map((item, index) => (
                  <div key={item.id} className="border-b border-amber-100 last:border-b-0">
                    <button
                      onClick={() => toggleSpecialJsonExpand(index)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-mode-accent text-white text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${item.expanded ? 'rotate-180' : ''}`} />
                    </button>

                    {item.expanded && (
                      <div className="px-4 pb-4">
                        <div className="relative">
                          <pre className="bg-gray-900 text-green-400 text-[10px] p-3 rounded-lg overflow-x-auto font-mono max-h-48 overflow-y-auto">
                            {item.json}
                          </pre>
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(item.json);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                            title="JSON Kopyala"
                          >
                            <Copy className="w-3 h-3 text-gray-300" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {specialJsonPrompts.length === SPECIAL_SHOT_SCALES.length && !isGeneratingSpecialJsons && (
                <div className="p-3 bg-amber-100/50 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Tüm JSON'lar hazır!</span>
                  <button
                    onClick={async () => {
                      const allJsons = specialJsonPrompts.map(p => `// ${p.label}\n${p.json}`).join('\n\n');
                      await navigator.clipboard.writeText(allJsons);
                    }}
                    className="ml-2 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors"
                  >
                    Tümünü Kopyala
                  </button>
                </div>
              )}
            </div>
          )}

          {!result && !isGenerating && !isGeneratingImage && !showSpecialJsonPanel ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Clapperboard className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">Henuz sonuc yok</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Sol taraftan bir referans gorsel yukleyin ve kamera ayarlarini secin.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4">
                <Loader2 className="w-10 h-10 text-mode-accent animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Prompt Olusturuluyor...</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                AI Yonetmen sahneyi analiz ediyor.
              </p>
            </div>
          ) : isGeneratingImage ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Gorsel Uretiliyor...</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Sinematik gorsel olusturuluyor.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Generated Image & Reference Comparison */}
              {generatedImage && sourcePreview && (
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Image className="w-4 h-4 text-emerald-500" />
                    Sonuc Karsilastirmasi
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 text-center">Referans</p>
                      <img
                        src={sourcePreview}
                        alt="Referans"
                        className="w-full max-h-[320px] object-contain rounded-xl bg-gray-50 border border-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 text-center">Uretilen</p>
                      <img
                        src={generatedImage}
                        alt="Uretilen"
                        className="w-full max-h-[320px] object-contain rounded-xl bg-gray-50 border border-gray-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Generated Image Only (when no source preview) */}
              {generatedImage && !sourcePreview && (
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Image className="w-4 h-4 text-emerald-500" />
                    Uretilen Gorsel
                  </h3>
                  <img
                    src={generatedImage}
                    alt="Uretilen"
                    className="max-w-md max-h-[400px] object-contain rounded-xl bg-gray-50 mx-auto"
                  />
                </div>
              )}

              {/* JSON Output */}
              {result && (
                <div className="bg-gray-900 rounded-2xl p-6 shadow-xl">
                  <pre className="text-mode-accent text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Kadir Toplu Uretim Sonuclari */}
          {(isGeneratingAllKadir || kadirImages.length > 0) && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" />
                  Kadir Toplu Uretim
                  {isGeneratingAllKadir && (
                    <span className="ml-2 text-xs text-primary font-normal">
                      {kadirProgress}/6 olusturuluyor...
                    </span>
                  )}
                </h3>

                {/* Hepsini Indir Butonu */}
                {kadirImages.length > 0 && !isGeneratingAllKadir && (
                  <button
                    onClick={() => {
                      kadirImages.forEach((img, index) => {
                        setTimeout(() => {
                          const link = document.createElement('a');
                          link.href = img.url;
                          link.download = `${img.id}-${Date.now()}.png`;
                          link.click();
                        }, index * 500);
                      });
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary to-indigo-500 text-white text-xs font-medium rounded-lg hover:from-primary/90 hover:to-indigo-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Hepsini Indir ({kadirImages.length})
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {isGeneratingAllKadir && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(kadirProgress / 6) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Kadir Images - Horizontal Scrollable */}
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                  {kadirImages.map((img) => (
                    <div key={img.id} className="relative group flex-shrink-0" style={{ width: '200px' }}>
                      <img
                        src={img.url}
                        alt={img.id}
                        className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200 hover:border-secondary transition-colors cursor-pointer"
                        onClick={() => window.open(img.url, '_blank')}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg p-2 flex items-center justify-between">
                        <span className="text-white text-xs font-medium uppercase">{img.id}</span>
                        {/* Tek Tek Indir Butonu */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = img.url;
                            link.download = `${img.id}-${Date.now()}.png`;
                            link.click();
                          }}
                          className="p-1.5 bg-white/20 hover:bg-white/40 rounded-md transition-colors"
                          title="Indir"
                        >
                          <Download className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Placeholder boxes for remaining */}
                  {isGeneratingAllKadir && Array.from({ length: 6 - kadirImages.length }).map((_, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="flex-shrink-0 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50"
                      style={{ width: '200px', aspectRatio: '3/4' }}
                    >
                      {i === 0 ? (
                        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
                      ) : (
                        <span className="text-gray-300 text-xs">Bekliyor</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptArchitectMode;
