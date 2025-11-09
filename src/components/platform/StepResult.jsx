// platform/StepResult.jsx
"use client";

import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  ClipboardList,
  ArrowLeft,
  Home,
} from "lucide-react";

import { getBusinessPlanning } from "@/lib/ai-service";
import { useBusinessWizard } from "@/context/BusinessWizardContext";

export default function StepResult() {
  const router = useRouter();
  const { userUuid, selectedCategory, cartItems } = useBusinessWizard();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");


  useEffect(() => {
    if (!userUuid) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const planning = await getBusinessPlanning({
          userUuid,
          debug: false,
        });

        setPlan(planning);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Gagal memuat rencana bisnis.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userUuid]);

  const handleBack = () => {
    const params = new URLSearchParams({ userUuid });
    router.push(`/wizard/equipment?${params}`);
  };

  const handleFinish = () => {
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
            <Button className="w-full" onClick={handleFinish}>
              Kembali ke awal
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const actionSteps = plan?.action_steps ?? [];
  const timeline = plan?.timeline ?? [];
  const risks = plan?.risks ?? [];

  return (
    <div className="min-h-screen bg-white to-muted px-4 py-8 flex items-center justify-center">
      <Card className="w-full max-w-5xl rounded-2xl shadow-lg border border-border/60">
        <CardHeader className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
            Step 4 dari 4
          </div>
          <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Strategi & Rencana Bisnis Akhir
          </CardTitle>
          <CardDescription className="text-sm">
            Berikut rangkuman akhir dari strategi bisnis yang dihasilkan AI
            berdasarkan laporan keuangan, kategori bisnis, dan peralatan yang
            kamu pilih.
          </CardDescription>
          

          {selectedCategory && (
            <p className="mt-1 text-xs text-muted-foreground">
              Fokus bisnis:{" "}
              <span className="font-medium text-foreground">
                {selectedCategory}
              </span>
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {loading && (
            <p className="text-xs text-muted-foreground">
              Menyiapkan rencana bisnis...
            </p>
          )}

          {errorMsg && (
            <p className="text-xs text-red-500">{errorMsg}</p>
          )}

          {!loading && (
            <>
              {/* Ringkasan strategi */}
              {plan?.strategy_summary && (
                <div className="rounded-xl border bg-muted/60 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ClipboardList className="h-4 w-4" />
                    Ringkasan Strategi
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line">
                    {plan.strategy_summary}
                  </p>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-[1.6fr,1.4fr]">
                {/* Langkah aksi & timeline */}
                <div className="space-y-4">
                  {actionSteps.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-semibold">
                        Langkah Implementasi
                      </h2>
                      <ol className="text-xs md:text-sm list-decimal ml-5 space-y-1.5">
                        {actionSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {timeline.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-semibold">
                        Timeline Eksekusi
                      </h2>
                      <ul className="text-xs md:text-sm list-disc ml-5 space-y-1.5">
                        {timeline.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Risiko, catatan, dan ringkasan belanja */}
                <div className="space-y-4 rounded-xl border bg-muted/60 px-4 py-4">
                  <h2 className="text-sm font-semibold">
                    Risiko & Hal yang Perlu Dijaga
                  </h2>
                  {risks.length ? (
                    <ul className="text-[11px] md:text-xs list-disc ml-5 space-y-1.5 text-muted-foreground">
                      {risks.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Tidak ada risiko spesifik yang teridentifikasi, tetapi
                      tetap lakukan evaluasi berkala pada arus kas dan permintaan
                      pasar.
                    </p>
                  )}

                  <Separator className="my-3" />

                  <div className="space-y-2 text-[11px] md:text-xs">
                    <h3 className="font-semibold">
                      Ringkasan Peralatan yang Dibeli
                    </h3>
                    {cartItems.length ? (
                      <ul className="list-disc ml-5 space-y-1">
                        {cartItems.map((item) => (
                          <li key={item.id}>
                            {item.name}
                            {item.price && (
                              <span className="font-medium"> — {item.price}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        Tidak ada data peralatan yang tersimpan di keranjang.
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
            size="sm"
            className="w-full md:w-auto flex items-center justify-center gap-2"
            type="button"
            onClick={handleFinish}
          >
            <Home className="h-4 w-4" />
            Selesai & Kembali ke Awal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
