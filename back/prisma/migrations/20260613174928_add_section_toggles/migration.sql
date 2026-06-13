-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "birthListEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pronosticsEnabled" BOOLEAN NOT NULL DEFAULT true;
