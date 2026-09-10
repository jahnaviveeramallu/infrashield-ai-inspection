import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { buildGeminiPrompt } from "@/lib/gemini/prompt";
import { calculatePriority } from "@/lib/agents/PriorityAgent";
import { COLLECTION_NAMES, ISSUE_STATUS } from "@/constants";
import crypto from "crypto";
import {
  validatePhotoMetadata,
  detectLikelyScreenshot,
  applyIntegrityPenalty,
  getIntegrityDecision,
} from "@/lib/utils/exifHelper";
import { performReverseImageSearch } from "@/lib/utils/reverseImageHelper";

function createImageHash(base64Data: string): string {
  return crypto.createHash("sha256").update(base64Data).digest("hex");
}

export const maxDuration = 60; // Vercel maximum execution limit

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rawImage = body.imageBase64 || body.base64Image || body.imageUrl;
    const location = body.location;
    const userDescription = body.userDescription || "";
    const fileName = body.fileName || "";
    const fileLastModified = body.fileLastModified || Date.now();

    // 1. Mandatory Location Check
    if (!location || (!location.address && (!location.lat || !location.lng))) {
      return NextResponse.json(
        {
          success: false,
          error: "LOCATION_REQUIRED",
          message:
            "Please click 'Auto-Detect GPS' or enter a valid location address before submitting.",
        },
        { status: 400 }
      );
    }

    // 2. Mandatory Photo Check
    if (!rawImage) {
      return NextResponse.json(
        {
          success: false,
          error: "PHOTO_REQUIRED",
          message: "Please upload a photo of infrastructure damage.",
        },
        { status: 400 }
      );
    }

    // Safely Extract Base64 and MIME Type
    let base64Data = rawImage;
    let mimeType = body.mimeType || "image/jpeg";

    if (typeof rawImage === "string" && rawImage.startsWith("data:")) {
      const match = rawImage.match(/^data:(image\/\w+);base64,/);
      if (match && match[1]) mimeType = match[1];
      base64Data = rawImage.replace(/^data:image\/\w+;base64,/, "");
    }

    const fullImageUrl =
      typeof rawImage === "string" && rawImage.startsWith("data:")
        ? rawImage
        : `data:${mimeType};base64,${rawImage}`;

    const imageHash = createImageHash(base64Data);

    // 3. Fast Duplicate Image Hash Check (Firestore)
    try {
      const dupQuery = query(
        collection(db, COLLECTION_NAMES.ISSUES),
        where("imageHash", "==", imageHash)
      );
      const dupSnap = await getDocs(dupQuery);
      if (!dupSnap.empty) {
        return NextResponse.json(
          {
            success: false,
            error: "DUPLICATE_IMAGE",
            message:
              "DUPLICATE DETECTED: This exact photo has already been reported.",
            pointsAwarded: 0,
          },
          { status: 400 }
        );
      }
    } catch (dupErr) {
      console.warn("Duplicate hash check warning:", dupErr);
    }

    // 4. Reverse Image Search (Fast Background Check)
    let reverseSearch = { isWebDuplicate: false, reason: "" };
    try {
      reverseSearch = await Promise.race([
        performReverseImageSearch(base64Data),
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ isWebDuplicate: false, reason: "Bypassed timeout" }),
            3000
          )
        ),
      ]) as any;

      if (reverseSearch.isWebDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: "WEB_DUPLICATE_IMAGE",
            message:
              "REJECTED: This image already exists on the public internet. Please capture an original live photo.",
            details: reverseSearch.reason,
            pointsAwarded: 0,
          },
          { status: 400 }
        );
      }
    } catch (err) {
      console.warn("Reverse search skipped:", err);
    }

    // 5. EXIF / Screenshot Integrity Check
    const likelyScreenshot = detectLikelyScreenshot(fileName, false);
    const metadataValidation = validatePhotoMetadata({
      fileLastModified,
      clientGps:
        location?.lat && location?.lng
          ? { lat: Number(location.lat), lng: Number(location.lng) }
          : null,
      isLikelyScreenshot: likelyScreenshot,
    });

    const integrityDecision = getIntegrityDecision(metadataValidation);
    if (integrityDecision.status === "REJECT") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CAPTURE",
          message: integrityDecision.message,
          pointsAwarded: 0,
          metadataValidation,
        },
        { status: 400 }
      );
    }

    // 6. Gemini API Key
    const rawApiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");

    if (!apiKey || apiKey.length < 20 || apiKey.includes("YourKey")) {
      return NextResponse.json(
        {
          success: false,
          error: "API_KEY_MISSING",
          message: "Gemini API Key is missing or invalid in environment variables.",
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Fast, lightweight models for quick execution (< 3 seconds)
  const MODELS_TO_TRY = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-1.5-flash",
];

    const promptText =
      buildGeminiPrompt() +
      (userDescription
        ? `\n\nInspector Observation Notes: ${userDescription}`
        : "") +
      `\n\nReturn JSON fields under vision: isInfrastructure, hasDamage, issueType, severity, probableCause, confidence.`;

    let aiResponseJson: any = null;
    let lastErrorDetails = "";

    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
            maxOutputTokens: 1024, // Optimized for fast response
          },
        });

        const result = await model.generateContent([
          promptText,
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
        ]);

        const textResponse = result.response.text();
        const cleanedJson = textResponse
          .replace(/```json/gi, "")
          .replace(/```/gi, "")
          .trim();

        aiResponseJson = JSON.parse(cleanedJson);
        console.log(`⚡ Gemini AI Scan Completed in Fast Mode (${modelName})`);
        break;
      } catch (err: any) {
        console.error(`Gemini model ${modelName} attempt failed:`, err?.message || err);
        lastErrorDetails = err?.message || String(err);
      }
    }

    if (!aiResponseJson) {
      return NextResponse.json(
        {
          success: false,
          error: "AI_PROCESSING_ERROR",
          message: "Gemini API failed to parse or analyze the image within time limit.",
          details: lastErrorDetails,
        },
        { status: 500 }
      );
    }

    // 7. Gatekeeper Validation
    const vision = aiResponseJson.vision || {};
    const isInfra = vision.isInfrastructure === true;
    const hasDamage = vision.hasDamage === true;
    const confidence = Number(vision.confidence ?? 0.5);

    if (!isInfra || !hasDamage || confidence < 0.35) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_INFRASTRUCTURE_IMAGE",
          message:
            "REJECTED: The uploaded photo does not show clear damaged civic infrastructure. Please upload a real photo showing damage to roads, streetlights, drainage, or structures.",
          details: {
            detectedType: vision.issueType || "Unknown",
            reason: vision.probableCause || "No visible structural damage detected.",
            confidence,
          },
          pointsAwarded: 0,
        },
        { status: 400 }
      );
    }

    // 8. Priority Score Calculation
    let dynamicPriority = calculatePriority(vision);

    const baseScore = Number(dynamicPriority?.score || 0);
    const adjustedScore = applyIntegrityPenalty(baseScore, metadataValidation);
    dynamicPriority = {
      ...dynamicPriority,
      score: adjustedScore,
      municipalPriorityReason:
        metadataValidation.confidencePenalty > 0
          ? `${dynamicPriority?.municipalPriorityReason || "AI priority"} | Integrity penalty: -${metadataValidation.confidencePenalty}`
          : dynamicPriority?.municipalPriorityReason || "AI priority calculated",
    };

    const isValidCivicIssue = adjustedScore >= 50;
    const pointsAwarded = isValidCivicIssue ? 50 : 0;

    if (!isValidCivicIssue) {
      return NextResponse.json(
        {
          success: true,
          data: {
            id: null,
            priority: dynamicPriority,
            vision,
            executiveSummary: {
              summary:
                "Invalid / low-confidence civic report. No points awarded. Please upload a clear original photo of real infrastructure damage.",
            },
            pointsAwarded: 0,
            metadataValidation,
            reverseSearch,
          },
        },
        { status: 200 }
      );
    }

    // 9. Save Valid Issue to Firestore
    const safeImageUrl =
      fullImageUrl.length > 300000
        ? `data:${mimeType};base64,[IMAGE_DATA_TRUNCATED]`
        : fullImageUrl;

    const newIssue = {
      imageUrl: safeImageUrl,
      imageHash,
      reportedBy: body.uid || body.userId || "anonymous",
      reporterName: body.reporterName || "Citizen",
      reporterEmail: body.reporterEmail || "",
      location: {
        lat: Number(location.lat) || 16.3067,
        lng: Number(location.lng) || 80.4365,
        address: location.address,
      },
      status: ISSUE_STATUS.AI_ANALYSED,
      upvotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vision,
      context: aiResponseJson.context || {
        nearbyLandmarks: [],
        citizenImpact: "N/A",
        longTermRisk: "N/A",
      },
      priority: dynamicPriority,
      recommendation: aiResponseJson.recommendation || {
        department: "Public Works Department (PWD)",
        estimatedBudgetRange: "₹25,000 - ₹50,000",
      },
      executiveSummary: aiResponseJson.executiveSummary || {
        summary: `Structural hazard identified at ${location.address}.`,
      },
      duplicateDetection: {
        similarIssuesNearby: false,
        duplicateIssueIds: [],
      },
      communications: aiResponseJson.communications || {},
      integrity: {
        metadataValidation,
        reverseSearch,
        pointsAwarded,
      },
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAMES.ISSUES), {
      ...newIssue,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...newIssue,
        pointsAwarded,
      },
    });
  } catch (error: any) {
    console.error("API failure:", error);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message:
          error?.message ||
          "An unexpected error occurred while processing the request.",
      },
      { status: 500 }
    );
  }
}