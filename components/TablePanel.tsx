'use client';

import React from 'react';
import { TableOrder } from '@/types/pos';
import { formatIDR } from '@/lib/formatters';
import { ShoppingBag, Users } from 'lucide-react';

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
  const isTakeawayUnpaid = takeaway?.status === 'belum_lunas';

  return (
    <aside
      className={`no-print flex flex-col h-full bg-gray-50 select-none ${className}`}
    >
      {/* Panel Header */}
      <div className="p-3.5 border-b border-gray-200 bg-white flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          Daftar Meja
        </h2>
        <span className="text-[11px] font-mono text-gray-400">
          {physicalTables.filter((t) => t.status === 'belum_lunas').length}/15 Terisi
        </span>
      </div>

      {/* Horizontal Compact Takeaway Card */}
      <div className="p-3 border-b border-gray-200">
        <button
          id="btn-target-takeaway"
          onClick={() => onSelectTarget('takeaway')}
          className={`w-full text-left p-3 rounded-xl transition-all duration-100 cursor-pointer border flex items-center justify-between min-h-12 bg-white ${
            isTakeawayActive
              ? 'border-gray-900 ring-2 ring-gray-900 shadow-xs'
              : isTakeawayUnpaid
              ? 'border-gray-900 bg-gray-50 hover:bg-gray-100'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isTakeawayUnpaid ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-xs sm:text-sm text-gray-900 block leading-tight">
                Bungkus (Bawa Pulang)
              </span>
              <span className="text-[11px] text-gray-500 block">
                {isTakeawayUnpaid
                  ? `${takeawaySummary.totalItems} item pesanan`
                  : 'Pesanan dibawa pulang'}
              </span>
            </div>
          </div>

          <div>
            {isTakeawayUnpaid ? (
              <div className="flex flex-col items-end gap-1">
                <span className="font-mono font-semibold text-xs text-gray-900 tabular-nums">
                  {formatIDR(takeawaySummary.totalPrice)}
                </span>
                {takeaway?.kitchenStatus === 'siap_saji' && (
                  <span className="text-gray-600 text-[9px] font-medium">
                    Siap Antar
                  </span>
                )}
                {takeaway?.kitchenStatus === 'dimasak' && (
                  <span className="text-gray-500 text-[9px] font-medium">
                    Diracik
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                Tersedia
              </span>
            )}
          </div>
        </button>
      </div>

      {/* 15 Table Grid Cards - Modern Commercial Layout */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {physicalTables.map((table) => {
            const { totalItems, totalPrice } = getTableSummary(table);
            const isSelected = activeTargetId === table.targetId;
            const isUnpaid = table.status === 'belum_lunas';

            return (
              <button
                key={table.targetId}
                id={`btn-target-${table.targetId}`}
                onClick={() => onSelectTarget(table.targetId)}
                className={`text-left p-3 rounded-xl transition-all duration-100 cursor-pointer border flex flex-col justify-between min-h-22 bg-white active:scale-[0.98] ${
                  isSelected
                    ? 'border-gray-900 ring-2 ring-gray-900 shadow-xs'
                    : isUnpaid
                    ? 'border-gray-400 bg-gray-50 hover:bg-gray-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header: Table Label + Status Dot (6px) */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-sm text-gray-900 tracking-tight">
                    {table.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {table.kitchenStatus === 'siap_saji' && (
                      <span className="text-gray-600 text-[9px] font-medium">
                        Siap Antar
                      </span>
                    )}
                    {table.kitchenStatus === 'dimasak' && (
                      <span className="text-gray-500 text-[9px] font-medium">
                        Diracik
                      </span>
                    )}
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isUnpaid ? 'bg-gray-900' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="mt-2">
                  {isUnpaid ? (
                    <div>
                      <div className="font-mono font-semibold text-xs sm:text-sm text-gray-900 tabular-nums leading-tight">
                        {formatIDR(totalPrice)}
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {totalItems} item
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 font-medium">
                      Tersedia
                    </div>
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
