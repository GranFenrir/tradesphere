"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { createLocation } from "../../actions";
import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface Location {
  id: string;
  name: string;
  code: string;
  type: string;
  warehouseId: string;
}

function NewLocationForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ZONE");
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetWarehouseId = searchParams.get("warehouseId");

  // Fetch warehouses
  useEffect(() => {
    fetch("/inventory/api/warehouses")
      .then((res) => res.json())
      .then((data) => {
        setWarehouses(data);
        if (presetWarehouseId) {
          setSelectedWarehouse(presetWarehouseId);
        }
      });
  }, [presetWarehouseId]);

  // Fetch locations when warehouse changes
  useEffect(() => {
    if (selectedWarehouse) {
      fetch(`/inventory/api/locations?warehouseId=${selectedWarehouse}`)
        .then((res) => res.json())
        .then((data) => setLocations(data));
    } else {
      setLocations([]);
    }
  }, [selectedWarehouse]);

  // Filter parent options based on type hierarchy
  const getValidParentTypes = (type: string): string[] => {
    switch (type) {
      case "ZONE":
        return []; // Zones have no parent (top level)
      case "RACK":
        return ["ZONE"]; // Racks go in zones
      case "SHELF":
        return ["RACK"]; // Shelves go in racks
      case "BIN":
        return ["SHELF"]; // Bins go on shelves
      default:
        return [];
    }
  };

  const validParentTypes = getValidParentTypes(selectedType);
  const filteredParentLocations = locations.filter((loc) =>
    validParentTypes.includes(loc.type)
  );

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createLocation(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white neon-text">Add New Location</h1>
        <p className="text-muted-foreground mt-2">
          Create a storage location within a warehouse.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">Location Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Warehouse
              </label>
              <select
                name="warehouseId"
                required
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a warehouse...</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Location Type
                </label>
                <select
                  name="type"
                  required
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ZONE">Zone</option>
                  <option value="RACK">Rack</option>
                  <option value="SHELF">Shelf</option>
                  <option value="BIN">Bin</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Hierarchy: Zone → Rack → Shelf → Bin
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Parent Location
                </label>
                <select
                  name="parentId"
                  disabled={selectedType === "ZONE" || !selectedWarehouse}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">
                    {selectedType === "ZONE" ? "N/A (Top Level)" : "Select parent..."}
                  </option>
                  {filteredParentLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Location Name
                </label>
                <input
                  name="name"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={`e.g. ${selectedType === "ZONE" ? "Zone A" : selectedType === "RACK" ? "Rack 1" : selectedType === "SHELF" ? "Shelf 3" : "Bin A1"}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Location Code
                </label>
                <input
                  name="code"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. WH001-A-R1-S3"
                />
                <p className="text-xs text-muted-foreground">
                  Unique code within the warehouse
                </p>
              </div>
            </div>

            {selectedType === "BIN" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Capacity (optional)
                </label>
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Maximum units this bin can hold"
                />
              </div>
            )}

            <div className="pt-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/locations")}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !selectedWarehouse}>
                {isPending ? "Creating..." : "Create Location"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewLocationPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <NewLocationForm />
    </Suspense>
  );
}
