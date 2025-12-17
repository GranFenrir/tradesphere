import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";

  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        purchaseOrders: {
          include: {
            items: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = suppliers.map((supplier) => {
      const receivedOrders = supplier.purchaseOrders.filter(
        (o) => o.status === "RECEIVED"
      );
      const totalSpent = supplier.purchaseOrders.reduce(
        (sum, o) => sum + Number(o.total),
        0
      );
      const totalOrders = supplier.purchaseOrders.length;

      // Calculate average lead time for received orders
      const leadTimes = receivedOrders
        .filter((o) => o.expectedDate && o.updatedAt)
        .map((o) => {
          const expected = o.expectedDate!.getTime();
          const received = o.updatedAt.getTime();
          return Math.ceil((received - expected) / (1000 * 60 * 60 * 24));
        });
      const avgLeadTime = leadTimes.length > 0
        ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
        : 0;

      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        email: supplier.email,
        phone: supplier.phone || "-",
        totalOrders,
        receivedOrders: receivedOrders.length,
        totalSpent,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        productsSupplied: supplier.products.length,
        averageLeadTimeDays: Math.round(avgLeadTime),
        onTimeDeliveryRate: leadTimes.length > 0
          ? Math.round((leadTimes.filter((lt) => lt <= 0).length / leadTimes.length) * 100)
          : 0,
      };
    });

    const summary = {
      totalSuppliers: data.length,
      activeSuppliers: data.filter((s) => s.totalOrders > 0).length,
      totalSpent: data.reduce((sum, s) => sum + s.totalSpent, 0),
      averageLeadTime: data.length > 0
        ? Math.round(data.reduce((sum, s) => sum + s.averageLeadTimeDays, 0) / data.length)
        : 0,
    };

    if (format === "csv") {
      const headers = [
        "Tedarikçi ID",
        "Tedarikçi Adı",
        "E-posta",
        "Telefon",
        "Toplam Sipariş",
        "Teslim Alınan",
        "Toplam Harcama",
        "Ortalama Sipariş Değeri",
        "Ürün Sayısı",
        "Ort. Teslimat Süresi (Gün)",
        "Zamanında Teslimat (%)",
      ];
      const rows = data.map((s) => [
        s.supplierId,
        `"${s.supplierName}"`,
        s.email,
        s.phone,
        s.totalOrders,
        s.receivedOrders,
        s.totalSpent.toFixed(2),
        s.averageOrderValue.toFixed(2),
        s.productsSupplied,
        s.averageLeadTimeDays,
        s.onTimeDeliveryRate,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=supplier-performance.csv",
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
