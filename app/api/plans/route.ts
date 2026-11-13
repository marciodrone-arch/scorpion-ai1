import { NextResponse } from "next/server";
import { getPool } from "../../db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getPool().query(
      `SELECT id, name, description, "priceCents", "dailyMessages"
       FROM public.plans
       WHERE active = true AND id IN ('free', 'premium')
       ORDER BY "sortOrder", name`
    );
    return NextResponse.json({ plans: result.rows }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[ScorpionAI] Falha ao carregar planos públicos:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os planos." },
      { status: 503 }
    );
  }
}
