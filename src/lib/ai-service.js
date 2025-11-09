function getBaseUrl() {
  // In development, use relative URL to leverage Next.js proxy
  if (process.env.NODE_ENV === 'development') {
    return '';
  }

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
    body: JSON.stringify({ user_uuid: userUuid, debug }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Business trends error: ${res.status} ${res.statusText} - ${text}`);
  }

  return res.json().catch(() => null);
}

async function getBusinessEquipment({ userUuid, debug = false }) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1/user/agent/business/equipment`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_uuid: userUuid, debug }),
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
      getBusinessEquipment({ userUuid, debug }),
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
export { getBusinessTrends };
export { getBusinessPlanning };