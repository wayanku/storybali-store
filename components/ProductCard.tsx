
import React from 'react';
import { Product } from '../types';
import { Star, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetail: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetail }) => {
  // Ambil gambar pertama dari array images
  const mainImage = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <div 
      className="bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col h-full border-r border-b border-gray-100 relative group"
      onClick={() => onViewDetail(product)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={mainImage} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Error+Loading' }}
        />
        {product.discountTag && (
          <div className="absolute top-0 right-0 bg-[#ffd424] text-[#ee4d2d] font-bold text-[9px] px-1.5 py-1 flex flex-col items-center leading-none">
            <span className="uppercase">{product.discountTag}</span>
          </div>
        )}
        {/* Hover Action Button (Shopee Desktop Style) */}
        <div className="absolute inset-x-0 bottom-0 bg-[#ee4d2d]/90 text-white py-2 text-[10px] font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-transform">
           LIHAT DETAIL
        </div>
      </div>
      
      <div className="p-2 md:p-3 flex flex-col flex-grow space-y-2">
        <h3 className="text-[11px] md:text-xs text-gray-800 line-clamp-2 leading-relaxed min-h-[2.4rem] group-hover:text-[#ee4d2d] transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-[9px] px-1 bg-[#fbebed] text-[#ee4d2d] border border-[#ee4d2d] rounded-[1px] font-medium leading-none py-0.5">Pilihan</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[#ee4d2d] text-[10px] font-bold">Rp</span>
              <span className="text-[#ee4d2d] text-sm md:text-base font-bold">
                {product.price.toLocaleString('id-ID')}
              </span>
            </div>
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-[9px] md:text-[10px]">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-2">
            <div className="flex items-center gap-0.5">
              <Star size={10} fill="#ffce3d" stroke="none" />
              <span className="text-[9px] text-gray-500 font-bold">{product.rating}</span>
            </div>
            <span className="text-[9px] text-gray-400">{product.soldCount > 1000 ? `${(product.soldCount/1000).toFixed(1)}rb` : product.soldCount} Terjual</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
