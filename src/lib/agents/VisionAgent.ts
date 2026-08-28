import { GeminiResponse, VisionData } from '../../types';

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
}