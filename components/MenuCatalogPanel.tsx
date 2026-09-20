'use client';

import React, { useState, useMemo } from 'react';
import { MenuItem, Category } from '@/types/pos';
import { MENU_ITEMS } from '@/data/menu';
import { formatIDR } from '@/lib/formatters';
import { Search, X, ArrowLeft } from 'lucide-react';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'minuman', label: 'Minuman' },
  { id: 'makanan', label: 'Makanan' },
  { id: 'cemilan', label: 'Cemilan' },
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
      const isCemilanMatch =
        (selectedCategory === 'cemilan' || selectedCategory === 'camilan') &&
        (item.category === 'cemilan' || item.category === 'camilan');
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory || isCemilanMatch;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section
      className={`no-print flex-1 flex flex-col h-full bg-gray-50 overflow-hidden select-none ${className}`}
    >
      {/* Mobile Top Navigation Banner (Visible on mobile/portrait) */}
      {onBackToTables && (
        <div className="lg:hidden px-3.5 py-2.5 bg-white border-b border-gray-200 flex items-center justify-between">
          <button
            id="btn-back-to-tables"
            onClick={onBackToTables}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-100/60 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer min-h-9"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Meja</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
            <span>{activeTargetLabel || 'Meja'}</span>
          </div>
        </div>
      )}

      {/* Top Filter & Search Bar */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer min-h-10 flex items-center justify-center ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input with Instant Clear Button */}
        <div className="relative min-w-50 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="menu-search-input"
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-gray-900 transition-colors min-h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-28 lg:pb-4">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500">
            <p className="text-sm font-medium text-gray-700">Menu tidak ditemukan</p>
            <p className="text-xs text-gray-400 mt-0.5">Coba gunakan kata kunci lain</p>
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
                  className="group relative text-left bg-white border border-gray-200 hover:border-gray-300 active:scale-[0.98] p-3.5 sm:p-4 rounded-xl transition-all duration-100 flex flex-col justify-between min-h-24 sm:min-h-28 cursor-pointer select-none"
                >
                  {/* In-Cart Counter Badge */}
                  {inCartQty > 0 && (
                    <span className="absolute top-2.5 right-2.5 bg-[#0071e3] text-white text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full animate-in fade-in duration-100">
                      {inCartQty}x
                    </span>
                  )}

                  {/* Item Name */}
                  <div className="pr-7">
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-900 leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                  </div>

                  {/* Formatted Tabular Price */}
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-mono font-semibold text-xs sm:text-sm text-gray-900 tabular-nums">
                      {formatIDR(item.price)}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium group-hover:text-gray-600">
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
