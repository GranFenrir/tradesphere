import { prisma } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const warehouseId = searchParams.get("warehouseId");

  const locations = await prisma.location.findMany({
    where: warehouseId ? { warehouseId } : undefined,
    orderBy: { code: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
      type: true,
      warehouseId: true,
    },
  });

  return NextResponse.json(locations);
}
