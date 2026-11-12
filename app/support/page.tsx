export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#0a0c10] text-gray-200 px-6 py-12">
      <article className="max-w-3xl mx-auto space-y-6">
        <a href="/" className="text-red-400">← Voltar ao ScorpionAI</a>

        <h1 className="text-3xl font-bold text-white">Central de Suporte</h1>

        <p>Precisa de ajuda com o ScorpionAI? Consulte as orientações abaixo.</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Acesso à conta</h2>
          <p>Se tiver dificuldades para entrar, confira seu e-mail e tente novamente. Não compartilhe sua senha com ninguém.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Chat e geração de imagens</h2>
          <p>Se uma solicitação falhar, tente novamente após alguns instantes. Verifique também se sua conexão está funcionando.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Privacidade</h2>
          <p>Consulte nossa Política de Privacidade para entender como os dados são utilizados.</p>
          <a href="/privacy" className="text-red-400">Política de Privacidade</a>
        </section>

        <p className="text-sm text-gray-400 border-t border-gray-800 pt-5">
          ScorpionAI — Os canais oficiais de contato serão divulgados nesta página quando estiverem disponíveis.
        </p>
      </article>
    </main>
  );
}
