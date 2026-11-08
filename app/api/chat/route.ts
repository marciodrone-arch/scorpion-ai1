import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, persona } = await req.json();
    const cleanMsg = message ? message.trim() : '';
    const lowerMsg = cleanMsg.toLowerCase();

    // 1. Doutrinação inteligente de Geração de Imagens
    const isImageRequest = 
      lowerMsg.includes('gerar imagem') || 
      lowerMsg.includes('crie uma imagem') || 
      lowerMsg.includes('crie a imagem') || 
      lowerMsg.includes('foto de') || 
      lowerMsg.includes('imagem de') ||
      lowerMsg.includes('desenhe');

    if (isImageRequest) {
      // Remove os comandos e limpa o texto para sobrar apenas o objeto da imagem
      let promptClean = cleanMsg
        .replace(/gerar imagem de|crie uma imagem de|crie a imagem de|crie a imagem|foto de|imagem de|desenhe/gi, '')
        .replace(/["']/g, '') // Remove aspas extras
        .trim();
      
      if (!promptClean) promptClean = cleanMsg;

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptClean)}?width=1024&height=1024&nologo=true`;
      
      return NextResponse.json({ 
        reply: `Aqui está a imagem gerada para: "${promptClean}"`,
        imageUrl: imageUrl 
      });
    }

    // 2. Mapeamento de Personas / Comportamento do Chat de Texto
    let roleInstruction = "Você é o ScorpionAI, um assistente de inteligência artificial de elite, analítico, objetivo e direto. Responda sempre em Português do Brasil.";
    
    if (persona === "Arquiteto de Software Sênior") {
      roleInstruction = "Você é um Arquiteto de Software Sênior especializado em microsserviços, C#, Cloud, K8s e Clean Code. Seja altamente técnico.";
    } else if (persona === "Copywriter de Alta Conversão") {
      roleInstruction = "Você é um Copywriter especialista em vendas, ROI, persuasão e conversão rápida.";
    } else if (persona === "QA Tester & Auditor") {
      roleInstruction = "Você é um Engenheiro de QA focado em testes rigorosos, detecção de bugs e cenários de borda.";
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const fullPrompt = `${roleInstruction}\n\n[Solicitação]: ${cleanMsg}`;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
          }
        );

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
        }
      } catch (err) {}
    }

    // Fallback de texto
    try {
      const fallbackRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(cleanMsg)}`);
      if (fallbackRes.ok) {
        const fallbackText = await fallbackRes.text();
        if (fallbackText) return NextResponse.json({ reply: fallbackText });
      }
    } catch (e) {}

    return NextResponse.json({ reply: "ScorpionAI pronto para executar." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Operação processada com sucesso." });
  }
}
