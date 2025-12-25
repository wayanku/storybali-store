
import React from 'react';
import { ShoppingCart, Search, User, Bell, HelpCircle } from 'lucide-react';
import { AppRoute } from '../types';

interface NavbarProps {
  onNavigate: (route: AppRoute) => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount }) => {
  return (
    <nav className="sticky top-0 z-50 bg-[#ee4d2d] shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-[10px] text-white/90 font-medium">
         <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Seller Centre</span>
            <span className="hover:text-white cursor-pointer border-l pl-4 border-white/20">Mulai Jual</span>
            <span className="hover:text-white cursor-pointer border-l pl-4 border-white/20">Download</span>
            <span className="hover:text-white cursor-pointer border-l pl-4 border-white/20 flex items-center gap-1">Ikuti kami di <User size={10}/></span>
         </div>
         <div className="flex gap-4">
            <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Bell size={10}/> Notifikasi</span>
            <span className="flex items-center gap-1 hover:text-white cursor-pointer"><HelpCircle size={10}/> Bantuan</span>
            <span className="font-bold text-white cursor-pointer">Bahasa Indonesia</span>
         </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-10">
         {/* Logo */}
         <div 
           onClick={() => onNavigate(AppRoute.HOME)}
           className="flex items-center gap-2 cursor-pointer group"
         >
            <div className="w-10 h-10 bg-white text-[#ee4d2d] rounded-lg flex items-center justify-center font-black text-2xl group-hover:scale-105 transition-transform">S</div>
            <div className="hidden sm:block">
               <h1 className="text-white text-2xl font-bold tracking-tight leading-none">StoryBali</h1>
               <span className="text-[10px] text-white/80 font-medium uppercase tracking-[0.2em]">Artisan Marketplace</span>
            </div>
         </div>

         {/* Search */}
         <div className="flex-1 w-full bg-white rounded-sm p-1 flex shadow-lg">
            <input 
              type="text" 
              placeholder="Cari warisan budaya Bali terbaik..." 
              className="flex-1 px-4 py-2 text-sm outline-none placeholder:text-gray-300"
            />
            <button className="bg-[#ee4d2d] text-white px-6 py-2 rounded-sm hover:opacity-90 transition-opacity">
               <Search size={18} />
            </button>
         </div>

         {/* Cart & Account */}
         <div className="flex items-center gap-6">
            <div 
              onClick={() => onNavigate(AppRoute.CART)}
              className="relative text-white cursor-pointer hover:scale-110 transition-transform"
            >
               <ShoppingCart size={28} />
               {cartCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-white text-[#ee4d2d] text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-[#ee4d2d]">
                   {cartCount}
                 </span>
               )}
            </div>
            <button 
               onClick={() => onNavigate(AppRoute.ADMIN)}
               className="bg-white/10 text-white border border-white/30 px-4 py-1.5 rounded-sm text-xs font-bold hover:bg-white hover:text-[#ee4d2d] transition-all"
            >
               ADMIN
            </button>
         </div>
      </div>

      {/* Tags Bar */}
      <div className="max-w-7xl mx-auto px-4 pb-2 hidden md:flex gap-4 text-[11px] text-white/80">
         <span>Tas Rotan</span>
         <span>Dupa Wangi</span>
         <span>Ukir Jati</span>
         <span>Kain Batik</span>
         <span>Patung Bali</span>
         <span>Lukisan Ubud</span>
         <span>Souvenir Murah</span>
      </div>
    </nav>
  );
};

export default Navbar;
