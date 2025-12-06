import { prisma, POStatus } from "@repo/database";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import {
  ArrowLeft,
  ClipboardList,
  Package,
  Plus,
  Trash2,
  CheckCircle,
  Send,
  XCircle,
  Truck,
  Building2,
} from "lucide-react";
import Link from "next/link";
import {
  updatePurchaseOrderStatus,
  addPurchaseOrderItem,
  removePurchaseOrderItem,
  deletePurchaseOrder,
  receivePurchaseOrder,
} from "../actions";

const statusConfig: Record<string, { label: string; color: string; nextStatus?: string; nextAction?: string }> = {
  [POStatus.DRAFT]: { label: "Draft", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", nextStatus: POStatus.SENT, nextAction: "Send to Supplier" },
  [POStatus.SENT]: { label: "Sent", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", nextStatus: POStatus.CONFIRMED, nextAction: "Mark as Confirmed" },
  [POStatus.CONFIRMED]: { label: "Confirmed", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", nextStatus: POStatus.RECEIVED, nextAction: "Receive Order" },
  [POStatus.PARTIAL]: { label: "Partially Received", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", nextStatus: POStatus.RECEIVED, nextAction: "Complete Receipt" },
  [POStatus.RECEIVED]: { label: "Received", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  [POStatus.CANCELLED]: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!purchaseOrder) {
    notFound();
  }

  // Get products for adding to order
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // Get supplier-specific pricing
  const supplierProducts = await prisma.supplierProduct.findMany({
    where: { supplierId: purchaseOrder.supplierId },
  });

  const supplierPricing = new Map(
    supplierProducts.map((sp) => [sp.productId, sp.unitCost])
  );

  // Get warehouses for receiving
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const config = statusConfig[purchaseOrder.status] ?? statusConfig[POStatus.DRAFT]!;
  const isDraft = purchaseOrder.status === POStatus.DRAFT;
  const canReceive = purchaseOrder.status === POStatus.CONFIRMED || purchaseOrder.status === POStatus.PARTIAL;

  const totalItems = purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0);
  const receivedItems = purchaseOrder.items.reduce((sum, item) => sum + item.receivedQty, 0);

  const updateStatusWithId = updatePurchaseOrderStatus.bind(null, id);
  const deleteOrderWithId = deletePurchaseOrder.bind(null, id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/purchase-orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground neon-text">
                {purchaseOrder.orderNumber}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm border ${config.color}`}>
                {config.label}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              Order for {purchaseOrder.supplier.name}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {config.nextStatus && config.nextAction && !canReceive && (
            <form action={async () => {
              "use server";
              await updateStatusWithId(config.nextStatus!);
            }}>
              <Button type="submit" className="shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Send className="w-4 h-4 mr-2" />
                {config.nextAction}
              </Button>
            </form>
          )}

          {isDraft && (
            <form action={deleteOrderWithId}>
              <Button
                type="submit"
                variant="outline"
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </form>
          )}

          {purchaseOrder.status !== POStatus.CANCELLED && purchaseOrder.status !== POStatus.RECEIVED && (
            <form action={async () => {
              "use server";
              await updateStatusWithId(POStatus.CANCELLED);
            }}>
              <Button
                type="submit"
                variant="outline"
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order Items ({purchaseOrder.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseOrder.items.length > 0 ? (
                <div className="space-y-3">
                  {purchaseOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-border"
                    >
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {item.product.sku}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-foreground">
                            {item.receivedQty}/{item.quantity} units
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @ ${Number(item.unitCost).toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="text-foreground font-medium">
                            ${(item.quantity * Number(item.unitCost)).toFixed(2)}
                          </p>
                        </div>
                        {isDraft && (
                          <form
                            action={async () => {
                              "use server";
                              await removePurchaseOrderItem(item.id, id);
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
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-4 border-t border-border">
                    <div className="text-right">
                      <p className="text-muted-foreground">Order Total</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${Number(purchaseOrder.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No items added yet. Add products below.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Item Form (only for draft orders) */}
          {isDraft && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await addPurchaseOrderItem(id, formData);
                  }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="productId" className="text-sm font-medium text-foreground">
                      Product
                    </label>
                    <select
                      id="productId"
                      name="productId"
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select product...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="quantity" className="text-sm font-medium text-foreground">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="unitCost" className="text-sm font-medium text-foreground">
                      Unit Cost
                    </label>
                    <input
                      type="number"
                      id="unitCost"
                      name="unitCost"
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="md:col-span-4 flex justify-end">
                    <Button type="submit">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Order
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Receive Order Form */}
          {canReceive && warehouses.length > 0 && (
            <Card className="glass-card border-green-500/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Receive Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const warehouseId = formData.get("warehouseId") as string;
                    await receivePurchaseOrder(id, warehouseId);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="warehouseId" className="text-sm font-medium text-foreground">
                      Receive into Warehouse
                    </label>
                    <select
                      id="warehouseId"
                      name="warehouseId"
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select warehouse...</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Items will be received into the first location in the selected warehouse.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Receive All Items
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Supplier Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Supplier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Link
                  href={`/suppliers/${purchaseOrder.supplier.id}`}
                  className="text-foreground font-medium hover:text-primary transition-colors"
                >
                  {purchaseOrder.supplier.name}
                </Link>
                <p className="text-sm text-muted-foreground font-mono">
                  {purchaseOrder.supplier.code}
                </p>
              </div>
              {purchaseOrder.supplier.email && (
                <p className="text-sm text-muted-foreground">{purchaseOrder.supplier.email}</p>
              )}
              {purchaseOrder.supplier.phone && (
                <p className="text-sm text-muted-foreground">{purchaseOrder.supplier.phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span className="text-foreground font-medium">
                  {receivedItems}/{totalItems} received
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-foreground font-medium">
                  ${Number(purchaseOrder.total).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {new Date(purchaseOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
              {purchaseOrder.expectedDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected</span>
                  <span className="text-foreground">
                    {new Date(purchaseOrder.expectedDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {purchaseOrder.receivedDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Received</span>
                  <span className="text-green-400">
                    {new Date(purchaseOrder.receivedDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {purchaseOrder.notes && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-sm whitespace-pre-wrap">
                  {purchaseOrder.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {Object.entries(statusConfig)
                  .filter(([key]) => key !== POStatus.CANCELLED)
                  .map(([status, cfg], index, arr) => {
                    const completedStatuses = [POStatus.SENT, POStatus.CONFIRMED, POStatus.PARTIAL, POStatus.RECEIVED] as string[];
                    const laterStatuses = [POStatus.CONFIRMED, POStatus.PARTIAL, POStatus.RECEIVED] as string[];
                    
                    const isCompleted = 
                      status === POStatus.DRAFT ||
                      (status === POStatus.SENT && completedStatuses.includes(purchaseOrder.status)) ||
                      (status === POStatus.CONFIRMED && laterStatuses.includes(purchaseOrder.status)) ||
                      (status === POStatus.RECEIVED && purchaseOrder.status === POStatus.RECEIVED);
                    
                    const isCurrent = purchaseOrder.status === status;

                    return (
                      <div key={status} className="flex items-center mb-4 last:mb-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            isCompleted
                              ? "bg-primary border-primary"
                              : isCurrent
                                ? "border-primary bg-primary/20"
                                : "border-border bg-background"
                          }`}
                        >
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${isCurrent ? "text-primary" : "text-foreground"}`}>
                            {cfg.label}
                          </p>
                        </div>
                        {index < arr.length - 1 && (
                          <div
                            className={`absolute left-4 w-0.5 h-6 mt-8 ${
                              isCompleted ? "bg-primary" : "bg-border"
                            }`}
                            style={{ top: `${index * 48 + 16}px` }}
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
