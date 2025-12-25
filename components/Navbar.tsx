
import React from 'react';
import { ShoppingBag, Search, User, Menu, Heart } from 'lucide-react';
import { AppRoute } from '../types';

interface NavbarProps {
  onNavigate: (route: AppRoute) => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-stone-600">
              <Menu size={24} />
            </button>
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => onNavigate(AppRoute.HOME)}
            >
              <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform">S</div>
              <span className="text-xl font-bold tracking-tight text-stone-800 hidden sm:block">
                StoryBali <span className="font-light text-emerald-700">Store</span>
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-stone-600 uppercase tracking-widest">
            <button onClick={() => onNavigate(AppRoute.HOME)} className="hover:text-emerald-700 transition-colors">Home</button>
            <button onClick={() => onNavigate(AppRoute.CATALOG)} className="hover:text-emerald-700 transition-colors">Shop All</button>
            <button className="hover:text-emerald-700 transition-colors">Our Story</button>
            <button onClick={() => onNavigate(AppRoute.ADMIN)} className="hover:text-emerald-700 transition-colors">Dashboard</button>
          </div>

          <div className="flex items-center gap-5">
            <button className="p-2 text-stone-500 hover:text-emerald-700 transition-colors">
              <Search size={22} />
            </button>
            <button className="p-2 text-stone-500 hover:text-emerald-700 transition-colors hidden sm:block">
              <Heart size={22} />
            </button>
            <button 
              className="p-2 text-stone-500 hover:text-emerald-700 transition-colors relative"
              onClick={() => onNavigate(AppRoute.CART)}
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="p-2 text-stone-500 hover:text-emerald-700 transition-colors">
              <User size={22} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
