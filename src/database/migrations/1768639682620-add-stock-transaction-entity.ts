import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStockTransactionEntity1768639682620 implements MigrationInterface {
    name = 'AddStockTransactionEntity1768639682620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stock_transactions_type_enum" AS ENUM('in', 'out')`);
        await queryRunner.query(`CREATE TYPE "public"."stock_transactions_reason_enum" AS ENUM('restock', 'sale', 'return', 'adjustment')`);
        await queryRunner.query(`CREATE TABLE "stock_transactions" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "stockId" uuid NOT NULL, "type" "public"."stock_transactions_type_enum" NOT NULL DEFAULT 'in', "reason" "public"."stock_transactions_reason_enum" NOT NULL DEFAULT 'restock', "quantity" integer NOT NULL DEFAULT '0', "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4bab181cdcf08b4ba228a7184ff" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`ALTER TABLE "stock_transactions" ADD CONSTRAINT "FK_4e76437e6df4b122c2392bd4a32" FOREIGN KEY ("stockId") REFERENCES "stocks"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_transactions" DROP CONSTRAINT "FK_4e76437e6df4b122c2392bd4a32"`);
        await queryRunner.query(`DROP TABLE "stock_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."stock_transactions_reason_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stock_transactions_type_enum"`);
    }

}
