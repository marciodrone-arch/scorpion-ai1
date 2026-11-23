'use client';

import { useState } from 'react';
import Link from 'next/link';

const modules = [
  {
    number: '01',
    title: 'Atendimento profissional',
    description: 'Respostas claras para dúvidas, reclamações, prazos, orçamentos e acompanhamento de clientes.',
    items: ['Primeiro contato e qualificação', 'Respostas a dúvidas frequentes', 'Tratamento de objeções e reclamações'],
  },
  {
    number: '02',
    title: 'Organização de demandas',
    description: 'Transforme mensagens soltas em tarefas objetivas, prioridades e próximos passos.',
    items: ['Checklist a partir de uma conversa', 'Priorização por urgência e impacto', 'Resumo de reuniões e pendências'],
  },
  {
    number: '03',
    title: 'Textos comerciais',
    description: 'Estruture propostas, apresentações e mensagens comerciais sem começar do zero.',
    items: ['Propostas e orçamentos', 'Descrições de serviços', 'Follow-up respeitoso e profissional'],
  },
];

const promptExamples = [
  {
    title: 'Responder um cliente com clareza',
    prompt: 'Atue como assistente de atendimento. Reescreva a resposta abaixo com linguagem cordial, objetiva e profissional. Não invente prazos, preços ou condições. Se faltar alguma informação, indique o que preciso confirmar. Mensagem: [cole aqui].',
  },
  {
    title: 'Organizar uma demanda',
    prompt: 'Transforme as informações abaixo em: objetivo, tarefas, prioridade, responsável, prazo mencionado e dúvidas que precisam ser esclarecidas. Não invente dados. Informações: [cole aqui].',
  },
  {
    title: 'Preparar um orçamento',
    prompt: 'Organize os dados abaixo em uma proposta comercial clara, com escopo, itens incluídos, itens não incluídos, preço informado, prazo informado e validade. Não crie valores nem condições que não foram fornecidos. Dados: [cole aqui].',
  },
];

export default function ManualOperacionalExpressPage() {
  const [copied, setCopied] = useState<number | null>(null);
  const checkoutUrl = process.env.NEXT_PUBLIC_MANUAL_CHECKOUT_URL;

  async function copyPrompt(index: number) {
    try {
      await navigator.clipboard.writeText(promptExamples[index].prompt);
      setCopied(index);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#070d18] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070d18]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3" aria-label="Voltar ao ScorpionAI">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-sm font-black text-cyan-300">ME</span>
            <span className="text-sm font-bold tracking-tight text-white sm:text-base">Manual Operacional <span className="text-cyan-300">Express</span></span>
          </Link>
          <a href="#oferta" className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-200">Ver acesso</a>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(34,211,238,.18), transparent 55%)' }} />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.18em] text-cyan-200">Material prático • Em português • Sem programação</span>
          <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl">Pare de começar do zero toda vez que usar IA.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">Use modelos prontos para responder clientes, organizar demandas e preparar textos comerciais com mais clareza — adaptando cada resposta à sua realidade.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#oferta" className="w-full rounded-xl bg-cyan-300 px-7 py-4 text-center font-extrabold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:-translate-y-0.5 hover:bg-cyan-200 sm:w-auto">Conhecer o material</a>
            <a href="#exemplos" className="w-full rounded-xl border border-white/15 px-7 py-4 text-center font-semibold text-white transition hover:border-cyan-300/50 hover:bg-white/5 sm:w-auto">Ver exemplos gratuitos</a>
          </div>
          <p className="mt-5 text-xs text-slate-500">Ferramentas de apoio. Não prometemos aumento de renda nem resultados comerciais garantidos.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Conteúdo organizado por rotina</p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Menos improviso. Mais clareza no trabalho.</h2>
          <p className="mt-4 leading-7 text-slate-400">O material foi pensado para profissionais autônomos, pequenos negócios e pessoas que já utilizam IA e querem instruções mais consistentes.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {modules.map((module) => (
            <article key={module.number} className="rounded-2xl border border-white/10 bg-white/[.035] p-6 transition hover:border-cyan-300/30">
              <span className="text-xs font-black tracking-[.2em] text-cyan-300">{module.number} / MÓDULO</span>
              <h3 className="mt-4 text-xl font-bold text-white">{module.title}</h3>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">{module.description}</p>
              <ul className="mt-5 space-y-3">
                {module.items.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-300"><span className="text-cyan-300">✓</span>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="exemplos" className="border-y border-white/10 bg-[#0b1423] px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-9 text-center">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Experimente agora</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white">Exemplos gratuitos para copiar</h2>
            <p className="mt-3 text-sm text-slate-400">Use em uma ferramenta de IA de sua preferência e substitua o texto entre colchetes.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {promptExamples.map((example, index) => (
              <article key={example.title} className="flex flex-col rounded-2xl border border-white/10 bg-[#070d18] p-5">
                <h3 className="font-bold text-white">{example.title}</h3>
                <p className="mt-4 flex-1 rounded-xl bg-white/[.04] p-4 text-sm leading-6 text-slate-300">{example.prompt}</p>
                <button onClick={() => copyPrompt(index)} className="mt-4 rounded-lg border border-cyan-300/30 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/10">{copied === index ? 'Copiado!' : 'Copiar modelo'}</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Para quem é</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white">Feito para rotinas que dependem de comunicação.</h2>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
              <li>✓ Autônomos e prestadores de serviço que respondem clientes diariamente.</li>
              <li>✓ Pequenos negócios que precisam padronizar mensagens e propostas.</li>
              <li>✓ Profissionais que querem organizar informações antes de agir.</li>
              <li>✓ Pessoas que usam IA e desejam instruções reutilizáveis.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-6">
            <h3 className="text-lg font-bold text-amber-200">O que este material não faz</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>• Não substitui a revisão humana de informações importantes.</li>
              <li>• Não executa tarefas automaticamente dentro de outros sistemas.</li>
              <li>• Não garante vendas, economia de tempo específica ou aumento de renda.</li>
              <li>• Não inclui acesso pago a ferramentas de terceiros.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="oferta" className="px-5 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-cyan-300/25 bg-gradient-to-b from-cyan-300/[.10] to-white/[.025] p-7 text-center shadow-2xl shadow-cyan-950/20 sm:p-11">
          <span className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">Acesso digital</span>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Manual Operacional Express</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">Modelos e estruturas para adaptar ao seu atendimento, à sua organização e à sua comunicação comercial.</p>
          <div className="mt-7"><span className="text-4xl font-black text-white">R$ 29,90</span><span className="ml-2 text-sm text-slate-400">pagamento único</span></div>
          {checkoutUrl ? (
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-cyan-300 px-8 py-4 font-extrabold text-slate-950 transition hover:bg-cyan-200 sm:w-auto">Acessar pagamento seguro</a>
          ) : (
            <div className="mt-7 rounded-xl border border-amber-300/25 bg-amber-300/[.07] px-5 py-4 text-left">
              <p className="font-bold text-amber-200">Checkout ainda não conectado</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">A página está preparada, mas a compra só poderá ser ativada depois de configurar um link de pagamento real e a entrega do material. Não faça pagamentos por esta página enquanto esse aviso estiver visível.</p>
            </div>
          )}
          <p className="mt-5 text-xs leading-5 text-slate-500">Pagamento e entrega dependem da configuração do checkout. Consulte os termos e a política de privacidade antes da compra.</p>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-slate-500">
        <p>Manual Operacional Express · Conteúdo informativo e educacional.</p>
        <p className="mt-2">© {new Date().getFullYear()} · Todos os direitos reservados.</p>
        <Link href="/" className="mt-3 inline-block text-cyan-300 hover:text-cyan-200">Conheça o ScorpionAI</Link>
      </footer>
    </main>
  );
}
