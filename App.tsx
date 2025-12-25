
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppRoute, Product, CartItem, CategoryConfig, Order, OrderStatus } from './types';
import { INITIAL_PRODUCTS, GLOBAL_CONFIG } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import AdminProductManager from './components/AdminProductManager';
import ChatWidget from './components/ChatWidget';
import { 
  Trash2, Plus, Minus, 
  ShoppingCart, ShoppingBag, 
  MapPin, Truck, Lock, 
  Home, User, Search,
  Package, SearchCode, Calendar, ChevronLeft, Globe, Loader2, CheckCircle, Copy
} from 'lucide-react';
import { getStoreData, createOrderInCloud } from './services/cloudService';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [heroBanners, setHeroBanners] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  
  // Tracking State
  const [trackIdInput, setTrackIdInput] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);

  // Checkout State
  const [address, setAddress] = useState({ name: '', phone: '', detail: '' });

  const scriptUrl = useMemo(() => localStorage.getItem('storybali_script_url') || GLOBAL_CONFIG.MASTER_SCRIPT_URL, []);

  const syncFromCloud = useCallback(async (isInitial = false) => {
    if (!isInitial) setIsSyncing(true);
    try {
      const cloudData = await getStoreData(scriptUrl, "Products");
      if (cloudData && cloudData.length > 0) {
        setProducts(cloudData);
      } else if (isInitial) {
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (e) {
      if (isInitial) setProducts(INITIAL_PRODUCTS);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [scriptUrl]);

  useEffect(() => {
    const savedBanners = localStorage.getItem('storybali_banners');
    setHeroBanners(savedBanners ? JSON.parse(savedBanners) : [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200"
    ]);
    syncFromCloud(true);
  }, [syncFromCloud]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleTrackOrder = async () => {
    if (!trackIdInput) return;
    setIsSyncing(true);
    const allOrders = await getStoreData(scriptUrl, "Orders");
    const order = allOrders?.find((o: any) => o.orderId.toLowerCase() === trackIdInput.toLowerCase().trim());
    setFoundOrder(order || null);
    if (!order) alert('Pesanan tidak ditemukan. Cek kembali ID Anda.');
    setIsSyncing(false);
  };

  const handleCheckout = async () => {
    if (!address.name || !address.phone || !address.detail) return alert('Mohon lengkapi data pengiriman!');
    
    const orderId = `SB-${new Date().toISOString().slice(2,10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const newOrder: Order = {
      orderId,
      customerName: address.name,
      phone: address.phone,
      address: address.detail,
      items: cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
      total: cartTotal + 25000,
      status: 'Pending',
      timestamp: new Date().toLocaleString('id-ID')
    };

    setIsLoading(true);
    const success = await createOrderInCloud(scriptUrl, newOrder);
    setIsLoading(false);

    if (success) {
      const waMsg = `Halo StoryStore!%0A%0ASaya memesan dengan ID: *${orderId}*%0ANama: ${newOrder.customerName}%0AItem: ${newOrder.items}%0ATotal: Rp ${newOrder.total.toLocaleString()}`;
      window.open(`https://wa.me/6281234567890?text=${waMsg}`);
      alert(`Pesanan Terkirim! ID: ${orderId}. Admin akan menghubungi Anda.`);
      setCart([]);
      setRoute(AppRoute.HOME);
    } else {
      alert('Gagal mengirim pesanan. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 md:pb-0">
      {route !== AppRoute.ADMIN && <Navbar onNavigate={setRoute} cartCount={cartCount} />}
      <main className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
             <Loader2 className="animate-spin text-[#ee4d2d]" size={40}/>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Menyiapkan StoryStore...</p>
          </div>
        ) : (
          <>
            {route === AppRoute.HOME && (
              <div className="space-y-12 py-6 px-4">
                 <section className="relative h-[220px] md:h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-stone-900">
                    <img src={heroBanners[0]} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 text-white bg-gradient-to-t from-black/80 to-transparent">
                       <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter">StoryBali Store.</h2>
                       <p className="text-xs md:text-lg opacity-80 mt-2 font-medium">Local Soul, Global Standards.</p>
                    </div>
                 </section>
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black">Trending Now</h2>
                    <button onClick={() => setRoute(AppRoute.TRACKING)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ee4d2d] bg-white px-5 py-3 rounded-xl shadow-sm border border-stone-100 hover:scale-105 transition-all"><SearchCode size={16}/> Lacak Paket</button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} onViewDetail={(prod) => { setSelectedProduct(prod); setRoute(AppRoute.PRODUCT_DETAIL); }} />)}
                 </div>
              </div>
            )}

            {route === AppRoute.TRACKING && (
              <div className="max-w-2xl mx-auto p-8 py-16 space-y-10">
                 <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black italic">Lacak Pesanan</h1>
                    <p className="text-stone-400 text-sm font-medium">Masukkan ID Pesanan Anda untuk melihat status terbaru.</p>
                 </div>
                 <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="SB-XXXXXX" 
                      value={trackIdInput} 
                      onChange={e => setTrackIdInput(e.target.value)}
                      className="flex-1 bg-white p-5 rounded-2xl border border-stone-100 shadow-sm font-black text-xl tracking-widest outline-none focus:ring-2 ring-orange-100" 
                    />
                    <button onClick={handleTrackOrder} className="bg-stone-900 text-white px-8 rounded-2xl font-black uppercase tracking-widest hover:bg-[#ee4d2d] transition-colors">
                       {isSyncing ? <Loader2 className="animate-spin" /> : 'Cek'}
                    </button>
                 </div>
                 {foundOrder && (
                   <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="text-[10px] font-black uppercase text-stone-300 tracking-widest">Status Paket</p>
                            <h3 className="text-3xl font-black text-[#ee4d2d] italic">{foundOrder.status}</h3>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-stone-300 tracking-widest">Nama Penerima</p>
                            <p className="font-bold">{foundOrder.customerName}</p>
                         </div>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-500 leading-relaxed">
                         {foundOrder.items}
                      </div>
                   </div>
                 )}
              </div>
            )}

            {route === AppRoute.PRODUCT_DETAIL && selectedProduct && (
              <div className="p-8 animate-in fade-in max-w-6xl mx-auto">
                 <button onClick={() => setRoute(AppRoute.HOME)} className="flex items-center gap-2 text-stone-400 font-black text-[10px] uppercase mb-8 hover:text-stone-900"><ChevronLeft size={16}/> Kembali</button>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    <div className="bg-white p-4 rounded-[3rem] shadow-2xl border border-stone-50">
                       <img src={selectedProduct.images[0]} className="rounded-[2.5rem] w-full aspect-square object-cover" />
                    </div>
                    <div className="flex flex-col justify-center space-y-8">
                       <div className="space-y-2">
                          <span className="text-[10px] font-black text-[#ee4d2d] uppercase tracking-[0.4em]">{selectedProduct.category}</span>
                          <h1 className="text-4xl md:text-5xl font-black leading-tight text-stone-900">{selectedProduct.name}</h1>
                       </div>
                       <div className="flex items-center gap-6">
                          <span className="text-4xl font-black text-[#ee4d2d]">Rp {selectedProduct.price.toLocaleString()}</span>
                          {selectedProduct.originalPrice && <span className="text-xl text-stone-300 line-through">Rp {selectedProduct.originalPrice.toLocaleString()}</span>}
                       </div>
                       <div className="bg-white/50 p-6 rounded-3xl border border-stone-100">
                          <p className="text-stone-500 leading-relaxed text-sm">{selectedProduct.description}</p>
                       </div>
                       <div className="flex gap-4">
                          <button onClick={() => { addToCart(selectedProduct); alert('Ditambahkan ke keranjang!'); }} className="flex-1 bg-stone-900 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-800 transition-all">Add to Cart</button>
                          <button onClick={() => { addToCart(selectedProduct); setRoute(AppRoute.CHECKOUT); }} className="flex-1 bg-[#ee4d2d] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Buy Now</button>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {route === AppRoute.CART && (
              <div className="max-w-4xl mx-auto p-8 py-16">
                 <h1 className="text-4xl font-black mb-12 italic">Shopping Bag</h1>
                 {cart.length === 0 ? (
                   <div className="text-center py-24 bg-white rounded-[3rem] border border-stone-100 shadow-sm">
                      <ShoppingBag size={80} className="mx-auto text-stone-100 mb-6" />
                      <p className="text-stone-400 font-bold mb-8">Keranjang belanja Anda masih kosong.</p>
                      <button onClick={() => setRoute(AppRoute.HOME)} className="bg-stone-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#ee4d2d] transition-all">Mulai Belanja</button>
                   </div>
                 ) : (
                   <div className="space-y-6">
                      {cart.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-3xl flex items-center gap-6 border border-stone-100 shadow-sm group">
                           <img src={item.images[0]} className="w-20 h-20 object-cover rounded-2xl shadow-sm" />
                           <div className="flex-1">
                              <h3 className="font-bold text-stone-800">{item.name}</h3>
                              <p className="text-[#ee4d2d] font-black text-sm">Rp {item.price.toLocaleString()}</p>
                              <div className="flex items-center gap-4 mt-2">
                                 <button onClick={() => { if(item.quantity > 1) setCart(cart.map(i => i.id === item.id ? {...i, quantity: i.quantity - 1} : i)) }} className="p-1 text-stone-300 hover:text-stone-900"><Minus size={14}/></button>
                                 <span className="text-xs font-black">{item.quantity}</span>
                                 <button onClick={() => setCart(cart.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))} className="p-1 text-stone-300 hover:text-stone-900"><Plus size={14}/></button>
                              </div>
                           </div>
                           <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="p-4 text-stone-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                        </div>
                      ))}
                      <div className="bg-stone-950 p-12 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center mt-12 shadow-2xl gap-8">
                         <div className="text-center md:text-left">
                            <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-1">Total Pembayaran</p>
                            <h3 className="text-4xl font-black italic text-[#ee4d2d]">Rp {cartTotal.toLocaleString()}</h3>
                         </div>
                         <button onClick={() => setRoute(AppRoute.CHECKOUT)} className="w-full md:w-auto bg-[#ee4d2d] px-16 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Proses Checkout</button>
                      </div>
                   </div>
                 )}
              </div>
            )}

            {route === AppRoute.CHECKOUT && (
               <div className="max-w-7xl mx-auto p-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-8">
                     <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm space-y-8">
                        <h2 className="text-2xl font-black flex items-center gap-3 italic"><MapPin className="text-[#ee4d2d]"/> Alamat Pengiriman</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1"><p className="text-[10px] font-black uppercase text-stone-400">Nama Penerima</p><input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-stone-50 p-5 rounded-2xl font-bold border border-transparent focus:bg-white focus:border-stone-200 outline-none transition-all" placeholder="Misal: Wayan Bali" /></div>
                           <div className="space-y-1"><p className="text-[10px] font-black uppercase text-stone-400">WhatsApp</p><input type="text" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-stone-50 p-5 rounded-2xl font-bold border border-transparent focus:bg-white focus:border-stone-200 outline-none transition-all" placeholder="0812..." /></div>
                           <div className="md:col-span-2 space-y-1"><p className="text-[10px] font-black uppercase text-stone-400">Detail Alamat</p><textarea value={address.detail} onChange={e => setAddress({...address, detail: e.target.value})} className="w-full bg-stone-50 p-6 rounded-3xl h-32 border border-transparent focus:bg-white focus:border-stone-200 outline-none transition-all" placeholder="Jl. Raya Uluwatu No. 1..."></textarea></div>
                        </div>
                     </div>
                  </div>
                  <div className="lg:col-span-4">
                     <div className="bg-stone-950 p-12 rounded-[3.5rem] text-white space-y-8 sticky top-24 shadow-2xl border border-white/5">
                        <h3 className="text-2xl font-black italic">Summary</h3>
                        <div className="space-y-3 text-[10px] font-black opacity-60 uppercase tracking-widest border-b border-white/10 pb-8">
                           <div className="flex justify-between"><span>Produk</span><span>Rp {cartTotal.toLocaleString()}</span></div>
                           <div className="flex justify-between"><span>Ongkir</span><span>Rp 25.000</span></div>
                        </div>
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-bold opacity-40">Grand Total</span>
                           <span className="text-3xl font-black text-[#ee4d2d] italic">Rp {(cartTotal + 25000).toLocaleString()}</span>
                        </div>
                        <button onClick={handleCheckout} className="w-full bg-[#ee4d2d] py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Konfirmasi Pesanan</button>
                        <div className="text-[8px] text-center opacity-30 font-black uppercase tracking-[0.3em]">Secure Transaction Guaranteed</div>
                     </div>
                  </div>
               </div>
            )}

            {route === AppRoute.ADMIN && (
               isAdminAuthenticated ? (
                  <AdminProductManager 
                    products={products} onUpdateProducts={setProducts} 
                    bannerUrls={heroBanners} onUpdateBanners={setHeroBanners} 
                    categories={categories} onUpdateCategories={setCategories}
                    onRefreshProducts={() => syncFromCloud(false)}
                  />
               ) : (
                  <div className="max-w-md mx-auto py-32 px-4">
                     <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-stone-100 text-center space-y-8 animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-orange-50 text-[#ee4d2d] rounded-2xl flex items-center justify-center mx-auto shadow-sm"><Lock size={32}/></div>
                        <div><h2 className="text-2xl font-black italic">Seller Dashboard</h2><p className="text-[10px] text-stone-400 uppercase tracking-widest font-black mt-2">PIN required to access inventory</p></div>
                        <input type="password" placeholder="••••••" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)} className="w-full bg-stone-50 p-6 rounded-2xl text-center font-black text-3xl tracking-[0.4em] outline-none border border-transparent focus:bg-white focus:border-stone-200 transition-all" />
                        <button onClick={() => adminPassInput === GLOBAL_CONFIG.ADMIN_PASSWORD ? setIsAdminAuthenticated(true) : alert('PIN Salah!')} className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#ee4d2d] transition-all">Unlock System</button>
                     </div>
                  </div>
               )
            )}
          </>
        )}
      </main>
      <ChatWidget />
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-100 flex justify-around items-center h-22 z-50 px-6 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] pb-4">
        <button onClick={() => setRoute(AppRoute.HOME)} className={`p-4 transition-all ${route === AppRoute.HOME ? 'text-[#ee4d2d] scale-125' : 'text-stone-300'}`}><Home size={22} strokeWidth={3}/></button>
        <button onClick={() => setRoute(AppRoute.TRACKING)} className={`p-4 transition-all ${route === AppRoute.TRACKING ? 'text-[#ee4d2d] scale-125' : 'text-stone-300'}`}><SearchCode size={22} strokeWidth={3}/></button>
        <button onClick={() => setRoute(AppRoute.CART)} className="relative p-4"><ShoppingCart size={22} strokeWidth={3} className={route === AppRoute.CART ? 'text-[#ee4d2d] scale-125' : 'text-stone-300'}/>{cartCount > 0 && <span className="absolute top-2 right-2 bg-[#ee4d2d] text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white shadow-md">{cartCount}</span>}</button>
        <button onClick={() => setRoute(AppRoute.ADMIN)} className={`p-4 transition-all ${route === AppRoute.ADMIN ? 'text-[#ee4d2d] scale-125' : 'text-stone-300'}`}><User size={22} strokeWidth={3}/></button>
      </div>
    </div>
  );
};

export default App;
