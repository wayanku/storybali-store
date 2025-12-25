
import React from 'react';
import { ShoppingBag, Search, User, Smartphone, Bell, Heart } from 'lucide-react';
import { AppRoute } from '../types';

interface NavbarProps {
  onNavigate: (route: AppRoute) => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100">
      {/* Promo Bar */}
      <div className="bg-stone-900 text-white text-[10px] py-2 px-6 sm:px-12 flex justify-between items-center font-black uppercase tracking-widest">
        <div className="flex gap-6">
          <span className="flex items-center gap-2 cursor-pointer hover:text-emerald-400 transition-colors"><Smartphone size={12}/> Install StoryBali App</span>
          <span className="hidden sm:inline opacity-30">|</span>
          <span className="hidden sm:inline">Follow Instagram @StoryBali</span>
        </div>
        <div className="flex gap-6">
          <span className="cursor-pointer hover:text-emerald-400 transition-colors">Bantuan</span>
          <span className="cursor-pointer hover:text-emerald-400 transition-colors font-black">Daftar</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-5 sm:px-8">
        <div className="flex items-center gap-6 sm:gap-12">
          {/* Brand */}
          <div 
            className="flex flex-shrink-0 items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate(AppRoute.HOME)}
          >
            <div className="w-11 h-11 bg-emerald-800 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-100 group-hover:scale-110 transition-transform">S</div>
            <div className="hidden md:block">
              <span className="text-2xl font-black tracking-tighter text-stone-800 block leading-none">StoryBali</span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Artisan Heritage</span>
            </div>
          </div>

          {/* Luxury Search */}
          <div className="flex-1 relative hidden sm:block">
            <div className="flex bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden group focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all">
              <input 
                type="text" 
                placeholder="Cari warisan budaya Bali terbaik..." 
                className="flex-1 bg-transparent px-6 py-3.5 text-xs font-bold outline-none text-stone-800"
              />
              <button className="bg-emerald-800 text-white px-8 hover:bg-stone-900 transition-colors">
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-6 ml-auto">
            <button className="p-2 text-stone-400 hover:text-emerald-800 transition-colors hidden sm:block">
              <Heart size={24} />
            </button>
            <button 
              className="p-2 text-stone-800 hover:bg-stone-50 rounded-full relative transition-all active:scale-90"
              onClick={() => onNavigate(AppRoute.CART)}
            >
              <ShoppingBag size={26} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[9px] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center font-black border-2 border-white shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="flex items-center gap-3 p-1.5 pr-4 bg-stone-50 rounded-full text-stone-800 hover:bg-stone-100 transition-all">
               <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden border border-white">
                  <User size={20} className="w-full h-full p-1.5 text-stone-500" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Akun Saya</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Category Nav */}
      <nav className="bg-white border-t border-stone-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between py-3">
          <div className="flex gap-10 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
            <button onClick={() => onNavigate(AppRoute.CATALOG)} className="hover:text-emerald-700 transition-colors">Semua Koleksi</button>
            <button className="hover:text-emerald-700 transition-colors">Kriya Seni</button>
            <button className="hover:text-emerald-700 transition-colors">Fashion Bali</button>
            <button className="hover:text-emerald-700 transition-colors">Kesehatan Alami</button>
            <button className="hover:text-emerald-700 transition-colors">Dekorasi Vila</button>
          </div>
          <button 
            onClick={() => onNavigate(AppRoute.ADMIN)} 
            className="text-[10px] font-black text-orange-600 border-2 border-orange-600 px-4 py-1.5 rounded-full hover:bg-orange-600 hover:text-white transition-all uppercase tracking-widest"
          >
            Dashboard Admin
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
