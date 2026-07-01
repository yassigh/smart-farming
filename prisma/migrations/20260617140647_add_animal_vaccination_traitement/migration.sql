-- AlterTable
ALTER TABLE "Traitement" ADD COLUMN     "dateFin" TIMESTAMP(3),
ADD COLUMN     "dosage" TEXT,
ADD COLUMN     "observation" TEXT;

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" SERIAL NOT NULL,
    "nomVaccin" TEXT NOT NULL,
    "dateAdministered" TIMESTAMP(3) NOT NULL,
    "dateRappel" TIMESTAMP(3),
    "statut" TEXT NOT NULL,
    "animalId" INTEGER NOT NULL,
    "veterinaireId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_veterinaireId_fkey" FOREIGN KEY ("veterinaireId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
