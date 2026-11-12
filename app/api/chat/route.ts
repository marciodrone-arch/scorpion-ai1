    : [];

  const cleanMessage =
    typeof message === "string" ? message.trim() : "";

  if (cleanMessage) {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user" || last.content !== cleanMessage) {
      messages.push({ role: "user", content: cleanMessage });
    }
  }

  while (messages.length && messages[0].role === "assistant") {
    messages.shift();
  }

  return messages.slice(-MAX_HISTORY_MESSAGES);
}

// Reconhece pedidos de imagem em português e inglês.
function isImageRequest(message: string): boolean {
  const explicitImageRequest =
    /\b(gerar|gere|crie|criar|desenhe|desenhar|faça|fazer|produza|produzir|generate|create|draw|make|produce)\s+(an?\s+|uma?\s+)?(imagem|image|picture|foto|photo|ilustração|illustration|desenho|drawing|arte|art)\b/i.test(message) ||
    /\b(imagem|image|picture|foto|photo|ilustração|illustration|desenho|drawing)\s+(de|of)\b/i.test(message);

  if (explicitImageRequest) return true;

  const textRequest =
    /\b(texto|história|historinha|resumo|redação|artigo|poema|poesia|roteiro|e-mail|email|mensagem|relatório|explicação|tradução|código|programa|lista|plano|receita escrita|essay|story|summary|article|poem|email|report|explanation|translation|code|program|recipe)\b/i.test(
      message
    );

  if (textRequest) return false;

  const creationVerb =
    /\b(crie|criar|gere|gerar|desenhe|desenhar|ilustre|ilustrar|pinte|pintar|faça|fazer|produza|produzir|create|generate|draw|illustrate|paint|make|produce)\b/i.test(
      message
    );

  const visualSubject =
    /\b(dragão|dragões|animal|animais|cachorro|cães|gato|gatos|leão|leões|lobo|lobos|cavalo|cavalos|pássaro|pássaros|borboleta|borboletas|peixe|peixes|personagem|personagens|robô|robôs|carro|carros|moto|motos|avião|aviões|casa|casas|castelo|castelos|paisagem|paisagens|floresta|florestas|montanha|montanhas|praia|praias|cidade|cidades|planeta|planetas|espaço|galáxia|galáxias|universo|árvore|árvores|flor|flores|jardim|jardins|logo|logotipo|símbolo|ícone|ícones|cartaz|pôster|poster|banner|capa|adesivo|sticker|mascote|mascotes|ilustração|ilustrações|desenho|desenhos|arte|escultura|esculturas|avatar|avatares|retrato|retratos|monstro|monstros|foguete|foguetes|navio|navios|barco|barcos|objeto|objetos|produto|produtos|dragon|animal|animals|dog|dogs|cat|cats|lion|lions|wolf|wolves|horse|horses|bird|birds|butterfly|butterflies|fish|character|characters|robot|robots|car|cars|motorcycle|airplane|house|castle|landscape|forest|mountain|beach|city|planet|space|galaxy|universe|tree|flower|garden|logo|symbol|icon|poster|banner|cover|sticker|mascot|illustration|drawing|art|sculpture|avatar|portrait|monster|rocket|ship|boat|object|product|apple|apples|fruit|fruits)\b/i.test(
      message
    );

  return creationVerb && visualSubject;
}

function getImagePrompt(message: string): string {
  return (
    message
      .replace(
        /^(por favor,?\s*)?(gere|gerar|crie|criar|desenhe|desenhar|ilustre|ilustrar|pinte|pintar|faça|fazer|produza|produzir|generate|create|draw|illustrate|paint|make|produce)\s+(an?\s+|uma?\s+)?(imagem|image|picture|foto|photo|ilustração|illustration|desenho|drawing|arte|art)\s*(de|do|da|of)?/i,
        ""
      )
      .replace(
        /^(por favor,?\s*)?(gere|gerar|crie|criar|desenhe|desenhar|ilustre|ilustrar|pinte|pintar|faça|fazer|produza|produzir|generate|create|draw|illustrate|paint|make|produce)\s+(an?\s+|uma?\s+)?/i,
        ""
      )
      .trim() || message
  );
}

function buildImagePrompt(message: string): string {
  const prompt = getImagePrompt(message);

  // Dá instruções mais concretas quando o pedido é uma maçã.
  if (/\b(maçã|maçãs|apple|apples)\b/i.test(prompt)) {
    return "one single real red apple fruit, unmistakably an apple, natural slightly asymmetrical apple shape, visible short brown stem and one small green leaf, smooth natural red apple skin with subtle texture, isolated and centered, pure white seamless studio background, professional photorealistic product photography, soft even studio lighting, sharp focus, no other objects";
  }

  return `${prompt}, one clearly recognizable main subject, accurate object shape and proportions, isolated and centered, pure white seamless studio background, professional photorealistic product photography, soft even studio lighting, sharp focus, no other objects`;
}

async function readResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: { message: text.slice(0, 500) } };
  }
}

async function askGemini(messages: ChatMessage[], persona: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const timeout = withTimeout(20000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: SYSTEM_PROMPT + `\nEspecialidade selecionada: ${persona}.`,
            }],
          },
          contents: messages.map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.content }],
          })),
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
        signal: timeout.signal,
        cache: "no-store",
      }
    );

    const data = await readResponse(response);
    if (!response.ok) {
      throw new Error(
        `Gemini HTTP ${response.status}: ${data?.error?.message || "Erro na API"}`
      );
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    if (!reply) throw new Error("Gemini retornou resposta vazia.");
    return { reply, provider: "Gemini", model };
  } catch (error) {
    if (timeout.signal.aborted) {
      throw new Error("Gemini: tempo limite de 20 segundos excedido.");
    }
    throw error;
  } finally {
    timeout.clear();
  }
}

async function askGroq(messages: ChatMessage[], persona: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY não configurada.");

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const timeout = withTimeout(20000);

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT + `\nEspecialidade selecionada: ${persona}.`,
            },
            ...messages.map((item) => ({
              role: item.role,
              content: item.content,
            })),
          ],
          temperature: 0.7,
          max_completion_tokens: 4096,
        }),
        signal: timeout.signal,
        cache: "no-store",
      }
    );

    const data = await readResponse(response);
    if (!response.ok) {
      throw new Error(
        `Groq HTTP ${response.status}: ${data?.error?.message || "Erro na API"}`
      );
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Groq retornou resposta vazia.");
    return { reply, provider: "Groq", model };
  } catch (error) {
    if (timeout.signal.aborted) {
      throw new Error("Groq: tempo limite de 20 segundos excedido.");
    }
