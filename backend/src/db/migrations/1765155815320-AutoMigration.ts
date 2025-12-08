import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1765155815320 implements MigrationInterface {
    name = 'AutoMigration1765155815320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."task_template_priority_enum" AS ENUM('Alta', 'Media', 'Baja')`);
        await queryRunner.query(`CREATE TABLE "task_template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "priority" "public"."task_template_priority_enum" NOT NULL DEFAULT 'Media', "teamId" uuid, "creatorId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b250e915df905dbe641647c8fac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_66c6d9582702c3c8294d26ce41" ON "task_template" ("name", "creatorId") `);
        await queryRunner.query(`CREATE TABLE "task_template_tag" ("templateId" uuid NOT NULL, "etiquetaId" uuid NOT NULL, CONSTRAINT "PK_1470b4161d2fcab2585108268e5" PRIMARY KEY ("templateId", "etiquetaId"))`);
        await queryRunner.query(`ALTER TABLE "tarea" ADD "originTemplateId" uuid`);
        await queryRunner.query(`ALTER TABLE "task_template" ADD CONSTRAINT "FK_41773244ecf2bcb7f64d97db8c6" FOREIGN KEY ("teamId") REFERENCES "equipo"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_template" ADD CONSTRAINT "FK_df3b5923b5d8c6289bce8c3aa04" FOREIGN KEY ("creatorId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_template_tag" ADD CONSTRAINT "FK_e011d3e6afdea8506a1e678da01" FOREIGN KEY ("templateId") REFERENCES "task_template"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_template_tag" ADD CONSTRAINT "FK_54e24f70e7ca25aef9fc3ab7062" FOREIGN KEY ("etiquetaId") REFERENCES "etiqueta"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_template_tag" DROP CONSTRAINT "FK_54e24f70e7ca25aef9fc3ab7062"`);
        await queryRunner.query(`ALTER TABLE "task_template_tag" DROP CONSTRAINT "FK_e011d3e6afdea8506a1e678da01"`);
        await queryRunner.query(`ALTER TABLE "task_template" DROP CONSTRAINT "FK_df3b5923b5d8c6289bce8c3aa04"`);
        await queryRunner.query(`ALTER TABLE "task_template" DROP CONSTRAINT "FK_41773244ecf2bcb7f64d97db8c6"`);
        await queryRunner.query(`ALTER TABLE "tarea" DROP COLUMN "originTemplateId"`);
        await queryRunner.query(`DROP TABLE "task_template_tag"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_66c6d9582702c3c8294d26ce41"`);
        await queryRunner.query(`DROP TABLE "task_template"`);
        await queryRunner.query(`DROP TYPE "public"."task_template_priority_enum"`);
    }

}
