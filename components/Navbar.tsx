
import { ShoppingCart, Search, User, Menu, Bell, Truck } from 'lucide-react';
import React from 'react';
import { AppRoute } from '../types';

interface NavbarProps {
  onNavigate: (route: AppRoute) => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
         <div 
           onClick={() => onNavigate(AppRoute.HOME)}
           className="flex items-center gap-3 cursor-pointer shrink-0 group"
         >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#ee4d2d] text-white rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl shadow-xl shadow-orange-100 group-hover:scale-105 transition-transform">SB</div>
            <div className="hidden sm:block">
               <h1 className="text-stone-900 text-xl md:text-2xl font-bold tracking-tight leading-none">StoryBali</h1>
               <p className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-[0.3em]">Official Store</p>
            </div>
         </div>

         <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full bg-stone-100 rounded-2xl flex items-center px-4 py-2 border border-transparent focus-within:border-[#ee4d2d]/20 focus-within:bg-white focus-within:shadow-lg transition-all">
               <Search size={18} className="text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Cari produk impian..." 
                 className="flex-1 px-3 py-1 text-sm outline-none bg-transparent placeholder:text-gray-400 font-medium"
               />
            </div>
         </div>

         <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden md:flex items-center gap-4 border-r border-stone-100 pr-6">
               <button onClick={() => onNavigate(AppRoute.TRACK_ORDER)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-[#ee4d2d] transition-colors">
                  <Truck size={16}/> Lacak Pesanan
               </button>
               <button onClick={() => onNavigate(AppRoute.ADMIN)} className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-[#ee4d2d] transition-colors">Seller Center</button>
            </div>
            
            <div 
              onClick={() => onNavigate(AppRoute.CART)}
              className="relative text-stone-800 cursor-pointer p-2 hover:bg-stone-50 rounded-xl transition-colors"
            >
               <ShoppingCart size={22} strokeWidth={2.5} />
               {cartCount > 0 && (
                 <span className="absolute top-1 right-1 bg-[#ee4d2d] text-white text-[9px] font-black min-w-[16px] h-[16px] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                   {cartCount}
                 </span>
               )}
            </div>
         </div>
      </div>
    </nav>
  );
};

export default Navbar;
