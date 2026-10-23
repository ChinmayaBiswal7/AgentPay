import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Wrench,
  Clock,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
} from 'lucide-react';
import ProductCard from './ProductCard';
import ComparisonView from './ComparisonView';

const SUGGESTIONS = [
  'Find me a laptop for programming under $700 with at least 16 GB RAM and good battery life.',
  'Best wireless noise-cancelling headphones under $250 for focus',
  'Compare 4K monitors with USB-C docking for developer desk',
  'Show me mechanical keyboards and ergonomic accessories under $120',
];

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  onSelectOrder,
  onToggleCompare,
  comparedIds,
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleSuggestionClick = (prompt) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-6xl mx-auto px-4 py-4 sm:px-6">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Welcome Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-900 border border-blue-500/20 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">AgentPay Assistant</h1>
              <p className="text-xs text-slate-400">
                AI Intent Extraction • Grounded Product Discovery • Side-by-Side Comparison • PayPal Checkout
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Ask any shopping requirement in plain English. AgentPay extracts your constraints (budget ceiling, RAM, form factor), verifies real inventory against our server catalogue, compares options, and assists you through official PayPal Sandbox checkout.
          </p>

          {/* Quick Prompts */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Try a hackathon scenario prompt:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  disabled={isLoading}
                  className="text-left text-xs px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 transition-all flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
                >
                  <span className="truncate max-w-md">{s}</span>
                  <ArrowRight className="w-3 h-3 shrink-0 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Stream */}
        {messages.map((msg, index) => (
          <div key={index} className="space-y-4 animate-in fade-in duration-300">
            {/* User message */}
            {msg.role === 'user' && (
              <div className="flex items-start justify-end space-x-3">
                <div className="max-w-xl p-4 rounded-2xl rounded-tr-none bg-blue-600 text-white text-sm shadow-lg leading-relaxed">
                  {msg.content}
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md">
                  <User className="w-5 h-5" />
                </div>
              </div>
            )}

            {/* Assistant response */}
            {msg.role === 'assistant' && (
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-lg shadow-blue-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-4 max-w-4xl">
                  {/* Tool execution badges */}
                  {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center space-x-1.5 text-blue-400 font-bold uppercase tracking-wider text-[10px]">
                        <Wrench className="w-3 h-3" />
                        <span>Agent Tools Executed</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.toolsExecuted.map((tool, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 text-slate-300"
                          >
                            <span className="text-emerald-400 font-semibold">{tool.tool}()</span>
                            <span className="text-slate-500 text-[10px]">
                              {JSON.stringify(tool.args).substring(0, 40)}
                              {JSON.stringify(tool.args).length > 40 ? '...' : ''}
                            </span>
                            <span className="text-slate-500 text-[9px] flex items-center space-x-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{tool.durationMs || 1}ms</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Text Message */}
                  <div className="p-5 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-slate-200 text-sm leading-relaxed shadow-xl space-y-3">
                    <div className="whitespace-pre-line">{msg.content}</div>
                  </div>

                  {/* Recommended Product Cards Grid */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Grounded Recommendations ({msg.recommendedProducts.length})
                        </span>
                        <span className="text-xs text-blue-400 font-medium">
                          Strictly verified against demo catalogue
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {msg.recommendedProducts.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            onSelectOrder={onSelectOrder}
                            onToggleCompare={onToggleCompare}
                            isCompared={comparedIds?.includes(p.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comparison View Table if available */}
                  {msg.comparison && (
                    <ComparisonView
                      comparison={msg.comparison}
                      onSelectOrder={onSelectOrder}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3 animate-in fade-in duration-200">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>AgentPay is extracting intent, filtering catalogue & evaluating trade-offs...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-3 pt-2 border-t border-slate-800/80">
        <div className="relative flex items-center bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl focus-within:border-blue-500 transition-all p-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. Find me a laptop for programming under $700 with at least 16 GB RAM..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium shadow-md shadow-blue-600/20 transition-all active:scale-95"
            title="Send request"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-2">
          <span>AI outputs are grounded in verified demo catalogue data.</span>
          <span className="font-mono">PayPal Orders v2 • CAPTURE mode</span>
        </div>
      </form>
    </div>
  );
}
