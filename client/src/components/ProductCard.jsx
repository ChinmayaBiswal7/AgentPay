import React from 'react';
import { Star, Cpu, Battery, HardDrive, ShoppingBag, ArrowRight, Check } from 'lucide-react';

export default function ProductCard({ product, onSelectOrder, onToggleCompare, isCompared }) {
  if (!product) return null;

  return (
    <div className="group relative bg-[#111622] border border-slate-800/80 hover:border-blue-500/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col">
      {/* Product Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111622] via-[#111622]/20 to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-black/60 backdrop-blur-md text-sky-400 border border-white/10">
            {product.category}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
            {product.brand}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-400 text-[11px] font-semibold border border-white/10">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{product.rating}</span>
        </div>

        {/* Bottom Price */}
        <div className="absolute bottom-2.5 left-3">
          <div className="text-xl font-extrabold text-white tracking-tight drop-shadow-md">
            ${product.price.toFixed(2)}{' '}
            <span className="text-[11px] font-normal text-slate-300">USD</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <h4 className="font-semibold text-sm text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
            {product.name}
          </h4>
          <p className="text-[12px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.bestFor}
          </p>
        </div>

        {/* Key Specs Row */}
        {product.specs && (
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {product.specs.ram && (
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 truncate">
                <Cpu className="w-3 h-3 text-sky-400 shrink-0" />
                <span className="truncate">{product.specs.ram}</span>
              </div>
            )}
            {product.specs.batteryLife && (
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 truncate">
                <Battery className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{product.specs.batteryLife}</span>
              </div>
            )}
            {product.specs.storage && (
              <div className="col-span-2 flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 truncate">
                <HardDrive className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">{product.specs.storage} • {product.specs.cpu || product.specs.display || ''}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-1 flex items-center space-x-2">
          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(product.id)}
              className={`px-2.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                isCompared
                  ? 'bg-blue-600/20 text-sky-400 border-blue-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {isCompared ? <Check className="w-3.5 h-3.5" /> : 'Compare'}
            </button>
          )}

          <button
            onClick={() => onSelectOrder(product)}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <span>Review Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
