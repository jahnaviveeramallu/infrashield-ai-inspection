// src/lib/agents/PriorityAgent.ts

import { PriorityData, VisionData } from "@/types";

export function calculatePriority(
  vision: VisionData,
  rawScore?: number,
  upvotes: number = 0
): PriorityData {
  // 1. If not valid infrastructure or no damage, return 0 priority
  if (vision.isInfrastructure === false || vision.hasDamage === false) {
    return {
      score: 0,
      municipalPriorityReason: "No actionable infrastructure hazard identified."
    };
  }

  // 2. Base severity map
  const severityBaseMap: Record<string, number> = {
    CRITICAL: 85,
    HIGH: 65,
    MEDIUM: 45,
    LOW: 25
  };

  let baseScore = rawScore && rawScore > 0 
    ? rawScore 
    : (severityBaseMap[vision.severity?.toUpperCase()] || 50);

  // 3. Dynamic adjustment based on community upvotes (capped contribution)
  const upvoteBonus = Math.min(10, Math.floor(upvotes / 5));
  const finalScore = Math.min(99, Math.max(10, baseScore + upvoteBonus));

  let reason = "Routine maintenance required.";
  if (finalScore >= 80) {
    reason = "Critical public safety hazard requiring immediate emergency intervention.";
  } else if (finalScore >= 60) {
    reason = "High-priority structural issue posing active risk to commuter traffic.";
  } else if (finalScore >= 40) {
    reason = "Moderate infrastructure defect scheduled for standard repair cycle.";
  }

  return {
    score: finalScore,
    municipalPriorityReason: reason
  };
}