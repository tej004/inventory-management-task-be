import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameIdToUuidOnWarehouse1768541306871 implements MigrationInterface {
    name = 'RenameIdToUuidOnWarehouse1768541306871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouses" RENAME COLUMN "id" TO "uuid"`);
        await queryRunner.query(`ALTER TABLE "warehouses" RENAME CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" TO "PK_1a748afc0aeaf683e7d7e85bc76"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouses" RENAME CONSTRAINT "PK_1a748afc0aeaf683e7d7e85bc76" TO "PK_56ae21ee2432b2270b48867e4be"`);
        await queryRunner.query(`ALTER TABLE "warehouses" RENAME COLUMN "uuid" TO "id"`);
    }

}
