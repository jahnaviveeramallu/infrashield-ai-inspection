import { evaluatePriority } from "@/lib/agents/PriorityAgent";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { buildGeminiPrompt } from "@/lib/gemini/prompt";
import { calculatePriority } from "@/lib/agents/PriorityAgent";
import { COLLECTION_NAMES, ISSUE_STATUS } from "@/constants";
import crypto from "crypto";

function createImageHash(base64Data: string): string {
  return crypto.createHash("sha256").update(base64Data).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rawImage = body.imageBase64 || body.base64Image || body.imageUrl;
    const location = body.location;
    const userDescription = body.userDescription || "";

    // 1. Mandatory Location Check
    if (!location || (!location.address && (!location.lat || !location.lng))) {
      return NextResponse.json(
        {
          success: false,
          error: "LOCATION_REQUIRED",
          message: "Please click 'Auto-Detect GPS' or enter a valid location address before submitting.",
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

    if (rawImage.startsWith("data:")) {
      const match = rawImage.match(/^data:(image\/\w+);base64,/);
      if (match && match[1]) {
        mimeType = match[1];
      }
      base64Data = rawImage.replace(/^data:image\/\w+;base64,/, "");
    }

    const fullImageUrl = rawImage.startsWith("data:")
      ? rawImage
      : `data:${mimeType};base64,${rawImage}`;

    const imageHash = createImageHash(base64Data);

    // 3. Firestore Duplicate Image Check
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
            message: "DUPLICATE DETECTED: This photo has already been reported.",
          },
          { status: 400 }
        );
      }
    } catch (dupErr) {
      console.warn("Duplicate check warning:", dupErr);
    }

    // 4. Gemini AI Vision Analysis
    const rawApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");

    if (!apiKey || apiKey.length < 20 || apiKey.includes("YourKey")) {
      console.error("Gemini API Key missing or misconfigured in environment variables.");
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
    
    // Updated with active standard Gemini API model identifiers
    const MODELS_TO_TRY = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];
    
    const promptText = buildGeminiPrompt() + (userDescription ? `\n\nInspector Observation Notes: ${userDescription}` : "");

    let aiResponseJson: any = null;
    let lastErrorDetails: string = "";

    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent([
          promptText,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ]);

        const textResponse = result.response.text();
        const cleanedJson = textResponse
          .replace(/```json/gi, "")
          .replace(/```/gi, "")
          .trim();

        aiResponseJson = JSON.parse(cleanedJson);
        console.log(`✅ Gemini AI Scan Successful with model: ${modelName}`);
        break;
      } catch (err: any) {
        console.error(`Gemini model ${modelName} failed:`, err?.message || err);
        lastErrorDetails = err?.message || String(err);
      }
    }

    if (!aiResponseJson) {
      return NextResponse.json(
        {
          success: false,
          error: "AI_PROCESSING_ERROR",
          message: "Gemini API failed to parse or analyze the image.",
          details: lastErrorDetails,
        },
        { status: 500 }
      );
    }

    // 5. Strict Gatekeeper Validation
    const vision = aiResponseJson.vision || {};
    const isInfra = vision.isInfrastructure === true;
    const hasDamage = vision.hasDamage === true;

    // Reject non-infrastructure, artworks, or undamaged images
    if (!isInfra || !hasDamage) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_INFRASTRUCTURE_IMAGE",
          message: "REJECTED: The uploaded photo does not show damaged civic infrastructure. Please upload a photo showing clear damage to roads, streetlights, drainage, or structures.",
          details: {
            detectedType: vision.issueType || "Unknown",
            reason: vision.probableCause || "No visible structural damage detected."
          }
        },
        { status: 400 }
      );
    }

    // 6. Dynamic Priority Score Calculation
    const dynamicPriority = calculatePriority(
      vision,
      Number(aiResponseJson.priority?.score) || 0,
      0
    );

    // 7. Save Valid Issue to Firestore (Preventing >1MB Base64 Overhead)
    const safeImageUrl = fullImageUrl.length > 500000 
      ? `data:${mimeType};base64,[IMAGE_DATA_TRUNCATED_FOR_FIRESTORE]` 
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
      vision: vision,
      context: aiResponseJson.context || { nearbyLandmarks: [], citizenImpact: "N/A", longTermRisk: "N/A" },
      priority: dynamicPriority,
      recommendation: aiResponseJson.recommendation || { department: "Public Works Department (PWD)", estimatedBudgetRange: "₹25,000 - ₹50,000" },
      executiveSummary: aiResponseJson.executiveSummary || { summary: `Structural hazard identified at ${location.address}.` },
      duplicateDetection: {
        similarIssuesNearby: false,
        duplicateIssueIds: [],
      },
      communications: aiResponseJson.communications || {},
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAMES.ISSUES), {
      ...newIssue,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...newIssue },
    });

  } catch (error: any) {
    console.error("API unexpected failure:", error);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: error?.message || "An unexpected error occurred while processing the request.",
      },
      { status: 500 }
    );
  }
}