import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Manual Operacional Express | 20 modelos práticos para usar IA',
  description: 'Manual digital com 20 modelos detalhados e 8 comandos rápidos para atendimento, organização e comunicação comercial com inteligência artificial.',
  alternates: { canonical: 'https://scorpion-ai1.vercel.app/manual-operacional-express' },
  openGraph: {
    title: 'Manual Operacional Express',
    description: '20 modelos práticos + 8 comandos rápidos para trabalhar melhor com IA.',
    url: 'https://scorpion-ai1.vercel.app/manual-operacional-express',
    type: 'website',
  },
};

const checkoutUrl = process.env.NEXT_PUBLIC_MANUAL_CHECKOUT_URL;

const modules = [
  { number: '01', title: 'Atendimento profissional', description: 'Responda com clareza, cordialidade e consistência.', examples: ['Dúvidas de clientes', 'Reclamações e solicitações', 'Confirmações e próximos passos'] },
  { number: '02', title: 'Organização de demandas', description: 'Transforme informações soltas em ações bem definidas.', examples: ['Tarefas e prioridades', 'Checklists operacionais', 'Resumos de reuniões'] },
  { number: '03', title: 'Comunicação comercial', description: 'Prepare mensagens e propostas sem começar do zero.', examples: ['Apresentação de produtos', 'Propostas e orçamentos', 'Acompanhamento de oportunidades'] },
];

const samplePrompts = [
  { title: 'Responder um cliente', text: 'Reescreva a resposta abaixo com linguagem cordial, objetiva e profissional. Não invente prazos, preços ou condições. Se faltar informação, indique o que precisa ser confirmado. Mensagem: [cole aqui].' },
  { title: 'Organizar uma demanda', text: 'Transforme as informações em objetivo, tarefas, prioridade, prazo mencionado e dúvidas em aberto. Não invente dados. Informações: [cole aqui].' },
  { title: 'Preparar um orçamento', text: 'Organize os dados em uma proposta clara, com escopo, itens incluídos, preço e prazo informados. Não crie valores ou condições. Dados: [cole aqui].' },
];

function CheckIcon() {
  return <span aria-hidden="true" className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-xs font-black text-cyan-200">✓</span>;
}

export default function ManualOperacionalExpressPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070b14] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070b14]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="Voltar ao ScorpionAI">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-xs font-black tracking-tight text-cyan-200 shadow-lg shadow-cyan-950/30">ME</span>
            <span className="text-sm font-bold tracking-tight text-white sm:text-base">Manual Operacional <span className="text-cyan-300">Express</span></span>
          </Link>
          <a href="#oferta" className="rounded-full bg-cyan-300 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-200 sm:text-sm">Ver o manual <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section className="relative isolate border-b border-white/[0.08]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse at 18% 10%, rgba(8,145,178,.20), transparent 38%), radial-gradient(ellipse at 82% 28%, rgba(59,130,246,.14), transparent 35%), linear-gradient(180deg, #0a1422 0%, #070b14 100%)' }} />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.08fr_.92fr] lg:gap-10 lg:py-28">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/[0.07] px-4 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-100 sm:text-xs"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.9)]" /> Guia digital prático · Português</span>
            <h1 className="mt-7 max-w-3xl text-[2.65rem] font-black leading-[1.04] tracking-[-.045em] text-white sm:text-6xl lg:text-[4.2rem]">Use IA com mais <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-400 bg-clip-text text-transparent">clareza e método.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Pare de improvisar cada comando. Tenha modelos prontos para responder clientes, organizar tarefas e preparar textos comerciais — basta adaptar os campos à sua realidade.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#oferta" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-7 py-4 text-sm font-extrabold text-slate-950 shadow-xl shadow-cyan-950/40 transition hover:-translate-y-1 hover:bg-cyan-200">Quero conhecer o manual <span aria-hidden="true">→</span></a>
              <a href="#amostra" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-7 py-4 text-sm font-bold text-white transition hover:border-cyan-200/40 hover:bg-white/[0.07]">Ver exemplos gratuitos</a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-2"><CheckIcon /> Sem programação</span>
              <span className="flex items-center gap-2"><CheckIcon /> Modelos editáveis</span>
              <span className="flex items-center gap-2"><CheckIcon /> Acesso em PDF</span>
            </div>
            <p className="mt-6 max-w-lg text-[11px] leading-5 text-slate-500">Material de apoio. A IA pode cometer erros; revise informações importantes antes de utilizá-las.</p>
          </div>

          <div className="relative mx-auto w-full max-w-[470px]">
            <div aria-hidden="true" className="absolute -inset-8 rounded-[3rem] bg-cyan-400/10 blur-3xl" />
            <div className="relative rotate-[1.5deg] rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/[0.13] to-white/[0.025] p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <div className="rounded-[1.45rem] border border-white/10 bg-[#0a1422] p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-cyan-200">Edição 1.0</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">ScorpionAI</span>
                </div>
                <div className="mt-10 flex h-44 items-end overflow-hidden rounded-2xl border border-cyan-200/15 bg-[radial-gradient(ellipse_at_80%_10%,rgba(34,211,238,.3),transparent_50%),linear-gradient(145deg,#10253a,#09111e_70%)] p-6 sm:h-52">
                  <div>
                    <div className="mb-3 h-1 w-12 rounded-full bg-cyan-300" />
                    <p className="text-xs font-bold uppercase tracking-[.24em] text-cyan-100/80">Manual prático</p>
                    <p className="mt-2 max-w-xs text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">Operacional<br/>Express<span className="text-cyan-300">.</span></p>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-6 text-slate-300">Modelos prontos para atendimento, organização e comunicação comercial com inteligência artificial.</p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[.04] p-4"><p className="text-2xl font-black text-white">20</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">Modelos detalhados</p></div>
                  <div className="rounded-xl border border-white/10 bg-white/[.04] p-4"><p className="text-2xl font-black text-white">08</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">Comandos rápidos</p></div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-xs text-slate-500">Arquivo digital · PDF</span>
                  <span className="text-xs font-bold tracking-wide text-cyan-200">PRÁTICO • DIRETO</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 rounded-2xl border border-cyan-200/20 bg-[#102033]/95 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur-xl sm:-left-8"><p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">Feito para aplicar</p><p className="mt-1 text-sm font-bold text-white">Copie · Adapte · Utilize</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-[10px] font-black uppercase tracking-[.24em] text-cyan-300">Conteúdo do material</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Três áreas. Um material objetivo.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">Estruturas reutilizáveis para situações comuns de trabalho, sem exigir conhecimento técnico.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {modules.map((module) => (
            <article key={module.number} className="group rounded-2xl border border-white/[.09] bg-gradient-to-b from-white/[.055] to-white/[.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-200/30 hover:shadow-xl hover:shadow-cyan-950/20 sm:p-7">
              <div className="flex items-center justify-between"><span className="text-xs font-black tracking-[.2em] text-cyan-300">MÓDULO {module.number}</span><span className="text-xl text-slate-600 transition group-hover:text-cyan-300">↗</span></div>
              <h3 className="mt-6 text-xl font-extrabold text-white">{module.title}</h3>
              <p className="mt-3 min-h-[52px] text-sm leading-6 text-slate-400">{module.description}</p>
              <ul className="mt-6 space-y-3 border-t border-white/[.08] pt-5">{module.examples.map((example) => <li key={example} className="flex gap-2.5 text-sm text-slate-300"><CheckIcon />{example}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section id="amostra" className="border-y border-white/[.08] bg-[#0a1321] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-[10px] font-black uppercase tracking-[.24em] text-cyan-300">Amostra gratuita</p><h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Veja como os modelos funcionam.</h2></div>
            <p className="max-w-md text-sm leading-6 text-slate-400">Estes são exemplos de demonstração. No manual, você encontra mais estruturas para adaptar e reutilizar.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {samplePrompts.map((sample, index) => (
              <article key={sample.title} className="rounded-2xl border border-white/10 bg-[#070d17] p-5 sm:p-6">
                <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-xs font-black text-cyan-200">0{index + 1}</span><h3 className="font-bold text-white">{sample.title}</h3></div>
                <p className="mt-5 rounded-xl border border-white/[.06] bg-white/[.035] p-4 text-sm leading-7 text-slate-300">{sample.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[.045] p-7">
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-emerald-200">Indicado para</p>
          <h2 className="mt-3 text-2xl font-black text-white">Quem quer trabalhar com mais organização.</h2>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
            <li className="flex gap-3"><CheckIcon /> Autônomos e prestadores de serviço.</li>
            <li className="flex gap-3"><CheckIcon /> Pequenos negócios e equipes enxutas.</li>
            <li className="flex gap-3"><CheckIcon /> Pessoas que usam IA para escrever e organizar.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[.04] p-7">
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Transparência</p>
          <h2 className="mt-3 text-2xl font-black text-white">O que você precisa saber.</h2>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-300">
            <li>• É um guia digital em PDF, não um software.</li>
            <li>• Não executa ações automaticamente em outros sistemas.</li>
            <li>• Não garante vendas, lucro ou resultados específicos.</li>
            <li>• Revise respostas da IA antes de utilizá-las.</li>
          </ul>
        </div>
      </section>

      <section id="oferta" className="relative px-5 pb-20 sm:px-8 sm:pb-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-cyan-950/20 to-transparent" />
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-[#0c1a2a] p-7 shadow-2xl shadow-cyan-950/25 sm:p-12">
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.24em] text-cyan-200">Acesso digital · Pagamento único</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Manual Operacional Express</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">Receba 20 modelos detalhados e 8 comandos rápidos para adaptar no seu dia a dia. Arquivo digital em PDF.</p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400"><span className="rounded-full border border-white/10 px-3 py-1.5">20 modelos</span><span className="rounded-full border border-white/10 px-3 py-1.5">8 comandos rápidos</span><span className="rounded-full border border-white/10 px-3 py-1.5">PDF em português</span></div>
            </div>
            <div className="relative min-w-[210px] rounded-2xl border border-white/10 bg-white/[.045] p-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Preço de lançamento</p>
              <p className="mt-3 text-4xl font-black tracking-tight text-white">R$ 29,90</p>
              <p className="mt-1 text-xs text-slate-400">pagamento único</p>
              {checkoutUrl ? <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-cyan-300 px-5 py-4 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200">Comprar com segurança ↗</a> : <div className="mt-6 rounded-xl border border-amber-200/20 bg-amber-200/[.07] p-3 text-left"><p className="text-xs font-bold text-amber-100">Compra ainda não ativada</p><p className="mt-1 text-[11px] leading-5 text-slate-300">O checkout seguro será conectado antes de liberar as compras.</p></div>}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[.08] px-5 py-9 text-center sm:px-8">
        <p className="text-sm font-bold text-slate-300">Manual Operacional <span className="text-cyan-300">Express</span></p>
        <p className="mt-2 text-xs text-slate-500">Material informativo e educacional. © {new Date().getFullYear()}.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-slate-500"><Link href="/privacy" className="transition hover:text-cyan-200">Privacidade</Link><Link href="/terms" className="transition hover:text-cyan-200">Termos</Link><Link href="/" className="transition hover:text-cyan-200">ScorpionAI</Link></div>
      </footer>
    </main>
  );
}
