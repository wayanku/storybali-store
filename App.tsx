
import React, { useState, useEffect, useMemo } from 'react';
import { AppRoute, Product, CartItem } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ChatWidget from './components/ChatWidget';
import AdminProductManager from './components/AdminProductManager';
import { 
  ArrowRight, ArrowLeft, Trash2, Plus, Minus, 
  Sparkles, Star, ShoppingCart, ShoppingBag, 
  ChevronLeft, ChevronRight, CheckCircle2,
  MapPin, Truck, ShieldCheck, CreditCard
} from 'lucide-react';
import { getProductEnhancement, generateMarketingImage } from './services/geminiService';
import { getStoreData } from './services/cloudService';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Form Checkout
  const [address, setAddress] = useState({ name: '', phone: '', detail: '' });

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      const scriptUrl = localStorage.getItem('storybali_script_url');
      
      if (scriptUrl) {
        // SELALU coba ambil dari Cloud dulu agar update Admin muncul di mana saja
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
    alert(`${product.name} dimasukkan ke keranjang!`);
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
    if (!address.name || !address.phone) return alert('Mohon lengkapi data pengiriman!');
    const itemsStr = cart.map(item => `- ${item.name} (x${item.quantity})`).join('%0A');
    const msg = `Halo StoryBali Store!%0A%0ASaya ingin memesan:%0A${itemsStr}%0A%0ATotal: Rp ${cartTotal.toLocaleString('id-ID')}%0A%0APenerima: ${address.name}%0ANo.HP: ${address.phone}%0AAlamat: ${address.detail}`;
    window.open(`https://wa.me/6281234567890?text=${msg}`);
    setCart([]);
    setRoute(AppRoute.HOME);
  };

  const renderHome = () => (
    <div className="space-y-12 pb-20 bg-[#f5f5f5]">
      {/* Shopee Style Banner */}
      <section className="relative h-[250px] md:h-[400px] bg-[#ee4d2d] flex items-center overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-30">
           <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 w-full text-white">
           <div className="max-w-xl space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">KADO TERBAIK DARI BALI</h1>
              <p className="text-sm md:text-lg opacity-90">Dukung pengrajin lokal, lestarikan budaya Pulau Dewata.</p>
              <button onClick={() => setRoute(AppRoute.CATALOG)} className="px-8 py-3 bg-white text-[#ee4d2d] font-bold rounded-sm shadow-lg hover:bg-gray-100 transition-all">BELANJA SEKARANG</button>
           </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white p-6 shadow-sm rounded-sm">
           <h2 className="text-gray-400 font-bold text-xs uppercase mb-6 tracking-widest border-b pb-4">Kategori Pilihan</h2>
           <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {['Fashion', 'Wellness', 'Home', 'Art', 'Souvenir', 'Jewelry', 'Food', 'Gift'].map(cat => (
                <div key={cat} className="flex flex-col items-center gap-2 cursor-pointer group">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                      <ShoppingBag size={20} className="text-[#ee4d2d]" />
                   </div>
                   <span className="text-[10px] md:text-xs font-medium text-gray-700">{cat}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Main Feed */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 bg-[#ee4d2d] text-white p-4 rounded-t-sm">
          <h2 className="text-lg font-bold">REKOMENDASI UNTUKMU</h2>
          <button onClick={() => setRoute(AppRoute.CATALOG)} className="text-xs flex items-center gap-1 hover:underline">Lihat Semua <ChevronRight size={14}/></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
          ))}
        </div>
      </section>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    // Fix: property 'image' does not exist on type 'Product'. Use 'images' instead.
    const images = selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : ['https://via.placeholder.com/400'];

    return (
      <div className="bg-[#f5f5f5] py-4 md:py-10">
        <div className="max-w-6xl mx-auto bg-white shadow-sm p-4 md:p-8 flex flex-col md:flex-row gap-10">
          {/* Left: Images */}
          <div className="w-full md:w-1/2 space-y-4">
            <div className="aspect-square bg-gray-50 rounded-sm overflow-hidden border">
              <img src={images[activeImageIdx]} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImageIdx(i)}
                  className={`w-20 h-20 border-2 rounded-sm overflow-hidden flex-shrink-0 ${activeImageIdx === i ? 'border-[#ee4d2d]' : 'border-transparent'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1 space-y-6">
            <h1 className="text-xl md:text-2xl font-medium text-gray-800 leading-tight">{selectedProduct.name}</h1>
            
            <div className="flex items-center gap-4 text-sm divide-x divide-gray-200">
               <div className="flex items-center gap-1 text-[#ee4d2d] font-medium border-b border-[#ee4d2d]">
                  <span>{selectedProduct.rating}</span>
                  <div className="flex"><Star size={12} fill="#ee4d2d" stroke="none"/><Star size={12} fill="#ee4d2d" stroke="none"/><Star size={12} fill="#ee4d2d" stroke="none"/></div>
               </div>
               <div className="pl-4 text-gray-500">
                  <span className="text-gray-800 font-medium">102</span> Penilaian
               </div>
               <div className="pl-4 text-gray-500">
                  <span className="text-gray-800 font-medium">{selectedProduct.soldCount}</span> Terjual
               </div>
            </div>

            <div className="bg-[#fafafa] p-6 flex flex-col gap-2">
              {selectedProduct.originalPrice && <span className="text-gray-400 line-through text-sm">Rp {selectedProduct.originalPrice.toLocaleString('id-ID')}</span>}
              <div className="flex items-center gap-3">
                 <span className="text-[#ee4d2d] text-4xl font-bold">Rp {selectedProduct.price.toLocaleString('id-ID')}</span>
                 <span className="bg-[#ee4d2d] text-white text-[10px] px-1 font-bold rounded-sm">50% OFF</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                 <span className="w-20 text-gray-500 text-sm">Pengiriman</span>
                 <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <Truck size={16} className="text-green-500" /> Gratis Ongkir ke Seluruh Indonesia
                 </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => addToCart(selectedProduct)}
                  className="flex-1 py-4 border border-[#ee4d2d] text-[#ee4d2d] bg-[#fbebed] rounded-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  <ShoppingCart size={18} /> Masukkan Keranjang
                </button>
                <button 
                  onClick={() => { addToCart(selectedProduct); setRoute(AppRoute.CART); }}
                  className="flex-1 py-4 bg-[#ee4d2d] text-white rounded-sm font-medium hover:bg-[#d73211] transition-all"
                >
                  Beli Sekarang
                </button>
              </div>
            </div>

            <div className="pt-10 border-t space-y-4">
              <h3 className="font-bold text-gray-800">Spesifikasi Produk</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-sm">
                 <p className="text-xs italic text-orange-800">"{selectedProduct.story}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className="max-w-5xl mx-auto px-4 py-10 bg-[#f5f5f5]">
      <div className="bg-white p-4 shadow-sm mb-4 flex items-center gap-4">
         <div className="w-10 h-10 bg-[#ee4d2d] text-white flex items-center justify-center rounded-sm"><ShoppingBag size={20}/></div>
         <h1 className="text-lg font-bold text-gray-800">Keranjang Belanja</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
           {cart.length === 0 ? (
             <div className="bg-white p-20 text-center rounded-sm">
                <p className="text-gray-400 mb-6">Keranjangmu kosong.</p>
                <button onClick={() => setRoute(AppRoute.HOME)} className="bg-[#ee4d2d] text-white px-10 py-3 rounded-sm font-bold">BELANJA SEKARANG</button>
             </div>
           ) : (
             cart.map(item => (
               <div key={item.id} className="bg-white p-4 flex items-center gap-4 shadow-sm">
                 {/* Fix: property 'image' does not exist on type 'CartItem'. Use 'images[0]' instead. */}
                 <img src={item.images?.[0] || 'https://via.placeholder.com/200'} className="w-20 h-20 object-cover border" />
                 <div className="flex-1">
                   <h3 className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</h3>
                   <p className="text-[#ee4d2d] font-bold">Rp {item.price.toLocaleString('id-ID')}</p>
                 </div>
                 <div className="flex items-center border rounded-sm">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-gray-400"><Minus size={14}/></button>
                    <span className="px-4 text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-400"><Plus size={14}/></button>
                 </div>
                 <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
               </div>
             ))
           )}
        </div>

        <div className="bg-white p-6 shadow-sm h-fit space-y-6">
           <h3 className="font-bold border-b pb-4">Ringkasan Belanja</h3>
           <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Harga ({cartCount} barang)</span>
              <span className="font-medium">Rp {cartTotal.toLocaleString('id-ID')}</span>
           </div>
           <div className="flex justify-between items-end border-t pt-4">
              <span className="text-sm font-bold">Total Tagihan</span>
              <span className="text-xl font-bold text-[#ee4d2d]">Rp {cartTotal.toLocaleString('id-ID')}</span>
           </div>
           <button 
             onClick={() => setRoute(AppRoute.CHECKOUT)}
             disabled={cart.length === 0}
             className="w-full bg-[#ee4d2d] text-white py-4 font-bold rounded-sm disabled:opacity-50 shadow-lg shadow-orange-100"
           >
             CHECKOUT
           </button>
        </div>
      </div>
    </div>
  );

  const renderCheckout = () => (
    <div className="max-w-4xl mx-auto py-10 px-4">
       <div className="bg-white p-8 shadow-sm rounded-sm space-y-10">
          <div className="flex items-center gap-4 text-[#ee4d2d] border-b pb-6">
             <MapPin size={24} />
             <h1 className="text-xl font-bold uppercase tracking-tight">Alamat Pengiriman</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Lengkap</label>
                <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-gray-50 border p-4 text-sm outline-none focus:border-[#ee4d2d]" placeholder="Contoh: Bli Bagus" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Nomor WhatsApp</label>
                <input type="text" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-gray-50 border p-4 text-sm outline-none focus:border-[#ee4d2d]" placeholder="081234567XXX" />
             </div>
             <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Alamat Lengkap (Jl/Kec/Kota)</label>
                <textarea value={address.detail} onChange={e => setAddress({...address, detail: e.target.value})} className="w-full bg-gray-50 border p-4 text-sm h-32 outline-none focus:border-[#ee4d2d] resize-none"></textarea>
             </div>
          </div>

          <div className="bg-gray-50 p-6 space-y-4">
             <h3 className="font-bold text-gray-800">Pesananmu</h3>
             {cart.map(item => (
               <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} (x{item.quantity})</span>
                  <span className="font-bold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
               </div>
             ))}
             <div className="border-t pt-4 flex justify-between">
                <span className="font-bold">Total Pembayaran</span>
                <span className="text-xl font-bold text-[#ee4d2d]">Rp {cartTotal.toLocaleString('id-ID')}</span>
             </div>
          </div>

          <button onClick={handleWhatsAppCheckout} className="w-full bg-[#ee4d2d] text-white py-5 rounded-sm font-bold text-lg shadow-xl shadow-orange-100 flex items-center justify-center gap-3 active:scale-95 transition-all">
             BUAT PESANAN SEKARANG
          </button>
       </div>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 bg-[#ee4d2d] rounded-2xl flex items-center justify-center text-white font-black text-2xl animate-bounce">S</div>
      <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">StoryBali Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      <main>
        {route === AppRoute.HOME && renderHome()}
        {route === AppRoute.CATALOG && renderHome()} {/* Reusing Home as main catalog for now */}
        {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
        {route === AppRoute.CART && renderCart()}
        {route === AppRoute.CHECKOUT && renderCheckout()}
        {route === AppRoute.ADMIN && <div className="py-10"><AdminProductManager products={products} onUpdateProducts={updateGlobalProducts} /></div>}
      </main>
      
      {route !== AppRoute.ADMIN && (
        <footer className="bg-white border-t py-20 mt-20">
           <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
              <div className="flex justify-center gap-4">
                 <div className="w-12 h-12 bg-[#ee4d2d] text-white flex items-center justify-center rounded-lg font-bold">S</div>
              </div>
              <div className="flex flex-wrap justify-center gap-10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                 <span>Tentang StoryBali</span>
                 <span>Pusat Pengrajin</span>
                 <span>Ketentuan Layanan</span>
                 <span>Privasi</span>
              </div>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">&copy; 2024 STORYBALI ARTISAN STORE. TERDAFTAR DI PULAU DEWATA.</p>
           </div>
        </footer>
      )}
      <ChatWidget />
    </div>
  );
};

export default App;
