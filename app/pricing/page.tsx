export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0c10] text-gray-200 px-6 py-12">
      <article className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="text-red-400">
          ← Voltar ao ScorpionAI
        </a>

        <header className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-white">
            Planos ScorpionAI
          </h1>
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
            <p className="text-3xl font-bold text-white">Em breve</p>
            <p className="text-gray-400">Para quem precisa de mais recursos.</p>
            <ul className="space-y-2">
              <li>✓ Maior limite de utilização</li>
              <li>✓ Mais gerações de imagens</li>
              <li>✓ Recursos adicionais</li>
              <li>✓ Atendimento prioritário</li>
            </ul>
            <div className="text-center bg-gray-800 text-gray-400 rounded-lg p-3">
              Disponível em breve
            </div>
          </div>
        </section>

        <p className="text-center text-sm text-gray-500">
          Os recursos e condições dos planos poderão ser atualizados.
          O plano Premium ainda não está disponível para contratação.
        </p>
      </article>
    </main>
  );
}
