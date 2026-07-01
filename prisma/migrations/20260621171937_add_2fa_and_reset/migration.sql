/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- Ajouter les colonnes 2FA à la table utilisateurs
ALTER TABLE "utilisateur" 
ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT,
ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "resetToken" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);
-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_resetToken_key" ON "Utilisateur"("resetToken");
