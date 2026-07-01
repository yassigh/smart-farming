import { db } from "@/lib/db";

export const FermeModel = {
  async getAll() {
    return db.ferme.findMany({
      include: {
        agriculteur: true,
      },
      orderBy: { nom: "asc" },
    });
  },

  async getById(id: number) {
    return db.ferme.findUnique({
      where: { id },
      include: {
        agriculteur: true,
      },
    });
  },

  async getByAgriculteur(utilisateurId: number) {
    return db.ferme.findMany({
      where: {
        agriculteurId: utilisateurId,
      },
      include: {
        agriculteur: true,
      },
      orderBy: { nom: "asc" },
    });
  },

  async getByEmploye(utilisateurId: number) {
    return db.ferme.findMany({
      where: {
        employes: {
          some: {
            employeId: utilisateurId,
          },
        },
      },
      include: {
        agriculteur: true,
      },
      orderBy: { nom: "asc" },
    });
  },

  async create(data: any) {
    return db.ferme.create({
      data,
    });
  },

  async update(id: number, data: any) {
    return db.ferme.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return db.ferme.delete({
      where: { id },
    });
  },
};
