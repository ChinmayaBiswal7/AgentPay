import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'products.json');

let productsCache = null;

export function loadCatalog() {
  if (!productsCache) {
    const raw = fs.readFileSync(CATALOG_PATH, 'utf-8');
    productsCache = JSON.parse(raw);
  }
  return productsCache;
}

export function getAllProducts() {
  return loadCatalog();
}

export function getProductById(id) {
  const catalog = loadCatalog();
  return catalog.find((p) => p.id === id) || null;
}

/**
 * Deterministic search and filtering
 */
export function searchProducts({
  query,
  category,
  maxPrice,
  minPrice,
  minRam,
  brand,
  inStockOnly = true,
} = {}) {
  const catalog = loadCatalog();

  return catalog.filter((product) => {
    if (inStockOnly && !product.inStock) return false;

    // Category filter
    if (category) {
      const catLower = category.toLowerCase();
      if (!product.category.toLowerCase().includes(catLower)) return false;
    }

    // Strict budget ceiling
    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      if (product.price > Number(maxPrice)) return false;
    }

    // Min price
    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      if (product.price < Number(minPrice)) return false;
    }

    // Brand filter
    if (brand) {
      if (product.brand.toLowerCase() !== brand.toLowerCase()) return false;
    }

    // RAM filter (e.g. minRam = 16)
    if (minRam) {
      const ramStr = product.specs?.ram || '';
      const match = ramStr.match(/(\d+)\s*GB/i);
      const ramGb = match ? parseInt(match[1], 10) : 0;
      if (ramGb < Number(minRam)) return false;
    }

    // Free text query
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      const tokens = q.split(/\s+/);
      const searchableText = [
        product.name,
        product.category,
        product.brand,
        product.bestFor,
        ...(product.highlights || []),
        Object.values(product.specs || {}).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      // Check if at least some relevant tokens match
      const matchesAnyToken = tokens.some((t) => searchableText.includes(t));
      if (!matchesAnyToken) return false;
    }

    return true;
  });
}

/**
 * Compare an array of product IDs
 */
export function compareProducts(productIds = []) {
  const catalog = loadCatalog();
  const validProducts = productIds
    .map((id) => catalog.find((p) => p.id === id))
    .filter(Boolean);

  if (validProducts.length === 0) return null;

  return {
    products: validProducts,
    comparisonKeys: [
      { key: 'price', label: 'Price (USD)', format: (v) => `$${v.toFixed(2)}` },
      { key: 'rating', label: 'User Rating', format: (v, p) => `${v} ★ (${p.reviewCount} reviews)` },
      { key: 'specs.ram', label: 'RAM / Memory', path: ['specs', 'ram'] },
      { key: 'specs.storage', label: 'Storage', path: ['specs', 'storage'] },
      { key: 'specs.cpu', label: 'Processor', path: ['specs', 'cpu'] },
      { key: 'specs.batteryLife', label: 'Battery Life', path: ['specs', 'batteryLife'] },
      { key: 'bestFor', label: 'Best Suited For' },
    ],
  };
}

/**
 * Validates order items against trusted catalog
 * Calculates server-side subtotal, estimated tax (e.g., 8%), and total in USD.
 */
export function calculateOrderSummary(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const catalog = loadCatalog();
  const validatedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const { productId, quantity = 1 } = item;
    if (!productId || typeof productId !== 'string') {
      throw new Error('Invalid or missing productId');
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0 || qty > 100) {
      throw new Error(`Invalid quantity for product ${productId}. Must be between 1 and 100.`);
    }

    const product = catalog.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`Product not found in catalog: ${productId}`);
    }

    if (!product.inStock || product.stockQuantity < qty) {
      throw new Error(`Product ${product.name} is out of stock or insufficient inventory`);
    }

    // Trusted price from server catalog
    const unitPrice = Number(product.price);
    const itemTotal = Number((unitPrice * qty).toFixed(2));
    subtotal += itemTotal;

    validatedItems.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      unitPrice,
      quantity: qty,
      itemTotal,
      currency: product.currency || 'USD',
      imageUrl: product.imageUrl,
    });
  }

  subtotal = Number(subtotal.toFixed(2));
  // 0% or standard sales tax (let's keep 0 or realistic 5%, but let's keep clean: e.g. 5% tax or 0 tax to keep numbers clean and match exact line items)
  // PayPal Orders API: item_total must equal sum of items. If tax_total is added, amount.value = item_total + tax_total.
  // To avoid rounding mismatch in PayPal Sandbox:
  const tax = Number((subtotal * 0.05).toFixed(2));
  const shipping = 0.00;
  const total = Number((subtotal + tax + shipping).toFixed(2));

  return {
    items: validatedItems,
    breakdown: {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
    },
    currency: 'USD',
  };
}
