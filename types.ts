
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'Home' | 'Fashion' | 'Art' | 'Wellness';
  image: string;
  story: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export enum AppRoute {
  HOME = 'home',
  CATALOG = 'catalog',
  PRODUCT_DETAIL = 'product-detail',
  CART = 'cart',
  CHECKOUT = 'checkout',
  ADMIN = 'admin'
}
