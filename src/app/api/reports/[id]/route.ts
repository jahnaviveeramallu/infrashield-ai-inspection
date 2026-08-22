import { NextRequest, NextResponse } from "next/server";
import { EngineeringReportData } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    // Structured engineering report data payload
    const reportData: EngineeringReportData = {
      reportId: `INFRA-${id.substring(0, 8).toUpperCase()}`,
      date: new Date().toLocaleDateString("en-IN"),
      location: "Vignan University Main Campus Road, Guntur, AP",
      gpsCoordinates: "16.3067° N, 80.4365° E",
      defectType: "Road Structural Defect",
      severity: "critical",
      severityScore: 89,
      description:
        "Severe shear crack and surface subsidence observed across the dual-lane carriage entrance corridor. Immediate stabilization necessary.",
      aiAnalysis:
        "Structural scanning indicates aggregate deterioration and sub-base moisture saturation resulting from inadequate storm drain divergence.",
      estimatedCost: 145000,
      recommendedAction:
        "Implement immediate traffic diversion. Excavate degraded base layer, pack with high-density WMM, and lay hot-mix asphalt topping.",
      department: "Public Works Department (PWD) Roads Division",
      inspectorName: "Chief Engineer (InfraShield Hub)",
    };

    return NextResponse.json({ success: true, data: reportData });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate engineering report payload" },
      { status: 500 }
    );
  }
}