
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { 
  Globe, Loader2, RefreshCw, 
  Save, Plus, X, Edit, Trash2,
  Image as ImageIcon, Package, 
  Settings, Key, Search, AlertCircle,
  ToggleRight, ToggleLeft, CheckCircle,
  Sparkles, Wand2
} from 'lucide-react';
import { getStoreData, updateStoreData, uploadImageToImgBB } from '../services/cloudService';
import { getProductEnhancement } from '../services/geminiService';
import { GLOBAL_CONFIG } from '../constants';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ products, onUpdateProducts }) => {
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL);
  const [imgbbKey, setImgbbKey] = useState(localStorage.getItem('storybali_imgbb_key') || GLOBAL_CONFIG.MASTER_IMGBB_KEY);
  const [isAutoSync, setIsAutoSync] = useState(localStorage.getItem('storybali_autosync') === 'true');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');

  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({ images: [] });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const handleFetch = async () => {
    if (!scriptUrl) return alert('Atur URL Google Script di menu Settings!');
    setIsSyncing(true);
    const data = await getStoreData(scriptUrl);
    setIsSyncing(false);
    if (data) {
      setLocalProducts(data);
      onUpdateProducts(data);
    } else {
      alert('Gagal ambil data.');
    }
  };

  const handlePush = async (productsToPush: Product[]) => {
    if (!scriptUrl) return;
    setIsUpdating(true);
    const success = await updateStoreData(scriptUrl, productsToPush);
    setIsUpdating(false);
    if (success) {
      onUpdateProducts(productsToPush);
    }
  };

  const handleEnhanceDescription = async () => {
    if (!formData.name) return alert('Isi Nama Produk terlebih dahulu!');
    setIsEnhancing(true);
    const enhanced = await getProductEnhancement(formData.name, formData.description || '');
    setFormData(prev => ({ ...prev, description: enhanced }));
    setIsEnhancing(false);
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!imgbbKey) return alert('Masukkan API Key ImgBB di Pengaturan!');
    setIsUploading(true);
    const currentImages = Array.isArray(formData.images) ? [...formData.images] : [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImageToImgBB(files[i], imgbbKey);
      if (url) currentImages.push(url);
    }
    setFormData(prev => ({ ...prev, images: currentImages }));
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setFormData(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }));
  };

  const handleSaveLocal = async () => {
    if (!formData.name || !formData.price) return alert('Nama dan Harga wajib diisi!');
    let newList: Product[];
    if (editingProduct) {
      newList = localProducts.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p);
    } else {
      newList = [formData as Product, ...localProducts];
    }
    setLocalProducts(newList);
    setIsModalOpen(false);
    if (isAutoSync) handlePush(newList);
  };

  const toggleAutoSync = () => {
    const newVal = !isAutoSync;
    setIsAutoSync(newVal);
    localStorage.setItem('storybali_autosync', String(newVal));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-[#ee4d2d] text-white p-3 rounded-xl shadow-lg shadow-orange-100"><Package size={24} /></div>
          <div>
            <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Seller Centre</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Manajemen Warisan Bali</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('inventory')} className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-[#ee4d2d] shadow-sm' : 'text-gray-400'}`}>Inventori</button>
          <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-[#ee4d2d] shadow-sm' : 'text-gray-400'}`}>Pengaturan</button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          <div className="bg-zinc-900 text-white p-5 rounded-xl flex flex-wrap justify-between items-center gap-6 border border-white/5">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${scriptUrl ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{scriptUrl ? 'Cloud Connected' : 'Cloud Disconnected'}</span>
              </div>
              <button onClick={toggleAutoSync} className="flex items-center gap-2">
                {isAutoSync ? <ToggleRight className="text-green-400" /> : <ToggleLeft className="text-gray-500" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Auto-Sync</span>
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={handleFetch} className="bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-lg text-[10px] font-bold flex items-center gap-2 border border-white/5">
                {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Tarik Data
              </button>
              <button onClick={() => handlePush(localProducts)} className="bg-[#ee4d2d] hover:bg-[#ff5b3d] px-6 py-2.5 rounded-lg text-[10px] font-bold flex items-center gap-2 shadow-xl shadow-orange-950/20">
                {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Push ke Cloud
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input type="text" placeholder="Cari item..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-xs outline-none focus:border-[#ee4d2d]" />
              </div>
              <button onClick={() => { setEditingProduct(null); setFormData({ id: `P-${Date.now()}`, name: '', price: 0, category: 'Fashion', images: [], description: '', story: '', rating: 5, soldCount: 0 }); setIsModalOpen(true); }} className="w-full md:w-auto bg-[#ee4d2d] text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-orange-100">
                <Plus size={16} /> Produk Baru
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/50 font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                  <tr><th className="px-8 py-5">Produk</th><th className="px-8 py-5">Kategori</th><th className="px-8 py-5">Harga</th><th className="px-8 py-5 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {localProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-all group">
                      <td className="px-8 py-5 flex items-center gap-5">
                        <img src={p.images?.[0]} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                        <span className="font-bold text-gray-800 text-sm tracking-tight">{p.name}</span>
                      </td>
                      <td className="px-8 py-5"><span className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">{p.category}</span></td>
                      <td className="px-8 py-5 font-black text-[#ee4d2d] text-sm">Rp {p.price.toLocaleString('id-ID')}</td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => { setEditingProduct(p); setFormData({ ...p }); setIsModalOpen(true); }} className="p-2 text-zinc-400 hover:text-blue-500"><Edit size={16}/></button>
                        <button onClick={() => { if(confirm('Hapus?')) { const n = localProducts.filter(x => x.id !== p.id); setLocalProducts(n); if(isAutoSync) handlePush(n); }}} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-8">
             <div className="flex items-center gap-4">
               <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl"><Globe size={24} /></div>
               <div><h3 className="text-gray-800 font-black uppercase text-sm">URL Script</h3></div>
             </div>
             <input type="text" value={scriptUrl} onChange={(e) => { setScriptUrl(e.target.value); localStorage.setItem('storybali_script_url', e.target.value); }} className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-xs font-bold outline-none" />
          </div>
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-8">
             <div className="flex items-center gap-4"><div className="bg-amber-50 text-amber-600 p-3 rounded-2xl"><Key size={24} /></div><h3 className="text-gray-800 font-black uppercase text-sm">ImgBB Key</h3></div>
             <input type="password" value={imgbbKey} onChange={(e) => { setImgbbKey(e.target.value); localStorage.setItem('storybali_imgbb_key', e.target.value); }} className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-xs font-bold outline-none" />
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95">
            <div className="w-full md:w-96 bg-zinc-50 p-10 border-r border-zinc-100 overflow-y-auto">
               <h4 className="font-black text-zinc-800 text-[10px] uppercase tracking-[0.3em] mb-8">Media Produk</h4>
               <div className="grid grid-cols-2 gap-4 mb-10">
                 {formData.images?.map((img, i) => (
                   <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                     <img src={img} className="w-full h-full object-cover" />
                     <button onClick={() => removeImage(i)} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Trash2 size={16}/></button>
                   </div>
                 ))}
                 <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-400 hover:text-[#ee4d2d]">
                   {isUploading ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                   <span className="text-[9px] mt-2 font-black uppercase tracking-widest">Unggah</span>
                 </button>
               </div>
               <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleImagesUpload} />
            </div>
            <div className="flex-1 p-12 overflow-y-auto space-y-10">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">{editingProduct ? 'Edit Produk' : 'Produk Baru'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-800"><X size={24}/></button>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama Produk</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-6 py-4 text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Harga</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-6 py-4 text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kategori</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-6 py-4 text-sm font-bold outline-none">
                       <option>Fashion</option><option>Wellness</option><option>Home Decor</option><option>Seni & Lukis</option><option>Aksesoris</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deskripsi</label>
                       <button 
                         onClick={handleEnhanceDescription} 
                         disabled={isEnhancing}
                         className="text-[9px] font-black text-[#ee4d2d] uppercase tracking-widest flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors"
                       >
                         {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} Gunakan AI Bli Wayan
                       </button>
                    </div>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 text-xs font-medium h-32 outline-none resize-none" />
                  </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-zinc-100 rounded-xl text-[10px] font-black uppercase tracking-widest">Batal</button>
                  <button onClick={handleSaveLocal} className="flex-[2] py-4 bg-[#ee4d2d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-100">Simpan Produk</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
