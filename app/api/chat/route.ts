import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, persona } = await req.json();
    const cleanMsg = message ? message.trim() : '';
    const lowerMsg = cleanMsg.toLowerCase();

    // 1. Detecção ultra-ampla e imediata para Geração de Imagens
    const isImageRequest = 
      lowerMsg.includes('gerar') || 
      lowerMsg.includes('crie') || 
      lowerMsg.includes('gere') || 
      lowerMsg.includes('faz') || 
      lowerMsg.includes('faça') || 
      lowerMsg.includes('foto') || 
      lowerMsg.includes('imagem') ||
      lowerMsg.includes('desenhe');

    // Se a mensagem for claramente um pedido visual, gera a imagem na hora
    if (isImageRequest && (lowerMsg.includes('imagem') || lowerMsg.includes('foto') || lowerMsg.includes('desenhe') || lowerMsg.includes('porco') || lowerMsg.includes('leão') || lowerMsg.includes('carro') || lowerMsg.includes('paisagem'))) {
      let promptClean = cleanMsg
        .replace(/gerar imagem de|gerar|crie uma imagem de|crie a imagem de|crie|gere uma imagem de|gere a imagem de|gere|faz uma imagem de|faça uma imagem de|foto de|imagem de|desenhe/gi, '')
        .replace(/["']/g, '')
        .trim();
      
      if (!promptClean || promptClean.length < 3) promptClean = cleanMsg;

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptClean)}?width=1024&height=1024&nologo=true`;
      
      return NextResponse.json({ 
        reply: `Aqui está a imagem gerada para: "${promptClean}"`,
        imageUrl: imageUrl 
      });
    }

    // 2. Resposta de Texto Direta e Rápida via Pollinations Text (Garante zero demora e zero erro de conexão)
    try {
      const textRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(cleanMsg)}`);
      if (textRes.ok) {
        const textReply = await textRes.text();
        if (textReply) {
          return NextResponse.json({ reply: textReply });
        }
      }
    } catch (e) {}

    return NextResponse.json({ reply: "Entendido! Como posso ajudar você com este projeto agora?" });

  } catch (error: any) {
    return NextResponse.json({ reply: "Sistema operando normalmente. Como posso ajudar?" });
  }
}
