import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, image } = await req.json();
    const lowerMsg = message ? message.toLowerCase() : '';

    // 1. Geração de Imagens via Pollinations.ai (se o utilizador pedir para criar uma imagem)
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

    // 3. Montar a estrutura de conteúdos (Texto + Imagem se houver)
    const parts: any[] = [{ text: message || 'Analise esta imagem.' }];

    if (image) {
      // Extrai o formato base64 se a imagem contiver o cabeçalho data:image/...
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        });
      }
    }

    // 4. Chamada REST direta para o Gemini Multimodal
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }]
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
    }

    // Fallback caso ocorra algum erro no modelo principal
    if (data.error?.message) {
      return NextResponse.json({ error: `Erro na API do Gemini: ${data.error.message}` }, { status: 500 });
    }

    return NextResponse.json({ error: 'Não foi possível analisar a solicitação.' }, { status: 500 });

  } catch (error: any) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
