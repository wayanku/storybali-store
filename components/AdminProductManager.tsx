
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { 
  Globe, Loader2, RefreshCw, 
  Save, Plus, X, Edit, Trash2,
  Image as ImageIcon, Package, 
  Settings, Key, Search,
  CheckCircle, Sparkles, ArrowRight, BarChart3,
  Layout, Wifi
} from 'lucide-react';
import { getStoreData, updateStoreData, uploadImageToImgBB } from '../services/cloudService';
import { getProductEnhancement } from '../services/geminiService';
import { GLOBAL_CONFIG } from '../constants';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  bannerUrls: string[];
  onUpdateBanners: (urls: string[]) => void;
}

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ products, onUpdateProducts, bannerUrls, onUpdateBanners }) => {
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
  const multiBannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const handleFetch = async () => {
    if (!scriptUrl) return alert('Atur URL Google Script di menu Settings!');
    setIsSyncing(true);
    const data = await getStoreData(scriptUrl);
    setIsSyncing(false);
    if (data) {
      const actualProducts = data.filter(p => p.id !== 'SETTINGS_BANNER');
      setLocalProducts(actualProducts);
      onUpdateProducts(actualProducts);
    } else {
      alert('⚠️ Gagal Terhubung ke Cloud!');
    }
  };

  const handlePush = async (productsToPush: Product[], newBannerUrls?: string[]) => {
    if (!scriptUrl) return alert('Atur URL Google Script di menu Settings!');
    setIsUpdating(true);
    
    // Siapkan data lengkap termasuk Row Pengaturan Banner agar tersinkron ke semua user
    const currentBanners = newBannerUrls || bannerUrls;
    const bannerSettingRow: Product = {
      id: 'SETTINGS_BANNER',
      name: 'System Banners',
      price: 0,
      category: 'System',
      images: ['https://via.placeholder.com/100'],
      description: JSON.stringify(currentBanners), // Simpan array banner di kolom deskripsi
      story: 'Global Banner Configuration',
      rating: 0,
      soldCount: 0
    };

    const fullPayload = [bannerSettingRow, ...productsToPush];
    const success = await updateStoreData(scriptUrl, fullPayload);
    setIsUpdating(false);
    
    if (success) {
      onUpdateProducts(productsToPush);
      if (newBannerUrls) onUpdateBanners(newBannerUrls);
      alert('✅ Sinkronisasi Global Berhasil!');
    } else {
      alert('❌ Sinkronisasi Gagal.');
    }
  };

  const handleSaveLocal = async () => {
    if (!formData.name || !formData.price) return alert('Nama dan Harga wajib diisi!');
    const cleanImages = Array.isArray(formData.images) ? formData.images.filter(img => img && img.startsWith('http')) : [];
    const productToSave = { ...formData, images: cleanImages };

    let newList: Product[];
    if (editingProduct) {
      newList = localProducts.map(p => p.id === editingProduct.id ? { ...p, ...productToSave } as Product : p);
    } else {
      newList = [{...productToSave, id: `P-${Date.now()}`} as Product, ...localProducts];
    }
    
    setLocalProducts(newList);
    setIsModalOpen(false);
    
    if (isAutoSync) {
      handlePush(newList);
    } else {
      onUpdateProducts(newList);
    }
  };

  const handleMultiBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !imgbbKey) return alert('Pilih file & pastikan API Key ada');
    setIsUploading(true);
    const current = [...bannerUrls];
    for (let i = 0; i < files.length; i++) {
       const url = await uploadImageToImgBB(files[i], imgbbKey);
       if (url) current.push(url);
    }
    
    // Update local & Push langsung ke Cloud agar user lain langsung lihat perubahannya
    onUpdateBanners(current);
    localStorage.setItem('storystore_hero_banners', JSON.stringify(current));
    handlePush(localProducts, current);
    
    setIsUploading(false);
  };

  const removeBanner = (idx: number) => {
    const newList = bannerUrls.filter((_, i) => i !== idx);
    onUpdateBanners(newList);
    localStorage.setItem('storystore_hero_banners', JSON.stringify(newList));
    handlePush(localProducts, newList);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32 px-4 md:px-6">
      <div className="bg-white p-5 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 border border-stone-100">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-stone-900 text-[#ee4d2d] p-4 rounded-2xl shadow-lg"><Package size={20}/></div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">Seller Center</h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">System Live</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-stone-50 p-1.5 rounded-2xl shadow-inner flex-1 md:flex-none">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>Inventory</button>
            <button onClick={() => setActiveTab('settings')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>System</button>
          </div>
          <button onClick={() => { setEditingProduct(null); setFormData({ name: '', price: 0, category: 'Fashion', images: [], description: '', story: '' }); setIsModalOpen(true); }} className="bg-[#ee4d2d] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all">
             <Plus size={16} strokeWidth={3}/> New
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-3 w-full md:flex-1">
                <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                   <input type="text" placeholder="Search inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-stone-50 border-none rounded-2xl pl-12 pr-6 py-3 text-xs font-bold outline-none" />
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={handleFetch} className="p-3 bg-stone-50 text-stone-400 rounded-xl hover:text-[#ee4d2d] transition-colors"><RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''}/></button>
                   <button onClick={() => handlePush(localProducts)} className="p-3 bg-stone-900 text-white rounded-xl hover:bg-[#ee4d2d] shadow-lg flex items-center gap-2 px-6">
                      {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14}/>}
                      <span className="text-[10px] font-black uppercase tracking-widest">Update Cloud</span>
                   </button>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             {localProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
               <div key={p.id} className="bg-white p-4 rounded-[1.8rem] border border-stone-100 shadow-sm flex items-center gap-4 group">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 bg-stone-50 border border-stone-100">
                     <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                     <h4 className="text-sm font-bold text-stone-900 truncate">{p.name}</h4>
                     <p className="text-[#ee4d2d] font-black text-[11px] md:text-sm">Rp {p.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => { setEditingProduct(p); setFormData({ ...p }); setIsModalOpen(true); }} className="p-3 bg-stone-50 text-stone-400 hover:text-[#ee4d2d] rounded-xl transition-all"><Edit size={16} /></button>
                     <button onClick={() => { if(confirm('Delete?')) { const n = localProducts.filter(x => x.id !== p.id); setLocalProducts(n); if(isAutoSync) handlePush(n); else onUpdateProducts(n); }}} className="p-3 bg-stone-50 text-stone-200 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-orange-50 text-[#ee4d2d] rounded-2xl"><Layout size={28} /></div>
                 <div>
                    <h3 className="text-xl font-bold text-stone-900 tracking-tight">Global Banner Cloud Sync</h3>
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                       <Wifi size={10} className="text-emerald-500 animate-pulse" /> Setiap perubahan banner akan otomatis muncul di semua layar pengguna.
                    </p>
                 </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {bannerUrls.map((url, i) => (
                    <div key={i} className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-100 border border-stone-100 group shadow-sm">
                       <img src={url} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-red-600/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => removeBanner(i)} className="p-3 rounded-full hover:bg-white hover:text-red-600 transition-all shadow-lg"><Trash2 size={20}/></button>
                       </div>
                    </div>
                 ))}
                 <button onClick={() => multiBannerInputRef.current?.click()} disabled={isUploading} className="aspect-[16/9] border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-300 hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-all bg-stone-50">
                    {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Plus size={32} />}
                    <span className="text-[9px] font-black uppercase mt-2 tracking-widest">Add Global Banner</span>
                 </button>
              </div>
              <input type="file" multiple className="hidden" ref={multiBannerInputRef} accept="image/*" onChange={handleMultiBannerUpload} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-4">
                 <h3 className="text-sm font-black uppercase tracking-widest text-stone-400">Cloud Sync URL</h3>
                 <input type="text" value={scriptUrl} onChange={e => { setScriptUrl(e.target.value); localStorage.setItem('storybali_script_url', e.target.value); }} className="w-full bg-stone-50 border border-stone-100 rounded-xl p-5 text-[9px] font-mono outline-none" />
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-4">
                 <h3 className="text-sm font-black uppercase tracking-widest text-stone-400">ImgBB API Key</h3>
                 <input type="password" value={imgbbKey} onChange={e => { setImgbbKey(e.target.value); localStorage.setItem('storybali_imgbb_key', e.target.value); }} className="w-full bg-stone-50 border border-stone-100 rounded-xl p-5 text-[10px] outline-none" />
              </div>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-950/80 md:backdrop-blur-xl flex items-center justify-center">
          <div className="bg-white w-full max-w-6xl md:rounded-[2.5rem] h-full md:h-[90vh] flex flex-col lg:flex-row overflow-hidden animate-in fade-in zoom-in-95">
            <div className="w-full lg:w-96 bg-stone-50 p-6 overflow-y-auto max-h-[30vh] lg:max-h-full border-r border-stone-100">
               <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase text-stone-400">Gallery</span>
                  <button onClick={() => setIsModalOpen(false)} className="lg:hidden p-2"><X size={20}/></button>
               </div>
               <div className="grid grid-cols-4 lg:grid-cols-2 gap-3 mb-8">
                  {(formData.images || []).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-100 bg-white group shadow-sm">
                       <img src={img} className="w-full h-full object-cover" />
                       <button onClick={() => setFormData({...formData, images: (formData.images || []).filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-red-600/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-300 hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-all bg-white">
                     {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={24} />}
                  </button>
               </div>
               <input type="file" multiple className="hidden" ref={fileInputRef} accept="image/*" onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0 || !imgbbKey) return alert('Pilih file & pastikan API Key ada');
                  setIsUploading(true);
                  const current = [...(formData.images || [])];
                  for (let i = 0; i < files.length; i++) {
                     const url = await uploadImageToImgBB(files[i], imgbbKey);
                     if (url) current.push(url);
                  }
                  setFormData({...formData, images: current});
                  setIsUploading(false);
               }} />
            </div>

            <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-white flex flex-col relative">
               <div className="mb-10">
                  <span className="text-[10px] font-black text-[#ee4d2d] uppercase tracking-[0.4em]">Product Editor</span>
                  <h3 className="text-2xl md:text-4xl font-bold text-stone-900 mt-2">{editingProduct ? 'Update Inventory' : 'New Product'}</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  <div className="col-span-1 md:col-span-2 space-y-3">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Name</label>
                     <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-5 text-base md:text-xl font-bold outline-none" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Price</label>
                     <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-5 text-lg font-black text-[#ee4d2d]" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Category</label>
                     <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-5 text-[11px] font-black uppercase tracking-widest outline-none">
                        <option>Elektronik</option><option>Komputer</option><option>Fashion</option><option>Wellness</option><option>Audio</option><option>Home Decor</option>
                     </select>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-3">
                     <div className="flex justify-between items-center px-1"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Details</label><button onClick={async () => { if (!formData.name) return alert('Name first!'); setIsEnhancing(true); const desc = await getProductEnhancement(formData.name, formData.description || ''); setFormData({...formData, description: desc}); setIsEnhancing(false); }} className="text-[9px] font-black text-[#ee4d2d] uppercase tracking-widest flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full hover:bg-stone-900 hover:text-white transition-all">{isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI Optimize</button></div>
                     <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-[2rem] p-6 text-sm h-40 resize-none outline-none leading-relaxed" placeholder="Product details..."></textarea>
                  </div>
               </div>
               <div className="flex flex-col sm:flex-row gap-4 mt-12 pb-6 md:pb-0">
                  <button onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 py-5 bg-stone-100 rounded-2xl text-xs font-black uppercase tracking-widest text-stone-400">Cancel</button>
                  <button onClick={handleSaveLocal} className="order-1 sm:order-2 flex-[2] py-5 bg-stone-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Save Changes</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
