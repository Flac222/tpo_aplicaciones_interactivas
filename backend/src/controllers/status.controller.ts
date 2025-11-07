import { Request, Response } from "express";

export const statusController = {
  get(_req: Request, res: Response) {
    res.json({ status: "ok", time: new Date().toISOString() });
  },
};