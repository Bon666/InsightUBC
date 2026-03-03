import type { Row } from "./types.js";

type ApplyToken = "MAX" | "MIN" | "AVG" | "SUM" | "COUNT";

export function applyGroupApply(rows: Row[], trans: any): Row[] {
  const groupKeys: string[] = trans.GROUP;
  const applyRules: any[] = trans.APPLY;

  // groupMap: groupKeyString -> { groupVals, items[] }
  const groupMap = new Map<string, { groupVals: Row; items: Row[] }>();

  for (const r of rows) {
    const groupVals: Row = {};
    for (const g of groupKeys) groupVals[g] = r[g];

    const keyStr = JSON.stringify(groupKeys.map((g) => r[g]));
    const bucket = groupMap.get(keyStr);
    if (!bucket) groupMap.set(keyStr, { groupVals, items: [r] });
    else bucket.items.push(r);
  }

  const out: Row[] = [];
  for (const { groupVals, items } of groupMap.values()) {
    const agg: Row = { ...groupVals };
    for (const rule of applyRules) {
      // rule example: { "maxAvg": { "MAX": "courses_avg" } }
      const applyKey = Object.keys(rule)[0];
      const inner = rule[applyKey];
      const token = Object.keys(inner)[0] as ApplyToken;
      const field = inner[token];

      agg[applyKey] = applyToken(token, items, field);
    }
    out.push(agg);
  }
  return out;
}

function applyToken(token: ApplyToken, items: Row[], field: string): any {
  if (token === "COUNT") {
    const s = new Set(items.map((r) => r[field]));
    return s.size;
  }

  const nums = items.map((r) => Number(r[field])).filter((x) => Number.isFinite(x));
  if (nums.length === 0) return null;

  if (token === "MAX") return Math.max(...nums);
  if (token === "MIN") return Math.min(...nums);
  if (token === "SUM") return round2(nums.reduce((a, b) => a + b, 0));

  // AVG with stable rounding (2 decimals)
  if (token === "AVG") {
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return round2(avg);
  }
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
