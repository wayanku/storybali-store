
import React, { useState, useRef, useEffect } from 'react';
import { Product, CategoryConfig } from '../types';
import { 
  Globe, Loader2, RefreshCw, 
  Save, Plus, X, Edit, Trash2,
  Image as ImageIcon, Package, 
  Settings, Key, Search,
  CheckCircle, Sparkles, ArrowRight, BarChart3,
  Layout, Wifi, Eye, EyeOff, Grid
} from 'lucide-react';
import { getStoreData, updateStoreData, uploadImageToImgBB } from '../services/cloudService';
import { getProductEnhancement } from '../services/geminiService';
import { GLOBAL_CONFIG } from '../constants';
import { renderCategoryIcon } from '../App';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  bannerUrls: string[];
  onUpdateBanners: (urls: string[]) => void;
  categories: CategoryConfig[];
  onUpdateCategories: (cats: CategoryConfig[]) => void;
}

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ 
  products, onUpdateProducts, bannerUrls, onUpdateBanners, categories, onUpdateCategories 
}) => {
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL);
  const [imgbbKey, setImgbbKey] = useState(localStorage.getItem('storybali_imgbb_key') || GLOBAL_CONFIG.MASTER_IMGBB_KEY);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'system'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');

  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({ images: [] });
  
  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Grid');

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
      const actualProducts = data.filter(p => !['SETTINGS_BANNER', 'SETTINGS_CATEGORIES'].includes(p.id));
      setLocalProducts(actualProducts);
      onUpdateProducts(actualProducts);
      
      const catSetting = data.find(p => p.id === 'SETTINGS_CATEGORIES');
      if (catSetting && catSetting.description) {
        onUpdateCategories(JSON.parse(catSetting.description));
      }
    }
  };

  const handlePushAll = async (targetProducts = localProducts, targetBanners = bannerUrls, targetCats = categories) => {
    if (!scriptUrl) return alert('Atur URL!');
    setIsUpdating(true);
    
    const bannerRow: Product = {
      id: 'SETTINGS_BANNER', name: 'Banners', price: 0, category: 'System', images: [], story: '', rating: 0, soldCount: 0,
      description: JSON.stringify(targetBanners)
    };

    const categoryRow: Product = {
      id: 'SETTINGS_CATEGORIES', name: 'Categories', price: 0, category: 'System', images: [], story: '', rating: 0, soldCount: 0,
      description: JSON.stringify(targetCats)
    };

    const fullPayload = [bannerRow, categoryRow, ...targetProducts];
    const success = await updateStoreData(scriptUrl, fullPayload);
    setIsUpdating(false);
    if (success) {
      onUpdateProducts(targetProducts);
      onUpdateBanners(targetBanners);
      onUpdateCategories(targetCats);
      alert('✅ Cloud Sync Success!');
    }
  };

  const handleAddCategory = () => {
    if (!newCatName) return;
    const newCat: CategoryConfig = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      icon: newCatIcon,
      visible: true
    };
    const updated = [...categories, newCat];
    onUpdateCategories(updated);
    setNewCatName('');
    handlePushAll(localProducts, bannerUrls, updated);
  };

  const toggleCatVisibility = (id: string) => {
    const updated = categories.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
    onUpdateCategories(updated);
    handlePushAll(localProducts, bannerUrls, updated);
  };

  const deleteCategory = (id: string) => {
    if (!confirm('Hapus kategori? Produk dengan kategori ini tidak akan terhapus.')) return;
    const updated = categories.filter(c => c.id !== id);
    onUpdateCategories(updated);
    handlePushAll(localProducts, bannerUrls, updated);
  };

  const handleSaveLocal = async () => {
    if (!formData.name || !formData.price) return alert('Nama dan Harga wajib!');
    const productToSave = { ...formData, images: (formData.images || []).filter(img => img.startsWith('http')) };
    let newList: Product[];
    if (editingProduct) {
      newList = localProducts.map(p => p.id === editingProduct.id ? { ...p, ...productToSave } as Product : p);
    } else {
      newList = [{...productToSave, id: `P-${Date.now()}`} as Product, ...localProducts];
    }
    setLocalProducts(newList);
    setIsModalOpen(false);
    handlePushAll(newList);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32 px-4 md:px-6">
      <div className="bg-white p-5 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 border border-stone-100">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-stone-900 text-[#ee4d2d] p-4 rounded-2xl"><Package size={20}/></div>
          <h1 className="text-xl font-bold text-stone-900">Seller Center</h1>
        </div>
        <div className="flex bg-stone-50 p-1.5 rounded-2xl">
          <button onClick={() => setActiveTab('inventory')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'inventory' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>Inventory</button>
          <button onClick={() => setActiveTab('system')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'system' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>System</button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-stone-100 flex items-center justify-between gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                <input type="text" placeholder="Cari di gudang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-stone-50 rounded-2xl pl-12 pr-6 py-3 text-xs outline-none" />
             </div>
             <div className="flex gap-2">
                <button onClick={handleFetch} className="p-3 bg-stone-50 text-stone-400 rounded-xl"><RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''}/></button>
                <button onClick={() => { setEditingProduct(null); setFormData({ name: '', price: 0, category: categories[0]?.name || 'Fashion', images: [], description: '', story: '' }); setIsModalOpen(true); }} className="bg-[#ee4d2d] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Plus size={16}/> New
                </button>
             </div>
          </div>
          <div className="space-y-3">
             {localProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
               <div key={p.id} className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50"><img src={p.images?.[0]} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0"><h4 className="text-sm font-bold truncate">{p.name}</h4><p className="text-[#ee4d2d] font-black text-xs">Rp {p.price.toLocaleString('id-ID')}</p></div>
                  <div className="flex gap-2">
                     <button onClick={() => { setEditingProduct(p); setFormData({ ...p }); setIsModalOpen(true); }} className="p-3 text-stone-400 hover:text-[#ee4d2d]"><Edit size={16} /></button>
                     <button onClick={() => { if(confirm('Hapus?')) { const n = localProducts.filter(x => x.id !== p.id); setLocalProducts(n); handlePushAll(n); }}} className="p-3 text-stone-200 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Dynamic Category Manager */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold">Category Management</h3>
                 <Grid className="text-stone-200" size={32} />
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                 {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 group">
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${cat.visible ? 'bg-white text-stone-900' : 'bg-stone-200 text-stone-400'}`}>
                             {renderCategoryIcon(cat.icon, 18)}
                          </div>
                          <div>
                             <p className={`text-sm font-bold ${!cat.visible && 'text-stone-400'}`}>{cat.name}</p>
                             <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{cat.icon}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <button onClick={() => toggleCatVisibility(cat.id)} className={`p-2 rounded-lg transition-all ${cat.visible ? 'text-emerald-500 hover:bg-emerald-50' : 'text-stone-300 hover:bg-stone-100'}`}>
                             {cat.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button onClick={() => deleteCategory(cat.id)} className="p-2 text-stone-200 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="pt-6 border-t border-stone-50 space-y-4">
                 <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Add New Category</p>
                 <div className="flex gap-3">
                    <input type="text" placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                    <select value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase outline-none">
                       {['Smartphone','Laptop','User','Zap','Watch','Headphones','Home','Utensils','Gamepad','Heart','Camera','Coffee','Gift'].map(ic => <option key={ic}>{ic}</option>)}
                    </select>
                    <button onClick={handleAddCategory} className="bg-stone-900 text-white p-3 rounded-xl hover:bg-[#ee4d2d] transition-all"><Plus size={20}/></button>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 space-y-6">
                 <h3 className="text-xl font-bold">Banner Management</h3>
                 <div className="flex overflow-x-auto gap-4 no-scrollbar">
                    {bannerUrls.map((url, i) => (
                       <div key={i} className="relative min-w-[120px] aspect-video rounded-xl overflow-hidden group">
                          <img src={url} className="w-full h-full object-cover" />
                          <button onClick={() => { const n = bannerUrls.filter((_, idx) => idx !== i); handlePushAll(localProducts, n); }} className="absolute inset-0 bg-red-600/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                       </div>
                    ))}
                    <button onClick={() => multiBannerInputRef.current?.click()} className="min-w-[120px] aspect-video border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center text-stone-300 hover:text-[#ee4d2d]"><Plus/></button>
                 </div>
                 <input type="file" multiple ref={multiBannerInputRef} className="hidden" onChange={async (e) => {
                    const files = e.target.files; if(!files || !imgbbKey) return;
                    setIsUploading(true);
                    const cur = [...bannerUrls];
                    for(let i=0; i<files.length; i++){
                       const u = await uploadImageToImgBB(files[i], imgbbKey);
                       if(u) cur.push(u);
                    }
                    handlePushAll(localProducts, cur);
                    setIsUploading(false);
                 }} />
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 space-y-4">
                 <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Global Sync</h3>
                 <button onClick={() => handlePushAll()} className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                    {isUpdating ? <Loader2 className="animate-spin" size={16}/> : <Wifi size={16}/>} Force Cloud Sync
                 </button>
              </div>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-950/80 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto p-12 relative animate-in zoom-in-95">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-stone-300 hover:text-stone-900"><X size={24}/></button>
             <h3 className="text-3xl font-bold mb-10">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="space-y-2"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Product Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-xl p-5 text-sm font-bold" /></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Price (IDR)</label><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-stone-50 border border-stone-100 rounded-xl p-5 text-sm font-bold text-[#ee4d2d]" /></div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-xl p-5 text-sm font-bold outline-none">
                         {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Images</label>
                      <div className="flex flex-wrap gap-2">
                         {formData.images?.map((img, i) => <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-stone-100"><img src={img} className="w-full h-full object-cover"/></div>)}
                         <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-lg border-2 border-dashed border-stone-200 flex items-center justify-center text-stone-300"><Plus/></button>
                      </div>
                      <input type="file" multiple ref={fileInputRef} className="hidden" onChange={async (e) => {
                         const files = e.target.files; if(!files || !imgbbKey) return;
                         setIsUploading(true);
                         const cur = [...(formData.images || [])];
                         for(let i=0; i<files.length; i++){
                            const u = await uploadImageToImgBB(files[i], imgbbKey); if(u) cur.push(u);
                         }
                         setFormData({...formData, images: cur});
                         setIsUploading(false);
                      }} />
                   </div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-xl p-5 text-sm h-32 resize-none"></textarea></div>
                </div>
             </div>
             <button onClick={handleSaveLocal} className="w-full mt-10 bg-stone-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl">Save Product</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
