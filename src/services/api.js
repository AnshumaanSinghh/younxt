/**
 * Client-Side AI Router — Production Hardened
 * 
 * 3-Model Intelligent Cascade: Groq → Gemini → OpenRouter
 * Implements complexity-based routing, explainable AI, and future simulation.
 * 
 * SECURITY NOTE: On Firebase Spark (Free) plan, Cloud Functions are unavailable.
 * Keys are injected via EXPO_PUBLIC_ env vars. For production at scale,
 * migrate to Firebase Blaze + Cloud Functions or Cloudflare Workers.
 */
import { generateFallbackSuggestion } from './fallback';
import { isRateLimited } from '../utils/security';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

// ──────────────────────────────────────────────
// System Prompt Builder
// ──────────────────────────────────────────────

const buildSystemPrompt = (
  mood, 
  mode, 
  goals, 
  hobbies, 
  level, 
  strategy = 'Improve Current Path',
  simulationMode = false,
  recentLogs = [],
  isRefinement = false, 
  previousContext = null, 
  userFeedback = null
) => {
  let prompt = `
You are YouNxt AI, a high-performance "Future Simulation Engine" designed to predict outcomes and guide users toward optimal decisions.

Core directives:
- Analyze the user's intent, mood, and behavioral context.
- Provide highly specific, actionable, personalized suggestions.
- NEVER give generic or repetitive motivation. Be extremely specific and unique every time.
- Adapt tone dynamically:
   - Sad/Stressed → supportive, empathetic
   - Confused → structured, step-by-step guidance
   - Motivated/Happy → challenge them, push forward
   - 'survival' mode → comforting, small achievable steps
   - 'growth' mode → challenging, inspiring, demanding focus

User Context:
- Current Mood: ${mood}
- Selected Mode: ${mode}
- Experience Level: ${level || 'beginner'}
- Goals: ${goals?.length > 0 ? goals.join(", ") : 'General self-improvement'}
- Hobbies: ${hobbies?.length > 0 ? hobbies.join(", ") : 'Various'}
- Active Strategy: ${strategy}
`;

  // Behavioral Memory injection
  if (recentLogs && recentLogs.length > 0) {
    const memoryContext = recentLogs
      .filter(l => l && l.motivationalLine)
      .map(l => l.motivationalLine)
      .join(' | ');
    if (memoryContext) {
      prompt += `
Behavioral Memory (last ${recentLogs.length} sessions):
The user recently focused on: ${memoryContext}.
Briefly acknowledge their recent consistency in your reasoning (e.g., "You've been working on X — let's build on that...").
`;
    }
  }

  // Strategy-specific instructions
  if (strategy === 'Experiment Mode') {
    prompt += `
STRATEGY: EXPERIMENT MODE
Suggest highly unconventional, risky, or completely novel ideas that push the user far outside their comfort zone. Be bold and creative.
`;
  } else if (strategy === 'Try Something New') {
    prompt += `
STRATEGY: TRY SOMETHING NEW
Suggest a completely new hobby, skill, or life direction unrelated to their current goals. Refresh their perspective entirely.
`;
  }

  // Refinement context
  if (isRefinement && previousContext && userFeedback) {
    prompt += `
---
DEEP DIVE / REFINEMENT MODE:
Previous Suggestion: "${previousContext}"
User's Feedback: "${userFeedback}"

Provide a DEEPER, more tailored response based directly on their feedback.
Give highly specific, progressive tasks that build upon their exact situation.
The tone should feel like a mentor giving specialized, advanced advice.
---
`;
  }

  // Output schema
  prompt += `

Output Format: You MUST return ONLY a valid JSON object matching this schema exactly.
{
  "motivationalLine": "A single powerful sentence spoken from the future self perspective.",
  "actionSteps": [
    "Step 1: [Short Title] - [Actionable Description]",
    "Step 2: [Short Title] - [Actionable Description]",
    "Step 3: [Short Title] - [Actionable Description]"
  ],
  "confidenceScore": <integer between 75 and 99>,
  "confidenceReason": "A 1-2 sentence explanation of WHY you chose this advice based on their profile and behavioral memory."`;

  if (simulationMode) {
    prompt += `,
  "simulation": {
    "optionA": {
      "title": "If you follow this advice",
      "days7": "Concrete short-term positive outcome",
      "days30": "Concrete mid-term positive outcome",
      "days90": "Concrete long-term positive outcome"
    },
    "optionB": {
      "title": "If you skip this",
      "days7": "Concrete short-term consequence",
      "days30": "Concrete mid-term consequence",
      "days90": "Concrete long-term consequence"
    }
  }
}
`;
  } else {
    prompt += `
}
`;
  }

  return prompt;
};

// ──────────────────────────────────────────────
// AI Provider Functions
// ──────────────────────────────────────────────

const callGroq = async (promptText) => {
  if (!GROQ_API_KEY) throw new Error("Groq API key not configured");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: promptText },
        { role: "user", content: "Generate my next move based on my current state. Return valid JSON only." }
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      temperature: 0.8,
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Groq HTTP ${response.status}: ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty content");
  return JSON.parse(content);
};

const callGemini = async (promptText) => {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: promptText + "\nGenerate my next move. Return ONLY valid JSON." }] }
      ],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Gemini HTTP ${response.status}: ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Gemini returned empty content");
  return JSON.parse(content);
};

const callOpenRouter = async (promptText) => {
  if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API key not configured");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://younxt-f02fa.web.app",
      "X-Title": "YouNxt AI"
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: promptText },
        { role: "user", content: "Generate my next move based on my current state. Return valid JSON only." }
      ],
      model: "meta-llama/llama-3.1-8b-instruct:free",
      response_format: { type: "json_object" },
      temperature: 0.8,
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`OpenRouter HTTP ${response.status}: ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return JSON.parse(content);
};

// ──────────────────────────────────────────────
// Observability: Request Telemetry
// ──────────────────────────────────────────────

const PROVIDER_NAMES = new Map([
  [callGroq, 'Groq (Llama 3.1 8B)'],
  [callGemini, 'Gemini (1.5 Flash)'],
  [callOpenRouter, 'OpenRouter (Llama 3.1)'],
]);

/**
 * Decision-based cascade router with observability.
 * Logs: model selected, latency (ms), success/failure, fallback chain.
 */
const cascadeCall = async (providers, prompt, routingReason = 'default') => {
  const telemetry = { routingReason, attempts: [], totalLatencyMs: 0 };
  const routeStart = Date.now();

  for (const provider of providers) {
    const modelName = PROVIDER_NAMES.get(provider) || 'Unknown';
    const attemptStart = Date.now();

    try {
      const result = await provider(prompt);
      const latencyMs = Date.now() - attemptStart;

      // Validate minimum schema
      if (result && result.motivationalLine && Array.isArray(result.actionSteps) && result.actionSteps.length > 0) {
        telemetry.attempts.push({ model: modelName, status: 'SUCCESS', latencyMs });
        telemetry.totalLatencyMs = Date.now() - routeStart;
        telemetry.selectedModel = modelName;
        console.log(`[AI Router] ✅ ${modelName} | ${latencyMs}ms | Reason: ${routingReason}`, telemetry);

        // Attach routing metadata to result for UI display
        result._routing = { model: modelName, latencyMs, reason: routingReason };
        return result;
      }

      telemetry.attempts.push({ model: modelName, status: 'INVALID_SCHEMA', latencyMs });
      console.warn(`[AI Router] ⚠️ ${modelName} returned invalid schema (${latencyMs}ms), cascading...`);
    } catch (err) {
      const latencyMs = Date.now() - attemptStart;
      telemetry.attempts.push({ model: modelName, status: 'FAILED', latencyMs, error: err.message });
      console.warn(`[AI Router] ❌ ${modelName} failed (${latencyMs}ms): ${err.message}`);
    }
  }

  telemetry.totalLatencyMs = Date.now() - routeStart;
  console.error(`[AI Router] 🔴 All providers failed after ${telemetry.totalLatencyMs}ms`, telemetry);
  return null;
};

// ──────────────────────────────────────────────
// Main Function Exports
// ──────────────────────────────────────────────

/**
 * Generate a suggestion via the intelligent AI router.
 * Routes based on query complexity:
 *   - Quick advice → Groq (speed) → Gemini → OpenRouter → Fallback
 *   - Deep reasoning → Gemini (depth) → OpenRouter → Groq → Fallback
 */
export const generateSuggestion = async ({ mood, mode, strategy = 'Improve Current Path', simulationMode = false, goals = [], hobbies = [], level = 'beginner', recentLogs = [] }) => {
  if (isRateLimited('generate_suggestion', 15, 60000)) {
    console.warn("Rate limit hit. Using fallback.");
    return generateFallbackSuggestion({ mood, mode, goals, hobbies, recentLogs });
  }

  const systemPrompt = buildSystemPrompt(mood, mode, goals, hobbies, level, strategy, simulationMode, recentLogs);

  // Determine routing based on complexity
  const requiresDeepReasoning = simulationMode || strategy === 'Experiment Mode' || mood === 'sad' || mood === 'overwhelmed';

  const routingReason = requiresDeepReasoning
    ? `deep_reasoning(sim=${simulationMode},strat=${strategy},mood=${mood})`
    : `quick_advice(mood=${mood},strat=${strategy})`;

  const providers = requiresDeepReasoning
    ? [callGemini, callOpenRouter, callGroq]
    : [callGroq, callGemini, callOpenRouter];

  const result = await cascadeCall(providers, systemPrompt, routingReason);

  if (!result) {
    console.warn("All AI providers failed. Using local fallback.");
    return generateFallbackSuggestion({ mood, mode, goals, hobbies, recentLogs });
  }

  return result;
};

/**
 * Refine a suggestion (Deep Dive). Always uses deep-reasoning cascade.
 */
export const refineSuggestion = async ({ mood, mode, strategy = 'Improve Current Path', simulationMode = false, goals = [], hobbies = [], level = 'beginner', recentLogs = [], previousContext, userFeedback }) => {
  if (isRateLimited('refine_suggestion', 10, 60000)) {
    throw new Error("Too many requests. Please wait a moment.");
  }

  const systemPrompt = buildSystemPrompt(mood, mode, goals, hobbies, level, strategy, simulationMode, recentLogs, true, previousContext, userFeedback);

  // Refinement always uses deep-reasoning cascade
  const result = await cascadeCall([callGemini, callOpenRouter, callGroq], systemPrompt, 'deep_dive_refinement');

  if (!result) {
    throw new Error("AI failed to refine the suggestion. Please try again.");
  }

  return result;
};

/**
 * Generate a completely new direction (Try Something New).
 */
export const generateNewDirection = async ({ goals = [], hobbies = [], level = 'beginner', simulationMode = false, recentLogs = [] }) => {
  if (isRateLimited('generate_new_direction', 10, 60000)) {
    throw new Error("Too many requests. Please wait a moment.");
  }

  const systemPrompt = buildSystemPrompt('neutral', 'growth', goals, hobbies, level, 'Try Something New', simulationMode, recentLogs);

  const result = await cascadeCall([callGroq, callOpenRouter, callGemini], systemPrompt, 'try_something_new');

  if (!result) {
    throw new Error("AI failed to generate a new direction. Please try again.");
  }

  return result;
};
