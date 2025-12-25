
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
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: { id: string, name: string, quantity: number, price: number }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingMethod: string;
  paymentMethod: string;
}

export interface FinanceRecord {
  id: string;
  type: 'Income' | 'Expense';
  amount: number;
  note: string;
  date: string;
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
