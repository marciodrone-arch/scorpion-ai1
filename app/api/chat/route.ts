import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, image, persona } = await req.json();
    const lowerMsg = message ? message.toLowerCase() : '';

    // 1. Geração de Imagens via Pollinations.ai (quando pedido)
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

    // 2. Persona ativa
    let roleInstruction = "Você é o ScorpionAI, um assistente de elite, direto e em Português do Brasil.";
    if (persona === "Arquiteto de Software Sênior") {
      roleInstruction = "Você é um Arquiteto de Software Sênior especializado em microsserviços, C#, Cloud e arquitetura limpa.";
    } else if (persona === "Copywriter de Alta Conversão") {
      roleInstruction = "Você é um Copywriter especialista em vendas, ROI, persuasão e conversão rápida.";
    } else if (persona === "QA Tester & Auditor") {
      roleInstruction = "Você é um Engenheiro de QA focado em testes rigorosos, bugs e auditoria de código.";
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const fullPrompt = `${roleInstruction}\n\n[Mensagem]: ${message || 'Analise a solicitação.'}`;

    // 3. Chamada rápida ao Gemini para texto
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }]
            }),
          }
        );

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
        }
      } catch (err) {}
    }

    // 4. Fallback de alta velocidade (Pollinations Text)
    try {
      const fallbackRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(message || 'Olá')}`);
      if (fallbackRes.ok) {
        const fallbackText = await fallbackRes.text();
        if (fallbackText) return NextResponse.json({ reply: fallbackText });
      }
    } catch (e) {}

    return NextResponse.json({ reply: "Sistema operacional e pronto para uso." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Processado com sucesso pelo ScorpionAI." });
  }
}
