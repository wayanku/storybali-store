
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { 
  Globe, Loader2, RefreshCw, 
  Save, Plus, X, Edit, Trash2, Upload, 
  Image as ImageIcon, DollarSign, Package, 
  Settings, Key, Search, Check, AlertCircle
} from 'lucide-react';
import { getStoreData, updateStoreData, uploadImageToImgBB } from '../services/cloudService';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ products, onUpdateProducts }) => {
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem('storybali_script_url') || '');
  const [imgbbKey, setImgbbKey] = useState(localStorage.getItem('storybali_imgbb_key') || '');
  
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
    if (!scriptUrl) return alert('Atur URL Google Script di Settings!');
    setIsSyncing(true);
    const data = await getStoreData(scriptUrl);
    setIsSyncing(false);
    if (data) {
      setLocalProducts(data);
      onUpdateProducts(data);
      localStorage.setItem('storybali_script_url', scriptUrl);
      alert('Data Berhasil Diambil!');
    }
  };

  const handlePush = async () => {
    if (!scriptUrl) return alert('Atur URL Google Script di Settings!');
    setIsUpdating(true);
    // Sebelum push, pastikan format data benar (terutama images array)
    const success = await updateStoreData(scriptUrl, localProducts);
    setIsUpdating(false);
    if (success) {
      onUpdateProducts(localProducts);
      alert('Data Berhasil Di-update ke Cloud (Google Sheets)!');
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!imgbbKey) return alert('Atur API Key ImgBB di Settings!');

    setIsUploading(true);
    const newImages = [...(formData.images || [])];
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImageToImgBB(files[i], imgbbKey);
      if (url) newImages.push(url);
    }
    
    setFormData(prev => ({ ...prev, images: newImages }));
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
    setFormData({ ...p, images: p.images || [] });
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
    // Langsung ingatkan user untuk push
    console.log("Updated locally. Don't forget to Push to Cloud.");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      {/* Header Admin */}
      <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#ee4d2d] text-white p-3 rounded-lg shadow-lg">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Seller Centre StoryBali</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Inventory Management System</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-[#ee4d2d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Inventori
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-[#ee4d2d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          {/* Sinkronisasi Bar */}
          <div className="bg-gray-800 text-white p-4 rounded-lg flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Globe size={18} className={scriptUrl ? 'text-green-400' : 'text-red-400'} />
              <span className="text-xs font-medium">{scriptUrl ? 'Cloud Connected' : 'Cloud Not Configured'}</span>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={handleFetch} disabled={isSyncing} className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-xs font-bold flex items-center justify-center gap-2">
                {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Ambil Data Sheet
              </button>
              <button onClick={handlePush} disabled={isUpdating} className="flex-1 md:flex-none bg-[#ee4d2d] hover:bg-[#ff5b3d] px-4 py-2 rounded text-xs font-bold flex items-center justify-center gap-2">
                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan ke Sheet
              </button>
            </div>
          </div>

          {/* Table List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Cari produk..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-md pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#ee4d2d] outline-none"
                />
              </div>
              <button onClick={openAdd} className="bg-[#ee4d2d] text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2 hover:opacity-90">
                <Plus size={14} /> Tambah Produk Baru
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {localProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://via.placeholder.com/50'} className="w-10 h-10 object-cover rounded border" />
                        <span className="font-bold text-gray-700">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-500">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#ee4d2d]">Rp {p.price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-green-500"><Check size={12}/> Aktif</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                        <button onClick={() => { if(confirm('Hapus?')) setLocalProducts(prev => prev.filter(x => x.id !== p.id))}} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
             <div className="flex items-center gap-2 text-[#ee4d2d] font-bold">
                <Globe size={18} /> <h3>Google Sheets API</h3>
             </div>
             <p className="text-xs text-gray-500">Masukkan URL Web App dari Apps Script Anda.</p>
             <input 
               type="text" 
               value={scriptUrl} 
               onChange={(e) => { setScriptUrl(e.target.value); localStorage.setItem('storybali_script_url', e.target.value); }}
               placeholder="https://script.google.com/..."
               className="w-full bg-gray-50 border-gray-200 rounded-md p-3 text-xs outline-none focus:border-[#ee4d2d] border"
             />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
             <div className="flex items-center gap-2 text-[#ee4d2d] font-bold">
                <Key size={18} /> <h3>ImgBB API Key</h3>
             </div>
             <p className="text-xs text-gray-500">Key untuk upload banyak gambar sekaligus.</p>
             <input 
               type="password" 
               value={imgbbKey} 
               onChange={(e) => { setImgbbKey(e.target.value); localStorage.setItem('storybali_imgbb_key', e.target.value); }}
               placeholder="Masukkan API Key ImgBB"
               className="w-full bg-gray-50 border-gray-200 rounded-md p-3 text-xs outline-none focus:border-[#ee4d2d] border"
             />
          </div>
        </div>
      )}

      {/* Modal Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <div className="w-full md:w-1/3 bg-gray-50 p-6 overflow-y-auto">
               <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><ImageIcon size={16}/> Gambar Produk</h4>
               <div className="grid grid-cols-2 gap-2 mb-4">
                  {(formData.images || []).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded border overflow-hidden group">
                       <img src={img} className="w-full h-full object-cover" />
                       <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:text-[#ee4d2d] hover:border-[#ee4d2d] transition-all"
                  >
                    {isUploading ? <Loader2 className="animate-spin" /> : <Plus />}
                    <span className="text-[10px] mt-1">Tambah</span>
                  </button>
               </div>
               <input type="file" multiple className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImagesUpload} />
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">{editingProduct ? 'Edit Produk' : 'Produk Baru'}</h3>
                  <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Produk</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border p-3 rounded-md outline-none focus:border-[#ee4d2d]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Harga (Rp)</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-50 border p-3 rounded-md outline-none focus:border-[#ee4d2d]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Kategori</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border p-3 rounded-md outline-none focus:border-[#ee4d2d]">
                       <option>Fashion</option>
                       <option>Wellness</option>
                       <option>Home</option>
                       <option>Art</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Deskripsi</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border p-3 rounded-md h-24 outline-none focus:border-[#ee4d2d] resize-none"></textarea>
                  </div>
               </div>

               <div className="flex gap-3 mt-8">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-md font-bold text-gray-500">Batal</button>
                  <button onClick={handleSaveLocal} className="flex-[2] py-3 bg-[#ee4d2d] text-white rounded-md font-bold shadow-lg shadow-orange-200">Simpan Inventori</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
