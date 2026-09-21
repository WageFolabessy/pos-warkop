'use client';

import React, { useState, useMemo } from 'react';
import { TableOrder, MenuItem, OrderItem, Category } from '@/types/pos';
import { MENU_ITEMS } from '@/data/menu';
import { formatIDR } from '@/lib/formatters';
import { ItemNotesModal } from './ItemNotesModal';
import {
  ShoppingBag,
  Search,
  X,
  Send,
  CheckCircle2,
  FileText,
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  ListOrdered,
  RotateCcw,
  ArrowLeft,
  ClipboardList,
} from 'lucide-react';

interface WaiterViewProps {
  tables: TableOrder[];
  activeTargetId: string;
  activeTable: TableOrder | null;
  draftItems: OrderItem[];
  draftTotalCount: number;
  draftSubtotal?: number;
  onSelectTarget: (targetId: string) => void;
  onAddItem: (item: MenuItem) => void;
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onUpdateNotes: (menuItemId: string, notes: string) => void;
  onSaveOrder: () => void;
  onResetOrder?: () => void;
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'minuman', label: 'Minuman' },
  { id: 'makanan', label: 'Makanan' },
  { id: 'cemilan', label: 'Cemilan' },
];

export const WaiterView: React.FC<WaiterViewProps> = ({
  tables,
  activeTargetId,
  activeTable,
  draftItems,
  draftTotalCount,
  draftSubtotal,
  onSelectTarget,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  onSaveOrder,
  onResetOrder,
}) => {
  // Waiter flow steps: 'tables' -> 'menu'
  const [currentStep, setCurrentStep] = useState<'tables' | 'menu'>('tables');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingNotesItem, setEditingNotesItem] = useState<OrderItem | null>(null);
  const [showOrderReviewDrawer, setShowOrderReviewDrawer] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [showActiveOrdersSummary, setShowActiveOrdersSummary] = useState(false);

  const takeaway = tables.find((t) => t.isTakeaway);
  const physicalTables = tables.filter((t) => !t.isTakeaway);

  // Active occupied tables with orders
  const occupiedTables = useMemo(() => {
    return tables.filter((t) => t.status === 'belum_lunas' && t.items.length > 0);
  }, [tables]);

  const totalActiveItemsCount = useMemo(() => {
    return occupiedTables.reduce(
      (sum, tbl) => sum + tbl.items.reduce((s, it) => s + it.quantity, 0),
      0
    );
  }, [occupiedTables]);

  const totalActiveRevenue = useMemo(() => {
    return occupiedTables.reduce(
      (sum, tbl) => sum + tbl.items.reduce((s, it) => s + it.menuItem.price * it.quantity, 0),
      0
    );
  }, [occupiedTables]);

  // Current draft order total price
  const currentSubtotal = useMemo(() => {
    return (
      draftSubtotal ??
      draftItems.reduce((sum, it) => sum + it.menuItem.price * it.quantity, 0)
    );
  }, [draftSubtotal, draftItems]);

  // In-cart counts mapping
  const cartItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    draftItems.forEach((item) => {
      counts[item.menuItem.id] = (counts[item.menuItem.id] || 0) + item.quantity;
    });
    return counts;
  }, [draftItems]);

  // Filtered menu items
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

  // Step 1: Handle selecting table
  const handleSelectTable = (targetId: string) => {
    onSelectTarget(targetId);
    setCurrentStep('menu');
  };

  // Step 3: Handle send order to cashier
  const handleSendOrder = () => {
    const tableLabel = activeTable?.label || 'Meja';
    onSaveOrder();
    setShowOrderReviewDrawer(false);
    setSuccessToast(`Pesanan ${tableLabel} Berhasil Dikirim ke Kasir!`);
    setCurrentStep('tables');

    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 select-none overflow-hidden relative">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-white text-gray-900 px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-xs font-medium">{successToast}</span>
        </div>
      )}

      {/* =========================================================================
          LANGKAH 1: PILIH MEJA (Step: 'tables')
          Tanpa akses finansial / omzet / harga
         ========================================================================= */}
      {currentStep === 'tables' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Sub-header: Ringkasan Pesanan Bar */}
          <div className="bg-white border-b border-gray-200 px-3 py-2.5 sm:px-4 flex items-center justify-between gap-2 shrink-0">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium block">
                Pelayan
              </span>
              <h2 className="font-semibold text-sm text-gray-900 leading-tight">
                Daftar Meja & Pesanan
              </h2>
            </div>

            <button
              id="waiter-btn-all-orders-summary"
              onClick={() => setShowActiveOrdersSummary(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors cursor-pointer text-xs font-medium min-h-10"
              title="Lihat ringkasan seluruh pesanan aktif"
            >
              <ClipboardList className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>Ringkasan Pesanan</span>
              {occupiedTables.length > 0 && (
                <span className="ml-0.5 bg-[#0071e3] text-white text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full">
                  {occupiedTables.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {/* Takeaway Card */}
            <button
              id="waiter-target-takeaway"
              onClick={() => handleSelectTable('takeaway')}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between min-h-14 bg-white active:scale-[0.99] ${
                activeTargetId === 'takeaway'
                  ? 'border-gray-900 ring-2 ring-gray-900'
                  : takeaway?.status === 'belum_lunas'
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    takeaway?.status === 'belum_lunas'
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-gray-900 block">
                    Bungkus
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {takeaway?.status === 'belum_lunas' ? (
                        <span className="font-mono">
                          {takeaway.items.reduce((s, it) => s + it.quantity, 0)} item • {formatIDR(takeaway.items.reduce((s, it) => s + it.menuItem.price * it.quantity, 0))}
                        </span>
                      ) : (
                        'Bawa pulang'
                      )}
                    </span>
                    {takeaway?.kitchenStatus === 'siap_saji' && (
                      <span className="text-[10px] text-gray-700 font-semibold bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                        Siap Antar
                      </span>
                    )}
                    {takeaway?.kitchenStatus === 'dimasak' && (
                      <span className="text-[10px] text-gray-600 font-medium bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                        {(() => {
                          const done = takeaway.items.filter((it) => (takeaway.completedItemIds || []).includes(it.menuItem.id)).length;
                          return done > 0 ? `${done}/${takeaway.items.length} Siap` : 'Diracik';
                        })()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <span className="text-xs font-medium">Pilih</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* 15 Physical Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {physicalTables.map((tbl) => {
                const totalItems = tbl.items.reduce((sum, it) => sum + it.quantity, 0);
                const tableSubtotal = tbl.items.reduce((sum, it) => sum + it.menuItem.price * it.quantity, 0);
                const isOccupied = tbl.status === 'belum_lunas';
                const isSelected = activeTargetId === tbl.targetId;
                const doneCount = tbl.items.filter((it) => (tbl.completedItemIds || []).includes(it.menuItem.id)).length;

                return (
                  <button
                    key={tbl.targetId}
                    id={`waiter-target-${tbl.targetId}`}
                    onClick={() => handleSelectTable(tbl.targetId)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-24 bg-white active:scale-[0.98] ${
                      isSelected
                        ? 'border-gray-900 ring-2 ring-gray-900'
                        : isOccupied
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-base text-gray-900">
                        {tbl.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {tbl.kitchenStatus === 'siap_saji' && (
                          <span className="text-[9px] text-gray-700 font-semibold bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                            Siap
                          </span>
                        )}
                        {tbl.kitchenStatus === 'dimasak' && (
                          <span className="text-[9px] text-gray-600 font-medium bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                            {doneCount > 0 ? `${doneCount}/${tbl.items.length} Siap` : 'Diracik'}
                          </span>
                        )}
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOccupied ? 'bg-gray-900' : 'bg-gray-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      {isOccupied ? (
                        <div className="text-xs font-medium text-gray-700 font-mono">
                          {totalItems} item • {formatIDR(tableSubtotal)}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 font-medium">
                          Tersedia
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LANGKAH 2: PEMILIHAN MENU & CATATAN KHUSUS (Step: 'menu')
         ========================================================================= */}
      {currentStep === 'menu' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Bar for Waiter */}
          <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between gap-2">
            <button
              id="waiter-btn-back-tables"
              onClick={() => setCurrentStep('tables')}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full border border-gray-200 cursor-pointer min-h-10"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Meja</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                {activeTable?.label || 'Meja'}
              </span>

              {/* Reset Order Button for Waiter */}
              {draftTotalCount > 0 && onResetOrder && (
                <button
                  id="waiter-top-btn-reset-order"
                  onClick={onResetOrder}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-2.5 py-2 rounded-full border border-gray-200 hover:border-red-200 transition-colors cursor-pointer min-h-10"
                  title="Kosongkan pesanan meja ini"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Reset</span>
                </button>
              )}

              {/* Button to view review drawer */}
              <button
                id="waiter-btn-review-order"
                onClick={() => setShowOrderReviewDrawer(true)}
                className="flex items-center gap-1.5 bg-[#0071e3] hover:bg-[#0077ED] text-white px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer min-h-10"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>
                  {draftTotalCount > 0
                    ? `${draftTotalCount} item • ${formatIDR(currentSubtotal)}`
                    : '0 item'}
                </span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-3 bg-white border-b border-gray-200 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`waiter-filter-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer min-h-10 flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-50 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
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
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Menu Cards Grid */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-28">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredItems.map((item) => {
                const inCartQty = cartItemCounts[item.id] || 0;
                const existingOrderItem = draftItems.find((it) => it.menuItem.id === item.id);

                return (
                  <div
                    key={item.id}
                    id={`waiter-menu-card-${item.id}`}
                    onClick={() => onAddItem(item)}
                    className="relative text-left bg-white border border-gray-200 hover:border-gray-300 active:scale-[0.98] p-3.5 rounded-xl transition-all duration-100 flex flex-col justify-between min-h-24 sm:min-h-28 cursor-pointer select-none"
                  >
                    {/* In-Cart Badge */}
                    {inCartQty > 0 && (
                      <span className="absolute top-2.5 right-2.5 bg-[#0071e3] text-white text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full">
                        {inCartQty}x
                      </span>
                    )}

                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-gray-900 leading-snug pr-6">
                        {item.name}
                      </h3>
                      <span className="text-xs font-mono font-medium text-gray-600 mt-1 block">
                        {formatIDR(item.price)}
                      </span>

                      {/* Notes Preview if available */}
                      {existingOrderItem?.notes && (
                        <p className="text-[10px] text-gray-600 italic mt-1 bg-gray-50 p-1 rounded border border-gray-200 line-clamp-1">
                          Catatan: {existingOrderItem.notes}
                        </p>
                      )}
                    </div>

                    {/* Card Bottom: Action & Notes Trigger */}
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">
                        + Ketuk isi (+1)
                      </span>

                      {/* Catatan Khusus Button */}
                      {inCartQty > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (existingOrderItem) {
                              setEditingNotesItem(existingOrderItem);
                            }
                          }}
                          className="flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full border border-gray-200 cursor-pointer"
                          title="Tambah/ubah catatan khusus"
                        >
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span>Catatan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              LANGKAH 3: BILAH AKSI BAWAH LAYAR (Kirim Pesanan ke Kasir)
             ========================================================================= */}
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 z-30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOrderReviewDrawer(true)}
                className="text-left cursor-pointer"
              >
                <span className="text-[10px] uppercase tracking-wider text-gray-500 block">
                  {activeTable?.label || 'Pesanan'}
                </span>
                <span className="font-semibold text-sm text-gray-900">
                  {draftTotalCount} Item • {formatIDR(currentSubtotal)}
                </span>
              </button>
            </div>

            <button
              id="waiter-btn-send-to-cashier"
              disabled={draftTotalCount === 0}
              onClick={handleSendOrder}
              className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#0077ED] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 px-5 rounded-full transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm min-h-12"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pesanan ke Kasir</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DRAWER: TINJAU PESANAN & UBAH QTY/CATATAN (Waiter Sheet)
         ========================================================================= */}
      {showOrderReviewDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div
            className="fixed inset-0"
            onClick={() => setShowOrderReviewDrawer(false)}
          />
          <div className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-150">
            {/* Grab handle */}
            <div className="w-full flex justify-center py-2 bg-gray-50 border-b border-gray-200">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="p-3.5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 block">
                  Ringkasan Pesanan
                </span>
                <h3 className="font-semibold text-base text-gray-900">
                  {activeTable?.label || 'Meja'} ({draftTotalCount} item)
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {draftItems.length > 0 && onResetOrder && (
                  <button
                    id="waiter-btn-reset-order"
                    onClick={onResetOrder}
                    className="text-xs text-gray-500 hover:text-red-600 px-2.5 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Kosongkan pesanan meja ini"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Reset</span>
                  </button>
                )}
                <button
                  onClick={() => setShowOrderReviewDrawer(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
              {draftItems.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  Belum ada item dipilih.
                </div>
              ) : (
                draftItems.map((it) => {
                  const isItemDone = (activeTable?.completedItemIds || []).includes(it.menuItem.id);
                  const lineSubtotal = it.menuItem.price * it.quantity;

                  return (
                    <div key={it.menuItem.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        {/* Kolom Kiri: Info Menu, Detail Harga & Jumlah, Catatan */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-xs sm:text-sm text-gray-900 leading-snug">
                              {it.menuItem.name}
                            </span>
                            {isItemDone && (
                              <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 px-1.5 py-0.5 rounded shrink-0">
                                Siap antar
                              </span>
                            )}
                          </div>

                          {/* Detail Harga Satuan & Subtotal Baris */}
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                            <span className="font-mono text-gray-500 tabular-nums">
                              {it.quantity}x @ {formatIDR(it.menuItem.price)}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="font-mono font-semibold text-gray-900 tabular-nums">
                              {formatIDR(lineSubtotal)}
                            </span>
                          </div>

                          {/* Catatan Khusus */}
                          {it.notes ? (
                            <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-600 italic bg-gray-50 px-2 py-0.5 rounded border border-gray-200 w-fit max-w-full">
                              <span className="truncate">Catatan: {it.notes}</span>
                              <button
                                type="button"
                                onClick={() => setEditingNotesItem(it)}
                                className="underline text-[#0071e3] hover:text-[#0077ED] ml-1 font-sans not-italic text-[10px] shrink-0 cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingNotesItem(it)}
                              className="text-[11px] text-gray-400 hover:text-gray-700 underline mt-0.5 block cursor-pointer"
                            >
                              + Tambah Catatan
                            </button>
                          )}
                        </div>

                        {/* Kolom Kanan: Stepper Counter & Tombol Trash (Vertically Centered) */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-center">
                          {/* Stepper Counter */}
                          <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(it.menuItem.id, -1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors cursor-pointer"
                              title="Kurangi 1"
                              aria-label="Kurangi jumlah"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 h-8 flex items-center justify-center text-center font-mono font-semibold text-xs text-gray-900 tabular-nums select-none">
                              {it.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(it.menuItem.id, 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors cursor-pointer"
                              title="Tambah 1"
                              aria-label="Tambah jumlah"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Tombol Trash */}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(it.menuItem.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer shrink-0"
                            title="Hapus menu ini"
                            aria-label="Hapus menu ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom action inside drawer */}
            <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-200">
              {/* Ringkasan Total Tagihan Pesanan */}
              {draftItems.length > 0 && (
                <div className="mb-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Total Item</span>
                    <span className="font-mono font-medium text-gray-700 tabular-nums">
                      {draftTotalCount} item
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
                    <span className="font-semibold text-xs uppercase tracking-wide text-gray-700">
                      Total Pesanan
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-gray-900 tabular-nums">
                      {formatIDR(currentSubtotal)}
                    </span>
                  </div>
                </div>
              )}

              <button
                disabled={draftTotalCount === 0}
                onClick={handleSendOrder}
                className="w-full flex items-center justify-center gap-2 bg-[#0071e3] hover:bg-[#0077ED] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 px-4 rounded-full cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm min-h-12 shadow-sm transition-all active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>
                  Kirim Pesanan ke Kasir • {formatIDR(currentSubtotal)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DRAWER: RINGKASAN SELURUH PESANAN AKTIF (Semua Meja & Bungkus)
         ========================================================================= */}
      {showActiveOrdersSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setShowActiveOrdersSummary(false)}
          />
          <div className="relative z-10 w-full max-w-xl max-h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-[#0071e3] shrink-0 border border-gray-200">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium block">
                    Pelayan
                  </span>
                  <h3 className="font-semibold text-base text-gray-900 leading-tight">
                    Ringkasan Pesanan Aktif
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowActiveOrdersSummary(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 cursor-pointer transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stats Bar */}
            <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900 font-mono">{occupiedTables.length}</span>
                  <span>meja terisi</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900 font-mono">{totalActiveItemsCount}</span>
                  <span>item dipesan</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-gray-500">Total:</span>
                <span className="font-semibold text-gray-900">{formatIDR(totalActiveRevenue)}</span>
              </div>
            </div>

            {/* List of active orders per table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {occupiedTables.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-xs">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium text-gray-600 text-sm">Tidak ada pesanan aktif saat ini</p>
                  <p className="text-gray-400 mt-0.5">Semua meja berstatus kosong / pesanan sudah diselesaikan di kasir.</p>
                </div>
              ) : (
                occupiedTables.map((tbl) => {
                  const tblItemTotal = tbl.items.reduce((s, it) => s + it.quantity, 0);
                  const tblSubtotal = tbl.items.reduce((s, it) => s + it.menuItem.price * it.quantity, 0);
                  const doneCount = tbl.items.filter((it) => (tbl.completedItemIds || []).includes(it.menuItem.id)).length;

                  return (
                    <div
                      key={tbl.targetId}
                      className="border border-gray-200 rounded-xl p-3.5 bg-white space-y-2.5"
                    >
                      {/* Table Card Header */}
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-900" />
                          <h4 className="font-semibold text-sm text-gray-900">
                            {tbl.label}
                          </h4>
                          <span className="text-xs text-gray-500 font-mono">
                            ({tblItemTotal} item • {formatIDR(tblSubtotal)})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Kitchen badge */}
                          {tbl.kitchenStatus === 'siap_saji' && (
                            <span className="text-[10px] text-gray-700 font-semibold bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                              Siap Antar
                            </span>
                          )}
                          {tbl.kitchenStatus === 'dimasak' && (
                            <span className="text-[10px] text-gray-600 font-medium bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                              {doneCount > 0 ? `${doneCount}/${tbl.items.length} Siap` : 'Diracik'}
                            </span>
                          )}
                          {tbl.kitchenStatus === 'menunggu' && (
                            <span className="text-[10px] text-gray-500 font-medium bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                              Antrean
                            </span>
                          )}

                          {/* Quick open table button */}
                          <button
                            onClick={() => {
                              setShowActiveOrdersSummary(false);
                              handleSelectTable(tbl.targetId);
                            }}
                            className="text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full border border-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Buka Meja</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Items per table */}
                      <div className="space-y-1.5 pt-0.5">
                        {tbl.items.map((it) => {
                          const isDone = (tbl.completedItemIds || []).includes(it.menuItem.id);
                          const lineSubtotal = it.menuItem.price * it.quantity;
                          return (
                            <div
                              key={it.menuItem.id}
                              className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-gray-50 gap-2"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono font-semibold text-gray-900 shrink-0">
                                    {it.quantity}x
                                  </span>
                                  <span className="text-gray-800 font-medium">
                                    {it.menuItem.name}
                                  </span>
                                  {isDone && (
                                    <span className="text-[9px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 px-1 rounded shrink-0">
                                      Siap
                                    </span>
                                  )}
                                </div>
                                {it.notes && (
                                  <p className="text-[11px] text-gray-500 italic mt-0.5 pl-5">
                                    Catatan: {it.notes}
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono font-semibold text-gray-900 block tabular-nums">
                                  {formatIDR(lineSubtotal)}
                                </span>
                                <span className="font-mono text-[10px] text-gray-400 block tabular-nums">
                                  @{formatIDR(it.menuItem.price)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowActiveOrdersSummary(false)}
                className="px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium cursor-pointer transition-colors min-h-10"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Notes Modal */}
      <ItemNotesModal
        isOpen={Boolean(editingNotesItem)}
        item={editingNotesItem}
        onSaveNotes={onUpdateNotes}
        onClose={() => setEditingNotesItem(null)}
      />
    </div>
  );
};
