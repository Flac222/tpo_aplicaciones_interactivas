import "reflect-metadata";
import AppDataSource from "./db/data-source";
import { createApp } from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

AppDataSource.initialize()
  .then(() => {
    const app = createApp();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Error inicializando la base de datos:", err);
    process.exit(1);
  });
