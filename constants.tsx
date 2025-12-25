
import { Product } from './types';

/** 
 * KONFIGURASI GLOBAL 
 */
export const GLOBAL_CONFIG = {
  // Master Script URL (Google Sheets)
  MASTER_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyOlXuKnI7GMry31xegxRZdPvvWw7X4QdGvcZl_3Pn6_ikdNE4zIUqCMAGNQ94CDx5ljA/exec', 
  // API Key ImgBB yang diberikan user
  MASTER_IMGBB_KEY: '7e6f3ce63649d305ccaceea00c28266d',
  // Password Admin
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
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Dibuat dengan teknik pengasapan kulit kacang yang memberikan warna karamel alami.',
    rating: 4.8,
    soldCount: 1250,
    discountTag: '50% OFF'
  }
];
