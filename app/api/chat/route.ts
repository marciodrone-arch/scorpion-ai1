import { NextResponse } from 'next/server';
import { generateGeminiText } from '@/lib/gemini';

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

    // 2. Resposta do Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const reply = await generateGeminiText(message, geminiModel);
        return NextResponse.json({ reply });
      } catch (geminiErr: any) {
        console.warn('Falha na resposta do Gemini:', geminiErr?.message || geminiErr);
      }
    }

    return NextResponse.json(
      { error: 'Não foi possível obter resposta do Gemini.' },
      { status: 500 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
