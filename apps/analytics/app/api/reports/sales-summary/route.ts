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

    const salesOrders = await prisma.salesOrder.findMany({
      where: whereClause,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = salesOrders.map((order) => ({
      orderNumber: order.orderNumber,
      customerName: order.customer?.name || "-",
      status: order.status,
      totalAmount: Number(order.total),
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString().split("T")[0],
    }));

    const summary = {
      totalOrders: data.length,
      totalRevenue: data.reduce((sum, o) => sum + o.totalAmount, 0),
      byStatus: {
        draft: data.filter((o) => o.status === "DRAFT").length,
        confirmed: data.filter((o) => o.status === "CONFIRMED").length,
        shipped: data.filter((o) => o.status === "SHIPPED").length,
        delivered: data.filter((o) => o.status === "DELIVERED").length,
        cancelled: data.filter((o) => o.status === "CANCELLED").length,
      },
      averageOrderValue: data.length > 0 ? data.reduce((sum, o) => sum + o.totalAmount, 0) / data.length : 0,
    };

    if (format === "csv") {
      const headers = [
        "Sipariş No",
        "Müşteri",
        "Durum",
        "Toplam Tutar",
        "Kalem Sayısı",
        "Tarih",
      ];
      const rows = data.map((o) => [
        o.orderNumber,
        `"${o.customerName}"`,
        o.status,
        o.totalAmount.toFixed(2),
        o.itemCount,
        o.createdAt,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=sales-summary.csv",
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
