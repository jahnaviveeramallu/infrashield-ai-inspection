import { NextRequest, NextResponse } from "next/server";
import { generateResourcePlan } from "@/lib/agents/ResourceAgent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issues } = body;

    if (!issues || !Array.isArray(issues)) {
      return NextResponse.json(
        { success: false, error: "Issues array required" },
        { status: 400 }
      );
    }

    // Transform active issues into resource-allocated Work Orders
    const workOrders = issues.map((issue: any, index: number) => {
      const severity = (issue.vision?.severity || issue.severity || "medium").toLowerCase();
      const score = issue.priority?.score || issue.severityScore || 50;
      
      // Calculate machinery, crew size, and budgets
      const resources = generateResourcePlan(severity);

      const daysSinceReported = issue.createdAt
        ? Math.max(1, Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;

      // Smart Priority formula: Severity Score × Aging multiplier
      const priorityScore = Math.round(score * (1 + daysSinceReported * 0.1));

      return {
        id: `WO-2026-${1000 + index}`,
        issueId: issue.id,
        locationName: issue.location?.address || issue.locationName || "Monitored Infrastructure Zone",
        defectType: issue.vision?.issueType || issue.defectType || "Structural Anomaly",
        severity: severity.toUpperCase(),
        severityScore: score,
        daysSinceReported,
        resources,
        status: issue.status === "IN_PROGRESS" ? "in-progress" : "pending",
        priorityScore,
        createdAt: new Date().toISOString(),
      };
    });

    // Sort by highest priority score descending
    workOrders.sort((a, b) => b.priorityScore - a.priorityScore);

    return NextResponse.json({ success: true, data: workOrders });
  } catch (error) {
    console.error("WorkOrders generation API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate prioritized work orders" },
      { status: 500 }
    );
  }
}