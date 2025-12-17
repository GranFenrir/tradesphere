import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";

  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    const data = products.map((product) => {
      let status = "Stokta";
      if (product.currentStock === 0) status = "Stok Yok";
      else if (product.currentStock <= product.reorderPoint) status = "Düşük Stok";
      else if (product.currentStock > product.maxStock) status = "Fazla Stok";

      return {
        sku: product.sku,
        name: product.name,
        category: product.category,
        currentStock: product.currentStock,
        reorderPoint: product.reorderPoint,
        maxStock: product.maxStock,
        status,
        needsReorder: product.currentStock <= product.reorderPoint,
        excessStock: Math.max(0, product.currentStock - product.maxStock),
      };
    });

    const summary = {
      totalProducts: data.length,
      inStock: data.filter((p) => p.status === "Stokta").length,
      lowStock: data.filter((p) => p.status === "Düşük Stok").length,
      outOfStock: data.filter((p) => p.status === "Stok Yok").length,
      overstocked: data.filter((p) => p.status === "Fazla Stok").length,
    };

    if (format === "csv") {
      const headers = [
        "SKU",
        "Ürün Adı",
        "Kategori",
        "Mevcut Stok",
        "Yeniden Sipariş Noktası",
        "Maksimum Stok",
        "Durum",
        "Sipariş Gerekli",
        "Fazla Stok",
      ];
      const rows = data.map((p) => [
        p.sku,
        `"${p.name}"`,
        p.category,
        p.currentStock,
        p.reorderPoint,
        p.maxStock,
        p.status,
        p.needsReorder ? "Evet" : "Hayır",
        p.excessStock,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=stock-levels.csv",
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
