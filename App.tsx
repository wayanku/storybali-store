
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
  Home, Grid, User, LayoutDashboard, Search
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

  // Admin Security
  const [adminPassInput, setAdminPassInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Form Checkout
  const [address, setAddress] = useState({ name: '', phone: '', detail: '' });

  const categories = ['Semua', 'Fashion', 'Wellness', 'Home Decor', 'Seni & Lukis', 'Aksesoris'];

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      const scriptUrl = GLOBAL_CONFIG.MASTER_SCRIPT_URL || localStorage.getItem('storybali_script_url');
      if (scriptUrl) {
        const cloudData = await getStoreData(scriptUrl);
        // Jika cloud data ada tapi kosong (length 0), gunakan initial products
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
    const savedCart = localStorage.getItem('storybali_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('storybali_cart', JSON.stringify(cart));
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
    alert('Berhasil ditambahkan ke keranjang!');
  };

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setActiveImageIdx(0);
    setRoute(AppRoute.PRODUCT_DETAIL);
    window.scrollTo(0, 0);
  };

  // Mobile Navigation Helper
  const BottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 z-50 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <button onClick={() => setRoute(AppRoute.HOME)} className={`flex flex-col items-center gap-1 ${route === AppRoute.HOME ? 'text-[#ee4d2d]' : 'text-gray-400'}`}>
        <Home size={20} />
        <span className="text-[10px] font-bold">Beranda</span>
      </button>
      <button onClick={() => setRoute(AppRoute.CATALOG)} className={`flex flex-col items-center gap-1 ${route === AppRoute.CATALOG ? 'text-[#ee4d2d]' : 'text-gray-400'}`}>
        <Grid size={20} />
        <span className="text-[10px] font-bold">Katalog</span>
      </button>
      <button onClick={() => setRoute(AppRoute.CART)} className={`flex flex-col items-center gap-1 ${route === AppRoute.CART ? 'text-[#ee4d2d]' : 'text-gray-400'}`}>
        <div className="relative">
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#ee4d2d] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
        </div>
        <span className="text-[10px] font-bold">Keranjang</span>
      </button>
      <button onClick={() => setRoute(AppRoute.ADMIN)} className={`flex flex-col items-center gap-1 ${route === AppRoute.ADMIN ? 'text-[#ee4d2d]' : 'text-gray-400'}`}>
        <LayoutDashboard size={20} />
        <span className="text-[10px] font-bold">Seller</span>
      </button>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-6 md:space-y-12 pb-20">
      {/* Hero Banner */}
      <section className="relative h-[40vh] md:h-[60vh] bg-stone-900 flex items-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1573456170607-b3844fae4242?auto=format&fit=crop&q=80&w=1600" className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 w-full text-white space-y-4 md:space-y-6">
           <div className="inline-flex items-center gap-2 bg-[#ee4d2d] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg">
             <Sparkles size={12} /> Curated for you
           </div>
           <h1 className="text-4xl md:text-8xl font-black tracking-tight leading-none uppercase serif">The Soul of <br/> Bali Artisan</h1>
           <p className="text-sm md:text-xl opacity-90 max-w-md font-light">Kerajinan tangan eksklusif, dibuat dengan doa dan warisan leluhur langsung dari jantung Pulau Dewata.</p>
           <button onClick={() => setRoute(AppRoute.CATALOG)} className="px-8 py-4 bg-white text-[#ee4d2d] font-black rounded-xl text-sm shadow-2xl hover:bg-[#ee4d2d] hover:text-white transition-all transform hover:-translate-y-1">MULAI BELANJA</button>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar flex gap-4 md:justify-center">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => { setActiveCategory(cat); setRoute(AppRoute.CATALOG); }}
            className="shrink-0 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-all shadow-sm"
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Featured Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl md:text-3xl font-bold serif text-stone-800">Rekomendasi Utama</h2>
           <button onClick={() => setRoute(AppRoute.CATALOG)} className="text-[#ee4d2d] text-xs font-bold uppercase tracking-widest hover:underline">Lihat Semua</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
           {products.length > 0 ? products.slice(0, 12).map(product => (
             <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
           )) : (
             <div className="col-span-full py-20 text-center text-stone-400">Memuat produk...</div>
           )}
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters - Desktop Only */}
        <aside className="hidden md:block w-64 shrink-0 space-y-8">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6">Kategori</h3>
              <div className="space-y-2">
                 {categories.map(cat => (
                   <button 
                     key={cat} 
                     onClick={() => setActiveCategory(cat)}
                     className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeCategory === cat ? 'bg-[#fbebed] text-[#ee4d2d]' : 'text-gray-500 hover:bg-gray-50'}`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
           </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 space-y-6">
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menampilkan {filteredProducts.length} Produk</span>
              <div className="flex gap-2">
                 <button className="bg-gray-50 p-2 rounded-lg text-gray-400"><LayoutDashboard size={16}/></button>
              </div>
           </div>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
          <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col md:flex-row border border-gray-100">
            {/* Gallery */}
            <div className="w-full md:w-1/2 p-4 md:p-8 space-y-4">
              <div className="aspect-square bg-stone-50 rounded-[2rem] overflow-hidden border border-gray-100">
                <img src={images[activeImageIdx]} className="w-full h-full object-cover transition-all duration-500" alt={selectedProduct.name} />
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                 {images.map((img, i) => (
                   <button 
                     key={i} 
                     onClick={() => setActiveImageIdx(i)}
                     className={`w-20 h-20 rounded-2xl overflow-hidden border-4 transition-all shrink-0 ${activeImageIdx === i ? 'border-[#ee4d2d]' : 'border-transparent opacity-60'}`}
                   >
                     <img src={img} className="w-full h-full object-cover" />
                   </button>
                 ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 p-8 md:p-12 space-y-8 flex flex-col">
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <span className="bg-[#ee4d2d] text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">Artisan Choice</span>
                    <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">{selectedProduct.category}</span>
                 </div>
                 <h1 className="text-3xl md:text-5xl font-bold serif text-stone-800 leading-tight">{selectedProduct.name}</h1>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-[#ee4d2d] font-black">
                       <span className="text-lg underline decoration-2">{selectedProduct.rating}</span>
                       <Star size={18} fill="#ffce3d" stroke="none" />
                    </div>
                    <span className="text-gray-400 font-bold text-sm tracking-wide">| {selectedProduct.soldCount} Terjual</span>
                 </div>
              </div>

              <div className="bg-stone-50 p-8 rounded-3xl space-y-2">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Harga Terbaik</p>
                 <h2 className="text-[#ee4d2d] text-4xl md:text-5xl font-black">Rp {selectedProduct.price.toLocaleString('id-ID')}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl">
                    <Truck className="text-[#065f46]" size={20} />
                    <div>
                       <p className="text-[10px] font-black uppercase text-gray-400">Pengiriman</p>
                       <p className="text-xs font-bold">Gratis Ongkir</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl">
                    <MapPin className="text-[#065f46]" size={20} />
                    <div>
                       <p className="text-[10px] font-black uppercase text-gray-400">Asal Produk</p>
                       <p className="text-xs font-bold">Ubud, Bali</p>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <button onClick={() => addToCart(selectedProduct)} className="flex-1 py-5 border-2 border-[#ee4d2d] text-[#ee4d2d] bg-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#ee4d2d] hover:text-white transition-all shadow-xl shadow-orange-100">Tambah Keranjang</button>
                 <button onClick={() => { addToCart(selectedProduct); setRoute(AppRoute.CART); }} className="flex-1 py-5 bg-[#ee4d2d] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-200 hover:scale-105 transition-all">Beli Sekarang</button>
              </div>
            </div>
          </div>

          {/* Description & Story */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                <h3 className="text-xl font-bold serif text-stone-800 border-b pb-4">Deskripsi Produk</h3>
                <p className="text-stone-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">{selectedProduct.description}</p>
             </div>
             <div className="bg-emerald-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <Sparkles size={120} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
                <h3 className="text-xl font-bold serif mb-6">Kisah di Baliknya</h3>
                <p className="text-emerald-100 font-light italic leading-loose text-sm italic">"{selectedProduct.story}"</p>
                <div className="mt-10 pt-6 border-t border-white/10 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">W</div>
                   <div>
                      <p className="text-xs font-bold uppercase tracking-widest">Wayan Artisan</p>
                      <p className="text-[10px] text-white/50">Master Craftsman</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminAuth = () => (
    <div className="max-w-md mx-auto py-24 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl space-y-8 border border-gray-100 text-center">
        <div className="w-20 h-20 bg-stone-100 text-[#ee4d2d] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold serif text-stone-800 tracking-tight">Seller Centre</h2>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Akses Terbatas Pengelola</p>
        </div>
        <div className="space-y-4">
          <input 
            type="password" 
            placeholder="PIN Keamanan" 
            value={adminPassInput}
            onChange={e => setAdminPassInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            className="w-full bg-stone-50 border border-gray-100 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-[#ee4d2d]/10 text-center font-bold tracking-[0.8em]"
          />
          <button onClick={handleAdminLogin} className="w-full bg-[#ee4d2d] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-100 hover:scale-105 transition-all">MASUK SISTEM</button>
        </div>
        <button onClick={() => setRoute(AppRoute.HOME)} className="text-[10px] text-gray-400 font-bold uppercase hover:text-[#ee4d2d] transition-colors">Kembali ke Beranda</button>
      </div>
    </div>
  );

  const handleAdminLogin = () => {
    if (adminPassInput === GLOBAL_CONFIG.ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
    } else {
      alert('Password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7]">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      <main className="main-content">
        {route === AppRoute.HOME && renderHome()}
        {route === AppRoute.CATALOG && renderCatalog()}
        {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
        {route === AppRoute.CART && (
           <div className="max-w-4xl mx-auto px-4 py-12">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm mb-8 border border-gray-100 flex items-center gap-4">
                 <div className="p-3 bg-stone-50 rounded-2xl text-[#ee4d2d]"><ShoppingCart /></div>
                 <h1 className="text-2xl font-bold serif text-stone-800">Keranjang Belanja ({cartCount})</h1>
              </div>
              
              {cart.length === 0 ? (
                 <div className="bg-white p-24 text-center rounded-[2.5rem] shadow-sm border-2 border-dashed border-gray-100">
                    <ShoppingBag size={64} className="mx-auto text-gray-100 mb-6" />
                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs mb-8">Wah, keranjangmu masih kosong!</p>
                    <button onClick={() => setRoute(AppRoute.HOME)} className="bg-[#ee4d2d] text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-100">MULAI BELANJA</button>
                 </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 mb-32">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 md:gap-6 group">
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden shrink-0">
                         <img src={item.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h3 className="text-sm md:text-base font-bold text-stone-800 truncate mb-1">{item.name}</h3>
                         <p className="text-[#ee4d2d] font-black text-lg">Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2">
                         <button onClick={() => {
                            setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i));
                         }} className="p-2 bg-stone-50 rounded-lg text-gray-400 hover:text-[#ee4d2d]"><Minus size={14}/></button>
                         <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                         <button onClick={() => {
                            setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i));
                         }} className="p-2 bg-stone-50 rounded-lg text-gray-400 hover:text-[#ee4d2d]"><Plus size={14}/></button>
                      </div>
                      <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="p-2 text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                    </div>
                  ))}
                  
                  <div className="fixed bottom-20 md:bottom-10 left-4 right-4 max-w-lg mx-auto bg-stone-900 text-white p-6 rounded-[2rem] shadow-2xl z-40">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Total Pembayaran</span>
                        <span className="text-2xl font-black text-[#ee4d2d]">Rp {cartTotal.toLocaleString('id-ID')}</span>
                     </div>
                     <button onClick={() => setRoute(AppRoute.CHECKOUT)} className="w-full bg-[#ee4d2d] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-950/20 active:scale-95 transition-all">LANJUT KE PEMBAYARAN</button>
                  </div>
                </div>
              )}
           </div>
        )}
        {route === AppRoute.ADMIN && (isAdminAuthenticated ? <div className="py-10"><AdminProductManager products={products} onUpdateProducts={setProducts} /></div> : renderAdminAuth())}
        {route === AppRoute.CHECKOUT && (
           <div className="max-w-3xl mx-auto py-12 px-4">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl space-y-10 border border-gray-100">
                 <div className="flex items-center gap-4 text-[#ee4d2d] border-b border-gray-100 pb-8">
                    <div className="p-4 bg-stone-50 rounded-2xl"><MapPin size={32} /></div>
                    <div>
                       <h1 className="text-2xl md:text-3xl font-bold serif text-stone-800 leading-tight">Data Pengiriman</h1>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Lengkapi untuk konfirmasi WhatsApp</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                       <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-stone-50 border border-gray-100 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-[#ee4d2d]/10 font-bold" placeholder="Nama Penerima" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">WhatsApp Aktif</label>
                       <input type="text" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-stone-50 border border-gray-100 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-[#ee4d2d]/10 font-bold" placeholder="Contoh: 08123456789" />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-3">
                       <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                       <textarea value={address.detail} onChange={e => setAddress({...address, detail: e.target.value})} className="w-full bg-stone-50 border border-gray-100 p-5 rounded-2xl h-40 outline-none focus:ring-4 focus:ring-[#ee4d2d]/10 font-medium resize-none" placeholder="Nama Jalan, Nomor Rumah, Kota, Provinsi, Kode Pos"></textarea>
                    </div>
                 </div>
                 <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Total Bayar</p>
                       <p className="text-3xl font-black text-emerald-900">Rp {cartTotal.toLocaleString('id-ID')}</p>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold italic">Bebas Biaya Ongkir</p>
                 </div>
                 <button onClick={() => {
                    if (!address.name || !address.phone || !address.detail) return alert('Lengkapi data pengiriman!');
                    const itemsStr = cart.map(item => `- ${item.name} (x${item.quantity})`).join('%0A');
                    const msg = `Halo StoryBali!%0A%0ASaya ingin pesan:%0A${itemsStr}%0A%0ATotal: Rp ${cartTotal.toLocaleString('id-ID')}%0A%0APenerima: ${address.name}%0AAlamat: ${address.detail}`;
                    window.open(`https://wa.me/6281234567890?text=${msg}`);
                    setCart([]);
                    setRoute(AppRoute.HOME);
                 }} className="w-full bg-[#ee4d2d] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-orange-100 flex items-center justify-center gap-4 hover:scale-105 transition-all">
                    KONFIRMASI VIA WHATSAPP <ChevronRight size={24} />
                 </button>
              </div>
           </div>
        )}
      </main>
      
      {/* Footer - Desktop Only */}
      <footer className="hidden md:block bg-stone-900 text-white py-20 mt-20">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-2 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#ee4d2d] text-white rounded-2xl flex items-center justify-center font-black text-3xl">S</div>
                  <h4 className="text-3xl font-bold serif tracking-tighter uppercase">StoryBali Artisan</h4>
               </div>
               <p className="text-stone-400 font-light leading-loose max-w-sm">Membawa kehangatan dan keaslian budaya Bali ke dalam rumah Anda. Setiap produk adalah cerita, setiap pesanan adalah dukungan bagi seniman lokal.</p>
            </div>
            <div className="space-y-4">
               <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ee4d2d]">Bantuan</h5>
               <ul className="space-y-2 text-sm text-stone-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">Cara Pemesanan</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Pengiriman</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Kebijakan Pengembalian</li>
               </ul>
            </div>
            <div className="space-y-4">
               <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ee4d2d]">Ikuti Kami</h5>
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center cursor-pointer hover:bg-[#ee4d2d] transition-colors"><User size={18} /></div>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-stone-600 font-black uppercase tracking-[0.4em]">&copy; 2024 STORYBALI ARTISAN STORE. HANDCRAFTED WITH SOUL IN BALI.</p>
         </div>
      </footer>

      <BottomNav />
      <ChatWidget />
    </div>
  );
};

export default App;
