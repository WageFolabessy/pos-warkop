'use client';

import React from 'react';
import { OrderItem, TableOrder } from '@/types/pos';
import { formatIDR } from '@/lib/formatters';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Save,
  CreditCard,
  RotateCcw,
} from 'lucide-react';

interface ActiveOrderPanelProps {
  activeTable: TableOrder | null;
  draftItems: OrderItem[];
  hasUnsavedChanges: boolean;
  subtotal: number;
  totalCount: number;
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onSaveDraft: () => void;
  onCancelDraft: () => void;
  onOpenPayment: () => void;
  onClose?: () => void;
  className?: string;
}

export const ActiveOrderPanel: React.FC<ActiveOrderPanelProps> = ({
  activeTable,
  draftItems,
  hasUnsavedChanges,
  subtotal,
  totalCount,
  onUpdateQuantity,
  onRemoveItem,
  onSaveDraft,
  onCancelDraft,
  onOpenPayment,
  onClose,
  className = '',
}) => {
  const targetLabel = activeTable?.label || 'Pilih Meja';
  const isTakeaway = activeTable?.isTakeaway || false;
  const isUnpaid = activeTable?.status === 'belum_lunas';

  return (
    <aside
      className={`no-print flex flex-col h-full bg-white select-none shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-stone-200/80 bg-stone-50/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#291811] text-amber-400 shrink-0">
            {isTakeaway ? (
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
          <div>
            <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
              Tagihan Aktif
            </h2>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 text-base sm:text-lg leading-tight">
                {targetLabel}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isUnpaid
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {isUnpaid ? 'Belum Lunas' : 'Kosong'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Unsaved indicator */}
          {hasUnsavedChanges && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-800 animate-pulse border border-blue-200">
              Ada Perubahan
            </span>
          )}

          {/* Close button for mobile drawer/bottom sheet */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Tutup Tagihan"
            >
              <span className="text-xl font-bold leading-none">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Order Lines Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
        {draftItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-600 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3 text-stone-400">
              <Receipt className="w-8 h-8 stroke-[1.5]" />
            </div>
            <p className="text-base font-bold text-stone-700">Belum Ada Pesanan</p>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-50">
              Ketuk menu di katalog untuk menambahkan pesanan ke {targetLabel}
            </p>
          </div>
        ) : (
          draftItems.map((item) => {
            const lineSubtotal = item.menuItem.price * item.quantity;
            return (
              <div
                key={item.menuItem.id}
                className="bg-stone-50/90 border border-stone-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2.5 hover:border-amber-300 transition-colors"
              >
                {/* Item Name & Unit Price */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug">
                      {item.menuItem.name}
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {formatIDR(item.menuItem.price)} / porsi
                    </p>
                  </div>
                  {/* Delete button (44px touch target) */}
                  <button
                    onClick={() => onRemoveItem(item.menuItem.id)}
                    className="w-11 h-11 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-5 h-5 stroke-[1.8]" />
                  </button>
                </div>

                {/* Quantity Stepper (44px touch targets) & Line Subtotal */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                  <div className="flex items-center bg-white border border-stone-300 rounded-xl p-0.5 shadow-2xs">
                    <button
                      onClick={() => onUpdateQuantity(item.menuItem.id, -1)}
                      className="w-11 h-11 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 active:scale-90 transition-transform cursor-pointer"
                      title="Kurangi"
                    >
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.menuItem.id, 1)}
                      className="w-11 h-11 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 active:scale-90 transition-transform cursor-pointer"
                      title="Tambah"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  <span className="font-black text-sm text-stone-900">
                    {formatIDR(lineSubtotal)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary & Action Buttons */}
      <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-stone-50/80 space-y-3">
        {/* Total Summary */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
          <div className="flex justify-between items-center text-xs text-stone-500 font-medium">
            <span>Total Item</span>
            <span className="font-bold text-stone-800">{totalCount} item</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
              Total Tagihan
            </span>
            <span className="text-xl font-black text-[#291811] tracking-tight">
              {formatIDR(subtotal)}
            </span>
          </div>
        </div>

        {/* Action Button Grid */}
        <div className="space-y-2">
          {/* Bayar Sekarang Button (48px height) */}
          <button
            id="btn-bayar-sekarang"
            disabled={draftItems.length === 0}
            onClick={onOpenPayment}
            className="w-full flex items-center justify-center gap-2 bg-[#291811] hover:bg-[#3d2419] disabled:bg-stone-300 disabled:text-stone-400 text-amber-400 font-bold min-h-12 py-3 px-4 rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <CreditCard className="w-5 h-5 stroke-[2.2]" />
            <span>Bayar Sekarang ({formatIDR(subtotal)})</span>
          </button>

          {/* Secondary Actions: Simpan Pesanan & Batal (44px height) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-simpan-pesanan"
              disabled={!hasUnsavedChanges && draftItems.length === 0}
              onClick={onSaveDraft}
              className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-stone-950 font-bold min-h-11 py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-colors shadow-xs cursor-pointer disabled:cursor-not-allowed"
              title="Simpan perubahan ke meja tanpa langsung bayar"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pesanan</span>
            </button>

            <button
              id="btn-batal-pesanan"
              disabled={!hasUnsavedChanges}
              onClick={onCancelDraft}
              className="flex items-center justify-center gap-1.5 bg-stone-200 hover:bg-stone-300 disabled:bg-stone-100 disabled:text-stone-300 text-stone-700 font-semibold min-h-11 py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Batalkan perubahan yang belum disimpan"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Batal</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
