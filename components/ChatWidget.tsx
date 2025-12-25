
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, UserCheck } from 'lucide-react';
import { chatWithStoreAssistant } from '../services/geminiService';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Om Swastiastu! Suksma sudah berkunjung. Saya Wayan, siap memandu Anda menemukan mahakarya terbaik dari Pulau Dewata.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const response = await chatWithStoreAssistant([], userMsg);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'bot', text: response || 'Mohon maaf, koneksi saya sedikit terganggu.' }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-80 sm:w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] flex flex-col border border-stone-100 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
          {/* Chat Header */}
          <div className="bg-stone-950 p-6 flex items-center justify-between text-white relative overflow-hidden">
            <Sparkles size={100} className="absolute -right-10 -top-10 opacity-10 rotate-12" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#ee4d2d] flex items-center justify-center shadow-lg transform rotate-3">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight serif">Bli Wayan (AI Guide)</p>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                   <p className="text-[9px] text-stone-500 font-black uppercase tracking-widest">Always Online</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors relative z-10">
              <X size={20} />
            </button>
          </div>
          
          {/* Chat Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fbfbf9] no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm font-medium ${
                  m.role === 'user' 
                    ? 'bg-stone-900 text-white rounded-tr-none' 
                    : 'bg-white text-stone-800 border border-stone-100 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-[1.5rem] border border-stone-100 flex gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#ee4d2d] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#ee4d2d] rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-[#ee4d2d] rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-white border-t border-stone-50">
            <div className="flex gap-3 bg-stone-50 p-2 rounded-[1.8rem] border border-stone-100 focus-within:border-[#ee4d2d]/20 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanyakan sesuatu..."
                className="flex-1 px-4 py-2 text-sm outline-none bg-transparent font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-[#ee4d2d] text-white p-3 rounded-2xl hover:bg-stone-900 disabled:opacity-50 transition-all shadow-xl shadow-orange-950/10"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-stone-950 text-white p-5 rounded-[2rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-3 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#ee4d2d]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-[#ee4d2d] p-1.5 rounded-lg shadow-lg">
             {isOpen ? <X size={20}/> : <MessageCircle size={24} />}
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-black text-[10px] uppercase tracking-[0.3em] whitespace-nowrap">
            Ask Wayan Guide
          </span>
        </div>
      </button>
    </div>
  );
};

export default ChatWidget;
