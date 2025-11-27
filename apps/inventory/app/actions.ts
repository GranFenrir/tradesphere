'use server'

import { prisma } from "@repo/database";
import { Prisma } from "@repo/database";
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
