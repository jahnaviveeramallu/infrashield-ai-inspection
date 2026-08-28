import { GeminiResponse } from '../../types';

export class GeminiParser {
  /**
   * Safely parses the Gemini text response into our typed JSON structure.
   */
  static parse(responseText: string): Omit<GeminiResponse, 'duplicateDetection'> {
    // Clean out markdown backticks and potential trailing syntax
    let cleanText = responseText
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .trim();

    try {
      const parsed = JSON.parse(cleanText);
      return parsed as Omit<GeminiResponse, 'duplicateDetection'>;
    } catch (error) {
      console.error('Failed to parse Gemini JSON:', cleanText, error);
      throw new Error('Invalid JSON format returned by Gemini.');
    }
  }
}