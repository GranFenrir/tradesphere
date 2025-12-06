import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Package,
  FileText,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { deleteSupplier } from "../actions";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: true,
        },
      },
      purchaseOrders: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!supplier) {
    notFound();
  }

  const totalOrders = supplier.purchaseOrders.length;
  const activeOrders = supplier.purchaseOrders.filter(
    (po) => !["RECEIVED", "CANCELLED"].includes(po.status)
  ).length;

  const deleteSupplierWithId = deleteSupplier.bind(null, id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/suppliers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground neon-text">
                {supplier.name}
              </h1>
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
            <p className="text-muted-foreground mt-1 font-mono">{supplier.code}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/suppliers/${id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <form action={deleteSupplierWithId}>
            <Button
              type="submit"
              variant="outline"
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supplier.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${supplier.email}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {supplier.email}
                    </a>
                  </div>
                </div>
              )}

              {supplier.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${supplier.phone}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {supplier.phone}
                    </a>
                  </div>
                </div>
              )}

              {supplier.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-foreground whitespace-pre-wrap">{supplier.address}</p>
                  </div>
                </div>
              )}

              {!supplier.email && !supplier.phone && !supplier.address && (
                <p className="text-muted-foreground md:col-span-2">
                  No contact information provided.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Business Terms */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Business Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Lead Time</p>
                  <p className="text-foreground">
                    {supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Terms</p>
                  <p className="text-foreground">{supplier.paymentTerms || "Not specified"}</p>
                </div>
              </div>

              {supplier.notes && (
                <div className="md:col-span-2 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-foreground whitespace-pre-wrap">{supplier.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Products from this Supplier
              </CardTitle>
              <Link href={`/suppliers/${id}/products`}>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {supplier.products.length > 0 ? (
                <div className="space-y-3">
                  {supplier.products.map((sp) => (
                    <div
                      key={sp.productId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border"
                    >
                      <div>
                        <p className="text-foreground font-medium">{sp.product.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {sp.supplierSku || sp.product.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-medium">
                          ${Number(sp.unitCost).toFixed(2)}
                        </p>
                        {sp.leadTimeDays && (
                          <p className="text-sm text-muted-foreground">
                            {sp.leadTimeDays} days
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No products linked to this supplier yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Supplier Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products</span>
                <span className="text-foreground font-medium">{supplier.products.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="text-foreground font-medium">{totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Orders</span>
                <span className="text-foreground font-medium">{activeOrders}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Recent Orders</CardTitle>
              <Link href={`/purchase-orders?supplier=${id}`}>
                <Button size="sm" variant="ghost" className="text-xs">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {supplier.purchaseOrders.length > 0 ? (
                <div className="space-y-3">
                  {supplier.purchaseOrders.slice(0, 5).map((po) => (
                    <Link
                      key={po.id}
                      href={`/purchase-orders/${po.id}`}
                      className="block p-2 rounded-lg hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-foreground font-mono text-sm">
                          {po.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            po.status === "RECEIVED"
                              ? "bg-green-500/20 text-green-400"
                              : po.status === "CANCELLED"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {po.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No orders yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/purchase-orders/new?supplier=${id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Purchase Order
                </Button>
              </Link>
              <Link href={`/suppliers/${id}/products`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Manage Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
