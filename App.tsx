
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
  Image as ImageIcon
} from 'lucide-react';
import { getProductEnhancement, generateMarketingImage } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [marketingImg, setMarketingImg] = useState<string | null>(null);

  // Load Products and Cart on Mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('storybali_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('storybali_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    const savedCart = localStorage.getItem('storybali_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('storybali_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync Products to LocalStorage
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

  const enhanceDescription = async () => {
    if (!selectedProduct) return;
    setIsEnhancing(true);
    try {
      const enhancedDesc = await getProductEnhancement(selectedProduct.name, selectedProduct.description);
      const updatedProduct = { ...selectedProduct, description: enhancedDesc };
      setSelectedProduct(updatedProduct);
      updateGlobalProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
    } catch (error) {
      console.error("Enhance error:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateAd = async () => {
    if (!selectedProduct) return;
    setIsEnhancing(true);
    try {
      const img = await generateMarketingImage(selectedProduct.name);
      if (img) setMarketingImg(img);
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Implementasi renderProductDetail untuk memperbaiki error line 243
  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
        <button 
          onClick={() => setRoute(AppRoute.CATALOG)}
          className="flex items-center gap-2 text-stone-500 hover:text-orange-500 mb-8 transition-colors font-bold text-sm"
        >
          <ArrowRight className="rotate-180" size={16} /> KEMBALI KE KATALOG
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-100">
              <img 
                src={marketingImg || selectedProduct.image} 
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            {marketingImg && (
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-3">
                <Sparkles className="text-orange-500" size={20} />
                <p className="text-xs text-orange-800 font-medium">Ini adalah gambar promosi yang dibuat secara otomatis oleh AI untuk produk ini.</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={generateAd}
                disabled={isEnhancing}
                className="flex items-center justify-center gap-2 bg-white border-2 border-orange-500 text-orange-500 py-3 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all disabled:opacity-50"
               >
                 <ImageIcon size={18} /> {isEnhancing ? 'Generating...' : 'Buat Iklan AI'}
               </button>
               <button 
                onClick={enhanceDescription}
                disabled={isEnhancing}
                className="flex items-center justify-center gap-2 bg-emerald-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
               >
                 <Sparkles size={18} /> {isEnhancing ? 'Writing...' : 'Tulis Ulang Cerita'}
               </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{selectedProduct.category}</span>
              <h1 className="text-4xl font-black text-stone-800 mt-2 mb-4 leading-tight">{selectedProduct.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-orange-500 font-bold">
                  <Star size={16} fill="currentColor" /> {selectedProduct.rating}
                </div>
                <div className="w-1 h-1 bg-stone-300 rounded-full" />
                <div className="text-stone-500 font-medium">{selectedProduct.soldCount} Terjual</div>
              </div>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl font-black text-emerald-800">${selectedProduct.price}</span>
              {selectedProduct.originalPrice && (
                <span className="text-2xl text-stone-300 line-through font-bold">${selectedProduct.originalPrice}</span>
              )}
            </div>

            <div className="space-y-6 mb-10">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Deskripsi</h4>
                <p className="text-stone-600 leading-relaxed">{selectedProduct.description}</p>
              </div>
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 italic">
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-800 mb-2 flex items-center gap-2">
                  <Sparkles size={14} /> Cerita Pengrajin
                </h4>
                <p className="text-stone-500 text-sm leading-relaxed">"{selectedProduct.story}"</p>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-stone-100">
              <button 
                onClick={() => addToCart(selectedProduct)}
                className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-orange-600 hover:scale-[1.02] transition-all shadow-xl shadow-orange-100"
              >
                <ShoppingCart size={24} /> TAMBAHKAN KE KERANJANG
              </button>
              <div className="flex justify-between mt-6 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                <div className="flex items-center gap-2"><Truck size={14} /> Pengiriman Aman</div>
                <div className="flex items-center gap-2"><ShieldCheck size={14} /> Garansi 100% Ori</div>
                <div className="flex items-center gap-2"><CreditCard size={14} /> Pembayaran Aman</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Implementasi renderCart untuk memperbaiki error line 244
  const renderCart = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
      <h1 className="text-4xl font-black text-stone-800 mb-10 flex items-center gap-4">
        <ShoppingBag size={36} className="text-emerald-800" />
        Keranjang Belanja
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
            <ShoppingBag size={40} />
          </div>
          <p className="text-stone-500 font-bold mb-8">Wah, keranjangmu masih kosong nih!</p>
          <button 
            onClick={() => setRoute(AppRoute.CATALOG)}
            className="bg-emerald-800 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-colors"
          >
            Mulai Belanja
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
            {cart.map(item => (
              <div key={item.id} className="p-6 flex items-center gap-6 border-b border-stone-50 last:border-none">
                <img src={item.image} className="w-24 h-24 rounded-2xl object-cover border shadow-sm" alt={item.name} />
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 text-lg mb-1">{item.name}</h3>
                  <p className="text-emerald-700 font-black text-xl">${item.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-stone-100 rounded-xl p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-stone-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold text-stone-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-stone-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-900/20">
            <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/10">
               <div>
                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Total Pembayaran</p>
                  <p className="text-4xl font-black">${cartTotal.toFixed(2)}</p>
               </div>
               <div className="text-right">
                  <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest mb-1">Items</p>
                  <p className="text-xl font-bold">{cartCount} Produk</p>
               </div>
            </div>
            <button 
              onClick={() => setRoute(AppRoute.CHECKOUT)}
              className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-orange-600 hover:scale-[1.02] transition-all"
            >
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
          <div className="lg:col-span-2 relative h-[300px] sm:h-[400px] rounded-lg overflow-hidden group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Bali Banner" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12 text-white">
              <span className="bg-orange-500 w-fit px-3 py-1 rounded text-xs font-bold mb-4">BALI EXPO 2024</span>
              <h2 className="text-4xl font-black mb-2">Pesta Kesenian Bali</h2>
              <p className="text-lg opacity-90 mb-6">Diskon hingga 70% untuk Kerajinan Pilihan</p>
              <button onClick={() => setRoute(AppRoute.CATALOG)} className="bg-white text-emerald-800 px-8 py-3 rounded-full font-bold w-fit hover:bg-orange-500 hover:text-white transition-all">Belanja Sekarang</button>
            </div>
          </div>
          <div className="hidden lg:grid grid-rows-2 gap-2">
            <div className="relative rounded-lg overflow-hidden bg-orange-100 p-6 flex flex-col justify-center border border-orange-200">
               <h3 className="text-xl font-bold text-orange-700">Gratis Ongkir</h3>
               <p className="text-sm text-orange-600 mb-4">Min. belanja $20 ke seluruh dunia</p>
               <div className="bg-white w-fit px-4 py-1.5 rounded-full text-xs font-bold text-orange-600 shadow-sm">KLAIM VOUCHER</div>
            </div>
            <div className="relative rounded-lg overflow-hidden group">
               <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Side Banner" />
               <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center">
                  <span className="text-white font-bold border-2 border-white px-4 py-2">NEW ARRIVALS</span>
               </div>
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

  const renderCatalog = () => (
    <div className="py-10 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-emerald-900 text-white p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold">A</div>
          <span className="font-black text-xl tracking-tighter">ADMIN PANEL</span>
        </div>
        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-800 rounded-lg text-sm font-bold">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-800/50 rounded-lg text-sm text-emerald-100">
            <PackageSearch size={18} /> Kelola Produk
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-800/50 rounded-lg text-sm text-emerald-100">
            <Settings size={18} /> Pengaturan Toko
          </button>
        </nav>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-stone-800">Manajemen Produk</h1>
          <div className="text-sm font-bold text-stone-400 uppercase tracking-widest">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <p className="text-xs font-bold text-stone-400 uppercase mb-1">Total Produk</p>
            <p className="text-3xl font-black text-emerald-800">{products.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <p className="text-xs font-bold text-stone-400 uppercase mb-1">Total Stok</p>
            <p className="text-3xl font-black text-blue-600">{products.reduce((acc, p) => acc + p.soldCount, 0)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <p className="text-xs font-bold text-stone-400 uppercase mb-1">Rating Toko</p>
            <p className="text-3xl font-black text-orange-500">4.9/5.0</p>
          </div>
        </div>

        {/* Main Product Manager Component */}
        <AdminProductManager 
          products={products} 
          onUpdateProducts={updateGlobalProducts} 
        />
      </main>
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
             <div className="max-w-md mx-auto bg-white p-12 rounded-3xl shadow-sm border">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                   <ShieldCheck size={48} />
                </div>
                <h1 className="text-3xl font-black mb-4">Pembayaran Aman</h1>
                <p className="text-stone-500 mb-10 leading-relaxed">Sistem StoryBali menjamin keamanan data dan transaksi Anda dengan enkripsi kelas dunia.</p>
                <button onClick={() => {alert("Pesanan Berhasil!"); setCart([]); setRoute(AppRoute.HOME);}} className="w-full bg-orange-600 text-white py-5 rounded-xl uppercase text-sm font-black shadow-lg shadow-orange-100 hover:scale-[1.02] transition-transform">Konfirmasi Pesanan</button>
             </div>
          </div>
        )}
      </main>
      
      {route !== AppRoute.ADMIN && (
        <footer className="bg-white border-t border-stone-100 pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-emerald-800 mb-6">Layanan Pelanggan</h4>
              <ul className="text-sm text-stone-500 space-y-4 font-medium">
                <li className="hover:text-orange-500 cursor-pointer">Bantuan</li>
                <li className="hover:text-orange-500 cursor-pointer">Metode Pembayaran</li>
                <li className="hover:text-orange-500 cursor-pointer">Lacak Pesanan</li>
                <li className="hover:text-orange-500 cursor-pointer">Gratis Ongkir</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-emerald-800 mb-6">Tentang StoryBali</h4>
              <ul className="text-sm text-stone-500 space-y-4 font-medium">
                <li className="hover:text-orange-500 cursor-pointer">Tentang Kami</li>
                <li className="hover:text-orange-500 cursor-pointer">Kebijakan Privasi</li>
                <li className="hover:text-orange-500 cursor-pointer">Blog Kesenian</li>
                <li className="hover:text-orange-500 cursor-pointer">Kontak Media</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-emerald-800 mb-6">Pembayaran Aman</h4>
              <div className="flex flex-wrap gap-4 grayscale opacity-50">
                 <CreditCard size={32} />
                 <Smartphone size={32} />
              </div>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-emerald-800 mb-6">Download App</h4>
              <div className="flex gap-4">
                 <div className="w-24 h-24 bg-stone-100 rounded-lg flex items-center justify-center border-2 border-stone-50 text-[10px] font-bold text-stone-300">QR CODE</div>
                 <div className="space-y-2">
                    <div className="w-24 h-8 bg-stone-800 rounded flex items-center justify-center text-[10px] text-white font-bold">App Store</div>
                    <div className="w-24 h-8 bg-stone-800 rounded flex items-center justify-center text-[10px] text-white font-bold">Play Store</div>
                 </div>
              </div>
            </div>
          </div>
        </footer>
      )}
      <ChatWidget />
    </div>
  );
};

export default App;
