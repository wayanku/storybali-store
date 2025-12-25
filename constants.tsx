
import { Product } from './types';

/** 
 * KONFIGURASI GLOBAL 
 */
export const GLOBAL_CONFIG = {
  // Master Script URL (Google Sheets)
  MASTER_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyOlXuKnI7GMry31xegxRZdPvvWw7X4QdGvcZl_3Pn6_ikdNE4zIUqCMAGNQ94CDx5ljA/exec', 
  // API Key ImgBB
  MASTER_IMGBB_KEY: '7e6f3ce63649d305ccaceea00c28266d',
  // Password Admin
  ADMIN_PASSWORD: 'admin123' 
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max 256GB - Titanium Gray',
    price: 18499000,
    originalPrice: 20999000,
    category: 'Elektronik',
    description: 'Smartphone unggulan terbaru dengan chip A17 Pro, sistem kamera pro yang canggih, dan desain titanium yang ringan dan kuat.',
    images: [
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Teknologi masa depan dalam genggaman Anda. Dibuat untuk performa tanpa batas.',
    rating: 4.9,
    soldCount: 450,
    discountTag: 'HOT DEAL'
  },
  {
    id: '2',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    price: 5299000,
    originalPrice: 5999000,
    category: 'Elektronik',
    description: 'Headphone peredam bising terbaik di industri dengan kualitas audio luar biasa dan kenyamanan sepanjang hari.',
    images: [
      'https://images.unsplash.com/photo-1618366712277-70779c74585f?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Dengarkan dunia dalam kejernihan sempurna tanpa gangguan suara luar.',
    rating: 4.8,
    soldCount: 890,
    discountTag: '12% OFF'
  },
  {
    id: '3',
    name: 'Sepatu Lari Nike Air Zoom Pegasus 40 - Unisex',
    price: 1899000,
    category: 'Fashion',
    description: 'Sepatu lari ikonik dengan bantalan responsif yang memberikan kenyamanan maksimal untuk setiap langkah lari Anda.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Kombinasi sempurna antara performa atletik dan gaya streetwear global.',
    rating: 4.7,
    soldCount: 2300
  },
  {
    id: '4',
    name: 'Skincare Set Premium Advanced Night Repair',
    price: 2450000,
    category: 'Wellness',
    description: 'Paket lengkap perawatan wajah malam hari untuk regenerasi kulit maksimal dan mencegah penuaan dini.',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Keajaiban kecantikan yang dipercaya oleh jutaan wanita di seluruh dunia.',
    rating: 4.9,
    soldCount: 1500,
    discountTag: 'Bestseller'
  },
  {
    id: '5',
    name: 'Mechanical Keyboard Wireless RGB G-Pro',
    price: 1299000,
    originalPrice: 1599000,
    category: 'Elektronik',
    description: 'Keyboard mekanik minimalis dengan switch hotswappable dan pencahayaan RGB kustom yang memukau.',
    images: [
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Tingkatkan produktivitas dan pengalaman gaming Anda ke level profesional.',
    rating: 4.6,
    soldCount: 670
  },
  {
    id: '6',
    name: 'Tas Ransel Laptop Anti-Theft Water Resistant',
    price: 450000,
    category: 'Fashion',
    description: 'Tas ransel modern dengan port USB charging dan material tahan air, cocok untuk traveler dan profesional urban.',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Keamanan dan gaya yang menyatu untuk mobilitas harian Anda.',
    rating: 4.5,
    soldCount: 3100
  }
];
