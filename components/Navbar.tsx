
import React from 'react';
import { ShoppingCart, Search, User, Menu } from 'lucide-react';
import { AppRoute } from '../types';

interface NavbarProps {
  onNavigate: (route: AppRoute) => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount }) => {
  return (
    <nav className="sticky top-0 z-50 bg-[#ee4d2d] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center gap-4 md:gap-8">
         {/* Logo */}
         <div 
           onClick={() => onNavigate(AppRoute.HOME)}
           className="flex items-center gap-2 cursor-pointer shrink-0"
         >
            <div className="w-9 h-9 md:w-11 md:h-11 bg-white text-[#ee4d2d] rounded-xl flex items-center justify-center font-black text-xl md:text-2xl shadow-lg shadow-black/10">S</div>
            <div className="hidden sm:block">
               <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight leading-none">StoryBali</h1>
               <p className="text-[8px] md:text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Artisan Heritage</p>
            </div>
         </div>

         {/* Search Bar - Main Focus */}
         <div className="flex-1 max-w-2xl group">
            <div className="relative bg-white rounded-xl p-0.5 flex items-center shadow-lg transition-all focus-within:ring-4 focus-within:ring-white/20">
               <input 
                 type="text" 
                 placeholder="Cari kerajinan Bali..." 
                 className="flex-1 px-4 py-2 md:py-2.5 text-sm outline-none bg-transparent placeholder:text-gray-400"
               />
               <button className="bg-[#ee4d2d] text-white p-2 md:px-5 md:py-2 rounded-lg hover:opacity-90 transition-opacity">
                  <Search size={20} />
               </button>
            </div>
         </div>

         {/* Actions - Desktop Only */}
         <div className="hidden md:flex items-center gap-6">
            <div 
              onClick={() => onNavigate(AppRoute.CART)}
              className="relative text-white cursor-pointer hover:scale-110 transition-transform p-2"
            >
               <ShoppingCart size={26} />
               {cartCount > 0 && (
                 <span className="absolute top-0 right-0 bg-white text-[#ee4d2d] text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-[#ee4d2d]">
                   {cartCount}
                 </span>
               )}
            </div>
            <button 
               onClick={() => onNavigate(AppRoute.ADMIN)}
               className="bg-white/10 text-white border border-white/20 px-5 py-2 rounded-xl text-xs font-bold hover:bg-white hover:text-[#ee4d2d] transition-all"
            >
               SELLER CENTRE
            </button>
         </div>
      </div>
    </nav>
  );
};

export default Navbar;
