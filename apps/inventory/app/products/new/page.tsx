"use client"

import { createProduct } from "../../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProduct(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white neon-text">Add New Product</h1>
        <p className="text-muted-foreground mt-2">Enter product details to track inventory.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                <input
                  name="name"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Quantum Processor"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">SKU</label>
                <input
                  name="sku"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. PROD-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <select
                name="category"
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Electronics">Electronics</option>
                <option value="Cybernetics">Cybernetics</option>
                <option value="Energy">Energy</option>
                <option value="Optics">Optics</option>
                <option value="Materials">Materials</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Selling Price ($)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Cost Price ($)</label>
                <input
                  name="cost"
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Initial Stock</label>
                <input
                  name="currentStock"
                  type="number"
                  required
                  defaultValue="0"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-400">Safety Stock (Min)</label>
                <input
                  name="reorderPoint"
                  type="number"
                  required
                  defaultValue="10"
                  className="w-full bg-black/20 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-400">Liquidity Cap (Max)</label>
                <input
                  name="maxStock"
                  type="number"
                  required
                  defaultValue="100"
                  className="w-full bg-black/20 border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={() => router.push("/")}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
