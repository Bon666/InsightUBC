import express from "express";
import { buildRoutes } from "./routes.js";

const app = express();

// For /query JSON
app.use(express.json({ limit: "5mb" }));

// For /dataset/:id raw zip bytes
app.use("/dataset", express.raw({ type: "*/*", limit: "50mb" }));

buildRoutes(app);

const PORT = 4321;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`InsightUBC listening on http://localhost:${PORT}`);
});

export default app;
