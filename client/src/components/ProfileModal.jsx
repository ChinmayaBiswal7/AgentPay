import React from 'react';
import {
  X,
  User,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  PackageCheck,
  Clock,
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, purchaseHistory = [], onViewReceipt }) {
  const [copiedId, setCopiedId] = React.useState(null);

  if (!isOpen) return null;

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalSpent = purchaseHistory.reduce((sum, order) => {
    const val = parseFloat(order.amount?.value || order.orderSummary?.breakdown?.total || 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F141F] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Buyer Profile & Orders</h2>
              <p className="text-xs text-slate-400">Verified PayPal Sandbox Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* User Account Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 font-bold text-lg">
                SB
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-base">Sandbox Buyer</span>
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">buyer-personal@sandbox.paypal.com</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Orders</span>
                <span className="text-lg font-extrabold text-white font-mono">{purchaseHistory.length}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Spent</span>
                <span className="text-lg font-extrabold text-sky-400 font-mono">${totalSpent.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-sky-400" />
                <span>Purchase History ({purchaseHistory.length})</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">PayPal Orders v2</span>
            </div>

            {purchaseHistory.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 p-6 space-y-2">
                <PackageCheck className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No purchases yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you complete checkout through PayPal Sandbox, your verified orders and receipts will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {purchaseHistory.map((order, idx) => {
                  const items = order.orderSummary?.items || [];
                  const total = order.amount?.value || order.orderSummary?.breakdown?.total || '0.00';
                  const dateStr = order.capturedAt
                    ? new Date(order.capturedAt).toLocaleDateString()
                    : new Date().toLocaleDateString();

                  return (
                    <div
                      key={order.orderId || idx}
                      className="p-4 rounded-2xl bg-[#131926] border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md"
                    >
                      {/* Top Row: Items & Amount */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          {items.length > 0 ? (
                            items.map((it, i) => (
                              <div key={i} className="flex items-center space-x-2 text-sm font-semibold text-white">
                                <span className="truncate">{it.name}</span>
                                <span className="text-xs text-slate-400 font-mono">×{it.quantity}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm font-semibold text-white">AgentPay Product Order</div>
                          )}
                          <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{dateStr}</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>COMPLETED</span>
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-sky-400 font-mono">
                            ${total} <span className="text-xs text-slate-400 font-normal">USD</span>
                          </div>
                          {onViewReceipt && (
                            <button
                              onClick={() => {
                                onViewReceipt(order);
                                onClose();
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline mt-0.5 inline-block"
                            >
                              View Receipt →
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reference IDs row */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <span className="text-slate-500 text-[11px]">Order:</span>
                          <span className="text-slate-300 truncate max-w-[150px]">{order.orderId}</span>
                          <button
                            onClick={() => copyText(order.orderId, `order-${idx}`)}
                            className="p-1 hover:text-white transition-colors"
                            title="Copy Order ID"
                          >
                            {copiedId === `order-${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {order.captureId && (
                          <div className="flex items-center space-x-1.5 text-slate-400">
                            <span className="text-slate-500 text-[11px]">Capture:</span>
                            <span className="text-slate-300 truncate max-w-[150px]">{order.captureId}</span>
                            <button
                              onClick={() => copyText(order.captureId, `cap-${idx}`)}
                              className="p-1 hover:text-white transition-colors"
                              title="Copy Capture ID"
                            >
                              {copiedId === `cap-${idx}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
