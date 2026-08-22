export interface ResourcePlan {
  crewSize: number;
  crewType: string;
  equipment: string[];
  materials: { name: string; quantity: string; estimatedCost: number }[];
  totalBudget: number;
  estimatedDays: number;
  safetyPrecautions: string[];
}

export function generateResourcePlan(severity: string): ResourcePlan {
  const plans: Record<string, ResourcePlan> = {
    critical: {
      crewSize: 8,
      crewType: "Emergency Structural Taskforce",
      equipment: ["Concrete Shaper", "Compactor Truck", "Pneumatic Jackhammer", "Heavy Safety Barriers"],
      materials: [
        { name: "High-Strength Quick Concrete", quantity: "30 bags", estimatedCost: 25000 },
        { name: "Tension Rebar Rods", quantity: "150 kg", estimatedCost: 45000 },
        { name: "Epoxy Binder", quantity: "12 units", estimatedCost: 15000 },
      ],
      totalBudget: 145000,
      estimatedDays: 5,
      safetyPrecautions: ["Full road closure", "Night work with floodlights", "Traffic diversion plan"],
    },
    high: {
      crewSize: 5,
      crewType: "Rapid Action Patching Unit",
      equipment: ["Concrete Mixer", "Vibratory Compactor", "Safety Barriers"],
      materials: [
        { name: "Asphalt Concrete Cold Mix", quantity: "15 bags", estimatedCost: 12000 },
        { name: "Tack Coat Emulsion", quantity: "4 drums", estimatedCost: 8000 },
      ],
      totalBudget: 55000,
      estimatedDays: 3,
      safetyPrecautions: ["Partial lane closure", "Warning signage 200m ahead"],
    },
    medium: {
      crewSize: 3,
      crewType: "Standard Maintenance Crew",
      equipment: ["Basic Toolkit", "Safety Cones", "Hand Compactor"],
      materials: [
        { name: "Cold Patching Mix", quantity: "5 bags", estimatedCost: 3000 },
        { name: "Bitumen Emulsion", quantity: "2 drums", estimatedCost: 2500 },
      ],
      totalBudget: 15000,
      estimatedDays: 2,
      safetyPrecautions: ["Traffic cones around work zone"],
    },
    low: {
      crewSize: 2,
      crewType: "Quick Fix Patrol",
      equipment: ["Basic Hand Tools", "Safety Vest"],
      materials: [
        { name: "Pothole Filler Compound", quantity: "10 kg", estimatedCost: 1200 },
      ],
      totalBudget: 3500,
      estimatedDays: 1,
      safetyPrecautions: ["Basic safety gear"],
    },
  };

  const key = severity.toLowerCase();
  return plans[key] || plans.medium;
}