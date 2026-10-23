import React, { useState } from 'react';
import { Star, ArrowRight, ChevronDown, ChevronUp, Scale } from 'lucide-react';

export default function ComparisonView({ comparison, onSelectOrder }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!comparison || !comparison.products || comparison.products.length < 2) {
    return null;
  }

  const { products } = comparison;

  return (
    <div className="bg-[#111622] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg transition-all">
      {/* Header with Collapse Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3.5 bg-slate-900/60 cursor-pointer hover:bg-slate-900 select-none border-b border-slate-800/60"
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600/20 text-sky-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Side-by-Side Model Comparison
            </h4>
            <span className="text-[11px] text-slate-400">
              Comparing {products.length} models across key specifications
            </span>
          </div>
        </div>

        <button className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Collapsible Body */}
      {isExpanded && (
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="p-2.5 text-slate-400 font-medium w-1/4">Criteria</th>
                {products.map((p) => (
                  <th key={p.id} className="p-2.5 w-1/3">
                    <div className="font-bold text-white text-xs truncate max-w-[160px]">{p.name}</div>
                    <div className="text-sky-400 font-extrabold text-sm mt-0.5 font-mono">
                      ${p.price.toFixed(2)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">USD</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {/* Rating */}
              <tr>
                <td className="p-2.5 text-slate-400">Rating</td>
                {products.map((p) => (
                  <td key={p.id} className="p-2.5 font-medium text-amber-400 flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                    <span>{p.rating}</span>
                    <span className="text-slate-500 text-[10px]">({p.reviewCount})</span>
                  </td>
                ))}
              </tr>

              {/* Memory / Storage */}
              <tr>
                <td className="p-2.5 text-slate-400">Memory / Storage</td>
                {products.map((p) => (
                  <td key={p.id} className="p-2.5 font-semibold text-slate-200">
                    {p.specs?.ram || p.specs?.storage || 'Standard'}
                  </td>
                ))}
              </tr>

              {/* Processor / Chip */}
              <tr>
                <td className="p-2.5 text-slate-400">Processor / Specs</td>
                {products.map((p) => (
                  <td key={p.id} className="p-2.5 text-slate-300 truncate max-w-[150px]">
                    {p.specs?.cpu || p.specs?.chip || p.specs?.display || 'Flagship Class'}
                  </td>
                ))}
              </tr>

              {/* Battery */}
              <tr>
                <td className="p-2.5 text-slate-400">Battery Life</td>
                {products.map((p) => (
                  <td key={p.id} className="p-2.5 text-emerald-400 font-medium">
                    {p.specs?.batteryLife || 'All-Day Battery'}
                  </td>
                ))}
              </tr>

              {/* Best For */}
              <tr>
                <td className="p-2.5 text-slate-400">Best For</td>
                {products.map((p) => (
                  <td key={p.id} className="p-2.5 text-slate-400 italic text-[11px] leading-tight">
                    {p.bestFor}
                  </td>
                ))}
              </tr>

              {/* Action Button */}
              <tr>
                <td className="p-2.5 text-slate-400">Action</td>
                {products.map((p) => (
                  <td key={p.id} className="p-2.5">
                    <button
                      onClick={() => onSelectOrder(p)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-1 shadow-sm transition-all"
                    >
                      <span>Checkout</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
