
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { chatWithStoreAssistant } from '../services/geminiService';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Halo! Saya StoryBot, asisten virtual Anda. Ada yang bisa saya bantu untuk belanja hari ini?' }
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
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-80 sm:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col border border-stone-100 overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-[#ee4d2d] p-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">StoryBot</p>
                <p className="text-[10px] opacity-80">Support Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20}/></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-[#ee4d2d] text-white' : 'bg-white text-stone-800 shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] text-stone-400">Mengetik...</div>}
          </div>
          <div className="p-4 border-t bg-white flex gap-2">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-stone-100 rounded-full px-4 py-2 text-sm outline-none"
              placeholder="Ketik pesan..."
            />
            <button onClick={handleSend} className="bg-[#ee4d2d] text-white p-2 rounded-full"><Send size={18}/></button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#ee4d2d] text-white p-4 rounded-full shadow-lg hover:scale-105 transition-all">
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

export default ChatWidget;
