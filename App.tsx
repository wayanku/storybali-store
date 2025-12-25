
import React, { useState, useEffect, useMemo } from 'react';
import { AppRoute, Product, CartItem } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ChatWidget from './components/ChatWidget';
import AdminProductManager from './components/AdminProductManager';
import { 
  ArrowRight,
  ArrowLeft, // Fix: Added missing import for ArrowLeft
  Trash2, 
  Plus, 
  Minus, 
  Sparkles,
  Zap,
  ChevronRight,
  Truck,
  ShieldCheck,
  CreditCard,
  Star,
  ShoppingCart,
  ShoppingBag,
  PackageSearch,
  Image as ImageIcon,
  Globe
} from 'lucide-react';
import { getProductEnhancement, generateMarketingImage } from './services/geminiService';
import { getStoreData } from './services/cloudService';

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [marketingImg, setMarketingImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const scriptUrl = urlParams.get('api') || localStorage.getItem('storybali_script_url');
      
      if (scriptUrl) {
        const cloudData = await getStoreData(scriptUrl);
        if (cloudData && cloudData.length > 0) {
          setProducts(cloudData);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      } else {
        const savedProducts = localStorage.getItem('storybali_products');
        setProducts(savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS);
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

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    alert(`${product.name} ditambahkan ke keranjang!`);
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
    setMarketingImg(null);
    setRoute(AppRoute.PRODUCT_DETAIL);
    window.scrollTo(0, 0);
  };

  const renderHome = () => (
    <div className="animate-fade-in space-y-20 pb-20">
      {/* Luxury Hero Banner */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden bg-stone-900 flex items-center">
        <img src="https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-8 w-full">
           <div className="max-w-2xl space-y-8">
              <span className="text-orange-500 font-black tracking-[0.4em] uppercase text-xs">Cultural Heritage Excellence</span>
              <h1 className="text-6xl sm:text-8xl font-black text-white leading-[0.9] tracking-tighter">KEAGUNGAN SENI BALI.</h1>
              <p className="text-stone-300 text-lg font-medium leading-relaxed max-w-lg">Temukan keajaiban karya tangan pengrajin terbaik dari desa-desa tersembunyi di Pulau Dewata langsung ke genggaman Anda.</p>
              <div className="flex gap-4">
                 <button onClick={() => setRoute(AppRoute.CATALOG)} className="px-12 py-5 bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-950/40">Mulai Jelajah</button>
              </div>
           </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4">
             <div className="h-1.5 w-20 bg-emerald-800 rounded-full" />
             <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase">Koleksi Terpilih</h2>
          </div>
          <button onClick={() => setRoute(AppRoute.CATALOG)} className="text-stone-400 hover:text-emerald-800 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group transition-all">Lihat Semua <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform"/></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.slice(0, 5).map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="flex items-start gap-6">
              <div className="p-5 bg-white rounded-3xl shadow-sm text-emerald-800"><Truck size={32}/></div>
              <div>
                 <h4 className="font-black text-stone-800 uppercase text-xs tracking-widest mb-2">Global Shipping</h4>
                 <p className="text-stone-500 text-sm font-medium">Pengiriman aman ke seluruh penjuru dunia dengan kurir terpercaya.</p>
              </div>
           </div>
           <div className="flex items-start gap-6">
              <div className="p-5 bg-white rounded-3xl shadow-sm text-emerald-800"><ShieldCheck size={32}/></div>
              <div>
                 <h4 className="font-black text-stone-800 uppercase text-xs tracking-widest mb-2">Authenticity</h4>
                 <p className="text-stone-500 text-sm font-medium">Jaminan keaslian 100% dari pengrajin lokal bersertifikat StoryBali.</p>
              </div>
           </div>
           <div className="flex items-start gap-6">
              <div className="p-5 bg-white rounded-3xl shadow-sm text-emerald-800"><CreditCard size={32}/></div>
              <div>
                 <h4 className="font-black text-stone-800 uppercase text-xs tracking-widest mb-2">Secure Pay</h4>
                 <p className="text-stone-500 text-sm font-medium">Sistem pembayaran terenkripsi yang mendukung bank lokal & internasional.</p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => (
    <div className="max-w-7xl mx-auto px-8 py-20 animate-fade-in bg-stone-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="space-y-4">
          <span className="text-emerald-700 font-black text-[10px] uppercase tracking-[0.4em]">Craftsmanship Portfolio</span>
          <h1 className="text-5xl font-black text-stone-900 tracking-tighter uppercase">Katalog Warisan Bali</h1>
        </div>
        <div className="flex items-center gap-3 text-stone-400 bg-white px-6 py-3 rounded-2xl border border-stone-100 shadow-sm">
          <PackageSearch size={18} className="text-emerald-800" /> 
          <span className="text-xs font-black uppercase tracking-widest">{products.length} Produk Tersedia</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
        ))}
      </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="max-w-7xl mx-auto px-8 py-20 animate-fade-in">
        <button onClick={() => setRoute(AppRoute.CATALOG)} className="flex items-center gap-3 text-stone-400 hover:text-emerald-800 mb-12 font-black text-[10px] uppercase tracking-widest group">
          <ArrowLeft className="group-hover:-translate-x-2 transition-transform" size={16} /> Kembali Ke Galeri
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-6">
            <div className="aspect-square bg-white rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-stone-100 relative group">
              <img src={marketingImg || selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
              {isEnhancing && (
                <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-md flex flex-col items-center justify-center text-white">
                   <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">AI Mengolah Visual...</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={async () => {
                 setIsEnhancing(true);
                 const img = await generateMarketingImage(selectedProduct.name);
                 if (img) setMarketingImg(img);
                 setIsEnhancing(false);
               }} disabled={isEnhancing} className="flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-800 py-4 rounded-2xl font-black text-[10px] hover:bg-stone-50 transition-all uppercase tracking-widest shadow-sm">
                 <ImageIcon size={16} /> Iklan Visual AI
               </button>
               <button onClick={async () => {
                 setIsEnhancing(true);
                 const desc = await getProductEnhancement(selectedProduct.name, selectedProduct.description);
                 setSelectedProduct({...selectedProduct, description: desc});
                 setIsEnhancing(false);
               }} disabled={isEnhancing} className="flex items-center justify-center gap-2 bg-emerald-800 text-white py-4 rounded-2xl font-black text-[10px] hover:bg-emerald-900 transition-all uppercase tracking-widest shadow-xl shadow-emerald-100">
                 <Sparkles size={16} /> Optimasi Narasi AI
               </button>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="mb-10">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.4em]">{selectedProduct.category}</span>
              <h1 className="text-5xl font-black text-stone-900 mt-4 mb-6 leading-[1.1] tracking-tighter">{selectedProduct.name}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-yellow-500">
                  <Star size={20} fill="currentColor" />
                  <span className="text-sm font-black text-stone-800">{selectedProduct.rating}</span>
                </div>
                <div className="w-1.5 h-1.5 bg-stone-200 rounded-full" />
                <div className="text-stone-400 text-xs font-bold uppercase tracking-widest">{selectedProduct.soldCount.toLocaleString()} Terjual</div>
              </div>
            </div>
            <div className="flex flex-col mb-12">
              {selectedProduct.originalPrice && <span className="text-stone-400 line-through text-lg mb-1">{formatRupiah(selectedProduct.originalPrice)}</span>}
              <span className="text-6xl font-black text-emerald-800 tracking-tighter">{formatRupiah(selectedProduct.price)}</span>
            </div>
            <div className="space-y-8 mb-12">
              <p className="text-stone-600 leading-relaxed text-lg font-medium">{selectedProduct.description}</p>
              <div className="bg-stone-100 p-8 rounded-[2rem] border-l-8 border-emerald-800">
                <p className="text-stone-500 italic text-sm leading-relaxed font-serif">"{selectedProduct.story}"</p>
              </div>
            </div>
            <button onClick={() => addToCart(selectedProduct)} className="w-full bg-stone-900 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-800 transition-all shadow-2xl active:scale-95">
              <ShoppingCart size={24} /> Masukkan Keranjang
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className="max-w-5xl mx-auto px-8 py-20 animate-fade-in">
      <div className="flex items-center gap-6 mb-16">
        <div className="w-16 h-16 bg-stone-100 rounded-3xl flex items-center justify-center text-emerald-800"><ShoppingBag size={32} /></div>
        <div>
           <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase">Keranjang Anda</h1>
           <p className="text-stone-400 text-xs font-black uppercase tracking-widest mt-1">{cartCount} Item Terpilih</p>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-stone-100 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-stone-200 mb-8"><ShoppingBag size={48} /></div>
          <p className="text-stone-400 font-black uppercase tracking-widest mb-10 text-sm">Keranjang Anda masih kosong</p>
          <button onClick={() => setRoute(AppRoute.CATALOG)} className="bg-emerald-800 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100">Jelajahi Produk</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden divide-y divide-stone-50">
              {cart.map(item => (
                <div key={item.id} className="p-8 flex flex-col sm:flex-row items-center gap-8 group">
                  <div className="w-28 h-28 bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-black text-stone-800 text-lg mb-1 leading-tight">{item.name}</h3>
                    <p className="text-emerald-800 font-black text-xl">{formatRupiah(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-stone-100 rounded-xl p-1.5">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-emerald-800"><Minus size={18} /></button>
                      <span className="w-10 text-center font-black text-stone-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-emerald-800"><Plus size={18} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="w-12 h-12 flex items-center justify-center text-stone-200 hover:text-red-600 transition-colors"><Trash2 size={24} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-emerald-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-950/40">
               <div className="space-y-4 mb-10">
                  <div className="flex justify-between items-center text-emerald-200 font-black text-[10px] uppercase tracking-widest">
                     <span>Subtotal</span>
                     <span>{formatRupiah(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-200 font-black text-[10px] uppercase tracking-widest">
                     <span>Pengiriman</span>
                     <span className="text-white">Gratis</span>
                  </div>
                  <div className="h-px bg-white/10 my-6" />
                  <div className="flex justify-between items-end">
                     <p className="text-[10px] font-black uppercase text-emerald-200 tracking-[0.2em] mb-1">Total Bayar</p>
                     <p className="text-4xl font-black tracking-tighter">{formatRupiah(cartTotal)}</p>
                  </div>
               </div>
               <button onClick={() => setRoute(AppRoute.CHECKOUT)} className="w-full bg-white text-emerald-900 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-3">
                 Lanjut Checkout <ArrowRight size={20} />
               </button>
            </div>
            <div className="bg-stone-100 p-6 rounded-3xl border border-stone-200 flex items-center gap-4">
               <ShieldCheck size={24} className="text-emerald-800" />
               <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest leading-relaxed">StoryBali menjamin keamanan transaksi & perlindungan data artisan.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center text-white font-black text-2xl animate-bounce shadow-2xl">S</div>
      <div className="mt-8 flex flex-col items-center gap-2">
         <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] animate-pulse">Menghubungkan ke API Cloud...</p>
         <div className="w-32 h-1 bg-stone-200 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-emerald-800 animate-[loading_1s_ease-in-out_infinite]" />
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-100 selection:text-emerald-900 bg-stone-50">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      <main className="flex-grow">
        {route === AppRoute.HOME && renderHome()}
        {route === AppRoute.CATALOG && renderCatalog()}
        {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
        {route === AppRoute.CART && renderCart()}
        {route === AppRoute.ADMIN && <div className="py-12 bg-stone-100"><AdminProductManager products={products} onUpdateProducts={updateGlobalProducts} /></div>}
        {route === AppRoute.CHECKOUT && (
          <div className="py-32 text-center">
             <div className="max-w-md mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl border border-stone-50">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-10"><ShieldCheck size={40} /></div>
                <h1 className="text-4xl font-black mb-6 text-stone-900 tracking-tighter uppercase">Pembayaran Aman</h1>
                <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-12 leading-loose">Terima kasih telah mendukung pengrajin Bali. Pesanan Anda segera kami proses.</p>
                <button onClick={() => {alert("Pesanan Berhasil!"); setCart([]); setRoute(AppRoute.HOME);}} className="w-full bg-stone-900 text-white py-6 rounded-2xl uppercase text-[11px] font-black tracking-widest shadow-xl hover:bg-emerald-800 transition-all active:scale-95">Konfirmasi & Selesai</button>
             </div>
          </div>
        )}
      </main>
      
      {route !== AppRoute.ADMIN && (
        <footer className="bg-white border-t border-stone-100 pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-8">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
                <div className="col-span-1 md:col-span-2 space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">S</div>
                      <span className="text-xl font-black tracking-tighter text-stone-800 uppercase">StoryBali Store</span>
                   </div>
                   <p className="text-stone-400 font-medium text-sm leading-relaxed max-w-sm italic font-serif">"Melestarikan budaya melalui karya, menghubungkan dunia dengan keajaiban Pulau Dewata."</p>
                </div>
                <div className="space-y-6">
                   <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Navigasi</h5>
                   <div className="flex flex-col gap-4 text-xs font-bold text-stone-400">
                      <button onClick={() => setRoute(AppRoute.HOME)} className="hover:text-emerald-800 transition-colors text-left">Beranda</button>
                      <button onClick={() => setRoute(AppRoute.CATALOG)} className="hover:text-emerald-800 transition-colors text-left">Semua Produk</button>
                      <button className="hover:text-emerald-800 transition-colors text-left">Tentang Kami</button>
                   </div>
                </div>
                <div className="space-y-6">
                   <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Artisan Support</h5>
                   <div className="flex flex-col gap-4 text-xs font-bold text-stone-400">
                      <span className="hover:text-emerald-800 transition-colors cursor-pointer">Menjadi Pengrajin</span>
                      <span className="hover:text-emerald-800 transition-colors cursor-pointer">Kebijakan Pengembalian</span>
                      <span className="hover:text-emerald-800 transition-colors cursor-pointer">Lacak Pesanan</span>
                   </div>
                </div>
             </div>
             <div className="h-px bg-stone-50 mb-10" />
             <p className="text-[9px] text-stone-300 font-black uppercase tracking-[0.3em] text-center">&copy; 2024 StoryBali Artisan Store - Professional Heritage Commerce</p>
          </div>
        </footer>
      )}
      <ChatWidget />
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5f5f4;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #065f46;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;
