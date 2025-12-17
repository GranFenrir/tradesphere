import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { MapPin, Plus, Layers, Grid3X3, Box, Package, Building2 } from "lucide-react";
import Link from "next/link";

const typeIcons = {
  ZONE: Layers,
  RACK: Grid3X3,
  SHELF: Box,
  BIN: Package,
};

const typeColors = {
  ZONE: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  RACK: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  SHELF: "text-green-400 bg-green-500/10 border-green-500/30",
  BIN: "text-orange-400 bg-orange-500/10 border-orange-500/30",
};

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
    include: {
      warehouse: true,
      parent: true,
      stockItems: {
        include: {
          product: {
            select: { name: true, sku: true },
          },
        },
      },
      _count: {
        select: { children: true },
      },
    },
    orderBy: [
      { warehouse: { name: "asc" } },
      { code: "asc" },
    ],
  });

  // Group by warehouse
  const locationsByWarehouse = locations.reduce((acc, loc) => {
    const whId = loc.warehouseId;
    if (!acc[whId]) {
      acc[whId] = {
        warehouse: loc.warehouse,
        locations: [],
      };
    }
    acc[whId].locations.push(loc);
    return acc;
  }, {} as Record<string, { warehouse: typeof locations[0]["warehouse"]; locations: typeof locations }>);

  const typeCounts = {
    ZONE: locations.filter((l) => l.type === "ZONE").length,
    RACK: locations.filter((l) => l.type === "RACK").length,
    SHELF: locations.filter((l) => l.type === "SHELF").length,
    BIN: locations.filter((l) => l.type === "BIN").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Konumlar</h1>
          <p className="text-muted-foreground mt-2">
            Tüm depolardaki depolama konumlarını yönetin.
          </p>
        </div>
        <Link href="/locations/new">
          <Button className="shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Plus className="w-4 h-4 mr-2" />
            Konum Ekle
          </Button>
        </Link>
      </div>

      {/* Type Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(typeCounts) as [keyof typeof typeColors, number][]).map(([type, count]) => {
          const Icon = typeIcons[type];
          const colorClass = typeColors[type];
          const typeLabels: Record<string, string> = {
            ZONE: "Bölge",
            RACK: "Raf",
            SHELF: "Raf Katı",
            BIN: "Kutu",
          };
          return (
            <Card key={type} className="glass-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{typeLabels[type]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Locations by Warehouse */}
      {Object.values(locationsByWarehouse).map(({ warehouse, locations: whLocations }) => (
        <Card key={warehouse.id} className="glass-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle className="text-foreground">{warehouse.name}</CardTitle>
                <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                  {warehouse.code}
                </span>
              </div>
              <Link href={`/warehouses/${warehouse.id}`}>
                <Button variant="ghost" size="sm">
                  Depoyu Görüntüle
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {whLocations.map((location) => {
                const Icon = typeIcons[location.type as keyof typeof typeIcons] || Box;
                const colorClass = typeColors[location.type as keyof typeof typeColors] || typeColors.BIN;
                const totalStock = location.stockItems.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <div
                    key={location.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className={`p-2 rounded-lg border ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{location.name}</span>
                        <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 bg-muted/50 rounded">
                          {location.code}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${colorClass}`}>
                          {location.type}
                        </span>
                      </div>
                      {location.parent && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Üst Konum: {location.parent.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {totalStock > 0 ? `${totalStock} adet` : "Boş"}
                      </p>
                      {location._count.children > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {location._count.children} alt konum
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {locations.length === 0 && (
        <Card className="glass-card border-dashed border-white/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Henüz konum yok. Önce depo oluşturun, sonra konum ekleyin.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="/warehouses/new">
                <Button variant="outline">
                  <Building2 className="w-4 h-4 mr-2" />
                  Depo Ekle
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
