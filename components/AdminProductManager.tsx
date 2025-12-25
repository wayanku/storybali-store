
import React, { useState, useEffect } from 'react';
import { Product, CategoryConfig, Order, FinanceRecord, OrderStatus } from '../types';
import { 
  RefreshCw, Plus, Edit, Trash2, Package, Search, BarChart3, 
  ClipboardList, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  Wifi, ShieldCheck, Lock, Eye, EyeOff, Layout, Grid
} from 'lucide-react';
import { updateStoreData } from '../services/cloudService';
import { GLOBAL_CONFIG } from '../constants';

interface AdminProductManagerProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  bannerUrls: string[];
  onUpdateBanners: (urls: string[]) => void;
  categories: CategoryConfig[];
  onUpdateCategories: (cats: CategoryConfig[]) => void;
  orders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  finances: FinanceRecord[];
  onUpdateFinances: (fins: FinanceRecord[]) => void;
}

const AdminProductManager: React.FC<AdminProductManagerProps> = ({ 
  products, onUpdateProducts, bannerUrls, onUpdateBanners, categories, onUpdateCategories,
  orders, onUpdateOrders, finances, onUpdateFinances
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'finance' | 'system'>('inventory');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: 0, note: '' });
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [passInput, setPassInput] = useState('');

  const handlePushAll = async (targetOrders = orders, targetFinance = finances) => {
    const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;
    setIsUpdating(true);
    
    const systemRows = [
      { id: 'SETTINGS_BANNER', name: 'Banners', description: JSON.stringify(bannerUrls) },
      { id: 'SETTINGS_CATEGORIES', name: 'Categories', description: JSON.stringify(categories) },
      { id: 'SETTINGS_ORDERS', name: 'Orders', description: JSON.stringify(targetOrders) },
      { id: 'SETTINGS_FINANCE', name: 'Finance', description: JSON.stringify(targetFinance) }
    ];

    const fullPayload = [...systemRows, ...products.map(p => ({...p, image: p.images.join(',')}))] as any;
    const success = await updateStoreData(scriptUrl, fullPayload);
    setIsUpdating(false);
    if (success) alert('Berhasil Sinkron ke Cloud!');
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    onUpdateOrders(updated);
    handlePushAll(updated, finances);
  };

  const addExpense = () => {
    if (newExpense.amount <= 0 || !newExpense.note) return;
    const rec: FinanceRecord = { 
      id: `EXP-${Date.now()}`, 
      type: 'Expense', 
      amount: newExpense.amount, 
      note: newExpense.note, 
      date: new Date().toISOString() 
    };
    const updated = [rec, ...finances];
    onUpdateFinances(updated);
    handlePushAll(orders, updated);
    setNewExpense({ amount: 0, note: '' });
  };

  const totalIncome = finances.filter(f => f.type === 'Income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = finances.filter(f => f.type === 'Expense').reduce((s, f) => s + f.amount, 0);

  if (!isAdminAuth) {
    return (
      <div className="max-w-md mx-auto py-32 px-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl space-y-8 border border-stone-100 text-center">
          <div className="w-20 h-20 bg-stone-50 text-[#ee4d2d] rounded-3xl flex items-center justify-center mx-auto"><Lock size={32}/></div>
          <div className="space-y-4">
             <h2 className="text-xl font-bold">Admin Login</h2>
             <input 
               type="password" 
               placeholder="Enter Password" 
               value={passInput} 
               onChange={e => setPassInput(e.target.value)} 
               className="w-full bg-stone-50 p-5 rounded-2xl outline-none text-center font-black tracking-widest border border-stone-100" 
             />
             <button 
               onClick={() => passInput === GLOBAL_CONFIG.ADMIN_PASSWORD ? setIsAdminAuth(true) : alert('Salah!')} 
               className="w-full bg-[#ee4d2d] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
             >
               Unlock Seller Center
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 md:px-6 py-10 pb-32">
      <div className="bg-white p-4 rounded-3xl shadow-sm flex flex-wrap gap-2 border border-stone-100">
        {[
          { id: 'inventory', label: 'Produk', icon: <Package size={16}/> },
          { id: 'orders', label: 'Pesanan', icon: <ClipboardList size={16}/> },
          { id: 'finance', label: 'Keuangan', icon: <BarChart3 size={16}/> },
          { id: 'system', label: 'Sistem', icon: <Layout size={16}/> }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-stone-900 text-white shadow-xl' : 'text-stone-400 hover:bg-stone-50'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-3xl border border-stone-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                   <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-50"><img src={p.images[0]} className="w-full h-full object-cover"/></div>
                   <div className="flex-1 min-w-0"><h4 className="text-sm font-bold truncate">{p.name}</h4><p className="text-[#ee4d2d] font-black text-xs mt-1">Rp {p.price.toLocaleString('id-ID')}</p></div>
                   <button className="text-stone-300 hover:text-stone-900"><Edit size={18}/></button>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
           {orders.length === 0 ? <p className="text-center py-20 text-stone-300 font-bold">Belum ada pesanan.</p> : orders.map(order => (
             <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 flex flex-col md:flex-row justify-between gap-8 animate-in slide-in-from-bottom-4">
                <div className="space-y-3">
                   <div className="flex items-center gap-3">
                      <span className="bg-orange-50 text-[#ee4d2d] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{order.id}</span>
                      <span className="text-[10px] text-stone-400 font-bold">{order.createdAt}</span>
                   </div>
                   <h4 className="text-lg font-bold">{order.customerName}</h4>
                   <div className="space-y-1">
                      {order.items.map((item, idx) => <p key={idx} className="text-xs text-stone-500">• {item.name} (x{item.quantity})</p>)}
                   </div>
                   <p className="text-xl font-black text-[#ee4d2d] italic pt-2">Rp {order.total.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center">
                   <select 
                     value={order.status} 
                     onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                     className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none border-2 transition-all ${order.status === 'Selesai' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}
                   >
                      {['Pending', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'].map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-emerald-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-200">
                 <div className="flex justify-between items-start mb-6"><TrendingUp size={40}/><div className="bg-white/20 p-2 rounded-xl text-[8px] font-black tracking-widest">GROSS INCOME</div></div>
                 <h2 className="text-4xl font-black italic">Rp {totalIncome.toLocaleString('id-ID')}</h2>
              </div>
              <div className="bg-rose-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-rose-200">
                 <div className="flex justify-between items-start mb-6"><TrendingDown size={40}/><div className="bg-white/20 p-2 rounded-xl text-[8px] font-black tracking-widest">OPERATIONAL</div></div>
                 <h2 className="text-4xl font-black italic">Rp {totalExpense.toLocaleString('id-ID')}</h2>
              </div>
              <div className="bg-stone-900 p-10 rounded-[3.5rem] text-white space-y-6 shadow-2xl">
                 <h3 className="text-xl font-bold">Catat Pengeluaran</h3>
                 <div className="space-y-4">
                    <input type="number" placeholder="Jumlah (IDR)" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} className="w-full bg-white/10 p-5 rounded-2xl outline-none border border-white/10 font-bold" />
                    <input type="text" placeholder="Keterangan (Contoh: Biaya Iklan)" value={newExpense.note} onChange={e => setNewExpense({...newExpense, note: e.target.value})} className="w-full bg-white/10 p-5 rounded-2xl outline-none border border-white/10 text-sm" />
                    <button onClick={addExpense} className="w-full bg-[#ee4d2d] py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">Submit Record</button>
                 </div>
              </div>
           </div>
           <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-stone-100">
              <h3 className="text-xl font-bold mb-8">Riwayat Keuangan Global</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                 {finances.length === 0 ? <p className="text-stone-300">Belum ada transaksi.</p> : finances.map(f => (
                   <div key={f.id} className="flex items-center justify-between p-5 bg-stone-50 rounded-3xl border border-stone-100">
                      <div className="flex items-center gap-5">
                         <div className={`p-4 rounded-2xl ${f.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {f.type === 'Income' ? <ArrowUpRight size={24}/> : <ArrowDownRight size={24}/>}
                         </div>
                         <div><p className="font-bold text-stone-900">{f.note}</p><p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{new Date(f.date).toLocaleDateString()}</p></div>
                      </div>
                      <p className={`font-black text-lg italic ${f.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>{f.type === 'Income' ? '+' : '-'} Rp {f.amount.toLocaleString('id-ID')}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {isUpdating && <div className="fixed inset-0 bg-stone-950/20 backdrop-blur-sm z-[200] flex items-center justify-center"><div className="bg-white p-8 rounded-3xl flex items-center gap-4"><Wifi className="animate-pulse text-[#ee4d2d]"/> <span className="text-[10px] font-black uppercase tracking-widest">Syncing to Cloud...</span></div></div>}
    </div>
  );
};

export default AdminProductManager;
