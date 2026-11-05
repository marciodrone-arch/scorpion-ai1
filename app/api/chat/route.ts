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

    // Tenta primeiro o modelo oficial mais rápido e ativo da Groq
    let primaryResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: message }],
      }),
    });

    let data = await primaryResponse.json();

    if (primaryResponse.ok && data.choices?.[0]?.message?.content) {
      return NextResponse.json({ reply: data.choices[0].message.content });
    }

    // Sistema Anti-Erros: Se o modelo padrão falhar, busca automaticamente os modelos ativos na sua conta
    const modelsResponse = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    const modelsData = await modelsResponse.json();
    const availableModels = modelsData.data?.map((m: any) => m.id) || [];

    for (const modelId of availableModels) {
      // Ignora modelos de visão ou áudio
      if (modelId.includes('guard') || modelId.includes('whisper')) continue;

      const fallbackResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: message }],
        }),
      });

      const fallbackData = await fallbackResponse.json();
      if (fallbackResponse.ok && fallbackData.choices?.[0]?.message?.content) {
        return NextResponse.json({ reply: fallbackData.choices[0].message.content });
      }
    }

    return NextResponse.json(
      { error: data.error?.message || 'Nenhum modelo disponível na Groq no momento.' },
      { status: 500 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
