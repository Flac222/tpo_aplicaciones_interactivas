
import { AuthRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import { EquipoService } from "../services/Equipo.service";
import { getRepository } from "typeorm";
import { Usuario } from "../entities/Usuario.entity";

const equipoService = new EquipoService();

export async function crearEquipo(req: AuthRequest, res: Response) {
  try {
    const { nombre } = req.body;
    const propietarioId = req.user!.id; 
    
    const equipo = await equipoService.crearEquipo(nombre, propietarioId);
    res.json(equipo);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function invitarMiembro(req: AuthRequest, res: Response) {
  try {
    // 1. Obtener el CORREO del body (como lo envía el frontend)
    const { correo } = req.body; 
    const { id: equipoId } = req.params;
    const propietarioId = req.user!.id; // El ID del que invita

    if (!correo) {
      return res.status(400).json({ error: "El correo es obligatorio." });
    }

    // 2. Buscar al usuario en la base de datos
    const usuarioRepository = getRepository(Usuario);
    const usuarioAInvitar = await usuarioRepository.findOne({ where: { email: correo } });

    // 3. Manejar el caso de "Usuario no encontrado"
    if (!usuarioAInvitar) {
      // ¡Esto solucionará tu "éxito falso"!
      return res.status(404).json({ error: "No se encontró un usuario registrado con ese correo." });
    }

    // 4. ¡Usuario encontrado! Ahora usamos su ID para llamar al servicio
    const usuarioId = usuarioAInvitar.id;
    
    // (Opcional) Evitar que el propietario se invite a sí mismo
    if (usuarioId === propietarioId) {
        return res.status(400).json({ error: "No puedes invitarte a ti mismo." });
    }

    const equipo = await equipoService.invitarMiembro(equipoId, usuarioId, propietarioId);
    
    // 5. Enviar la respuesta de éxito real
    res.json(equipo);

  } catch (err: any) {
    // El catch ahora solo se activará por errores reales
    // (ej: el usuario ya está en el equipo, si tu servicio lo maneja así)
    res.status(400).json({ error: err.message });
  }
}

export async function listarEquiposUsuario(req: AuthRequest, res: Response) {
  try {
    const { id: userId } = req.user!; 
    const equipos = await equipoService.listarEquiposUsuario(userId);
    res.json(equipos);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function salirEquipo(req: AuthRequest, res: Response) {
  try {
    const { id: equipoId } = req.params;
    const userId = req.user!.id; 

    const equipo = await equipoService.salirEquipo(userId, equipoId);
    res.json({ message: "Saliste del equipo con éxito", equipo });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function borrarEquipo(req: AuthRequest, res: Response) {
  try {
    const { id: equipoId } = req.params;
    const userId = req.user!.id; 
    
    await equipoService.borrarEquipo(userId, equipoId);
    res.json({ message: "Equipo borrado con éxito" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}