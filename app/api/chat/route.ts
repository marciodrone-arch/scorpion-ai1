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
    
    // Lista de modelos padrão e universais para garantir compatibilidade imediata
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'];
    let text = '';
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
        console.warn(`Tentativa com ${modelName} falhou, tentando próximo...`);
      }
    }

    if (!text) {
      throw lastError || new Error('Não foi possível obter resposta de nenhum modelo disponível.');
    }

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error('Erro na API Gemini:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar resposta da IA.' },
      { status: 500 }
    );
  }
}
