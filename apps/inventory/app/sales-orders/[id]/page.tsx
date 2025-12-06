import { prisma, OrderStatus } from "@repo/database";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Plus,
  Trash2,
  CheckCircle,
  Send,
  XCircle,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import {
  updateSalesOrderStatus,
  addSalesOrderItem,
  removeSalesOrderItem,
  deleteSalesOrder,
  shipSalesOrder,
} from "../actions";

const statusConfig: Record<string, { label: string; color: string; nextStatus?: string; nextAction?: string }> = {
  [OrderStatus.DRAFT]: { label: "Draft", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", nextStatus: OrderStatus.PENDING, nextAction: "Submit Order" },
  [OrderStatus.PENDING]: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", nextStatus: OrderStatus.CONFIRMED, nextAction: "Confirm Order" },
  [OrderStatus.CONFIRMED]: { label: "Confirmed", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", nextStatus: OrderStatus.SHIPPED, nextAction: "Ship Order" },
  [OrderStatus.SHIPPED]: { label: "Shipped", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", nextStatus: OrderStatus.DELIVERED, nextAction: "Mark Delivered" },
  [OrderStatus.DELIVERED]: { label: "Delivered", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  [OrderStatus.CANCELLED]: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30" },
} as const;

export default async function SalesOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const salesOrder = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!salesOrder) {
    notFound();
  }

  // Get products for adding to order
  const products = await prisma.product.findMany({
    where: { currentStock: { gt: 0 } },
    orderBy: { name: "asc" },
  });

  // Get warehouses for shipping
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const config = statusConfig[salesOrder.status] ?? statusConfig[OrderStatus.DRAFT]!;
  const isDraft = salesOrder.status === OrderStatus.DRAFT;
  const canShip = salesOrder.status === OrderStatus.CONFIRMED;
  const canEdit = salesOrder.status === OrderStatus.DRAFT || salesOrder.status === OrderStatus.PENDING;

  const totalItems = salesOrder.items.reduce((sum: number, item) => sum + item.quantity, 0);

  const updateStatusWithId = updateSalesOrderStatus.bind(null, id);
  const deleteOrderWithId = deleteSalesOrder.bind(null, id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales-orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground neon-text">
                {salesOrder.orderNumber}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm border ${config.color}`}>
                {config.label}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              Order for {salesOrder.customer?.name ?? "Unknown Customer"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {config.nextStatus && config.nextAction && !canShip && (
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

          {salesOrder.status !== OrderStatus.CANCELLED && salesOrder.status !== OrderStatus.DELIVERED && (
            <form action={async () => {
              "use server";
              await updateStatusWithId(OrderStatus.CANCELLED);
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
                Order Items ({salesOrder.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salesOrder.items.length > 0 ? (
                <div className="space-y-3">
                  {salesOrder.items.map((item) => (
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
                          <p className="text-foreground">{item.quantity} units</p>
                          <p className="text-sm text-muted-foreground">
                            @ ${Number(item.unitPrice).toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="text-foreground font-medium">
                            ${(item.quantity * Number(item.unitPrice)).toFixed(2)}
                          </p>
                        </div>
                        {canEdit && (
                          <form
                            action={async () => {
                              "use server";
                              await removeSalesOrderItem(item.id, id);
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
                        ${Number(salesOrder.total).toFixed(2)}
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

          {/* Add Item Form (only for editable orders) */}
          {canEdit && (
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
                    await addSalesOrderItem(id, formData);
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
                          {product.name} ({product.sku}) - {product.currentStock} in stock
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
                    <label htmlFor="unitPrice" className="text-sm font-medium text-foreground">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      id="unitPrice"
                      name="unitPrice"
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

          {/* Ship Order Form */}
          {canShip && warehouses.length > 0 && (
            <Card className="glass-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-400" />
                  Ship Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const warehouseId = formData.get("warehouseId") as string;
                    await shipSalesOrder(id, warehouseId);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="warehouseId" className="text-sm font-medium text-foreground">
                      Ship from Warehouse
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
                      Stock will be reduced from the first location in the selected warehouse.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Ship Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-foreground font-medium">{salesOrder.customer?.name ?? "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{salesOrder.customer?.email ?? ""}</p>
              </div>
              {salesOrder.customer?.phone && (
                <p className="text-sm text-muted-foreground">{salesOrder.customer.phone}</p>
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
                <span className="text-foreground font-medium">{totalItems} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-foreground font-medium">
                  ${Number(salesOrder.total).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {new Date(salesOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
              {salesOrder.shippedDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipped</span>
                  <span className="text-purple-400">
                    {new Date(salesOrder.shippedDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {salesOrder.deliveredDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="text-green-400">
                    {new Date(salesOrder.deliveredDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {salesOrder.shippingAddress && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-sm whitespace-pre-wrap">
                  {salesOrder.shippingAddress}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {salesOrder.notes && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-sm whitespace-pre-wrap">
                  {salesOrder.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {Object.entries(statusConfig)
                  .filter(([key]) => key !== OrderStatus.CANCELLED)
                  .map(([status, cfg], index) => {
                    const deliveredStatuses = [OrderStatus.DELIVERED] as string[];
                    const shippedStatuses = [OrderStatus.SHIPPED, ...deliveredStatuses] as string[];
                    const confirmedStatuses = [OrderStatus.CONFIRMED, ...shippedStatuses] as string[];
                    const pendingStatuses = [OrderStatus.PENDING, ...confirmedStatuses] as string[];
                    
                    const isCompleted = 
                      status === OrderStatus.DRAFT ||
                      (status === OrderStatus.PENDING && pendingStatuses.includes(salesOrder.status)) ||
                      (status === OrderStatus.CONFIRMED && confirmedStatuses.includes(salesOrder.status)) ||
                      (status === OrderStatus.SHIPPED && shippedStatuses.includes(salesOrder.status)) ||
                      (status === OrderStatus.DELIVERED && salesOrder.status === OrderStatus.DELIVERED);
                    
                    const isCurrent = salesOrder.status === status;

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
