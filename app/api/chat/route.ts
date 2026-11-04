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
    
    // Tenta encontrar dinamicamente um modelo compatível ou recorre aos padrões mais seguros
    let text = '';
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(message);
        const response = await result.response;
        text = response.text();
        if (text) break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!text) {
      throw lastError || new Error('Nenhum modelo compatível foi encontrado para esta chave de API.');
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
