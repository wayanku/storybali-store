
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

export enum AppRoute {
  HOME = 'home',
  CATALOG = 'catalog',
  PRODUCT_DETAIL = 'product-detail',
  CART = 'cart',
  CHECKOUT = 'checkout',
  ADMIN = 'admin'
}
