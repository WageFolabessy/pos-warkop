'use client';

import React from 'react';
import { TransactionRecord } from '@/types/pos';
import { formatIDR, formatReceiptTime } from '@/lib/formatters';
import { Printer, Check, X } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  transaction: TransactionRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  transaction,
  onClose,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="flex flex-col items-center max-h-[95vh] w-full max-w-sm">
        {/* Modal Actions Bar (Hidden during print) */}
        <div className="no-print w-full flex items-center justify-between mb-3 bg-gray-900 text-gray-100 px-4 py-2.5 rounded-2xl shadow-lg border border-gray-700">
          <span className="text-xs font-medium text-gray-300">
            Struk Thermal 58mm
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================================
            58MM THERMAL RECEIPT CONTAINER
            This specific container will be printed via #thermal-receipt
           ========================================================================= */}
        <div
          id="thermal-receipt"
          className="w-full bg-white text-black p-5 rounded-2xl shadow-2xl border border-stone-200 font-thermal text-xs overflow-y-auto max-h-[75vh]"
          style={{ letterSpacing: '0.02em' }}
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-stone-400">
            <h1 className="text-lg font-black tracking-wider uppercase">
              RATU KOPI
            </h1>
            <p className="text-[11px] font-bold">PONTIANAK</p>
            <p className="text-[10px] text-stone-600 mt-0.5">
              Jl. Gajah Mada No. 88, Pontianak
            </p>
            <p className="text-[10px] text-stone-600">
              Telp / WA: 0812-5555-8899
            </p>
          </div>

          {/* Metadata */}
          <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Waktu:</span>
              <span className="font-semibold">{formatReceiptTime(transaction.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span>No. Order:</span>
              <span className="font-semibold">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Pesanan:</span>
              <span className="font-bold uppercase">
                {transaction.targetLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>Kasir 01</span>
            </div>
          </div>

          {/* Itemized Order Rows */}
          <div className="py-3 border-b border-dashed border-stone-400 space-y-2">
            {transaction.items.map((item) => {
              const lineTotal = item.menuItem.price * item.quantity;
              return (
                <div key={item.menuItem.id} className="space-y-0.5 text-[11px]">
                  <div className="font-bold text-stone-900">{item.menuItem.name}</div>
                  {item.notes && (
                    <div className="text-[10px] italic text-stone-600 pl-2">
                      * {item.notes}
                    </div>
                  )}
                  <div className="flex justify-between text-stone-700 pl-2 font-mono tabular-nums">
                    <span>
                      {item.quantity} x {formatIDR(item.menuItem.price)}
                    </span>
                    <span className="font-semibold">{formatIDR(lineTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial Totals */}
          <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1.5 text-[11px]">
            <div className="flex justify-between items-baseline font-bold text-xs pt-1">
              <span>TOTAL TAGIHAN</span>
              <span className="text-sm font-black">{formatIDR(transaction.subtotal)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-dotted border-stone-300">
              <span>Cara Bayar:</span>
              <span className="font-bold uppercase">
                {transaction.paymentMethod === 'tunai' ? 'TUNAI (CASH)' : 'QRIS (NON-TUNAI)'}
              </span>
            </div>

            {transaction.paymentMethod === 'tunai' && (
              <>
                <div className="flex justify-between text-stone-700">
                  <span>Uang Diterima:</span>
                  <span>{formatIDR(transaction.cashReceived || transaction.subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900">
                  <span>Kembalian:</span>
                  <span>{formatIDR(transaction.change || 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 text-center space-y-1 text-[10px] text-stone-600">
            <p className="font-bold uppercase tracking-wide text-stone-900">
              Terima Kasih Atas Kunjungannya!
            </p>
            <p className="italic">Kopi Mantap, Jiwa Tenang</p>
            <p className="text-[9px] text-stone-400 pt-1">
              *** LUNAS ***
            </p>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden during print) */}
        <div className="no-print w-full grid grid-cols-2 gap-2.5 mt-3">
          <button
            id="btn-cetak-struk"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Printer className="w-4 h-4 stroke-[2.2]" />
            <span>Cetak Struk</span>
          </button>

          <button
            id="btn-selesai-struk"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 bg-[#0071e3] hover:bg-[#0077ED] text-white font-semibold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Selesai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
