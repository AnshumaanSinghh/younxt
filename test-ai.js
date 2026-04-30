import { config } from 'dotenv';
config();

import fetch from 'node-fetch';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
console.log("GROQ KEY:", GROQ_API_KEY ? "EXISTS" : "MISSING");

async function testGroq() {
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
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: promptText },
          { role: "user", content: "Generate my next move based on my current state. Ensure the response is a valid JSON object." }
        ],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.8,
      })
    });
    
    if (!response.ok) {
        console.error("Groq HTTP Error:", response.status, await response.text());
        return;
    }
    const data = await response.json();
    console.log("Groq Success:", data.choices[0].message.content);
  } catch (e) {
    console.error("Groq exception:", e);
  }
}

testGroq();
