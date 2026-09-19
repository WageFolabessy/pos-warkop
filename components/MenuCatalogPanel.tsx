'use client';

import React, { useState, useMemo } from 'react';
import { MenuItem, Category } from '@/types/pos';
import { MENU_ITEMS } from '@/data/menu';
import { formatIDR } from '@/lib/formatters';
import {
  Coffee,
  CupSoda,
  GlassWater,
  Sparkles,
  UtensilsCrossed,
  Soup,
  ChefHat,
  Flame,
  Cookie,
  Sandwich,
  Search,
  Plus,
} from 'lucide-react';

interface MenuCatalogPanelProps {
  onSelectItem: (item: MenuItem) => void;
}

// Icon mapper for menu items
const renderMenuIcon = (iconName: string) => {
  const iconProps = { className: 'w-6 h-6 stroke-[2]' };
  switch (iconName) {
    case 'Coffee':
      return <Coffee {...iconProps} />;
    case 'CupSoda':
      return <CupSoda {...iconProps} />;
    case 'GlassWater':
      return <GlassWater {...iconProps} />;
    case 'Sparkles':
      return <Sparkles {...iconProps} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed {...iconProps} />;
    case 'Soup':
      return <Soup {...iconProps} />;
    case 'ChefHat':
      return <ChefHat {...iconProps} />;
    case 'Flame':
      return <Flame {...iconProps} />;
    case 'Cookie':
      return <Cookie {...iconProps} />;
    case 'Sandwich':
      return <Sandwich {...iconProps} />;
    default:
      return <Coffee {...iconProps} />;
  }
};

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
  className?: string;
}

export const MenuCatalogPanel: React.FC<MenuCatalogPanelProps> = ({
  onSelectItem,
  activeTargetLabel,
  onBackToTables,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section
      className={`no-print flex-1 flex flex-col h-full bg-[#FAF7F2] overflow-hidden select-none ${className}`}
    >
      {/* Mobile Top Navigation Banner (Visible on mobile/portrait) */}
      {onBackToTables && (
        <div className="lg:hidden px-3.5 py-2.5 bg-stone-100/90 border-b border-stone-200 flex items-center justify-between">
          <button
            id="btn-back-to-tables"
            onClick={onBackToTables}
            className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-white px-3 py-1.5 rounded-xl border border-stone-300 shadow-2xs cursor-pointer min-h-9"
          >
            <span>←</span>
            <span>Daftar Meja</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300/60">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Target: {activeTargetLabel || 'Meja'}</span>
          </div>
        </div>
      )}

      {/* Top Filter & Search Bar */}
      <div className="p-3 sm:p-4 border-b border-stone-200 bg-white/70 backdrop-blur-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer min-h-11 flex items-center justify-center ${
                  isActive
                    ? 'bg-[#291811] text-amber-400 shadow-sm ring-1 ring-amber-600/30'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-50 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
          <input
            id="menu-search-input"
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-100/90 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-white text-stone-900 transition-colors min-h-10"
          />
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-28 lg:pb-4">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-stone-600">
            <Coffee className="w-10 h-10 stroke-[1.5] mb-2 text-stone-300" />
            <p className="text-sm font-semibold">Menu tidak ditemukan</p>
            <p className="text-xs text-stone-600">Coba ganti kata kunci atau kategori filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                id={`btn-menu-${item.id}`}
                onClick={() => onSelectItem(item)}
                className="group relative text-left bg-white border border-stone-200/90 hover:border-amber-500/70 p-3 sm:p-3.5 rounded-2xl shadow-xs hover:shadow-md active:scale-97 transition-all duration-150 flex flex-col justify-between min-h-35 cursor-pointer overflow-hidden"
              >
                {/* Background Amber Glow on Hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full z-0 opacity-40 group-hover:opacity-100 transition-opacity" />

                {/* Card Top: Icon & Badge */}
                <div className="relative z-10 flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors shrink-0">
                    {renderMenuIcon(item.iconName)}
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Card Middle: Name & Description */}
                <div className="relative z-10 mt-2">
                  <h3 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug group-hover:text-amber-900 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>

                {/* Card Bottom: Price & Quick Add Button (44px touch target) */}
                <div className="relative z-10 mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-black text-xs sm:text-sm text-stone-900 tracking-tight">
                    {formatIDR(item.price)}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 flex items-center justify-center transition-colors shadow-xs shrink-0">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
