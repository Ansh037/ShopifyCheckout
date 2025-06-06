export interface Product {
  id: string
  title: string
  handle: string
  description: string
  images: Array<{
    url: string
    altText?: string
  }>
  variants: Array<{
    id: string
    title: string
    price: string
    available: boolean
  }>
}

export interface CartLineItem {
  variantId: string
  quantity: number
}

export interface CheckoutSession {
  id: string
  webUrl: string
  totalPrice: {
    amount: string
  }
}