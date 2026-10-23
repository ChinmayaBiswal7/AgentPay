import express from 'express';
import {
  getAllProducts,
  getProductById,
  searchProducts,
  compareProducts,
} from '../services/catalogService.js';

const router = express.Router();

/**
 * GET /api/products
 * Query params: q, category, maxPrice, minPrice, minRam, brand
 */
router.get('/', (req, res) => {
  try {
    const { q, category, maxPrice, minPrice, minRam, brand } = req.query;

    if (q || category || maxPrice || minPrice || minRam || brand) {
      const results = searchProducts({
        query: q,
        category,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        minRam: minRam ? parseInt(minRam, 10) : undefined,
        brand,
      });
      return res.json({ success: true, count: results.length, products: results });
    }

    const all = getAllProducts();
    return res.json({ success: true, count: all.length, products: all });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/products/:id
 */
router.get('/:id', (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found in catalog' });
    }
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/products/compare
 * Body: { productIds: ['lap-01', 'lap-02'] }
 */
router.post('/compare', (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({ success: false, error: 'Provide at least 2 product IDs to compare' });
    }
    const comparison = compareProducts(productIds);
    if (!comparison) {
      return res.status(404).json({ success: false, error: 'No matching products found to compare' });
    }
    return res.json({ success: true, comparison });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
