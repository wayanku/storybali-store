
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

  const enhanceDescription = async () => {
    if (!selectedProduct) return;
    setIsEnhancing(true);
    const newDesc = await getProductEnhancement(selectedProduct.name, selectedProduct.description);
    // TypeScript fix: Ensure newDesc is a string
    setSelectedProduct({ ...selectedProduct, description: newDesc || selectedProduct.description });
    setIsEnhancing(false);
  };

  const generateAd = async () => {
    if (!selectedProduct) return;
    setIsEnhancing(true);
    const img = await generateMarketingImage(selectedProduct.name);
    if (img) setMarketingImg(img);
    setIsEnhancing(false);
  };

  // Rendering logic remains same as provided in previous context but fixed for types
  const renderHome = () => (
    <div className="animate-in fade-in duration-700">
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover scale-105" alt="Bali" />
          <div className="absolute inset-0 bg-stone-900/40"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <p className="uppercase tracking-[0.4em] text-sm font-semibold mb-6 text-emerald-400">Welcome to StoryBali</p>
          <h1 className="text-6xl sm:text-8xl font-bold mb-8 max-w-4xl leading-[1.1]">Every Craft Tells a <span className="text-emerald-300 italic serif">Sacred</span> Story.</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setRoute(AppRoute.CATALOG)} className="bg-emerald-700 hover:bg-emerald-600 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl">Explore Collection <ArrowRight size={18} /></button>
          </div>
        </div>
      </section>
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-16">Newest Arrivals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.slice(0, 3).map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <h1 className="text-5xl font-bold mb-16 text-center">All Treasures</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewDetail={handleViewDetail} />
        ))}
      </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
        <button onClick={() => setRoute(AppRoute.CATALOG)} className="flex items-center gap-2 text-stone-500 mb-12 text-sm">Back to Catalog</button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-stone-100">
            <img src={marketingImg || selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
          </div>
          <div>
            <h1 className="text-5xl font-bold mb-6">{selectedProduct.name}</h1>
            <p className="text-3xl font-bold text-emerald-900 mb-8">${selectedProduct.price}.00</p>
            <div className="space-y-8">
              <div>
                <button onClick={enhanceDescription} disabled={isEnhancing} className="text-emerald-700 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Sparkles size={14} /> {isEnhancing ? 'Enhancing...' : 'Enhance Story with AI'}
                </button>
                <p className="text-stone-600 italic serif text-lg leading-relaxed">"{selectedProduct.story}"</p>
              </div>
              <p className="text-stone-600 leading-relaxed">{selectedProduct.description}</p>
              <div className="flex gap-4">
                <button onClick={() => addToCart(selectedProduct)} className="flex-1 bg-emerald-800 text-white py-5 rounded-full font-bold uppercase text-xs shadow-lg">Add to Bag</button>
                <button onClick={generateAd} disabled={isEnhancing} className="px-8 py-5 border border-stone-200 rounded-full font-bold uppercase text-xs">Promo Visual</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-12">Your Shopping Bag ({cartCount})</h1>
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border">
          <p className="text-stone-500 mb-10">Your bag is empty</p>
          <button onClick={() => setRoute(AppRoute.CATALOG)} className="bg-emerald-800 text-white px-10 py-5 rounded-full uppercase text-xs">Start Shopping</button>
        </div>
      ) : (
        <div className="space-y-8">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border flex gap-6">
              <img src={item.image} className="w-24 h-24 object-cover rounded-xl" alt={item.name} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="font-bold text-emerald-800">${item.price * item.quantity}.00</p>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16}/></button>
                  <span className="font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16}/></button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-auto text-stone-400 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-stone-900 text-white p-10 rounded-3xl">
            <div className="flex justify-between text-2xl font-bold mb-8">
              <span>Total</span>
              <span>${cartTotal}.00</span>
            </div>
            <button onClick={() => setRoute(AppRoute.CHECKOUT)} className="w-full bg-emerald-600 py-6 rounded-2xl uppercase text-xs font-bold">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNavigate={setRoute} cartCount={cartCount} />
      <main className="flex-grow">
        {route === AppRoute.HOME && renderHome()}
        {route === AppRoute.CATALOG && renderCatalog()}
        {route === AppRoute.PRODUCT_DETAIL && renderProductDetail()}
        {route === AppRoute.CART && renderCart()}
        {route === AppRoute.CHECKOUT && (
          <div className="py-20 text-center">
             <h1 className="text-4xl font-bold mb-4">Checkout Page</h1>
             <p className="text-stone-500 mb-8">This is where payments are processed.</p>
             <button onClick={() => {alert("Order Placed!"); setCart([]); setRoute(AppRoute.HOME);}} className="bg-emerald-800 text-white px-10 py-5 rounded-full uppercase text-xs font-bold">Complete Purchase</button>
          </div>
        )}
        {route === AppRoute.ADMIN && (
          <div className="py-20 max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-12">Dashboard</h1>
            <div className="h-80 bg-white p-8 rounded-3xl border mb-12">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{name: 'Mon', sales: 400}, {name: 'Tue', sales: 700}, {name: 'Wed', sales: 500}]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#065f46" radius={[4,4,0,0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-stone-900 text-white py-20 px-4 text-center">
        <p className="text-stone-500 text-xs uppercase tracking-widest">© 2024 StoryBali Store. Handcrafted Excellence.</p>
      </footer>
      <ChatWidget />
    </div>
  );
};

export default App;
