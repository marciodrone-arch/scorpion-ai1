'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou a ScorpionAI. Como posso ajudar o seu negócio hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Erro: ${data.error || 'Não foi possível obter resposta.'}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Erro de conexão com o servidor.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 md:p-8">
      {/* Cabeçalho */}
      <header className="w-full max-w-4xl flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🦂</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
              ScorpionAI
            </h1>
            <p className="text-xs text-slate-400">Painel Comercial de Inteligência Artificial</p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          ● Sistema Ativo
        </span>
      </header>

      {/* Caixa de Conversação */}
      <div className="w-full max-w-4xl flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 mb-4 overflow-y-auto max-h-[60vh] flex flex-col gap-4 shadow-xl backdrop-blur-sm">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-4 py-3 text-sm border border-slate-700/50 animate-pulse">
              ScorpionAI está a pensar...
            </div>
          </div>
        )}
      </div>

      {/* Barra de Envio */}
      <form onSubmit={handleSubmit} className="w-full max-w-4xl flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem comercial..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-medium px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:shadow-red-500/20 disabled:opacity-50 cursor-pointer"
        >
          Enviar
        </button>
      </form>

      <footer className="w-full max-w-4xl text-center mt-6 text-xs text-slate-500 border-t border-slate-900 pt-4">
        ScorpionAI Comercial &copy; 2026 — Todos os direitos reservados.
      </footer>
    </main>
  );
}
