
import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Globe, Share2, Info, Loader2, Link, Check, ExternalLink, 
  RefreshCw, Save, Plus, X, Edit, Trash2, LayoutGrid, List,
  Image as ImageIcon, DollarSign, Tag, Star, Package, Activity
} from 'lucide-react';
import { getStoreData, updateStoreData } from '../services/cloudService';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ products, onUpdateProducts }) => {
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem('storybali_script_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const handleFetch = async () => {
    if (!scriptUrl) return alert('Masukkan URL API Google Script Anda!');
    setIsSyncing(true);
    const data = await getStoreData(scriptUrl);
    setIsSyncing(false);
    if (data) {
      setLocalProducts(data);
      onUpdateProducts(data);
      localStorage.setItem('storybali_script_url', scriptUrl);
      alert('Data Berhasil Disinkronkan!');
    }
  };

  const handlePush = async () => {
    if (!scriptUrl) return alert('Masukkan URL API Google Script Anda!');
    setIsUpdating(true);
    const success = await updateStoreData(scriptUrl, localProducts);
    setIsUpdating(false);
    if (success) {
      onUpdateProducts(localProducts);
      alert('DATABASE CLOUD BERHASIL DIPERBARUI!');
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setFormData({ 
      id: `P-${Date.now()}`, 
      name: '', 
      price: 0, 
      category: 'Art', 
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363', 
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

  const handleDelete = (id: string) => {
    if(confirm('Yakin ingin menghapus produk ini? (Jangan lupa klik PUSH TO CLOUD setelah ini)')) {
      setLocalProducts(localProducts.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
            <Package size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Total Produk</p>
            <p className="text-3xl font-black text-stone-800">{localProducts.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-700">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Status Sync</p>
            <p className="text-xl font-black text-stone-800 uppercase">{scriptUrl ? 'Connected' : 'Offline'}</p>
          </div>
        </div>
        <div className="bg-emerald-900 p-6 rounded-[2rem] shadow-xl flex items-center justify-between text-white">
          <button onClick={openAdd} className="flex flex-col items-start">
            <Plus size={24} className="mb-1" />
            <span className="text-sm font-black uppercase tracking-tighter">Tambah Produk</span>
          </button>
          <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center">
            <LayoutGrid size={20} />
          </div>
        </div>
      </div>

      {/* Main Bridge Control */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 border border-stone-100 overflow-hidden">
        <div className="p-8 bg-stone-900 text-white flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-600 rounded-2xl">
              <Globe size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter">Google Cloud Engine</h2>
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Automated Headers & Real-time Persistence</p>
            </div>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
             <button onClick={() => setShowInstructions(!showInstructions)} className="px-6 py-4 rounded-2xl bg-stone-800 text-[10px] font-black border border-stone-700 hover:bg-stone-700 transition-all flex items-center gap-2">
                <Info size={16} /> SETUP GUIDE
             </button>
             <button onClick={handleFetch} disabled={isSyncing} className="flex-1 lg:flex-none px-8 py-4 rounded-2xl bg-white text-stone-900 text-[10px] font-black hover:bg-stone-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />} REFRESH FROM SHEET
             </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block ml-1">API Web App Endpoint</label>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm font-medium focus:border-emerald-700 outline-none transition-all"
              />
              <button onClick={handlePush} disabled={isUpdating} className="px-10 py-4 bg-emerald-800 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-50">
                 {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} SIMPAN PERUBAHAN KE CLOUD
              </button>
            </div>
          </div>

          {showInstructions && (
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] p-8 animate-in slide-in-from-top-4">
              <h3 className="font-black text-emerald-900 mb-4 flex items-center gap-2 text-sm uppercase">
                <Link size={16} /> Cara Menghubungkan Google Script
              </h3>
              <ul className="text-xs text-emerald-800 space-y-3 list-decimal ml-5 font-bold leading-relaxed">
                <li>Buka Google Sheets Anda, lalu buka <b>Extensions > Apps Script</b>.</li>
                <li>Hapus semua kode, paste kode Apps Script baru yang saya berikan.</li>
                <li>Klik <b>Deploy > New Deployment</b>. Pilih <b>Web App</b>.</li>
                <li>Execute as: <b>Me</b>, Access: <b>Anyone</b>. Klik Deploy.</li>
                <li>Salin URL Web App (akhiran /exec) dan tempel di kotak "API Web App Endpoint" di atas.</li>
                <li><b>PENTING:</b> Sistem ini akan otomatis membuat judul kolom (headers) saat pertama kali Anda klik "SIMPAN PERUBAHAN KE CLOUD".</li>
              </ul>
            </div>
          )}

          {/* Product Table Professional View */}
          <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm">
            <div className="p-6 bg-stone-50/50 border-b flex justify-between items-center">
              <h4 className="text-xs font-black text-stone-800 uppercase tracking-widest">Inventory List</h4>
              <span className="text-[10px] font-bold text-stone-400">Menampilkan {localProducts.length} Produk</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50/30 text-[10px] text-stone-400 font-black uppercase tracking-widest border-b border-stone-50">
                  <tr>
                    <th className="px-8 py-5">Produk</th>
                    <th className="px-8 py-5">Harga</th>
                    <th className="px-8 py-5">Kategori</th>
                    <th className="px-8 py-5 text-right">Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {localProducts.map(p => (
                    <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-100">
                             <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div>
                            <p className="font-black text-stone-800 text-sm leading-none mb-1">{p.name}</p>
                            <p className="text-[10px] text-stone-400 font-bold uppercase">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-black text-emerald-800">${p.price}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(p)} className="w-10 h-10 rounded-xl bg-white border shadow-sm text-stone-400 hover:text-emerald-700 flex items-center justify-center transition-all"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(p.id)} className="w-10 h-10 rounded-xl bg-white border shadow-sm text-stone-400 hover:text-red-600 flex items-center justify-center transition-all"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal Professional */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-8 border-white">
            <div className="p-8 flex justify-between items-center border-b border-stone-50">
               <div>
                  <h3 className="text-3xl font-black text-stone-800 tracking-tighter">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Perubahan akan disimpan secara lokal sebelum di-Push ke Cloud</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-10 grid grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
               <div className="space-y-2 col-span-2 md:col-span-1">
                 <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest"><Tag size={12}/> Nama Produk</label>
                 <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-700 outline-none transition-all" placeholder="Contoh: Tas Rotan Handmade" />
               </div>
               <div className="space-y-2 col-span-2 md:col-span-1">
                 <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest"><DollarSign size={12}/> Harga ($)</label>
                 <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-700 outline-none transition-all" />
               </div>
               <div className="space-y-2 col-span-2">
                 <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest"><ImageIcon size={12}/> Link Gambar Produk (URL)</label>
                 <div className="flex gap-4 items-center">
                    <img src={formData.image} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md" />
                    <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="flex-1 bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4 text-xs font-medium focus:border-emerald-700 outline-none transition-all" placeholder="https://images.unsplash.com/..." />
                 </div>
               </div>
               <div className="space-y-2 col-span-2 md:col-span-1">
                 <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest"><LayoutGrid size={12}/> Kategori</label>
                 <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-700 outline-none">
                    <option>Fashion</option>
                    <option>Wellness</option>
                    <option>Home</option>
                    <option>Art</option>
                    <option>Souvenir</option>
                 </select>
               </div>
               <div className="space-y-2 col-span-2 md:col-span-1">
                 <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest"><Star size={12}/> Rating (1-5)</label>
                 <input type="number" step="0.1" max="5" min="1" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-700 outline-none transition-all" />
               </div>
               <div className="space-y-2 col-span-2">
                 <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Deskripsi Produk</label>
                 <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4 text-sm font-medium h-32 focus:border-emerald-700 outline-none transition-all resize-none" placeholder="Ceritakan detail produk Anda..."></textarea>
               </div>
            </div>

            <div className="p-10 border-t bg-stone-50/50 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-5 border-2 border-stone-200 rounded-3xl text-xs font-black text-stone-400 hover:bg-white transition-all">BATAL</button>
              <button onClick={handleSaveLocal} className="flex-1 px-8 py-5 bg-emerald-900 text-white rounded-3xl text-xs font-black shadow-xl shadow-emerald-200 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2">
                <Check size={18} /> SIMPAN DATA LOKAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
