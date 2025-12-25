
import React, { useState, useEffect, useMemo } from 'react';
import { AppRoute, Product, CartItem } from './types';
import { INITIAL_PRODUCTS, GLOBAL_CONFIG } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ChatWidget from './components/ChatWidget';
import AdminProductManager from './components/AdminProductManager';
import { 
  Sparkles, Star, ShoppingCart, ShoppingBag, 
  ChevronRight, MapPin, Truck, Lock, 
  Home, Grid, User, Search,
  ShieldCheck, CreditCard, Clock,
  Zap, Ticket, Smartphone, Gift, 
  Heart, Newspaper, ExternalLink, Laptop, 
  Loader2, CheckCircle2, ShoppingBasket, X, Plus, Minus, Trash2
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
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [toast, setToast] = useState<string | null>(null);

  const [liveTrends, setLiveTrends] = useState<{text: string, sources: any[]} | null>(null);
  const [nearbyService, setNearbyService] = useState<{text: string, sources: any[]} | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 20, seconds: 0 });

  // Update Countdown Timer for Flash Sale
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

  // Initialize data and fetch grounding information
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;
      const cloudData = await getStoreData(scriptUrl);
      setProducts(cloudData || INITIAL_PRODUCTS);
      
      // Get location for more relevant grounding results if possible
      let lat, lng;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) {
        // Continue without coordinates
      }

      // Concurrent fetch for trends and service locations
      const [trends, services] = await Promise.all([
        getShoppingLiveTrends(),
        findNearestServiceCenters(lat, lng)
      ]);
      
      setLiveTrends(trends);
      setNearbyService(services);
      setIsLoading(false);
    };
    initApp();
    
    const savedCart = localStorage.getItem('storybali_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    const savedWish = localStorage.getItem('storybali_wishlist');
    if (savedWish) setWishlist(JSON.parse(savedWish));
  }, []);

  useEffect(() => {
    localStorage.setItem('storybali_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('storybali_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} ditambahkan ke keranjang!`);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

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

  const renderHome = () => (
    <div className="space-y-6 pb-20">
      {/* Banner Carousel Simulation */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-8 relative h-[250px] md:h-[400px] rounded-xl overflow-hidden shadow-sm group">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                <span className="bg-[#ee4d2d] text-[10px] font-black uppercase px-2 py-1 w-fit rounded mb-2">Eksklusif</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-2">KOLEKSI MUSIM INI</h2>
                <p className="text-sm opacity-90 mb-6 max-w-md">Dapatkan diskon hingga 70% untuk produk pilihan dari brand internasional.</p>
                <button className="bg-white text-[#ee4d2d] px-8 py-3 rounded-lg font-bold text-sm uppercase shadow-xl hover:scale-105 transition-transform w-fit">Belanja Sekarang</button>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col gap-2">
              <div className="flex-1 bg-stone-900 rounded-xl p-6 text-white relative overflow-hidden group">
                 <div className="relative z-10">
                    <h3 className="text-xl font-bold italic mb-1 uppercase">Gadget Fest</h3>
                    <p className="text-xs opacity-70">Cashback s.d 2 Juta</p>
                 </div>
                 <Smartphone size={100} className="absolute -bottom-6 -right-6 text-white/10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 bg-[#ee4d2d] rounded-xl p-6 text-white relative overflow-hidden group">
                 <div className="relative z-10">
                    <h3 className="text-xl font-bold italic mb-1 uppercase">Voucher Day</h3>
                    <p className="text-xs opacity-70">Min. Belanja Rp 0</p>
                 </div>
                 <Ticket size={100} className="absolute -bottom-6 -right-6 text-white/10 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Icons Bar - Fixed cloneElement issue by passing props directly */}
      <section className="bg-white border-y border-stone-50 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { n: 'Elektronik', i: <Smartphone size={28} className="text-blue-500"/> },
            { n: 'Fashion', i: <User size={28} className="text-[#ee4d2d]"/> },
            { n: 'Beauty', i: <Sparkles size={28} className="text-pink-500"/> },
            { n: 'Home', i: <Home size={28} className="text-emerald-500"/> },
            { n: 'Sports', i: <Zap size={28} className="text-orange-500"/> },
            { n: 'Gifts', i: <Gift size={28} className="text-purple-500"/> }
          ].map((c, i) => (
            <button key={i} onClick={() => setActiveCategory(c.n)} className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-stone-50 rounded-[2rem] flex items-center justify-center group-hover:bg-white group-hover:shadow-lg group-hover:-translate-y-1 transition-all border border-stone-100">
                {c.i}
              </div>
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">{c.n}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-stone-50">
            <div className="flex items-center gap-4">
               <div className="bg-[#ee4d2d] text-white px-3 py-1 rounded-md flex items-center gap-2">
                 <Zap size={18} fill="currentColor" />
                 <h2 className="text-lg font-black italic">FLASH SALE</h2>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">Berakhir Dalam</span>
                  <div className="flex gap-1">
                    <span className="bg-stone-900 text-white w-7 h-7 flex items-center justify-center rounded font-bold text-xs">{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="bg-stone-900 text-white w-7 h-7 flex items-center justify-center rounded font-bold text-xs">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="bg-stone-900 text-white w-7 h-7 flex items-center justify-center rounded font-bold text-xs">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  </div>
               </div>
            </div>
            <button className="text-[#ee4d2d] text-xs font-bold uppercase hover:underline">Lihat Semua ></button>
          </div>
          <div className="flex overflow-x-auto no-scrollbar p-6 gap-6">
             {products.slice(0, 6).map(p => (
               <div key={p.id} onClick={() => { setSelectedProduct(p); setRoute(AppRoute.PRODUCT_DETAIL); }} className="min-w-[160px] group cursor-pointer space-y-3">
                  <div className="relative aspect-square rounded-2xl bg-stone-50 overflow-hidden">
                    <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-yellow-400 text-[#ee4d2d] text-[10px] font-black px-2 py-1 rounded-lg">-50%</div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[#ee4d2d] font-black text-lg">Rp {(p.price * 0.5).toLocaleString('id-ID')}</p>
                    <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-50">
                       <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-white z-10 uppercase tracking-widest">SEGERA HABIS</div>
                       <div className="h-full bg-gradient-to-r from-orange-400 to-[#ee4d2d]" style={{width: '85%'}}></div>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Grounding Info Grid - Displaying AI-powered insights with sources */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
             <Newspaper size={24} />
          </div>
          <div className="space-y-1">
             <h3 className="text-sm font-bold text-stone-900">Trending Global</h3>
             {liveTrends ? (
               <div className="space-y-2">
                 <p className="text-xs text-stone-500 italic leading-relaxed">"{liveTrends.text.substring(0, 150)}..."</p>
                 <div className="flex flex-wrap gap-2">
                   {liveTrends.sources.map((source, idx) => (
                     source.web?.uri && (
                       <a key={idx} href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] text-stone-400 hover:text-[#ee4d2d] flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                         <ExternalLink size={8} /> {source.web.title?.substring(0, 15) || 'Source'}
                       </a>
                     )
                   ))}
                 </div>
               </div>
             ) : <div className="h-10 bg-stone-50 animate-pulse rounded"></div>}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
             <MapPin size={24} />
          </div>
          <div className="space-y-1">
             <h3 className="text-sm font-bold text-stone-900">Layanan Terdekat</h3>
             {nearbyService ? (
               <div className="space-y-2">
                 <p className="text-xs text-stone-500 leading-relaxed truncate max-w-[200px]">{nearbyService.text.substring(0, 100)}...</p>
                 <div className="flex flex-wrap gap-2">
                   {nearbyService.sources.map((source, idx) => (
                     source.maps?.uri && (
                       <a key={idx} href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-500 font-bold hover:underline flex items-center gap-1">
                         <ExternalLink size={8} /> {source.maps.title || 'Link Maps'}
                       </a>
                     )
                   ))}
                 </div>
               </div>
             ) : (
               <p className="text-xs text-stone-500 leading-relaxed">Nikmati layanan purna jual di titik servis resmi di seluruh Indonesia.</p>
             )}
          </div>
        </div>
      </section>

      {/* Main Feed */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8 overflow-x-auto no-scrollbar border-b border-stone-100 pb-2">
           {['Semua', 'Rekomendasi', 'Terbaru', 'Best Seller'].map(t => (
             <button key={t} onClick={() => {}} className={`px-6 py-2 text-sm font-bold uppercase tracking-widest transition-all ${t === 'Semua' ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]' : 'text-stone-400 hover:text-stone-900'}`}>{t}</button>
           ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {filteredProducts.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onAddToCart={addToCart} 
              onViewDetail={(prod) => { setSelectedProduct(prod); setRoute(AppRoute.PRODUCT_DETAIL); window.scrollTo(0,0); }}
              isWishlisted={wishlist.includes(p.id)}
              onToggleWishlist={(prod) => {
                setWishlist(prev => prev.includes(prod.id) ? prev.filter(i => i !== prod.id) : [...prev, prod.id]);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );

  const renderCart = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <ShoppingBasket size={32} className="text-[#ee4d2d]" />
        <h1 className="text-2xl font-black italic uppercase">Keranjang Belanja</h1>
      </div>
      
      {cart.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl text-center space-y-6 shadow-sm">
           <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
             <ShoppingCart size={48} />
           </div>
           <p className="text-stone-400 font-medium">Keranjangmu masih kosong.</p>
           <button onClick={() => setRoute(AppRoute.HOME)} className="bg-[#ee4d2d] text-white px-8 py-3 rounded-xl font-bold uppercase text-xs shadow-lg">Belanja Sekarang</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl flex gap-4 border border-stone-100 shadow-sm relative group">
                   <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-50 shrink-0">
                      <img src={item.images[0]} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 space-y-2">
                      <h3 className="text-sm font-bold text-stone-900 pr-8">{item.name}</h3>
                      <p className="text-[#ee4d2d] font-black">Rp {item.price.toLocaleString('id-ID')}</p>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center border border-stone-100 rounded-lg overflow-hidden">
                            <button onClick={() => updateCartQuantity(item.id, -1)} className="p-2 hover:bg-stone-50"><Minus size={14}/></button>
                            <span className="px-4 text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.id, 1)} className="p-2 hover:bg-stone-50"><Plus size={14}/></button>
                         </div>
                      </div>
                   </div>
                   <button onClick={() => removeFromCart(item.id)} className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                   </button>
                </div>
              ))}
           </div>
           
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-6 sticky top-24">
                 <h2 className="font-bold text-stone-900 border-b border-stone-50 pb-4">Ringkasan Belanja</h2>
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm text-stone-500">
                       <span>Total Harga ({cartCount} barang)</span>
                       <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-500">
                       <span>Biaya Pengiriman</span>
                       <span className="text-emerald-500 font-bold uppercase text-[10px]">Gratis</span>
                    </div>
                    <div className="h-px bg-stone-50"></div>
                    <div className="flex justify-between text-lg font-black text-stone-900">
                       <span>Total Bayar</span>
                       <span className="text-[#ee4d2d]">Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                 </div>
                 <button onClick={() => showToast('Menghubungkan ke payment gateway...')} className="w-full py-4 bg-[#ee4d2d] text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-orange-100 hover:bg-[#d73211] transition-all transform active:scale-95">Beli Sekarang ({cartCount})</button>
                 <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-emerald-500" /> Transaksi Aman & Terenkripsi
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 grid grid-cols-1 lg:grid-cols-2">
          {/* Images Section */}
          <div className="p-4 md:p-8 space-y-4">
             <div className="aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-100">
                <img src={selectedProduct.images[0]} className="w-full h-full object-cover" />
             </div>
             <div className="grid grid-cols-4 gap-4">
                {selectedProduct.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-stone-50 border border-stone-100 cursor-pointer hover:border-[#ee4d2d] transition-all">
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
             </div>
          </div>
          
          {/* Info Section */}
          <div className="p-8 md:p-12 space-y-8 flex flex-col justify-center">
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <span className="bg-[#ee4d2d] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded italic">Official</span>
                   <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{selectedProduct.category}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight">{selectedProduct.name}</h1>
                <div className="flex items-center gap-4 text-xs">
                   <div className="flex items-center gap-1 text-yellow-400 font-bold border-r border-stone-100 pr-4">
                      <Star size={16} fill="currentColor" /> {selectedProduct.rating}
                   </div>
                   <div className="text-stone-500 font-bold border-r border-stone-100 pr-4">
                      {selectedProduct.soldCount} Terjual
                   </div>
                   <div className="text-[#ee4d2d] font-bold">
                      Original 100%
                   </div>
                </div>
             </div>

             <div className="bg-stone-50 p-8 rounded-2xl space-y-2">
                {selectedProduct.originalPrice && (
                  <span className="text-sm text-stone-300 line-through">Rp {selectedProduct.originalPrice.toLocaleString('id-ID')}</span>
                )}
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-black text-[#ee4d2d]">Rp {selectedProduct.price.toLocaleString('id-ID')}</h2>
                  {selectedProduct.discountTag && (
                    <span className="bg-orange-100 text-[#ee4d2d] text-[10px] font-black px-2 py-1 rounded-md">{selectedProduct.discountTag}</span>
                  )}
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-start gap-4">
                   <Truck size={20} className="text-stone-400" />
                   <div>
                      <p className="text-xs font-bold text-stone-900">Bebas Ongkir</p>
                      <p className="text-[10px] text-stone-400">Estimasi tiba dalam 2-3 hari kerja.</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <ShieldCheck size={20} className="text-stone-400" />
                   <div>
                      <p className="text-xs font-bold text-stone-900">7 Hari Pengembalian</p>
                      <p className="text-[10px] text-stone-400">Syarat dan ketentuan berlaku untuk barang rusak/salah.</p>
                   </div>
                </div>
             </div>

             <div className="pt-8 grid grid-cols-2 gap-4">
                <button onClick={() => addToCart(selectedProduct)} className="py-4 border-2 border-[#ee4d2d] text-[#ee4d2d] rounded-2xl font-black uppercase text-xs hover:bg-orange-50 transition-colors">Tambah Keranjang</button>
                <button onClick={() => { addToCart(selectedProduct); setRoute(AppRoute.CART); }} className="py-4 bg-[#ee4d2d] text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-orange-100 hover:bg-[#d73211] transition-all">Beli Sekarang</button>
             </div>
          </div>
        </div>

        {/* Tab Description & Reviews */}
        <div className="mt-12 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100">
           <div className="border-b border-stone-50 pb-4 mb-8">
              <h3 className="text-lg font-black uppercase tracking-widest text-[#ee4d2d]">Spesifikasi & Detail</h3>
           </div>
           <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{selectedProduct.description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] selection:bg-[#ee4d2d] selection:text-white">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 size={16} className="text-emerald-500" />
          {toast}
        </div>
      )}

      {isLoading ? (
        <div className="h-screen flex items-center justify-center bg-white">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#ee4d2d] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Memuat StoryBali Store...</p>
           </div>
        </div>
      ) : (
        <main className="min-h-screen">
          {route === AppRoute.HOME && renderHome()}
          {route === AppRoute.CART && renderCart()}
          {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
          {route === AppRoute.ADMIN && <AdminProductManager products={products} onUpdateProducts={setProducts} />}
        </main>
      )}

      {/* Mobile Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-stone-100 flex justify-around items-center h-20 z-50 px-4">
        <button onClick={() => setRoute(AppRoute.HOME)} className={`flex flex-col items-center gap-1 ${route === AppRoute.HOME ? 'text-[#ee4d2d]' : 'text-stone-300'}`}>
          <Home size={22}/><span className="text-[9px] font-black uppercase">Beranda</span>
        </button>
        <button onClick={() => setRoute(AppRoute.HOME)} className="flex flex-col items-center gap-1 text-stone-300">
          <Grid size={22}/><span className="text-[9px] font-black uppercase">Kategori</span>
        </button>
        <div className="relative">
           <button onClick={() => setRoute(AppRoute.CART)} className={`flex flex-col items-center gap-1 ${route === AppRoute.CART ? 'text-[#ee4d2d]' : 'text-stone-300'}`}>
             <ShoppingCart size={22}/><span className="text-[9px] font-black uppercase">Keranjang</span>
           </button>
           {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#ee4d2d] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
        </div>
        <button onClick={() => setRoute(AppRoute.ADMIN)} className={`flex flex-col items-center gap-1 ${route === AppRoute.ADMIN ? 'text-[#ee4d2d]' : 'text-stone-300'}`}>
          <User size={22}/><span className="text-[9px] font-black uppercase">Saya</span>
        </button>
      </div>

      <ChatWidget />
    </div>
  );
};

export default App;
