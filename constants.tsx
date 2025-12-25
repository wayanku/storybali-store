
import { Product } from './types';

/** 
 * KONFIGURASI GLOBAL 
 * Masukkan URL Google Script Anda di sini agar semua user otomatis melihat produk yang sama.
 */
export const GLOBAL_CONFIG = {
  // Masukkan URL Web App Google Script Anda di sini
  MASTER_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyOlXuKnI7GMry31xegxRZdPvvWw7X4QdGvcZl_3Pn6_ikdNE4zIUqCMAGNQ94CDx5ljA/exec', 
  // Masukkan API Key ImgBB Anda di sini
  MASTER_IMGBB_KEY: '7e6f3ce63649d305ccaceea00c28266d',
  // Password untuk masuk ke menu Admin
  ADMIN_PASSWORD: 'bali123' 
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tas Rotan Handmade Tenganan Premium - Grade A',
    price: 350000,
    originalPrice: 700000,
    category: 'Fashion',
    description: 'Tas rotan bundar tradisional Bali kualitas ekspor, dibuat langsung oleh pengrajin desa Tenganan menggunakan teknik anyaman double-ribbon.',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Dibuat dengan teknik pengasapan kulit kacang yang memberikan warna karamel alami.',
    rating: 4.8,
    soldCount: 1250,
    discountTag: '50% OFF'
  },
  {
    id: '2',
    name: 'Set Dupa Cendana Wangi Pura - Isi 50 Stik',
    price: 75000,
    originalPrice: 125000,
    category: 'Wellness',
    description: 'Stik dupa cendana aromatik murni untuk meditasi dan relaksasi.',
    images: [
      'https://images.unsplash.com/photo-1602928294248-457ee57460f1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Diproduksi terbatas di desa Sidemen menggunakan bahan organik.',
    rating: 4.9,
    soldCount: 3400,
    discountTag: 'LARIS'
  }
];
