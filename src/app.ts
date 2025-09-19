import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { router as statusRouter } from "./routes/status.routes";
import { router as todoRouter } from "./routes/todo.routes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Swagger UI
  const openapiPath = path.join(__dirname, "../openapi.yaml");
  const openapiDocument = YAML.load(openapiPath);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

  app.use("/api/status", statusRouter);
  app.use("/api/todos", todoRouter);

  return app;
}
