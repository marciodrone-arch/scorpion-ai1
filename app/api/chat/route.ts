import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API da IA não configurada no servidor.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Envia a mensagem para o Gemini
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('A IA retornou uma resposta vazia.');
    }

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error('Erro detalhado na API Gemini:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar resposta da IA.' },
      { status: 500 }
    );
  }
}
