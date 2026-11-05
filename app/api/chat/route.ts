import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não configurada na Vercel.' },
        { status: 500 }
      );
    }

    // Modelos ativos e oficialmente suportados pela Groq
    const groqModels = [
      'llama-3.3-70b-versatile',
      'llama3-70b-8192',
      'llama3-8b-8192'
    ];

    let lastErrorMessage = '';

    for (const modelName of groqModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: 'user', content: message }],
          }),
        });

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          return NextResponse.json({ reply: data.choices[0].message.content });
        }

        lastErrorMessage = data.error?.message || `Modelo ${modelName} falhou`;
      } catch (err: any) {
        lastErrorMessage = err.message || 'Erro de conexão';
      }
    }

    return NextResponse.json(
      { error: `Erro na API da Groq: ${lastErrorMessage}` },
      { status: 500 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno ao processar a resposta.' },
      { status: 500 }
    );
  }
}
