import { MenuItem } from '@/types/pos';

export const MENU_ITEMS: MenuItem[] = [
  // Minuman
  {
    id: 'kopi-susu-panas',
    name: 'Kopi Susu Panas',
    price: 6000,
    category: 'minuman',
    iconName: 'Coffee',
  },
  {
    id: 'kopi-hitam',
    name: 'Kopi Hitam / Kopi O',
    price: 5000,
    category: 'minuman',
    iconName: 'Coffee',
  },
  {
    id: 'kopi-susu-dingin',
    name: 'Kopi Susu Dingin',
    price: 8000,
    category: 'minuman',
    iconName: 'CupSoda',
  },
  {
    id: 'es-teh-manis',
    name: 'Es Teh Manis',
    price: 4000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'teh-tarik-panas',
    name: 'Teh Tarik Panas',
    price: 7000,
    category: 'minuman',
    iconName: 'Sparkles',
  },

  // Makanan
  {
    id: 'indomie-goreng-telur',
    name: 'Indomie Goreng Telur',
    price: 10000,
    category: 'makanan',
    iconName: 'UtensilsCrossed',
  },
  {
    id: 'indomie-rebus-telur-kornet',
    name: 'Indomie Rebus Telur Kornet',
    price: 13000,
    category: 'makanan',
    iconName: 'Soup',
  },
  {
    id: 'nasi-goreng-kampung',
    name: 'Nasi Goreng Kampung',
    price: 14000,
    category: 'makanan',
    iconName: 'ChefHat',
  },

  // Cemilan
  {
    id: 'pisang-goreng-srikaya',
    name: 'Pisang Goreng Srikaya',
    price: 8000,
    category: 'cemilan',
    iconName: 'Flame',
  },
  {
    id: 'bakwan-pontianak',
    name: 'Bakwan Pontianak',
    price: 5000,
    category: 'cemilan',
    iconName: 'Cookie',
  },
  {
    id: 'roti-bakar-cokelat-keju',
    name: 'Roti Bakar Cokelat Keju',
    price: 10000,
    category: 'cemilan',
    iconName: 'Sandwich',
  },
];
