import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não encontrada nas variáveis da Vercel.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Tenta carregar o modelo suportado pela API
    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch {
      model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error('Erro Gemini:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar resposta.' },
      { status: 500 }
    );
  }
}
