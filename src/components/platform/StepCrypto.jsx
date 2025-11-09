// platform/StepCrypto.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  TrendingUp,
  Lightbulb,
  AlertCircle,
  Loader2,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  Bitcoin,
  PieChart,
} from "lucide-react";
import { useBusinessWizard } from "@/context/BusinessWizardContext";

export default function StepCrypto() {
  const router = useRouter();
  const {
    userUuid,
    selectedCategory,
    financialAnalysis,
    businessTrends,
    trendsSummary,
    categorizedTrends,
    validationSummary
  } = useBusinessWizard();

  const [loading, setLoading] = useState(true);
  const [cryptoData, setCryptoData] = useState(null);
  const [advisorData, setAdvisorData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!userUuid || !selectedCategory) {
      setLoading(false);
      return;
    }

    const fetchCryptoData = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        // For crypto, we'll use the same business API but adapt the data
        const res = await fetch("/api/business", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_uuid: userUuid,
            bisnis_kategori: selectedCategory,
          }),
        });

        const json = await res.json();

        if (json.success) {
          setCryptoData(json.equipment); // Adapt equipment as crypto assets
          setAdvisorData(json.advisor);
        } else {
          throw new Error(json.error || "Failed to fetch crypto data");
        }
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        setErrorMsg(error.message || "Terjadi kesalahan memuat data crypto.");
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, [userUuid, selectedCategory]);

  const handleBack = () => {
    router.push("/");
  };

  const handleNext = () => {
    router.push("/wizard/result");
  };

  // Mock crypto assets based on equipment data
  const cryptoAssets = cryptoData?.required_items || [];
  const optionalAssets = cryptoData?.optional_items || [];

  // Calculate total portfolio value (mock)
  const totalPortfolioValue = [...cryptoAssets, ...optionalAssets].reduce(
    (sum, asset) => sum + (asset.price || 0),
    0
  );

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
                Step 3 dari 4
              </div>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Bitcoin className="h-6 w-6 text-orange-500" />
                Crypto Investment Analysis
              </CardTitle>
              <CardDescription className="text-sm">
                Analyze crypto investment opportunities based on your financial profile and risk tolerance.
              </CardDescription>
              {selectedCategory && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Investment focus: <span className="font-medium text-foreground">{selectedCategory}</span>
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
          {/* Financial Analysis */}
          {financialAnalysis && (
            <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-orange-600" />
                  Investment Profile Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Available Capital:</span>
                  <span className="font-semibold">
                    Rp {financialAnalysis.liquid_capital?.toLocaleString('id-ID') || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Risk Tolerance:</span>
                  <span className="font-semibold">
                    {financialAnalysis.risk_profile || "Moderate"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Investment Range:</span>
                  <span className="font-semibold text-xs">
                    Rp {financialAnalysis.capital_range?.min_capital?.toLocaleString('id-ID') || 0} -
                    Rp {financialAnalysis.capital_range?.max_capital?.toLocaleString('id-ID') || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Crypto Trends Summary */}
          {trendsSummary && (
            <Card className="border-l-4 border-l-green-500 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Crypto Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {trendsSummary.replace(/bisnis/g, 'crypto investment')}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Top Crypto Opportunities */}
          {businessTrends && businessTrends.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Bitcoin className="h-4 w-4 text-orange-600" />
                Top {businessTrends.length} Crypto Investment Opportunities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {businessTrends.slice(0, 6).map((trend, idx) => (
                  <Card
                    key={idx}
                    className="border border-orange-200 bg-orange-50/30 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-orange-900">
                          {trend.kategori_bisnis.replace(/bisnis/i, 'Crypto')}
                        </h4>
                        {trend.validated && trend.has_results && (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {trend.reason}
                      </p>
                      {trend.validation && trend.validation.result_count && (
                        <p className="text-xs text-green-700 font-medium">
                          ✓ {trend.validation.result_count.toLocaleString()} market signals
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="border border-border/60">
              <CardContent className="py-10 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-muted-foreground" size={28} />
                <p className="text-sm text-muted-foreground">
                  Analyzing crypto markets...
                </p>
              </CardContent>
            </Card>
          )}

          {errorMsg && !loading && (
            <p className="text-xs text-red-500">{errorMsg}</p>
          )}

          {!loading && !errorMsg && (
            <>
              {/* Investment Strategies */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-emerald-500" />
                  Crypto Investment Strategies
                </h3>

                {advisorData?.recommendations?.length > 0 && (
                  <Card className="border border-border/60 bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Recommended Strategies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {advisorData.recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="border-l-2 border-primary/60 pl-3"
                        >
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {advisorData?.strategies?.length > 0 && (
                  <Card className="border border-border/60 bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        Portfolio Allocation Strategies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {advisorData.strategies.map((strategy, idx) => (
                        <div
                          key={idx}
                          className="border-l-2 border-emerald-400/70 pl-3"
                        >
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {strategy}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {advisorData?.warnings?.length > 0 && (
                  <Card className="border border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        Risk Considerations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {advisorData.warnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className="border-l-2 border-red-400 pl-3"
                        >
                          <p className="text-xs md:text-sm text-red-700">
                            {warning}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Crypto Assets */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Bitcoin className="h-4 w-4 text-primary" />
                  Recommended Crypto Assets
                </h3>

                {/* Core Assets */}
                {cryptoAssets.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground">
                      Core Holdings
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {cryptoAssets.map((asset, idx) => (
                        <Card
                          key={asset.id || idx}
                          className="border border-border/60 bg-background"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Bitcoin className="h-4 w-4 text-orange-500" />
                              {asset.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Current Price: Rp {(asset.price || 0).toLocaleString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {asset.description || "Strategic crypto asset for portfolio diversification."}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {/* Optional Assets */}
                {optionalAssets.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground mt-2">
                      Alternative Investments
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {optionalAssets.map((asset, idx) => (
                        <Card
                          key={asset.id || `opt-${idx}`}
                          className="border border-border/60 bg-background"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              {asset.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Current Price: Rp {(asset.price || 0).toLocaleString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {asset.description || "Alternative crypto investment option."}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {cryptoAssets.length === 0 && optionalAssets.length === 0 && (
                  <Card className="border border-border/60 bg-muted/40">
                    <CardContent className="py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        No crypto assets available for this investment profile. Consider adjusting your risk tolerance.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Portfolio Summary */}
              {(cryptoAssets.length > 0 || optionalAssets.length > 0) && (
                <Card className="border border-border/60 bg-muted/40">
                  <CardContent className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        Estimated Portfolio Value:
                      </span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold">
                        Rp {totalPortfolioValue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {cryptoAssets.length + optionalAssets.length} assets
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
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
            Back
          </Button>
          <Button
            className="w-full md:w-auto"
            onClick={handleNext}
          >
            View Investment Plan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}