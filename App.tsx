
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppRoute, Product, CartItem, CategoryConfig, Order, FinanceRecord } from './types';
import { INITIAL_PRODUCTS, GLOBAL_CONFIG } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import AdminProductManager from './components/AdminProductManager';
import ChatWidget from './components/ChatWidget';
import { 
  Trash2, Plus, Minus, 
  Star, ShoppingCart, ShoppingBag, 
  ChevronRight, MapPin, Truck, Lock, 
  Home, User, Search,
  ArrowRight, Zap, Smartphone, Utensils, Laptop, Watch, Headphones,
  Sparkles, ChevronLeft, Wifi, CreditCard, Wallet, Ticket, CheckCircle2, ShieldCheck,
  Package, ClipboardList, SearchCode, History, BarChart3, Grid, Camera, Coffee, Gamepad, Gift, Heart
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
    Smartphone: <Smartphone size={size} />,
    Laptop: <Laptop size={size} />,
    User: <User size={size} />,
    Zap: <Zap size={size} />,
    Watch: <Watch size={size} />,
    Headphones: <Headphones size={size} />,
    Home: <Home size={size} />,
    Utensils: <Utensils size={size} />,
    Gamepad: <Gamepad size={size} />,
    Heart: <Heart size={size} />,
    Camera: <Camera size={size} />,
    Coffee: <Coffee size={size} />,
    Gift: <Gift size={size} />
  };
  return icons[iconName] || <Grid size={size} />;
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
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Semua');

  // Checkout states
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [address, setAddress] = useState({ name: '', phone: '', detail: '' });
  
  // Tracking states
  const [trackingId, setTrackingId] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);

  const [heroBanners, setHeroBanners] = useState<string[]>(DEFAULT_BANNERS);

  const syncFromCloud = useCallback(async (isInitial = false) => {
    const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;
    if (!scriptUrl) return;
    if (!isInitial) setIsSyncing(true);
    const cloudData = await getStoreData(scriptUrl);
    
    if (cloudData && cloudData.length > 0) {
      // Filter out system rows
      setProducts(cloudData.filter(p => !['SETTINGS_BANNER', 'SETTINGS_CATEGORIES', 'SETTINGS_ORDERS', 'SETTINGS_FINANCE'].includes(p.id)));
      
      const bannerSetting = cloudData.find(p => p.id === 'SETTINGS_BANNER');
      if (bannerSetting && bannerSetting.description) setHeroBanners(JSON.parse(bannerSetting.description));

      const catSetting = cloudData.find(p => p.id === 'SETTINGS_CATEGORIES');
      if (catSetting && catSetting.description) setCategories(JSON.parse(catSetting.description));

      const orderSetting = cloudData.find(p => p.id === 'SETTINGS_ORDERS');
      if (orderSetting && orderSetting.description) setOrders(JSON.parse(orderSetting.description));

      const financeSetting = cloudData.find(p => p.id === 'SETTINGS_FINANCE');
      if (financeSetting && financeSetting.description) setFinances(JSON.parse(financeSetting.description));
    } else if (isInitial) {
      setProducts(INITIAL_PRODUCTS);
    }
    setIsLoading(false);
    setIsSyncing(false);
  }, []);

  useEffect(() => { syncFromCloud(true); }, [syncFromCloud]);

  // Banner rotation
  useEffect(() => {
    if (route !== AppRoute.HOME) return;
    const interval = setInterval(() => setActiveBannerIdx(prev => (prev + 1) % heroBanners.length), 5000);
    return () => clearInterval(interval);
  }, [route, heroBanners]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const shippingCost = shippingMethod === 'express' ? 50000 : 25000;
  const grandTotal = cartTotal + shippingCost + 2500;

  const generateOrderId = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `SS-${dateStr}-${rand}`;
  };

  const handleCheckout = async () => {
    if (!address.name || !address.phone || !address.detail) return alert('Mohon lengkapi data pengiriman!');
    
    const newOrderId = generateOrderId();
    const newOrder: Order = {
      id: newOrderId,
      customerName: address.name,
      customerPhone: address.phone,
      address: address.detail,
      items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
      total: grandTotal,
      status: 'Pending',
      createdAt: new Date().toLocaleString('id-ID'),
      shippingMethod,
      paymentMethod: 'WhatsApp Confirmation'
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    // Otomatis catat sebagai potensi pemasukan
    const newFinance: FinanceRecord = {
      id: `FIN-${Date.now()}`,
      type: 'Income',
      amount: grandTotal,
      note: `Pesanan Baru: ${newOrderId}`,
      date: new Date().toISOString()
    };
    const updatedFinances = [newFinance, ...finances];
    setFinances(updatedFinances);

    // Simpan ke Cloud
    const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;
    const systemRows = [
      { id: 'SETTINGS_BANNER', name: 'Banners', description: JSON.stringify(heroBanners) },
      { id: 'SETTINGS_CATEGORIES', name: 'Categories', description: JSON.stringify(categories) },
      { id: 'SETTINGS_ORDERS', name: 'Orders', description: JSON.stringify(updatedOrders) },
      { id: 'SETTINGS_FINANCE', name: 'Finance', description: JSON.stringify(updatedFinances) }
    ];

    const payload = [...systemRows, ...products.map(p => ({ ...p, image: p.images.join(',') }))] as any;
    await updateStoreData(scriptUrl, payload);

    // Redirect to WhatsApp
    const itemsStr = cart.map(item => `- ${item.name} (x${item.quantity})`).join('%0A');
    const msg = `Halo StoryStore!%0A%0ASaya ingin memesan:%0A${itemsStr}%0A%0ATotal: Rp ${grandTotal.toLocaleString('id-ID')}%0AID Pesanan: *${newOrderId}*%0A%0ANama: ${address.name}%0AAlamat: ${address.detail}`;
    window.open(`https://wa.me/6281234567890?text=${msg}`);
    
    alert(`Pesanan Berhasil! ID Anda: ${newOrderId}. Gunakan ID ini untuk melacak status pesanan Anda.`);
    setCart([]);
    setRoute(AppRoute.HOME);
  };

  const renderHome = () => (
    <div className="space-y-6 pb-20 bg-[#f5f5f5]">
      {/* Hero */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
           <div className="relative h-[220px] md:h-[400px] rounded-3xl overflow-hidden group shadow-xl">
              <div className="absolute inset-0 w-full h-full">
                {heroBanners.map((url, idx) => (
                  <div key={idx} className={`absolute inset-0 transition-all duration-1000 transform ${idx === activeBannerIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                    <img src={url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-10 left-6 text-white z-10 pointer-events-none">
                 <div className="bg-[#ee4d2d] text-white inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2">HOT TRENDING</div>
                 <h2 className="text-3xl md:text-5xl font-black leading-tight">Storybali Store</h2>
                 <p className="text-xs md:text-lg opacity-90 font-bold">Belanja Global, Harga Lokal.</p>
              </div>
           </div>
        </div>
      </section>

      {/* Categories slider */}
      <section className="bg-white py-6 overflow-x-auto no-scrollbar border-y border-stone-50">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
           <button onClick={() => { setActiveCategory('Semua'); setRoute(AppRoute.CATALOG); }} className="flex flex-col items-center gap-2 group shrink-0">
              <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-[#ee4d2d] group-hover:text-white transition-all"><Grid size={20}/></div>
              <span className="text-[10px] font-bold">Semua</span>
           </button>
           {categories.filter(c => c.visible).map(cat => (
             <button key={cat.id} onClick={() => { setActiveCategory(cat.name); setRoute(AppRoute.CATALOG); }} className="flex flex-col items-center gap-2 group shrink-0">
                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-[#ee4d2d] group-hover:text-white transition-all">{renderCategoryIcon(cat.icon, 20)}</div>
                <span className="text-[10px] font-bold">{cat.name}</span>
             </button>
           ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-xl font-bold">Rekomendasi Hari Ini</h2>
           <button onClick={() => setRoute(AppRoute.TRACKING)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ee4d2d] bg-orange-50 px-4 py-2 rounded-full hover:bg-[#ee4d2d] hover:text-white transition-all">
              <History size={14}/> Lacak Pesanan
           </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
           {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={(prod) => setCart([...cart, {...prod, quantity: 1}])} onViewDetail={(prod) => { setRoute(AppRoute.PRODUCT_DETAIL); }} />)}
        </div>
      </section>
    </div>
  );

  const renderTracking = () => (
    <div className="max-w-2xl mx-auto px-4 py-16">
       <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-100 text-center space-y-8 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-orange-50 text-[#ee4d2d] rounded-3xl flex items-center justify-center mx-auto shadow-inner"><SearchCode size={40}/></div>
          <div><h2 className="text-2xl font-bold tracking-tight">Cek Status Pesanan</h2><p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-2">Cukup masukkan ID StoryStore Anda</p></div>
          <div className="flex gap-2 bg-stone-50 p-2 rounded-2xl border border-stone-100 ring-2 ring-transparent focus-within:ring-[#ee4d2d]/20 transition-all">
             <input type="text" placeholder="SS-XXXXXXXX-XXXX" value={trackingId} onChange={e => setTrackingId(e.target.value)} className="flex-1 bg-transparent px-4 py-3 text-sm font-bold outline-none uppercase" />
             <button onClick={() => setFoundOrder(orders.find(o => o.id === trackingId.toUpperCase()) || null)} className="bg-stone-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Lacak</button>
          </div>

          {foundOrder && (
            <div className="pt-10 border-t border-stone-100 text-left space-y-8 animate-in fade-in slide-in-from-top-6 duration-500">
               <div className="flex justify-between items-center bg-orange-50 p-6 rounded-3xl border border-orange-100">
                  <div><p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Status Terakhir</p><p className="text-2xl font-black text-[#ee4d2d]">{foundOrder.status}</p></div>
                  <Package size={40} className="text-[#ee4d2d] opacity-50" />
               </div>
               
               <div className="relative pt-4 px-2">
                  <div className="absolute left-4 top-4 bottom-4 w-1 bg-stone-100 rounded-full"></div>
                  {['Pending', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai'].map((s, i) => {
                    const statusOrder = ['Pending', 'Diproses', 'Dikemas', 'Dikirim', 'Selesai'];
                    const currentIdx = statusOrder.indexOf(foundOrder.status);
                    const isDone = i <= currentIdx;
                    return (
                      <div key={s} className="relative flex items-center gap-6 mb-8 last:mb-0">
                         <div className={`w-3 h-3 rounded-full z-10 ${isDone ? 'bg-[#ee4d2d] ring-4 ring-orange-100' : 'bg-stone-200'}`}></div>
                         <div>
                            <p className={`text-sm font-bold ${isDone ? 'text-stone-900' : 'text-stone-300'}`}>{s}</p>
                            {isDone && i === currentIdx && <p className="text-[9px] text-emerald-500 font-black uppercase mt-1">Status Aktif</p>}
                         </div>
                      </div>
                    )
                  })}
               </div>

               <div className="bg-stone-50 p-6 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Detail Penerima</p>
                  <p className="font-bold text-sm text-stone-900">{foundOrder.customerName}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{foundOrder.address}</p>
               </div>
            </div>
          )}
          {trackingId && !foundOrder && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">ID tidak ditemukan</p>}
       </div>
    </div>
  );

  const renderCheckout = () => (
    <div className="max-w-7xl mx-auto px-4 py-12 pb-32">
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
             <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-10">
                <div className="flex items-center gap-4 border-b border-stone-50 pb-6"><div className="bg-orange-50 text-[#ee4d2d] p-3 rounded-2xl"><MapPin size={24}/></div><h2 className="text-xl font-bold">Alamat Pengiriman</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <input type="text" placeholder="Nama Lengkap" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="bg-stone-50 p-5 rounded-2xl text-sm font-bold outline-none border border-stone-100 focus:ring-2 ring-orange-100" />
                   <input type="text" placeholder="WhatsApp (628...)" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="bg-stone-50 p-5 rounded-2xl text-sm font-bold outline-none border border-stone-100 focus:ring-2 ring-orange-100" />
                   <textarea placeholder="Alamat Lengkap & Patokan" value={address.detail} onChange={e => setAddress({...address, detail: e.target.value})} className="md:col-span-2 bg-stone-50 p-6 rounded-[2rem] text-sm h-32 border border-stone-100 outline-none resize-none focus:ring-2 ring-orange-100" />
                </div>
             </section>
             
             <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-8">
                <div className="flex items-center gap-4"><Truck size={24} className="text-[#ee4d2d]"/><h3 className="font-bold">Opsi Pengiriman</h3></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <button onClick={() => setShippingMethod('standard')} className={`p-6 rounded-2xl border-2 text-left transition-all ${shippingMethod === 'standard' ? 'border-[#ee4d2d] bg-orange-50' : 'border-stone-50 hover:bg-stone-50'}`}>
                      <p className="font-black text-xs uppercase tracking-widest mb-1">Reguler</p>
                      <p className="text-sm font-bold">Rp 25.000 (3-5 Hari)</p>
                   </button>
                   <button onClick={() => setShippingMethod('express')} className={`p-6 rounded-2xl border-2 text-left transition-all ${shippingMethod === 'express' ? 'border-[#ee4d2d] bg-orange-50' : 'border-stone-50 hover:bg-stone-50'}`}>
                      <p className="font-black text-xs uppercase tracking-widest mb-1">Express</p>
                      <p className="text-sm font-bold">Rp 50.000 (1-2 Hari)</p>
                   </button>
                </div>
             </section>
          </div>

          <div className="lg:col-span-4">
             <div className="bg-stone-900 p-10 rounded-[3rem] shadow-2xl text-white sticky top-28 space-y-8">
                <h3 className="text-xl font-bold">Ringkasan Pesanan</h3>
                <div className="space-y-4 border-b border-white/10 pb-8 text-white/60 text-xs font-bold uppercase tracking-widest">
                   <div className="flex justify-between"><span>Produk</span><span>Rp {cartTotal.toLocaleString('id-ID')}</span></div>
                   <div className="flex justify-between"><span>Ongkir</span><span>Rp {shippingCost.toLocaleString('id-ID')}</span></div>
                   <div className="flex justify-between"><span>Layanan</span><span>Rp 2.500</span></div>
                </div>
                <div className="flex justify-between items-center"><span className="text-sm font-bold">Total Akhir</span><span className="text-3xl font-black text-[#ee4d2d]">Rp {grandTotal.toLocaleString('id-ID')}</span></div>
                <button onClick={handleCheckout} className="w-full bg-[#ee4d2d] py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Konfirmasi Pesanan</button>
             </div>
          </div>
       </div>
    </div>
  );

  const BottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex justify-around items-center h-16 z-50 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      {[
        { id: AppRoute.HOME, icon: <Home size={20}/>, label: 'Beranda' },
        { id: AppRoute.CATALOG, icon: <Search size={20}/>, label: 'Cari' },
        { id: AppRoute.CART, icon: (
          <div className="relative">
            <ShoppingCart size={20}/>
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#ee4d2d] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">{cartCount}</span>}
          </div>
        ), label: 'Keranjang' },
        { id: AppRoute.ADMIN, icon: <User size={20}/>, label: 'Akun' }
      ].map(nav => (
        <button key={nav.id} onClick={() => setRoute(nav.id)} className={`flex flex-col items-center gap-1 transition-all ${route === nav.id ? 'text-[#ee4d2d]' : 'text-stone-400'}`}>
          {nav.icon}
          <span className="text-[10px] font-bold">{nav.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      <main className="main-content">
        {isLoading ? (
          <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
             <div className="w-16 h-16 border-4 border-stone-100 border-t-[#ee4d2d] rounded-full animate-spin"></div>
             <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Synchronizing Storybali...</p>
          </div>
        ) : (
          <>
            {route === AppRoute.HOME && renderHome()}
            {route === AppRoute.TRACKING && renderTracking()}
            {route === AppRoute.CHECKOUT && renderCheckout()}
            {route === AppRoute.ADMIN && (
              <AdminProductManager 
                products={products} onUpdateProducts={setProducts} 
                bannerUrls={heroBanners} onUpdateBanners={setHeroBanners} 
                categories={categories} onUpdateCategories={setCategories}
                orders={orders} onUpdateOrders={setOrders}
                finances={finances} onUpdateFinances={setFinances}
              />
            )}
          </>
        )}
      </main>
      <ChatWidget />
      <BottomNav />
    </div>
  );
};

export default App;
