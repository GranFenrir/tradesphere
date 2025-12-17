import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const whereClause: Record<string, unknown> = {};
    if (from || to) {
      whereClause.createdAt = {};
      if (from) (whereClause.createdAt as Record<string, Date>).gte = new Date(from);
      if (to) (whereClause.createdAt as Record<string, Date>).lte = new Date(to);
    }

    // Get sales invoices (SALES type)
    const invoices = await prisma.invoice.findMany({
      where: {
        ...whereClause,
        type: "SALES",
        status: { in: ["PAID", "PARTIAL"] },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate revenue by product
    const productRevenue: Record<string, {
      productId: string;
      productName: string;
      sku: string;
      category: string;
      unitsSold: number;
      revenue: number;
      cost: number;
      profit: number;
    }> = {};

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        if (!item.product || !item.productId) return;
        
        const key = item.productId;
        if (!productRevenue[key]) {
          productRevenue[key] = {
            productId: item.productId,
            productName: item.product.name,
            sku: item.product.sku,
            category: item.product.category,
            unitsSold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }
        
        productRevenue[key]!.unitsSold += item.quantity;
        productRevenue[key]!.revenue += Number(item.total);
        productRevenue[key]!.cost += item.quantity * Number(item.product.cost);
      });
    });

    // Calculate profit
    Object.values(productRevenue).forEach((p) => {
      p.profit = p.revenue - p.cost;
    });

    const data = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue);

    const summary = {
      totalRevenue: data.reduce((sum, p) => sum + p.revenue, 0),
      totalCost: data.reduce((sum, p) => sum + p.cost, 0),
      totalProfit: data.reduce((sum, p) => sum + p.profit, 0),
      profitMargin: data.reduce((sum, p) => sum + p.revenue, 0) > 0
        ? (data.reduce((sum, p) => sum + p.profit, 0) / data.reduce((sum, p) => sum + p.revenue, 0)) * 100
        : 0,
      totalUnitsSold: data.reduce((sum, p) => sum + p.unitsSold, 0),
      uniqueProducts: data.length,
    };

    if (format === "csv") {
      const headers = [
        "Ürün ID",
        "Ürün Adı",
        "SKU",
        "Kategori",
        "Satılan Adet",
        "Gelir",
        "Maliyet",
        "Kâr",
        "Kâr Marjı (%)",
      ];
      const rows = data.map((p) => [
        p.productId,
        `"${p.productName}"`,
        p.sku,
        p.category,
        p.unitsSold,
        p.revenue.toFixed(2),
        p.cost.toFixed(2),
        p.profit.toFixed(2),
        p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(1) : "0",
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=revenue-report.csv",
        },
      });
    }

    return NextResponse.json({ data, summary });
  } catch (error) {
    console.error("Rapor oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Rapor oluşturulamadı" },
      { status: 500 }
    );
  }
}
