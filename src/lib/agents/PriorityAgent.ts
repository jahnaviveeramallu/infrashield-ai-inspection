import { VisionData, PriorityData } from '@/types';

export function calculatePriority(vision: VisionData): PriorityData {
  // 1. If not valid infrastructure or no damage, return 0 priority
  if (vision.isInfrastructure === false || vision.hasDamage === false) {
    return {
      score: 0,
      municipalPriorityReason: "No actionable infrastructure hazard identified.",
    };
  }

  // 2. Base priority score calculation based on AI severity string
  const severity = (vision.severity || "MEDIUM").toUpperCase();
  let score = 50;

  if (severity === "CRITICAL") score = 92;
  else if (severity === "HIGH") score = 75;
  else if (severity === "MEDIUM") score = 55;
  else if (severity === "LOW") score = 35;

  // 3. Add dynamic weight based on category to ensure unique scores
  if (vision.issueType) {
    const categoryLower = vision.issueType.toLowerCase();
    if (categoryLower.includes("pothole") || categoryLower.includes("road")) {
      score += 4;
    } else if (categoryLower.includes("drainage") || categoryLower.includes("water")) {
      score += 6;
    } else if (categoryLower.includes("electrical") || categoryLower.includes("wire") || categoryLower.includes("light")) {
      score += 7; // Electrical issues are slightly higher priority
    } else {
      score += 2;
    }
  }

  // Cap score between 0 and 100 safely
  score = Math.min(Math.max(score, 0), 100);

  return {
    score,
    municipalPriorityReason: `Validated hazard detected (${vision.issueType || 'General'}). Assigned dynamic priority score of ${score}/100.`,
  };
}

// Keep a class wrapper just in case other parts of the app use it
export class PriorityAgent {
  static process(geminiRaw: any, _upvotes = 0): PriorityData {
    const vision = (geminiRaw?.vision || geminiRaw || {}) as VisionData;
    return calculatePriority(vision);
  }
}