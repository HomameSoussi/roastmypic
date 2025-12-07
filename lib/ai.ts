/**
 * AI Helper Module
 * Generates roasts using OpenAI Vision API (or Manus API)
 */

interface GenerateRoastParams {
  base64Image: string;
  mimeType: string;
  style: string;
}

const STYLE_MODIFIERS: Record<string, string> = {
  moroccan_savage: "Respond in Moroccan Darija (Arabic dialect). Be street-smart, sarcastic, and playfully savage.",
  clean_funny: "Keep it family-friendly and wholesome. No edgy content whatsoever.",
  dark_humor: "Use mildly edgy humor, but stay within safe boundaries. No crossing the line.",
  flirty: "Be playfully flirty and charming. Keep it PG-13.",
  corporate: "Use LinkedIn-style corporate sarcasm. Professional but funny.",
  muslim_friendly: "Be respectful and clean. No inappropriate content. Halal humor only."
};

const SYSTEM_PROMPT = `You are RoastMaster9000, an AI that generates short, funny roasts based on user photos.

Rules:
- Max 25 words
- 1 or 2 sentences
- No hate, slurs, NSFW, or bullying
- Never mention race, religion, disabilities, or protected attributes
- Keep humor playful and safe
- Focus on clothing, expressions, backgrounds, or funny details in the photo`;

export async function generateRoast({
  base64Image,
  mimeType,
  style
}: GenerateRoastParams): Promise<string> {
  // TODO: Support both OpenAI and Manus API
  // Currently using OpenAI API
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.MANUS_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing API key. Set OPENAI_API_KEY or MANUS_API_KEY in environment.");
  }

  // Get style-specific modifier
  const styleModifier = STYLE_MODIFIERS[style] || STYLE_MODIFIERS.clean_funny;
  
  const userPrompt = `${styleModifier}\n\nGenerate a roast for this photo. Remember: max 25 words, playful and safe.`;

  try {
    // Using OpenAI-compatible API (supports both OpenAI and Manus)
    // Construct the full endpoint URL
    const apiBase = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
    const apiEndpoint = apiBase.endsWith('/chat/completions') 
      ? apiBase 
      : `${apiBase}/chat/completions`;
    
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 100,
        temperature: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let roast = data.choices?.[0]?.message?.content?.trim() || "You look... interesting. That's all I got.";

    // Safety check: if response seems inappropriate, return a safe default
    roast = sanitizeRoast(roast);

    return roast;
  } catch (error) {
    console.error("Error generating roast:", error);
    throw new Error("Failed to generate roast. Please try again.");
  }
}

/**
 * Basic safety filter to catch inappropriate content
 */
function sanitizeRoast(roast: string): string {
  const bannedWords = [
    "hate", "slur", "racist", "sexist", "disability", 
    "religion", "nsfw", "explicit", "offensive"
  ];
  
  const lowerRoast = roast.toLowerCase();
  const containsBanned = bannedWords.some(word => lowerRoast.includes(word));
  
  if (containsBanned) {
    return "Your vibe is so unique, even AI needs a moment to process it. 🤔";
  }
  
  return roast;
}
