import { VisionData, PriorityData } from '@/types';

// Helper to create a unique pseudo-random number from text so every image gets a unique score
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function calculatePriority(vision: VisionData): PriorityData {
  // 1. If not valid infrastructure, blurry, or no damage, return 0 priority
  const confidence = Number(vision.confidence || 1.0);
  if (vision.isInfrastructure === false || vision.hasDamage === false || confidence < 0.4) {
    return {
      score: 0,
      municipalPriorityReason: "Rejected: No actionable infrastructure hazard identified or image too blurry.",
    };
  }

  // 2. Base priority calculation
  const severity = (vision.severity || "MEDIUM").toUpperCase();
  const issueDescription = vision.probableCause || vision.issueType || "Unknown";
  
  // Create a unique jitter (0 to 14) based on the specific AI description of this exact image!
  const uniqueJitter = hashString(issueDescription) % 15; 
  
  let score = 50;

  // 3. Apply dynamic ranges so scores are unique every time (e.g. 87, 92, 64, 43)
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

export const evaluatePriority = calculatePriority;

export class PriorityAgent {
  static process(geminiRaw: any, _upvotes = 0): PriorityData {
    const vision = (geminiRaw?.vision || geminiRaw || {}) as VisionData;
    return calculatePriority(vision);
  }
}