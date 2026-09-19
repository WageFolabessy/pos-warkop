'use client';

import React, { useState, useMemo } from 'react';
import { MenuItem, Category } from '@/types/pos';
import { MENU_ITEMS } from '@/data/menu';
import { formatIDR } from '@/lib/formatters';
import { Search, X } from 'lucide-react';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'minuman', label: 'Kopi & Minuman' },
  { id: 'makanan', label: 'Makanan' },
  { id: 'camilan', label: 'Camilan' },
];

interface MenuCatalogPanelProps {
  onSelectItem: (item: MenuItem) => void;
  activeTargetLabel?: string;
  onBackToTables?: () => void;
  cartItemCounts?: Record<string, number>;
  className?: string;
}

export const MenuCatalogPanel: React.FC<MenuCatalogPanelProps> = ({
  onSelectItem,
  activeTargetLabel,
  onBackToTables,
  cartItemCounts = {},
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section
      className={`no-print flex-1 flex flex-col h-full bg-stone-100 overflow-hidden select-none ${className}`}
    >
      {/* Mobile Top Navigation Banner (Visible on mobile/portrait) */}
      {onBackToTables && (
        <div className="lg:hidden px-3.5 py-2.5 bg-white border-b border-stone-200 flex items-center justify-between">
          <button
            id="btn-back-to-tables"
            onClick={onBackToTables}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 cursor-pointer min-h-9"
          >
            <span>←</span>
            <span>Daftar Meja</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Target: {activeTargetLabel || 'Meja'}</span>
          </div>
        </div>
      )}

      {/* Top Filter & Search Bar */}
      <div className="p-3 sm:p-4 border-b border-stone-200 bg-white flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer min-h-10 flex items-center justify-center ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input with Instant Clear Button */}
        <div className="relative min-w-50 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="menu-search-input"
            type="text"
            placeholder="Cari nama menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white text-stone-900 transition-colors min-h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Cards Grid - Commercial Style: Clean touch cards, instant tap, in-cart badge */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-28 lg:pb-4">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-stone-500">
            <p className="text-sm font-semibold text-stone-700">Menu tidak ditemukan</p>
            <p className="text-xs text-stone-400 mt-0.5">Coba gunakan kata kunci lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredItems.map((item) => {
              const inCartQty = cartItemCounts[item.id] || 0;
              return (
                <button
                  key={item.id}
                  id={`btn-menu-${item.id}`}
                  onClick={() => onSelectItem(item)}
                  className="group relative text-left bg-white border border-stone-200 hover:border-stone-400 active:scale-[0.98] p-3.5 sm:p-4 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-100 flex flex-col justify-between min-h-24 sm:min-h-28 cursor-pointer select-none"
                >
                  {/* In-Cart Counter Badge */}
                  {inCartQty > 0 && (
                    <span className="absolute top-2.5 right-2.5 bg-stone-900 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xs animate-in fade-in duration-100">
                      {inCartQty}x
                    </span>
                  )}

                  {/* Item Name */}
                  <div className="pr-7">
                    <h3 className="font-semibold text-xs sm:text-sm text-stone-900 leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                  </div>

                  {/* Formatted Tabular Price */}
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="font-mono font-bold text-xs sm:text-sm text-stone-800 tabular-nums">
                      {formatIDR(item.price)}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium group-hover:text-stone-700">
                      + Tambah
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
