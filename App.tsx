
import React, { useState, useEffect, useMemo } from 'react';
import { AppRoute, Product, CartItem } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ChatWidget from './components/ChatWidget';
import AdminProductManager from './components/AdminProductManager';
import { 
  ArrowRight, 
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
  BarChart3,
  Smartphone,
  LayoutDashboard,
  PackageSearch,
  Settings,
  Image as ImageIcon,
  Database,
  Globe
} from 'lucide-react';
import { getProductEnhancement, generateMarketingImage } from './services/geminiService';
import { getStoreData } from './services/cloudService';

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
          localStorage.setItem('storybali_script_url', scriptUrl);
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

  // Fix: Added the missing renderCatalog function used in the main render logic.
  const renderCatalog = () => (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in bg-stone-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="h-10 w-1.5 bg-emerald-700" />
          <h1 className="text-3xl font-black text-stone-800 uppercase tracking-tighter">Katalog Pengrajin Bali</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-500 font-bold bg-white px-4 py-2 rounded-full border border-stone-100">
          <PackageSearch size={16} className="text-orange-500" /> {products.length} Produk Ditemukan
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
        ))}
      </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
        <button onClick={() => setRoute(AppRoute.CATALOG)} className="flex items-center gap-2 text-stone-500 hover:text-orange-500 mb-8 font-bold text-sm uppercase tracking-tighter">
          <ArrowRight className="rotate-180" size={16} /> KEMBALI KE KATALOG
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-100">
              <img src={marketingImg || selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={async () => {
                 setIsEnhancing(true);
                 const img = await generateMarketingImage(selectedProduct.name);
                 if (img) setMarketingImg(img);
                 setIsEnhancing(false);
               }} disabled={isEnhancing} className="flex items-center justify-center gap-2 bg-white border-2 border-orange-500 text-orange-500 py-3 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all disabled:opacity-50">
                 <ImageIcon size={18} /> {isEnhancing ? 'Generating...' : 'Iklan AI'}
               </button>
               <button onClick={async () => {
                 setIsEnhancing(true);
                 const desc = await getProductEnhancement(selectedProduct.name, selectedProduct.description);
                 setSelectedProduct({...selectedProduct, description: desc});
                 setIsEnhancing(false);
               }} disabled={isEnhancing} className="flex items-center justify-center gap-2 bg-emerald-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg disabled:opacity-50">
                 <Sparkles size={18} /> {isEnhancing ? 'Writing...' : 'Tulis AI'}
               </button>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{selectedProduct.category}</span>
              <h1 className="text-4xl font-black text-stone-800 mt-2 mb-4 leading-tight">{selectedProduct.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-orange-500 font-bold">
                  <Star size={16} fill="currentColor" /> {selectedProduct.rating}
                </div>
                <div className="text-stone-500 font-medium">{selectedProduct.soldCount} Terjual</div>
              </div>
            </div>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl font-black text-emerald-800">${selectedProduct.price}</span>
            </div>
            <div className="space-y-6 mb-10">
              <p className="text-stone-600 leading-relaxed">{selectedProduct.description}</p>
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 italic text-stone-500 text-sm">
                "{selectedProduct.story}"
              </div>
            </div>
            <button onClick={() => addToCart(selectedProduct)} className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-orange-100">
              <ShoppingCart size={24} /> TAMBAHKAN KE KERANJANG
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
      <h1 className="text-4xl font-black text-stone-800 mb-10 flex items-center gap-4">
        <ShoppingBag size={36} className="text-emerald-800" /> Keranjang Belanja
      </h1>
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
          <p className="text-stone-500 font-bold mb-8">Wah, keranjangmu masih kosong nih!</p>
          <button onClick={() => setRoute(AppRoute.CATALOG)} className="bg-emerald-800 text-white px-8 py-3 rounded-full font-bold">Mulai Belanja</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
            {cart.map(item => (
              <div key={item.id} className="p-6 flex items-center gap-6 border-b border-stone-50 last:border-none">
                <img src={item.image} className="w-24 h-24 rounded-2xl object-cover border" alt={item.name} />
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 text-lg mb-1">{item.name}</h3>
                  <p className="text-emerald-700 font-black text-xl">${item.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-stone-100 rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-stone-600"><Minus size={16} /></button>
                    <span className="w-10 text-center font-bold text-stone-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-stone-600"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-3 text-stone-300 hover:text-red-500"><Trash2 size={20} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/10">
               <div>
                  <p className="text-emerald-200 text-xs font-bold uppercase mb-1">Total Pembayaran</p>
                  <p className="text-4xl font-black">${cartTotal.toFixed(2)}</p>
               </div>
            </div>
            <button onClick={() => setRoute(AppRoute.CHECKOUT)} className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3">
              LANJUT KE PEMBAYARAN <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderHome = () => (
    <div className="animate-fade-in pb-20 bg-stone-50">
      <section className="bg-white pt-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-2">
          <div className="lg:col-span-2 relative h-[300px] sm:h-[400px] rounded-lg overflow-hidden group cursor-pointer shadow-lg shadow-stone-200">
            <img src="https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Bali Banner" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12 text-white">
              <span className="bg-orange-500 w-fit px-3 py-1 rounded text-xs font-bold mb-4">BALI EXPO 2024</span>
              <h2 className="text-4xl font-black mb-2 text-white">Pesta Kesenian Bali</h2>
              <button onClick={() => setRoute(AppRoute.CATALOG)} className="bg-white text-emerald-800 px-8 py-3 rounded-full font-bold w-fit mt-6 hover:bg-orange-500 hover:text-white transition-all shadow-xl">Belanja Sekarang</button>
            </div>
          </div>
          <div className="hidden lg:grid grid-rows-2 gap-2">
            <div className="relative rounded-lg overflow-hidden bg-orange-100 p-6 flex flex-col justify-center border border-orange-200 shadow-inner">
               <h3 className="text-xl font-bold text-orange-700">Gratis Ongkir</h3>
               <p className="text-sm text-orange-600 mb-4">Min. belanja $20 ke seluruh dunia</p>
               <div className="bg-white w-fit px-4 py-1.5 rounded-full text-xs font-bold text-orange-600 shadow-sm">KLAIM VOUCHER</div>
            </div>
            <div className="relative rounded-lg overflow-hidden group shadow-md">
               <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Side Banner" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 mt-4 max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
           <div className="h-8 w-1 bg-emerald-700" />
           <h2 className="text-xl font-bold uppercase tracking-tight">Rekomendasi Untukmu</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
          ))}
        </div>
      </section>
    </div>
  );

  const renderAdmin = () => (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-emerald-900 text-white p-6 shadow-2xl z-10">
        <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => setRoute(AppRoute.HOME)}>
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-white">S</div>
          <span className="font-black text-xl tracking-tighter">STORYBALI ADMIN</span>
        </div>
        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-800 rounded-lg text-sm font-bold shadow-md">
            <LayoutDashboard size={18} /> Master Control
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <h1 className="text-2xl font-black text-stone-800 flex items-center gap-3">
            <Globe className="text-orange-500" /> Global Store Manager
          </h1>
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
            Cloud API: Synchronized
          </div>
        </header>

        <AdminProductManager 
          products={products} 
          onUpdateProducts={updateGlobalProducts} 
        />
      </main>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-bold text-stone-400 uppercase tracking-widest animate-pulse">Menghubungkan ke API Google...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-orange-100 selection:text-orange-900">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      <main className="flex-grow">
        {route === AppRoute.HOME && renderHome()}
        {route === AppRoute.CATALOG && renderCatalog()}
        {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
        {route === AppRoute.CART && renderCart()}
        {route === AppRoute.ADMIN && renderAdmin()}
        {route === AppRoute.CHECKOUT && (
          <div className="py-20 text-center bg-stone-50">
             <div className="max-w-md mx-auto bg-white p-12 rounded-3xl shadow-xl border border-stone-100">
                <ShieldCheck size={48} className="mx-auto text-emerald-600 mb-8" />
                <h1 className="text-3xl font-black mb-4 text-stone-800 tracking-tighter">Pembayaran Aman</h1>
                <p className="text-stone-500 text-sm mb-10 font-medium">Pesanan Anda akan langsung tercatat di sistem StoryBali Store.</p>
                <button onClick={() => {alert("Pesanan Berhasil!"); setCart([]); setRoute(AppRoute.HOME);}} className="w-full bg-orange-600 text-white py-5 rounded-xl uppercase text-sm font-black shadow-lg shadow-orange-100 hover:scale-[1.02] transition-all">Konfirmasi Pesanan</button>
             </div>
          </div>
        )}
      </main>
      
      {route !== AppRoute.ADMIN && (
        <footer className="bg-white border-t border-stone-100 pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 text-center">
             <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">&copy; 2024 StoryBali Store - Real-time Connected Commerce</p>
          </div>
        </footer>
      )}
      <ChatWidget />
    </div>
  );
};

export default App;
