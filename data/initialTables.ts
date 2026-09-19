import { TableOrder, TransactionRecord } from '@/types/pos';
import { MENU_ITEMS } from './menu';

export function getInitialTables(): TableOrder[] {
  const tables: TableOrder[] = [
    {
      targetId: 'takeaway',
      label: 'Bungkus / Takeaway',
      isTakeaway: true,
      status: 'kosong',
      items: [],
    },
  ];

  for (let i = 1; i <= 15; i++) {
    tables.push({
      targetId: `table-${i}`,
      label: `Meja ${i}`,
      isTakeaway: false,
      status: 'kosong',
      items: [],
    });
  }

  // Prepopulate a couple of tables with realistic demo orders so it looks alive right away
  const table3 = tables.find((t) => t.targetId === 'table-3');
  if (table3) {
    table3.status = 'belum_lunas';
    table3.items = [
      { menuItem: MENU_ITEMS[0], quantity: 2 }, // Kopi Susu Panas x2 = 12.000
      { menuItem: MENU_ITEMS[8], quantity: 1 }, // Pisang Goreng Srikaya x1 = 8.000
    ];
  }

  const table7 = tables.find((t) => t.targetId === 'table-7');
  if (table7) {
    table7.status = 'belum_lunas';
    table7.items = [
      { menuItem: MENU_ITEMS[2], quantity: 1 }, // Kopi Susu Dingin x1 = 8.000
      { menuItem: MENU_ITEMS[5], quantity: 1 }, // Indomie Goreng Telur x1 = 10.000
      { menuItem: MENU_ITEMS[9], quantity: 2 }, // Bakwan Pontianak x2 = 10.000
    ];
  }

  const takeaway = tables.find((t) => t.targetId === 'takeaway');
  if (takeaway) {
    takeaway.status = 'belum_lunas';
    takeaway.items = [
      { menuItem: MENU_ITEMS[1], quantity: 3 }, // Kopi Hitam x3 = 15.000
      { menuItem: MENU_ITEMS[10], quantity: 1 }, // Roti Bakar x1 = 10.000
    ];
  }

  return tables;
}

export function getInitialTransactions(): TransactionRecord[] {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  return [
    {
      id: `RK-${dateStr}-1001`,
      targetLabel: 'Meja 2',
      isTakeaway: false,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      items: [
        { menuItem: MENU_ITEMS[0], quantity: 2 }, // Kopi Susu Panas
        { menuItem: MENU_ITEMS[7], quantity: 1 }, // Nasi Goreng Kampung
      ],
      subtotal: 26000,
      paymentMethod: 'tunai',
      cashReceived: 30000,
      change: 4000,
    },
    {
      id: `RK-${dateStr}-1002`,
      targetLabel: 'Meja 5',
      isTakeaway: false,
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      items: [
        { menuItem: MENU_ITEMS[2], quantity: 2 }, // Kopi Susu Dingin
        { menuItem: MENU_ITEMS[8], quantity: 2 }, // Pisang Srikaya
      ],
      subtotal: 32000,
      paymentMethod: 'qris',
    },
    {
      id: `RK-${dateStr}-1003`,
      targetLabel: 'Bungkus / Takeaway',
      isTakeaway: true,
      timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
      items: [
        { menuItem: MENU_ITEMS[1], quantity: 4 }, // Kopi Hitam
        { menuItem: MENU_ITEMS[9], quantity: 4 }, // Bakwan
      ],
      subtotal: 40000,
      paymentMethod: 'tunai',
      cashReceived: 50000,
      change: 10000,
    },
  ];
}
