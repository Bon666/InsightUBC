import type { Query } from "./types.js";

export function validateQuery(q: any): asserts q is Query {
  if (!q || typeof q !== "object") throw new Error("Query must be an object");
  if (!("WHERE" in q) || !("OPTIONS" in q)) throw new Error("Query must include WHERE and OPTIONS");
  if (!q.OPTIONS || !Array.isArray(q.OPTIONS.COLUMNS) || q.OPTIONS.COLUMNS.length === 0) {
    throw new Error("OPTIONS.COLUMNS must be a non-empty array");
  }
  if (q.OPTIONS.ORDER) {
    const o = q.OPTIONS.ORDER;
    if (typeof o === "string") return;
    if (!o || typeof o !== "object") throw new Error("ORDER must be string or object");
    if (o.dir !== "UP" && o.dir !== "DOWN") throw new Error("ORDER.dir must be UP or DOWN");
    if (!Array.isArray(o.keys) || o.keys.length === 0) throw new Error("ORDER.keys must be non-empty array");
  }
  if (q.TRANSFORMATIONS) {
    const t = q.TRANSFORMATIONS;
    if (!Array.isArray(t.GROUP) || t.GROUP.length === 0) throw new Error("TRANSFORMATIONS.GROUP must be non-empty");
    if (!Array.isArray(t.APPLY)) throw new Error("TRANSFORMATIONS.APPLY must be array");
  }
}
