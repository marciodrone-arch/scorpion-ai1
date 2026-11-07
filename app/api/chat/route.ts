import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, image } = await req.json();
    const lowerMsg = message ? message.toLowerCase() : '';

    // 1. Geração de Imagens via Pollinations.ai (quando o usuário pede para criar uma imagem)
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

    // 2. Verificação da Chave da API
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY não configurada nas variáveis de ambiente da Vercel.' },
        { status: 500 }
      );
    }

    // 3. Montar a estrutura de conteúdo (Texto puro ou Texto + Imagem Base64)
    const parts: any[] = [{ text: message || 'Analise esta mensagem.' }];

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

    // 4. Lista fallback de modelos (tentando o gemini-3.8-flash exigido e alternativas recentes)
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
        lastErrorMessage = err?.message || 'Erro de conexão no modelo';
      }
    }

    // Fallback secundário via Pollinations Text em caso de texto puro
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
