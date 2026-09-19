'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PaymentMethod, TransactionRecord, OrderItem } from '@/types/pos';
import { formatIDR } from '@/lib/formatters';
import {
  X,
  Banknote,
  QrCode,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  Minus,
  Plus,
  Split,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  targetLabel: string;
  items?: OrderItem[];
  subtotal: number;
  onClose: () => void;
  onConfirmPayment: (
    method: PaymentMethod,
    cashReceived?: number,
    change?: number,
    paidItems?: OrderItem[]
  ) => TransactionRecord;
  onPaymentSuccess: (transaction: TransactionRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  targetLabel,
  items = [],
  subtotal,
  onClose,
  onConfirmPayment,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [paymentMode, setPaymentMode] = useState<'all' | 'split'>('all');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  // Initialize or reset split selection when modal opens or items change
  useEffect(() => {
    if (isOpen) {
      setPaymentMode('all');
      const initialMap: Record<string, number> = {};
      items.forEach((it) => {
        initialMap[it.menuItem.id] = 0;
      });
      setSelectedQuantities(initialMap);
    }
  }, [isOpen, items]);

  // Handle quantity change for split bill
  const handleUpdateSplitQuantity = (itemId: string, delta: number, maxQty: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      return { ...prev, [itemId]: next };
    });
  };

  // Toggle all/none for a specific item in split bill
  const handleToggleItem = (itemId: string, maxQty: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[itemId] || 0;
      return { ...prev, [itemId]: current > 0 ? 0 : maxQty };
    });
  };

  // Select all items in split bill
  const handleSelectAllSplit = () => {
    const nextMap: Record<string, number> = {};
    items.forEach((it) => {
      nextMap[it.menuItem.id] = it.quantity;
    });
    setSelectedQuantities(nextMap);
  };

  // Clear all selections in split bill
  const handleClearAllSplit = () => {
    const nextMap: Record<string, number> = {};
    items.forEach((it) => {
      nextMap[it.menuItem.id] = 0;
    });
    setSelectedQuantities(nextMap);
  };

  // Effective items to be paid
  const effectiveItems = useMemo(() => {
    if (paymentMode === 'all') {
      return items;
    }
    return items
      .map((it) => ({
        ...it,
        quantity: selectedQuantities[it.menuItem.id] || 0,
      }))
      .filter((it) => it.quantity > 0);
  }, [paymentMode, items, selectedQuantities]);

  // Effective subtotal based on full payment or split payment
  const effectiveSubtotal = useMemo(() => {
    if (paymentMode === 'all') {
      return subtotal;
    }
    return effectiveItems.reduce(
      (sum, it) => sum + it.menuItem.price * it.quantity,
      0
    );
  }, [paymentMode, subtotal, effectiveItems]);

  const [cashReceived, setCashReceived] = useState<number>(subtotal);

  // Sync cashReceived when effective subtotal changes
  useEffect(() => {
    setCashReceived(effectiveSubtotal);
  }, [effectiveSubtotal]);

  // Quick preset amounts (higher than effectiveSubtotal)
  const presets = useMemo(() => {
    const fixedPresets = [10000, 20000, 50000, 100000];
    return fixedPresets.filter((val) => val > effectiveSubtotal);
  }, [effectiveSubtotal]);

  // Kembalian calculation
  const change = useMemo(() => {
    return Math.max(0, cashReceived - effectiveSubtotal);
  }, [cashReceived, effectiveSubtotal]);

  const isCashSufficient = cashReceived >= effectiveSubtotal;
  const canConfirm =
    effectiveSubtotal > 0 &&
    (paymentMethod === 'qris' || (paymentMethod === 'tunai' && isCashSufficient));

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!canConfirm) return;

    const transaction = onConfirmPayment(
      paymentMethod,
      paymentMethod === 'tunai' ? cashReceived : undefined,
      paymentMethod === 'tunai' ? change : undefined,
      paymentMode === 'split' ? effectiveItems : undefined
    );

    onClose();
    onPaymentSuccess(transaction);
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white text-gray-900 flex items-center justify-between border-b border-gray-200">
          <div>
            <span className="text-xs uppercase tracking-wide text-gray-500 block">
              Pembayaran
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {targetLabel}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-mono">
                {paymentMode === 'split' ? 'Bayar Terpilih' : 'Total Tagihan'}
              </span>
              <span className="text-base sm:text-lg font-mono font-semibold text-gray-900 tabular-nums">
                {formatIDR(effectiveSubtotal)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Payment Mode Selector (Bayar Semua vs Pisah Tagihan) */}
        {items.length > 0 && (
          <div className="px-4 py-2.5 bg-white border-b border-gray-100">
            <div className="flex items-center p-1 bg-gray-100 rounded-full border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMode('all')}
                className={`flex-1 py-1.5 px-3 rounded-full font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  paymentMode === 'all'
                    ? 'bg-white text-gray-900 font-semibold shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>Bayar Semua ({formatIDR(subtotal)})</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('split')}
                className={`flex-1 py-1.5 px-3 rounded-full font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  paymentMode === 'split'
                    ? 'bg-white text-gray-900 font-semibold shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Pisah Tagihan (Split Bill)</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Split Bill Item Selection Box */}
          {paymentMode === 'split' && (
            <div className="space-y-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-900 block">
                    Pilih Pesanan yang Ingin Dibayar
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Hanya item yang dipilih yang akan dilunasi dan dicetak di struk.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectAllSplit}
                    className="text-gray-600 hover:text-gray-900 underline cursor-pointer"
                  >
                    Pilih Semua
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={handleClearAllSplit}
                    className="text-gray-500 hover:text-gray-700 underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl bg-white overflow-hidden max-h-52 overflow-y-auto">
                {items.map((it) => {
                  const selectedQty = selectedQuantities[it.menuItem.id] || 0;
                  const isChecked = selectedQty > 0;

                  return (
                    <div
                      key={it.menuItem.id}
                      className={`p-2.5 flex items-center justify-between gap-2 transition-colors ${
                        isChecked ? 'bg-gray-50/60' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Checkbox & Name */}
                      <div
                        onClick={() => handleToggleItem(it.menuItem.id, it.quantity)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-gray-900 border-gray-900 text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-gray-900 block truncate">
                            {it.menuItem.name}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {formatIDR(it.menuItem.price)} • Tersedia: {it.quantity}x
                          </span>
                        </div>
                      </div>

                      {/* Stepper for Quantity to Pay */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSplitQuantity(it.menuItem.id, -1, it.quantity)
                            }
                            disabled={selectedQty <= 0}
                            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono font-semibold text-xs text-gray-900 tabular-nums">
                            {selectedQty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSplitQuantity(it.menuItem.id, 1, it.quantity)
                            }
                            disabled={selectedQty >= it.quantity}
                            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-mono font-semibold text-gray-900 w-16 text-right tabular-nums">
                          {formatIDR(it.menuItem.price * selectedQty)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Split Summary Footer */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-gray-500">
                  {effectiveItems.reduce((sum, it) => sum + it.quantity, 0)} porsi dipilih
                </span>
                <div className="text-right">
                  <span className="text-gray-500 text-[11px] mr-1.5">Subtotal Pisah:</span>
                  <span className="font-mono font-semibold text-gray-900 tabular-nums">
                    {formatIDR(effectiveSubtotal)}
                  </span>
                </div>
              </div>

              {effectiveSubtotal === 0 && (
                <p className="text-[11px] text-red-600 text-center font-medium pt-1">
                  Pilih minimal 1 item untuk diproses pembayaran.
                </p>
              )}
            </div>
          )}

          {/* Payment Method Tabs */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Metode Pembayaran
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="tab-tunai"
                onClick={() => {
                  setPaymentMethod('tunai');
                  setCashReceived(effectiveSubtotal);
                }}
                className={`py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  paymentMethod === 'tunai'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Tunai (Cash)</span>
              </button>

              <button
                id="tab-qris"
                onClick={() => setPaymentMethod('qris')}
                className={`py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  paymentMethod === 'qris'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QRIS</span>
              </button>
            </div>
          </div>

          {/* Payment Method Content */}
          {paymentMethod === 'tunai' ? (
            <div className="space-y-4">
              {/* Uang Diterima Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Uang Diterima
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 font-mono">
                    Rp
                  </span>
                  <input
                    id="input-uang-diterima"
                    type="number"
                    min={0}
                    step={1000}
                    value={cashReceived === 0 ? '' : cashReceived}
                    onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                    className="w-full pl-11 pr-4 py-3 text-lg font-mono font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent focus:bg-white tabular-nums"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Pilihan Cepat
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Uang Pas Button */}
                  <button
                    id="preset-cash-exact"
                    onClick={() => setCashReceived(effectiveSubtotal)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer text-center font-mono ${
                      cashReceived === effectiveSubtotal
                        ? 'bg-gray-900 border-gray-900 text-white font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Uang Pas ({formatIDR(effectiveSubtotal)})
                  </button>

                  {presets.map((amount) => (
                    <button
                      key={amount}
                      id={`preset-cash-${amount}`}
                      onClick={() => setCashReceived(amount)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer text-center font-mono ${
                        cashReceived === amount
                          ? 'bg-gray-900 border-gray-900 text-white font-semibold'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {formatIDR(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kembalian Display Block */}
              <div
                className={`p-4 rounded-xl border transition-colors ${
                  isCashSufficient
                    ? 'bg-gray-50 border-gray-200 text-gray-900'
                    : 'bg-red-50 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCashSufficient ? (
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {isCashSufficient ? 'Kembalian' : 'Uang Kurang'}
                    </span>
                  </div>
                  <span className="text-lg font-mono font-semibold tabular-nums">
                    {isCashSufficient
                      ? formatIDR(change)
                      : formatIDR(effectiveSubtotal - cashReceived)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* QRIS Screen */
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <ShieldCheck className="w-4 h-4 text-gray-500" />
                <span>QRIS Standar Pembayaran Nasional</span>
              </div>

              {/* Simulated QR Code Card */}
              <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col items-center">
                <div className="text-[10px] font-mono font-medium tracking-widest text-gray-900 border-b border-gray-200 pb-1 mb-2 w-full uppercase">
                  RATU KOPI PONTIANAK
                </div>
                <div className="w-44 h-44 bg-white p-2 border border-gray-200 rounded-lg flex items-center justify-center relative">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-stone-900"
                    fill="currentColor"
                  >
                    <rect x="0" y="0" width="30" height="30" rx="2" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="9" y="9" width="12" height="12" />

                    <rect x="70" y="0" width="30" height="30" rx="2" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="79" y="9" width="12" height="12" />

                    <rect x="0" y="70" width="30" height="30" rx="2" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="9" y="79" width="12" height="12" />

                    <rect x="36" y="10" width="8" height="8" />
                    <rect x="50" y="15" width="12" height="6" />
                    <rect x="40" y="32" width="20" height="20" />
                    <rect x="15" y="45" width="14" height="14" />
                    <rect x="70" y="40" width="10" height="25" />
                    <rect x="45" y="65" width="18" height="8" />
                    <rect x="70" y="75" width="22" height="15" />
                    <rect x="35" y="85" width="25" height="10" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-stone-900 rounded-md border border-white flex items-center justify-center shadow-xs">
                      <span className="font-semibold text-[10px] text-gray-100">
                        Ratu
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-mono text-gray-500">
                  NMID: ID102026889472 • A01
                </div>
              </div>

              <div className="text-xs text-gray-500 max-w-xs">
                Scan QRIS melalui GoPay, OVO, DANA, BCA, Livin, atau aplikasi perbankan lainnya.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            id="btn-konfirmasi-lunasi"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#0077ED] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-6 py-2.5 rounded-full text-xs sm:text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span>
              {paymentMode === 'split'
                ? `Lunasi Sebagian (${formatIDR(effectiveSubtotal)})`
                : 'Konfirmasi & Lunasi'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
