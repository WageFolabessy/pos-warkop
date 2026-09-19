'use client';

import React from 'react';
import { formatIDR } from '@/lib/formatters';
import { ChevronUp } from 'lucide-react';

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
        className="pointer-events-auto w-full bg-stone-900 text-stone-100 rounded-2xl p-3.5 shadow-xl border border-stone-800 flex items-center justify-between active:scale-[0.99] transition-all duration-100 cursor-pointer"
      >
        {/* Left: Target & Item count */}
        <div className="text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold text-sm sm:text-base text-white">
              {targetLabel}
            </span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            )}
          </div>
          <p className="text-xs text-stone-400 mt-1 font-mono tabular-nums">
            <strong className="text-white font-semibold">{totalCount}</strong> item •{' '}
            <span className="text-amber-400 font-bold">{formatIDR(subtotal)}</span>
          </p>
        </div>

        {/* Right: CTA Button */}
        <div className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-stone-700 shrink-0">
          <span>Lihat Tagihan</span>
          <ChevronUp className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};
