/**
 * Product review API routes.
 */
import { Router } from 'express';
import { reviews, products } from '../data/demoData.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/** GET /api/reviews/:productId — get reviews for a product */
router.get('/:productId', (req, res) => {
  const productReviews = reviews[req.params.productId] || [];
  res.json({ reviews: productReviews });
});

/** POST /api/reviews/:productId — add a review (authenticated users) */
router.post('/:productId', authenticate, (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    userId: req.user.id,
    userName: req.user.displayName,
    rating: Number(rating),
    comment: comment || '',
    createdAt: new Date().toISOString().split('T')[0],
  };

  if (!reviews[productId]) reviews[productId] = [];
  reviews[productId].push(newReview);

  // Update product average rating
  const allReviews = reviews[productId];
  product.reviewCount = allReviews.length;
  product.rating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  res.status(201).json({ review: newReview });
});

export default router;
