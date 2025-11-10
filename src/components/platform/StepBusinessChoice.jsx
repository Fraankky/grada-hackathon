// components/platform/StepBusinessChoice.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useBusinessWizard } from "@/context/BusinessWizardContext";

export default function StepBusinessChoice() {
  const router = useRouter();
  const {
    userUuid,
    financialAnalysis,
    businessTrends,
    trendsSummary,
    categorizedTrends,
    validationSummary,
    setSelectedCategory,
  } = useBusinessWizard();

  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const handleSelectBusiness = (category) => {
    setSelectedBusiness(category);
  };

  const handleContinue = () => {
    if (!selectedBusiness) {
      alert("Pilih salah satu kategori bisnis terlebih dahulu.");
      return;
    }

    setSelectedCategory(selectedBusiness);
    router.push(`/wizard/equipment?userUuid=${userUuid}`);
  };

  const handleBack = () => {
    router.push("/");
  };

  if (!userUuid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sesi berakhir</CardTitle>
            <CardDescription>
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
      <Card className="w-full max-w-5xl rounded-2xl shadow-lg border border-border/60">
        <CardHeader className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
            Step 2 dari 4
          </div>
          <CardTitle className="text-xl md:text-2xl">
            Hasil Analisis & Pilihan Bisnis
          </CardTitle>
          <CardDescription className="text-sm">
            Berikut hasil analisis keuangan Anda dan rekomendasi bisnis yang trending. Pilih salah satu kategori bisnis untuk melanjutkan.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
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

          {/* Summary */}
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

          {/* Business Trends - Selection Cards */}
          {businessTrends && businessTrends.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Pilih Kategori Bisnis
              </h3>
              <p className="text-xs text-muted-foreground">
                Klik salah satu kategori bisnis di bawah untuk melihat rekomendasi peralatan dan strategi
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {businessTrends.slice(0, 9).map((trend, idx) => {
                  const isSelected = selectedBusiness === trend.kategori_bisnis;
                  return (
                    <Card
                      key={idx}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "border-2 border-primary bg-primary/5"
                          : "border border-purple-200 bg-purple-50/30"
                      }`}
                      onClick={() => handleSelectBusiness(trend.kategori_bisnis)}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-purple-900">
                            {trend.kategori_bisnis}
                          </h4>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                          {!isSelected && trend.validated && trend.has_results && (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {trend.reason}
                        </p>
                        {trend.validation && trend.validation.result_count > 0 && (
                          <p className="text-xs text-green-700 font-medium">
                            ✓ {trend.validation.result_count.toLocaleString()} hasil pencarian
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Validation Summary */}
          {validationSummary && validationSummary.serpapi_used && (
            <Card className="border border-yellow-200 bg-yellow-50/50">
              <CardContent className="py-3 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-yellow-700 shrink-0" />
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">{validationSummary.validated_count}</span> dari{" "}
                  <span className="font-semibold">{validationSummary.total_count}</span> trends 
                  telah divalidasi menggunakan SerpAPI
                </p>
              </CardContent>
            </Card>
          )}

          {/* No data fallback */}
          {(!businessTrends || businessTrends.length === 0) && (
            <Card className="border border-border/60 bg-muted/40">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Tidak ada data trending bisnis yang tersedia. Silakan coba upload ulang dokumen keuangan Anda.
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
            size="sm"
            className="w-full md:w-auto"
            onClick={handleContinue}
            disabled={!selectedBusiness}
          >
            Lanjut ke Peralatan
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
