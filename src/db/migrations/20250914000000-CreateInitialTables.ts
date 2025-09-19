import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables20250914000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Template example:
    // await queryRunner.query(`
    //   CREATE TABLE IF NOT EXISTS table_name (
    //     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    //     column_one varchar(255) NOT NULL,
    //     created_at timestamptz NOT NULL DEFAULT now(),
    //     updated_at timestamptz NOT NULL DEFAULT now()
    //   )
    // `);
    // Add your CREATE TABLE statements here
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add your DROP TABLE statements here (reverse order of creation)
    // await queryRunner.query(`DROP TABLE IF EXISTS table_name`);
  }
}
