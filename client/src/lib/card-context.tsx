import { formatPriceCompact } from "@/lib/currency"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import { createCheckoutSession } from "./shopify"

export interface CartItem {
  variantId: string
  quantity: number
  product: {
    id: string
    title: string
    handle: string
    image?: {
      url: string
      altText?: string
    }
    price: string
  }
}

interface CartState {
  cart: CartItem[]
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "UPDATE_QUANTITY"; payload: { variantId: string; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: { variantId: string } }
  | { type: "CLEAR_CART" }

interface CartContextType extends CartState {
  addToCart: (item: CartItem) => void
  updateQuantity: (variantId: string, quantity: number) => void
  removeFromCart: (variantId: string) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getFormattedTotalPrice: () => string
  createCheckout: () => Promise<string | null>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.cart.find((item) => item.variantId === action.payload.variantId)

      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.variantId === action.payload.variantId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item,
          ),
        }
      }

      return {
        ...state,
        cart: [...state.cart, action.payload],
      }
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity === 0) {
        return {
          ...state,
          cart: state.cart.filter((item) => item.variantId !== action.payload.variantId),
        }
      }

      return {
        ...state,
        cart: state.cart.map((item) =>
          item.variantId === action.payload.variantId ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }
    }

    case "REMOVE_FROM_CART": {
      return {
        ...state,
        cart: state.cart.filter((item) => item.variantId !== action.payload.variantId),
      }
    }

    case "CLEAR_CART": {
      return {
        ...state,
        cart: [],
      }
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { cart: [] })

  const addToCart = (item: CartItem) => {
    dispatch({ type: "ADD_TO_CART", payload: item })
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { variantId, quantity } })
  }

  const removeFromCart = (variantId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { variantId } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const getTotalItems = () => {
    return state.cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    const total = state.cart.reduce((total, item) => {
      return total + Number.parseFloat(item.product.price) * item.quantity
    }, 0)
    return total
  }

  const getFormattedTotalPrice = () => {
    return formatPriceCompact(getTotalPrice())
  }

  const createCheckout = async (): Promise<string | null> => {
    try {
      const lineItems = state.cart.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }))

      const checkoutUrl = await createCheckoutSession(lineItems)
      return checkoutUrl
    } catch (error) {
      console.error("Error creating checkout:", error)
      return null
    }
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getFormattedTotalPrice,
        createCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
