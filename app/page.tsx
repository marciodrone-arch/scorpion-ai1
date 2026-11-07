'use client';

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Video, 
  Folder, 
  Sliders, 
  MessageSquare, 
  Bot 
} from 'lucide-react';

export default function Sidebar({ onSelectPrompt, onNewChat }: any) {
  const [searchTerm, setSearchTerm] = useState('');

  // Exemplo de histórico recente armazenado
  const recentChats = [
    'Migração C# K8s',
    'Estratégia de Vendas Q4',
    'Campanha Anúncio Facebook'
  ];

  const filteredChats = recentChats.filter(chat => 
    chat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-64 bg-[#111318] text-gray-200 h-screen p-4 flex flex-col justify-between border-r border-gray-800">
      <div className="space-y-6">
        {/* Cabeçalho / Logo */}
        <div className="flex items-center gap-2 px-2">
          <Bot className="w-6 h-6 text-red-500" />
          <h1 className="text-xl font-bold text-white tracking-wide">ScorpionAI</h1>
        </div>

        {/* Botão Nova Conversa */}
        <button 
          onClick={onNewChat}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nova conversa</span>
        </button>

        {/* Campo Pesquisar conversas */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e2029] text-sm text-gray-200 pl-9 pr-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Seção Ferramentas Principais */}
        <nav className="space-y-1">
          <div className="text-xs font-semibold text-gray-400 px-2 mb-2 uppercase tracking-wider">
            Ferramentas
          </div>
          
          <button 
            onClick={() => onSelectPrompt('Crie uma imagem de ')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1e2029] transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>Imagens</span>
          </button>

          <button 
            onClick={() => onSelectPrompt('Gere um roteiro de vídeo sobre ')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1e2029] transition-colors"
          >
            <Video className="w-4 h-4 text-blue-400" />
            <span>Vídeos</span>
          </button>

          <button 
            onClick={() => onSelectPrompt('Estruture uma proposta para ')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1e2029] transition-colors"
          >
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Biblioteca</span>
          </button>

          <button 
            onClick={() => alert('Configurar instruções de personalidade da IA')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1e2029] transition-colors"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Personalizar</span>
          </button>
        </nav>

        {/* Histórico Recentes */}
        <div className="space-y-1 pt-2 border-t border-gray-800/60">
          <div className="text-xs font-semibold text-gray-400 px-2 mb-2 uppercase tracking-wider">
            Recentes
          </div>
          {filteredChats.map((title, index) => (
            <button
              key={index}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#1e2029] hover:text-gray-200 transition-colors truncate text-left"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">{title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer do Menu */}
      <div className="pt-4 border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Assistente disponível
        </span>
      </div>
    </aside>
  );
}
