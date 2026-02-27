import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Reuse existing app or initialize
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development' && process.env.USE_EMULATOR === 'true') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

const geminiProxyCallable = httpsCallable(functions, 'geminiProxy', {
  timeout: 300000, // 5 minutes
});

/**
 * Calls the Gemini API through the Cloud Function proxy.
 * This replaces direct `ai.models.generateContent()` calls.
 *
 * @param model - Gemini model name (e.g. 'gemini-3-pro-image-preview')
 * @param contents - The contents object (parts with inlineData and text)
 * @param config - Generation config (aspectRatio, safetySettings, etc.)
 * @returns The raw response matching Gemini's generateContent response format
 */
export const callGeminiProxy = async (
  model: string,
  contents: any,
  config?: any
): Promise<any> => {
  try {
    const result = await geminiProxyCallable({ model, contents, config });
    // Wrap in the same shape as Gemini SDK response for compatibility
    return {
      candidates: [
        {
          content: {
            parts: (result.data as any).parts,
          },
        },
      ],
    };
  } catch (error: any) {
    // Map Firebase function errors back to the format geminiService expects
    if (error.code === 'functions/resource-exhausted') {
      const err = new Error('Rate limit exceeded (429)') as any;
      err.status = 429;
      throw err;
    }
    if (error.code === 'functions/failed-precondition') {
      throw new Error(error.message || 'Safety filter blocked the content.');
    }
    if (error.code === 'functions/unauthenticated') {
      throw new Error('Oturum açmanız gerekiyor. Lütfen giriş yapın.');
    }
    throw error;
  }
};

const imagenProxyCallable = httpsCallable(functions, 'imagenProxy', {
  timeout: 300000,
});

/**
 * Calls the Imagen API through the Cloud Function proxy.
 * This replaces direct `ai.models.generateImages()` calls.
 */
export const callImagenProxy = async (
  model: string,
  prompt: string,
  config?: any
): Promise<any> => {
  try {
    const result = await imagenProxyCallable({ model, prompt, config });
    const data = result.data as any;
    return {
      generatedImages: data.generatedImages.map((img: any) => ({
        image: {
          imageBytes: img.imageBytes,
          mimeType: img.mimeType,
        },
      })),
    };
  } catch (error: any) {
    if (error.code === 'functions/resource-exhausted') {
      const err = new Error('Rate limit exceeded (429)') as any;
      err.status = 429;
      throw err;
    }
    if (error.code === 'functions/unauthenticated') {
      throw new Error('Oturum açmanız gerekiyor. Lütfen giriş yapın.');
    }
    throw error;
  }
};
