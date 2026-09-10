import { GoogleGenerativeAI } from "@google/generative-ai";

// Read API key from environment
const rawApiKey =
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");

if (!apiKey || apiKey.length < 20) {
  console.warn("⚠️ GEMINI_API_KEY is missing or invalid in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// ✅ Primary stable model (best free-tier availability)
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2,
    topK: 32,
    topP: 1,
    maxOutputTokens: 1024,
  },
});

// ✅ Vision model (same stable model for image analysis)
export const geminiVisionModel = genAI.getGenerativeModel({
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2,
    topK: 32,
    topP: 1,
    maxOutputTokens: 1024,
  },
});

export { genAI };
export default geminiModel;