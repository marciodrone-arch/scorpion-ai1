import { NextResponse } from "next/server";
import { auth } from "../../auth";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 5000;
const MAX_COLUMNS = 50;

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Selecione um arquivo CSV ou Excel." }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "O arquivo deve ter conteúdo e no máximo 5 MB." }, { status: 413 });
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx")) {
      return NextResponse.json({ error: "Formato não aceito. Envie CSV ou Excel (.xlsx)." }, { status: 415 });
    }

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: "array", cellDates: false });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json({ error: "A planilha não contém uma aba com dados." }, { status: 400 });
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
    if (!rows.length) {
      return NextResponse.json({ error: "A planilha está vazia." }, { status: 400 });
    }
    if (rows.length > MAX_ROWS + 1) {
      return NextResponse.json({ error: "A planilha ultrapassa o limite de 5.000 linhas de dados." }, { status: 413 });
    }

    const headers = (rows[0] || []).slice(0, MAX_COLUMNS).map((value, index) => {
      const label = String(value ?? "").trim();
      return label || "Coluna " + (index + 1);
    });
    if (!headers.length) {
      return NextResponse.json({ error: "Não foi possível identificar as colunas." }, { status: 400 });
    }

    const dataRows = rows.slice(1).filter((row) => row.some((value) => String(value ?? "").trim() !== ""));
    const summaries = headers.map((header, columnIndex) => {
      const values = dataRows.map((row) => row[columnIndex]);
      const numeric = values
        .map((value) => typeof value === "number" ? value : (typeof value === "string" && value.trim() !== "" ? Number(value.replace(",", ".")) : NaN))
        .filter((value) => Number.isFinite(value));
      if (!numeric.length) return { header, count: values.filter((value) => String(value ?? "").trim() !== "").length };
      const total = numeric.reduce((sum, value) => sum + value, 0);
      return { header, count: numeric.length, total, average: total / numeric.length, min: Math.min(...numeric), max: Math.max(...numeric) };
    });

    const lines = [
      "RELATÓRIO DE ANÁLISE DE PLANILHA",
      "",
      "Arquivo: " + file.name,
      "Aba analisada: " + firstSheetName,
      "Linhas de dados: " + dataRows.length,
      "Colunas identificadas: " + headers.length,
      "",
      "RESUMO DAS COLUNAS",
      ...summaries.map((item) => "• " + item.header + ": " + (item.total === undefined
        ? item.count + " células preenchidas"
        : item.count + " valores numéricos; total " + formatNumber(item.total) + "; média " + formatNumber(item.average!) + "; mínimo " + formatNumber(item.min!) + "; máximo " + formatNumber(item.max!))),
      "",
      "AMOSTRA DOS DADOS (até 5 primeiras linhas)",
      headers.join(" | "),
      ...dataRows.slice(0, 5).map((row) => headers.map((_, index) => String(row[index] ?? "")).join(" | ")),
      "",
      "Observação: os cálculos consideram apenas valores reconhecidos como numéricos. Confira datas, moedas e formatos especiais antes de tomar decisões."
    ];

    return NextResponse.json({ report: lines.join("\n"), rows: dataRows.length, columns: headers.length, sheet: firstSheetName });
  } catch (error) {
    console.error("[ScorpionAI] Erro na análise de planilha:", error);
    return NextResponse.json({ error: "Não foi possível ler a planilha. Verifique se o arquivo não está protegido ou danificado." }, { status: 500 });
  }
}
