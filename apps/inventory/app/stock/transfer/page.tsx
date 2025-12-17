"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { createMovement } from "../../actions";
import { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface LocationWithStock {
  id: string;
  name: string;
  code: string;
  type: string;
  warehouse: { name: string; code: string };
  stockItems: { productId: string; quantity: number }[];
}

function StockTransferForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<LocationWithStock[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedFromLocation, setSelectedFromLocation] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetch("/inventory/api/products")
      .then((res) => res.json())
      .then(setProducts);

    fetch("/inventory/api/locations/with-stock")
      .then((res) => res.json())
      .then(setLocations);
  }, []);

  // Filter source locations that have the selected product
  const sourceLocations = selectedProduct
    ? locations.filter((loc) =>
        loc.stockItems.some((si) => si.productId === selectedProduct && si.quantity > 0)
      )
    : [];

  // All bin locations except the source
  const destinationLocations = locations.filter(
    (loc) => loc.type === "BIN" && loc.id !== selectedFromLocation
  );

  const getStockAtLocation = (locationId: string) => {
    const loc = locations.find((l) => l.id === locationId);
    const stockItem = loc?.stockItems.find((si) => si.productId === selectedProduct);
    return stockItem?.quantity || 0;
  };

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("type", "TRANSFER");

    startTransition(async () => {
      const result = await createMovement(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <ArrowRightLeft className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Stok Transferi</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Depo konumları arasında envanter taşıyın.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-foreground">Stok Transferi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Ürün
              </label>
              <select
                name="productId"
                required
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  setSelectedFromLocation("");
                }}
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Ürün seçin...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Kaynak Konum
                </label>
                <select
                  name="fromLocationId"
                  required
                  disabled={!selectedProduct}
                  value={selectedFromLocation}
                  onChange={(e) => setSelectedFromLocation(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    {selectedProduct ? "Kaynak seçin..." : "Önce ürün seçin..."}
                  </option>
                  {sourceLocations.map((loc) => {
                    const stock = getStockAtLocation(loc.id);
                    return (
                      <option key={loc.id} value={loc.id}>
                        {loc.warehouse.name} → {loc.name} ({stock})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Hedef Konum
                </label>
                <select
                  name="toLocationId"
                  required
                  disabled={!selectedFromLocation}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    {selectedFromLocation ? "Hedef seçin..." : "Önce kaynak seçin..."}
                  </option>
                  {destinationLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.warehouse.name} → {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedFromLocation && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400">
                  Kaynakta mevcut: <strong>{getStockAtLocation(selectedFromLocation)} adet</strong>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Miktar
                </label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  max={selectedFromLocation ? getStockAtLocation(selectedFromLocation) : undefined}
                  required
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Miktar girin"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Referans (isteğe bağlı)
                </label>
                <input
                  name="reference"
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="örn. TRF-2025-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Notlar (isteğe bağlı)
              </label>
              <textarea
                name="notes"
                rows={2}
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="örn. Konumlar arası stok dengeleme"
              />
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/stock")}
                disabled={isPending}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isPending || !selectedFromLocation}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? "İşleniyor..." : "Transfer Et"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StockTransferPage() {
  return (
    <Suspense fallback={<div className="text-foreground">Yükleniyor...</div>}>
      <StockTransferForm />
    </Suspense>
  );
}
