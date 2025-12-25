
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  images: string[];
  story: string;
  rating: number;
  soldCount: number;
  discountTag?: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string; // Key of Lucide icon
  visible: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'DIPROSES',
  SHIPPED = 'DIKIRIM',
  DELIVERED = 'SELESAI',
  CANCELLED = 'DIBATALKAN'
}

export interface Order {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  items: string;
  total: number;
  status: OrderStatus;
  timestamp: string;
}

export enum AppRoute {
  HOME = 'home',
  CATALOG = 'catalog',
  PRODUCT_DETAIL = 'product-detail',
  CART = 'cart',
  CHECKOUT = 'checkout',
  ADMIN = 'admin',
  TRACK_ORDER = 'track-order'
}
