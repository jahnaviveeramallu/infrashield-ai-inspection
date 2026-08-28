import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildGeminiPrompt } from "../gemini/prompt";
import { GeminiResponse, VisionData } from "../../types";

const rawApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");

const genAI = new GoogleGenerativeAI(apiKey);

export class VisionAgent {
  /**
   * Processes raw Gemini JSON data into a structured VisionData object.
   */
  static process(rawGeminiData: Omit<GeminiResponse, 'duplicateDetection'>): VisionData {
    const vision = rawGeminiData.vision || {};

    return {
      isInfrastructure: vision.isInfrastructure ?? true,
      hasDamage: vision.hasDamage ?? true,
      issueType: vision.issueType || 'Unknown Issue',
      severity: vision.severity || 'MEDIUM',
      confidenceScore: vision.confidenceScore ?? vision.confidence ?? 0.5,
      confidence: vision.confidence ?? vision.confidenceScore ?? 0.5,
      probableCause: vision.probableCause || 'Analysis inconclusive.',
      category: vision.category || vision.issueType || 'General Infrastructure',
      description: vision.description || 'Infrastructure issue observed.',
    };
  }

  /**
   * Direct model inference fallback for structural image analysis.
   */
  static async analyze(base64Image: string, mimeType: string = "image/jpeg"): Promise<VisionData> {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const promptText = buildGeminiPrompt();

      const result = await model.generateContent([
        promptText,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
      ]);

      const textResponse = result.response.text();
      const cleanedJson = textResponse
        .replace(/```json/gi, "")
        .replace(/```/gi, "")
        .trim();

      const rawData = JSON.parse(cleanedJson);
      return this.process(rawData);
    } catch (error: any) {
      console.error("VisionAgent Analysis Error:", error?.message || error);
      throw new Error(`VisionAgent processing failed: ${error?.message || error}`);
    }
  }
}