
import React from 'react';
import { Product } from '../types';
import { Star, MapPin, Heart, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetail: (p: Product) => void;
  onToggleWishlist?: (p: Product) => void;
  isWishlisted?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onViewDetail,
  onToggleWishlist,
  isWishlisted
}) => {
  const mainImage = (Array.isArray(product.images) && product.images.length > 0) 
    ? product.images[0] 
    : 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer group flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-stone-100 relative"
      onClick={() => onViewDetail(product)}
    >
      {/* Top Badge Overlay */}
      {product.discountTag && (
        <div className="absolute top-0 right-0 z-10 bg-[#ee4d2d] text-white text-[9px] font-black px-2 py-1 rounded-bl-xl shadow-lg">
          {product.discountTag}
        </div>
      )}

      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img 
          src={mainImage} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product);
          }}
          className={`absolute top-2 left-2 p-2 rounded-xl backdrop-blur-md transition-all duration-300 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/70 text-stone-400 hover:bg-white'}`}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onAddToCart(product);
             }}
             className="w-full bg-[#ee4d2d] text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
           >
             <ShoppingBag size={14} /> + Keranjang
           </button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <h3 className="text-xs font-bold text-stone-700 line-clamp-2 leading-relaxed min-h-[2.5rem] group-hover:text-[#ee4d2d] transition-colors">
          {product.name}
        </h3>
        
        <div className="flex flex-col">
           <span className="text-[#ee4d2d] text-base font-black">
             Rp {product.price.toLocaleString('id-ID')}
           </span>
           {product.originalPrice && (
              <span className="text-stone-300 line-through text-[10px]">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
           )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-stone-50">
          <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold">
            <Star size={12} fill="#ffce3d" className="text-yellow-400" />
            <span>{product.rating}</span>
          </div>
          <span className="text-[10px] text-stone-300 font-bold uppercase tracking-tighter">
            {product.soldCount > 999 ? '1rb+' : product.soldCount} Terjual
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
