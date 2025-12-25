
import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Edit, Trash2, X, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { getProductEnhancement } from '../services/geminiService';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ products, onUpdateProducts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Fashion',
    image: '',
    description: '',
    story: '',
    rating: 5,
    soldCount: 0
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: 0,
      category: 'Fashion',
      image: '',
      description: '',
      story: '',
      rating: 5,
      soldCount: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.image) {
      alert('Mohon isi semua field wajib (Nama, Harga, Gambar)!');
      return;
    }

    if (editingProduct) {
      // Update
      onUpdateProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p));
    } else {
      // Create
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
        rating: formData.rating || 5,
        soldCount: formData.soldCount || 0,
      } as Product;
      onUpdateProducts([newProduct, ...products]);
    }
    setIsModalOpen(false);
  };

  const handleAiDescription = async () => {
    if (!formData.name || !formData.description) {
      alert('Masukkan nama dan deskripsi singkat dulu agar AI bisa membantu!');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await getProductEnhancement(formData.name, formData.description);
      setFormData(prev => ({ ...prev, story: result }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="font-bold text-stone-800">Daftar Produk Aktif</h2>
        <button 
          onClick={openAddModal}
          className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
        >
          <Plus size={18} /> TAMBAH PRODUK BARU
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Produk</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Harga</th>
              <th className="px-6 py-4">Stok/Terjual</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={product.image} className="w-12 h-12 rounded-lg object-cover border" alt={product.name} />
                    <div>
                      <p className="font-bold text-stone-800 text-sm">{product.name}</p>
                      <p className="text-[10px] text-stone-400">ID: {product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">{product.category}</span>
                </td>
                <td className="px-6 py-4 font-black text-stone-800">${product.price}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium">{product.soldCount} Units</p>
                  <div className="w-20 bg-stone-100 h-1.5 rounded-full mt-1">
                    <div className="bg-emerald-500 h-full rounded-full w-2/3"></div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openEditModal(product)}
                      className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-stone-50 border-b flex justify-between items-center">
              <h3 className="text-xl font-black text-stone-800">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-800"><X size={24} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Nama Produk *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Tas Anyaman Bambu"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Kategori</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option>Fashion</option>
                    <option>Wellness</option>
                    <option>Home</option>
                    <option>Art</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Harga (USD) *</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">URL Gambar Produk *</label>
                  <input 
                    type="text" 
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase">Deskripsi Singkat</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Cerita Produk (AI Powered)</label>
                  <button 
                    onClick={handleAiDescription}
                    disabled={isGenerating}
                    className="text-[10px] font-bold text-orange-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    <Sparkles size={12} /> {isGenerating ? 'Menyusun...' : 'Gunakan AI Auto-Story'}
                  </button>
                </div>
                <textarea 
                  value={formData.story}
                  onChange={(e) => setFormData({...formData, story: e.target.value})}
                  rows={3}
                  placeholder="Cerita mendalam tentang produk ini..."
                  className="w-full bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none italic text-stone-600"
                />
              </div>
            </div>

            <div className="p-6 border-t bg-stone-50 flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-400 hover:bg-white transition-all"
              >
                BATAL
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-emerald-800 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} /> SIMPAN PERUBAHAN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
