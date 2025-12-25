
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
  ChevronLeft, ChevronRight,
  MapPin, Truck, Lock, AlertCircle,
  Filter, LayoutGrid, Search as SearchIcon
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
        if (cloudData && cloudData.length > 0) {
          setProducts(cloudData);
          localStorage.setItem('storybali_products', JSON.stringify(cloudData));
        } else {
          const savedProducts = localStorage.getItem('storybali_products');
          setProducts(savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS);
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

  const updateGlobalProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('storybali_products', JSON.stringify(newProducts));
  };

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

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setActiveImageIdx(0);
    setRoute(AppRoute.PRODUCT_DETAIL);
    window.scrollTo(0, 0);
  };

  const handleWhatsAppCheckout = () => {
    if (!address.name || !address.phone || !address.detail) return alert('Mohon lengkapi data pengiriman!');
    const itemsStr = cart.map(item => `- ${item.name} (x${item.quantity})`).join('%0A');
    const msg = `Halo StoryBali Store!%0A%0ASaya ingin memesan:%0A${itemsStr}%0A%0ATotal: Rp ${cartTotal.toLocaleString('id-ID')}%0A%0APenerima: ${address.name}%0ANo.HP: ${address.phone}%0AAlamat: ${address.detail}`;
    window.open(`https://wa.me/6281234567890?text=${msg}`);
    setCart([]);
    setRoute(AppRoute.HOME);
  };

  const handleAdminLogin = () => {
    if (adminPassInput === GLOBAL_CONFIG.ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
    } else {
      alert('Password salah!');
    }
  };

  const renderAdminAuth = () => (
    <div className="max-w-md mx-auto py-24 px-4">
      <div className="bg-white p-10 rounded-sm shadow-xl space-y-8 border border-gray-100 text-center">
        <div className="w-20 h-20 bg-[#fbebed] text-[#ee4d2d] rounded-full flex items-center justify-center mx-auto">
          <Lock size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Akses Terbatas</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Masukkan Password Admin StoryBali</p>
        </div>
        <div className="space-y-4">
          <input 
            type="password" 
            placeholder="Password..." 
            value={adminPassInput}
            onChange={e => setAdminPassInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-sm outline-none focus:border-[#ee4d2d] text-center font-bold tracking-[0.5em]"
          />
          <button onClick={handleAdminLogin} className="w-full bg-[#ee4d2d] text-white py-4 rounded-sm font-black text-sm shadow-xl shadow-orange-100">
            MASUK KE SELLER CENTRE
          </button>
        </div>
        <button onClick={() => setRoute(AppRoute.HOME)} className="text-xs text-gray-400 hover:text-[#ee4d2d] font-bold uppercase tracking-widest">Kembali ke Beranda</button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-6 md:space-y-12 pb-20 bg-[#f8f8f8] min-h-screen">
      <section className="relative h-[250px] md:h-[450px] bg-[#ee4d2d] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 w-full text-white">
           <div className="max-w-xl space-y-4">
              <div className="inline-block bg-white text-[#ee4d2d] px-2 py-0.5 rounded-sm text-[10px] font-bold">PULAU DEWATA</div>
              <h1 className="text-3xl md:text-7xl font-black tracking-tight leading-none uppercase">KARYA ARTISAN BALI</h1>
              <p className="text-xs md:text-sm opacity-90 max-w-xs md:max-w-md">Menghubungkan Anda langsung dengan pengrajin lokal terbaik di Bali.</p>
              <button onClick={() => setRoute(AppRoute.CATALOG)} className="px-10 py-4 bg-white text-[#ee4d2d] font-black rounded-sm text-xs shadow-2xl hover:scale-105 transition-transform uppercase tracking-widest">BELANJA SEKARANG</button>
           </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white p-6 rounded-sm shadow-sm">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Kategori Populer</h3>
           <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {categories.slice(1).map(cat => (
                <div 
                  key={cat} 
                  onClick={() => { setActiveCategory(cat); setRoute(AppRoute.CATALOG); }}
                  className="group cursor-pointer text-center space-y-2"
                >
                  <div className="aspect-square bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#fbebed] transition-colors border border-gray-100">
                    <Sparkles className="text-gray-300 group-hover:text-[#ee4d2d] transition-colors" size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block">{cat}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
           <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-[#ee4d2d] font-bold text-sm md:text-lg uppercase flex items-center gap-2">
                 <Sparkles size={18} /> Produk Terbaru
              </h2>
              <button onClick={() => setRoute(AppRoute.CATALOG)} className="text-[#ee4d2d] text-[10px] font-black uppercase tracking-widest hover:underline">Lihat Semua</button>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0.5 bg-gray-100">
             {products.length > 0 ? products.slice(0, 12).map(product => (
               <div key={product.id} className="bg-white">
                 <ProductCard product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
               </div>
             )) : (
               <div className="col-span-full py-24 text-center bg-white text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Memuat...</div>
             )}
           </div>
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 min-h-screen">
       {/* Sidebar Filters */}
       <aside className="w-full md:w-64 space-y-8">
          <div className="space-y-4">
             <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-800">
                <Filter size={16} /> Filter Produk
             </h3>
             <div className="space-y-1">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-4 py-3 text-xs font-bold rounded-sm transition-all ${activeCategory === cat ? 'bg-[#ee4d2d] text-white shadow-lg shadow-orange-100' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
          <div className="p-6 bg-[#ee4d2d]/5 border border-[#ee4d2d]/10 rounded-sm">
             <h4 className="text-[10px] font-black text-[#ee4d2d] uppercase tracking-widest mb-2">Pencarian</h4>
             <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari item..." 
                  className="w-full bg-white border border-gray-100 p-3 pl-10 text-xs outline-none rounded-sm focus:border-[#ee4d2d]"
                />
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
             </div>
          </div>
       </aside>

       {/* Grid */}
       <div className="flex-1">
          <div className="bg-white p-4 mb-4 rounded-sm flex justify-between items-center shadow-sm border border-gray-50">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Menampilkan {filteredProducts.length} Produk</span>
             <div className="flex gap-2">
                <button className="p-2 bg-gray-50 rounded-sm text-gray-400 hover:text-[#ee4d2d]"><LayoutGrid size={18}/></button>
             </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5 bg-gray-100 border border-gray-100">
             {filteredProducts.map(p => (
               <div key={p.id} className="bg-white">
                 <ProductCard product={p} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
               </div>
             ))}
             {filteredProducts.length === 0 && (
               <div className="col-span-full py-32 text-center bg-white">
                  <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Produk tidak ditemukan</p>
               </div>
             )}
          </div>
       </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const images = Array.isArray(selectedProduct.images) ? selectedProduct.images : [];
    return (
      <div className="bg-[#f5f5f5] py-4 md:py-10 min-h-screen pb-32">
        <div className="max-w-6xl mx-auto px-2">
          <div className="bg-white shadow-sm flex flex-col md:flex-row rounded-sm overflow-hidden border border-gray-100">
            {/* Gallery */}
            <div className="w-full md:w-[500px] p-4 space-y-4">
              <div className="aspect-square bg-gray-50 rounded-sm overflow-hidden border border-gray-100 flex items-center justify-center">
                <img src={images[activeImageIdx]} className="w-full h-full object-cover" alt={selectedProduct.name} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img, i) => (
                  <button key={i} onMouseEnter={() => setActiveImageIdx(i)} className={`w-16 h-16 md:w-20 md:h-20 border-2 rounded-sm overflow-hidden flex-shrink-0 transition-all ${activeImageIdx === i ? 'border-[#ee4d2d]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-6 md:p-10 space-y-6">
              <div className="space-y-2">
                 <h1 className="text-xl md:text-3xl font-medium text-gray-800 leading-tight">{selectedProduct.name}</h1>
                 <div className="flex items-center gap-4 text-xs divide-x divide-gray-200 py-2">
                    <div className="flex items-center gap-1 text-[#ee4d2d] font-bold">
                       <span className="underline">{selectedProduct.rating}</span>
                       <Star size={12} fill="#ffce3d" stroke="none" />
                    </div>
                    <div className="pl-4 text-gray-500 font-bold">{selectedProduct.soldCount} Terjual</div>
                 </div>
              </div>
              <div className="bg-[#fafafa] p-6 rounded-sm border-y border-gray-50">
                 <span className="text-[#ee4d2d] text-4xl font-bold tracking-tight">Rp {selectedProduct.price.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-10">
                 <button onClick={() => addToCart(selectedProduct)} className="flex-1 py-4 border border-[#ee4d2d] text-[#ee4d2d] bg-[#fbebed] rounded-sm font-bold text-sm hover:bg-[#f8dada] transition-colors flex items-center justify-center gap-2">
                   <ShoppingCart size={18} /> Masukkan Keranjang
                 </button>
                 <button onClick={() => { addToCart(selectedProduct); setRoute(AppRoute.CART); }} className="flex-1 py-4 bg-[#ee4d2d] text-white rounded-sm font-bold text-sm hover:bg-[#d73211] shadow-lg shadow-orange-100 transition-all">
                   Beli Sekarang
                 </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white p-8 rounded-sm shadow-sm space-y-10 border border-gray-100">
             <div className="space-y-4">
                <h3 className="bg-[#fafafa] p-3 font-bold text-gray-800 uppercase text-xs tracking-widest border-l-4 border-[#ee4d2d]">Spesifikasi Produk</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm px-4">
                   <div className="flex justify-between border-b pb-2"><span className="text-gray-400">Kategori</span> <span className="text-[#0055aa] font-bold">{selectedProduct.category}</span></div>
                   <div className="flex justify-between border-b pb-2"><span className="text-gray-400">Asal</span> <span className="text-gray-800 font-bold">Bali, Indonesia</span></div>
                </div>
             </div>
             <div className="space-y-4">
                <h3 className="bg-[#fafafa] p-3 font-bold text-gray-800 uppercase text-xs tracking-widest border-l-4 border-[#ee4d2d]">Deskripsi Produk</h3>
                <div className="px-4">
                   <p className="text-sm text-gray-600 leading-loose whitespace-pre-wrap">{selectedProduct.description}</p>
                   {selectedProduct.story && (
                     <div className="mt-8 p-6 bg-orange-50 border border-orange-100 rounded-lg">
                        <h4 className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-2">Cerita Artisan</h4>
                        <p className="text-sm italic text-orange-950/80 font-serif leading-relaxed">"{selectedProduct.story}"</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={(r) => { setRoute(r); setActiveCategory('Semua'); }} cartCount={cartCount} />}
      <main>
        {route === AppRoute.HOME && renderHome()}
        {route === AppRoute.CATALOG && renderCatalog()}
        {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
        {route === AppRoute.CART && (
           <div className="max-w-6xl mx-auto px-4 py-10">
              <div className="bg-white p-4 shadow-sm mb-6 flex items-center gap-2 border border-gray-100">
                 <ShoppingCart className="text-[#ee4d2d]" />
                 <h1 className="text-lg font-bold text-gray-800">Keranjang Belanja ({cartCount})</h1>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-4">
                    {cart.length === 0 ? (
                       <div className="bg-white p-24 text-center rounded-sm border border-dashed border-gray-200">
                          <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
                          <p className="text-gray-400 mb-8 font-bold uppercase tracking-widest text-xs">Wah, keranjangmu masih kosong!</p>
                          <button onClick={() => setRoute(AppRoute.HOME)} className="bg-[#ee4d2d] text-white px-12 py-4 rounded-sm font-black text-sm">BELANJA SEKARANG</button>
                       </div>
                    ) : cart.map(item => (
                       <div key={item.id} className="bg-white p-4 flex items-center gap-6 shadow-sm border border-gray-50">
                          <img src={item.images?.[0]} className="w-20 h-20 object-cover rounded-sm" />
                          <div className="flex-1 min-w-0">
                             <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                             <p className="text-[#ee4d2d] font-black text-base">Rp {item.price.toLocaleString('id-ID')}</p>
                          </div>
                          <div className="flex items-center border border-gray-200 rounded-sm">
                             <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-gray-400"><Minus size={14}/></button>
                             <span className="px-4 text-sm font-bold">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-400"><Plus size={14}/></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-200 hover:text-red-500"><Trash2 size={20}/></button>
                       </div>
                    ))}
                 </div>
                 <div className="bg-white p-8 shadow-sm rounded-sm border border-gray-100 h-fit sticky top-28">
                    <h3 className="font-bold border-b pb-4 mb-6 text-sm uppercase tracking-widest text-gray-800">Ringkasan Pesanan</h3>
                    <div className="space-y-4 mb-8">
                       <div className="flex justify-between text-sm text-gray-500"><span>Total Produk</span><span>Rp {cartTotal.toLocaleString('id-ID')}</span></div>
                       <div className="flex justify-between text-sm text-gray-500"><span>Pengiriman</span><span className="text-green-500 font-bold text-[10px]">Gratis Ongkir</span></div>
                       <div className="border-t pt-4 flex justify-between font-black text-xl text-[#ee4d2d]"><span className="text-gray-800 text-sm font-bold">Total</span><span>Rp {cartTotal.toLocaleString('id-ID')}</span></div>
                    </div>
                    <button onClick={() => setRoute(AppRoute.CHECKOUT)} disabled={cart.length === 0} className="w-full bg-[#ee4d2d] text-white py-5 font-black rounded-sm disabled:opacity-50 shadow-xl shadow-orange-100 uppercase tracking-widest text-sm">CHECKOUT</button>
                 </div>
              </div>
           </div>
        )}
        {route === AppRoute.ADMIN && (isAdminAuthenticated ? <div className="py-10"><AdminProductManager products={products} onUpdateProducts={updateGlobalProducts} /></div> : renderAdminAuth())}
        {route === AppRoute.CHECKOUT && (
           <div className="max-w-4xl mx-auto py-12 px-4">
              <div className="bg-white p-10 rounded-sm shadow-xl space-y-10 border border-gray-100">
                 <div className="flex items-center gap-4 text-[#ee4d2d] border-b pb-6">
                    <MapPin size={28} />
                    <h1 className="text-2xl font-black uppercase tracking-tight">Data Pengiriman</h1>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                       <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-sm outline-none focus:border-[#ee4d2d] text-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp</label>
                       <input type="text" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-sm outline-none focus:border-[#ee4d2d] text-sm font-bold" />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alamat Lengkap</label>
                       <textarea value={address.detail} onChange={e => setAddress({...address, detail: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-sm h-32 outline-none focus:border-[#ee4d2d] text-sm resize-none"></textarea>
                    </div>
                 </div>
                 <button onClick={handleWhatsAppCheckout} className="w-full bg-[#ee4d2d] text-white py-6 rounded-sm font-black text-xl shadow-2xl shadow-orange-200 flex items-center justify-center gap-4">
                    BELI VIA WHATSAPP <ChevronRight size={24} />
                 </button>
              </div>
           </div>
        )}
      </main>
      
      {route !== AppRoute.ADMIN && (
        <footer className="bg-white border-t border-gray-100 py-16 mt-20">
           <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#ee4d2d] text-white flex items-center justify-center rounded-xl font-black text-2xl">S</div>
                 <h4 className="text-xl font-black text-gray-800 uppercase tracking-tighter">StoryBali</h4>
              </div>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">&copy; 2024 STORYBALI ARTISAN STORE.</p>
           </div>
        </footer>
      )}
      <ChatWidget />
    </div>
  );
};

export default App;
