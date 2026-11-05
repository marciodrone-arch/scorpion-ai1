import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const lowerMsg = message.toLowerCase();
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

    // Deteta se o usuário pediu uma imagem ou foto
    const isImageRequest = 
      lowerMsg.includes('gerar imagem') || 
      lowerMsg.includes('crie uma imagem') || 
      lowerMsg.includes('foto de') || 
      lowerMsg.includes('imagem de') ||
      lowerMsg.includes('desenhe') ||
      lowerMsg.includes('criador de imagem');

    if (isImageRequest) {
      // Extrai o prompt para gerar a imagem usando o serviço gratuito Pollinations.ai
      const promptClean = encodeURIComponent(message.replace(/gerar imagem|crie uma imagem|foto de|imagem de|desenhe/gi, '').trim());
      const imageUrl = `https://image.pollinations.ai/prompt/${promptClean}?width=1024&height=1024&nologo=true`;
      
      return NextResponse.json({ 
        reply: `Aqui está a imagem gerada com base no seu pedido:`,
        imageUrl: imageUrl 
      });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não configurada na Vercel.' },
        { status: 500 }
      );
    }

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

    return NextResponse.json(
      { error: data.error?.message || 'Erro ao processar a resposta da IA.' },
      { status: 500 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno ao processar a requisição.' },
      { status: 500 }
    );
  }
}
