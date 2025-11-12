import { ComentarioRepository } from "../repositories/Comentarios.repository";
import { TareaRepository } from "../repositories/Tareas.repository";
import { UsuarioRepository } from "../repositories/Usuario.repository";

export class ComentarioService {
  private comentarioRepo: ComentarioRepository;
  private tareaRepo: TareaRepository;
  private usuarioRepo: UsuarioRepository;

  constructor() {
    this.comentarioRepo = new ComentarioRepository();
    this.tareaRepo = new TareaRepository();
    this.usuarioRepo = new UsuarioRepository();
  }

  // Listar comentarios de una tarea
  async listarPorTarea(tareaId: string) {
    return this.comentarioRepo.findByTarea(tareaId);
  }

  // Crear comentario (requiere tarea y autor válidos)
  async crearComentario(tareaId: string, autorId: string, contenido: string) {
    const tarea = await this.tareaRepo.findById(tareaId);
    if (!tarea) throw new Error("La tarea no existe");

    const usuario = await this.usuarioRepo.findById(autorId);
    if (!usuario) throw new Error("El usuario no existe");

    const nuevoComentario = await this.comentarioRepo.create({
      contenido,
      tarea,
      autor: usuario,
    });

    return nuevoComentario;
  }

  // Editar comentario (solo contenido)
  async editarComentario(id: string, contenido: string) {
    const comentario = await this.comentarioRepo.findById(id);
    if (!comentario) throw new Error("Comentario no encontrado");

    comentario.contenido = contenido;
    return this.comentarioRepo.update(id, comentario);
  }

  // Eliminar comentario
  async eliminarComentario(id: string) {
    const eliminado = await this.comentarioRepo.delete(id);
    if (!eliminado) throw new Error("Comentario no encontrado");
    return true;
  }
}
