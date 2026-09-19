'use client';

import React, { useState } from 'react';
import { DailySummary, TransactionRecord } from '@/types/pos';
import { formatIDR, formatReceiptTime } from '@/lib/formatters';
import {
  X,
  TrendingUp,
  Receipt,
  Banknote,
  QrCode,
  RotateCcw,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface RekapKasModalProps {
  isOpen: boolean;
  dailySummary: DailySummary;
  transactions: TransactionRecord[];
  onClose: () => void;
  onResetAllData: () => void;
  onResetDemoData: () => void;
}

export const RekapKasModal: React.FC<RekapKasModalProps> = ({
  isOpen,
  dailySummary,
  transactions,
  onClose,
  onResetAllData,
  onResetDemoData,
}) => {
  const [isResetAllConfirmOpen, setIsResetAllConfirmOpen] = useState(false);
  const [isResetDemoConfirmOpen, setIsResetDemoConfirmOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100">
        <div className="w-full max-w-4xl bg-stone-100 rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Rekap Kas Harian
                </h3>
                <p className="text-xs text-stone-400 font-mono">
                  Ratu KOPI Pontianak • Laporan Penjualan
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* Live Feedback Banner */}
            {feedbackMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-semibold animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
                <button
                  onClick={() => setFeedbackMessage(null)}
                  className="text-emerald-600 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Total Omzet */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 block mb-1">
                  Total Omzet
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-stone-900 tabular-nums">
                  {formatIDR(dailySummary.totalRevenue)}
                </span>
              </div>

              {/* Total Transaksi */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 block mb-1">
                  Total Transaksi
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-stone-900 tabular-nums">
                  {dailySummary.totalTransactions} <span className="text-xs font-sans font-normal text-stone-500">Struk</span>
                </span>
              </div>

              {/* Tunai Split */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                    Kas Tunai
                  </span>
                  <Banknote className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <span className="text-base sm:text-lg font-mono font-bold text-stone-900 tabular-nums">
                  {formatIDR(dailySummary.cashRevenue)}
                </span>
              </div>

              {/* QRIS Split */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                    QRIS
                  </span>
                  <QrCode className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <span className="text-base sm:text-lg font-mono font-bold text-stone-900 tabular-nums">
                  {formatIDR(dailySummary.qrisRevenue)}
                </span>
              </div>
            </div>

            {/* Item Sales Breakdown */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-600" />
                  Rincian Penjualan Menu Hari Ini
                </h4>
                <span className="text-xs font-semibold text-stone-500">
                  {dailySummary.itemSales.length} jenis menu terjual
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Nama Menu</th>
                      <th className="py-2.5 px-4">Kategori</th>
                      <th className="py-2.5 px-4 text-center">Qty Terjual</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {dailySummary.itemSales.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-stone-400">
                          Belum ada data penjualan hari ini.
                        </td>
                      </tr>
                    ) : (
                      dailySummary.itemSales.map((sale) => (
                        <tr key={sale.menuItem.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-stone-900">
                            {sale.menuItem.name}
                          </td>
                          <td className="py-2.5 px-4 text-stone-500 capitalize">
                            {sale.menuItem.category}
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold text-amber-800">
                            {sale.quantity} porsi
                          </td>
                          <td className="py-2.5 px-4 text-right font-black text-stone-900">
                            {formatIDR(sale.subtotal)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transaction Log */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Riwayat Struk & Transaksi ({transactions.length})
                </h4>
              </div>

              <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-400">
                    Belum ada riwayat transaksi.
                  </div>
                ) : (
                  transactions.map((tx) => {
                    const isExpanded = expandedTxId === tx.id;
                    return (
                      <div key={tx.id} className="p-3 hover:bg-stone-50 transition-colors">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                tx.paymentMethod === 'tunai'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {tx.paymentMethod.toUpperCase()}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-stone-900">
                                  {tx.id}
                                </span>
                                <span className="text-[11px] text-stone-500 font-medium">
                                  • {tx.targetLabel}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-400">
                                {formatReceiptTime(tx.timestamp)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-black text-xs text-stone-900">
                              {formatIDR(tx.subtotal)}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-stone-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Items */}
                        {isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-stone-200/60 pl-8 space-y-1 text-xs">
                            {tx.items.map((it) => (
                              <div
                                key={it.menuItem.id}
                                className="flex justify-between text-stone-600 text-[11px]"
                              >
                                <span>
                                  {it.quantity}x {it.menuItem.name}
                                </span>
                                <span className="font-medium">
                                  {formatIDR(it.menuItem.price * it.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Danger Zone: Reset Data Kas & Meja */}
            <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h5 className="font-bold text-xs text-red-950 uppercase tracking-wide flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-red-700" />
                  Zona Reset Data Kas & Meja
                </h5>
                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                  Kosongkan semua riwayat transaksi menjadi Rp 0 dan kosongkan seluruh meja, atau muat ulang data simulasi demo warkop.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  id="btn-reset-all-data"
                  onClick={() => setIsResetAllConfirmOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                  title="Kosongkan seluruh transaksi dan meja ke Rp 0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Semua (Reset 0)</span>
                </button>

                <button
                  id="btn-reset-demo-data"
                  onClick={() => setIsResetDemoConfirmOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                  title="Muat ulang data simulasi demo warkop"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Muat Ulang Demo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-amber-50 font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Tutup Rekap
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Reset All to 0 */}
      <ConfirmModal
        isOpen={isResetAllConfirmOpen}
        title="Kosongkan Seluruh Data Kas & Meja?"
        message="Semua riwayat transaksi hari ini akan dihapus menjadi Rp 0 dan seluruh 15 meja serta takeaway akan dikosongkan. Apakah Anda yakin?"
        confirmText="Ya, Kosongkan Semua"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={() => {
          onResetAllData();
          setFeedbackMessage('Semua data transaksi dan meja berhasil dikosongkan ke Rp 0!');
          setIsResetAllConfirmOpen(false);
        }}
        onClose={() => setIsResetAllConfirmOpen(false)}
      />

      {/* Confirmation Modal: Reload Initial Demo Data */}
      <ConfirmModal
        isOpen={isResetDemoConfirmOpen}
        title="Muat Ulang Data Simulasi Demo?"
        message="Data transaksi contoh dan status meja akan dikembalikan ke data simulasi demo warkop. Apakah Anda yakin?"
        confirmText="Ya, Muat Ulang Demo"
        cancelText="Batal"
        isDestructive={false}
        onConfirm={() => {
          onResetDemoData();
          setFeedbackMessage('Data simulasi demo warkop berhasil dimuat ulang!');
          setIsResetDemoConfirmOpen(false);
        }}
        onClose={() => setIsResetDemoConfirmOpen(false)}
      />
    </>
  );
};
