import express from 'express';
import { calculateOrderSummary } from '../services/catalogService.js';
import { createOrder, captureOrder, getOrder } from '../services/paypalService.js';

const router = express.Router();

/**
 * GET /api/orders/config/paypal
 * Returns the public Sandbox Client ID for initializing the official PayPal JavaScript SDK
 */
router.get('/config/paypal', (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ success: false, error: 'PAYPAL_CLIENT_ID not configured' });
  }
  return res.json({
    success: true,
    clientId,
    currency: 'USD',
    environment: 'sandbox',
  });
});

/**
 * POST /api/orders/summary
 * Preview order pricing breakdown directly from server catalog (without creating PayPal order yet)
 * Body: { items: [{ productId, quantity }] }
 */
router.post('/summary', (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'items array is required' });
    }
    const orderSummary = calculateOrderSummary(items);
    return res.json({ success: true, summary: orderSummary });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders
 * Create a PayPal Sandbox order.
 * Body: { items: [{ productId, quantity }] }
 * Strictly validates against server-side catalog.
 */
router.post('/', async (req, res) => {
  try {
    const { items, clientMetadata } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain items array' });
    }

    // 1. Calculate and validate server-side (never trust client amounts)
    const orderSummary = calculateOrderSummary(items);

    // 2. Call PayPal Orders v2 API
    const paypalOrder = await createOrder(orderSummary, clientMetadata);

    return res.status(201).json({
      success: true,
      orderId: paypalOrder.orderId,
      status: paypalOrder.status,
      summary: orderSummary,
    });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders/:orderId/capture
 * Captures an approved PayPal order and validates payment completion.
 */
router.post('/:orderId/capture', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId is required' });
    }

    const captureResult = await captureOrder(orderId);
    return res.json({
      success: true,
      data: captureResult,
    });
  } catch (err) {
    console.error(`Error capturing order ${req.params.orderId}:`, err);
    return res.status(500).json({
      success: false,
      error: 'Capture failed: ' + err.message,
    });
  }
});

/**
 * GET /api/orders/:orderId
 * Retrieve verified order details
 */
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderData = await getOrder(orderId);
    return res.json({ success: true, order: orderData });
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message });
  }
});

export default router;
