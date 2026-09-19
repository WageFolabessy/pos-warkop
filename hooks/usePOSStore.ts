'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MenuItem, OrderItem, TableOrder, TransactionRecord, PaymentMethod, DailySummary, KitchenStatus, ExpenseRecord } from '@/types/pos';
import { getInitialTables, getInitialTransactions } from '@/data/initialTables';
import { generateOrderId } from '@/lib/formatters';

const STORAGE_KEYS = {
  TABLES: 'pos_warkop_ratu_tables_v1',
  TRANSACTIONS: 'pos_warkop_ratu_transactions_v1',
  ACTIVE_TARGET: 'pos_warkop_ratu_active_target_v1',
  EXPENSES: 'pos_warkop_ratu_expenses_v1',
  OPENING_CASH: 'pos_warkop_ratu_opening_cash_v1',
  ACTUAL_CASH: 'pos_warkop_ratu_actual_cash_v1',
};

export function usePOSStore() {
  const [isMounted, setIsMounted] = useState(false);
  const [tables, setTables] = useState<TableOrder[]>([]);
  const [activeTargetId, setActiveTargetId] = useState<string>('table-1');
  const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [openingCash, setOpeningCashState] = useState<number>(0);
  const [actualCash, setActualCashState] = useState<number | null>(null);

  // 1. Safe Hydration & initial load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedTables = localStorage.getItem(STORAGE_KEYS.TABLES);
        const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        const storedActiveTarget = localStorage.getItem(STORAGE_KEYS.ACTIVE_TARGET);
        const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        const storedOpeningCash = localStorage.getItem(STORAGE_KEYS.OPENING_CASH);
        const storedActualCash = localStorage.getItem(STORAGE_KEYS.ACTUAL_CASH);

        const initialTables = storedTables ? JSON.parse(storedTables) : getInitialTables();
        const initialTransactions = storedTransactions ? JSON.parse(storedTransactions) : getInitialTransactions();
        const initialTarget = storedActiveTarget || 'table-1';
        const initialExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
        const initialOpeningCash = storedOpeningCash !== null ? Number(storedOpeningCash) : 0;
        const initialActualCash = storedActualCash !== null ? Number(storedActualCash) : null;

        setTables(initialTables);
        setTransactions(initialTransactions);
        setExpenses(initialExpenses);
        setOpeningCashState(initialOpeningCash);
        setActualCashState(initialActualCash);
        setActiveTargetId(initialTarget);

        // Initialize draft items with the active table's current items
        const activeTable = initialTables.find((t: TableOrder) => t.targetId === initialTarget);
        if (activeTable) {
          setDraftItems([...activeTable.items.map((it: OrderItem) => ({ ...it }))]);
        }
      } catch (e) {
        console.error('Failed to load POS data from localStorage, falling back to initial data', e);
        const initialTables = getInitialTables();
        const initialTransactions = getInitialTransactions();
        setTables(initialTables);
        setTransactions(initialTransactions);
        setExpenses([]);
        setOpeningCashState(0);
        setActualCashState(null);
        setActiveTargetId('table-1');
        setDraftItems([...(initialTables[1]?.items || [])]);
      } finally {
        setIsMounted(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save tables to localStorage helper
  const persistTables = useCallback((updatedTables: TableOrder[]) => {
    setTables(updatedTables);
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(updatedTables));
    } catch (e) {
      console.error('Failed to persist tables to localStorage', e);
    }
  }, []);

  // Save transactions to localStorage helper
  const persistTransactions = useCallback((updatedTransactions: TransactionRecord[]) => {
    setTransactions(updatedTransactions);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    } catch (e) {
      console.error('Failed to persist transactions to localStorage', e);
    }
  }, []);

  // Save expenses to localStorage helper
  const persistExpenses = useCallback((updatedExpenses: ExpenseRecord[]) => {
    setExpenses(updatedExpenses);
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updatedExpenses));
    } catch (e) {
      console.error('Failed to persist expenses to localStorage', e);
    }
  }, []);

  // Update opening cash (modal awal)
  const setOpeningCash = useCallback((amount: number) => {
    const safeAmount = Math.max(0, amount || 0);
    setOpeningCashState(safeAmount);
    try {
      localStorage.setItem(STORAGE_KEYS.OPENING_CASH, String(safeAmount));
    } catch {
      // ignore
    }
  }, []);

  // Update actual cash counted in drawer (hitung uang fisik)
  const setActualCash = useCallback((amount: number | null) => {
    setActualCashState(amount);
    try {
      if (amount === null) {
        localStorage.removeItem(STORAGE_KEYS.ACTUAL_CASH);
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTUAL_CASH, String(amount));
      }
    } catch {
      // ignore
    }
  }, []);

  // Current active table
  const activeTable = useMemo(() => {
    return tables.find((t) => t.targetId === activeTargetId) || tables[0] || null;
  }, [tables, activeTargetId]);

  // Check if draft has unsaved changes compared to table
  const hasUnsavedChanges = useMemo(() => {
    if (!activeTable) return false;
    if (draftItems.length !== activeTable.items.length) return true;
    for (let i = 0; i < draftItems.length; i++) {
      const draft = draftItems[i];
      const saved = activeTable.items.find((it) => it.menuItem.id === draft.menuItem.id);
      if (!saved || saved.quantity !== draft.quantity) return true;
    }
    return false;
  }, [draftItems, activeTable]);

  // Switch active target (table or takeaway)
  const selectTarget = useCallback((targetId: string) => {
    setActiveTargetId(targetId);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TARGET, targetId);
    } catch {
      // ignore storage error
    }

    setTables((currentTables) => {
      const target = currentTables.find((t) => t.targetId === targetId);
      if (target) {
        setDraftItems(target.items.map((it) => ({ ...it })));
      } else {
        setDraftItems([]);
      }
      return currentTables;
    });
  }, []);

  // Add menu item to draft order
  const addItemToDraft = useCallback((menuItem: MenuItem) => {
    setDraftItems((prev) => {
      const existingIndex = prev.findIndex((it) => it.menuItem.id === menuItem.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      } else {
        return [...prev, { menuItem, quantity: 1 }];
      }
    });
  }, []);

  // Update item quantity in draft
  const updateQuantity = useCallback((menuItemId: string, delta: number) => {
    setDraftItems((prev) => {
      const existingIndex = prev.findIndex((it) => it.menuItem.id === menuItemId);
      if (existingIndex === -1) return prev;

      const currentQty = prev[existingIndex].quantity;
      const nextQty = currentQty + delta;

      if (nextQty <= 0) {
        return prev.filter((it) => it.menuItem.id !== menuItemId);
      } else {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: nextQty,
        };
        return next;
      }
    });
  }, []);

  // Remove item completely from draft
  const removeItemFromDraft = useCallback((menuItemId: string) => {
    setDraftItems((prev) => prev.filter((it) => it.menuItem.id !== menuItemId));
  }, []);

  // Update notes for an item in draft
  const updateItemNotes = useCallback((menuItemId: string, notes: string) => {
    setDraftItems((prev) => {
      const existingIndex = prev.findIndex((it) => it.menuItem.id === menuItemId);
      if (existingIndex === -1) return prev;
      const next = [...prev];
      next[existingIndex] = {
        ...next[existingIndex],
        notes: notes.trim() || undefined,
      };
      return next;
    });
  }, []);

  // Commit draft to active table tab and persist
  const saveDraftToTable = useCallback(() => {
    if (!activeTargetId) return;

    setTables((prevTables) => {
      const updated = prevTables.map((tbl) => {
        if (tbl.targetId === activeTargetId) {
          const hasItems = draftItems.length > 0;
          return {
            ...tbl,
            status: hasItems ? ('belum_lunas' as const) : ('kosong' as const),
            kitchenStatus: hasItems ? (tbl.kitchenStatus || 'menunggu') : undefined,
            completedItemIds: hasItems ? (tbl.completedItemIds || []) : [],
            items: draftItems.map((it) => ({ ...it })),
            lastUpdated: new Date().toISOString(),
          };
        }
        return tbl;
      });

      persistTables(updated);
      return updated;
    });
  }, [activeTargetId, draftItems, persistTables]);

  // Revert draft back to current table state
  const cancelDraft = useCallback(() => {
    if (!activeTable) {
      setDraftItems([]);
    } else {
      setDraftItems(activeTable.items.map((it) => ({ ...it })));
    }
  }, [activeTable]);

  // Settle payment (supports full settlement or partial split bill)
  const settlePayment = useCallback(
    (
      method: PaymentMethod,
      cashReceived?: number,
      change?: number,
      paidItems?: OrderItem[]
    ): TransactionRecord => {
      // If paidItems is passed and not empty, use paidItems; otherwise settle all draftItems
      const itemsToSettle = (paidItems && paidItems.length > 0)
        ? paidItems.filter((it) => it.quantity > 0)
        : draftItems;

      const orderSubtotal = itemsToSettle.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );

      // Determine remaining items on the table
      const remainingItems: OrderItem[] = [];
      draftItems.forEach((draftItem) => {
        const paid = itemsToSettle.find((p) => p.menuItem.id === draftItem.menuItem.id);
        const paidQty = paid ? paid.quantity : 0;
        const remQty = draftItem.quantity - paidQty;
        if (remQty > 0) {
          remainingItems.push({
            ...draftItem,
            quantity: remQty,
          });
        }
      });

      const isFullPayment = remainingItems.length === 0;

      const transaction: TransactionRecord = {
        id: generateOrderId(),
        targetLabel: activeTable ? `${activeTable.label}${!isFullPayment ? ' (Pisah Tagihan)' : ''}` : 'Meja',
        isTakeaway: activeTable ? activeTable.isTakeaway : false,
        timestamp: new Date().toISOString(),
        items: itemsToSettle.map((it) => ({ ...it })),
        subtotal: orderSubtotal,
        paymentMethod: method,
        cashReceived: method === 'tunai' ? cashReceived : undefined,
        change: method === 'tunai' ? change : undefined,
      };

      // 1. Append to transactions
      const nextTransactions = [transaction, ...transactions];
      persistTransactions(nextTransactions);

      // 2. Update table state (clear if full payment, or keep remaining items if partial)
      const nextTables = tables.map((tbl) => {
        if (tbl.targetId === activeTargetId) {
          if (isFullPayment) {
            return {
              ...tbl,
              status: 'kosong' as const,
              kitchenStatus: undefined,
              completedItemIds: [],
              items: [],
              lastUpdated: new Date().toISOString(),
            };
          } else {
            // Keep remaining items, filter completedItemIds for removed items
            const remainingItemIds = remainingItems.map((it) => it.menuItem.id);
            const updatedCompletedIds = (tbl.completedItemIds || []).filter((id) =>
              remainingItemIds.includes(id)
            );
            return {
              ...tbl,
              status: 'belum_lunas' as const,
              items: remainingItems.map((it) => ({ ...it })),
              completedItemIds: updatedCompletedIds,
              lastUpdated: new Date().toISOString(),
            };
          }
        }
        return tbl;
      });
      persistTables(nextTables);

      // 3. Update draft state
      setDraftItems(remainingItems.map((it) => ({ ...it })));

      return transaction;
    },
    [draftItems, activeTable, activeTargetId, transactions, tables, persistTransactions, persistTables]
  );

  // Daily recap summary calculations
  const dailySummary: DailySummary = useMemo(() => {
    let totalRevenue = 0;
    let cashRevenue = 0;
    let qrisRevenue = 0;
    const itemMap = new Map<string, { menuItem: MenuItem; quantity: number; subtotal: number }>();

    transactions.forEach((tx) => {
      totalRevenue += tx.subtotal;
      if (tx.paymentMethod === 'tunai') {
        cashRevenue += tx.subtotal;
      } else {
        qrisRevenue += tx.subtotal;
      }

      tx.items.forEach((item) => {
        const existing = itemMap.get(item.menuItem.id);
        const itemSubtotal = item.menuItem.price * item.quantity;
        if (existing) {
          existing.quantity += item.quantity;
          existing.subtotal += itemSubtotal;
        } else {
          itemMap.set(item.menuItem.id, {
            menuItem: item.menuItem,
            quantity: item.quantity,
            subtotal: itemSubtotal,
          });
        }
      });
    });

    const itemSales = Array.from(itemMap.values()).sort((a, b) => b.quantity - a.quantity);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expectedCashDrawer = openingCash + cashRevenue - totalExpenses;
    const netCashDrawer = Math.max(0, expectedCashDrawer);
    const cashDifference = actualCash !== null ? actualCash - expectedCashDrawer : undefined;

    return {
      totalRevenue,
      totalTransactions: transactions.length,
      cashRevenue,
      qrisRevenue,
      openingCash,
      totalExpenses,
      netCashDrawer,
      expectedCashDrawer,
      actualCashDrawer: actualCash ?? undefined,
      cashDifference,
      itemSales,
    };
  }, [transactions, expenses, openingCash, actualCash]);

  // Add petty cash expense
  const addExpense = useCallback(
    (description: string, amount: number) => {
      if (!description.trim() || amount <= 0) return;
      const newExpense: ExpenseRecord = {
        id: `EXP-${Date.now()}`,
        description: description.trim(),
        amount,
        timestamp: new Date().toISOString(),
      };
      setExpenses((prev) => {
        const updated = [newExpense, ...prev];
        persistExpenses(updated);
        return updated;
      });
    },
    [persistExpenses]
  );

  // Delete petty cash expense
  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => {
        const updated = prev.filter((exp) => exp.id !== id);
        persistExpenses(updated);
        return updated;
      });
    },
    [persistExpenses]
  );

  // Move table order to another empty table
  const moveTableOrder = useCallback(
    (fromTargetId: string, toTargetId: string) => {
      if (!fromTargetId || !toTargetId || fromTargetId === toTargetId) return;

      setTables((currentTables) => {
        const source = currentTables.find((t) => t.targetId === fromTargetId);
        const target = currentTables.find((t) => t.targetId === toTargetId);

        if (!source || !target || source.items.length === 0) return currentTables;

        const updated = currentTables.map((tbl) => {
          if (tbl.targetId === toTargetId) {
            return {
              ...tbl,
              status: 'belum_lunas' as const,
              items: [...source.items.map((it) => ({ ...it }))],
              kitchenStatus: source.kitchenStatus || 'menunggu',
              completedItemIds: source.completedItemIds ? [...source.completedItemIds] : [],
              lastUpdated: new Date().toISOString(),
            };
          }
          if (tbl.targetId === fromTargetId) {
            return {
              ...tbl,
              status: 'kosong' as const,
              items: [],
              kitchenStatus: undefined,
              completedItemIds: [],
              lastUpdated: new Date().toISOString(),
            };
          }
          return tbl;
        });

        persistTables(updated);

        // Switch active target to new table
        setActiveTargetId(toTargetId);
        try {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_TARGET, toTargetId);
        } catch {
          // ignore
        }
        setDraftItems([...source.items.map((it) => ({ ...it }))]);

        return updated;
      });
    },
    [persistTables]
  );

  // Clear draft items only
  const clearDraft = useCallback(() => {
    setDraftItems([]);
  }, []);

  // Reset active table completely (clear draft + mark table as kosong in state and localStorage)
  const resetActiveTable = useCallback(
    (targetId?: string) => {
      const idToReset = targetId || activeTargetId;
      setDraftItems([]);

      setTables((currentTables) => {
        const updated = currentTables.map((tbl) => {
          if (tbl.targetId === idToReset) {
            return {
              ...tbl,
              status: 'kosong' as const,
              kitchenStatus: undefined,
              completedItemIds: [],
              items: [],
              lastUpdated: new Date().toISOString(),
            };
          }
          return tbl;
        });
        persistTables(updated);
        return updated;
      });
    },
    [activeTargetId, persistTables]
  );

  // Reset all POS data to completely empty (0 omzet, 0 transactions, all tables kosong)
  const resetAllData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TABLES);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TARGET);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.OPENING_CASH);
      localStorage.removeItem(STORAGE_KEYS.ACTUAL_CASH);
    } catch {
      // ignore
    }

    const emptyTables: TableOrder[] = [
      {
        targetId: 'takeaway',
        label: 'Bungkus / Takeaway',
        isTakeaway: true,
        status: 'kosong',
        items: [],
      },
    ];
    for (let i = 1; i <= 15; i++) {
      emptyTables.push({
        targetId: `table-${i}`,
        label: `Meja ${i}`,
        isTakeaway: false,
        status: 'kosong',
        items: [],
      });
    }

    setTables(emptyTables);
    setTransactions([]);
    setExpenses([]);
    setOpeningCashState(0);
    setActualCashState(null);
    setActiveTargetId('table-1');
    setDraftItems([]);

    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(emptyTables));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TARGET, 'table-1');
    } catch {
      // ignore
    }
  }, []);

  // Reset to initial demo data (prepopulated simulation tables & transactions)
  const resetDemoData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TABLES);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TARGET);
    } catch {
      // ignore
    }

    const initialTables = getInitialTables();
    const initialTransactions = getInitialTransactions();
    setTables(initialTables);
    setTransactions(initialTransactions);
    setActiveTargetId('table-1');
    const table1 = initialTables.find((t) => t.targetId === 'table-1');
    setDraftItems(table1 ? [...table1.items] : []);

    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(initialTables));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TARGET, 'table-1');
    } catch {
      // ignore
    }
  }, []);

  // Dynamic counter: occupied tables (excluding takeaway)
  const occupiedTablesCount = useMemo(() => {
    return tables.filter((t) => !t.isTakeaway && t.status === 'belum_lunas').length;
  }, [tables]);

  // Draft total calculation
  const draftSubtotal = useMemo(() => {
    return draftItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  }, [draftItems]);

  const draftTotalCount = useMemo(() => {
    return draftItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [draftItems]);

  // Kitchen KDS: Update status of an order ('menunggu' | 'dimasak' | 'siap_saji')
  const updateKitchenStatus = useCallback((targetId: string, status: KitchenStatus) => {
    setTables((prevTables) => {
      const updated = prevTables.map((tbl) => {
        if (tbl.targetId === targetId) {
          return {
            ...tbl,
            kitchenStatus: status,
            // If marking ready, mark all items done too
            completedItemIds: status === 'siap_saji' ? tbl.items.map((it) => it.menuItem.id) : (tbl.completedItemIds || []),
            lastUpdated: new Date().toISOString(),
          };
        }
        return tbl;
      });
      persistTables(updated);
      return updated;
    });
  }, [persistTables]);

  // Kitchen KDS: Toggle an individual item as prepared / completed
  const toggleKitchenItemDone = useCallback((targetId: string, menuItemId: string) => {
    setTables((prevTables) => {
      const updated = prevTables.map((tbl) => {
        if (tbl.targetId === targetId) {
          const currentDone = tbl.completedItemIds || [];
          const isDone = currentDone.includes(menuItemId);
          const nextDone = isDone
            ? currentDone.filter((id) => id !== menuItemId)
            : [...currentDone, menuItemId];

          const allDone = tbl.items.length > 0 && tbl.items.every((it) => nextDone.includes(it.menuItem.id));
          const nextKitchenStatus: KitchenStatus = allDone
            ? 'siap_saji'
            : tbl.kitchenStatus === 'siap_saji'
            ? 'dimasak'
            : (tbl.kitchenStatus || 'menunggu');

          return {
            ...tbl,
            completedItemIds: nextDone,
            kitchenStatus: nextKitchenStatus,
          };
        }
        return tbl;
      });
      persistTables(updated);
      return updated;
    });
  }, [persistTables]);

  return {
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
    clearDraft,
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
  };
}
