<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CGTRYON - AI-Powered Fashion Content Platform

CGTRYON is a full-featured AI fashion content generation platform built for e-commerce brands, fashion photographers, and creative agencies. It leverages Google Gemini's image generation capabilities to produce photorealistic fashion visuals — from virtual try-ons to full advertising creatives — without the need for traditional photoshoots.

## What It Does

Upload product photos, choose a model style, pick a scene, and let AI generate studio-quality fashion imagery in seconds. The platform covers the entire fashion content pipeline:

- **Model Studio** — Generate AI models wearing your products with full control over gender, ethnicity, body type, pose, and background.
- **Virtual Try-On (V1 / V2 / V3)** — Swap outfits onto target model photos with identity and garment preservation.
- **Collections** — Combine multiple product reference images, a model, and a scene to produce cohesive collection lookbook shots.
- **Ad Creative** — Generate ready-to-publish advertising visuals with theme-based scene composition.
- **Men's & Women's Fashion** — Dedicated modes with gender-specific pose, styling, and background options.
- **Jewelry Mode** — Specialized generation for rings, necklaces, and accessories with stand/background customization.
- **Style Selector** — Apply predefined visual styles to product imagery.
- **Image Upscale** — Enhance resolution and detail of generated or uploaded images.
- **Prompt Architect** — Advanced mode for crafting custom generation prompts.
- **Personas** — Create and reuse AI model personas across sessions.
- **Product Annotation** — Annotate and tag product regions for more precise generation.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Lucide Icons |
| AI Engine | Google Gemini API (`@google/genai`) |
| Backend | Firebase (Auth, Firestore, Storage) |
| Charts | Recharts |
| Drag & Drop | dnd-kit |

## Getting Started

**Prerequisites:** Node.js (v18+)

1. Clone the repository:
   ```bash
   git clone https://github.com/AhmetCanGunes/cgtryon.git
   cd cgtryon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file from the example and add your API keys:
   ```bash
   cp .env.example .env.local
   ```
   Set `GEMINI_API_KEY` and your Firebase config values.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── App.tsx                  # Main application router & state
├── index.tsx                # Entry point
├── types.ts                 # Shared TypeScript types & constants
├── components/
│   ├── CollectionsMode.tsx   # Collection lookbook generation
│   ├── AdCreativeMode.tsx    # Ad creative generation
│   ├── MensFashionMode.tsx   # Men's fashion mode
│   ├── WomensFashionMode.tsx # Women's fashion mode
│   ├── JewelryMode.tsx       # Jewelry product mode
│   ├── VirtualTryOnMode.tsx  # Virtual try-on (V1)
│   ├── VirtualTryOnModeV2.tsx
│   ├── VirtualTryOnModeV3.tsx
│   ├── UpscaleMode.tsx       # Image upscaling
│   ├── ModelStudio/          # Model generation studio
│   ├── Dashboard/            # Analytics dashboard
│   ├── AdminPanel/           # Admin controls
│   └── ...
├── services/
│   ├── geminiService.ts      # Gemini AI API integration
│   ├── firebase.ts           # Firebase auth, storage, Firestore
│   └── exchangeRateService.ts
└── public/                   # Static assets
```

## License

This project is proprietary. All rights reserved.
