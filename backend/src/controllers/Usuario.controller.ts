import { Request, Response } from "express";
import { UsuarioService } from "../services/Usuario.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const usuarioService = new UsuarioService();

export async function obtenerMiPerfil(req: AuthRequest, res: Response) {
    // El 'req.user' es establecido por el authMiddleware después de validar el token
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "No autenticado. Token inválido." });
    }

    try {
        // En lugar de usar el service, simplemente devolvemos el objeto ya adjunto por el middleware,
        // ya que el middleware lo buscó en la base de datos.
        // Asegúrate de NO devolver la contraseña.
        const { id, nombre, email } = req.user;
        
        return res.status(200).json({ 
            usuario: { id, nombre, email } 
        });
        
    } catch (error) {
        // Esto solo ocurriría si el middleware falló o el usuario fue eliminado durante la solicitud.
        return res.status(500).json({ error: "Error al obtener perfil." });
    }
}

export async function crearUsuario(req: Request, res: Response) {

  try {
  console.log("Request body:", req.body);
  const { nombre, email, password } = req.body;
  
  // Regex simple: algo@algo.algo
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Formato de e-mail inválido" });
  }
 
  
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

export async function actualizarUsuario(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { nombre, email, password } = req.body;

  try {
    const usuario = await usuarioService.actualizarUsuario(id, { nombre, email, password });
    res.json(usuario);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function eliminarUsuario(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const eliminado = await usuarioService.eliminarUsuario(id);
    if (!eliminado) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ eliminado: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}



