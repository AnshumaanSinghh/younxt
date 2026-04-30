/**
 * Fallback Suggestion Engine
 * 
 * Rule-based system that generates personalized suggestions
 * when the AI API is unavailable. Maps mood × mode combinations
 * to curated responses, dynamically incorporating user goals/hobbies.
 * 
 * 5 moods × 3 modes = 15 unique templates
 */

// ──────────────────────────────────────────────
// Motivational Lines (Future Self Tone)
// ──────────────────────────────────────────────
const motivationalLines = {
  stressed: {
    survival: "I know it feels like the walls are closing in right now — but I'm proof that you made it through. Just breathe and take the smallest step.",
    growth: "This pressure you're feeling? It's shaping the strongest version of you. I wouldn't be where I am without moments like this one.",
    balanced: "You don't have to solve everything today. The version of you I became learned that one calm choice changes the entire trajectory.",
  },
  tired: {
    survival: "Rest isn't weakness — it's strategy. I needed to learn that the hard way, but you don't have to. Protect your energy right now.",
    growth: "Even when you're running on empty, there's a spark in you that never dies. Feed it gently. That's what got me here.",
    balanced: "Your body is asking for something. Listen to it. The future me you're becoming was built on nights where I chose recovery over hustle.",
  },
  happy: {
    survival: "This joy you feel right now? Lock it in. Use this energy to build something that sustains you when harder days come.",
    growth: "You're in your power right now. This is exactly the energy I used to build the life you're heading toward. Don't waste this momentum.",
    balanced: "Happiness like this is fuel. Channel some into progress, save some for yourself. That balance is what makes this feeling last.",
  },
  overwhelmed: {
    survival: "Pause. You're trying to carry too many things at once. Put them down, pick up just one, and start there. That's all I need from you.",
    growth: "Being overwhelmed means you care about a lot of things. That's a superpower — but only if you learn to prioritize. Let me help.",
    balanced: "I remember this feeling. The noise quiets down when you choose just one thing to focus on. Let everything else wait.",
  },
  neutral: {
    survival: "Neutral is underrated. You're not in crisis — use this clarity to prepare for what's ahead. Small moves, big impact.",
    growth: "You have a clean slate right now. No extreme emotions pulling you off course. This is the perfect time to level up intentionally.",
    balanced: "Steady energy is rare. Use this window to make one meaningful choice. The best versions of your life were built in moments like this.",
  },
};

// ──────────────────────────────────────────────
// Action Step Templates
// ──────────────────────────────────────────────
const actionTemplates = {
  stressed: {
    survival: [
      "Close your eyes and take 5 deep breaths (4 in, 7 hold, 8 out)",
      "Write down the 3 things stressing you most, then circle the one you can actually control",
      "Set a 25-minute timer and work on just ONE task — nothing else exists until it rings",
    ],
    growth: [
      "Journal for 10 minutes about what's causing the stress and what lesson might be hiding in it",
      "Identify one skill you can improve today that would reduce future stress",
      "Reach out to one person who's navigated something similar — connection is growth fuel",
    ],
    balanced: [
      "Take a 15-minute walk outside — no phone, just movement and fresh air",
      "Pick the one task that would give you the most relief if done, and do it next",
      "Schedule 30 minutes of guilt-free downtime tonight — you've earned it",
    ],
  },
  tired: {
    survival: [
      "Drink a full glass of water right now — dehydration amplifies fatigue",
      "Cancel or postpone one non-essential commitment today",
      "Set a firm bedtime for tonight that's 30 minutes earlier than usual",
    ],
    growth: [
      "Spend 20 minutes on a hobby that energizes you — HOBBY_PLACEHOLDER",
      "Listen to a podcast or read something inspiring for 15 minutes",
      "Plan tomorrow's schedule tonight so you wake up with clarity, not chaos",
    ],
    balanced: [
      "Take a 20-minute power nap if possible, or rest with your eyes closed",
      "Do a low-energy version of your goal work — even 10 minutes counts toward GOAL_PLACEHOLDER",
      "Prepare a nourishing meal or snack — your body needs fuel, not just willpower",
    ],
  },
  happy: {
    survival: [
      "Capture this moment — write 3 things you're grateful for right now",
      "Use this energy to tackle that one thing you've been avoiding",
      "Text someone you care about and share something positive",
    ],
    growth: [
      "Channel this energy into a 30-minute focused session on GOAL_PLACEHOLDER",
      "Start that project or hobby you've been putting off — HOBBY_PLACEHOLDER",
      "Set a new micro-goal for this week while your motivation is high",
    ],
    balanced: [
      "Spend 30 minutes on something productive, then 30 minutes doing something purely fun",
      "Make progress on GOAL_PLACEHOLDER, then reward yourself with HOBBY_PLACEHOLDER",
      "Reflect: what caused this good mood? Write it down so you can recreate it",
    ],
  },
  overwhelmed: {
    survival: [
      "Brain dump everything on your mind onto paper — get it all out of your head",
      "Pick the ONE most urgent item and ignore everything else for the next hour",
      "Tell someone how you're feeling — you don't have to carry this alone",
    ],
    growth: [
      "Break your biggest goal into 3 tiny steps and only focus on step 1 today",
      "Learn one new technique for managing overwhelm (try the Eisenhower Matrix)",
      "Ask yourself: 'What would my future self want me to focus on right now?'",
    ],
    balanced: [
      "Sort your tasks into 'urgent', 'important', and 'can wait' — then only do the first category",
      "Take 10 minutes for yourself before diving into anything — reset your nervous system",
      "Delegate or drop one thing from your plate today — perfection isn't the goal, progress is",
    ],
  },
  neutral: {
    survival: [
      "Review your week ahead and identify potential stress points you can prepare for",
      "Organize one area of your physical space — a clean environment supports a clear mind",
      "Check in on a basic need: are you hydrated, fed, and rested enough?",
    ],
    growth: [
      "Spend 30 minutes learning something new related to GOAL_PLACEHOLDER",
      "Set an intention for the rest of your day — what would make it feel meaningful?",
      "Practice HOBBY_PLACEHOLDER for 20 minutes — consistency beats intensity",
    ],
    balanced: [
      "Spend equal time on progress and play — 30 min on GOAL_PLACEHOLDER, 30 min on HOBBY_PLACEHOLDER",
      "Review your recent wins and write down what you've accomplished this week",
      "Plan one exciting thing for this week — anticipation is a proven happiness booster",
    ],
  },
};

// ──────────────────────────────────────────────
// Personalizer: Injects user's goals/hobbies
// ──────────────────────────────────────────────
const personalizeStep = (step, goals, hobbies) => {
  let personalized = step;

  if (goals && goals.length > 0) {
    const randomGoal = goals[Math.floor(Math.random() * goals.length)];
    personalized = personalized.replace('GOAL_PLACEHOLDER', `"${randomGoal}"`);
  } else {
    personalized = personalized.replace('GOAL_PLACEHOLDER', 'your main goal');
  }

  if (hobbies && hobbies.length > 0) {
    const randomHobby = hobbies[Math.floor(Math.random() * hobbies.length)];
    personalized = personalized.replace('HOBBY_PLACEHOLDER', `"${randomHobby}"`);
  } else {
    personalized = personalized.replace('HOBBY_PLACEHOLDER', 'something you enjoy');
  }

  return personalized;
};

// ──────────────────────────────────────────────
// History-Aware Adjustment
// ──────────────────────────────────────────────
const adjustForHistory = (steps, recentLogs) => {
  if (!recentLogs || recentLogs.length === 0) return steps;

  // Check how many recent sessions were completed
  const completedCount = recentLogs.filter((log) => log.completed).length;
  const totalCount = recentLogs.length;

  if (completedCount === 0 && totalCount >= 3) {
    // User hasn't been completing — make steps easier
    return steps.map((step) =>
      step.replace('30 minutes', '10 minutes').replace('30-minute', '10-minute')
    );
  }

  return steps;
};

// ──────────────────────────────────────────────
// Main Export: Generate Fallback Suggestion
// ──────────────────────────────────────────────

/**
 * Generate a suggestion using the rule-based fallback engine
 * @param {Object} params
 * @param {string} params.mood - stressed|tired|happy|overwhelmed|neutral
 * @param {string} params.mode - survival|growth|balanced
 * @param {string[]} params.goals - User's goals array
 * @param {string[]} params.hobbies - User's hobbies array
 * @param {Object[]} params.recentLogs - Recent session logs
 * @returns {{ motivationalLine: string, actionSteps: string[] }}
 */
export const generateFallbackSuggestion = ({ mood, mode, goals, hobbies, recentLogs }) => {
  // Default to neutral/balanced if invalid input
  const safeMood = motivationalLines[mood] ? mood : 'neutral';
  const safeMode = ['survival', 'growth', 'balanced'].includes(mode) ? mode : 'balanced';

  // Get motivational line
  const motivationalLine = motivationalLines[safeMood][safeMode];

  // Get action steps and personalize them
  const rawSteps = [...actionTemplates[safeMood][safeMode]];
  const personalizedSteps = rawSteps.map((step) => personalizeStep(step, goals, hobbies));
  const finalSteps = adjustForHistory(personalizedSteps, recentLogs);

  return {
    motivationalLine,
    actionSteps: finalSteps,
  };
};
