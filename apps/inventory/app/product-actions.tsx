"use client"

import { Button } from "@repo/ui/button"
import { Trash2, Edit, Plus, Minus } from "lucide-react"
import { deleteProduct, adjustStock } from "./actions"
import { useTransition } from "react"
import Link from "next/link"

interface ProductActionsProps {
  sku: string
}

export function ProductActions({ sku }: ProductActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      startTransition(() => {
        deleteProduct(sku)
      })
    }
  }

  const handleAdjust = (amount: number) => {
    startTransition(() => {
      adjustStock(sku, amount)
    })
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleAdjust(-1)}
        disabled={isPending}
        className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
        title="Decrease stock"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleAdjust(1)}
        disabled={isPending}
        className="h-8 w-8 text-muted-foreground hover:text-green-400 hover:bg-green-400/10"
        title="Increase stock"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Link href={`/products/${sku}/edit`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
          title="Edit product"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isPending}
        className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
        title="Delete product"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
