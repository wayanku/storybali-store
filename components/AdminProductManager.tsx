
import React, { useState, useEffect } from 'react';
import { Product, CategoryConfig, Order, FinanceRecord, OrderStatus } from '../types';
import { 
  RefreshCw, Plus, Edit, Trash2, Package, Search, BarChart3, 
  ClipboardList, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight
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
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'finance'>('inventory');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: 0, note: '' });

  const handlePushAll = async (targetOrders = orders, targetFinance = finances) => {
    const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;
    setIsUpdating(true);
    
    const bannerRow = { id: 'SETTINGS_BANNER', name: 'Banners', description: JSON.stringify(bannerUrls) } as any;
    const catRow = { id: 'SETTINGS_CATEGORIES', name: 'Categories', description: JSON.stringify(categories) } as any;
    const orderRow = { id: 'SETTINGS_ORDERS', name: 'Orders', description: JSON.stringify(targetOrders) } as any;
    const financeRow = { id: 'SETTINGS_FINANCE', name: 'Finance', description: JSON.stringify(targetFinance) } as any;

    const fullPayload = [bannerRow, catRow, orderRow, financeRow, ...products.map(p => ({...p, image: p.images.join(',')}))];
    await updateStoreData(scriptUrl, fullPayload);
    setIsUpdating(false);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    onUpdateOrders(updated);
    handlePushAll(updated);
  };

  const addExpense = () => {
    if (newExpense.amount <= 0 || !newExpense.note) return;
    const rec: FinanceRecord = { id: `EXP-${Date.now()}`, type: 'Expense', amount: newExpense.amount, note: newExpense.note, date: new Date().toISOString() };
    const updated = [rec, ...finances];
    onUpdateFinances(updated);
    handlePushAll(orders, updated);
    setNewExpense({ amount: 0, note: '' });
  };

  const totalIncome = finances.filter(f => f.type === 'Income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = finances.filter(f => f.type === 'Expense').reduce((s, f) => s + f.amount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 md:px-6 py-10">
      <div className="bg-white p-4 rounded-3xl shadow-sm flex flex-wrap gap-2 border border-stone-100">
        {[
          { id: 'inventory', label: 'Inventory', icon: <Package size={16}/> },
          { id: 'orders', label: 'Orders', icon: <ClipboardList size={16}/> },
          { id: 'finance', label: 'Finances', icon: <BarChart3 size={16}/> }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-stone-900 text-white shadow-xl' : 'text-stone-400 hover:bg-stone-50'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {products.map(p => (
             <div key={p.id} className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center gap-4">
                <img src={p.images[0]} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1"><h4 className="text-sm font-bold truncate">{p.name}</h4><p className="text-[#ee4d2d] font-black text-xs">Rp {p.price.toLocaleString('id-ID')}</p></div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
           {orders.map(order => (
             <div key={order.id} className="bg-white p-6 rounded-3xl border border-stone-100 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{order.id}</p>
                   <h4 className="font-bold text-stone-900">{order.customerName}</h4>
                   <p className="text-xs text-stone-500">{order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
                   <p className="text-sm font-black text-[#ee4d2d] mt-2">Rp {order.total.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-3">
                   <select 
                     value={order.status} 
                     onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                     className={`text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl outline-none border-2 ${order.status === 'Selesai' ? 'border-emerald-100 text-emerald-600 bg-emerald-50' : 'border-orange-100 text-orange-600 bg-orange-50'}`}
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
              <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-200">
                 <div className="flex justify-between items-start mb-6"><TrendingUp size={32}/><div className="bg-white/20 p-2 rounded-lg text-[8px] font-black uppercase tracking-widest">Income</div></div>
                 <h2 className="text-3xl font-black italic">Rp {totalIncome.toLocaleString('id-ID')}</h2>
                 <p className="text-[10px] font-bold opacity-70 mt-4 uppercase tracking-widest">Total Pemasukan</p>
              </div>
              <div className="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-rose-200">
                 <div className="flex justify-between items-start mb-6"><TrendingDown size={32}/><div className="bg-white/20 p-2 rounded-lg text-[8px] font-black uppercase tracking-widest">Expense</div></div>
                 <h2 className="text-3xl font-black italic">Rp {totalExpense.toLocaleString('id-ID')}</h2>
                 <p className="text-[10px] font-bold opacity-70 mt-4 uppercase tracking-widest">Total Pengeluaran</p>
              </div>
              <div className="bg-stone-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
                 <h3 className="text-lg font-bold mb-6">Tambah Pengeluaran</h3>
                 <div className="space-y-4">
                    <input type="number" placeholder="Jumlah" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} className="w-full bg-white/10 p-4 rounded-xl text-sm outline-none border border-white/10" />
                    <input type="text" placeholder="Keterangan" value={newExpense.note} onChange={e => setNewExpense({...newExpense, note: e.target.value})} className="w-full bg-white/10 p-4 rounded-xl text-sm outline-none border border-white/10" />
                    <button onClick={addExpense} className="w-full bg-[#ee4d2d] py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Catat Sekarang</button>
                 </div>
              </div>
           </div>
           <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-stone-100">
              <h3 className="text-xl font-bold mb-8">Riwayat Transaksi</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                 {finances.map(f => (
                   <div key={f.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-xl ${f.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {f.type === 'Income' ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                         </div>
                         <div><p className="text-sm font-bold text-stone-900">{f.note}</p><p className="text-[10px] text-stone-400 font-bold uppercase">{new Date(f.date).toLocaleDateString()}</p></div>
                      </div>
                      <p className={`font-black text-sm ${f.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>{f.type === 'Income' ? '+' : '-'} Rp {f.amount.toLocaleString('id-ID')}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
