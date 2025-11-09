function getBaseUrl() {
  // Check if we're in server-side (API routes) or client-side
  const isServer = typeof window === 'undefined';
  
  // In development, use relative URL for client-side to leverage Next.js proxy
  // But for server-side, we need absolute URL
  if (process.env.NODE_ENV === 'development') {
    if (isServer) {
      // Server-side: use the actual API base URL or default to the rewrite destination
      const baseUrl = process.env.LLM_API_BASE_URL || process.env.NEXT_PUBLIC_LLM_API_BASE_URL || 'https://keditech-playground.site';
      return baseUrl;
    }
    // Client-side: use relative URL to leverage Next.js rewrites
    return '';
  }

  // Production: always use absolute URL
  const baseUrl = process.env.LLM_API_BASE_URL || process.env.NEXT_PUBLIC_LLM_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("LLM_API_BASE_URL belum diset di .env.");
  }

  return baseUrl;
}

async function learnFromPdf({ file, userUuid, debug = false }) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/user/agent/data-layer/learn/pdf`;
  
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("user_uuid", userUuid);
  formData.append("debug", String(debug));

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    console.log('📡 Response status:', res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`LLM learn/pdf error: ${res.status} ${res.statusText} - ${text}`);
    }

    const data = await res.json().catch(() => null);
    return data;
  } catch (error) {
    throw error;
  }
}

async function analyzeBusinessDocument({ userUuid, debug = false }) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/user/agent/business/analyze`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_uuid: userUuid, debug }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Business analyze error: ${res.status} ${res.statusText} - ${text}`);
  }

  return res.json().catch(() => null);
}
  

async function getBusinessAdvisor({ userUuid, bisnisKategori, debug = false }) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/user/agent/business/advisor`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      user_uuid: userUuid, 
      bisnis_kategori: bisnisKategori,
      debug 
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Business advisor error: ${res.status} ${res.statusText} - ${text}`);
  }

  return res.json().catch(() => null);
}

async function getBusinessTrends({ userUuid, debug = false }) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/user/agent/business/trends`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      user_id: userUuid, 
      save_to_db: false,
      debug 
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Business trends error: ${res.status} ${res.statusText} - ${text}`);
  }

  return res.json().catch(() => null);
}

// Alias for getTrendsData (used by API route)
async function getTrendsData({ userUuid, debug = false }) {
  return getBusinessTrends({ userUuid, debug });
}

async function getBusinessEquipment({ userUuid, bisnisKategori, debug = false }) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/user/agent/business/equipment`;

  const requestBody = {
    user_uuid: userUuid,
    debug,
  };

  // Add bisnis_kategori if provided (required by endpoint)
  if (bisnisKategori) {
    requestBody.bisnis_kategori = bisnisKategori;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Business equipment error: ${res.status} ${res.statusText} - ${text}`);
  }

  return res.json().catch(() => null);
}


async function orderBusinessEquipment({ userUuid, items, paymentInfo, debug = false }) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/user/agent/business/order`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      user_uuid: userUuid,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      })),
      payment_info: paymentInfo,
      debug 
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Order equipment error: ${res.status} ${res.statusText} - ${text}`);
  }

  return res.json().catch(() => null);
}

/**
 * Process complete business equipment order workflow
 * This endpoint processes all 4 states: Financial Analysis, Trends, Equipment, Order Processing
 * 
 * @param {Object} params
 * @param {string} params.userId - User ID (default: "cmhq6nmie0001vazpfk2ig7yl")
 * @param {string} params.bisnisKategori - Business category (REQUIRED)
 * @param {string} params.message - Optional message (default: "I want to start a business")
 * @param {string} params.useCirclo - Agent tag (default: "business-specialist")
 * @param {boolean} params.debug - Debug mode
 * @returns {Promise<Object>} Response with response_dashboard containing order details
 */
async function processBusinessOrder({ 
  userId, 
  bisnisKategori, 
  message = "I want to start a business",
  useCirclo = "business-specialist",
  debug = false 
}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/user/agent/business/order`;

  // Build request body
  const requestBody = {
    user_id: userId || "cmhq6nmie0001vazpfk2ig7yl",
    use_circlo: useCirclo,
    message: message,
  };

  // Add bisnis_kategori if provided (REQUIRED)
  if (bisnisKategori) {
    requestBody.bisnis_kategori = bisnisKategori;
  }

  if (debug) {
    console.log("[processBusinessOrder] Request:", requestBody);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Business order error: ${res.status} ${res.statusText} - ${text}`);
  }

  const result = await res.json().catch(() => null);
  
  if (debug) {
    console.log("[processBusinessOrder] Response:", result);
  }

  return result;
}

async function getBusinessPlanning({ userUuid, debug = false }) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/user/agent/business/planning`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_uuid: userUuid, debug }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Business planning error: ${res.status} ${res.statusText} - ${text}`);
  }

  return res.json().catch(() => null);
}

export async function analyzeProfileWithAI({
  file,
  analysis,
  mode,
  userUuid,
  debug = false,
}) {
  try {
    const learnResponse = await learnFromPdf({ file, userUuid, debug });

    const businessAnalysis = await analyzeBusinessDocument({ userUuid, debug });

    return {
      success: true,
      userUuid,
      ideas: businessAnalysis?.business_ideas || [],
      financialAnalysis: businessAnalysis?.financial_summary || null,
      warnings: businessAnalysis?.warnings || [],
      debug: debug ? {
        analysis,
        mode,
        fileName: file?.name ?? null,
        userUuid,
        learnResponse,
        businessAnalysis,
      } : undefined,
    };
  } catch (error) {
    console.error("Error in analyzeProfileWithAI:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getBusinessData({
  userUuid,
  bisnisKategori,
  debug = false,
}) {
  try {
    // Fetch Advisor & Equipment secara parallel
    const [advisorData, equipmentData] = await Promise.all([
      getBusinessAdvisor({ userUuid, bisnisKategori, debug }),
      getBusinessEquipment({ userUuid, bisnisKategori, debug }),
    ]);

    return {
      success: true,
      advisor: {
        recommendations: advisorData?.recommendations || [],
        strategies: advisorData?.strategies || [],
        warnings: advisorData?.warnings || [],
      },
      equipment: {
        required_items: equipmentData?.required_items || [],
        optional_items: equipmentData?.optional_items || [],
        total_estimated_cost: equipmentData?.total_estimated_cost || 0,
      },
    };
  } catch (error) {
    console.error("Error in getBusinessData:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getTrendsData({ userUuid, saveToDb = false, debug = false }) {
  try {
    const trendsData = await getBusinessTrends({ userUuid, saveToDb, debug });

    return {
      success: true,
      summary: trendsData?.summary || "",
      trends: trendsData?.trends || [],
      categorizedTrends: trendsData?.categorized_trends || {},
      validationSummary: trendsData?.validation_summary || null,
      financialProfile: trendsData?.financial_profile || null,
      saveResult: trendsData?.save_result || null,
      debug: debug ? trendsData : undefined,
    };
  } catch (error) {
    console.error("Error in getTrendsData:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export { learnFromPdf };
export { analyzeBusinessDocument };
export { orderBusinessEquipment as orderEquipment };
export { processBusinessOrder };
export { getBusinessTrends };
export { getBusinessPlanning };
export { getTrendsData };