import { processBusinessOrder } from "@/lib/ai-service";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, bisnis_kategori, message, use_circlo } = body;

    if (!bisnis_kategori) {
      return NextResponse.json(
        { success: false, error: "bisnis_kategori is required" },
        { status: 400 }
      );
    }

    const result = await processBusinessOrder({
      userId: user_id,
      bisnisKategori: bisnis_kategori,
      message: message || "I want to start a business",
      useCirclo: use_circlo || "business-specialist",
      debug: process.env.NODE_ENV === "development",
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in /api/business/order:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

