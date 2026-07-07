// models/employe.ts
import { db } from "@/lib/db";

export const EmployeModel = {
  // Récupérer tous les employés d'une ferme avec leurs assignations
  async getByFerme(fermeId: number) {
    return db.employeFerme.findMany({
      where: { fermeId },
      include: {
        employe: true,
        ferme: true,
        terrainAssigne: true,
        animauxAssignes: {
          include: {
            animal: { include: { categorie: true, terrain: true } },
          },
        },
        culturesAssignees: {
          include: {
            culture: { include: { categorie: true, terrain: true } },
          },
        },
      },
      orderBy: { id: "asc" },
    });
  },

  // Récupérer tous les employés de toutes les fermes d'un agriculteur
  async getByAgriculteur(agriculteurId: number) {
    return db.employeFerme.findMany({
      where: {
        ferme: { agriculteurId },
      },
      include: {
        employe: true,
        ferme: true,
        terrainAssigne: true,
        animauxAssignes: {
          include: {
            animal: { include: { categorie: true, terrain: true } },
          },
        },
        culturesAssignees: {
          include: {
            culture: { include: { categorie: true, terrain: true } },
          },
        },
      },
      orderBy: { id: "asc" },
    });
  },

  // Récupérer les infos complètes d'un employé (sa fiche EmployeFerme)
  async getEmployeInfo(employeId: number) {
    return db.employeFerme.findFirst({
      where: { employeId },
      include: {
        employe: true,
        ferme: {
          include: {
            agriculteur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                telephone: true,
                image: true,
                role: true,
              },
            },
          },
        },
        terrainAssigne: {
          include: {
            animaux: { include: { categorie: true } },
            cultures: { include: { categorie: true } },
          },
        },
        animauxAssignes: {
          include: {
            animal: { include: { categorie: true, terrain: true } },
          },
        },
        culturesAssignees: {
          include: {
            culture: { include: { categorie: true, terrain: true } },
          },
        },
      },
    });
  },

  // Assigner un terrain à un employé
  async assignTerrain(employeFermeId: number, terrainId: number | null) {
    return db.employeFerme.update({
      where: { id: employeFermeId },
      data: { terrainAssigneId: terrainId },
      include: { terrainAssigne: true },
    });
  },

  // Assigner des animaux à un employé (remplace les anciens)
  async assignAnimaux(employeFermeId: number, animalIds: number[]) {
    // Supprimer les anciennes assignations
    await db.employeAnimal.deleteMany({ where: { employeFermeId } });

    // Créer les nouvelles
    if (animalIds.length > 0) {
      await db.employeAnimal.createMany({
        data: animalIds.map((animalId) => ({ employeFermeId, animalId })),
        skipDuplicates: true,
      });
    }
  },

  // Assigner des cultures à un employé (remplace les anciens)
  async assignCultures(employeFermeId: number, cultureIds: number[]) {
    // Supprimer les anciennes assignations
    await db.employeCulture.deleteMany({ where: { employeFermeId } });

    // Créer les nouvelles
    if (cultureIds.length > 0) {
      await db.employeCulture.createMany({
        data: cultureIds.map((cultureId) => ({ employeFermeId, cultureId })),
        skipDuplicates: true,
      });
    }
  },

  // Mettre à jour le rôle/description de travail
  async updateRoleDescription(employeFermeId: number, roleDescription: string) {
    return db.employeFerme.update({
      where: { id: employeFermeId },
      data: { roleDescription },
    });
  },

  // Récupérer l'agriculteur d'un employé
  async getAgriculteurOfEmploye(employeId: number) {
    const ef = await db.employeFerme.findFirst({
      where: { employeId },
      include: {
        ferme: {
          include: {
            agriculteur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                telephone: true,
                image: true,
                role: true,
              },
            },
          },
        },
      },
    });
    return ef?.ferme?.agriculteur ?? null;
  },
};
