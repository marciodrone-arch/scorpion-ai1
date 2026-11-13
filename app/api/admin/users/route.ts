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

    const [usersResult, statsResult, paymentsResult, plansResult, trendResult] = await Promise.all([
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
      `),
      getPool().query(`
        WITH days AS (
          SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')::date AS day
        ),
        signups AS (
          SELECT "createdAt"::date AS day, COUNT(*)::int AS total
          FROM public."user" WHERE role <> 'admin' AND "createdAt" >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY 1
        ),
        sessions AS (
          SELECT "createdAt"::date AS day, COUNT(*)::int AS total
          FROM public.session WHERE "createdAt" >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY 1
        ),
        messages AS (
          SELECT "createdAt"::date AS day, COUNT(*)::int AS total
          FROM public.messages WHERE role = 'user' AND "createdAt" >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY 1
        ),
        revenue AS (
          SELECT "createdAt"::date AS day, COALESCE(SUM("amountCents"), 0)::int AS cents
          FROM public.payments WHERE status = 'confirmed_manual' AND "createdAt" >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY 1
        )
        SELECT days.day,
          COALESCE(signups.total, 0)::int AS signups,
          COALESCE(sessions.total, 0)::int AS sessions,
          COALESCE(messages.total, 0)::int AS messages,
          COALESCE(revenue.cents, 0)::int AS "revenueCents"
        FROM days
        LEFT JOIN signups USING (day)
        LEFT JOIN sessions USING (day)
        LEFT JOIN messages USING (day)
        LEFT JOIN revenue USING (day)
        ORDER BY days.day
      `)
    ]);

    return NextResponse.json({
      users: usersResult.rows,
      stats: statsResult.rows[0],
      recentPayments: paymentsResult.rows,
      plans: plansResult.rows,\n      trend: trendResult.rows,
    });
  } catch (error) {
    console.error("[ScorpionAI admin] Erro ao carregar painel:", error);
    return NextResponse.json({ error: "Não foi possível carregar os dados administrativos." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const client = await getPool().connect();
  let transactionStarted = false;
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });

    const body = await req.json();
    const action = body?.action;

    if (action === "updatePlan") {
      const planId = typeof body?.planId === "string" ? body.planId : "";
      const field = body?.field;
      const value = body?.value;
      if (!["free", "premium"].includes(planId) ||
          !["priceCents", "dailyMessages", "active"].includes(field)) {
        return NextResponse.json({ error: "Alteração de plano inválida." }, { status: 400 });
      }
      if (field === "active" && typeof value !== "boolean") {
        return NextResponse.json({ error: "Status inválido." }, { status: 400 });
      }
      if (field !== "active" && (!Number.isInteger(value) || value < 0 || value > 100000000)) {
        return NextResponse.json({ error: "Informe um valor numérico válido." }, { status: 400 });
      }
      const column = field === "priceCents" ? '"priceCents"' : field === "dailyMessages" ? '"dailyMessages"' : "active";
      const result = await client.query(
        `UPDATE public.plans SET ${column} = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id`,
        [value, planId]
      );
      if (!result.rowCount) return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
      return NextResponse.json({ success: true, message: "Plano atualizado com sucesso." });
    }

    const userId = typeof body?.userId === "string" ? body.userId : "";
    if (!userId || !["activate", "cancel", "ban", "unban"].includes(action)) {
      return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 });
    }
    const target = await client.query(
      'SELECT id FROM public."user" WHERE id = $1 AND role <> \'admin\' LIMIT 1',
      [userId]
    );
    if (!target.rowCount) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

    if (action === "ban" || action === "unban") {
      await client.query(
        'UPDATE public."user" SET banned = $1, "updatedAt" = NOW() WHERE id = $2',
        [action === "ban", userId]
      );
      if (action === "ban") {
        await client.query('DELETE FROM public.session WHERE "userId" = $1', [userId]);
      }
      return NextResponse.json({
        success: true,
        message: action === "ban" ? "Cliente bloqueado e sessões encerradas." : "Acesso do cliente desbloqueado."
      });
    }

    await client.query("BEGIN");
    transactionStarted = true;
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
    transactionStarted = false;
    return NextResponse.json({
      success: true,
      message: action === "activate"
        ? "Premium ativado por 30 dias e pagamento registrado."
        : "Assinatura cancelada."
    });
  } catch (error) {
    if (transactionStarted) await client.query("ROLLBACK").catch(() => undefined);
    console.error("[ScorpionAI admin] Erro ao executar ação administrativa:", error);
    return NextResponse.json({ error: "Não foi possível concluir a ação administrativa." }, { status: 500 });
  } finally {
    client.release();
  }
}
