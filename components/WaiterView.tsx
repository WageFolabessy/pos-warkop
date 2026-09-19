'use client';

import React, { useState, useMemo } from 'react';
import { TableOrder, MenuItem, OrderItem, Category } from '@/types/pos';
import { MENU_ITEMS } from '@/data/menu';
import { ItemNotesModal } from './ItemNotesModal';
import {
  Users,
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
} from 'lucide-react';

interface WaiterViewProps {
  tables: TableOrder[];
  activeTargetId: string;
  activeTable: TableOrder | null;
  draftItems: OrderItem[];
  draftTotalCount: number;
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
  { id: 'camilan', label: 'Camilan' },
];

export const WaiterView: React.FC<WaiterViewProps> = ({
  tables,
  activeTargetId,
  activeTable,
  draftItems,
  draftTotalCount,
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

  const takeaway = tables.find((t) => t.isTakeaway);
  const physicalTables = tables.filter((t) => !t.isTakeaway);

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
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
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
    <div className="flex-1 flex flex-col h-full bg-stone-100 select-none overflow-hidden relative">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* =========================================================================
          LANGKAH 1: PILIH MEJA (Step: 'tables')
          Tanpa akses finansial / omzet / harga
         ========================================================================= */}
      {currentStep === 'tables' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Sub Header */}
          <div className="p-3.5 bg-white border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-600" />
              <div>
                <h2 className="font-bold text-sm text-stone-900">
                  Langkah 1: Pilih Meja Pelanggan
                </h2>
                <p className="text-[11px] text-stone-500">
                  Pilih meja untuk mulai mencatat pesanan
                </p>
              </div>
            </div>
            <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md border border-stone-200">
              15 Meja
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {/* Takeaway Card */}
            <button
              id="waiter-target-takeaway"
              onClick={() => handleSelectTable('takeaway')}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between min-h-14 bg-white active:scale-[0.99] ${
                activeTargetId === 'takeaway'
                  ? 'border-stone-900 ring-2 ring-stone-900 shadow-xs'
                  : takeaway?.status === 'belum_lunas'
                  ? 'border-amber-500 bg-amber-50/40'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    takeaway?.status === 'belum_lunas'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-stone-900 block">
                    Bungkus / Takeaway
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-stone-500">
                      {takeaway?.status === 'belum_lunas'
                        ? `${takeaway.items.reduce((s, it) => s + it.quantity, 0)} item dipesan`
                        : 'Tersedia untuk bawa pulang'}
                    </span>
                    {takeaway?.kitchenStatus === 'siap_saji' && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded-md">
                        Siap Antar
                      </span>
                    )}
                    {takeaway?.kitchenStatus === 'dimasak' && (
                      <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300 px-1.5 py-0.2 rounded-md">
                        Diracik
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-stone-400">
                <span className="text-xs font-medium">Pilih</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* 15 Physical Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {physicalTables.map((tbl) => {
                const totalItems = tbl.items.reduce((sum, it) => sum + it.quantity, 0);
                const isOccupied = tbl.status === 'belum_lunas';
                const isSelected = activeTargetId === tbl.targetId;

                return (
                  <button
                    key={tbl.targetId}
                    id={`waiter-target-${tbl.targetId}`}
                    onClick={() => handleSelectTable(tbl.targetId)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-24 bg-white active:scale-[0.98] ${
                      isSelected
                        ? 'border-stone-900 ring-2 ring-stone-900 shadow-xs'
                        : isOccupied
                        ? 'border-amber-500 bg-amber-50/40'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-base text-stone-900">
                        {tbl.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {tbl.kitchenStatus === 'siap_saji' && (
                          <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded-md">
                            Siap Antar
                          </span>
                        )}
                        {tbl.kitchenStatus === 'dimasak' && (
                          <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300 px-1.5 py-0.5 rounded-md">
                            Diracik
                          </span>
                        )}
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOccupied ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      {isOccupied ? (
                        <div className="text-xs font-medium text-amber-900">
                          {totalItems} item dipesan
                        </div>
                      ) : (
                        <div className="text-xs text-stone-500 font-medium">
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
          <div className="p-3 bg-white border-b border-stone-200 flex items-center justify-between gap-2">
            <button
              id="waiter-btn-back-tables"
              onClick={() => setCurrentStep('tables')}
              className="flex items-center gap-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-lg border border-stone-200 cursor-pointer min-h-10"
            >
              <span>←</span>
              <span>Ganti Meja</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-stone-900 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                {activeTable?.label || 'Meja'}
              </span>

              {/* Reset Order Button for Waiter */}
              {draftTotalCount > 0 && onResetOrder && (
                <button
                  id="waiter-top-btn-reset-order"
                  onClick={onResetOrder}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-600 bg-stone-100 hover:bg-red-50 px-2.5 py-2 rounded-lg border border-stone-200 hover:border-red-200 transition-colors cursor-pointer min-h-10"
                  title="Reset pesanan meja ini"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Reset</span>
                </button>
              )}

              {/* Button to view review drawer */}
              <button
                id="waiter-btn-review-order"
                onClick={() => setShowOrderReviewDrawer(true)}
                className="flex items-center gap-1.5 bg-stone-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer min-h-10"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>{draftTotalCount} Item</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-3 bg-white border-b border-stone-200 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`waiter-filter-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer min-h-10 flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-50 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Cari menu pesanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white text-stone-900 transition-colors min-h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
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
                    className="relative text-left bg-white border border-stone-200 hover:border-stone-400 active:scale-[0.98] p-3.5 rounded-xl shadow-2xs transition-all duration-100 flex flex-col justify-between min-h-24 sm:min-h-28 cursor-pointer select-none"
                  >
                    {/* In-Cart Badge */}
                    {inCartQty > 0 && (
                      <span className="absolute top-2.5 right-2.5 bg-stone-900 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xs">
                        {inCartQty}x
                      </span>
                    )}

                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-stone-900 leading-snug pr-6">
                        {item.name}
                      </h3>

                      {/* Notes Preview if available */}
                      {existingOrderItem?.notes && (
                        <p className="text-[10px] text-amber-800 italic mt-1 bg-amber-50 p-1 rounded border border-amber-200/60 line-clamp-1">
                          Catatan: {existingOrderItem.notes}
                        </p>
                      )}
                    </div>

                    {/* Card Bottom: Action & Notes Trigger */}
                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-400 font-medium">
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
                          className="flex items-center gap-1 text-[11px] font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded-md border border-stone-300 cursor-pointer"
                          title="Tambah/ubah catatan khusus"
                        >
                          <FileText className="w-3 h-3 text-stone-500" />
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
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-stone-200 shadow-xl z-30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOrderReviewDrawer(true)}
                className="text-left cursor-pointer"
              >
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block">
                  {activeTable?.label || 'Pesanan'}
                </span>
                <span className="font-bold text-sm text-stone-900">
                  {draftTotalCount} Item Dipilih
                </span>
              </button>
            </div>

            <button
              id="waiter-btn-send-to-cashier"
              disabled={draftTotalCount === 0}
              onClick={handleSendOrder}
              className="flex items-center gap-2 bg-stone-900 hover:bg-black disabled:bg-stone-300 disabled:text-stone-400 text-white font-bold py-3 px-5 rounded-xl shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm min-h-12"
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
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div
            className="fixed inset-0"
            onClick={() => setShowOrderReviewDrawer(false)}
          />
          <div className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-150">
            {/* Grab handle */}
            <div className="w-full flex justify-center py-2 bg-stone-50 border-b border-stone-200">
              <div className="w-10 h-1 bg-stone-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="p-3.5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block">
                  Daftar Pesanan Meja
                </span>
                <h3 className="font-bold text-base text-stone-900">
                  {activeTable?.label || 'Meja'} ({draftTotalCount} Item)
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {draftItems.length > 0 && onResetOrder && (
                  <button
                    id="waiter-btn-reset-order"
                    onClick={onResetOrder}
                    className="text-xs text-stone-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Kosongkan pesanan meja ini"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Reset</span>
                  </button>
                )}
                <button
                  onClick={() => setShowOrderReviewDrawer(false)}
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100 space-y-3">
              {draftItems.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  Belum ada item yang dipilih untuk meja ini.
                </div>
              ) : (
                draftItems.map((it) => (
                  <div key={it.menuItem.id} className="pt-3 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-xs sm:text-sm text-stone-900 block">
                          {it.menuItem.name}
                        </span>
                        {/* Custom note */}
                        {it.notes ? (
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-800 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                            <span>Catatan: {it.notes}</span>
                            <button
                              onClick={() => setEditingNotesItem(it)}
                              className="underline text-stone-600 ml-1 font-sans not-italic text-[10px] cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingNotesItem(it)}
                            className="text-[11px] text-stone-500 hover:text-stone-800 underline mt-0.5 block cursor-pointer"
                          >
                            + Tambah Catatan
                          </button>
                        )}
                      </div>

                      {/* Stepper (+ / - / delete) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(it.menuItem.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-xs text-stone-900">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(it.menuItem.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(it.menuItem.id)}
                          className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-600 rounded-lg cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom action inside drawer */}
            <div className="p-3.5 bg-stone-50 border-t border-stone-200">
              <button
                disabled={draftTotalCount === 0}
                onClick={handleSendOrder}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-black disabled:bg-stone-300 text-white font-bold py-3 px-4 rounded-xl shadow-xs cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm min-h-12"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pesanan ke Kasir ({draftTotalCount} Item)</span>
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
