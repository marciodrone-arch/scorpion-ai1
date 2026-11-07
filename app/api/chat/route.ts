import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, image, persona } = await req.json();
    const lowerMsg = message ? message.toLowerCase() : '';

    // 1. Geração de Imagens via Pollinations.ai
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

    // 2. Definição da Persona Dinâmica
    let roleInstruction = "Você é o ScorpionAI, um assistente de elite, direto e em Português do Brasil.";
    if (persona === "Arquiteto de Software Sênior") {
      roleInstruction = "Você é um Arquiteto de Software Sênior especializado em microsserviços, C#, Cloud e arquitetura limpa. Seja técnico e preciso.";
    } else if (persona === "Copywriter de Alta Conversão") {
      roleInstruction = "Você é um Copywriter especialista em vendas, foco em ROI, persuasão, engajamento e conversão.";
    } else if (persona === "QA Tester & Auditor") {
      roleInstruction = "Você é um Engenheiro de QA focado em testes rigorosos, detecção de bugs, validação de software e auditoria de código.";
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const parts: any[] = [{ text: `${roleInstruction}\n\n[Solicitação do Usuário]: ${message || 'Analise esta imagem.'}` }];

    // 3. Suporte a Upload de Imagem / Print (Multimodal)
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

    // 4. Chamada principal ultra-rápida ao Gemini
    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] }),
            signal: controller.signal
          }
        );
        clearTimeout(timeoutId);

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
        }
      } catch (err) {}
    }

    // Fallback leve via Pollinations Text para texto puro
    if (!image) {
      try {
        const fallbackRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(message)}`);
        if (fallbackRes.ok) {
          const fallbackText = await fallbackRes.text();
          if (fallbackText) return NextResponse.json({ reply: fallbackText });
        }
      } catch (e) {}
    }

    return NextResponse.json({ reply: "Sistema pronto. Como posso ajudar com este projeto?" });

  } catch (error: any) {
    return NextResponse.json({ reply: "Erro interno processando a solicitação." }, { status: 500 });
  }
}
