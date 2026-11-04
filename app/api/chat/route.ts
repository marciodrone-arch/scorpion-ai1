import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave GEMINI_API_KEY não configurada na Vercel.' },
        { status: 500 }
      );
    }

    // Lista de modelos ordenados por prioridade (se um falhar/estiver lotado, tenta o próximo)
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    let lastErrorMessage = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: message }],
                },
              ],
            }),
          }
        );

        const data = await response.json();

        // Se o modelo aceitou e respondeu com sucesso
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const replyText = data.candidates[0].content.parts[0].text;
          return NextResponse.json({ reply: replyText });
        }

        // Caso a API retorne um erro (como sobrecarga 503/429 ou 404), guarda e tenta o próximo modelo
        lastErrorMessage = data.error?.message || `Erro no modelo ${modelName}`;
        console.warn(`Modelo ${modelName} indisponível. Tentando alternativa...`);
      } catch (err: any) {
        lastErrorMessage = err.message || 'Falha de conexão.';
      }
    }

    // Se todos os modelos da lista estiverem indisponíveis
    return NextResponse.json(
      { error: 'Servidores da IA em alta demanda no momento. Por favor, tente em alguns instantes.' },
      { status: 503 }
    );

  } catch (error: any) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a requisição.' },
      { status: 500 }
    );
  }
}
