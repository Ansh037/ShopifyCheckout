import { formatPriceCompact } from "@/lib/currency"
import { CheckCircle } from "lucide-react"

interface AddToCartToastProps {
  product: {
    title: string
    image?: {
      url: string
      altText?: string
    }
    price: string
  }
}

export function AddToCartToast({ product }: AddToCartToastProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <CheckCircle className="h-5 w-5 text-green-500" />
      </div>

      <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={
            product.image?.url ||
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=48&h=48&fit=crop&crop=center"
          }
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">Added to cart!</p>
        <p className="text-sm text-gray-500 truncate">
          {product.title} • {formatPriceCompact(product.price)}
        </p>
      </div>
    </div>
  )
}