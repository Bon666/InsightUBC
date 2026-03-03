import type { Express, Request, Response } from "express";
import { DatasetManager } from "./datasets/datasetManager.js";
import { executeQuery } from "./query/executor.js";
import { validateQuery } from "./query/validators.js";

const mgr = new DatasetManager();

export function buildRoutes(app: Express) {
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Upload dataset as raw zip bytes
  app.put("/dataset/:id", async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const body = req.body as Buffer;
      if (!body || !Buffer.isBuffer(body) || body.length === 0) {
        return res.status(400).json({ error: "Missing zip body" });
      }
      const out = await mgr.addDataset(id, body);
      return res.json(out);
    } catch (e: any) {
      return res.status(400).json({ error: e?.message ?? "Bad Request" });
    }
  });

  app.delete("/dataset/:id", async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const out = await mgr.removeDataset(id);
      return res.json(out);
    } catch (e: any) {
      return res.status(404).json({ error: e?.message ?? "Not Found" });
    }
  });

  app.post("/query", async (req: Request, res: Response) => {
    try {
      const q = req.body;
      validateQuery(q);

      // Find dataset id from query keys like "courses_avg"
      const datasetId = mgr.inferDatasetIdFromQuery(q);
      const data = mgr.getDatasetRows(datasetId);

      const result = executeQuery(data, q);
      return res.json({ result });
    } catch (e: any) {
      return res.status(400).json({ error: e?.message ?? "Bad Query" });
    }
  });
}
