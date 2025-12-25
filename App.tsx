
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppRoute, Product, CartItem } from './types';
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
  Sparkles, ChevronLeft, Wifi, CreditCard, Wallet, Ticket, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { getStoreData, updateStoreData } from './services/cloudService';

const DEFAULT_BANNERS = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200"
];

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checkout States
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [promoCode, setPromoCode] = useState('');

  const [heroBanners, setHeroBanners] = useState<string[]>(() => {
    const saved = localStorage.getItem('storystore_hero_banners');
    return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
  });

  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 22, seconds: 45 });
  
  const syncFromCloud = useCallback(async (isInitial = false) => {
    const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;
    if (!scriptUrl) return;
    if (!isInitial) setIsSyncing(true);
    const cloudData = await getStoreData(scriptUrl);
    if (cloudData && cloudData.length > 0) {
      const actualProducts = cloudData.filter(p => p.id !== 'SETTINGS_BANNER');
      if (JSON.stringify(actualProducts) !== JSON.stringify(products)) setProducts(actualProducts);
      const bannerSetting = cloudData.find(p => p.id === 'SETTINGS_BANNER');
      if (bannerSetting && bannerSetting.description) {
        try {
          const remoteBanners = JSON.parse(bannerSetting.description);
          if (JSON.stringify(remoteBanners) !== JSON.stringify(heroBanners)) {
            setHeroBanners(remoteBanners);
            localStorage.setItem('storystore_hero_banners', JSON.stringify(remoteBanners));
          }
        } catch (e) {}
      }
    } else if (isInitial) setProducts(INITIAL_PRODUCTS);
    setIsLoading(false);
    setIsSyncing(false);
  }, [products, heroBanners]);

  useEffect(() => {
    syncFromCloud(true);
    const pollInterval = setInterval(() => { if (route !== AppRoute.ADMIN) syncFromCloud(); }, 30000);
    return () => clearInterval(pollInterval);
  }, [syncFromCloud, route]);

  useEffect(() => {
    if (route !== AppRoute.HOME || heroBanners.length <= 1) return;
    const interval = setInterval(() => setActiveBannerIdx(prev => (prev + 1) % heroBanners.length), 5000);
    return () => clearInterval(interval);
  }, [route, heroBanners.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [adminPassInput, setAdminPassInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [address, setAddress] = useState({ name: '', phone: '', detail: '' });

  const categories = [
    { name: 'Elektronik', icon: <Smartphone size={24}/> },
    { name: 'Komputer', icon: <Laptop size={24}/> },
    { name: 'Fashion', icon: <User size={24}/> },
    { name: 'Wellness', icon: <Zap size={24}/> },
    { name: 'Aksesoris', icon: <Watch size={24}/> },
    { name: 'Audio', icon: <Headphones size={24}/> },
    { name: 'Home Decor', icon: <Home size={24}/> },
    { name: 'Peralatan', icon: <Utensils size={24}/> }
  ];

  useEffect(() => {
    const savedCart = localStorage.getItem('storystore_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('storystore_cart', JSON.stringify(cart));
  }, [cart]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const shippingCost = shippingMethod === 'express' ? 50000 : shippingMethod === 'standard' ? 25000 : 0;
  const serviceFee = 2500;
  const grandTotal = cartTotal + shippingCost + serviceFee;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setActiveImageIdx(0);
    setRoute(AppRoute.PRODUCT_DETAIL);
    window.scrollTo(0, 0);
  };

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

  const renderHome = () => (
    <div className="space-y-6 pb-20 bg-[#f5f5f5]">
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
           <div className="relative h-[220px] md:h-[400px] rounded-3xl overflow-hidden group shadow-xl">
              <div className="absolute inset-0 w-full h-full">
                {heroBanners.map((url, idx) => (
                  <div key={idx} className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${idx === activeBannerIdx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}><img src={url} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div></div>
                ))}
              </div>
              {heroBanners.length > 1 && (
                <>
                  <button onClick={() => setActiveBannerIdx(prev => (prev - 1 + heroBanners.length) % heroBanners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={24} /></button>
                  <button onClick={() => setActiveBannerIdx(prev => (prev + 1) % heroBanners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={24} /></button>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {heroBanners.map((_, idx) => (
                      <button key={idx} onClick={() => setActiveBannerIdx(idx)} className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeBannerIdx ? 'w-8 bg-[#ee4d2d]' : 'w-2 bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute bottom-10 left-6 md:bottom-16 md:left-12 text-white space-y-2 md:space-y-4 z-20 pointer-events-none">
                 <div className="bg-[#ee4d2d] text-white inline-block px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">OFFICIAL STORE</div>
                 <h2 className="text-3xl md:text-6xl font-black leading-tight">StoryStore Global</h2>
                 <p className="text-xs md:text-lg opacity-90 font-bold max-w-lg">Koleksi pilihan terbaik dari seluruh dunia.</p>
              </div>
           </div>
        </div>
      </section>

      <section className="bg-white py-8 border-y border-stone-50">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-8">
            {categories.map((cat, i) => (
              <button key={i} onClick={() => { setActiveCategory(cat.name); setRoute(AppRoute.CATALOG); }} className="flex flex-col items-center gap-3 group">
                 <div className="w-14 h-14 md:w-16 md:h-16 bg-stone-50 text-stone-900 rounded-[1.5rem] flex items-center justify-center border border-stone-100 group-hover:bg-[#ee4d2d] group-hover:text-white transition-all shadow-sm">{cat.icon}</div>
                 <span className="text-[10px] md:text-xs font-bold text-stone-600 text-center">{cat.name}</span>
              </button>
            ))}
         </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 space-y-8 py-10">
        <div className="flex items-center justify-between border-b border-stone-100 pb-6">
           <h2 className="text-stone-900 font-bold text-xl md:text-2xl tracking-tight">Koleksi Terbaru</h2>
           {isSyncing && <div className="flex items-center gap-2 text-stone-300 animate-pulse"><Wifi size={14} /><span className="text-[9px] font-black uppercase tracking-widest">Live Syncing...</span></div>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
           {products.map(product => (<ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />))}
        </div>
      </section>
    </div>
  );

  const renderCheckout = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 pb-32">
       {/* Checkout Header / Stepper */}
       <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div>
             <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Checkout</h1>
             <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] mt-2">Selesaikan Pesanan Global Anda</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-black text-xs">1</div>
                <span className="text-[9px] font-black uppercase text-stone-400">Cart</span>
             </div>
             <div className="w-12 h-[2px] bg-stone-900 -mt-6"></div>
             <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#ee4d2d] text-white flex items-center justify-center font-black text-xs shadow-lg shadow-orange-100">2</div>
                <span className="text-[9px] font-black uppercase text-stone-900">Details</span>
             </div>
             <div className="w-12 h-[2px] bg-stone-100 -mt-6"></div>
             <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-stone-50 text-stone-300 flex items-center justify-center font-black text-xs">3</div>
                <span className="text-[9px] font-black uppercase text-stone-400">Done</span>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-8 space-y-10">
             {/* Shipping Section */}
             <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-10">
                <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                   <div className="bg-orange-50 text-[#ee4d2d] p-3 rounded-2xl"><MapPin size={24}/></div>
                   <h2 className="text-xl font-bold text-stone-900 tracking-tight">Detail Pengiriman</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nama Penerima</label>
                      <input 
                        type="text" 
                        value={address.name} 
                        onChange={e => setAddress({...address, name: e.target.value})} 
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-50 transition-all" 
                        placeholder="Contoh: John Doe" 
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                      <input 
                        type="text" 
                        value={address.phone} 
                        onChange={e => setAddress({...address, phone: e.target.value})} 
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-50 transition-all" 
                        placeholder="Contoh: 628123..." 
                      />
                   </div>
                   <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                      <textarea 
                        value={address.detail} 
                        onChange={e => setAddress({...address, detail: e.target.value})} 
                        className="w-full bg-stone-50 border border-stone-100 rounded-[2rem] p-6 text-sm h-32 outline-none focus:ring-4 focus:ring-orange-50 resize-none transition-all leading-relaxed" 
                        placeholder="Nama Jalan, Kota, Provinsi, Kode Pos..."
                      ></textarea>
                   </div>
                </div>
             </section>

             {/* Shipping Method */}
             <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-10">
                <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                   <div className="bg-orange-50 text-[#ee4d2d] p-3 rounded-2xl"><Truck size={24}/></div>
                   <h2 className="text-xl font-bold text-stone-900 tracking-tight">Metode Pengiriman</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[
                      { id: 'standard', name: 'Standard Global', time: '5-10 Hari Kerja', price: 25000, desc: 'Pengiriman reguler yang aman' },
                      { id: 'express', name: 'Express Global', time: '2-4 Hari Kerja', price: 50000, desc: 'Lebih cepat sampai tujuan' }
                   ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setShippingMethod(method.id)}
                        className={`p-6 rounded-2xl border-2 text-left transition-all flex justify-between items-start gap-4 ${shippingMethod === method.id ? 'border-[#ee4d2d] bg-orange-50/30' : 'border-stone-50 bg-white hover:border-stone-200'}`}
                      >
                         <div className="space-y-1">
                            <p className="font-bold text-stone-900">{method.name}</p>
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{method.time}</p>
                            <p className="text-[11px] text-stone-500 mt-2">{method.desc}</p>
                         </div>
                         <div className="flex flex-col items-end">
                            <p className="text-sm font-black text-[#ee4d2d]">Rp {method.price.toLocaleString('id-ID')}</p>
                            {shippingMethod === method.id && <CheckCircle2 size={16} className="text-[#ee4d2d] mt-2" />}
                         </div>
                      </button>
                   ))}
                </div>
             </section>

             {/* Payment Selection */}
             <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-10">
                <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                   <div className="bg-orange-50 text-[#ee4d2d] p-3 rounded-2xl"><CreditCard size={24}/></div>
                   <h2 className="text-xl font-bold text-stone-900 tracking-tight">Metode Pembayaran</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {[
                      { id: 'transfer', name: 'Bank Transfer', icon: <Home size={20}/> },
                      { id: 'ewallet', name: 'E-Wallet / QRIS', icon: <Wallet size={20}/> },
                      { id: 'cod', name: 'COD (CASH)', icon: <Truck size={20}/> }
                   ].map(pay => (
                      <button 
                        key={pay.id}
                        onClick={() => setPaymentMethod(pay.id)}
                        className={`p-6 rounded-2xl border-2 text-center transition-all space-y-4 ${paymentMethod === pay.id ? 'border-[#ee4d2d] bg-orange-50/30' : 'border-stone-50 bg-white hover:border-stone-200'}`}
                      >
                         <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${paymentMethod === pay.id ? 'bg-[#ee4d2d] text-white' : 'bg-stone-50 text-stone-400'}`}>
                            {pay.icon}
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">{pay.name}</p>
                      </button>
                   ))}
                </div>
             </section>
          </div>

          {/* Order Summary Side */}
          <div className="lg:col-span-4 space-y-8">
             <div className="sticky top-28 space-y-6">
                <div className="bg-stone-950 p-8 md:p-10 rounded-[3rem] shadow-2xl text-white space-y-8 overflow-hidden relative">
                   <Sparkles size={120} className="absolute -right-10 -top-10 opacity-10 rotate-12" />
                   
                   <div className="relative z-10">
                      <h3 className="text-xl font-bold tracking-tight mb-8">Ringkasan Pesanan</h3>
                      
                      {/* Items List Mini */}
                      <div className="space-y-4 mb-10 max-h-40 overflow-y-auto no-scrollbar pr-2">
                         {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0">
                                  <img src={item.images[0]} className="w-full h-full object-cover" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold truncate opacity-80">{item.name}</p>
                                  <p className="text-[10px] opacity-50">x{item.quantity}</p>
                               </div>
                               <p className="text-[11px] font-black">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                            </div>
                         ))}
                      </div>

                      {/* Promo Input */}
                      <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 mb-8">
                         <Ticket size={18} className="text-stone-500 ml-3 mt-2.5" />
                         <input 
                           type="text" 
                           placeholder="Kode Promo" 
                           className="bg-transparent border-none outline-none text-xs flex-1 px-2 font-bold placeholder:text-stone-600" 
                           value={promoCode}
                           onChange={e => setPromoCode(e.target.value)}
                         />
                         <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all">Apply</button>
                      </div>

                      {/* Calculation */}
                      <div className="space-y-4 border-t border-white/10 pt-8 mb-8">
                         <div className="flex justify-between text-[11px] font-bold opacity-50 uppercase tracking-widest">
                            <span>Subtotal Items</span>
                            <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                         </div>
                         <div className="flex justify-between text-[11px] font-bold opacity-50 uppercase tracking-widest">
                            <span>Biaya Pengiriman</span>
                            <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
                         </div>
                         <div className="flex justify-between text-[11px] font-bold opacity-50 uppercase tracking-widest">
                            <span>Biaya Layanan</span>
                            <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
                         </div>
                         <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                            <span className="text-sm font-bold">Grand Total</span>
                            <span className="text-3xl font-black text-[#ee4d2d] italic">Rp {grandTotal.toLocaleString('id-ID')}</span>
                         </div>
                      </div>

                      <button 
                        onClick={() => {
                          if (!address.name || !address.phone || !address.detail) return alert('Lengkapi data pengiriman!');
                          const itemsStr = cart.map(item => `- ${item.name} (x${item.quantity})`).join('%0A');
                          const msg = `Halo StoryStore!%0A%0ASaya ingin memesan (Global Checkout):%0A${itemsStr}%0A%0APengiriman: ${shippingMethod}%0APembayaran: ${paymentMethod}%0A%0ATotal: Rp ${grandTotal.toLocaleString('id-ID')}%0A%0APenerima: ${address.name}%0AAlamat: ${address.detail}`;
                          window.open(`https://wa.me/6281234567890?text=${msg}`);
                          setCart([]);
                          setRoute(AppRoute.HOME);
                        }}
                        className="w-full bg-[#ee4d2d] text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-950/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                         Konfirmasi di WhatsApp <ArrowRight size={18} />
                      </button>
                   </div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl border border-stone-100 flex items-center gap-4">
                   <ShieldCheck className="text-emerald-500" size={32} />
                   <div>
                      <p className="text-xs font-bold text-stone-900">Garansi Keamanan StoryStore</p>
                      <p className="text-[10px] text-stone-400">Pembayaran Anda dilindungi & enkripsi global 256-bit.</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const p = selectedProduct;
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <button onClick={() => setRoute(AppRoute.HOME)} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 mb-8 font-black text-[10px] uppercase tracking-widest"><ChevronRight className="rotate-180" size={14} /> Back</button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          <div className="space-y-6">
            <div className="aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white shadow-2xl border border-stone-100 group">
              <img src={p.images[activeImageIdx]} className="w-full h-full object-cover" />
            </div>
            {p.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {p.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImageIdx(i)} className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${activeImageIdx === i ? 'border-[#ee4d2d] ring-4 ring-orange-50' : 'border-transparent opacity-60'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col h-full">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#ee4d2d] uppercase tracking-[0.4em]">{p.category}</span>
                <h1 className="text-2xl md:text-5xl font-bold text-stone-900 leading-tight">{p.name}</h1>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full"><Star size={14} fill="#ffce3d" className="text-yellow-400" /><span className="text-xs font-black text-stone-700">{p.rating}</span></div>
                  <span className="text-xs font-black text-stone-400 uppercase tracking-widest">{p.soldCount} Terjual</span>
                </div>
              </div>
              <div className="flex items-baseline gap-4 border-b border-stone-100 pb-8"><span className="text-3xl md:text-5xl font-black text-[#ee4d2d] italic">Rp {p.price.toLocaleString('id-ID')}</span></div>
              <p className="text-stone-600 leading-relaxed font-medium text-sm md:text-base">{p.description}</p>
            </div>
            <div className="mt-auto pt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={() => addToCart(p)} className="w-full bg-stone-900 text-white py-5 md:py-6 rounded-2xl font-black text-xs uppercase tracking-widest">Add to Cart</button>
               <button onClick={() => { addToCart(p); setRoute(AppRoute.CART); }} className="w-full bg-[#ee4d2d] text-white py-5 md:py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAdminLogin = () => {
    if (adminPassInput === GLOBAL_CONFIG.ADMIN_PASSWORD) setIsAdminAuthenticated(true);
    else alert('Password salah!');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      <main className="main-content">
        {isLoading ? (
          <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
             <div className="w-16 h-16 border-4 border-stone-100 border-t-[#ee4d2d] rounded-full animate-spin"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Synchronizing StoryStore...</p>
          </div>
        ) : (
          <>
            {route === AppRoute.HOME && renderHome()}
            {route === AppRoute.CATALOG && <SearchPage products={products} activeCategory={activeCategory} onAddToCart={addToCart} onViewDetail={handleViewDetail} />}
            {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
            {route === AppRoute.CART && <CartPage cart={cart} setCart={setCart} onCheckout={() => setRoute(AppRoute.CHECKOUT)} onBack={() => setRoute(AppRoute.HOME)} />}
            {route === AppRoute.ADMIN && (isAdminAuthenticated ? (
              <div className="py-6 md:py-10">
                <AdminProductManager 
                  products={products} 
                  onUpdateProducts={setProducts} 
                  bannerUrls={heroBanners} 
                  onUpdateBanners={(urls) => { setHeroBanners(urls); localStorage.setItem('storystore_hero_banners', JSON.stringify(urls)); }} 
                />
              </div>
            ) : (
               <div className="max-w-md mx-auto py-24 px-4">
                 <div className="bg-white p-12 rounded-[3rem] shadow-2xl space-y-10 border border-stone-100 text-center">
                   <div className="w-20 h-20 bg-stone-50 text-[#ee4d2d] rounded-2xl flex items-center justify-center mx-auto shadow-inner"><Lock size={36} /></div>
                   <div className="space-y-2"><h2 className="text-2xl font-bold text-stone-900 tracking-tight">Seller Center</h2><p className="text-[10px] text-stone-300 font-black uppercase tracking-[0.2em]">Restricted Area</p></div>
                   <div className="space-y-4">
                     <input type="password" placeholder="••••" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} className="w-full bg-stone-50 border border-stone-100 p-6 rounded-2xl outline-none text-center font-black text-3xl tracking-[0.5em] text-stone-900" />
                     <button onClick={handleAdminLogin} className="w-full bg-[#ee4d2d] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl">Unlock System</button>
                   </div>
                 </div>
               </div>
            ))}
            {route === AppRoute.CHECKOUT && renderCheckout()}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

const SearchPage = ({ products, activeCategory, onAddToCart, onViewDetail }: any) => {
  const [query, setQuery] = useState('');
  const filtered = products.filter((p: any) => (activeCategory === 'Semua' || p.category === activeCategory) && p.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
       <div className="relative w-full md:w-[500px] mb-12"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={20} /><input type="text" placeholder="Search items..." value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-white border border-stone-100 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-bold shadow-sm outline-none" /></div>
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">{filtered.map((p: any) => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onViewDetail={onViewDetail} />)}</div>
    </div>
  );
};

const CartPage = ({ cart, setCart, onCheckout, onBack }: any) => {
  const total = cart.reduce((s: any, i: any) => s + (i.price * i.quantity), 0);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
       <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 mb-8 flex justify-between items-center"><h1 className="text-2xl font-bold text-stone-900 tracking-tight">Shopping Cart ({cart.length})</h1><button onClick={onBack} className="text-xs font-black uppercase tracking-widest text-stone-400 hover:text-[#ee4d2d]">Back to Store</button></div>
       {cart.length === 0 ? (<div className="bg-white p-24 text-center rounded-[3rem]"><ShoppingBag size={80} className="mx-auto text-stone-100 mb-8" /><p className="text-stone-400 font-bold mb-10">Keranjang Anda kosong.</p><button onClick={onBack} className="bg-stone-900 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Start Shopping</button></div>) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-4">{cart.map((item: any) => (<div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-100 flex items-center gap-5"><div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-50 shrink-0"><img src={item.images[0]} className="w-full h-full object-cover" /></div><div className="flex-1"><h3 className="font-bold text-stone-900 truncate text-sm">{item.name}</h3><p className="text-[#ee4d2d] font-black text-base mt-1">Rp {item.price.toLocaleString('id-ID')}</p></div><div className="flex flex-col items-end gap-3"><div className="flex items-center bg-stone-50 rounded-lg"><button onClick={() => setCart(cart.map((i: any) => i.id === item.id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))} className="w-8 h-8 flex items-center justify-center text-stone-400"><Minus size={14}/></button><span className="w-8 text-center text-xs font-black">{item.quantity}</span><button onClick={() => setCart(cart.map((i: any) => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))} className="w-8 h-8 flex items-center justify-center text-stone-400"><Plus size={14}/></button></div><button onClick={() => setCart(cart.filter((i: any) => i.id !== item.id))} className="text-stone-200 hover:text-[#ee4d2d]"><Trash2 size={16}/></button></div></div>))}</div>
             <div className="lg:col-span-1"><div className="bg-stone-950 p-8 rounded-[2.5rem] shadow-2xl text-white space-y-8"><div className="space-y-4"><div className="flex justify-between text-white/50 text-xs font-bold uppercase tracking-widest"><span>Subtotal</span><span>Rp {total.toLocaleString('id-ID')}</span></div><div className="pt-6 border-t border-white/10 flex justify-between items-center"><span className="text-sm font-bold">Total</span><span className="text-2xl font-black text-[#ee4d2d] italic">Rp {total.toLocaleString('id-ID')}</span></div></div><button onClick={onCheckout} className="w-full bg-[#ee4d2d] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Checkout</button></div></div>
          </div>
       )}
    </div>
  );
};

export default App;
