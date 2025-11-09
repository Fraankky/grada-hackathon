import { getBusinessData } from "@/lib/ai-service";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_uuid, bisnis_kategori } = body;

    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "user_uuid required" },
        { status: 400 }
      );
    }

    if (!bisnis_kategori) {
      return NextResponse.json(
        { success: false, error: "bisnis_kategori required" },
        { status: 400 }
      );
    }

    const result = await getBusinessData({
      userUuid: user_uuid,
      bisnisKategori: bisnis_kategori,
      debug: process.env.NODE_ENV === "development",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/business:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

