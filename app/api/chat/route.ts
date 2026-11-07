import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const lowerMsg = message ? message.toLowerCase() : '';

    // 1. Geração de Imagens via Pollinations.ai
    const isImageRequest = 
      lowerMsg.includes('gerar imagem') || 
      lowerMsg.includes('crie uma imagem') || 
      lowerMsg.includes('foto de') || 
      lowerMsg.includes('imagem de') ||
      lowerMsg.includes('preciso de uma imagem') ||
      lowerMsg.includes('preciso de uma foto') ||
      lowerMsg.includes('desenhe');

    if (isImageRequest) {
      let promptClean = message
        .replace(/gerar imagem de|crie uma imagem de|foto de|imagem de|preciso de uma imagem de|preciso de uma foto de|desenhe/gi, '')
        .trim();
      if (!promptClean) promptClean = message;

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptClean)}?width=1024&height=1024&nologo=true`;
      
      return NextResponse.json({ 
        reply: `Aqui está a imagem gerada para: "${promptClean}"`,
        imageUrl: imageUrl 
      });
    }

    // 2. Tentar usar o Gemini com a API v1 e o modelo correto sem prefixo restritivo
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: message }] }]
            }),
          }
        );

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
        }
      } catch (err) {
        // Ignora e tenta o fallback abaixo se falhar
      }
    }

    // 3. Fallback inteligente gratuito via Pollinations Text (caso o Gemini falhe, garante resposta imediata)
    try {
      const textResponse = await fetch(`https://text.pollinations.ai/${encodeURIComponent(message)}`);
      if (textResponse.ok) {
        const replyText = await textResponse.text();
        if (replyText) {
          return NextResponse.json({ reply: replyText });
        }
      }
    } catch (err) {
      // Segue para o erro se ambos falharem
    }

    return NextResponse.json(
      { error: 'Não foi possível obter resposta da IA. Verifique se a GEMINI_API_KEY está correta na Vercel.' },
      { status: 500 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno no servidor: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
