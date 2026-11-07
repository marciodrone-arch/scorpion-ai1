import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, image } = await req.json();
    const lowerMsg = message ? message.toLowerCase() : '';

    // 1. Geração de Imagens via Pollinations.ai
    const isImageRequest = 
      lowerMsg.includes('gerar imagem') || 
      lowerMsg.includes('crie uma imagem') || 
      lowerMsg.includes('foto de') || 
      lowerMsg.includes('imagem de') ||
      lowerMsg.includes('desenhe');

    if (isImageRequest && !image) {
      let promptClean = message
        .replace(/gerar imagem de|crie uma imagem de|foto de|imagem de|desenhe/gi, '')
        .trim();
      if (!promptClean) promptClean = message;

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptClean)}?width=1024&height=1024&nologo=true`;
      
      return NextResponse.json({ 
        reply: `Aqui está a imagem gerada para: "${promptClean}"`,
        imageUrl: imageUrl 
      });
    }

    // 2. Chave da API
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY não configurada nas variáveis de ambiente da Vercel.' },
        { status: 500 }
      );
    }

    // 3. System Prompt para forçar Português e formato profissional
    const systemInstruction = 
      "Você é o ScorpionAI, um assistente virtual de inteligência artificial de elite, focado em alta performance, clareza, concisão e resultados práticos. " +
      "DIRETRIZES OBRIGATÓRIAS:\n" +
      "1. Responda SEMPRE em Português do Brasil de forma clara, direta e objetiva.\n" +
      "2. Elimine introduções longas ou saudações genéricas.\n" +
      "3. Use formatação limpa (listas, negritos e tópicos). Evite tabelas ASCII complexas se não puderem ser renderizadas com perfeição.\n" +
      "4. Seja altamente funcional em programação, estudos, escrita criativa, negócios e automação.";

    const combinedText = `${systemInstruction}\n\n[Mensagem do Usuário]: ${message || 'Analise a solicitação.'}`;

    const parts: any[] = [{ text: combinedText }];

    if (image) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        parts.push({
          inline_data: {
            mime_type: matches[1],
            data: matches[2]
          }
        });
      }
    }

    // 4. Lista fallback de modelos atualizados
    const modelsToTry = [
      'gemini-3.8-flash',
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] }),
          }
        );

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
        } else if (data.error?.message) {
          lastErrorMessage = data.error.message;
        }
      } catch (err: any) {
        lastErrorMessage = err?.message || 'Erro no modelo';
      }
    }

    // Fallback via Pollinations Text em caso de falha nas chaves
    if (!image) {
      try {
        const fallbackRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(message)}`);
        if (fallbackRes.ok) {
          const fallbackText = await fallbackRes.text();
          if (fallbackText) {
            return NextResponse.json({ reply: fallbackText });
          }
        }
      } catch (e) {}
    }

    return NextResponse.json(
      { error: `Erro na API do Gemini: ${lastErrorMessage}` },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
