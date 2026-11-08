import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const cleanMsg = message ? message.trim() : '';
    const lowerMsg = cleanMsg.toLowerCase();

    const isImageRequest = 
      lowerMsg.includes('gerar') || 
      lowerMsg.includes('crie') || 
      lowerMsg.includes('gere') || 
      lowerMsg.includes('faz') || 
      lowerMsg.includes('faça') || 
      lowerMsg.includes('foto') || 
      lowerMsg.includes('imagem') ||
      lowerMsg.includes('desenhe');

    if (isImageRequest) {
      let promptClean = cleanMsg
        .replace(/gerar imagem de|gerar|crie uma imagem de|crie a imagem de|crie|gere uma imagem de|gere a imagem de|gere|faz uma imagem de|faça uma imagem de|foto de|imagem de|desenhe/gi, '')
        .replace(/["']/g, '')
        .trim();
      
      if (!promptClean || promptClean.length < 3) promptClean = cleanMsg;

      // Tradução automática rápida e precisa para inglês (garante que o gerador visual entenda perfeitamente o pedido, ex: "an egg with eyes")
      let finalPrompt = promptClean;
      try {
        const transRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(promptClean)}`);
        const transData = await transRes.json();
        if (transData && transData[0] && transData[0][0] && transData[0][0][0]) {
          finalPrompt = transData[0][0][0];
        }
      } catch (e) {}

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&nologo=true`;
      
      return NextResponse.json({ 
        reply: `Aqui está a imagem gerada para: "${promptClean}"`,
        imageUrl: imageUrl 
      });
    }

    // Resposta de texto rápida
    try {
      const textRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(cleanMsg)}`);
      if (textRes.ok) {
        const textReply = await textRes.text();
        if (textReply) return NextResponse.json({ reply: textReply });
      }
    } catch (e) {}

    return NextResponse.json({ reply: "Pronto! Como posso ajudar?" });

  } catch (error: any) {
    return NextResponse.json({ reply: "Sistema operando normalmente." });
  }
}
