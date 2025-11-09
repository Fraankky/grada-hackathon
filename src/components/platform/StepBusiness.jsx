// platform/StepBusiness.jsx
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
  ShoppingCart,
  Package,
  ExternalLink,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Loader2,
  ArrowLeft,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { useBusinessWizard } from "@/context/BusinessWizardContext";

export default function StepBusiness() {
  const router = useRouter();
  const { 
    userUuid, 
    selectedCategory,
    // Ambil data dari context (yang disimpan saat upload)
    financialAnalysis,
    businessTrends,
    trendsSummary,
    categorizedTrends,
    validationSummary
  } = useBusinessWizard();

  const [loading, setLoading] = useState(true);
  const [equipmentData, setEquipmentData] = useState(null);
  const [advisorData, setAdvisorData] = useState(null);
  const [cart, setCart] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!userUuid || !selectedCategory) {
      setLoading(false);
      return;
    }

    const fetchBusinessData = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
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
          setEquipmentData(json.equipment);
          setAdvisorData(json.advisor);
        } else {
          throw new Error(json.error || "Failed to fetch business data");
        }
      } catch (error) {
        console.error("Error fetching business data:", error);
        setErrorMsg(error.message || "Terjadi kesalahan memuat data bisnis.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [userUuid, selectedCategory]);

  const toggleCart = (item) => {
    const exists = cart.some((p) => p.id === item.id);
    if (exists) {
      setCart(cart.filter((p) => p.id !== item.id));
    } else {
      setCart([...cart, item]);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Tambahkan minimal 1 barang ke keranjang!");
      return;
    }
    router.push("/wizard/equipment");
  };

  const handleBack = () => {
    router.push("/");
  };

  const requiredItems = equipmentData?.required_items || [];
  const optionalItems = equipmentData?.optional_items || [];
  const allItems = [...requiredItems, ...optionalItems];
  const totalCartPrice = cart.reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );

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
                Step 2 dari 4
              </div>
              <CardTitle className="text-xl md:text-2xl">
                Business Strategy 
              </CardTitle>
              <CardDescription className="text-sm">
                View recommended business strategies and a list of recommended equipment based on your chosen business category.
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
          
          {/* Financial Analysis */}
          {financialAnalysis && (
            <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Analisis Keuangan Anda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Modal Cair:</span>
                  <span className="font-semibold">
                    Rp {financialAnalysis.liquid_capital?.toLocaleString('id-ID') || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Profil Risiko:</span>
                  <span className="font-semibold">
                    {financialAnalysis.risk_profile || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Range Modal:</span>
                  <span className="font-semibold text-xs">
                    Rp {financialAnalysis.capital_range?.min_capital?.toLocaleString('id-ID') || 0} - 
                    Rp {financialAnalysis.capital_range?.max_capital?.toLocaleString('id-ID') || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Trends */}
          {trendsSummary && (
            <Card className="border-l-4 border-l-green-500 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-green-600" />
                  Rekomendasi Bisnis Untukmu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {trendsSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Top Business Trends - Compact Cards */}
          {businessTrends && businessTrends.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Top {businessTrends.length} Trending Business Ideas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {businessTrends.slice(0, 6).map((trend, idx) => (
                  <Card 
                    key={idx} 
                    className="border border-purple-200 bg-purple-50/30 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-purple-900">
                          {trend.kategori_bisnis}
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
                          ✓ {trend.validation.result_count.toLocaleString()} hasil pencarian
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Categorized Trends - Collapsible */}
          {categorizedTrends && Object.keys(categorizedTrends).length > 0 && (
            <Card className="border border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Kategori Bisnis Trending
                </CardTitle>
                <CardDescription className="text-xs">
                  Bisnis yang sedang naik daun berdasarkan kategori
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categorizedTrends).map(([category, trends]) => (
                  <div key={category} className="border-l-4 border-purple-500 pl-4 space-y-2">
                    <h4 className="font-semibold text-sm text-purple-900">{category}</h4>
                    <ul className="space-y-1.5">
                      {trends.map((trend, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">•</span>
                          <div className="flex-1">
                            <span className="font-medium text-foreground">
                              {trend.kategori_bisnis}
                            </span>
                            : {trend.reason}
                            {trend.validated && trend.has_results && (
                              <span className="ml-2 text-green-600 font-medium">
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

          {/* ========== DATA EQUIPMENT & STRATEGI (EXISTING) ========== */}

          {loading && (
            <Card className="border border-border/60">
              <CardContent className="py-10 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-muted-foreground" size={28} />
                <p className="text-sm text-muted-foreground">
                  Memuat data equipment & strategi...
                </p>
              </CardContent>
            </Card>
          )}

          {errorMsg && !loading && (
            <p className="text-xs text-red-500">{errorMsg}</p>
          )}

          {!loading && !errorMsg && (
            <>
              {/* Strategi bisnis */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Strategi Bisnis
                </h3>

                {advisorData?.recommendations?.length > 0 && (
                  <Card className="border border-border/60 bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Rekomendasi Utama
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
                        Strategi Operasional
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
                        Hal yang Perlu Diwaspadai
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

              {/* Peralatan */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Peralatan yang Dibutuhkan
                </h3>

                {/* Required */}
                {requiredItems.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground">
                      Peralatan wajib
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {requiredItems.map((item, idx) => {
                        const selected = cart.some(
                          (p) => p.id === item.id || p.name === item.name
                        );
                        return (
                          <Card
                            key={item.id || idx}
                            className={`border transition ${
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border/60 bg-background"
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">
                                {item.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Rp {(item.price || 0).toLocaleString()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-xs md:text-sm text-muted-foreground">
                                {item.description ||
                                  "Peralatan wajib untuk operasional."}
                              </p>
                              <div className="flex gap-2">
                                {item.link && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() =>
                                      window.open(item.link, "_blank")
                                    }
                                    className="flex-1 flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Lihat
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  type="button"
                                  onClick={() =>
                                    toggleCart({
                                      ...item,
                                      id: item.id || idx,
                                    })
                                  }
                                  className="flex-1"
                                >
                                  {selected ? "Hapus" : "Tambah"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Optional */}
                {optionalItems.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground mt-2">
                      Peralatan opsional
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {optionalItems.map((item, idx) => {
                        const selected = cart.some(
                          (p) => p.id === item.id || p.name === item.name
                        );
                        return (
                          <Card
                            key={item.id || `opt-${idx}`}
                            className={`border transition ${
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border/60 bg-background"
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">
                                {item.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Rp {(item.price || 0).toLocaleString()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-xs md:text-sm text-muted-foreground">
                                {item.description || "Peralatan tambahan."}
                              </p>
                              <div className="flex gap-2">
                                {item.link && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() =>
                                      window.open(item.link, "_blank")
                                    }
                                    className="flex-1 flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Lihat
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  type="button"
                                  onClick={() =>
                                    toggleCart({
                                      ...item,
                                      id: item.id || `opt-${idx}`,
                                    })
                                  }
                                  className="flex-1"
                                >
                                  {selected ? "Hapus" : "Tambah"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}

                {allItems.length === 0 && (
                  <Card className="border border-border/60 bg-muted/40">
                    <CardContent className="py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Tidak ada data equipment untuk kategori ini. Coba
                        kategori lain atau hubungi support.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Ringkasan keranjang */}
              {allItems.length > 0 && (
                <Card className="border border-border/60 bg-muted/40">
                  <CardContent className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        Total Keranjang:
                      </span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold">
                        Rp {totalCartPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {cart.length} item dipilih
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
            Kembali
          </Button>
          <Button
            className="w-full md:w-auto"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Checkout & Lanjut ke Peralatan ({cart.length})
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}