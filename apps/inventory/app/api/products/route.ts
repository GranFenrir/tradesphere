import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
    },
  });

  return NextResponse.json(products);
}
