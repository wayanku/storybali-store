
import React from 'react';
import { Product } from '../types';
import { Star, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetail: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetail }) => {
  const mainImage = (Array.isArray(product.images) && product.images.length > 0) 
    ? product.images[0] 
    : 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <div 
      className="bg-white rounded-sm shadow-sm overflow-hidden cursor-pointer group flex flex-col h-full hover:shadow-md hover:ring-1 hover:ring-[#ee4d2d]/20 transition-all"
      onClick={() => onViewDetail(product)}
    >
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img 
          src={mainImage} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {product.discountTag ? (
          <div className="absolute top-0 right-0 bg-yellow-400 text-[#ee4d2d] text-[10px] font-black px-1.5 py-0.5 rounded-bl-sm">
            {product.discountTag.includes('%') ? product.discountTag : 'PROMO'}
          </div>
        ) : (
          <div className="absolute top-0 left-0 bg-[#ee4d2d] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-sm shadow-sm">
            Mall
          </div>
        )}
      </div>
      
      <div className="p-2.5 flex flex-col flex-grow space-y-1.5">
        <h3 className="text-[11px] md:text-xs font-medium text-stone-800 line-clamp-2 leading-[1.3] h-[32px]">
          {product.name}
        </h3>
        
        <div className="flex flex-col">
           <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#ee4d2d] text-sm md:text-base font-bold">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
           </div>
           {product.originalPrice && (
              <span className="text-stone-300 line-through text-[9px]">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
           )}
        </div>

        <div className="flex items-center gap-1 text-[9px] text-stone-400">
           <MapPin size={10} className="shrink-0" />
           <span className="truncate">Kab. Gianyar</span>
        </div>

        <div className="mt-auto pt-1 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <Star size={10} fill="#ffce3d" className="text-yellow-400" />
            <span className="text-[10px] text-stone-500 font-medium">{product.rating || 5.0}</span>
          </div>
          <div className="h-2.5 w-[1px] bg-stone-100"></div>
          <span className="text-[10px] text-stone-400 truncate max-w-[50%]">
            Terjual {product.soldCount > 999 ? '1rb+' : product.soldCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
