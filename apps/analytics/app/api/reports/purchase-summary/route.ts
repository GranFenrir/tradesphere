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

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = purchaseOrders.map((order) => ({
      orderNumber: order.orderNumber,
      supplierName: order.supplier.name,
      status: order.status,
      totalAmount: Number(order.total),
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString().split("T")[0],
      expectedDate: order.expectedDate?.toISOString().split("T")[0] || "-",
    }));

    const summary = {
      totalOrders: data.length,
      totalSpent: data.reduce((sum, o) => sum + o.totalAmount, 0),
      byStatus: {
        draft: data.filter((o) => o.status === "DRAFT").length,
        sent: data.filter((o) => o.status === "SENT").length,
        confirmed: data.filter((o) => o.status === "CONFIRMED").length,
        partial: data.filter((o) => o.status === "PARTIAL").length,
        received: data.filter((o) => o.status === "RECEIVED").length,
        cancelled: data.filter((o) => o.status === "CANCELLED").length,
      },
      averageOrderValue: data.length > 0 ? data.reduce((sum, o) => sum + o.totalAmount, 0) / data.length : 0,
    };

    if (format === "csv") {
      const headers = [
        "Sipariş No",
        "Tedarikçi",
        "Durum",
        "Toplam Tutar",
        "Kalem Sayısı",
        "Tarih",
        "Beklenen Tarih",
      ];
      const rows = data.map((o) => [
        o.orderNumber,
        `"${o.supplierName}"`,
        o.status,
        o.totalAmount.toFixed(2),
        o.itemCount,
        o.createdAt,
        o.expectedDate,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=purchase-summary.csv",
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
