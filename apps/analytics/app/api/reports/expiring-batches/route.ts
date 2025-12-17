import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";
  const days = parseInt(searchParams.get("days") || "30");

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const batches = await prisma.batch.findMany({
      where: {
        expiryDate: {
          lte: cutoffDate,
          gte: new Date(),
        },
      },
      include: {
        product: true,
      },
      orderBy: { expiryDate: "asc" },
    });

    const data = batches.map((batch) => {
      const daysUntilExpiry = Math.ceil(
        (batch.expiryDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let urgency = "Normal";
      if (daysUntilExpiry <= 7) urgency = "Kritik";
      else if (daysUntilExpiry <= 14) urgency = "Yüksek";
      else if (daysUntilExpiry <= 30) urgency = "Orta";

      return {
        batchNumber: batch.batchNumber,
        productSku: batch.product.sku,
        productName: batch.product.name,
        quantity: batch.currentQty,
        expiryDate: batch.expiryDate?.toISOString().split("T")[0],
        daysUntilExpiry,
        urgency,
        costValue: batch.currentQty * Number(batch.product.cost),
      };
    });

    const summary = {
      totalBatches: data.length,
      critical: data.filter((b) => b.urgency === "Kritik").length,
      high: data.filter((b) => b.urgency === "Yüksek").length,
      medium: data.filter((b) => b.urgency === "Orta").length,
      totalValueAtRisk: data.reduce((sum, b) => sum + b.costValue, 0),
    };

    if (format === "csv") {
      const headers = [
        "Parti No",
        "Ürün SKU",
        "Ürün Adı",
        "Miktar",
        "Son Kullanma Tarihi",
        "Kalan Gün",
        "Aciliyet",
        "Maliyet Değeri",
      ];
      const rows = data.map((b) => [
        b.batchNumber,
        b.productSku,
        `"${b.productName}"`,
        b.quantity,
        b.expiryDate,
        b.daysUntilExpiry,
        b.urgency,
        b.costValue.toFixed(2),
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=expiring-batches.csv",
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
