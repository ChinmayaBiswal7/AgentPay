import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractIntentFromQuery, processAssistantRequest } from '../services/aiService.js';

describe('AI Shopping Assistant Engine', () => {
  it('should extract structured intent from the hackathon user request', () => {
    const userPrompt = 'Find me a laptop for programming under $700 with at least 16 GB RAM and good battery life.';
    const intent = extractIntentFromQuery(userPrompt);

    assert.equal(intent.category, 'Laptops');
    assert.equal(intent.maxPrice, 700);
    assert.equal(intent.minRam, 16);
    assert.equal(intent.intendedUse, 'programming');
  });

  it('should execute tools and return grounded catalog recommendations within constraints', async () => {
    const userPrompt = 'Find me a laptop for programming under $700 with at least 16 GB RAM and good battery life.';
    const response = await processAssistantRequest({ message: userPrompt });

    assert.ok(response.toolsExecuted.length >= 1, 'Should execute at least one tool');
    const searchTool = response.toolsExecuted.find((t) => t.tool === 'search_products');
    assert.ok(searchTool, 'search_products tool should have been invoked');

    // Products returned must all be <= 700
    assert.ok(response.recommendedProducts.length > 0, 'Should find products');
    for (const prod of response.recommendedProducts) {
      assert.ok(
        prod.price <= 700,
        `Recommended product ${prod.name} exceeds $700 budget: ${prod.price}`
      );
    }

    // Comparison view must be generated for multiple candidates
    if (response.recommendedProducts.length >= 2) {
      assert.ok(response.comparison, 'Comparison table should be generated for multi-product result');
    }
  });

  it('should prepare order proposal if checkout action is triggered', async () => {
    const response = await processAssistantRequest({
      message: 'I want to buy lap-01',
    });

    assert.equal(response.intent.action, 'checkout');
    assert.equal(response.intent.targetProductId, 'lap-01');
    assert.ok(response.proposedOrder, 'Order proposal should be prepared');
    assert.equal(response.proposedOrder.items[0].productId, 'lap-01');
  });
});
