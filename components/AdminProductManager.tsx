
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { 
  Globe, Share2, Info, Loader2, Link, Check, RefreshCw, 
  Save, Plus, X, Edit, Trash2, LayoutGrid, Upload, 
  Image as ImageIcon, DollarSign, Tag, Star, Package, 
  Settings, Key, AlertCircle, Search
} from 'lucide-react';
import { getStoreData, updateStoreData, uploadImageToImgBB } from '../services/cloudService';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ products, onUpdateProducts }) => {
  // Config States
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem('storybali_script_url') || '');
  const [imgbbKey, setImgbbKey] = useState(localStorage.getItem('storybali_imgbb_key') || '');
  
  // UI States
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFetch = async () => {
    if (!scriptUrl) return alert('Silakan atur URL Google Script di menu Settings!');
    setIsSyncing(true);
    const data = await getStoreData(scriptUrl);
    setIsSyncing(false);
    if (data) {
      setLocalProducts(data);
      onUpdateProducts(data);
      localStorage.setItem('storybali_script_url', scriptUrl);
    }
  };

  const handlePush = async () => {
    if (!scriptUrl) return alert('Silakan atur URL Google Script di menu Settings!');
    setIsUpdating(true);
    const success = await updateStoreData(scriptUrl, localProducts);
    setIsUpdating(false);
    if (success) {
      onUpdateProducts(localProducts);
      alert('Sinkronisasi ke Google Sheets Berhasil!');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!imgbbKey) return alert('Silakan atur API Key ImgBB di menu Settings terlebih dahulu!');

    setIsUploading(true);
    const url = await uploadImageToImgBB(file, imgbbKey);
    setIsUploading(false);
    
    if (url) {
      setFormData(prev => ({ ...prev, image: url }));
    } else {
      alert('Gagal mengunggah gambar. Pastikan API Key benar.');
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setFormData({ 
      id: `P-${Date.now()}`, 
      name: '', 
      price: 0, 
      category: 'Art', 
      image: '', 
      description: '', 
      story: '', 
      rating: 5, 
      soldCount: 0 
    });
    setIsModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleSaveLocal = () => {
    if (!formData.name || !formData.price) return alert('Nama dan Harga wajib diisi!');
    let newList;
    if (editingProduct) {
      newList = localProducts.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p);
    } else {
      newList = [formData as Product, ...localProducts];
    }
    setLocalProducts(newList);
    setIsModalOpen(false);
  };

  const filteredProducts = localProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      {/* Sidebar-like Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-stone-100">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-100' : 'text-stone-400 hover:bg-stone-50'}`}
          >
            <Package size={18} /> INVENTORY
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-100' : 'text-stone-400 hover:bg-stone-50'}`}
          >
            <Settings size={18} /> SETTINGS
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
            />
          </div>
          <button onClick={openAdd} className="p-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">
            <Plus size={24} />
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-8 animate-fade-in">
          {/* Action Cloud Bar */}
          <div className="bg-stone-900 text-white p-8 rounded-[3rem] shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                <Globe size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter">Cloud Sync Manager</h2>
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Sinkronkan data lokal dengan Google Sheets</p>
              </div>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <button 
                onClick={handleFetch} 
                disabled={isSyncing}
                className="flex-1 lg:flex-none px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />} Muat dari Sheet
              </button>
              <button 
                onClick={handlePush} 
                disabled={isUpdating}
                className="flex-1 lg:flex-none px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Simpan ke Sheet
              </button>
            </div>
          </div>

          {/* Professional Table */}
          <div className="bg-white rounded-[3rem] border border-stone-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-stone-50/50 border-b border-stone-100 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6">Informasi Produk</th>
                  <th className="px-10 py-6">Kategori</th>
                  <th className="px-10 py-6">Harga</th>
                  <th className="px-10 py-6 text-right">Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="group hover:bg-emerald-50/20 transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-stone-100 bg-stone-50 shadow-sm">
                           <img src={p.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-stone-800 text-sm leading-tight">{p.name}</p>
                          <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase tracking-tighter">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="px-4 py-1.5 bg-stone-100 text-stone-500 rounded-full text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                    </td>
                    <td className="px-10 py-6 font-black text-emerald-800 text-lg">${p.price}</td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(p)} className="w-10 h-10 rounded-xl bg-white border border-stone-100 text-stone-400 hover:text-emerald-700 hover:border-emerald-200 shadow-sm flex items-center justify-center transition-all"><Edit size={16}/></button>
                        <button onClick={() => { if(confirm('Hapus produk ini?')) setLocalProducts(prev => prev.filter(x => x.id !== p.id))}} className="w-10 h-10 rounded-xl bg-white border border-stone-100 text-stone-400 hover:text-red-600 hover:border-red-200 shadow-sm flex items-center justify-center transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="py-20 text-center text-stone-400 font-bold uppercase text-xs tracking-widest">Tidak ada produk ditemukan</div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          <div className="bg-white p-10 rounded-[3rem] border border-stone-100 space-y-8 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                   <Globe size={24} />
                </div>
                <h3 className="text-xl font-black text-stone-800 tracking-tighter">Google Script Endpoint</h3>
             </div>
             <div className="space-y-4">
                <p className="text-xs text-stone-500 font-medium leading-relaxed">Masukkan URL Web App dari Apps Script Anda untuk sinkronisasi Google Sheets.</p>
                <input 
                  type="text" 
                  value={scriptUrl} 
                  onChange={(e) => { setScriptUrl(e.target.value); localStorage.setItem('storybali_script_url', e.target.value); }}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm font-medium focus:border-emerald-700 outline-none transition-all"
                />
             </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-stone-100 space-y-8 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center">
                   <Key size={24} />
                </div>
                <h3 className="text-xl font-black text-stone-800 tracking-tighter">ImgBB API Key</h3>
             </div>
             <div className="space-y-4">
                <p className="text-xs text-stone-500 font-medium leading-relaxed">Dapatkan API Key gratis di <a href="https://api.imgbb.com/" target="_blank" className="text-orange-600 underline">api.imgbb.com</a> untuk fitur unggah gambar otomatis.</p>
                <input 
                  type="password" 
                  value={imgbbKey} 
                  onChange={(e) => { setImgbbKey(e.target.value); localStorage.setItem('storybali_imgbb_key', e.target.value); }}
                  placeholder="Masukkan API Key ImgBB"
                  className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm font-medium focus:border-orange-600 outline-none transition-all"
                />
             </div>
          </div>
        </div>
      )}

      {/* Product Modal - Professional Redesign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left Image Section */}
            <div className="w-full md:w-80 bg-stone-50 p-10 flex flex-col items-center justify-center gap-8 border-r border-stone-100">
               <div className="relative group w-full aspect-square bg-white rounded-[2rem] shadow-inner overflow-hidden border-4 border-white">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                       <ImageIcon size={64} />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                       <Loader2 className="animate-spin text-emerald-700" size={32} />
                    </div>
                  )}
               </div>
               
               <div className="w-full space-y-3">
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-emerald-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    <Upload size={14} /> Pilih Gambar
                  </button>
                  <p className="text-[9px] text-stone-400 font-bold text-center uppercase tracking-widest">Otomatis Terunggah ke ImgBB</p>
               </div>
            </div>

            {/* Right Form Section */}
            <div className="flex-1 p-12 overflow-y-auto">
               <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-stone-800 tracking-tighter">{editingProduct ? 'Update Product' : 'Create Product'}</h3>
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1">Detail artisan & manajemen inventory</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 transition-colors"><X size={24}/></button>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nama Produk Artisan</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-700 outline-none transition-all" placeholder="E.g. Tas Rotan Handmade" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Harga Jual ($)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-700" size={16} />
                       <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:border-emerald-700 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Kategori Produk</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-700 outline-none">
                       <option>Fashion</option>
                       <option>Wellness</option>
                       <option>Home</option>
                       <option>Art</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">URL Gambar (Langsung)</label>
                    <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4 text-xs font-medium focus:border-emerald-700 outline-none transition-all" placeholder="https://i.ibb.co/..." />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Deskripsi Singkat</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4 text-sm font-medium h-32 focus:border-emerald-700 outline-none transition-all resize-none"></textarea>
                  </div>
               </div>

               <div className="flex gap-4 mt-12">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 border-2 border-stone-100 rounded-2xl text-[11px] font-black text-stone-400 uppercase hover:bg-stone-50 transition-all">Cancel</button>
                  <button onClick={handleSaveLocal} className="flex-[2] py-5 bg-emerald-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                    <Check size={18} /> Simpan ke Inventory
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
