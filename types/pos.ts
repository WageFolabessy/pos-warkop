export type Category = 'all' | 'minuman' | 'makanan' | 'camilan';

export type UserRole = 'kasir' | 'pelayan';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'minuman' | 'makanan' | 'camilan';
  description?: string;
  badge?: string;
  iconName: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type TableStatus = 'kosong' | 'belum_lunas';

export interface TableOrder {
  targetId: string; // 'takeaway' or 'table-1' ... 'table-15'
  label: string; // 'Bungkus / Takeaway' or 'Meja 1' ... 'Meja 15'
  isTakeaway: boolean;
  status: TableStatus;
  items: OrderItem[];
  lastUpdated?: string;
}

export type PaymentMethod = 'tunai' | 'qris';

export interface TransactionRecord {
  id: string; // e.g. RK-20260919-001
  targetLabel: string;
  isTakeaway: boolean;
  timestamp: string;
  items: OrderItem[];
  subtotal: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
}

export interface DailySummary {
  totalRevenue: number;
  totalTransactions: number;
  cashRevenue: number;
  qrisRevenue: number;
  itemSales: {
    menuItem: MenuItem;
    quantity: number;
    subtotal: number;
  }[];
}
