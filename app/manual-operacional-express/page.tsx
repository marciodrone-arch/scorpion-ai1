import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Manual Operacional Express | Modelos práticos com IA',
  description: 'Modelos práticos em português para atendimento, organização de tarefas e comunicação comercial com inteligência artificial.',
  alternates: { canonical: 'https://scorpion-ai1.vercel.app/manual-operacional-express' },
};

const items = [
  { title: 'Atendimento e mensagens', text: 'Modelos para responder dúvidas, lidar com reclamações, solicitar informações e confirmar próximos passos.' },
  { title: 'Organização e execução', text: 'Comandos para transformar demandas em tarefas, priorizar rotinas, criar checklists e resumir reuniões.' },
  { title: 'Comunicação comercial', text: 'Estruturas para apresentar produtos, elaborar propostas, responder objeções e acompanhar oportunidades.' },
];

const checkoutUrl = process.env.NEXT_PUBLIC_MANUAL_CHECKOUT_URL;

export default function ManualOperacionalExpressPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="font-bold tracking-tight text-white">ScorpionAI <span className="text-cyan-400">/</span> Produtos</Link>
          <a href="#oferta" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300">Ver oferta</a>
        </div>
      </header>

      <section className="border-b border-slate-800 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/60 via-slate-950 to-slate-950 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-cyan-200">GUIA DIGITAL • PORTUGUÊS • EDIÇÃO 1.0</span>
          <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">Menos tempo escrevendo. Mais clareza na rotina.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">Um manual direto ao ponto com modelos e comandos prontos para adaptar no atendimento, na organização de tarefas e na comunicação comercial usando IA.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#oferta" className="w-full rounded-xl bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto">Conhecer o manual</a>
            <a href="#conteudo" className="w-full rounded-xl border border-slate-700 px-7 py-4 font-semibold text-slate-200 transition hover:border-slate-500 sm:w-auto">Ver o conteúdo</a>
          </div>
          <p className="mt-5 text-xs text-slate-500">Material educacional. Os resultados dependem da adaptação e revisão de cada usuário.</p>
        </div>
      </section>

      <section id="conteudo" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">O que você encontra no manual</h2>
          <p className="mt-3 text-slate-400">Estruturas práticas para começar sem programação e adaptar à realidade do seu trabalho.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 font-bold text-cyan-300">0{index + 1}</div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40 px-5 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-emerald-300">Para quem é</h2>
            <ul className="mt-5 space-y-3 text-slate-300">
              <li>✓ Autônomos e prestadores de serviço que escrevem mensagens e propostas.</li>
              <li>✓ Pessoas que já usam IA e querem instruções mais organizadas.</li>
              <li>✓ Pequenos negócios que precisam padronizar tarefas e comunicação.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-rose-300">O que não é</h2>
            <ul className="mt-5 space-y-3 text-slate-300">
              <li>• Não é um software de automação que trabalha sozinho.</li>
              <li>• Não garante vendas, lucro ou economia de tempo específica.</li>
              <li>• Não substitui revisão humana nem conhecimento profissional.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="oferta" className="px-5 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-cyan-500/30 bg-slate-900 p-8 text-center shadow-2xl shadow-cyan-950/20 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Acesso digital</p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Manual Operacional Express</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">Um pagamento único. Consulte o conteúdo e as condições antes de comprar.</p>
          <p className="mt-7 text-5xl font-extrabold text-white">R$ 29,90</p>
          {checkoutUrl ? (
            <a href={checkoutUrl} rel="nofollow sponsored" className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-300 sm:w-auto">Comprar com segurança</a>
          ) : (
            <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
              Checkout ainda não configurado. A compra será liberada assim que o link seguro de pagamento for conectado.
            </div>
          )}
          <p className="mt-5 text-xs leading-5 text-slate-500">O pagamento e a entrega digital precisam ser processados por uma plataforma de checkout configurada. Não informe dados bancários nesta página.</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-16">
        <h2 className="text-center text-2xl font-bold text-white">Perguntas frequentes</h2>
        <div className="mt-7 space-y-4">
          <details className="rounded-xl border border-slate-800 bg-slate-900 p-5"><summary className="cursor-pointer font-semibold text-white">Preciso saber programar?</summary><p className="mt-3 text-sm leading-6 text-slate-300">Não. Os modelos são escritos em linguagem natural e devem ser adaptados aos seus dados.</p></details>
          <details className="rounded-xl border border-slate-800 bg-slate-900 p-5"><summary className="cursor-pointer font-semibold text-white">O manual garante resultados?</summary><p className="mt-3 text-sm leading-6 text-slate-300">Não. É um material de apoio; resultados variam conforme o contexto, a ferramenta utilizada e a aplicação.</p></details>
          <details className="rounded-xl border border-slate-800 bg-slate-900 p-5"><summary className="cursor-pointer font-semibold text-white">Como recebo o material?</summary><p className="mt-3 text-sm leading-6 text-slate-300">Após a configuração do checkout, a plataforma de pagamento deverá entregar o arquivo automaticamente após a confirmação do pagamento.</p></details>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-5 py-8 text-center text-xs text-slate-500">Manual Operacional Express • Conteúdo informativo e operacional • <Link href="/" className="text-cyan-300 hover:underline">Voltar ao ScorpionAI</Link></footer>
    </main>
  );
}
