import React from 'react';
import { Bot, ShoppingBag, Layers, ShieldCheck, Zap } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onResetChat }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo */}
          <button
            onClick={() => {
              setActiveTab('assistant');
              if (onResetChat) onResetChat();
            }}
            className="flex items-center space-x-2.5 group text-left transition-opacity hover:opacity-90"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-600/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-bold tracking-tight text-white">
                  Agent<span className="text-sky-400">Pay</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-blue-500/10 text-sky-400 border border-blue-500/20">
                  PayPal + AI
                </span>
              </div>
            </div>
          </button>

          {/* Clean Segmented Tab Navigation */}
          <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Catalogue</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all hidden sm:flex items-center space-x-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>
          </nav>

          {/* Sandbox Status Badge */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>PayPal Sandbox</span>
              <span className="text-emerald-500/60 hidden sm:inline">• USD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
