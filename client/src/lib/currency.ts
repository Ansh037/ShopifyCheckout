export function formatPrice(price: string | number): string {
  const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericPrice)
}

/**
 * Convert USD to INR (approximate conversion)
 * Note: In production, use a real-time currency API
 */
export function convertUsdToInr(usdPrice: string | number): number {
  const USD_TO_INR_RATE = 83.12 // Approximate rate, update as needed
  const numericPrice = typeof usdPrice === "string" ? Number.parseFloat(usdPrice) : usdPrice
  return numericPrice * USD_TO_INR_RATE
}

/**
 * Format price with currency symbol only (no decimals for whole numbers)
 */
export function formatPriceCompact(price: string | number): string {
  const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price

  // If it's a whole number, don't show decimals
  const fractionDigits = numericPrice % 1 === 0 ? 0 : 2

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(numericPrice)
}
