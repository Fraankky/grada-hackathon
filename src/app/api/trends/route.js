import { getTrendsData } from "@/lib/ai-service";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_uuid } = body;

    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "user_uuid required" },
        { status: 400 }
      );
    }

    const result = await getTrendsData({
      userUuid: user_uuid,
      debug: process.env.NODE_ENV === "development",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/trends:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}