
import { NextResponse } from "next/server";
import { getPool } from "../../db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await getPool().query("SELECT NOW() AS connected_at");

    return NextResponse.json({
      success: true,
      message: "Conexão com Neon funcionando!",
      connected: true,
      timestamp: result.rows[0].connected_at,
    });
  } catch (error) {
    console.error("[ScorpionAI] Erro no teste Neon:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Não foi possível conectar ao banco.",
      },
      { status: 500 }
    );
  }
}
