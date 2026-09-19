'use client';

import React, { useState, useMemo } from 'react';
import { PaymentMethod, TransactionRecord } from '@/types/pos';
import { formatIDR } from '@/lib/formatters';
import {
  X,
  Banknote,
  QrCode,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  targetLabel: string;
  subtotal: number;
  onClose: () => void;
  onConfirmPayment: (method: PaymentMethod, cashReceived?: number, change?: number) => TransactionRecord;
  onPaymentSuccess: (transaction: TransactionRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  targetLabel,
  subtotal,
  onClose,
  onConfirmPayment,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [cashReceived, setCashReceived] = useState<number>(subtotal);

  // Quick preset amounts (higher than subtotal)
  const presets = useMemo(() => {
    const fixedPresets = [10000, 20000, 50000, 100000];
    return fixedPresets.filter((val) => val > subtotal);
  }, [subtotal]);

  // Kembalian calculation
  const change = useMemo(() => {
    return Math.max(0, cashReceived - subtotal);
  }, [cashReceived, subtotal]);

  const isCashSufficient = cashReceived >= subtotal;

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (paymentMethod === 'tunai' && !isCashSufficient) {
      return;
    }

    const transaction = onConfirmPayment(
      paymentMethod,
      paymentMethod === 'tunai' ? cashReceived : undefined,
      paymentMethod === 'tunai' ? change : undefined
    );

    onClose();
    onPaymentSuccess(transaction);
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold block">
              Pembayaran
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {targetLabel}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-mono">
                Total Tagihan
              </span>
              <span className="text-base sm:text-lg font-mono font-bold text-amber-400 tabular-nums">
                {formatIDR(subtotal)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="p-3 bg-stone-100 border-b border-stone-200 grid grid-cols-2 gap-2">
          <button
            id="tab-tunai"
            onClick={() => {
              setPaymentMethod('tunai');
              setCashReceived(subtotal);
            }}
            className={`py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              paymentMethod === 'tunai'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
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
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QRIS</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {paymentMethod === 'tunai' ? (
            <div className="space-y-4">
              {/* Uang Diterima Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Uang Diterima
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400 font-mono">
                    Rp
                  </span>
                  <input
                    id="input-uang-diterima"
                    type="number"
                    min={0}
                    step={1000}
                    value={cashReceived === 0 ? '' : cashReceived}
                    onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                    className="w-full pl-11 pr-4 py-3 text-lg font-mono font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white tabular-nums"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="block text-[11px] font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
                  Pilihan Cepat
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Uang Pas Button */}
                  <button
                    id="preset-cash-exact"
                    onClick={() => setCashReceived(subtotal)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer text-center font-mono ${
                      cashReceived === subtotal
                        ? 'bg-stone-900 border-stone-900 text-white font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Uang Pas ({formatIDR(subtotal)})
                  </button>

                  {presets.map((amount) => (
                    <button
                      key={amount}
                      id={`preset-cash-${amount}`}
                      onClick={() => setCashReceived(amount)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer text-center font-mono ${
                        cashReceived === amount
                          ? 'bg-stone-900 border-stone-900 text-white font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
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
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-red-50 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCashSufficient ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {isCashSufficient ? 'Kembalian' : 'Uang Kurang'}
                    </span>
                  </div>
                  <span className="text-lg font-mono font-bold tabular-nums">
                    {isCashSufficient
                      ? formatIDR(change)
                      : formatIDR(subtotal - cashReceived)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* QRIS Screen */
            <div className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>QRIS Standar Pembayaran Nasional</span>
              </div>

              {/* Simulated QR Code Card */}
              <div className="p-4 bg-white border border-stone-300 rounded-xl shadow-2xs flex flex-col items-center">
                <div className="text-[10px] font-mono font-bold tracking-widest text-stone-900 border-b border-stone-200 pb-1 mb-2 w-full uppercase">
                  RATU KOPI PONTIANAK
                </div>
                <div className="w-44 h-44 bg-white p-2 border border-stone-200 rounded-lg flex items-center justify-center relative">
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
                      <span className="font-serif italic font-bold text-[10px] text-amber-400">
                        Ratu
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-mono text-stone-500">
                  NMID: ID102026889472 • A01
                </div>
              </div>

              <div className="text-xs text-stone-500 max-w-xs">
                Scan QRIS melalui GoPay, OVO, DANA, BCA, Livin, atau aplikasi perbankan lainnya.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            id="btn-konfirmasi-lunasi"
            disabled={paymentMethod === 'tunai' && !isCashSufficient}
            onClick={handleConfirm}
            className="flex items-center gap-2 bg-stone-900 hover:bg-black disabled:bg-stone-300 disabled:text-stone-400 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Konfirmasi & Lunasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
