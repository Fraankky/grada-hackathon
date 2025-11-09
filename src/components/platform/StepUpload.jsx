// platform/StepUpload.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { UploadCloud, FileText } from "lucide-react";

import { learnFromPdf, analyzeBusinessDocument } from "@/lib/ai-service";
import { useBusinessWizard } from "@/context/BusinessWizardContext";

export default function StepUpload() {
  const router = useRouter();
  const {
    userUuid,
    setUserUuid,
    mode,
    setMode,
    setFinancialAnalysis,
  } = useBusinessWizard();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) setErrorMsg("");
  };

  const handleNext = async () => {
  try {
    setErrorMsg("");
    if (!file) {
      setErrorMsg("Silakan upload file PDF terlebih dahulu.");
      return;
    }
    if (!mode) {
      setErrorMsg("Pilih dulu jenis analisis: Bisnis atau Crypto.");
      return;
    }

    setLoading(true);

    const uid = userUuid || crypto.randomUUID();
    setUserUuid(uid);

    // 1) belajar dari PDF
    await learnFromPdf({ file, userUuid: uid, debug: false });

    // 2) kalau pilih bisnis → analisis keuangan bisnis
    if (mode === "business") {
      const businessAnalysis = await analyzeBusinessDocument({
        userUuid: uid,
        debug: false,
      });

      // Simpan ke context
      setFinancialAnalysis(businessAnalysis?.financial_summary || null);
      setBusinessTrends(businessAnalysis?.trends || []);
      setTrendsSummary(businessAnalysis?.summary || "");
      setCategorizedTrends(businessAnalysis?.categorized_trends || {});
      setValidationSummary(businessAnalysis?.validation_summary || null);
    }

    // 3) redirect ke step berikutnya dengan userUuid sebagai param
    const params = new URLSearchParams({ userUuid: uid });
    router.push(mode === "business" ? `/wizard/business?${params}` : `/wizard/crypto?${params}`);
  } catch (err) {
    console.error(err);
    setErrorMsg(err.message || "Terjadi kesalahan.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-white to-muted px-4 py-8 flex items-center justify-center">
      <Card className="w-full max-w-xl rounded-2xl shadow-lg border border-border/60">
        <CardHeader className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
            Step 1 dari 4
          </div>
          <CardTitle className="text-xl md:text-2xl">
            Upload Financial Reports
          </CardTitle>
          <CardDescription className="text-sm">
            Upload a PDF file of your financial statements, then select whether you would like to receive recommendations for{" "}
            <span className="font-medium text-foreground">bisnis</span> atau{" "}
            <span className="font-medium text-foreground">investasi crypto</span>.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload area */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">File laporan (PDF)</Label>

            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center justify-center w-full border border-dashed rounded-xl px-4 py-6 text-center cursor-pointer bg-background hover:bg-muted transition-colors"
            >
              <UploadCloud className="h-7 w-7 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">
                Click here to select file
              </span>
              <span className="text-xs text-muted-foreground">
                Format: PDF • Maksimal beberapa MB (sesuai batas backend)
              </span>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border bg-muted/60 px-3 py-2 text-xs">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 truncate">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-xs"
                  type="button"
                  onClick={() => setFile(null)}
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

          {/* Mode pilihan */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Select Instruments Type
            </Label>
            <RadioGroup
              value={mode ?? undefined}
              onValueChange={(val) => {
                setMode(val);
                setErrorMsg("");
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <label
                htmlFor="business"
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${
                  mode === "business"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/60"
                }`}
              >
                <RadioGroupItem value="business" id="business" />
                <div className="space-y-0.5">
                  <div className="font-medium">Bisnis</div>
                  <p className="text-xs text-muted-foreground">
                    Get business ideas, financial analysis, and business expansion plans that fit your profile.
                  </p>
                </div>
              </label>

              <label
                htmlFor="crypto"
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${
                  mode === "crypto"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/60"
                }`}
              >
                <RadioGroupItem value="crypto" id="crypto" />
                <div className="space-y-0.5">
                  <div className="font-medium">Investasi Crypto</div>
                  <p className="text-xs text-muted-foreground">
                    Focus on portfolio management and risk management strategies for your crypto assets.
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500">{errorMsg}</p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row gap-3 md:justify-between md:items-center">
          <p className="text-[11px] text-muted-foreground">
            Your data is only used to generate recommendations and is not shared with other parties.
          </p>
          <Button
            className="w-full md:w-auto"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Lanjut ke Analisis"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
