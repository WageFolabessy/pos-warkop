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

  // Quick preset amounts
  const presets = useMemo(() => {
    const defaultPresets = [10000, 20000, 50000, 100000];
    const filtered = defaultPresets.filter((val) => val >= subtotal);
    // Always include exact money
    return [subtotal, ...filtered.filter((p) => p !== subtotal)];
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
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#291811] text-amber-50 flex items-center justify-between border-b border-stone-800">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
              Pembayaran Transaksi
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {targetLabel}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-amber-200/80 block uppercase tracking-wider">
                Total Tagihan
              </span>
              <span className="text-lg font-black text-amber-400">
                {formatIDR(subtotal)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              paymentMethod === 'tunai'
                ? 'bg-amber-500 text-stone-950 shadow-sm ring-1 ring-amber-600/30'
                : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Banknote className="w-4 h-4 stroke-[2.2]" />
            <span>Tunai (Cash)</span>
          </button>

          <button
            id="tab-qris"
            onClick={() => setPaymentMethod('qris')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              paymentMethod === 'qris'
                ? 'bg-[#291811] text-amber-400 shadow-sm ring-1 ring-amber-600/30'
                : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <QrCode className="w-4 h-4 stroke-[2.2]" />
            <span>QRIS Statis/Dinamis</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {paymentMethod === 'tunai' ? (
            <div className="space-y-4">
              {/* Uang Diterima Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Uang Diterima
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                    Rp
                  </span>
                  <input
                    id="input-uang-diterima"
                    type="number"
                    min={0}
                    step={1000}
                    value={cashReceived === 0 ? '' : cashReceived}
                    onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                    className="w-full pl-11 pr-4 py-3 text-lg font-black text-stone-900 bg-stone-50 border border-stone-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="block text-[11px] font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
                  Pilihan Cepat
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {presets.map((amount, idx) => (
                    <button
                      key={amount}
                      id={`preset-cash-${amount}`}
                      onClick={() => setCashReceived(amount)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                        cashReceived === amount
                          ? 'bg-amber-100 border-amber-400 text-amber-950 font-black'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {idx === 0 ? `Uang Pas (${formatIDR(amount)})` : formatIDR(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kembalian Display Block */}
              <div
                className={`p-4 rounded-2xl border transition-colors ${
                  isCashSufficient
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-red-50 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCashSufficient ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {isCashSufficient ? 'Kembalian' : 'Uang Masih Kurang'}
                    </span>
                  </div>
                  <span className="text-xl font-black">
                    {isCashSufficient
                      ? formatIDR(change)
                      : formatIDR(subtotal - cashReceived)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* QRIS Screen */
            <div className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>QRIS Standar Pembayaran Nasional</span>
              </div>

              {/* Simulated QR Code Card */}
              <div className="p-4 bg-white border-2 border-stone-900 rounded-2xl shadow-sm flex flex-col items-center">
                <div className="text-[10px] font-black tracking-widest text-stone-900 border-b-2 border-stone-900 pb-1 mb-2 w-full">
                  RATU KOPI PONTIANAK
                </div>
                {/* Visual QR Code Representation using SVG */}
                <div className="w-44 h-44 bg-white p-2 border border-stone-200 rounded-xl flex items-center justify-center relative">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-stone-900"
                    fill="currentColor"
                  >
                    <rect x="0" y="0" width="30" height="30" rx="3" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="9" y="9" width="12" height="12" />

                    <rect x="70" y="0" width="30" height="30" rx="3" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="79" y="9" width="12" height="12" />

                    <rect x="0" y="70" width="30" height="30" rx="3" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="9" y="79" width="12" height="12" />

                    {/* Inner QR patterns */}
                    <rect x="36" y="10" width="8" height="8" />
                    <rect x="50" y="15" width="12" height="6" />
                    <rect x="40" y="32" width="20" height="20" />
                    <rect x="15" y="45" width="14" height="14" />
                    <rect x="70" y="40" width="10" height="25" />
                    <rect x="45" y="65" width="18" height="8" />
                    <rect x="70" y="75" width="22" height="15" />
                    <rect x="35" y="85" width="25" height="10" />
                  </svg>
                  {/* Center Coffee Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-9 h-9 bg-amber-500 rounded-lg border-2 border-white flex items-center justify-center shadow-xs">
                      <span className="font-serif italic font-bold text-xs text-stone-950">
                        Ratu
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-stone-500">
                  NMID: ID102026889472 • A01
                </div>
              </div>

              <div className="text-xs text-stone-600 max-w-xs">
                Scan QRIS di atas melalui GoPay, OVO, DANA, BCA, Livin, atau Mobile Banking lainnya.
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
            className="flex items-center gap-2 bg-[#291811] hover:bg-[#3d2419] disabled:bg-stone-300 disabled:text-stone-400 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Konfirmasi & Lunasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
