import React from 'react';
import { Star, CheckCircle, Cpu, Battery, HardDrive, ShoppingCart, ArrowRight } from 'lucide-react';

export default function ProductCard({ product, onSelectOrder, onToggleCompare, isCompared }) {
  if (!product) return null;

  return (
    <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col">
      {/* Product Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-blue-400 border border-slate-700/80">
            {product.category}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/80">
            {product.brand}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {product.inStock ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>In Stock</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 backdrop-blur-md text-red-400 border border-red-500/30">
              Out of stock
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between">
          <div className="text-2xl font-black tracking-tight text-white drop-shadow">
            ${product.price.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-300">USD</span>
          </div>
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-semibold border border-slate-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            <span className="text-slate-400">({product.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.bestFor}
          </p>
        </div>

        {/* Specs Pills */}
        {product.specs && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {product.specs.ram && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-800 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{product.specs.ram}</span>
              </div>
            )}
            {product.specs.batteryLife && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-800 text-slate-300">
                <Battery className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{product.specs.batteryLife}</span>
              </div>
            )}
            {product.specs.storage && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-800 text-slate-300 col-span-2">
                <HardDrive className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{product.specs.storage} • {product.specs.cpu || product.specs.display || ''}</span>
              </div>
            )}
          </div>
        )}

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <div className="space-y-1 pt-1">
            {product.highlights.slice(0, 2).map((hl, i) => (
              <div key={i} className="flex items-start space-x-1.5 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{hl}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center space-x-2">
          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(product.id)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isCompared
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
              title="Compare specifications"
            >
              {isCompared ? 'Compared ✓' : 'Compare'}
            </button>
          )}

          <button
            onClick={() => onSelectOrder(product)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Select & Review Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
