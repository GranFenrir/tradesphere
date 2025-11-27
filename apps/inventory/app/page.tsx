import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Package, AlertTriangle, DollarSign, Search, Filter, Plus } from "lucide-react";
import { prisma } from "@repo/database";
import Link from "next/link";
import { DataTable } from "@repo/ui/data-table";
import { columns } from "./columns";

export default async function Page() {
  const productsData = await prisma.product.findMany();

  const products = productsData.map((p) => {
    let status = "In Stock";
    let statusColor = "text-green-400";

    if (p.currentStock === 0) {
      status = "Out of Stock";
      statusColor = "text-red-400";
    } else if (p.currentStock <= p.reorderPoint) {
      status = "Low Stock";
      statusColor = "text-orange-400";
    } else if (p.currentStock > p.maxStock) {
      status = "Overstocked";
      statusColor = "text-blue-400";
    }

    return {
      id: p.sku, // Using SKU as ID for display
      name: p.name,
      category: p.category,
      stock: p.currentStock,
      price: p.price.toNumber(),
      status,
      statusColor,
    };
  });

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.status === "Low Stock" || p.status === "Out of Stock").length;
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">Track and manage your global stock levels.</p>
        </div>
        <Link href="/products/new">
          <button className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Real-time count</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">Inventory Asset Value</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Products</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={products} />
        </CardContent>
      </Card>
    </div>
  );
}

