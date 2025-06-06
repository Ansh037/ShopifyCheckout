import type { Product } from "./types"

// Validate environment variables
const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN
const STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN

// Check if credentials are provided
const hasShopifyCredentials =
  SHOPIFY_DOMAIN &&
  STOREFRONT_ACCESS_TOKEN &&
  SHOPIFY_DOMAIN !== "your-shop.myshopify.com" &&
  STOREFRONT_ACCESS_TOKEN !== "your-storefront-access-token"

const STOREFRONT_API_URL = hasShopifyCredentials ? `https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json` : null

async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string
  variables?: Record<string, any>
}): Promise<T> {
  if (!hasShopifyCredentials || !STOREFRONT_API_URL) {
    throw new Error("SHOPIFY_CREDENTIALS_MISSING")
  }

  console.log("Fetching from Shopify:", {
    domain: SHOPIFY_DOMAIN,
    hasToken: !!STOREFRONT_ACCESS_TOKEN,
    url: STOREFRONT_API_URL,
  })

  const response = await fetch(STOREFRONT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
  })

  console.log("Shopify API Response Status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Shopify API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    })
    throw new Error(`Shopify API error! status: ${response.status} - ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors) {
    console.error("GraphQL Errors:", json.errors)
    throw new Error(json.errors[0]?.message || "GraphQL error")
  }

  return json.data
}

const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`

const CREATE_CHECKOUT_MUTATION = `
  mutation CreateCheckout($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
        totalPrice {
          amount
        }
        lineItems(first: 250) {
          edges {
            node {
              id
              title
              quantity
            }
          }
        }
      }
      checkoutUserErrors {
        field
        message
      }
    }
  }
`

export async function getProducts(): Promise<Product[]> {
  // If no Shopify credentials, return mock data immediately
  if (!hasShopifyCredentials) {
    console.log("Using mock data - Shopify credentials not configured")
    return getMockProducts()
  }

  try {
    const data = await shopifyFetch<{
      products: {
        edges: Array<{
          node: {
            id: string
            title: string
            handle: string
            description: string
            images: {
              edges: Array<{
                node: {
                  url: string
                  altText?: string
                }
              }>
            }
            variants: {
              edges: Array<{
                node: {
                  id: string
                  title: string
                  price: {
                    amount: string
                  }
                  availableForSale: boolean
                }
              }>
            }
          }
        }>
      }
    }>({
      query: GET_PRODUCTS_QUERY,
      variables: { first: 20 },
    })

    return data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      images: node.images.edges.map(({ node: image }) => ({
        url: image.url,
        altText: image.altText,
      })),
      variants: node.variants.edges.map(({ node: variant }) => ({
        id: variant.id,
        title: variant.title,
        price: variant.price.amount,
        available: variant.availableForSale,
      })),
    }))
  } catch (error) {
    console.error("Error fetching products from Shopify:", error)

    // If it's a credentials error, provide helpful message
    if (error instanceof Error && error.message === "SHOPIFY_CREDENTIALS_MISSING") {
      console.log("Shopify credentials missing, using mock data")
    } else {
      console.log("Shopify API error, falling back to mock data")
    }

    // Always fall back to mock data
    return getMockProducts()
  }
}

export async function createCheckoutSession(
  lineItems: Array<{ variantId: string; quantity: number }>,
): Promise<string> {
  // If no Shopify credentials, simulate checkout
  if (!hasShopifyCredentials) {
    console.log("Simulating checkout - Shopify credentials not configured")
    // In a real app, you might redirect to a custom checkout page
    throw new Error("Demo mode: Checkout functionality requires Shopify configuration. See README for setup instructions.")
  }

  try {
    const data = await shopifyFetch<{
      checkoutCreate: {
        checkout: {
          id: string
          webUrl: string
          totalPrice: {
            amount: string
          }
        }
        checkoutUserErrors: Array<{
          field: string[]
          message: string
        }>
      }
    }>({
      query: CREATE_CHECKOUT_MUTATION,
      variables: {
        input: {
          lineItems: lineItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        },
      },
    })

    if (data.checkoutCreate.checkoutUserErrors.length > 0) {
      throw new Error(data.checkoutCreate.checkoutUserErrors[0].message)
    }

    return data.checkoutCreate.checkout.webUrl
  } catch (error) {
    console.error("Error creating checkout:", error)
    throw error
  }
}

// Enhanced mock data for development/demo purposes
function getMockProducts(): Product[] {
  return [
    {
      id: "mock-1",
      title: "Premium Cotton T-Shirt",
      handle: "premium-cotton-tshirt",
      description:
        "Soft, comfortable cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a relaxed fit.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center",
          altText: "Premium Cotton T-Shirt",
        },
      ],
      variants: [
        {
          id: "variant-1",
          title: "Small / Black",
          price: "2499.00",
          available: true,
        },
        {
          id: "variant-2",
          title: "Medium / Black",
          price: "2499.00",
          available: true,
        },
        {
          id: "variant-3",
          title: "Large / Black",
          price: "2499.00",
          available: false,
        },
        {
          id: "variant-4",
          title: "Small / White",
          price: "2499.00",
          available: true,
        },
      ],
    },
    {
      id: "mock-2",
      title: "Wireless Bluetooth Headphones",
      handle: "wireless-bluetooth-headphones",
      description:
        "High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center",
          altText: "Wireless Bluetooth Headphones",
        },
      ],
      variants: [
        {
          id: "variant-5",
          title: "Black",
          price: "16599.00",
          available: true,
        },
        {
          id: "variant-6",
          title: "White",
          price: "16599.00",
          available: true,
        },
        {
          id: "variant-7",
          title: "Silver",
          price: "18249.00",
          available: true,
        },
      ],
    },
    {
      id: "mock-3",
      title: "Stainless Steel Water Bottle",
      handle: "stainless-steel-water-bottle",
      description:
        "Double-wall insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop&crop=center",
          altText: "Stainless Steel Water Bottle",
        },
      ],
      variants: [
        {
          id: "variant-8",
          title: "500ml / Silver",
          price: "2899.00",
          available: true,
        },
        {
          id: "variant-9",
          title: "750ml / Silver",
          price: "3319.00",
          available: true,
        },
        {
          id: "variant-10",
          title: "1L / Silver",
          price: "3729.00",
          available: true,
        },
        {
          id: "variant-11",
          title: "500ml / Black",
          price: "2899.00",
          available: false,
        },
      ],
    },
    {
      id: "mock-4",
      title: "Leather Crossbody Bag",
      handle: "leather-crossbody-bag",
      description:
        "Handcrafted genuine leather crossbody bag with adjustable strap, multiple compartments, and vintage brass hardware.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center",
          altText: "Leather Crossbody Bag",
        },
      ],
      variants: [
        {
          id: "variant-12",
          title: "Brown",
          price: "7459.00",
          available: true,
        },
        {
          id: "variant-13",
          title: "Black",
          price: "7459.00",
          available: false,
        },
        {
          id: "variant-14",
          title: "Tan",
          price: "7869.00",
          available: true,
        },
      ],
    },
    {
      id: "mock-5",
      title: "Smart Fitness Watch",
      handle: "smart-fitness-watch",
      description:
        "Advanced fitness tracking watch with heart rate monitoring, GPS, sleep tracking, and 7-day battery life.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center",
          altText: "Smart Fitness Watch",
        },
      ],
      variants: [
        {
          id: "variant-15",
          title: "42mm / Black",
          price: "24899.00",
          available: true,
        },
        {
          id: "variant-16",
          title: "46mm / Black",
          price: "27369.00",
          available: true,
        },
        {
          id: "variant-17",
          title: "42mm / Silver",
          price: "24899.00",
          available: true,
        },
      ],
    },
    {
      id: "mock-6",
      title: "Organic Coffee Beans",
      handle: "organic-coffee-beans",
      description:
        "Premium single-origin organic coffee beans, medium roast with notes of chocolate and caramel. Freshly roasted weekly.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop&crop=center",
          altText: "Organic Coffee Beans",
        },
      ],
      variants: [
        {
          id: "variant-18",
          title: "12oz / Whole Bean",
          price: "1579.00",
          available: true,
        },
        {
          id: "variant-19",
          title: "12oz / Ground",
          price: "1579.00",
          available: true,
        },
        {
          id: "variant-20",
          title: "2lb / Whole Bean",
          price: "4559.00",
          available: true,
        },
      ],
    },
  ]
}