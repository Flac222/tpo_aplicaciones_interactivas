import { Request, Response } from "express";
import { UsuarioService } from "../services/Usuario.service";

const usuarioService = new UsuarioService();

export async function crearUsuario(req: Request, res: Response) {
  const { nombre, email, password } = req.body;

  // Regex simple: algo@algo.algo
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Formato de e-mail inválido" });
  }

  try {
    const usuario = await usuarioService.crearUsuario(nombre, email, password);
    return res.status(201).json(usuario);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const data = await usuarioService.login(email, password);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
} 


