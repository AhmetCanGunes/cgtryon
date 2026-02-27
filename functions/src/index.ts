import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import { GoogleGenAI } from "@google/genai";
import * as admin from "firebase-admin";

admin.initializeApp();

const geminiApiKey = defineString("GEMINI_API_KEY");
const db = admin.firestore();

// Admin emails — must match the list in the client
const ADMIN_EMAILS = ["admin@kaapp.com"];

// ─── Model Whitelists ────────────────────────────────────────────
const ALLOWED_GEMINI_MODELS = [
  "gemini-3-pro-image-preview",
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
];

const ALLOWED_IMAGEN_MODELS = [
  "imagen-3.0-generate-002",
];

// ─── Rate Limiting Config ────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15;  // max 15 requests per minute per user

// ─── Payload Limits ──────────────────────────────────────────────
const MAX_PAYLOAD_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB

// ─── Allowed config keys (sanitize client config) ────────────────
const ALLOWED_CONFIG_KEYS = [
  "responseModalities",
  "temperature",
  "topP",
  "topK",
  "maxOutputTokens",
  "responseMimeType",
  "numberOfImages",
  "aspectRatio",
  "safetyFilterLevel",
  "personGeneration",
];

// ─── Helpers ─────────────────────────────────────────────────────

function isAdminUser(auth: { token: admin.auth.DecodedIdToken }): boolean {
  return auth.token.admin === true;
}

/**
 * Sanitize client-provided config to only allow known keys.
 */
function sanitizeConfig(config: any): Record<string, any> {
  if (!config || typeof config !== "object") return {};
  const sanitized: Record<string, any> = {};
  for (const key of ALLOWED_CONFIG_KEYS) {
    if (key in config) {
      sanitized[key] = config[key];
    }
  }
  return sanitized;
}

/**
 * Check per-user rate limit using Firestore.
 * Returns true if within limit, throws if exceeded.
 */
async function checkRateLimit(uid: string): Promise<void> {
  const rateLimitRef = db.collection("rateLimits").doc(uid);
  const now = Date.now();

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(rateLimitRef);
    const data = doc.data();

    if (!data) {
      // First request ever
      transaction.set(rateLimitRef, {
        timestamps: [now],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return;
    }

    // Filter timestamps within the current window
    const recentTimestamps = (data.timestamps || []).filter(
      (ts: number) => now - ts < RATE_LIMIT_WINDOW_MS
    );

    if (recentTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
      throw new HttpsError(
        "resource-exhausted",
        "Too many requests. Please wait a moment and try again."
      );
    }

    // Add current timestamp and keep only recent ones
    recentTimestamps.push(now);
    transaction.update(rateLimitRef, {
      timestamps: recentTimestamps,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
}

/**
 * Verify user has credits and deduct 1 credit atomically.
 * Admins are exempt from credit checks.
 */
async function verifyAndDeductCredit(
  uid: string,
  isAdmin: boolean
): Promise<void> {
  if (isAdmin) return; // Admins bypass credit check

  const userRef = db.collection("users").doc(uid);

  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists) {
      throw new HttpsError(
        "failed-precondition",
        "User profile not found. Please register first."
      );
    }

    const userData = userDoc.data()!;
    const currentCredits = userData.credits || 0;

    if (currentCredits < 1) {
      throw new HttpsError(
        "failed-precondition",
        "Insufficient credits. Please purchase more credits."
      );
    }

    transaction.update(userRef, {
      credits: admin.firestore.FieldValue.increment(-1),
    });
  });
}

/**
 * Estimate payload size from request data.
 */
function estimatePayloadSize(data: any): number {
  try {
    return JSON.stringify(data).length;
  } catch {
    return 0;
  }
}

// ─── Cloud Functions ─────────────────────────────────────────────

/**
 * Set admin custom claims on a user.
 * Can only be called by an existing admin.
 */
export const setAdminClaim = onCall(
  { maxInstances: 5, cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    if (!isAdminUser(request.auth as any)) {
      throw new HttpsError("permission-denied", "Only admins can set claims.");
    }

    const { targetUid, isAdmin } = request.data;
    if (!targetUid) {
      throw new HttpsError("invalid-argument", "targetUid is required.");
    }

    await admin.auth().setCustomUserClaims(targetUid, { admin: !!isAdmin });
    return { success: true };
  }
);

/**
 * Bootstrap: set admin claims based on ADMIN_EMAILS list.
 */
export const bootstrapAdmin = onCall(
  { maxInstances: 1, cors: true },
  async (request) => {
    if (!request.auth?.token?.email) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const callerEmail = request.auth.token.email.toLowerCase();
    if (!ADMIN_EMAILS.includes(callerEmail)) {
      throw new HttpsError(
        "permission-denied",
        "Your email is not in the admin list."
      );
    }

    await admin
      .auth()
      .setCustomUserClaims(request.auth.uid, { admin: true });

    return {
      success: true,
      message: "Admin claims set. Sign out and back in to activate.",
    };
  }
);

/**
 * Gemini proxy — generateContent
 * Validates model, checks credits, rate limits, sanitizes config.
 */
export const geminiProxy = onCall(
  {
    maxInstances: 20,
    timeoutSeconds: 300,
    memory: "1GiB",
    enforceAppCheck: false, // TODO: set to true after configuring reCAPTCHA Enterprise in Firebase Console
    cors: true,
  },
  async (request) => {
    // 1. Auth check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;
    const admin_user = isAdminUser(request.auth as any);
    const { model, contents, config } = request.data;

    // 2. Validate required fields
    if (!model || !contents) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: model, contents"
      );
    }

    // 3. Model whitelist
    if (!ALLOWED_GEMINI_MODELS.includes(model)) {
      throw new HttpsError(
        "invalid-argument",
        `Model not allowed: ${model}`
      );
    }

    // 4. Payload size check
    const payloadSize = estimatePayloadSize(request.data);
    if (payloadSize > MAX_PAYLOAD_SIZE_BYTES) {
      throw new HttpsError(
        "invalid-argument",
        "Request payload too large. Please use smaller images."
      );
    }

    // 5. Per-user rate limiting
    await checkRateLimit(uid);

    // 6. Credit check & deduction (before API call)
    await verifyAndDeductCredit(uid, admin_user);

    // 7. Sanitize config
    const safeConfig = sanitizeConfig(config);

    // 8. Call Gemini API
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });

      const response = await ai.models.generateContent({
        model,
        contents,
        config: safeConfig,
      });

      const candidates = response?.candidates;
      if (!candidates || candidates.length === 0) {
        throw new HttpsError("internal", "No candidates in API response");
      }

      const candidate = candidates[0];

      if (candidate.finishReason === "SAFETY") {
        throw new HttpsError(
          "failed-precondition",
          "Content blocked by safety filter."
        );
      }

      const parts = candidate.content?.parts;
      if (!parts || parts.length === 0) {
        throw new HttpsError("internal", "No content parts in response");
      }

      return { parts, finishReason: candidate.finishReason };
    } catch (error: any) {
      if (error instanceof HttpsError) throw error;

      if (error.status === 429) {
        throw new HttpsError(
          "resource-exhausted",
          "Rate limit exceeded. Please wait and try again."
        );
      }

      console.error("Gemini API error:", error.message || error);
      throw new HttpsError(
        "internal",
        "AI generation failed. Please try again."
      );
    }
  }
);

/**
 * Imagen proxy — generateImages
 * Validates model, checks credits, rate limits, sanitizes config.
 */
export const imagenProxy = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 300,
    memory: "1GiB",
    enforceAppCheck: false, // TODO: set to true after configuring reCAPTCHA Enterprise in Firebase Console
    cors: true,
  },
  async (request) => {
    // 1. Auth check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;
    const admin_user = isAdminUser(request.auth as any);
    const { model, prompt, config } = request.data;

    // 2. Validate required fields
    if (!model || !prompt) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: model, prompt"
      );
    }

    // 3. Model whitelist
    if (!ALLOWED_IMAGEN_MODELS.includes(model)) {
      throw new HttpsError(
        "invalid-argument",
        `Model not allowed: ${model}`
      );
    }

    // 4. Prompt length check
    if (typeof prompt !== "string" || prompt.length > 10000) {
      throw new HttpsError(
        "invalid-argument",
        "Prompt must be a string under 10,000 characters."
      );
    }

    // 5. Per-user rate limiting
    await checkRateLimit(uid);

    // 6. Credit check & deduction
    await verifyAndDeductCredit(uid, admin_user);

    // 7. Sanitize config
    const safeConfig = sanitizeConfig(config);

    // 8. Call Imagen API
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });

      const response = await ai.models.generateImages({
        model,
        prompt,
        config: safeConfig,
      });

      if (
        !response.generatedImages ||
        response.generatedImages.length === 0
      ) {
        throw new HttpsError("internal", "No images generated");
      }

      const images = response.generatedImages.map((img: any) => ({
        imageBytes: img.image?.imageBytes || null,
        mimeType: img.image?.mimeType || "image/png",
      }));

      return { generatedImages: images };
    } catch (error: any) {
      if (error instanceof HttpsError) throw error;

      if (error.status === 429) {
        throw new HttpsError(
          "resource-exhausted",
          "Rate limit exceeded. Please wait and try again."
        );
      }

      console.error("Imagen API error:", error.message || error);
      throw new HttpsError(
        "internal",
        "Image generation failed. Please try again."
      );
    }
  }
);
