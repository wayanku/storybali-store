
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { 
  Globe, Loader2, RefreshCw, 
  Save, Plus, X, Edit, Trash2,
  Image as ImageIcon, Package, 
  Settings, Key, Search, AlertCircle,
  CheckCircle, Sparkles, ArrowRight, BarChart3,
  MoreVertical, Eye, Layers
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
  const [manualImageUrl, setManualImageUrl] = useState('');
  
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
      alert('⚠️ Gagal Terhubung ke Cloud!');
    }
  };

  const handlePush = async (productsToPush: Product[]) => {
    if (!scriptUrl) return alert('Atur URL Google Script di menu Settings!');
    setIsUpdating(true);
    const success = await updateStoreData(scriptUrl, productsToPush);
    setIsUpdating(false);
    if (success) {
      onUpdateProducts(productsToPush);
      alert('✅ Sinkronisasi Berhasil!');
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

  const handleAddManualImage = () => {
    if (!manualImageUrl || !manualImageUrl.startsWith('http')) return alert('Link tidak valid.');
    setFormData({
      ...formData,
      images: [...(formData.images || []), manualImageUrl.trim()]
    });
    setManualImageUrl('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32 px-4 md:px-6">
      {/* Header Seller Centre */}
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 border border-stone-100">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-stone-900 text-[#ee4d2d] p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg"><Package size={20}/></div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-stone-900 tracking-tight">Seller Centre</h1>
            <div className="flex items-center gap-2">
              <span className="text-[8px] md:text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Store Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-stone-50 p-1 rounded-xl md:rounded-2xl shadow-inner flex-1 md:flex-none">
            <button onClick={() => setActiveTab('inventory')} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>Inventory</button>
            <button onClick={() => setActiveTab('settings')} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>System</button>
          </div>
          <button onClick={() => { setEditingProduct(null); setFormData({ name: '', price: 0, category: 'Fashion', images: [], description: '', story: '' }); setIsModalOpen(true); }} className="bg-[#ee4d2d] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-orange-100 hover:scale-105 transition-all">
             <Plus size={16} strokeWidth={3}/> Add Product
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4 md:space-y-6">
          {/* Quick Stats Toolbar */}
          <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-3 w-full md:flex-1">
                <div className="relative flex-1">
                   <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                   <input 
                     type="text" 
                     placeholder="Cari produk..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-stone-50 border-none rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 md:pr-6 py-2 md:py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-[#ee4d2d]/10 transition-all"
                   />
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={handleFetch} className="p-2 md:p-3 bg-stone-50 text-stone-400 rounded-xl hover:text-[#ee4d2d] transition-colors"><RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''}/></button>
                   <button onClick={() => handlePush(localProducts)} className="p-2 md:p-3 bg-stone-900 text-white rounded-xl hover:bg-[#ee4d2d] transition-colors shadow-lg"><Save size={14}/></button>
                </div>
             </div>
             
             <div className="hidden md:flex items-center gap-6 px-4">
                <div className="text-right">
                   <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">Inventory</p>
                   <p className="text-sm font-black text-stone-900">{localProducts.length} Items</p>
                </div>
                <div className="h-8 w-[1px] bg-stone-100"></div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">Cloud</p>
                   <p className="text-sm font-black text-emerald-500 flex items-center gap-1 justify-end"><CheckCircle size={12}/> Sync</p>
                </div>
             </div>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
             {/* Desktop Header */}
             <div className="hidden md:grid grid-cols-12 gap-4 bg-stone-50/50 p-5 border-b border-stone-100 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                <div className="col-span-5">Informasi Produk</div>
                <div className="col-span-2">Harga & Kategori</div>
                <div className="col-span-2">Statistik</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-2 text-right pr-4">Aksi</div>
             </div>

             {/* Items */}
             <div className="divide-y divide-stone-50">
                {localProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                  <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-5 items-center hover:bg-stone-50/30 transition-colors group">
                     {/* Product Cell */}
                     <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                        <div className="w-14 h-14 md:w-14 md:h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-100">
                           <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <h4 className="text-sm font-bold text-stone-900 truncate group-hover:text-[#ee4d2d] transition-colors">{p.name}</h4>
                           <p className="text-[9px] text-stone-300 font-bold tracking-widest mt-0.5">ID: {p.id}</p>
                           {/* Mobile Only Info */}
                           <div className="flex md:hidden items-center gap-2 mt-1">
                             <span className="text-[#ee4d2d] font-black text-xs">Rp {p.price.toLocaleString('id-ID')}</span>
                             <span className="text-[8px] bg-stone-100 px-2 py-0.5 rounded text-stone-400 font-black uppercase">{p.category}</span>
                           </div>
                        </div>
                     </div>

                     <div className="hidden md:col-span-2 md:block">
                        <p className="text-sm font-black text-[#ee4d2d]">Rp {p.price.toLocaleString('id-ID')}</p>
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">{p.category}</span>
                     </div>

                     <div className="hidden md:col-span-2 md:block">
                        <div className="flex items-center gap-1.5 text-stone-500">
                           <BarChart3 size={12} className="text-stone-300" />
                           <span className="text-[11px] font-bold">{p.soldCount} Sold</span>
                        </div>
                     </div>

                     <div className="hidden md:col-span-1 md:flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                     </div>

                     {/* Actions */}
                     <div className="flex items-center justify-end gap-2 md:col-span-2">
                        <button 
                          onClick={() => { setEditingProduct(p); setFormData({ ...p }); setIsModalOpen(true); }}
                          className="flex-1 md:flex-none p-2 md:p-2 bg-stone-50 text-stone-400 hover:text-[#ee4d2d] hover:bg-orange-50 rounded-lg md:rounded-xl transition-all flex justify-center items-center gap-2"
                        >
                           <Edit size={14} /> <span className="md:hidden text-[10px] font-bold uppercase">Edit</span>
                        </button>
                        <button 
                          onClick={() => { if(confirm('Hapus selamanya?')) { const n = localProducts.filter(x => x.id !== p.id); setLocalProducts(n); if(isAutoSync) handlePush(n); else onUpdateProducts(n); }}}
                          className="flex-1 md:flex-none p-2 md:p-2 bg-stone-50 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg md:rounded-xl transition-all flex justify-center items-center gap-2"
                        >
                           <Trash2 size={14} /> <span className="md:hidden text-[10px] font-bold uppercase">Hapus</span>
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
           <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-stone-100 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Globe size={24} /></div>
                 <div>
                    <h3 className="text-base font-bold text-stone-900 tracking-tight">Cloud Connection</h3>
                    <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest mt-0.5">Google Sheets Integration</p>
                 </div>
              </div>
              <textarea 
                value={scriptUrl} 
                onChange={(e) => { setScriptUrl(e.target.value); localStorage.setItem('storybali_script_url', e.target.value); }}
                className="w-full bg-stone-50 border border-stone-100 rounded-xl p-4 text-[9px] font-mono font-bold outline-none h-24 resize-none focus:ring-4 focus:ring-emerald-50 transition-all"
                placeholder="https://script.google.com/macros/s/..."
              />
           </div>
           
           <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-stone-100 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-orange-50 text-[#ee4d2d] rounded-xl"><Key size={24} /></div>
                 <div>
                    <h3 className="text-base font-bold text-stone-900 tracking-tight">Hosting Gambar</h3>
                    <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest mt-0.5">ImgBB API Access</p>
                 </div>
              </div>
              <input 
                type="password"
                value={imgbbKey} 
                onChange={(e) => { setImgbbKey(e.target.value); localStorage.setItem('storybali_imgbb_key', e.target.value); }}
                className="w-full bg-stone-50 border border-stone-100 rounded-xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-orange-50 transition-all"
                placeholder="Enter API Key"
              />
           </div>
        </div>
      )}

      {/* Editor Modal - Optimized for Mobile & Desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-950/80 md:backdrop-blur-xl flex items-center justify-center p-0 md:p-6 lg:p-10">
          <div className="bg-white w-full max-w-6xl md:rounded-3xl h-full md:h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            
            {/* Gallery Sidebar */}
            <div className="w-full lg:w-80 bg-stone-50 p-6 md:p-8 overflow-y-auto border-b lg:border-b-0 lg:border-r border-stone-100 shrink-0">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Media Manager</h3>
                  <button onClick={() => setIsModalOpen(false)} className="lg:hidden text-stone-400"><X size={20}/></button>
               </div>
               
               <div className="grid grid-cols-3 lg:grid-cols-2 gap-3 mb-8">
                  {(formData.images || []).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group bg-white">
                       <img src={img} className="w-full h-full object-cover" />
                       <button onClick={() => setFormData({...formData, images: (formData.images || []).filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-red-600/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="aspect-square border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-300 hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-all bg-white">
                     {isUploading ? <Loader2 className="animate-spin text-[#ee4d2d]" size={20} /> : <ImageIcon size={24} />}
                     <span className="text-[8px] font-black uppercase mt-2">{isUploading ? '...' : 'Upload'}</span>
                  </button>
               </div>

               <div className="space-y-3">
                  <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Atau Link Gambar</label>
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="https://..."
                        value={manualImageUrl}
                        onChange={e => setManualImageUrl(e.target.value)}
                        className="flex-1 bg-white border border-stone-200 rounded-lg p-2 text-[10px] outline-none"
                     />
                     <button onClick={handleAddManualImage} className="bg-stone-900 text-white p-2 rounded-lg"><Plus size={16}/></button>
                  </div>
               </div>

               <input type="file" multiple className="hidden" ref={fileInputRef} accept="image/*" onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  if (!imgbbKey) return alert('Atur API Key ImgBB!');
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

            {/* Form Section */}
            <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto bg-white flex flex-col">
               <div className="flex justify-between items-start mb-8 md:mb-12">
                  <div>
                    <span className="text-[9px] font-black text-[#ee4d2d] uppercase tracking-[0.3em]">Editor Produk</span>
                    <h3 className="text-xl md:text-3xl font-bold text-stone-900 mt-1">{editingProduct ? 'Update Produk' : 'Produk Baru'}</h3>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="hidden lg:block text-stone-200 hover:text-stone-900 transition-colors"><X size={32}/></button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1">
                  <div className="col-span-1 md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nama Produk</label>
                     <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-xl p-4 md:p-5 text-sm md:text-lg font-bold outline-none focus:ring-4 focus:ring-stone-50 transition-all" placeholder="Contoh: iPhone 15 Pro Max" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                     <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-stone-50 border border-stone-100 rounded-xl p-4 md:p-5 text-sm md:text-lg font-black outline-none text-[#ee4d2d]" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Kategori</label>
                     <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-xl p-4 md:p-5 text-xs md:text-sm font-black outline-none appearance-none uppercase tracking-widest">
                        <option>Elektronik</option><option>Komputer</option><option>Fashion</option><option>Wellness</option><option>Audio</option><option>Home Decor</option>
                     </select>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                     <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Deskripsi Produk</label>
                        <button 
                          onClick={async () => {
                             if (!formData.name) return alert('Isi Nama dulu!');
                             setIsEnhancing(true);
                             const desc = await getProductEnhancement(formData.name, formData.description || '');
                             setFormData({...formData, description: desc});
                             setIsEnhancing(false);
                          }}
                          className="text-[8px] md:text-[9px] font-black text-[#ee4d2d] uppercase tracking-widest flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-[#ee4d2d] hover:text-white transition-all"
                        >
                           {isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Optimize AI
                        </button>
                     </div>
                     <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 md:p-6 text-sm h-32 md:h-40 resize-none outline-none leading-relaxed font-medium" placeholder="Tuliskan spesifikasi produk..."></textarea>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-3 mt-10">
                  <button onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 py-4 bg-stone-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-400 hover:bg-stone-200 transition-colors">Batal</button>
                  <button onClick={handleSaveLocal} className="order-1 sm:order-2 flex-[2] py-4 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Simpan Produk</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
