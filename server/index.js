import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import assistantRoutes from './routes/assistantRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { getAccessToken } from './services/paypalService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/assistant', assistantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health & System status check
app.get('/api/health', async (req, res) => {
  let paypalStatus = 'UNKNOWN';
  let paypalError = null;

  try {
    const token = await getAccessToken();
    paypalStatus = token ? 'CONNECTED' : 'DISCONNECTED';
  } catch (err) {
    paypalStatus = 'ERROR';
    paypalError = err.message;
  }

  res.json({
    status: 'ONLINE',
    service: 'AgentPay API',
    timestamp: new Date().toISOString(),
    paypal: {
      status: paypalStatus,
      environment: 'sandbox',
      baseUrl: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
      error: paypalError,
    },
    ai: {
      provider: process.env.AI_PROVIDER || 'auto',
      features: ['intent_extraction', 'tool_calling', 'grounded_search', 'specs_comparison'],
    },
  });
});

// Serve frontend build in production if present
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('AgentPay API Server is running. Frontend dev server is at http://localhost:5173');
    }
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Export app for testing, or listen if called directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 AgentPay server listening on http://localhost:${PORT}`);
    console.log(`🔗 PayPal Sandbox target: ${process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'}`);
  });
}

export default app;
