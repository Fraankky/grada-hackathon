// platform/StepBusiness.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  TrendingUp,
  Loader2,
  ArrowLeft,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { useBusinessWizard } from "@/context/BusinessWizardContext";

export default function StepBusiness() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    userUuid: contextUserUuid, 
    setUserUuid,
    selectedCategory,
   
    financialAnalysis,
    businessTrends: contextBusinessTrends,
    trendsSummary: contextTrendsSummary,
    categorizedTrends: contextCategorizedTrends,
    validationSummary: contextValidationSummary,
    // Setters untuk update context
    setBusinessTrends,
    setTrendsSummary,
    setCategorizedTrends,
    setValidationSummary,
  } = useBusinessWizard();

  // Get userUuid from context, URL params, or localStorage
  const userUuid = contextUserUuid || searchParams.get("userUuid");

  const [trendsLoading, setTrendsLoading] = useState(false);
  
  // Local state for trends data (will be merged with context data)
  const [trendsData, setTrendsData] = useState(null);
  
  // Ref to track if trends data has been fetched to prevent multiple calls
  const trendsFetchedRef = useRef(false);
  
  // Use trends data from API or fallback to context
  const businessTrends = trendsData?.trends || contextBusinessTrends || [];
  const trendsSummary = trendsData?.summary || contextTrendsSummary || "";
  const categorizedTrends = trendsData?.categorized_trends || contextCategorizedTrends || {};
  const validationSummary = trendsData?.validation_summary || contextValidationSummary || null;

  // Sync userUuid from URL to context if available
  useEffect(() => {
    const urlUserUuid = searchParams.get("userUuid");
    if (urlUserUuid && urlUserUuid !== contextUserUuid) {
      setUserUuid(urlUserUuid);
    }
  }, [searchParams, contextUserUuid, setUserUuid]);

  // Fetch trends data from API (only once per userUuid)
  useEffect(() => {
    if (!userUuid) {
      return;
    }

    // Prevent multiple calls for the same userUuid
    if (trendsFetchedRef.current === userUuid) {
      return;
    }

    const fetchTrendsData = async () => {
      // Mark as fetching for this userUuid
      trendsFetchedRef.current = userUuid;
      setTrendsLoading(true);
      
      try {
        const res = await fetch("/api/trends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userUuid,
          }),
        });

        const json = await res.json();

        if (json.success) {
          // Update local state
          setTrendsData({
            trends: json.trends || [],
            summary: json.summary || "",
            categorized_trends: json.categorized_trends || {},
            validation_summary: json.validation_summary || null,
            financial_profile: json.financial_profile || null,
          });
          
          // Update context for persistence
          if (json.trends) setBusinessTrends(json.trends);
          if (json.summary) setTrendsSummary(json.summary);
          if (json.categorized_trends) setCategorizedTrends(json.categorized_trends);
          if (json.validation_summary) setValidationSummary(json.validation_summary);
        } else {
          console.warn("Trends API returned error:", json.error);
          // Reset ref on error so it can retry if needed
          trendsFetchedRef.current = null;
          // If API fails, use context data (already set from upload step)
        }
      } catch (error) {
        console.error("Error fetching trends data:", error);
        // Reset ref on error so it can retry if needed
        trendsFetchedRef.current = null;
        // If API fails, use context data (already set from upload step)
      } finally {
        setTrendsLoading(false);
      }
    };

    fetchTrendsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUuid]); // Only depend on userUuid, setters are stable

  const handleBack = () => {
    router.push("/");
  };

  const handleNext = () => {
    const params = new URLSearchParams({ userUuid });
    if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    router.push(`/wizard/equipment?${params}`);
  };

  // Kalau userUuid nggak ada, anggap sesi sudah habis
  if (!userUuid) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-sm rounded-2xl shadow-lg border border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Sesi berakhir</CardTitle>
            <CardDescription className="text-sm">
              Data sesi tidak ditemukan. Silakan mulai kembali dari awal.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={handleBack}>
              Kembali ke awal
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
      <Card className="w-full max-w-4xl rounded-2xl shadow-lg border border-border/60">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
                Step 2 dari 5
              </div>
              <CardTitle className="text-xl md:text-2xl">
                Business Analysis
              </CardTitle>
              <CardDescription className="text-sm">
                Analisis keuangan dan rekomendasi bisnis berdasarkan dokumen yang Anda upload.
              </CardDescription>
              {selectedCategory && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Kategori bisnis:{" "}
                  <span className="font-medium text-foreground">
                    {selectedCategory}
                  </span>
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="hidden md:inline-flex"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ========== TAMPILKAN DATA DARI ANALYZE ========== */}
          
          {/* API Response Overview Card */}
          {financialAnalysis && (
            <Card className="border-l-4 border-l-gray-500 bg-gradient-to-r from-gray-50/80 to-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <CheckCircle className="h-5 w-5 text-gray-800" />
                  Ringkasan Analisis API
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Data lengkap dari analisis dokumen keuangan Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {financialAnalysis.user_uuid && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="font-mono text-xs font-semibold">
                      {financialAnalysis.user_uuid.substring(0, 8)}...
                    </span>
                  </div>
                )}
                {financialAnalysis.current_balance !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Saldo Saat Ini:</span>
                    <span className="font-semibold">
                      Rp {financialAnalysis.current_balance.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                {financialAnalysis.patterns && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-900 mb-2">Pola Transaksi:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {financialAnalysis.patterns.total_transactions && (
                        <div>
                          <span className="text-muted-foreground">Total Transaksi:</span>
                          <span className="ml-2 font-semibold">
                            {financialAnalysis.patterns.total_transactions.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {financialAnalysis.patterns.total_debet !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Total Debet:</span>
                          <span className="ml-2 font-semibold">
                            Rp {financialAnalysis.patterns.total_debet.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                      {financialAnalysis.patterns.total_kredit !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Total Kredit:</span>
                          <span className="ml-2 font-semibold">
                            Rp {financialAnalysis.patterns.total_kredit.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Financial Analysis */}
          {financialAnalysis && (
            <Card className="border-l-4 border-l-gray-500 bg-gradient-to-r from-gray-50/80 to-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <DollarSign className="h-5 w-5 text-gray-800" />
                  Analisis Keuangan Anda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Modal Cair:</span>
                  <span className="font-semibold">
                    Rp {(
                      financialAnalysis.liquid_capital || 
                      financialAnalysis.current_balance || 
                      0
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
                {financialAnalysis.monthly_cash_flow !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Arus Kas Bulanan:</span>
                    <span className={`font-semibold ${
                      financialAnalysis.monthly_cash_flow >= 0 
                        ? 'text-gray-700' 
                        : 'text-gray-500'
                    }`}>
                      {financialAnalysis.monthly_cash_flow >= 0 ? '+' : ''}
                      Rp {Math.abs(financialAnalysis.monthly_cash_flow || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Profil Risiko:</span>
                  <span className="font-semibold">
                    {financialAnalysis.risk_profile || "-"}
                  </span>
                </div>
                {financialAnalysis.capital_range && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Range Modal:</span>
                    <span className="font-semibold text-xs">
                      Rp {financialAnalysis.capital_range?.min_capital?.toLocaleString('id-ID') || 0} - 
                      Rp {financialAnalysis.capital_range?.max_capital?.toLocaleString('id-ID') || 0}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary Trends / Full Response */}
          {trendsLoading ? (
            <Card className="border-l-4 border-l-gray-500 bg-gradient-to-r from-gray-50/80 to-white shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 bg-gray-300 rounded animate-pulse" />
                  <div className="h-5 w-48 bg-gray-300 rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full mt-4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
                <div className="mt-6 flex items-center justify-center gap-3 pt-4 border-t border-gray-200">
                  <Loader2 className="animate-spin text-gray-600 h-5 w-5" />
                  <p className="text-sm text-muted-foreground">Memuat rekomendasi bisnis...</p>
                </div>
              </CardContent>
            </Card>
          ) : trendsSummary ? (
            <Card className="border-l-4 border-l-gray-500 bg-gradient-to-r from-gray-50/80 to-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <Lightbulb className="h-5 w-5 text-gray-800" />
                  Rekomendasi Bisnis Untukmu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {trendsSummary.split('\n').map((line, idx) => {
                    // Format bullet points and headings
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                      return (
                        <div key={idx} className="ml-4 my-1">
                          {line}
                        </div>
                      );
                    }
                    if (line.trim().endsWith(':')) {
                      return (
                        <div key={idx} className="font-semibold text-foreground mt-3 mb-1">
                          {line}
                        </div>
                      );
                    }
                    return <div key={idx} className="my-1">{line}</div>;
                  })}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Top Business Trends - Compact Cards */}
          {trendsLoading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-56 bg-gray-300 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <Card 
                    key={idx} 
                    className="border border-gray-300 bg-white"
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-4/6" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Loader2 className="animate-spin text-gray-600 h-4 w-4" />
                <p className="text-xs text-muted-foreground">Memuat trending business ideas...</p>
              </div>
            </div>
          ) : businessTrends && businessTrends.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-700" />
                Top {businessTrends.length} Trending Business Ideas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessTrends.slice(0, 6).map((trend, idx) => (
                  <Card 
                    key={idx} 
                    className="border border-gray-300 bg-white hover:border-gray-400 hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                          {trend.kategori_bisnis}
                        </h4>
                        {trend.validated && trend.has_results && (
                          <CheckCircle className="h-4 w-4 text-gray-800 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {trend.reason}
                      </p>
                      {trend.validation && trend.validation.result_count && (
                        <p className="text-xs text-gray-800 font-medium flex items-center gap-1">
                          <span>✓</span>
                          <span>{trend.validation.result_count.toLocaleString()} hasil pencarian</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {/* Categorized Trends - Collapsible */}
          {!trendsLoading && categorizedTrends && Object.keys(categorizedTrends).length > 0 && (
            <Card className="border border-gray-300 bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <TrendingUp className="h-5 w-5 text-gray-800" />
                  Kategori Bisnis Trending
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Bisnis yang sedang naik daun berdasarkan kategori
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {Object.entries(categorizedTrends).map(([category, trends]) => (
                  <div key={category} className="border-l-4 border-gray-500 pl-5 space-y-2.5">
                    <h4 className="font-semibold text-sm text-gray-900">{category}</h4>
                    <ul className="space-y-1.5">
                      {trends.map((trend, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-gray-600 mt-0.5">•</span>
                          <div className="flex-1">
                            <span className="font-medium text-foreground">
                              {trend.kategori_bisnis}
                            </span>
                            : {trend.reason}
                            {trend.validated && trend.has_results && (
                              <span className="ml-2 text-gray-700 font-medium">
                                ✓ ({trend.validation?.result_count} hasil)
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Validation Summary */}
          {validationSummary && validationSummary.serpapi_used && (
            <Card className="border border-yellow-200 bg-yellow-50/50">
              <CardContent className="py-3 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-yellow-700 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">{validationSummary.validated_count}</span> dari{" "}
                  <span className="font-semibold">{validationSummary.total_count}</span> trends 
                  telah divalidasi menggunakan SerpAPI
                </p>
              </CardContent>
            </Card>
          )}

        </CardContent>

        <CardFooter className="flex flex-col md:flex-row gap-3 md:justify-between md:items-center">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="w-full md:w-auto"
            onClick={handleBack}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Kembali
          </Button>
          <Button
            className="w-full md:w-auto"
            onClick={handleNext}
          >
            Lanjut ke Equipment & Strategy
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}