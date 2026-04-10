-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN "key" TEXT NOT NULL DEFAULT '',
ADD COLUMN "variantALabel" TEXT NOT NULL DEFAULT 'A',
ADD COLUMN "variantAValue" TEXT NOT NULL DEFAULT '{}',
ADD COLUMN "variantBLabel" TEXT NOT NULL DEFAULT 'B',
ADD COLUMN "variantBValue" TEXT NOT NULL DEFAULT '{}';

-- Remove default on key (it should be required with no default going forward)
ALTER TABLE "Experiment" ALTER COLUMN "key" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Experiment_key_key" ON "Experiment"("key");
