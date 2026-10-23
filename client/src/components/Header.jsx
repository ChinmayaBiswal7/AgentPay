import React from 'react';
import { Bot, ShoppingBag, PanelLeft, User } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onToggleSidebar,
  isSidebarOpen,
  onOpenProfile,
  orderCount = 0,
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#0B0F17]/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: Single Sidebar Toggle Button & Brand (when sidebar collapsed) */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl transition-all ${
                isSidebarOpen
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-sky-400 bg-blue-600/10 hover:bg-blue-600/20'
              }`}
              title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            {!isSidebarOpen && (
              <span className="font-extrabold text-white text-base tracking-tight animate-in fade-in">
                Agent<span className="text-sky-400">Pay</span>
              </span>
            )}
          </div>

          {/* Center: Clean Segmented Navigation (Assistant & Catalogue only) */}
          <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'assistant'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Catalogue</span>
            </button>
          </nav>

          {/* Right: Sandbox Status & Orders Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
              title="View Purchase History"
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Orders</span>
              {orderCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 font-mono">
                  {orderCount}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">PayPal Sandbox</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
