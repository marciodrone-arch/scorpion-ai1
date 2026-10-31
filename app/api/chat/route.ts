import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API da IA não configurada no servidor.' },
        { status: 500 }
      );
    }

    // Formata o histórico de mensagens para a API do Google Gemini
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Chamada oficial à API do Google Gemini
    const response =. await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedContents,
          systemInstruction: {
            parts: [
              {
                text: 'Você é a ScorpionAI, uma inteligência artificial comercial, objetiva, profissional e amigável. Responda sempre em Português do Brasil com excelente formatação em Markdown.'
              }
            ]
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao processar mensagem na IA.');
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta da IA.';

    return NextResponse.json({ role: 'assistant', content: replyText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
