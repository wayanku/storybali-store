
import React from 'react';
import { ShoppingCart, Search, Menu, Bell, User, Heart } from 'lucide-react';
import { AppRoute } from '../types';

interface NavbarProps {
  onNavigate: (route: AppRoute) => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount }) => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-stone-100">
      <div className="bg-[#ee4d2d] py-1 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between text-[10px] text-white font-medium">
          <div className="flex gap-4">
            <button className="hover:opacity-80">Download Aplikasi StoryBali</button>
            <span className="opacity-40">|</span>
            <button className="hover:opacity-80">Mulai Jual</button>
          </div>
          <div className="flex gap-4">
            <button className="hover:opacity-80 flex items-center gap-1"><Bell size={12}/> Notifikasi</button>
            <button className="hover:opacity-80">Bantuan</button>
            <button className="hover:opacity-80 font-bold">Daftar</button>
            <button className="hover:opacity-80 font-bold">Login</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center gap-4 md:gap-8">
        <div onClick={() => onNavigate(AppRoute.HOME)} className="flex items-center gap-2 cursor-pointer shrink-0">
          <div className="w-10 h-10 bg-[#ee4d2d] text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-100">S</div>
          <div className="hidden lg:block">
            <h1 className="text-[#ee4d2d] text-xl font-black tracking-tighter leading-none italic">StoryBali</h1>
            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Premium Marketplace</p>
          </div>
        </div>

        <div className="flex-1 max-w-2xl relative group hidden md:block">
          <input 
            type="text" 
            placeholder="Cari produk, merek, atau toko..." 
            className="w-full bg-stone-100 rounded-lg px-4 py-2.5 text-sm outline-none border border-transparent focus:bg-white focus:border-[#ee4d2d]/30 transition-all shadow-inner"
          />
          <button className="absolute right-1 top-1 bottom-1 bg-[#ee4d2d] text-white px-5 rounded-md hover:bg-[#d73211] transition-colors">
            <Search size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-5 ml-auto">
          <button onClick={() => onNavigate(AppRoute.WISHLIST)} className="p-2 text-stone-600 hover:text-[#ee4d2d] transition-colors relative hidden sm:block">
            <Heart size={22} />
          </button>
          
          <div onClick={() => onNavigate(AppRoute.CART)} className="relative p-2 cursor-pointer group">
            <ShoppingCart size={24} className="text-stone-700 group-hover:text-[#ee4d2d] transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ee4d2d] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </div>

          <div className="h-8 w-px bg-stone-100 hidden md:block"></div>

          <button onClick={() => onNavigate(AppRoute.ADMIN)} className="hidden md:flex items-center gap-2 text-stone-600 hover:text-[#ee4d2d] transition-colors">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
              <User size={18} />
            </div>
            <span className="text-xs font-bold">Seller</span>
          </button>
          
          <button className="md:hidden p-2 text-stone-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
