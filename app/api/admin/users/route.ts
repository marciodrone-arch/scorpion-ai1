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
    if (!admin) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });

    const [usersResult, statsResult, paymentsResult, plansResult] = await Promise.all([
      getPool().query(`
        SELECT
          u.id, u.name, u.email, u."createdAt", u.banned,
          s.status AS "subscriptionStatus", s."currentPeriodEnd",
          p.name AS "planName", p."priceCents" AS "planPriceCents",
          COALESCE(activity.sessions, 0)::int AS "sessionCount",
          activity."lastAccess",
          COALESCE(usage."messages30d", 0)::int AS "messages30d"
        FROM public."user" u
        LEFT JOIN public.subscriptions s ON s."userId" = u.id
        LEFT JOIN public.plans p ON p.id = s."planId"
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS sessions, MAX("createdAt") AS "lastAccess"
          FROM public.session se WHERE se."userId" = u.id
        ) activity ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(messages), 0) AS "messages30d"
          FROM public.usage_daily ud
          WHERE ud."userId" = u.id AND ud.day >= CURRENT_DATE - INTERVAL '29 days'
        ) usage ON true
        WHERE u.role <> 'admin'
        ORDER BY u."createdAt" DESC
        LIMIT 500
      `),
      getPool().query(`
        SELECT
          (SELECT COUNT(*)::int FROM public."user" WHERE role <> 'admin') AS "totalUsers",
          (SELECT COUNT(*)::int FROM public."user" WHERE role <> 'admin' AND "createdAt" >= CURRENT_DATE) AS "signupsToday",
          (SELECT COUNT(*)::int FROM public."user" WHERE role <> 'admin' AND "createdAt" >= NOW() - INTERVAL '7 days') AS "signups7d",
          (SELECT COUNT(*)::int FROM public.subscriptions s JOIN public."user" u ON u.id = s."userId"
            WHERE u.role <> 'admin' AND u.banned = false AND s."planId" = 'premium'
            AND s.status = 'active' AND s."currentPeriodEnd" > NOW()) AS "activePremium",
          (SELECT COUNT(*)::int FROM public.payments WHERE status = 'confirmed_manual') AS "confirmedPayments",
          (SELECT COALESCE(SUM("amountCents"), 0)::int FROM public.payments WHERE status = 'confirmed_manual') AS "confirmedAmountCents",
          (SELECT COUNT(*)::int FROM public.payments WHERE status NOT IN ('confirmed_manual', 'failed', 'canceled')) AS "otherPayments",
          (SELECT COUNT(*)::int FROM public.session WHERE "createdAt" >= CURRENT_DATE) AS "sessionsToday",
          (SELECT COUNT(DISTINCT "userId")::int FROM public.session WHERE "createdAt" >= CURRENT_DATE) AS "uniqueVisitorsToday",
          (SELECT COUNT(*)::int FROM public.session WHERE "createdAt" >= NOW() - INTERVAL '7 days') AS "sessions7d",
          (SELECT COUNT(*)::int FROM public.messages WHERE role = 'user' AND "createdAt" >= CURRENT_DATE) AS "messagesToday",
          (SELECT COUNT(*)::int FROM public.conversations) AS "totalConversations",
          (SELECT COUNT(*)::int FROM public.conversations WHERE "createdAt" >= CURRENT_DATE) AS "conversationsToday",
          (SELECT COALESCE(SUM("inputTokens" + "outputTokens"), 0)::bigint FROM public.usage_daily WHERE day >= CURRENT_DATE - INTERVAL '29 days') AS "tokens30d"
      `),
      getPool().query(`
        SELECT pay.id, pay."amountCents", pay.currency, pay.status, pay."createdAt",
          u.name AS "userName", u.email AS "userEmail", p.name AS "planName"
        FROM public.payments pay
        LEFT JOIN public."user" u ON u.id = pay."userId"
        LEFT JOIN public.plans p ON p.id = pay."planId"
        ORDER BY pay."createdAt" DESC LIMIT 25
      `),
      getPool().query(`
        SELECT id, name, description, "priceCents", "dailyMessages", "maxInputChars",
          "maxOutputTokens", "historyDays", active
        FROM public.plans ORDER BY "sortOrder", name
      `)
    ]);

    return NextResponse.json({
      users: usersResult.rows,
      stats: statsResult.rows[0],
      recentPayments: paymentsResult.rows,
      plans: plansResult.rows,
    });
  } catch (error) {
    console.error("[ScorpionAI admin] Erro ao carregar painel:", error);
    return NextResponse.json({ error: "Não foi possível carregar os dados administrativos." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const client = await getPool().connect();
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });

    const body = await req.json();
    const userId = typeof body?.userId === "string" ? body.userId : "";
    const action = body?.action;
    if (!userId || !["activate", "cancel"].includes(action)) {
      return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 });
    }

    const target = await client.query(
      'SELECT id FROM public."user" WHERE id = $1 AND role <> \'admin\' LIMIT 1',
      [userId]
    );
    if (!target.rowCount) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

    await client.query("BEGIN");
    if (action === "activate") {
      await client.query(`
        INSERT INTO public.subscriptions
          ("userId", "planId", status, "currentPeriodEnd", "cancelAtPeriodEnd", "createdAt", "updatedAt")
        VALUES ($1, 'premium', 'active', NOW() + INTERVAL '30 days', false, NOW(), NOW())
        ON CONFLICT ("userId") DO UPDATE SET
          "planId" = 'premium', status = 'active',
          "currentPeriodEnd" = GREATEST(COALESCE(subscriptions."currentPeriodEnd", NOW()), NOW()) + INTERVAL '30 days',
          "cancelAtPeriodEnd" = false, "updatedAt" = NOW()
      `, [userId]);
      await client.query(`
        INSERT INTO public.payments
          (id, "userId", "planId", "amountCents", "feeCents", currency, status, "createdAt", "updatedAt")
        VALUES ($1, $2, 'premium', 990, 0, 'BRL', 'confirmed_manual', NOW(), NOW())
      `, [randomUUID(), userId]);
    } else {
      await client.query(`
        UPDATE public.subscriptions SET status = 'canceled',
          "currentPeriodEnd" = NOW(), "cancelAtPeriodEnd" = false, "updatedAt" = NOW()
        WHERE "userId" = $1
      `, [userId]);
    }
    await client.query("COMMIT");
    return NextResponse.json({
      success: true,
      message: action === "activate"
        ? "Premium ativado por 30 dias e pagamento registrado."
        : "Assinatura cancelada."
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("[ScorpionAI admin] Erro ao atualizar assinatura:", error);
    return NextResponse.json({ error: "Não foi possível atualizar a assinatura." }, { status: 500 });
  } finally {
    client.release();
  }
}
