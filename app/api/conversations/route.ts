
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";
import { getPool } from "../../db";
import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const pool = getPool();

    const result = await pool.query(
      `SELECT
        c.id,
        c.title,
        c."createdAt",
        c."updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', m.id,
              'role', m.role,
              'parts', m.parts,
              'createdAt', m."createdAt"
            )
            ORDER BY m."createdAt"
          ) FILTER (WHERE m.id IS NOT NULL),
          '[]'::json
        ) AS messages
      FROM public.conversations c
      LEFT JOIN public.messages m
        ON m."conversationId" = c.id
        AND m."userId" = c."userId"
      WHERE c."userId" = $1
      GROUP BY c.id
      ORDER BY c."updatedAt" DESC`,
      [session.user.id]
    );

    return NextResponse.json({
      conversations: result.rows,
    });
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);

    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let client: PoolClient | null = null;
  let transactionStarted = false;

  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Só conecta ao banco depois de confirmar a autenticação.
    const pool = getPool();
    client = await pool.connect();

    const body = await req.json();
    const { id, messages } = body;
    const userId = session.user.id;

    if (
      typeof id !== "string" ||
      !id ||
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 100
    ) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const firstUserMessage = messages.find(
      (message: any) => message.role === "user"
    );

    if (!firstUserMessage) {
      return NextResponse.json(
        { error: "A conversa precisa ter uma mensagem do usuário" },
        { status: 400 }
      );
    }

    const title =
      String(firstUserMessage.content || "Nova conversa")
        .replace(/\s+/g, " ")
        .slice(0, 80) || "Nova conversa";

    await client.query("BEGIN");
    transactionStarted = true;

    const conversation = await client.query(
      `INSERT INTO public.conversations
        (id, "userId", title, "updatedAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           "updatedAt" = NOW()
       WHERE public.conversations."userId" = EXCLUDED."userId"
       RETURNING id`,
      [id, userId, title]
    );

    if (conversation.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 }
      );
    }

    await client.query(
      `DELETE FROM public.messages
       WHERE "conversationId" = $1
       AND "userId" = $2`,
      [id, userId]
    );

    for (const message of messages) {
      if (
        !["user", "assistant"].includes(message.role) ||
        typeof message.content !== "string"
      ) {
        continue;
      }

      const parts = [
        {
          type: "text",
          text: message.content,
        },
      ];

      if (message.imageUrl) {
        parts.push({
          type: "image",
          text: String(message.imageUrl),
        });
      }

      if (message.provider) {
        parts.push({
          type: "provider",
          text: String(message.provider),
        });
      }

      await client.query(
        `INSERT INTO public.messages
          (id, "conversationId", "userId", role, parts)
         VALUES ($1, $2, $3, $4, $5::jsonb)`,
        [
          randomUUID(),
          id,
          userId,
          message.role,
          JSON.stringify(parts),
        ]
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json({
      success: true,
      message: "Histórico salvo com sucesso",
    });
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Erro ao desfazer transação:", rollbackError);
      }
    }

    console.error("Erro ao salvar conversa:", error);

    return NextResponse.json(
      { error: "Erro ao salvar histórico" },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}
