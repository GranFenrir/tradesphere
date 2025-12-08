"use client"

import { DataTable } from "@repo/ui/data-table"
import { getColumns, type Product, type ProductPermissions } from "./columns"

interface ProductTableProps {
  products: Product[]
  permissions: ProductPermissions
}

export function ProductTable({ products, permissions }: ProductTableProps) {
  const columns = getColumns(permissions)
  return <DataTable columns={columns} data={products} />
}
