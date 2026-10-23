import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from './ProductCard';
import ComparisonView from './ComparisonView';
import { getProducts, compareProducts as fetchComparison } from '../services/api';

const CATEGORIES = ['All', 'Laptops', 'Audio', 'Monitors', 'Accessories'];

export default function CatalogBrowser({ onSelectOrder }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [comparedIds, setComparedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getProducts({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          q: searchQuery || undefined,
          maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        });
        setProducts(res.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, maxPrice]);

  const toggleCompare = async (productId) => {
    let next;
    if (comparedIds.includes(productId)) {
      next = comparedIds.filter((id) => id !== productId);
    } else {
      if (comparedIds.length >= 3) {
        alert('You can compare up to 3 products at a time.');
        return;
      }
      next = [...comparedIds, productId];
    }
    setComparedIds(next);

    if (next.length >= 2) {
      try {
        const res = await fetchComparison(next);
        setComparisonData(res.comparison);
      } catch (err) {
        console.error(err);
      }
    } else {
      setComparisonData(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Product Catalogue</h2>
            <p className="text-xs text-slate-400 mt-1">
              Browse realistic demo items available for PayPal Sandbox checkout
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specifications, names..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Categories & Price Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Ceiling Slider */}
          <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs text-slate-400">Budget Max:</span>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-32 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-white w-14">
              {maxPrice >= 1000 ? 'Any' : `$${maxPrice}`}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Comparison Drawer if products selected */}
      {comparisonData && (
        <div className="relative">
          <ComparisonView
            comparison={comparisonData}
            onSelectOrder={onSelectOrder}
          />
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono">Loading catalogue items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No products match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try loosening the budget filter or searching a different term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectOrder={onSelectOrder}
              onToggleCompare={toggleCompare}
              isCompared={comparedIds.includes(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
