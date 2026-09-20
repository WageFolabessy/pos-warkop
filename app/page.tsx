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
import { MoveTableModal } from '@/components/MoveTableModal';
import { TransactionRecord, UserRole } from '@/types/pos';
import { Users, Utensils } from 'lucide-react';
import { WaiterView } from '@/components/WaiterView';
import { KitchenView } from '@/components/KitchenView';

export default function POSPage() {
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
    updateItemNotes,
    saveDraftToTable,
    cancelDraft,
    resetActiveTable,
    settlePayment,
    expenses,
    addExpense,
    deleteExpense,
    moveTableOrder,
    openingCash,
    actualCash,
    setOpeningCash,
    setActualCash,
    resetAllData,
    resetDemoData,
    updateKitchenStatus,
    toggleKitchenItemDone,
  } = usePOSStore();

  // Role Switcher: 'owner' | 'kasir' | 'pelayan' | 'dapur'
  const [currentRole, setCurrentRole] = useState<UserRole>('kasir');

  // Guard reset actions for owner role only
  const handleResetAllData = () => {
    if (currentRole !== 'owner') return;
    resetAllData();
  };

  const handleResetDemoData = () => {
    if (currentRole !== 'owner') return;
    resetDemoData();
  };

  // Mobile navigation view: 'tables' | 'menu' (for Cashier mode)
  const [mobileTab, setMobileTab] = useState<'tables' | 'menu'>('tables');
  const [isMobileOrderOpen, setIsMobileOrderOpen] = useState(false);

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isRekapOpen, setIsRekapOpen] = useState(false);
  const [isMoveTableOpen, setIsMoveTableOpen] = useState(false);
  const [latestTransaction, setLatestTransaction] = useState<TransactionRecord | null>(null);

  // Handle table selection on mobile (auto-navigates to menu catalog)
  const handleSelectTargetMobile = (targetId: string) => {
    selectTarget(targetId);
    setMobileTab('menu');
  };

  // Compute in-cart counter badge for each menu item
  const cartItemCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    draftItems.forEach((item) => {
      counts[item.menuItem.id] = (counts[item.menuItem.id] || 0) + item.quantity;
    });
    return counts;
  }, [draftItems]);

  // Safe SSR Hydration Guard
  if (!isMounted) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white text-gray-900">
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-2xl text-gray-900">
              Ratu
            </span>
            <span className="font-semibold text-2xl text-gray-700 tracking-wider">
              KOPI
            </span>
          </div>
          <span className="text-xs font-mono tracking-[0.25em] text-gray-500 uppercase mt-1">
            PONTIANAK
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
          <span>Memuat Sistem Kasir Offline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50 text-gray-900">
      {/* 1. Top Bar with Role Switcher [Kasir] / [Pelayan] */}
      <TopBar
        occupiedCount={occupiedTablesCount}
        totalTables={15}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenRekap={() => setIsRekapOpen(true)}
      />

      {/* =========================================================================
          MODE PELAYAN (Waiter View - Mobile First, Pencatatan Pesanan)
          vs
          MODE DAPUR (Kitchen Display System - Antrean Minuman & Makanan Real-Time)
          vs
          MODE KASIR & OWNER (Akses POS Penuh: Meja, Menu, Pembayaran, Rekap)
         ========================================================================= */}
      {currentRole === 'pelayan' ? (
        <WaiterView
          tables={tables}
          activeTargetId={activeTargetId}
          activeTable={activeTable}
          draftItems={draftItems}
          draftTotalCount={draftTotalCount}
          onSelectTarget={selectTarget}
          onAddItem={addItemToDraft}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItemFromDraft}
          onUpdateNotes={updateItemNotes}
          onSaveOrder={saveDraftToTable}
          onResetOrder={() => resetActiveTable()}
        />
      ) : currentRole === 'dapur' ? (
        <KitchenView
          tables={tables}
          onUpdateKitchenStatus={updateKitchenStatus}
          onToggleItemDone={toggleKitchenItemDone}
        />
      ) : (
        <>
          {/* 2. Mobile View Switcher Tabs (Only visible on screens < 1024px in Cashier mode) */}
          <div className="no-print lg:hidden bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0">
            <button
              id="tab-mobile-tables"
              onClick={() => setMobileTab('tables')}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-xl font-semibold text-xs transition-colors cursor-pointer min-h-11 ${
                mobileTab === 'tables'
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">Meja ({tables.filter((t) => !t.isTakeaway && t.status === 'belum_lunas').length}/15)</span>
            </button>

            <button
              id="tab-mobile-menu"
              onClick={() => setMobileTab('menu')}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-xl font-semibold text-xs transition-colors cursor-pointer min-h-11 ${
                mobileTab === 'menu'
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Utensils className="w-4 h-4 shrink-0" />
              <span className="truncate">
                Menu ({activeTable?.isTakeaway ? 'Bungkus' : (activeTable?.label || 'Meja')})
              </span>
            </button>
          </div>

          {/* 3. Main Cashier Content Area (Desktop 3-Panel / Mobile Tabbed) */}
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
              cartItemCounts={cartItemCounts}
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
              onResetOrder={() => resetActiveTable()}
              onOpenPayment={() => setIsPaymentOpen(true)}
              onOpenMoveTable={() => setIsMoveTableOpen(true)}
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
                <div className="w-full flex justify-center py-2 bg-gray-50 border-b border-gray-200/50">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
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
                  onResetOrder={() => {
                    resetActiveTable();
                    setIsMobileOrderOpen(false);
                  }}
                  onOpenPayment={() => {
                    setIsMobileOrderOpen(false);
                    setIsPaymentOpen(true);
                  }}
                  onOpenMoveTable={() => {
                    setIsMobileOrderOpen(false);
                    setIsMoveTableOpen(true);
                  }}
                  onClose={() => setIsMobileOrderOpen(false)}
                  className="flex-1 overflow-hidden"
                />
              </div>
            </div>
          )}

          {/* 6. Payment Modal (Cashier Only) */}
          <PaymentModal
            isOpen={isPaymentOpen}
            targetLabel={activeTable?.label || 'Pesanan'}
            items={draftItems}
            subtotal={draftSubtotal}
            onClose={() => setIsPaymentOpen(false)}
            onConfirmPayment={settlePayment}
            onPaymentSuccess={(tx) => {
              setLatestTransaction(tx);
              setIsReceiptOpen(true);
            }}
          />

          {/* 7. Mini Thermal Receipt Modal (58mm - Cashier Only) */}
          <ReceiptModal
            isOpen={isReceiptOpen}
            transaction={latestTransaction}
            onClose={() => setIsReceiptOpen(false)}
          />

          {/* 8. Rekap Kas Modal (Cashier & Owner) */}
          <RekapKasModal
            isOpen={isRekapOpen}
            currentRole={currentRole}
            dailySummary={dailySummary}
            transactions={transactions}
            expenses={expenses}
            openingCash={openingCash}
            actualCash={actualCash}
            onClose={() => setIsRekapOpen(false)}
            onResetAllData={handleResetAllData}
            onResetDemoData={handleResetDemoData}
            onAddExpense={addExpense}
            onDeleteExpense={deleteExpense}
            onUpdateOpeningCash={setOpeningCash}
            onUpdateActualCash={setActualCash}
          />

          {/* 9. Move Table Modal (Cashier Only) */}
          <MoveTableModal
            isOpen={isMoveTableOpen}
            currentTable={activeTable}
            tables={tables}
            onMoveTable={moveTableOrder}
            onClose={() => setIsMoveTableOpen(false)}
          />
        </>
      )}
    </div>
  );
}
