let cachedAccessToken = null;
let tokenExpiresAt = 0;

// Local in-memory store for orders and verified transactions
const orderStore = new Map();

/**
 * Retrieve OAuth2 Bearer token from PayPal Sandbox
 */
export async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET missing in environment');
  }

  const now = Date.now();
  if (cachedAccessToken && now < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PayPal OAuth token failed [${res.status}]: ${errText}`);
  }

  const data = await res.json();
  cachedAccessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;
  return cachedAccessToken;
}

/**
 * Creates an order in PayPal Sandbox using verified server-side order breakdown
 */
export async function createOrder(orderSummary, clientMetadata = {}) {
  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
  const token = await getAccessToken();

  const purchaseUnit = {
    reference_id: `pu_${Date.now()}`,
    description: `AgentPay Order: ${orderSummary.items.map((i) => i.name).join(', ')}`.substring(0, 127),
    amount: {
      currency_code: orderSummary.currency,
      value: orderSummary.breakdown.total,
      breakdown: {
        item_total: {
          currency_code: orderSummary.currency,
          value: orderSummary.breakdown.subtotal,
        },
        tax_total: {
          currency_code: orderSummary.currency,
          value: orderSummary.breakdown.tax,
        },
      },
    },
    items: orderSummary.items.map((i) => ({
      name: i.name.substring(0, 127),
      unit_amount: {
        currency_code: orderSummary.currency,
        value: i.unitPrice.toFixed(2),
      },
      quantity: String(i.quantity),
      category: 'PHYSICAL_GOODS',
    })),
  };

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [purchaseUnit],
    application_context: {
      brand_name: 'AgentPay - AI Shopping Assistant',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING',
    },
  };

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(`PayPal Create Order Failed [${res.status}]: ${JSON.stringify(responseData)}`);
  }

  // Persist order in local store for verification and duplicate prevention
  const internalOrderRecord = {
    orderId: responseData.id,
    status: responseData.status, // 'CREATED'
    orderSummary,
    clientMetadata,
    createdAt: new Date().toISOString(),
    captured: false,
    captureDetails: null,
  };

  orderStore.set(responseData.id, internalOrderRecord);

  return {
    orderId: responseData.id,
    status: responseData.status,
    links: responseData.links,
    summary: orderSummary,
  };
}

/**
 * Capture an approved PayPal order
 * Enforces idempotency: rejects duplicate captures
 * Verifies currency and amount match the expected server-calculated values
 */
export async function captureOrder(orderId) {
  if (!orderId) {
    throw new Error('orderId is required for capture');
  }

  // Idempotency check: if already captured, return the existing verified receipt
  const existingRecord = orderStore.get(orderId);
  if (existingRecord && existingRecord.captured) {
    return {
      success: true,
      alreadyCaptured: true,
      message: 'Order has already been successfully captured.',
      order: existingRecord,
    };
  }

  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
  const token = await getAccessToken();

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  });

  const captureData = await res.json();

  if (!res.ok) {
    throw new Error(
      `PayPal Capture Failed [${res.status}]: ${captureData.message || JSON.stringify(captureData)}`
    );
  }

  // Verification of capture status
  const captureUnit = captureData.purchase_units?.[0]?.payments?.captures?.[0];
  const captureStatus = captureUnit?.status || captureData.status;

  if (captureStatus !== 'COMPLETED') {
    throw new Error(`Payment verification failed: Status is ${captureStatus}, expected COMPLETED`);
  }

  // Amount & currency verification against trusted order record if available
  if (existingRecord) {
    const expectedTotal = existingRecord.orderSummary.breakdown.total;
    const capturedTotal = captureUnit?.amount?.value;
    const expectedCurrency = existingRecord.orderSummary.currency;
    const capturedCurrency = captureUnit?.amount?.currency_code;

    if (capturedTotal !== expectedTotal || capturedCurrency !== expectedCurrency) {
      throw new Error(
        `Amount mismatch during verification! Expected ${expectedCurrency} ${expectedTotal}, got ${capturedCurrency} ${capturedTotal}`
      );
    }
  }

  // Update order record
  const verifiedRecord = {
    ...(existingRecord || { orderId }),
    status: 'COMPLETED',
    captured: true,
    capturedAt: new Date().toISOString(),
    captureId: captureUnit?.id,
    payer: captureData.payer,
    amount: captureUnit?.amount,
    links: captureData.links,
  };

  orderStore.set(orderId, verifiedRecord);

  return {
    success: true,
    orderId,
    captureId: captureUnit?.id,
    status: 'COMPLETED',
    payer: {
      name: `${captureData.payer?.name?.given_name || ''} ${captureData.payer?.name?.surname || ''}`.trim(),
      email: captureData.payer?.email_address,
      payerId: captureData.payer?.payer_id,
    },
    amount: captureUnit?.amount,
    createdAt: verifiedRecord.createdAt,
    capturedAt: verifiedRecord.capturedAt,
    orderSummary: verifiedRecord.orderSummary,
  };
}

/**
 * Retrieve verified order details from local store or PayPal
 */
export async function getOrder(orderId) {
  const existing = orderStore.get(orderId);
  if (existing) {
    return existing;
  }

  // Fallback query directly to PayPal API
  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
  const token = await getAccessToken();

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Order ${orderId} not found`);
  }

  return await res.json();
}
