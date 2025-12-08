"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@repo/ui/button"
import { ProductActions } from "./product-actions"

export type Product = {
  id: string
  name: string
  category: string
  stock: number
  price: number
  status: string
  statusColor: string
}

export interface ProductPermissions {
  canEdit: boolean
  canDelete: boolean
  canAdjustStock: boolean
}

export function getColumns(permissions: ProductPermissions): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "id",
      header: "SKU",
      cell: ({ row }) => <div className="font-medium text-foreground">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent hover:text-foreground p-0"
          >
            Product Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "stock",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent hover:text-foreground p-0"
          >
            Stock
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
   
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const color = row.original.statusColor
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${color} bg-muted/50 border border-border`}>
            {status}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <ProductActions 
            sku={row.original.id}
            canEdit={permissions.canEdit}
            canDelete={permissions.canDelete}
            canAdjustStock={permissions.canAdjustStock}
          />
        )
      },
    },
  ]
}

// Default columns for backwards compatibility
export const columns: ColumnDef<Product>[] = getColumns({
  canEdit: true,
  canDelete: true,
  canAdjustStock: true,
})
