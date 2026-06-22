/**
 * In-memory demo data store
 * =========================
 * Used when Firebase credentials are not configured — great for learning locally!
 * Data resets when the server restarts.
 */

// --- Categories ---
export const demoCategories = [
  { id: 'electronics', name: 'Electronics', icon: '💻' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'home', name: 'Home & Garden', icon: '🏠' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'books', name: 'Books', icon: '📚' },
];

// --- Products ---
export let demoProducts = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Headphones',
    description:
      'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and remote workers.',
    price: 79.99,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
    ],
    stock: 45,
    rating: 4.5,
    reviewCount: 128,
    featured: true,
  },
  {
    id: 'prod-2',
    name: 'Smart Fitness Watch',
    description:
      'Track your steps, heart rate, sleep, and workouts. Water-resistant with a vibrant AMOLED display and 7-day battery life.',
    price: 149.99,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',
    ],
    stock: 30,
    rating: 4.3,
    reviewCount: 89,
    featured: true,
  },
  {
    id: 'prod-3',
    name: 'Classic Cotton T-Shirt',
    description:
      'Soft, breathable 100% organic cotton t-shirt. Available in multiple colors. Pre-shrunk and machine washable.',
    price: 24.99,
    category: 'clothing',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
    stock: 100,
    rating: 4.7,
    reviewCount: 256,
    featured: true,
  },
  {
    id: 'prod-4',
    name: 'Denim Jacket',
    description:
      'Timeless denim jacket with a modern slim fit. Durable construction with brass buttons and multiple pockets.',
    price: 59.99,
    category: 'clothing',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600',
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600'],
    stock: 35,
    rating: 4.4,
    reviewCount: 67,
    featured: false,
  },
  {
    id: 'prod-5',
    name: 'Ceramic Plant Pot Set',
    description:
      'Set of 3 minimalist ceramic plant pots with drainage holes. Perfect for succulents, herbs, and small indoor plants.',
    price: 34.99,
    category: 'home',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d024d4f0?w=600',
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d024d4f0?w=600'],
    stock: 50,
    rating: 4.6,
    reviewCount: 42,
    featured: false,
  },
  {
    id: 'prod-6',
    name: 'LED Desk Lamp',
    description:
      'Adjustable LED desk lamp with 5 brightness levels and 3 color temperatures. USB charging port built in.',
    price: 39.99,
    category: 'home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'],
    stock: 60,
    rating: 4.2,
    reviewCount: 91,
    featured: true,
  },
  {
    id: 'prod-7',
    name: 'Yoga Mat Premium',
    description:
      'Extra-thick 6mm yoga mat with non-slip surface. Includes carrying strap. Eco-friendly TPE material.',
    price: 29.99,
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600',
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'],
    stock: 75,
    rating: 4.8,
    reviewCount: 203,
    featured: false,
  },
  {
    id: 'prod-8',
    name: 'Running Shoes',
    description:
      'Lightweight running shoes with responsive cushioning and breathable mesh upper. Ideal for daily training.',
    price: 89.99,
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
    stock: 40,
    rating: 4.5,
    reviewCount: 156,
    featured: true,
  },
  {
    id: 'prod-9',
    name: 'JavaScript: The Good Parts',
    description:
      'The definitive guide to the elegant, lightweight, and expressive language that is JavaScript. By Douglas Crockford.',
    price: 19.99,
    category: 'books',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600',
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600'],
    stock: 80,
    rating: 4.9,
    reviewCount: 412,
    featured: false,
  },
  {
    id: 'prod-10',
    name: 'Clean Code',
    description:
      'A handbook of agile software craftsmanship by Robert C. Martin. Learn to write code that is clean and maintainable.',
    price: 29.99,
    category: 'books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'],
    stock: 55,
    rating: 4.7,
    reviewCount: 328,
    featured: false,
  },
];

// --- Demo users (pre-seeded for quick testing) ---
export const demoUsers = new Map([
  [
    'demo-user',
    {
      id: 'demo-user',
      email: 'user@demo.com',
      password: 'demo123',
      displayName: 'Demo User',
      isAdmin: false,
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  [
    'admin-user',
    {
      id: 'admin-user',
      email: 'admin@shopwave.com',
      password: 'admin123',
      displayName: 'Admin User',
      isAdmin: true,
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ],
]);

// --- Sample reviews keyed by product ID ---
export const demoReviews = new Map([
  [
    'prod-1',
    [
      {
        id: 'rev-1',
        productId: 'prod-1',
        userId: 'demo-user',
        userName: 'Alex M.',
        rating: 5,
        comment: 'Amazing sound quality! Best headphones I have owned.',
        createdAt: '2025-12-01T00:00:00.000Z',
      },
      {
        id: 'rev-2',
        productId: 'prod-1',
        userId: 'user-2',
        userName: 'Sarah K.',
        rating: 4,
        comment: 'Great battery life. Comfortable for long sessions.',
        createdAt: '2025-11-15T00:00:00.000Z',
      },
    ],
  ],
  [
    'prod-3',
    [
      {
        id: 'rev-3',
        productId: 'prod-3',
        userId: 'user-3',
        userName: 'Mike R.',
        rating: 5,
        comment: 'Super soft and fits perfectly. Will buy more colors!',
        createdAt: '2025-12-10T00:00:00.000Z',
      },
    ],
  ],
]);

export const demoOrders = [];
export const demoPushSubscriptions = new Map();
