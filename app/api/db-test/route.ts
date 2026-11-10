
import { NextResponse } from "next/server";
import { getPool } from "../../db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const pool = getPool();

    const result = await pool.query(`
      SELECT
        current_database() AS database_name,
        current_schema() AS schema_name,
        (
          SELECT COUNT(*)
          FROM scorpion_rate_limits
        ) AS total_registros
    `);

    return NextResponse.json({
      success: true,
      connected: true,
      database: result.rows[0].database_name,
      schema: result.rows[0].schema_name,
      total_registros: Number(result.rows[0].total_registros),
    });
  } catch (error) {
    console.error("[ScorpionAI] Diagnóstico Neon:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao consultar o banco de dados.",
      },
      { status: 500 }
    );
  }
}
