
import React from 'react';
import { Product } from '../types';
import { Plus, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetail: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetail }) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button 
            onClick={() => onViewDetail(product)}
            className="p-3 bg-white rounded-full text-stone-800 hover:bg-emerald-600 hover:text-white transition-colors"
          >
            <Eye size={20} />
          </button>
          <button 
            onClick={() => onAddToCart(product)}
            className="p-3 bg-white rounded-full text-stone-800 hover:bg-emerald-600 hover:text-white transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-800 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-stone-800 mb-1 group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-stone-500 line-clamp-2 mb-4 h-10 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-emerald-900">${product.price}.00</span>
          <button 
            onClick={() => onAddToCart(product)}
            className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-emerald-700 transition-colors"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
