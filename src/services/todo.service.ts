import { Todo } from "../entities/Todo.entity";
import { TodoRepository } from "../repositories/todo.repository";

export class TodoService {
  private readonly repository: TodoRepository;

  constructor(repository?: TodoRepository) {
    this.repository = repository ?? new TodoRepository();
  }

  list(): Promise<Todo[]> {
    return this.repository.findAll();
  }

  get(id: string): Promise<Todo | null> {
    return this.repository.findById(id);
  }

  create(data: { title: string; completed?: boolean }): Promise<Todo> {
    return this.repository.createOne(data);
  }

  update(
    id: string,
    data: Partial<Pick<Todo, "title" | "completed">>
  ): Promise<Todo | null> {
    return this.repository.updateOne(id, data);
  }

  async remove(id: string): Promise<boolean> {
    const found = await this.repository.findById(id);
    if (!found) return false;
    await this.repository.deleteOne(id);
    return true;
  }
}
