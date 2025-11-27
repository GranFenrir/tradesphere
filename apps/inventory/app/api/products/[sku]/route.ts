import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sku: string }> }
) {
  const { sku } = await params;
  
  const product = await prisma.product.findUnique({
    where: { sku },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Convert Decimal to number for JSON serialization
  return NextResponse.json({
    ...product,
    price: Number(product.price),
    cost: Number(product.cost),
  });
}
