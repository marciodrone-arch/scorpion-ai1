import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const lowerMsg = message.toLowerCase();
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

    // Deteta se o usuário pediu para gerar uma imagem/foto
    const isImageRequest = 
      lowerMsg.includes('gerar imagem') || 
      lowerMsg.includes('crie uma imagem') || 
      lowerMsg.includes('foto de') || 
      lowerMsg.includes('imagem de') ||
      lowerMsg.includes('preciso de uma imagem') ||
      lowerMsg.includes('preciso de uma foto') ||
      lowerMsg.includes('desenhe');

    if (isImageRequest) {
      // Limpa os termos de comando e mantém o assunto real do pedido (ex: "um cavalo")
      let promptClean = message
        .replace(/gerar imagem de|crie uma imagem de|foto de|imagem de|preciso de uma imagem de|preciso de uma foto de|desenhe/gi, '')
        .trim();
      
      if (!promptClean) promptClean = message; // Fallback se limpar demais

      const encodedPrompt = encodeURIComponent(promptClean);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
      
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

    // Comunicação com o modelo oficial ativo da Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Erro na API da Groq.' },
        { status: response.status }
      );
    }

    const replyText = data.choices?.[0]?.message?.content;
    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno ao processar a resposta.' },
      { status: 500 }
    );
  }
}
