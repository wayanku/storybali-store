
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
  ChevronRight, 
  Leaf, 
  ShieldCheck, 
  Truck, 
  History,
  Sparkles,
  BarChart3,
  Package,
  Users,
  ShoppingBag
} from 'lucide-react';
import { getProductEnhancement, generateMarketingImage } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [marketingImg, setMarketingImg] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('storybali_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('storybali_cart', JSON.stringify(cart));
  }, [cart]);

  // Derived state
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Actions
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
    setRoute(AppRoute.PRODUCT_DETAIL);
    window.scrollTo(0, 0);
  };

  const enhanceDescription = async () => {
    if (!selectedProduct) return;
    setIsEnhancing(true);
    const newDesc = await getProductEnhancement(selectedProduct.name, selectedProduct.description);
    setSelectedProduct({ ...selectedProduct, description: newDesc });
    setIsEnhancing(false);
  };

  const generateAd = async () => {
    if (!selectedProduct) return;
    setIsEnhancing(true);
    const img = await generateMarketingImage(selectedProduct.name);
    setMarketingImg(img);
    setIsEnhancing(false);
  };

  // Rendering
  const renderHome = () => (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover scale-105"
            alt="Bali Landscape"
          />
          <div className="absolute inset-0 bg-stone-900/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <p className="uppercase tracking-[0.4em] text-sm font-semibold mb-6 text-emerald-400">Welcome to StoryBali</p>
          <h1 className="text-6xl sm:text-8xl font-bold mb-8 max-w-4xl leading-[1.1]">
            Every Craft Tells a <span className="text-emerald-300 italic serif">Sacred</span> Story.
          </h1>
          <p className="text-lg sm:text-xl text-stone-200 max-w-xl mb-12 font-light leading-relaxed">
            Curated artisanal treasures from the Island of Gods. Handpicked for quality, rooted in tradition, and shared with love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setRoute(AppRoute.CATALOG)}
              className="bg-emerald-700 hover:bg-emerald-600 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              Explore Collection <ArrowRight size={18} />
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs transition-all">
              Discover Our Story
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-emerald-800 mb-6">
                <Leaf size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Eco-Conscious</h3>
              <p className="text-stone-500 leading-relaxed">Sustainably sourced materials that respect the Balinese Tri Hita Karana philosophy.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-emerald-800 mb-6">
                <History size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Ancestral Craft</h3>
              <p className="text-stone-500 leading-relaxed">Techniques passed down through generations of island master craftsmen.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-emerald-800 mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Guaranteed</h3>
              <p className="text-stone-500 leading-relaxed">Each piece is inspected personally to ensure the highest artisanal standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-emerald-700 font-bold uppercase tracking-widest text-xs mb-4">Curated Selection</p>
              <h2 className="text-4xl sm:text-5xl font-bold">Newest Arrivals</h2>
            </div>
            <button 
              onClick={() => setRoute(AppRoute.CATALOG)}
              className="text-stone-800 font-bold border-b-2 border-emerald-700 pb-1 hover:text-emerald-700 transition-colors uppercase text-xs tracking-widest"
            >
              View Full Collection
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.slice(0, 3).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-6">All Treasures</h1>
        <p className="text-stone-500 max-w-2xl mx-auto">Explore our complete collection of handcrafted items. Filter by category to find the perfect piece for your home or lifestyle.</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-12 justify-center">
        {['All', 'Home', 'Fashion', 'Art', 'Wellness'].map(cat => (
          <button 
            key={cat}
            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              cat === 'All' ? 'bg-emerald-800 text-white shadow-lg' : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={addToCart} 
            onViewDetail={handleViewDetail}
          />
        ))}
      </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
        <button 
          onClick={() => setRoute(AppRoute.CATALOG)}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-12 text-sm font-medium transition-colors"
        >
          <ArrowRight className="rotate-180" size={16} /> Back to Catalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-stone-100 rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={marketingImg || selectedProduct.image} 
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isEnhancing ? 'opacity-50' : 'opacity-100'}`} 
                alt={selectedProduct.name} 
              />
            </div>
            {marketingImg && (
              <button 
                onClick={() => setMarketingImg(null)}
                className="w-full py-3 bg-stone-200 text-stone-800 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-300 transition-colors"
              >
                Show Original Product Photo
              </button>
            )}
          </div>

          <div>
            <span className="text-emerald-700 font-bold uppercase tracking-widest text-xs">{selectedProduct.category}</span>
            <h1 className="text-5xl font-bold mt-4 mb-6">{selectedProduct.name}</h1>
            <p className="text-3xl font-bold text-stone-800 mb-8">${selectedProduct.price}.00</p>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center justify-between">
                  The Story 
                  <button 
                    onClick={enhanceDescription}
                    disabled={isEnhancing}
                    className="flex items-center gap-1.5 text-emerald-700 hover:underline disabled:opacity-50"
                  >
                    <Sparkles size={14} /> {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                </h3>
                <p className="text-stone-600 leading-relaxed text-lg italic serif">"{selectedProduct.story}"</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Description</h3>
                <p className="text-stone-600 leading-relaxed">{selectedProduct.description}</p>
              </div>

              <div className="pt-8 border-t border-stone-100 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => addToCart(selectedProduct)}
                  className="flex-1 bg-emerald-800 text-white py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20"
                >
                  Add to Bag
                </button>
                <button 
                   onClick={generateAd}
                   disabled={isEnhancing}
                   className="px-8 py-5 border border-stone-200 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> {isEnhancing ? 'Creating...' : 'Generate Promo Visual'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-12">
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-100">
                  <div className="p-3 bg-stone-50 rounded-full text-emerald-800">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Shipping</p>
                    <p className="text-sm font-bold">Fast World Delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-100">
                  <div className="p-3 bg-stone-50 rounded-full text-emerald-800">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Secure</p>
                    <p className="text-sm font-bold">100% Authentic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold mb-12">Your Shopping Bag ({cartCount})</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
          <ShoppingBag size={64} className="mx-auto text-stone-200 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Your bag is empty</h2>
          <p className="text-stone-500 mb-10">Seems like you haven't found your treasure yet.</p>
          <button 
            onClick={() => setRoute(AppRoute.CATALOG)}
            className="bg-emerald-800 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
            {cart.map(item => (
              <div key={item.id} className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                <div className="w-full sm:w-32 aspect-square rounded-2xl overflow-hidden bg-stone-100">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-stone-800">{item.name}</h3>
                    <p className="text-xl font-bold text-emerald-800">${item.price * item.quantity}.00</p>
                  </div>
                  <p className="text-sm text-stone-500 mb-6">{item.category}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-stone-100 p-1 rounded-full">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-stone-900 text-white rounded-3xl p-10 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-10 text-stone-400">Order Summary</h3>
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center text-lg">
                <span className="text-stone-400">Subtotal</span>
                <span>${cartTotal}.00</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-stone-400">Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="h-px bg-white/10 my-4"></div>
              <div className="flex justify-between items-center text-3xl font-bold">
                <span>Total</span>
                <span>${cartTotal}.00</span>
              </div>
            </div>
            <button 
              onClick={() => setRoute(AppRoute.CHECKOUT)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-900/40"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCheckout = () => (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in zoom-in-95 duration-500">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h1 className="text-4xl font-bold mb-10">Checkout Details</h1>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">First Name</label>
                  <input type="text" className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Last Name</label>
                  <input type="text" className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Email Address</label>
                <input type="email" className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Shipping Address</label>
                <input type="text" className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="123 Ocean View Dr." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">City</label>
                  <input type="text" className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Seminyak" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Zip Code</label>
                  <input type="text" className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="80361" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-stone-200 h-fit sticky top-28">
            <h2 className="text-2xl font-bold mb-8">Review Order</h2>
            <div className="space-y-6 mb-8 max-h-60 overflow-y-auto pr-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-sm">${item.price * item.quantity}.00</p>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-stone-100 space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Subtotal</span>
                <span className="font-bold">${cartTotal}.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Shipping</span>
                <span className="text-emerald-600 font-bold">Free</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold pt-4">
                <span>Total</span>
                <span>${cartTotal}.00</span>
              </div>
            </div>

            <button 
              onClick={() => {
                alert("Order placed successfully! Terima Kasih.");
                setCart([]);
                setRoute(AppRoute.HOME);
              }}
              className="w-full bg-emerald-800 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl"
            >
              Complete Order
            </button>
            <p className="text-center text-[10px] text-stone-400 mt-6 uppercase tracking-widest">Secure encrypted payment processing</p>
          </div>
       </div>
    </div>
  );

  const renderAdmin = () => {
    const data = [
      { name: 'Mon', sales: 400 },
      { name: 'Tue', sales: 300 },
      { name: 'Wed', sales: 600 },
      { name: 'Thu', sales: 800 },
      { name: 'Fri', sales: 500 },
      { name: 'Sat', sales: 900 },
      { name: 'Sun', sales: 1100 },
    ];

    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold">Admin Insights</h1>
            <p className="text-stone-500">Store performance and inventory management</p>
          </div>
          <div className="flex gap-4">
             <button className="bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <Plus size={16} /> Add Product
             </button>
             <button className="bg-white border border-stone-200 text-stone-800 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">
                Export Data
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           <div className="bg-white p-8 rounded-3xl border border-stone-200 flex flex-col gap-4">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center">
                <BarChart3 size={24} />
             </div>
             <div>
               <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Sales</p>
               <h3 className="text-3xl font-bold">$12,450</h3>
               <p className="text-emerald-600 text-xs font-bold mt-2">+12.5% from last month</p>
             </div>
           </div>
           <div className="bg-white p-8 rounded-3xl border border-stone-200 flex flex-col gap-4">
             <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center">
                <Package size={24} />
             </div>
             <div>
               <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Active Orders</p>
               <h3 className="text-3xl font-bold">48</h3>
               <p className="text-stone-400 text-xs font-bold mt-2">12 pending shipment</p>
             </div>
           </div>
           <div className="bg-white p-8 rounded-3xl border border-stone-200 flex flex-col gap-4">
             <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-2xl flex items-center justify-center">
                <Users size={24} />
             </div>
             <div>
               <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">New Customers</p>
               <h3 className="text-3xl font-bold">156</h3>
               <p className="text-emerald-600 text-xs font-bold mt-2">+8% growth rate</p>
             </div>
           </div>
           <div className="bg-white p-8 rounded-3xl border border-stone-200 flex flex-col gap-4">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center">
                <Sparkles size={24} />
             </div>
             <div>
               <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">AI Efficiency</p>
               <h3 className="text-3xl font-bold">92%</h3>
               <p className="text-emerald-600 text-xs font-bold mt-2">Conversion lift by Wayan</p>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 bg-white p-10 rounded-3xl border border-stone-200">
            <h3 className="text-xl font-bold mb-10">Sales Revenue (7 Days)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="sales" fill="#065f46" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-stone-200">
             <h3 className="text-xl font-bold mb-8">Top Products</h3>
             <div className="space-y-6">
                {products.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm truncate">{p.name}</p>
                      <p className="text-xs text-stone-400">{p.category}</p>
                    </div>
                    <p className="font-bold text-sm text-emerald-800">${p.price}</p>
                  </div>
                ))}
             </div>
             <button className="w-full mt-10 py-4 border border-stone-100 rounded-xl text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-colors">
                View All Inventory
             </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => (
    <footer className="bg-stone-900 text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">S</div>
              <span className="text-xl font-bold tracking-tight">StoryBali <span className="font-light text-emerald-400">Store</span></span>
            </div>
            <p className="text-stone-400 leading-relaxed font-light">
              Connecting the world to the sacred craftsmanship of Bali. Each product is a chapter of a larger cultural journey.
            </p>
            <div className="flex gap-4">
              {['FB', 'IG', 'TW', 'YT'].map(social => (
                <div key={social} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-700 transition-colors cursor-pointer text-[10px] font-bold">
                  {social}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-8 text-emerald-400">Quick Links</h4>
            <ul className="space-y-4 text-stone-400 text-sm">
              <li><button onClick={() => setRoute(AppRoute.CATALOG)} className="hover:text-white transition-colors">Shop Collection</button></li>
              <li><button className="hover:text-white transition-colors">Artisans & Villages</button></li>
              <li><button className="hover:text-white transition-colors">Shipping & Returns</button></li>
              <li><button className="hover:text-white transition-colors">Wholesale Inquiry</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-8 text-emerald-400">Categories</h4>
            <ul className="space-y-4 text-stone-400 text-sm">
              <li><button className="hover:text-white transition-colors">Home Decor</button></li>
              <li><button className="hover:text-white transition-colors">Island Fashion</button></li>
              <li><button className="hover:text-white transition-colors">Wellness & Oils</button></li>
              <li><button className="hover:text-white transition-colors">Traditional Art</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-8 text-emerald-400">Join the Circle</h4>
            <p className="text-stone-400 text-sm mb-6 font-light">Subscribe for exclusive collection drops and Balinese cultural stories.</p>
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
              <input type="email" placeholder="Email address" className="bg-transparent flex-1 px-5 text-sm outline-none" />
              <button className="bg-emerald-600 px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest">Join</button>
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-stone-500 text-[10px] uppercase tracking-widest font-bold">
          <p>© 2024 StoryBali Store. All Rights Reserved.</p>
          <div className="flex gap-8">
            <span className="cursor-pointer hover:text-white">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white">Terms of Service</span>
            <span className="cursor-pointer hover:text-white">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar onNavigate={setRoute} cartCount={cartCount} />
      
      <main className="flex-grow">
        {route === AppRoute.HOME && renderHome()}
        {route === AppRoute.CATALOG && renderCatalog()}
        {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
        {route === AppRoute.CART && renderCart()}
        {route === AppRoute.CHECKOUT && renderCheckout()}
        {route === AppRoute.ADMIN && renderAdmin()}
      </main>

      {renderFooter()}
      <ChatWidget />
    </div>
  );
};

export default App;
