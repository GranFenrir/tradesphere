import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  PiggyBank,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart
} from "lucide-react";
import { prisma } from "@repo/database";

export default async function FinancialsPage() {
  // Fetch all relevant data
  const [products, salesOrders, purchaseOrders, invoices] = await Promise.all([
    prisma.product.findMany(),
    prisma.salesOrder.findMany({
      include: { items: true },
    }),
    prisma.purchaseOrder.findMany({
      include: { items: true },
    }),
    prisma.invoice.findMany(),
  ]);

  // Inventory Valuation
  const inventoryAtCost = products.reduce(
    (acc, p) => acc + p.cost.toNumber() * p.currentStock, 
    0
  );
  const inventoryAtRetail = products.reduce(
    (acc, p) => acc + p.price.toNumber() * p.currentStock, 
    0
  );
  const potentialProfit = inventoryAtRetail - inventoryAtCost;
  const marginPercentage = inventoryAtCost > 0 
    ? ((potentialProfit / inventoryAtCost) * 100).toFixed(1) 
    : "0";

  // Sales Analysis
  const completedSales = salesOrders.filter(o => o.status === "DELIVERED");
  const totalSalesRevenue = completedSales.reduce((acc, o) => acc + o.total.toNumber(), 0);
  const pendingSalesValue = salesOrders
    .filter(o => ["PENDING", "CONFIRMED", "SHIPPED"].includes(o.status))
    .reduce((acc, o) => acc + o.total.toNumber(), 0);

  // Purchase Analysis
  const completedPurchases = purchaseOrders.filter(o => o.status === "RECEIVED");
  const totalPurchaseCost = completedPurchases.reduce((acc, o) => acc + o.total.toNumber(), 0);
  const pendingPurchaseValue = purchaseOrders
    .filter(o => ["DRAFT", "SENT", "CONFIRMED"].includes(o.status))
    .reduce((acc, o) => acc + o.total.toNumber(), 0);

  // Invoice Analysis
  const paidInvoices = invoices.filter(i => i.status === "PAID");
  const unpaidInvoices = invoices.filter(i => ["SENT", "OVERDUE"].includes(i.status));
  const overdueInvoices = invoices.filter(i => i.status === "OVERDUE");
  
  const totalPaidAmount = paidInvoices.reduce((acc, i) => acc + i.total.toNumber(), 0);
  const totalUnpaidAmount = unpaidInvoices.reduce((acc, i) => acc + i.total.toNumber(), 0);
  const totalOverdueAmount = overdueInvoices.reduce((acc, i) => acc + i.total.toNumber(), 0);

  // Gross Profit (simplified)
  const grossProfit = totalSalesRevenue - totalPurchaseCost;
  const grossProfitMargin = totalSalesRevenue > 0 
    ? ((grossProfit / totalSalesRevenue) * 100).toFixed(1)
    : "0";

  // Dead Stock Analysis
  const deadStockProducts = products.filter(p => p.currentStock > p.maxStock);
  const deadStockValue = deadStockProducts.reduce((acc, p) => {
    const excess = p.currentStock - p.maxStock;
    return acc + excess * p.cost.toNumber();
  }, 0);

  // Category breakdown
  const categoryBreakdown = products.reduce((acc, p) => {
    const category = p.category || "Diğer";
    if (!acc[category]) {
      acc[category] = { cost: 0, retail: 0, quantity: 0 };
    }
    acc[category].cost += p.cost.toNumber() * p.currentStock;
    acc[category].retail += p.price.toNumber() * p.currentStock;
    acc[category].quantity += p.currentStock;
    return acc;
  }, {} as Record<string, { cost: number; retail: number; quantity: number }>);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground neon-text">Finansal Analiz</h1>
          <p className="text-muted-foreground mt-2">
            Envanter değerlemesi, nakit akışı ve karlılık metrikleri.
          </p>
        </div>
      </div>

      {/* Primary Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Envanter Değeri (Maliyet)</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(inventoryAtCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Stoktaki sermaye
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Envanter Değeri (Satış)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(inventoryAtRetail)}</div>
            <p className="text-xs text-green-400 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> %{marginPercentage} potansiyel kar
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Satış Geliri</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalSalesRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedSales.length} tamamlanan sipariş
            </p>
          </CardContent>
        </Card>

        <Card className={`glass-card ${grossProfit >= 0 ? "border-green-500/20" : "border-red-500/20"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Brüt Kar</CardTitle>
            {grossProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${grossProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(grossProfit)}
            </div>
            <p className={`text-xs flex items-center mt-1 ${grossProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {grossProfit >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              %{grossProfitMargin} brüt kar marjı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accounts Receivable */}
        <Card className="glass-card border-green-500/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-500" />
              Alacaklar (Tahsilat)
            </CardTitle>
            <CardDescription>Fatura durumu ve beklenen nakit girişi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-muted-foreground">Tahsil Edildi</span>
                </div>
                <span className="text-foreground font-medium">{formatCurrency(totalPaidAmount)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-muted-foreground">Bekleyen Faturalar</span>
                </div>
                <span className="text-foreground font-medium">{formatCurrency(totalUnpaidAmount)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm text-muted-foreground">Gecikmiş Faturalar</span>
                </div>
                <span className="text-foreground font-medium">{formatCurrency(totalOverdueAmount)}</span>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Toplam Alacak</span>
                  <span className="text-xl font-bold text-foreground">{formatCurrency(totalUnpaidAmount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Payable */}
        <Card className="glass-card border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              Borçlar (Ödeme)
            </CardTitle>
            <CardDescription>Satın alma siparişleri ve ödeme durumu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-muted-foreground">Tamamlanan Alımlar</span>
                </div>
                <span className="text-foreground font-medium">{formatCurrency(totalPurchaseCost)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-muted-foreground">Bekleyen Siparişler</span>
                </div>
                <span className="text-foreground font-medium">{formatCurrency(pendingPurchaseValue)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-muted-foreground">Bekleyen Satışlar</span>
                </div>
                <span className="text-foreground font-medium">{formatCurrency(pendingSalesValue)}</span>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bekleyen Ödemeler</span>
                  <span className="text-xl font-bold text-foreground">{formatCurrency(pendingPurchaseValue)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown & Dead Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Kategori Bazlı Değerleme
            </CardTitle>
            <CardDescription>Envanter değerinin kategori dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(categoryBreakdown)
                .sort((a, b) => b[1].cost - a[1].cost)
                .map(([category, data]) => {
                  const percentage = inventoryAtCost > 0 
                    ? ((data.cost / inventoryAtCost) * 100).toFixed(1) 
                    : "0";
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{category}</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(data.cost)}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{data.quantity} adet</span>
                        <span>%{percentage}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Dead Stock Analysis */}
        <Card className="glass-card border-red-500/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-red-500" />
              Ölü Stok Analizi
            </CardTitle>
            <CardDescription>Sermayeyi bağlayan fazla envanter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Bağlı Sermaye</span>
                  <span className="text-2xl font-bold text-red-500">{formatCurrency(deadStockValue)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {deadStockProducts.length} üründe fazla stok bulunuyor
                </p>
              </div>

              {deadStockProducts.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">En yüksek değerli fazla stoklar:</p>
                  {deadStockProducts
                    .sort((a, b) => {
                      const excessA = (a.currentStock - a.maxStock) * a.cost.toNumber();
                      const excessB = (b.currentStock - b.maxStock) * b.cost.toNumber();
                      return excessB - excessA;
                    })
                    .slice(0, 5)
                    .map((product) => {
                      const excess = product.currentStock - product.maxStock;
                      const value = excess * product.cost.toNumber();
                      return (
                        <div key={product.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                          <div>
                            <span className="text-sm text-foreground">{product.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">(+{excess} adet)</span>
                          </div>
                          <span className="text-sm text-red-400">{formatCurrency(value)}</span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                  <p className="text-green-400">✅ Fazla stok bulunmuyor</p>
                  <p className="text-sm text-muted-foreground mt-1">Tüm ürünler optimal seviyelerde</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Finansal Özet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-xs text-muted-foreground mb-1">Toplam Satış Siparişi</p>
              <p className="text-xl font-bold text-foreground">{salesOrders.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-xs text-muted-foreground mb-1">Toplam Satın Alma</p>
              <p className="text-xl font-bold text-foreground">{purchaseOrders.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-xs text-muted-foreground mb-1">Toplam Fatura</p>
              <p className="text-xl font-bold text-foreground">{invoices.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-xs text-muted-foreground mb-1">Aktif Ürün</p>
              <p className="text-xl font-bold text-foreground">{products.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
