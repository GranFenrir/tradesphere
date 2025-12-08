"use server";

import { prisma, QualityStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBatch(formData: FormData) {
  const productId = formData.get("productId") as string;
  const batchNumber = formData.get("batchNumber") as string;
  const initialQty = parseInt(formData.get("initialQty") as string);
  const manufactureDate = formData.get("manufactureDate") as string | null;
  const expiryDate = formData.get("expiryDate") as string | null;
  const locationId = formData.get("locationId") as string | null;
  const supplierId = formData.get("supplierId") as string | null;
  const notes = formData.get("notes") as string | null;

  const batch = await prisma.batch.create({
    data: {
      batchNumber,
      productId,
      initialQty,
      currentQty: initialQty,
      manufactureDate: manufactureDate ? new Date(manufactureDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      locationId: locationId || null,
      supplierId: supplierId || null,
      qualityStatus: QualityStatus.PENDING,
      notes: notes || null,
    },
  });

  revalidatePath("/batches");
  redirect(`/batches/${batch.id}`);
}

export async function updateBatchQualityStatus(id: string, status: string, notes?: string) {
  await prisma.batch.update({
    where: { id },
    data: {
      qualityStatus: status,
      qualityNotes: notes || undefined,
    },
  });

  revalidatePath("/batches");
  revalidatePath(`/batches/${id}`);
}

export async function adjustBatchQuantity(
  batchId: string,
  adjustment: number,
  type: string,
  notes?: string
) {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
  });

  if (!batch) throw new Error("Batch not found");

  const newQty = batch.currentQty + adjustment;
  if (newQty < 0) throw new Error("Cannot reduce below 0");

  await prisma.$transaction([
    prisma.batch.update({
      where: { id: batchId },
      data: { currentQty: newQty },
    }),
    prisma.batchMovement.create({
      data: {
        batchId,
        type,
        quantity: Math.abs(adjustment),
        notes: notes || null,
      },
    }),
  ]);

  revalidatePath(`/batches/${batchId}`);
}

export async function deleteBatch(id: string) {
  await prisma.batch.delete({
    where: { id },
  });

  revalidatePath("/batches");
  redirect("/batches");
}

// Serial Number Actions
export async function createSerialNumber(formData: FormData) {
  const productId = formData.get("productId") as string;
  const serialNumber = formData.get("serialNumber") as string;
  const batchId = formData.get("batchId") as string | null;
  const locationId = formData.get("locationId") as string | null;
  const warrantyExpiry = formData.get("warrantyExpiry") as string | null;
  const notes = formData.get("notes") as string | null;

  await prisma.serialNumber.create({
    data: {
      serialNumber,
      productId,
      batchId: batchId || null,
      locationId: locationId || null,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      notes: notes || null,
    },
  });

  revalidatePath("/batches/serial-numbers");
}

export async function updateSerialNumberStatus(id: string, status: string) {
  await prisma.serialNumber.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/batches/serial-numbers");
}

export async function markSerialAsSold(
  serialId: string,
  customerId: string,
  salesOrderId?: string
) {
  await prisma.serialNumber.update({
    where: { id: serialId },
    data: {
      status: "SOLD",
      soldToCustomerId: customerId,
      salesOrderId: salesOrderId || null,
      soldDate: new Date(),
    },
  });

  revalidatePath("/batches/serial-numbers");
}
