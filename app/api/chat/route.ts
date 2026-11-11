
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "../../auth";
import { getPool } from "../../db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  provider?: string;
};

const MAX_BODY_BYTES = 250_000;
const MAX_MESSAGES = 100;
const MAX_CONTENT_LENGTH = 20_000;

function getMessageData(parts: unknown) {
  let value = parts;

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      value = {};
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const data = value as Record<string, unknown>;

    return {
      content: typeof data.content === "string" ? data.content : "",
      imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : undefined,
      provider: typeof data.provider === "string" ? data.provider : undefined,
    };
  }

  return { content: "", imageUrl: undefined, provider: undefined };
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Faça login para acessar seu histórico." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const pool = getPool();

    const conversations = await pool.query(
      `
      SELECT
        id,
        title,
        "createdAt",
        "updatedAt"
      FROM conversations
      WHERE "userId" = $1
      ORDER BY "updatedAt" DESC
      LIMIT 50
      `,
      [userId]
    );

    if (conversations.rows.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const ids = conversations.rows.map((item) => item.id);

    const messages = await pool.query(
      `
      SELECT
        id,
        "conversationId",
        role,
        parts,
        "createdAt"
      FROM messages
      WHERE "userId" = $1
        AND "conversationId" = ANY($2::text[])
      ORDER BY "createdAt" ASC
      `,
      [userId, ids]
    );

    const messagesByConversation = new Map<string, unknown[]>();

    for (const item of messages.rows) {
      const data = getMessageData(item.parts);
      const list = messagesByConversation.get(item.conversationId) || [];

      list.push({
        role: item.role,
        content: data.content,
        imageUrl: data.imageUrl,
        provider: data.provider,
      });

      messagesByConversation.set(item.conversationId, list);
    }

    const result = conversations.rows.map((item) => ({
      id: item.id,
      title: item.title,
      updatedAt: new Date(item.updatedAt).getTime(),
      messages: messagesByConversation.get(item.id) || [],
    }));

    return NextResponse.json(
      { conversations: result },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[ScorpionAI] Erro ao carregar histórico:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar seu histórico." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let client;

  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Faça login para salvar suas conversas." },
        { status: 401 }
      );
    }

    const contentLength = Number(req.headers.get("content-length") || 0);

    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Conteúdo muito grande." },
        { status: 413 }
      );
    }

    const rawBody = await req.text();

    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Conteúdo muito grande." },
        { status: 413 }
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const conversationId =
      typeof data.conversationId === "string"
        ? data.conversationId.trim()
        : "";

    if (!conversationId || conversationId.length > 100) {
      return NextResponse.json(
        { error: "Identificador de conversa inválido." },
        { status: 400 }
      );
    }

    if (!Array.isArray(data.messages) || data.messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: "Quantidade de mensagens inválida." },
        { status: 400 }
      );
    }

    const cleanMessages: ChatMessage[] = [];

    for (const item of data.messages) {
      if (
        !item ||
        typeof item !== "object" ||
        !("role" in item) ||
        !("content" in item)
      ) {
        return NextResponse.json(
          { error: "Mensagem inválida." },
          { status: 400 }
        );
      }

      const message = item as Record<string, unknown>;

      if (
        (message.role !== "user" && message.role !== "assistant") ||
        typeof message.content !== "string" ||
        message.content.length > MAX_CONTENT_LENGTH
      ) {
        return NextResponse.json(
          { error: "Conteúdo de mensagem inválido." },
          { status: 400 }
        );
      }

      cleanMessages.push({
        role: message.role,
        content: message.content,
        imageUrl:
          typeof message.imageUrl === "string"
            ? message.imageUrl.slice(0, 5000)
            : undefined,
        provider:
          typeof message.provider === "string"
            ? message.provider.slice(0, 100)
            : undefined,
      });
    }

    const firstUserMessage = cleanMessages.find(
      (item) => item.role === "user"
    );

    if (!firstUserMessage) {
      return NextResponse.json(
        { error: "A conversa ainda não possui mensagens do usuário." },
        { status: 400 }
      );
    }

    const title =
      firstUserMessage.content.length > 35
        ? firstUserMessage.content.slice(0, 35) + "..."
        : firstUserMessage.content;

    const userId = session.user.id;
    const pool = getPool();

    client = await pool.connect();

    await client.query("BEGIN");

    const saved = await client.query(
      `
      INSERT INTO conversations
        (id, "userId", title, "createdAt", "updatedAt")
      VALUES
        ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        title = EXCLUDED.title,
        "updatedAt" = NOW()
      WHERE conversations."userId" = EXCLUDED."userId"
      RETURNING id
      `,
      [conversationId, userId, title]
    );

    if (saved.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { error: "Não foi possível salvar esta conversa." },
        { status: 409 }
      );
    }

    await client.query(
      `
      DELETE FROM messages
      WHERE "conversationId" = $1
        AND "userId" = $2
      `,
      [conversationId, userId]
    );

    for (const message of cleanMessages) {
      await client.query(
        `
        INSERT INTO messages
          (id, "conversationId", "userId", role, parts, "createdAt")
        VALUES
          ($1, $2, $3, $4, $5::jsonb, NOW())
        `,
        [
          randomUUID(),
          conversationId,
          userId,
          message.role,
          JSON.stringify({
            content: message.content,
            imageUrl: message.imageUrl,
            provider: message.provider,
          }),
        ]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      conversationId,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // A transação pode já ter sido encerrada.
      }
    }

    console.error("[ScorpionAI] Erro ao salvar histórico:", error);

    return NextResponse.json(
      { error: "Não foi possível salvar a conversa." },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}
