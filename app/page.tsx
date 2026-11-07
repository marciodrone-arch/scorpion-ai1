'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; imageUrl?: string }>>([
    { role: 'assistant', content: 'Olá! Eu sou o ScorpionAI. Estou pronto para conversar, criar imagens e ajudar você a desenvolver seu negócio. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [persona, setPersona] = useState('Geral'); // Modo de IA ativo
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Histórico salvo ou padrão
  const [recentChats, setRecentChats] = useState<string[]>([
    'Migração C# K8s',
    'Estratégia de Vendas Q4',
    'Campanha Anúncio Facebook'
  ]);

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

    // Adiciona o contexto da persona escolhida de forma invisível para guiar a IA
    const contextualMessage = `[Modo Ativo: ${persona}] ${messageText}`;

    const newMessages = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contextualMessage }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply, imageUrl: data.imageUrl }]);
        
        // Adiciona aos recentes se for a primeira interação relevante
        if (recentChats.length === 3 && messageText.length > 5) {
          setRecentChats([messageText.slice(0, 30) + '...', ...recentChats]);
        }
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Erro: ' + (data.error || 'Falha ao processar') }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Erro de conexão com o servidor.' }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const exportChat = () => {
    const chatText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scorpion-ai-chat.txt';
    a.click();
  };

  return (
    <div className="flex h-screen bg-[#0a0c10] text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar Lateral Avançada */}
      <aside className="w-64 bg-[#111318] text-gray-200 h-screen p-4 flex flex-col justify-between border-r border-gray-800/80 shadow-xl">
        <div className="space-y-5">
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

          {/* Seletor de Persona / Modo de IA */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-gray-400 px-2 uppercase tracking-wider">
              Modo de Especialista
            </div>
            <select 
              value={persona} 
              onChange={(e) => setPersona(e.target.value)}
              className="w-full bg-[#181b24] text-xs text-gray-200 px-3 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
            >
              <option value="Geral">🤖 Assistente Geral</option>
              <option value="Arquiteto de Software Sênior">💻 Arquiteto de Software (C#/Cloud)</option>
              <option value="Copywriter de Alta Conversão">📈 Especialista em Vendas & Copy</option>
              <option value="Criativo de Marketing">🎨 Diretor Criativo & Anúncios</option>
            </select>
          </div>

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
              Ferramentas Rápidas
            </div>
            
            <button 
              onClick={() => handleSend('Crie uma imagem de um escritório moderno de tecnologia')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-[#181b24] hover:text-white transition-colors text-left"
            >
              <span>🎨</span>
              <span>Criar imagens</span>
            </button>

            <button 
              onClick={() => handleSend('Me ajude a estruturar uma estratégia comercial forte para escalar vendas')}
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
          <div className="space-y-1 pt-2 border-t border-gray-800/60 max-h-36 overflow-y-auto">
            <div className="text-[11px] font-bold text-gray-400 px-2 mb-2 uppercase tracking-wider">
              Recentes
            </div>
            {filteredChats.map((title, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:bg-[#181b24] hover:text-gray-200 transition-colors truncate text-left"
              >
                <span>💬</span>
                <span className="truncate">{title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rodapé da Sidebar com Botão de Exportar */}
        <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between px-1">
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
          <button 
            onClick={exportChat}
            title="Descarregar conversa"
            className="text-xs bg-[#181b24] hover:bg-gray-800 text-gray-300 px-2.5 py-1.5 rounded-lg border border-gray-800 transition-colors"
          >
            📥 Exportar
          </button>
        </div>
      </aside>

      {/* Área Principal de Chat */}
      <main className="flex-1 flex flex-col justify-between bg-[#0a0c10] relative">
        
        {/* Header Superior */}
        <header className="h-16 border-b border-gray-800/60 flex items-center justify-between px-6 bg-[#0a0c10]/80 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-200 text-base">Assistente Inteligente</h2>
              <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 font-medium">
                {persona}
              </span>
            </div>
            <p className="text-xs text-gray-400">Plataforma comercial de alta conversão</p>
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
                  <span className="font-semibold text-white block mb-1 group-hover:text-red-400 transition-colors">Estratégia de vendas</span>
                  <span className="text-xs text-gray-500">Foque em conversão rápida e ROI alto</span>
                </button>
                <button onClick={() => handleSend('Escreva um anúncio profissional')} className="p-4 bg-[#141720] hover:bg-[#1c202d] border border-gray-800 rounded-2xl text-left text-sm text-gray-300 transition-all group">
                  <span className="font-semibold text-white block mb-1 group-hover:text-red-400 transition-colors">Anúncio profissional</span>
                  <span className="text-xs text-gray-500">Copywriting focado em engajamento</span>
                </button>
                <button onClick={() => handleSend('Crie uma imagem de um produto inovador')} className="p-4 bg-[#141720] hover:bg-[#1c202d] border border-gray-800 rounded-2xl text-left text-sm text-gray-300 transition-all group">
                  <span className="font-semibold text-white block mb-1 group-hover:text-red-400 transition-colors">Gerar imagem realista</span>
                  <span className="text-xs text-gray-500">Gerador visual integrado</span>
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 max-w-3xl mx-auto w-full group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-sm">
                  🦂
                </div>
              )}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed relative ${
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

                {/* Botão de Copiar resposta */}
                {msg.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-gray-800/40 flex justify-end">
                    <button 
                      onClick={() => copyToClipboard(msg.content, index)}
                      className="text-[11px] text-gray-400 hover:text-white transition-colors flex items-center gap-1 bg-gray-900/40 px-2 py-1 rounded-md"
                    >
                      {copiedIndex === index ? '✅ Copiado!' : '📋 Copiar texto'}
                    </button>
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
              placeholder={`Pergunte ao ScorpionAI (${persona})...`}
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
            <span className="text-[10px] text-gray-400">ScorpionAI v2.0 • Inteligência Artificial Comercial Integrada.</span>
          </div>
        </div>

      </main>
    </div>
  );
}
