"use client";

import { useState } from "react";

export default function VideosPage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  async function generateVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setVideoUrl("");

    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível gerar o vídeo.");
      setVideoUrl(data.videoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão ao gerar o vídeo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0c10] text-gray-100 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <span aria-hidden="true">←</span> Voltar ao ScorpionAI
        </a>
        <header className="mt-8 mb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-2xl">🎬</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Gerar vídeos</h1>
              <p className="text-sm text-gray-400">Transforme sua descrição em um vídeo com inteligência artificial.</p>
            </div>
          </div>
        </header>

        <form onSubmit={generateVideo} className="rounded-2xl border border-gray-800 bg-[#141720] p-4 sm:p-6 space-y-5 shadow-xl">
          <div>
            <label htmlFor="video-prompt" className="mb-2 block text-sm font-semibold text-gray-200">
              Descreva o vídeo que deseja criar
            </label>
            <textarea
              id="video-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="Ex.: Um carro esportivo vermelho percorrendo uma estrada entre montanhas ao pôr do sol, câmera acompanhando o movimento, estilo cinematográfico..."
              className="w-full resize-y rounded-xl border border-gray-700 bg-[#0d1017] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-colors focus:border-sky-400"
              required
            />
            <p className="mt-1 text-right text-xs text-gray-500">{prompt.length}/2.000</p>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-gray-200">Formato do vídeo</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio("16:9")}
                aria-pressed={aspectRatio === "16:9"}
                className={"rounded-xl border px-3 py-3 text-sm transition-colors " + (aspectRatio === "16:9" ? "border-sky-400 bg-sky-400/10 text-sky-300" : "border-gray-700 bg-[#0d1017] text-gray-300 hover:border-gray-500")}
              >
                <span className="block text-lg">▰</span>
                Horizontal (16:9)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("9:16")}
                aria-pressed={aspectRatio === "9:16"}
                className={"rounded-xl border px-3 py-3 text-sm transition-colors " + (aspectRatio === "9:16" ? "border-sky-400 bg-sky-400/10 text-sky-300" : "border-gray-700 bg-[#0d1017] text-gray-300 hover:border-gray-500")}
              >
                <span className="block text-lg">▯</span>
                Vertical (9:16)
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-[#0d1017] p-3 text-xs text-gray-400 space-y-1">
            <p><strong className="text-gray-200">Configuração inicial:</strong> 5 segundos • 480p</p>
            <p><strong className="text-gray-200">Custo estimado:</strong> US$ 0,25 por vídeo, cobrado pela Cloudflare.</p>
            <p>O valor é estimado e pode variar conforme a cobrança do provedor. A geração só começa quando você clicar no botão.</p>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Gerando vídeo... aguarde" : "🎬 Gerar vídeo"}
          </button>
        </form>

        {loading && (
          <p className="mt-4 text-center text-sm text-sky-300" role="status">
            A criação pode levar alguns instantes. Não feche esta página.
          </p>
        )}

        {videoUrl && (
          <section className="mt-6 rounded-2xl border border-gray-800 bg-[#141720] p-4 sm:p-6 space-y-4">
            <h2 className="font-semibold text-white">Seu vídeo está pronto!</h2>
            <video key={videoUrl} src={videoUrl} controls playsInline className="w-full rounded-xl bg-black" />
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-xl border border-sky-400/40 px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-sky-400/10">
              Abrir / baixar vídeo
            </a>
          </section>
        )}
      </div>
    </main>
  );
}
