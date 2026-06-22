/**
 * Product catalog routes — list, search, filter, and manage products.
 */
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getDb } from '../config/firebase.js';
import { demoProducts, demoReviews } from '../data/demoStore.js';

const router = Router();

/**
 * GET /api/products — List products with optional filters
 * Query params: category, search, minPrice, maxPrice, sort, featured
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, featured } = req.query;
    const db = getDb();

    let products = [];

    if (!db) {
      products = [...demoProducts];
    } else {
      let query = db.collection('products');
      if (category) query = query.where('category', '==', category);
      if (featured === 'true') query = query.where('featured', '==', true);
      const snapshot = await query.get();
      products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    // Client-side filters (work in both demo and Firebase modes)
    if (category && db) {
      products = products.filter((p) => p.category === category);
    }
    if (search) {
      const term = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }
    if (minPrice) products = products.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) products = products.filter((p) => p.price <= Number(maxPrice));
    if (featured === 'true' && !db) {
      products = products.filter((p) => p.featured);
    }

    // Sort options
    if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
    else if (sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name));

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/products/:id — Single product with reviews
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    let product;

    if (!db) {
      product = demoProducts.find((p) => p.id === req.params.id);
    } else {
      const doc = await db.collection('products').doc(req.params.id).get();
      if (doc.exists) product = { id: doc.id, ...doc.data() };
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Attach reviews
    let reviews = [];
    if (!db) {
      reviews = demoReviews.get(req.params.id) || [];
    } else {
      const snapshot = await db
        .collection('reviews')
        .where('productId', '==', req.params.id)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    res.json({ ...product, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/products — Create product (admin only)
 */
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image, images, stock, featured } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const productData = {
      name,
      description: description || '',
      price: Number(price),
      category,
      image: image || 'https://via.placeholder.com/400',
      images: images || [image || 'https://via.placeholder.com/400'],
      stock: Number(stock) || 0,
      rating: 0,
      reviewCount: 0,
      featured: featured || false,
      createdAt: new Date().toISOString(),
    };

    const db = getDb();

    if (!db) {
      const id = `prod_${Date.now()}`;
      const product = { id, ...productData };
      demoProducts.push(product);
      return res.status(201).json(product);
    }

    const docRef = await db.collection('products').add(productData);
    res.status(201).json({ id: docRef.id, ...productData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/products/:id — Update product (admin only)
 */
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    delete updates.id;

    if (!db) {
      const index = demoProducts.findIndex((p) => p.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Product not found' });
      demoProducts[index] = { ...demoProducts[index], ...updates };
      return res.json(demoProducts[index]);
    }

    await db.collection('products').doc(req.params.id).update(updates);
    const doc = await db.collection('products').doc(req.params.id).get();
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/products/:id — Delete product (admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const db = getDb();

    if (!db) {
      const index = demoProducts.findIndex((p) => p.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Product not found' });
      demoProducts.splice(index, 1);
      return res.json({ message: 'Product deleted' });
    }

    await db.collection('products').doc(req.params.id).delete();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/products/:id/reviews — Add a review (authenticated users)
 */
router.post('/:id/reviews', requireAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = {
      productId: req.params.id,
      userId: req.user.uid,
      userName: req.user.email?.split('@')[0] || 'User',
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date().toISOString(),
    };

    const db = getDb();

    if (!db) {
      const reviews = demoReviews.get(req.params.id) || [];
      reviews.unshift({ id: `rev_${Date.now()}`, ...review });
      demoReviews.set(req.params.id, reviews);

      const product = demoProducts.find((p) => p.id === req.params.id);
      if (product) {
        const total = product.rating * product.reviewCount + Number(rating);
        product.reviewCount += 1;
        product.rating = total / product.reviewCount;
      }
      return res.status(201).json(reviews[0]);
    }

    const docRef = await db.collection('reviews').add(review);
    res.status(201).json({ id: docRef.id, ...review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
