-- Drop old unique constraint
ALTER TABLE "Assignment" DROP CONSTRAINT IF EXISTS "Assignment_experimentId_userId_key";

-- Rename column
ALTER TABLE "Assignment" RENAME COLUMN "userId" TO "deviceId";

-- Create new unique constraint
CREATE UNIQUE INDEX "Assignment_experimentId_deviceId_key" ON "Assignment"("experimentId", "deviceId");
