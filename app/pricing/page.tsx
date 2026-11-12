"use client";

import { useState } from "react";

const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY || "";

export default function PricingPage() {
  const [copied, setCopied] = useState(false);

  async function copyPixKey() {
    if (!PIX_KEY) return;

    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Não foi possível copiar. Selecione e copie a chave Pix manualmente.");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0c10] text-gray-200 px-6 py-12">
      <article className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="text-red-400">
          ← Voltar ao ScorpionAI
        </a>

        <header className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-white">Planos ScorpionAI</h1>
          <p className="text-gray-400">
            Escolha o plano ideal para suas necessidades.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="border border-gray-700 rounded-xl p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">Gratuito</h2>
            <p className="text-3xl font-bold text-white">R$ 0</p>
            <p className="text-gray-400">Para conhecer o ScorpionAI.</p>
            <ul className="space-y-2">
              <li>✓ Acesso ao chat de IA</li>
              <li>✓ Geração de imagens</li>
              <li>✓ Histórico de conversas</li>
              <li>✓ Limite de utilização gratuito</li>
            </ul>
            <a href="/" className="block text-center bg-red-600 hover:bg-red-700 text-white rounded-lg p-3">
              Começar agora
            </a>
          </div>

          <div className="border border-red-500 rounded-xl p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">Premium</h2>
            <p className="text-3xl font-bold text-white">R$ 9,90 <span className="text-base font-normal text-gray-400">/ mês</span></p>
            <p className="text-gray-400">Plano mensal do ScorpionAI.</p>
            <ul className="space-y-2">
              <li>✓ Maior limite de utilização</li>
              <li>✓ Mais gerações de imagens</li>
              <li>✓ Recursos adicionais</li>
              <li>✓ Atendimento prioritário</li>
            </ul>

            {PIX_KEY ? (
              <div className="space-y-3 rounded-lg bg-gray-900 p-4">
                <p className="font-semibold text-white">Pagamento via Pix (banco Neon)</p>
                <p className="text-sm text-gray-400">Use a chave Pix abaixo para realizar o pagamento de R$ 9,90.</p>
                <div className="break-all rounded bg-black/40 p-3 text-sm text-white">{PIX_KEY}</div>
                <button
                  type="button"
                  onClick={copyPixKey}
                  className="w-full rounded-lg bg-red-600 p-3 font-semibold text-white hover:bg-red-700"
                >
                  {copied ? "Chave Pix copiada!" : "Copiar chave Pix"}
                </button>
                <p className="text-xs text-amber-300">
                  Guarde o comprovante. A confirmação do pagamento e a liberação do Premium serão feitas manualmente.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-800 p-4 text-center text-sm text-gray-300">
                Pagamento Pix em configuração. Em breve você poderá pagar pelo banco Neon.
              </div>
            )}
          </div>
        </section>

        <p className="text-center text-sm text-gray-500">
          O pagamento do Premium é mensal. A liberação do acesso ocorre somente após a confirmação do recebimento.
        </p>
      </article>
    </main>
  );
}
