'use client';

import React, { useState } from 'react';
import { usePOSStore } from '@/hooks/usePOSStore';
import { TopBar } from '@/components/TopBar';
import { TablePanel } from '@/components/TablePanel';
import { MenuCatalogPanel } from '@/components/MenuCatalogPanel';
import { ActiveOrderPanel } from '@/components/ActiveOrderPanel';
import { MobileFloatingBar } from '@/components/MobileFloatingBar';
import { PaymentModal } from '@/components/PaymentModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { RekapKasModal } from '@/components/RekapKasModal';
import { TransactionRecord } from '@/types/pos';
import { Crown, Coffee, Users, Utensils } from 'lucide-react';

export default function POSHomePage() {
  const {
    isMounted,
    tables,
    activeTargetId,
    activeTable,
    draftItems,
    hasUnsavedChanges,
    draftSubtotal,
    draftTotalCount,
    transactions,
    dailySummary,
    occupiedTablesCount,
    selectTarget,
    addItemToDraft,
    updateQuantity,
    removeItemFromDraft,
    saveDraftToTable,
    cancelDraft,
    settlePayment,
    resetDemoData,
  } = usePOSStore();

  // Mobile navigation view: 'tables' | 'menu'
  const [mobileTab, setMobileTab] = useState<'tables' | 'menu'>('tables');
  const [isMobileOrderOpen, setIsMobileOrderOpen] = useState(false);

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isRekapOpen, setIsRekapOpen] = useState(false);
  const [latestTransaction, setLatestTransaction] = useState<TransactionRecord | null>(null);

  // Handle table selection on mobile (auto-navigates to menu catalog)
  const handleSelectTargetMobile = (targetId: string) => {
    selectTarget(targetId);
    setMobileTab('menu');
  };

  // Safe SSR Hydration Guard
  if (!isMounted) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#291811] text-amber-50">
        <div className="flex items-center gap-3 mb-4 animate-bounce">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center text-amber-950 shadow-lg">
            <Crown className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-serif italic text-3xl font-bold text-amber-500">
              Ratu
            </span>
            <span className="font-black text-3xl text-stone-100 ml-1">
              KOPI
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-200/80 tracking-widest uppercase">
          <Coffee className="w-4 h-4 text-amber-400 animate-spin" />
          <span>Memuat Sistem Kasir Offline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#FAF7F2] text-[#291811]">
      {/* 1. Top Bar */}
      <TopBar
        occupiedCount={occupiedTablesCount}
        totalTables={15}
        onOpenRekap={() => setIsRekapOpen(true)}
      />

      {/* 2. Mobile View Switcher Tabs (Only visible on screens < 1024px) */}
      <div className="no-print lg:hidden bg-[#291811] border-b border-stone-800 px-3 py-2 flex items-center gap-2 shrink-0">
        <button
          id="tab-mobile-tables"
          onClick={() => setMobileTab('tables')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer min-h-11 ${
            mobileTab === 'tables'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900/90 text-stone-300 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 stroke-[2.2]" />
          <span>Daftar Meja ({tables.filter((t) => !t.isTakeaway && t.status === 'belum_lunas').length}/15)</span>
        </button>

        <button
          id="tab-mobile-menu"
          onClick={() => setMobileTab('menu')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer min-h-11 ${
            mobileTab === 'menu'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900/90 text-stone-300 hover:text-white'
          }`}
        >
          <Utensils className="w-4 h-4 stroke-[2.2]" />
          <span>Katalog Menu ({activeTable?.label || 'Meja'})</span>
        </button>
      </div>

      {/* 3. Main Content Area */}
      {/* =========================================================================
          DESKTOP & LARGE TABLET (>= 1024px): 3 Side-by-Side Panels
          MOBILE & SMALL TABLET (< 1024px): Single Tabbed Panel + Floating Bill Bar
         ========================================================================= */}
      <main className="flex-1 flex flex-row overflow-hidden relative">
        {/* Panel Kiri: Meja & Takeaway */}
        <TablePanel
          tables={tables}
          activeTargetId={activeTargetId}
          onSelectTarget={(targetId) => {
            handleSelectTargetMobile(targetId);
          }}
          className={`${
            mobileTab === 'tables' ? 'w-full flex' : 'hidden'
          } lg:w-80 lg:shrink-0 lg:border-r lg:flex`}
        />

        {/* Panel Tengah: Katalog Menu */}
        <MenuCatalogPanel
          onSelectItem={addItemToDraft}
          activeTargetLabel={activeTable?.label}
          onBackToTables={() => setMobileTab('tables')}
          className={`${
            mobileTab === 'menu' ? 'w-full flex' : 'hidden'
          } lg:flex lg:flex-1`}
        />

        {/* Panel Kanan: Tagihan Aktif (Permanent on Large Screen >= 1024px) */}
        <ActiveOrderPanel
          activeTable={activeTable}
          draftItems={draftItems}
          hasUnsavedChanges={hasUnsavedChanges}
          subtotal={draftSubtotal}
          totalCount={draftTotalCount}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItemFromDraft}
          onSaveDraft={saveDraftToTable}
          onCancelDraft={cancelDraft}
          onOpenPayment={() => setIsPaymentOpen(true)}
          className="hidden lg:flex lg:w-96 lg:shrink-0 lg:border-l"
        />
      </main>

      {/* 4. Mobile Floating Bill Bar (< 1024px) */}
      <MobileFloatingBar
        targetLabel={activeTable?.label || 'Pesanan'}
        isTakeaway={activeTable?.isTakeaway || false}
        totalCount={draftTotalCount}
        subtotal={draftSubtotal}
        hasUnsavedChanges={hasUnsavedChanges}
        onOpenDrawer={() => setIsMobileOrderOpen(true)}
      />

      {/* 5. Mobile Active Order Drawer / Bottom Sheet Modal (< 1024px) */}
      {isMobileOrderOpen && (
        <div className="no-print lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileOrderOpen(false)}
          />
          <div className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-3xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Grab Bar Handle */}
            <div className="w-full flex justify-center py-2 bg-stone-50 border-b border-stone-200/50">
              <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
            </div>

            <ActiveOrderPanel
              activeTable={activeTable}
              draftItems={draftItems}
              hasUnsavedChanges={hasUnsavedChanges}
              subtotal={draftSubtotal}
              totalCount={draftTotalCount}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItemFromDraft}
              onSaveDraft={() => {
                saveDraftToTable();
                setIsMobileOrderOpen(false);
              }}
              onCancelDraft={cancelDraft}
              onOpenPayment={() => {
                setIsMobileOrderOpen(false);
                setIsPaymentOpen(true);
              }}
              onClose={() => setIsMobileOrderOpen(false)}
              className="flex-1 overflow-hidden"
            />
          </div>
        </div>
      )}

      {/* 6. Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        targetLabel={activeTable?.label || 'Pesanan'}
        subtotal={draftSubtotal}
        onClose={() => setIsPaymentOpen(false)}
        onConfirmPayment={settlePayment}
        onPaymentSuccess={(tx) => {
          setLatestTransaction(tx);
          setIsReceiptOpen(true);
        }}
      />

      {/* 7. Mini Thermal Receipt Modal (58mm) */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        transaction={latestTransaction}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* 8. Rekap Kas Modal */}
      <RekapKasModal
        isOpen={isRekapOpen}
        dailySummary={dailySummary}
        transactions={transactions}
        onClose={() => setIsRekapOpen(false)}
        onResetData={resetDemoData}
      />
    </div>
  );
}
