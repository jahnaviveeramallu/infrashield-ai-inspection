import { VisionData, PriorityData } from '@/types';

export function evaluatePriority(
  vision: VisionData,
  fallbackScore?: number,
  minScore?: number
): PriorityData {
  // 1. If not valid infrastructure or no damage, return 0 priority
  if (vision.isInfrastructure === false || vision.hasDamage === false) {
    return {
      score: 0,
      municipalPriorityReason: "No actionable infrastructure hazard identified.",
    };
  }

  // 2. Base priority score calculation for valid infrastructure issues
  let score = fallbackScore && fallbackScore > 0 ? fallbackScore : 50;

  // Add weight based on category if present in vision response
  if (vision.category) {
    const categoryLower = vision.category.toLowerCase();
    if (categoryLower.includes("pothole") || categoryLower.includes("road")) {
      score += 20;
    } else if (categoryLower.includes("drainage") || categoryLower.includes("water")) {
      score += 25;
    } else if (categoryLower.includes("electrical") || categoryLower.includes("wire")) {
      score += 30;
    }
  }

  // Cap score between minScore (or 0) and 100
  const floor = minScore ?? 0;
  score = Math.min(Math.max(score, floor), 100);

  return {
    score,
    municipalPriorityReason: `Validated hazard detected in category: ${vision.category || 'General Infrastructure'}. Assigned priority score of ${score}/100.`,
  };
}

// Export alias to seamlessly resolve legacy multi-argument imports in route.ts & IssueService.ts
export const calculatePriority = evaluatePriority;