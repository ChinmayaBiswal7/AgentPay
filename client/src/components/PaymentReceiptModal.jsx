import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Download,
  ShoppingBag,
  ShieldCheck,
  Calendar,
  User,
  CreditCard,
} from 'lucide-react';

export default function PaymentReceiptModal({ receipt, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!receipt) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formattedDate = receipt.capturedAt
    ? new Date(receipt.capturedAt).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Success Header Banner */}
        <div className="bg-gradient-to-b from-emerald-500/20 via-slate-900/40 to-slate-900 p-8 text-center border-b border-slate-800/80">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            Payment Verified & Captured
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">Order Confirmed!</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Your payment was successfully authorized via PayPal Sandbox and securely captured by the AgentPay server.
          </p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-5">
          {/* Amount Paid Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Amount Captured</span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                ${receipt.amount?.value || receipt.orderSummary?.breakdown?.total}{' '}
                <span className="text-xs font-normal text-emerald-400">
                  {receipt.amount?.currency_code || 'USD'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Status</span>
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-sm mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{receipt.status || 'COMPLETED'}</span>
              </div>
            </div>
          </div>

          {/* Reference IDs */}
          <div className="space-y-2 text-xs font-mono">
            {/* PayPal Order ID */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-slate-400 text-[10px] uppercase font-sans font-medium">
                  PayPal Order Reference ID
                </div>
                <div className="text-slate-200 truncate font-semibold">{receipt.orderId}</div>
              </div>
              <button
                onClick={() => copyToClipboard(receipt.orderId, 'order')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
                title="Copy Order ID"
              >
                {copiedKey === 'order' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* PayPal Capture ID */}
            {receipt.captureId && (
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="text-slate-400 text-[10px] uppercase font-sans font-medium">
                    PayPal Capture Reference ID
                  </div>
                  <div className="text-slate-200 truncate font-semibold">{receipt.captureId}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(receipt.captureId, 'capture')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
                  title="Copy Capture ID"
                >
                  {copiedKey === 'capture' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Timestamp</span>
              </div>
              <div className="text-slate-200 font-medium truncate">{formattedDate}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <User className="w-3.5 h-3.5" />
                <span>Buyer Account</span>
              </div>
              <div className="text-slate-200 font-medium truncate">
                {receipt.payer?.name || receipt.payer?.email || 'Sandbox Buyer'}
              </div>
            </div>
          </div>

          {/* Purchased Items Summary */}
          {receipt.orderSummary?.items && (
            <div className="border-t border-slate-800 pt-3">
              <span className="text-xs text-slate-400 block mb-2">Purchased Product(s)</span>
              {receipt.orderSummary.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 text-slate-300">
                  <span className="truncate pr-2">
                    {item.name} <span className="text-slate-500 font-mono">× {item.quantity}</span>
                  </span>
                  <span className="font-mono font-semibold text-white shrink-0">
                    ${item.itemTotal.toFixed(2)} USD
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all"
            >
              Done / Start New Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
