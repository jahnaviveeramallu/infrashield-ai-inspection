import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { COLLECTION_NAMES } from "@/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const body = await request.json();
    const { status } = body; // 'IN_PROGRESS' or 'RESOLVED'

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status field is required" },
        { status: 400 }
      );
    }

    // Update the issue's state inside Firestore
    const issueRef = doc(db, COLLECTION_NAMES.ISSUES, id);
    await updateDoc(issueRef, {
      status: status.toUpperCase(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true, message: `Issue state updated to ${status}` });
  } catch (error: any) {
    console.error("Failed to update status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lifecycle status" },
      { status: 500 }
    );
  }
}