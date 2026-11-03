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
    
    // Lista de modelos em ordem de prioridade para garantir zero falhas
    const modelsToTry = ['gemini-3.8-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let text = '';
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(message);
        text = result.response.text();
        if (text) break; // Se obteve resposta com sucesso, sai do loop
      } catch (err: any) {
        lastError = err;
        console.warn(`Modelo ${modelName} falhou, tentando o próximo...`);
      }
    }

    if (!text) {
      throw lastError || new Error('Todos os modelos falharam temporariamente.');
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
