import { MenuItem } from '@/types/pos';

export const MENU_ITEMS: MenuItem[] = [
  // ========================
  // MAKANAN
  // ========================

  // Ubi Goreng
  {
    id: 'ubi-goreng-polos',
    name: 'Ubi Goreng Polos',
    price: 13000,
    category: 'makanan',
    iconName: 'Flame',
  },
  {
    id: 'ubi-goreng-balado',
    name: 'Ubi Goreng Balado',
    price: 15000,
    category: 'makanan',
    iconName: 'Flame',
  },

  // Pisang Goreng
  {
    id: 'pisang-goreng-polos',
    name: 'Pisang Goreng Polos',
    price: 13000,
    category: 'makanan',
    iconName: 'Flame',
  },
  {
    id: 'pisang-goreng-keju-susu',
    name: 'Pisang Goreng Keju Susu',
    price: 15000,
    category: 'makanan',
    iconName: 'Flame',
  },
  {
    id: 'pisang-goreng-coklat-susu',
    name: 'Pisang Goreng Coklat Susu',
    price: 18000,
    category: 'makanan',
    iconName: 'Flame',
  },
  {
    id: 'pisang-goreng-keju-coklat-susu',
    name: 'Pisang Goreng Keju + Coklat Susu',
    price: 20000,
    category: 'makanan',
    iconName: 'Flame',
  },

  // Kentang Goreng
  {
    id: 'kentang-goreng-potong-polos',
    name: 'Kentang Goreng Potong Polos',
    price: 15000,
    category: 'makanan',
    iconName: 'Flame',
  },
  {
    id: 'kentang-goreng-keju',
    name: 'Kentang Goreng Keju',
    price: 18000,
    category: 'makanan',
    iconName: 'Flame',
  },

  // Roti Bakar
  {
    id: 'roti-bakar-keju-susu',
    name: 'Roti Bakar Keju Susu',
    price: 15000,
    category: 'makanan',
    iconName: 'Sandwich',
  },
  {
    id: 'roti-bakar-coklat-susu',
    name: 'Roti Bakar Coklat Susu',
    price: 15000,
    category: 'makanan',
    iconName: 'Sandwich',
  },
  {
    id: 'roti-bakar-keju-coklat-susu',
    name: 'Roti Bakar Keju + Coklat Susu',
    price: 18000,
    category: 'makanan',
    iconName: 'Sandwich',
  },

  // Indomie
  {
    id: 'indomie-goreng-telur-sayur',
    name: 'Indomie Goreng Telur Sayur',
    price: 15000,
    category: 'makanan',
    iconName: 'UtensilsCrossed',
  },
  {
    id: 'indomie-kuah-telur-sayur',
    name: 'Indomie Kuah Telur Sayur',
    price: 15000,
    category: 'makanan',
    iconName: 'Soup',
  },

  // Nasi Goreng
  {
    id: 'nasi-goreng-telur',
    name: 'Nasi Goreng + Telur',
    price: 15000,
    category: 'makanan',
    iconName: 'ChefHat',
  },
  {
    id: 'nasi-goreng-kampung-telur',
    name: 'Nasi Goreng Kampung + Telur',
    price: 15000,
    category: 'makanan',
    iconName: 'ChefHat',
  },

  // Lainnya
  {
    id: 'roti-canai-keju-susu',
    name: 'Roti Canai Keju Susu',
    price: 15000,
    category: 'makanan',
    iconName: 'Sandwich',
  },
  {
    id: 'bubur-nasi-special',
    name: 'Bubur Nasi Special',
    price: 15000,
    category: 'makanan',
    iconName: 'Soup',
  },

  // ========================
  // MINUMAN - TEH
  // ========================
  {
    id: 'teh-es',
    name: 'Teh Es',
    price: 8000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'teh-susu',
    name: 'Teh Susu',
    price: 10000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'teh-hijau',
    name: 'Teh Hijau',
    price: 8000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'teh-hijau-susu',
    name: 'Teh Hijau Susu',
    price: 10000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'lemon-tea',
    name: 'Lemon Tea',
    price: 10000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'leci-tea',
    name: 'Leci Tea',
    price: 8000,
    category: 'minuman',
    iconName: 'GlassWater',
  },

  // MINUMAN - KOPI
  {
    id: 'kopi-saring',
    name: 'Kopi Saring',
    price: 8000,
    category: 'minuman',
    iconName: 'Coffee',
  },
  {
    id: 'kopi-bubuk',
    name: 'Kopi Bubuk',
    price: 8000,
    category: 'minuman',
    iconName: 'Coffee',
  },
  {
    id: 'kopi-es',
    name: 'Kopi Es',
    price: 10000,
    category: 'minuman',
    iconName: 'Coffee',
  },
  {
    id: 'cappucino-susu',
    name: 'Cappucino Susu',
    price: 13000,
    category: 'minuman',
    iconName: 'Coffee',
  },
  {
    id: 'milo-susu',
    name: 'Milo Susu',
    price: 13000,
    category: 'minuman',
    iconName: 'Coffee',
  },

  // MINUMAN - JERUK
  {
    id: 'jeruk-besar',
    name: 'Jeruk Besar',
    price: 13000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'jeruk-kecil',
    name: 'Jeruk Kecil',
    price: 8000,
    category: 'minuman',
    iconName: 'GlassWater',
  },

  // MINUMAN - CINCAU
  {
    id: 'cincau-ori',
    name: 'Cincau Ori',
    price: 5000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'cincau-susu',
    name: 'Cincau Susu',
    price: 8000,
    category: 'minuman',
    iconName: 'GlassWater',
  },

  // MINUMAN - JAHE
  {
    id: 'jahe-gula-merah-ori',
    name: 'Jahe + Gula Merah Ori',
    price: 13000,
    category: 'minuman',
    iconName: 'Sparkles',
  },
  {
    id: 'jahe-susu',
    name: 'Jahe + Susu',
    price: 13000,
    category: 'minuman',
    iconName: 'Sparkles',
  },
  {
    id: 'jahe-gula-merah-lemon',
    name: 'Jahe + Gula Merah + Lemon',
    price: 15000,
    category: 'minuman',
    iconName: 'Sparkles',
  },

  // MINUMAN - AIR KELAPA
  {
    id: 'air-kelapa-utuh',
    name: 'Air Kelapa Utuh',
    price: 15000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'air-kelapa-susu',
    name: 'Air Kelapa Susu',
    price: 18000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'air-kelapa-susu-es',
    name: 'Air Kelapa Susu Es',
    price: 20000,
    category: 'minuman',
    iconName: 'GlassWater',
  },

  // MINUMAN - LAINNYA
  {
    id: 'extra-joss-susu',
    name: 'Extra Joss + Susu',
    price: 13000,
    category: 'minuman',
    iconName: 'Sparkles',
  },
  {
    id: 'air-mineral',
    name: 'Air Mineral',
    price: 8000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'air-putih-es',
    name: 'Air Putih Es',
    price: 3000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'es-batu',
    name: 'Es Batu',
    price: 3000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'air-kacang-hijau',
    name: 'Air Kacang Hijau',
    price: 13000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
  {
    id: 'es-timun-serut',
    name: 'Es Timun Serut',
    price: 13000,
    category: 'minuman',
    iconName: 'GlassWater',
  },
];
