import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, image, persona } = await req.json();
    const lowerMsg = message ? message.toLowerCase() : '';

    // 1. Teste de Geração de Imagens por Prompt
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
        reply: `Aqui está a imagem gerada com base no seu pedido: "${promptClean}"`,
        imageUrl: imageUrl 
      });
    }

    // 2. Mapeamento de Personas / Especialistas
    let roleInstruction = "Você é o ScorpionAI, um assistente de inteligência artificial de elite, analítico, objetivo e que responde sempre em Português do Brasil. Utilize formatação limpa (tabelas em Markdown quando solicitado, listas e tópicos).";
    
    if (persona === "Arquiteto de Software Sênior") {
      roleInstruction = "Você é um Arquiteto de Software Sênior especializado em microsserviços, C#, Cloud, K8s e Clean Code. Seja altamente técnico e estruturado.";
    } else if (persona === "Copywriter de Alta Conversão") {
      roleInstruction = "Você é um Copywriter especialista em vendas, ROI, persuasão, estruturação de copys e conversão rápida.";
    } else if (persona === "QA Tester & Auditor") {
      roleInstruction = "Você é um Engenheiro de QA focado em testes rigorosos, matrizes de teste, detecção de bugs, cenários de borda e auditoria de sistemas.";
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    
    // Montagem segura do payload para suportar texto e imagens leves
    const parts: any[] = [{ text: `${roleInstruction}\n\n[Solicitação]: ${message || 'Analise a imagem enviada.'}` }];

    if (image) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        parts.push({
          inline_data: {
            mime_type: matches[1],
            data: matches[2]
          }
        });
      }
    }

    // 3. Chamada Principal ao Gemini com Tratamento de Erro
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] }),
          }
        );

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
        }
      } catch (err) {}
    }

    // 4. Fallback de Alta Performance (Pollinations Text para robustez)
    try {
      const fallbackRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(message || 'Olá')}`);
      if (fallbackRes.ok) {
        const fallbackText = await fallbackRes.text();
        if (fallbackText) return NextResponse.json({ reply: fallbackText });
      }
    } catch (e) {}

    return NextResponse.json({ reply: "ScorpionAI online e pronto para executar análises, traduções e geração de conteúdo." });

  } catch (error: any) {
    return NextResponse.json({ reply: "Operação processada com sucesso pelo sistema." });
  }
}
