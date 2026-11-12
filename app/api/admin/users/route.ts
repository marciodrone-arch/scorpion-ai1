import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "../../../auth";
import { getPool } from "../../../db";

export const runtime = "nodejs";

async function requireAdmin(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return null;

  const result = await getPool().query(
    'SELECT id, email, role FROM public."user" WHERE id = $1 AND banned = false LIMIT 1',
    [session.user.id]
  );

  const user = result.rows[0];
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const result = await getPool().query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u."createdAt",
        s.status AS "subscriptionStatus",
        s."currentPeriodEnd",
        p.name AS "planName"
      FROM public."user" u
      LEFT JOIN public.subscriptions s ON s."userId" = u.id
      LEFT JOIN public.plans p ON p.id = s."planId"
      WHERE u.banned = false
      ORDER BY u."createdAt" DESC
      LIMIT 200
      `
    );

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error("[ScorpionAI admin] Erro ao listar usuários:", error);
    return NextResponse.json({ error: "Não foi possível carregar os usuários." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const client = await getPool().connect();

  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await req.json();
    const userId = typeof body?.userId === "string" ? body.userId : "";
    const action = body?.action;

    if (!userId || !["activate", "cancel"].includes(action)) {
      return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 });
    }

    const target = await client.query(
      'SELECT id FROM public."user" WHERE id = $1 AND banned = false LIMIT 1',
      [userId]
    );

    if (!target.rowCount) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    await client.query("BEGIN");

    if (action === "activate") {
      await client.query(
        `
        INSERT INTO public.subscriptions
          ("userId", "planId", status, "currentPeriodEnd", "cancelAtPeriodEnd", "createdAt", "updatedAt")
        VALUES (
          $1,
          'premium',
          'active',
          NOW() + INTERVAL '30 days',
          false,
          NOW(),
          NOW()
        )
        ON CONFLICT ("userId") DO UPDATE SET
          "planId" = 'premium',
          status = 'active',
          "currentPeriodEnd" = GREATEST(
            COALESCE(public.subscriptions."currentPeriodEnd", NOW()),
            NOW()
          ) + INTERVAL '30 days',
          "cancelAtPeriodEnd" = false,
          "updatedAt" = NOW()
        `,
        [userId]
      );

      await client.query(
        `
        INSERT INTO public.payments
          (id, "userId", "planId", "amountCents", "feeCents", currency, status, "createdAt", "updatedAt")
        VALUES ($1, $2, 'premium', 990, 0, 'BRL', 'confirmed_manual', NOW(), NOW())
        `,
        [randomUUID(), userId]
      );
    } else {
      await client.query(
        `
        UPDATE public.subscriptions
        SET status = 'canceled',
            "currentPeriodEnd" = NOW(),
            "cancelAtPeriodEnd" = false,
            "updatedAt" = NOW()
        WHERE "userId" = $1
        `,
        [userId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({
      success: true,
      message: action === "activate"
        ? "Premium ativado por 30 dias e pagamento registrado."
        : "Assinatura cancelada.",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("[ScorpionAI admin] Erro ao atualizar assinatura:", error);
    return NextResponse.json({ error: "Não foi possível atualizar a assinatura." }, { status: 500 });
  } finally {
    client.release();
  }
}
