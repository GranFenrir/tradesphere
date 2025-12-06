"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSupplier(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const address = formData.get("address") as string | null;
  const leadTimeDays = formData.get("leadTimeDays");
  const paymentTerms = formData.get("paymentTerms") as string | null;
  const notes = formData.get("notes") as string | null;

  const supplier = await prisma.supplier.create({
    data: {
      name,
      code,
      email: email || null,
      phone: phone || null,
      address: address || null,
      leadTimeDays: leadTimeDays ? parseInt(leadTimeDays as string) : null,
      paymentTerms: paymentTerms || null,
      notes: notes || null,
      isActive: true,
    },
  });

  revalidatePath("/suppliers");
  redirect(`/suppliers/${supplier.id}`);
}

export async function updateSupplier(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const address = formData.get("address") as string | null;
  const leadTimeDays = formData.get("leadTimeDays");
  const paymentTerms = formData.get("paymentTerms") as string | null;
  const notes = formData.get("notes") as string | null;
  const isActive = formData.get("isActive") === "true";

  await prisma.supplier.update({
    where: { id },
    data: {
      name,
      code,
      email: email || null,
      phone: phone || null,
      address: address || null,
      leadTimeDays: leadTimeDays ? parseInt(leadTimeDays as string) : null,
      paymentTerms: paymentTerms || null,
      notes: notes || null,
      isActive,
    },
  });

  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${id}`);
  redirect(`/suppliers/${id}`);
}

export async function deleteSupplier(id: string) {
  await prisma.supplier.delete({
    where: { id },
  });

  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function addSupplierProduct(
  supplierId: string,
  productId: string,
  formData: FormData
) {
  const supplierSku = formData.get("supplierSku") as string | null;
  const cost = formData.get("cost") as string;
  const minOrderQty = formData.get("minOrderQty");
  const leadTimeDays = formData.get("leadTimeDays");

  await prisma.supplierProduct.create({
    data: {
      supplierId,
      productId,
      supplierSku: supplierSku || null,
      unitCost: parseFloat(cost),
      minOrderQty: minOrderQty ? parseInt(minOrderQty as string) : 1,
      leadTimeDays: leadTimeDays ? parseInt(leadTimeDays as string) : undefined,
    },
  });

  revalidatePath(`/suppliers/${supplierId}`);
}

export async function removeSupplierProduct(supplierId: string, productId: string) {
  await prisma.supplierProduct.deleteMany({
    where: {
      supplierId,
      productId,
    },
  });

  revalidatePath(`/suppliers/${supplierId}`);
}
