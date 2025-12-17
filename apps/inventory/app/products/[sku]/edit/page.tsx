"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@repo/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { updateProduct } from "../../../actions"

interface ProductData {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  price: number
  cost: number
  reorderPoint: number
  maxStock: number
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const sku = params.sku as string
  
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<ProductData | null>(null)
  
  // Fetch product data on mount
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/inventory/api/products/${sku}`)
        if (!response.ok) {
          throw new Error("Product not found")
        }
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [sku])

  async function handleSubmit(formData: FormData) {
    if (!product) return
    
    // Add sku to formData for the server action
    formData.set("sku", product.sku)
    
    startTransition(async () => {
      try {
        await updateProduct(formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update product")
      }
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Ürün yükleniyor...</div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen p-8 flex flex-col items-center justify-center gap-4">
        <div className="text-red-400">{error || "Ürün bulunamadı"}</div>
        <Button variant="outline" onClick={() => router.push("/")}>
          Envantere Dön
        </Button>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Ürün Düzenle: {product.sku}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm text-muted-foreground">
                    Ürün Adı
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={product.name}
                    required
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sku" className="text-sm text-muted-foreground">
                    SKU (değiştirilemez)
                  </label>
                  <input
                    type="text"
                    id="sku"
                    value={product.sku}
                    disabled
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm text-muted-foreground">
                    Kategori
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    defaultValue={product.category}
                    required
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="currentStock" className="text-sm text-muted-foreground">
                    Mevcut Stok
                  </label>
                  <input
                    type="number"
                    id="currentStock"
                    name="currentStock"
                    defaultValue={product.currentStock}
                    min="0"
                    required
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm text-muted-foreground">
                    Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    defaultValue={product.price}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cost" className="text-sm text-muted-foreground">
                    Maliyet (₺)
                  </label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    defaultValue={product.cost}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="reorderPoint" className="text-sm text-muted-foreground">
                    Yeniden Sipariş Noktası (Güvenlik Stoku)
                  </label>
                  <input
                    type="number"
                    id="reorderPoint"
                    name="reorderPoint"
                    defaultValue={product.reorderPoint}
                    min="0"
                    required
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="maxStock" className="text-sm text-muted-foreground">
                    Maksimum Stok (Likidite Sınırı)
                  </label>
                  <input
                    type="number"
                    id="maxStock"
                    name="maxStock"
                    defaultValue={product.maxStock}
                    min="1"
                    required
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={isPending}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
