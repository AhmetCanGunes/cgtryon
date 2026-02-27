// Anti-Glow Module for PNG Model Integration
// Reduces waxy/highlight glow effect and naturally integrates model with background

export const MODEL_ANTIGLOW_PRESET = {
  highlightThreshold: 208,
  highlightReduce: 0.26,
  exposure: -0.03,
  contrast: 0.07,
  saturation: -0.05,
  gamma: 1.03,
  contactShadowIntensity: 0.24,
  contactShadowWidth: 0.58,
  contactShadowHeight: 0.06
};

export type AntiGlowPreset = typeof MODEL_ANTIGLOW_PRESET;

const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Draws PNG model with anti-glow processing
 * Steps: highlight compression + exposure/contrast adjustment + saturation taming
 */
export function drawPngModelWithAntiGlow(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  preset: AntiGlowPreset = MODEL_ANTIGLOW_PRESET
) {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.floor(w));
  off.height = Math.max(1, Math.floor(h));
  const o = off.getContext("2d", { willReadFrequently: true })!;
  o.clearRect(0, 0, off.width, off.height);
  o.drawImage(img, 0, 0, w, h);

  const im = o.getImageData(0, 0, off.width, off.height);
  const d = im.data;

  const {
    highlightThreshold,
    highlightReduce,
    exposure,
    contrast,
    saturation,
    gamma
  } = preset;

  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a === 0) continue;

    const r0 = d[i], g0 = d[i + 1], b0 = d[i + 2];
    const lum = 0.2126 * r0 + 0.7152 * g0 + 0.0722 * b0;

    // Highlight compression factor
    const t = lum > highlightThreshold ? (lum - highlightThreshold) / (255 - highlightThreshold) : 0;
    const hl = t * t;

    let r = r0 / 255, g = g0 / 255, b = b0 / 255;

    // Exposure adjustment
    r += exposure; g += exposure; b += exposure;

    // Contrast adjustment
    r = (r - 0.5) * (1 + contrast) + 0.5;
    g = (g - 0.5) * (1 + contrast) + 0.5;
    b = (b - 0.5) * (1 + contrast) + 0.5;

    // Gamma correction
    r = Math.pow(Math.max(0, r), 1 / gamma);
    g = Math.pow(Math.max(0, g), 1 / gamma);
    b = Math.pow(Math.max(0, b), 1 / gamma);

    // Saturation adjustment
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = lerp(r, gray, -saturation);
    g = lerp(g, gray, -saturation);
    b = lerp(b, gray, -saturation);

    // Apply highlight reduction
    const reduce = 1 - highlightReduce * hl;
    r *= reduce; g *= reduce; b *= reduce;

    d[i]     = clamp255(r * 255);
    d[i + 1] = clamp255(g * 255);
    d[i + 2] = clamp255(b * 255);
  }

  o.putImageData(im, 0, 0);
  ctx.drawImage(off, x, y, w, h);
}

/**
 * Draws contact shadow under the model
 * Removes the "cut-out" feel by adding a soft oval shadow at the feet
 */
export function drawContactShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  preset: AntiGlowPreset = MODEL_ANTIGLOW_PRESET
) {
  const shadowY = y + h - h * 0.02;
  const shadowW = w * (preset.contactShadowWidth ?? 0.58);
  const shadowH = h * (preset.contactShadowHeight ?? 0.06);

  ctx.save();
  ctx.globalAlpha = preset.contactShadowIntensity ?? 0.22;

  const grd = ctx.createRadialGradient(
    x + w / 2, shadowY, shadowH * 0.2,
    x + w / 2, shadowY, shadowW / 2
  );
  grd.addColorStop(0, "rgba(0,0,0,1)");
  grd.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, shadowY, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Complete model drawing with anti-glow and contact shadow
 * Use this function for full pipeline
 */
export function drawModelWithFullAntiGlow(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  preset: AntiGlowPreset = MODEL_ANTIGLOW_PRESET
) {
  // 1. Draw contact shadow first (under the model)
  drawContactShadow(ctx, x, y, w, h, preset);

  // 2. Draw model with anti-glow processing
  drawPngModelWithAntiGlow(ctx, img, x, y, w, h, preset);
}

/**
 * Applies anti-glow processing to an image and returns as base64
 * For use when you need to process the image before sending to API
 */
export async function processImageWithAntiGlow(
  imageDataUrl: string,
  preset: AntiGlowPreset = MODEL_ANTIGLOW_PRESET
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw with anti-glow processing
      drawPngModelWithAntiGlow(ctx, img, 0, 0, img.width, img.height, preset);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}

/**
 * Presets for different scenarios
 */
export const ANTIGLOW_PRESETS = {
  // Default balanced preset
  default: MODEL_ANTIGLOW_PRESET,

  // For very bright/glossy images - more aggressive
  highGlow: {
    ...MODEL_ANTIGLOW_PRESET,
    highlightThreshold: 200,
    highlightReduce: 0.30,
    exposure: -0.05,
    contrast: 0.10,
  },

  // For already matte images - gentle touch
  subtle: {
    ...MODEL_ANTIGLOW_PRESET,
    highlightThreshold: 220,
    highlightReduce: 0.18,
    exposure: -0.02,
    contrast: 0.04,
  },

  // For dark scenes - preserve shadows
  darkScene: {
    ...MODEL_ANTIGLOW_PRESET,
    highlightThreshold: 195,
    highlightReduce: 0.22,
    exposure: -0.06,
    contrast: 0.05,
    gamma: 1.05,
  },

  // For outdoor/natural light scenes
  naturalLight: {
    ...MODEL_ANTIGLOW_PRESET,
    highlightThreshold: 210,
    highlightReduce: 0.24,
    exposure: -0.02,
    contrast: 0.06,
    saturation: -0.03,
  }
};
