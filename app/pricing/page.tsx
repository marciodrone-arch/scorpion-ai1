"use client";

import { useState } from "react";

const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY || "";
const WHATSAPP_NUMBER = "5541997654339";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá! Fiz o Pix de R$ 9,90 para contratar 30 dias de Premium no ScorpionAI. Segue o comprovante para conferência."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function PricingPage() {
  const [copyMessage, setCopyMessage] = useState("");

  async function copyPixKey() {
    if (!PIX_KEY) {
      setCopyMessage("Chave Pix não configurada.");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(PIX_KEY);
      } else {
        throw new Error("Clipboard API indisponível");
      }
      setCopyMessage("Chave Pix copiada!");
    } catch {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = PIX_KEY;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);
        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);

        setCopyMessage(
          copied
            ? "Chave Pix copiada!"
            : "Não foi possível copiar automaticamente. Selecione a chave acima e copie."
        );
      } catch {
        setCopyMessage("Não foi possível copiar automaticamente. Selecione a chave acima e copie.");
      }
    }

    window.setTimeout(() => setCopyMessage(""), 4000);
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
              <li>✓ Até 20 mensagens por dia</li>
            </ul>
            <a href="/" className="block text-center bg-red-600 hover:bg-red-700 text-white rounded-lg p-3">
              Começar agora
            </a>
          </div>

          <div className="border border-red-500 rounded-xl p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">Premium</h2>
            <p className="text-3xl font-bold text-white">R$ 9,90 <span className="text-base font-normal text-gray-400">/ 30 dias</span></p>
            <p className="text-gray-400">Mais liberdade para usar o ScorpionAI.</p>
            <ul className="space-y-2">
              <li>✓ Acesso ao chat de IA</li>
              <li>✓ Geração de imagens</li>
              <li>✓ Histórico de conversas</li>
              <li>✓ Até 1.000 mensagens por dia</li>
              <li>✓ Limite de uso maior que o plano gratuito</li>
            </ul>

            {PIX_KEY ? (
              <div className="space-y-3 rounded-lg bg-gray-900 p-4">
                <p className="font-semibold text-white">Pagamento via Pix</p>
                <p className="text-sm text-gray-400">Faça um Pix de R$ 9,90 usando a chave abaixo para contratar 30 dias de Premium.</p>
                <div className="break-all rounded bg-black/40 p-3 text-sm text-white">{PIX_KEY}</div>
                <button
                  type="button"
                  onClick={copyPixKey}
                  className="w-full rounded-lg bg-red-600 p-3 font-semibold text-white hover:bg-red-700"
                >
                  Copiar chave Pix
                </button>
                {copyMessage && (
                  <p role="status" aria-live="polite" className="text-sm font-semibold text-green-400">
                    {copyMessage}
                  </p>
                )}
                <p className="text-xs text-amber-300">
                  Depois de fazer o Pix, clique no botão abaixo para enviar o comprovante. O Premium será ativado pelo administrador somente após a confirmação do recebimento no banco.
                </p>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg bg-green-600 p-3 text-center font-semibold text-white hover:bg-green-700"
                >
                  Enviar comprovante pelo WhatsApp
                </a>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-800 p-4 text-center text-sm text-gray-300">
                Pagamento Pix em configuração. Em breve você poderá pagar pelo banco Neon.
              </div>
            )}
          </div>
        </section>

        <p className="text-center text-sm text-gray-500">
          O Premium libera 30 dias de acesso após a confirmação manual do Pix. Não há renovação automática: para continuar usando o Premium após esse período, será necessário realizar um novo pagamento e aguardar a confirmação.
        </p>
      </article>
    </main>
  );
}
