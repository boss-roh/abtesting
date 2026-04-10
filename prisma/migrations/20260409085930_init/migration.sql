-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ratioA" INTEGER NOT NULL DEFAULT 50,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_experimentId_userId_key" ON "Assignment"("experimentId", "userId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
