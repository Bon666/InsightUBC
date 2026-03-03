import type { Order, Row } from "./types.js";

export function multiKeySort(rows: Row[], order: Order): Row[] {
  const out = rows.slice();

  if (typeof order === "string") {
    out.sort((a, b) => cmp(a[order], b[order]));
    return out;
  }

  const dirMul = order.dir === "DOWN" ? -1 : 1;
  const keys = order.keys;

  out.sort((a, b) => {
    for (const k of keys) {
      const c = cmp(a[k], b[k]);
      if (c !== 0) return c * dirMul;
    }
    return 0;
  });

  return out;
}

function cmp(a: any, b: any): number {
  if (a === b) return 0;
  if (a === undefined) return -1;
  if (b === undefined) return 1;
  if (typeof a === "number" && typeof b === "number") return a < b ? -1 : 1;
  const sa = String(a);
  const sb = String(b);
  return sa < sb ? -1 : 1;
}
