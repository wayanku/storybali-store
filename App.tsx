
import React, { useState, useEffect, useMemo } from 'react';
import { AppRoute, Product, CartItem } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ChatWidget from './components/ChatWidget';
import { 
  ArrowRight, 
  Trash2, 
  Plus, 
  Minus, 
  Sparkles,
  Zap,
  Timer,
  ChevronRight,
  Truck,
  ShieldCheck,
  CreditCard,
  Star,
  ShoppingCart,
  ShoppingBag,
  BarChart3,
  Smartphone
} from 'lucide-react';
import { getProductEnhancement, generateMarketingImage } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [marketingImg, setMarketingImg] = useState<string | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('storybali_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('storybali_cart', JSON.stringify(cart));
  }, [cart]);

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

  // Fix: Added missing AI enhancement function to polish product descriptions
  const enhanceDescription = async () => {
    if (!selectedProduct) return;
    setIsEnhancing(true);
    try {
      const enhancedDesc = await getProductEnhancement(selectedProduct.name, selectedProduct.description);
      const updatedProduct = { ...selectedProduct, description: enhancedDesc };
      setSelectedProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
    } catch (error) {
      console.error("Enhance error:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Fix: Added missing function to generate promotional visuals using Gemini Image models
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

  const renderHome = () => (
    <div className="animate-fade-in pb-20 bg-stone-50">
      {/* Banner Utama ala Marketplace */}
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

      {/* Category Icons */}
      <section className="py-10 bg-white mt-4">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
           <div className="flex justify-between items-center gap-8 min-w-[800px]">
              {[
                { name: 'Seni Lukis', icon: '🎨' },
                { name: 'Fashion', icon: '👗' },
                { name: 'Dupa & Lilin', icon: '🕯️' },
                { name: 'Dekorasi', icon: '🪑' },
                { name: 'Kopi Bali', icon: '☕' },
                { name: 'Patung', icon: '🗿' },
                { name: 'Spa & Body', icon: '🧴' },
                { name: 'Aksesoris', icon: '💍' }
              ].map((cat, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                   <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-emerald-50 group-hover:scale-110 transition-all border border-stone-100">
                      {cat.icon}
                   </div>
                   <span className="text-[11px] font-bold text-stone-600 text-center uppercase tracking-tighter">{cat.name}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Flash Sale ala Shopee */}
      <section className="py-6 mt-4 max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-orange-50 p-4 flex justify-between items-center border-b border-orange-100">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-orange-600 font-black italic text-xl">
                  <Zap size={24} fill="currentColor" /> FLASH SALE
                </div>
                <div className="flex gap-1 items-center">
                   <span className="bg-stone-800 text-white p-1 rounded font-mono text-sm">02</span>:
                   <span className="bg-stone-800 text-white p-1 rounded font-mono text-sm">45</span>:
                   <span className="bg-stone-800 text-white p-1 rounded font-mono text-sm">12</span>
                </div>
             </div>
             <button onClick={() => setRoute(AppRoute.CATALOG)} className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:underline">Lihat Semua <ChevronRight size={16}/></button>
          </div>
          <div className="p-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-4">
              {products.filter(p => p.discountTag).map(product => (
                <div key={product.id} className="min-w-[160px] max-w-[160px] flex flex-col items-center cursor-pointer" onClick={() => handleViewDetail(product)}>
                   <div className="relative w-full aspect-square rounded-md overflow-hidden bg-stone-100">
                      <img src={product.image} className="w-full h-full object-cover" />
                      <div className="absolute top-0 right-0 bg-yellow-400 text-orange-700 font-bold text-[9px] px-1.5 py-0.5 rounded-bl">-{product.discountTag}</div>
                   </div>
                   <p className="mt-2 text-orange-600 font-black text-lg">${product.price}</p>
                   <div className="w-full bg-stone-200 h-3 rounded-full relative overflow-hidden mt-1">
                      <div className="absolute inset-0 bg-orange-400 w-[70%]" />
                      <span className="absolute inset-0 text-[8px] flex items-center justify-center font-bold text-white uppercase">HAMPIR HABIS</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rekomendasi Grid */}
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
        <div className="mt-12 text-center">
           <button onClick={() => setRoute(AppRoute.CATALOG)} className="bg-white border border-stone-200 px-12 py-3 rounded shadow-sm hover:bg-stone-50 transition-colors font-bold text-stone-600">Lihat Lebih Banyak</button>
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => (
    <div className="py-10 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filter */}
          <aside className="w-full md:w-60 flex-shrink-0">
             <div className="bg-white p-6 rounded-lg shadow-sm sticky top-32">
                <h3 className="font-bold border-b pb-2 mb-4 flex items-center gap-2"><Plus size={16}/> Filter</h3>
                <div className="space-y-6">
                   <div>
                      <p className="text-xs font-bold uppercase text-stone-400 mb-3">Kategori</p>
                      {['Fashion', 'Wellness', 'Home', 'Art'].map(c => (
                        <label key={c} className="flex items-center gap-2 mb-2 text-sm cursor-pointer hover:text-orange-500">
                          <input type="checkbox" className="accent-orange-500" /> {c}
                        </label>
                      ))}
                   </div>
                   <div>
                      <p className="text-xs font-bold uppercase text-stone-400 mb-3">Harga</p>
                      <input type="range" className="w-full accent-orange-500" />
                   </div>
                   <button className="w-full bg-orange-500 text-white py-2 rounded text-xs font-bold shadow-md shadow-orange-200 uppercase">Terapkan</button>
                </div>
             </div>
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center text-sm">
               <div className="flex gap-4 items-center">
                  <span>Urutkan:</span>
                  <button className="bg-orange-500 text-white px-4 py-1.5 rounded shadow-sm">Terkait</button>
                  <button className="hover:text-orange-500">Terbaru</button>
                  <button className="hover:text-orange-500">Terlaris</button>
               </div>
               <div className="flex gap-2">
                  <span className="text-orange-600 font-bold">1/10</span>
                  <button className="p-1 border bg-stone-50 text-stone-300">{'<'}</button>
                  <button className="p-1 border bg-white hover:bg-stone-50">{'>'}</button>
               </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {products.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="py-10 bg-stone-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden border bg-stone-50 relative group">
                  <img src={marketingImg || selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                  {isEnhancing && (
                    <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center backdrop-blur-sm">
                       <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="text-orange-600 font-bold text-sm">AI sedang bekerja...</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className="aspect-square border rounded cursor-pointer overflow-hidden hover:border-orange-500 transition-colors">
                        <img src={selectedProduct.image} className="w-full h-full object-cover" />
                     </div>
                   ))}
                </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-stone-800 mb-2">{selectedProduct.name}</h1>
                <div className="flex items-center gap-4 text-sm mb-6 border-b pb-6">
                   <div className="flex items-center gap-1 text-orange-500 font-bold border-r pr-4">
                      <span className="underline">{selectedProduct.rating}</span>
                      <div className="flex">
                         {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Math.floor(selectedProduct.rating) ? "currentColor" : "none"} />)}
                      </div>
                   </div>
                   <span className="border-r pr-4 text-stone-500">1.2rb <span className="text-[10px] uppercase opacity-60">Penilaian</span></span>
                   <span className="text-stone-500">{selectedProduct.soldCount} <span className="text-[10px] uppercase opacity-60">Terjual</span></span>
                </div>

                <div className="bg-stone-50 p-6 rounded mb-8">
                   <div className="flex items-center gap-3">
                      {selectedProduct.originalPrice && <span className="text-stone-400 line-through text-lg">${selectedProduct.originalPrice}</span>}
                      <span className="text-4xl font-bold text-orange-600">${selectedProduct.price}</span>
                      <span className="bg-orange-600 text-white text-[10px] font-bold px-1 rounded uppercase">70% OFF</span>
                   </div>
                </div>

                <div className="space-y-6 mb-10 text-sm">
                   <div className="grid grid-cols-4 items-center">
                      <span className="text-stone-400">Pengiriman</span>
                      <div className="col-span-3 flex items-center gap-2">
                         <Truck size={18} className="text-emerald-600" />
                         <span>Gratis Ongkir Ke Seluruh Dunia</span>
                      </div>
                   </div>
                   <div className="grid grid-cols-4">
                      <span className="text-stone-400">Kategori</span>
                      <span className="col-span-3 font-bold text-emerald-800">{selectedProduct.category}</span>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                   <button 
                    onClick={() => addToCart(selectedProduct)} 
                    className="flex-1 bg-orange-100 border border-orange-500 text-orange-600 py-4 rounded font-bold hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
                   >
                     <ShoppingCart size={18} /> Masukkan Keranjang
                   </button>
                   <button 
                    onClick={() => {addToCart(selectedProduct); setRoute(AppRoute.CART);}}
                    className="flex-1 bg-orange-600 text-white py-4 rounded font-bold hover:bg-orange-700 shadow-lg shadow-orange-100 transition-colors"
                   >
                     Beli Sekarang
                   </button>
                </div>

                <div className="border-t pt-8">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-stone-800">Cerita Di Balik Produk</h3>
                      <button onClick={enhanceDescription} disabled={isEnhancing} className="text-emerald-600 flex items-center gap-1 font-bold text-xs uppercase tracking-tight group">
                        <Sparkles size={14} className="group-hover:rotate-12 transition-transform"/> Tingkatkan Narasi AI
                      </button>
                   </div>
                   <p className="text-stone-600 italic serif text-lg mb-6 leading-relaxed">"{selectedProduct.story}"</p>
                   <p className="text-stone-500 leading-relaxed text-sm">{selectedProduct.description}</p>
                   
                   <button onClick={generateAd} className="mt-8 text-orange-600 font-bold flex items-center gap-2 hover:bg-orange-50 w-fit px-4 py-2 rounded transition-colors">
                      <Sparkles size={16} /> Lihat Visual Promosi AI
                   </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-bold mb-6 border-b pb-4 uppercase">Spesifikasi Produk</h2>
                <div className="space-y-4 text-sm">
                   <div className="grid grid-cols-3"><span className="text-stone-400">Stok</span><span>2493</span></div>
                   <div className="grid grid-cols-3"><span className="text-stone-400">Asal</span><span>Gianyar, Bali</span></div>
                   <div className="grid grid-cols-3"><span className="text-stone-400">Bahan</span><span>Alami / Ramah Lingkungan</span></div>
                   <div className="grid grid-cols-3"><span className="text-stone-400">Dikirim Dari</span><span>Denpasar, Bali</span></div>
                </div>
             </div>
             <div className="bg-emerald-900 text-white p-8 rounded-lg flex flex-col items-center justify-center text-center">
                <ShieldCheck size={48} className="mb-4 text-emerald-300" />
                <h3 className="text-xl font-bold mb-2">Garansi StoryBali</h3>
                <p className="text-xs opacity-70 mb-6">Dapatkan produk Anda sesuai pesanan atau uang kembali 100%. Kami menjamin kualitas pengrajin asli.</p>
                <div className="flex gap-4">
                   <CreditCard size={24} />
                   <Truck size={24} />
                   <ShieldCheck size={24} />
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className="py-10 bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <input type="checkbox" className="accent-orange-500 w-5 h-5" />
              <span className="font-bold">Pilih Semua ({cartCount})</span>
           </div>
           <button className="text-red-500 text-sm font-bold">Hapus</button>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm flex flex-col items-center">
            <ShoppingBag size={80} className="text-stone-200 mb-6" />
            <p className="text-stone-500 mb-8 font-medium">Keranjang belanja Anda kosong</p>
            <button onClick={() => setRoute(AppRoute.CATALOG)} className="bg-orange-500 text-white px-12 py-3 rounded font-bold uppercase tracking-tight shadow-lg shadow-orange-100">Belanja Sekarang</button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 flex flex-col sm:flex-row gap-6 group">
                <div className="flex items-center gap-4">
                   <input type="checkbox" className="accent-orange-500 w-5 h-5" />
                   <img src={item.image} className="w-24 h-24 object-cover rounded-md border" alt={item.name} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[15px] font-bold text-stone-800 hover:text-orange-500 cursor-pointer">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                     <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 border border-orange-200">Bebas Pengembalian</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-baseline gap-2">
                       <span className="font-black text-orange-600 text-xl">${item.price}</span>
                       {item.originalPrice && <span className="text-stone-400 line-through text-xs">${item.originalPrice}</span>}
                    </div>
                    <div className="flex items-center border rounded overflow-hidden w-fit bg-stone-50">
                      <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 hover:bg-stone-100 border-r"><Minus size={14}/></button>
                      <span className="px-4 font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 hover:bg-stone-100 border-l"><Plus size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="sticky bottom-4 z-40 bg-white p-6 rounded-lg shadow-2xl border border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-6 mt-12">
              <div className="flex items-center gap-6">
                 <div className="hidden sm:flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-orange-500" />
                    <span className="text-sm">Pilih Semua ({cartCount})</span>
                 </div>
                 <div className="text-right">
                   <p className="text-sm">Total ({cartCount} produk): <span className="text-2xl font-black text-orange-600 ml-2">${cartTotal}.00</span></p>
                   <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Hemat ${cartTotal * 0.2} dengan Voucher Toko!</p>
                 </div>
              </div>
              <button onClick={() => setRoute(AppRoute.CHECKOUT)} className="w-full sm:w-64 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded font-black uppercase text-sm tracking-widest shadow-xl shadow-orange-100 transition-all">Checkout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-orange-100 selection:text-orange-900">
      <Navbar onNavigate={setRoute} cartCount={cartCount} />
      <main className="flex-grow">
        {route === AppRoute.HOME && renderHome()}
        {route === AppRoute.CATALOG && renderCatalog()}
        {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
        {route === AppRoute.CART && renderCart()}
        {route === AppRoute.CHECKOUT && (
          <div className="py-20 text-center bg-stone-50">
             <div className="max-w-md mx-auto bg-white p-12 rounded-3xl shadow-sm border">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                   <ShieldCheck size={48} />
                </div>
                <h1 className="text-3xl font-black mb-4">Pembayaran Aman</h1>
                <p className="text-stone-500 mb-10 leading-relaxed">Sistem StoryBali menjamin keamanan data dan transaksi Anda dengan enkripsi kelas dunia.</p>
                <button onClick={() => {alert("Order Placed!"); setCart([]); setRoute(AppRoute.HOME);}} className="w-full bg-orange-600 text-white py-5 rounded-xl uppercase text-sm font-black shadow-lg shadow-orange-100 hover:scale-[1.02] transition-transform">Konfirmasi Pesanan</button>
             </div>
          </div>
        )}
        {route === AppRoute.ADMIN && (
          <div className="py-10 max-w-7xl mx-auto px-4 bg-stone-50">
            <h1 className="text-2xl font-black mb-10 flex items-center gap-4"><BarChart3 size={32} className="text-emerald-700" /> Seller Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
               {[
                 { label: 'Total Penjualan', val: '$12,490', color: 'bg-emerald-600' },
                 { label: 'Pesanan Baru', val: '48', color: 'bg-blue-600' },
                 { label: 'Produk Aktif', val: '124', color: 'bg-orange-500' },
                 { label: 'Rating Toko', val: '4.9/5.0', color: 'bg-yellow-500' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase mb-2">{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.color.replace('bg-', 'text-')}`}>{stat.val}</p>
                 </div>
               ))}
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100 mb-12">
               <h2 className="font-bold mb-8 text-stone-400 uppercase text-xs">Statistik Penjualan Mingguan</h2>
               <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Sen', sales: 400}, {name: 'Sel', sales: 700}, {name: 'Rab', sales: 500}, {name: 'Kam', sales: 900}, {name: 'Jum', sales: 1200}, {name: 'Sab', sales: 1500}, {name: 'Min', sales: 1100}]}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip cursor={{fill: '#f5f5f4'}} />
                      <Bar dataKey="sales" fill="#065f46" radius={[6,6,0,0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer ala Shopee */}
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
               <div className="w-10 h-8 bg-stone-200 rounded" />
               <div className="w-10 h-8 bg-stone-200 rounded" />
            </div>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-emerald-800 mb-6">Download App</h4>
            <div className="flex gap-4">
               <div className="w-24 h-24 bg-stone-100 rounded-lg flex items-center justify-center border-2 border-stone-50">QR</div>
               <div className="space-y-2">
                  <div className="w-24 h-8 bg-stone-800 rounded flex items-center justify-center text-[10px] text-white font-bold">App Store</div>
                  <div className="w-24 h-8 bg-stone-800 rounded flex items-center justify-center text-[10px] text-white font-bold">Play Store</div>
               </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-10 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          <p>© 2024 StoryBali Store. Pengiriman Langsung Dari Pengrajin Bali.</p>
          <div className="flex gap-6">
             <span>Negara: Indonesia | Malaysia | Singapore | Thailand</span>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
};

export default App;
