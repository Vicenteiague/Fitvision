import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot } from 'lucide-react';
import { chatWithCoach } from '../services/geminiService';
import type { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onBack: () => void;
}

export function AICoach({ profile, onBack }: Props) {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([{
    role: 'model',
    text: `Olá! Sou a FitVision IA, seu treinador online. Como posso ajudar com seu objetivo de ${profile.goal.replace('_', ' ')} hoje?`
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const reply = await chatWithCoach(userMsg, profile, messages.slice(1)); // ignora a primeria msg de boas vindas pro historico limpo
      setMessages(prev => [...prev, { role: 'model', text: reply || 'Aconteceu um erro na geração.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Tive um problema de conexão. Poderia tentar de novo?' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans max-w-md mx-auto relative border-x border-gray-900">
      {/* Header */}
      <div className="flex items-center p-6 border-b border-gray-800 bg-[#121212] sticky top-0 z-10 shadow-lg">
        <button onClick={onBack} className="p-2 bg-black rounded-full hover:bg-gray-800 transition-colors mr-3">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#39FF14]/10 flex items-center justify-center mr-3 border border-[#39FF14]/30">
            <Bot className="w-6 h-6 text-[#39FF14]" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Coach IA</h1>
            <span className="text-xs text-[#39FF14] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full inline-block"></span>
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 pb-24">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${m.role === 'user' ? 'bg-[#39FF14] text-black rounded-br-sm' : 'bg-[#121212] border border-gray-800 text-white rounded-bl-sm'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#121212] border border-gray-800 text-white rounded-2xl rounded-bl-sm p-4 flex items-center space-x-1.5 h-12">
              <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#121212] border-t border-gray-800 absolute bottom-0 w-full">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Mande sua dúvida..."
            className="w-full bg-black border border-gray-800 rounded-full py-4 pl-6 pr-14 text-white focus:outline-none focus:border-[#39FF14] transition-colors text-sm shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2.5 bg-[#39FF14] rounded-full text-black disabled:opacity-50 transition-transform active:scale-95 hover:bg-[#32e011]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
