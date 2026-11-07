'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; imageUrl?: string }>>([
    { role: 'assistant', content: 'Olá! Eu sou o ScorpionAI. Estou pronto para conversar, analisar prints, criar imagens e ajudar você a desenvolver seu negócio. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [persona, setPersona] = useState('Geral');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recentChats, setRecentChats] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('scorpion_chats');
    if (saved) {
      try { setRecentChats(JSON.parse(saved)); } catch (e) {}
    } else {
      const initial = ['Migração C# K8s', 'Estratégia de Vendas Q4', 'Campanha Anúncio Facebook'];
      setRecentChats(initial);
      localStorage.setItem('scorpion_chats', JSON.stringify(initial));
    }
  }, []);

  const filteredChats = recentChats.filter(chat => 
    chat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if ((!messageText.trim() && !selectedImage) || loading) return;

    const newMessages = [...messages, { 
      role: 'user', 
      content: messageText || 'Enviei uma imagem para análise.',
      imageUrl: selectedImage || undefined 
    }];
    
    setMessages(newMessages);
    if (!textToSend) setInput('');
    const imgToSend = selectedImage;
    setSelectedImage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText, 
          image: imgToSend,
          persona: persona 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply, imageUrl: data.imageUrl }]);
        
        if (messageText.length > 3) {
          const updatedChats = [messageText.slice(0, 30) + '...', ...recentChats.filter(c => c !== messageText)];
          setRecentChats(updatedChats);
          localStorage.setItem('scorpion_chats', JSON.stringify(updatedChats));
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
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-[#111318] text-gray-200 h-screen p-4 flex flex-col justify-between border-r border-gray-800/80 shadow-xl">
        <div className="space-y-5">
          <div className="flex items-center gap-3 px-2 pt-2">
            <span className="text-2xl">🦂</span>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide leading-none">ScorpionAI</h1>
              <span className="text-[10px] text-red-500 font-semibold tracking-widest uppercase">Intelligence System</span>
            </div>
          </div>

          <button 
            onClick={() => setMessages([{ role: 'assistant', content: 'Nova conversa iniciada. Como posso ajudar?' }])}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30"
          >
            <span className="text-lg font-bold">+</span>
            <span>Nova conversa</span>
          </button>

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
              <option value="Arquiteto de Software Sênior">💻 Arquiteto de Software</option>
              <option value="Copywriter de Alta Conversão">📈 Especialista em Vendas</option>
              <option value="QA Tester & Auditor">🔍 Engenheiro de QA & Testes</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Pesquisar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181b24] text-sm text-gray-200 px-3 py-2 rounded-xl border border-gray-800 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <nav className="space-y-1">
            <div className="text-[11px] font-bold text-gray-400 px-2 mb-2 uppercase tracking-wider">
              Ferramentas Rápidas
            </div>
            <button onClick={() => handleSend('Crie uma imagem de um escritório moderno')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-[#181b24] transition-colors text-left">
              <span>🎨</span><span>Criar imagens</span>
            </button>
            <button onClick={() => handleSend('Me ajude a estruturar uma estratégia comercial forte')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-[#181b24] transition-colors text-left">
              <span>📈</span><span>Assistente comercial</span>
            </button>
            <button onClick={() => handleSend('Escreva um anúncio de alta conversão')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-[#181b24] transition-colors text-left">
              <span>✍️</span><span>Criar anúncios</span>
            </button>
          </nav>

          <div className="space-y-1 pt-2 border-t border-gray-800/60 max-h-36 overflow-y-auto">
            <div className="text-[11px] font-bold text-gray-400 px-2 mb-2 uppercase tracking-wider">
              Recentes (Salvos)
            </div>
            {filteredChats.map((title, index) => (
              <button
                key={index}
                onClick={() => handleSend(`Vamos retomar o tópico sobre: ${title}`)}
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:bg-[#181b24] hover:text-gray-200 transition-colors truncate text-left"
              >
                <span>💬</span>
                <span className="truncate">{title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between px-1">
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online (QA Ready)
          </span>
          <button onClick={exportChat} className="text-xs bg-[#181b24] hover:bg-gray-800 text-gray-300 px-2.5 py-1.5 rounded-lg border border-gray-800 transition-colors">
            📥 Exportar
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col justify-between bg-[#0a0c10] relative">
        
        <header className="h-16 border-b border-gray-800/60 flex items-center justify-between px-6 bg-[#0a0c10]/80 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-200 text-base">Assistente Inteligente</h2>
              <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 font-medium">
                {persona}
              </span>
            </div>
            <p className="text-xs text-gray-400">Ambiente de QA e alta performance</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 1 && (
            <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
              <span className="text-4xl">🦂</span>
              <h2 className="text-3xl font-bold text-white tracking-tight">O futuro começa <span className="text-red-500">aqui.</span></h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">Envie textos, faça upload de prints para análise ou escolha uma ferramenta rápida.</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 max-w-3xl mx-auto w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-sm">🦂</div>
              )}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed relative ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white rounded-br-xs max-w-lg shadow-md' 
                  : 'bg-[#141720] border border-gray-800 text-gray-200 rounded-bl-xs w-full shadow-md'
              }`}>
                {msg.imageUrl && (
                  <div className="mb-3">
                    <img src={msg.imageUrl} alt="Upload do utilizador" className="rounded-xl max-h-48 w-auto border border-black/30 shadow-md" />
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-gray-800/40 flex justify-end">
                    <button onClick={() => copyToClipboard(msg.content, index)} className="text-[11px] text-gray-400 hover:text-white transition-colors flex items-center gap-1 bg-gray-900/40 px-2 py-1 rounded-md">
                      {copiedIndex === index ? '✅ Copiado!' : '📋 Copiar'}
                    </button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 text-xs font-bold text-gray-300">EU</div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-3xl mx-auto w-full items-center">
              <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">🦂</div>
              <div className="p-4 bg-[#141720] border border-gray-800 text-gray-400 rounded-2xl text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>Processando dados no sistema...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Caixa de Entrada */}
        <div className="p-6 bg-[#0a0c10] border-t border-gray-800/60">
          <div className="max-w-3xl mx-auto">
            {selectedImage && (
              <div className="mb-2 flex items-center gap-2 bg-[#141720] p-2 rounded-xl border border-gray-800 w-fit">
                <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                <span className="text-xs text-gray-300">Print pronto para envio</span>
                <button onClick={() => setSelectedImage(null)} className="text-red-400 hover:text-red-300 text-xs px-2 font-bold">✕</button>
              </div>
            )}

            <div className="relative flex items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Anexar print ou imagem"
                className="absolute left-3 text-gray-400 hover:text-white p-2 transition-colors text-lg"
              >
                📎
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Pergunte ou anexe um print ao ScorpionAI..."
                rows={1}
                className="w-full bg-[#141720] text-gray-100 placeholder-gray-500 text-sm rounded-2xl pl-12 pr-24 py-3.5 border border-gray-800 focus:outline-none focus:border-red-500 resize-none shadow-inner transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || (!input.trim() && !selectedImage)}
                className="absolute right-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md shadow-red-900/20 flex items-center gap-1.5"
              >
                <span>Enviar</span>
                <span>↑</span>
              </button>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">ScorpionAI v2.2 • Multimodal & Personas Ativas.</span>
          </div>
        </div>

      </main>
    </div>
  );
}
