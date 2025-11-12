import "dotenv/config";
import { DataSource } from "typeorm";

const isTypeScriptRuntime = __filename.endsWith(".ts");

const entitiesGlobs = isTypeScriptRuntime
  ? ["src/**/*.entity.ts"]
  : ["dist/**/*.entity.js"];

const migrationsGlobs = isTypeScriptRuntime
  ? ["src/db/migrations/*.ts"]
  : ["dist/db/migrations/*.js"];


const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DB_NAME ?? "seeds_back",
  synchronize: false,
  logging: true,
  entities: entitiesGlobs,
  migrations: migrationsGlobs,
});

export default AppDataSource;
