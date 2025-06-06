import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Trash2, Shield, Truck, RotateCcw } from "lucide-react"
import { formatPriceCompact } from "@/lib/currency"

export default function CheckoutSummary() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    getFormattedTotalPrice,
  } = useCart()

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + tax

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-900">Order Summary</h4>
        <span className="text-sm text-gray-500">{getTotalItems()} items</span>
      </div>

      {/* Product List */}
      <div className="space-y-4 mb-6">
        {cart.map((item) => (
          <div
            key={`${item.variantId}-${item.product.id}`}
            className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200"
          >
            <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={
                  item.product.image?.url ||
                  `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=64&h=64&fit=crop&crop=center`
                }
                alt={item.product.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-gray-900 truncate">{item.product.title}</h5>
              <p className="text-sm text-gray-500">Premium Quality</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                  onClick={() => updateQuantity(item.variantId, Math.max(0, item.quantity - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-medium text-sm w-8 text-center">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatPriceCompact(parseFloat(item.product.price) * item.quantity)}
                </div>
                {item.quantity > 1 && (
                  <div className="text-xs text-gray-500">{formatPriceCompact(item.product.price)} each</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Totals */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({getTotalItems()} items)</span>
            <span>{formatPriceCompact(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (GST 18%)</span>
            <span>{formatPriceCompact(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{formatPriceCompact(total)}</span>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Shield className="h-3 w-3 text-green-600" />
          <span>SSL Secure</span>
        </div>
        <div className="flex items-center space-x-1">
          <RotateCcw className="h-3 w-3 text-blue-600" />
          <span>30-Day Returns</span>
        </div>
        <div className="flex items-center space-x-1">
          <Truck className="h-3 w-3 text-purple-600" />
          <span>Free Shipping</span>
        </div>
      </div>
    </div>
  )
}
