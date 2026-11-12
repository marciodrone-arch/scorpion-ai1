
export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#0a0c10] text-gray-200 px-6 py-12">
      <article className="max-w-3xl mx-auto space-y-6">
        <a href="/" className="text-red-400">← Voltar ao ScorpionAI</a>

        <h1 className="text-3xl font-bold text-white">Central de Suporte</h1>
        <p className="text-gray-300">
          Precisa de ajuda com o ScorpionAI? Consulte as informações abaixo.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Problemas com sua conta</h2>
          <p>Se tiver dificuldades para entrar ou acessar sua conta, verifique seus dados de login e tente novamente.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Chat e geração de imagens</h2>
          <p>Se uma resposta ou imagem não for gerada, tente novamente após alguns instantes. Alguns serviços externos podem apresentar instabilidade ou limites de uso.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Privacidade e dados</h2>
          <p>Para informações sobre coleta e uso de dados, consulte nossa Política de Privacidade.</p>
          <a href="/privacy" className="text-red-400 underline">Política de Privacidade</a>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Termos de Uso</h2>
          <a href="/terms" className="text-red-400 underline">Consultar Termos de Uso</a>
        </section>

        <p className="text-sm text-gray-400 border-t border-gray-800 pt-5">
          ScorpionAI — Os canais oficiais de atendimento deverão ser informados pelo responsável antes do lançamento público.
        </p>
      </article>
    </main>
  );
}
