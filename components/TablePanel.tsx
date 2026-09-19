'use client';

import React from 'react';
import { TableOrder } from '@/types/pos';
import { formatIDR } from '@/lib/formatters';
import { ShoppingBag, Users, CheckCircle2, Clock3 } from 'lucide-react';

interface TablePanelProps {
  tables: TableOrder[];
  activeTargetId: string;
  onSelectTarget: (targetId: string) => void;
  className?: string;
}

export const TablePanel: React.FC<TablePanelProps> = ({
  tables,
  activeTargetId,
  onSelectTarget,
  className = '',
}) => {
  const takeaway = tables.find((t) => t.isTakeaway);
  const physicalTables = tables.filter((t) => !t.isTakeaway);

  // Helper to calculate total for card preview
  const getTableSummary = (table: TableOrder) => {
    const totalItems = table.items.reduce((sum, it) => sum + it.quantity, 0);
    const totalPrice = table.items.reduce(
      (sum, it) => sum + it.menuItem.price * it.quantity,
      0
    );
    return { totalItems, totalPrice };
  };

  const takeawaySummary = takeaway ? getTableSummary(takeaway) : { totalItems: 0, totalPrice: 0 };
  const isTakeawayActive = activeTargetId === 'takeaway';

  return (
    <aside
      className={`no-print flex flex-col h-full bg-[#F4EFEA] select-none ${className}`}
    >
      {/* Panel Header */}
      <div className="p-3 sm:p-3.5 border-b border-stone-200/80 bg-stone-100/70">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-amber-700" />
          Daftar Meja & Pesanan
        </h2>
      </div>

      {/* Prominent Takeaway Top Card */}
      <div className="p-3 sm:p-3.5 border-b border-stone-200/60">
        <button
          id="btn-target-takeaway"
          onClick={() => onSelectTarget('takeaway')}
          className={`w-full text-left p-3.5 sm:p-4 rounded-2xl transition-all duration-150 cursor-pointer border relative overflow-hidden min-h-16 flex items-center ${
            isTakeawayActive
              ? 'bg-[#291811] text-amber-50 border-amber-600 shadow-md ring-2 ring-amber-500/50'
              : takeaway?.status === 'belum_lunas'
              ? 'bg-amber-50 border-amber-300 text-stone-900 hover:bg-amber-100/80 shadow-xs'
              : 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-stone-50 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isTakeawayActive
                    ? 'bg-amber-500 text-stone-950'
                    : takeaway?.status === 'belum_lunas'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3
                  className={`font-bold text-sm sm:text-base ${
                    isTakeawayActive ? 'text-amber-300' : 'text-stone-900'
                  }`}
                >
                  Bungkus / Takeaway
                </h3>
                <p
                  className={`text-xs ${
                    isTakeawayActive
                      ? 'text-stone-300'
                      : takeaway?.status === 'belum_lunas'
                      ? 'text-amber-800 font-semibold'
                      : 'text-stone-600'
                  }`}
                >
                  {takeaway?.status === 'belum_lunas'
                    ? `${takeawaySummary.totalItems} item • ${formatIDR(takeawaySummary.totalPrice)}`
                    : 'Siap isi pesanan bawa pulang'}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                takeaway?.status === 'belum_lunas'
                  ? isTakeawayActive
                    ? 'bg-amber-400 text-stone-950'
                    : 'bg-amber-200 text-amber-900'
                  : isTakeawayActive
                  ? 'bg-stone-700 text-stone-200'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {takeaway?.status === 'belum_lunas' ? (
                <>
                  <Clock3 className="w-3.5 h-3.5" />
                  <span>Belum Lunas</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kosong</span>
                </>
              )}
            </span>
          </div>
        </button>
      </div>

      {/* 15 Table Grid Cards */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {physicalTables.map((table) => {
            const { totalItems, totalPrice } = getTableSummary(table);
            const isSelected = activeTargetId === table.targetId;
            const isUnpaid = table.status === 'belum_lunas';

            return (
              <button
                key={table.targetId}
                id={`btn-target-${table.targetId}`}
                onClick={() => onSelectTarget(table.targetId)}
                className={`text-left p-3 sm:p-3.5 rounded-2xl transition-all duration-150 cursor-pointer border flex flex-col justify-between min-h-24 relative active:scale-98 ${
                  isSelected
                    ? 'bg-[#291811] text-amber-50 border-amber-600 shadow-md ring-2 ring-amber-500/50'
                    : isUnpaid
                    ? 'bg-amber-50/90 border-amber-300 text-stone-900 hover:bg-amber-100/90 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-800 hover:border-amber-300 hover:bg-stone-50 shadow-xs'
                }`}
              >
                {/* Table Number & Status Pill */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-black text-sm sm:text-base tracking-tight ${
                      isSelected ? 'text-amber-400' : 'text-stone-900'
                    }`}
                  >
                    {table.label}
                  </span>

                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isUnpaid
                        ? 'bg-amber-500 animate-pulse ring-2 ring-amber-300'
                        : 'bg-emerald-500'
                    }`}
                    title={isUnpaid ? 'Belum Lunas' : 'Kosong'}
                  />
                </div>

                {/* Subtitle / Price Breakdown */}
                <div className="mt-1">
                  {isUnpaid ? (
                    <div>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {totalItems} item
                      </span>
                      <p
                        className={`text-xs font-bold mt-1 truncate ${
                          isSelected ? 'text-stone-100' : 'text-amber-900'
                        }`}
                      >
                        {formatIDR(totalPrice)}
                      </p>
                    </div>
                  ) : (
                    <p
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        isSelected ? 'text-stone-300' : 'text-stone-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Kosong
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
