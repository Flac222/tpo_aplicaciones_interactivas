import { Router } from "express";
import { statusController } from "../controllers/status.controller";

export const router = Router();

router.get("/", statusController.get);
