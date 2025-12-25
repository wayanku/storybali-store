
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tas Rotan Handmade Tenganan Premium',
    price: 350000,
    originalPrice: 700000,
    category: 'Fashion',
    description: 'Tas rotan bundar tradisional Bali kualitas ekspor, dibuat langsung oleh pengrajin desa Tenganan menggunakan teknik anyaman double-ribbon.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
    story: 'Dibuat dengan teknik pengasapan kulit kacang yang memberikan warna karamel alami dan aroma kayu yang menenangkan.',
    rating: 4.8,
    soldCount: 1250,
    discountTag: 'DISKON 50%'
  },
  {
    id: '2',
    name: 'Set Dupa Cendana Wangi Pura',
    price: 75000,
    originalPrice: 125000,
    category: 'Wellness',
    description: 'Stik dupa cendana aromatik murni untuk meditasi, relaksasi, dan menciptakan suasana suci di rumah Anda.',
    image: 'https://images.unsplash.com/photo-1602928294248-457ee57460f1?auto=format&fit=crop&q=80&w=800',
    story: 'Diproduksi terbatas di desa Sidemen menggunakan bahan-bahan organik tanpa pewarna kimia.',
    rating: 4.9,
    soldCount: 3400,
    discountTag: 'BEST SELLER'
  },
  {
    id: '3',
    name: 'Nampan Kayu Jati Ukir Kuno',
    price: 850000,
    category: 'Home',
    description: 'Nampan saji eksklusif dari kayu jati tua yang direklamasi dengan ukiran tangan motif Patra Punggel.',
    image: 'https://images.unsplash.com/photo-1591871937573-74dbba515c4c?auto=format&fit=crop&q=80&w=800',
    story: 'Setiap goresan ukiran melambangkan keharmonisan alam semesta menurut filosofi Tri Hita Karana.',
    rating: 4.7,
    soldCount: 450
  },
  {
    id: '4',
    name: 'Syal Sutra Batik Tulis Galuh',
    price: 450000,
    originalPrice: 600000,
    category: 'Fashion',
    description: 'Syal sutra asli dengan motif batik tulis tangan khas seniman Ubud. Lembut, dingin, dan sangat elegan.',
    image: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?auto=format&fit=crop&q=80&w=800',
    story: 'Dikerjakan selama 3 minggu oleh pengrajin batik senior untuk menjaga detail motif yang sempurna.',
    rating: 5.0,
    soldCount: 89,
    discountTag: 'EXCLUSIVE'
  }
];
