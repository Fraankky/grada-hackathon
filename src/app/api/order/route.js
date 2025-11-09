import { orderEquipment } from "@/lib/ai-service";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_uuid, items, payment_info } = body;

    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "user_uuid required" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "items required and must be non-empty array" },
        { status: 400 }
      );
    }

    const result = await orderEquipment({
      userUuid: user_uuid,
      items,
      paymentInfo: payment_info || {},
      debug: process.env.NODE_ENV === "development",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/order:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
