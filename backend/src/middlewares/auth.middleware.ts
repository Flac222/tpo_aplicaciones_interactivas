import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppDataSource from "../db/data-source";
import { Usuario } from "../entities/Usuario.entity"; 

export interface AuthRequest extends Request {
  user?: Usuario;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token no proporcionado" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Formato de token inválido" });

  try {
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

 
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepo.findOne({ where: { id: String(decoded.id) } });

    if (!usuario) return res.status(401).json({ error: "Usuario no encontrado" });

   
    req.user = usuario;

    if (!req.body.creadorId) {
      req.body.creadorId = usuario.id;
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}
