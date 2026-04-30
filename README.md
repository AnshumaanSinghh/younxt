# YouNxt — AI-Powered Future Simulation Engine

> **An AI decision engine that doesn't just advise — it simulates your future.**

YouNxt predicts life outcomes across 7, 30, and 90-day timelines using a 3-model AI cascade with behavioral memory and explainable confidence scoring.

**Live Demo:** [https://younxt-f02fa.web.app](https://younxt-f02fa.web.app)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    React Native (Expo)                    │
│              File-based Router + Context API              │
└────────────────────────┬─────────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │   BFF (Backend-for-Frontend) │
          │    Client-Side AI Router     │
          │   src/services/api.js        │
          └──────┬───────┬───────┬──────┘
                 │       │       │
          ┌──────▼──┐ ┌──▼───┐ ┌▼──────────┐
          │  Groq   │ │Gemini│ │ OpenRouter │
          │LPU Arch │ │1.5Fl │ │ Llama 3.1  │
          └────┬────┘ └──┬───┘ └─────┬──────┘
               │ fail    │ fail      │ fail
          ┌────▼─────────▼───────────▼──────┐
          │   Local Rule-Based Fallback     │
          │  15 mood×mode curated templates │
          └─────────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │     Firebase Firestore      │
          │   (Auth + NoSQL Database)   │
          └─────────────────────────────┘
```

### Why Client-Side AI Router (BFF Pattern)?

Firebase Cloud Functions require the **Blaze (pay-as-you-go) plan**. To operate entirely within the **free tier**, the AI orchestration runs client-side as a Backend-for-Frontend (BFF) pattern. The routing logic, schema validation, and fallback cascade are identical to what would run on a server — the function exists in `functions/index.js` and is ready to deploy once migrated to Blaze.

**Migration path:** When scaling to production with real users, move `api.js` logic to `functions/index.js` → deploy via `firebase deploy --only functions` → remove client-side keys.

---

## Decision-Based Model Routing

This is NOT a fallback system. The router makes an **active decision** about which model best fits the query *before* the first call is made:

```
User Input → Complexity Classifier
  ├─ Simple query (mood=happy, strategy=Improve) → Groq first (speed priority)
  ├─ Simulation enabled                         → Gemini first (reasoning priority)
  ├─ Experiment mode                             → Gemini first (creativity priority)
  └─ Emotional context (sad/overwhelmed)         → Gemini first (empathy priority)
```

| Decision Signal | Routed To | Reasoning |
|----------------|----------|----------|
| Quick advice, positive mood | **Groq** (Llama 3.1 8B) | Sub-second latency via LPU architecture |
| Future Simulation toggle ON | **Gemini** (1.5 Flash) | Superior reasoning for bifurcated timeline prediction |
| Experiment Mode selected | **Gemini** (1.5 Flash) | Larger context window for creative, unconventional ideas |
| Mood = sad / overwhelmed | **Gemini** (1.5 Flash) | Better emotional intelligence and empathy |
| Deep Dive refinement | **Gemini** (1.5 Flash) | Needs full prior context for iterative improvement |
| All primaries fail | **OpenRouter** (Llama 3.1) | Third-party redundancy layer |
| All AI providers fail | **Local Rule Engine** | 15 handcrafted mood×mode templates, zero latency |

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: Authenticated user accessing their own data
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId} {
      // Read/write own profile only
      allow read: if isOwner(userId);
      allow create: if isOwner(userId)
        && request.resource.data.name is string
        && request.resource.data.goals is list
        && request.resource.data.goals.size() <= 10;
      allow update: if isOwner(userId)
        && !request.resource.data.diff(resource.data)
            .affectedKeys().hasAny(['createdAt', 'email']);
      allow delete: if false;  // Admin only

      match /logs/{logId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId)
          && request.resource.data.motivationalLine is string
          && request.resource.data.actionSteps is list;
        allow update: if isOwner(userId)
          && request.resource.data.diff(resource.data)
              .affectedKeys().hasOnly(['completed']);
        allow delete: if isOwner(userId);  // Required for auto-cleanup
      }
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Key security decisions:**
- **Row-level isolation**: Users can ONLY access data where `request.auth.uid == userId`
- **Field-level protection**: `createdAt` and `email` cannot be modified after creation
- **Update restriction**: Only `completed` field can be toggled on logs
- **Controlled deletion**: Enabled for logs (required by 90-day auto-cleanup), blocked for profiles

---

## Cloud Function (Server-Side AI Router)

The server-side implementation exists at `functions/index.js` and includes:
- **Firebase Auth verification** (`request.auth` check)
- **Server-side rate limiting** (in-memory per-UID rolling window, 15 req/min)
- **Input whitelist validation** (only valid moods, modes, levels accepted)
- **Output sanitization** (HTML stripping, length capping)
- **Groq → Gemini cascade** with full error isolation

**Status:** Ready to deploy. Requires Firebase Blaze plan for Cloud Functions runtime.

---

## Smart Data Lifecycle

| Data Type | Retention | Reasoning |
|-----------|-----------|-----------|
| Logs WITH simulation data | **Forever** | Required for predicted-vs-actual reconciliation at 7/30/90 days |
| Logs WITHOUT simulation data | **90 days** | Keeps DB lean while preserving recent history |
| User profiles | **Forever** | Core user data |
| Favorites/likes | **Local (AsyncStorage)** | No Firestore cost |

---

## 📊 Observability

Every AI request is instrumented with structured telemetry logged to the browser console:

```
[AI Router] ✅ Groq (Llama 3.1 8B) | 847ms | Reason: quick_advice(mood=happy,strat=Improve Current Path)
```

**Tracked per request:**
| Metric | Example |
|--------|--------|
| Model Selected | `Gemini (1.5 Flash)` |
| Latency (ms) | `1203ms` |
| Routing Reason | `deep_reasoning(sim=true,strat=Experiment Mode,mood=neutral)` |
| Cascade Attempts | `[{Gemini: SUCCESS, 1203ms}]` or `[{Groq: FAILED, 502ms}, {Gemini: SUCCESS, 1100ms}]` |
| Status | `SUCCESS`, `FAILED`, `INVALID_SCHEMA` |

**What this enables:**
- Monitor which models are actually being used and their success rates
- Track average latency per routing decision type
- Detect provider outages by observing cascade depth
- Foundation for a future analytics dashboard (e.g., "Groq handles 72% of requests at avg 600ms")

Routing metadata is also exposed in the **UI** — each suggestion card displays the model name and response latency.

---

## 🔮 Signature Feature: Future Simulation Timeline

The primary differentiator from competitors (MIT Future You, MyFutureSelf, Mora):

When **Future Simulation** is toggled ON, the AI generates a **bifurcated outcome analysis**:

```
┌─────────────────────────────────────────────┐
│           FUTURE SIMULATION                 │
├─────────────────┬───────────────────────────┤
│  Follow Path ✅  │    Skip Path ❌           │
├─────────────────┼───────────────────────────┤
│  7d:  Build     │  7d:  No change           │
│       consistency│                           │
│ 30d:  Noticeable │  30d: Increased regret    │
│       improvement│       pattern              │
│ 90d:  Skill     │  90d: Stagnation          │
│       mastery    │                           │
└─────────────────┴───────────────────────────┘
```

**Key differences from competitors:**
- **Tabbed UI** — User switches between "Follow" and "Skip" timelines
- **Animated vertical timeline** — Each node (7d/30d/90d) fades in sequentially
- **Glowing dots** — Green for positive path, red for negative path
- **Data persistence** — Simulation predictions are stored forever in Firestore for future predicted-vs-actual reconciliation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native + Expo Router |
| State | Context API + useReducer |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Email/Password) |
| AI Models | Groq, Google Gemini, OpenRouter |
| Hosting | Firebase Hosting (CDN) |
| Animations | React Native Animated API |
| Typography | Google Fonts (Inter) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Fill in your API keys

# Start development server
npm run web

# Build for production
npx expo export --platform web

# Deploy
npx firebase-tools deploy --only hosting
```

---

## License

MIT
