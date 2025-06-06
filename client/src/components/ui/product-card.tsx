import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPriceCompact } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"
import { AddToCartToast } from "./add-to-cart-toast"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        product: {
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.images[0],
          price: selectedVariant.price,
        },
      })

      // Show success toast with product image
      toast({
        title: "",
        description: (
          <AddToCartToast
            product={{
              title: product.title,
              image: product.images[0],
              price: selectedVariant.price,
            }}
          />
        ),
        duration: 4000,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={
            product.images[0]?.url ||
            `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center`
          }
          alt={product.images[0]?.altText || product.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!selectedVariant.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="secondary" className="text-white bg-red-600">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{product.title}</h3>

        <div className="text-sm text-gray-600 mb-3 line-clamp-3">{product.description}</div>

        {product.variants.length > 1 && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Variant:</label>
            <select
              value={selectedVariant.id}
              onChange={(e) => {
                const variant = product.variants.find((v) => v.id === e.target.value)
                if (variant) setSelectedVariant(variant)
              }}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.title} - {formatPriceCompact(variant.price)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-gray-900">{formatPriceCompact(selectedVariant.price)}</div>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>4.8 (124)</span>
          </div>
        </div>

        <Button onClick={handleAddToCart} disabled={!selectedVariant.available || isAdding} className="w-full">
          {isAdding ? "Adding..." : selectedVariant.available ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  )
}
