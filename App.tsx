
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppRoute, Product, CartItem, CategoryConfig, Order, OrderStatus } from './types';
import { INITIAL_PRODUCTS, GLOBAL_CONFIG } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import AdminProductManager from './components/AdminProductManager';
import { 
  Trash2, Plus, Minus, 
  Star, ShoppingCart, ShoppingBag, 
  ChevronRight, MapPin, Truck, Lock, 
  Home, Grid, User, LayoutDashboard, Search,
  ArrowRight, Zap, Smartphone, Utensils, Laptop, Watch, Headphones,
  Sparkles, ChevronLeft, Wifi, CreditCard, Wallet, Ticket, CheckCircle2, ShieldCheck,
  Gamepad, Heart, Camera, Coffee, Gift, Loader2, PackageSearch
} from 'lucide-react';
import { getStoreData, updateStoreData, createOrderInCloud } from './services/cloudService';

const DEFAULT_BANNERS = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200"
];

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'cat-1', name: 'Elektronik', icon: 'Smartphone', visible: true },
  { id: 'cat-2', name: 'Komputer', icon: 'Laptop', visible: true },
  { id: 'cat-3', name: 'Fashion', icon: 'User', visible: true },
  { id: 'cat-4', name: 'Aksesoris', icon: 'Watch', visible: true }
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
    Grid: <Grid size={size} />
  };
  return icons[iconName] || <Grid size={size} />;
};

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [categories, setCategories] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES);
  const [heroBanners] = useState<string[]>(DEFAULT_BANNERS);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [address, setAddress] = useState({ name: '', phone: '', detail: '' });
  const [adminPassInput, setAdminPassInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;

  const syncFromCloud = useCallback(async (isInitial = false) => {
    if (!isInitial) setIsSyncing(true);
    const cloudData = await getStoreData(scriptUrl);
    if (cloudData && cloudData.length > 0) {
      setProducts(cloudData);
    } else if (isInitial) {
      setProducts(INITIAL_PRODUCTS);
    }
    setIsLoading(false);
    setIsSyncing(false);
  }, [scriptUrl]);

  useEffect(() => {
    syncFromCloud(true);
  }, [syncFromCloud]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const generateOrderId = () => {
    const prefix = "SB";
    const datePart = new Date().toISOString().slice(2,10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `${prefix}-${datePart}-${randomPart}`;
  };

  const handleCheckout = async () => {
    if (!address.name || !address.phone || !address.detail) return alert('Lengkapi data pengiriman!');
    
    const orderId = generateOrderId();
    const newOrder: Order = {
      orderId,
      customerName: address.name,
      phone: address.phone,
      address: address.detail,
      items: cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
      total: cartTotal + (shippingMethod === 'express' ? 50000 : 25000),
      status: OrderStatus.PENDING,
      timestamp: new Date().toISOString()
    };

    setIsLoading(true);
    const success = await createOrderInCloud(scriptUrl, newOrder);
    setIsLoading(false);

    if (success) {
      const msg = `Halo StoryBali!%0A%0ASaya telah memesan dengan ID: ${orderId}%0ADetail: ${newOrder.items}%0ATotal: Rp ${newOrder.total.toLocaleString()}%0A%0AStatus: PENDING`;
      window.open(`https://wa.me/6281234567890?text=${msg}`);
      alert(`Pesanan Berhasil! Catat ID Pesanan Anda: ${orderId}`);
      setCart([]);
      setRoute(AppRoute.HOME);
    } else {
      alert('Gagal membuat pesanan cloud. Coba lagi.');
    }
  };

  const renderHome = () => (
    <div className="space-y-6 pb-20 bg-[#f5f5f5]">
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
           <div className="relative h-[200px] md:h-[350px] rounded-[2rem] overflow-hidden shadow-xl">
              <img src={heroBanners[activeBannerIdx]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
                 <h2 className="text-3xl md:text-5xl font-black italic">StoryBali Store</h2>
                 <p className="text-sm font-bold opacity-80">Local Soul, Global Quality.</p>
              </div>
           </div>
        </div>
      </section>

      <section className="bg-white py-6 overflow-x-auto no-scrollbar">
         <div className="max-w-7xl mx-auto px-4 flex gap-6">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => { setActiveCategory(cat.name); setRoute(AppRoute.CATALOG); }} className="flex flex-col items-center gap-3 shrink-0">
                 <div className="w-14 h-14 bg-stone-50 text-stone-900 rounded-2xl flex items-center justify-center border border-stone-100 hover:bg-[#ee4d2d] hover:text-white transition-all">
                    {renderCategoryIcon(cat.icon)}
                 </div>
                 <span className="text-[10px] font-bold text-stone-600">{cat.name}</span>
              </button>
            ))}
         </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-stone-900 font-bold text-xl">Rekomendasi Untukmu</h2>
           {isSyncing && <div className="animate-pulse text-[#ee4d2d]"><Wifi size={16}/></div>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
           {products.map(product => (<ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={(p) => { setSelectedProduct(p); setRoute(AppRoute.PRODUCT_DETAIL); }} />))}
        </div>
      </section>
    </div>
  );

  const renderTrackOrder = () => {
    const [searchId, setSearchId] = useState('');
    const [foundOrder, setFoundOrder] = useState<Order | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
      if (!searchId) return;
      setIsSearching(true);
      const allOrders = await getStoreData(scriptUrl, "Orders");
      const order = allOrders?.find((o: any) => o.orderId.toLowerCase() === searchId.toLowerCase());
      setFoundOrder(order || null);
      if (!order) alert('ID Pesanan tidak ditemukan.');
      setIsSearching(false);
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-24">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-stone-100 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-50 text-[#ee4d2d] rounded-2xl flex items-center justify-center mx-auto"><PackageSearch size={32}/></div>
            <h1 className="text-2xl font-bold">Lacak Pesanan</h1>
            <p className="text-xs text-stone-400 font-medium">Masukkan ID Pesanan (contoh: SB-XXXXXX) untuk melihat status paket Anda.</p>
          </div>

          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="SB-XXXXXX" 
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl p-5 text-center font-black text-xl tracking-widest outline-none focus:ring-2 ring-[#ee4d2d]/20 transition-all"
            />
            <button 
              onClick={handleSearch}
              className="bg-stone-900 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#ee4d2d] transition-colors"
            >
              {isSearching ? <Loader2 className="animate-spin"/> : 'Cari'}
            </button>
          </div>

          {foundOrder && (
            <div className="pt-10 border-t border-stone-50 space-y-8 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Status Saat Ini</p>
                  <p className="text-2xl font-black text-[#ee4d2d] italic">{foundOrder.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Penerima</p>
                  <p className="text-sm font-bold text-stone-900">{foundOrder.customerName}</p>
                </div>
              </div>

              {/* Timeline UI */}
              <div className="relative flex justify-between items-center px-4">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-100 -translate-y-1/2 -z-10"></div>
                {[OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].map((st, i) => {
                  const isActive = foundOrder.status === st;
                  const isDone = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].indexOf(foundOrder.status as any) >= i;
                  return (
                    <div key={st} className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${isDone ? 'bg-[#ee4d2d] border-[#ee4d2d]' : 'bg-white border-stone-200'} ${isActive ? 'ring-4 ring-orange-100 animate-pulse' : ''}`}></div>
                      <span className={`text-[8px] font-black uppercase tracking-tight ${isActive ? 'text-[#ee4d2d]' : 'text-stone-300'}`}>{st}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCheckout = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
       <h1 className="text-3xl font-bold mb-10">Checkout Pesanan</h1>
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
             <div className="bg-white p-8 rounded-[2rem] border border-stone-100 space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2"><MapPin size={20} className="text-[#ee4d2d]"/> Alamat Pengiriman</h2>
                <div className="space-y-4">
                   <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-stone-50 p-4 rounded-xl border border-stone-100" placeholder="Nama Lengkap" />
                   <input type="text" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-stone-50 p-4 rounded-xl border border-stone-100" placeholder="Nomor WA" />
                   <textarea value={address.detail} onChange={e => setAddress({...address, detail: e.target.value})} className="w-full bg-stone-50 p-4 rounded-xl border border-stone-100 h-24" placeholder="Alamat Lengkap" ></textarea>
                </div>
             </div>
             <div className="bg-white p-8 rounded-[2rem] border border-stone-100 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2"><Truck size={20} className="text-[#ee4d2d]"/> Opsi Pengiriman</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShippingMethod('standard')} className={`p-4 rounded-xl border-2 text-left ${shippingMethod === 'standard' ? 'border-[#ee4d2d] bg-orange-50' : 'border-stone-100'}`}><p className="font-bold text-xs">Reguler</p><p className="text-[10px] text-stone-400">Rp 25.000</p></button>
                  <button onClick={() => setShippingMethod('express')} className={`p-4 rounded-xl border-2 text-left ${shippingMethod === 'express' ? 'border-[#ee4d2d] bg-orange-50' : 'border-stone-100'}`}><p className="font-bold text-xs">Kilat</p><p className="text-[10px] text-stone-400">Rp 50.000</p></button>
                </div>
             </div>
          </div>
          <div className="lg:col-span-4">
             <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] space-y-6">
                <h3 className="font-bold">Ringkasan</h3>
                <div className="flex justify-between text-xs opacity-60"><span>Subtotal</span><span>Rp {cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs opacity-60"><span>Ongkir</span><span>Rp {(shippingMethod === 'express' ? 50000 : 25000).toLocaleString()}</span></div>
                <div className="pt-4 border-t border-white/10 flex justify-between font-black"><span>Total</span><span className="text-xl text-[#ee4d2d]">Rp {(cartTotal + (shippingMethod === 'express' ? 50000 : 25000)).toLocaleString()}</span></div>
                <button onClick={handleCheckout} className="w-full bg-[#ee4d2d] py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                   {isLoading ? <Loader2 className="animate-spin mx-auto"/> : 'Pesan Sekarang'}
                </button>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      <main className="main-content">
        {isLoading && route !== AppRoute.CHECKOUT ? (
          <div className="h-[70vh] flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-[#ee4d2d]" size={40}/><p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Synchronizing StoryBali...</p></div>
        ) : (
          <>
            {route === AppRoute.HOME && renderHome()}
            {route === AppRoute.TRACK_ORDER && renderTrackOrder()}
            {route === AppRoute.CATALOG && <SearchPage products={products} activeCategory={activeCategory} onAddToCart={addToCart} onViewDetail={(p: any) => { setSelectedProduct(p); setRoute(AppRoute.PRODUCT_DETAIL); }} />}
            {route === AppRoute.PRODUCT_DETAIL && selectedProduct && (
               <div className="max-w-7xl mx-auto px-4 py-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <img src={selectedProduct.images[0]} className="w-full aspect-square object-cover rounded-[3rem] shadow-2xl" />
                     <div className="space-y-6">
                        <span className="text-[#ee4d2d] text-[10px] font-black uppercase tracking-widest">{selectedProduct.category}</span>
                        <h1 className="text-4xl font-bold">{selectedProduct.name}</h1>
                        <p className="text-3xl font-black italic text-[#ee4d2d]">Rp {selectedProduct.price.toLocaleString()}</p>
                        <p className="text-stone-500 leading-relaxed">{selectedProduct.description}</p>
                        <div className="pt-8 flex gap-4">
                           <button onClick={() => { addToCart(selectedProduct); setRoute(AppRoute.CART); }} className="flex-1 bg-stone-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest">Buy Now</button>
                        </div>
                     </div>
                  </div>
               </div>
            )}
            {route === AppRoute.CART && <CartPage cart={cart} setCart={setCart} onCheckout={() => setRoute(AppRoute.CHECKOUT)} onBack={() => setRoute(AppRoute.HOME)} />}
            {route === AppRoute.ADMIN && (isAdminAuthenticated ? (
              <AdminProductManager products={products} onUpdateProducts={setProducts} bannerUrls={heroBanners} onUpdateBanners={() => {}} categories={categories} onUpdateCategories={setCategories} />
            ) : (
               <div className="max-w-md mx-auto py-24 px-4 text-center space-y-8 bg-white mt-20 rounded-[3rem] shadow-xl">
                 <Lock className="mx-auto text-[#ee4d2d]" size={40}/>
                 <input type="password" placeholder="Admin PIN" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)} className="w-full bg-stone-50 p-5 rounded-xl text-center font-black text-2xl tracking-[0.5em]" />
                 <button onClick={() => adminPassInput === GLOBAL_CONFIG.ADMIN_PASSWORD ? setIsAdminAuthenticated(true) : alert('Salah!')} className="w-full bg-[#ee4d2d] text-white py-4 rounded-xl font-black">Login</button>
               </div>
            ))}
            {route === AppRoute.CHECKOUT && renderCheckout()}
          </>
        )}
      </main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around items-center z-50">
         <button onClick={() => setRoute(AppRoute.HOME)} className={route === AppRoute.HOME ? 'text-[#ee4d2d]' : 'text-stone-300'}><Home size={20}/></button>
         <button onClick={() => setRoute(AppRoute.TRACK_ORDER)} className={route === AppRoute.TRACK_ORDER ? 'text-[#ee4d2d]' : 'text-stone-300'}><Truck size={20}/></button>
         <button onClick={() => setRoute(AppRoute.CART)} className="relative text-stone-300"><ShoppingCart size={20}/>{cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#ee4d2d] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}</button>
         <button onClick={() => setRoute(AppRoute.ADMIN)} className={route === AppRoute.ADMIN ? 'text-[#ee4d2d]' : 'text-stone-300'}><User size={20}/></button>
      </div>
    </div>
  );
};

const SearchPage = ({ products, activeCategory, onAddToCart, onViewDetail }: any) => {
  const [q, setQ] = useState('');
  const f = products.filter((p: any) => (activeCategory === 'Semua' || p.category === activeCategory) && p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="relative mb-10"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={20}/><input type="text" placeholder="Cari di StoryBali..." value={q} onChange={e => setQ(e.target.value)} className="w-full bg-white p-6 pl-16 rounded-2xl border border-stone-100 shadow-sm" /></div>
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{f.map((p: any) => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onViewDetail={onViewDetail} />)}</div>
    </div>
  );
};

const CartPage = ({ cart, setCart, onCheckout, onBack }: any) => {
  const t = cart.reduce((s: any, i: any) => s + (i.price * i.quantity), 0);
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
       <h1 className="text-2xl font-bold mb-8">Keranjang Belanja</h1>
       {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-100"><ShoppingBag size={60} className="mx-auto text-stone-100 mb-6"/><p className="text-stone-400 mb-6">Kosong nih, yuk belanja!</p><button onClick={onBack} className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold">Mulai Belanja</button></div>
       ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-4">{cart.map((item: any) => (<div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center gap-4"><img src={item.images[0]} className="w-16 h-16 rounded-xl object-cover"/><div className="flex-1 font-bold text-sm">{item.name}</div><div className="text-[#ee4d2d] font-black">Rp {item.price.toLocaleString()}</div><button onClick={() => setCart(cart.filter((i: any) => i.id !== item.id))} className="text-stone-200"><Trash2 size={16}/></button></div>))}</div>
             <div className="bg-stone-900 p-8 rounded-[2.5rem] text-white space-y-6">
                <div className="flex justify-between font-bold"><span>Total</span><span className="text-[#ee4d2d]">Rp {t.toLocaleString()}</span></div>
                <button onClick={onCheckout} className="w-full bg-[#ee4d2d] py-4 rounded-xl font-black text-xs uppercase tracking-widest">Lanjut Checkout</button>
             </div>
          </div>
       )}
    </div>
  );
};

export default App;
