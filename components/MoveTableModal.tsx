'use client';

import React, { useState } from 'react';
import { TableOrder } from '@/types/pos';
import { X, ArrowRightLeft, Check, AlertCircle } from 'lucide-react';

interface MoveTableModalProps {
  isOpen: boolean;
  currentTable: TableOrder | null;
  tables: TableOrder[];
  onMoveTable: (fromTargetId: string, toTargetId: string) => void;
  onClose: () => void;
}

export const MoveTableModal: React.FC<MoveTableModalProps> = ({
  isOpen,
  currentTable,
  tables,
  onMoveTable,
  onClose,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  if (!isOpen || !currentTable) return null;

  // Filter only physical tables that are empty and not the current table
  const availableTables = tables.filter(
    (tbl) => !tbl.isTakeaway && tbl.status === 'kosong' && tbl.targetId !== currentTable.targetId
  );

  const handleConfirm = () => {
    if (!selectedTargetId) return;
    onMoveTable(currentTable.targetId, selectedTargetId);
    onClose();
    setSelectedTargetId(null);
  };

  const selectedTableObj = tables.find((t) => t.targetId === selectedTargetId);

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 leading-tight">
                Pindah Meja
              </h3>
              <p className="text-xs text-gray-500">
                Dari <strong className="text-gray-900 font-semibold">{currentTable.label}</strong>
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
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              Pilih Meja Tujuan
            </span>

            {availableTables.length === 0 ? (
              <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <AlertCircle className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="text-xs font-medium text-gray-700">
                  Tidak ada meja kosong
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {availableTables.map((tbl) => {
                  const isSelected = selectedTargetId === tbl.targetId;

                  return (
                    <button
                      key={tbl.targetId}
                      type="button"
                      onClick={() => setSelectedTargetId(tbl.targetId)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer select-none relative ${
                        isSelected
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-white text-gray-900 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <span className="font-semibold text-xs sm:text-sm block">
                        {tbl.label}
                      </span>
                      <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                        Kosong
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {currentTable.items.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
              <span className="font-medium text-gray-800 block">
                Pesanan ({currentTable.items.reduce((s, it) => s + it.quantity, 0)} item):
              </span>
              <p className="text-[11px] text-gray-500 line-clamp-2">
                {currentTable.items.map((it) => `${it.quantity}x ${it.menuItem.name}`).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={!selectedTargetId}
            onClick={handleConfirm}
            className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#0077ED] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-2.5 rounded-full text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Pindah ke {selectedTableObj?.label || 'Meja'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
