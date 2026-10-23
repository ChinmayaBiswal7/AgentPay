import express from 'express';
import { processAssistantRequest } from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/assistant/chat
 * Body: { message: string, conversationHistory: array, selectedProductId: string }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], selectedProductId } = req.body;

    if (!message && !selectedProductId) {
      return res.status(400).json({
        success: false,
        error: 'Either a message or selectedProductId must be provided',
      });
    }

    const result = await processAssistantRequest({
      message: message || '',
      conversationHistory,
      selectedProductId,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('Assistant error:', err);
    return res.status(500).json({
      success: false,
      error: 'Assistant processing failed: ' + err.message,
    });
  }
});

export default router;
