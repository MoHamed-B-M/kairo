import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // API key missing is not a critical error for the app flow, just return null
      return null;
    }
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn("Failed to initialize GoogleGenAI client", e);
    return null;
  }
};

const FALLBACK_TIPS = [
  "Find your center.",
  "Silence is the canvas of thought.",
  "Breathe in focus, breathe out distraction.",
  "One step at a time.",
  "Flow like water.",
  "Be present in this moment.",
  "Stillness speaks.",
  "Deep work, deep life.",
  "The obstacle is the way.",
  "Focus is the art of subtraction.",
  "Simplicity is the ultimate sophistication.",
  "Don't watch the clock; do what it does.",
  "Energy flows where attention goes.",
  "Quiet the mind, and the soul will speak.",
  "Clarity comes from action.",
  "Respect the process.",
  "Now is the only time there is.",
  "Mastery requires patience.",
  "Inhale confidence, exhale doubt.",
  "Your focus determines your reality."
];

export const generateFocusTip = async (durationMinutes: number): Promise<string> => {
  const ai = getClient();
  
  if (!ai) {
    // Return a random fallback tip if AI is not available
    return FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give me a very short, abstract, and motivating sentence about focus for a ${durationMinutes} minute session. Max 15 words. Keep it mysterious and zen-like.`,
    });
    
    return response.text?.trim() || FALLBACK_TIPS[0];
  } catch (error) {
    // Log the error for debugging but do not crash the UI
    console.warn("Error generating focus tip (using fallback):", error);
    return FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
  }
};

export const generateSessionInsight = async (durationMinutes: number, type: string): Promise<string> => {
  const ai = getClient();
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
  
  const fallback = "Great session. Consistency is the path to mastery.";

  if (!ai) return fallback;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user just finished a ${durationMinutes} minute ${type} session in the ${timeOfDay}. Give a single, short, insightful sentence (max 15 words) to close the session. It should be encouraging, slightly philosophical, or scientific regarding productivity.`,
    });
    return response.text?.trim() || fallback;
  } catch (error) {
    console.warn("Error generating insight:", error);
    return fallback;
  }
};