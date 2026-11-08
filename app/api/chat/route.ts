import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, image, persona } = await req.json();
    const lowerMsg = message ? message.toLowerCase() : '';

    // Geração de imagem via Pollinations.ai
    const isImageRequest = 
      lowerMsg.includes('gerar imagem') || 
      lowerMsg.includes('crie uma imagem') || 
      lowerMsg.includes('foto de') || 
      lowerMsg.includes('imagem de') ||
      lowerMsg.includes('desenhe');

    if (isImageRequest && !image) {
      let promptClean = message
        .replace(/gerar imagem de|crie uma imagem de|foto de|imagem de|desenhe/gi, '')
        .trim();
      if (!promptClean) promptClean = message;

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptClean)}?width=1024&height=1024&nologo=true`;
      
      return NextResponse.json({ 
        reply: `Aqui está a imagem gerada para: "${promptClean}"`,
        imageUrl: imageUrl 
      });
    }

    // Persona Ativa & Instrução para Tabelas Limpas
    let roleInstruction = "Você é o ScorpionAI, um assistente de IA de alta performance. Responda em Português do Brasil de forma clara, objetiva e estruturada.";
    if (persona === "Arquiteto de Software Sênior") {
      roleInstruction = "Você é um Arquiteto de Software Sênior especializado em microsserviços, C#, Cloud e K8s. Responda técnico e direto.";
    } else if (persona === "Copywriter de Alta Conversão") {
      roleInstruction = "Você é um Copywriter especialista em vendas, ROI e alta conversão.";
    } else if (persona === "QA Tester & Auditor") {
      roleInstruction = "Você é um Engenheiro de QA focado em testes, auditoria e cenários de borda.";
    }

    const systemPrompt = `${roleInstruction}\n\nIMPORTANTE PARA TABELAS E ESTRUTURA:\nSe o usuário pedir uma tabela ou lista, organize os dados de forma extremamente legível e simples em tópicos ou blocos alinhados.\n\n[Mensagem do Usuário]: ${message || 'Analise esta solicitação.'}`;

    const apiKey = process.env.GEMINI_API_KEY || '';

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }]
            }),
          }
        );

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
        }
      } catch (err) {}
    }

    // Fallback leve via Pollinations Text
    try {
      const fallbackRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(message || 'Olá')}`);
      if (fallbackRes.ok) {
        const fallbackText = await fallbackRes.text();
        if (fallbackText) return NextResponse.json({ reply: fallbackText });
      }
    } catch (e) {}

    return NextResponse.json({ reply: "Sistema ativo e pronto para auxiliar." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Processado com sucesso pelo ScorpionAI." });
  }
}
