
import React from 'react';
import { Product } from '../types';
import { Star, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetail: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetail }) => {
  return (
    <div 
      className="bg-white rounded-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-stone-100 cursor-pointer flex flex-col h-full"
      onClick={() => onViewDetail(product)}
    >
      <div className="relative aspect-square bg-stone-50 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.discountTag && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-orange-700 font-bold text-[10px] px-2 py-1 rounded-bl-lg shadow-sm">
            {product.discountTag}
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex gap-1">
           <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">MALL</span>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-[13px] leading-tight text-stone-800 line-clamp-2 mb-2 group-hover:text-orange-500">
          {product.name}
        </h3>
        
        <div className="mt-auto">
          <div className="flex items-center gap-1 mb-1">
             <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                ))}
             </div>
             <span className="text-[10px] text-stone-400">| {product.soldCount > 1000 ? `${(product.soldCount/1000).toFixed(1)}k` : product.soldCount} Terjual</span>
          </div>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-orange-600 font-bold text-lg">${product.price}</span>
            {product.originalPrice && (
              <span className="text-stone-400 line-through text-[11px]">${product.originalPrice}</span>
            )}
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-full mt-3 bg-white border border-orange-500 text-orange-500 hover:bg-orange-50 py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart size={14} /> Tambahkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
