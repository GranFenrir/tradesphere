import { prisma, OrderStatus } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Plus, ShoppingCart, Package, Clock, CheckCircle, XCircle, Truck, DollarSign } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  [OrderStatus.DRAFT]: { label: "Taslak", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: ShoppingCart },
  [OrderStatus.PENDING]: { label: "Bekliyor", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  [OrderStatus.CONFIRMED]: { label: "Onaylandı", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle },
  [OrderStatus.SHIPPED]: { label: "Kargoya Verildi", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Truck },
  [OrderStatus.DELIVERED]: { label: "Teslim Edildi", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  [OrderStatus.CANCELLED]: { label: "İptal", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
} as const;

export default async function SalesOrdersPage() {
  const salesOrders = await prisma.salesOrder.findMany({
    include: {
      customer: {
        select: { name: true, email: true },
      },
      items: {
        select: { quantity: true, unitPrice: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED] as string[];
  
  const stats = {
    total: salesOrders.length,
    draft: salesOrders.filter((so) => so.status === OrderStatus.DRAFT).length,
    pending: salesOrders.filter((so) => pendingStatuses.includes(so.status)).length,
    shipped: salesOrders.filter((so) => so.status === OrderStatus.SHIPPED).length,
    revenue: salesOrders
      .filter((so) => so.status === OrderStatus.DELIVERED)
      .reduce((sum, so) => sum + Number(so.total), 0),
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Satış Siparişleri</h1>
          <p className="text-muted-foreground mt-2">
            Müşteri siparişlerini ve sevkiyatları yönetin.
          </p>
        </div>
        <Link href="/sales-orders/new">
          <Button className="shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Satış Siparişi
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Sipariş</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taslak</CardTitle>
            <ShoppingCart className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bekliyor</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kargoya Verildi</CardTitle>
            <Truck className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.shipped}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.revenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Tüm Satış Siparişleri</CardTitle>
        </CardHeader>
        <CardContent>
          {salesOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sipariş No</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Müşteri</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Durum</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Kalemler</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Toplam</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Oluşturulma</th>
                  </tr>
                </thead>
                <tbody>
                  {salesOrders.map((so) => {
                    const config = statusConfig[so.status] ?? statusConfig[OrderStatus.DRAFT]!;
                    const StatusIcon = config.icon;
                    const totalItems = so.items.reduce((sum: number, item) => sum + item.quantity, 0);

                    return (
                      <tr
                        key={so.id}
                        className="border-b border-border hover:bg-muted/10 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={`/sales-orders/${so.id}`}
                            className="text-foreground font-mono hover:text-primary transition-colors"
                          >
                            {so.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-foreground">{so.customer?.name ?? "Bilinmiyor"}</p>
                            <p className="text-xs text-muted-foreground">{so.customer?.email ?? ""}</p>
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
                          <span className="text-foreground">{totalItems}</span>
                          <span className="text-muted-foreground text-xs ml-1">adet</span>
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          {Number(so.total).toLocaleString("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(so.createdAt).toLocaleDateString("tr-TR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Henüz satış siparişi yok.</p>
              <Link href="/sales-orders/new" className="mt-4 inline-block">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Siparişi Oluştur
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
