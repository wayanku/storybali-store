
import React, { useState, useRef, useEffect } from 'react';
import { Product, CategoryConfig, Order, OrderStatus } from '../types';
import { 
  Globe, Loader2, RefreshCw, 
  Save, Plus, X, Edit, Trash2,
  Package, Search, Settings, 
  Truck, Calendar, CloudUpload, CloudDownload, Copy, ExternalLink, Image as ImageIcon, Key
} from 'lucide-react';
import { getStoreData, updateStoreData, uploadImageToImgBB, updateOrderStatusInCloud } from '../services/cloudService';
import { GLOBAL_CONFIG } from '../constants';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  bannerUrls: string[];
  onUpdateBanners: (urls: string[]) => void;
  categories: CategoryConfig[];
  onUpdateCategories: (cats: CategoryConfig[]) => void;
  onRefreshProducts: () => Promise<void>;
}

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ 
  products, onUpdateProducts, bannerUrls, onUpdateBanners, categories, onUpdateCategories, onRefreshProducts
}) => {
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL);
  const [imgbbKey, setImgbbKey] = useState(localStorage.getItem('storybali_imgbb_key') || GLOBAL_CONFIG.MASTER_IMGBB_KEY);
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'system'>('inventory');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({ images: [] });
  
  const [newBanner, setNewBanner] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOrders = async () => {
    setIsSyncing(true);
    try {
      const data = await getStoreData(scriptUrl, "Orders");
      if (data) setOrders(data.reverse());
    } catch (e) { console.error(e); }
    finally { setIsSyncing(false); }
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const saveSystemConfig = () => {
    localStorage.setItem('storybali_script_url', scriptUrl);
    localStorage.setItem('storybali_imgbb_key', imgbbKey);
    localStorage.setItem('storybali_banners', JSON.stringify(bannerUrls));
    alert('Konfigurasi Toko Disimpan!');
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);
    const success = await updateOrderStatusInCloud(scriptUrl, orderId, newStatus);
    if (success) {
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    }
    setIsUpdating(false);
  };

  const handlePushProducts = async (targetProducts = products) => {
    setIsUpdating(true);
    const success = await updateStoreData(scriptUrl, targetProducts);
    setIsUpdating(false);
    if (success) alert('Stok Berhasil Disinkronkan ke Cloud!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32 px-4 animate-in fade-in slide-in-from-bottom-6">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 border border-stone-100">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="bg-stone-950 text-[#ee4d2d] p-5 rounded-3xl shadow-lg transform -rotate-3"><Package size={24}/></div>
          <div>
            <h1 className="text-2xl font-black italic text-stone-900">Seller Hub.</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Database Connection: {scriptUrl.includes('macros') ? 'LIVE' : 'DEFAULT'}</p>
          </div>
        </div>
        <div className="flex bg-stone-50 p-2 rounded-3xl overflow-x-auto no-scrollbar w-full md:w-auto border border-stone-100 shadow-inner">
          <button onClick={() => setActiveTab('inventory')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300 hover:text-stone-500'}`}>Inventory</button>
          <button onClick={() => setActiveTab('orders')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300 hover:text-stone-500'}`}>Orders</button>
          <button onClick={() => setActiveTab('system')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300 hover:text-stone-500'}`}>System</button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-stone-100 flex flex-wrap items-center justify-between gap-4 shadow-sm">
             <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input type="text" placeholder="Cari nama produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-stone-50 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold outline-none border border-transparent focus:bg-white focus:border-stone-100 transition-all" />
             </div>
             <div className="flex items-center gap-3">
                <button onClick={onRefreshProducts} className="p-4 bg-stone-50 text-stone-600 rounded-2xl hover:bg-stone-100 transition-all">
                   {isSyncing ? <Loader2 size={20} className="animate-spin"/> : <CloudDownload size={20}/>}
                </button>
                <button onClick={() => { setEditingProduct(null); setFormData({ name: '', price: 0, category: 'Fashion', images: [], description: '' }); setIsModalOpen(true); }} className="bg-stone-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#ee4d2d] transition-all shadow-xl shadow-orange-900/10"><Plus size={18}/> New Product</button>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-stone-100 flex flex-col gap-4 group hover:border-[#ee4d2d]/30 transition-all shadow-sm">
                <div className="aspect-square rounded-3xl overflow-hidden bg-stone-50 relative">
                   <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <button onClick={() => { setEditingProduct(p); setFormData({ ...p }); setIsModalOpen(true); }} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-stone-900 shadow-lg hover:bg-[#ee4d2d] hover:text-white transition-all"><Edit size={16} /></button>
                      <button onClick={() => { if(confirm('Hapus produk ini dari database?')) { const n = products.filter(x => x.id !== p.id); onUpdateProducts(n); handlePushProducts(n); }}} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-stone-300 hover:text-red-500 shadow-lg transition-all"><Trash2 size={16} /></button>
                   </div>
                </div>
                <div className="px-2">
                   <p className="text-[9px] font-black uppercase text-stone-300 mb-1">{p.category}</p>
                   <h4 className="text-sm font-bold truncate text-stone-800">{p.name}</h4>
                   <p className="text-[#ee4d2d] font-black text-sm mt-1">Rp {p.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black italic">Incoming Orders</h2>
            <button onClick={fetchOrders} className="p-3 bg-white rounded-2xl border border-stone-100 hover:bg-stone-50 transition-all shadow-sm">
               <RefreshCw size={20} className={isSyncing ? 'animate-spin text-[#ee4d2d]' : 'text-stone-400'}/></button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {orders.length === 0 ? (
              <div className="p-32 text-center bg-white rounded-[3rem] border border-stone-100 text-stone-300 italic flex flex-col items-center gap-4">
                 <Truck size={60} className="opacity-10"/>
                 <p className="font-bold uppercase tracking-widest text-[10px]">No orders found in database</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.orderId} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col md:flex-row justify-between gap-8 group hover:border-[#ee4d2d]/20 transition-all">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-4">
                      <span className="bg-orange-50 text-[#ee4d2d] px-4 py-1.5 rounded-full text-xs font-black tracking-tight flex items-center gap-2">
                        {order.orderId}
                        <button onClick={() => { navigator.clipboard.writeText(order.orderId); alert('ID Disalin'); }} className="hover:scale-125 transition-transform"><Copy size={12}/></button>
                      </span>
                      <span className="text-base font-black text-stone-900">{order.customerName}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-stone-300">Detail Paket</p>
                          <p className="text-xs text-stone-600 leading-relaxed font-medium">{order.items}</p>
                       </div>
                       <div className="space-y-1 text-right md:text-left">
                          <p className="text-[9px] font-black uppercase text-stone-300">Tujuan Kirim</p>
                          <p className="text-xs text-stone-600 leading-relaxed font-medium">{order.address}</p>
                       </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-stone-50 mt-4">
                      <div className="flex items-center gap-2 text-stone-400">
                        <Calendar size={14}/>
                        <span className="text-[10px] font-bold">{order.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black uppercase text-stone-300">Total:</span>
                         <span className="text-sm font-black text-[#ee4d2d]">Rp {Number(order.total).toLocaleString()}</span>
                      </div>
                      <a href={`https://wa.me/${String(order.phone).replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-all">
                         <span className="text-[10px] font-black uppercase">Hubungi WA</span>
                         <ExternalLink size={12}/>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-end gap-3 shrink-0">
                    <p className="text-[9px] font-black uppercase text-stone-300 mr-2">Update Progress</p>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value as OrderStatus)}
                      disabled={isUpdating}
                      className="bg-stone-950 text-white border-none rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 ring-orange-100 transition-all cursor-pointer disabled:opacity-50 shadow-xl"
                    >
                      {['Pending', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'].map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                    {isUpdating && <Loader2 size={16} className="animate-spin text-[#ee4d2d] mt-2"/>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95">
           <div className="bg-white p-10 rounded-[3rem] border border-stone-100 space-y-8 shadow-sm">
              <h3 className="text-xl font-black italic flex items-center gap-3"><Key size={24} className="text-[#ee4d2d]"/> API Configuration</h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest ml-1">Google Sheets Script URL</label>
                    <input type="text" value={scriptUrl} onChange={e => setScriptUrl(e.target.value)} className="w-full bg-stone-50 p-5 rounded-2xl text-[11px] font-mono border border-transparent focus:bg-white focus:border-stone-200 outline-none transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest ml-1">ImgBB API Key</label>
                    <input type="password" value={imgbbKey} onChange={e => setImgbbKey(e.target.value)} className="w-full bg-stone-50 p-5 rounded-2xl text-[11px] font-mono border border-transparent focus:bg-white focus:border-stone-200 outline-none transition-all" />
                 </div>
                 <button onClick={saveSystemConfig} className="w-full bg-stone-950 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#ee4d2d] transition-all shadow-xl">
                    <Save size={18}/> Update System
                 </button>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-stone-100 space-y-8 shadow-sm">
              <h3 className="text-xl font-black italic flex items-center gap-3"><ImageIcon size={24} className="text-[#ee4d2d]"/> Store Banners</h3>
              <div className="space-y-6">
                 <div className="flex gap-3">
                    <input type="text" placeholder="https://image-url.com/..." value={newBanner} onChange={e => setNewBanner(e.target.value)} className="flex-1 bg-stone-50 p-5 rounded-2xl text-xs border border-transparent focus:bg-white focus:border-stone-200 outline-none transition-all" />
                    <button onClick={() => { if(newBanner) { onUpdateBanners([...bannerUrls, newBanner]); setNewBanner(''); } }} className="bg-stone-950 text-white p-5 rounded-2xl hover:bg-[#ee4d2d] transition-all"><Plus size={24}/></button>
                 </div>
                 <div className="grid grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                    {bannerUrls.map((url, i) => (
                       <div key={i} className="relative aspect-video rounded-[1.5rem] overflow-hidden group shadow-sm border border-stone-50">
                          <img src={url} className="w-full h-full object-cover" />
                          <button onClick={() => onUpdateBanners(bannerUrls.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest"><Trash2 size={20}/></button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Modal Product Tetap Ada & Diperbaiki */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-950/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] max-h-[90vh] overflow-y-auto p-12 relative shadow-2xl border border-white/10">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-stone-300 hover:text-stone-950 transition-colors p-2 bg-stone-50 rounded-full"><X size={28}/></button>
             <h3 className="text-3xl font-black italic mb-12">{editingProduct ? 'Edit Inventory' : 'New Inventory'}</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Product Name</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-transparent rounded-2xl p-6 text-sm font-bold outline-none focus:bg-white focus:border-stone-200 transition-all" placeholder="Misal: iPhone 16 Pro" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Price (IDR)</label>
                      <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-stone-50 border border-transparent rounded-2xl p-6 text-sm font-black text-[#ee4d2d] outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border border-transparent rounded-2xl p-6 text-sm font-bold outline-none appearance-none">
                         {['Elektronik', 'Fashion', 'Wellness', 'Lainnya'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>
                
                <div className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Story / Description</label>
                      <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-transparent rounded-2xl p-6 text-sm h-40 resize-none outline-none focus:bg-white focus:border-stone-200 transition-all leading-relaxed" placeholder="Jelaskan keunggulan produk ini..."></textarea>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Images</label>
                     <div className="flex gap-4 flex-wrap mt-2">
                       {formData.images?.map((img, i) => (
                         <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden group border border-stone-100 shadow-sm">
                           <img src={img} className="w-full h-full object-cover" />
                           <button onClick={() => setFormData({...formData, images: formData.images?.filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                         </div>
                       ))}
                       <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-300 hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-all bg-stone-50">
                          {isUploading ? <Loader2 size={24} className="animate-spin text-[#ee4d2d]"/> : <Plus size={24}/>}
                       </button>
                     </div>
                     <input type="file" ref={fileInputRef} className="hidden" onChange={async (e) => {
                       const f = e.target.files?.[0]; if(!f) return;
                       setIsUploading(true);
                       const url = await uploadImageToImgBB(f, imgbbKey);
                       if(url) setFormData({...formData, images: [...(formData.images || []), url]});
                       else alert('Upload gagal. Cek API Key ImgBB Anda.');
                       setIsUploading(false);
                     }}/>
                   </div>
                </div>
             </div>
             
             <button 
               onClick={async () => {
                const newList = editingProduct 
                  ? products.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p)
                  : [{ ...formData, id: `P-${Date.now()}`, rating: 5, soldCount: 0 } as Product, ...products];
                onUpdateProducts(newList);
                setIsModalOpen(false);
                await handlePushProducts(newList);
               }} 
               disabled={isUpdating || isUploading} 
               className="w-full mt-12 bg-stone-950 text-white py-7 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-[#ee4d2d] transition-all disabled:opacity-50"
             >
                {isUpdating ? <Loader2 className="animate-spin mx-auto"/> : 'Synchronize Product Data'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
