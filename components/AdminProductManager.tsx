
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { 
  Globe, Loader2, RefreshCw, 
  Save, Plus, X, Edit, Trash2,
  Image as ImageIcon, Package, 
  Settings, Key, Search, AlertCircle
} from 'lucide-react';
import { getStoreData, updateStoreData, uploadImageToImgBB } from '../services/cloudService';
import { GLOBAL_CONFIG } from '../constants';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ products, onUpdateProducts }) => {
  // Gunakan Global Config sebagai default, atau local storage jika user pernah menginput manual
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL);
  const [imgbbKey, setImgbbKey] = useState(localStorage.getItem('storybali_imgbb_key') || GLOBAL_CONFIG.MASTER_IMGBB_KEY);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
      alert('Berhasil sinkronisasi dengan Google Sheets!');
    } else {
      alert('Gagal ambil data. Cek URL Google Script Anda.');
    }
  };

  const handlePush = async () => {
    if (!scriptUrl) return alert('Atur URL Google Script di menu Settings!');
    setIsUpdating(true);
    const success = await updateStoreData(scriptUrl, localProducts);
    setIsUpdating(false);
    if (success) {
      onUpdateProducts(localProducts);
      alert('SUKSES! Data di Google Sheets sudah diperbarui. Refresh perangkat lain untuk melihat perubahan.');
    } else {
      alert('Gagal update ke Cloud.');
    }
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
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx)
    }));
  };

  const openAdd = () => {
    setEditingProduct(null);
    setFormData({ 
      id: `P-${Date.now()}`, 
      name: '', 
      price: 0, 
      originalPrice: 0,
      category: 'Fashion', 
      images: [], 
      description: '', 
      story: '', 
      rating: 5, 
      soldCount: 0 
    });
    setIsModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p, images: Array.isArray(p.images) ? p.images : [] });
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      {/* Admin Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#ee4d2d] text-white p-3 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Seller Centre StoryBali</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Ubud Artisan Control</p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-[#ee4d2d] shadow-sm' : 'text-gray-400'}`}
          >
            Inventori
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-[#ee4d2d] shadow-sm' : 'text-gray-400'}`}
          >
            Pengaturan
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          {/* Cloud Sync Control */}
          <div className="bg-gray-900 text-white p-5 rounded-xl flex flex-wrap justify-between items-center gap-6 shadow-xl">
            <div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${scriptUrl ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Koneksi Cloud</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Gunakan tombol "Simpan ke Cloud" agar sinkron ke semua HP pembeli.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleFetch} disabled={isSyncing} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all">
                {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Sinkronisasi
              </button>
              <button onClick={handlePush} disabled={isUpdating} className="bg-[#ee4d2d] hover:bg-[#ff5b3d] px-6 py-2 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all shadow-lg">
                {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Simpan ke Cloud
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-5 border-b flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Cari produk..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-lg pl-12 pr-4 py-3 text-xs outline-none"
                />
              </div>
              <button onClick={openAdd} className="w-full md:w-auto bg-[#ee4d2d] text-white px-8 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                <Plus size={16} /> Tambah Baru
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 font-bold text-gray-400 uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-5">Item</th>
                    <th className="px-8 py-5">Kategori</th>
                    <th className="px-8 py-5">Harga</th>
                    <th className="px-8 py-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {localProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-10 h-10 object-cover rounded-lg border" />
                          <span className="font-bold text-gray-700">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded text-[10px] font-bold uppercase">{p.category}</span>
                      </td>
                      <td className="px-8 py-5 font-bold text-[#ee4d2d]">Rp {p.price.toLocaleString('id-ID')}</td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                          <button onClick={() => { if(confirm('Hapus item?')) setLocalProducts(prev => prev.filter(x => x.id !== p.id))}} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                        </div>
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
          <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
             <h3 className="flex items-center gap-3 text-[#ee4d2d] font-bold uppercase text-sm">
                <Globe size={18} /> API Google Sheets
             </h3>
             <div className="space-y-4">
                <p className="text-[11px] text-gray-400">Masukkan URL Web App dari Google Apps Script agar semua pengunjung melihat data yang sama.</p>
                <input 
                  type="text" 
                  value={scriptUrl} 
                  onChange={(e) => { setScriptUrl(e.target.value); localStorage.setItem('storybali_script_url', e.target.value); }}
                  placeholder="https://script.google.com/..."
                  className="w-full bg-gray-50 border rounded-xl p-4 text-xs font-bold outline-none"
                />
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-800">
                   <AlertCircle size={18} className="flex-shrink-0" />
                   <p className="text-[10px] font-medium leading-relaxed">Tip: Masukkan URL ini juga di <strong>GLOBAL_CONFIG.MASTER_SCRIPT_URL</strong> pada file <code>constants.tsx</code> agar sinkron otomatis untuk user lain.</p>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
             <h3 className="flex items-center gap-3 text-[#ee4d2d] font-bold uppercase text-sm">
                <Key size={18} /> API Key ImgBB
             </h3>
             <div className="space-y-4">
                <p className="text-[11px] text-gray-400">Dibutuhkan untuk mengunggah gambar produk.</p>
                <input 
                  type="password" 
                  value={imgbbKey} 
                  onChange={(e) => { setImgbbKey(e.target.value); localStorage.setItem('storybali_imgbb_key', e.target.value); }}
                  placeholder="Masukkan API Key ImgBB"
                  className="w-full bg-gray-50 border rounded-xl p-4 text-xs font-bold outline-none"
                />
             </div>
          </div>
        </div>
      )}

      {/* Modal Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <div className="w-full md:w-80 bg-gray-50 p-8 overflow-y-auto border-r">
               <h4 className="font-bold text-gray-800 text-xs uppercase tracking-widest mb-6">Galeri Produk</h4>
               <div className="grid grid-cols-2 gap-3 mb-6">
                  {(formData.images || []).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl border overflow-hidden group">
                       <img src={img} className="w-full h-full object-cover" />
                       <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-[#ee4d2d] hover:border-[#ee4d2d] transition-all bg-white"
                  >
                    {isUploading ? <Loader2 className="animate-spin" /> : <Plus />}
                    <span className="text-[9px] mt-2 font-bold uppercase">Tambah</span>
                  </button>
               </div>
               <input type="file" multiple className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImagesUpload} />
            </div>

            <div className="flex-1 p-10 overflow-y-auto">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">{editingProduct ? 'Edit Produk' : 'Tambah Baru'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors"><X size={24}/></button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-6 py-4 text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Harga Jual (Rp)</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-50 border rounded-xl px-6 py-4 text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-6 py-4 text-sm font-bold outline-none">
                       <option>Fashion</option>
                       <option>Wellness</option>
                       <option>Home Decor</option>
                       <option>Art</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deskripsi Detail</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-6 py-4 text-xs font-medium h-32 outline-none resize-none"></textarea>
                  </div>
               </div>

               <div className="flex gap-4 mt-12">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-gray-100 rounded-xl text-xs font-bold text-gray-400 uppercase">Batal</button>
                  <button onClick={handleSaveLocal} className="flex-[2] py-5 bg-[#ee4d2d] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-orange-100">Simpan Lokal</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
