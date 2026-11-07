'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; imageUrl?: string }>>([
    { role: 'assistant', content: 'Olá! Eu sou o ScorpionAI. Estou pronto para conversar, criar imagens e ajudar você a desenvolver seu negócio. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const recentChats = [
    'Migração C# K8s',
    'Estratégia de Vendas Q4',
    'Campanha Anúncio Facebook'
  ];

  const filteredChats = recentChats.filter(chat => 
    chat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply, imageUrl: data.imageUrl }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Erro: ' + (data.error || 'Falha ao processar') }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Erro de conexão com o servidor.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0c10] text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar Lateral Profissional */}
      <aside className="w-64 bg-[#111318] text-gray-200 h-screen p-4 flex flex-col justify-between border-r border-gray-800/80 shadow-xl">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <span className="text-2xl">🦂</span>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide leading-none">ScorpionAI</h1>
              <span className="text-[10px] text-red-500 font-semibold tracking-widest uppercase">Intelligence System</span>
            </div>
          </div>

          {/* Botão Nova Conversa */}
          <button 
            onClick={() => setMessages([{ role: 'assistant', content: 'Nova conversa iniciada. Como posso ajudar?' }])}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30"
          >
            <span className="text-lg font-bold">+</span>
            <span>Nova conversa</span>
          </button>

          {/* Pesquisa */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Pesquisar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181b24] text-sm text-gray-200 px-3 py-2 rounded-xl border border-gray-800 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Ferramentas / Atalhos */}
          <nav className="space-y-1">
            <div className="text-[11px] font-bold text-gray-400 px-2 mb-2 uppercase tracking-wider">
              Ferramentas
            </div>
            
            <button 
              onClick={() => handleSend('Crie uma imagem de um escritório moderno')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-[#181b24] hover:text-white transition-colors text-left"
            >
              <span>🎨</span>
              <span>Criar imagens</span>
            </button>

            <button 
              onClick={() => handleSend('Me ajude a estruturar uma estratégia comercial forte')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-[#181b24] hover:text-white transition-colors text-left"
            >
              <span>📈</span>
              <span>Assistente comercial</span>
            </button>

            <button 
              onClick={() => handleSend('Escreva um anúncio de alta conversão para redes sociais')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-[#181b24] hover:text-white transition-colors text-left"
            >
              <span>✍️</span>
              <span>Criar anúncios</span>
            </button>
          </nav>

          {/* Recentes */}
          <div className="space-y-1 pt-2 border-t border-gray-800/60">
            <div className="text-[11px] font-bold text-gray-400 px-2 mb-2 uppercase tracking-wider">
              Recentes
            </div>
            {filteredChats.map((title, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-[#181b24] hover:text-gray-200 transition-colors truncate text-left"
              >
                <span>💬</span>
                <span className="truncate">{title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="pt-4 border-t border-gray-800/80 text-xs text-gray-400 flex items-center justify-between px-1">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Assistente disponível
          </span>
          <span className="text-[10px] text-gray-400">v1.0</span>
        </div>
      </aside>

      {/* Área Principal de Chat */}
      <main className="flex-1 flex flex-col justify-between bg-[#0a0c10] relative">
        
        {/* Header Superior */}
        <header className="h-16 border-b border-gray-800/60 flex items-center justify-between px-6 bg-[#0a0c10]/80 backdrop-blur-md z-10">
          <div>
            <h2 className="font-bold text-gray-200 text-base">Assistente Inteligente</h2>
            <p className="text-xs text-gray-400">Seu parceiro para ideias, criação e negócios</p>
          </div>
        </header>

        {/* Histórico de Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 1 && (
            <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
              <span className="text-4xl">🦂</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">O futuro começa <span className="text-red-500">aqui.</span></h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">Converse com sua inteligência artificial, desenvolva ideias, crie conteúdos e encontre novas oportunidades para seu negócio.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
                <button onClick={() => handleSend('Crie uma estratégia para vender mais')} className="p-4 bg-[#141720] hover:bg-[#1c202d] border border-gray-800 rounded-2xl text-left text-sm text-gray-300 transition-all group">
                  <span className="font-semibold text-white block mb-1 group-hover:text-red-400 transition-colors">Crie uma estratégia de vendas</span>
                  <span className="text-xs text-gray-500">Foque em conversão rápida e ROI alto</span>
                </button>
                <button onClick={() => handleSend('Escreva um anúncio profissional')} className="p-4 bg-[#141720] hover:bg-[#1c202d] border border-gray-800 rounded-2xl text-left text-sm text-gray-300 transition-all group">
                  <span className="font-semibold text-white block mb-1 group-hover:text-red-400 transition-colors">Escreva um anúncio profissional</span>
                  <span className="text-xs text-gray-500">Copywriting focado em engajamento</span>
                </button>
                <button onClick={() => handleSend('Crie uma imagem de um produto inovador')} className="p-4 bg-[#141720] hover:bg-[#1c202d] border border-gray-800 rounded-2xl text-left text-sm text-gray-300 transition-all group">
                  <span className="font-semibold text-white block mb-1 group-hover:text-red-400 transition-colors">Crie uma imagem realista</span>
                  <span className="text-xs text-gray-500">Gerador visual integrado</span>
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 max-w-3xl mx-auto w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-sm">
                  🦂
                </div>
              )}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white rounded-br-xs max-w-lg shadow-md' 
                  : 'bg-[#141720] border border-gray-800 text-gray-200 rounded-bl-xs w-full shadow-md'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.imageUrl && (
                  <div className="mt-3">
                    <img src={msg.imageUrl} alt="Imagem gerada" className="rounded-xl max-w-full h-auto border border-gray-700 shadow-lg" />
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 text-xs font-bold text-gray-300">
                  EU
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-3xl mx-auto w-full items-center">
              <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
                🦂
              </div>
              <div className="p-4 bg-[#141720] border border-gray-800 text-gray-400 rounded-2xl text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>Gerando resposta de alta performance...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Caixa de Entrada de Mensagem */}
        <div className="p-6 bg-[#0a0c10] border-t border-gray-800/60">
          <div className="max-w-3xl mx-auto relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Pergunte qualquer coisa ao ScorpionAI..."
              rows={1}
              className="w-full bg-[#141720] text-gray-100 placeholder-gray-500 text-sm rounded-2xl pl-4 pr-24 py-3.5 border border-gray-800 focus:outline-none focus:border-red-500 resize-none shadow-inner transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="absolute right-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md shadow-red-900/20 flex items-center gap-1.5"
            >
              <span>Enviar</span>
              <span>↑</span>
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">ScorpionAI pode cometer erros. Confira informações importantes.</span>
          </div>
        </div>

      </main>
    </div>
  );
}
