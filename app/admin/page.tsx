"use client";

import { useEffect, useMemo, useState } from "react";

type AdminStats = {
  totalUsers: number; signupsToday: number; signups7d: number; activePremium: number;
  confirmedPayments: number; confirmedAmountCents: number; otherPayments: number;
  sessionsToday: number; uniqueVisitorsToday: number; sessions7d: number;
  messagesToday: number; totalConversations: number; conversationsToday: number; tokens30d: number;
};
type AdminPayment = {
  id: string; amountCents: number; currency: string; status: string; createdAt: string;
  userName: string | null; userEmail: string | null; planName: string | null;
};
type AdminUser = {
  id: string; name: string; email: string; createdAt: string; banned: boolean;
  subscriptionStatus: string | null; currentPeriodEnd: string | null; planName: string | null;
  planPriceCents: number | null; sessionCount: number; lastAccess: string | null; messages30d: number;
};
type AdminTrend = { day: string; signups: number; sessions: number; messages: number; revenueCents: number };
type AdminPlan = {
  id: string; name: string; description: string | null; priceCents: number;
  dailyMessages: number; maxInputChars: number; maxOutputTokens: number; historyDays: number; active: boolean;
};

const money = (cents: number) => (Number(cents || 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateTime = (value: string | null) => value ? new Date(value).toLocaleString("pt-BR") : "Nunca registrado";

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<AdminPayment[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [trend, setTrend] = useState<AdminTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  async function loadDashboard() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/users", { credentials: "include", cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar o painel.");
      setUsers(data.users || []); setStats(data.stats || null);
      setRecentPayments(data.recentPayments || []); setPlans(data.plans || []); setTrend(data.trend || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void loadDashboard(); }, []);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [user.name, user.email].some((value) => value?.toLowerCase().includes(term));
    const premium = user.planName === "Premium" && user.subscriptionStatus === "active" && !!user.currentPeriodEnd && new Date(user.currentPeriodEnd) > new Date();
    const matchesFilter = filter === "all" || (filter === "premium" && premium) || (filter === "free" && !premium) || (filter === "blocked" && user.banned);
    return matchesSearch && matchesFilter;
  }), [users, search, filter]);

  async function userAction(user: AdminUser, action: "activate" | "cancel" | "ban" | "unban") {
    const questions = {
      activate: `Confirma que recebeu R$ 9,90 via Pix de ${user.email} e deseja liberar 30 dias de Premium?`,
      cancel: `Deseja cancelar o Premium de ${user.email}?`,
      ban: `Deseja bloquear o acesso de ${user.email} ao ScorpionAI?`,
      unban: `Deseja desbloquear o acesso de ${user.email}?`,
    };
    if (!window.confirm(questions[action])) return;
    setBusyId(user.id); setNotice(""); setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar.");
      setNotice(data.message || "Atualizado com sucesso."); await loadDashboard();
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao atualizar cliente."); }
    finally { setBusyId(""); }
  }

  async function updatePlan(plan: AdminPlan, field: "priceCents" | "dailyMessages" | "active", value: number | boolean) {
    const label = field === "priceCents" ? "preço" : field === "dailyMessages" ? "limite diário de mensagens" : "status do plano";
    if (!window.confirm(`Confirma alterar ${label} do plano ${plan.name}?`)) return;
    setBusyId(plan.id); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updatePlan", planId: plan.id, field, value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar o plano.");
      setNotice(data.message || "Plano atualizado."); await loadDashboard();
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao atualizar plano."); }
    finally { setBusyId(""); }
  }

  const chartMax = Math.max(1, ...trend.map((d) => d.sessions));
  const revenueMax = Math.max(1, ...trend.map((d) => d.revenueCents));
  const nav = [
    ["visao-geral", "📊 Visão geral"], ["clientes", "👥 Clientes"], ["acessos", "📈 Gráficos e acessos"], ["uso-detalhado", "📊 Indicadores de uso"],
    ["financeiro", "💰 Financeiro"], ["planos", "💳 Planos e preços"],
  ];
  const card = (label: string, value: string | number, detail?: string) => (
    <article className="rounded-xl border border-gray-800 bg-[#141720] p-4">
      <p className="text-xs text-gray-400">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
    </article>
  );

  return (
    <main className="min-h-screen bg-[#0a0c10] text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-60 shrink-0">
            <div className="lg:sticky lg:top-5 rounded-2xl border border-gray-800 bg-[#11141c] p-4 space-y-2">
              <a href="/" className="text-sm text-red-400 hover:text-red-300">← Voltar ao ScorpionAI</a>
              <div className="pt-3 pb-2"><p className="text-xs uppercase tracking-widest text-red-400 font-bold">ScorpionAI</p><h1 className="text-xl font-bold text-white">Administração</h1></div>
              {nav.map(([id, label]) => <a key={id} href={`#${id}`} className="block rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-red-500/10 hover:text-white">{label}</a>)}
              <a href="/pricing" className="block rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-red-500/10">🌐 Página pública de planos</a>
              <a href="/support" className="block rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-red-500/10">📩 Suporte</a>
              <button onClick={loadDashboard} className="w-full mt-2 rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800">↻ Atualizar painel</button>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-8">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-2xl sm:text-3xl font-bold text-white">Central de controle</h2><p className="text-sm text-gray-400 mt-1">Clientes, atividade, assinaturas e recebimentos em um só lugar.</p></div>
              <span className="rounded-full border border-emerald-700/50 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-300">Acesso administrativo</span>
            </header>
            {notice && <p className="rounded-lg bg-emerald-900/30 border border-emerald-700 p-3 text-emerald-300">{notice}</p>}
            {error && <p className="rounded-lg bg-red-900/30 border border-red-700 p-3 text-red-300">{error}</p>}
            {loading && <p className="text-gray-400">Atualizando dados...</p>}

            <section id="visao-geral" className="scroll-mt-5 space-y-3">
              <h3 className="text-lg font-semibold text-white">📊 Visão geral do negócio</h3>
              {stats && <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {card("Total de clientes", stats.totalUsers, `+${stats.signupsToday} hoje · +${stats.signups7d} em 7 dias`)}
                {card("Premium ativo", stats.activePremium)}
                {card("Receita confirmada", money(stats.confirmedAmountCents), `${stats.confirmedPayments} pagamentos confirmados`)}
                {card("Visitantes únicos hoje", stats.uniqueVisitorsToday, `${stats.sessionsToday} sessões hoje`)}
              </div>}
            </section>

            <section id="acessos" className="scroll-mt-5 space-y-3">
              <h3 className="text-lg font-semibold text-white">📈 Desempenho dos últimos 7 dias</h3>
              <div className="grid xl:grid-cols-2 gap-3">
                <article className="rounded-xl border border-gray-800 bg-[#141720] p-4">
                  <div className="flex items-center justify-between gap-2 mb-4"><h4 className="font-semibold text-white">Atividade diária</h4><span className="text-xs text-gray-500">Sessões · mensagens · cadastros</span></div>
                  <div className="flex items-end justify-between gap-2 h-44 border-b border-gray-700 px-1">
                    {trend.map((d) => <div key={d.day} className="flex-1 h-full flex flex-col justify-end items-center gap-1 min-w-0">
                      <div className="w-full flex items-end justify-center gap-0.5 h-32">
                        <div title={`Sessões: ${d.sessions}`} className="w-1/3 max-w-5 rounded-t bg-red-500" style={{height: `${Math.max(2, d.sessions / chartMax * 100)}%`}} />
                        <div title={`Mensagens: ${d.messages}`} className="w-1/3 max-w-5 rounded-t bg-sky-500" style={{height: `${Math.max(2, d.messages / Math.max(1, ...trend.map(x => x.messages)) * 100)}%`}} />
                        <div title={`Cadastros: ${d.signups}`} className="w-1/3 max-w-5 rounded-t bg-emerald-500" style={{height: `${Math.max(2, d.signups / Math.max(1, ...trend.map(x => x.signups)) * 100)}%`}} />
                      </div>
                      <span className="text-[10px] text-gray-500">{new Date(`${d.day}T12:00:00`).toLocaleDateString("pt-BR", {day:"2-digit",month:"2-digit"})}</span>
                    </div>)}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400"><span><i className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"/>Sessões</span><span><i className="inline-block w-2 h-2 rounded-full bg-sky-500 mr-1"/>Mensagens</span><span><i className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"/>Cadastros</span></div>
                </article>
                <article className="rounded-xl border border-gray-800 bg-[#141720] p-4">
                  <div className="flex items-center justify-between gap-2 mb-4"><h4 className="font-semibold text-white">Receita confirmada por dia</h4><span className="text-xs text-gray-500">Pix confirmado manualmente</span></div>
                  <div className="flex items-end justify-between gap-2 h-44 border-b border-gray-700 px-1">
                    {trend.map((d) => <div key={d.day} className="flex-1 h-full flex flex-col justify-end items-center gap-1 min-w-0">
                      <div className="w-full flex items-end justify-center h-32"><div title={money(d.revenueCents)} className="w-3/5 max-w-8 rounded-t bg-amber-400" style={{height: `${Math.max(2, d.revenueCents / revenueMax * 100)}%`}} /></div>
                      <span className="text-[10px] text-gray-500">{new Date(`${d.day}T12:00:00`).toLocaleDateString("pt-BR", {day:"2-digit",month:"2-digit"})}</span>
                    </div>)}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Os gráficos usam registros reais do banco. Dias sem movimento aparecem zerados.</p>
                </article>
              </div>
            </section>

            <section id="clientes" className="scroll-mt-5 space-y-3">
              <div><h3 className="text-lg font-semibold text-white">👥 Clientes e contas</h3><p className="text-xs text-gray-500">Até 500 contas. Pesquise, confira o plano e gerencie o acesso.</p></div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou e-mail..." className="flex-1 rounded-lg bg-[#141720] border border-gray-700 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg bg-[#141720] border border-gray-700 px-3 py-2 text-sm text-white">
                  <option value="all">Todos os clientes</option><option value="premium">Premium ativo</option><option value="free">Plano gratuito</option><option value="blocked">Bloqueados</option>
                </select>
              </div>
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const premium = user.planName === "Premium" && user.subscriptionStatus === "active" && !!user.currentPeriodEnd && new Date(user.currentPeriodEnd) > new Date();
                  return <article key={user.id} className="rounded-xl border border-gray-800 bg-[#141720] p-4">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-white break-words">{user.name || "Sem nome"} {user.banned && <span className="text-xs text-red-400">· BLOQUEADO</span>}</p>
                        <p className="text-sm text-gray-400 break-all">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-2">Cadastro: {dateTime(user.createdAt)} · Último acesso: {dateTime(user.lastAccess)}</p>
                        <p className="text-xs text-gray-500">Plano: {premium ? `Premium até ${new Date(user.currentPeriodEnd as string).toLocaleDateString("pt-BR")}` : "Gratuito"} · Sessões: {user.sessionCount} · Mensagens (30 dias): {user.messages30d}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!premium && !user.banned && <button disabled={busyId === user.id} onClick={() => userAction(user, "activate")} className="rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 px-3 py-2 text-xs font-semibold text-white">Liberar Premium 30d</button>}
                        {premium && <button disabled={busyId === user.id} onClick={() => userAction(user, "cancel")} className="rounded-lg border border-amber-700 text-amber-300 px-3 py-2 text-xs hover:bg-amber-900/20">Cancelar Premium</button>}
                        {user.banned ? <button disabled={busyId === user.id} onClick={() => userAction(user, "unban")} className="rounded-lg border border-emerald-700 text-emerald-300 px-3 py-2 text-xs">Desbloquear</button> : <button disabled={busyId === user.id} onClick={() => userAction(user, "ban")} className="rounded-lg border border-red-900 text-red-300 px-3 py-2 text-xs hover:bg-red-900/20">Bloquear acesso</button>}
                      </div>
                    </div>
                  </article>;
                })}
                {!loading && filteredUsers.length === 0 && <p className="text-sm text-gray-500">Nenhum cliente encontrado para esse filtro.</p>}
              </div>
            </section>

            <section id="uso-detalhado" className="scroll-mt-5 space-y-3">
              <h3 className="text-lg font-semibold text-white">📊 Indicadores de utilização</h3>
              {stats && <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {card("Sessões hoje", stats.sessionsToday)}
                {card("Clientes únicos hoje", stats.uniqueVisitorsToday)}
                {card("Sessões nos últimos 7 dias", stats.sessions7d)}
                {card("Mensagens enviadas hoje", stats.messagesToday)}
                {card("Conversas totais", stats.totalConversations)}
                {card("Conversas criadas hoje", stats.conversationsToday)}
                {card("Tokens usados (30 dias)", Number(stats.tokens30d || 0).toLocaleString("pt-BR"))}
              </div>}
              <p className="text-xs text-gray-500">Acessos são contabilizados por sessões autenticadas registradas. Não representam visualizações anônimas de páginas.</p>
            </section>

            <section id="financeiro" className="scroll-mt-5 space-y-3">
              <h3 className="text-lg font-semibold text-white">💰 Financeiro e pagamentos</h3>
              {stats && <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {card("Total recebido confirmado", money(stats.confirmedAmountCents))}
                {card("Pagamentos confirmados", stats.confirmedPayments)}
                {card("Pagamentos pendentes/outros", stats.otherPayments)}
              </div>}
              <div className="rounded-xl border border-gray-800 bg-[#141720] p-4 space-y-3">
                <h4 className="font-semibold text-white">Últimos 25 pagamentos</h4>
                {recentPayments.length === 0 ? <p className="text-sm text-gray-400">Nenhum pagamento registrado ainda.</p> : recentPayments.map((payment) => <div key={payment.id} className="flex flex-col sm:flex-row sm:justify-between gap-1 border-t border-gray-800 pt-3 text-sm">
                  <div><p className="text-white">{payment.userName || "Cliente"} · {payment.userEmail || "sem e-mail"}</p><p className="text-xs text-gray-500">{payment.planName || "Plano"} · {dateTime(payment.createdAt)}</p></div>
                  <div className="sm:text-right"><p className="font-semibold text-white">{money(payment.amountCents)}</p><p className={payment.status === "confirmed_manual" ? "text-xs text-emerald-400" : "text-xs text-amber-300"}>{payment.status === "confirmed_manual" ? "Confirmado manualmente" : payment.status}</p></div>
                </div>)}
              </div>
              <p className="text-xs text-amber-300">A confirmação do Pix continua manual: confira o crédito no banco antes de liberar o Premium. Este painel não consulta sua conta bancária.</p>
            </section>

            <section id="planos" className="scroll-mt-5 space-y-3">
              <h3 className="text-lg font-semibold text-white">💳 Planos e preços</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {plans.map((plan) => <article key={plan.id} className="rounded-xl border border-gray-800 bg-[#141720] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2"><h4 className="font-semibold text-white">{plan.name}</h4><span className={plan.active ? "text-xs text-emerald-400" : "text-xs text-red-400"}>{plan.active ? "Publicado" : "Desativado"}</span></div>
                  <p className="text-2xl font-bold text-white">{money(plan.priceCents)}</p>
                  <p className="text-xs text-gray-400">{plan.description || "Plano do ScorpionAI"} · {plan.dailyMessages} mensagens/dia</p>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={busyId === plan.id} onClick={() => { const value = window.prompt("Novo preço em reais (ex.: 9,90):", (plan.priceCents / 100).toFixed(2).replace(".", ",")); if (value !== null) { const parsed = Number(value.replace(",", ".")); if (Number.isFinite(parsed) && parsed >= 0) void updatePlan(plan, "priceCents", Math.round(parsed * 100)); else window.alert("Informe um preço válido."); } }} className="rounded-lg border border-gray-700 px-3 py-2 text-xs hover:bg-gray-800">Alterar preço</button>
                    <button disabled={busyId === plan.id} onClick={() => { const value = window.prompt("Novo limite diário de mensagens:", String(plan.dailyMessages)); if (value !== null) { const parsed = Number(value); if (Number.isInteger(parsed) && parsed >= 0) void updatePlan(plan, "dailyMessages", parsed); else window.alert("Informe um número inteiro válido."); } }} className="rounded-lg border border-gray-700 px-3 py-2 text-xs hover:bg-gray-800">Limite de mensagens</button>
                    <button disabled={busyId === plan.id} onClick={() => void updatePlan(plan, "active", !plan.active)} className="rounded-lg border border-gray-700 px-3 py-2 text-xs hover:bg-gray-800">{plan.active ? "Desativar plano" : "Ativar plano"}</button>
                  </div>
                </article>)}
              </div>
              <p className="text-xs text-gray-500">Alterações de preço e limites afetam as regras do plano no sistema. Confira antes de confirmar.</p>
            </section>
            <footer className="border-t border-gray-800 pt-4 text-xs text-gray-500">Painel restrito a contas com função administrativa validada no servidor. Dados atualizados ao abrir ou usar “Atualizar painel”.</footer>
          </div>
        </div>
      </div>
    </main>
  );
}
