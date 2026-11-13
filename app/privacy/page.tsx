
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0c10] text-gray-200 px-6 py-12">
      <article className="max-w-3xl mx-auto space-y-6">
        <a href="/" className="text-red-400">
          ← Voltar ao ScorpionAI
        </a>

        <h1 className="text-3xl font-bold text-white">
          Política de Privacidade
        </h1>

        <p className="text-sm text-gray-400">
          Última atualização: 12 de novembro de 2026
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">1. Dados coletados</h2>
          <p>O ScorpionAI pode coletar nome, endereço de e-mail, dados de autenticação, mensagens enviadas, imagens geradas e informações técnicas necessárias ao funcionamento e à segurança do serviço.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">2. Uso dos dados</h2>
          <p>Utilizamos os dados para criar e manter contas, responder solicitações, salvar conversas, gerar imagens, proteger o serviço contra abusos e melhorar seu funcionamento.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">3. Serviços externos</h2>
          <p>Para funcionar, o ScorpionAI utiliza serviços de infraestrutura e inteligência artificial, incluindo Vercel, Neon e Cloudflare Workers AI. As mensagens e imagens necessárias são transmitidas à Cloudflare para processamento.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">4. Armazenamento e segurança</h2>
          <p>As informações de conta e conversas podem ser armazenadas em banco de dados e no navegador. Adotamos medidas técnicas para proteger os dados, mas nenhum sistema pode garantir segurança absoluta.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">5. Cookies e sessão</h2>
          <p>Utilizamos cookies e tecnologias semelhantes para autenticação, manutenção da sessão e funcionamento da plataforma.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">6. Direitos do usuário</h2>
          <p>O usuário pode solicitar informações, acesso, correção ou exclusão de seus dados pessoais, observadas as obrigações legais de retenção aplicáveis.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">7. Alterações</h2>
          <p>Esta política poderá ser atualizada para refletir mudanças no serviço ou nas exigências legais. A versão vigente ficará disponível nesta página.</p>
        </section>

        <p className="text-sm text-gray-400 border-t border-gray-800 pt-5">
          Controlador dos dados: Marcio Munhoz, responsável pelo ScorpionAI. Para exercer direitos previstos na LGPD, solicitar acesso, correção ou exclusão de dados, ou tratar de privacidade, escreva para marciodrone@gmail.com.
        </p>
      </article>
    </main>
  );
}
