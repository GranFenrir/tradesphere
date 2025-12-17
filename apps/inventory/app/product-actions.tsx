"use client"

import { Button } from "@repo/ui/button"
import { Trash2, Edit, Plus, Minus } from "lucide-react"
import { deleteProduct, adjustStock } from "./actions"
import { useTransition, useState } from "react"
import Link from "next/link"

interface ProductActionsProps {
  sku: string
  canEdit?: boolean
  canDelete?: boolean
  canAdjustStock?: boolean
}

export function ProductActions({ sku, canEdit = true, canDelete = true, canAdjustStock = true }: ProductActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      startTransition(async () => {
        const result = await deleteProduct(sku)
        if (result?.error) {
          setError(result.error)
          alert(result.error)
        }
      })
    }
  }

  const handleAdjust = async (amount: number) => {
    startTransition(async () => {
      const result = await adjustStock(sku, amount)
      if (result?.error) {
        setError(result.error)
        alert(result.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      {canAdjustStock && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAdjust(-1)}
            disabled={isPending}
            className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
            title="Stok azalt"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAdjust(1)}
            disabled={isPending}
            className="h-8 w-8 text-muted-foreground hover:text-green-400 hover:bg-green-400/10"
            title="Stok artır"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </>
      )}
      {canEdit && (
        <Link href={`/products/${sku}/edit`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Ürünü düzenle"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isPending}
          className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
          title="Ürünü sil"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
