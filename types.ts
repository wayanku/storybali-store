
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
  icon: string;
  visible: boolean;
}

export type OrderStatus = 'Pending' | 'Diproses' | 'Dikemas' | 'Dikirim' | 'Selesai' | 'Dibatalkan';

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

export interface CartItem extends Product {
  quantity: number;
}

export enum AppRoute {
  HOME = 'home',
  CATALOG = 'catalog',
  PRODUCT_DETAIL = 'product-detail',
  CART = 'cart',
  CHECKOUT = 'checkout',
  ADMIN = 'admin',
  TRACKING = 'tracking'
}
