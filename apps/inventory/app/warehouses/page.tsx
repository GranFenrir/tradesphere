import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Warehouse, MapPin, Package, Plus, Building2 } from "lucide-react";
import Link from "next/link";

export default async function WarehousesPage() {
  const warehouses = await prisma.warehouse.findMany({
    include: {
      locations: {
        include: {
          stockItems: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const warehouseStats = warehouses.map((wh) => {
    const locationCount = wh.locations.length;
    const totalStock = wh.locations.reduce(
      (sum, loc) => sum + loc.stockItems.reduce((s, item) => s + item.quantity, 0),
      0
    );
    const uniqueProducts = new Set(
      wh.locations.flatMap((loc) => loc.stockItems.map((item) => item.productId))
    ).size;

    return {
      ...wh,
      locationCount,
      totalStock,
      uniqueProducts,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white neon-text">Warehouses</h1>
          <p className="text-muted-foreground mt-2">
            Manage your warehouse facilities and storage locations.
          </p>
        </div>
        <Link href="/warehouses/new">
          <Button className="shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Plus className="w-4 h-4 mr-2" />
            Add Warehouse
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Warehouses
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{warehouses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {warehouses.filter((w) => w.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Locations
            </CardTitle>
            <MapPin className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {warehouseStats.reduce((sum, w) => sum + w.locationCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all warehouses
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock Units
            </CardTitle>
            <Package className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {warehouseStats.reduce((sum, w) => sum + w.totalStock, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Items in storage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouseStats.map((warehouse) => (
          <Link key={warehouse.id} href={`/warehouses/${warehouse.id}`}>
            <Card className="glass-card border-white/10 hover:border-primary/50 transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white group-hover:text-primary transition-colors">
                    {warehouse.name}
                  </CardTitle>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      warehouse.isActive
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {warehouse.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {warehouse.code}
                </p>
              </CardHeader>
              <CardContent>
                {warehouse.address && (
                  <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {warehouse.address}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{warehouse.locationCount}</p>
                    <p className="text-xs text-muted-foreground">Locations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{warehouse.uniqueProducts}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      {warehouse.totalStock.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Units</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {warehouses.length === 0 && (
          <Card className="glass-card border-dashed border-white/20 col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Warehouse className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No warehouses yet. Create your first warehouse to get started.
              </p>
              <Link href="/warehouses/new" className="mt-4">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Warehouse
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
