import { db } from "@/lib/db";

export const AnimalModel = {
  async getAll() {
    return db.animal.findMany({
      include: {
        terrain: { include: { ferme: true } },
        categorie: true,
        traitements: { include: { veterinaire: true } },
        vaccinations: { include: { veterinaire: true } },
      },
      orderBy: { id: "desc" },
    });
  },

  async getById(id: number) {
    return db.animal.findUnique({
      where: { id },
      include: {
        terrain: { include: { ferme: true } },
        categorie: true,
        traitements: {
          include: { veterinaire: true },
          orderBy: { date: "desc" },
        },
        vaccinations: {
          include: { veterinaire: true },
          orderBy: { dateAdministered: "desc" },
        },
      },
    });
  },

  async getByAgriculteur(utilisateurId: number) {
    return db.animal.findMany({
      where: {
        terrain: {
          ferme: { agriculteurId: utilisateurId },
        },
      },
      include: {
        terrain: { include: { ferme: true } },
        categorie: true,
        traitements: { include: { veterinaire: true } },
        vaccinations: { include: { veterinaire: true } },
      },
      orderBy: { id: "desc" },
    });
  },

  async getByEmploye(utilisateurId: number) {
    return db.animal.findMany({
      where: {
        terrain: {
          ferme: {
            employes: { some: { employeId: utilisateurId } },
          },
        },
      },
      include: {
        terrain: { include: { ferme: true } },
        categorie: true,
        traitements: { include: { veterinaire: true } },
        vaccinations: { include: { veterinaire: true } },
      },
      orderBy: { id: "desc" },
    });
  },

  async create(data: {
    numero: string;
    type: string;
    race: string;
    sexe: "MALE" | "FEMELLE";
    poids: number;
    dateNaissance: Date;
    etatSante: string;
    terrainId: number;
    categorieId: number;
  }) {
    return db.animal.create({ data });
  },

  async update(
    id: number,
    data: Partial<{
      numero: string;
      type: string;
      race: string;
      sexe: "MALE" | "FEMELLE";
      poids: number;
      dateNaissance: Date;
      etatSante: string;
      terrainId: number;
      categorieId: number;
    }>
  ) {
    return db.animal.update({ where: { id }, data });
  },

  async delete(id: number) {
    return db.animal.delete({ where: { id } });
  },

  // ── Traitements ──────────────────────────────────────────────
  async addTraitement(data: {
    date: Date;
    dateFin?: Date;
    medicament: string;
    description: string;
    dosage?: string;
    observation?: string;
    animalId: number;
    veterinaireId: number;
  }) {
    return db.traitement.create({ data });
  },

  async deleteTraitement(id: number) {
    return db.traitement.delete({ where: { id } });
  },

  // ── vaccinations ─────────────────────────────────────────────
  async addVaccination(data: {
    nomVaccin: string;
    dateAdministered: Date;
    dateRappel?: Date;
    statut: string;
    animalId: number;
    veterinaireId: number;
  }) {
    return db.vaccination.create({ data });
  },

  async deleteVaccination(id: number) {
    return db.vaccination.delete({ where: { id } });
  },

  // ── Categories ───────────────────────────────────────────────
  async getCategories() {
    return db.categorie.findMany({
      where: { type: "ANIMAL" },
      orderBy: { nom: "asc" },
    });
  },
};
