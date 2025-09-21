import { Request, Response } from "express";
import { TodoService } from "../services/todo.service";

const service = new TodoService();

export async function listTodos(req: Request, res: Response) {
  const items = await service.list();
  res.json(items);
} 

export async function getTodo(req: Request, res: Response) {
  const { id } = req.params;
  const item = await service.get(id);
  if (!item) return res.status(404).json({ message: "Todo not found" });
  res.json(item);
}

export async function createTodo(req: Request, res: Response) {
  const { title, completed } = req.body ?? {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ message: "'title' is required" });
  }
  const created = await service.create({ title, completed });
  res.status(201).json(created);
}

export async function updateTodo(req: Request, res: Response) {
  const { id } = req.params;
  const { title, completed } = req.body ?? {};
  const updated = await service.update(id, { title, completed });
  if (!updated) return res.status(404).json({ message: "Todo not found" });
  res.json(updated);
}

export async function deleteTodo(req: Request, res: Response) {
  const { id } = req.params;
  const removed = await service.remove(id);
  if (!removed) return res.status(404).json({ message: "Todo not found" });
  res.status(204).send();
}
