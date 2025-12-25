
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tas Rotan Handmade Tenganan',
    price: 45,
    originalPrice: 90,
    category: 'Fashion',
    description: 'Tas rotan bundar tradisional Bali, dibuat langsung oleh pengrajin desa Tenganan.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
    story: 'Dibuat dengan teknik pengasapan tradisional yang memberikan aroma khas dan ketahanan luar biasa.',
    rating: 4.8,
    soldCount: 1250,
    discountTag: '50% OFF'
  },
  {
    id: '2',
    name: 'Dupa Cendana Premium Set',
    price: 15,
    originalPrice: 25,
    category: 'Wellness',
    description: 'Stik dupa cendana aromatik untuk meditasi dan relaksasi.',
    image: 'https://images.unsplash.com/photo-1602928294248-457ee57460f1?auto=format&fit=crop&q=80&w=800',
    story: 'Membawa suasana pura Bali ke rumah Anda dengan wangi kayu suci.',
    rating: 4.9,
    soldCount: 3400,
    discountTag: 'Flash Sale'
  },
  {
    id: '3',
    name: 'Nampan Kayu Jati Minimalis',
    price: 65,
    category: 'Home',
    description: 'Nampan saji dari kayu jati reclaimed dengan finishing natural.',
    image: 'https://images.unsplash.com/photo-1591871937573-74dbba515c4c?auto=format&fit=crop&q=80&w=800',
    story: 'Setiap serat kayu menceritakan sejarah pohon jati tua di pegunungan Bali.',
    rating: 4.7,
    soldCount: 450
  },
  {
    id: '4',
    name: 'Syal Sutra Batik Tulis',
    price: 35,
    originalPrice: 50,
    category: 'Fashion',
    description: 'Syal sutra lukis tangan dengan motif bunga khas Ubud.',
    image: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?auto=format&fit=crop&q=80&w=800',
    story: 'Proses batik tulis yang memakan waktu berminggu-minggu untuk satu helai kain.',
    rating: 5.0,
    soldCount: 89,
    discountTag: 'Exclusive'
  },
  {
    id: '5',
    name: 'Mangkuk Keramik Abu Vulkanik',
    price: 55,
    category: 'Art',
    description: 'Mangkuk keramik yang terinspirasi tekstur Gunung Agung.',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    story: 'Dibuat di studio keramik Pejaten menggunakan tanah liat lokal pilihan.',
    rating: 4.6,
    soldCount: 210
  },
  {
    id: '6',
    name: 'Minyak Kelapa Murni (VCO)',
    price: 12,
    originalPrice: 18,
    category: 'Wellness',
    description: 'Cold-pressed coconut oil organik dari perkebunan Bali Utara.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
    story: 'Rahasia kecantikan alami wanita Bali turun-temurun.',
    rating: 4.8,
    soldCount: 5600,
    discountTag: 'Best Seller'
  },
  {
    id: '7',
    name: 'Patung Kayu Kucing Bali',
    price: 25,
    category: 'Art',
    description: 'Dekorasi kayu berbentuk kucing dengan lukisan warna-warni.',
    image: 'https://images.unsplash.com/photo-1610411132800-4742f3614210?auto=format&fit=crop&q=80&w=800',
    story: 'Simbol keberuntungan dan keceriaan yang sering ditemukan di pasar seni.',
    rating: 4.5,
    soldCount: 120
  },
  {
    id: '8',
    name: 'Sabun Batang Herbal Lemongrass',
    price: 8,
    category: 'Wellness',
    description: 'Sabun alami dengan ekstrak sereh yang menyegarkan kulit.',
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&q=80&w=800',
    story: 'Dibuat tanpa bahan kimia keras, menjaga kelestarian air di Bali.',
    rating: 4.9,
    soldCount: 15000
  }
];
