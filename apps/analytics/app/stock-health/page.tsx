import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from "lucide-react";
import { prisma } from "@repo/database";
import Link from "next/link";

type StockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "OVERSTOCKED" | "IN_STOCK";

function getStockStatus(product: { currentStock: number; reorderPoint: number; maxStock: number }): StockStatus {
  if (product.currentStock === 0) return "OUT_OF_STOCK";
  if (product.currentStock <= product.reorderPoint) return "LOW_STOCK";
  if (product.currentStock > product.maxStock) return "OVERSTOCKED";
  return "IN_STOCK";
}

function getStatusConfig(status: StockStatus) {
  switch (status) {
    case "OUT_OF_STOCK":
      return { 
        label: "Stok Yok", 
        color: "text-red-500", 
        bg: "bg-red-500/10", 
        border: "border-red-500/30",
        icon: AlertCircle 
      };
    case "LOW_STOCK":
      return { 
        label: "Düşük Stok", 
        color: "text-orange-500", 
        bg: "bg-orange-500/10", 
        border: "border-orange-500/30",
        icon: AlertTriangle 
      };
    case "OVERSTOCKED":
      return { 
        label: "Fazla Stok", 
        color: "text-purple-500", 
        bg: "bg-purple-500/10", 
        border: "border-purple-500/30",
        icon: TrendingUp 
      };
    case "IN_STOCK":
      return { 
        label: "Sağlıklı", 
        color: "text-green-500", 
        bg: "bg-green-500/10", 
        border: "border-green-500/30",
        icon: CheckCircle 
      };
  }
}

export default async function StockHealthPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
  });

  // Group products by status
  const productsByStatus = products.reduce((acc, product) => {
    const status = getStockStatus(product);
    if (!acc[status]) acc[status] = [];
    acc[status].push(product);
    return acc;
  }, {} as Record<StockStatus, typeof products>);

  // Calculate metrics
  const totalProducts = products.length;
  const healthyCount = productsByStatus.IN_STOCK?.length || 0;
  const lowStockCount = productsByStatus.LOW_STOCK?.length || 0;
  const outOfStockCount = productsByStatus.OUT_OF_STOCK?.length || 0;
  const overstockedCount = productsByStatus.OVERSTOCKED?.length || 0;

  const healthScore = totalProducts > 0 
    ? Math.round((healthyCount / totalProducts) * 100) 
    : 0;

  // Calculate financial impact
  const lowStockRevenueLoss = (productsByStatus.LOW_STOCK || []).reduce(
    (acc, p) => acc + (p.reorderPoint - p.currentStock) * p.price.toNumber(),
    0
  );

  const overstockCapitalTied = (productsByStatus.OVERSTOCKED || []).reduce(
    (acc, p) => acc + (p.currentStock - p.maxStock) * p.cost.toNumber(),
    0
  );

  const outOfStockOpportunityCost = (productsByStatus.OUT_OF_STOCK || []).reduce(
    (acc, p) => acc + p.reorderPoint * p.price.toNumber(),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Stok Sağlığı</h1>
          <p className="text-muted-foreground mt-2">
            Envanter durumu analizi ve optimizasyon önerileri.
          </p>
        </div>
      </div>

      {/* Health Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="glass-card border-primary/20 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stok Sağlık Skoru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/10"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${healthScore * 2.51} 251`}
                    className={healthScore >= 70 ? "text-green-500" : healthScore >= 40 ? "text-orange-500" : "text-red-500"}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">%{healthScore}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {healthScore >= 70 && "Mükemmel envanter dengesi"}
                  {healthScore >= 40 && healthScore < 70 && "İyileştirme gerekiyor"}
                  {healthScore < 40 && "Kritik seviye - acil aksiyon gerekli"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalProducts} üründen {healthyCount} tanesi sağlıklı durumda
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stok Yok</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{outOfStockCount}</div>
            <p className="text-xs text-red-400 flex items-center mt-1">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              Kayıp fırsat: {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(outOfStockOpportunityCost)}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Düşük Stok</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{lowStockCount}</div>
            <p className="text-xs text-orange-400 flex items-center mt-1">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              Risk: {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(lowStockRevenueLoss)}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fazla Stok</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overstockedCount}</div>
            <p className="text-xs text-purple-400 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              Bağlı: {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(overstockCapitalTied)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Items - Out of Stock */}
        <Card className="glass-card border-red-500/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Stokta Olmayan Ürünler
            </CardTitle>
            <CardDescription>Acil sipariş gerektiren ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {productsByStatus.OUT_OF_STOCK?.length ? (
                productsByStatus.OUT_OF_STOCK.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-500">0 / {product.reorderPoint}</p>
                      <p className="text-xs text-muted-foreground">Hedef: {product.reorderPoint} adet</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">Stokta olmayan ürün yok</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="glass-card border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Düşük Stoklu Ürünler
            </CardTitle>
            <CardDescription>Yakında sipariş verilmesi gereken ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {productsByStatus.LOW_STOCK?.length ? (
                productsByStatus.LOW_STOCK.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-500">{product.currentStock} / {product.reorderPoint}</p>
                      <p className="text-xs text-muted-foreground">Eksik: {product.reorderPoint - product.currentStock} adet</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">Düşük stoklu ürün yok</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overstocked Items */}
        <Card className="glass-card border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Fazla Stoklu Ürünler
            </CardTitle>
            <CardDescription>Sermaye bağlayan fazla envanter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {productsByStatus.OVERSTOCKED?.length ? (
                productsByStatus.OVERSTOCKED.map((product) => {
                  const excess = product.currentStock - product.maxStock;
                  const capitalTied = excess * product.cost.toNumber();
                  return (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-purple-500">{product.currentStock} / {product.maxStock}</p>
                        <p className="text-xs text-muted-foreground">
                          +{excess} fazla ({new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(capitalTied)})
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">Fazla stoklu ürün yok</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Healthy Items Summary */}
        <Card className="glass-card border-green-500/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Sağlıklı Stok
            </CardTitle>
            <CardDescription>Optimal seviyede olan ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Toplam Sağlıklı Ürün</span>
                <span className="text-2xl font-bold text-green-500">{healthyCount}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${totalProducts > 0 ? (healthyCount / totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Envanterin %{totalProducts > 0 ? Math.round((healthyCount / totalProducts) * 100) : 0}'i optimal seviyelerde
              </p>
              
              {productsByStatus.IN_STOCK && productsByStatus.IN_STOCK.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-muted-foreground mb-2">Son eklenen sağlıklı ürünler:</p>
                  <div className="space-y-2">
                    {productsByStatus.IN_STOCK.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{product.name}</span>
                        <span className="text-green-500">{product.currentStock} adet</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Recommendations */}
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Önerilen Aksiyonlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {outOfStockCount > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <h4 className="font-medium text-red-400 mb-2">🚨 Acil Sipariş</h4>
                <p className="text-sm text-muted-foreground">
                  {outOfStockCount} ürün stokta yok. Müşteri kayıplarını önlemek için hemen sipariş verin.
                </p>
                <Link 
                  href="/inventory" 
                  className="text-sm text-red-400 hover:text-red-300 mt-2 inline-block"
                >
                  Envantere Git →
                </Link>
              </div>
            )}
            {lowStockCount > 0 && (
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <h4 className="font-medium text-orange-400 mb-2">⚠️ Stok Takibi</h4>
                <p className="text-sm text-muted-foreground">
                  {lowStockCount} ürün kritik seviyede. Önümüzdeki hafta için sipariş planı yapın.
                </p>
                <Link 
                  href="/reports" 
                  className="text-sm text-orange-400 hover:text-orange-300 mt-2 inline-block"
                >
                  Raporları İncele →
                </Link>
              </div>
            )}
            {overstockedCount > 0 && (
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <h4 className="font-medium text-purple-400 mb-2">📦 Stok Optimizasyonu</h4>
                <p className="text-sm text-muted-foreground">
                  {overstockedCount} üründe fazla stok var. İndirim veya promosyon kampanyası düşünün.
                </p>
                <Link 
                  href="/financials" 
                  className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block"
                >
                  Finansal Analiz →
                </Link>
              </div>
            )}
            {outOfStockCount === 0 && lowStockCount === 0 && overstockedCount === 0 && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 md:col-span-3">
                <h4 className="font-medium text-green-400 mb-2">✅ Mükemmel Envanter</h4>
                <p className="text-sm text-muted-foreground">
                  Tüm ürünler optimal stok seviyelerinde. Mevcut stratejiyi sürdürün.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
