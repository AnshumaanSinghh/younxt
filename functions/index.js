/**
 * YouNxt Cloud Functions
 * AI Router: Attempts to use Groq first, falls back to Gemini if it fails.
 * Includes input validation, rate limiting, and sanitization.
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

// 1. Import SDKs
const Groq = require("groq-sdk");
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

admin.initializeApp();

// 2. Initialize Clients (Lazy initialization to handle missing keys gracefully)
let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

let geminiClient = null;
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// ──────────────────────────────────────────────
// Input Sanitization
// ──────────────────────────────────────────────

const sanitizeString = (input, maxLen = 200) => {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim().substring(0, maxLen);
};

const sanitizeArray = (input, maxItems = 10, maxItemLen = 100) => {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, maxItems)
    .map((item) => sanitizeString(item, maxItemLen))
    .filter((item) => item.length > 0);
};

const VALID_MOODS = ["stressed", "tired", "happy", "overwhelmed", "neutral"];
const VALID_MODES = ["survival", "growth", "balanced"];
const VALID_LEVELS = ["beginner", "intermediate", "advanced"];

// ──────────────────────────────────────────────
// Rate Limiting (per user, in-memory)
// ──────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

const checkRateLimit = (uid) => {
  const now = Date.now();
  const record = rateLimitMap.get(uid) || { calls: [] };
  record.calls = record.calls.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (record.calls.length >= RATE_LIMIT_MAX) {
    return false; // Rate limited
  }

  record.calls.push(now);
  rateLimitMap.set(uid, record);
  return true; // Allowed
};

// ──────────────────────────────────────────────
// Helper: System Prompt Builder
// ──────────────────────────────────────────────
const buildSystemPrompt = (mood, mode, goals, hobbies, level) => {
  return `
You are YouNxt AI, a high-performance "Future Self Decision Engine" designed to guide users toward better decisions, habits, and life outcomes.

Your role is not just to answer, but to:
- Analyze the user's intent, mood, and context
- Provide actionable, personalized suggestions
- Help users improve their future self consistently

CORE BEHAVIOR:
1. Always prioritize clarity, usefulness, and actionability
2. Give direct, practical advice (not generic motivation)
3. Keep responses concise but impactful
4. Adapt tone based on user mood:
   - Sad -> supportive
   - Confused -> structured guidance
   - Motivated -> challenge and push forward
   - If mode is 'survival': comforting, empathetic, small steps.
   - If mode is 'growth': challenging, inspiring, demanding focus.

INTELLIGENT DECISION MODE:
Classify user intent (decision / emotional / productivity / habit / exploration).
For simple queries -> give fast, direct answers.
For complex or emotional queries -> give deeper structured guidance.

DYNAMIC USER OPTIONS:
Always provide at least 2-4 actionable options when relevant.

User Context:
- Current Mood: ${mood}
- Selected Mode: ${mode}
- Experience Level: ${level || "beginner"}
- Goals: ${goals?.length > 0 ? goals.join(", ") : "General self-improvement"}
- Hobbies: ${hobbies?.length > 0 ? hobbies.join(", ") : "Various"}

Output Format: You MUST return ONLY a valid JSON object matching this schema exactly. Do not wrap it in markdown block quotes.
{
  "motivationalLine": "A single powerful sentence spoken from the future self perspective.",
  "actionSteps": [
    "Option 1: [Short Title] - [Actionable Description]",
    "Option 2: [Short Title] - [Actionable Description]",
    "Option 3: [Short Title] - [Actionable Description]"
  ]
}
`;
};

// ──────────────────────────────────────────────
// Providers
// ──────────────────────────────────────────────

const callGroq = async (promptText) => {
  if (!groqClient) throw new Error("Groq client not initialized");

  const completion = await groqClient.chat.completions.create({
    messages: [
      { role: "system", content: promptText },
      { role: "user", content: "Generate my next move based on my current state." },
    ],
    model: "llama3-8b-8192",
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const responseContent = completion.choices[0].message.content;
  return JSON.parse(responseContent);
};

const callGemini = async (promptText) => {
  if (!geminiClient) throw new Error("Gemini client not initialized");

  const model = geminiClient.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          motivationalLine: { type: SchemaType.STRING },
          actionSteps: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["motivationalLine", "actionSteps"],
      },
    },
  });

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: promptText }] },
      { role: "model", parts: [{ text: "Understood. I will follow these instructions and return the JSON." }] },
    ],
  });

  const result = await chat.sendMessage("Generate my next move based on my current state.");
  const responseText = result.response.text();
  return JSON.parse(responseText);
};

// ──────────────────────────────────────────────
// Main Function Export
// ──────────────────────────────────────────────

exports.generateSuggestion = onCall({ region: "us-central1" }, async (request) => {
  // 1. Validate Authentication
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const uid = request.auth.uid;

  // 2. Rate Limiting
  if (!checkRateLimit(uid)) {
    throw new HttpsError("resource-exhausted", "Too many requests. Please wait a moment.");
  }

  // 3. Input Validation & Sanitization
  const rawData = request.data || {};
  const mood = VALID_MOODS.includes(rawData.mood) ? rawData.mood : "neutral";
  const mode = VALID_MODES.includes(rawData.mode) ? rawData.mode : "balanced";
  const level = VALID_LEVELS.includes(rawData.level) ? rawData.level : "beginner";
  const goals = sanitizeArray(rawData.goals, 10, 100);
  const hobbies = sanitizeArray(rawData.hobbies, 10, 100);

  const systemPrompt = buildSystemPrompt(mood, mode, goals, hobbies, level);

  let result = null;
  let errors = [];

  // 4. AI Router Logic: Try Groq First
  try {
    logger.info("Attempting generation via Groq...");
    result = await callGroq(systemPrompt);
    logger.info("Successfully generated via Groq");
  } catch (error) {
    logger.warn(`Groq failed: ${error.message}`);
    errors.push("Groq unavailable");
  }

  // 5. AI Router Logic: Fallback to Gemini if Groq failed
  if (!result) {
    try {
      logger.info("Attempting generation via Gemini...");
      result = await callGemini(systemPrompt);
      logger.info("Successfully generated via Gemini");
    } catch (error) {
      logger.warn(`Gemini failed: ${error.message}`);
      errors.push("Gemini unavailable");
    }
  }

  // 6. Final Fallback: If both fail, trigger client-side fallback
  if (!result) {
    logger.error("All AI providers failed. Triggering client fallback.", { errors });
    throw new HttpsError("unavailable", "AI Engine is temporarily unavailable.");
  }

  // 7. Validate & sanitize AI response before returning
  const motivationalLine = sanitizeString(result.motivationalLine || "", 1000);
  const actionSteps = sanitizeArray(result.actionSteps || [], 5, 500);

  if (!motivationalLine || actionSteps.length === 0) {
    throw new HttpsError("internal", "AI generated an invalid response.");
  }

  return { motivationalLine, actionSteps };
});
