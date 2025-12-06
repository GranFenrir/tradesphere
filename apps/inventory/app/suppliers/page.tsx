import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Plus, Building2, Package, Phone, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      products: {
        include: {
          product: {
            select: { name: true, sku: true },
          },
        },
      },
      purchaseOrders: {
        select: { id: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const supplierStats = suppliers.map((supplier) => ({
    ...supplier,
    productCount: supplier.products.length,
    orderCount: supplier.purchaseOrders.length,
    activeOrders: supplier.purchaseOrders.filter(
      (po) => !["RECEIVED", "CANCELLED"].includes(po.status)
    ).length,
  }));

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.isActive).length;
  const totalProducts = suppliers.reduce((sum, s) => sum + s.products.length, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Suppliers</h1>
          <p className="text-muted-foreground mt-2">
            Manage your supplier relationships and product sourcing.
          </p>
        </div>
        <Link href="/suppliers/new">
          <Button className="shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Suppliers
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSuppliers} active
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products Sourced
            </CardTitle>
            <Package className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all suppliers
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <ExternalLink className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {supplierStats.reduce((sum, s) => sum + s.activeOrders, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supplierStats.map((supplier) => (
          <Link key={supplier.id} href={`/suppliers/${supplier.id}`}>
            <Card className="glass-card border-border hover:border-primary/50 transition-all cursor-pointer group h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                    {supplier.name}
                  </CardTitle>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      supplier.isActive
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {supplier.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {supplier.code}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {supplier.email}
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {supplier.phone}
                    </div>
                  )}
                  {supplier.leadTimeDays && (
                    <div className="text-muted-foreground">
                      Lead time: <span className="text-foreground">{supplier.leadTimeDays} days</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{supplier.productCount}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{supplier.orderCount}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {suppliers.length === 0 && (
          <Card className="glass-card border-dashed border-border col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No suppliers yet. Add your first supplier to get started.
              </p>
              <Link href="/suppliers/new" className="mt-4">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
