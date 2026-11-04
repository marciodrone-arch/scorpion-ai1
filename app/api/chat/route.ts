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

    // Chamada REST direta sem depender do SDK
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

    if (!response.ok) {
      console.error('Erro na API Google:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Erro de comunicação com a API do Gemini.' },
        { status: response.status }
      );
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return NextResponse.json(
        { error: 'Resposta vazia retornada pela IA.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Erro interno do servidor:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno ao processar a resposta.' },
      { status: 500 }
    );
  }
}
