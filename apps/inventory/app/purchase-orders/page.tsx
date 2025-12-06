import { prisma, POStatus } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Plus, ClipboardList, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  [POStatus.DRAFT]: { label: "Draft", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: ClipboardList },
  [POStatus.SENT]: { label: "Sent", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Truck },
  [POStatus.CONFIRMED]: { label: "Confirmed", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: CheckCircle },
  [POStatus.PARTIAL]: { label: "Partial", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: Package },
  [POStatus.RECEIVED]: { label: "Received", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  [POStatus.CANCELLED]: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
} as const;

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      supplier: {
        select: { name: true, code: true },
      },
      items: {
        select: { quantity: true, receivedQty: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingStatuses = [POStatus.SENT, POStatus.CONFIRMED, POStatus.PARTIAL] as string[];
  
  const stats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter((po) => po.status === POStatus.DRAFT).length,
    pending: purchaseOrders.filter((po) => 
      pendingStatuses.includes(po.status)
    ).length,
    received: purchaseOrders.filter((po) => po.status === POStatus.RECEIVED).length,
    totalValue: purchaseOrders.reduce((sum, po) => sum + Number(po.total), 0),
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Purchase Orders</h1>
          <p className="text-muted-foreground mt-2">
            Manage supplier orders and inventory replenishment.
          </p>
        </div>
        <Link href="/purchase-orders/new">
          <Button className="shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Plus className="w-4 h-4 mr-2" />
            New Purchase Order
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Delivery
            </CardTitle>
            <Truck className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Order #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Supplier
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Items
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Expected
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => {
                    const config = statusConfig[po.status] ?? statusConfig[POStatus.DRAFT]!;
                    const StatusIcon = config.icon;
                    const totalItems = po.items.reduce((sum: number, item) => sum + item.quantity, 0);
                    const receivedItems = po.items.reduce((sum: number, item) => sum + item.receivedQty, 0);

                    return (
                      <tr
                        key={po.id}
                        className="border-b border-border hover:bg-muted/10 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={`/purchase-orders/${po.id}`}
                            className="text-foreground font-mono hover:text-primary transition-colors"
                          >
                            {po.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-foreground">{po.supplier.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {po.supplier.code}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${config.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-foreground">
                            {receivedItems}/{totalItems}
                          </span>
                          <span className="text-muted-foreground text-xs ml-1">units</span>
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          ${Number(po.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {po.expectedDate
                            ? new Date(po.expectedDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(po.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No purchase orders yet.</p>
              <Link href="/purchase-orders/new" className="mt-4 inline-block">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Order
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
