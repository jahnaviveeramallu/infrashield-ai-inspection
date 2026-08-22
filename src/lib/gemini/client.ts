import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('❌ Missing GEMINI_API_KEY environment variable.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Latest Flash model (has free quota)
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  generationConfig: {
    temperature: 0.4,
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096,
  },
});

export const geminiVisionModel = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  generationConfig: {
    temperature: 0.2,
    topK: 32,
    topP: 1,
    maxOutputTokens: 2048,
  },
});

export { genAI };
export default geminiModel;