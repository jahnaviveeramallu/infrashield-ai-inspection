import { VisionData, PriorityData } from '@/types';

/**
 * Helper function to create a deterministic pseudo-random integer 
 * from text inputs so each unique description produces a stable score variation.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to a 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculates a dynamic priority score (0-100) and reasoning message
 * based on AI vision data and severity metrics.
 */
export function calculatePriority(vision: VisionData): PriorityData {
  const confidence = Number(vision.confidence ?? 1.0);

  // 1. Return 0 priority if not actionable infrastructure, no damage, or low confidence
  if (vision.isInfrastructure === false || vision.hasDamage === false || confidence < 0.4) {
    return {
      score: 0,
      municipalPriorityReason: "Rejected: No actionable infrastructure hazard identified or image too blurry.",
    };
  }

  // 2. Determine base severity and description
  const severity = (vision.severity || "MEDIUM").toUpperCase();
  const issueDescription = vision.probableCause || vision.issueType || "Unknown";

  // Create a unique jitter (0 to 14) based on the image description
  const uniqueJitter = hashString(issueDescription) % 15;

  let score = 50;

  // 3. Apply dynamic ranges based on severity level
  if (severity === "CRITICAL") {
    score = 85 + uniqueJitter; // Range: 85 - 99
  } else if (severity === "HIGH") {
    score = 65 + (uniqueJitter % 19); // Range: 65 - 83
  } else if (severity === "MEDIUM") {
    score = 45 + (uniqueJitter % 19); // Range: 45 - 63
  } else {
    score = 20 + (uniqueJitter % 24); // Range: 20 - 43
  }

  // Cap score safely between 0 and 100
  score = Math.min(Math.max(score, 0), 100);

  return {
    score,
    municipalPriorityReason: `Validated hazard detected (${vision.issueType || 'General'}). Assigned dynamic priority score of ${score}/100 based on severity and context.`,
  };
}

// Alias for backwards compatibility
export const evaluatePriority = calculatePriority;

/**
 * PriorityAgent wrapper class for processing raw AI payload object structures.
 */
export class PriorityAgent {
  static process(geminiRaw: any, _upvotes = 0): PriorityData {
    const vision = (geminiRaw?.vision || geminiRaw || {}) as VisionData;
    return calculatePriority(vision);
  }
}