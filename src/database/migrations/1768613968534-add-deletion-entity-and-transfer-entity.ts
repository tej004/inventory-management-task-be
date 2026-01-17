import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletionEntityAndTransferEntity1768613968534 implements MigrationInterface {
    name = 'AddDeletionEntityAndTransferEntity1768613968534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transfers_approvalstatus_enum" AS ENUM('pending', 'approved', 'received', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "transfers" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromWarehouseId" uuid NOT NULL, "toWarehouseId" uuid NOT NULL, "productId" uuid NOT NULL, "quantity" integer NOT NULL, "approvalStatus" "public"."transfers_approvalstatus_enum" NOT NULL DEFAULT 'pending', "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eefa3263579ba0b6cb9dc28395d" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`ALTER TABLE "warehouses" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "warehouses" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "products" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "products" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "stocks" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "stocks" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "FK_d0f2c8e025d2fefbc538b26d5f8" FOREIGN KEY ("fromWarehouseId") REFERENCES "warehouses"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "FK_581b3f12a8ed73b7386339c94dc" FOREIGN KEY ("toWarehouseId") REFERENCES "warehouses"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "FK_4e8d6e8bf3290e3bd438eb0c645" FOREIGN KEY ("productId") REFERENCES "products"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "FK_4e8d6e8bf3290e3bd438eb0c645"`);
        await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "FK_581b3f12a8ed73b7386339c94dc"`);
        await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "FK_d0f2c8e025d2fefbc538b26d5f8"`);
        await queryRunner.query(`ALTER TABLE "stocks" DROP COLUMN "isDeleted"`);
        await queryRunner.query(`ALTER TABLE "stocks" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "isDeleted"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "warehouses" DROP COLUMN "isDeleted"`);
        await queryRunner.query(`ALTER TABLE "warehouses" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`DROP TABLE "transfers"`);
        await queryRunner.query(`DROP TYPE "public"."transfers_approvalstatus_enum"`);
    }

}
