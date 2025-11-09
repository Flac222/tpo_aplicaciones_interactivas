import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1762574326794 implements MigrationInterface {
    name = 'AutoMigration1762574326794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comentario" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contenido" text NOT NULL, "fecha" TIMESTAMP NOT NULL DEFAULT now(), "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT now(), "autorId" uuid, "tareaId" uuid, CONSTRAINT "PK_c9014211e5fbf491b9e3543bb19" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "historial" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cambio" character varying NOT NULL, "fecha" TIMESTAMP NOT NULL DEFAULT now(), "tareaId" uuid, "usuarioId" uuid, CONSTRAINT "PK_4b263e390d61f738528f93bcbe1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tarea_estado_enum" AS ENUM('Pendiente', 'En curso', 'Terminada', 'Cancelada')`);
        await queryRunner.query(`CREATE TYPE "public"."tarea_prioridad_enum" AS ENUM('Alta', 'Media', 'Baja')`);
        await queryRunner.query(`CREATE TABLE "tarea" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying NOT NULL, "descripcion" text, "estado" "public"."tarea_estado_enum" NOT NULL DEFAULT 'Pendiente', "prioridad" "public"."tarea_prioridad_enum" NOT NULL DEFAULT 'Media', "fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT now(), "creadorId" uuid, "equipoId" uuid, CONSTRAINT "PK_52df0f8fc74f81d0531ad890f0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "equipo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "propietarioId" uuid, CONSTRAINT "PK_a545d29b4870688c462189447da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuario" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuario_equipos_equipo" ("usuarioId" uuid NOT NULL, "equipoId" uuid NOT NULL, CONSTRAINT "PK_483b76b529161f1995bd892322a" PRIMARY KEY ("usuarioId", "equipoId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e59a5ff000d463f549f8e83fca" ON "usuario_equipos_equipo" ("usuarioId") `);
        await queryRunner.query(`CREATE INDEX "IDX_49b2b3a84fe6e705faf2554100" ON "usuario_equipos_equipo" ("equipoId") `);
        await queryRunner.query(`ALTER TABLE "comentario" ADD CONSTRAINT "FK_91c29f605caf6700f657703d95a" FOREIGN KEY ("autorId") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comentario" ADD CONSTRAINT "FK_fd694efda3b789b8c5a249435d8" FOREIGN KEY ("tareaId") REFERENCES "tarea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historial" ADD CONSTRAINT "FK_f97a83bd4e83b16d01b28b6d90d" FOREIGN KEY ("tareaId") REFERENCES "tarea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historial" ADD CONSTRAINT "FK_909f5381b42d0cffd35bfd72ea8" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tarea" ADD CONSTRAINT "FK_f69497e29e8378837167103a37e" FOREIGN KEY ("creadorId") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tarea" ADD CONSTRAINT "FK_c9b3d67af05e8e3a8b275580fad" FOREIGN KEY ("equipoId") REFERENCES "equipo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "equipo" ADD CONSTRAINT "FK_c22a43c50eddb40d70026431a2f" FOREIGN KEY ("propietarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuario_equipos_equipo" ADD CONSTRAINT "FK_e59a5ff000d463f549f8e83fca9" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "usuario_equipos_equipo" ADD CONSTRAINT "FK_49b2b3a84fe6e705faf2554100e" FOREIGN KEY ("equipoId") REFERENCES "equipo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario_equipos_equipo" DROP CONSTRAINT "FK_49b2b3a84fe6e705faf2554100e"`);
        await queryRunner.query(`ALTER TABLE "usuario_equipos_equipo" DROP CONSTRAINT "FK_e59a5ff000d463f549f8e83fca9"`);
        await queryRunner.query(`ALTER TABLE "equipo" DROP CONSTRAINT "FK_c22a43c50eddb40d70026431a2f"`);
        await queryRunner.query(`ALTER TABLE "tarea" DROP CONSTRAINT "FK_c9b3d67af05e8e3a8b275580fad"`);
        await queryRunner.query(`ALTER TABLE "tarea" DROP CONSTRAINT "FK_f69497e29e8378837167103a37e"`);
        await queryRunner.query(`ALTER TABLE "historial" DROP CONSTRAINT "FK_909f5381b42d0cffd35bfd72ea8"`);
        await queryRunner.query(`ALTER TABLE "historial" DROP CONSTRAINT "FK_f97a83bd4e83b16d01b28b6d90d"`);
        await queryRunner.query(`ALTER TABLE "comentario" DROP CONSTRAINT "FK_fd694efda3b789b8c5a249435d8"`);
        await queryRunner.query(`ALTER TABLE "comentario" DROP CONSTRAINT "FK_91c29f605caf6700f657703d95a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_49b2b3a84fe6e705faf2554100"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e59a5ff000d463f549f8e83fca"`);
        await queryRunner.query(`DROP TABLE "usuario_equipos_equipo"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TABLE "equipo"`);
        await queryRunner.query(`DROP TABLE "tarea"`);
        await queryRunner.query(`DROP TYPE "public"."tarea_prioridad_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tarea_estado_enum"`);
        await queryRunner.query(`DROP TABLE "historial"`);
        await queryRunner.query(`DROP TABLE "comentario"`);
    }

}
