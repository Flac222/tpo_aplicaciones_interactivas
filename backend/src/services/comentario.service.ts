import AppDataSource from "../db/data-source";
import { ComentarioRepository } from "../repositories/Comentarios.repository";
import { TareaRepository } from "../repositories/Tareas.repository";
import { UsuarioRepository } from "../repositories/Usuario.repository";
import { TaskWatcherService } from "./TaskWatcher.service";
import { EventType } from "../entities/TaskWatcherNotification.entity";
import { Historial } from "../entities/Historial.entity";

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
    const watcherService = new TaskWatcherService();
    await watcherService.onTaskEvent(
      tarea.id,
      EventType.CREATE_COMMENT,
      { comentarioId: nuevoComentario.id, texto: nuevoComentario.contenido, usuarioId: usuario.id }
    );

    return nuevoComentario;
  }

  // Editar comentario (solo contenido)
  async editarComentario(id: string, contenido: string) {
    const comentario = await this.comentarioRepo.findById(id);
    if (!comentario) throw new Error("Comentario no encontrado");
    let contenidoAnterior = comentario.contenido
    comentario.contenido = contenido;
    const watcherService = new TaskWatcherService();
    await watcherService.onTaskEvent(
      comentario.tarea.id,              // id de la tarea
      EventType.EDIT_COMMENT,           // tipo de evento
      {
        comentarioId: comentario.id,
        textoAnterior: contenidoAnterior,
        textoNuevo: comentario.contenido,
        usuarioId: comentario.autor.id
      })
      return this.comentarioRepo.update(id, comentario);
  }

  // Eliminar comentario
  async eliminarComentario(id: string) {
    const comentario = await this.comentarioRepo.findById(id);
    if (!comentario) throw new Error("Comentario no encontrado");

    // Guardo en el historial
    const historialRepo = AppDataSource.getRepository(Historial);
    const historial = historialRepo.create({
      tarea: comentario.tarea,
      usuario: comentario.autor,
      cambio: `Comentario eliminado por ${comentario.autor.nombre}`
    });
    await historialRepo.save(historial);

    // Notificar a watchers
    const watcherService = new TaskWatcherService();
    await watcherService.onTaskEvent(
      comentario.tarea.id,
      EventType.DELETE_COMMENT, // agregá este valor en tu enum
      {
        comentarioId: comentario.id,
        usuarioId: comentario.autor.id,
        nombre: comentario.autor.nombre
      });
    await this.comentarioRepo.delete(id);
    return true;
  }
}
