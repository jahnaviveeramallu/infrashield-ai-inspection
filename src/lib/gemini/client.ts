import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('❌ Missing GEMINI_API_KEY environment variable.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Standard production-ready model for multimodal analysis
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-3.6-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.4,
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096,
  },
});

export const geminiVisionModel = genAI.getGenerativeModel({
  model: 'gemini-3.6-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.2,
    topK: 32,
    topP: 1,
    maxOutputTokens: 2048,
  },
});

export { genAI };
export default geminiModel;