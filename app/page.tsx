'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  imageUrl?: string;
  isError?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Olá! Sou a ScorpionAI multimédia. Posso conversar, gerar imagens e ajudar o seu negócio.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `Erro: ${data.error || 'Não foi possível obter resposta.'}`,
            isError: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: data.reply,
            imageUrl: data.imageUrl,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Erro de conexão com o servidor.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white flex flex-col justify-between p-4 md:p-8 font-sans">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🦂</div>
          <div>
            <h1 className="text-xl font-bold text-red-500 tracking-wide">ScorpionAI Multimédia</h1>
            <p className="text-xs text-slate-400">Texto, Imagens e Assistência Comercial</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-emerald-900/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-emerald-400">Sistema Ativo</span>
        </div>
      </header>

      <section className="max-w-4xl w-full mx-auto my-6 flex-1 bg-[#0a1026] border border-slate-800 rounded-xl p-4 md:p-6 flex flex-col justify-between min-h-[500px] max-h-[70vh] shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-red-600 text-white rounded-br-none'
                    : msg.isError
                    ? 'bg-slate-800 text-slate-300 border border-slate-700 rounded-bl-none'
                    : 'bg-slate-800/80 text-slate-100 rounded-bl-none border border-slate-700/50'
                }`}
              >
                <p>{msg.text}</p>
                {msg.imageUrl && (
                  <div className="mt-3">
                    <img 
                      src={msg.imageUrl} 
                      alt="Imagem gerada por IA" 
                      className="rounded-xl max-w-full h-auto border border-slate-700 shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 text-slate-400 text-sm px-5 py-3 rounded-2xl rounded-bl-none border border-slate-700/50 flex items-center gap-2">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
                <span className="text-xs ml-2">Gerando conteúdo...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem ou peça 'gerar imagem de um cavalo'..."
            className="flex-1 bg-[#060919] border border-red-900/50 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors placeholder:text-slate-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all shadow-lg active:scale-95"
          >
            Enviar
          </button>
        </div>
      </section>

      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-600 pt-2">
        ScorpionAI Comercial © 2026 — Todos os direitos reservados.
      </footer>
    </main>
  );
}
