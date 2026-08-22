import { NextRequest, NextResponse } from "next/server";
import { HistoryService } from "@/services/HistoryService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> | { locationId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { locationId } = resolvedParams;

    // Fetch from Firebase with automatic fallback to rich campus demo data
    let history = await HistoryService.getHistoryByLocation(locationId);

    if (!history || history.records.length === 0) {
      history = HistoryService.getDemoHistory(locationId);
    }

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch historical audit data" },
      { status: 500 }
    );
  }
}