const API_BASE = '/api';

export async function getPayPalConfig() {
  const res = await fetch(`${API_BASE}/orders/config/paypal`);
  if (!res.ok) throw new Error('Failed to fetch PayPal config');
  return res.json();
}

export async function sendChatMessage(message, conversationHistory = [], selectedProductId = null) {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationHistory, selectedProductId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Chat request failed');
  }
  return res.json();
}

export async function getProducts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, v);
  });
  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error(`Product ${id} not found`);
  return res.json();
}

export async function compareProducts(productIds) {
  const res = await fetch(`${API_BASE}/products/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIds }),
  });
  if (!res.ok) throw new Error('Comparison failed');
  return res.json();
}

export async function getOrderSummary(items) {
  const res = await fetch(`${API_BASE}/orders/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to compute order summary');
  }
  return res.json();
}

export async function createOrder(items, clientMetadata = {}) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, clientMetadata }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create PayPal order');
  }
  return res.json();
}

export async function captureOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to capture PayPal order');
  }
  return res.json();
}

export async function getOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`);
  if (!res.ok) throw new Error('Failed to retrieve order');
  return res.json();
}

export async function getSystemHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to get system health');
  return res.json();
}
