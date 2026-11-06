
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  imageUrl?: string;
  isError?: boolean;
}

const welcomeMessage: Message = {
  id: 'welcome',
  sender: 'bot',
  text: 'Olá! Eu sou o ScorpionAI. Estou pronto para conversar, criar imagens e ajudar você a desenvolver seu negócio. Como posso ajudar hoje?',
};

const suggestions = [
  'Crie uma estratégia para vender mais',
  'Escreva um anúncio profissional',
  'Crie uma imagem de um produto',
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendingRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function newId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function newConversation() {
    if (sendingRef.current) return;
    setMessages([welcomeMessage]);
    setInput('');
  }

  async function handleSend(event?: FormEvent<HTMLFormElement>, suggestedText?: string) {
    event?.preventDefault();

    const messageText = (suggestedText ?? input).trim();

    if (!messageText || sendingRef.current) return;

    // Impede dois envios simultâneos
    sendingRef.current = true;

    setInput('');
    setLoading(true);

    setMessages((previous) => [
      ...previous,
      {
        id: newId(),
        sender: 'user',
        text: messageText,
      },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível obter uma resposta.');
      }

      if (typeof data.reply !== 'string' && !data.imageUrl) {
        throw new Error('O servidor retornou uma resposta inválida.');
      }

      setMessages((previous) => [
        ...previous,
        {
          id: newId(),
          sender: 'bot',
          text: data.reply || 'Imagem solicitada:',
          imageUrl: data.imageUrl,
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro inesperado de conexão.';

      setMessages((previous) => [
        ...previous,
        {
          id: newId(),
          sender: 'bot',
          text: errorMessage,
          isError: true,
        },
      ]);
    } finally {
      sendingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-white flex">

      {/* MENU LATERAL */}
      <aside className="hidden md:flex w-64 bg-[#0d0e14] border-r border-white/10 flex-col p-5">

        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-900 flex items-center justify-center text-2xl shadow-lg shadow-red-950/40">
            🦂
          </div>

          <div>
            <h1 className="font-bold text-lg tracking-wide">
              SCORPION<span className="text-red-500">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-widest">
              INTELLIGENCE SYSTEM
            </p>
          </div>
        </div>

        <button
          onClick={newConversation}
          className="w-full rounded-xl bg-red-600 hover:bg-red-500 transition p-3 text-sm font-semibold mb-8"
        >
          + Nova conversa
        </button>

        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4">
          Ferramentas
        </p>

        <div className="space-y-2">
          <button
            onClick={() => handleSend(undefined, 'Crie uma imagem de um produto moderno e profissional.')}
            className="w-full text-left p-3 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition"
          >
            🎨 Criar imagens
          </button>

          <button
            onClick={() => handleSend(undefined, 'Ajude-me a criar uma estratégia comercial para vender mais.')}
            className="w-full text-left p-3 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition"
          >
            📈 Assistente comercial
          </button>

          <button
            onClick={() => handleSend(undefined, 'Ajude-me a criar um anúncio profissional para divulgar um produto.')}
            className="w-full text-left p-3 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition"
          >
            ✍️ Criar anúncios
          </button>
        </div>

        <div className="mt-auto border-t border-white/10 pt-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-400">Assistente disponível</span>
          </div>
          <p className="text-[10px] text-slate-600 mt-3">
            ScorpionAI © 2026
          </p>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <section className="flex-1 min-w-0 flex flex-col min-h-screen">

        {/* CABEÇALHO */}
        <header className="h-[76px] border-b border-white/10 flex items-center justify-between px-5 md:px-10 bg-[#0b0c12]">

          <div>
            <h2 className="font-semibold text-sm md:text-base">
              Assistente Inteligente
            </h2>
            <p className="text-xs text-slate-500">
              Seu parceiro para ideias, criação e negócios
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-900/50 bg-green-950/20 px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-400">Online</span>
          </div>
        </header>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-8">

          <div className="max-w-4xl mx-auto">

            {messages.length === 1 && (
              <div className="text-center py-10 md:py-16">
                <div className="text-5xl mb-6">🦂</div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  O futuro começa <span className="text-red-500">aqui.</span>
                </h2>

                <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                  Converse com sua inteligência artificial, desenvolva ideias,
                  crie conteúdos e encontre novas oportunidades para seu negócio.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-10">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(undefined, suggestion)}
                      disabled={loading}
                      className="text-left p-4 rounded-xl border border-white/10 bg-[#11131b] hover:border-red-500/60 hover:bg-red-950/10 transition text-sm text-slate-300 disabled:opacity-50"
                    >
                      {suggestion}
                      <span className="block text-red-500 mt-3">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-red-950 border border-red-900/50 flex items-center justify-center">
                      🦂
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                      message.sender === 'user'
                        ? 'bg-red-600 text-white rounded-br-sm'
                        : message.isError
                        ? 'bg-red-950/30 border border-red-800/50 text-red-300 rounded-bl-sm'
                        : 'bg-[#151720] border border-white/10 text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.text}
                    </p>

                    {message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt="Imagem gerada pelo ScorpionAI"
                        className="mt-4 rounded-xl max-w-full h-auto border border-white/10"
                      />
                    )}
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-slate-800 flex items-center justify-center text-sm">
                      👤
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-950 flex items-center justify-center">
                    🦂
                  </div>
                  <div className="bg-[#151720] border border-white/10 rounded-xl px-5 py-4 text-sm text-slate-400">
                    ScorpionAI está pensando...
                    <span className="inline-block animate-pulse ml-2 text-red-500">●</span>
                  </div>
                </div>
              )}
            </div>

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* CAMPO DE MENSAGEM */}
        <footer className="border-t border-white/10 bg-[#0b0c12] px-4 md:px-10 py-5">

          <form
            onSubmit={(event) => handleSend(event)}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151720] p-2 focus-within:border-red-600/70 transition">

              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Pergunte qualquer coisa ao ScorpionAI..."
                disabled={loading}
                className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-5 py-3 text-sm font-semibold transition"
              >
                {loading ? '...' : 'Enviar ↑'}
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-600 mt-3">
              ScorpionAI pode cometer erros. Confira informações importantes.
            </p>
          </form>
        </footer>

      </section>
    </main>
  );
}
