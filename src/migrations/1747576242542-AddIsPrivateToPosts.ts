import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsPrivateToPosts1747576242542 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // groups 테이블 생성
        await queryRunner.query(`
            CREATE TABLE "groups" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "creator_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_groups" PRIMARY KEY ("id"),
                CONSTRAINT "FK_groups_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // group_members 테이블 생성
        await queryRunner.query(`
            CREATE TABLE "group_members" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "group_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_group_members" PRIMARY KEY ("id"),
                CONSTRAINT "FK_group_members_group" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_group_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "UQ_group_members" UNIQUE ("group_id", "user_id")
            )
        `);

        // posts 테이블에 새로운 필드 추가
        await queryRunner.query(`
            ALTER TABLE "posts"
            ADD COLUMN "visibility" character varying NOT NULL DEFAULT 'public' CHECK ("visibility" IN ('public', 'group', 'private')),
            ADD COLUMN "group_id" uuid,
            ADD CONSTRAINT "FK_posts_group" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // posts 테이블의 새로운 필드 제거
        await queryRunner.query(`
            ALTER TABLE "posts"
            DROP CONSTRAINT "FK_posts_group",
            DROP COLUMN "group_id",
            DROP COLUMN "visibility"
        `);

        // group_members 테이블 삭제
        await queryRunner.query(`DROP TABLE "group_members"`);

        // groups 테이블 삭제
        await queryRunner.query(`DROP TABLE "groups"`);
    }

}
