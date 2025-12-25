
import React from 'react';
import { ShoppingBag, Search, User, Menu, Bell, Smartphone } from 'lucide-react';
import { AppRoute } from '../types';

interface NavbarProps {
  onNavigate: (route: AppRoute) => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount }) => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar Promo */}
      <div className="bg-emerald-800 text-white text-[11px] py-1 px-4 sm:px-8 flex justify-between items-center font-medium">
        <div className="flex gap-4">
          <span className="flex items-center gap-1 cursor-pointer hover:text-emerald-200"><Smartphone size={12}/> Download StoryBali App</span>
          <span className="hidden sm:inline">| Follow us on Social Media</span>
        </div>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-emerald-200 flex items-center gap-1"><Bell size={12}/> Notifications</span>
          <span className="cursor-pointer hover:text-emerald-200">Help Center</span>
          <span className="cursor-pointer hover:text-emerald-200 font-bold">Sign Up</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Logo */}
          <div 
            className="flex flex-shrink-0 items-center gap-2 cursor-pointer"
            onClick={() => onNavigate(AppRoute.HOME)}
          >
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-md">S</div>
            <span className="text-2xl font-black tracking-tighter text-emerald-800 hidden md:block">
              StoryBali
            </span>
          </div>

          {/* Search Bar ala Shopee */}
          <div className="flex-1 relative">
            <div className="flex bg-stone-100 rounded-md border-2 border-orange-500 overflow-hidden">
              <input 
                type="text" 
                placeholder="Cari produk pengrajin Bali terlengkap..." 
                className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
              />
              <button className="bg-orange-500 text-white px-6 hover:bg-orange-600 transition-colors">
                <Search size={20} />
              </button>
            </div>
            {/* Quick Suggestions */}
            <div className="hidden sm:flex gap-3 mt-1.5 text-[11px] text-stone-500 overflow-hidden h-4">
              <span>Tas Rotan</span>
              <span>Dupa</span>
              <span>Batik Ubud</span>
              <span>Kopi Kintamani</span>
              <span>Garuda Wisnu</span>
            </div>
          </div>

          {/* Cart & User */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              className="p-2 text-emerald-800 hover:bg-stone-50 rounded-full relative"
              onClick={() => onNavigate(AppRoute.CART)}
            >
              <ShoppingBag size={26} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="hidden sm:flex items-center gap-2 p-2 text-emerald-800 hover:bg-stone-50 rounded-md">
               <User size={24} />
               <span className="text-xs font-bold">Akun</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Category Bottom Nav */}
      <div className="bg-white border-t border-stone-100 hidden sm:block">
        <div className="max-w-7xl mx-auto px-8 flex justify-between py-2 text-sm font-medium text-stone-600">
          <button onClick={() => onNavigate(AppRoute.CATALOG)} className="hover:text-orange-500">Semua Produk</button>
          <button className="hover:text-orange-500">Kesenian Bali</button>
          <button className="hover:text-orange-500">Fashion Pria</button>
          <button className="hover:text-orange-500">Fashion Wanita</button>
          <button className="hover:text-orange-500">Kesehatan & Kecantikan</button>
          <button className="hover:text-orange-500">Dekorasi Rumah</button>
          <button onClick={() => onNavigate(AppRoute.ADMIN)} className="text-emerald-700 font-bold border-l pl-6">Admin Panel</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
