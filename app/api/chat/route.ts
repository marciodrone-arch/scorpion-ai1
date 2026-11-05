
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `
Você é a ScorpionAI, uma assistente de inteligência artificial
avançada, versátil, confiável e humanizada.

IDIOMA:
- Utilize português brasileiro como padrão.
- Responda no idioma utilizado pelo usuário.
- Utilize linguagem natural, clara e profissional.

COMPORTAMENTO:
- Compreenda a intenção antes de responder.
- Considere todo o contexto e histórico recebido.
- Seja objetiva em perguntas simples e detalhada em questões complexas.
- Explique procedimentos passo a passo quando necessário.
- Não faça perguntas desnecessárias.
- Não repita informações sem necessidade.
- Seja educada, paciente e empática.

PRECISÃO:
- Nunca invente informações, fontes, links ou resultados.
- Diferencie fatos de suposições.
- Informe quando não souber alguma coisa.
- Não afirme que pesquisou na internet se não utilizou uma ferramenta de pesquisa.
- Não invente acesso a dados em tempo real.

CONHECIMENTO:
Você deve auxiliar em tecnologia, programação, inteligência artificial,
ciência, educação, matemática, negócios, administração, finanças,
redação, pesquisa e conhecimentos gerais.

PROGRAMAÇÃO:
- Produza códigos organizados e completos.
- Explique como implementar as soluções.
- Identifique dependências e possíveis erros.
- Considere segurança e boas práticas.
- Preserve funcionalidades existentes ao corrigir projetos.

RESOLUÇÃO DE PROBLEMAS:
- Identifique a causa provável.
- Apresente soluções práticas.
- Organize instruções em etapas.
- Ofereça alternativas quando necessário.

MEMÓRIA:
- Utilize o histórico disponibilizado.
- Nunca invente lembranças.
- Não afirme possuir memória permanente sem que ela esteja implementada.

FERRAMENTAS:
- Utilize somente ferramentas efetivamente disponibilizadas.
- Não simule pesquisas, cálculos ou operações externas.
- Seja transparente sobre suas limitações.

SEGURANÇA:
- Não exponha credenciais, senhas ou informações confidenciais.
- Não execute ações externas sem autorização apropriada.

OBJETIVO:
Oferecer respostas inteligentes, precisas, úteis e naturais,
proporcionando uma experiência de assistência de alta qualidade.
`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

async function callGroq(
  messages: Array<{ role: string; content: string }>
) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY não configurada.");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages,
        temperature: 0.6,
        max_tokens: 2500,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Falha na comunicação com Groq."
    );
  }

  const reply = data.choices?.[0]?.message?.content;

  if (!reply || typeof reply !== "string") {
    throw new Error("A Groq retornou uma resposta vazia.");
  }

  return reply;
}

async function callGemini(history: ChatMessage[]) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const contents = history.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2500,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Falha na comunicação com Gemini."
    );
  }

  const reply = data.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || "")
    .join("")
    .trim();

  if (!reply) {
    throw new Error("O Gemini retornou uma resposta vazia.");
  }

  return reply;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let history: ChatMessage[] = [];

    if (Array.isArray(body.history)) {
      history = body.history
        .filter(
          (item: any) =>
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string" &&
            item.content.trim().length > 0
        )
        .slice(-12)
        .map((item: ChatMessage) => ({
          role: item.role,
          content: item.content.trim().slice(0, 12000),
        }));
    }

    // Compatibilidade com a interface antiga.
    if (typeof body.message === "string" && body.message.trim()) {
      history.push({
        role: "user",
        content: body.message.trim().slice(0, 12000),
      });
    }

    if (history.length === 0 || history[history.length - 1].role !== "user") {
      return NextResponse.json(
        { error: "Envie uma mensagem válida." },
        { status: 400 }
      );
    }

    const groqMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];

    // 1. Provedor principal: Groq.
    if (process.env.GROQ_API_KEY) {
      try {
        const reply = await callGroq(groqMessages);

        return NextResponse.json({
          reply,
          provider: "Groq",
        });
      } catch (error) {
        console.error("Falha na Groq:", error);
      }
    }

    // 2. Provedor secundário: Gemini.
    if (process.env.GEMINI_API_KEY) {
      try {
        const reply = await callGemini(history);

        return NextResponse.json({
          reply,
          provider: "Gemini",
        });
      } catch (error) {
        console.error("Falha no Gemini:", error);
      }
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível obter resposta dos provedores de IA. Verifique as chaves e os modelos configurados.",
      },
      { status: 503 }
    );

  } catch (error) {
    console.error("Erro na API ScorpionAI:", error);

    return NextResponse.json(
      { error: "Erro interno ao processar sua mensagem." },
      { status: 500 }
    );
  }
}
