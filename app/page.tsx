'use client';

import React, { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  provider?: string;
};

type ChatRecord = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

type AuthUser = {
  id: string;
  name?: string;
  email?: string;
};

const STORAGE_PREFIX = 'scorpion_chat_records';

const initialMessage: Message = {
  role: 'assistant',
  content:
    'Olá! Eu sou o ScorpionAI. Estou pronto para conversar, gerar imagens, traduzir textos e estruturar informações para o seu negócio. Como posso ajudar hoje?',
};

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}_${userId}`;
}

function resizeImageForEditing(imageUrl: string, maxDimension = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) { reject(new Error("Não foi possível preparar a imagem para edição.")); return; }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      } catch {
        reject(new Error("Não foi possível preparar a imagem. Tente gerar novamente."));
      }
    };
    image.onerror = () => reject(new Error("Não foi possível carregar a imagem para edição. Gere novamente a imagem antes de tentar."));
    image.src = imageUrl;
  });
}

function saveChat(storageKey: string, record: ChatRecord) {
  try {
    const saved = localStorage.getItem(storageKey);
    const chats: ChatRecord[] = saved ? JSON.parse(saved) : [];

    const updated = [
      record,
      ...chats.filter((chat) => chat.id !== record.id),
    ].sort((a, b) => b.updatedAt - a.updatedAt);

    localStorage.setItem(storageKey, JSON.stringify(updated.slice(0, 50)));
  } catch (error) {
    console.error('Erro ao salvar conversa:', error);
  }
}

function mapServerConversation(item: any): ChatRecord | null {
  try {
    const serverMessages = Array.isArray(item.messages)
      ? item.messages
      : [];

    const mappedMessages: Message[] = serverMessages
      .map((message: any) => {
        const parts = Array.isArray(message.parts) ? message.parts : [];

        const textPart = parts.find(
          (part: any) => part?.type === 'text'
        );

        const imagePart = parts.find(
          (part: any) => part?.type === 'image'
        );

        const providerPart = parts.find(
          (part: any) => part?.type === 'provider'
        );

        const content =
          typeof message.content === 'string'
            ? message.content
            : typeof textPart?.text === 'string'
              ? textPart.text
              : '';

        return {
          role: message.role,
          content,
          imageUrl:
            message.imageUrl ||
            imagePart?.url ||
            imagePart?.imageUrl ||
            imagePart?.text ||
            undefined,
          provider:
            message.provider ||
            providerPart?.provider ||
            undefined,
        };
      })
      .filter(
        (message: Message) =>
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string'
      );

    if (!item.id || mappedMessages.length === 0) return null;

    const firstUserMessage = mappedMessages.find(
      (message) => message.role === 'user'
    );

    const title =
      item.title ||
      firstUserMessage?.content.slice(0, 35) ||
      'Nova conversa';

    return {
      id: String(item.id),
      title,
      messages: mappedMessages,
      updatedAt: item.updatedAt
        ? new Date(item.updatedAt).getTime()
        : Date.now(),
    };
  } catch (error) {
    console.error('Erro ao interpretar conversa do servidor:', error);
    return null;
  }
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [persona, setPersona] = useState('Geral');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [recentChats, setRecentChats] = useState<ChatRecord[]>([]);
  const [activeChatId, setActiveChatId] = useState('');
  const [currentProvider, setCurrentProvider] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch('/api/auth/get-session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          if (!cancelled) setAuthUser(null);
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          const user = data?.user;

          if (user?.id) {
            try {
              localStorage.removeItem(STORAGE_PREFIX);
            } catch (error) {
              console.error('Erro ao remover cache antigo:', error);
            }
          }

          setAuthUser(
            user?.id
              ? {
                  id: String(user.id),
                  name: user.name,
                  email: user.email,
                }
              : null
          );
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);

        if (!cancelled) setAuthUser(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadConversations() {
      if (!authUser?.id) {
        setRecentChats([]);
        setActiveChatId(Date.now().toString());
        setMessages([initialMessage]);
        setCurrentProvider('');
        return;
      }

      const storageKey = getStorageKey(authUser.id);
      let localChats: ChatRecord[] = [];

      try {
        const saved = localStorage.getItem(storageKey);

        if (saved) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            localChats = parsed;
          }
        }
      } catch (error) {
        console.error('Erro ao recuperar conversas locais:', error);
      }

      if (!cancelled) {
        setRecentChats(localChats);
        setActiveChatId(Date.now().toString());
      }

      try {
        const response = await fetch('/api/conversations', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Não foi possível carregar as conversas do servidor.');
        }

        const data = await response.json();

        if (!Array.isArray(data.conversations)) return;

        const serverChats = data.conversations
          .map(mapServerConversation)
          .filter((chat: ChatRecord | null): chat is ChatRecord => chat !== null);

        if (cancelled) return;

        const mergedChats = [
          ...serverChats,
          ...localChats.filter(
            (localChat) =>
              !serverChats.some(
                (serverChat) => serverChat.id === localChat.id
              )
          ),
        ]
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 50);

        setRecentChats(mergedChats);

        localStorage.setItem(
          storageKey,
          JSON.stringify(mergedChats)
        );
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar histórico do Neon:', error);
        }
      }
    }

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, [authLoading, authUser?.id]);

  const filteredChats = recentChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const persistConversation = async (
    id: string,
    conversationMessages: Message[]
  ) => {
    if (!authUser?.id || authLoading) return;

    const firstUserMessage = conversationMessages.find(
      (message) => message.role === 'user'
    );

    if (!firstUserMessage) return;

    const title =
      firstUserMessage.content.length > 35
        ? firstUserMessage.content.slice(0, 35) + '...'
        : firstUserMessage.content;

    const record: ChatRecord = {
      id,
      title,
      messages: conversationMessages,
      updatedAt: Date.now(),
    };

    const storageKey = getStorageKey(authUser.id);

    saveChat(storageKey, record);

    setRecentChats((previous) =>
      [
        record,
        ...previous.filter((chat) => chat.id !== id),
      ]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 50)
    );

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          messages: conversationMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Falha ao salvar conversa no servidor.'
        );
      }
    } catch (error) {
      console.error('Erro ao salvar conversa no Neon:', error);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend ?? input).trim();

    if (!messageText || loading) return;

    if (authLoading || !authUser?.id) {
      alert('Entre na sua conta para conversar com o ScorpionAI.');
      return;
    }

    const chatId = activeChatId || Date.now().toString();

    if (!activeChatId) setActiveChatId(chatId);

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: messageText },
    ];

    setMessages(newMessages);

    if (textToSend === undefined) setInput('');

    setLoading(true);
    setCurrentProvider('');

    try {
      const editIntent =
        /\b(coloque|coloca|adicione|adiciona|acrescente|acrescenta|inclua|inclui|remova|remove|retire|retira|mude|muda|troque|troca|substitua|substitui|altere|altera|modifique|modifica|transforme|transforma|deixe|deixa|ponha|poe|insira|insere|colocar|adicionar|acrescentar|incluir|remover|retirar|mudar|trocar|alterar|modificar)\b/i.test(messageText) &&
        /\b(imagem|foto|figura|cena|desenho)\b/i.test(messageText);

      const previousImage = [...newMessages]
        .reverse()
        .find((item) => item.role === 'assistant' && item.imageUrl)
        ?.imageUrl;

      const imageForEdit =
        editIntent && previousImage
          ? await resizeImageForEditing(previousImage)
          : undefined;

      const res = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          imageUrl: imageForEdit,
          messages: newMessages.map((item) => ({
            role: item.role,
            content: item.content,
          })),
          persona,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.reply || data.error || 'Falha ao processar a mensagem.'
        );
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || 'Não recebi uma resposta válida.',
        imageUrl: data.imageUrl,
        provider: data.provider,
      };

      const updatedMessages = [...newMessages, assistantMessage];

      setMessages(updatedMessages);
      setCurrentProvider(data.provider || '');

      await persistConversation(chatId, updatedMessages);
    } catch (error) {
      console.error('Erro no chat:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Erro de conexão com o servidor.',
      };

      const updatedMessages = [...newMessages, errorMessage];

      setMessages(updatedMessages);
      await persistConversation(chatId, updatedMessages);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    if (loading) return;

    setMessages([initialMessage]);
    setActiveChatId(Date.now().toString());
    setCurrentProvider('');
    setInput('');
    setIsSidebarOpen(false);
  };

  const openChat = (chat: ChatRecord) => {
    if (loading || !authUser?.id) return;

    setMessages(chat.messages);
    setActiveChatId(chat.id);
    setCurrentProvider(
      [...chat.messages].reverse().find((message) => message.provider)
        ?.provider || ''
    );
    setIsSidebarOpen(false);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      alert('Não foi possível copiar o texto.');
    }
  };

  const handleSignOut = async () => {
    if (signingOut || !authUser?.id) return;

    setSigningOut(true);

    try {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const responseText = await response.text();
      let responseData: any = {};

      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseData = { message: responseText };
      }

      if (!response.ok) {
        const serverMessage =
          responseData?.message ||
          responseData?.error ||
          responseData?.code ||
          responseText ||
          'O servidor não informou o motivo.';

        throw new Error(
          `HTTP ${response.status}: ${String(serverMessage).slice(0, 500)}`
        );
      }

      try {
        localStorage.removeItem(getStorageKey(authUser.id));
      } catch (error) {
        console.error('Erro ao limpar histórico local:', error);
      }

      setRecentChats([]);
      setMessages([initialMessage]);
      setActiveChatId('');
      setCurrentProvider('');
      setAuthUser(null);

      window.location.href = '/login';
    } catch (error) {
      console.error('Erro detalhado ao sair da conta:', error);

      const message =
        error instanceof Error ? error.message : String(error);

      alert(`Falha ao sair da conta: ${message}`);
      setSigningOut(false);
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-[#0a0c10] text-gray-100 font-sans overflow-hidden">

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 max-w-[85vw] bg-[#111318] text-gray-200 h-full p-4 flex flex-col justify-between border-r border-gray-800/80 shadow-xl shrink-0 transform transition-transform duration-200 md:relative md:translate-x-0 md:w-64 md:max-w-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between gap-3 px-2 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦂</span>
              <div>
                <h1 className="text-lg font-bold text-white tracking-wide leading-none">
                  ScorpionAI
                </h1>
                <span className="text-[10px] text-red-500 font-semibold tracking-widest uppercase">
                  Intelligence System
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-white text-2xl md:hidden px-2"
              aria-label="Fechar menu"
            >
              ×
            </button>
          </div>

          <button
            onClick={startNewChat}
            disabled={loading || !authUser}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30 disabled:opacity-50"
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
              <option value="Arquiteto de Software Sênior">
                💻 Arquiteto de Software
              </option>
              <option value="Copywriter de Alta Conversão">
                📈 Especialista em Vendas
              </option>
              <option value="QA Tester & Auditor">
                🔍 Engenheiro de QA & Testes
              </option>
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

            <button
              onClick={() => {
                setIsSidebarOpen(false);
                handleSend('Crie uma imagem de um leão moderno e futurista');
              }}
              disabled={!authUser || loading}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-[#181b24] transition-colors text-left disabled:opacity-50"
            >
              <span>🎨</span><span>Criar imagens</span>
            </button>

            <button
              onClick={() => {
                setIsSidebarOpen(false);
                handleSend('Me ajude a estruturar uma estratégia comercial forte');
              }}
              disabled={!authUser || loading}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-[#181b24] transition-colors text-left disabled:opacity-50"
            >
              <span>📈</span><span>Assistente comercial</span>
            </button>

            <button
              onClick={() => {
                setIsSidebarOpen(false);
                handleSend('Escreva um anúncio de alta conversão');
              }}
              disabled={!authUser || loading}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-[#181b24] transition-colors text-left disabled:opacity-50"
            >
              <span>✍️</span><span>Criar anúncios</span>
            </button>
          </nav>

          <div className="space-y-1 pt-2 border-t border-gray-800/60 max-h-52 overflow-y-auto">
            <div className="text-[11px] font-bold text-gray-400 px-2 mb-2 uppercase tracking-wider">
              Recentes (Salvos)
            </div>

            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => openChat(chat)}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs transition-colors truncate text-left ${
                  activeChatId === chat.id
                    ? 'bg-[#181b24] text-white'
                    : 'text-gray-400 hover:bg-[#181b24] hover:text-gray-200'
                }`}
              >
                <span>💬</span>
                <span className="truncate">{chat.title}</span>
              </button>
            ))}

            {filteredChats.length === 0 && (
              <p className="text-xs text-gray-500 px-3 py-2">
                Nenhuma conversa salva ainda.
              </p>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-800/80 shrink-0 space-y-3">

          {authLoading ? (
            <p className="text-xs text-gray-500 px-2">
              Verificando conta...
            </p>
          ) : authUser ? (
            <div className="space-y-2">
              <div className="px-2">
                <p className="text-xs text-emerald-400 font-semibold">
                  Conta conectada
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {authUser.name || authUser.email || 'Usuário'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {signingOut ? 'Saindo...' : '↪ Sair da conta'}
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="block w-full text-center bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 px-3 rounded-xl transition-colors"
            >
              Entrar / Criar conta
            </a>
          )}

          <div className="flex items-center px-2">
            <span className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-[#0a0c10] relative min-w-0 min-h-0">

        <header className="min-h-16 border-b border-gray-800/60 flex items-center gap-3 px-3 sm:px-6 py-3 bg-[#0a0c10]/80 backdrop-blur-md z-10 shrink-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-gray-700 text-gray-200 hover:bg-[#181b24]"
            aria-label="Abrir menu"
          >
            <span className="text-xl">☰</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-gray-200 text-sm sm:text-base">
                Assistente Inteligente
              </h2>

              <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 font-medium">
                {persona}
              </span>
            </div>

            <p className="text-xs text-gray-400 truncate">
              Ambiente otimizado de alta performance
              {currentProvider ? ` • Provedor: ${currentProvider}` : ''}
            </p>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-6">
          {messages.length === 1 && (
            <div className="max-w-3xl mx-auto text-center py-8 sm:py-12 space-y-4">
              <span className="text-4xl">🦂</span>

              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                O futuro começa <span className="text-red-500">aqui.</span>
              </h2>

              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Peça análises, traduções, criação de textos ou solicite imagens para o assistente.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2 sm:gap-4 max-w-3xl mx-auto w-full ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-sm">
                  🦂
                </div>
              )}

              <div
                className={`p-3 sm:p-4 rounded-2xl text-sm leading-relaxed relative min-w-0 ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white rounded-br-xs max-w-[85%] sm:max-w-lg shadow-md'
                    : 'bg-[#141720] border border-gray-800 text-gray-200 rounded-bl-xs w-full shadow-md overflow-x-auto'
                }`}
              >
                <p className="whitespace-pre-wrap font-sans break-words">
                  {msg.content}
                </p>

                {msg.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={msg.imageUrl}
                      alt="Imagem gerada"
                      className="rounded-xl max-w-full h-auto border border-gray-700 shadow-lg object-cover max-h-96"
                      loading="lazy"
                    />
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-gray-800/40 flex justify-between items-center gap-2">
                    <span className="text-[10px] text-gray-500">
                      {msg.provider || ''}
                    </span>

                    <button
                      onClick={() => copyToClipboard(msg.content, index)}
                      className="text-[11px] text-gray-400 hover:text-white transition-colors flex items-center gap-1 bg-gray-900/40 px-2 py-1 rounded-md shrink-0"
                    >
                      {copiedIndex === index ? '✅ Copiado!' : '📋 Copiar'}
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
            <div className="flex gap-3 sm:gap-4 max-w-3xl mx-auto w-full items-center">
              <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
                🦂
              </div>

              <div className="p-4 bg-[#141720] border border-gray-800 text-gray-400 rounded-2xl text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>Processando resposta do ScorpionAI...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 sm:p-6 bg-[#0a0c10] border-t border-gray-800/60 shrink-0">
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
              placeholder="Pergunte ao ScorpionAI..."
              rows={1}
              className="w-full bg-[#141720] text-gray-100 placeholder-gray-500 text-sm rounded-2xl pl-4 pr-24 py-3.5 border border-gray-800 focus:outline-none focus:border-red-500 resize-none shadow-inner transition-all"
            />

            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim() || !authUser}
              className="absolute right-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md shadow-red-900/20 flex items-center gap-1.5"
            >
              <span>Enviar</span>
              <span>↑</span>
            </button>
          </div>

          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">
              ScorpionAI v2.4 • Assistente inteligente multimodelo.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
