import { config } from 'dotenv';
config();

import fetch from 'node-fetch';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
console.log("GEMINI KEY:", GEMINI_API_KEY ? "EXISTS" : "MISSING");

async function testGemini() {
  const promptText = `
Output Format: You MUST return ONLY a valid JSON object matching this schema exactly.
{
  "motivationalLine": "A single powerful sentence spoken from the future self perspective.",
  "actionSteps": [
    "Option 1",
    "Option 2",
    "Option 3"
  ]
}
  `;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: promptText + "\nGenerate my next move. Return ONLY valid JSON." }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: "application/json",
        }
      })
    });
    
    if (!response.ok) {
        console.error("Gemini HTTP Error:", response.status, await response.text());
        return;
    }
    const data = await response.json();
    console.log("Gemini Success:", data.candidates[0].content.parts[0].text);
  } catch (e) {
    console.error("Gemini exception:", e);
  }
}

testGemini();
