'use client';

import React from 'react';
import { formatIDR } from '@/lib/formatters';
import { ShoppingBag, Receipt, ChevronUp } from 'lucide-react';

interface MobileFloatingBarProps {
  targetLabel: string;
  isTakeaway: boolean;
  totalCount: number;
  subtotal: number;
  hasUnsavedChanges: boolean;
  onOpenDrawer: () => void;
}

export const MobileFloatingBar: React.FC<MobileFloatingBarProps> = ({
  targetLabel,
  isTakeaway,
  totalCount,
  subtotal,
  hasUnsavedChanges,
  onOpenDrawer,
}) => {
  return (
    <div className="no-print lg:hidden fixed bottom-0 left-0 right-0 p-3 z-30 pointer-events-none">
      <button
        id="btn-floating-bill-bar"
        onClick={onOpenDrawer}
        className="pointer-events-auto w-full bg-[#291811] text-amber-50 rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-amber-600/40 flex items-center justify-between active:scale-98 transition-all duration-150 cursor-pointer ring-2 ring-black/20"
      >
        {/* Left: Target & Item count */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-xs">
            {isTakeaway ? (
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-sm sm:text-base text-amber-300">
                {targetLabel}
              </span>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-stone-300 mt-1">
              <strong className="text-white font-bold">{totalCount}</strong> Item •{' '}
              <span className="text-amber-400 font-black">{formatIDR(subtotal)}</span>
            </p>
          </div>
        </div>

        {/* Right: CTA Button */}
        <div className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-xs shrink-0">
          <span>Lihat Tagihan</span>
          <ChevronUp className="w-4 h-4 stroke-[2.5]" />
        </div>
      </button>
    </div>
  );
};
