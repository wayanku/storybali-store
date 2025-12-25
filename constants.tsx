
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
    description: 'Tas rotan bundar tradisional Bali kualitas ekspor, dibuat langsung oleh pengrajin desa Tenganan menggunakan teknik anyaman double-ribbon yang sangat rapat dan kuat.',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Dibuat dengan teknik pengasapan kulit kacang selama 3 hari yang memberikan aroma kayu alami dan warna karamel yang tidak akan pudar.',
    rating: 4.8,
    soldCount: 1250,
    discountTag: '50% OFF'
  },
  {
    id: '2',
    name: 'Patung Garuda Wisnu Kencana Ukir Kayu Suar',
    price: 2450000,
    category: 'Seni & Lukis',
    description: 'Mahakarya ukiran tangan dari kayu Suar utuh yang menggambarkan Dewa Wisnu mengendarai burung Garuda. Detail ukiran sangat halus hingga ke helai bulu.',
    images: [
      'https://images.unsplash.com/photo-1554439168-a40051877651?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Dikerjakan selama 2 bulan oleh Wayan, seorang master pemahat dari Mas, Ubud yang sudah menekuni seni pahat selama 40 tahun.',
    rating: 5.0,
    soldCount: 12
  },
  {
    id: '3',
    name: 'Lampu Meja Anyaman Bambu Siluet Ubud',
    price: 580000,
    category: 'Home Decor',
    description: 'Lampu dekoratif yang memancarkan cahaya hangat dengan siluet bambu yang menenangkan. Sangat cocok untuk menciptakan suasana villa Bali di kamar tidur Anda.',
    images: [
      'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Terinspirasi dari tenangnya malam di sawah Tegalalang, menggunakan bambu petung pilihan yang sudah diawetkan secara alami.',
    rating: 4.9,
    soldCount: 85
  },
  {
    id: '4',
    name: 'Set Dupa Aromaterapi Sandat & Jepun Bali',
    price: 125000,
    category: 'Wellness',
    description: 'Dupa premium bebas bahan kimia dengan aroma bunga Sandat dan Jepun yang autentik. Memberikan ketenangan spiritual dan relaksasi mendalam.',
    images: [
      'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Diramu dari bunga kering asli dan minyak esensial murni yang biasa digunakan dalam upacara adat di pura-pura besar Bali.',
    rating: 4.7,
    soldCount: 430,
    discountTag: 'BEST SELLER'
  },
  {
    id: '5',
    name: 'Gelang Perak Jalinan Khas Celuk',
    price: 890000,
    category: 'Aksesoris',
    description: 'Gelang perak murni 925 dengan motif jalinan filigree yang sangat rumit. Karya seni perhiasan dari desa pengrajin perak paling ternama di Bali.',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Menggunakan teknik filigree turun temurun yang hanya dikuasai oleh segelintir keluarga artisan di Desa Celuk.',
    rating: 4.9,
    soldCount: 56
  },
  {
    id: '6',
    name: 'Kain Tenun Ikat Endek Pewarna Alam',
    price: 1200000,
    category: 'Fashion',
    description: 'Kain Endek tradisional dengan motif kontemporer. Ditenun menggunakan alat tenun bukan mesin (ATBM) dengan pewarnaan dari akar mengkudu dan daun indigo.',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800'
    ],
    story: 'Simbol status dan kehormatan. Setiap motif memiliki makna perlindungan bagi pemakainya.',
    rating: 4.8,
    soldCount: 24
  }
];
