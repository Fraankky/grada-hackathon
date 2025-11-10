import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_uuid, debug } = body;

    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "user_uuid required" },
        { status: 400 }
      );
    }

    // Mock business analysis response
    const result = {
      business_ideas: [
        {
          title: "E-commerce Platform",
          description: "Build an online marketplace for local artisans",
          feasibility_score: 85,
          estimated_cost: 50000,
          potential_revenue: 100000,
        },
        {
          title: "Mobile App Development",
          description: "Create apps for small businesses",
          feasibility_score: 78,
          estimated_cost: 30000,
          potential_revenue: 75000,
        },
      ],
      financial_summary: {
        total_investment_needed: 80000,
        projected_monthly_revenue: 15000,
        break_even_months: 6,
        roi_percentage: 120,
      },
      warnings: [
        "Market competition is high in e-commerce",
        "Need technical skills for app development",
      ],
    };

    if (debug) {
      result.debug = {
        user_uuid,
        analysis_timestamp: new Date().toISOString(),
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/v1/user/agent/business/analyze:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}