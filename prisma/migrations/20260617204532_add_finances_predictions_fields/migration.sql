/*
  Warnings:

  - Added the required column `createdById` to the `Depense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Prediction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Revenu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Depense" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Prediction" ADD COLUMN     "confiance" DOUBLE PRECISION,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Revenu" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenu" ADD CONSTRAINT "Revenu_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
