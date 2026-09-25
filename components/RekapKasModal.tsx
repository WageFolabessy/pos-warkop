"use client";

import React, { useState } from "react";
import {
  DailySummary,
  TransactionRecord,
  UserRole,
  ExpenseRecord,
} from "@/types/pos";
import { formatIDR, formatReceiptTime } from "@/lib/formatters";
import {
  X,
  TrendingUp,
  Receipt,
  Banknote,
  RotateCcw,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Plus,
  ArrowDownRight,
  Wallet,
  Coins,
  AlertCircle,
  Edit2,
} from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

interface RekapKasModalProps {
  isOpen: boolean;
  currentRole: UserRole;
  dailySummary: DailySummary;
  transactions: TransactionRecord[];
  expenses?: ExpenseRecord[];
  openingCash?: number;
  actualCash?: number | null;
  onClose: () => void;
  onResetAllData: () => void;
  onResetDemoData: () => void;
  onAddExpense?: (description: string, amount: number) => void;
  onDeleteExpense?: (id: string) => void;
  onUpdateOpeningCash?: (amount: number) => void;
  onUpdateActualCash?: (amount: number | null) => void;
}

export const RekapKasModal: React.FC<RekapKasModalProps> = ({
  isOpen,
  currentRole,
  dailySummary,
  transactions,
  expenses = [],
  openingCash = 0,
  actualCash = null,
  onClose,
  onResetAllData,
  onResetDemoData,
  onAddExpense,
  onDeleteExpense,
  onUpdateOpeningCash,
  onUpdateActualCash,
}) => {
  const [isResetAllConfirmOpen, setIsResetAllConfirmOpen] = useState(false);
  const [isResetDemoConfirmOpen, setIsResetDemoConfirmOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Form state for adding petty cash expense
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  // Editing modal awal (opening cash)
  const [isEditingOpeningCash, setIsEditingOpeningCash] = useState(false);
  const [inputOpeningCash, setInputOpeningCash] = useState(
    String(openingCash || ""),
  );

  // Actual cash count (uang fisik di laci)
  const [inputActualCash, setInputActualCash] = useState(
    actualCash !== null ? String(actualCash) : "",
  );

  if (!isOpen) return null;

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount);
    if (!expenseDesc.trim() || !amountNum || amountNum <= 0) return;

    if (onAddExpense) {
      onAddExpense(expenseDesc.trim(), amountNum);
      setFeedbackMessage(
        `Pengeluaran "${expenseDesc.trim()}" (${formatIDR(amountNum)}) berhasil dicatat.`,
      );
      setExpenseDesc("");
      setExpenseAmount("");
    }
  };

  const handleSaveOpeningCash = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Math.max(0, Number(inputOpeningCash) || 0);
    if (onUpdateOpeningCash) {
      onUpdateOpeningCash(amountNum);
      setFeedbackMessage(
        `Modal awal kasir berhasil diperbarui menjadi ${formatIDR(amountNum)}.`,
      );
      setIsEditingOpeningCash(false);
    }
  };

  const handleSaveActualCash = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputActualCash.trim() === "") {
      if (onUpdateActualCash) onUpdateActualCash(null);
      return;
    }
    const amountNum = Math.max(0, Number(inputActualCash) || 0);
    if (onUpdateActualCash) {
      onUpdateActualCash(amountNum);
      setFeedbackMessage(
        `Hasil hitung uang fisik (${formatIDR(amountNum)}) berhasil disimpan.`,
      );
    }
  };

  const handleResetActualCash = () => {
    setInputActualCash("");
    if (onUpdateActualCash) {
      onUpdateActualCash(null);
    }
  };

  const handlePrintRecap = () => {
    window.print();
  };

  const totalExpenses =
    dailySummary.totalExpenses ?? expenses.reduce((s, e) => s + e.amount, 0);
  const expectedCashDrawer =
    dailySummary.expectedCashDrawer ??
    openingCash + dailySummary.cashRevenue - totalExpenses;
  const cashDiff = actualCash !== null ? actualCash - expectedCashDrawer : null;

  return (
    <>
      <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
        <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Rekap Kas Harian
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200">
                    {currentRole === "owner" && (
                      <ShieldCheck className="w-3 h-3 text-gray-500" />
                    )}
                    {currentRole === "owner" ? "Pemilik" : "Kasir"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Laporan Kas &amp; Penjualan
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* Live Feedback Banner */}
            {feedbackMessage && (
              <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-gray-700 text-xs font-medium animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
                <button
                  onClick={() => setFeedbackMessage(null)}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Top Metric Cards (5 Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {/* Total Omzet */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1">
                  Total Omzet
                </span>
                <span className="text-base sm:text-lg font-mono font-semibold text-gray-900 tabular-nums">
                  {formatIDR(dailySummary.totalRevenue)}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {dailySummary.totalTransactions} Transaksi
                </span>
              </div>

              {/* Modal Awal Kasir */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">
                    Modal Awal
                  </span>
                  <Coins className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-base sm:text-lg font-mono font-semibold text-gray-900 tabular-nums">
                  {formatIDR(openingCash)}
                </span>
                <div className="mt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInputOpeningCash(String(openingCash || ""));
                      setIsEditingOpeningCash(!isEditingOpeningCash);
                    }}
                    className="text-[10px] text-[#0071e3] hover:underline font-medium cursor-pointer flex items-center gap-0.5"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>Ubah Modal</span>
                  </button>
                </div>
              </div>

              {/* Kas Masuk Tunai */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">
                    Kas Masuk
                  </span>
                  <Banknote className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-base sm:text-lg font-mono font-semibold text-gray-900 tabular-nums">
                  {formatIDR(dailySummary.cashRevenue)}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Penjualan Tunai
                </span>
              </div>

              {/* Pengeluaran Kas Kecil */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">
                    Kas Keluar
                  </span>
                  <ArrowDownRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-base sm:text-lg font-mono font-semibold text-gray-900 tabular-nums">
                  {formatIDR(totalExpenses)}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {expenses.length} Pengeluaran
                </span>
              </div>

              {/* Kas Seharusnya di Laci */}
              <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl border border-gray-300 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-900 font-semibold flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-gray-600" />
                    Kas di Laci
                  </span>
                </div>
                <span className="text-base sm:text-lg font-mono font-semibold text-gray-900 tabular-nums">
                  {formatIDR(expectedCashDrawer)}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  Modal + Tunai - Biaya
                </span>
              </div>
            </div>

            {/* Form Ubah Modal Awal (Inline expand jika ditekan) */}
            {isEditingOpeningCash && (
              <form
                onSubmit={handleSaveOpeningCash}
                className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 animate-in fade-in duration-150"
              >
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Modal Awal
                  </label>
                </div>
                <div className="relative w-full sm:w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="0"
                    value={inputOpeningCash}
                    onChange={(e) => setInputOpeningCash(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#0071e3] text-gray-900 font-mono tabular-nums min-h-10"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer min-h-10 whitespace-nowrap"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingOpeningCash(false)}
                    className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 rounded-full border border-gray-200 bg-white cursor-pointer min-h-10"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}

            {/* SEKSI 1: Hitung Uang di Laci */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-gray-600" />
                    Hitung Uang di Laci
                  </h4>
                </div>

                {actualCash !== null && (
                  <button
                    type="button"
                    onClick={handleResetActualCash}
                    className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer self-start sm:self-auto"
                  >
                    Atur Ulang
                  </button>
                )}
              </div>

              <form
                onSubmit={handleSaveActualCash}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              >
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono font-medium">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Ketik total uang di laci..."
                    value={inputActualCash}
                    onChange={(e) => setInputActualCash(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-gray-900 font-mono tabular-nums min-h-11"
                  />
                </div>

                <button
                  type="submit"
                  disabled={inputActualCash.trim() === ""}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-xs rounded-full transition-colors cursor-pointer min-h-11 whitespace-nowrap"
                >
                  Simpan
                </button>
              </form>

              {/* Status Banner Selisih */}
              {actualCash !== null && cashDiff !== null && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-150 ${
                    cashDiff === 0
                      ? "bg-gray-50 border-gray-300 text-gray-900"
                      : cashDiff < 0
                        ? "bg-red-50 border-red-200 text-red-950"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cashDiff === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-gray-700 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold block">
                        {cashDiff === 0
                          ? "UANG KAS PAS / COCOK!"
                          : cashDiff < 0
                            ? "UANG KAS KURANG"
                            : "UANG KAS LEBIH"}
                      </span>
                      <span className="text-[11px] opacity-80">
                        {cashDiff === 0
                          ? "Jumlah uang di laci sesuai dengan hitungan sistem."
                          : cashDiff < 0
                            ? "Uang di laci lebih sedikit dari hitungan sistem."
                            : "Uang di laci lebih banyak dari hitungan sistem."}
                      </span>
                    </div>
                  </div>

                  <div className="text-right pl-2">
                    <span className="text-[10px] uppercase tracking-wider block opacity-70">
                      Selisih
                    </span>
                    <span className="font-mono font-semibold text-sm tabular-nums">
                      {cashDiff === 0
                        ? "Rp 0"
                        : cashDiff < 0
                          ? `- ${formatIDR(Math.abs(cashDiff))}`
                          : `+ ${formatIDR(cashDiff)}`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* SEKSI 2: Catat & Riwayat Pengeluaran */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <ArrowDownRight className="w-3.5 h-3.5 text-gray-400" />
                  Pengeluaran
                </h4>
                <span className="text-xs font-medium text-gray-500">
                  Total: {formatIDR(totalExpenses)}
                </span>
              </div>

              {/* Form Tambah Pengeluaran Cepat */}
              {onAddExpense && (
                <form
                  onSubmit={handleAddExpenseSubmit}
                  className="p-3.5 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center"
                >
                  <input
                    type="text"
                    placeholder="Keterangan..."
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-gray-900 min-h-10"
                  />
                  <div className="relative w-full sm:w-44">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      placeholder="Nominal"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-gray-900 font-mono tabular-nums min-h-10"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      !expenseDesc.trim() ||
                      !expenseAmount ||
                      Number(expenseAmount) <= 0
                    }
                    className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-xs px-4 py-2 rounded-full cursor-pointer transition-colors disabled:cursor-not-allowed min-h-10 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Catat</span>
                  </button>
                </form>
              )}

              {/* Daftar Pengeluaran */}
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {expenses.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    Belum ada pengeluaran.
                  </div>
                ) : (
                  expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <div>
                          <span className="font-medium text-gray-900 block">
                            {exp.description}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatReceiptTime(exp.timestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-gray-900 tabular-nums">
                          - {formatIDR(exp.amount)}
                        </span>
                        {onDeleteExpense && (
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SEKSI 3: Item Sales Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-gray-400" />
                  Penjualan Menu
                </h4>
                <span className="text-xs font-medium text-gray-500">
                  {dailySummary.itemSales.length} menu
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Nama Menu</th>
                      <th className="py-2.5 px-4">Kategori</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dailySummary.itemSales.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 text-center text-gray-400"
                        >
                          Belum ada penjualan.
                        </td>
                      </tr>
                    ) : (
                      dailySummary.itemSales.map((sale) => (
                        <tr
                          key={sale.menuItem.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2.5 px-4 font-medium text-gray-900">
                            {sale.menuItem.name}
                          </td>
                          <td className="py-2.5 px-4 text-gray-500 capitalize">
                            {sale.menuItem.category}
                          </td>
                          <td className="py-2.5 px-4 text-center font-medium text-gray-700">
                            {sale.quantity}
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                            {formatIDR(sale.subtotal)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEKSI 4: Transaction Log */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Riwayat Transaksi ({transactions.length})
                </h4>
              </div>

              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    Belum ada transaksi.
                  </div>
                ) : (
                  transactions.map((tx) => {
                    const isExpanded = expandedTxId === tx.id;
                    return (
                      <div
                        key={tx.id}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() =>
                            setExpandedTxId(isExpanded ? null : tx.id)
                          }
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-medium text-gray-600 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                              {tx.paymentMethod.toUpperCase()}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs text-gray-900">
                                  {tx.id}
                                </span>
                                <span className="text-[11px] text-gray-500 font-medium">
                                  • {tx.targetLabel}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {formatReceiptTime(tx.timestamp)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-xs text-gray-900">
                              {formatIDR(tx.subtotal)}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Items */}
                        {isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-gray-100 pl-8 space-y-1 text-xs">
                            {tx.items.map((it) => (
                              <div
                                key={it.menuItem.id}
                                className="flex justify-between text-gray-600 text-[11px]"
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

            {/* Reset Data (Khusus Pemilik) */}
            {currentRole === "owner" && (
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-xs text-gray-900">
                    Reset Data
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    id="btn-reset-all-data"
                    onClick={() => setIsResetAllConfirmOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-3.5 py-2 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan Semua</span>
                  </button>

                  <button
                    id="btn-reset-demo-data"
                    onClick={() => setIsResetDemoConfirmOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium px-3.5 py-2 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                    <span>Muat Demo</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
            <button
              id="btn-print-recap"
              onClick={handlePrintRecap}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>Cetak Struk</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STRUK THERMAL 58MM UNTUK REKAP HARIAN (Z-REPORT)
          Hanya dirender saat print (@media print) ke printer thermal
         ========================================================================= */}
      <div
        id="thermal-recap-receipt"
        className="hidden font-thermal text-xs text-black bg-white p-3 leading-tight"
      >
        {/* Header Struk Rekap */}
        <div className="text-center pb-2 border-b border-dashed border-black">
          <h2 className="font-bold text-sm tracking-wider uppercase">
            RATU KOPI
          </h2>
          <p className="text-[10px]">Jl. Puyuh No. 12, Pontianak</p>
          <p className="text-[10px] font-bold mt-1 uppercase tracking-wider">
            *** REKAP KAS HARIAN (LAPORAN PENUTUPAN) ***
          </p>
          <p className="text-[9px] text-gray-600 mt-0.5">
            Dicetak: {formatReceiptTime(new Date().toISOString())}
          </p>
          <p className="text-[9px] uppercase">
            Oleh: {currentRole.toUpperCase()}
          </p>
        </div>

        {/* Ringkasan Finansial */}
        <div className="py-2 border-b border-dashed border-black space-y-1 font-mono text-[11px]">
          <div className="flex justify-between">
            <span>Total Omzet:</span>
            <span className="font-bold">
              {formatIDR(dailySummary.totalRevenue)}
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>Jumlah Struk:</span>
            <span>{dailySummary.totalTransactions} transaksi</span>
          </div>
          <div className="flex justify-between text-[10px] pt-1 border-t border-dotted border-gray-400">
            <span>Modal Awal Kasir:</span>
            <span>{formatIDR(openingCash)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>Kas Masuk (Tunai):</span>
            <span>{formatIDR(dailySummary.cashRevenue)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>Non-Tunai (QRIS):</span>
            <span>{formatIDR(dailySummary.qrisRevenue)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>Kas Keluar:</span>
            <span>- {formatIDR(totalExpenses)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold pt-1 border-t border-dashed border-black">
            <span>TOTAL KAS SEHARUSNYA:</span>
            <span>{formatIDR(expectedCashDrawer)}</span>
          </div>
          {actualCash !== null && cashDiff !== null && (
            <div className="pt-1 border-t border-dotted border-gray-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Fisik Kas Dihitung:</span>
                <span className="font-bold">{formatIDR(actualCash)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>STATUS SELISIH:</span>
                <span>
                  {cashDiff === 0
                    ? "PAS (Rp 0)"
                    : cashDiff < 0
                      ? `KURANG (${formatIDR(cashDiff)})`
                      : `LEBIH (+${formatIDR(cashDiff)})`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rincian Pengeluaran Kas Kecil */}
        {expenses.length > 0 && (
          <div className="py-2 border-b border-dashed border-black">
            <div className="font-bold text-[10px] uppercase mb-1">
              Daftar Kas Keluar:
            </div>
            <div className="space-y-0.5 text-[10px] font-mono">
              {expenses.map((exp) => (
                <div key={exp.id} className="flex justify-between">
                  <span className="truncate pr-2">{exp.description}</span>
                  <span className="shrink-0">{formatIDR(exp.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Terlaris */}
        <div className="py-2 border-b border-dashed border-black">
          <div className="font-bold text-[10px] uppercase mb-1">
            Rincian Menu Terjual:
          </div>
          <div className="space-y-0.5 text-[10px] font-mono">
            {dailySummary.itemSales.length === 0 ? (
              <div className="text-[9px] text-gray-500 italic">
                Belum ada menu terjual
              </div>
            ) : (
              dailySummary.itemSales.slice(0, 15).map((sale) => (
                <div key={sale.menuItem.id} className="flex justify-between">
                  <span className="truncate pr-1">
                    {sale.quantity}x {sale.menuItem.name}
                  </span>
                  <span className="shrink-0">{formatIDR(sale.subtotal)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tanda Tangan Kasir & Owner */}
        <div className="pt-4 pb-2 text-center text-[10px]">
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p>Kasir Bertugas,</p>
              <div className="h-10" />
              <p className="border-t border-dotted border-black pt-0.5">
                (...................)
              </p>
            </div>
            <div>
              <p>Pemilik Warkop,</p>
              <div className="h-10" />
              <p className="border-t border-dotted border-black pt-0.5">
                (...................)
              </p>
            </div>
          </div>
          <p className="text-[8px] text-gray-500 mt-3 uppercase tracking-widest">
            SIMPAN STRUK INI BERSAMA UANG KAS
          </p>
        </div>
      </div>

      {/* Confirmation Modal: Reset All to 0 */}
      <ConfirmModal
        isOpen={isResetAllConfirmOpen}
        title="Kosongkan Semua Data?"
        message="Semua transaksi dan meja akan dikosongkan ke Rp 0."
        confirmText="Kosongkan"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={() => {
          if (currentRole === "owner") {
            onResetAllData();
            setFeedbackMessage("Semua data berhasil dikosongkan.");
          }
          setIsResetAllConfirmOpen(false);
        }}
        onClose={() => setIsResetAllConfirmOpen(false)}
      />

      {/* Confirmation Modal: Reload Initial Demo Data */}
      <ConfirmModal
        isOpen={isResetDemoConfirmOpen}
        title="Muat Data Demo?"
        message="Data transaksi dan meja akan diatur ulang ke mode demo."
        confirmText="Muat Demo"
        cancelText="Batal"
        isDestructive={false}
        onConfirm={() => {
          if (currentRole === "owner") {
            onResetDemoData();
            setFeedbackMessage("Data demo berhasil dimuat.");
          }
          setIsResetDemoConfirmOpen(false);
        }}
        onClose={() => setIsResetDemoConfirmOpen(false)}
      />
    </>
  );
};
