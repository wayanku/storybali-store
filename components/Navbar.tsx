
import React from 'react';
import { ShoppingCart, Search, Menu, Bell } from 'lucide-react';
import { AppRoute } from '../types';

interface NavbarProps {
  onNavigate: (route: AppRoute) => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
         <div onClick={() => onNavigate(AppRoute.HOME)} className="flex items-center gap-3 cursor-pointer shrink-0">
            <div className="w-10 h-10 bg-[#ee4d2d] text-white rounded-lg flex items-center justify-center font-black text-xl">S</div>
            <div className="hidden sm:block">
               <h1 className="text-[#ee4d2d] text-xl font-black italic tracking-tighter">StoryBali</h1>
               <p className="text-[8px] text-gray-400 font-bold uppercase">Official Store</p>
            </div>
         </div>

         <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full bg-stone-100 rounded-md flex items-center px-4 py-2 border border-transparent focus-within:bg-white focus-within:border-[#ee4d2d]/30 transition-all">
               <Search size={18} className="text-gray-400" />
               <input placeholder="Cari barang impianmu..." className="flex-1 px-3 py-1 text-sm outline-none bg-transparent" />
            </div>
         </div>

         <div className="flex items-center gap-4">
            <button onClick={() => onNavigate(AppRoute.ADMIN)} className="hidden md:block text-xs font-bold text-gray-500 hover:text-[#ee4d2d]">Seller Centre</button>
            <div onClick={() => onNavigate(AppRoute.CART)} className="relative p-2 cursor-pointer">
               <ShoppingCart size={22} className="text-stone-700" />
               {cartCount > 0 && <span className="absolute top-0 right-0 bg-[#ee4d2d] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">{cartCount}</span>}
            </div>
            <button className="md:hidden"><Menu size={24}/></button>
         </div>
      </div>
    </nav>
  );
};

export default Navbar;
