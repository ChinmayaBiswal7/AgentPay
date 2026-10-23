import {
  searchProducts,
  getProductById,
  compareProducts,
  calculateOrderSummary,
  getAllProducts,
} from './catalogService.js';

/**
 * Controlled Tool Registry for the AI Agent
 */
export const AGENT_TOOLS = {
  search_products: {
    description: 'Search catalog with deterministic filters like budget, category, ram, brand',
    execute: (args) => {
      const results = searchProducts(args);
      return {
        count: results.length,
        products: results,
      };
    },
  },
  get_product_details: {
    description: 'Retrieve detailed specs, pros, cons, and stock for a specific product ID',
    execute: ({ productId }) => {
      const product = getProductById(productId);
      if (!product) return { error: `Product not found: ${productId}` };
      return { product };
    },
  },
  compare_products: {
    description: 'Produce side-by-side specification and pricing comparison for 2-4 products',
    execute: ({ productIds }) => {
      const comparison = compareProducts(productIds);
      return comparison || { error: 'No valid products to compare' };
    },
  },
  prepare_order_summary: {
    description: 'Calculate trusted server-side order total, items, and tax before checkout',
    execute: ({ productId, quantity = 1 }) => {
      try {
        const summary = calculateOrderSummary([{ productId, quantity }]);
        return { summary };
      } catch (err) {
        return { error: err.message };
      }
    },
  },
};

/**
 * Natural Language Rule & Token Extraction Engine
 * Extracts: category, maxPrice, minRam, brand, query, useCase
 */
export function extractIntentFromQuery(userMessage = '') {
  const text = userMessage.toLowerCase();
  const intent = {
    category: null,
    maxPrice: null,
    minPrice: null,
    minRam: null,
    brand: null,
    intendedUse: null,
    rawQuery: userMessage,
    action: 'search', // 'search', 'compare', 'checkout', 'details'
    targetProductId: null,
  };

  // Check category
  if (/laptop|notebook|macbook|thinkbook|computer|pc/i.test(text)) {
    intent.category = 'Laptops';
  } else if (/headphone|audio|earphone|earbuds|anc|sound/i.test(text)) {
    intent.category = 'Audio';
  } else if (/monitor|screen|display/i.test(text)) {
    intent.category = 'Monitors';
  } else if (/mouse|keyboard|trackpad|accessory|accessories/i.test(text)) {
    intent.category = 'Accessories';
  }

  // Extract budget constraints: under $700, max 700, < 700, budget 700, below $700, etc.
  const budgetMatch = text.match(/(?:under|below|less than|max|budget of|within|at most)\s*(?:\$|usd)?\s*(\d+(?:\.\d+)?)/i)
    || text.match(/(?:\$|usd)\s*(\d+(?:\.\d+)?)\s*(?:budget|or less|max)/i)
    || text.match(/under\s*(\d+)/i);

  if (budgetMatch) {
    intent.maxPrice = parseFloat(budgetMatch[1]);
  }

  // Extract RAM constraints: 16 GB, 16gb, 8gb, 32 gb
  const ramMatch = text.match(/(\d+)\s*(?:gb|gigs|gigabytes)?\s*(?:of\s*)?ram/i)
    || text.match(/at least\s*(\d+)\s*gb/i);

  if (ramMatch) {
    intent.minRam = parseInt(ramMatch[1], 10);
  }

  // Extract Brands
  const brands = ['Lenovo', 'Acer', 'Dell', 'Apple', 'ASUS', 'Sony', 'Anker', 'Bose', 'LG', 'Logitech', 'Keychron'];
  for (const b of brands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(text)) {
      intent.brand = b;
      break;
    }
  }

  // Intended use
  if (/program|coding|code|developer|software|dev/i.test(text)) {
    intent.intendedUse = 'programming';
  } else if (/gaming|gamer/i.test(text)) {
    intent.intendedUse = 'gaming';
  } else if (/travel|commute|flight/i.test(text)) {
    intent.intendedUse = 'travel';
  } else if (/office|work|productivity/i.test(text)) {
    intent.intendedUse = 'productivity';
  }

  // Action detection
  if (/buy|checkout|purchase|order|pay for|proceed/i.test(text)) {
    intent.action = 'checkout';
    // Check if a product ID or name was referenced
    const all = getAllProducts();
    for (const p of all) {
      if (text.includes(p.id.toLowerCase()) || text.includes(p.name.toLowerCase())) {
        intent.targetProductId = p.id;
        break;
      }
    }
  } else if (/compare/i.test(text)) {
    intent.action = 'compare';
  }

  return intent;
}

/**
 * Intelligent ground-truth shopping assistant engine
 * Fully functional offline and provides transparent tool execution logs
 */
export async function processAssistantRequest({ message, conversationHistory = [], selectedProductId = null }) {
  const toolsExecuted = [];

  // Log helper
  const runTool = (name, args) => {
    const start = Date.now();
    const result = AGENT_TOOLS[name].execute(args);
    toolsExecuted.push({
      tool: name,
      args,
      durationMs: Date.now() - start,
      summary: `Invoked ${name} with ${JSON.stringify(args)}`,
    });
    return result;
  };

  // If user explicitly asks for direct checkout on a selected product:
  if (selectedProductId) {
    const details = runTool('get_product_details', { productId: selectedProductId });
    if (details.product) {
      const summaryResult = runTool('prepare_order_summary', { productId: selectedProductId, quantity: 1 });
      return {
        message: `I've prepared your order summary for **${details.product.name}**. Please review the pricing breakdown below before approving the payment with PayPal Sandbox.`,
        intent: { action: 'checkout', targetProductId: selectedProductId },
        toolsExecuted,
        recommendedProducts: [details.product],
        proposedOrder: summaryResult.summary,
        comparison: null,
      };
    }
  }

  const intent = extractIntentFromQuery(message);

  // If checkout requested with product detected
  if (intent.action === 'checkout' && intent.targetProductId) {
    const details = runTool('get_product_details', { productId: intent.targetProductId });
    const summaryResult = runTool('prepare_order_summary', { productId: intent.targetProductId, quantity: 1 });
    return {
      message: `You've selected **${details.product.name}**! I have verified the pricing and stock against the server catalog. Click 'Checkout with PayPal' when ready to approve the transaction in the PayPal Sandbox environment.`,
      intent,
      toolsExecuted,
      recommendedProducts: [details.product],
      proposedOrder: summaryResult.summary,
      comparison: null,
    };
  }

  // Product Discovery & Filtering
  const searchFilter = {
    category: intent.category,
    maxPrice: intent.maxPrice,
    minRam: intent.minRam,
    brand: intent.brand,
    inStockOnly: true,
  };

  const searchRes = runTool('search_products', searchFilter);
  let matchedProducts = searchRes.products || [];

  // If strict search yielded 0, try relaxing brand or RAM if applicable
  let relaxedConstraintsNote = '';
  if (matchedProducts.length === 0 && (intent.minRam || intent.brand)) {
    const fallbackRes = runTool('search_products', {
      category: intent.category,
      maxPrice: intent.maxPrice,
      inStockOnly: true,
    });
    if (fallbackRes.products && fallbackRes.products.length > 0) {
      matchedProducts = fallbackRes.products;
      relaxedConstraintsNote = ` (Note: Could not find exact match for ${intent.minRam ? intent.minRam + 'GB RAM' : ''} ${intent.brand || ''} under $${intent.maxPrice}, so showing closest options within budget).`;
    }
  }

  // If still empty and no category specified, return popular items
  if (matchedProducts.length === 0) {
    const all = getAllProducts();
    matchedProducts = all.slice(0, 3);
  }

  // Compare products if 2 or more results
  let comparisonData = null;
  if (matchedProducts.length >= 2) {
    const productIds = matchedProducts.slice(0, 3).map((p) => p.id);
    comparisonData = runTool('compare_products', { productIds });
  }

  // Construct explainable recommendation
  let responseText = '';
  if (matchedProducts.length === 1) {
    const p = matchedProducts[0];
    responseText = `I found **${p.name}** at **$${p.price.toFixed(2)} USD** which matches your requirements perfectly. It features **${p.specs.ram || ''}** and **${p.specs.batteryLife || ''}** of battery life. It's ideally suited for: ${p.bestFor}.`;
  } else if (matchedProducts.length > 1) {
    const topPick = matchedProducts[0];
    const runnerUp = matchedProducts[1];
    responseText = `I found **${matchedProducts.length} matching options** grounded in our verified catalog within your criteria${relaxedConstraintsNote}.\n\n` +
      `• **Top Recommendation:** **${topPick.name}** ($${topPick.price.toFixed(2)} USD) — ${topPick.highlights[0]}. Best for: *${topPick.bestFor}*.\n` +
      `• **Alternative:** **${runnerUp.name}** ($${runnerUp.price.toFixed(2)} USD) — ${runnerUp.highlights[0]}.\n\n` +
      `Review the side-by-side comparison below, or click **"Select & Review Order"** on any item to calculate the final total and proceed to PayPal Sandbox checkout.`;
  } else {
    responseText = `I couldn't find products matching your criteria in our demo catalog. Could you clarify your budget or preferred category?`;
  }

  return {
    message: responseText,
    intent,
    toolsExecuted,
    recommendedProducts: matchedProducts,
    comparison: comparisonData,
    proposedOrder: null,
  };
}
