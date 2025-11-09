// platform/StepEquipment.jsx
"use client";

import { useState, useEffect } from "react";
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
  ShoppingCart,
  Package,
  ExternalLink,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useBusinessWizard } from "@/context/BusinessWizardContext";

export default function StepEquipment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    userUuid: contextUserUuid,
    selectedCategory,
  } = useBusinessWizard();

  // Get userUuid from context or URL params
  const userUuid = contextUserUuid || searchParams.get("userUuid");
  const category = selectedCategory || searchParams.get("category");

  const [loading, setLoading] = useState(true);
  const [equipmentData, setEquipmentData] = useState(null);
  const [advisorData, setAdvisorData] = useState(null);
  const [cart, setCart] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!userUuid || !category) {
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
            bisnis_kategori: category,
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
  }, [userUuid, category]);

  const toggleCart = (item) => {
    const exists = cart.some((p) => p.id === item.id || p.name === item.name);
    if (exists) {
      setCart(cart.filter((p) => p.id !== item.id && p.name !== item.name));
    } else {
      setCart([...cart, item]);
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams({ userUuid });
    router.push(`/wizard/business?${params}`);
  };

  const handleNext = async () => {
    if (!category) {
      setErrorMsg("Kategori bisnis diperlukan untuk memproses order.");
      return;
    }

    setOrdering(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/business/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userUuid,
          bisnis_kategori: category,
          message: "I want to start a business",
        }),
      });

      const json = await res.json();

      if (json.success) {
        // Save order data to state/context if needed
        setOrderData(json.response_dashboard || json);
        
        // Navigate to result page with order data
        const params = new URLSearchParams({ userUuid });
        if (category) {
          params.set("category", category);
        }
        if (json.response_dashboard?.order_id) {
          params.set("orderId", json.response_dashboard.order_id);
        }
        router.push(`/wizard/result?${params}`);
      } else {
        throw new Error(json.error || "Gagal memproses order.");
      }
    } catch (error) {
      console.error("Error processing order:", error);
      setErrorMsg(error.message || "Terjadi kesalahan saat memproses order.");
    } finally {
      setOrdering(false);
    }
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
                Step 3 dari 5
              </div>
              <CardTitle className="text-xl md:text-2xl">
                Equipment & Strategy
              </CardTitle>
              <CardDescription className="text-sm">
                Strategi bisnis dan peralatan yang direkomendasikan berdasarkan kategori bisnis Anda.
              </CardDescription>
              {category && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Kategori bisnis:{" "}
                  <span className="font-medium text-foreground">
                    {category}
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

          {errorMsg && (
            <Card className="border border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
                    <p className="text-sm text-red-600">{errorMsg}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !errorMsg && (
            <>
              {/* Strategi bisnis */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-700" />
                  Strategi Bisnis
                </h3>

                {advisorData?.recommendations?.length > 0 && (
                  <Card className="border border-gray-300 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2.5">
                        <Lightbulb className="h-4 w-4 text-gray-800" />
                        Rekomendasi Utama
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {advisorData.recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="border-l-2 border-gray-500 pl-4 py-1"
                        >
                          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {advisorData?.strategies?.length > 0 && (
                  <Card className="border border-gray-300 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2.5">
                        <TrendingUp className="h-4 w-4 text-gray-800" />
                        Strategi Operasional
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {advisorData.strategies.map((strategy, idx) => (
                        <div
                          key={idx}
                          className="border-l-2 border-gray-500 pl-4 py-1"
                        >
                          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                            {strategy}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {advisorData?.warnings?.length > 0 && (
                  <Card className="border border-gray-300 bg-gradient-to-r from-gray-50/80 to-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2.5 text-gray-800">
                        <AlertCircle className="h-4 w-4" />
                        Hal yang Perlu Diwaspadai
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {advisorData.warnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className="border-l-2 border-gray-500 pl-4 py-1"
                        >
                          <p className="text-xs md:text-sm text-gray-800 leading-relaxed">
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
            onClick={handleNext}
            disabled={ordering || !category}
          >
            {ordering ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses Order...
              </>
            ) : (
              `Lanjut ke Result${cart.length > 0 ? ` (${cart.length})` : ""}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
