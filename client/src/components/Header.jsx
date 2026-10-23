import React from 'react';
import { Bot, ShieldCheck, ShoppingBag, Layers, ExternalLink } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, paypalStatus }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hackathon Tag */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Agent<span className="text-blue-400">Pay</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  PayPal + AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Shopping & Checkout Agent</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'assistant'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Agent</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Catalogue</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all hidden md:flex items-center space-x-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Specs & Architecture</span>
            </button>
          </nav>

          {/* Status Indicators */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold">PayPal Sandbox:</span>
              <span className="hidden sm:inline">Active (USD)</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
