
import React, { useState, useRef, useEffect } from 'react';
import { Product, CategoryConfig, Order, OrderStatus } from '../types';
import { 
  Globe, Loader2, RefreshCw, 
  Save, Plus, X, Edit, Trash2,
  Image as ImageIcon, Package, 
  Settings, Key, Search,
  CheckCircle, Sparkles, ArrowRight, BarChart3,
  Layout, Wifi, Eye, EyeOff, Grid, Truck, Calendar
} from 'lucide-react';
import { getStoreData, updateStoreData, uploadImageToImgBB, updateOrderStatusInCloud } from '../services/cloudService';
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
  const [scriptUrl] = useState(localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL);
  const [imgbbKey] = useState(localStorage.getItem('storybali_imgbb_key') || GLOBAL_CONFIG.MASTER_IMGBB_KEY);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'system'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({ images: [] });
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Grid');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiBannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const fetchOrders = async () => {
    setIsSyncing(true);
    const data = await getStoreData(scriptUrl, "Orders");
    if (data) setOrders(data);
    setIsSyncing(false);
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);
    const success = await updateOrderStatusInCloud(scriptUrl, orderId, newStatus);
    if (success) {
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    }
    setIsUpdating(false);
  };

  const handlePushAll = async (targetProducts = localProducts, targetBanners = bannerUrls, targetCats = categories) => {
    setIsUpdating(true);
    const success = await updateStoreData(scriptUrl, targetProducts);
    setIsUpdating(false);
    if (success) {
      onUpdateProducts(targetProducts);
      onUpdateBanners(targetBanners);
      onUpdateCategories(targetCats);
    }
  };

  const handleAddCategory = () => {
    if (!newCatName) return;
    const newCat: CategoryConfig = { id: `cat-${Date.now()}`, name: newCatName, icon: newCatIcon, visible: true };
    const updated = [...categories, newCat];
    onUpdateCategories(updated);
    setNewCatName('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32 px-4">
      <div className="bg-white p-5 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 border border-stone-100">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-stone-900 text-[#ee4d2d] p-4 rounded-2xl"><Package size={20}/></div>
          <h1 className="text-xl font-bold text-stone-900">Seller Center</h1>
        </div>
        <div className="flex bg-stone-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('inventory')} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${activeTab === 'inventory' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>Inventory</button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>Orders</button>
          <button onClick={() => setActiveTab('system')} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${activeTab === 'system' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300'}`}>System</button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Pesanan Masuk</h2>
            <button onClick={fetchOrders} className="p-2 bg-white rounded-lg border border-stone-100"><RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''}/></button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {orders.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-[2rem] border border-stone-100 text-stone-400">Belum ada pesanan.</div>
            ) : (
              orders.map(order => (
                <div key={order.orderId} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-orange-50 text-[#ee4d2d] px-3 py-1 rounded-full text-[10px] font-black">{order.orderId}</span>
                      <span className="text-xs font-bold text-stone-900">{order.customerName}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-1">{order.items}</p>
                    <div className="flex items-center gap-4 text-[10px] text-stone-400">
                      <div className="flex items-center gap-1"><Calendar size={12}/> {new Date(order.timestamp).toLocaleDateString()}</div>
                      <div className="font-bold text-stone-900">Rp {Number(order.total).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={order.status} 
                      onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value as OrderStatus)}
                      className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none"
                    >
                      {Object.values(OrderStatus).map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                    {isUpdating && <Loader2 size={16} className="animate-spin text-[#ee4d2d]"/>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-stone-100 flex items-center justify-between gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                <input type="text" placeholder="Cari di gudang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-stone-50 rounded-2xl pl-12 pr-6 py-3 text-xs outline-none" />
             </div>
             <button onClick={() => { setEditingProduct(null); setFormData({ name: '', price: 0, category: categories[0]?.name || 'Fashion', images: [], description: '' }); setIsModalOpen(true); }} className="bg-[#ee4d2d] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Plus size={16}/> New</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50"><img src={p.images?.[0]} className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0"><h4 className="text-xs font-bold truncate">{p.name}</h4><p className="text-[#ee4d2d] font-black text-[10px]">Rp {p.price.toLocaleString('id-ID')}</p></div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingProduct(p); setFormData({ ...p }); setIsModalOpen(true); }} className="p-2 text-stone-400 hover:text-[#ee4d2d]"><Edit size={14} /></button>
                  <button onClick={() => { if(confirm('Hapus?')) { const n = localProducts.filter(x => x.id !== p.id); setLocalProducts(n); handlePushAll(n); }}} className="p-2 text-stone-200 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 space-y-8">
              <h3 className="text-xl font-bold">Category Management</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                 {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 group">
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg bg-white text-stone-900`}>{renderCategoryIcon(cat.icon, 18)}</div>
                          <p className={`text-sm font-bold`}>{cat.name}</p>
                       </div>
                       <button onClick={() => onUpdateCategories(categories.filter(c => c.id !== cat.id))} className="p-2 text-stone-200 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                 ))}
              </div>
              <div className="pt-6 border-t border-stone-50 space-y-4">
                 <div className="flex gap-3">
                    <input type="text" placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                    <button onClick={handleAddCategory} className="bg-stone-900 text-white p-3 rounded-xl hover:bg-[#ee4d2d] transition-all"><Plus size={20}/></button>
                 </div>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 space-y-6 text-center">
              <Wifi className="mx-auto text-stone-200" size={40}/>
              <p className="text-xs text-stone-400 font-medium">Pastikan URL Google Script sudah benar di file constants.tsx untuk sinkronisasi otomatis.</p>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-950/80 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto p-12 relative">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-stone-300 hover:text-stone-900"><X size={24}/></button>
             <h3 className="text-2xl font-bold mb-10">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
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
                   <div className="space-y-2"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-stone-100 rounded-xl p-5 text-sm h-32 resize-none"></textarea></div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Images</label>
                     <div className="flex gap-2">
                       {formData.images?.map((img, i) => <img key={i} src={img} className="w-10 h-10 rounded-lg object-cover"/>)}
                       <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-lg border-2 border-dashed border-stone-200 flex items-center justify-center text-stone-300"><Plus/></button>
                     </div>
                     <input type="file" ref={fileInputRef} className="hidden" onChange={async (e) => {
                       const f = e.target.files?.[0]; if(!f) return;
                       setIsUploading(true);
                       const url = await uploadImageToImgBB(f, imgbbKey);
                       if(url) setFormData({...formData, images: [...(formData.images || []), url]});
                       setIsUploading(false);
                     }}/>
                   </div>
                </div>
             </div>
             <button onClick={async () => {
                const newList = editingProduct 
                  ? localProducts.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p)
                  : [{ ...formData, id: `P-${Date.now()}` } as Product, ...localProducts];
                setLocalProducts(newList);
                setIsModalOpen(false);
                await handlePushAll(newList);
             }} className="w-full mt-10 bg-stone-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl">
                {isUpdating ? <Loader2 className="animate-spin mx-auto"/> : 'Save Product'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
