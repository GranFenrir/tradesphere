import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import {
  Package,
  Warehouse,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  TrendingUp,
  Boxes,
  Truck,
  History,
  ShoppingCart,
} from "lucide-react";
import { auth } from "@/auth";
import { SidebarWrapper } from "./components/sidebar-wrapper";
import { prisma } from "@repo/database";
import Link from "next/link";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);

export default async function Page() {
  const session = await auth();

  // Get user role from database
  const dbUser = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } })
    : null;

  const sidebarUser = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: dbUser?.role || "USER",
      }
    : null;

  // ===== GERÇEK VERİTABANI VERİLERİ =====
  const [products, warehouses, users, suppliers, stockMovements, purchaseOrders, salesOrders] =
    await Promise.all([
      prisma.product.findMany(),
      prisma.warehouse.findMany({ where: { isActive: true } }),
      prisma.user.findMany({ where: { isActive: true } }),
      prisma.supplier.findMany({ where: { isActive: true } }),
      prisma.stockMovement.findMany({
        include: { product: { select: { name: true, sku: true } }, user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.purchaseOrder.findMany({
        include: { supplier: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.salesOrder.findMany({
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  // Envanter metrikleri
  const totalProducts = products.length;
  const inventoryValue = products.reduce((acc, p) => acc + p.cost.toNumber() * p.currentStock, 0);
  const retailValue = products.reduce((acc, p) => acc + p.price.toNumber() * p.currentStock, 0);
  const potentialProfit = retailValue - inventoryValue;
  const marginPct = inventoryValue > 0 ? ((potentialProfit / inventoryValue) * 100).toFixed(1) : "0";

  // Stok durumu
  const outOfStock = products.filter((p) => p.currentStock === 0);
  const lowStock = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.reorderPoint);
  const overstocked = products.filter((p) => p.currentStock > p.maxStock);
  const healthy = products.filter((p) => p.currentStock > p.reorderPoint && p.currentStock <= p.maxStock);

  // Ölü stok
  const deadStockValue = overstocked.reduce((acc, p) => {
    const excess = p.currentStock - p.maxStock;
    return acc + excess * p.cost.toNumber();
  }, 0);

  // Hareket türü bazında sayılar
  const movementTypeLabels: Record<string, string> = { IN: "Giriş", OUT: "Çıkış", TRANSFER: "Transfer" };

  return (
    <div className="flex min-h-screen">
      <SidebarWrapper user={sidebarUser} />
      <main className="flex-1 ml-64 p-8 bg-muted/20 min-h-screen">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground neon-text">Kontrol Paneli</h1>
            <p className="text-muted-foreground mt-2">
              Tekrar hoş geldiniz, {session?.user?.name || "Kullanıcı"}. İşte sistemin güncel durumu.
            </p>
          </div>

          {/* Ana Metrikler */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Envanter Değeri</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(inventoryValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Maliyet bazlı toplam değer</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Potansiyel Gelir</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(retailValue)}</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> %{marginPct} potansiyel kar marjı
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Ürün</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {healthy.length} sağlıklı, {lowStock.length + outOfStock.length} dikkat gerektiren
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Stok Uyarıları</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{outOfStock.length + lowStock.length}</div>
                <p className="text-xs text-orange-400 flex items-center mt-1">
                  {outOfStock.length > 0 && (
                    <><ArrowDownRight className="w-3 h-3 mr-1" /> {outOfStock.length} stokta yok</>
                  )}
                  {outOfStock.length > 0 && lowStock.length > 0 && ", "}
                  {lowStock.length > 0 && `${lowStock.length} düşük stok`}
                  {outOfStock.length === 0 && lowStock.length === 0 && (
                    <span className="text-green-500">Tüm stoklar yeterli</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* İkincil Metrikler */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="glass-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Depolar</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">{warehouses.length}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tedarikçiler</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">{suppliers.length}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Kullanıcılar</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-foreground">{users.length}</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ölü Stok Değeri</CardTitle>
                <Boxes className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${deadStockValue > 0 ? "text-red-500" : "text-green-500"}`}>
                  {deadStockValue > 0 ? formatCurrency(deadStockValue) : "₺0"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alt Bölümler */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Stok Sağlığı Dağılımı */}
            <Card className="col-span-4 glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Stok Sağlığı</CardTitle>
                <CardDescription className="text-muted-foreground">Ürün bazlı stok durumu dağılımı</CardDescription>
              </CardHeader>
              <CardContent>
                {totalProducts > 0 ? (
                  <div className="space-y-4">
                    {/* Stok durumu barları */}
                    {[
                      { label: "Sağlıklı", count: healthy.length, color: "bg-green-500", textColor: "text-green-500" },
                      { label: "Düşük Stok", count: lowStock.length, color: "bg-orange-500", textColor: "text-orange-500" },
                      { label: "Stok Yok", count: outOfStock.length, color: "bg-red-500", textColor: "text-red-500" },
                      { label: "Fazla Stok", count: overstocked.length, color: "bg-purple-500", textColor: "text-purple-500" },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-muted-foreground">{item.label}</span>
                          </div>
                          <span className={`font-medium ${item.textColor}`}>{item.count} ürün</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${(item.count / totalProducts) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Dikkat gerektiren ürünler */}
                    {(outOfStock.length > 0 || lowStock.length > 0) && (
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-sm font-medium text-muted-foreground mb-3">Dikkat Gerektiren Ürünler</p>
                        <div className="space-y-2">
                          {[...outOfStock, ...lowStock].slice(0, 4).map((p) => (
                            <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5">
                              <div>
                                <span className="text-foreground">{p.name}</span>
                                <span className="text-muted-foreground ml-2 text-xs">({p.sku})</span>
                              </div>
                              <span className={p.currentStock === 0 ? "text-red-500" : "text-orange-500"}>
                                {p.currentStock} / {p.reorderPoint}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Link
                          href="/analytics/stock-health"
                          className="text-sm text-primary hover:text-primary/80 mt-3 inline-block"
                        >
                          Tüm stok analizini gör →
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Henüz ürün bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Son Stok Hareketleri */}
            <Card className="col-span-3 glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Son Stok Hareketleri</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Son {stockMovements.length} hareket
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stockMovements.length > 0 ? (
                  <div className="space-y-5">
                    {stockMovements.map((m) => (
                      <div key={m.id} className="flex items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold mr-4 ${
                            m.type === "IN"
                              ? "bg-green-500/20 text-green-500"
                              : m.type === "OUT"
                                ? "bg-red-500/20 text-red-500"
                                : "bg-blue-500/20 text-blue-500"
                          }`}
                        >
                          {m.type === "IN" ? "G" : m.type === "OUT" ? "Ç" : "T"}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="text-sm font-medium leading-none text-foreground truncate">
                            {m.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {movementTypeLabels[m.type] || m.type} • {m.reference || "Referans yok"}
                          </p>
                        </div>
                        <div className="ml-auto font-medium text-foreground whitespace-nowrap">
                          {m.type === "OUT" ? "-" : "+"}
                          {m.quantity} adet
                        </div>
                      </div>
                    ))}
                    <Link
                      href="/inventory/stock/movements"
                      className="text-sm text-primary hover:text-primary/80 mt-2 inline-block"
                    >
                      Tüm hareketleri gör →
                    </Link>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Henüz stok hareketi bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Satın Alma Siparişleri & Hızlı Erişim */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Son Satın Alma Siparişleri */}
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Son Satın Alma Siparişleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchaseOrders.length > 0 ? (
                  <div className="space-y-3">
                    {purchaseOrders.map((po) => {
                      const statusColors: Record<string, string> = {
                        DRAFT: "text-gray-400",
                        SENT: "text-blue-400",
                        CONFIRMED: "text-green-400",
                        PARTIAL: "text-orange-400",
                        RECEIVED: "text-green-500",
                        CANCELLED: "text-red-400",
                      };
                      const statusLabels: Record<string, string> = {
                        DRAFT: "Taslak",
                        SENT: "Gönderildi",
                        CONFIRMED: "Onaylandı",
                        PARTIAL: "Kısmi",
                        RECEIVED: "Teslim Alındı",
                        CANCELLED: "İptal",
                      };
                      return (
                        <div key={po.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div>
                            <p className="text-sm font-medium text-foreground">{po.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">{po.supplier.name}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${statusColors[po.status] || "text-muted-foreground"}`}>
                              {statusLabels[po.status] || po.status}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(po.total.toNumber())}</p>
                          </div>
                        </div>
                      );
                    })}
                    <Link
                      href="/inventory/purchase-orders"
                      className="text-sm text-primary hover:text-primary/80 inline-block mt-2"
                    >
                      Tüm siparişleri gör →
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">Henüz satın alma siparişi yok</p>
                )}
              </CardContent>
            </Card>

            {/* Hızlı Erişim */}
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Hızlı Erişim
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Ürün Ekle", href: "/inventory/products/new", icon: Package },
                    { label: "Stok Girişi", href: "/inventory/stock/in", icon: ArrowUpRight },
                    { label: "Satın Alma Oluştur", href: "/inventory/purchase-orders/new", icon: ShoppingCart },
                    { label: "Stok Analizi", href: "/analytics/stock-health", icon: TrendingUp },
                    { label: "Finansal Analiz", href: "/analytics/financials", icon: DollarSign },
                    { label: "Raporlar", href: "/analytics/reports", icon: Boxes },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all group"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
