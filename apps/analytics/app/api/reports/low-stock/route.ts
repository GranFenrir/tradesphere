import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";

  try {
    const products = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: prisma.product.fields.reorderPoint,
        },
      },
      orderBy: { currentStock: "asc" },
    });

    // Since Prisma doesn't support comparing fields directly, filter in JS
    const allProducts = await prisma.product.findMany({
      orderBy: { currentStock: "asc" },
    });

    const lowStockProducts = allProducts.filter(
      (p) => p.currentStock <= p.reorderPoint
    );

    const data = lowStockProducts.map((product) => ({
      sku: product.sku,
      name: product.name,
      category: product.category,
      currentStock: product.currentStock,
      reorderPoint: product.reorderPoint,
      deficit: product.reorderPoint - product.currentStock,
      status: product.currentStock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
      estimatedReorderCost:
        (product.reorderPoint - product.currentStock) * Number(product.cost),
    }));

    const totals = {
      totalLowStock: data.filter((p) => p.status === "LOW_STOCK").length,
      totalOutOfStock: data.filter((p) => p.status === "OUT_OF_STOCK").length,
      totalDeficitUnits: data.reduce((sum, p) => sum + Math.max(0, p.deficit), 0),
      estimatedReorderTotal: data.reduce(
        (sum, p) => sum + Math.max(0, p.estimatedReorderCost),
        0
      ),
    };

    if (format === "csv") {
      const headers = [
        "SKU",
        "Name",
        "Category",
        "Current Stock",
        "Reorder Point",
        "Deficit",
        "Status",
        "Est. Reorder Cost",
      ];
      const rows = data.map((p) => [
        p.sku,
        `"${p.name}"`,
        p.category,
        p.currentStock,
        p.reorderPoint,
        p.deficit,
        p.status,
        p.estimatedReorderCost.toFixed(2),
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=low-stock-alert.csv",
        },
      });
    }

    return NextResponse.json({ data, totals });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
