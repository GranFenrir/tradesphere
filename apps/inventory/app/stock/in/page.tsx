"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { createMovement } from "../../actions";
import { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface Location {
  id: string;
  name: string;
  code: string;
  type: string;
  warehouseId: string;
  warehouse: { name: string; code: string };
}

function StockInForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch products
    fetch("/inventory/api/products")
      .then((res) => res.json())
      .then(setProducts);

    // Fetch all locations (bins only for receiving)
    fetch("/inventory/api/locations/bins")
      .then((res) => res.json())
      .then(setLocations);
  }, []);

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("type", "IN");
    
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
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30">
            <ArrowDownCircle className="w-6 h-6 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Stock In</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Receive inventory into a warehouse location.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <Card className="glass-card border-green-500/20">
        <CardHeader>
          <CardTitle className="text-foreground">Receive Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Product
              </label>
              <select
                name="productId"
                required
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Destination Location
              </label>
              <select
                name="toLocationId"
                required
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select a location...</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.warehouse.name} → {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Quantity
                </label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Reference (optional)
                </label>
                <input
                  name="reference"
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g. PO-2025-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                placeholder="Additional notes..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/stock")}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPending ? "Processing..." : "Receive Stock"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StockInPage() {
  return (
    <Suspense fallback={<div className="text-foreground">Loading...</div>}>
      <StockInForm />
    </Suspense>
  );
}
