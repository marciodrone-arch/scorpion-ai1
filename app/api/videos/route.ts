import { NextResponse } from "next/server";
import { auth } from "../../auth";
import { getPool } from "../../db";

export const runtime = "nodejs";
export const maxDuration = 60;

const VIDEO_MODEL = "xai/grok-imagine-video";
const VIDEO_DURATION_SECONDS = 5;
const VIDEO_RESOLUTION = "480p";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sua sessão expirou. Entre novamente para continuar." }, { status: 401 });
    }

    // Durante os testes, somente a conta administradora pode gerar vídeos.
    const admin = await getPool().query(
      'SELECT role FROM public."user" WHERE id = $1 AND banned = false LIMIT 1',
      [session.user.id]
    );
    if (admin.rows[0]?.role !== "admin") {
      return NextResponse.json(
        { error: "A geração de vídeos está em fase de testes e ainda não foi liberada para esta conta." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const aspectRatio = body?.aspectRatio === "9:16" ? "9:16" : "16:9";

    if (!prompt) {
      return NextResponse.json({ error: "Escreva uma descrição para o vídeo." }, { status: 400 });
    }
    if (prompt.length > 2000) {
      return NextResponse.json({ error: "A descrição deve ter no máximo 2.000 caracteres." }, { status: 413 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiToken) {
      return NextResponse.json({ error: "A integração com a Cloudflare não está configurada." }, { status: 503 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    let response: Response;
    try {
      const endpoint = "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/ai/run/" + VIDEO_MODEL;
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          duration: VIDEO_DURATION_SECONDS,
          aspect_ratio: aspectRatio,
          resolution: VIDEO_RESOLUTION,
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json().catch(() => null);
    if (!response.ok || data?.success === false) {
      const detail = data?.errors?.[0]?.message || data?.error?.message || "A Cloudflare não conseguiu gerar o vídeo.";
      console.error("[ScorpionAI] Erro na geração de vídeo:", response.status, detail);
      return NextResponse.json({ error: "Falha na geração: " + detail }, { status: response.status || 502 });
    }

    const videoUrl = data?.result?.video || data?.result?.video_url || data?.result?.url;
    if (!videoUrl || typeof videoUrl !== "string" || !/^https:\/\//i.test(videoUrl)) {
      console.error("[ScorpionAI] Resposta sem URL de vídeo:", JSON.stringify(data).slice(0, 1500));
      return NextResponse.json(
        { error: "A Cloudflare não retornou um endereço de vídeo válido. Tente novamente mais tarde." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      videoUrl,
      duration: VIDEO_DURATION_SECONDS,
      resolution: VIDEO_RESOLUTION,
      estimatedCostUsd: 0.25,
      provider: "Cloudflare Workers AI • Grok Imagine Video",
    });
  } catch (error) {
    console.error("[ScorpionAI] Falha na geração de vídeo:", error);
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "A geração demorou mais que o limite permitido. Nenhuma nova tentativa foi iniciada automaticamente." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado ao gerar o vídeo." },
      { status: 500 }
    );
  }
}
