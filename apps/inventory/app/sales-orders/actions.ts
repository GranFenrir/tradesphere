"use server";

import { prisma, OrderStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSalesOrder(formData: FormData) {
  const customerId = formData.get("customerId") as string;
  const shippingAddress = formData.get("shippingAddress") as string | null;
  const notes = formData.get("notes") as string | null;

  // Generate order number
  const count = await prisma.salesOrder.count();
  const orderNumber = `SO-${String(count + 1).padStart(5, "0")}`;

  const salesOrder = await prisma.salesOrder.create({
    data: {
      orderNumber,
      customerId,
      status: OrderStatus.DRAFT,
      shippingAddress: shippingAddress || null,
      notes: notes || null,
    },
  });

  revalidatePath("/sales-orders");
  redirect(`/sales-orders/${salesOrder.id}`);
}

export async function updateSalesOrderStatus(id: string, status: string) {
  const updateData: Record<string, unknown> = { status };

  // Set shipped/delivered dates based on status
  if (status === OrderStatus.SHIPPED) {
    updateData.shippedDate = new Date();
  } else if (status === OrderStatus.DELIVERED) {
    updateData.deliveredDate = new Date();
  }

  await prisma.salesOrder.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/sales-orders");
  revalidatePath(`/sales-orders/${id}`);
}

export async function addSalesOrderItem(
  salesOrderId: string,
  formData: FormData
) {
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const unitPrice = parseFloat(formData.get("unitPrice") as string);

  // Check if product already exists in order
  const existing = await prisma.salesOrderItem.findFirst({
    where: { salesOrderId, productId },
  });

  if (existing) {
    // Update quantity instead of adding new line
    await prisma.salesOrderItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + quantity,
        unitPrice,
      },
    });
  } else {
    await prisma.salesOrderItem.create({
      data: {
        salesOrderId,
        productId,
        quantity,
        unitPrice,
      },
    });
  }

  // Recalculate order total
  await recalculateSalesOrderTotal(salesOrderId);

  revalidatePath(`/sales-orders/${salesOrderId}`);
}

export async function removeSalesOrderItem(
  itemId: string,
  salesOrderId: string
) {
  await prisma.salesOrderItem.delete({
    where: { id: itemId },
  });

  await recalculateSalesOrderTotal(salesOrderId);
  revalidatePath(`/sales-orders/${salesOrderId}`);
}

export async function shipSalesOrder(
  salesOrderId: string,
  warehouseId: string
) {
  const salesOrder = await prisma.salesOrder.findUnique({
    where: { id: salesOrderId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!salesOrder) {
    throw new Error("Sales order not found");
  }

  // Get the first location in the warehouse
  const sourceLocation = await prisma.location.findFirst({
    where: { warehouseId },
    orderBy: { code: "asc" },
  });

  if (!sourceLocation) {
    throw new Error("No location found in the selected warehouse");
  }

  // Process each item - reduce stock
  for (const item of salesOrder.items) {
    // Find stock at this location
    const stockItem = await prisma.stockItem.findFirst({
      where: {
        productId: item.productId,
        locationId: sourceLocation.id,
      },
    });

    if (!stockItem || stockItem.quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for ${item.product.name}. Available: ${stockItem?.quantity || 0}, Required: ${item.quantity}`
      );
    }

    // Reduce stock
    await prisma.stockItem.update({
      where: { id: stockItem.id },
      data: { quantity: stockItem.quantity - item.quantity },
    });

    // Update product's current stock
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        currentStock: { decrement: item.quantity },
      },
    });

    // Create stock movement record
    await prisma.stockMovement.create({
      data: {
        productId: item.productId,
        type: "OUT",
        quantity: item.quantity,
        fromLocationId: sourceLocation.id,
        toLocationId: null,
        reference: salesOrder.orderNumber,
        notes: `Shipped for SO ${salesOrder.orderNumber}`,
      },
    });
  }

  // Update SO status
  await prisma.salesOrder.update({
    where: { id: salesOrderId },
    data: {
      status: OrderStatus.SHIPPED,
      shippedDate: new Date(),
    },
  });

  revalidatePath("/sales-orders");
  revalidatePath(`/sales-orders/${salesOrderId}`);
  revalidatePath("/stock");
  revalidatePath("/");
}

export async function deleteSalesOrder(id: string) {
  // Only allow deletion of draft orders
  const so = await prisma.salesOrder.findUnique({
    where: { id },
  });

  if (!so) {
    throw new Error("Sales order not found");
  }

  if (so.status !== OrderStatus.DRAFT) {
    throw new Error("Only draft orders can be deleted");
  }

  // Delete items first
  await prisma.salesOrderItem.deleteMany({
    where: { salesOrderId: id },
  });

  await prisma.salesOrder.delete({
    where: { id },
  });

  revalidatePath("/sales-orders");
  redirect("/sales-orders");
}

async function recalculateSalesOrderTotal(salesOrderId: string) {
  const items = await prisma.salesOrderItem.findMany({
    where: { salesOrderId },
  });

  const total = items.reduce(
    (sum: number, item) => sum + item.quantity * Number(item.unitPrice),
    0
  );

  await prisma.salesOrder.update({
    where: { id: salesOrderId },
    data: { total },
  });
}
