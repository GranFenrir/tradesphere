import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { 
  MapPin, 
  Package, 
  Plus, 
  ChevronRight, 
  Layers, 
  Grid3X3, 
  Box,
  ArrowLeft,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Type icons based on location type
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

interface LocationFromDB {
  id: string;
  name: string;
  code: string;
  type: string;
  capacity: number | null;
  parentId: string | null;
  stockItems: { quantity: number; productId: string; product: { name: string; sku: string } }[];
}

interface LocationWithChildren extends LocationFromDB {
  children: LocationWithChildren[];
}

function buildLocationTree(
  locations: LocationFromDB[],
  parentId: string | null = null
): LocationWithChildren[] {
  return locations
    .filter((loc) => loc.parentId === parentId)
    .map((loc) => ({
      ...loc,
      children: buildLocationTree(locations, loc.id),
    }));
}

function LocationTreeNode({ location, depth = 0 }: { location: LocationWithChildren; depth?: number }) {
  const Icon = typeIcons[location.type as keyof typeof typeIcons] || Box;
  const colorClass = typeColors[location.type as keyof typeof typeColors] || typeColors.BIN;
  const totalStock = location.stockItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-2">
      <div
        className={`rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className="flex items-center gap-3 p-3">
          <div className={`p-2 rounded-lg border ${colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{location.name}</span>
              <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 bg-muted/50 rounded">
                {location.code}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded border ${colorClass}`}>
                {location.type}
              </span>
            </div>
            {location.stockItems.length > 0 && (
              <div className="mt-1 text-xs text-muted-foreground">
                {totalStock} units • {location.stockItems.length} product(s)
              </div>
            )}
          </div>
          {location.capacity && (
            <div className="text-sm text-muted-foreground">
              Cap: {location.capacity}
            </div>
          )}
          {location.children.length > 0 && (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        
        {/* Stock Items in this location */}
        {location.stockItems.length > 0 && (
          <div className="px-3 pb-3 pt-1 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              {location.stockItems.map((item) => (
                <Link
                  key={item.productId}
                  href={`/products/${item.product.sku}/edit`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-background/50 hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg text-sm transition-colors group"
                >
                  <Package className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                  <span className="text-foreground group-hover:text-primary font-medium">
                    {item.product.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({item.quantity} units)
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      {location.children.length > 0 && (
        <div className="space-y-2">
          {location.children.map((child) => (
            <LocationTreeNode key={child.id} location={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function WarehouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
    include: {
      locations: {
        include: {
          stockItems: {
            include: {
              product: {
                select: { name: true, sku: true },
              },
            },
          },
        },
      },
    },
  });

  if (!warehouse) {
    notFound();
  }

  const locationTree = buildLocationTree(warehouse.locations);
  
  const totalStock = warehouse.locations.reduce(
    (sum, loc) => sum + loc.stockItems.reduce((s, item) => s + item.quantity, 0),
    0
  );
  
  const uniqueProducts = new Set(
    warehouse.locations.flatMap((loc) => loc.stockItems.map((item) => item.productId))
  ).size;

  // Aggregate all stock items for the summary table
  const stockSummary = warehouse.locations
    .flatMap((loc) => 
      loc.stockItems.map((item) => ({
        ...item,
        locationName: loc.name,
        locationCode: loc.code,
        locationType: loc.type,
      }))
    )
    .reduce((acc, item) => {
      const existing = acc.find((a) => a.productId === item.productId);
      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.locations.push({
          name: item.locationName,
          code: item.locationCode,
          type: item.locationType,
          quantity: item.quantity,
        });
      } else {
        acc.push({
          productId: item.productId,
          productName: item.product.name,
          productSku: item.product.sku,
          totalQuantity: item.quantity,
          locations: [{
            name: item.locationName,
            code: item.locationCode,
            type: item.locationType,
            quantity: item.quantity,
          }],
        });
      }
      return acc;
    }, [] as { productId: string; productName: string; productSku: string; totalQuantity: number; locations: { name: string; code: string; type: string; quantity: number }[] }[])
    .sort((a, b) => b.totalQuantity - a.totalQuantity);

  const zoneCount = warehouse.locations.filter((l) => l.type === "ZONE").length;
  const binCount = warehouse.locations.filter((l) => l.type === "BIN").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/warehouses"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Warehouses
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground neon-text">{warehouse.name}</h1>
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
          <p className="text-muted-foreground mt-1 font-mono">{warehouse.code}</p>
          {warehouse.address && (
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {warehouse.address}
            </p>
          )}
        </div>
        <Link href={`/locations/new?warehouseId=${warehouse.id}`}>
          <Button className="shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Layers className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{zoneCount}</p>
                <p className="text-xs text-muted-foreground">Zones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{binCount}</p>
                <p className="text-xs text-muted-foreground">Bins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Box className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{uniqueProducts}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Grid3X3 className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalStock.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Units</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {warehouse.description && (
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-sm">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{warehouse.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Location Tree */}
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Location Structure</CardTitle>
        </CardHeader>
        <CardContent>
          {locationTree.length > 0 ? (
            <div className="space-y-2">
              {locationTree.map((location) => (
                <LocationTreeNode key={location.id} location={location} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No locations yet. Add zones, racks, shelves, and bins to organize this warehouse.
              </p>
              <Link href={`/locations/new?warehouseId=${warehouse.id}`} className="mt-4 inline-block">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Location
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Inventory Summary */}
      {stockSummary.length > 0 && (
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Stock Inventory</CardTitle>
            <p className="text-sm text-muted-foreground">
              All products stored in this warehouse
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SKU</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Qty</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Locations</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stockSummary.map((item) => (
                    <tr key={item.productId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{item.productName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-muted-foreground">{item.productSku}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-foreground">{item.totalQuantity.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.locations.map((loc, idx) => {
                            const locColor = typeColors[loc.type as keyof typeof typeColors] || typeColors.BIN;
                            return (
                              <span
                                key={idx}
                                className={`text-xs px-2 py-0.5 rounded border ${locColor}`}
                                title={`${loc.name}: ${loc.quantity} units`}
                              >
                                {loc.code} ({loc.quantity})
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/products/${item.productSku}/edit`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          View Product
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
