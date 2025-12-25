
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { 
  Globe, Loader2, RefreshCw, 
  Save, Plus, X, Edit, Trash2,
  Image as ImageIcon, Package, 
  Settings, Key, Search, AlertCircle,
  ToggleRight, ToggleLeft, CheckCircle,
  Sparkles, Wand2, Copy, Link as LinkIcon,
  ChevronLeft, ArrowUpRight, BarChart3,
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
      alert('⚠️ Gagal Terhubung ke Cloud!\n\nPastikan URL Script benar dan sudah di-deploy sebagai Web App ("Anyone").');
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
      {/* Admin Nav - Professional Marketplace Style */}
      <div className="bg-white p-5 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 border border-stone-100">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="bg-stone-900 text-[#ee4d2d] p-4 rounded-2xl shadow-lg"><Package size={24}/></div>
          <div>
            <h1 className="text-xl font-bold serif text-stone-900 tracking-tight">Seller Centre</h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Store Active</span>
              <span className="text-[9px] text-stone-300 font-bold uppercase tracking-widest">v2.4 Pro</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-stone-50 p-1 rounded-2xl shadow-inner flex-1 md:flex-none">
            <button onClick={() => setActiveTab('inventory')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>Inventory</button>
            <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>System</button>
          </div>
          <button onClick={() => { setEditingProduct(null); setFormData({ name: '', price: 0, category: 'Fashion', images: [], description: '', story: '' }); setIsModalOpen(true); }} className="bg-[#ee4d2d] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-orange-100 hover:scale-105 transition-all">
             <Plus size={16} strokeWidth={3}/> Add Craft
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Quick Stats Toolbar */}
          <div className="bg-white p-4 rounded-3xl border border-stone-100 flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                   <input 
                     type="text" 
                     placeholder="Cari SKU atau Nama Produk..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-stone-50 border-none rounded-2xl pl-12 pr-6 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-[#ee4d2d]/10 transition-all"
                   />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                   <button onClick={handleFetch} className="p-3 bg-stone-50 text-stone-400 rounded-xl hover:text-[#ee4d2d] transition-colors"><RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''}/></button>
                   <button onClick={() => handlePush(localProducts)} className="p-3 bg-stone-900 text-white rounded-xl hover:bg-[#ee4d2d] transition-colors shadow-lg shadow-stone-100"><Save size={16}/></button>
                </div>
             </div>
             
             <div className="flex items-center gap-6 px-4">
                <div className="text-right">
                   <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">Total Inventory</p>
                   <p className="text-sm font-black text-stone-900">{localProducts.length} Items</p>
                </div>
                <div className="h-8 w-[1px] bg-stone-100"></div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">Cloud Sync</p>
                   <p className="text-sm font-black text-emerald-500 flex items-center gap-1 justify-end"><CheckCircle size={12}/> Connected</p>
                </div>
             </div>
          </div>

          {/* Professional Table List */}
          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
             {/* Table Header */}
             <div className="hidden md:grid grid-cols-12 gap-4 bg-stone-50/50 p-5 border-b border-stone-100 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                <div className="col-span-5">Informasi Produk</div>
                <div className="col-span-2">Harga & Kategori</div>
                <div className="col-span-2">Statistik</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-2 text-right pr-4">Aksi</div>
             </div>

             {/* Table Body */}
             <div className="divide-y divide-stone-50">
                {localProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                  <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-5 items-center hover:bg-stone-50/30 transition-colors group">
                     {/* Product Cell */}
                     <div className="col-span-5 flex items-center gap-4">
                        <div className="w-16 h-16 md:w-14 md:h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-100">
                           <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-sm font-bold text-stone-900 truncate group-hover:text-[#ee4d2d] transition-colors">{p.name}</h4>
                           <p className="text-[10px] text-stone-300 font-bold tracking-widest mt-0.5">ID: {p.id}</p>
                           <div className="flex md:hidden items-center gap-2 mt-2">
                             <span className="text-[#ee4d2d] font-black text-xs">Rp {p.price.toLocaleString('id-ID')}</span>
                             <span className="text-[8px] bg-stone-100 px-2 py-0.5 rounded text-stone-400 font-black uppercase">{p.category}</span>
                           </div>
                        </div>
                     </div>

                     {/* Price & Category - Desktop */}
                     <div className="hidden md:col-span-2 md:block">
                        <p className="text-sm font-black text-[#ee4d2d]">Rp {p.price.toLocaleString('id-ID')}</p>
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-100 inline-block mt-1">
                          {p.category}
                        </span>
                     </div>

                     {/* Stats - Desktop */}
                     <div className="hidden md:col-span-2 md:block">
                        <div className="flex items-center gap-1.5 text-stone-500">
                           <BarChart3 size={12} className="text-stone-300" />
                           <span className="text-[11px] font-bold">{p.soldCount} Terjual</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-400 mt-1">
                           <Eye size={12} className="text-stone-300" />
                           <span className="text-[9px] font-black uppercase tracking-tighter">{(p.soldCount * 12.5).toFixed(0)} Views</span>
                        </div>
                     </div>

                     {/* Status - Desktop */}
                     <div className="hidden md:col-span-1 md:flex justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                     </div>

                     {/* Actions */}
                     <div className="col-span-2 flex items-center justify-end gap-2 md:pr-2">
                        <button 
                          onClick={() => { setEditingProduct(p); setFormData({ ...p }); setIsModalOpen(true); }}
                          className="p-3 md:p-2 bg-stone-50 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                           <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => { if(confirm('Hapus selamanya?')) { const n = localProducts.filter(x => x.id !== p.id); setLocalProducts(n); if(isAutoSync) handlePush(n); else onUpdateProducts(n); }}}
                          className="p-3 md:p-2 bg-stone-50 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                           <Trash2 size={16} />
                        </button>
                        <button className="hidden md:block p-2 bg-stone-50 text-stone-300 hover:text-stone-800 rounded-xl transition-all">
                           <MoreVertical size={16} />
                        </button>
                     </div>
                  </div>
                ))}
                
                {localProducts.length === 0 && (
                   <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200"><Layers size={32}/></div>
                      <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Inventory is empty. Add your first craft.</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           {/* Settings - Redesigned to match the clean marketplace vibe */}
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-8">
              <div className="flex items-center gap-5">
                 <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Globe size={28} /></div>
                 <div>
                    <h3 className="text-lg font-bold serif text-stone-900 tracking-tight">Cloud Webhook</h3>
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.3em] mt-0.5">Google Sheets Integration</p>
                 </div>
              </div>
              <div className="space-y-3">
                 <textarea 
                   value={scriptUrl} 
                   onChange={(e) => { setScriptUrl(e.target.value); localStorage.setItem('storybali_script_url', e.target.value); }}
                   className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-5 text-[10px] font-mono font-bold outline-none h-32 resize-none focus:ring-4 focus:ring-emerald-50 transition-all text-stone-500"
                   placeholder="https://script.google.com/macros/s/..."
                 />
                 <div className="p-4 bg-emerald-50/50 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-[9px] font-bold text-emerald-700 leading-relaxed uppercase tracking-widest">Pastikan script telah di-deploy dengan akses "Anyone".</p>
                 </div>
              </div>
           </div>
           
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-8">
              <div className="flex items-center gap-5">
                 <div className="p-4 bg-orange-50 text-[#ee4d2d] rounded-2xl"><Key size={28} /></div>
                 <div>
                    <h3 className="text-lg font-bold serif text-stone-900 tracking-tight">Image API</h3>
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.3em] mt-0.5">ImgBB Key Access</p>
                 </div>
              </div>
              <div className="space-y-6">
                 <input 
                   type="password"
                   value={imgbbKey} 
                   onChange={(e) => { setImgbbKey(e.target.value); localStorage.setItem('storybali_imgbb_key', e.target.value); }}
                   className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-50 transition-all text-stone-800"
                   placeholder="Enter your API Key"
                 />
                 <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">Auto-Hosting</p>
                       <p className="text-[9px] font-medium text-stone-400 mt-0.5">Gambar akan diunggah otomatis ke ImgBB</p>
                    </div>
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-stone-100 shadow-sm">
                       <ImageIcon size={16} className="text-stone-300" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Editor Modal - Already high quality but keeping for consistency */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-xl flex items-center justify-center p-0 md:p-10 overflow-y-auto">
          <div className="bg-white w-full max-w-7xl md:rounded-[4rem] min-h-screen md:min-h-0 flex flex-col md:flex-row overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-500">
            {/* Gallery Sidebar */}
            <div className="w-full md:w-[400px] bg-stone-50 p-8 md:p-12 overflow-y-auto border-r border-stone-100 shrink-0 space-y-10">
               <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-400">Media Tracker</h3>
                  <button onClick={() => setIsModalOpen(false)} className="md:hidden text-stone-400"><X /></button>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  {(formData.images || []).map((img, i) => (
                    <div key={i} className="bg-white p-3 rounded-[2rem] border border-stone-100 space-y-3 group shadow-sm relative">
                       <div className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-stone-50">
                          <img src={img} className="w-full h-full object-cover" />
                          <button onClick={() => setFormData({...formData, images: (formData.images || []).filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]"><Trash2 size={24}/></button>
                       </div>
                       <button onClick={() => { navigator.clipboard.writeText(img); alert('Copied!'); }} className="w-full py-2 bg-stone-50 rounded-xl text-[8px] font-black uppercase tracking-widest text-stone-300 truncate px-2">Copy Link</button>
                    </div>
                  ))}
                  
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="aspect-square border-4 border-dashed border-stone-200 rounded-[2rem] flex flex-col items-center justify-center text-stone-300 hover:border-[#ee4d2d] hover:text-[#ee4d2d] hover:bg-white transition-all group">
                     {isUploading ? <Loader2 className="animate-spin text-[#ee4d2d]" /> : <ImageIcon size={40} className="group-hover:scale-110 transition-transform" strokeWidth={1}/>}
                     <span className="text-[8px] font-black uppercase tracking-[0.3em] mt-4">{isUploading ? 'Uploading...' : 'New Image'}</span>
                  </button>
               </div>

               <div className="pt-10 border-t border-stone-200 space-y-4">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest text-center">Atau Manual URL</p>
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="https://..."
                        value={manualImageUrl}
                        onChange={e => setManualImageUrl(e.target.value)}
                        className="flex-1 bg-white border border-stone-100 rounded-2xl p-4 text-[10px] outline-none shadow-inner"
                     />
                     <button onClick={handleAddManualImage} className="bg-stone-900 text-white p-4 rounded-2xl hover:bg-[#ee4d2d] transition-colors"><Plus size={18}/></button>
                  </div>
               </div>

               <input type="file" multiple className="hidden" ref={fileInputRef} accept="image/*" onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  if (!imgbbKey) return alert('Atur API Key ImgBB dulu!');
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
            <div className="flex-1 p-8 md:p-16 overflow-y-auto bg-white space-y-12">
               <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-[#ee4d2d] uppercase tracking-[0.5em]">Inventory Editor</span>
                    <h3 className="text-3xl md:text-5xl font-bold serif text-stone-900 tracking-tight mt-2">{editingProduct ? 'Update Karya' : 'Karya Baru'}</h3>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-stone-200 hover:text-stone-900 transition-colors p-4"><X size={40}/></button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="col-span-1 md:col-span-2 space-y-4">
                     <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1">Title of Craft</label>
                     <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-3xl p-6 text-xl font-bold outline-none focus:ring-8 focus:ring-stone-50 transition-all" placeholder="e.g. Lukisan Siluet Ubud Premium" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1">Investment (Rp)</label>
                     <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-stone-50 border border-stone-100 rounded-3xl p-6 text-2xl font-black outline-none text-[#ee4d2d] focus:ring-8 focus:ring-orange-50 transition-all" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1">Category Group</label>
                     <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-3xl p-6 text-sm font-black outline-none appearance-none focus:ring-8 focus:ring-stone-50 transition-all uppercase tracking-widest">
                        <option>Fashion</option><option>Wellness</option><option>Home Decor</option><option>Seni & Lukis</option><option>Aksesoris</option>
                     </select>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-4">
                     <div className="flex justify-between items-center pr-4">
                        <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1">The Soul & Descriptions</label>
                        <button 
                          onClick={async () => {
                             if (!formData.name) return alert('Isi Nama dulu!');
                             setIsEnhancing(true);
                             const desc = await getProductEnhancement(formData.name, formData.description || '');
                             setFormData({...formData, description: desc});
                             setIsEnhancing(false);
                          }}
                          className="text-[9px] font-black text-[#ee4d2d] uppercase tracking-widest flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 hover:bg-[#ee4d2d] hover:text-white transition-all"
                        >
                           {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Enhance with AI
                        </button>
                     </div>
                     <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-[2.5rem] p-8 text-base h-48 resize-none outline-none leading-relaxed font-medium" placeholder="Tuliskan filosofi karya ini..."></textarea>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-4 pt-10">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-stone-100 rounded-3xl text-[11px] font-black uppercase tracking-widest text-stone-400 hover:bg-stone-200 transition-colors">Discard</button>
                  <button onClick={handleSaveLocal} className="flex-[2] py-6 bg-stone-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-stone-950/20 active:scale-95 transition-all shimmer-btn">Commit Changes</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
