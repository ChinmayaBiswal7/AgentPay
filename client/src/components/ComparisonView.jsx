import React from 'react';
import { Check, X, Star, ShoppingBag, ArrowRight } from 'lucide-react';

export default function ComparisonView({ comparison, onSelectOrder }) {
  if (!comparison || !comparison.products || comparison.products.length < 2) {
    return null;
  }

  const { products } = comparison;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 my-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Side-by-Side Analysis
          </span>
          <h3 className="text-lg font-bold text-white">Product Specification & Value Comparison</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-md">
          {products.length} Models Grounded in Catalogue
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="p-3 text-xs font-semibold text-slate-400 w-1/4">Criteria</th>
              {products.map((p) => (
                <th key={p.id} className="p-3 w-1/3">
                  <div className="font-bold text-white text-base">{p.name}</div>
                  <div className="text-blue-400 text-lg font-black mt-1">
                    ${p.price.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-400">USD</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {/* Rating */}
            <tr>
              <td className="p-3 text-xs font-medium text-slate-400">Rating & Reviews</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 font-medium text-amber-400 flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{p.rating} / 5</span>
                  <span className="text-slate-400 text-xs">({p.reviewCount})</span>
                </td>
              ))}
            </tr>

            {/* RAM */}
            <tr>
              <td className="p-3 text-xs font-medium text-slate-400">RAM / Memory</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 font-semibold text-slate-200">
                  {p.specs?.ram || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Processor */}
            <tr>
              <td className="p-3 text-xs font-medium text-slate-400">Processor / Chip</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-xs">
                  {p.specs?.cpu || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Storage */}
            <tr>
              <td className="p-3 text-xs font-medium text-slate-400">Storage</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-xs">
                  {p.specs?.storage || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Battery Life */}
            <tr>
              <td className="p-3 text-xs font-medium text-slate-400">Battery Endurance</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-xs font-medium text-emerald-400">
                  {p.specs?.batteryLife || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Display / Weight */}
            <tr>
              <td className="p-3 text-xs font-medium text-slate-400">Display & Portability</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-xs text-slate-300">
                  {p.specs?.display || ''} {p.specs?.weight ? `• ${p.specs.weight}` : ''}
                </td>
              ))}
            </tr>

            {/* Best For */}
            <tr>
              <td className="p-3 text-xs font-medium text-slate-400">Recommended For</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-xs italic text-blue-300">
                  {p.bestFor}
                </td>
              ))}
            </tr>

            {/* Select Action Button */}
            <tr>
              <td className="p-3 text-xs font-medium text-slate-400">Action</td>
              {products.map((p) => (
                <td key={p.id} className="p-3">
                  <button
                    onClick={() => onSelectOrder(p)}
                    className="w-full px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-md shadow-blue-600/20"
                  >
                    <span>Checkout This</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
