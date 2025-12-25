
import React from 'react';
import { Product } from '../types';
import { Star, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetail: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetail }) => {
  // Ambil gambar pertama dari array images atau gunakan placeholder
  const mainImage = (Array.isArray(product.images) && product.images.length > 0) 
    ? product.images[0] 
    : 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <div 
      className="bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col h-full border-r border-b border-gray-100 relative group"
      onClick={() => onViewDetail(product)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={mainImage} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { 
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=StoryBali+Store';
          }}
        />
        {product.discountTag && (
          <div className="absolute top-0 right-0 bg-[#ffd424] text-[#ee4d2d] font-bold text-[10px] px-2 py-1 shadow-sm">
            <span className="uppercase">{product.discountTag}</span>
          </div>
        )}
        {/* Overlay Lihat Detail */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <div className="bg-[#ee4d2d] text-white px-4 py-2 rounded-sm text-[10px] font-bold shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 uppercase tracking-widest">
              Detail Produk
           </div>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow space-y-2">
        <h3 className="text-[11px] md:text-xs text-gray-700 font-medium line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {product.name}
        </h3>
        
        <div className="mt-auto space-y-1.5">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-[#ee4d2d] text-xs font-bold">Rp</span>
              <span className="text-[#ee4d2d] text-base font-bold">
                {product.price.toLocaleString('id-ID')}
              </span>
            </div>
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-[10px]">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-1">
            <div className="flex items-center gap-0.5">
              <Star size={10} fill="#ffce3d" stroke="none" />
              <span className="text-[10px] text-gray-500 font-bold">{product.rating || 5}</span>
            </div>
            <span className="text-[10px] text-gray-400">{product.soldCount > 999 ? '1rb+' : product.soldCount} Terjual</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
