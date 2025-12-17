import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { TrendingUp, AlertTriangle, DollarSign, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { prisma } from "@repo/database";

export default async function Page() {
  const products = await prisma.product.findMany();

  // Calculate real metrics from database
  const totalProducts = products.length;
  
  // Liquidity Tied Up = sum of (cost × currentStock)
  const liquidityTiedUp = products.reduce(
    (acc, p) => acc + p.cost.toNumber() * p.currentStock, 
    0
  );

  // Potential Revenue = sum of (price × currentStock)
  const potentialRevenue = products.reduce(
    (acc, p) => acc + p.price.toNumber() * p.currentStock, 
    0
  );

  // Dead Stock Value = cost of items exceeding maxStock
  const deadStockValue = products.reduce((acc, p) => {
    if (p.currentStock > p.maxStock) {
      const excessUnits = p.currentStock - p.maxStock;
      return acc + excessUnits * p.cost.toNumber();
    }
    return acc;
  }, 0);

  // Stock Health counts
  const lowStockItems = products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderPoint);
  const outOfStockItems = products.filter(p => p.currentStock === 0);
  const overstockedItems = products.filter(p => p.currentStock > p.maxStock);
  const healthyItems = products.filter(p => p.currentStock > p.reorderPoint && p.currentStock <= p.maxStock);

  // Gross Margin if all sold
  const grossMargin = potentialRevenue - liquidityTiedUp;
  const marginPercentage = liquidityTiedUp > 0 ? ((grossMargin / liquidityTiedUp) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Analitik Genel Bakış</h1>
          <p className="text-muted-foreground mt-2">Anlık envanter içgörüleri ve finansal metrikler.</p>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bağlı Likidite</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(liquidityTiedUp)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Envanterdeki sermaye
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Potansiyel Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(potentialRevenue)}
            </div>
            <p className="text-xs text-green-400 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> %{marginPercentage} marj
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ölü Stok Değeri</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(deadStockValue)}
            </div>
            <p className="text-xs text-red-400 flex items-center mt-1">
              {overstockedItems.length} fazla stoklu ürün
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
              Katalogda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Health & Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Stok Sağlığı Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-muted-foreground">Sağlıklı Stok</span>
                </div>
                <span className="text-foreground font-medium">{healthyItems.length} ürün</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${totalProducts > 0 ? (healthyItems.length / totalProducts) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-muted-foreground">Düşük Stok</span>
                </div>
                <span className="text-foreground font-medium">{lowStockItems.length} ürün</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${totalProducts > 0 ? (lowStockItems.length / totalProducts) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-muted-foreground">Stok Yok</span>
                </div>
                <span className="text-foreground font-medium">{outOfStockItems.length} ürün</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${totalProducts > 0 ? (outOfStockItems.length / totalProducts) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-muted-foreground">Fazla Stok</span>
                </div>
                <span className="text-foreground font-medium">{overstockedItems.length} ürün</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${totalProducts > 0 ? (overstockedItems.length / totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">İlgi Gerektiren Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...outOfStockItems, ...lowStockItems].slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm text-foreground font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${item.currentStock === 0 ? 'text-red-400' : 'text-orange-400'}`}>
                      {item.currentStock} adet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Yeniden sipariş: {item.reorderPoint}
                    </p>
                  </div>
                </div>
              ))}
              {outOfStockItems.length === 0 && lowStockItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Tüm ürünler yeterli stokta! 🎉
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
