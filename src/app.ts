import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

import userRoutes from "./routes/Usuario.routes";
import equipoRoutes from "./routes/Equipos.routes";
import tareaRoutes from "./routes/Equipos.routes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Swagger UI
  const openapiPath = path.join(__dirname, "../openapi.yaml");
  const openapiDocument = YAML.load(openapiPath);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

  app.use("/api/users", userRoutes);
  app.use("/api/equipos", equipoRoutes);
  app.use("/api/tareas", tareaRoutes);

  return app;
}
