
import React from 'react';
import { Product } from '../types';
import { Star } from 'lucide-react';

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
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400';

  return (
    <div 
      className="bg-white rounded-sm overflow-hidden hover:shadow-md hover:border-[#ee4d2d] border border-transparent transition-all cursor-pointer flex flex-col h-full group shopee-shadow"
      onClick={() => onViewDetail(product)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={mainImage} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discountTag && (
          <div className="absolute top-0 right-0 bg-[#ffd424] text-[#ee4d2d] font-bold text-[10px] px-2 py-1 flex flex-col items-center">
            <span>{product.discountTag}</span>
          </div>
        )}
      </div>
      
      <div className="p-2 flex flex-col flex-grow">
        <h3 className="text-xs text-gray-800 line-clamp-2 mb-2 leading-relaxed min-h-[2.5rem]">
          {product.name}
        </h3>
        
        <div className="mt-auto">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] px-1 bg-[#fbebed] text-[#ee4d2d] border border-[#ee4d2d] rounded-sm">Pilihan</span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-[#ee4d2d] text-sm font-medium">Rp</span>
            <span className="text-[#ee4d2d] text-base font-bold">
              {product.price.toLocaleString('id-ID')}
            </span>
          </div>

          {product.originalPrice && (
            <span className="text-gray-400 line-through text-[10px]">{formatRupiah(product.originalPrice)}</span>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-0.5">
              <Star size={10} fill="#ffce3d" stroke="none" />
              <span className="text-[10px] text-gray-600">{product.rating}</span>
            </div>
            <span className="text-[10px] text-gray-500">{product.soldCount > 1000 ? `${(product.soldCount/1000).toFixed(1)}rb` : product.soldCount} Terjual</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
