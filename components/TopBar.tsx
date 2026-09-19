'use client';

import React, { useSyncExternalStore } from 'react';
import { Crown, ReceiptText, Clock } from 'lucide-react';
import { formatIndonesianDateTime } from '@/lib/formatters';

interface TopBarProps {
  occupiedCount: number;
  totalTables?: number;
  onOpenRekap: () => void;
}

function subscribeToClock(callback: () => void) {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);
}

function getClockSnapshot() {
  return formatIndonesianDateTime(new Date());
}

function getServerClockSnapshot() {
  return '';
}

export const TopBar: React.FC<TopBarProps> = ({
  occupiedCount,
  totalTables = 15,
  onOpenRekap,
}) => {
  const currentDateTime = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot
  );

  return (
    <header className="no-print h-14 lg:h-16 w-full bg-[#291811] text-amber-50 px-3 sm:px-6 flex items-center justify-between shadow-md border-b border-[#3d2419] z-20 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-inner text-amber-950 shrink-0">
          <Crown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-baseline gap-1 sm:gap-1.5 leading-none">
            <span className="font-serif italic text-xl sm:text-2xl font-bold text-amber-500 tracking-wide drop-shadow-xs">
              Ratu
            </span>
            <span className="font-black text-xl sm:text-2xl text-stone-100 tracking-wider">
              KOPI
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-medium tracking-wider text-amber-200/70 uppercase mt-0.5 truncate max-w-35 sm:max-w-none">
            Pontianak • Warkop POS
          </p>
        </div>
      </div>

      {/* Center: Live Indonesian Clock (Hidden on phone/tablet portrait) */}
      <div className="hidden lg:flex items-center gap-2 bg-stone-900/60 border border-stone-700/50 px-3.5 py-1.5 rounded-full text-xs text-amber-100/90 shadow-inner">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="font-medium tracking-wide">
          {currentDateTime || 'Memuat waktu...'}
        </span>
      </div>

      {/* Right Controls: Table Occupancy & Rekap Kas */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Compact Occupancy Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-900/80 border border-amber-900/40 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs">
          <span
            className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${
              occupiedCount > 0
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse'
                : 'bg-emerald-500'
            }`}
          />
          <span className="font-semibold text-stone-200 text-[11px] sm:text-xs">
            <strong className="text-amber-400 font-bold">{occupiedCount}</strong>
            <span className="hidden xs:inline">/{totalTables}</span> Meja
          </span>
        </div>

        {/* Rekap Kas Button (Min 44px touch target) */}
        <button
          id="btn-rekap-kas"
          onClick={onOpenRekap}
          className="flex items-center justify-center gap-1.5 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-stone-950 font-bold min-h-11 min-w-11 px-3 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all duration-150 cursor-pointer"
          title="Buka Laporan Rekap Kas Penjualan Hari Ini"
        >
          <ReceiptText className="w-4 h-4 text-stone-950 stroke-[2.2]" />
          <span className="hidden sm:inline">Rekap Kas</span>
        </button>
      </div>
    </header>
  );
};
