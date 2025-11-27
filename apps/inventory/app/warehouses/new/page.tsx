"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { createWarehouse } from "../../actions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function NewWarehousePage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createWarehouse(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white neon-text">Add New Warehouse</h1>
        <p className="text-muted-foreground mt-2">
          Create a new warehouse facility for inventory storage.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">Warehouse Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Warehouse Name
                </label>
                <input
                  name="name"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Main Distribution Center"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Warehouse Code
                </label>
                <input
                  name="code"
                  required
                  pattern="[A-Z0-9\-]+"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. WH-001"
                />
                <p className="text-xs text-muted-foreground">
                  Uppercase letters, numbers, and hyphens only
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Address
              </label>
              <input
                name="address"
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 123 Industrial Blvd, Neo Tokyo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Optional description of the warehouse..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/warehouses")}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Warehouse"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
