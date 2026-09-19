'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Lanjutkan',
  cancelText = 'Batal',
  isDestructive = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="p-5 flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-stone-900 leading-snug">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-98 cursor-pointer ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-stone-950'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
