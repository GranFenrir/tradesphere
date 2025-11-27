import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ArrowRightLeft, 
  History,
  Building2,
  MapPin
} from "lucide-react";
import Link from "next/link";

export default async function StockPage() {
  // Get all stock items with product and location details
  const stockItems = await prisma.stockItem.findMany({
    include: {
      product: true,
      location: {
        include: {
          warehouse: true,
        },
      },
    },
    orderBy: [
      { location: { warehouse: { name: "asc" } } },
      { product: { name: "asc" } },
    ],
  });

  // Calculate totals
  const totalUnits = stockItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = new Set(stockItems.map((item) => item.productId)).size;
  const uniqueLocations = new Set(stockItems.map((item) => item.locationId)).size;

  // Get status for a product based on its total stock
  const getProductStatus = (product: typeof stockItems[0]["product"]) => {
    if (product.currentStock === 0) {
      return { status: "Out of Stock", color: "text-red-400 bg-red-500/10 border-red-500/30" };
    } else if (product.currentStock <= product.reorderPoint) {
      return { status: "Low Stock", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" };
    } else if (product.currentStock > product.maxStock) {
      return { status: "Overstocked", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
    }
    return { status: "In Stock", color: "text-green-400 bg-green-500/10 border-green-500/30" };
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white neon-text">Stock Overview</h1>
          <p className="text-muted-foreground mt-2">
            View and manage stock levels across all locations.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/stock/in">
            <Button variant="outline" className="border-green-500/30 hover:bg-green-500/10">
              <ArrowDownCircle className="w-4 h-4 mr-2 text-green-400" />
              Stock In
            </Button>
          </Link>
          <Link href="/stock/out">
            <Button variant="outline" className="border-red-500/30 hover:bg-red-500/10">
              <ArrowUpCircle className="w-4 h-4 mr-2 text-red-400" />
              Stock Out
            </Button>
          </Link>
          <Link href="/stock/transfer">
            <Button variant="outline" className="border-blue-500/30 hover:bg-blue-500/10">
              <ArrowRightLeft className="w-4 h-4 mr-2 text-blue-400" />
              Transfer
            </Button>
          </Link>
          <Link href="/stock/movements">
            <Button variant="ghost">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock Units
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalUnits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products in Stock
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{uniqueProducts}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Locations
            </CardTitle>
            <MapPin className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{uniqueLocations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Stock by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Warehouse</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map((item) => {
                  const { status, color } = getProductStatus(item.product);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-white">{item.product.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-muted-foreground">
                          {item.product.sku}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {item.location.warehouse.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-sm text-white">{item.location.name}</span>
                          <span className="text-xs font-mono text-muted-foreground ml-2">
                            {item.location.code}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-white">{item.quantity}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs border ${color}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {stockItems.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No stock items yet. Use Stock In to add inventory.
                </p>
                <Link href="/stock/in" className="mt-4 inline-block">
                  <Button>
                    <ArrowDownCircle className="w-4 h-4 mr-2" />
                    Stock In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
