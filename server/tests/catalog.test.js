import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllProducts,
  getProductById,
  searchProducts,
  calculateOrderSummary,
  compareProducts,
} from '../services/catalogService.js';

describe('Catalogue Service', () => {
  it('should load all grounded products from catalog', () => {
    const products = getAllProducts();
    assert.ok(products.length >= 8, 'Catalog should have at least 8 realistic products');
    assert.ok(products.every((p) => p.id && p.name && p.price > 0 && p.currency === 'USD'));
  });

  it('should retrieve a product by ID', () => {
    const p = getProductById('lap-01');
    assert.ok(p);
    assert.equal(p.name, 'Lenovo ThinkBook 15 Gen 4');
    assert.equal(p.price, 649.99);
  });

  it('should strictly exclude products exceeding budget ceiling', () => {
    // Under $700: ThinkBook ($649.99), Acer ($589.99), Dell ($699.00) match
    // MacBook ($749.99) and Zenbook ($849.99) MUST be excluded!
    const results = searchProducts({
      category: 'Laptops',
      maxPrice: 700,
    });

    assert.ok(results.length >= 2, 'Should find matching laptops under 700');
    for (const item of results) {
      assert.ok(
        item.price <= 700,
        `Product ${item.name} ($${item.price}) exceeded max budget $700!`
      );
    }

    const hasMacbook = results.some((p) => p.name.includes('MacBook'));
    assert.equal(hasMacbook, false, 'MacBook ($749.99) must be excluded from $700 budget');
  });

  it('should filter by minimum RAM requirement', () => {
    const results = searchProducts({
      category: 'Laptops',
      minRam: 16,
    });

    assert.ok(results.length >= 2);
    for (const item of results) {
      const match = (item.specs?.ram || '').match(/(\d+)\s*GB/i);
      const ram = match ? parseInt(match[1], 10) : 0;
      assert.ok(ram >= 16, `${item.name} has ${ram}GB RAM which is less than 16GB required`);
    }
  });

  it('should calculate server-side order summary and reject invalid inputs', () => {
    // Valid item
    const summary = calculateOrderSummary([{ productId: 'lap-01', quantity: 2 }]);
    assert.equal(summary.items.length, 1);
    assert.equal(summary.items[0].unitPrice, 649.99);
    assert.equal(summary.items[0].quantity, 2);
    assert.equal(summary.items[0].itemTotal, 1299.98);
    assert.equal(summary.breakdown.subtotal, '1299.98');
    assert.equal(summary.currency, 'USD');

    // Reject nonexistent product ID
    assert.throws(() => {
      calculateOrderSummary([{ productId: 'fake-laptop-999', quantity: 1 }]);
    }, /not found in catalog/i);

    // Reject non-positive or invalid quantity
    assert.throws(() => {
      calculateOrderSummary([{ productId: 'lap-01', quantity: 0 }]);
    }, /invalid quantity/i);

    assert.throws(() => {
      calculateOrderSummary([{ productId: 'lap-01', quantity: -5 }]);
    }, /invalid quantity/i);
  });

  it('should produce side-by-side comparison structure', () => {
    const comparison = compareProducts(['lap-01', 'lap-02']);
    assert.ok(comparison);
    assert.equal(comparison.products.length, 2);
    assert.ok(comparison.comparisonKeys.length > 0);
  });
});
