
import React from 'react';
import { Product } from '../types';
import { Star, ShoppingCart, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetail: (p: Product) => void;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetail }) => {
  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 border border-stone-100 cursor-pointer flex flex-col h-full group"
      onClick={() => onViewDetail(product)}
    >
      <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {product.discountTag && (
          <div className="absolute top-4 left-4 bg-orange-600 text-white font-black text-[10px] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
            <Tag size={10} /> {product.discountTag}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
           <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{product.category}</span>
           <div className="flex items-center gap-1 text-yellow-500">
              <Star size={10} fill="currentColor" />
              <span className="text-[10px] font-bold text-stone-600">{product.rating}</span>
           </div>
        </div>
        
        <h3 className="text-sm font-bold text-stone-800 line-clamp-2 mb-3 group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto space-y-3">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-stone-400 line-through text-[10px]">{formatRupiah(product.originalPrice)}</span>
            )}
            <span className="text-emerald-800 font-black text-lg">{formatRupiah(product.price)}</span>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-full bg-stone-900 text-white group-hover:bg-emerald-800 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <ShoppingCart size={14} /> TAMBAHKAN
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
