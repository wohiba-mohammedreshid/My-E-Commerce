# ShopWave — E-Commerce Progressive Web App

A **beginner-friendly** full-stack e-commerce PWA built with React, Express, and Firebase. Works out of the box in **demo mode** — no API keys required to start learning!

## Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Sign up, login, logout (Firebase or demo mode) |
| **Product Catalog** | Categories, search, price filters, sorting |
| **Product Details** | Images, descriptions, reviews, ratings |
| **Shopping Cart** | Add, remove, update quantities (persists offline) |
| **Checkout** | Shipping form + Stripe payment (demo mode included) |
| **Order History** | View past orders with tracking timeline |
| **Admin Dashboard** | Manage products, categories, orders, notifications |
| **PWA** | Installable, offline caching via service worker |
| **Push Notifications** | Order updates and promotional offers |
| **Responsive** | Mobile, tablet, and desktop layouts |

## Project Structure

```
e-commerceOne/
├── client/                 # React frontend (Vite + PWA)
│   ├── public/             # Static assets, PWA icons
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React Context (Auth, Cart)
│       ├── pages/          # Route pages
│       ├── services/       # API, Firebase, notifications
│       └── styles/         # Global CSS
├── server/                 # Express API backend
│   ├── config/             # Firebase setup
│   ├── data/               # Demo/in-memory data
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API route handlers
│   └── utils/              # Push notification helpers
├── .env.example            # Environment variable template
└── README.md
```

## Quick Start (Demo Mode)

No configuration needed — runs with in-memory data:

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start both client and server
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

### Try It Out

**Pre-seeded demo accounts** (no registration needed):

| Email | Password | Role |
|-------|----------|------|
| `user@demo.com` | `demo123` | Customer |
| `admin@shopwave.com` | `admin123` | Admin |

Or register a new account:

1. **Register** a new account at `/register`
2. **Browse** products and add items to cart
3. **Checkout** with any shipping details (payment is simulated)
4. **View orders** at `/orders`
5. **Admin access:** Register with email `admin@shopwave.com` or use the admin account above

## Production Setup (Firebase + Stripe)

### 1. Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Create a **Firestore** database
4. Generate a service account key (Project Settings → Service Accounts)
5. Copy web app config (Project Settings → General)

### 2. Stripe (optional)

1. Get test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

### 3. Environment Variables

```bash
# Copy and fill in your values
cp .env.example server/.env
cp .env.example client/.env
```

### 4. Seed Database

```bash
npm run seed
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (demo mode) |
| POST | `/api/auth/login` | Login (demo mode) |
| GET | `/api/auth/me` | Current user profile |
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/:id` | Product detail + reviews |
| POST | `/api/products/:id/reviews` | Add review |
| GET | `/api/categories` | List categories |
| GET | `/api/orders` | User order history |
| POST | `/api/orders` | Create order |
| POST | `/api/payments/create-intent` | Stripe payment intent |
| POST | `/api/notifications/subscribe` | Push notification subscribe |

## PWA Features

- **Install:** Use browser "Add to Home Screen" option
- **Offline:** Product pages and images are cached by the service worker
- **Notifications:** Click "Enable Notifications" on the home page

Generate VAPID keys for push notifications:

```bash
npx web-push generate-vapid-keys
```

## Tech Stack

- **Frontend:** React 18, React Router, Vite, vite-plugin-pwa
- **Backend:** Node.js, Express, Helmet, Rate Limiting
- **Database:** Firebase Firestore (or in-memory demo)
- **Auth:** Firebase Auth (or demo JWT tokens)
- **Payments:** Stripe (test mode)
- **Notifications:** Web Push API

## Learning Guide

Each file includes comments explaining its purpose. Start exploring from:

1. `client/src/App.jsx` — see all routes
2. `client/src/context/AuthContext.jsx` — understand auth flow
3. `client/src/context/CartContext.jsx` — cart state management
4. `server/index.js` — API server entry point
5. `server/routes/products.js` — CRUD example with filters

## License

MIT — free to use for learning and projects.
