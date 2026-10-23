import React, { useState, useEffect } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import {
  X,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { getOrderSummary, createOrder, captureOrder } from '../services/api';

export default function OrderSummaryModal({
  product,
  initialQuantity = 1,
  onClose,
  onPaymentSuccess,
}) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch verified order summary from server whenever product or quantity changes
  useEffect(() => {
    let isMounted = true;
    async function fetchSummary() {
      if (!product) return;
      try {
        setLoading(true);
        setError(null);
        const res = await getOrderSummary([{ productId: product.id, quantity }]);
        if (isMounted) {
          setSummary(res.summary);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to calculate verified price on server');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [product, quantity]);

  if (!product) return null;

  // PayPal Button lifecycle: createOrder
  const handleCreateOrder = async (data, actions) => {
    try {
      setStatusMessage('Creating verified order in PayPal Sandbox...');
      setError(null);

      const res = await createOrder([{ productId: product.id, quantity }], {
        platform: 'AgentPay Web Client',
        timestamp: new Date().toISOString(),
      });

      if (!res.success || !res.orderId) {
        throw new Error(res.error || 'Failed to obtain PayPal Sandbox Order ID');
      }

      setStatusMessage('Order created! Please complete authorization in PayPal...');
      return res.orderId;
    } catch (err) {
      console.error('Error in createOrder:', err);
      setError('Order creation failed: ' + err.message);
      setStatusMessage('');
      throw err;
    }
  };

  // PayPal Button lifecycle: onApprove
  const handleApprove = async (data, actions) => {
    try {
      setIsProcessingPayment(true);
      setStatusMessage('Payment approved by buyer. Calling backend to securely capture funds...');

      const captureRes = await captureOrder(data.orderID);

      if (!captureRes.success || captureRes.data?.status !== 'COMPLETED') {
        throw new Error(captureRes.error || 'Payment capture could not be verified.');
      }

      setStatusMessage('Verified! Preparing transaction receipt...');
      onPaymentSuccess(captureRes.data);
    } catch (err) {
      console.error('Capture error:', err);
      setError('Payment Capture Failed: ' + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancel = (data) => {
    setStatusMessage('Transaction was cancelled by the user in PayPal.');
  };

  const handleError = (err) => {
    console.error('PayPal SDK Error:', err);
    setError('PayPal Checkout Error: ' + (err.message || 'Please check your connection and try again.'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Order Review & Checkout</h2>
              <p className="text-xs text-slate-400">Verified server-side price calculation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessingPayment}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Selected Product Card */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-white truncate">{product.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{product.brand} • {product.category}</p>
              <div className="text-sm font-semibold text-blue-400 mt-1">
                ${product.price.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USD / unit</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isProcessingPayment}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center text-xs transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-white font-mono">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10 || isProcessingPayment}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center text-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Pricing Breakdown */}
          {loading ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-400 font-mono">Verifying trusted catalogue price...</span>
            </div>
          ) : summary ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Subtotal ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
                <span className="font-mono text-slate-200">${summary.breakdown.subtotal} USD</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Estimated Tax (5%)</span>
                <span className="font-mono text-slate-200">${summary.breakdown.tax} USD</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Standard Shipping</span>
                <span className="text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-white text-base">Final Total</span>
                <div className="text-right">
                  <span className="font-black text-2xl text-blue-400 font-mono">
                    ${summary.breakdown.total}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">USD</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Status Progress */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center space-x-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Explicit User Purchase Authorization */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80 flex items-start space-x-3">
            <input
              type="checkbox"
              id="confirmAuth"
              checked={isAuthorized}
              onChange={(e) => setIsAuthorized(e.target.checked)}
              disabled={isProcessingPayment}
              className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
            />
            <label htmlFor="confirmAuth" className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none">
              I authorize AgentPay to create a PayPal Sandbox order for{' '}
              <strong className="text-white font-mono">${summary ? summary.breakdown.total : '--'} USD</strong>. I understand no real money will be charged.
            </label>
          </div>

          {/* PayPal Checkout Button Integration */}
          <div className="space-y-3">
            {!isAuthorized ? (
              <button
                disabled
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 text-slate-500 font-semibold text-sm cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm authorization above to unlock PayPal Checkout</span>
              </button>
            ) : isProcessingPayment ? (
              <div className="py-4 flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-blue-400 font-medium">Capturing and verifying transaction with PayPal...</span>
              </div>
            ) : (
              <div className="paypal-button-container">
                <PayPalButtons
                  style={{
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal',
                    height: 48,
                  }}
                  createOrder={handleCreateOrder}
                  onApprove={handleApprove}
                  onCancel={handleCancel}
                  onError={handleError}
                />
              </div>
            )}

            <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official PayPal Sandbox Environment • Verified Orders v2 API</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
