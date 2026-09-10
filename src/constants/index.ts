// ============================================
// EXISTING CONSTANTS (DO NOT REMOVE)
// ============================================

export const COLLECTION_NAMES = {
  ISSUES: 'issues',
  USERS: 'users',
  MAINTENANCE_HISTORY: 'maintenance_history',
  WORK_ORDERS: 'work_orders',
} as const;

export const ISSUE_STATUS = {
  REPORTED: 'REPORTED',
  AI_ANALYSED: 'AI_ANALYSED',
  COMMUNITY_VALIDATED: 'COMMUNITY_VALIDATED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
} as const;

export const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export const DEFAULT_SEARCH_RADIUS_METERS = 50;

// ============================================
// NEW CONSTANTS — INFRASHIELD AI (Theme #9)
// ============================================

// --- Branding ---
export const APP_NAME = 'InfraShield AI';
export const APP_TAGLINE = 'Infrastructure Inspection & Maintenance Intelligence';
export const APP_DESCRIPTION =
  'AI-powered infrastructure defect detection, risk ranking, and maintenance prioritization for Indian public infrastructure.';

// --- Infrastructure Categories ---
export const DEFECT_CATEGORIES = {
  road: { label: 'Road / Highway', icon: '🛣️', color: '#f59e0b' },
  bridge: { label: 'Bridge / Flyover', icon: '🌉', color: '#8b5cf6' },
  building: { label: 'Building / Structure', icon: '🏢', color: '#3b82f6' },
  drainage: { label: 'Drainage / Sewage', icon: '🚰', color: '#06b6d4' },
  'water-pipeline': { label: 'Water Pipeline', icon: '💧', color: '#0ea5e9' },
  'electricity-pole': { label: 'Electricity Pole / Wire', icon: '⚡', color: '#eab308' },
  footpath: { label: 'Footpath / Sidewalk', icon: '🚶', color: '#84cc16' },
  'retaining-wall': { label: 'Retaining Wall', icon: '🧱', color: '#a855f7' },
} as const;

// --- Severity Config (matches your existing SEVERITY_LEVELS) ---
export const SEVERITY_CONFIG = {
  CRITICAL: {
    label: 'Critical',
    color: '#dc2626',
    bgColor: 'bg-red-500',
    textColor: 'text-red-600',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    pinColor: '#dc2626',
    description: 'Immediate danger — action required within 24 hours',
  },
  HIGH: {
    label: 'High',
    color: '#ea580c',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-600',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    pinColor: '#ea580c',
    description: 'Serious defect — action required within 1 week',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#ca8a04',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    pinColor: '#ca8a04',
    description: 'Moderate issue — action required within 1 month',
  },
  LOW: {
    label: 'Low',
    color: '#2563eb',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    pinColor: '#2563eb',
    description: 'Minor issue — schedule during routine maintenance',
  },
} as const;

// --- Work Order Status ---
export const WORK_ORDER_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const;

export const WORK_ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', badge: 'bg-yellow-100 text-yellow-800' },
  assigned: { label: 'Assigned', color: '#3b82f6', badge: 'bg-blue-100 text-blue-800' },
  'in-progress': { label: 'In Progress', color: '#8b5cf6', badge: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', color: '#22c55e', badge: 'bg-green-100 text-green-800' },
} as const;

// --- Inspection Status ---
export const INSPECTION_STATUS = {
  HEALTHY: 'healthy',
  NEEDS_ATTENTION: 'needs-attention',
  CRITICAL: 'critical',
} as const;

export const INSPECTION_STATUS_CONFIG = {
  healthy: { label: 'Healthy', color: '#22c55e', icon: '✅' },
  'needs-attention': { label: 'Needs Attention', color: '#f59e0b', icon: '⚠️' },
  critical: { label: 'Critical', color: '#dc2626', icon: '🚨' },
} as const;

// --- Indian Government Departments ---
export const DEPARTMENTS = [
  'Municipal Roads & Highways',
  'Public Works Department (PWD)',
  'Water Supply & Drainage Board',
  'Electricity Distribution (DISCOM)',
  'Urban Development Authority',
  'National Highways Authority (NHAI)',
  'Railway Infrastructure Division',
  'Building & Construction Department',
] as const;

// --- Demo Locations (for hackathon) ---
export const DEMO_LOCATIONS = [
  { name: 'Vignan University Main Gate', lat: 16.3067, lng: 80.4365 },
  { name: 'Guntur Railway Station Road', lat: 16.2997, lng: 80.4573 },
  { name: 'Arundelpet Junction', lat: 16.3028, lng: 80.4428 },
  { name: 'Brody Pet Flyover', lat: 16.3105, lng: 80.4350 },
] as const;