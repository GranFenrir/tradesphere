import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "json";

  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    const data = products.map((product) => ({
      sku: product.sku,
      name: product.name,
      category: product.category,
      currentStock: product.currentStock,
      cost: Number(product.cost),
      price: Number(product.price),
      costValue: product.currentStock * Number(product.cost),
      retailValue: product.currentStock * Number(product.price),
      potentialProfit:
        product.currentStock * (Number(product.price) - Number(product.cost)),
    }));

    const totals = {
      totalProducts: data.length,
      totalUnits: data.reduce((sum, p) => sum + p.currentStock, 0),
      totalCostValue: data.reduce((sum, p) => sum + p.costValue, 0),
      totalRetailValue: data.reduce((sum, p) => sum + p.retailValue, 0),
      totalPotentialProfit: data.reduce((sum, p) => sum + p.potentialProfit, 0),
    };

    if (format === "csv") {
      const headers = [
        "SKU",
        "Name",
        "Category",
        "Stock",
        "Unit Cost",
        "Unit Price",
        "Cost Value",
        "Retail Value",
        "Potential Profit",
      ];
      const rows = data.map((p) => [
        p.sku,
        `"${p.name}"`,
        p.category,
        p.currentStock,
        p.cost.toFixed(2),
        p.price.toFixed(2),
        p.costValue.toFixed(2),
        p.retailValue.toFixed(2),
        p.potentialProfit.toFixed(2),
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=inventory-valuation.csv",
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
