import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { COLLECTION_NAMES } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    const q = query(
      collection(db, COLLECTION_NAMES.USERS),
      orderBy("civicScore", "desc"),
      limit(25)
    );

    const snapshot = await getDocs(q);
    const realUsers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, data: realUsers });
  } catch (error: any) {
    console.error("Leaderboard API error:", error);
    // Return empty array if error or empty database
    return NextResponse.json({ success: true, data: [] });
  }
}