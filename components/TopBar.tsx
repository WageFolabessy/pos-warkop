"use client";

import React, {
  useSyncExternalStore,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  ReceiptText,
  Clock,
  Store,
  UserCheck,
  ShieldCheck,
  ChefHat,
  ChevronDown,
  Check,
} from "lucide-react";
import { formatIndonesianDateTime } from "@/lib/formatters";
import { UserRole } from "@/types/pos";

interface TopBarProps {
  occupiedCount: number;
  totalTables?: number;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenRekap: () => void;
}

const ROLES = [
  {
    id: "owner" as const,
    label: "Pemilik",
    desc: "Akses penuh",
    icon: ShieldCheck,
    title: "Beralih ke Mode Pemilik (Akses Penuh & Atur Ulang Data)",
  },
  {
    id: "kasir" as const,
    label: "Kasir",
    desc: "Kasir & bayar",
    icon: Store,
    title: "Beralih ke Mode Kasir (Operasional POS & Pembayaran)",
  },
  {
    id: "pelayan" as const,
    label: "Pelayan",
    desc: "Catat pesanan",
    icon: UserCheck,
    title: "Beralih ke Mode Pelayan (Pencatatan Pesanan)",
  },
  {
    id: "dapur" as const,
    label: "Dapur",
    desc: "Antrean pesanan",
    icon: ChefHat,
    title: "Beralih ke Mode Dapur (Layar Antrean KDS)",
  },
] as const;

function subscribeToClock(callback: () => void) {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);
}

function getClockSnapshot() {
  return formatIndonesianDateTime(new Date());
}

function getServerClockSnapshot() {
  return "";
}

export const TopBar: React.FC<TopBarProps> = ({
  occupiedCount,
  totalTables = 15,
  currentRole,
  onRoleChange,
  onOpenRekap,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDateTime = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot,
  );

  // Close dropdown on click outside or escape key
  useEffect(() => {
    if (!isRoleDropdownOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsRoleDropdownOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsRoleDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRoleDropdownOpen]);

  const activeRole = ROLES.find((r) => r.id === currentRole) || ROLES[1];
  const ActiveIcon = activeRole.icon;

  return (
    <header className="no-print h-14 lg:h-16 w-full bg-white text-gray-900 px-3 sm:px-6 flex items-center justify-between border-b border-gray-200 z-30 select-none shadow-xs relative">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1 sm:gap-1.5 leading-none">
            <span className="font-semibold text-lg sm:text-xl text-gray-900 tracking-tight">
              Ratu
            </span>
            <span className="font-semibold text-lg sm:text-xl text-gray-600 tracking-wide">
              KOPI
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Role Switcher: [Owner] / [Kasir] / [Pelayan] / [Dapur] */}
      <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = currentRole === role.id;
          return (
            <button
              key={role.id}
              id={`btn-role-${role.id}`}
              onClick={() => onRoleChange(role.id)}
              className={`px-2.5 lg:px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 min-h-9 ${
                isSelected
                  ? "bg-gray-900 text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={role.title}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Role Switcher Dropdown (Small Screens) */}
      <div className="relative md:hidden shrink-0" ref={dropdownRef}>
        <button
          id="btn-mobile-role-selector"
          type="button"
          onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
            isRoleDropdownOpen
              ? "bg-gray-900 text-white border-gray-900 shadow-2xs"
              : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200/80 active:bg-gray-200"
          }`}
          aria-haspopup="true"
          aria-expanded={isRoleDropdownOpen}
          title="Beralih peran / mode kerja"
        >
          <ActiveIcon
            className={`w-3.5 h-3.5 shrink-0 ${isRoleDropdownOpen ? "text-white" : "text-gray-700"}`}
          />
          <span>{activeRole.label}</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${
              isRoleDropdownOpen ? "rotate-180 text-white" : "text-gray-500"
            }`}
          />
        </button>

        {isRoleDropdownOpen && (
          <>
            {/* Transparent backdrop for mobile dismiss */}
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
              onClick={() => setIsRoleDropdownOpen(false)}
            />
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 sm:w-64 bg-white rounded-2xl shadow-xl border border-gray-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Peran
              </div>
              <div className="space-y-0.5">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = currentRole === role.id;
                  return (
                    <button
                      key={role.id}
                      id={`mobile-btn-role-${role.id}`}
                      onClick={() => {
                        onRoleChange(role.id);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-gray-900 text-white font-medium shadow-2xs"
                          : "text-gray-700 hover:bg-gray-100 active:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-gray-500"}`}
                        />
                        <div>
                          <div className="font-semibold leading-tight">
                            {role.label}
                          </div>
                          <div
                            className={`text-[10px] leading-tight mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-400"}`}
                          >
                            {role.desc}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Center: Live Indonesian Clock (Desktop/Landscape only) */}
      <div className="hidden xl:flex items-center gap-2 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-lg text-xs text-gray-600 font-mono tabular-nums shadow-xs">
        <Clock className="w-3.5 h-3.5 text-gray-400" />
        <span className="tracking-wide">
          {currentDateTime || "Memuat waktu..."}
        </span>
      </div>

      {/* Right Controls: Table Occupancy & Rekap Kas */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Compact Occupancy Badge */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 border border-gray-200 px-2 sm:px-3 py-1.5 rounded-lg text-xs"
          title={`${occupiedCount} dari ${totalTables} meja sedang terisi`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              occupiedCount > 0
                ? "bg-emerald-500 ring-2 ring-emerald-100"
                : "bg-gray-300"
            }`}
          />
          <span className="font-medium text-gray-600 text-xs tabular-nums whitespace-nowrap">
            <strong className="text-gray-900 font-semibold">
              {occupiedCount}
            </strong>
            <span className="text-gray-400">/{totalTables}</span>
            <span className="hidden sm:inline text-gray-500 ml-1">Meja</span>
          </span>
        </div>

        {/* Rekap Kas Button (Visible in Mode Kasir & Mode Owner - Hidden in Mode Pelayan) */}
        {(currentRole === "kasir" || currentRole === "owner") && (
          <button
            id="btn-rekap-kas"
            onClick={onOpenRekap}
            className="flex items-center justify-center gap-1.5 bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0062c4] text-white border border-transparent h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Buka Laporan Rekap Kas Penjualan Hari Ini"
          >
            <ReceiptText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.2]" />
            <span className="hidden sm:inline">Rekap Kas</span>
          </button>
        )}
      </div>
    </header>
  );
};
