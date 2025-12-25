
import React, { useState, useEffect, useMemo } from 'react';
import { AppRoute, Product, CartItem } from './types';
import { INITIAL_PRODUCTS, GLOBAL_CONFIG } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ChatWidget from './components/ChatWidget';
import AdminProductManager from './components/AdminProductManager';
import { 
  Trash2, Plus, Minus, 
  Sparkles, Star, ShoppingCart, ShoppingBag, 
  ChevronRight, MapPin, Truck, Lock, 
  Home, Grid, User, LayoutDashboard, Search,
  ArrowRight, ShieldCheck, CreditCard, Clock,
  Zap, Flame, Ticket, Smartphone, Gift, Coffee, Utensils,
  Heart, Newspaper, Compass, ExternalLink, Laptop, ShoppingBasket, ShoppingBag as BagIcon,
  // Fix: Added missing Loader2 import
  Loader2
} from 'lucide-react';
import { getStoreData } from './services/cloudService';
import { getShoppingLiveTrends, findNearestServiceCenters } from './services/geminiService';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');

  const [liveTrends, setLiveTrends] = useState<{text: string, sources: any[]} | null>(null);
  const [nearbyService, setNearbyService] = useState<{text: string, sources: any[]} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 20, seconds: 0 });

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

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;
      const cloudData = await getStoreData(scriptUrl);
      setProducts(cloudData || INITIAL_PRODUCTS);
      const trends = await getShoppingLiveTrends();
      setLiveTrends(trends);
      setIsLoading(false);
    };
    initApp();
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  const toggleWishlist = (p: Product) => {
    setWishlist(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]);
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
    if (priceSort === 'asc') result.sort((a, b) => a.price - b.price);
    else if (priceSort === 'desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, activeCategory, searchQuery, priceSort]);

  const handleLocateService = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const result = await findNearestServiceCenters(pos.coords.latitude, pos.coords.longitude);
        setNearbyService(result);
        setIsLocating(false);
      });
    }
  };

  const categories = [
    { n: 'Elektronik', i: <Smartphone size={20}/> },
    { n: 'Fashion', i: <User size={20}/> },
    { n: 'Kecantikan', i: <Sparkles size={20}/> },
    { n: 'Gadget', i: <Laptop size={20}/> },
    { n: 'Rumah Tangga', i: <Home size={20}/> },
    { n: 'Hobi', i: <Gift size={20}/> }
  ];

  const renderHome = () => (
    <div className="space-y-6 pb-20 bg-[#f5f5f5]">
      {/* Hero Banners */}
      <section className="bg-white p-4">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-2 relative h-[180px] md:h-[300px] rounded-lg overflow-hidden">
               <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/10 flex items-center p-8">
                  <div className="text-white">
                     <h2 className="text-3xl font-black uppercase italic">Payday Sale</h2>
                     <p className="text-sm">Diskon s.d 80% & Gratis Ongkir</p>
                  </div>
               </div>
            </div>
            <div className="hidden md:flex flex-col gap-2">
               <div className="h-1/2 bg-blue-600 rounded-lg p-6 text-white flex items-center justify-between">
                  <h3 className="font-bold">Cicilan 0%<br/><span className="text-xs font-normal">S.d 12 Bulan</span></h3>
                  <CreditCard size={32} opacity={0.3}/>
               </div>
               <div className="h-1/2 bg-orange-500 rounded-lg p-6 text-white flex items-center justify-between">
                  <h3 className="font-bold">Voucher Kaget<br/><span className="text-xs font-normal">Klaim Sekarang</span></h3>
                  <Ticket size={32} opacity={0.3}/>
               </div>
            </div>
         </div>
      </section>

      {/* Categories Bar */}
      <section className="bg-white py-4 shadow-sm overflow-x-auto no-scrollbar">
         <div className="max-w-7xl mx-auto px-4 flex gap-8 md:justify-center">
            {categories.map((c, i) => (
              <button key={i} onClick={() => { setActiveCategory(c.n); }} className="flex flex-col items-center gap-2 shrink-0 group">
                 <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-[#ee4d2d] group-hover:text-white transition-all border border-stone-100">{c.i}</div>
                 <span className="text-[10px] font-bold text-stone-600 uppercase">{c.n}</span>
              </button>
            ))}
         </div>
      </section>

      {/* Flash Sale Area */}
      <section className="max-w-7xl mx-auto px-2 md:px-4">
         <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-2 border-[#ee4d2d]">
            <div className="p-4 flex items-center justify-between bg-white border-b border-stone-50">
               <div className="flex items-center gap-4">
                  <h2 className="text-[#ee4d2d] text-xl font-black italic uppercase">FLASH SALE</h2>
                  <div className="flex items-center gap-1 font-mono">
                     <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                     <span className="font-bold">:</span>
                     <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                     <span className="font-bold">:</span>
                     <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  </div>
               </div>
               <button onClick={() => setPriceSort('asc')} className="text-[#ee4d2d] text-xs font-bold uppercase">Lihat Semua ></button>
            </div>
            <div className="flex overflow-x-auto no-scrollbar p-4 gap-4">
               {products.filter(p => p.discountTag).slice(0, 5).map(p => (
                  <div key={p.id} onClick={() => { setSelectedProduct(p); setRoute(AppRoute.PRODUCT_DETAIL); }} className="min-w-[150px] space-y-2 cursor-pointer">
                     <div className="relative aspect-square rounded bg-stone-50 overflow-hidden">
                        <img src={p.images[0]} className="w-full h-full object-cover" />
                        <div className="absolute top-0 right-0 bg-yellow-400 text-[#ee4d2d] text-[10px] font-black px-1.5 py-0.5 rounded-bl-sm">-40%</div>
                     </div>
                     <p className="text-center text-[#ee4d2d] font-black">Rp {(p.price * 0.6).toLocaleString('id-ID')}</p>
                     <div className="relative h-2 bg-orange-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#ee4d2d]" style={{width: '75%'}}></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* AI Grounding Section */}
      <section className="max-w-7xl mx-auto px-2 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white p-5 rounded-lg border-l-4 border-orange-500">
            <h3 className="text-sm font-black uppercase text-orange-600 flex items-center gap-2 mb-4"><Zap size={18}/> Tren Belanja Saat Ini</h3>
            {liveTrends ? <p className="text-xs text-stone-600 leading-relaxed italic">{liveTrends.text}</p> : <div className="h-12 bg-stone-50 animate-pulse"></div>}
         </div>
         <div className="bg-white p-5 rounded-lg border-l-4 border-blue-500">
            <h3 className="text-sm font-black uppercase text-blue-600 flex items-center gap-2 mb-4"><MapPin size={18}/> Info Service Center</h3>
            {nearbyService ? <p className="text-xs text-stone-600 leading-relaxed">{nearbyService.text}</p> : 
               <button onClick={handleLocateService} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded uppercase">Cari Lokasi Terdekat</button>
            }
         </div>
      </section>

      {/* Product Feed */}
      <section className="max-w-7xl mx-auto px-2 md:px-4 space-y-4">
         <div className="sticky top-[64px] z-30 bg-[#f5f5f5] py-2">
            <div className="bg-white p-3 rounded flex gap-4 overflow-x-auto no-scrollbar">
               {['Semua', 'Terbaru', 'Terpopuler', 'Harga Terendah'].map(t => (
                  <button key={t} onClick={() => t === 'Harga Terendah' ? setPriceSort('asc') : setPriceSort('none')} className={`text-xs font-bold px-4 py-2 rounded-sm border ${t === 'Semua' ? 'bg-[#ee4d2d] text-white' : 'bg-white text-stone-500 border-stone-200'}`}>{t}</button>
               ))}
            </div>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
            {filteredProducts.map(p => (
               <ProductCard key={p.id} product={p} onAddToCart={(prod) => setCart([...cart, {...prod, quantity: 1}])} onViewDetail={(prod) => { setSelectedProduct(prod); setRoute(AppRoute.PRODUCT_DETAIL); }} onToggleWishlist={toggleWishlist} isWishlisted={wishlist.includes(p.id)} />
            ))}
         </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      {isLoading ? <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#ee4d2d]"/></div> : (
        <>
          {route === AppRoute.HOME && renderHome()}
          {route === AppRoute.PRODUCT_DETAIL && selectedProduct && (
            <div className="max-w-6xl mx-auto p-4 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white min-h-screen">
               <div className="aspect-square bg-stone-50 rounded-lg overflow-hidden">
                  <img src={selectedProduct.images[0]} className="w-full h-full object-cover" />
               </div>
               <div className="space-y-6">
                  <h1 className="text-2xl font-bold">{selectedProduct.name}</h1>
                  <div className="p-4 bg-stone-50 rounded text-3xl font-black text-[#ee4d2d]">Rp {selectedProduct.price.toLocaleString('id-ID')}</div>
                  <div className="flex items-center gap-4 text-xs">
                     <span className="flex items-center gap-1 text-yellow-400 font-bold"><Star size={14} fill="currentColor"/> {selectedProduct.rating}</span>
                     <span className="text-stone-300">|</span>
                     <span className="text-stone-500 font-bold">{selectedProduct.soldCount} Terjual</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed text-sm border-t pt-6">{selectedProduct.description}</p>
                  <div className="pt-10 flex gap-4">
                     <button onClick={() => setRoute(AppRoute.HOME)} className="px-8 py-3 bg-stone-100 font-bold uppercase text-xs">Kembali</button>
                     <button className="flex-1 py-3 bg-[#ee4d2d] text-white font-bold uppercase text-xs shadow-lg">Beli Sekarang</button>
                  </div>
               </div>
            </div>
          )}
          {route === AppRoute.ADMIN && <AdminProductManager products={products} onUpdateProducts={setProducts} />}
        </>
      )}
      <ChatWidget />
      {/* Bottom Nav Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
         <button onClick={() => setRoute(AppRoute.HOME)} className="flex flex-col items-center gap-1 text-[#ee4d2d]"><Home size={20}/><span className="text-[10px] font-bold">Beranda</span></button>
         <button onClick={() => setRoute(AppRoute.HOME)} className="flex flex-col items-center gap-1 text-stone-400"><BagIcon size={20}/><span className="text-[10px] font-bold">Mall</span></button>
         <button onClick={() => setRoute(AppRoute.ADMIN)} className="flex flex-col items-center gap-1 text-stone-400"><User size={20}/><span className="text-[10px] font-bold">Saya</span></button>
      </div>
    </div>
  );
};

export default App;
