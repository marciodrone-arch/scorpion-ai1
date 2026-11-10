
import { NextResponse } from "next/server";
import { getPool } from "../../db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const pool = getPool();

    const result = await pool.query(`
      INSERT INTO scorpion_rate_limits
        (id, request_count, window_start, updated_at)
      VALUES
        ('diagnostico-scorpion', 1, NOW(), NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        request_count = scorpion_rate_limits.request_count + 1,
        updated_at = NOW()
      RETURNING id, request_count
    `);

    return NextResponse.json({
      success: true,
      message: "Gravação no Neon funcionando!",
      registro: result.rows[0],
    });
  } catch (error) {
    console.error("[ScorpionAI] Erro de gravação:", error);

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    }, { status: 500 });
  }
}
