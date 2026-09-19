'use client';

import React, { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { OrderItem } from '@/types/pos';

interface ItemNotesModalProps {
  isOpen: boolean;
  item: OrderItem | null;
  onSaveNotes: (menuItemId: string, notes: string) => void;
  onClose: () => void;
}

const QUICK_NOTES = [
  'Manis Sedang',
  'Kurang Manis',
  'Sedikit Es',
  'Tanpa Es',
  'Kopi Pekat',
  'Telur 1/2 Matang',
  'Telur Dadar Renyah',
  'Pedas Sedang',
  'Pedas Banget',
  'Bungkus Pisah Kuah',
];

export const ItemNotesModal: React.FC<ItemNotesModalProps> = ({
  isOpen,
  item,
  onSaveNotes,
  onClose,
}) => {
  const [prevItemId, setPrevItemId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  if (item && item.menuItem.id !== prevItemId) {
    setPrevItemId(item.menuItem.id);
    setNoteText(item.notes || '');
  }

  if (!isOpen || !item) return null;

  const handleAppendQuickNote = (suggestion: string) => {
    if (!noteText.trim()) {
      setNoteText(suggestion);
    } else if (!noteText.includes(suggestion)) {
      setNoteText(`${noteText}, ${suggestion}`);
    }
  };

  const handleSave = () => {
    onSaveNotes(item.menuItem.id, noteText);
    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">
                Catatan Pesanan
              </h3>
              <span className="text-[11px] text-stone-400 font-medium">
                {item.menuItem.name}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Instruksi / Permintaan Khusus
            </label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Contoh: Kopi O manis sedang, sedikit es..."
              className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white text-stone-900 resize-none"
            />
          </div>

          {/* Quick suggestions */}
          <div>
            <span className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
              Pilihan Cepat Warkop
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTES.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleAppendQuickNote(sug)}
                  className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 cursor-pointer transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setNoteText('')}
            className="text-xs text-stone-500 hover:text-red-600 transition-colors cursor-pointer px-2 py-1"
          >
            Hapus Catatan
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-stone-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
