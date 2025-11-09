import { getTrendsData } from "@/lib/ai-service";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_uuid, user_id } = body;

    // Support both user_uuid and user_id for backward compatibility
    const userId = user_id || user_uuid;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id or user_uuid required" },
        { status: 400 }
      );
    }

    const result = await getTrendsData({
      userUuid: userId,
      debug: process.env.NODE_ENV === "development",
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error in /api/trends:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}