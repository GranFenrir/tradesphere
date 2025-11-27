'use server'

import { prisma, Prisma, LocationType, MovementType } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData): Promise<{ error?: string }> {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const category = formData.get("category") as string;
  const price = parseFloat(formData.get("price") as string);
  const cost = parseFloat(formData.get("cost") as string);
  const currentStock = parseInt(formData.get("currentStock") as string);
  const reorderPoint = parseInt(formData.get("reorderPoint") as string);
  const maxStock = parseInt(formData.get("maxStock") as string);

  try {
    await prisma.product.create({
      data: {
        name,
        sku,
        category,
        price,
        cost,
        currentStock,
        reorderPoint,
        maxStock,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: `A product with SKU "${sku}" already exists. Please use a unique SKU.` };
      }
    }
    return { error: "Failed to create product. Please try again." };
  }

  revalidatePath("/");
  redirect("/");
}

export async function deleteProduct(sku: string) {
  await prisma.product.delete({
    where: { sku },
  });

  revalidatePath("/");
}

export async function adjustStock(sku: string, adjustment: number) {
  const product = await prisma.product.findUnique({ where: { sku } });
  if (!product) return;

  const newStock = Math.max(0, product.currentStock + adjustment);
  
  await prisma.product.update({
    where: { sku },
    data: { currentStock: newStock },
  });

  revalidatePath("/");
}

export async function updateProduct(formData: FormData) {
  const sku = formData.get("sku") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const price = parseFloat(formData.get("price") as string);
  const cost = parseFloat(formData.get("cost") as string);
  const currentStock = parseInt(formData.get("currentStock") as string);
  const reorderPoint = parseInt(formData.get("reorderPoint") as string);
  const maxStock = parseInt(formData.get("maxStock") as string);

  await prisma.product.update({
    where: { sku },
    data: {
      name,
      category,
      price,
      cost,
      currentStock,
      reorderPoint,
      maxStock,
    },
  });

  revalidatePath("/");
  redirect("/");
}

// ============================================
// WAREHOUSE ACTIONS
// ============================================

export async function createWarehouse(formData: FormData): Promise<{ error?: string }> {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const address = formData.get("address") as string | null;
  const description = formData.get("description") as string | null;

  try {
    await prisma.warehouse.create({
      data: {
        name,
        code,
        address: address || null,
        description: description || null,
        isActive: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: `A warehouse with code "${code}" already exists.` };
      }
    }
    return { error: "Failed to create warehouse. Please try again." };
  }

  revalidatePath("/warehouses");
  redirect("/warehouses");
}

export async function updateWarehouse(formData: FormData): Promise<{ error?: string }> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const address = formData.get("address") as string | null;
  const description = formData.get("description") as string | null;
  const isActive = formData.get("isActive") === "true";

  try {
    await prisma.warehouse.update({
      where: { id },
      data: {
        name,
        address: address || null,
        description: description || null,
        isActive,
      },
    });
  } catch (error) {
    return { error: "Failed to update warehouse. Please try again." };
  }

  revalidatePath("/warehouses");
  revalidatePath(`/warehouses/${id}`);
  redirect("/warehouses");
}

export async function deleteWarehouse(id: string): Promise<{ error?: string } | undefined> {
  try {
    // Check if warehouse has any stock items
    const stockCount = await prisma.stockItem.count({
      where: { location: { warehouseId: id } },
    });

    if (stockCount > 0) {
      return { error: "Cannot delete warehouse with existing stock. Move or remove stock first." };
    }

    await prisma.warehouse.delete({ where: { id } });
  } catch (error) {
    return { error: "Failed to delete warehouse." };
  }

  revalidatePath("/warehouses");
  return undefined;
}

// ============================================
// LOCATION ACTIONS
// ============================================

export async function createLocation(formData: FormData): Promise<{ error?: string }> {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const type = formData.get("type") as LocationType;
  const warehouseId = formData.get("warehouseId") as string;
  const parentId = formData.get("parentId") as string | null;
  const capacityStr = formData.get("capacity") as string | null;
  const capacity = capacityStr ? parseInt(capacityStr) : null;

  try {
    await prisma.location.create({
      data: {
        name,
        code,
        type,
        warehouseId,
        parentId: parentId || null,
        capacity,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: `A location with code "${code}" already exists in this warehouse.` };
      }
    }
    return { error: "Failed to create location. Please try again." };
  }

  revalidatePath("/locations");
  revalidatePath(`/warehouses/${warehouseId}`);
  redirect("/locations");
}

export async function deleteLocation(id: string): Promise<{ error?: string } | undefined> {
  try {
    // Check if location has stock
    const stockCount = await prisma.stockItem.count({
      where: { locationId: id },
    });

    if (stockCount > 0) {
      return { error: "Cannot delete location with existing stock." };
    }

    // Check if location has children
    const childCount = await prisma.location.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      return { error: "Cannot delete location with child locations. Delete children first." };
    }

    await prisma.location.delete({ where: { id } });
  } catch (error) {
    return { error: "Failed to delete location." };
  }

  revalidatePath("/locations");
  revalidatePath("/warehouses");
  return undefined;
}

// ============================================
// STOCK MOVEMENT ACTIONS
// ============================================

export async function createMovement(formData: FormData): Promise<{ error?: string }> {
  const type = formData.get("type") as MovementType;
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const fromLocationId = formData.get("fromLocationId") as string | null;
  const toLocationId = formData.get("toLocationId") as string | null;
  const reference = formData.get("reference") as string | null;
  const notes = formData.get("notes") as string | null;

  // Validation
  if (quantity <= 0) {
    return { error: "Quantity must be greater than 0." };
  }

  if (type === MovementType.IN && !toLocationId) {
    return { error: "IN movement requires a destination location." };
  }

  if (type === MovementType.OUT && !fromLocationId) {
    return { error: "OUT movement requires a source location." };
  }

  if (type === MovementType.TRANSFER) {
    if (!fromLocationId || !toLocationId) {
      return { error: "TRANSFER requires both source and destination locations." };
    }
    if (fromLocationId === toLocationId) {
      return { error: "Source and destination cannot be the same." };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // For OUT and TRANSFER: Check and decrease stock at source
      if ((type === MovementType.OUT || type === MovementType.TRANSFER) && fromLocationId) {
        const sourceStock = await tx.stockItem.findUnique({
          where: { productId_locationId: { productId, locationId: fromLocationId } },
        });

        if (!sourceStock || sourceStock.quantity < quantity) {
          throw new Error(`Insufficient stock. Available: ${sourceStock?.quantity || 0}`);
        }

        await tx.stockItem.update({
          where: { productId_locationId: { productId, locationId: fromLocationId } },
          data: { quantity: { decrement: quantity } },
        });
      }

      // For IN and TRANSFER: Increase stock at destination
      if ((type === MovementType.IN || type === MovementType.TRANSFER) && toLocationId) {
        await tx.stockItem.upsert({
          where: { productId_locationId: { productId, locationId: toLocationId } },
          update: { quantity: { increment: quantity } },
          create: { productId, locationId: toLocationId, quantity },
        });
      }

      // Update product's total currentStock
      const allStockItems = await tx.stockItem.findMany({
        where: { productId },
      });
      const totalStock = allStockItems.reduce((sum, item) => sum + item.quantity, 0);

      await tx.product.update({
        where: { id: productId },
        data: { currentStock: totalStock },
      });

      // Record the movement
      await tx.stockMovement.create({
        data: {
          type,
          quantity,
          productId,
          fromLocationId: fromLocationId || null,
          toLocationId: toLocationId || null,
          reference: reference || null,
          notes: notes || null,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to process stock movement." };
  }

  revalidatePath("/stock");
  revalidatePath("/stock/movements");
  revalidatePath("/");
  redirect("/stock/movements");
}
