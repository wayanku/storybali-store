
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { 
  Globe, Info, Loader2, Link, Check, RefreshCw, 
  Save, Plus, X, Edit, Trash2, LayoutGrid, Upload, 
  Image as ImageIcon, DollarSign, Tag, Star, Package, 
  Settings, Key, Search, ArrowLeft, BarChart3, TrendingUp
} from 'lucide-react';
import { getStoreData, updateStoreData, uploadImageToImgBB } from '../services/cloudService';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ products, onUpdateProducts }) => {
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem('storybali_script_url') || '');
  const [imgbbKey, setImgbbKey] = useState(localStorage.getItem('storybali_imgbb_key') || '');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings' | 'dashboard'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFetch = async () => {
    if (!scriptUrl) return alert('Atur URL Google Script di Settings!');
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
    if (!scriptUrl) return alert('Atur URL Google Script di Settings!');
    setIsUpdating(true);
    const success = await updateStoreData(scriptUrl, localProducts);
    setIsUpdating(false);
    if (success) {
      onUpdateProducts(localProducts);
      alert('Database Cloud Berhasil Diperbarui!');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!imgbbKey) return alert('Atur API Key ImgBB di Settings!');

    setIsUploading(true);
    const url = await uploadImageToImgBB(file, imgbbKey);
    setIsUploading(false);
    
    if (url) {
      setFormData(prev => ({ ...prev, image: url }));
    } else {
      alert('Gagal unggah gambar.');
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setFormData({ 
      id: `P-${Date.now()}`, 
      name: '', 
      price: 0, 
      originalPrice: 0,
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
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 animate-fade-in">
      {/* Navigation Header */}
      <div className="flex flex-wrap justify-between items-center gap-6 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border border-white sticky top-24 z-40">
        <div className="flex bg-stone-100 p-1.5 rounded-2xl">
          <button onClick={() => setActiveTab('dashboard')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all ${activeTab === 'dashboard' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>DASHBOARD</button>
          <button onClick={() => setActiveTab('inventory')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all ${activeTab === 'inventory' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>INVENTORY</button>
          <button onClick={() => setActiveTab('settings')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all ${activeTab === 'settings' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>SETTINGS</button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
            <input 
              type="text" 
              placeholder="Cari SKU atau Nama..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-stone-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-700 w-64"
            />
          </div>
          <button onClick={openAdd} className="bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-black text-[11px] hover:bg-emerald-900 transition-all flex items-center gap-2">
            <Plus size={16} /> TAMBAH PRODUK
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
           <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6"><Package size={24}/></div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Produk</p>
              <h3 className="text-3xl font-black text-stone-800">{localProducts.length} <span className="text-sm font-bold text-stone-400">Unit</span></h3>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center mb-6"><TrendingUp size={24}/></div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Penjualan</p>
              <h3 className="text-3xl font-black text-stone-800">{localProducts.reduce((a,b) => a + b.soldCount, 0).toLocaleString()} <span className="text-sm font-bold text-stone-400">Item</span></h3>
           </div>
           <div className="bg-emerald-900 p-8 rounded-[2.5rem] shadow-2xl text-white lg:col-span-2 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Koneksi Cloud</p>
                    <h3 className="text-xl font-black">{scriptUrl ? 'SINKRONISASI AKTIF' : 'BELUM TERHUBUNG'}</h3>
                 </div>
                 <Globe className="text-emerald-500 animate-pulse" size={32} />
              </div>
              <div className="flex gap-2 mt-8">
                 <button onClick={handleFetch} disabled={isSyncing} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                   {isSyncing ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>} Refresh Data
                 </button>
                 <button onClick={handlePush} disabled={isUpdating} className="flex-1 bg-emerald-500 hover:bg-emerald-400 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20">
                   {isUpdating ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Push to Cloud
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-[3rem] border border-stone-100 shadow-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] border-b">
                <tr>
                  <th className="px-10 py-6">Produk Artisan</th>
                  <th className="px-10 py-6">Kategori</th>
                  <th className="px-10 py-6">Harga Satuan</th>
                  <th className="px-10 py-6">Terjual</th>
                  <th className="px-10 py-6 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="group hover:bg-stone-50/50 transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-inner">
                           <img src={p.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div>
                          <p className="font-black text-stone-800 text-sm leading-tight">{p.name}</p>
                          <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase">SKU: {p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">{p.category}</span>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex flex-col">
                          <span className="font-black text-stone-800">{formatRupiah(p.price)}</span>
                          {p.originalPrice && <span className="text-[10px] text-stone-400 line-through">{formatRupiah(p.originalPrice)}</span>}
                       </div>
                    </td>
                    <td className="px-10 py-6 font-bold text-stone-600 text-xs">{p.soldCount.toLocaleString()} Unit</td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(p)} className="w-10 h-10 rounded-xl bg-white border shadow-sm text-stone-400 hover:text-emerald-700 hover:border-emerald-200 flex items-center justify-center transition-all"><Edit size={16}/></button>
                        <button onClick={() => { if(confirm('Hapus produk ini?')) setLocalProducts(prev => prev.filter(x => x.id !== p.id))}} className="w-10 h-10 rounded-xl bg-white border shadow-sm text-stone-400 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center"><Globe size={24} /></div>
                <h3 className="text-xl font-black text-stone-800 tracking-tighter">API Endpoint Google</h3>
             </div>
             <input 
               type="text" 
               value={scriptUrl} 
               onChange={(e) => { setScriptUrl(e.target.value); localStorage.setItem('storybali_script_url', e.target.value); }}
               placeholder="URL Google Script Web App (/exec)"
               className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-xs font-bold focus:border-emerald-700 outline-none transition-all"
             />
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center"><Key size={24} /></div>
                <h3 className="text-xl font-black text-stone-800 tracking-tighter">ImgBB Cloud Key</h3>
             </div>
             <input 
               type="password" 
               value={imgbbKey} 
               onChange={(e) => { setImgbbKey(e.target.value); localStorage.setItem('storybali_imgbb_key', e.target.value); }}
               placeholder="API Key ImgBB (untuk upload otomatis)"
               className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-xs font-bold focus:border-orange-600 outline-none transition-all"
             />
          </div>
        </div>
      )}

      {/* Editor Modal Pro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col md:flex-row max-h-[90vh] border-8 border-white">
            
            <div className="w-full md:w-80 bg-stone-50 p-10 flex flex-col items-center justify-center gap-8 border-r">
               <div className="relative w-full aspect-square bg-white rounded-3xl shadow-inner overflow-hidden border-4 border-white">
                  {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-stone-300"><ImageIcon size={48} /></div>}
                  {isUploading && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-emerald-700" size={32} /></div>}
               </div>
               
               <div className="w-full space-y-4">
                  <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-emerald-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-900 transition-all flex items-center justify-center gap-2">
                    <Upload size={14} /> GANTI GAMBAR
                  </button>
                  <p className="text-[9px] text-stone-400 font-bold text-center uppercase tracking-widest">Otomatis Terintegrasi i.ibb.co</p>
               </div>
            </div>

            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
               <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-stone-800 tracking-tighter">{editingProduct ? 'Update Inventory' : 'Add New Artisan Item'}</h3>
                    <p className="text-[10px] text-stone-400 font-black uppercase mt-1">Management of Cultural Heritage Goods</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800"><X size={24}/></button>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Nama Produk</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-700 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Harga Jual (Rp)</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-800 font-bold text-xs">Rp</span>
                       <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-stone-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-700 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Harga Coret (Rp)</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">Rp</span>
                       <input type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})} className="w-full bg-stone-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-700 outline-none text-stone-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Kategori</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-700 outline-none">
                       <option>Fashion</option>
                       <option>Wellness</option>
                       <option>Home</option>
                       <option>Art</option>
                       <option>Souvenir</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Tag Diskon</label>
                    <input type="text" value={formData.discountTag} onChange={e => setFormData({...formData, discountTag: e.target.value})} placeholder="E.g. DISKON 10%" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-700 outline-none" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Cerita Produk (Artisan Story)</label>
                    <textarea value={formData.story} onChange={e => setFormData({...formData, story: e.target.value})} className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 text-sm font-medium h-24 focus:ring-2 focus:ring-emerald-700 outline-none resize-none"></textarea>
                  </div>
               </div>

               <div className="flex gap-4 mt-12">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-stone-100 rounded-2xl text-[11px] font-black text-stone-400 uppercase hover:bg-stone-200 transition-all">Cancel</button>
                  <button onClick={handleSaveLocal} className="flex-[2] py-5 bg-emerald-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-900 transition-all flex items-center justify-center gap-2">
                    <Check size={18} /> SAVE TO LOCAL INVENTORY
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
