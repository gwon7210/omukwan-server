import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatorToGroups1747918072475 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "groups"
            ADD COLUMN "creator_id" uuid NOT NULL,
            ADD CONSTRAINT "FK_groups_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "groups"
            DROP CONSTRAINT "FK_groups_creator",
            DROP COLUMN "creator_id"
        `);
    }
} 