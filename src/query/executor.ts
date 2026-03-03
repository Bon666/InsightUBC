import type { Row } from "./types.js";
import { applyGroupApply } from "./groupApply.js";
import { multiKeySort } from "./sort.js";

export function executeQuery(data: Row[], query: any): Row[] {
  const filtered = query.WHERE ? data.filter((row) => evalWhere(row, query.WHERE)) : data.slice();

  const transformed = query.TRANSFORMATIONS ? applyGroupApply(filtered, query.TRANSFORMATIONS) : filtered;

  const cols: string[] = query.OPTIONS?.COLUMNS ?? [];
  const projected = cols.length ? transformed.map((r) => project(r, cols)) : transformed;

  if (query.OPTIONS?.ORDER) {
    return multiKeySort(projected, query.OPTIONS.ORDER);
  }
  return projected;
}

function project(row: Row, cols: string[]): Row {
  const out: Row = {};
  for (const c of cols) out[c] = row[c];
  return out;
}

function evalWhere(row: Row, where: any): boolean {
  if (!where || Object.keys(where).length === 0) return true;

  if (where.AND) return where.AND.every((w: any) => evalWhere(row, w));
  if (where.OR) return where.OR.some((w: any) => evalWhere(row, w));
  if (where.NOT) return !evalWhere(row, where.NOT);

  if (where.GT) return compareNum(row, where.GT, (a, b) => a > b);
  if (where.LT) return compareNum(row, where.LT, (a, b) => a < b);
  if (where.EQ) return compareNum(row, where.EQ, (a, b) => a === b);

  if (where.IS) {
    const k = Object.keys(where.IS)[0];
    const v = String(Object.values(where.IS)[0]);
    const s = String(row[k] ?? "");
    return wildcardMatch(s, v);
  }

  throw new Error("Invalid WHERE clause");
}

function compareNum(row: Row, obj: any, fn: (a: number, b: number) => boolean): boolean {
  const k = Object.keys(obj)[0];
  const v = Number(Object.values(obj)[0]);
  const x = Number(row[k]);
  if (!Number.isFinite(x) || !Number.isFinite(v)) return false;
  return fn(x, v);
}

function wildcardMatch(text: string, pattern: string): boolean {
  if (pattern === "*") return true;
  const starts = pattern.startsWith("*");
  const ends = pattern.endsWith("*");
  const core = pattern.replace(/^\*/, "").replace(/\*$/, "");

  if (starts && ends) return text.includes(core);
  if (starts) return text.endsWith(core);
  if (ends) return text.startsWith(core);
  return text === core;
}
