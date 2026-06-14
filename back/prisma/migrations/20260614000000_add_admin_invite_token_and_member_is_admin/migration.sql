-- AlterTable Project: add adminInviteToken with gen_random_uuid() for existing rows
ALTER TABLE "Project" ADD COLUMN "adminInviteToken" VARCHAR(36) DEFAULT gen_random_uuid();
UPDATE "Project" SET "adminInviteToken" = gen_random_uuid() WHERE "adminInviteToken" IS NULL;
ALTER TABLE "Project" ALTER COLUMN "adminInviteToken" SET NOT NULL;
ALTER TABLE "Project" ALTER COLUMN "adminInviteToken" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_adminInviteToken_key" ON "Project"("adminInviteToken");

-- AlterTable ProjectMember: add isAdmin
ALTER TABLE "ProjectMember" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;
