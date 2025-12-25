
import { Product } from './types';

export const GLOBAL_CONFIG = {
  MASTER_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyOlXuKnI7GMry31xegxRZdPvvWw7X4QdGvcZl_3Pn6_ikdNE4zIUqCMAGNQ94CDx5ljA/exec', 
  MASTER_IMGBB_KEY: '7e6f3ce63649d305ccaceea00c28266d',
  ADMIN_PASSWORD: 'admin' 
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Smartphone Pro Max 256GB - Garansi Resmi',
    price: 18500000,
    originalPrice: 19999000,
    category: 'Elektronik',
    description: 'Smartphone flagship terbaru dengan kamera 48MP, layar ProMotion 120Hz, dan ketahanan baterai sepanjang hari.',
    images: [
      'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Pilihan terbaik untuk produktivitas dan fotografi mobile tingkat profesional.',
    rating: 4.9,
    soldCount: 840,
    discountTag: '8% OFF'
  },
  {
    id: '2',
    name: 'Sneakers Running Aero Boost - White Edition',
    price: 1250000,
    originalPrice: 1500000,
    category: 'Fashion',
    description: 'Sepatu lari ringan dengan teknologi bantalan responsif untuk kenyamanan maksimal saat berolahraga atau harian.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Didesain untuk performa tinggi dengan sirkulasi udara optimal.',
    rating: 4.7,
    soldCount: 2300,
    discountTag: 'FLASH SALE'
  },
  {
    id: '3',
    name: 'Serum Wajah Brightening 30ml - Vitamin C + Hyaluronic',
    price: 185000,
    category: 'Kecantikan',
    description: 'Serum pencerah kulit yang membantu menyamarkan noda hitam dan menghidrasi kulit secara mendalam.',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143f2c00?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Formulasi dermatologis yang aman untuk semua jenis kulit.',
    rating: 4.8,
    soldCount: 5600,
    discountTag: 'BEST SELLER'
  },
  {
    id: '4',
    name: 'Smartwatch Series 9 - GPS 45mm Black Case',
    price: 6499000,
    originalPrice: 7200000,
    category: 'Gadget',
    description: 'Pantau kesehatan dan notifikasi Anda dengan mudah melalui layar retina yang selalu aktif.',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Pendamping setia untuk gaya hidup aktif dan terorganisir.',
    rating: 4.9,
    soldCount: 120,
    discountTag: '10% OFF'
  },
  {
    id: '5',
    name: 'Coffee Maker Otomatis - Espresso & Cappuccino',
    price: 3450000,
    category: 'Rumah Tangga',
    description: 'Buat kopi kualitas kafe di rumah Anda hanya dengan satu sentuhan tombol.',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Teknologi ekstraksi tekanan tinggi untuk aroma yang sempurna.',
    rating: 4.6,
    soldCount: 45
  },
  {
    id: '6',
    name: 'Headphones Wireless Noise Cancelling V2',
    price: 4200000,
    category: 'Elektronik',
    description: 'Nikmati musik tanpa gangguan dengan teknologi peredam kebisingan aktif terbaik di kelasnya.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Baterai tahan hingga 30 jam untuk menemani perjalanan jauh Anda.',
    rating: 4.8,
    soldCount: 156
  }
];
