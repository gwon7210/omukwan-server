import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveMemberCountFromGroups1747918072474 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "memberCount"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" ADD COLUMN "memberCount" integer NOT NULL DEFAULT 0`);
    }

}
