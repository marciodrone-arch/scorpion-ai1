import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, image } = await req.json();
    const lowerMsg = message ? message.toLowerCase() : '';

    // 1. Geração de Imagens via Pollinations.ai (retorno rápido)
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

    // 2. Chave de API
    const apiKey = process.env.GEMINI_API_KEY || '';

    // System prompt curto e rápido
    const systemPrompt = "Você é o ScorpionAI, uma IA ultra-rápida, direta e em Português do Brasil. Responda de forma concisa e objetiva.";
    const parts: any[] = [{ text: `${systemPrompt}\n\nUsuário: ${message || 'Analise esta solicitação.'}` }];

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

    // 3. Chamada direta ao modelo mais leve e veloz
    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 segundos max timeout

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] }),
            signal: controller.signal
          }
        );
        clearTimeout(timeoutId);

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
        }
      } catch (err) {
        // Se der timeout ou erro no Gemini, passa na hora pro fallback rápido abaixo
      }
    }

    // 4. Fallback instantâneo em caso de atraso na chave principal (texto puro)
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

    return NextResponse.json({ reply: "Oi! Como posso ajudar você agora?" });

  } catch (error: any) {
    return NextResponse.json({ reply: "Recebido! Como posso te ajudar?" });
  }
}
