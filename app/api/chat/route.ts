            const statusResponse = await fetch(
              `${apiBase}/generate/status/${submitted.id}`,
              { headers, cache: "no-store" }
            );

            const status = await readResponse(statusResponse);

            if (!statusResponse.ok) {
              throw new Error("Não foi possível recuperar a imagem gerada.");
            }

            const generatedImage = status?.generations?.[0]?.img;

            if (typeof generatedImage === "string" && generatedImage.trim()) {
              const imageValue = generatedImage.trim();

              imageUrl = imageValue.startsWith("data:image/")
                ? imageValue
                : imageValue.startsWith("https://") ||
                    imageValue.startsWith("http://")
                  ? imageValue
                  : `data:image/webp;base64,${imageValue}`;
            }

            break;
          }
        }

        if (!imageUrl) {
          return NextResponse.json(
            {
              reply: "A fila gratuita do AI Horde está demorando. Tente gerar novamente em alguns instantes.",
              provider: "AI Horde",
            },
            { status: 504 }
          );
        }

        return NextResponse.json({
          reply: `Aqui está a imagem gerada para: "${prompt}"`,
          imageUrl,
          provider: "AI Horde",
          model: "AlbedoBase XL (SDXL)",
        });
      } catch (error) {
        const detail =
          error instanceof Error ? error.message : "Erro desconhecido";

        console.error("[ScorpionAI] Falha no AI Horde:", detail);

        return NextResponse.json(
          {
            reply: `Não foi possível gerar a imagem: ${detail}`,
            provider: "AI Horde",
          },
          { status: 502 }
        );
      }
    }

    const errors: string[] = [];

    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await askGemini(messages, persona);
        console.info("[ScorpionAI] Resposta recebida:", result.provider, result.model);
        return NextResponse.json(result);
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Erro desconhecido";
        errors.push(detail);
        console.error("[ScorpionAI] Falha no Gemini:", detail);
      }
    } else {
      errors.push("GEMINI_API_KEY não configurada.");
    }

    if (process.env.GROQ_API_KEY) {
      try {
        const result = await askGroq(messages, persona);
        console.info("[ScorpionAI] Resposta recebida:", result.provider, result.model);
        return NextResponse.json({ ...result, fallback: true });
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Erro desconhecido";
        errors.push(detail);
        console.error("[ScorpionAI] Falha no Groq:", detail);
      }
    } else {
      errors.push("GROQ_API_KEY não configurada.");
    }

    return NextResponse.json(
      {
        reply: "Não foi possível obter resposta dos provedores de IA.\n\nDetalhes: " + errors.join(" | "),
        provider: null,
        errors,
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("[ScorpionAI] Erro geral:", error);
    return NextResponse.json(
      { reply: "Erro interno ao processar sua mensagem. Tente novamente." },
      { status: 500 }
    );
  }
}
