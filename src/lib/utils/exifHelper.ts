export interface ExifValidationResult {
  hasExif: boolean;
  isRecent: boolean;
  gpsMatch: boolean;
  isValidOriginal: boolean;
  reason: string;
  confidencePenalty: number; // 0 to 40 points deducted from priority
}

export interface PhotoValidationInput {
  fileLastModified?: number; // browser File.lastModified
  clientGps?: { lat: number; lng: number } | null;
  exifGps?: { lat: number; lng: number } | null;
  hasCameraMake?: boolean; // EXIF Make/Model exists
  hasDateTimeOriginal?: boolean; // EXIF DateTimeOriginal exists
  isLikelyScreenshot?: boolean;
}

/**
 * Validates whether an uploaded photo looks like an original live capture
 * vs screenshot / old photo / location-spoofed photo.
 */
export function validatePhotoMetadata(
  input: PhotoValidationInput
): ExifValidationResult {
  const {
    fileLastModified,
    clientGps = null,
    exifGps = null,
    hasCameraMake = false,
    hasDateTimeOriginal = false,
    isLikelyScreenshot = false,
  } = input;

  const now = Date.now();
  const MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes

  const hasExif = !!(hasCameraMake || hasDateTimeOriginal || exifGps);
  const isRecent = fileLastModified
    ? now - fileLastModified <= MAX_AGE_MS
    : false;

  // GPS cross-check (approx ~100m tolerance)
  let gpsMatch = true;
  if (clientGps && exifGps) {
    const latDiff = Math.abs(clientGps.lat - exifGps.lat);
    const lngDiff = Math.abs(clientGps.lng - exifGps.lng);
    gpsMatch = latDiff < 0.001 && lngDiff < 0.001;
  }

  let confidencePenalty = 0;
  const reasons: string[] = [];

  if (isLikelyScreenshot) {
    confidencePenalty += 25;
    reasons.push("Image appears to be a screenshot.");
  }

  if (!hasExif) {
    confidencePenalty += 15;
    reasons.push("No camera EXIF metadata found (common in web downloads/screenshots).");
  }

  if (!isRecent) {
    confidencePenalty += 20;
    reasons.push("Photo timestamp is older than 15 minutes.");
  }

  if (clientGps && exifGps && !gpsMatch) {
    confidencePenalty += 25;
    reasons.push("EXIF GPS does not match live device GPS.");
  }

  // Cap penalty
  confidencePenalty = Math.min(confidencePenalty, 40);

  const isValidOriginal =
    !isLikelyScreenshot &&
    hasExif &&
    isRecent &&
    gpsMatch &&
    confidencePenalty < 20;

  const reason =
    reasons.length > 0
      ? reasons.join(" ")
      : "Photo verified as original live capture.";

  return {
    hasExif,
    isRecent,
    gpsMatch,
    isValidOriginal,
    reason,
    confidencePenalty,
  };
}

/**
 * Simple heuristic: screenshots often have no EXIF and generic names.
 */
export function detectLikelyScreenshot(fileName?: string, hasExif?: boolean): boolean {
  const name = (fileName || "").toLowerCase();
  const screenshotName =
    name.includes("screenshot") ||
    name.includes("screen shot") ||
    name.startsWith("img_") === false && name.includes("whatsapp") ||
    name.includes("download");

  // No EXIF + suspicious filename => likely screenshot/download
  if (!hasExif && screenshotName) return true;
  if (!hasExif && (name.endsWith(".png") || name.endsWith(".webp"))) return true;

  return false;
}

/**
 * Apply EXIF/web-origin penalty to AI priority score.
 */
export function applyIntegrityPenalty(
  aiScore: number,
  validation: ExifValidationResult
): number {
  const adjusted = Math.max(0, Math.min(100, aiScore - validation.confidencePenalty));
  return adjusted;
}

/**
 * Final decision helper used by analyze flow.
 */
export function getIntegrityDecision(validation: ExifValidationResult): {
  status: "PASS" | "REVIEW" | "REJECT";
  points: number;
  message: string;
} {
  if (validation.confidencePenalty >= 30) {
    return {
      status: "REJECT",
      points: 0,
      message: `Rejected: ${validation.reason}`,
    };
  }

  if (validation.confidencePenalty >= 15) {
    return {
      status: "REVIEW",
      points: 0,
      message: `Flagged for manual review: ${validation.reason}`,
    };
  }

  return {
    status: "PASS",
    points: 50,
    message: "Original capture verified.",
  };
}