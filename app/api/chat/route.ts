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
    
    // Lista com os nomes de modelos padrão e ativos do Gemini
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash-latest'];
    let text = '';
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(message);
        text = result.response.text();
        if (text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Modelo ${modelName} indisponível, a tentar o próximo...`);
      }
    }

    if (!text) {
      throw lastError || new Error('Não foi possível obter resposta da IA.');
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
