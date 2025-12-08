import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

import userRoutes from "./routes/Usuario.routes";
import equipoRoutes from "./routes/Equipos.routes";
import tareaRoutes from "./routes/Tareas.routes";
import statusRouter from "./routes/status.routes";
import comentarioRoutes from "./routes/comentarios.routes";
import etiquetasRoutes from "./routes/etiquetas.routes";
import taskTemplatesRoutes from "./routes/TaskTemplates.routes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json()); 

  // Swagger UI
  const openapiPath = path.join(__dirname, "../openapi.yaml");
  const openapiDocument = YAML.load(openapiPath);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
  app.use("/api/status", statusRouter);
  app.use("/api/users", userRoutes);
  app.use("/api/equipos", equipoRoutes);
  app.use("/api/tareas", tareaRoutes);
  app.use("/api/comentarios", comentarioRoutes);
  app.use("/api/etiquetas", etiquetasRoutes);
  app.use("/api/tasktemplates", taskTemplatesRoutes);


  const FRONT_BUILD_PATH = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
  
  // Siempre servir al front en vite
  app.use(express.static(FRONT_BUILD_PATH));

  // Fallback a index.html para el routeo (SPA).
  app.get("*", (req, res) => {
    res.sendFile(path.join(FRONT_BUILD_PATH, "index.html"));
  });

  return app;
}