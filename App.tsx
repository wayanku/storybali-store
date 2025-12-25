
import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight, Zap, Smartphone, Utensils, Laptop, Watch, Headphones
} from 'lucide-react';
import { getStoreData } from './services/cloudService';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Flash Sale Timer Logic
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 22, seconds: 45 });

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
    const initApp = async () => {
      setIsLoading(true);
      const scriptUrl = localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL;
      if (scriptUrl) {
        const cloudData = await getStoreData(scriptUrl);
        if (cloudData && cloudData.length > 0) {
          setProducts(cloudData);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
      setIsLoading(false);
    };
    initApp();
    const savedCart = localStorage.getItem('storystore_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('storystore_cart', JSON.stringify(cart));
  }, [cart]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
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
      {/* Global Campaign Slider */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-2">
           <div className="md:col-span-2 relative h-[200px] md:h-[300px] rounded-lg overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white space-y-2">
                 <div className="bg-white text-[#ee4d2d] inline-block px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest">Global Brand Day</div>
                 <h2 className="text-3xl md:text-4xl font-bold">Koleksi Terpopuler 2024</h2>
                 <p className="text-sm opacity-90">Hemat s/d 70% Untuk Semua Produk Global</p>
              </div>
           </div>
           <div className="hidden md:flex flex-col gap-2">
              <div className="h-1/2 rounded-lg overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center font-bold text-white uppercase text-xs tracking-widest">Audio Tech</div>
              </div>
              <div className="h-1/2 rounded-lg overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center font-bold text-white uppercase text-xs tracking-widest">Life Style</div>
              </div>
           </div>
        </div>
      </section>

      {/* Global Categories */}
      <section className="bg-white py-6">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 md:grid-cols-8 gap-6">
            {categories.map((cat, i) => (
              <button 
                key={i} 
                onClick={() => { setActiveCategory(cat.name); setRoute(AppRoute.CATALOG); }}
                className="flex flex-col items-center gap-3 group"
              >
                 <div className="w-12 h-12 md:w-14 md:h-14 bg-stone-50 text-[#ee4d2d] rounded-2xl flex items-center justify-center border border-stone-100 group-hover:bg-[#ee4d2d] group-hover:text-white transition-all shadow-sm">
                   {cat.icon}
                 </div>
                 <span className="text-[10px] md:text-xs font-medium text-stone-600 text-center">{cat.name}</span>
              </button>
            ))}
         </div>
      </section>

      {/* Global Flash Sale */}
      <section className="max-w-7xl mx-auto px-2 md:px-4">
         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-stone-50">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[#ee4d2d]">
                     <Zap size={24} fill="#ee4d2d" />
                     <h2 className="text-xl font-black italic uppercase tracking-tighter">Mega Sale</h2>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                     <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                     <span className="font-bold">:</span>
                     <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                     <span className="font-bold">:</span>
                     <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  </div>
               </div>
               <button onClick={() => setRoute(AppRoute.CATALOG)} className="text-[#ee4d2d] text-xs font-medium flex items-center gap-1">
                  Lihat Semua <ChevronRight size={14} />
               </button>
            </div>
            
            <div className="flex overflow-x-auto no-scrollbar p-4 gap-4">
               {products.slice(0, 6).map(p => (
                 <div key={p.id} onClick={() => handleViewDetail(p)} className="min-w-[140px] md:min-w-[180px] cursor-pointer group">
                    <div className="relative aspect-square rounded-md overflow-hidden bg-stone-100 mb-3">
                       <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                       <div className="absolute top-0 right-0 bg-[#ee4d2d] text-white text-[10px] font-black px-1.5 py-0.5 rounded-bl-md">
                          Disc
                       </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[#ee4d2d] font-black text-center text-sm md:text-base">Rp {(p.price * 0.8).toLocaleString('id-ID')}</p>
                       <div className="relative h-4 bg-orange-100 rounded-full overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white z-10 uppercase">Limited Stock</div>
                          <div className="h-full bg-gradient-to-r from-orange-400 to-[#ee4d2d]" style={{width: '75%'}}></div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Recommended Grid */}
      <section className="max-w-7xl mx-auto px-2 md:px-4 space-y-4">
        <div className="bg-white p-4 sticky top-[64px] md:top-[80px] z-20 border-b-2 border-[#ee4d2d]">
           <h2 className="text-[#ee4d2d] font-black uppercase tracking-widest text-sm text-center">Produk Global Pilihan</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
           {products.map(product => (
             <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
           ))}
        </div>
        
        <div className="py-8 flex justify-center">
           <button onClick={() => setRoute(AppRoute.CATALOG)} className="px-12 py-3 bg-white border border-stone-200 text-stone-600 font-bold text-sm rounded-sm hover:bg-stone-50 transition-all">Muat Lebih Banyak</button>
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 min-h-screen">
      <div className="flex flex-col md:flex-row gap-12">
        <aside className="hidden md:block w-72 shrink-0 space-y-12">
           <div className="space-y-6">
              <h3 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.3em] flex items-center gap-2">
                 <Grid size={14} className="text-[#ee4d2d]"/> Filter Produk
              </h3>
              <div className="space-y-1">
                 {['Semua', ...categories.map(c => c.name)].map(cat => (
                   <button 
                     key={cat} 
                     onClick={() => setActiveCategory(cat)}
                     className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all flex items-center justify-between group ${activeCategory === cat ? 'bg-stone-900 text-white shadow-xl translate-x-2' : 'text-stone-400 hover:bg-stone-50 hover:text-stone-800'}`}
                   >
                     {cat}
                     <ArrowRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeCategory === cat ? 'opacity-100' : ''}`} />
                   </button>
                 ))}
              </div>
           </div>
        </aside>

        <div className="flex-1 space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari ribuan produk global..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-stone-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#ee4d2d]/5 transition-all shadow-sm"
                />
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
                 Ditemukan {filteredProducts.length} Produk <LayoutDashboard size={14}/>
              </div>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const images = selectedProduct.images || [];
    return (
      <div className="bg-stone-50 min-h-screen pb-32">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
          <div className="flex flex-col lg:flex-row gap-8 bg-white p-4 md:p-8 rounded-lg shadow-sm">
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="aspect-square bg-white rounded-lg overflow-hidden border border-stone-100 relative group">
                <img src={images[activeImageIdx]} className="w-full h-full object-cover transition-all" alt={selectedProduct.name} />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                 {images.map((img, i) => (
                   <button 
                     key={i} 
                     onClick={() => setActiveImageIdx(i)}
                     className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all shrink-0 ${activeImageIdx === i ? 'border-[#ee4d2d]' : 'border-transparent opacity-60'}`}
                   >
                     <img src={img} className="w-full h-full object-cover" />
                   </button>
                 ))}
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                 <h1 className="text-xl md:text-2xl font-bold text-stone-900 leading-tight">{selectedProduct.name}</h1>
                 <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1 border-r border-stone-200 pr-4">
                       <span className="text-[#ee4d2d] underline">{selectedProduct.rating}</span>
                       <div className="flex text-yellow-400">
                         {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.floor(selectedProduct.rating) ? "currentColor" : "none"} stroke="currentColor" />)}
                       </div>
                    </div>
                    <div className="border-r border-stone-200 pr-4">
                       <span className="text-stone-900 font-bold underline">{selectedProduct.soldCount}</span>
                       <span className="text-stone-400 ml-1">Ulasan</span>
                    </div>
                    <div>
                       <span className="text-stone-900 font-bold">{selectedProduct.soldCount}</span>
                       <span className="text-stone-400 ml-1">Terjual</span>
                    </div>
                 </div>
              </div>

              <div className="bg-[#fbfbfb] p-6 rounded-lg">
                 <h2 className="text-[#ee4d2d] text-3xl font-black">Rp {selectedProduct.price.toLocaleString('id-ID')}</h2>
              </div>

              <div className="space-y-6 pt-4">
                 <div className="flex items-center gap-8 text-xs">
                    <span className="w-20 text-stone-400 font-medium">Pengiriman</span>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <Truck size={16} className="text-stone-400" />
                          <span className="text-stone-900">Garansi Global 1 Tahun</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-stone-400" />
                          <span className="text-stone-400">Estimasi Tiba</span>
                          <span className="text-stone-900 font-bold">3-5 Hari Kerja</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-10">
                 <button onClick={() => { addToCart(selectedProduct); alert('Ditambahkan ke keranjang!'); }} className="flex-1 py-4 border border-[#ee4d2d] text-[#ee4d2d] bg-[#ffeee8] rounded-sm font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <ShoppingCart size={18} /> Keranjang
                 </button>
                 <button onClick={() => { addToCart(selectedProduct); setRoute(AppRoute.CART); }} className="flex-1 py-4 bg-[#ee4d2d] text-white rounded-sm font-bold text-sm shadow-md active:scale-95 transition-all">Beli Sekarang</button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white p-6 md:p-8 rounded-lg shadow-sm">
             <h3 className="text-lg font-bold text-stone-900 border-b border-stone-50 pb-4 mb-6 uppercase tracking-tight">Detail Produk</h3>
             <div className="space-y-4 max-w-3xl">
                <div className="flex text-sm">
                   <span className="w-32 text-stone-400">Kategori</span>
                   <span className="text-[#ee4d2d]">{selectedProduct.category}</span>
                </div>
                <div className="flex text-sm">
                   <span className="w-32 text-stone-400">Kondisi</span>
                   <span className="text-stone-900">Baru (BNIB)</span>
                </div>
                <div className="flex text-sm border-t border-stone-50 pt-6 mt-6">
                   <span className="w-32 text-stone-400 shrink-0">Deskripsi</span>
                   <div className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {selectedProduct.description}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAdminLogin = () => {
    if (adminPassInput === GLOBAL_CONFIG.ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
    } else {
      alert('Password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      <main className="main-content">
        {isLoading ? (
          <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 border-4 border-[#ee4d2d]/20 border-t-[#ee4d2d] rounded-full animate-spin"></div>
             <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Menyiapkan Pengalaman Belanja Global...</p>
          </div>
        ) : (
          <>
            {route === AppRoute.HOME && renderHome()}
            {route === AppRoute.CATALOG && renderCatalog()}
            {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
            {route === AppRoute.CART && (
               <div className="max-w-5xl mx-auto px-4 py-10">
                  <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm mb-6">
                     <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-3"><ShoppingCart className="text-[#ee4d2d]"/> Keranjang Global ({cartCount})</h1>
                  </div>
                  
                  {cart.length === 0 ? (
                     <div className="bg-white p-20 text-center rounded-lg shadow-sm">
                        <ShoppingBag size={64} className="mx-auto text-stone-200 mb-6" />
                        <p className="text-stone-400 font-bold text-sm mb-8">Keranjang belanja Anda masih kosong.</p>
                        <button onClick={() => setRoute(AppRoute.CATALOG)} className="bg-[#ee4d2d] text-white px-10 py-3 rounded-sm font-bold text-sm shadow-md hover:opacity-90 transition-all">Mulai Belanja</button>
                     </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-4">
                        {cart.map(item => (
                          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-50 flex items-center gap-4 group">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden shrink-0 bg-stone-50 border border-stone-50">
                               <img src={item.images?.[0]} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h3 className="text-sm font-bold text-stone-900 truncate mb-1">{item.name}</h3>
                               <p className="text-[#ee4d2d] font-black">Rp {item.price.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                               <div className="flex items-center gap-2 border border-stone-200 rounded-sm">
                                  <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))} className="w-8 h-8 flex items-center justify-center hover:bg-stone-50"><Minus size={12}/></button>
                                  <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                  <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))} className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 border-l border-stone-200"><Plus size={12}/></button>
                               </div>
                               <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="text-stone-300 hover:text-[#ee4d2d]"><Trash2 size={16}/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="lg:col-span-1">
                         <div className="bg-white rounded-lg p-8 space-y-8 shadow-sm">
                            <h3 className="text-lg font-bold border-b border-stone-50 pb-4">Ringkasan Pesanan</h3>
                            <div className="space-y-4">
                               <div className="flex justify-between text-stone-500 text-sm">
                                  <span>Total ({cartCount} barang)</span>
                                  <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="pt-6 border-t border-stone-50 flex justify-between items-center">
                                   <span className="text-sm font-bold">Total Tagihan</span>
                                   <span className="text-2xl font-black text-[#ee4d2d]">Rp {cartTotal.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            <button onClick={() => setRoute(AppRoute.CHECKOUT)} className="w-full bg-[#ee4d2d] text-white py-4 rounded-sm font-bold text-sm shadow-md hover:opacity-90 transition-all">Checkout Global</button>
                         </div>
                      </div>
                    </div>
                  )}
               </div>
            )}
            {route === AppRoute.ADMIN && (isAdminAuthenticated ? <div className="py-10"><AdminProductManager products={products} onUpdateProducts={setProducts} /></div> : (
               <div className="max-w-md mx-auto py-24 px-4">
                 <div className="bg-white p-12 rounded-3xl shadow-xl space-y-10 border border-stone-100 text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 right-0 h-2 bg-[#ee4d2d]"></div>
                   <div className="w-20 h-20 bg-stone-50 text-[#ee4d2d] rounded-2xl flex items-center justify-center mx-auto shadow-inner transform -rotate-6">
                     <Lock size={36} />
                   </div>
                   <div className="space-y-2">
                     <h2 className="text-2xl font-bold text-stone-900 tracking-tight">StoryStore Seller</h2>
                     <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Administrator Login</p>
                   </div>
                   <div className="space-y-4">
                     <input 
                       type="password" 
                       placeholder="····" 
                       value={adminPassInput}
                       onChange={e => setAdminPassInput(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                       className="w-full bg-stone-50 border border-stone-100 p-6 rounded-2xl outline-none focus:ring-4 focus:ring-[#ee4d2d]/10 text-center font-black text-3xl tracking-[0.5em]"
                     />
                     <button onClick={handleAdminLogin} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#ee4d2d] transition-all">Masuk</button>
                   </div>
                   <button onClick={() => setRoute(AppRoute.HOME)} className="text-xs text-stone-400 font-bold hover:text-[#ee4d2d] transition-colors">Kembali ke Beranda</button>
                 </div>
               </div>
            ))}
            {route === AppRoute.CHECKOUT && (
               <div className="max-w-4xl mx-auto py-10 px-4">
                  <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm space-y-10">
                     <h1 className="text-2xl font-bold flex items-center gap-3 border-b border-stone-50 pb-6"><MapPin className="text-[#ee4d2d]"/> Alamat Pengiriman Global</h1>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Nama Penerima</label>
                           <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 p-4 rounded-sm outline-none focus:border-[#ee4d2d]" placeholder="Nama Lengkap" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">No. Telepon/WA</label>
                           <input type="text" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-stone-50 border border-stone-200 p-4 rounded-sm outline-none focus:border-[#ee4d2d]" placeholder="62812..." />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                           <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Alamat Lengkap</label>
                           <textarea value={address.detail} onChange={e => setAddress({...address, detail: e.target.value})} className="w-full bg-stone-50 border border-stone-200 p-6 rounded-sm h-32 outline-none focus:border-[#ee4d2d] resize-none" placeholder="Kota, Negara, Kode Pos, Detail Jalan..."></textarea>
                        </div>
                     </div>
                     <div className="bg-[#fffcf5] border border-orange-100 p-6 rounded-sm flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                           <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Tagihan Akhir</p>
                           <p className="text-3xl font-black text-[#ee4d2d] mt-1">Rp {cartTotal.toLocaleString('id-ID')}</p>
                        </div>
                        <button 
                          onClick={() => {
                            if (!address.name || !address.phone || !address.detail) return alert('Lengkapi data pengiriman!');
                            const itemsStr = cart.map(item => `- ${item.name} (x${item.quantity})`).join('%0A');
                            const msg = `Halo StoryStore!%0A%0ASaya ingin memesan (Global Order):%0A${itemsStr}%0A%0ATotal: Rp ${cartTotal.toLocaleString('id-ID')}%0A%0APenerima: ${address.name}%0AAlamat: ${address.detail}`;
                            window.open(`https://wa.me/6281234567890?text=${msg}`);
                            setCart([]);
                            setRoute(AppRoute.HOME);
                          }} 
                          className="px-12 py-4 bg-[#ee4d2d] text-white rounded-sm font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center gap-3 uppercase"
                        >
                           Konfirmasi Pesanan <ChevronRight size={18} />
                        </button>
                     </div>
                  </div>
               </div>
            )}
          </>
        )}
      </main>
      
      <footer className="bg-white border-t border-stone-100 py-16 mt-10">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-stone-500">
            <div className="space-y-6">
               <h4 className="text-xs font-bold text-stone-900 uppercase">Bantuan Pelanggan</h4>
               <ul className="text-xs space-y-3">
                  <li className="hover:text-[#ee4d2d] cursor-pointer">Pusat Bantuan Global</li>
                  <li className="hover:text-[#ee4d2d] cursor-pointer">Cara Belanja</li>
                  <li className="hover:text-[#ee4d2d] cursor-pointer">Lacak Pesanan</li>
                  <li className="hover:text-[#ee4d2d] cursor-pointer">Pengembalian</li>
               </ul>
            </div>
            <div className="space-y-6">
               <h4 className="text-xs font-bold text-stone-900 uppercase">Tentang StoryStore</h4>
               <ul className="text-xs space-y-3">
                  <li className="hover:text-[#ee4d2d] cursor-pointer">Karir</li>
                  <li className="hover:text-[#ee4d2d] cursor-pointer">Kebijakan Privasi</li>
                  <li className="hover:text-[#ee4d2d] cursor-pointer">Flash Sale</li>
                  <li className="hover:text-[#ee4d2d] cursor-pointer">Kontak Media</li>
               </ul>
            </div>
            <div className="space-y-6">
               <h4 className="text-xs font-bold text-stone-900 uppercase">Pembayaran Global</h4>
               <div className="flex flex-wrap gap-2">
                  {['VISA', 'MASTER', 'PAYPAL', 'CRYPTO'].map(tag => <div key={tag} className="px-3 py-1 bg-stone-50 border border-stone-100 rounded text-[8px] font-black">{tag}</div>)}
               </div>
            </div>
            <div className="space-y-6">
               <h4 className="text-xs font-bold text-stone-900 uppercase">Social Media</h4>
               <div className="flex gap-4">
                  {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100 hover:text-[#ee4d2d] cursor-pointer"><User size={16}/></div>)}
               </div>
               <p className="text-[10px] text-stone-400 mt-6">© 2024 StoryStore Global. All Rights Reserved.</p>
            </div>
         </div>
      </footer>
      <BottomNav />
    </div>
  );
};

export default App;
