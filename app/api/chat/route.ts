import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Prioriza a chave da Groq e depois a do Gemini
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não configurada na Vercel.' },
        { status: 500 }
      );
    }

    // Tenta primeiro o modelo definido na variável GROQ_MODEL, se não existir usa a busca dinâmica
    const preferredModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

    let response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: preferredModel,
        messages: [{ role: 'user', content: message }],
      }),
    });

    let data = await response.json();

    if (response.ok && data.choices?.[0]?.message?.content) {
      return NextResponse.json({ reply: data.choices[0].message.content });
    }

    // Fallback de Segurança: se o modelo configurado falhar, busca a lista de modelos ativos na conta
    const modelsResponse = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    const modelsData = await modelsResponse.json();
    const availableModels = modelsData.data?.map((m: any) => m.id) || [];

    for (const modelId of availableModels) {
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
      { error: data.error?.message || 'Nenhum modelo ativo respondeu.' },
      { status: 500 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno ao processar a resposta.' },
      { status: 500 }
    );
  }
}
