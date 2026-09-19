'use client';

import React, { useSyncExternalStore } from 'react';
import { ReceiptText, Clock, Store, UserCheck, ShieldCheck, ChefHat } from 'lucide-react';
import { formatIndonesianDateTime } from '@/lib/formatters';
import { UserRole } from '@/types/pos';

interface TopBarProps {
  occupiedCount: number;
  totalTables?: number;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
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
  currentRole,
  onRoleChange,
  onOpenRekap,
}) => {
  const currentDateTime = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot
  );

  return (
    <header className="no-print h-14 lg:h-16 w-full bg-stone-900 text-stone-100 px-3.5 sm:px-6 flex items-center justify-between border-b border-stone-800 z-20 select-none shadow-xs">
      {/* Commercial Minimalist Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="font-serif italic text-2xl sm:text-2xl font-bold text-amber-500 tracking-tight">
              Ratu
            </span>
            <span className="font-black text-xl sm:text-2xl text-white tracking-widest">
              KOPI
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.25em] text-stone-400 uppercase mt-0.5">
            PONTIANAK
          </span>
        </div>
      </div>

      {/* Role Switcher: [Owner] / [Kasir] / [Pelayan] / [Dapur] */}
      <div className="flex items-center bg-stone-800/90 p-1 rounded-xl border border-stone-700/80">
        <button
          id="btn-role-owner"
          onClick={() => onRoleChange('owner')}
          className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 min-h-9 ${
            currentRole === 'owner'
              ? 'bg-amber-400 text-stone-950 shadow-2xs font-bold'
              : 'text-stone-400 hover:text-white'
          }`}
          title="Beralih ke Mode Owner (Akses Penuh & Reset Data)"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Owner</span>
        </button>

        <button
          id="btn-role-kasir"
          onClick={() => onRoleChange('kasir')}
          className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 min-h-9 ${
            currentRole === 'kasir'
              ? 'bg-stone-100 text-stone-900 shadow-2xs font-bold'
              : 'text-stone-400 hover:text-white'
          }`}
          title="Beralih ke Mode Kasir (Operasional POS & Pembayaran)"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Kasir</span>
        </button>

        <button
          id="btn-role-pelayan"
          onClick={() => onRoleChange('pelayan')}
          className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 min-h-9 ${
            currentRole === 'pelayan'
              ? 'bg-amber-500 text-stone-950 shadow-2xs font-bold'
              : 'text-stone-400 hover:text-white'
          }`}
          title="Beralih ke Mode Pelayan (Pencatatan Pesanan)"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Pelayan</span>
        </button>

        <button
          id="btn-role-dapur"
          onClick={() => onRoleChange('dapur')}
          className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 min-h-9 ${
            currentRole === 'dapur'
              ? 'bg-orange-500 text-stone-950 shadow-2xs font-bold'
              : 'text-stone-400 hover:text-white'
          }`}
          title="Beralih ke Mode Dapur (Layar Antrean KDS)"
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Dapur</span>
        </button>
      </div>

      {/* Center: Live Indonesian Clock (Desktop/Landscape only) */}
      <div className="hidden xl:flex items-center gap-2 bg-stone-800/80 border border-stone-700/70 px-3.5 py-1.5 rounded-lg text-xs text-stone-300 font-mono tabular-nums shadow-xs">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span className="tracking-wide">
          {currentDateTime || 'Memuat waktu...'}
        </span>
      </div>

      {/* Right Controls: Table Occupancy & Rekap Kas */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Compact Occupancy Badge */}
        <div className="flex items-center gap-2 bg-stone-800/80 border border-stone-700/60 px-3 py-1.5 rounded-lg text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              occupiedCount > 0
                ? 'bg-amber-400 ring-2 ring-amber-400/30'
                : 'bg-emerald-400'
            }`}
          />
          <span className="font-medium text-stone-300 text-xs tabular-nums">
            <strong className="text-white font-bold">{occupiedCount}</strong>
            <span className="text-stone-400">/{totalTables}</span> Meja
          </span>
        </div>

        {/* Rekap Kas Button (Visible in Mode Kasir & Mode Owner - Hidden in Mode Pelayan) */}
        {(currentRole === 'kasir' || currentRole === 'owner') && (
          <button
            id="btn-rekap-kas"
            onClick={onOpenRekap}
            className="flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-200 hover:text-white border border-stone-700 min-h-10 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            title="Buka Laporan Rekap Kas Penjualan Hari Ini"
          >
            <ReceiptText className="w-4 h-4 text-amber-400 stroke-[2]" />
            <span className="hidden sm:inline">Rekap Kas</span>
          </button>
        )}
      </div>
    </header>
  );
};
