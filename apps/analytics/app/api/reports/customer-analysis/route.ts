import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";

  try {
    const customers = await prisma.customer.findMany({
      include: {
        salesOrders: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = customers.map((customer) => {
      const completedOrders = customer.salesOrders.filter(
        (o) => o.status === "DELIVERED"
      );
      const totalRevenue = customer.salesOrders.reduce(
        (sum, o) => sum + Number(o.total),
        0
      );
      const totalOrders = customer.salesOrders.length;

      const sortedOrders = customer.salesOrders
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return {
        customerId: customer.id,
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone || "-",
        totalOrders,
        completedOrders: completedOrders.length,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        lastOrderDate: sortedOrders.length > 0 && sortedOrders[0]
          ? sortedOrders[0].createdAt.toISOString().split("T")[0]
          : "-",
      };
    });

    const summary = {
      totalCustomers: data.length,
      activeCustomers: data.filter((c) => c.totalOrders > 0).length,
      totalRevenue: data.reduce((sum, c) => sum + c.totalRevenue, 0),
      averageRevenuePerCustomer: data.length > 0
        ? data.reduce((sum, c) => sum + c.totalRevenue, 0) / data.length
        : 0,
    };

    if (format === "csv") {
      const headers = [
        "Müşteri ID",
        "Müşteri Adı",
        "E-posta",
        "Telefon",
        "Toplam Sipariş",
        "Tamamlanan Sipariş",
        "Toplam Gelir",
        "Ortalama Sipariş Değeri",
        "Son Sipariş Tarihi",
      ];
      const rows = data.map((c) => [
        c.customerId,
        `"${c.customerName}"`,
        c.email,
        c.phone,
        c.totalOrders,
        c.completedOrders,
        c.totalRevenue.toFixed(2),
        c.averageOrderValue.toFixed(2),
        c.lastOrderDate,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=customer-analysis.csv",
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
