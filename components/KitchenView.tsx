'use client';

import React, { useState, useMemo } from 'react';
import { TableOrder, KitchenStatus, Category } from '@/types/pos';
import { formatElapsedTime } from '@/lib/formatters';
import {
  ChefHat,
  Coffee,
  Utensils,
  Clock,
  Flame,
  CheckCircle2,
  Check,
  RotateCcw,
  ShoppingBag,
  AlertCircle,
  Sparkles,
  Filter,
} from 'lucide-react';

interface KitchenViewProps {
  tables: TableOrder[];
  onUpdateKitchenStatus: (targetId: string, status: KitchenStatus) => void;
  onToggleItemDone: (targetId: string, menuItemId: string) => void;
}

type StationFilter = 'all' | 'minuman' | 'makanan';
type StatusFilter = 'all' | 'menunggu' | 'dimasak' | 'siap_saji';

export const KitchenView: React.FC<KitchenViewProps> = ({
  tables,
  onUpdateKitchenStatus,
  onToggleItemDone,
}) => {
  const [stationFilter, setStationFilter] = useState<StationFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Filter only active tables that have items
  const activeOrders = useMemo(() => {
    return tables.filter(
      (t) => t.status === 'belum_lunas' && t.items && t.items.length > 0
    );
  }, [tables]);

  // Filter by Station (Minuman vs Makanan/Camilan) and Status
  const filteredOrders = useMemo(() => {
    return activeOrders
      .map((order) => {
        // Filter items based on station filter
        const visibleItems = order.items.filter((item) => {
          if (stationFilter === 'all') return true;
          if (stationFilter === 'minuman') return item.menuItem.category === 'minuman';
          if (stationFilter === 'makanan') {
            return (
              item.menuItem.category === 'makanan' ||
              item.menuItem.category === 'camilan'
            );
          }
          return true;
        });

        return {
          ...order,
          items: visibleItems,
        };
      })
      .filter((order) => {
        // Exclude orders that have no matching items for the active station
        if (order.items.length === 0) return false;

        // Filter by kitchen status
        const orderStatus = order.kitchenStatus || 'menunggu';
        if (statusFilter !== 'all' && orderStatus !== statusFilter) return false;

        return true;
      });
  }, [activeOrders, stationFilter, statusFilter]);

  // Aggregate Batch Summary: Total quantity of each item needed across all active orders
  const batchItemSummary = useMemo(() => {
    const summaryMap: Record<
      string,
      { id: string; name: string; category: Category; totalQty: number; doneQty: number }
    > = {};

    activeOrders.forEach((order) => {
      const completedIds = order.completedItemIds || [];
      order.items.forEach((item) => {
        const cat = item.menuItem.category;
        if (stationFilter === 'minuman' && cat !== 'minuman') return;
        if (stationFilter === 'makanan' && cat !== 'makanan' && cat !== 'camilan') return;

        if (!summaryMap[item.menuItem.id]) {
          summaryMap[item.menuItem.id] = {
            id: item.menuItem.id,
            name: item.menuItem.name,
            category: cat,
            totalQty: 0,
            doneQty: 0,
          };
        }
        summaryMap[item.menuItem.id].totalQty += item.quantity;
        if (completedIds.includes(item.menuItem.id)) {
          summaryMap[item.menuItem.id].doneQty += item.quantity;
        }
      });
    });

    return Object.values(summaryMap);
  }, [activeOrders, stationFilter]);

  // Counts for summary pills
  const stats = useMemo(() => {
    let menungguCount = 0;
    let dimasakCount = 0;
    let siapSajiCount = 0;

    activeOrders.forEach((order) => {
      const s = order.kitchenStatus || 'menunggu';
      if (s === 'menunggu') menungguCount++;
      else if (s === 'dimasak') dimasakCount++;
      else if (s === 'siap_saji') siapSajiCount++;
    });

    return {
      total: activeOrders.length,
      menunggu: menungguCount,
      dimasak: dimasakCount,
      siapSaji: siapSajiCount,
    };
  }, [activeOrders]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-950 text-stone-100">
      {/* 1. Header Bar with Statistics & Filters */}
      <div className="bg-stone-900 border-b border-stone-800 p-3 sm:p-4 shrink-0 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Title & Live Status Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Layar Dapur & Bar
                  <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    KDS
                  </span>
                </h1>
                <p className="text-xs text-stone-400 font-mono">
                  Antrean Pembuatan Minuman & Makanan Real-Time
                </p>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-4 text-xs font-semibold">
              <span className="bg-stone-800 border border-stone-700 text-stone-300 px-2.5 py-1 rounded-lg tabular-nums">
                Total: <strong className="text-white">{stats.total}</strong>
              </span>

              <span
                onClick={() => setStatusFilter(statusFilter === 'menunggu' ? 'all' : 'menunggu')}
                className={`px-2.5 py-1 rounded-lg border tabular-nums cursor-pointer transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'menunggu'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                    : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/40'
                }`}
                title="Filter Pesanan Menunggu"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Menunggu ({stats.menunggu})</span>
              </span>

              <span
                onClick={() => setStatusFilter(statusFilter === 'dimasak' ? 'all' : 'dimasak')}
                className={`px-2.5 py-1 rounded-lg border tabular-nums cursor-pointer transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'dimasak'
                    ? 'bg-blue-500 text-white border-blue-400 font-bold'
                    : 'bg-blue-950/40 text-blue-300 border-blue-800/60 hover:bg-blue-900/40'
                }`}
                title="Filter Pesanan Sedang Dimasak"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Proses ({stats.dimasak})</span>
              </span>

              <span
                onClick={() => setStatusFilter(statusFilter === 'siap_saji' ? 'all' : 'siap_saji')}
                className={`px-2.5 py-1 rounded-lg border tabular-nums cursor-pointer transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'siap_saji'
                    ? 'bg-emerald-500 text-stone-950 border-emerald-400 font-bold'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
                }`}
                title="Filter Pesanan Siap Antar"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Siap Antar ({stats.siapSaji})</span>
              </span>
            </div>
          </div>

          {/* Station Work Area Switcher Tabs */}
          <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-xl border border-stone-700/80 w-full sm:w-auto">
            <button
              onClick={() => setStationFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                stationFilter === 'all'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Semua</span>
            </button>

            <button
              onClick={() => setStationFilter('minuman')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                stationFilter === 'minuman'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Bar Kopi</span>
            </button>

            <button
              onClick={() => setStationFilter('makanan')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                stationFilter === 'makanan'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Dapur Masak</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Batch Item Preparation Bar (Ringkasan Antrean Item Sedang Berjalan) */}
      {batchItemSummary.length > 0 && (
        <div className="bg-stone-900/60 border-b border-stone-800/80 px-3 sm:px-6 py-2 shrink-0 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider font-bold shrink-0 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Antrean Item:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {batchItemSummary.map((item) => {
                const isAllDone = item.doneQty >= item.totalQty;
                return (
                  <div
                    key={item.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap border shrink-0 transition-colors ${
                      isAllDone
                        ? 'bg-stone-800/40 border-stone-700/40 text-stone-500 line-through'
                        : item.category === 'minuman'
                        ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                        : 'bg-orange-950/30 border-orange-800/40 text-orange-200'
                    }`}
                  >
                    <span className="font-mono font-black text-amber-400">
                      {item.totalQty - item.doneQty}x
                    </span>
                    <span className="font-medium">{item.name}</span>
                    {item.doneQty > 0 && (
                      <span className="text-[10px] text-stone-400">
                        ({item.doneQty} siap)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Ticket Grid Body */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="max-w-7xl mx-auto">
          {filteredOrders.length === 0 ? (
            /* Empty State */
            <div className="h-96 flex flex-col items-center justify-center text-center p-6 bg-stone-900/40 rounded-3xl border border-stone-800/60 my-6">
              <div className="w-16 h-16 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                {activeOrders.length === 0
                  ? 'Semua Pesanan Selesai!'
                  : 'Tidak Ada Pesanan pada Filter Ini'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md leading-relaxed">
                {activeOrders.length === 0
                  ? 'Saat ini tidak ada antrean pesanan di meja maupun bungkus. Pesanan baru yang disimpan oleh pelayan atau kasir akan langsung muncul di sini.'
                  : 'Cobalah ubah filter stasiun kerja atau status di bagian atas untuk melihat pesanan lainnya.'}
              </p>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="mt-4 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Tampilkan Semua Status
                </button>
              )}
            </div>
          ) : (
            /* Responsive Card Tickets Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredOrders.map((order) => {
                const currentStatus: KitchenStatus = order.kitchenStatus || 'menunggu';
                const completedIds = order.completedItemIds || [];

                return (
                  <div
                    key={order.targetId}
                    className={`rounded-2xl border flex flex-col transition-all shadow-lg overflow-hidden ${
                      currentStatus === 'siap_saji'
                        ? 'bg-stone-900 border-emerald-500/70 shadow-emerald-950/20'
                        : currentStatus === 'dimasak'
                        ? 'bg-stone-900 border-blue-500/70 shadow-blue-950/20'
                        : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {/* Ticket Header */}
                    <div
                      className={`p-3.5 border-b flex items-start justify-between gap-2 ${
                        currentStatus === 'siap_saji'
                          ? 'bg-emerald-950/40 border-emerald-800/40'
                          : currentStatus === 'dimasak'
                          ? 'bg-blue-950/40 border-blue-800/40'
                          : 'bg-stone-800/50 border-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            order.isTakeaway
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-stone-800 border border-stone-700 text-white'
                          }`}
                        >
                          {order.isTakeaway ? (
                            <ShoppingBag className="w-4 h-4" />
                          ) : (
                            <Utensils className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white leading-tight">
                            {order.label}
                          </h4>
                          <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatElapsedTime(order.lastUpdated)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          currentStatus === 'siap_saji'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : currentStatus === 'dimasak'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {currentStatus === 'siap_saji'
                          ? 'Siap Saji'
                          : currentStatus === 'dimasak'
                          ? 'Diracik'
                          : 'Menunggu'}
                      </span>
                    </div>

                    {/* Ticket Items List */}
                    <div className="p-3.5 flex-1 space-y-2.5 overflow-y-auto max-h-72">
                      {order.items.map((item) => {
                        const isDone = completedIds.includes(item.menuItem.id);

                        return (
                          <div
                            key={item.menuItem.id}
                            onClick={() =>
                              onToggleItemDone(order.targetId, item.menuItem.id)
                            }
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isDone
                                ? 'bg-stone-950/40 border-stone-800 text-stone-500'
                                : 'bg-stone-800/60 border-stone-700/60 text-stone-100 hover:bg-stone-800 hover:border-stone-600'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              {/* Quantity & Name */}
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <span
                                  className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                    isDone
                                      ? 'bg-stone-800 text-stone-500'
                                      : 'bg-amber-500 text-stone-950'
                                  }`}
                                >
                                  {item.quantity}x
                                </span>
                                <div className="flex-1 min-w-0">
                                  <span
                                    className={`font-semibold text-xs sm:text-sm block leading-snug break-words ${
                                      isDone ? 'line-through text-stone-500' : 'text-white'
                                    }`}
                                  >
                                    {item.menuItem.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-stone-400 capitalize">
                                    {item.menuItem.category}
                                  </span>
                                </div>
                              </div>

                              {/* Interactive Checkbox */}
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                  isDone
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : 'border-stone-600 bg-stone-800 text-transparent hover:border-amber-400'
                                }`}
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            </div>

                            {/* Special Order Notes Highlight */}
                            {item.notes && (
                              <div className="mt-2 pt-1.5 border-t border-stone-700/50 flex items-start gap-1.5 text-amber-300 bg-amber-950/30 px-2 py-1 rounded-lg text-[11px] font-medium leading-tight">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                                <span>{item.notes}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Ticket Footer Actions */}
                    <div className="p-3 bg-stone-950/80 border-t border-stone-800 mt-auto flex items-center gap-2">
                      {currentStatus === 'menunggu' && (
                        <button
                          onClick={() =>
                            onUpdateKitchenStatus(order.targetId, 'dimasak')
                          }
                          className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Mulai Masak / Racik</span>
                        </button>
                      )}

                      {currentStatus === 'dimasak' && (
                        <button
                          onClick={() =>
                            onUpdateKitchenStatus(order.targetId, 'siap_saji')
                          }
                          className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tandai Siap Antar</span>
                        </button>
                      )}

                      {currentStatus === 'siap_saji' && (
                        <div className="w-full flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Siap Diantar Pelayan</span>
                          </span>
                          <button
                            onClick={() =>
                              onUpdateKitchenStatus(order.targetId, 'dimasak')
                            }
                            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs transition-colors cursor-pointer"
                            title="Kembalikan ke status dimasak jika ada tambahan"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
