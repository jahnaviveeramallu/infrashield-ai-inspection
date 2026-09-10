import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, query, where } from "firebase/firestore";
import { COLLECTION_NAMES } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    const role = searchParams.get("role");

    let snapshot;

    // Municipal officer sees ALL reports
    if (role === "official") {
      snapshot = await getDocs(collection(db, COLLECTION_NAMES.ISSUES));
    }
    // Citizen sees only their own reports
    else if (uid) {
      const q = query(
        collection(db, COLLECTION_NAMES.ISSUES),
        where("reportedBy", "==", uid)
      );
      snapshot = await getDocs(q);
    }
    // No auth = empty result
    else {
      return NextResponse.json({ success: true, data: [] });
    }

    const issues = snapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() ||
          data.createdAt ||
          new Date().toISOString(),
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString?.() ||
          data.updatedAt ||
          new Date().toISOString(),
      };
    });

    // Sort newest first
    issues.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, data: issues });
  } catch (error: any) {
    console.error("Issues GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch issues",
        data: [],
      },
      { status: 500 }
    );
  }
}