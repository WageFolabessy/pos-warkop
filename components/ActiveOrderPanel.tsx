'use client';

import React, { useState } from 'react';
import { OrderItem, TableOrder } from '@/types/pos';
import { formatIDR } from '@/lib/formatters';
import { Plus, Minus, CreditCard, RotateCcw, Trash2, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

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
  onResetOrder?: () => void;
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
  onResetOrder,
  onOpenPayment,
  onClose,
  className = '',
}) => {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const targetLabel = activeTable?.label || 'Pilih Meja';

  const handleResetClick = () => {
    // If the table was already saved in localStorage with items, ask for confirmation
    if (activeTable && activeTable.status === 'belum_lunas' && activeTable.items.length > 0) {
      setIsResetConfirmOpen(true);
    } else {
      // If items are only in draft (unsaved), clear immediately
      if (onResetOrder) {
        onResetOrder();
      } else {
        onCancelDraft();
      }
    }
  };

  const handleConfirmReset = () => {
    if (onResetOrder) {
      onResetOrder();
    }
    setIsResetConfirmOpen(false);
  };

  return (
    <aside
      className={`no-print flex flex-col h-full bg-white select-none border-stone-200 ${className}`}
    >
      {/* Header Ringkas: Target Meja + Quick Actions */}
      <div className="p-3.5 sm:p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
            Pesanan Aktif
          </span>
          <h2 className="font-bold text-base sm:text-lg text-stone-900 leading-tight">
            {targetLabel}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Bersihkan / Reset Button */}
          {draftItems.length > 0 && (
            <button
              id="btn-reset-order"
              onClick={handleResetClick}
              className="text-xs text-stone-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset dan kosongkan pesanan meja ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Reset</span>
            </button>
          )}

          {/* Close button for mobile drawer/bottom sheet */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Daftar Item - Digital Receipt Style */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 divide-y divide-stone-100">
        {draftItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 p-6 text-center">
            <p className="text-sm font-semibold text-stone-600">Belum ada pesanan</p>
            <p className="text-xs text-stone-400 mt-0.5 max-w-44">
              Ketuk menu di katalog untuk menambahkan pesanan ke {targetLabel}
            </p>
          </div>
        ) : (
          draftItems.map((item) => {
            const lineSubtotal = item.menuItem.price * item.quantity;
            return (
              <div key={item.menuItem.id} className="py-3 first:pt-0 last:pb-0">
                {/* Row Top: Name & Line Subtotal */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-medium text-xs sm:text-sm text-stone-900 leading-snug block">
                      {item.menuItem.name}
                    </span>
                    {/* Waiter Custom Notes */}
                    {item.notes && (
                      <span className="text-[11px] italic text-stone-500 block mt-0.5">
                        Catatan: {item.notes}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-xs sm:text-sm text-stone-900 tabular-nums shrink-0">
                    {formatIDR(lineSubtotal)}
                  </span>
                </div>

                {/* Row Bottom: Unit Price & Inline Sturdy Stepper */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] font-mono text-stone-500 tabular-nums">
                    @ {formatIDR(item.menuItem.price)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Stepper */}
                    <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.menuItem.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 active:bg-stone-300 transition-colors cursor-pointer"
                        title="Kurangi 1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-xs text-stone-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.menuItem.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 active:bg-stone-300 transition-colors cursor-pointer"
                        title="Tambah 1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick remove line button */}
                    <button
                      onClick={() => onRemoveItem(item.menuItem.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus menu ini"
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

      {/* Footer Tagihan & Action Buttons */}
      <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-stone-50 space-y-3">
        {/* Ringkasan Biaya */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-stone-500">
            <span>Jumlah Item</span>
            <span className="font-mono tabular-nums text-stone-700">{totalCount} item</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
            <span className="font-bold text-xs uppercase tracking-wide text-stone-700">
              Total Akhir
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-stone-900 tabular-nums">
              {formatIDR(subtotal)}
            </span>
          </div>
        </div>

        {/* Hirarki Tombol Aksi */}
        <div className="space-y-2 pt-1">
          {/* Tombol Utama (Primary): Bayar Sekarang */}
          <button
            id="btn-bayar-sekarang"
            disabled={draftItems.length === 0}
            onClick={onOpenPayment}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-black disabled:bg-stone-300 disabled:text-stone-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed min-h-12 text-sm"
          >
            <CreditCard className="w-4 h-4" />
            <span>Bayar Sekarang ({formatIDR(subtotal)})</span>
          </button>

          {/* Tombol Sekunder: Simpan Tagihan / Buka Meja */}
          <button
            id="btn-simpan-pesanan"
            disabled={!hasUnsavedChanges && draftItems.length === 0}
            onClick={onSaveDraft}
            className="w-full flex items-center justify-center gap-1.5 border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 disabled:bg-stone-100 disabled:border-stone-200 disabled:text-stone-400 text-stone-700 font-semibold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer disabled:cursor-not-allowed min-h-11"
          >
            <span>Simpan Tagihan / Buka Meja</span>
          </button>

          {/* Tombol Batal/Reset (Ghost text link) */}
          {hasUnsavedChanges && (
            <div className="text-center pt-1">
              <button
                id="btn-batal-pesanan"
                onClick={onCancelDraft}
                className="text-xs text-stone-500 hover:text-red-600 transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                Batalkan Perubahan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Resetting Active Table Order */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title={`Reset Pesanan ${targetLabel}?`}
        message={`Seluruh item pesanan pada ${targetLabel} akan dikosongkan dan status meja akan kembali menjadi kosong.`}
        confirmText="Ya, Reset Pesanan"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </aside>
  );
};
