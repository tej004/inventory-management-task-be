import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1768541190447 implements MigrationInterface {
    name = 'Init1768541190447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "warehouses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "location" character varying NOT NULL, "code" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d8b96d60ff9a288f5ed862280d9" UNIQUE ("code"), CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "sku" character varying NOT NULL, "name" character varying NOT NULL, "category" character varying NOT NULL, "unitCost" numeric(10,2) NOT NULL, "reorderPoint" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_98086f14e190574534d5129cd7c" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE TABLE "stocks" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL DEFAULT '0', "productId" uuid NOT NULL, "warehouseId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_bf14801c8d691b298176161818d" UNIQUE ("productId", "warehouseId"), CONSTRAINT "PK_4c4366df452c4c3ff8eb1838443" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`ALTER TABLE "stocks" ADD CONSTRAINT "FK_3024bbca6232c8b6efa3ff51028" FOREIGN KEY ("productId") REFERENCES "products"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stocks" ADD CONSTRAINT "FK_08a4e40be97ec3788a218169ef1" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stocks" DROP CONSTRAINT "FK_08a4e40be97ec3788a218169ef1"`);
        await queryRunner.query(`ALTER TABLE "stocks" DROP CONSTRAINT "FK_3024bbca6232c8b6efa3ff51028"`);
        await queryRunner.query(`DROP TABLE "stocks"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "warehouses"`);
    }

}
