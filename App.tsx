
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppRoute, Product, CartItem, CategoryConfig, Order, FinanceRecord } from './types';
import { INITIAL_PRODUCTS, GLOBAL_CONFIG } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import AdminProductManager from './components/AdminProductManager';
import { 
  Trash2, Plus, Minus, 
  Star, ShoppingCart, ShoppingBag, 
  ChevronRight, MapPin, Truck, Lock, 
  Home, User, Search,
  ArrowRight, Zap, Smartphone, Utensils, Laptop, Watch, Headphones,
  Sparkles, ChevronLeft, Wifi, CreditCard, Wallet, Ticket, CheckCircle2, ShieldCheck,
  Package, ClipboardList, SearchCode, History, BarChart3
} from 'lucide-react';
import { getStoreData, updateStoreData } from './services/cloudService';

const DEFAULT_BANNERS = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200"
];

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'cat-1', name: 'Elektronik', icon: 'Smartphone', visible: true },
  { id: 'cat-2', name: 'Komputer', icon: 'Laptop', visible: true },
  { id: 'cat-3', name: 'Fashion', icon: 'User', visible: true },
  { id: 'cat-4', name: 'Wellness', icon: 'Zap', visible: true }
];

export const renderCategoryIcon = (iconName: string, size = 24) => {
  const icons: Record<string, React.ReactNode> = {
    Smartphone: <Smartphone size={size} />, Laptop: <Laptop size={size} />,
    User: <User size={size} />, Zap: <Zap size={size} />, Watch: <Watch size={size} />,
    Headphones: <Headphones size={size} />, Home: <Home size={size} />, Utensils: <Utensils size={size} />
  };
  return icons[iconName] || <Search size={size} />;
};

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [address, setAddress] = useState({ name: '', phone: '', detail: '' });
  const [trackingId, setTrackingId] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);

  const [heroBanners, setHeroBanners] = useState<string[]>(DEFAULT_BANNERS);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const syncFromCloud = useCallback(async (isInitial = false) => {
    const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;
    if (!scriptUrl) return;
    if (!isInitial) setIsSyncing(true);
    const cloudData = await getStoreData(scriptUrl);
    
    if (cloudData && cloudData.length > 0) {
      setProducts(cloudData.filter(p => !['SETTINGS_BANNER', 'SETTINGS_CATEGORIES', 'SETTINGS_ORDERS', 'SETTINGS_FINANCE'].includes(p.id)));
      
      const bannerSetting = cloudData.find(p => p.id === 'SETTINGS_BANNER');
      if (bannerSetting) setHeroBanners(JSON.parse(bannerSetting.description));

      const catSetting = cloudData.find(p => p.id === 'SETTINGS_CATEGORIES');
      if (catSetting) setCategories(JSON.parse(catSetting.description));

      const orderSetting = cloudData.find(p => p.id === 'SETTINGS_ORDERS');
      if (orderSetting) setOrders(JSON.parse(orderSetting.description));

      const financeSetting = cloudData.find(p => p.id === 'SETTINGS_FINANCE');
      if (financeSetting) setFinances(JSON.parse(financeSetting.description));
    } else if (isInitial) setProducts(INITIAL_PRODUCTS);
    
    setIsLoading(false);
    setIsSyncing(false);
  }, []);

  useEffect(() => { syncFromCloud(true); }, [syncFromCloud]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const shippingCost = shippingMethod === 'express' ? 50000 : 25000;
  const grandTotal = cartTotal + shippingCost + 2500;

  const generateOrderId = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `SS-${date}-${rand}`;
  };

  const handleCheckout = async () => {
    if (!address.name || !address.phone || !address.detail) return alert('Lengkapi data!');
    
    const newOrder: Order = {
      id: generateOrderId(),
      customerName: address.name,
      customerPhone: address.phone,
      address: address.detail,
      items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
      total: grandTotal,
      status: 'Pending',
      createdAt: new Date().toLocaleString('id-ID'),
      shippingMethod,
      paymentMethod
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    // Save to Cloud
    const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;
    const orderRow: Product = {
      id: 'SETTINGS_ORDERS', name: 'Orders', price: 0, category: 'System', images: [], story: '', rating: 0, soldCount: 0,
      description: JSON.stringify(updatedOrders)
    };
    
    // Also update finance (log the order as potential income)
    const newFinance: FinanceRecord = { id: `FIN-${Date.now()}`, type: 'Income', amount: grandTotal, note: `Order ${newOrder.id}`, date: new Date().toISOString() };
    const updatedFinance = [newFinance, ...finances];
    const financeRow: Product = {
      id: 'SETTINGS_FINANCE', name: 'Finance', price: 0, category: 'System', images: [], story: '', rating: 0, soldCount: 0,
      description: JSON.stringify(updatedFinance)
    };

    await updateStoreData(scriptUrl, [orderRow, financeRow, ...products.map(p => ({...p, image: p.images.join(',')}))]);

    const msg = `Halo StoryStore!%0A%0ASaya telah melakukan pemesanan.%0AID Pesanan: *${newOrder.id}*%0ANama: ${newOrder.customerName}%0ATotal: Rp ${grandTotal.toLocaleString('id-ID')}%0A%0ASilakan konfirmasi pesanan saya.`;
    window.open(`https://wa.me/6281234567890?text=${msg}`);
    
    alert(`Pesanan Berhasil! ID Anda: ${newOrder.id}. Simpan ID ini untuk melacak pesanan.`);
    setCart([]);
    setRoute(AppRoute.HOME);
  };

  const renderTracking = () => (
    <div className="max-w-2xl mx-auto px-4 py-20">
       <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-100 text-center space-y-8">
          <div className="w-20 h-20 bg-orange-50 text-[#ee4d2d] rounded-3xl flex items-center justify-center mx-auto"><SearchCode size={40}/></div>
          <div><h2 className="text-2xl font-bold">Lacak Pesanan</h2><p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-2">Pantau status pengiriman paket Anda</p></div>
          <div className="flex gap-2 bg-stone-50 p-2 rounded-2xl border border-stone-100">
             <input type="text" placeholder="Masukkan ID Pesanan (SS-XXXX-XXXX)" value={trackingId} onChange={e => setTrackingId(e.target.value)} className="flex-1 bg-transparent px-4 py-3 text-sm font-bold outline-none" />
             <button onClick={() => setFoundOrder(orders.find(o => o.id === trackingId) || null)} className="bg-stone-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Cari</button>
          </div>

          {foundOrder && (
            <div className="pt-8 border-t border-stone-100 text-left space-y-6 animate-in fade-in slide-in-from-top-4">
               <div className="flex justify-between items-center bg-orange-50 p-5 rounded-2xl border border-orange-100">
                  <div><p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Status Saat Ini</p><p className="text-xl font-black text-[#ee4d2d]">{foundOrder.status}</p></div>
                  <Package size={32} className="text-[#ee4d2d]" />
               </div>
               <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="bg-stone-50 p-4 rounded-xl"><p className="text-stone-400 mb-1">Penerima</p><p>{foundOrder.customerName}</p></div>
                  <div className="bg-stone-50 p-4 rounded-xl"><p className="text-stone-400 mb-1">Tanggal</p><p>{foundOrder.createdAt}</p></div>
               </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Alur Pengiriman</p>
                  {['Pending', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai'].map((s, i) => {
                    const isPassed = ['Pending', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai'].indexOf(foundOrder.status) >= i;
                    return (
                      <div key={s} className="flex items-center gap-4">
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${isPassed ? 'bg-[#ee4d2d] text-white' : 'bg-stone-100 text-stone-300'}`}>{isPassed ? <CheckCircle2 size={12}/> : i+1}</div>
                         <p className={`text-sm ${isPassed ? 'font-black text-stone-900' : 'text-stone-300'}`}>{s}</p>
                      </div>
                    )
                  })}
               </div>
            </div>
          )}
          {trackingId && !foundOrder && <p className="text-red-500 text-xs font-bold">ID Pesanan tidak ditemukan. Pastikan penulisan benar.</p>}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24">
      <Navbar onNavigate={setRoute} cartCount={cart.reduce((s,i) => s + i.quantity, 0)} />
      {isLoading ? <div className="h-screen flex items-center justify-center">Loading...</div> : (
        <main>
          {route === AppRoute.HOME && (
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
               {/* Banner & Categories omitted for brevity in this snippet */}
               <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Terbaru Untuk Anda</h2><button onClick={() => setRoute(AppRoute.TRACKING)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ee4d2d] bg-orange-50 px-4 py-2 rounded-full"><History size={14}/> Lacak Pesanan</button></div>
               <div className="grid grid-cols-2 md:grid-cols-6 gap-4">{products.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => setCart([...cart, {...prod, quantity: 1}])} onViewDetail={() => {}} />)}</div>
            </div>
          )}
          {route === AppRoute.TRACKING && renderTracking()}
          {route === AppRoute.CHECKOUT && (
            <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-3"><MapPin className="text-[#ee4d2d]"/> Pengiriman</h2>
                  <input type="text" placeholder="Nama Lengkap" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-stone-50 p-4 rounded-xl text-sm font-bold border border-stone-100 outline-none focus:ring-2 focus:ring-[#ee4d2d]" />
                  <input type="text" placeholder="WhatsApp (62...)" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-stone-50 p-4 rounded-xl text-sm font-bold border border-stone-100 outline-none focus:ring-2 focus:ring-[#ee4d2d]" />
                  <textarea placeholder="Alamat Lengkap" value={address.detail} onChange={e => setAddress({...address, detail: e.target.value})} className="w-full bg-stone-50 p-4 rounded-xl text-sm h-32 border border-stone-100 outline-none focus:ring-2 focus:ring-[#ee4d2d]" />
               </div>
               <div className="bg-stone-900 p-8 rounded-[2.5rem] shadow-2xl text-white space-y-8">
                  <h3 className="text-xl font-bold">Ringkasan</h3>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-center"><span className="text-sm font-bold">Total Bayar</span><span className="text-3xl font-black text-[#ee4d2d]">Rp {grandTotal.toLocaleString('id-ID')}</span></div>
                  <button onClick={handleCheckout} className="w-full bg-[#ee4d2d] py-6 rounded-2xl font-black text-xs uppercase tracking-widest">Konfirmasi & Bayar</button>
               </div>
            </div>
          )}
          {route === AppRoute.ADMIN && (
            <AdminProductManager 
              products={products} onUpdateProducts={setProducts} 
              bannerUrls={heroBanners} onUpdateBanners={setHeroBanners} 
              categories={categories} onUpdateCategories={setCategories}
              orders={orders} onUpdateOrders={setOrders}
              finances={finances} onUpdateFinances={setFinances}
            />
          )}
        </main>
      )}
    </div>
  );
};

export default App;
