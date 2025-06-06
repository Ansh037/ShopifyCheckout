Shopify Checkout App
A modern React-based e-commerce application with enhanced checkout functionality and Shopify Storefront API integration.

Features
Product Grid: Display products with modern card layout
Shopping Cart: Add, remove, and update product quantities
Enhanced Checkout: Detailed cart summary with tax calculations
Responsive Design: Works seamlessly across all devices
Mock Data Support: Fallback to demo products when Shopify credentials aren't configured
Tech Stack
Frontend: React, TypeScript, Tailwind CSS
Backend: Express.js, Node.js
Build Tool: Vite
UI Components: Radix UI (shadcn/ui)
State Management: React Context API
Routing: Wouter
Data Fetching: TanStack Query
Getting Started
Prerequisites
Node.js 18+
npm or yarn
Installation
Clone the repository:
git clone https://github.com/Ansh037/ShopifyCheckout.git
cd ShopifyCheckout
Install dependencies:
npm install
Start the development server:
npm run dev
The application will be available at http://localhost:5000

Configuration
Shopify Integration
To connect with a real Shopify store, you'll need to configure the following environment variables:

SHOPIFY_STORE_DOMAIN: Your Shopify store domain
SHOPIFY_STOREFRONT_ACCESS_TOKEN: Storefront API access token
Without these credentials, the app will use mock data for demonstration purposes.

Project Structure
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express server
├── shared/                 # Shared types and schemas
└── ...
Available Scripts
npm run dev - Start development server
npm run build - Build for production
npm run preview - Preview production build
Contributing
Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
This project is licensed under the MIT License.
