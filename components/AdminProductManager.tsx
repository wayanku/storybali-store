
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { 
  Globe, Loader2, RefreshCw, 
  Save, Plus, X, Edit, Trash2,
  Image as ImageIcon, Package, 
  Settings, Key, Search, AlertCircle,
  ToggleRight, ToggleLeft, CheckCircle,
  Sparkles, Wand2, Copy, Link as LinkIcon
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
      alert('⚠️ Gagal Terhubung ke Cloud!\n\nKemungkinan penyebab:\n1. URL Script salah atau ada spasi.\n2. Script belum di-deploy sebagai Web App.\n3. Akses Script belum disetel ke "Anyone".\n4. Browser memblokir koneksi (CORS).');
    }
  };

  const handlePush = async (productsToPush: Product[]) => {
    if (!scriptUrl) return alert('Atur URL Google Script di menu Settings!');
    setIsUpdating(true);
    const success = await updateStoreData(scriptUrl, productsToPush);
    setIsUpdating(false);
    if (success) {
      onUpdateProducts(productsToPush);
      alert('✅ Sinkronisasi Berhasil!\nLink gambar dan data produk telah dikirim ke Google Sheets.');
    } else {
      alert('❌ Sinkronisasi Gagal. Cek koneksi internet Anda.');
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
      alert('Tersimpan di memori lokal. Jangan lupa klik "Push Cloud" agar link gambar masuk ke Sheet.');
    }
  };

  const handleAddManualImage = () => {
    if (!manualImageUrl || !manualImageUrl.startsWith('http')) return alert('Masukkan URL yang valid (dimulai dengan http)');
    setFormData({
      ...formData,
      images: [...(formData.images || []), manualImageUrl.trim()]
    });
    setManualImageUrl('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link disalin!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32 px-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-100">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-[#ee4d2d] text-white p-4 rounded-2xl shadow-xl shadow-orange-100"><Package size={24} /></div>
          <div>
            <h1 className="text-xl font-bold serif text-stone-800 tracking-tight">Seller Dashboard</h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Manajemen Stok & Cloud</p>
          </div>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-2xl w-full md:w-auto">
          <button onClick={() => setActiveTab('inventory')} className={`flex-1 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-[#ee4d2d] shadow-sm' : 'text-gray-400'}`}>Inventori</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-[#ee4d2d] shadow-sm' : 'text-gray-400'}`}>Sistem</button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-6">
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-stone-900 text-white p-6 rounded-[2rem] flex flex-col justify-between h-44 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Cloud</span>
                   <div className={`w-3 h-3 rounded-full ${scriptUrl ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-500'}`} />
                </div>
                <div className="space-y-4 relative z-10">
                   <p className="text-2xl font-black">{localProducts.length} <span className="text-xs font-light opacity-60">Items</span></p>
                   <div className="flex gap-2">
                      <button onClick={handleFetch} disabled={isSyncing} className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                        {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Tarik Cloud
                      </button>
                      <button onClick={() => handlePush(localProducts)} disabled={isUpdating} className="flex-1 bg-[#ee4d2d] hover:bg-[#ff5b3d] py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                         {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Push Cloud
                      </button>
                   </div>
                </div>
             </div>
             
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between h-44">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sinkronisasi</span>
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-sm font-bold text-stone-800">Auto-Sync</p>
                      <p className="text-[10px] text-gray-400 font-medium text-xs">Simpan otomatis ke Sheets</p>
                   </div>
                   <button onClick={() => {
                      const newVal = !isAutoSync;
                      setIsAutoSync(newVal);
                      localStorage.setItem('storybali_autosync', String(newVal));
                   }} className="text-[#ee4d2d]">
                      {isAutoSync ? <ToggleRight size={48} /> : <ToggleLeft size={48} className="text-gray-200" />}
                   </button>
                </div>
                <div className="h-1 bg-stone-50 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-1000 ${isAutoSync ? 'w-full bg-green-500' : 'w-0'}`} />
                </div>
             </div>

             <button onClick={() => { setEditingProduct(null); setFormData({ name: '', price: 0, category: 'Fashion', images: [], description: '', story: '' }); setIsModalOpen(true); }} className="bg-[#ee4d2d] text-white p-6 rounded-[2rem] shadow-xl shadow-orange-100 flex flex-col items-center justify-center gap-4 hover:scale-[1.02] transition-all">
                <div className="p-4 bg-white/20 rounded-2xl"><Plus size={32} /></div>
                <span className="text-xs font-black uppercase tracking-[0.3em]">Tambah Kerajinan</span>
             </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Cari dalam inventori..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#ee4d2d]/5 transition-all"
            />
          </div>

          {/* Product List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {localProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
               <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-[#ee4d2d] transition-all group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                     <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-bold text-stone-800 truncate">{p.name}</h4>
                     <p className="text-[#ee4d2d] font-black text-sm mt-0.5">Rp {p.price.toLocaleString('id-ID')}</p>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{p.category}</span>
                        <span className="text-[8px] font-black uppercase text-gray-400">{p.images?.length || 0} Foto</span>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1">
                     <button onClick={() => { setEditingProduct(p); setFormData({ ...p }); setIsModalOpen(true); }} className="p-2.5 bg-stone-50 rounded-xl text-stone-400 hover:text-blue-500 hover:bg-blue-50 transition-all"><Edit size={16}/></button>
                     <button onClick={() => { if(confirm('Hapus item dari inventori?')) { const n = localProducts.filter(x => x.id !== p.id); setLocalProducts(n); if(isAutoSync) handlePush(n); else onUpdateProducts(n); }}} className="p-2.5 bg-stone-50 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16}/></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Globe size={24} /></div>
                 <div>
                    <h3 className="font-bold serif text-stone-800">Database Cloud</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Google Script URL</p>
                 </div>
              </div>
              <textarea 
                value={scriptUrl} 
                onChange={(e) => { setScriptUrl(e.target.value); localStorage.setItem('storybali_script_url', e.target.value); }}
                className="w-full bg-stone-50 border border-gray-100 rounded-2xl p-5 text-xs font-bold outline-none h-32 resize-none focus:border-[#ee4d2d] transition-all"
                placeholder="https://script.google.com/macros/s/..."
              />
           </div>
           
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Key size={24} /></div>
                 <div>
                    <h3 className="font-bold serif text-stone-800">Media API (ImgBB)</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">API Key untuk Upload Gambar</p>
                 </div>
              </div>
              <input 
                type="password"
                value={imgbbKey} 
                onChange={(e) => { setImgbbKey(e.target.value); localStorage.setItem('storybali_imgbb_key', e.target.value); }}
                className="w-full bg-stone-50 border border-gray-100 rounded-2xl p-5 text-xs font-bold outline-none focus:border-[#ee4d2d] transition-all"
                placeholder="Masukkan API Key ImgBB"
              />
              <p className="text-[9px] text-gray-400 italic">Link gambar akan otomatis di-hosting di ImgBB dan link-nya disimpan ke Google Sheets.</p>
           </div>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-0 md:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-6xl md:rounded-[3rem] min-h-screen md:min-h-0 flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Gallery Section */}
            <div className="w-full md:w-96 bg-stone-50 p-6 md:p-8 overflow-y-auto border-r border-gray-100 shrink-0">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-stone-400">Media Tracker</h3>
                  <button onClick={() => setIsModalOpen(false)} className="md:hidden"><X /></button>
               </div>
               
               {/* List URL and Preview */}
               <div className="space-y-4 mb-8">
                  {(formData.images || []).map((img, i) => (
                    <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100 space-y-2 group shadow-sm">
                       <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-50">
                          <img src={img} className="w-full h-full object-cover" />
                          <button onClick={() => setFormData({...formData, images: (formData.images || []).filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                       </div>
                       <div className="flex items-center gap-2">
                          <input readOnly value={img} className="flex-1 text-[8px] text-gray-400 bg-stone-50 border-none rounded-lg p-2 outline-none truncate" />
                          <button onClick={() => copyToClipboard(img)} className="p-2 text-stone-400 hover:text-[#ee4d2d]"><Copy size={14}/></button>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Add Image Actions */}
               <div className="space-y-4">
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full h-32 border-4 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-300 hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-all bg-white group">
                     {isUploading ? <Loader2 className="animate-spin text-[#ee4d2d]" /> : <ImageIcon size={32} className="group-hover:scale-110 transition-transform" />}
                     <span className="text-[9px] font-black uppercase tracking-widest mt-2">{isUploading ? 'Menghubungi ImgBB...' : 'Upload dari Perangkat'}</span>
                  </button>
                  
                  <div className="relative pt-4 border-t border-gray-200">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Atau masukkan link manual</p>
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           placeholder="https://link-gambar.com/foto.jpg"
                           value={manualImageUrl}
                           onChange={e => setManualImageUrl(e.target.value)}
                           className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-[10px] outline-none focus:border-[#ee4d2d]"
                        />
                        <button onClick={handleAddManualImage} className="bg-stone-900 text-white p-3 rounded-xl hover:bg-stone-700 transition-colors"><Plus size={16}/></button>
                     </div>
                  </div>
               </div>

               <input type="file" multiple className="hidden" ref={fileInputRef} accept="image/*" onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0 || !imgbbKey) {
                    if(!imgbbKey) alert('API Key ImgBB belum diatur!');
                    return;
                  }
                  setIsUploading(true);
                  const current = [...(formData.images || [])];
                  for (let i = 0; i < files.length; i++) {
                     const url = await uploadImageToImgBB(files[i], imgbbKey);
                     if (url) {
                       current.push(url);
                     } else {
                       alert('Gagal upload salah satu gambar.');
                     }
                  }
                  setFormData({...formData, images: current});
                  setIsUploading(false);
                  if(fileInputRef.current) fileInputRef.current.value = '';
               }} />
            </div>

            {/* Form Section */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white space-y-10">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold serif text-stone-800 tracking-tight">{editingProduct ? 'Edit Kerajinan' : 'Produk Baru'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-stone-800 transition-colors"><X size={28}/></button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Nama Produk</label>
                     <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-gray-100 rounded-xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#ee4d2d]/5" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Harga (Rp)</label>
                     <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-stone-50 border border-gray-100 rounded-xl p-4 text-sm font-black outline-none text-[#ee4d2d]" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Kategori</label>
                     <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border border-gray-100 rounded-xl p-4 text-sm font-bold outline-none appearance-none">
                        <option>Fashion</option><option>Wellness</option><option>Home Decor</option><option>Seni & Lukis</option><option>Aksesoris</option>
                     </select>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Deskripsi & Cerita</label>
                        <button 
                          onClick={async () => {
                             if (!formData.name) return alert('Isi Nama Produk untuk panduan AI!');
                             setIsEnhancing(true);
                             const desc = await getProductEnhancement(formData.name, formData.description || '');
                             setFormData({...formData, description: desc});
                             setIsEnhancing(false);
                          }}
                          className="text-[8px] font-black text-[#ee4d2d] uppercase tracking-widest flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100"
                        >
                           {isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Bli Wayan AI
                        </button>
                     </div>
                     <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-gray-100 rounded-2xl p-4 text-xs h-32 resize-none outline-none leading-relaxed" placeholder="Ceritakan filosofi produk ini..."></textarea>
                  </div>
               </div>

               <div className="flex gap-3 pt-6">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-stone-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-400">Tutup</button>
                  <button onClick={handleSaveLocal} className="flex-[2] py-4 bg-[#ee4d2d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all">Simpan Perubahan</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
