import AppDataSource from "../db/data-source";
import { Repository } from "typeorm";
import { Todo } from "../entities/Todo.entity";

export class TodoRepository {
  private readonly repository: Repository<Todo>;

  constructor() {
    this.repository = AppDataSource.getRepository(Todo);
  }

  findAll(): Promise<Todo[]> {
    return this.repository.find();
  }

  findById(id: string): Promise<Todo | null> {
    return this.repository.findOneBy({ id });
  }

  async createOne(data: { title: string; completed?: boolean }): Promise<Todo> {
    const entity = this.repository.create({
      title: data.title,
      completed: data.completed ?? false,
    });
    return this.repository.save(entity);
  }

  async updateOne(
    id: string,
    data: Partial<Pick<Todo, "title" | "completed">>
  ): Promise<Todo | null> {
    await this.repository.update({ id }, data);
    return this.findById(id);
  }

  async deleteOne(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
