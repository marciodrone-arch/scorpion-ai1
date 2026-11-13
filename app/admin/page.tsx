"use client";

import { useEffect, useState } from "react";

type AdminStats = {
  totalUsers: number;
  activePremium: number;
  confirmedPayments: number;
  confirmedAmountCents: number;
  otherPayments: number;
};

type AdminPayment = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  planName: string | null;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  planName: string | null;
};

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", { credentials: "include", cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar.");
      setUsers(data.users || []);
      setStats(data.stats || null);
      setRecentPayments(data.recentPayments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function updateSubscription(user: AdminUser, action: "activate" | "cancel") {
    const question = action === "activate"
      ? `Confirma que recebeu R$ 9,90 via Pix de ${user.email} e deseja liberar 30 dias de Premium?`
      : `Deseja cancelar o Premium de ${user.email}?`;
    if (!window.confirm(question)) return;

    setBusyId(user.id);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar.");
      setNotice(data.message || "Atualizado com sucesso.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar assinatura.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0c10] text-gray-200 px-4 py-8 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <a href="/" className="text-red-400 hover:text-red-300">← Voltar ao ScorpionAI</a>
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Painel administrativo</h1>
            <p className="text-sm text-gray-400 mt-1">Confira o Pix recebido antes de liberar o Premium.</p>
          </div>
          <button onClick={loadUsers} className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800">Atualizar lista</button>
        </header>

        {stats && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["Usuários", stats.totalUsers],
              ["Premium ativo", stats.activePremium],
              ["Pagamentos confirmados", stats.confirmedPayments],
              ["Total confirmado", (stats.confirmedAmountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })],
            ].map(([label, value]) => (
              <article key={String(label)} className="rounded-xl border border-gray-800 bg-[#141720] p-4">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{value}</p>
              </article>
            ))}
          </section>
        )}

        {stats && stats.otherPayments > 0 && (
          <p className="text-xs text-gray-400">
            Existem {stats.otherPayments} pagamento(s) com status diferente de confirmado, cancelado ou falhou.
          </p>
        )}

        <section className="rounded-xl border border-gray-800 bg-[#141720] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">Pagamentos recentes</h2>
            <span className="text-xs text-gray-500">Últimos 10 registros</span>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum pagamento registrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-t border-gray-800 pt-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-white break-words">{payment.userName || "Usuário"} · {payment.userEmail || "sem e-mail"}</p>
                    <p className="text-xs text-gray-500">{payment.planName || "Plano"} · {new Date(payment.createdAt).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-semibold text-white">{(payment.amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                    <p className={payment.status === "confirmed_manual" ? "text-xs text-emerald-400" : "text-xs text-amber-300"}>
                      {payment.status === "confirmed_manual" ? "Confirmado manualmente" : payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          A ativação é manual. Só clique em “Ativar 30 dias” depois de confirmar o recebimento de R$ 9,90 no banco.
        </div>

        {notice && <p className="rounded-lg bg-emerald-900/30 border border-emerald-700 p-3 text-emerald-300">{notice}</p>}
        {error && <p className="rounded-lg bg-red-900/30 border border-red-700 p-3 text-red-300">{error}</p>}

        {loading ? (
          <p className="text-gray-400">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-400">Nenhum usuário cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const premiumActive = user.planName === "Premium" && user.subscriptionStatus === "active" && user.currentPeriodEnd && new Date(user.currentPeriodEnd) > new Date();
              return (
                <article key={user.id} className="rounded-xl border border-gray-800 bg-[#141720] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-white break-words">{user.name}</p>
                    <p className="text-sm text-gray-400 break-all">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {premiumActive
                        ? `Premium até ${new Date(user.currentPeriodEnd as string).toLocaleDateString("pt-BR")}`
                        : "Plano gratuito"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      disabled={busyId === user.id}
                      onClick={() => updateSubscription(user, "activate")}
                      className="rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {busyId === user.id ? "Aguarde..." : "Ativar 30 dias"}
                    </button>
                    {premiumActive && (
                      <button
                        disabled={busyId === user.id}
                        onClick={() => updateSubscription(user, "cancel")}
                        className="rounded-lg border border-gray-600 px-4 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="text-xs text-gray-500">Exibindo até 200 contas. O acesso a este painel é validado no servidor pela função de administrador.</p>
      </div>
    </main>
  );
}
