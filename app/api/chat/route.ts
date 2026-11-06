import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const lowerMsg = message.toLowerCase();
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

    // Se for pedido de imagem, gera diretamente sem passar por modelos de texto bloqueados
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

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não configurada na Vercel.' },
        { status: 500 }
      );
    }

    // Busca dinâmica em tempo real de qualquer modelo disponível na sua chave da Groq
    const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    const modelsJson = await modelsRes.json();
    const modelsList = modelsJson.data?.map((m: any) => m.id) || ['llama3-8b-8192'];

    let replyText = null;
    let lastError = '';

    for (const modelId of modelsList) {
      if (modelId.includes('guard') || modelId.includes('whisper') || modelId.includes('embedding')) continue;

      const chatRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

      const chatJson = await chatRes.json();

      if (chatRes.ok && chatJson.choices?.[0]?.message?.content) {
        replyText = chatJson.choices[0].message.content;
        break;
      } else {
        lastError = chatJson.error?.message || 'Erro desconhecido';
      }
    }

    if (!replyText) {
      return NextResponse.json(
        { error: `Erro na API: ${lastError}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno ao processar a resposta.' },
      { status: 500 }
    );
  }
}
