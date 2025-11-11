import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1762796800103 implements MigrationInterface {
    name = 'AutoMigration1762796800103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "etiqueta" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT now(), "equipoId" uuid, "creadorId" uuid, CONSTRAINT "UQ_c24e444690deb02aa6202719e56" UNIQUE ("nombre"), CONSTRAINT "PK_621c4d2cb0f14181398ec5ddf6c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tarea_etiqueta" ("tareaId" uuid NOT NULL, "etiquetaId" uuid NOT NULL, CONSTRAINT "PK_cd83e2b53553c50919fe3c45d5f" PRIMARY KEY ("tareaId", "etiquetaId"))`);
        await queryRunner.query(`ALTER TABLE "etiqueta" ADD CONSTRAINT "FK_6012b681a9d8e814e71c3081f33" FOREIGN KEY ("equipoId") REFERENCES "equipo"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "etiqueta" ADD CONSTRAINT "FK_ef3f08c35f93e2e88872abf9c13" FOREIGN KEY ("creadorId") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tarea_etiqueta" ADD CONSTRAINT "FK_b4d201b5b4b6cad791862785211" FOREIGN KEY ("tareaId") REFERENCES "tarea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tarea_etiqueta" ADD CONSTRAINT "FK_c243793a5d08bc53b265013639f" FOREIGN KEY ("etiquetaId") REFERENCES "etiqueta"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tarea_etiqueta" DROP CONSTRAINT "FK_c243793a5d08bc53b265013639f"`);
        await queryRunner.query(`ALTER TABLE "tarea_etiqueta" DROP CONSTRAINT "FK_b4d201b5b4b6cad791862785211"`);
        await queryRunner.query(`ALTER TABLE "etiqueta" DROP CONSTRAINT "FK_ef3f08c35f93e2e88872abf9c13"`);
        await queryRunner.query(`ALTER TABLE "etiqueta" DROP CONSTRAINT "FK_6012b681a9d8e814e71c3081f33"`);
        await queryRunner.query(`DROP TABLE "tarea_etiqueta"`);
        await queryRunner.query(`DROP TABLE "etiqueta"`);
    }

}
