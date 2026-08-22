export interface Location {
  lat: number;
  lng: number;
}

export interface VisionData {
  issueType: string;
  severity: string;
  confidence: number;
  probableCause: string;
}

export interface ContextData {
  nearbyLandmarks: string[];
  citizenImpact: string;
  longTermRisk: string;
}

export interface PriorityData {
  score: number;
  municipalPriorityReason: string;
}

export interface RecommendationData {
  department: string;
  temporarySolution: string;
  permanentSolution: string;
  repairComplexity: string;
  estimatedBudgetRange: string;
}

export interface ExecutiveSummaryData {
  summary: string;
}

export interface CommunicationsData {
  tweetDraft: string;
  emailDraft: string;
}

export interface DuplicateDetectionData {
  similarIssuesNearby: boolean;
  duplicateIssueIds?: string[];
}

export interface GeminiResponse {
  vision: VisionData;
  context: ContextData;
  priority: PriorityData;
  recommendation: RecommendationData;
  executiveSummary: ExecutiveSummaryData;
  duplicateDetection: DuplicateDetectionData;
  communications: CommunicationsData;
}

export interface Issue {
  id: string;
  imageUrl: string;
  location: Location;
  status: 'REPORTED' | 'AI_ANALYSED' | 'COMMUNITY_VALIDATED' | 'IN_PROGRESS' | 'RESOLVED';
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Enriched AI Data
  vision: VisionData;
  context: ContextData;
  priority: PriorityData;
  recommendation: RecommendationData;
  executiveSummary: ExecutiveSummaryData;
  duplicateDetection: DuplicateDetectionData;
  communications: CommunicationsData;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'CITIZEN' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// NEW TYPES — INFRASHIELD AI (Theme #9)
// ============================================

export type DefectCategory =
  | 'road'
  | 'bridge'
  | 'building'
  | 'drainage'
  | 'water-pipeline'
  | 'electricity-pole'
  | 'footpath'
  | 'retaining-wall';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type ActionStatus = 'none' | 'inspected' | 'repaired' | 'replaced' | 'closed';

export type WorkOrderStatus = 'pending' | 'assigned' | 'in-progress' | 'completed';

export interface MaintenanceRecord {
  id: string;
  locationId: string;
  locationName: string;
  inspectionDate: string;
  inspectorName: string;
  defectType: DefectCategory;
  severity: SeverityLevel;
  severityScore: number;
  description: string;
  imageUrl?: string;
  actionTaken: ActionStatus;
  repairCost?: number;
  nextInspectionDate?: string;
  createdAt: string;
}

export interface ResourceMaterial {
  name: string;
  quantity: string;
  estimatedCost: number;
}

export interface ResourceAllocation {
  crewSize: number;
  crewType: string;
  equipment: string[];
  materials: ResourceMaterial[];
  totalBudget: number;
  estimatedDays: number;
  safetyPrecautions: string[];
}

export interface WorkOrder {
  id: string;
  issueId: string;
  locationName: string;
  defectType: string;
  severity: SeverityLevel;
  severityScore: number;
  daysSinceReported: number;
  resources: ResourceAllocation;
  status: WorkOrderStatus;
  assignedTo?: string;
  priorityScore: number;
  createdAt: string;
}

export interface InspectionHistory {
  locationId: string;
  locationName: string;
  totalInspections: number;
  records: MaintenanceRecord[];
  currentStatus: 'healthy' | 'needs-attention' | 'critical';
  lastInspectionDate: string;
  nextInspectionDue: string;
}

export interface EngineeringReportData {
  reportId: string;
  date: string;
  location: string;
  gpsCoordinates: string;
  defectType: string;
  severity: string;
  severityScore: number;
  description: string;
  aiAnalysis: string;
  estimatedCost: number;
  recommendedAction: string;
  department: string;
  imageUrl?: string;
  inspectorName: string;
}