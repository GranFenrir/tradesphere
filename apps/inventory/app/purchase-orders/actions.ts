"use server";

import { prisma, POStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPurchaseOrder(formData: FormData) {
  const supplierId = formData.get("supplierId") as string;
  const expectedDate = formData.get("expectedDate") as string | null;
  const notes = formData.get("notes") as string | null;

  // Generate order number
  const count = await prisma.purchaseOrder.count();
  const orderNumber = `PO-${String(count + 1).padStart(5, "0")}`;

  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      orderNumber,
      supplierId,
      status: POStatus.DRAFT,
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      notes: notes || null,
    },
  });

  revalidatePath("/purchase-orders");
  redirect(`/purchase-orders/${purchaseOrder.id}`);
}

export async function updatePurchaseOrderStatus(id: string, status: string) {
  const updateData: Record<string, unknown> = { status };

  // Set received date when status changes to RECEIVED
  if (status === POStatus.RECEIVED) {
    updateData.receivedDate = new Date();
  }

  await prisma.purchaseOrder.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/purchase-orders");
  revalidatePath(`/purchase-orders/${id}`);
}

export async function addPurchaseOrderItem(
  purchaseOrderId: string,
  formData: FormData
) {
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const unitCost = parseFloat(formData.get("unitCost") as string);

  // Check if product already exists in order
  const existing = await prisma.purchaseOrderItem.findFirst({
    where: { purchaseOrderId, productId },
  });

  if (existing) {
    // Update quantity instead of adding new line
    await prisma.purchaseOrderItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + quantity,
        unitCost,
      },
    });
  } else {
    await prisma.purchaseOrderItem.create({
      data: {
        purchaseOrderId,
        productId,
        quantity,
        unitCost,
      },
    });
  }

  // Recalculate order total
  await recalculateOrderTotal(purchaseOrderId);

  revalidatePath(`/purchase-orders/${purchaseOrderId}`);
}

export async function updatePurchaseOrderItem(
  itemId: string,
  purchaseOrderId: string,
  formData: FormData
) {
  const quantity = parseInt(formData.get("quantity") as string);
  const unitCost = parseFloat(formData.get("unitCost") as string);
  const receivedQty = parseInt(formData.get("receivedQty") as string) || 0;

  await prisma.purchaseOrderItem.update({
    where: { id: itemId },
    data: {
      quantity,
      unitCost,
      receivedQty,
    },
  });

  await recalculateOrderTotal(purchaseOrderId);
  revalidatePath(`/purchase-orders/${purchaseOrderId}`);
}

export async function removePurchaseOrderItem(
  itemId: string,
  purchaseOrderId: string
) {
  await prisma.purchaseOrderItem.delete({
    where: { id: itemId },
  });

  await recalculateOrderTotal(purchaseOrderId);
  revalidatePath(`/purchase-orders/${purchaseOrderId}`);
}

export async function receivePurchaseOrder(
  purchaseOrderId: string,
  warehouseId: string
) {
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!purchaseOrder) {
    throw new Error("Purchase order not found");
  }

  // Get the first location in the warehouse as default
  const defaultLocation = await prisma.location.findFirst({
    where: { warehouseId },
    orderBy: { code: "asc" },
  });

  if (!defaultLocation) {
    throw new Error("No location found in the selected warehouse");
  }

  // Process each item
  for (const item of purchaseOrder.items) {
    const qtyToReceive = item.quantity - item.receivedQty;
    
    if (qtyToReceive <= 0) continue;

    // Check if stock item exists at this location
    let stockItem = await prisma.stockItem.findFirst({
      where: {
        productId: item.productId,
        locationId: defaultLocation.id,
      },
    });

    if (stockItem) {
      // Update existing stock
      await prisma.stockItem.update({
        where: { id: stockItem.id },
        data: { quantity: stockItem.quantity + qtyToReceive },
      });
    } else {
      // Create new stock item
      stockItem = await prisma.stockItem.create({
        data: {
          productId: item.productId,
          locationId: defaultLocation.id,
          quantity: qtyToReceive,
        },
      });
    }

    // Update product's current stock
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        currentStock: { increment: qtyToReceive },
      },
    });

    // Create stock movement record
    await prisma.stockMovement.create({
      data: {
        productId: item.productId,
        type: "IN",
        quantity: qtyToReceive,
        fromLocationId: null,
        toLocationId: defaultLocation.id,
        reference: purchaseOrder.orderNumber,
        notes: `Received from PO ${purchaseOrder.orderNumber}`,
      },
    });

    // Update PO item received quantity
    await prisma.purchaseOrderItem.update({
      where: { id: item.id },
      data: { receivedQty: item.quantity },
    });
  }

  // Update PO status
  await prisma.purchaseOrder.update({
    where: { id: purchaseOrderId },
    data: {
      status: POStatus.RECEIVED,
      receivedDate: new Date(),
    },
  });

  revalidatePath("/purchase-orders");
  revalidatePath(`/purchase-orders/${purchaseOrderId}`);
  revalidatePath("/stock");
  revalidatePath("/");
}

export async function deletePurchaseOrder(id: string) {
  // Only allow deletion of draft orders
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
  });

  if (!po) {
    throw new Error("Purchase order not found");
  }

  if (po.status !== POStatus.DRAFT) {
    throw new Error("Only draft orders can be deleted");
  }

  // Delete items first
  await prisma.purchaseOrderItem.deleteMany({
    where: { purchaseOrderId: id },
  });

  await prisma.purchaseOrder.delete({
    where: { id },
  });

  revalidatePath("/purchase-orders");
  redirect("/purchase-orders");
}

async function recalculateOrderTotal(purchaseOrderId: string) {
  const items = await prisma.purchaseOrderItem.findMany({
    where: { purchaseOrderId },
  });

  const total = items.reduce(
    (sum: number, item) => sum + item.quantity * Number(item.unitCost),
    0
  );

  await prisma.purchaseOrder.update({
    where: { id: purchaseOrderId },
    data: { total },
  });
}
