import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API GEMINI_API_KEY não configurada na Vercel.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Lista de modelos suportados para tentar em sequência
    const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastError: any = null;
    let replyText: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(message);
        const response = await result.response;
        replyText = response.text();
        if (replyText) break; // Sucesso! Sai do loop.
      } catch (err) {
        lastError = err;
        console.warn(`Falha no modelo ${modelName}, tentando o próximo...`);
      }
    }

    if (replyText) {
      return NextResponse.json({ reply: replyText });
    }

    throw lastError || new Error('Nenhum modelo Gemini respondeu.');

  } catch (error: any) {
    console.error('Erro na API Gemini:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno ao processar a resposta.' },
      { status: 500 }
    );
  }
}
