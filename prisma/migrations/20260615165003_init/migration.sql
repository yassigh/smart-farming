-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGRICULTEUR', 'EMPLOYE', 'VETERINAIRE');

-- CreateEnum
CREATE TYPE "TypeCategorie" AS ENUM ('ANIMAL', 'CULTURE');

-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('MALE', 'FEMELLE');

-- CreateEnum
CREATE TYPE "StatutNotification" AS ENUM ('LUE', 'NON_LUE');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "telephone" TEXT,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ferme" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "superficie" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agriculteurId" INTEGER NOT NULL,

    CONSTRAINT "Ferme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Terrain" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "superficie" DOUBLE PRECISION NOT NULL,
    "typeSol" TEXT NOT NULL,
    "fermeId" INTEGER NOT NULL,

    CONSTRAINT "Terrain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeFerme" (
    "id" SERIAL NOT NULL,
    "poste" TEXT NOT NULL,
    "salaire" DOUBLE PRECISION NOT NULL,
    "dateEmbauche" TIMESTAMP(3) NOT NULL,
    "employeId" INTEGER NOT NULL,
    "fermeId" INTEGER NOT NULL,

    CONSTRAINT "EmployeFerme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categorie" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeCategorie" NOT NULL,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "sexe" "Sexe" NOT NULL,
    "poids" DOUBLE PRECISION NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "etatSante" TEXT NOT NULL,
    "terrainId" INTEGER NOT NULL,
    "categorieId" INTEGER NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Traitement" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "medicament" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "animalId" INTEGER NOT NULL,
    "veterinaireId" INTEGER NOT NULL,

    CONSTRAINT "Traitement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Culture" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "datePlantation" TIMESTAMP(3) NOT NULL,
    "quantitePrevue" DOUBLE PRECISION NOT NULL,
    "etat" TEXT NOT NULL,
    "terrainId" INTEGER NOT NULL,
    "categorieId" INTEGER NOT NULL,

    CONSTRAINT "Culture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recolte" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL,
    "cultureId" INTEGER NOT NULL,

    CONSTRAINT "Recolte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depense" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "fermeId" INTEGER NOT NULL,

    CONSTRAINT "Depense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revenu" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "fermeId" INTEGER NOT NULL,

    CONSTRAINT "Revenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "resultat" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fermeId" INTEGER NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conseil" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "predictionId" INTEGER NOT NULL,

    CONSTRAINT "Conseil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutNotification" NOT NULL,
    "utilisateurId" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- AddForeignKey
ALTER TABLE "Ferme" ADD CONSTRAINT "Ferme_agriculteurId_fkey" FOREIGN KEY ("agriculteurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Terrain" ADD CONSTRAINT "Terrain_fermeId_fkey" FOREIGN KEY ("fermeId") REFERENCES "Ferme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeFerme" ADD CONSTRAINT "EmployeFerme_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeFerme" ADD CONSTRAINT "EmployeFerme_fermeId_fkey" FOREIGN KEY ("fermeId") REFERENCES "Ferme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_terrainId_fkey" FOREIGN KEY ("terrainId") REFERENCES "Terrain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Traitement" ADD CONSTRAINT "Traitement_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Traitement" ADD CONSTRAINT "Traitement_veterinaireId_fkey" FOREIGN KEY ("veterinaireId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Culture" ADD CONSTRAINT "Culture_terrainId_fkey" FOREIGN KEY ("terrainId") REFERENCES "Terrain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Culture" ADD CONSTRAINT "Culture_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recolte" ADD CONSTRAINT "Recolte_cultureId_fkey" FOREIGN KEY ("cultureId") REFERENCES "Culture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_fermeId_fkey" FOREIGN KEY ("fermeId") REFERENCES "Ferme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenu" ADD CONSTRAINT "Revenu_fermeId_fkey" FOREIGN KEY ("fermeId") REFERENCES "Ferme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_fermeId_fkey" FOREIGN KEY ("fermeId") REFERENCES "Ferme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conseil" ADD CONSTRAINT "Conseil_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "Prediction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
