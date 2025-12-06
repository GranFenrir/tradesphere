import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { ArrowLeft, Package, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { addSupplierProduct, removeSupplierProduct } from "../../actions";

export default async function SupplierProductsPage({
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
    },
  });

  if (!supplier) {
    notFound();
  }

  // Get products not yet linked to this supplier
  const linkedProductIds = supplier.products.map((sp) => sp.productId);
  const availableProducts = await prisma.product.findMany({
    where: {
      id: { notIn: linkedProductIds },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/suppliers/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">
            Manage Products
          </h1>
          <p className="text-muted-foreground mt-2">
            Products supplied by {supplier.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Product Form */}
        <Card className="glass-card h-fit">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Product to Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableProducts.length > 0 ? (
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const productId = formData.get("productId") as string;
                  await addSupplierProduct(id, productId, formData);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="productId" className="text-sm font-medium text-foreground">
                    Select Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="productId"
                    name="productId"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Choose a product...</option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="supplierSku" className="text-sm font-medium text-foreground">
                    Supplier SKU
                  </label>
                  <input
                    type="text"
                    id="supplierSku"
                    name="supplierSku"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                    placeholder="Supplier's product code"
                  />
                  <p className="text-xs text-muted-foreground">
                    The SKU used by the supplier (if different from yours)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="cost" className="text-sm font-medium text-foreground">
                      Unit Cost <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="cost"
                      name="cost"
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="minOrderQty" className="text-sm font-medium text-foreground">
                      Min Order Qty
                    </label>
                    <input
                      type="number"
                      id="minOrderQty"
                      name="minOrderQty"
                      min="1"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="leadTimeDays" className="text-sm font-medium text-foreground">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    id="leadTimeDays"
                    name="leadTimeDays"
                    min="0"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={supplier.leadTimeDays?.toString() || "7"}
                  />
                  <p className="text-xs text-muted-foreground">
                    Override supplier default lead time for this product
                  </p>
                </div>

                <Button type="submit" className="w-full shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  All products have been linked to this supplier.
                </p>
                <Link href="/products/new" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">
                    Create New Product
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Products List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Linked Products ({supplier.products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supplier.products.length > 0 ? (
              <div className="space-y-3">
                {supplier.products.map((sp) => (
                  <div
                    key={sp.productId}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-border"
                  >
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{sp.product.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="font-mono">{sp.supplierSku || sp.product.sku}</span>
                        <span>•</span>
                        <span>${Number(sp.unitCost).toFixed(2)}</span>
                        {sp.minOrderQty && (
                          <>
                            <span>•</span>
                            <span>Min: {sp.minOrderQty}</span>
                          </>
                        )}
                        {sp.leadTimeDays && (
                          <>
                            <span>•</span>
                            <span>{sp.leadTimeDays} days</span>
                          </>
                        )}
                      </div>
                    </div>
                    <form
                      action={async () => {
                        "use server";
                        await removeSupplierProduct(id, sp.productId);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No products linked to this supplier yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
