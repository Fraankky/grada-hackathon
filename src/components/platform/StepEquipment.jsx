// platform/StepEquipment.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  Loader2,
} from "lucide-react";

import { getBusinessData, orderEquipment } from "@/lib/ai-service";

export default function StepEquipment({
  userUuid,
  selectedCategory,
  onBack,
  onCheckoutSuccess,
}) {
  const router = useRouter();

  const [equipment, setEquipment] = useState(null);
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!userUuid || !selectedCategory) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const result = await getBusinessData({
          userUuid,
          bisnisKategori: selectedCategory,
          debug: false,
        });

        if (result.success) {
          setEquipment(result.equipment);
          setAdvisor(result.advisor);
        } else {
          throw new Error(result.error || "Failed to load business data");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Gagal memuat data peralatan.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userUuid, selectedCategory]);

  const toggleCart = (item) => {
    const exists = cartItems.find((i) => i.id === item.id);
    if (exists) {
      setCartItems(cartItems.filter((i) => i.id !== item.id));
    } else {
      setCartItems([...cartItems, item]);
    }
  };

  const handleCheckout = async () => {
    try {
      if (!cartItems.length) {
        setErrorMsg("Pilih minimal satu peralatan dulu.");
        return;
      }

      setOrdering(true);
      setErrorMsg("");

      const fakePaymentInfo = {
        status: "SUCCESS",
        method: "virtual_account",
        payment_id: `PAY-${Date.now()}`,
      };

      const result = await orderEquipment({
        userUuid,
        items: cartItems,
        paymentInfo: fakePaymentInfo,
        debug: false,
      });

      if (result.success) {
        if (onCheckoutSuccess) {
          onCheckoutSuccess({
            cart: cartItems,
            order: result.order,
            advisor,
          });
        } else {
          router.push("/wizard/result");
        }
      } else {
        throw new Error(result.error || "Order gagal");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Gagal memproses order.");
    } finally {
      setOrdering(false);
    }
  };

  const requiredItems = equipment?.required_items ?? [];
  const optionalItems = equipment?.optional_items ?? [];
  const estimatedCost = equipment?.total_estimated_cost ?? null;

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => acc + (Number(item.price) || 0),
        0
      ),
    [cartItems]
  );

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
            <Button className="w-full" onClick={() => router.push("/")}>
              Kembali ke awal
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white to-muted px-4 py-8 flex items-center justify-center">
      <Card className="w-full max-w-5xl rounded-2xl shadow-lg border border-border/60">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
                Step 3 dari 4
              </div>
              <CardTitle className="text-xl md:text-2xl">
                Peralatan Bisnis yang Direkomendasikan
              </CardTitle>
              <CardDescription className="text-sm">
                Pilih peralatan sesuai kebutuhan dari kategori bisnis yang telah
                kamu pilih. Kamu bisa menambahkan atau menghapus item dari
                keranjang sebelum checkout.
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
              onClick={onBack}
              className="hidden md:inline-flex"
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
                  Memuat daftar peralatan...
                </p>
              </CardContent>
            </Card>
          )}

          {errorMsg && (
            <p className="text-xs text-red-500">{errorMsg}</p>
          )}

          {!loading && (
            <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
              {/* List peralatan */}
              <div className="space-y-6">
                {requiredItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <h2 className="text-sm font-semibold">
                        Peralatan Wajib
                      </h2>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {requiredItems.map((item) => {
                        const selected = !!cartItems.find(
                          (i) => i.id === item.id
                        );
                        return (
                          <div
                            key={item.id}
                            className={`rounded-lg border p-4 transition text-xs md:text-sm ${
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border/60 bg-background"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">
                                    {item.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    Wajib
                                  </Badge>
                                </div>
                                {item.description && (
                                  <p className="text-[11px] text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                )}
                                {item.price && (
                                  <p className="text-[11px] mt-1 font-medium">
                                    Rp {Number(item.price).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant={selected ? "secondary" : "outline"}
                                size="sm"
                                type="button"
                                onClick={() => toggleCart(item)}
                              >
                                {selected ? "Hapus" : "Tambah"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {optionalItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-semibold">
                        Peralatan Opsional
                      </h2>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {optionalItems.map((item) => {
                        const selected = !!cartItems.find(
                          (i) => i.id === item.id
                        );
                        return (
                          <div
                            key={item.id}
                            className={`rounded-lg border p-4 transition text-xs md:text-sm ${
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border/60 bg-background"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h3 className="font-semibold">{item.name}</h3>
                                {item.description && (
                                  <p className="text-[11px] text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                )}
                                {item.price && (
                                  <p className="text-[11px] mt-1 font-medium">
                                    Rp {Number(item.price).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant={selected ? "secondary" : "outline"}
                                size="sm"
                                type="button"
                                onClick={() => toggleCart(item)}
                              >
                                {selected ? "Hapus" : "Tambah"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {requiredItems.length === 0 && optionalItems.length === 0 && (
                  <Card className="border border-border/60 bg-muted/40">
                    <CardContent className="py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Tidak ada data peralatan untuk kategori ini.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Ringkasan keranjang */}
              <div className="space-y-4 rounded-xl border bg-muted/40 px-4 py-4 h-fit">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <h2 className="text-sm font-semibold">Ringkasan Keranjang</h2>
                </div>

                <p className="text-xs text-muted-foreground">
                  {cartItems.length
                    ? `${cartItems.length} item dipilih`
                    : "Belum ada item di keranjang."}
                </p>

                <Separator />

                {cartItems.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto text-[11px] md:text-xs">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{item.name}</span>
                        {item.price && (
                          <span className="font-medium">
                            Rp {Number(item.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Pilih item dari daftar di sebelah kiri.
                  </p>
                )}

                {estimatedCost && (
                  <div className="rounded-lg bg-background border px-3 py-2 text-[11px] md:text-xs space-y-1">
                    <p className="text-muted-foreground">
                      Estimasi modal peralatan dari AI
                    </p>
                    <p className="font-semibold">
                      Rp {Number(estimatedCost).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="rounded-lg bg-background border px-3 py-2 text-[11px] md:text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Keranjang</span>
                    <span className="text-sm font-bold">
                      Rp {cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleCheckout}
                  disabled={ordering || !cartItems.length}
                  type="button"
                >
                  {ordering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Checkout & Lanjut ke Strategi
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row gap-3 md:justify-between md:items-center">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="w-full md:w-auto"
            onClick={onBack}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Kembali
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
