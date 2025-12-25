
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
  MapPin, Truck, Lock, AlertCircle
} from 'lucide-react';
import { getStoreData } from './services/cloudService';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Admin Security
  const [adminPassInput, setAdminPassInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Form Checkout
  const [address, setAddress] = useState({ name: '', phone: '', detail: '' });

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      // Ambil API URL dari URL Query (opsional) atau Konstanta Global
      const urlParams = new URLSearchParams(window.location.search);
      const scriptUrlFromUrl = urlParams.get('api');
      
      const scriptUrl = scriptUrlFromUrl || GLOBAL_CONFIG.MASTER_SCRIPT_URL || localStorage.getItem('storybali_script_url');
      
      if (scriptUrl) {
        const cloudData = await getStoreData(scriptUrl);
        if (cloudData && cloudData.length > 0) {
          setProducts(cloudData);
          // Simpan ke local sebagai fallback jika offline
          localStorage.setItem('storybali_products', JSON.stringify(cloudData));
        } else {
          // Fallback ke local storage jika fetch gagal
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
    if (!address.name || !address.phone || !address.detail) return alert('Mohon lengkapi data pengiriman!');
    const itemsStr = cart.map(item => `- ${item.name} (x${item.quantity})`).join('%0A');
    const msg = `Halo StoryBali Store!%0A%0ASaya ingin memesan:%0A${itemsStr}%0A%0ATotal: Rp ${cartTotal.toLocaleString('id-ID')}%0A%0APenerima: ${address.name}%0ANo.HP: ${address.phone}%0AAlamat: ${address.detail}`;
    window.open(`https://wa.me/6281234567890?text=${msg}`); // Ganti dengan nomor WA Toko Anda
    setCart([]);
    setRoute(AppRoute.HOME);
  };

  const renderHome = () => (
    <div className="space-y-6 md:space-y-12 pb-20 bg-[#f5f5f5] min-h-screen">
      {/* Banner Shopee Style */}
      <section className="relative h-[180px] md:h-[350px] bg-[#ee4d2d] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 w-full text-white">
           <div className="max-w-xl space-y-2 md:space-y-4">
              <div className="inline-block bg-white text-[#ee4d2d] px-2 py-0.5 rounded-sm text-[8px] md:text-[10px] font-bold">STORYBALI EXCLUSIVE</div>
              <h1 className="text-xl md:text-5xl font-black tracking-tight leading-none uppercase">WARISAN BUDAYA BALI</h1>
              <p className="text-[10px] md:text-sm opacity-90 max-w-xs">Produk asli pengrajin lokal dengan kualitas premium.</p>
              <button onClick={() => setRoute(AppRoute.CATALOG)} className="px-4 py-2 bg-white text-[#ee4d2d] font-bold rounded-sm text-[10px] md:text-xs shadow-xl">BELANJA SEKARANG</button>
           </div>
        </div>
      </section>

      {/* Grid Produk 2 Kolom di HP, 6 Kolom di PC */}
      <section className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="bg-white rounded-sm shadow-sm">
           <div className="flex items-center justify-between p-3 md:p-4 border-b">
              <h2 className="text-[#ee4d2d] font-bold text-sm md:text-lg uppercase">Rekomendasi Untukmu</h2>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 bg-gray-100 p-1">
             {products.length > 0 ? products.map(product => (
               <div key={product.id} className="bg-white">
                 <ProductCard product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
               </div>
             )) : (
               <div className="col-span-full py-20 text-center bg-white text-gray-400 text-xs">Menunggu data produk...</div>
             )}
           </div>
        </div>
      </section>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const images = (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images : ['https://via.placeholder.com/600x600?text=No+Image'];

    return (
      <div className="bg-[#f5f5f5] py-2 md:py-8 min-h-screen pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-sm flex flex-col md:flex-row rounded-sm overflow-hidden">
            {/* Gallery */}
            <div className="w-full md:w-[450px] p-4 space-y-4">
              <div className="aspect-square bg-gray-50 rounded-sm overflow-hidden border border-gray-100">
                <img src={images[activeImageIdx]} className="w-full h-full object-cover" alt={selectedProduct.name} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img, i) => (
                  <button 
                    key={i} 
                    onMouseEnter={() => setActiveImageIdx(i)}
                    className={`w-16 h-16 md:w-20 md:h-20 border-2 rounded-sm overflow-hidden flex-shrink-0 ${activeImageIdx === i ? 'border-[#ee4d2d]' : 'border-transparent opacity-60'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Info */}
            <div className="flex-1 p-6 md:p-8 space-y-6">
              <h1 className="text-lg md:text-2xl font-medium text-gray-800 leading-tight">{selectedProduct.name}</h1>
              
              <div className="flex items-center gap-4 text-xs divide-x divide-gray-200">
                <div className="flex items-center gap-1 text-[#ee4d2d] font-bold">
                   <span className="underline">{selectedProduct.rating}</span>
                   <div className="flex text-yellow-400"><Star size={12} fill="currentColor" stroke="none" /></div>
                </div>
                <div className="pl-4 text-gray-500"><span className="text-gray-800 font-bold">{selectedProduct.soldCount}</span> Terjual</div>
              </div>

              <div className="bg-[#fafafa] p-6 rounded-sm">
                 <div className="flex items-center gap-4">
                    {selectedProduct.originalPrice && <span className="text-gray-400 line-through text-sm">Rp {selectedProduct.originalPrice.toLocaleString('id-ID')}</span>}
                    <span className="text-[#ee4d2d] text-3xl font-bold">Rp {selectedProduct.price.toLocaleString('id-ID')}</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex gap-10 items-center">
                    <span className="w-20 text-gray-500 text-sm">Pengiriman</span>
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                       <Truck size={16} className="text-green-500" /> Gratis Ongkir
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-6">
                 <button onClick={() => addToCart(selectedProduct)} className="flex-1 py-3 border border-[#ee4d2d] text-[#ee4d2d] bg-[#fbebed] rounded-sm font-medium text-sm">
                   Keranjang
                 </button>
                 <button onClick={() => { addToCart(selectedProduct); setRoute(AppRoute.CART); }} className="flex-1 py-3 bg-[#ee4d2d] text-white rounded-sm font-bold text-sm">
                   Beli Sekarang
                 </button>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white p-6 rounded-sm shadow-sm space-y-8">
             <h3 className="bg-[#fafafa] p-4 font-bold text-gray-800 uppercase text-xs tracking-widest">Deskripsi Produk</h3>
             <p className="text-sm text-gray-600 leading-loose whitespace-pre-wrap">{selectedProduct.description}</p>
             {selectedProduct.story && (
               <div className="p-6 bg-orange-50 border border-orange-100 rounded-sm">
                  <p className="text-xs italic text-orange-900 leading-relaxed">"{selectedProduct.story}"</p>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderAdminAuth = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
       <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-8">
          <div className="text-center space-y-2">
             <div className="w-16 h-16 bg-[#ee4d2d] text-white rounded-2xl flex items-center justify-center mx-auto"><Lock size={32} /></div>
             <h1 className="text-xl font-bold text-gray-800">Panel Admin StoryBali</h1>
             <p className="text-xs text-gray-400">Masukkan password untuk mengelola toko.</p>
          </div>
          <div className="space-y-4">
             <input 
                type="password" 
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                placeholder="Password Admin"
                className="w-full bg-gray-50 border rounded-lg p-4 text-sm outline-none focus:border-[#ee4d2d]"
             />
             <button 
                onClick={() => {
                  if (adminPassInput === GLOBAL_CONFIG.ADMIN_PASSWORD) {
                    setIsAdminAuthenticated(true);
                  } else {
                    alert('Password salah!');
                  }
                }}
                className="w-full bg-[#ee4d2d] text-white py-4 rounded-lg font-bold"
             >
                MASUK
             </button>
             <button onClick={() => setRoute(AppRoute.HOME)} className="w-full text-xs text-gray-400">Kembali ke Toko</button>
          </div>
       </div>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 bg-[#ee4d2d] rounded-xl animate-bounce"></div>
      <p className="mt-4 text-[10px] font-bold text-[#ee4d2d] uppercase tracking-widest">Menyiapkan Toko...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      <main>
        {route === AppRoute.HOME && renderHome()}
        {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
        {route === AppRoute.CART && (
           <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-3">
                    {cart.length === 0 ? (
                       <div className="bg-white p-20 text-center rounded-sm">
                          <p className="text-gray-400 mb-6">Keranjangmu kosong.</p>
                          <button onClick={() => setRoute(AppRoute.HOME)} className="bg-[#ee4d2d] text-white px-10 py-3 rounded-sm font-bold">BELANJA</button>
                       </div>
                    ) : cart.map(item => (
                       <div key={item.id} className="bg-white p-4 flex items-center gap-4 shadow-sm">
                          <img src={item.images?.[0] || 'https://via.placeholder.com/150'} className="w-20 h-20 object-cover border" />
                          <div className="flex-1">
                             <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                             <p className="text-[#ee4d2d] font-bold">Rp {item.price.toLocaleString('id-ID')}</p>
                          </div>
                          <div className="flex items-center border rounded-sm">
                             <button onClick={() => updateQuantity(item.id, -1)} className="p-2"><Minus size={12}/></button>
                             <span className="px-4 text-xs font-bold">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.id, 1)} className="p-2"><Plus size={12}/></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
                       </div>
                    ))}
                 </div>
                 <div className="bg-white p-6 shadow-sm rounded-sm h-fit">
                    <h3 className="font-bold border-b pb-4 mb-4">Ringkasan</h3>
                    <div className="flex justify-between font-bold text-lg text-[#ee4d2d]">
                       <span>Total</span>
                       <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <button onClick={() => setRoute(AppRoute.CHECKOUT)} disabled={cart.length === 0} className="w-full bg-[#ee4d2d] text-white py-4 mt-6 font-bold rounded-sm disabled:opacity-50">CHECKOUT</button>
                 </div>
              </div>
           </div>
        )}
        {route === AppRoute.ADMIN && (isAdminAuthenticated ? <div className="py-10"><AdminProductManager products={products} onUpdateProducts={updateGlobalProducts} /></div> : renderAdminAuth())}
        {route === AppRoute.CHECKOUT && (
           <div className="max-w-3xl mx-auto py-10 px-4">
              <div className="bg-white p-8 rounded-sm space-y-6">
                 <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="text-[#ee4d2d]"/> Alamat Pengiriman</h2>
                 <div className="space-y-4">
                    <input type="text" placeholder="Nama Lengkap" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-sm outline-none focus:border-[#ee4d2d]" />
                    <input type="text" placeholder="Nomor WhatsApp" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-sm outline-none focus:border-[#ee4d2d]" />
                    <textarea placeholder="Alamat Lengkap" value={address.detail} onChange={e => setAddress({...address, detail: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-sm h-32 outline-none focus:border-[#ee4d2d]"></textarea>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-sm">
                    <div className="flex justify-between font-bold text-xl text-[#ee4d2d]">
                       <span>Total Bayar</span>
                       <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                 </div>
                 <button onClick={handleWhatsAppCheckout} className="w-full bg-[#ee4d2d] text-white py-5 rounded-sm font-black text-lg">KONFIRMASI VIA WHATSAPP</button>
              </div>
           </div>
        )}
      </main>
      
      {route !== AppRoute.ADMIN && (
        <footer className="bg-white border-t py-12 mt-20 text-center">
           <div className="max-w-7xl mx-auto px-6 space-y-6">
              <div className="flex items-center justify-center gap-2">
                 <div className="w-8 h-8 bg-[#ee4d2d] text-white flex items-center justify-center rounded-lg font-black">S</div>
                 <h4 className="text-lg font-black text-gray-800 uppercase tracking-tighter">StoryBali</h4>
              </div>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">&copy; 2024 STORYBALI ARTISAN STORE. TERDAFTAR DI BALI.</p>
           </div>
        </footer>
      )}
      <ChatWidget />
    </div>
  );
};

export default App;
