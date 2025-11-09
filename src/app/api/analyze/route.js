
import { analyzeBusinessDocument } from "@/lib/ai-service";

export async function POST(request) {
  try {
    const { user_uuid, debug = false } = await request.json();
    
    const result = await analyzeBusinessDocument({ 
      userUuid: user_uuid, 
      debug 
    });
    
    return Response.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}