import { LRUCache } from "./cache.js";
import { loadRowsFromZip, type Row } from "./zipLoader.js";

type DatasetEntry = {
  id: string;
  rows: Row[];
};

export class DatasetManager {
  private datasets = new Map<string, DatasetEntry>();
  private cache = new LRUCache<string, Row[]>(10);

  async addDataset(id: string, zipBytes: Buffer): Promise<{ added: string; numRows: number }> {
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      throw new Error("Invalid dataset id");
    }

    const rows = await loadRowsFromZip(zipBytes);
    if (rows.length === 0) throw new Error("Dataset contains zero rows");

    this.datasets.set(id, { id, rows });
    this.cache.set(id, rows);
    return { added: id, numRows: rows.length };
  }

  async removeDataset(id: string): Promise<{ removed: string }> {
    if (!this.datasets.has(id)) throw new Error(`Dataset not found: ${id}`);
    this.datasets.delete(id);
    this.cache.delete(id);
    return { removed: id };
  }

  getDatasetRows(id: string): Row[] {
    const cached = this.cache.get(id);
    if (cached) return cached;
    const entry = this.datasets.get(id);
    if (!entry) throw new Error(`Dataset not found: ${id}`);
    this.cache.set(id, entry.rows);
    return entry.rows;
  }

  inferDatasetIdFromQuery(q: any): string {
    // Keys look like "courses_avg", "courses_dept" etc.
    const keys = new Set<string>();

    const walk = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      for (const [k, v] of Object.entries(obj)) {
        if (typeof k === "string" && k.includes("_")) keys.add(k);
        walk(v);
      }
    };
    walk(q);

    const ids = new Set<string>();
    for (const k of keys) ids.add(k.split("_")[0]);

    if (ids.size !== 1) {
      throw new Error(`Query must reference exactly 1 dataset id, got: ${[...ids].join(", ")}`);
    }
    const id = [...ids][0];
    if (!this.datasets.has(id)) throw new Error(`Dataset not loaded: ${id}`);
    return id;
  }
}
